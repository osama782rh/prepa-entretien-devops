# Terraform avance - de l'Associate a l'expertise (GCP + Azure)

Ce cours **complete le module 08** (bases : HCL, workflow, state, modules). Ici on va plus loin :
internals, refactoring de state, tests, CI/CD, securite, et specificites des providers **Google** et **Azure**.
Il prepare aussi a la certification **HashiCorp Certified: Terraform Associate** (voir section 14).

Ressources du dossier :
- [questions.md](questions.md) : 58 questions (theorie, lecture de code, scenarios, debug)
- [labs/README.md](labs/README.md) : 6 labs pratiques avec solutions (local, GCP, Azure, CI/CD)

> Les numeros de version (ex. "1.5", "1.10") indiquent **quand une fonctionnalite est apparue**. Ils sont exacts a ma connaissance
> mais verifiez le changelog de Terraform avant un examen ou une decision de mise a niveau.

## Table des matieres

1. [Modele mental : comment Terraform fonctionne vraiment](#1-modele-mental)
2. [Langage HCL avance](#2-langage-hcl-avance)
3. [State en profondeur](#3-state-en-profondeur)
4. [Refactoring sans destruction](#4-refactoring-sans-destruction)
5. [Providers et versions](#5-providers-et-versions)
6. [Conception de modules](#6-conception-de-modules)
7. [Structurer plusieurs environnements](#7-structurer-plusieurs-environnements)
8. [Tests et qualite](#8-tests-et-qualite)
9. [CI/CD et gouvernance](#9-cicd-et-gouvernance)
10. [Securite et secrets](#10-securite-et-secrets)
11. [Terraform sur Google Cloud](#11-terraform-sur-google-cloud)
12. [Terraform sur Azure](#12-terraform-sur-azure)
13. [Diagnostic : erreurs courantes](#13-diagnostic--erreurs-courantes)
14. [Terraform Associate : objectifs d'examen](#14-terraform-associate)
15. [Aide-memoire](#15-aide-memoire)

---

## 1. Modele mental

### 1.1 Les trois mondes

```
   Configuration (.tf)      State (tfstate)         Realite (API cloud)
   "ce que je veux"   <-->  "ce que je crois    <--> "ce qui existe
                             avoir cree"             vraiment"
```

`terraform plan` fait : **1.** lire la config, **2.** *refresh* (comparer state <-> realite via les APIs), **3.** calculer le diff config <-> state refresh, **4.** afficher le plan.
`terraform apply` execute ce plan.

Le **state est une table de correspondance** : adresse Terraform (`google_storage_bucket.logs`) -> identifiant reel (`my-bucket`) + attributs connus.
Si une ressource n'est **pas dans le state**, Terraform ne sait pas qu'elle existe : il essaiera de la **creer** (-> erreur `409 already exists`).
Si elle est dans le state mais **plus dans la config**, il la **detruit**.

### 1.2 Le graphe de dependances

- Terraform construit un **DAG** : chaque reference (`aws_x.y.id`) cree une **dependance implicite**.
- Les ressources sans dependance entre elles sont traitees en **parallele** (`-parallelism=10` par defaut).
- `depends_on` ne sert que pour les dependances **invisibles** (ex. un role IAM doit exister avant un service qui l'utilise sans le referencer). A utiliser avec parcimonie : il rend le plan plus conservateur (valeurs "known after apply").
- Une **boucle** de dependances = `Error: Cycle`. On la casse en decouplant (ressource intermediaire, `*_iam_member` separe de la ressource...).
- A la destruction, l'ordre est **inverse**.

### 1.3 Valeurs connues / inconnues

Pendant `plan`, certaines valeurs sont **connues apres apply** (ex. `id` d'une ressource a creer). Consequences :
- `count` et `for_each` exigent des valeurs **connues au plan** (sinon : `The "for_each" map includes keys derived from resource attributes that cannot be determined until apply`).
- Les `data` sources dont les arguments dependent d'une valeur inconnue sont lues **a l'apply**, produisant des diffs differes.
- Regle : les **cles** de `for_each` doivent venir de variables/locals statiques, pas d'attributs de ressources.

### 1.4 Architecture : core + providers

Terraform core (binaire) parle en **gRPC** a des **plugins providers** (binaires separes telecharges par `init`). Le core gere graphe, state, plan ; le provider traduit en appels API. Les providers sont versionnes independamment ; `.terraform.lock.hcl` verrouille leurs versions et leurs **hashes**.

---

## 2. Langage HCL avance

### 2.1 Types complexes et valeurs par defaut

```hcl
variable "services" {
  description = "Services a deployer"
  type = map(object({
    image     = string
    port      = optional(number, 8080)          # defaut (1.3+)
    env       = optional(map(string), {})
    public    = optional(bool, false)
    scaling   = optional(object({
      min = optional(number, 0)
      max = optional(number, 5)
    }), {})
  }))
  nullable = false
}
```

Types : `string number bool`, collections `list(T) set(T) map(T)`, structurels `object({...}) tuple([...])`, et `any`.
Les **conversions implicites** existent (nombre <-> string) mais sont une source d'ambiguite : preferer un type explicite.

### 2.2 Validation, preconditions, checks

```hcl
variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment doit etre dev, staging ou prod."
  }
}

resource "google_compute_instance" "vm" {
  # ...
  lifecycle {
    precondition {                                         # avant creation/modif
      condition     = data.google_compute_image.img.status == "READY"
      error_message = "L'image doit etre READY."
    }
    postcondition {                                        # apres : verifie le resultat
      condition     = self.network_interface[0].network_ip != ""
      error_message = "Aucune IP privee attribuee."
    }
  }
}

check "site_is_up" {                                       # 1.5+ : avertissement non bloquant
  data "http" "health" { url = "https://example.com/health" }
  assert {
    condition     = data.http.health.status_code == 200
    error_message = "Le site ne repond pas."
  }
}
```

| Mecanisme | Quand | Bloque ? |
|-----------|-------|----------|
| `validation` (variable) | Valide **une entree** | Oui |
| `precondition` | Avant l'action sur la ressource | Oui |
| `postcondition` | Apres l'action | Oui |
| `check` | Supervision continue d'une hypothese | **Non** (warning) |

### 2.3 Expressions

```hcl
# for -> liste, map ; filtre avec if
names     = [for s in var.list : upper(s)]
by_name   = { for s in var.servers : s.name => s.ip }
only_prod = { for k, v in var.envs : k => v if v.tier == "prod" }
grouped   = { for s in var.servers : s.zone => s.name... }     # "..." = regroupement (valeurs en listes)

# splat
ids = aws_instance.web[*].id                 # equiv. [for i in aws_instance.web : i.id]

# conditionnel
size = var.environment == "prod" ? "large" : "small"
```

Fonctions a maitriser (frequentes en examen et en vrai) :

| Categorie | Fonctions |
|-----------|-----------|
| Collections | `merge`, `concat`, `flatten`, `distinct`, `keys`, `values`, `lookup`, `zipmap`, `setproduct`, `toset`, `tolist`, `tomap`, `slice`, `element`, `contains`, `length` |
| Robustesse | `try(expr, defaut)`, `can(expr)`, `coalesce`, `coalescelist`, `one` |
| Chaines | `format`, `join`, `split`, `replace`, `regex`, `trim*`, `lower`, `upper`, `substr` |
| Fichiers | `file`, `templatefile`, `fileexists`, `filebase64` |
| Encodage | `jsonencode`, `jsondecode`, `yamlencode`, `yamldecode`, `base64encode`, `sha256`, `md5` |
| Reseau | `cidrsubnet`, `cidrhost`, `cidrnetmask`, `cidrsubnets` |
| Temps | `timestamp`, `timeadd`, `plantimestamp` |

```hcl
cidrsubnet("10.0.0.0/16", 8, 3)      # "10.0.3.0/24"  (ajoute 8 bits, subnet n°3)
cidrhost("10.0.3.0/24", 10)          # "10.0.3.10"
merge({a=1,b=2}, {b=3})              # {a=1, b=3}   <- la DERNIERE valeur gagne
lookup({a=1}, "z", 0)                # 0
try(var.obj.optional_field, "n/a")   # evite une erreur si l'attribut n'existe pas
```

**setproduct** (produit cartesien) : utile pour creer une ressource par couple (env, region) :
```hcl
locals {
  pairs = { for p in setproduct(var.envs, var.regions) : "${p[0]}-${p[1]}" => { env = p[0], region = p[1] } }
}
```

### 2.4 count vs for_each (le piege classique)

```hcl
# count : adresses par INDEX -> supprimer l'element 1 decale les autres et les DETRUIT/RECREE
resource "x" "a" { count = length(var.names) }          # x.a[0], x.a[1], x.a[2]

# for_each : adresses par CLE -> supprimer "b" n'affecte que "b"
resource "x" "a" { for_each = toset(var.names) }        # x.a["a"], x.a["b"], x.a["c"]
```

| | `count` | `for_each` |
|---|---------|------------|
| Cle d'adresse | index numerique | cle string |
| Supprimer au milieu | **decale** les suivants (recreation) | affecte uniquement l'element |
| Entree | nombre | **map ou set de strings** (pas une liste) |
| Usage ideal | creation **conditionnelle** (`count = var.enabled ? 1 : 0`) | collections d'objets identifiables |

`for_each` sur une liste d'objets : transformer en map (`{ for o in var.list : o.name => o }`).

### 2.5 Blocs dynamiques

```hcl
resource "azurerm_network_security_group" "this" {
  name                = "nsg-web"
  location            = var.location
  resource_group_name = var.rg_name

  dynamic "security_rule" {
    for_each = var.rules                       # map(object({priority, port, source}))
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
```
A utiliser pour des **blocs repetables** (rules, ingress...). Eviter l'abus : lisibilite.

### 2.6 lifecycle

| Argument | Effet | Cas d'usage |
|----------|-------|-------------|
| `create_before_destroy` | Cree le remplacant **avant** de detruire l'ancien | Zero downtime ; attention aux **noms uniques** (utiliser `name_prefix` ou suffixe aleatoire) |
| `prevent_destroy` | Erreur si le plan detruit la ressource | Bases de donnees, buckets critiques. **Contournable** en supprimant le bloc de la config |
| `ignore_changes` | Ignore les diffs sur des attributs | Attributs modifies hors Terraform (tags automatiques, image Cloud Deploy, autoscaling) |
| `replace_triggered_by` | Remplace la ressource quand une autre change | Forcer la recreation en cascade |
| `precondition/postcondition` | Garde-fous | Voir 2.2 |

### 2.7 Les blocs de refactoring (voir section 4) et `terraform_data`

`terraform_data` (1.4+) remplace `null_resource` : ressource **integree** (pas de provider) pour stocker une valeur ou declencher une action via `triggers_replace`.

### 2.8 Provisioners : dernier recours

`local-exec`, `remote-exec`, `file` : **non declaratifs**, non reflétés dans le plan, echecs difficiles a rejouer.
Preferer : **cloud-init / startup-script**, images pre-construites (Packer), Ansible, ou ressources natives. Si indispensable : `terraform_data` + `triggers_replace`.

---

## 3. State en profondeur

### 3.1 Contenu et sensibilite

Le state contient **tous les attributs**, y compris les **secrets** (mots de passe generes, cles, valeurs `sensitive`) **en clair** (JSON). Donc :
- Backend **chiffre**, acces **restreint** (IAM), **versioning** active, journalisation.
- Ne jamais committer `terraform.tfstate`.
- `sensitive = true` masque l'affichage CLI, **pas le stockage**.

### 3.2 Backends

| Backend | Locking | Notes |
|---------|---------|-------|
| `local` | Verrou de fichier | Dev uniquement |
| **`gcs`** (Google) | **Oui natif** (objet de verrou) | Bucket avec **versioning**, `uniform_bucket_level_access`, CMEK possible |
| **`azurerm`** | **Oui** (bail/lease sur le blob) | Compte de stockage + container ; auth recommandee : **Entra ID/OIDC** (`use_azuread_auth`, `use_oidc`) plutot que cle de compte |
| `s3` | DynamoDB, ou **natif `use_lockfile`** (1.10+) | |
| HCP Terraform (`cloud` block) | Oui, gere | Runs distants, politiques, RBAC |
| `http`, `pg`, `consul`... | Selon backend | |

```hcl
terraform {
  backend "gcs" {
    bucket = "acme-tfstate-prod"
    prefix = "network/prod"
  }
}

terraform {
  backend "azurerm" {
    resource_group_name  = "rg-tfstate"
    storage_account_name = "acmetfstate001"
    container_name       = "tfstate"
    key                  = "network/prod.tfstate"
    use_azuread_auth     = true
  }
}
```

**Les blocs `backend` n'acceptent pas de variables ni de references.** Solution : **configuration partielle** :
```bash
terraform init -backend-config="bucket=acme-tfstate-prod" -backend-config="prefix=network/prod"
terraform init -backend-config=prod.gcs.tfbackend
```

**Migration de backend** : modifier le bloc puis `terraform init -migrate-state`. **Reconfiguration sans migration** : `-reconfigure`.

### 3.3 Operations sur le state

| Commande | Effet | Attention |
|----------|-------|-----------|
| `terraform state list` | Liste les adresses | Sur, lecture seule |
| `terraform state show ADDR` | Detail d'une ressource | |
| `terraform state mv A B` | **Renomme/deplace** une adresse (ou vers un autre state `-state-out`) | **Prefer un bloc `moved`** (versionne, revuable) |
| `terraform state rm ADDR` | **Oublie** la ressource (elle continue d'exister) | Prefer le bloc `removed` (1.7+) |
| `terraform import ADDR ID` | Associe une ressource **existante** a une adresse | Prefer le bloc `import` (1.5+) |
| `terraform apply -replace=ADDR` | Force le **remplacement** (remplace `taint`) | |
| `terraform force-unlock ID` | Libere un verrou orphelin | **Seulement** si certain qu'aucun run n'est actif |
| `terraform state pull/push` | Telecharge/envoie le state | `push` dangereux |
| `terraform plan -refresh-only` / `apply -refresh-only` | Aligne le state sur la realite **sans** modifier l'infra | Remplace `terraform refresh` (deprecie) |

### 3.4 Drift

**Drift** = la realite differe du state (modification manuelle). Detection : `terraform plan` (ou `-refresh-only` pour inspecter sans proposer de correction). Traitement :
1. **Revenir** a la config (apply) ; ou
2. **Accepter** le changement (mettre a jour la config, ou `apply -refresh-only`).
Preventions : IAM restrictif, Org Policy, **detection planifiee** (job nocturne `plan -detailed-exitcode`, code 2 = changements).

### 3.5 Decouper le state

Un state geant = plans lents, **rayon d'impact** enorme, verrou unique. Decouper par **cycle de vie / responsabilite / frequence de changement** :

```
00-bootstrap   (org, folders, state buckets)    <- change rarement, droits eleves
10-network     (VPC/VNet, hub-spoke, DNS)
20-platform    (GKE/AKS, registries, observabilite)
30-apps/<app>  (par equipe/application)         <- change souvent
```

Echanger des donnees entre states :
| Methode | Avis |
|---------|------|
| `data "terraform_remote_state"` | Couplage fort (acces a **tout** le state de l'autre) |
| **Data sources** natifs (`data "google_compute_network"`, `data "azurerm_virtual_network"`) | **Prefere** : lit la realite, pas le state |
| Outputs publies dans un parametre/secret store (Parameter, Secret Manager, App Configuration) | Decouple, auditable |

---

## 4. Refactoring sans destruction

Probleme : renommer une ressource ou la deplacer dans un module = Terraform voit "supprimer ancienne + creer nouvelle".

```hcl
# 1) Renommer une ressource
moved {
  from = google_storage_bucket.logs
  to   = google_storage_bucket.audit_logs
}

# 2) Passer de resource unique a for_each
moved {
  from = azurerm_resource_group.main
  to   = azurerm_resource_group.rg["main"]
}

# 3) Deplacer dans un module
moved {
  from = google_service_account.deployer
  to   = module.identity.google_service_account.deployer
}

# 4) Importer une ressource existante (1.5+), declaratif
import {
  to = google_storage_bucket.legacy
  id = "projects/my-proj/buckets/legacy-bucket"
}

# 5) Retirer du state SANS detruire (1.7+)
removed {
  from = google_storage_bucket.legacy
  lifecycle { destroy = false }
}
```

- Les blocs `moved`/`import`/`removed` apparaissent dans le **plan** : revuables en PR.
- `terraform plan -generate-config-out=generated.tf` genere la config HCL pour des ressources a importer (1.5+).
- Conserver les blocs `moved` **assez longtemps** pour que tous les states les voient (modules publies : indefiniment).
- Outils de reverse-engineering : **aztfexport** (Azure), **gcloud beta resource-config bulk-export** (GCP), **Terraformer**.

---

## 5. Providers et versions

```hcl
terraform {
  required_version = ">= 1.6.0, < 2.0.0"
  required_providers {
    google  = { source = "hashicorp/google",  version = "~> 6.0" }
    azurerm = { source = "hashicorp/azurerm", version = "~> 4.0" }
  }
}
```

| Contrainte | Signification |
|------------|---------------|
| `= 1.2.3` | Exactement |
| `>= 1.2` | Minimum |
| `~> 1.2` | `>= 1.2, < 2.0` (seul le chiffre le plus a droite peut monter : ici le **minor**) |
| `~> 1.2.3` | `>= 1.2.3, < 1.3.0` (seul le **patch** monte) |
| `>= 1.0, < 1.5` | Plage |

- **`.terraform.lock.hcl`** : committez-le. Il fixe versions + hashes. `terraform init -upgrade` pour monter de version. Pour multi-plateformes : `terraform providers lock -platform=linux_amd64 -platform=darwin_arm64 -platform=windows_amd64`.
- **Alias** pour plusieurs configurations (regions, projets, abonnements) :

```hcl
provider "google" { project = "prj-a" region = "europe-west1" }
provider "google" { alias = "dr" project = "prj-a" region = "europe-west4" }

resource "google_storage_bucket" "backup" {
  provider = google.dr
  # ...
}

module "app" {
  source    = "./modules/app"
  providers = { google = google.dr }          # passage explicite au module enfant
}
```
- Un **module enfant ne doit pas contenir de bloc `provider`** (sinon impossible de le reutiliser avec `count/for_each` ou de le supprimer proprement). Il declare `required_providers` et recoit ses providers du parent.

---

## 6. Conception de modules

**Principes**
- Un module = **une abstraction cohérente** ("un reseau", "un service Cloud Run + son IAM"), pas un wrapper 1:1 d'une ressource.
- **Interface minimale** : peu de variables obligatoires, valeurs par defaut sures, `description` et `type` partout.
- **Outputs** : exposer ce dont les autres ont besoin (ids, noms, emails SA) ; marquer `sensitive` si necessaire.
- **Composition plutot qu'heritage** : petits modules assembles dans une "racine" (root module).
- **Versionner** : tag Git (`?ref=v1.4.0`) ou version Registry ; jamais `main` flottant en production.
- Documenter (terraform-docs), tester (`terraform test`), exemples dans `examples/`.

Structure :
```
modules/cloud-run-service/
  main.tf  variables.tf  outputs.tf  versions.tf  README.md
  examples/basic/main.tf
  tests/basic.tftest.hcl
```

Anti-patterns : module "dieu" qui fait tout ; 80 variables passees telles quelles ; `provider` dans un module ; `count` sur un module avec des providers differents ; dependances cachees par des `data` externes.

**Sources** : chemin local, Registry (`hashicorp/...`), Git (`git::https://...?ref=v1.0.0`), buckets (S3/GCS). **Verifier** les modules officiels avant de reecrire :
- GCP : `terraform-google-modules` (project-factory, network, kubernetes-engine, iam...), Cloud Foundation Fabric.
- Azure : **Azure Verified Modules (AVM)** (`Azure/avm-res-*`, `avm-ptn-*`), ALZ (Azure Landing Zones) Terraform module.

---

## 7. Structurer plusieurs environnements

| Approche | Principe | Avantages | Inconvenients |
|----------|----------|-----------|---------------|
| **Dossiers par environnement** (`envs/dev`, `envs/prod`) + modules partages | Un state par env, un `tfvars`/backend par env | Explicite, isolation forte, revue simple | Un peu de duplication |
| **Workspaces CLI** | Meme config, plusieurs states (`terraform.workspace`) | Rapide pour des copies identiques | Meme backend/credentials, **peu visible**, risque de se tromper de workspace : **deconseille pour separer dev/prod** |
| **Terragrunt** | Wrapper DRY (backend, dependances) | Moins de duplication | Outil supplementaire |
| **HCP Terraform workspaces** | Un workspace = un state + variables + droits | Isolation, RBAC, politiques | Service/licence |

Recommandation pratique : **un state par environnement ET par couche**, projets/abonnements separes par environnement, modules versionnes.

```
infra/
  modules/               # modules reutilisables
  live/
    dev/
      network/   (main.tf, backend.tf, dev.tfvars)
      platform/
    prod/
      network/
      platform/
```

Ne confondez pas : **workspaces CLI** (open source, plusieurs states pour la meme config) **!=** **workspaces HCP Terraform** (unite de gestion complete).

---

## 8. Tests et qualite

Pyramide :

| Niveau | Outil | Ce que ca verifie |
|--------|-------|-------------------|
| Syntaxe / style | `terraform fmt -check`, `terraform validate` | Format, coherence interne |
| Lint | **tflint** (+ plugins google/azurerm) | Types d'instance invalides, deprecations, regles de nommage |
| Securite statique | **Checkov**, **Trivy** (ex-tfsec), **KICS** | Buckets publics, chiffrement manquant, ports ouverts |
| Politique | **OPA/conftest** sur le JSON du plan, **Sentinel** (HCP), **Azure Policy / Org Policy** (runtime) | Regles d'entreprise |
| Tests natifs | **`terraform test`** (1.6+) | Assertions sur plan/apply d'un module |
| Tests d'integration | **Terratest** (Go), Kitchen-Terraform | Deploie vraiment, verifie, detruit |
| Cout | **Infracost** | Impact cout du diff |

### terraform test (fichiers `*.tftest.hcl`)

```hcl
# tests/basic.tftest.hcl
variables {
  environment = "dev"
}

run "plan_ok" {
  command = plan
  assert {
    condition     = length(google_storage_bucket.this) == 1
    error_message = "Un bucket attendu."
  }
}

run "apply_ok" {
  command = apply                                  # cree vraiment, detruit a la fin
  assert {
    condition     = output.bucket_name != ""
    error_message = "Nom de bucket vide."
  }
}

run "rejects_invalid_env" {
  command = plan
  variables { environment = "nope" }
  expect_failures = [var.environment]              # on s'attend a l'echec de la validation
}
```
- Les `run` s'executent **dans l'ordre**, partagent le state d'un meme fichier.
- `mock_provider` (1.7+) : tester **sans credentials** ni infra reelle.
- Lancer : `terraform test` (ou `-filter=tests/basic.tftest.hcl`).

### Pre-commit minimal
```yaml
repos:
  - repo: https://github.com/antonbabenko/pre-commit-terraform
    rev: v1.96.1
    hooks:
      - id: terraform_fmt
      - id: terraform_validate
      - id: terraform_tflint
      - id: terraform_docs
      - id: terraform_trivy
```

---

## 9. CI/CD et gouvernance

### 9.1 Pipeline de reference

```
PR ouverte  -> fmt + validate + tflint + trivy/checkov + terraform plan (commentaire sur la PR)
Revue + approbation
Merge main  -> terraform apply du MEME plan (fichier tfplan) -> environnement avec approbation (prod)
Nocturne    -> plan -detailed-exitcode (detection de drift) -> alerte si exit code 2
```

Principes :
1. **Auth sans secrets** : OIDC (GitHub/GitLab) vers **Workload Identity Federation (GCP)** ou **federated credentials (Azure)**.
2. **Plan sauvegarde** : `terraform plan -out=tfplan` puis `terraform apply tfplan` -> on applique **exactement** ce qui a ete revu.
3. **Un seul run a la fois par state** (verrou + `concurrency` du CI).
4. **Moindre privilege** : identite de plan = lecture (+ ecriture du state) ; identite d'apply = ecriture, protegee par environnement/approbation.
5. `-input=false`, `-no-color`, `-lock-timeout=5m`.
6. **Codes de sortie** `plan -detailed-exitcode` : `0` rien, `1` erreur, `2` changements.

### 9.2 Outils d'orchestration

| Outil | Role |
|-------|------|
| **HCP Terraform / Terraform Enterprise** | Runs distants, state, variables, RBAC, Sentinel/OPA, drift detection, registre prive |
| **Atlantis** | `plan`/`apply` pilotes par commentaires de PR (auto-heberge) |
| **GitHub Actions / GitLab CI / Azure DevOps / Cloud Build** | Pipelines generiques |
| **Spacelift, env0, Scalr** | Plateformes tierces |
| **OpenTofu** | Fork open source (Linux Foundation), cree apres le passage de Terraform sous licence **BSL 1.1** (aout 2023) ; majoritairement compatible, ajoute entre autres le chiffrement natif du state |

### 9.3 Policy as code

- **Sentinel** (HCP/TFE) : politiques entre `plan` et `apply`, niveaux *advisory / soft-mandatory / hard-mandatory*.
- **OPA/conftest** : `terraform show -json tfplan > plan.json` puis evaluation Rego.
- Complete (ne remplace pas) les **controles runtime** : Org Policy (GCP), Azure Policy.

---

## 10. Securite et secrets

| Sujet | Bonne pratique |
|-------|----------------|
| **Credentials du provider** | Pas de cles statiques : WIF / OIDC / Managed Identity / impersonation |
| **Secrets dans le code** | Jamais en dur, jamais dans `tfvars` committes. Variables d'env `TF_VAR_x`, secret store, **data source** `google_secret_manager_secret_version` / `azurerm_key_vault_secret` |
| **State** | Chiffre, restreint, versionne ; sachez qu'il contient des secrets |
| **`sensitive`** | Masque l'affichage ; propage la sensibilite aux outputs derives |
| **Ephemeral values / write-only arguments** (1.10 / 1.11+) | Valeurs **non persistees** dans plan et state (ex. mot de passe passe a une BDD sans etre stocke). A connaitre comme evolution recente |
| **Generation de secrets** | `random_password` finit dans le state : preferer que le service gere/fasse tourner le secret (IAM auth, managed identity) |
| **Supply chain** | Verrouiller providers (lock file), registre prive de modules, signature/verification |
| **Droits CI** | Roles par couche (le pipeline `network` ne peut pas modifier `iam` de l'org) |

---

## 11. Terraform sur Google Cloud

### 11.1 Authentification

| Contexte | Methode |
|----------|---------|
| Poste dev | `gcloud auth application-default login` + **impersonation** : `provider "google" { impersonate_service_account = "tf@prj.iam.gserviceaccount.com" }` (necessite `roles/iam.serviceAccountTokenCreator`) |
| CI externe (GitHub, GitLab) | **Workload Identity Federation** (`google-github-actions/auth`) |
| Cloud Build / GCE / Cloud Run | Service account **attache** (ADC) |
| A eviter | `GOOGLE_CREDENTIALS` avec cle JSON longue duree |

### 11.2 Particularites

- **`google` vs `google-beta`** : certaines fonctions sont en beta ; declarer les deux providers et utiliser `provider = google-beta` sur la ressource concernee.
- **APIs** : `google_project_service` active une API ; `disable_on_destroy = false` est **recommande** (eviter de couper une API partagee a la destruction). Les ressources peuvent echouer si l'API n'est pas encore propagee : `depends_on`/`time_sleep`.
- **IAM : trois niveaux d'autorite — retenez la difference** :

| Ressource | Comportement | Risque |
|-----------|--------------|--------|
| `google_project_iam_policy` | **Authoritative sur TOUTE la policy** : remplace tout | **Dangereux** : peut vous retirer l'acces |
| `google_project_iam_binding` | Authoritative **pour un role** : remplace tous les membres de ce role | Retire les membres non listes |
| `google_project_iam_member` | **Non authoritative** : ajoute un membre a un role | **Le plus sur** (recommande par defaut) |
| `google_project_iam_audit_config` | Config d'audit (Data Access) | |

- **Labels / resource hierarchy** : `google_folder`, `google_project`, `google_organization_policy` / `google_org_policy_policy`.
- **Quotas** : `user_project_override = true` + `billing_project` pour certaines APIs.
- **Import** : `terraform import google_storage_bucket.b projects/P/buckets/NAME` ou bloc `import`.
- **Erreur 409 "already exists"** : la ressource existe hors state -> **import** (ou renommer).
- **Service Accounts** : creer, puis `google_service_account_iam_member` (roles/iam.workloadIdentityUser) pour WIF/GKE.
- **Cloud Run v2** : `ignore_changes` sur `template[0].containers[0].image` si Cloud Deploy/CI gere l'image.
- Modules : **terraform-google-modules/project-factory**, `network`, `kubernetes-engine`, `cloud-run`, **Cloud Foundation Fabric**.
- **Config Connector** : alternative K8s-native (ne remplace pas Terraform pour l'amorcage).

```hcl
provider "google" {
  project = var.project_id
  region  = var.region
  impersonate_service_account = var.terraform_sa     # pas de cle JSON
}

resource "google_project_service" "apis" {
  for_each           = toset(["run.googleapis.com", "cloudbuild.googleapis.com", "artifactregistry.googleapis.com"])
  service            = each.key
  disable_on_destroy = false
}
```

---

## 12. Terraform sur Azure

### 12.1 Providers

| Provider | Usage |
|----------|-------|
| **`azurerm`** | Ressources Azure principales (v4.x : `subscription_id` **obligatoire**) |
| **`azapi`** | Acces **direct a l'API ARM** : nouvelles fonctions/ressources pas encore dans azurerm, previews ; ressources `azapi_resource`, `azapi_update_resource` |
| **`azuread`** | Entra ID : utilisateurs, groupes, applications, service principals |
| **`azurerm` + `features {}`** | Le bloc `features {}` est **obligatoire** (peut etre vide) |

```hcl
provider "azurerm" {
  subscription_id = var.subscription_id        # requis en v4
  features {
    resource_group {
      prevent_deletion_if_contains_resources = true   # securite : refuse de supprimer un RG non vide
    }
    key_vault {
      purge_soft_delete_on_destroy = false
    }
  }
}
```

### 12.2 Authentification

| Contexte | Methode |
|----------|---------|
| Poste dev | `az login` (Azure CLI) |
| CI (GitHub Actions/Azure DevOps) | **OIDC / federated credentials** (`ARM_USE_OIDC=true`, `ARM_CLIENT_ID`, `ARM_TENANT_ID`, `ARM_SUBSCRIPTION_ID`) |
| Azure (runner/VM) | **Managed Identity** (`ARM_USE_MSI=true`) |
| A eviter | Client secret en clair |

Le service principal / identite du pipeline a besoin de **RBAC** (Contributor sur la portee) et, pour creer des attributions de role, de **User Access Administrator** ou "Role Based Access Control Administrator" (limite).

### 12.3 Particularites

- **Backend azurerm** : compte de stockage dedie (GRS/ZRS, **soft delete**, versioning, acces reseau restreint), un container, une cle par state ; verrou par **lease** du blob ; `use_azuread_auth = true` pour eviter les cles.
- **Enregistrement des resource providers** : une ressource peut echouer si le provider (ex. `Microsoft.ContainerService`) n'est pas enregistre (gerer via `resource_provider_registrations`).
- **Role assignments** : coherence **eventuelle** (propagation de plusieurs minutes) ; `principal_id` doit exister ; attention aux `skip_service_principal_aad_check` pour des SP recents.
- **Azure Policy** : `azurerm_policy_definition`, `azurerm_*_policy_assignment` (au niveau MG/subscription/RG), initiatives ; identite manage pour `Modify`/`DeployIfNotExists`.
- **Management locks** : `azurerm_management_lock` — peut **empecher le destroy** (a prevoir dans le pipeline).
- **Landing zones** : module **ALZ** (Azure Landing Zones) + **AVM** ; abonnement "vending" automatise.
- **Bicep vs Terraform** : Bicep = natif ARM, **jour-0 pour les nouvelles fonctions**, pas de state a gerer ; Terraform = multi-cloud, state, ecosysteme. Les deux sont acceptes dans les scenarios AZ-305 ; **azapi** comble l'ecart avec Terraform.
- **Import** : `terraform import azurerm_resource_group.rg /subscriptions/<id>/resourceGroups/<name>` ; **aztfexport** pour exporter une infrastructure existante.

---

## 13. Diagnostic : erreurs courantes

| Symptome | Cause | Solution |
|----------|-------|----------|
| `Error acquiring the state lock` | Un autre run en cours ou run interrompu | Attendre ; si orphelin : `terraform force-unlock <ID>` |
| `409 Already exists` / `already exists` | Ressource creee hors Terraform | `import` (bloc import) ou renommer |
| `Error: Cycle: a, b` | References circulaires | Decoupler (ressource `*_iam_member` separee, `depends_on` retire, variable) |
| `for_each ... cannot be determined until apply` | Cles dependant d'attributs inconnus | Cles statiques (variables/locals) ; ou appliquer en 2 etapes `-target` (temporaire) |
| `Provider produced inconsistent result after apply` | Bug provider / eventual consistency | Relancer ; mettre a jour le provider ; ouvrir une issue |
| Plan : `forces replacement` inattendu | Attribut immuable modifie | Lire l'attribut marque ; `ignore_changes` ou corriger la valeur ; sauvegarder les donnees |
| `Inconsistent dependency lock file` | Lock file non aligne | `terraform init -upgrade` (ou restaurer le lock file) |
| Diff permanent apres chaque apply | Normalisation/valeur calculee (ordre, casse) | `ignore_changes`, normaliser la valeur (`lower()`, tri) |
| `Error: Invalid count argument` | `count` depend d'une valeur inconnue | Utiliser une valeur connue ; restructurer |
| Destroy echoue (RG non vide, lock) | Ressources hors Terraform / verrous | Supprimer les verrous ; `prevent_deletion_if_contains_resources` ; nettoyer |
| `Error 403 ... SERVICE_DISABLED` (GCP) | API non activee | `google_project_service` + attente de propagation |
| `AuthorizationFailed` apres creation de role (Azure) | Propagation RBAC | Retry / `time_sleep` |
| Apply tres long | State enorme, rate limits | Decouper le state ; reduire `-parallelism` si 429 ; `-target` seulement en depannage |

**Debug** : `TF_LOG=DEBUG` (ou `TRACE`) + `TF_LOG_PATH=./tf.log` ; `terraform console` pour tester des expressions ; `terraform graph | dot -Tpng > g.png` ; `terraform show -json tfplan | jq`.

`-target` : outil de **depannage**, pas de workflow normal (contourne le graphe complet, laisse le state incoherent avec la config).

---

## 14. Terraform Associate

Certification **HashiCorp Certified: Terraform Associate (003)** — *verifiez sur le site HashiCorp si une version plus recente (004) l'a remplacee et ses objectifs exacts.*

Format indicatif : ~1 h, ~57 questions (QCM, vrai/faux, texte a trou), ~70 USD, en ligne surveille, validite 2 ans.

| # | Objectif | Ou le reviser |
|---|----------|---------------|
| 1 | Comprendre l'IaC | Module 08 §1 |
| 2 | Comprendre le role de Terraform (multi-cloud, providers, state) | Module 08 §2, ici §1 |
| 3 | Les bases : providers, **lock file**, cycle `init/plan/apply/destroy` | Ici §5, module 08 §4 |
| 4 | Utiliser la CLI (`fmt`, `validate`, `taint/replace`, `import`, `workspace`, `state`, `TF_LOG`) | Ici §3.3, §15 |
| 5 | Interagir avec les modules (sources, versions, variables/outputs, portee) | Ici §6 |
| 6 | Naviguer dans le workflow principal (write/plan/apply, `-replace`, drift) | Ici §1, §3.4 |
| 7 | Implementer et maintenir le state (backends, locking, secrets, `-refresh-only`) | Ici §3 |
| 8 | Lire, ecrire et generer la configuration (types, `count/for_each`, fonctions, `dynamic`, validation, `sensitive`, lifecycle) | Ici §2 |
| 9 | Comprendre HCP Terraform (workspaces, runs, politiques, registre prive, SSO) | Ici §9.2 |

---

## 15. Aide-memoire

```bash
# Cycle
terraform init [-upgrade] [-reconfigure|-migrate-state] [-backend-config=...]
terraform fmt -recursive            # formatage
terraform validate                  # coherence syntaxique
terraform plan -out=tfplan [-var-file=prod.tfvars] [-refresh-only] [-detailed-exitcode]
terraform apply tfplan              # applique le plan sauvegarde
terraform apply -replace=ADDR       # force le remplacement (remplace taint)
terraform destroy [-target=ADDR]

# Etat
terraform state list | show ADDR | mv A B | rm ADDR | pull
terraform import ADDR ID            # ou bloc import {}
terraform force-unlock LOCK_ID
terraform output [-json] [NOM]
terraform show [-json] [tfplan]

# Debug / outils
terraform console
terraform graph | dot -Tsvg > graph.svg
terraform providers [lock -platform=...]
terraform test [-filter=...]
TF_LOG=DEBUG TF_LOG_PATH=tf.log terraform plan
TF_VAR_name=value ; TF_CLI_ARGS_plan="-parallelism=5"
terraform workspace list | new NAME | select NAME | delete NAME
```

Priorite des variables (du plus faible au plus fort) :
`default` < variables d'environnement `TF_VAR_*` < `terraform.tfvars` < `terraform.tfvars.json` < `*.auto.tfvars(.json)` (ordre alphabetique) < `-var` / `-var-file` (ordre de la ligne de commande).

Ordre de decision "dois-je utiliser..." :
| Besoin | Choix |
|--------|-------|
| Creation conditionnelle d'une ressource | `count = var.x ? 1 : 0` |
| Collection de ressources identifiables | `for_each` (map/set) |
| Bloc repetable dans une ressource | `dynamic` |
| Renommer sans recreer | bloc `moved` |
| Adopter une ressource existante | bloc `import` |
| Sortir du state sans detruire | bloc `removed` |
| Forcer la recreation | `apply -replace` |
| Valeur qui peut manquer | `try()` / `can()` |
| Verrouiller les versions | `.terraform.lock.hcl` + `~>` |
| Tester un module | `terraform test` (+ `mock_provider`) |
| Separer dev et prod | Dossiers/states + comptes separes (pas des workspaces seuls) |
