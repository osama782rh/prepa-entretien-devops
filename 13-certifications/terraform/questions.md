# Questions Terraform - Associate, avance et scenarios (GCP / Azure)

58 questions en 6 parties. Les reponses sont masquees : essayez d'abord, **ecrivez votre raisonnement**, puis verifiez.
Quand la question montre du code, **predisez le resultat du `plan`** avant d'ouvrir la reponse.

| Partie | Questions | Niveau |
|--------|-----------|--------|
| A. Fondamentaux et CLI | Q1-Q12 | Associate |
| B. Langage HCL | Q13-Q26 | Associate / avance |
| C. State et refactoring | Q27-Q38 | Avance |
| D. Modules, tests, CI/CD | Q39-Q46 | Avance |
| E. Scenarios GCP et Azure | Q47-Q54 | Praticien |
| F. Debug | Q55-Q58 | Praticien |

---

## A. Fondamentaux et CLI

### Q1
Que fait `terraform init` ? *(choisir 3)*

- A. Telecharge les providers declares
- B. Initialise le backend
- C. Telecharge les modules
- D. Cree les ressources d'infrastructure
- E. Verifie que les ressources existent dans le cloud

<details><summary>Reponse</summary>

**A, B, C.** `init` prepare le repertoire de travail (providers, backend, modules, `.terraform.lock.hcl`). Il ne cree aucune ressource (D) et n'interroge pas le cloud (E : c'est le `plan`/refresh).
</details>

### Q2
Quelle sequence garantit que vous appliquez **exactement** ce qui a ete relu en revue de code ?

- A. `terraform apply -auto-approve` apres le merge
- B. `terraform plan -out=tfplan`, revue, puis `terraform apply tfplan`
- C. `terraform plan`, puis `terraform apply` quelques heures plus tard
- D. `terraform apply -target=...`

<details><summary>Reponse</summary>

**B.** Un plan sauvegarde est applique tel quel (Terraform refuse de l'appliquer si le state a change depuis). En C, la realite a pu changer entre-temps ; D contourne le graphe complet.
</details>

### Q3
Vous modifiez a la main un tag dans la console cloud. Au prochain `terraform plan`, que se passe-t-il ?

- A. Rien : Terraform ne regarde que le state
- B. Terraform detecte la **derive** pendant le refresh et propose de remettre la valeur de la configuration
- C. Terraform supprime la ressource
- D. Le plan echoue

<details><summary>Reponse</summary>

**B.** Le refresh compare state et realite ; le diff avec la config propose de corriger. Pour accepter le changement sans toucher l'infra : `-refresh-only` (puis aligner la config).
</details>

### Q4
Quelle commande remplace `terraform taint aws_instance.web` (deprecie) ?

- A. `terraform untaint`
- B. `terraform apply -replace="aws_instance.web"`
- C. `terraform state rm aws_instance.web`
- D. `terraform destroy -target`

<details><summary>Reponse</summary>

**B.** `-replace` marque la ressource pour remplacement **dans le plan** (visible, revuable), contrairement a `taint` qui modifiait le state.
</details>

### Q5
Pour quoi faut-il committer `.terraform.lock.hcl` ?

- A. Il contient les secrets du provider
- B. Il verrouille les **versions et checksums des providers** pour des runs reproductibles
- C. Il verrouille le state
- D. Il evite d'executer `terraform init`

<details><summary>Reponse</summary>

**B.** Le verrou d'etat est un mecanisme distinct (backend). Le lock file garantit que CI et collegues utilisent les memes providers.
</details>

### Q6
La contrainte `version = "~> 5.2"` autorise :

- A. 5.2.x uniquement
- B. `>= 5.2, < 6.0`
- C. `>= 5.2` sans limite
- D. 5.2 exactement

<details><summary>Reponse</summary>

**B.** `~> 5.2` autorise l'increment du dernier chiffre specifie (minor). `~> 5.2.1` serait `>= 5.2.1, < 5.3.0`.
</details>

### Q7
Quelle est la **priorite** correcte des sources de variables (du plus faible au plus fort) ?

- A. `-var` < `terraform.tfvars` < env `TF_VAR_*` < default
- B. default < env `TF_VAR_*` < `terraform.tfvars` < `*.auto.tfvars` < `-var` / `-var-file`
- C. default < `-var` < `terraform.tfvars`
- D. `terraform.tfvars` < default < `-var`

<details><summary>Reponse</summary>

**B.** Le dernier `-var`/`-var-file` de la ligne de commande l'emporte toujours.
</details>

### Q8
Qu'est-ce que le **state** ?

- A. Une copie du code Terraform
- B. Le mapping entre les ressources declarees et les ressources reelles, avec leurs attributs connus
- C. Un cache de modules
- D. Un journal des commandes

<details><summary>Reponse</summary>

**B.** Sans state, Terraform ne sait pas quelles ressources lui appartiennent.
</details>

### Q9
Un collegue lance `terraform apply` pendant que votre pipeline en execute un sur le meme state. Que se passe-t-il avec un backend GCS ou azurerm ?

- A. Les deux s'executent et la derniere ecriture gagne
- B. Le second echoue avec `Error acquiring the state lock`
- C. Terraform fusionne les states
- D. Le second est mis en file d'attente automatiquement

<details><summary>Reponse</summary>

**B.** Le verrouillage empeche les ecritures concurrentes. (`-lock-timeout=5m` permet d'attendre.)
</details>

### Q10
Quel est le rapport entre `terraform refresh` et `terraform apply -refresh-only` ?

- A. Identiques, aucune difference
- B. `refresh` est deprecie ; `apply -refresh-only` montre le plan de mise a jour du state et demande confirmation
- C. `refresh` modifie l'infrastructure
- D. `-refresh-only` detruit la derive

<details><summary>Reponse</summary>

**B.** Ni l'un ni l'autre ne modifie l'infrastructure, mais `-refresh-only` est plus sur car on **voit** les changements avant de les ecrire dans le state.
</details>

### Q11
Que fait `terraform plan -detailed-exitcode` ?

- A. Affiche des logs plus detailles
- B. Retourne `0` (rien), `1` (erreur) ou `2` (changements) : utile pour detecter le drift en CI
- C. Applique les changements
- D. Valide la syntaxe

<details><summary>Reponse</summary>

**B.**
</details>

### Q12
`terraform validate` verifie :

- A. Que les ressources existent dans le cloud
- B. La **validite syntaxique et la coherence interne** de la configuration (pas de credentials requis)
- C. Les couts
- D. La conformite aux politiques

<details><summary>Reponse</summary>

**B.** Il ne contacte pas les APIs. Les erreurs d'API/permissions n'apparaissent qu'au `plan`/`apply`.
</details>

---

## B. Langage HCL

### Q13
```hcl
variable "names" { default = ["a", "b", "c"] }
resource "local_file" "f" {
  count    = length(var.names)
  filename = "${var.names[count.index]}.txt"
  content  = "x"
}
```
Vous supprimez `"b"` de la liste. Que montre le plan ?

- A. Seul `local_file.f[1]` est detruit
- B. `f[1]` est **modifie** (devient `c.txt`) et `f[2]` est **detruit** : les indices se decalent
- C. Rien ne change
- D. Tout est recree

<details><summary>Reponse</summary>

**B.** `count` adresse par **index**. Avec `for_each = toset(var.names)`, seul `f["b"]` serait detruit. C'est LA raison de preferer `for_each` pour des collections.
</details>

### Q14
```hcl
variable "users" { default = ["alice", "bob"] }
resource "x" "u" { for_each = var.users }
```
Resultat ?

- A. Cree deux ressources
- B. Erreur : `for_each` exige une **map ou un set de strings**, pas une liste
- C. Cree une ressource
- D. Erreur de syntaxe sur `default`

<details><summary>Reponse</summary>

**B.** Corriger : `for_each = toset(var.users)`. Avec un set, `each.key == each.value`.
</details>

### Q15
Quelle est la valeur de `merge({a = 1, b = 2}, {b = 3, c = 4})` ?

- A. `{a=1, b=2, c=4}`
- B. `{a=1, b=3, c=4}`
- C. Erreur : cle dupliquee
- D. `{b=3, c=4}`

<details><summary>Reponse</summary>

**B.** En cas de conflit, la **derniere** map l'emporte.
</details>

### Q16
Valeur de `cidrsubnet("10.0.0.0/16", 8, 5)` ?

- A. `10.0.5.0/24`
- B. `10.0.0.0/24`
- C. `10.5.0.0/16`
- D. `10.0.0.5/24`

<details><summary>Reponse</summary>

**A.** On ajoute 8 bits au prefixe (/16 -> /24) et on prend le sous-reseau n°5 : `10.0.5.0/24`.
</details>

### Q17
Que produit ceci ?
```hcl
locals { servers = [{n="a", z="x"}, {n="b", z="x"}, {n="c", z="y"}] }
output "o" { value = { for s in local.servers : s.z => s.n } }
```

- A. `{x=["a","b"], y=["c"]}`
- B. Une erreur : cles dupliquees (`x` apparait deux fois)
- C. `{x="b", y="c"}`
- D. `{x="a", y="c"}`

<details><summary>Reponse</summary>

**B.** Un `for` produisant une map exige des cles **uniques**. Pour regrouper, ajouter `...` : `{ for s in local.servers : s.z => s.n... }` -> `{x=["a","b"], y=["c"]}`.
</details>

### Q18
Quel est l'interet de `try(var.config.timeout, 30)` ?

- A. Reessayer l'appel API 30 fois
- B. Retourner 30 si l'attribut `timeout` n'existe pas ou provoque une erreur
- C. Convertir en nombre
- D. Definir un timeout de 30 s

<details><summary>Reponse</summary>

**B.** `try` evalue les expressions dans l'ordre et retourne la premiere sans erreur. `can()` retourne un booleen.
</details>

### Q19
Quand utiliser un bloc `dynamic` ?

- A. Pour creer plusieurs **ressources**
- B. Pour generer des **blocs imbriques repetables** a l'interieur d'une ressource (ex. `security_rule`, `ingress`)
- C. Pour lire une data source
- D. Pour creer des variables

<details><summary>Reponse</summary>

**B.** Pour plusieurs ressources : `count`/`for_each`.
</details>

### Q20
Une variable est declaree `sensitive = true`. Laquelle des affirmations est **vraie** ?

- A. Sa valeur est chiffree dans le state
- B. Sa valeur est masquee dans la sortie CLI, mais **stockee en clair** dans le state
- C. Elle n'apparait pas dans le state
- D. Elle ne peut pas etre utilisee dans une ressource

<details><summary>Reponse</summary>

**B.** Proteger le state est indispensable. Pour eviter la persistance, voir les *ephemeral values* / arguments *write-only* (versions recentes).
</details>

### Q21
Quelle difference entre `validation` dans une variable et `precondition` dans `lifecycle` ?

- A. Aucune
- B. `validation` verifie **une valeur d'entree** seule ; `precondition` verifie une hypothese **dans le contexte d'une ressource** (peut referencer d'autres objets, data sources)
- C. `precondition` ne bloque jamais
- D. `validation` s'execute apres l'apply

<details><summary>Reponse</summary>

**B.** (`validation` ne peut referencer, historiquement, que la variable elle-meme ; `check` est la version non bloquante.)
</details>

### Q22
```hcl
resource "aws_instance" "x" {
  lifecycle { create_before_destroy = true }
  tags = { Name = "web" }
  # ... l'API impose un nom unique de ressource
}
```
Quel piege avec `create_before_destroy` ?

- A. Aucun
- B. Les deux versions doivent **coexister** : si un attribut doit etre unique (nom), la creation du remplacant echoue ; utiliser `name_prefix` ou un suffixe aleatoire
- C. La destruction est impossible
- D. Cela desactive le state

<details><summary>Reponse</summary>

**B.**
</details>

### Q23
Pourquoi utiliser `ignore_changes = [template[0].containers[0].image]` sur un service Cloud Run ?

- A. Pour accelerer le plan
- B. Parce que l'image est mise a jour **hors Terraform** (Cloud Deploy/CI) et Terraform ne doit pas la "remettre en arriere"
- C. Pour chiffrer l'image
- D. Pour forcer le rollback

<details><summary>Reponse</summary>

**B.** Partage des responsabilites : Terraform gere l'infrastructure, le pipeline gere la version deployee.
</details>

### Q24
`prevent_destroy = true` est present sur une base. Un developpeur **supprime le bloc `resource`** de la config puis `apply`. Que se passe-t-il ?

- A. Terraform refuse de detruire
- B. La base est **detruite** : `prevent_destroy` n'existe plus dans la config
- C. La base est deplacee
- D. Terraform demande une confirmation speciale

<details><summary>Reponse</summary>

**B.** `prevent_destroy` n'est pas une protection absolue. Complements : `deletion_protection` du provider, locks Azure, IAM, Org Policy, revue de PR.
</details>

### Q25
Quelle est la difference entre `depends_on` et une reference implicite ?

- A. `depends_on` est plus rapide
- B. Une reference (`x.y.id`) cree une dependance **automatiquement** ; `depends_on` sert aux dependances **non visibles** et peut rendre le plan plus conservateur
- C. Aucune
- D. `depends_on` supprime le parallelisme global

<details><summary>Reponse</summary>

**B.**
</details>

### Q26
Pourquoi les provisioners sont-ils consideres comme **dernier recours** ?

- A. Ils sont payants
- B. Ils ne sont pas declaratifs, ne sont pas modelises dans le plan et leurs echecs sont difficiles a rejouer ; il vaut mieux cloud-init, images pre-construites ou ressources natives
- C. Ils ne fonctionnent que sur Windows
- D. Ils modifient le state

<details><summary>Reponse</summary>

**B.**
</details>

---

## C. State et refactoring

### Q27
Vous renommez `google_storage_bucket.logs` en `google_storage_bucket.audit` dans le code. Comment eviter la destruction/recreation du bucket ?

- A. Impossible
- B. Ajouter un bloc `moved { from = google_storage_bucket.logs  to = google_storage_bucket.audit }`
- C. `terraform taint`
- D. Supprimer le state

<details><summary>Reponse</summary>

**B.** Le bloc `moved` est declaratif et revuable (equivalent versionne de `terraform state mv`).
</details>

### Q28
Une ressource existe deja dans le cloud (creee a la main). Quelle approche **declarative et revuable** pour l'adopter ?

- A. `terraform state push`
- B. Un bloc `import { to = ... id = ... }` + `terraform plan` / `-generate-config-out`
- C. La supprimer puis la recreer
- D. `terraform refresh`

<details><summary>Reponse</summary>

**B.** Disponible depuis 1.5. L'import apparait dans le plan, donc passe en revue de PR.
</details>

### Q29
Vous voulez que Terraform **cesse de gerer** une ressource sans la detruire. Quelle approche moderne ?

- A. `terraform destroy -target`
- B. Un bloc `removed { from = ... lifecycle { destroy = false } }` (ou `terraform state rm`)
- C. La mettre en commentaire
- D. `prevent_destroy`

<details><summary>Reponse</summary>

**B.** Mettre en commentaire sans `removed` **detruirait** la ressource.
</details>

### Q30
Un `terraform apply` a ete interrompu (CI tue) et le verrou persiste. Quand utiliser `force-unlock` ?

- A. Toujours en premier
- B. Seulement apres avoir verifie qu'**aucun run n'est reellement en cours** sur ce state
- C. Jamais
- D. Uniquement en local

<details><summary>Reponse</summary>

**B.** Debloquer un verrou actif peut corrompre le state.
</details>

### Q31
Pourquoi le bloc `backend` n'accepte-t-il pas `var.bucket` ?

- A. Bug connu
- B. Le backend est initialise **avant** l'evaluation des variables ; utiliser la **configuration partielle** (`-backend-config`)
- C. Les variables sont interdites partout
- D. Seuls les backends cloud l'interdisent

<details><summary>Reponse</summary>

**B.**
</details>

### Q32
Que contient le state qui pose un probleme de securite ?

- A. Rien de sensible
- B. Les attributs des ressources, dont des **secrets en clair** (mots de passe, cles) meme marques `sensitive`
- C. Le code source
- D. Les journaux

<details><summary>Reponse</summary>

**B.** D'ou : backend chiffre + IAM strict + versioning + jamais dans Git.
</details>

### Q33
Pour un projet avec reseau, plateforme et applications, quelle organisation du state est recommandee ?

- A. Un seul state geant pour tout
- B. **Plusieurs states** decoupes par couche/cycle de vie/equipe, avec des droits distincts
- C. Un state par ressource
- D. Un state par developpeur

<details><summary>Reponse</summary>

**B.** Reduit le rayon d'impact, accelere les plans, permet des droits fins. Eviter l'exces (C).
</details>

### Q34
Pour lire l'ID d'un VPC gere dans un **autre state**, quelle option est preferee ?

- A. `terraform_remote_state` toujours
- B. Une **data source native** (`data "google_compute_network"`) qui lit la realite, ou un output publie dans un store (couplage faible)
- C. Copier l'ID en dur
- D. Partager le meme state

<details><summary>Reponse</summary>

**B.** `terraform_remote_state` donne acces a **tout** le state source (y compris des secrets) et cree un couplage fort.
</details>

### Q35
Que fait `terraform state rm google_storage_bucket.b` ?

- A. Detruit le bucket
- B. Retire le bucket du state ; il **continue d'exister**, et le prochain plan voudra le recreer s'il est toujours dans la config
- C. Supprime le code
- D. Verrouille le bucket

<details><summary>Reponse</summary>

**B.**
</details>

### Q36
Les workspaces CLI conviennent-ils pour separer dev et prod ?

- A. Oui, c'est la methode recommandee
- B. **Non en general** : meme backend, memes credentials, risque d'erreur de workspace ; preferer dossiers/states separes et comptes/projets/abonnements distincts
- C. Oui mais seulement sur Azure
- D. Non, ils n'existent pas

<details><summary>Reponse</summary>

**B.** Les workspaces CLI sont utiles pour des copies **identiques et ephemeres** (tests). Ils different des workspaces HCP Terraform.
</details>

### Q37
Vous migrez le state du backend local vers GCS. Quelles etapes ?

- A. Copier le fichier a la main
- B. Ajouter le bloc `backend "gcs"` puis `terraform init -migrate-state`
- C. `terraform apply`
- D. `terraform init -reconfigure` (copie le state)

<details><summary>Reponse</summary>

**B.** `-reconfigure` **ignore** l'ancien state sans le migrer.
</details>

### Q38
Comment detecter automatiquement le **drift** chaque nuit ?

- A. Impossible
- B. Un job planifie executant `terraform plan -detailed-exitcode` (code 2 = changements) avec alerte, ou la detection de drift de HCP Terraform
- C. Relancer `apply` chaque nuit
- D. Supprimer le state

<details><summary>Reponse</summary>

**B.** Ne pas auto-appliquer : un humain decide si c'est un drift a corriger ou a accepter.
</details>

---

## D. Modules, tests, CI/CD

### Q39
Un module enfant doit-il contenir un bloc `provider` ?

- A. Oui, toujours
- B. **Non** : il declare `required_providers`, la configuration vient du module appelant (`providers = {...}`), sinon on ne peut plus l'utiliser avec `count/for_each` ni le supprimer proprement
- C. Oui pour les alias
- D. Seulement pour Azure

<details><summary>Reponse</summary>

**B.**
</details>

### Q40
Quelle est la bonne pratique de versionnement pour un module consomme en production ?

- A. `source = "git::https://...git"` (branche par defaut)
- B. `source = "git::https://...git?ref=v1.4.0"` ou `version = "~> 1.4"` (Registry)
- C. Copier le code a chaque fois
- D. `ref=main`

<details><summary>Reponse</summary>

**B.** Un tag immuable rend les deploiements reproductibles.
</details>

### Q41
Quelle commande/fonction teste un module avec des assertions sur le plan, sans outils externes ?

- A. `terraform validate`
- B. **`terraform test`** (fichiers `.tftest.hcl`, `run` + `assert`, `mock_provider`)
- C. `terraform console`
- D. `terraform graph`

<details><summary>Reponse</summary>

**B.** Disponible depuis 1.6 ; `mock_provider` depuis 1.7.
</details>

### Q42
Quel outil analyse la **securite statique** (bucket public, chiffrement absent) de la configuration avant le deploiement ?

- A. `terraform fmt`
- B. Checkov / Trivy / KICS
- C. `terraform show`
- D. tflint uniquement

<details><summary>Reponse</summary>

**B.** tflint cible plutot les erreurs de provider/convention ; Checkov/Trivy les mauvaises configurations de securite.
</details>

### Q43
Dans un pipeline, comment appliquer les changements apres approbation en garantissant que le plan applique est **celui valide** ?

- A. Rejouer `plan` puis `apply -auto-approve`
- B. Sauvegarder `tfplan` en artefact au moment de la PR, puis `terraform apply tfplan` apres approbation dans un environnement protege
- C. Appliquer en local
- D. Utiliser `-target`

<details><summary>Reponse</summary>

**B.** Terraform refuse un plan perime (state change depuis).
</details>

### Q44
Comment authentifier un pipeline **GitHub Actions** vers GCP et Azure **sans secret statique** ?

- A. Cle JSON / client secret dans les secrets GitHub
- B. **OIDC** : Workload Identity Federation (GCP) / federated credentials (Azure) avec `id-token: write`
- C. Mot de passe d'un utilisateur
- D. Clefs SSH

<details><summary>Reponse</summary>

**B.** Jetons courts, lies au depot/branche/environnement via des conditions.
</details>

### Q45
Quelle est la difference entre Sentinel (ou OPA) et Azure Policy / Org Policy ?

- A. Aucune
- B. Sentinel/OPA evaluent le **plan avant l'apply** (shift-left) ; Azure Policy / Org Policy appliquent les regles **dans le cloud, quel que soit l'outil** (garde-fou final). On combine les deux
- C. Sentinel ne fonctionne qu'avec Azure
- D. Org Policy remplace IAM

<details><summary>Reponse</summary>

**B.**
</details>

### Q46
Que signifie OpenTofu ?

- A. Un plugin pour Terraform
- B. Un **fork open source** (Linux Foundation) de Terraform, cree apres le passage de Terraform a la licence BSL 1.1
- C. Un langage different
- D. Un produit Microsoft

<details><summary>Reponse</summary>

**B.** Globalement compatible ; certaines fonctions divergent (ex. chiffrement natif du state). A connaitre pour le contexte, pas pour les examens Terraform Associate (qui portent sur Terraform/HCP).
</details>

---

## E. Scenarios GCP et Azure

### Q47
Un pipeline CI doit appliquer Terraform sur GCP. L'identite utilisee peut creer des SA et modifier l'IAM. Comment reduire le risque ?

- A. Donner `roles/owner`
- B. SA **dediee par couche** avec moindre privilege, acces via **WIF** conditionne au depot/branche, separation plan (lecture) / apply (ecriture, environnement protege)
- C. Partager un SA admin entre tous les depots
- D. Utiliser un compte personnel

<details><summary>Reponse</summary>

**B.**
</details>

### Q48
Dans quel ordre le risque est-il croissant ? `google_project_iam_member`, `google_project_iam_binding`, `google_project_iam_policy`

- A. `policy` < `binding` < `member`
- B. `member` (ajoute un membre) < `binding` (remplace tous les membres d'un role) < `policy` (remplace **toute** la policy)
- C. Tous equivalents
- D. `binding` < `member` < `policy`

<details><summary>Reponse</summary>

**B.** `iam_policy` peut vous verrouiller hors du projet. Par defaut, `iam_member`.
</details>

### Q49
`terraform destroy` d'un environnement desactive une API partagee (ex. `compute.googleapis.com`) et casse d'autres ressources. Reglage a appliquer ?

- A. Supprimer `google_project_service`
- B. `disable_on_destroy = false`
- C. `prevent_destroy = true` sur le projet
- D. Rien

<details><summary>Reponse</summary>

**B.** Evite de desactiver l'API lors de la destruction de la ressource.
</details>

### Q50
`terraform apply` retourne `Error 409: ... already exists` pour un bucket GCS cree manuellement. Que faites-vous ?

- A. Supprimer le bucket manuellement et relancer
- B. **Importer** la ressource (bloc `import`) puis aligner la configuration
- C. Changer de provider
- D. Utiliser `-target`

<details><summary>Reponse</summary>

**B.** La suppression pourrait detruire des donnees. L'import adopte la ressource existante.
</details>

### Q51
Sur Azure, votre pipeline s'authentifie avec un client secret qui expire tous les 6 mois et a deja fuite une fois. Alternative ?

- A. Secret plus long
- B. **Federated credential (OIDC)** sur une identite (app registration ou managed identity) : `ARM_USE_OIDC=true`, pas de secret
- C. Compte utilisateur avec MFA desactive
- D. Cle de compte de stockage

<details><summary>Reponse</summary>

**B.** Ou **managed identity** si le runner est dans Azure.
</details>

### Q52
Une fonctionnalite Azure toute recente n'est **pas encore supportee** par `azurerm`. Que faire ?

- A. Attendre indefiniment
- B. Utiliser le provider **`azapi`** (acces direct a l'API ARM) pour cette ressource, tout en restant dans Terraform
- C. Passer au portail
- D. Forker azurerm

<details><summary>Reponse</summary>

**B.** Bicep est l'autre option (jour-0), mais `azapi` evite de quitter Terraform.
</details>

### Q53
Vous gerez le state Azure dans un compte de stockage. Quelles mesures de securite ? *(choisir 3)*

- A. Acces par **Entra ID (RBAC)** (`use_azuread_auth`) plutot que cle de compte
- B. **Soft delete et versioning** des blobs
- C. Compte de stockage public pour faciliter la CI
- D. Restriction reseau (pare-feu / Private Endpoint)
- E. Partager la cle de compte entre tous les developpeurs

<details><summary>Reponse</summary>

**A, B, D.** Le state contient des secrets : acces restreint, recuperation possible, reseau limite.
</details>

### Q54
Apres `terraform apply` sur Azure, une affectation de role (`azurerm_role_assignment`) est creee mais la ressource qui en depend echoue en `AuthorizationFailed` pendant quelques minutes. Pourquoi, et que faire ?

- A. Bug du provider
- B. **Propagation RBAC** (coherence eventuelle) ; ajouter un delai (`time_sleep`) ou reessayer, et ordonner via `depends_on`
- C. Le role n'existe pas
- D. Le state est corrompu

<details><summary>Reponse</summary>

**B.**
</details>

---

## F. Debug

### Q55
`Error: Cycle: google_compute_firewall.a, google_compute_instance.b`. Que signifie-t-elle et comment la corriger ?

<details><summary>Reponse</summary>

Une **dependance circulaire** : `a` depend de `b` et inversement (ex. regle de pare-feu qui reference l'instance qui reference la regle via un tag/ID). Corriger en **cassant le cycle** : utiliser une valeur statique (tag reseau, nom) au lieu de l'attribut de l'autre ressource, ou extraire la liaison dans une ressource separee. `terraform graph` aide a visualiser le cycle.
</details>

### Q56
Le plan indique `# aws_db_instance.main must be replaced ... forces replacement` apres un changement de variable. Que faites-vous **avant** d'appliquer ?

<details><summary>Reponse</summary>

1. Identifier l'attribut marque `# forces replacement` dans le plan.
2. Se demander si le changement est voulu ; sinon corriger la valeur / utiliser `ignore_changes`.
3. Si voulu : **sauvegarder les donnees** (snapshot), verifier `prevent_destroy`/`deletion_protection`, prevoir `create_before_destroy` et la migration de donnees, puis relire le plan en PR.
Ne jamais appliquer a l'aveugle un remplacement sur une ressource avec etat.
</details>

### Q57
Un `plan` montre un diff **permanent** sur une liste de blocs `rule` alors que rien n'a change. Pistes ?

<details><summary>Reponse</summary>

Le service API **reordonne ou normalise** la valeur (ordre, casse, valeurs par defaut ajoutees). Pistes : trier/normaliser dans la config (`sort`, `lower`), utiliser des `set` plutot que des listes si l'ordre n'est pas significatif, `ignore_changes` cible sur l'attribut, ou mettre a jour le provider (bug connu). Verifier avec `terraform show -json` la valeur reelle vs configuree.
</details>

### Q58
Votre `plan` prend 25 minutes et le state fait 80 Mo. Quelles actions, par ordre d'efficacite ?

<details><summary>Reponse</summary>

1. **Decouper le state** par couche/equipe (reseau, plateforme, apps).
2. Remplacer les `terraform_remote_state` lourds par des data sources ciblees.
3. Eviter des modules qui instancient des centaines de ressources avec des data sources redondantes.
4. Ajuster `-parallelism` (monter si pas de 429, baisser sinon) ; utiliser `-refresh=false` seulement en depannage controle.
5. `-target` uniquement comme depannage ponctuel, pas comme workflow.
</details>

---

## Grille d'auto-evaluation

| Score (58) | Interpretation |
|------------|----------------|
| 52-58 | Pret pour l'Associate et les entretiens Terraform seniors |
| 44-51 | Solide : revoir state/refactoring et CI/CD |
| 35-43 | Correct : refaire les labs 1-3 puis retenter |
| < 35 | Relire module 08 puis ce cours, refaire les labs |

Apres le test : pour chaque erreur, **ecrivez un mini exemple HCL** qui illustre le point et executez-le avec `terraform plan` (labs en `labs/`).
