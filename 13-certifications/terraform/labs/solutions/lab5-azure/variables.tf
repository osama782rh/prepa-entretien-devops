variable "subscription_id" {
  description = "ID de l'abonnement Azure (de test !)."
  type        = string
}

variable "prefix" {
  description = "Prefixe de nommage (court, minuscules, sans tiret : sert aussi au nom du compte de stockage)."
  type        = string
  default     = "lab"

  validation {
    condition     = can(regex("^[a-z0-9]{2,8}$", var.prefix))
    error_message = "prefix : 2 a 8 caracteres, minuscules et chiffres uniquement."
  }
}

variable "location" {
  description = "Region Azure principale."
  type        = string
  default     = "francecentral"
}

variable "allowed_locations" {
  description = "Regions autorisees par la Policy."
  type        = list(string)
  default     = ["francecentral", "westeurope"]
}

variable "nsg_rules" {
  description = "Regles entrantes : cle = nom, valeur = priorite/port/source."
  type = map(object({
    priority = number
    port     = string
    source   = string
  }))
  default = {
    allow-https = { priority = 100, port = "443", source = "*" }
    allow-ssh   = { priority = 110, port = "22", source = "10.0.0.0/16" }
  }
}
