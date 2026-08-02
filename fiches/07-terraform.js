window.FICHES = (window.FICHES || []).concat([{
id:"terraform",
titre:"Terraform & IaC",
lead:"Le state, le découpage et le workflow d'équipe : c'est là-dessus qu'on distingue un utilisateur d'un praticien.",
html:`
<h3>Le workflow</h3>
<pre><code>terraform init          # providers, modules, backend, lock file
terraform fmt -recursive
terraform validate      # syntaxe et cohérence, sans appel API
terraform plan -out=tf.plan
terraform apply tf.plan # applique CE plan-là, pas un replan
terraform destroy</code></pre>
<p>Symboles du plan : <code>+</code> création, <code>-</code> destruction, <code>~</code> modification en place, <code>-/+</code> <b>remplacement</b> (destroy puis create). Chercher systématiquement la mention <code># forces replacement</code>.</p>

<h3>Le state</h3>
<ul>
<li>Il mémorise la correspondance code ↔ ressources réelles (IDs, attributs, dépendances). Sans lui, Terraform ne sait plus ce qu'il gère.</li>
<li>Il contient souvent des <b>secrets en clair</b> : jamais dans Git, toujours en backend distant chiffré, accès restreint.</li>
<li><b>Backend distant obligatoire à plusieurs</b>, pour le partage ET le <b>verrouillage</b> : sans lock, deux apply simultanés corrompent le state.</li>
</ul>
<pre><code>terraform {
  required_version = "~> 1.9"
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = "~> 4.0" }
  }
  backend "azurerm" {
    resource_group_name  = "rg-tfstate"
    storage_account_name = "sttfstateprod"
    container_name       = "tfstate"
    key                  = "plateforme/prod.tfstate"
  }
}</code></pre>
<p>Équivalent AWS : backend <code>s3</code> avec <code>encrypt = true</code>, versioning activé et verrouillage (DynamoDB ou lockfile natif S3).</p>

<h3>Commandes de state</h3>
<table>
<tr><th>Commande</th><th>Effet</th><th>Quand</th></tr>
<tr><td><code>state list / show</code></td><td>Inspecter</td><td>Diagnostic</td></tr>
<tr><td><code>import</code> (ou bloc <code>import</code>)</td><td>Prendre en gestion une ressource existante</td><td>Reprise d'infra manuelle</td></tr>
<tr><td><code>state rm</code></td><td>Retirer du state <b>sans détruire</b></td><td>Abandonner la gestion, migrer vers un autre state</td></tr>
<tr><td><code>state mv</code> / bloc <code>moved</code></td><td>Changer l'adresse d'une ressource</td><td>Refactoring — <b>préférer le bloc <code>moved</code></b> : versionné et revu en PR</td></tr>
<tr><td><code>force-unlock &lt;id&gt;</code></td><td>Libérer un verrou coincé</td><td>Après avoir VÉRIFIÉ qu'aucun apply ne tourne</td></tr>
<tr><td><code>taint</code> / <code>-replace</code></td><td>Forcer la recréation</td><td>Ressource dans un état incohérent</td></tr>
</table>
<p><b>L'import ne génère pas le code</b> : on écrit d'abord la ressource, on importe, puis on itère sur le plan jusqu'à « no changes ».</p>

<h3>count vs for_each</h3>
<pre><code># count : indexé par POSITION → supprimer un élément décale tout
resource "azurerm_storage_account" "s" { count = 3 }

# for_each : indexé par CLÉ → adresse stable
resource "azurerm_storage_account" "s" {
  for_each = { logs = "Standard_LRS", data = "Standard_GRS" }
  name     = "st\${each.key}"
  account_replication_type = each.value
}</code></pre>
<p><b>Règle</b> : <code>count</code> uniquement pour un booléen (0 ou 1). <code>for_each</code> dès que les éléments sont distincts. La clé doit venir d'une valeur <b>connue au plan</b> — sinon Terraform refuse (« known after apply »).</p>

<h3>lifecycle</h3>
<pre><code>lifecycle {
  prevent_destroy       = true                # bloque toute destruction (base prod)
  create_before_destroy = true                # crée le remplaçant avant de supprimer
  ignore_changes        = [tags["LastScan"]]  # ignorer une dérive légitime
  replace_triggered_by  = [null_resource.v]   # forcer un remplacement piloté
}</code></pre>

<h3>Structure d'un module</h3>
<pre><code>modules/reseau/
  main.tf        # ressources
  variables.tf   # entrées typées, avec description et validation
  outputs.tf     # tout ce dont l'appelant a besoin
  versions.tf    # required_providers
  README.md</code></pre>
<pre><code>variable "environnement" {
  type        = string
  description = "dev | rec | prod"
  validation {
    condition     = contains(["dev","rec","prod"], var.environnement)
    error_message = "Environnement invalide."
  }
}</code></pre>
<div class="box piege"><b>Un module ne déclare JAMAIS</b> de bloc <code>provider</code> ni de <code>backend</code> : il les reçoit du root module (<code>providers = { aws = aws.eu }</code>). Un module qui définit son provider ne peut plus être supprimé proprement.</div>

<h3>Découpage des states</h3>
<p>On découpe par <b>rayon d'impact</b> et par <b>cycle de vie</b> :</p>
<ul>
<li><b>Socle / landing zone</b> : réseau, IAM, DNS, journalisation. Change rarement, très critique, droits très restreints.</li>
<li><b>Plateforme</b> : cluster, registry, coffres, bases partagées.</li>
<li><b>Applications</b> : un state par application × environnement. Change souvent, risque circonscrit.</li>
</ul>
<p>Bénéfices : plan rapide, erreur limitée, verrous indépendants, droits séparés. Coût : des contrats entre states. Pour lire une valeur produite ailleurs, préférer une <b>data source sur une source de vérité</b> (SSM Parameter, Key Vault, tag) plutôt que <code>terraform_remote_state</code>, qui exige un droit de lecture sur tout le state distant — donc sur ses secrets.</p>

<h3>Multi-région / multi-compte</h3>
<pre><code>provider "aws" { region = "eu-west-3" }
provider "aws" { alias = "us", region = "us-east-1" }

resource "aws_acm_certificate" "cdn" {
  provider = aws.us    # CloudFront exige us-east-1
  ...
}</code></pre>

<h3>Pipeline Terraform d'entreprise</h3>
<ol>
<li><b>PR</b> → <code>fmt -check</code>, <code>validate</code>, <code>tflint</code></li>
<li>Scan conformité : <b>tfsec / Checkov / OPA-Conftest</b> sur le plan JSON</li>
<li><code>plan</code> publié en commentaire de PR, relu par un humain (2 yeux en prod)</li>
<li>Merge → <code>apply</code> du <b>plan sauvegardé</b></li>
<li>Tests de smoke + notification</li>
<li>Détection de drift planifiée (<code>plan -detailed-exitcode</code>, code 2 = dérive)</li>
</ol>
<p>Authentification du pipeline par <b>OIDC</b> (aucun secret longue durée), environnements protégés avec approbation manuelle sur la prod, séparation des identités plan (lecture) et apply (écriture).</p>

<h3>Problèmes classiques</h3>
<table>
<tr><th>Symptôme</th><th>Cause / réponse</th></tr>
<tr><td>Diff perpétuel</td><td>L'API renvoie une valeur normalisée différente (casse, ordre, JSON). Écrire la forme canonique, sinon <code>ignore_changes</code> ciblé</td></tr>
<tr><td>Veut détruire/recréer</td><td>Un attribut immuable a changé. Lire <code># forces replacement</code>. Parade : <code>moved</code>, <code>ignore_changes</code>, <code>prevent_destroy</code></td></tr>
<tr><td>Apply échoué à mi-chemin</td><td>Le state reflète ce qui a été créé. On relance un <b>plan</b>, on corrige, on ré-applique — on ne restaure pas un vieux state à l'aveugle</td></tr>
<tr><td>Ressource supprimée à la main</td><td>Terraform la recrée au prochain apply. Sinon : import ou <code>state rm</code> + suppression du code</td></tr>
<tr><td>Erreur de verrouillage</td><td>Un autre apply tourne (ou a planté). Vérifier avant tout <code>force-unlock</code></td></tr>
<tr><td>Throttling API (429)</td><td>Réduire <code>-parallelism</code> (défaut 10)</td></tr>
</table>

<h3>Terraform vs natif</h3>
<table>
<tr><th></th><th>Terraform</th><th>Bicep / CloudFormation</th></tr>
<tr><td>Portée</td><td>Multi-fournisseur, y compris hors cloud (DNS, GitHub, Datadog, Vault)</td><td>Un seul cloud</td></tr>
<tr><td>State</td><td>À gérer et sécuriser</td><td>Géré par la plateforme</td></tr>
<tr><td>Nouveautés</td><td>Délai provider</td><td>Support dès le jour 1</td></tr>
<tr><td>Argument</td><td>Homogénéité des pratiques et des compétences</td><td>Zéro état à opérer, support éditeur</td></tr>
</table>

<div class="box dire"><b>Phrase qui rassure un architecte bancaire</b>
« Le state est un actif critique : backend managé répliqué et versionné, chiffrement, verrouillage, accès limité aux pipelines, restauration testée. Et en dernier recours, il est reconstructible par import — contrairement à une infrastructure non décrite, que personne ne sait recréer. »</div>
`
}]);
