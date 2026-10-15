variable "environments" {
  description = "Environnements a generer (cle = nom de l'environnement)."
  type = map(object({
    replicas = number
    port     = optional(number, 8080)
    features = optional(list(string), [])
    tags     = optional(map(string), {})
  }))
  nullable = false

  validation {
    condition = alltrue([
      for e in values(var.environments) : e.replicas >= 1 && e.replicas <= 10
    ])
    error_message = "replicas doit etre compris entre 1 et 10 pour chaque environnement."
  }

  validation {
    condition = alltrue([
      for name in keys(var.environments) : can(regex("^[a-z][a-z0-9-]{1,14}$", name))
    ])
    error_message = "Les noms d'environnement doivent etre en minuscules (a-z, 0-9, -), 2 a 15 caracteres, commencer par une lettre."
  }
}

variable "common_tags" {
  description = "Tags appliques a tous les environnements."
  type        = map(string)
  default     = { team = "platform" }
}

variable "output_dir" {
  description = "Repertoire de sortie des fichiers generes."
  type        = string
  default     = "./generated"
}
