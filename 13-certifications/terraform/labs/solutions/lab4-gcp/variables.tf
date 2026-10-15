variable "project_id" {
  description = "ID du projet GCP (de test !)."
  type        = string
}

variable "region" {
  description = "Region principale."
  type        = string
  default     = "europe-west1"
}

variable "github_repo" {
  description = "Depot GitHub autorise a deployer, au format org/repo."
  type        = string

  validation {
    condition     = can(regex("^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$", var.github_repo))
    error_message = "github_repo doit etre au format org/repo."
  }
}

variable "image" {
  description = "Image initiale (la CI mettra ensuite a jour la revision)."
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "alert_email" {
  description = "Adresse email recevant les alertes."
  type        = string
}
