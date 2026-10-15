terraform {
  required_version = ">= 1.6.0"
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.5"
    }
  }
}

locals {
  # Fusionne : tags communs < tags de l'env < tag environment (le dernier gagne)
  envs = {
    for name, e in var.environments : name => merge(e, {
      tags = merge(var.common_tags, e.tags, { environment = name })
    })
  }
}

resource "local_file" "app_conf" {
  for_each = local.envs

  filename = "${var.output_dir}/${each.key}/app.conf"
  content = templatefile("${path.module}/templates/app.conf.tftpl", {
    env      = each.key
    replicas = each.value.replicas
    port     = each.value.port
    features = each.value.features
    tags     = each.value.tags
  })
}
