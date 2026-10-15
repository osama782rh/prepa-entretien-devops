# Lancer depuis le dossier parent : terraform init && terraform test

variables {
  output_dir = "./test-out"
  environments = {
    dev  = { replicas = 1 }
    prod = { replicas = 3, features = ["tls"] }
  }
}

run "one_file_per_environment" {
  command = plan

  assert {
    condition     = length(local_file.app_conf) == 2
    error_message = "Un fichier doit etre genere par environnement."
  }
}

run "total_replicas_is_sum" {
  command = plan

  assert {
    condition     = output.total_replicas == 4
    error_message = "total_replicas doit valoir 1 + 3 = 4."
  }
}

run "only_prod_has_tls" {
  command = plan

  assert {
    condition     = output.envs_with_tls == ["prod"]
    error_message = "Seul prod doit avoir la feature tls."
  }
}

# On attend un ECHEC de validation : le test reussit si la validation echoue.
run "rejects_zero_replicas" {
  command = plan

  variables {
    environments = {
      dev = { replicas = 0 }
    }
  }

  expect_failures = [var.environments]
}

run "rejects_uppercase_names" {
  command = plan

  variables {
    environments = {
      Prod = { replicas = 1 }
    }
  }

  expect_failures = [var.environments]
}

# Test d'integration : cree vraiment les fichiers (detruits a la fin du test).
run "content_contains_tls_feature" {
  command = apply

  assert {
    condition     = strcontains(local_file.app_conf["prod"].content, "feature.tls = enabled")
    error_message = "Le fichier prod doit contenir feature.tls = enabled."
  }

  assert {
    condition     = strcontains(local_file.app_conf["prod"].content, "tag.environment = prod")
    error_message = "Le tag environment doit etre ajoute automatiquement."
  }
}
