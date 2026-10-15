output "wif_provider" {
  description = "Valeur a mettre dans workload_identity_provider du workflow GitHub."
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "deployer_service_account" {
  description = "SA a utiliser dans service_account du workflow GitHub."
  value       = google_service_account.deployer.email
}

output "cloud_run_url" {
  description = "URL du service Cloud Run."
  value       = google_cloud_run_v2_service.api.uri
}

output "artifact_registry" {
  description = "Prefixe des images."
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.apps.repository_id}"
}
