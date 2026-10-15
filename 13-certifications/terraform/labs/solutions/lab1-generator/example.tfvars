environments = {
  dev = {
    replicas = 1
  }
  staging = {
    replicas = 2
    features = ["metrics"]
  }
  prod = {
    replicas = 3
    port     = 443
    features = ["tls", "metrics"]
    tags     = { criticality = "high" }
  }
}

common_tags = {
  team = "platform"
  cost = "infra"
}
