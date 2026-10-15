# Terraform - Questions complementaires

16 questions supplementaires : refactoring, import, lifecycle, qualite, secrets, CI.

## A. State et refactoring

### Q1
Vous renommez `aws_instance.web` en `aws_instance.app` dans le code sans detruire la ressource. Quelle methode declarative ?

- A. `terraform state rm` puis `apply`
- B. Un bloc **`moved { from = aws_instance.web  to = aws_instance.app }`**
- C. Supprimer et recreer
- D. `terraform refresh`

<details><summary>Reponse</summary>

**B.** Le bloc `moved` met a jour l'adresse dans le state lors du plan, versionnable et relu en revue. A ferait recreer la ressource.
</details>

### Q2
Comment importer une ressource existante **en code** (Terraform >= 1.5) et generer une configuration de depart ?

- A. Bloc `import {}` + `terraform plan -generate-config-out=generated.tf`
- B. `terraform taint`
- C. `terraform init -import`
- D. Impossible sans CLI manuelle

<details><summary>Reponse</summary>

**A.** Le bloc `import` est declaratif ; `-generate-config-out` produit le HCL a relire et nettoyer. L'ancienne CLI `terraform import` reste valide mais imperative.
</details>

### Q3
Une liste de `count = 3` ressources : vous retirez l'element du **milieu**. Quel est le probleme ?

- A. Aucun
- B. Les indices se decalent : Terraform **detruit et recree** les ressources suivantes
- C. Terraform refuse de planifier
- D. Seul le dernier est detruit

<details><summary>Reponse</summary>

**B.** `count` identifie par index. Avec `for_each` sur des cles stables, seul l'element retire est detruit.
</details>

### Q4
Une variable marquee `sensitive = true` signifie que sa valeur...

- A. Est chiffree dans le state
- B. N'apparait pas dans les sorties CLI, mais **reste en clair dans le state**
- C. N'est jamais stockee
- D. Est stockee dans Vault

<details><summary>Reponse</summary>

**B.** `sensitive` masque l'affichage uniquement. Il faut proteger le state (backend chiffre, acces restreint) et preferer des references a un gestionnaire de secrets.
</details>

### Q5
Pourquoi utiliser un backend distant avec **verrouillage** (locking) ?

- A. Accelerer le plan
- B. **Empecher deux `apply` concurrents de corrompre le state**
- C. Chiffrer le code
- D. Supprimer les providers

<details><summary>Reponse</summary>

**B.** Le verrou serialise les operations d'ecriture. Il partage aussi le state entre l'equipe et la CI.
</details>

## B. Langage et lifecycle

### Q6
Comment empecher la suppression accidentelle d'une base de donnees de production ?

- A. `lifecycle { prevent_destroy = true }`
- B. `ignore_changes = all`
- C. `create_before_destroy = true`
- D. `depends_on`

<details><summary>Reponse</summary>

**A.** Terraform echoue si un plan doit detruire la ressource. C change l'ordre de remplacement ; B ignore la derive.
</details>

### Q7
Un autoscaler modifie `desired_capacity` en dehors de Terraform. Comment eviter que le plan le "corrige" ?

- A. `lifecycle { ignore_changes = [desired_capacity] }`
- B. `prevent_destroy`
- C. `terraform taint`
- D. Supprimer l'attribut du state

<details><summary>Reponse</summary>

**A.** `ignore_changes` laisse un attribut gere hors Terraform ; a utiliser avec precaution.
</details>

### Q8
Que fait `terraform apply -replace="aws_instance.web"` ?

- A. Supprime du state sans detruire
- B. **Force la recreation** de cette ressource au prochain apply (remplace `taint`)
- C. Importe la ressource
- D. Rafraichit uniquement

<details><summary>Reponse</summary>

**B.** `-replace` est la methode moderne, visible dans le plan et sans modifier le state avant revue.
</details>

### Q9
Vous devez generer un nombre variable de blocs `ingress` dans une ressource. Quelle construction ?

- A. `count` sur un bloc
- B. Un bloc **`dynamic "ingress"`** avec `for_each`
- C. Une boucle `while`
- D. Plusieurs fichiers `.tf`

<details><summary>Reponse</summary>

**B.** `dynamic` genere des blocs imbriques repetes a partir d'une collection.
</details>

### Q10
Deux regions du meme provider dans un seul module racine. Comment ?

- A. Deux workspaces
- B. **Des `provider` avec `alias`** et `provider = google.eu` sur les ressources
- C. Impossible
- D. Deux backends

<details><summary>Reponse</summary>

**B.** Les alias permettent plusieurs configurations du meme provider ; les modules les recoivent via `providers = { ... }`.
</details>

### Q11
Quel est l'interet de `precondition` / `postcondition` dans `lifecycle` ?

- A. Accelerer le plan
- B. Valider des hypotheses (ex. image non obsolete, CIDR valide) et **echouer tot avec un message clair**
- C. Remplacer les variables
- D. Chiffrer les sorties

<details><summary>Reponse</summary>

**B.** Elles verifient des garanties sur les entrees/sorties d'une ressource ou d'un data source.
</details>

### Q12
La contrainte de version `~> 5.0` pour un provider autorise...

- A. 5.0.x uniquement
- B. Toute version >= 5.0
- C. **>= 5.0 et < 6.0**
- D. Exactement 5.0

<details><summary>Reponse</summary>

**C.** L'operateur `~>` autorise l'incrementation du dernier chiffre indique ; `~> 5.0` = 5.x, `~> 5.0.1` = 5.0.x.
</details>

## C. Environnements, CI et tests

### Q13
Pourquoi les workspaces ne sont-ils pas toujours adaptes pour isoler dev et prod ?

- A. Ils sont obsoletes
- B. Ils partagent la **meme configuration et backend**, avec un risque d'erreur de workspace et des identifiants souvent communs
- C. Ils ne gardent pas de state
- D. Ils ne supportent pas les variables

<details><summary>Reponse</summary>

**B.** Pour des environnements fortement isoles (comptes/projets distincts, droits differents), preferer des repertoires/etats separes, parfois avec des modules partages.
</details>

### Q14
Quelles verifications faire dans la CI **avant** un `apply` ? *(choisir 3)*

- A. `terraform fmt -check`
- B. `terraform validate`
- C. `terraform plan` revu (et scanne par un outil de politique)
- D. `terraform destroy`
- E. Supprimer le state

<details><summary>Reponse</summary>

**A, B, C.** Format, validation syntaxique, plan relu/scanne. D et E sont destructifs.
</details>

### Q15
Quel outil teste un module avec des **assertions** sans creer d'infrastructure reelle (via `command = plan`) ?

- A. `terraform graph`
- B. **`terraform test`** (fichiers `.tftest.hcl`)
- C. `terraform console`
- D. `terraform output`

<details><summary>Reponse</summary>

**B.** `terraform test` execute des runs avec des `assert`, en `plan` ou `apply` (ressources temporaires).
</details>

### Q16
Vous voulez retirer une ressource de la gestion Terraform **sans la detruire** dans le cloud. Quelle commande/bloc ?

- A. `terraform destroy -target`
- B. **`terraform state rm`** ou un bloc `removed { lifecycle { destroy = false } }`
- C. Supprimer le fichier .tf seulement
- D. `terraform refresh`

<details><summary>Reponse</summary>

**B.** Les deux retirent l'adresse du state sans toucher la ressource reelle. Supprimer simplement le code provoquerait une destruction au prochain apply.
</details>
