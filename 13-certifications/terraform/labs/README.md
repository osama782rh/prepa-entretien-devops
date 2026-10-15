# Labs Terraform - pratique guidee

6 labs progressifs. Chaque lab a un **enonce** (ci-dessous) et une **solution** dans `solutions/`.
**Essayez d'abord seul**, puis comparez.

| Lab | Theme | Cloud requis ? | Dossier solution |
|-----|-------|----------------|------------------|
| 1 | Types, `for`, `optional`, validation, `templatefile` | Non (provider `local`) | `solutions/lab1-generator` |
| 2 | Refactoring : `moved`, `removed`, `-replace`, state | Non | `solutions/lab2-refactor` |
| 3 | `terraform test` (+ erreurs attendues) | Non | `solutions/lab1-generator/tests` |
| 4 | GCP : WIF, Cloud Run, Artifact Registry, sink, alerte | Compte GCP (ou `validate` seul) | `solutions/lab4-gcp` |
| 5 | Azure : hub-spoke, NSG `dynamic`, Private Endpoint, Policy | Compte Azure (ou `validate` seul) | `solutions/lab5-azure` |
| 6 | CI/CD : GitHub Actions OIDC (plan sur PR, apply approuve) | GitHub + cloud | `solutions/lab6-ci` |

## Prerequis

- Terraform >= 1.7 installe (`terraform version`). Alternative compatible : OpenTofu.
- Labs 1-3 : aucun compte cloud, ils fonctionnent entierement en local.
- Labs 4-5 : vous pouvez **valider sans compte** : `terraform init -backend=false && terraform validate`.
  Pour deployer vraiment, utilisez un projet/abonnement **de test** avec budget et alertes de cout.
- **Important** : ces solutions ont ete ecrites sans etre executees sur la machine de preparation (Terraform n'y etait pas installe).
  Lancez `terraform fmt -recursive && terraform validate` dans chaque dossier ; si une version de provider a change un argument,
  la doc du provider fait foi et la correction est un bon exercice.

---

## Lab 1 - Generateur de configuration multi-environnements

**Objectif** : maitriser les types complexes, `for`, `merge`, `templatefile`, `validation`, `for_each`.

**Enonce** : a partir d'une variable `environments` (map d'objets), generer un fichier `app.conf` par environnement.

1. Declarez `environments` : `map(object({ replicas = number, port = optional(number, 8080), features = optional(list(string), []), tags = optional(map(string), {}) }))`.
2. Validations : `replicas` entre 1 et 10 ; noms d'environnement en minuscules (`^[a-z][a-z0-9-]{1,14}$`).
3. Variable `common_tags` fusionnee avec les tags de chaque env, plus un tag `environment = <nom>`.
4. Generez `<output_dir>/<env>/app.conf` via `templatefile` (boucles sur features et tags).
5. Outputs : map des chemins de fichiers ; `total_replicas` ; la liste des environnements ayant la feature `tls`.

**Questions de reflexion**
- Que se passe-t-il si vous supprimez l'env `staging` ? Quel fichier est detruit ?
- Pourquoi `for_each` et non `count` ici ?
- Que ferait `terraform plan` si vous passez `replicas = 0` ?

**Lancer** :
```bash
cd solutions/lab1-generator
terraform init
terraform plan -var-file=example.tfvars
terraform apply -var-file=example.tfvars
cat generated/prod/app.conf
```

---

## Lab 2 - Refactoring sans destruction

**Objectif** : renommer, regrouper et retirer des ressources sans toucher a l'infrastructure.

**Etat initial** (`solutions/lab2-refactor/01_before.tf.txt`) : deux ressources `local_file.a` et `local_file.b`, plus `local_file.legacy`.

**Enonce**
1. Copiez `01_before.tf.txt` en `main.tf` dans un dossier de travail et appliquez-le.
2. Refactorez en **une seule ressource `local_file.cfg` avec `for_each`** (cles `a` et `b`) en utilisant des blocs `moved`. `terraform plan` doit afficher **0 a ajouter, 0 a detruire** (seulement "moved").
3. Retirez `local_file.legacy` du suivi **sans supprimer le fichier** avec un bloc `removed`.
4. Forcez la recreation du fichier `b` avec `terraform apply -replace='local_file.cfg["b"]'` et verifiez dans le plan que seul `b` est remplace.
5. Experimentez `terraform state list`, `terraform state show 'local_file.cfg["a"]'`.

**Questions de reflexion**
- Quelle difference entre `moved` et `terraform state mv` ?
- Que se passe-t-il si vous mettez simplement `legacy` en commentaire sans bloc `removed` ?

```bash
mkdir /tmp/lab2 && cd /tmp/lab2
cp <chemin>/solutions/lab2-refactor/01_before.tf.txt main.tf
terraform init && terraform apply -auto-approve
# Etape 2 : essayez d'abord seul, puis comparez avec 02_after.tf.txt
cp <chemin>/solutions/lab2-refactor/02_after.tf.txt main.tf
terraform plan          # 0 a detruire, lignes "has moved to"
terraform apply
ls out/                 # legacy.txt existe toujours
```

---

## Lab 3 - Tests avec `terraform test`

**Objectif** : ecrire des tests natifs pour le module du lab 1.

**Enonce** : dans `tests/generator.tftest.hcl`, ecrire :
1. Un `run` (`command = plan`) qui verifie qu'un fichier est genere par environnement.
2. Un `run` qui verifie `total_replicas`.
3. Un `run` qui **attend un echec** de validation (`expect_failures`) avec `replicas = 0`.
4. Un `run` en `command = apply` qui verifie le **contenu** d'un fichier genere (`strcontains`).

```bash
cd solutions/lab1-generator
terraform init
terraform test
```

**Pour aller plus loin** : ajouter `mock_provider` sur un module GCP du lab 4 pour tester sans credentials.

---

## Lab 4 - GCP : plateforme CI/CD de base

**Objectif** : ecrire de l'IaC GCP "production-like".

**Enonce** : en un seul root module, creer :
1. Activation des APIs (`for_each`, `disable_on_destroy = false`).
2. Depot **Artifact Registry** Docker.
3. Service account `deployer` + **Workload Identity Federation** pour GitHub (condition sur le depot !) + `roles/iam.workloadIdentityUser`.
4. Service account `runtime` (moindre privilege) pour **Cloud Run v2** ; `ignore_changes` sur l'image.
5. **Org Policy** `iam.disableServiceAccountKeyCreation` sur le projet.
6. Bucket de logs avec **retention 7 ans** et **sink** d'audit vers ce bucket (droits d'ecriture pour la `writer_identity`).
7. **Metrique/alerte** : alerte quand le taux de 5xx Cloud Run depasse un seuil.
8. Backend `gcs` en configuration partielle.

**Questions de reflexion**
- Pourquoi `unique_writer_identity = true` ?
- Pourquoi la condition sur `assertion.repository` dans le provider WIF est-elle **vitale** ?
- Quels roles minimum pour le `deployer` ?

```bash
cd solutions/lab4-gcp
terraform init -backend=false
terraform validate
# Deploiement reel :
# terraform init -backend-config="bucket=MON_BUCKET_STATE" -backend-config="prefix=lab4"
# terraform plan -var project_id=... -var github_repo=org/repo
```

---

## Lab 5 - Azure : hub-spoke securise

**Objectif** : reseau Azure + securite par `dynamic`, Private Endpoint et Policy.

**Enonce**
1. Deux VNets (hub, spoke) crees avec `for_each`, sous-reseaux calcules avec `cidrsubnet`.
2. **Peering** dans les deux sens.
3. **NSG** dont les regles viennent d'une variable via un bloc **`dynamic`**.
4. **Compte de stockage** sans acces public + **Private Endpoint** + zone **Private DNS** liee au VNet.
5. **Azure Policy** : assignation "Allowed locations" sur l'abonnement.
6. **Verrou** `CanNotDelete` sur le groupe de ressources reseau.
7. Provider `azurerm` v4 (`subscription_id`, `features {}` avec `prevent_deletion_if_contains_resources`).

**Questions de reflexion**
- Pourquoi la zone DNS prive `privatelink.blob.core.windows.net` est-elle indispensable ?
- Que se passe-t-il au `destroy` avec le verrou ? Comment le gerer dans le pipeline ?
- Comment ajouteriez-vous Azure Firewall et des UDR dans le hub ?

```bash
cd solutions/lab5-azure
terraform init -backend=false
terraform validate
# Deploiement : az login ; terraform plan -var subscription_id=...
```

---

## Lab 6 - CI/CD GitHub Actions avec OIDC

**Objectif** : pipeline sans secret statique.

**Enonce**
1. Sur **pull request** : `fmt -check`, `validate`, `plan -out=tfplan`, publier le plan en artefact.
2. Sur **push main** : job `apply` dans un **environnement protege** (approbation manuelle). La solution **re-planifie** sur main puis applique ce plan (le plan de la PR est lie a l'ancien commit de base). **Defi** : proposez la variante stricte qui applique le plan archive de la PR (indice : il faut garantir que main n'a pas bouge, ou fusionner via une file de merge).
3. Authentification OIDC vers **GCP** (WIF) ou **Azure** (federated credential).
4. `concurrency` pour empecher deux runs simultanes.
5. Job planifie **nocturne** de detection de drift (`-detailed-exitcode`).

Voir `solutions/lab6-ci/` (workflow GitHub Actions + equivalent Cloud Build).

**Questions de reflexion**
- Que se passe-t-il si quelqu'un merge entre le plan et l'apply ? (le plan est-il perime ?)
- Comment separer le droit de *plan* du droit d'*apply* ?

---

## Grille de competences (cochez)

- [ ] Je sais ecrire un type `object` avec `optional()` et des validations
- [ ] Je choisis `count` vs `for_each` sans hesiter
- [ ] Je refactore avec `moved`/`removed`/`import` sans destruction
- [ ] Je sais lire un plan et reperer `forces replacement`
- [ ] Je decoupe un state et echange des donnees entre states proprement
- [ ] J'ecris des tests `terraform test`
- [ ] Je configure un backend GCS et azurerm securise
- [ ] Je sais authentifier la CI sans secret (WIF / OIDC)
- [ ] Je connais les 3 niveaux d'IAM authoritative sur GCP
- [ ] Je sais debloquer un verrou, importer, diagnostiquer un cycle
