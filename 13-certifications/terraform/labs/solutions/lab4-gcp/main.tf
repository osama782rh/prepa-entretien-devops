terraform {
  required_version = ">= 1.6.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }

  # Configuration PARTIELLE : les valeurs sont passees a `terraform init -backend-config=...`
  backend "gcs" {}
}

provider "google" {
  project = var.project_id
  region  = var.region
  # En CI : identite WIF. En local : gcloud auth application-default login
  # + impersonate_service_account = "terraform@<projet>.iam.gserviceaccount.com"
}

# --------------------------------------------------------------------------
# 1. APIs
# --------------------------------------------------------------------------
locals {
  apis = [
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "sts.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "orgpolicy.googleapis.com",
  ]
}

resource "google_project_service" "apis" {
  for_each           = toset(local.apis)
  service            = each.key
  disable_on_destroy = false # ne coupe pas une API partagee au destroy
}

# --------------------------------------------------------------------------
# 2. Artifact Registry
# --------------------------------------------------------------------------
resource "google_artifact_registry_repository" "apps" {
  repository_id = "apps"
  location      = var.region
  format        = "DOCKER"
  description   = "Images applicatives"

  depends_on = [google_project_service.apis]
}

# --------------------------------------------------------------------------
# 3. Identites : deployer (CI) + runtime (Cloud Run)
# --------------------------------------------------------------------------
resource "google_service_account" "deployer" {
  account_id   = "ci-deployer"
  display_name = "CI deployer (via Workload Identity Federation)"
}

resource "google_service_account" "runtime" {
  account_id   = "api-runtime"
  display_name = "Runtime de l'API Cloud Run (moindre privilege)"
}

# Roles NON authoritatifs (iam_member) : on n'ecrase jamais les droits existants
resource "google_project_iam_member" "deployer_run" {
  project = var.project_id
  role    = "roles/run.developer"
  member  = "serviceAccount:${google_service_account.deployer.email}"
}

resource "google_project_iam_member" "deployer_ar" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.deployer.email}"
}

# Le deployer doit pouvoir "agir comme" le runtime pour deployer Cloud Run
resource "google_service_account_iam_member" "deployer_acts_as_runtime" {
  service_account_id = google_service_account.runtime.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.deployer.email}"
}

# --------------------------------------------------------------------------
# 4. Workload Identity Federation pour GitHub Actions
# --------------------------------------------------------------------------
resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "github"
  display_name              = "GitHub Actions"

  depends_on = [google_project_service.apis]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-oidc"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  # VITAL : sans condition, N'IMPORTE QUEL depot GitHub pourrait s'authentifier
  attribute_condition = "assertion.repository == \"${var.github_repo}\" && assertion.ref == \"refs/heads/main\""

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "wif_deployer" {
  service_account_id = google_service_account.deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repo}"
}

# --------------------------------------------------------------------------
# 5. Org Policy : interdire les cles de compte de service
# --------------------------------------------------------------------------
resource "google_org_policy_policy" "no_sa_keys" {
  name   = "projects/${var.project_id}/policies/iam.disableServiceAccountKeyCreation"
  parent = "projects/${var.project_id}"

  spec {
    rules {
      enforce = "TRUE"
    }
  }

  depends_on = [google_project_service.apis]
}

# --------------------------------------------------------------------------
# 6. Cloud Run v2
# --------------------------------------------------------------------------
resource "google_cloud_run_v2_service" "api" {
  name     = "api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.runtime.email

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }

    containers {
      image = var.image
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  # L'image est deployee par la CI / Cloud Deploy : Terraform ne doit pas la remettre en arriere
  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      client,
      client_version,
    ]
  }

  depends_on = [google_project_service.apis]
}

# --------------------------------------------------------------------------
# 7. Journaux d'audit : bucket (retention 7 ans) + sink
# --------------------------------------------------------------------------
resource "google_storage_bucket" "audit_logs" {
  name                        = "${var.project_id}-audit-logs"
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = false

  retention_policy {
    retention_period = 220752000 # 7 ans en secondes (7 x 365 x 86400)
    is_locked        = false     # passer a true = IRREVERSIBLE (Bucket Lock) : a decider en production
  }

  versioning {
    enabled = true
  }
}

resource "google_logging_project_sink" "audit" {
  name                   = "audit-to-gcs"
  destination            = "storage.googleapis.com/${google_storage_bucket.audit_logs.name}"
  filter                 = "logName:\"cloudaudit.googleapis.com\""
  unique_writer_identity = true
}

# Le sink ecrit avec une identite dediee (writer_identity) : il faut lui donner le droit d'ecrire
resource "google_storage_bucket_iam_member" "sink_writer" {
  bucket = google_storage_bucket.audit_logs.name
  role   = "roles/storage.objectCreator"
  member = google_logging_project_sink.audit.writer_identity
}

# --------------------------------------------------------------------------
# 8. Alerte : taux de 5xx Cloud Run
# --------------------------------------------------------------------------
resource "google_monitoring_notification_channel" "email" {
  display_name = "Astreinte"
  type         = "email"
  labels = {
    email_address = var.alert_email
  }
}

resource "google_monitoring_alert_policy" "cloud_run_5xx" {
  display_name = "Cloud Run - taux de 5xx eleve"
  combiner     = "OR"

  conditions {
    display_name = "5xx > seuil pendant 5 min"

    condition_threshold {
      filter          = "resource.type = \"cloud_run_revision\" AND metric.type = \"run.googleapis.com/request_count\" AND metric.labels.response_code_class = \"5xx\""
      comparison      = "COMPARISON_GT"
      threshold_value = 1 # requetes/seconde
      duration        = "300s"

      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_SUM"
        group_by_fields      = ["resource.label.service_name"]
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  documentation {
    mime_type = "text/markdown"
    content   = "Runbook : verifier le dernier deploiement, envisager un rollback de la revision Cloud Run."
  }

  depends_on = [google_project_service.apis]
}
