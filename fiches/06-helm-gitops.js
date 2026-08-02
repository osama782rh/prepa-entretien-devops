window.FICHES = (window.FICHES || []).concat([{
id:"helm-gitops",
titre:"Helm, Kustomize & GitOps",
lead:"Comment on déploie réellement dans Kubernetes — et pourquoi le GitOps est la réponse attendue en banque.",
html:`
<h3>Le problème à résoudre</h3>
<p>Des manifestes YAML bruts ne passent pas l'échelle : il faut les paramétrer par environnement, les versionner, les déployer de façon reproductible, savoir revenir en arrière et détecter les dérives. Trois familles d'outils y répondent différemment.</p>

<h3>Helm</h3>
<p>Un gestionnaire de paquets : un <b>chart</b> est un ensemble de templates Go + un <code>values.yaml</code>, installé sous forme de <b>release</b> versionnée dans le cluster.</p>
<pre><code>mon-chart/
  Chart.yaml          # nom, version du chart, version de l'app, dépendances
  values.yaml         # valeurs par défaut
  templates/
    deployment.yaml
    service.yaml
    _helpers.tpl      # fonctions de nommage réutilisables
    NOTES.txt</code></pre>
<pre><code>helm template mon-app ./chart -f values-prod.yaml   # voir le rendu SANS déployer
helm diff upgrade mon-app ./chart -f values-prod.yaml  # plugin, mais indispensable
helm upgrade --install mon-app ./chart -f values-prod.yaml \\
  --atomic --timeout 5m         # rollback automatique si échec
helm history mon-app
helm rollback mon-app 3</code></pre>
<table>
<tr><th>Points forts</th><th>Points faibles</th></tr>
<tr><td>Écosystème énorme pour le logiciel tiers</td><td>Templating Go peu lisible dès que ça se complique</td></tr>
<tr><td>Releases versionnées, rollback natif</td><td>Erreurs de template détectées tard</td></tr>
<tr><td>Dépendances entre charts</td><td>Ne gère rien après l'installation (pas de jour 2)</td></tr>
<tr><td>Hooks de cycle de vie (pre-upgrade…)</td><td>L'état de la release vit dans un Secret du cluster</td></tr>
</table>
<div class="box piege"><b>Pièges Helm</b>
<ul>
<li><code>--atomic</code> et <code>--wait</code> ne sont pas activés par défaut : sans eux, un upgrade « réussit » alors que les Pods ne démarrent pas.</li>
<li>Un <code>helm upgrade</code> sur un chart tiers dont on n'a pas figé la version peut tout changer sans prévenir — <b>toujours épingler <code>--version</code></b>.</li>
<li>Les hooks (<code>pre-upgrade</code>) ne sont pas rollbackés comme le reste : une migration jouée par un hook ne se défait pas.</li>
<li>Supprimer une release ne supprime pas les CRD installées par le chart — et supprimer une CRD supprime toutes ses instances.</li>
</ul></div>

<h3>Kustomize</h3>
<p>Pas de templating : une <b>base</b> de manifestes valides et des <b>overlays</b> qui appliquent des patches déclaratifs. Intégré nativement à kubectl (<code>kubectl apply -k</code>).</p>
<pre><code>base/
  kustomization.yaml    # liste des ressources + labels/annotations communs
  deployment.yaml
overlays/
  prod/
    kustomization.yaml  # patches, replicas, images, configMapGenerator
    patch-ressources.yaml</code></pre>
<pre><code>kubectl kustomize overlays/prod        # voir le rendu
kubectl apply -k overlays/prod</code></pre>
<p>Atouts : les fichiers de base restent des manifestes Kubernetes valides et lisibles, les <code>configMapGenerator</code>/<code>secretGenerator</code> ajoutent un hash au nom — ce qui <b>déclenche automatiquement un rollout</b> quand la config change (Helm ne le fait pas sans astuce de checksum).</p>
<p>Limite : pas de logique conditionnelle, pas de boucles. Au-delà d'un certain nombre de variantes, les overlays deviennent aussi illisibles que des templates.</p>

<h3>Helm ou Kustomize ?</h3>
<div class="box dire"><b>Réponse défendable en entretien</b>
« Helm pour packager et distribuer — notamment tout le logiciel tiers, où l'écosystème est incontournable. Kustomize pour décliner nos propres applications par environnement, parce qu'on garde des manifestes lisibles et qu'on évite une couche de templating. Les deux se combinent d'ailleurs : Argo CD sait rendre un chart Helm puis lui appliquer des patches Kustomize. »</div>

<h3>Opérateurs et CRD</h3>
<p>Une <b>CRD</b> ajoute un type d'objet à l'API Kubernetes ; un <b>opérateur</b> est le contrôleur qui l'implémente, encodant la connaissance opérationnelle : sauvegarde, bascule, montée de version, resharding.</p>
<p><b>Quand écrire un opérateur plutôt qu'un chart ?</b> Quand il y a une logique <b>continue</b> à appliquer. Helm ne fait que rendre un template au moment de l'installation ; il ne réagit à rien ensuite. Un opérateur réconcilie en permanence.</p>
<div class="box piege">Un opérateur tiers demande souvent des droits cluster très larges et installe des CRD : c'est une dépendance critique à traiter comme telle — revue de sécurité, version épinglée, compatibilité vérifiée avant chaque upgrade de cluster, et sauvegarde des ressources personnalisées (ce sont des données).</div>

<h3>GitOps</h3>
<p>L'état désiré est déclaré dans Git ; un <b>agent dans le cluster</b> (Argo CD, Flux) tire ce dépôt et réconcilie en continu.</p>
<table>
<tr><th></th><th>Push (CI classique)</th><th>Pull (GitOps)</th></tr>
<tr><td>Qui déploie</td><td>La CI, avec des credentials cluster</td><td>Un agent DANS le cluster</td></tr>
<tr><td>Credentials</td><td>Dans la CI — surface d'attaque</td><td>Aucun credential cluster à l'extérieur</td></tr>
<tr><td>Dérive</td><td>Non détectée</td><td>Détectée et corrigée automatiquement</td></tr>
<tr><td>Rollback</td><td>Rejouer un pipeline</td><td><code>git revert</code></td></tr>
<tr><td>Audit</td><td>Logs de pipeline</td><td>Historique Git = preuve de l'état désiré</td></tr>
<tr><td>Nouveau cluster</td><td>Rejouer tous les pipelines</td><td>Pointer l'agent sur le dépôt</td></tr>
</table>

<h3>Le pattern à deux dépôts</h3>
<pre><code>depot-application/          depot-deploiement/
  src/                        apps/mon-app/
  Dockerfile                    base/
  .gitlab-ci.yml                overlays/{dev,rec,prod}/

CI : build → test → push image:sha-abc123
   → ouvre une PR sur depot-deploiement qui bump le tag
   → l'approbation de CETTE PR est l'autorisation de mise en production
   → Argo CD détecte le merge et applique</code></pre>
<p>Bénéfice majeur en banque : l'autorisation de déploiement devient une <b>revue de code tracée et signée</b>, ce qui satisfait la séparation des tâches sans ajouter de guichet manuel.</p>

<h3>Argo CD — les notions à connaître</h3>
<ul>
<li><b>Application</b> : la liaison entre une source (dépôt + chemin + révision) et une destination (cluster + namespace).</li>
<li><b>Sync policy</b> : manuelle ou automatique, avec <code>prune</code> (supprimer ce qui a disparu de Git) et <code>selfHeal</code> (annuler les modifications faites à la main dans le cluster).</li>
<li><b>Statut</b> : <code>Synced</code>/<code>OutOfSync</code> (conformité à Git) et <code>Healthy</code>/<code>Degraded</code> (santé réelle) — deux axes distincts.</li>
<li><b>Sync waves</b> et hooks pour ordonner (migration de base avant l'application).</li>
<li><b>App of Apps</b> ou ApplicationSet pour générer des dizaines d'applications à partir d'un modèle.</li>
</ul>
<div class="box piege"><b>La question piège</b> : « avec <code>selfHeal</code> activé, que se passe-t-il si un ingénieur corrige un incident en modifiant un Deployment à la main ? » — Argo annule sa correction en quelques secondes. D'où l'importance de savoir suspendre la synchronisation pendant un incident, et de faire passer le correctif par Git ensuite.</div>

<h3>Les secrets en GitOps</h3>
<p>Le problème : l'état désiré est dans Git, mais on n'y met pas de secrets en clair. Trois réponses :</p>
<ol>
<li><b>External Secrets Operator / Secrets Store CSI</b> : le secret reste dans Key Vault / Secrets Manager / Vault, le cluster le synchronise ou le monte. <b>Approche à privilégier en banque</b> : rotation centralisée, accès audité.</li>
<li><b>Sealed Secrets / SOPS</b> : le secret CHIFFRÉ est versionné dans Git, seul le cluster peut le déchiffrer. Simple, mais la rotation et la révocation sont manuelles.</li>
<li>Injection au runtime par un agent (Vault Agent) : rien n'est stocké côté cluster.</li>
</ol>
`
}]);
