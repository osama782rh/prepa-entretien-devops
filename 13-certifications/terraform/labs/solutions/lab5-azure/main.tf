terraform {
  required_version = ">= 1.6.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Backend partiel : terraform init -backend-config="resource_group_name=..." etc.
  backend "azurerm" {
    use_azuread_auth = true # RBAC Entra ID plutot que cle de compte de stockage
  }
}

provider "azurerm" {
  subscription_id = var.subscription_id # obligatoire en v4

  features {
    resource_group {
      prevent_deletion_if_contains_resources = true
    }
  }
}

data "azurerm_subscription" "current" {}

# --------------------------------------------------------------------------
# Groupe de ressources + verrou
# --------------------------------------------------------------------------
resource "azurerm_resource_group" "net" {
  name     = "rg-${var.prefix}-net"
  location = var.location
}

resource "azurerm_management_lock" "net" {
  name       = "no-delete"
  scope      = azurerm_resource_group.net.id
  lock_level = "CanNotDelete"
  notes      = "Reseau partage : suppression interdite. Retirer le verrou via PR avant un destroy."
}

# --------------------------------------------------------------------------
# VNets hub et spoke (for_each) + sous-reseaux calcules (cidrsubnet)
# --------------------------------------------------------------------------
locals {
  vnets = {
    hub   = "10.0.0.0/16"
    spoke = "10.1.0.0/16"
  }

  # sous-reseaux : { cle = { vnet, index } } -> /24 dans le /16 du VNet
  subnets = {
    "hub-shared"     = { vnet = "hub", index = 0 }
    "spoke-workload" = { vnet = "spoke", index = 0 }
    "spoke-pe"       = { vnet = "spoke", index = 1 }
  }
}

resource "azurerm_virtual_network" "this" {
  for_each = local.vnets

  name                = "vnet-${var.prefix}-${each.key}"
  location            = azurerm_resource_group.net.location
  resource_group_name = azurerm_resource_group.net.name
  address_space       = [each.value]
}

resource "azurerm_subnet" "this" {
  for_each = local.subnets

  name                 = each.key
  resource_group_name  = azurerm_resource_group.net.name
  virtual_network_name = azurerm_virtual_network.this[each.value.vnet].name
  address_prefixes     = [cidrsubnet(local.vnets[each.value.vnet], 8, each.value.index)]
}

# --------------------------------------------------------------------------
# Peering dans les DEUX sens (non transitif)
# --------------------------------------------------------------------------
resource "azurerm_virtual_network_peering" "hub_to_spoke" {
  name                         = "hub-to-spoke"
  resource_group_name          = azurerm_resource_group.net.name
  virtual_network_name         = azurerm_virtual_network.this["hub"].name
  remote_virtual_network_id    = azurerm_virtual_network.this["spoke"].id
  allow_forwarded_traffic      = true
  allow_virtual_network_access = true
}

resource "azurerm_virtual_network_peering" "spoke_to_hub" {
  name                         = "spoke-to-hub"
  resource_group_name          = azurerm_resource_group.net.name
  virtual_network_name         = azurerm_virtual_network.this["spoke"].name
  remote_virtual_network_id    = azurerm_virtual_network.this["hub"].id
  allow_forwarded_traffic      = true
  allow_virtual_network_access = true
}

# --------------------------------------------------------------------------
# NSG avec regles generees par `dynamic`
# --------------------------------------------------------------------------
resource "azurerm_network_security_group" "workload" {
  name                = "nsg-${var.prefix}-workload"
  location            = azurerm_resource_group.net.location
  resource_group_name = azurerm_resource_group.net.name

  dynamic "security_rule" {
    for_each = var.nsg_rules

    content {
      name                       = security_rule.key
      priority                   = security_rule.value.priority
      direction                  = "Inbound"
      access                     = "Allow"
      protocol                   = "Tcp"
      source_port_range          = "*"
      destination_port_range     = security_rule.value.port
      source_address_prefix      = security_rule.value.source
      destination_address_prefix = "*"
    }
  }
}

resource "azurerm_subnet_network_security_group_association" "workload" {
  subnet_id                 = azurerm_subnet.this["spoke-workload"].id
  network_security_group_id = azurerm_network_security_group.workload.id
}

# --------------------------------------------------------------------------
# Stockage prive : compte sans acces public + Private Endpoint + DNS prive
# --------------------------------------------------------------------------
resource "random_string" "suffix" {
  length  = 6
  upper   = false
  special = false
}

resource "azurerm_storage_account" "data" {
  name                     = "st${var.prefix}${random_string.suffix.result}"
  resource_group_name      = azurerm_resource_group.net.name
  location                 = azurerm_resource_group.net.location
  account_tier             = "Standard"
  account_replication_type = "ZRS"

  public_network_access_enabled   = false
  allow_nested_items_to_be_public = false
  min_tls_version                 = "TLS1_2"
}

resource "azurerm_private_dns_zone" "blob" {
  name                = "privatelink.blob.core.windows.net"
  resource_group_name = azurerm_resource_group.net.name
}

# Lier la zone aux VNets qui doivent resoudre l'IP privee
resource "azurerm_private_dns_zone_virtual_network_link" "blob" {
  for_each = azurerm_virtual_network.this

  name                  = "link-${each.key}"
  resource_group_name   = azurerm_resource_group.net.name
  private_dns_zone_name = azurerm_private_dns_zone.blob.name
  virtual_network_id    = each.value.id
}

resource "azurerm_private_endpoint" "blob" {
  name                = "pe-${var.prefix}-blob"
  location            = azurerm_resource_group.net.location
  resource_group_name = azurerm_resource_group.net.name
  subnet_id           = azurerm_subnet.this["spoke-pe"].id

  private_service_connection {
    name                           = "blob"
    private_connection_resource_id = azurerm_storage_account.data.id
    subresource_names              = ["blob"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "default"
    private_dns_zone_ids = [azurerm_private_dns_zone.blob.id]
  }
}

# --------------------------------------------------------------------------
# Azure Policy : regions autorisees (policy integree "Allowed locations")
# --------------------------------------------------------------------------
resource "azurerm_subscription_policy_assignment" "allowed_locations" {
  name                 = "allowed-locations"
  display_name         = "Regions autorisees"
  subscription_id      = data.azurerm_subscription.current.id
  policy_definition_id = "/providers/Microsoft.Authorization/policyDefinitions/e56962a6-4747-49cd-b67b-bf8b01975c4c"

  parameters = jsonencode({
    listOfAllowedLocations = {
      value = var.allowed_locations
    }
  })
}
