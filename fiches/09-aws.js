window.FICHES = (window.FICHES || []).concat([{
id:"aws",
titre:"AWS",
lead:"IAM, VPC et le modèle de responsabilité : le reste se déduit.",
html:`
<h3>Fondations</h3>
<ul>
<li><b>Région</b> = zone géographique (eu-west-3 Paris). <b>AZ</b> = un ou plusieurs datacenters isolés, reliés à faible latence. HA = multi-AZ. DR = multi-région.</li>
<li><b>Responsabilité partagée</b> : AWS sécurise LE cloud (matériel, hyperviseur, réseau physique), le client sécurise DANS le cloud (IAM, chiffrement, patchs OS, configuration, données).</li>
</ul>

<h3>IAM — le cœur de l'entretien</h3>
<p><b>Ordre d'évaluation</b> : deny par défaut → un <b>Deny explicite</b> l'emporte toujours → sinon il faut un Allow explicite dans l'intersection SCP ∩ permission boundary ∩ identity policy (ou une resource policy).</p>
<table>
<tr><th>Type</th><th>Attachée à</th><th>Particularité</th></tr>
<tr><td>Identity-based</td><td>User, group, rôle</td><td>Ce que CETTE identité peut faire</td></tr>
<tr><td>Resource-based</td><td>Bucket, clé KMS, SQS, Lambda</td><td>Contient un <code>Principal</code> → permet le cross-compte sans AssumeRole</td></tr>
<tr><td>SCP (Organizations)</td><td>OU / compte</td><td>Plafond de permissions, n'accorde rien</td></tr>
<tr><td>Permission boundary</td><td>User / rôle</td><td>Plafond individuel — pour la délégation encadrée</td></tr>
<tr><td>Session policy</td><td>Session STS</td><td>Réduit temporairement les droits</td></tr>
</table>
<p><b>Rôle vs user</b> : un rôle n'a pas de credentials permanents, on l'endosse via STS et on reçoit des credentials temporaires. Sur EC2 (instance profile), sur EKS (<b>IRSA</b> / Pod Identity), pour la CI (<b>OIDC</b>). Objectif : zéro clé d'accès statique.</p>
<div class="box piege"><b>AccessDenied malgré la bonne policy</b> — les 4 suspects : (1) un Deny explicite ailleurs (bucket policy, SCP, boundary), (2) l'objet est chiffré KMS et il manque <code>kms:Decrypt</code> sur la CLÉ, (3) une condition non satisfaite (<code>aws:SourceIp</code>, MFA, tag), (4) le mauvais compte/région. Outils : IAM Policy Simulator, CloudTrail, IAM Access Analyzer.</div>

<h3>VPC</h3>
<ul>
<li>Un subnet est <b>public</b> uniquement si sa route table a <code>0.0.0.0/0 → igw</code>. Le nom n'a aucune valeur.</li>
<li><b>NAT Gateway</b> : sortie internet pour les subnets privés. Doit être DANS un subnet public (il lui faut une EIP et une route vers l'IGW). Un NAT par AZ pour la résilience — et c'est un poste de coût majeur (heure + Go).</li>
<li><b>Peering</b> : non transitif, CIDR non chevauchants. Au-delà de quelques VPC → <b>Transit Gateway</b>.</li>
<li><b>VPC Endpoints</b> : Gateway (S3, DynamoDB — gratuit, ajoute une route) vs Interface/PrivateLink (ENI privée, payant, la plupart des services).</li>
</ul>
<table>
<tr><th></th><th>Security Group</th><th>NACL</th></tr>
<tr><td>Niveau</td><td>ENI / instance</td><td>Subnet</td></tr>
<tr><td>État</td><td><b>Stateful</b> (retour auto-autorisé)</td><td><b>Stateless</b> (règle dans chaque sens + ports éphémères)</td></tr>
<tr><td>Règles</td><td>Allow uniquement</td><td>Allow ET Deny, numérotées, premier match</td></tr>
<tr><td>Référence</td><td>Peut cibler un autre SG</td><td>CIDR uniquement</td></tr>
</table>

<h3>Compute</h3>
<ul>
<li><b>EC2</b> : familles <code>t</code> burstable (crédits CPU), <code>m</code> général, <code>c</code> compute, <code>r</code> mémoire. <code>user_data</code> ne s'exécute qu'au PREMIER démarrage.</li>
<li><b>Tarification</b> : On-Demand → Savings Plans / Reserved (−40 à −70 % sur un engagement 1-3 ans) → <b>Spot</b> (−90 %, interruptible avec 2 min de préavis) pour les charges tolérantes.</li>
<li><b>ASG + ELB</b> : l'ASG gère la CAPACITÉ (remplacement des instances non saines, scaling), l'ELB la RÉPARTITION. Les deux ensemble, avec le health check ELB comme critère de remplacement.</li>
<li><b>ECS / EKS / Fargate / Lambda</b> : du plus contrôlé au plus managé. Fargate supprime la gestion des nœuds ; Lambda facture à l'invocation (attention aux <b>cold starts</b> : package léger, init hors du handler, Provisioned Concurrency si nécessaire).</li>
</ul>

<h3>Stockage</h3>
<table>
<tr><th>Service</th><th>Nature</th><th>Points d'attention</th></tr>
<tr><td>S3</td><td>Objet</td><td>Cohérence forte depuis 2020. Block Public Access, versioning, Object Lock (WORM), lifecycle, chiffrement SSE-KMS</td></tr>
<tr><td>EBS</td><td>Bloc, une AZ</td><td>Attaché à une instance à la fois (sauf multi-attach io2). Snapshots incrémentaux dans S3</td></tr>
<tr><td>EFS</td><td>NFS partagé multi-AZ</td><td>Plus lent et plus cher, mais ReadWriteMany</td></tr>
</table>
<p>Classes S3 : Standard → Standard-IA / One Zone-IA → Intelligent-Tiering → Glacier Instant / Flexible / Deep Archive. Critère : fréquence d'accès et délai de restitution acceptable.</p>

<h3>Bases et messagerie</h3>
<ul>
<li><b>RDS</b> : Multi-AZ = <b>haute disponibilité</b> (réplique synchrone en standby, bascule automatique, pas de lecture). Read Replica = <b>montée en charge en lecture</b> (asynchrone). Ne pas confondre — question fréquente.</li>
<li><b>Aurora</b> : stockage distribué sur 3 AZ, 6 copies, bascule plus rapide, réplicas en lecture jusqu'à 15.</li>
<li><b>DynamoDB</b> : clé de partition + clé de tri, latence constante à toute échelle, mais le modèle d'accès doit être connu à l'avance.</li>
<li><b>SQS</b> (file, pull, un consommateur par message) vs <b>SNS</b> (pub/sub, push). <b>Fan-out</b> = SNS vers plusieurs SQS. Toujours une <b>DLQ</b> avec alerte sur sa profondeur.</li>
</ul>

<h3>Observabilité et gouvernance</h3>
<table>
<tr><th>Service</th><th>Répond à</th></tr>
<tr><td>CloudTrail</td><td>Qui a fait quel appel API, quand, depuis où (audit)</td></tr>
<tr><td>CloudWatch</td><td>Métriques, logs, alarmes (santé, performance)</td></tr>
<tr><td>AWS Config</td><td>État et historique de CONFIGURATION, règles de conformité, remédiation</td></tr>
<tr><td>GuardDuty / Security Hub</td><td>Détection de menaces / agrégation de la posture</td></tr>
<tr><td>X-Ray</td><td>Tracing distribué</td></tr>
</table>

<h3>Multi-compte</h3>
<p>AWS Organizations avec des OU par usage (Sécurité, Infrastructure, Prod, Non-Prod, Sandbox), <b>un compte par application × environnement</b>. Comptes centraux : Log Archive (bucket immuable, Object Lock), Security/Audit, Network. SCP interdisant de désactiver CloudTrail/GuardDuty. Control Tower ou Landing Zone Accelerator pour industrialiser. Bénéfices : isolation du rayon d'impact, quotas séparés, facturation par équipe.</p>

<h3>Architecture web 3-tiers de référence</h3>
<pre><code>Route 53
  → CloudFront (+ WAF, cache statique)
    → ALB (subnets publics, 2-3 AZ)
      → ASG / ECS / EKS (subnets privés)
        → RDS Multi-AZ (subnets base de données) + read replicas
Sortie : NAT Gateway par AZ
Secrets : Secrets Manager | Statique : S3
Observabilité : CloudWatch + alarmes | Tout en IaC</code></pre>

<h3>Optimisation des coûts (par impact)</h3>
<ol>
<li>Rightsizing — les instances sont surdimensionnées par défaut.</li>
<li>Savings Plans / Reserved sur la base stable.</li>
<li>Extinction planifiée du hors-production (nuits + week-ends ≈ −65 %).</li>
<li>Spot pour le tolérant aux interruptions.</li>
<li>Lifecycle S3, suppression des snapshots et volumes EBS orphelins.</li>
<li>Transfert de données : inter-AZ inutile, NAT Gateway au Go, CloudFront.</li>
<li>Rétention CloudWatch Logs (par défaut : infinie).</li>
</ol>
<p>Prérequis à tout : <b>tagging obligatoire</b> imposé par SCP/Config, sinon on ne peut rien attribuer.</p>
`
}]);
