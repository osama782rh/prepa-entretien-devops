window.FICHES = (window.FICHES || []).concat([{
id:"cicd",
titre:"CI/CD & stratégies de déploiement",
lead:"Ici, ce qu'on évalue c'est ta capacité à livrer souvent SANS augmenter le risque. C'est un sujet de gouvernance autant que de technique.",
html:`
<h3>Vocabulaire exact</h3>
<table>
<tr><th>Terme</th><th>Définition</th></tr>
<tr><td>Continuous Integration</td><td>Chaque commit est intégré et validé automatiquement sur le tronc, plusieurs fois par jour</td></tr>
<tr><td>Continuous Delivery</td><td>Chaque build est <b>prêt</b> à partir en prod ; un humain déclenche</td></tr>
<tr><td>Continuous Deployment</td><td>Tout build qui passe part en prod <b>automatiquement</b></td></tr>
</table>
<p>En banque, on vise la <b>Delivery</b> : l'approbation reste, mais elle devient un clic tracé sur un pipeline fiable au lieu d'une opération manuelle.</p>

<h3>Ordre des étapes (fail fast)</h3>
<pre><code>lint / format          (secondes)
tests unitaires        (1-3 min)
build + SBOM           (artefact UNIQUE, versionné)
scan SAST + SCA + secrets
tests d'intégration
push de l'image signée vers le registry
déploiement dev → tests de smoke
déploiement rec → tests e2e / DAST
[approbation] → prod (progressif) → smoke + surveillance</code></pre>
<p><b>Build once, deploy many</b> : on construit UN artefact et on le PROMEUT d'environnement en environnement. Reconstruire par environnement, c'est déployer autre chose que ce qui a été testé.</p>

<h3>Stratégies de déploiement</h3>
<table>
<tr><th>Stratégie</th><th>Principe</th><th>Coût / risque</th></tr>
<tr><td><b>Recreate</b></td><td>On arrête tout, on redémarre</td><td>Coupure — seulement en dev</td></tr>
<tr><td><b>Rolling update</b></td><td>Remplacement progressif (maxSurge / maxUnavailable)</td><td>Défaut K8s. Deux versions coexistent → compatibilité requise</td></tr>
<tr><td><b>Blue/green</b></td><td>Deux environnements complets, bascule totale</td><td>Rollback instantané, mais double capacité</td></tr>
<tr><td><b>Canary</b></td><td>1 % → 10 % → 50 % → 100 % selon les métriques</td><td>Moins cher, détection réelle, mais plus long</td></tr>
<tr><td><b>Feature flag</b></td><td>Déploiement ≠ activation</td><td>Le plus puissant : on désactive sans redéployer. Coût : dette de flags à nettoyer</td></tr>
<tr><td><b>Shadow / mirroring</b></td><td>On duplique le trafic vers la nouvelle version sans servir sa réponse</td><td>Test réaliste sans risque — attention aux effets de bord (écritures)</td></tr>
</table>

<h3>Migrations de base : expand / contract</h3>
<ol>
<li><b>Expand</b> : ajouter la nouvelle colonne/table, nullable, sans rien casser.</li>
<li>Déployer le code qui écrit dans l'ancien ET le nouveau, et lit le nouveau avec repli.</li>
<li>Migrer les données existantes (par lots, en arrière-plan).</li>
<li><b>Contract</b> : une fois toutes les instances migrées et stabilisées, supprimer l'ancien.</li>
</ol>
<div class="box piege"><b>La question qui tue</b> : « comment tu rollback si la migration est déjà passée ? » La bonne réponse n'est pas « je restaure une sauvegarde » : c'est que les migrations doivent être <b>rétrocompatibles</b>, donc l'ancien binaire tourne sur le nouveau schéma. Sinon : roll-forward avec un correctif, la restauration étant un dernier recours assumé avec perte de données.</div>

<h3>Secrets dans le pipeline</h3>
<ol>
<li><b>Le mieux</b> : fédération d'identité <b>OIDC</b> entre le fournisseur CI et le cloud. Le pipeline échange un token signé contre des credentials temporaires. Aucun secret longue durée stocké.</li>
<li><b>Sinon</b> : coffre (Key Vault, Secrets Manager, Vault) avec injection au runtime, scope par environnement, masquage dans les logs, rotation.</li>
<li><b>Jamais</b> : secret en variable de pipeline non protégée, dans le code, dans une image (<code>ARG</code> reste dans <code>docker history</code>), ou dans le state Terraform accessible largement.</li>
</ol>

<h3>Sécuriser la chaîne CI/CD elle-même</h3>
<ul>
<li>Branches protégées, revue obligatoire, commits signés, interdiction du bypass.</li>
<li><b>Runners éphémères</b> et isolés par niveau de sensibilité — un runner persistant devient un vecteur de mouvement latéral.</li>
<li>Actions/images tierces <b>épinglées par digest</b>, jamais <code>@main</code>.</li>
<li>Séparation des identités <b>build</b> (lecture) et <b>deploy</b> (écriture), environnements protégés avec approbation distincte en prod.</li>
<li>Attention aux déclencheurs qui exécutent du code de fork avec les secrets du dépôt (<code>pull_request_target</code>) — approbation manuelle obligatoire pour les contributeurs externes.</li>
<li>Journalisation immuable : qui a approuvé, quel artefact, quand.</li>
</ul>

<h3>GitOps</h3>
<table>
<tr><th></th><th>Push (CI classique)</th><th>Pull (GitOps)</th></tr>
<tr><td>Qui déploie</td><td>La CI, avec des credentials cluster</td><td>Un agent DANS le cluster (Argo CD, Flux)</td></tr>
<tr><td>Credentials</td><td>Dans la CI — surface d'attaque</td><td>Aucun credential cluster à l'extérieur</td></tr>
<tr><td>Dérive</td><td>Non détectée</td><td>Détectée et corrigée en continu</td></tr>
<tr><td>Rollback</td><td>Rejouer un pipeline</td><td><code>git revert</code></td></tr>
<tr><td>Audit</td><td>Logs de pipeline</td><td>Historique Git = preuve de l'état désiré</td></tr>
</table>
<p>Pattern courant : un dépôt applicatif (code) + un dépôt de déploiement (manifestes). La CI construit l'image et ouvre une PR sur le dépôt de déploiement pour bumper le tag ; l'approbation de cette PR EST l'autorisation de mise en production.</p>

<h3>Mutualiser 50 pipelines</h3>
<p>Templates versionnés dans un dépôt central : <code>include</code> GitLab, reusable workflows GitHub, templates Azure DevOps, shared library Jenkins. Chaque dépôt applicatif ne garde qu'une dizaine de lignes. <b>Versionner les templates</b> (tag immuable, jamais <code>@main</code>), annoncer les dépréciations, garder une porte de sortie pour les cas particuliers.</p>

<h3>Métriques DORA</h3>
<table>
<tr><th>Métrique</th><th>Mesure</th><th>Élite</th></tr>
<tr><td>Deployment frequency</td><td>Fréquence de mise en production</td><td>À la demande, plusieurs fois par jour</td></tr>
<tr><td>Lead time for changes</td><td>Du commit à la prod</td><td>Moins d'un jour</td></tr>
<tr><td>Change failure rate</td><td>% de déploiements causant une dégradation</td><td>0-15 %</td></tr>
<tr><td>Time to restore</td><td>Durée de rétablissement</td><td>Moins d'une heure</td></tr>
</table>
<p><b>L'argument clé</b> : vitesse et stabilité progressent ENSEMBLE. Déployer souvent, en petits lots, réduit le risque — parce qu'on sait exactement ce qui a changé et qu'on revient en arrière facilement. C'est la réponse à « chez nous on livre une fois par trimestre, c'est plus sûr ».</p>

<div class="box dire"><b>Nuance bancaire à ne pas oublier</b>
Les périodes de gel (clôture comptable, arrêtés, jours de place) sont une contrainte métier <b>légitime</b>, pas une résistance au changement. Montrer qu'on la respecte tout en gardant un chemin d'urgence (hotfix avec approbation renforcée) prouve qu'on a déjà travaillé dans ce contexte.</div>
`
}]);
