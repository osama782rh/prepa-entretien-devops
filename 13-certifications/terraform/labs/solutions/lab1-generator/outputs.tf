output "file_paths" {
  description = "Chemin du fichier genere pour chaque environnement."
  value       = { for k, f in local_file.app_conf : k => f.filename }
}

output "total_replicas" {
  description = "Somme des replicas de tous les environnements."
  value       = sum([for e in local.envs : e.replicas])
}

output "envs_with_tls" {
  description = "Environnements ayant la feature tls (tries)."
  value       = sort([for name, e in local.envs : name if contains(e.features, "tls")])
}
