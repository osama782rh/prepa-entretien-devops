window.FICHES = (window.FICHES || []).concat([{
id:"azure",
titre:"Azure",
lead:"Le cloud dominant en banque française. Identité, réseau privé et gouvernance sont les trois axes attendus.",
html:`
<h3>Hiérarchie et gouvernance</h3>
<p><b>Management Group → Subscription → Resource Group → Ressource.</b> RBAC et Policy s'héritent du haut vers le bas.</p>
<ul>
<li><b>Resource Group</b> : conteneur logique, une ressource appartient à exactement un RG. Supprimer le RG supprime tout.</li>
<li><b>Resource Lock</b> : <code>CanNotDelete</code> ou <code>ReadOnly</code>, hérité — protège la prod (et casse parfois Terraform : c'est voulu).</li>
<li><b>Tags</b> : imposés par Azure Policy, indispensables pour la refacturation.</li>
</ul>

<h3>Identité : Entra ID vs RBAC</h3>
<table>
<tr><th></th><th>Entra ID (ex-Azure AD)</th><th>Azure RBAC</th></tr>
<tr><td>Gère</td><td>L'annuaire : identités, groupes, applications, rôles d'annuaire</td><td>Les droits sur les RESSOURCES Azure</td></tr>
<tr><td>Exemple de rôle</td><td>Global Administrator, User Administrator</td><td>Owner, Contributor, Reader, rôles custom</td></tr>
</table>
<div class="box piege">Un <b>Global Administrator n'a par défaut AUCUN droit sur les ressources</b> : ce sont deux plans distincts. Il doit activer « Elevate access » pour devenir User Access Administrator à la racine. Question de niveau senior qui piège beaucoup de monde.</div>
<p><b>Rôles clés</b> : Owner (tout + attribuer des droits), Contributor (tout <b>sauf</b> attribuer des droits), Reader, User Access Administrator. Assigner au niveau le plus élevé pertinent, à des <b>groupes</b>, jamais à des personnes.</p>

<h3>Identités applicatives</h3>
<table>
<tr><th></th><th>Service Principal</th><th>Managed Identity</th></tr>
<tr><td>Secret</td><td>À gérer, stocker, faire tourner, expire</td><td>Aucun — géré par Azure (token via IMDS)</td></tr>
<tr><td>Usage</td><td>Hors Azure (CI externe, on-premise)</td><td>Ressource dans Azure — <b>toujours à préférer</b></td></tr>
</table>
<p><b>System-assigned</b> : liée au cycle de vie de la ressource (1:1, supprimée avec elle). <b>User-assigned</b> : objet indépendant, réutilisable, permet d'assigner les droits RBAC AVANT de créer la ressource — ce qui règle le problème poule/œuf en Terraform.</p>
<p><b>PIM</b> (Privileged Identity Management) : élévation juste-à-temps avec approbation, justification et expiration. C'est LA réponse attendue sur « comment gérez-vous les accès admin en production ».</p>

<h3>Réseau</h3>
<ul>
<li><b>VNet</b> + subnets. <b>Peering</b> non transitif (d'où le hub-and-spoke).</li>
<li><b>NSG</b> : filtre L3/L4 (5-tuple, service tags, ASG), attaché à un subnet ou une NIC. Gratuit. Règles par priorité.</li>
<li><b>Azure Firewall</b> : service managé centralisé, règles applicatives par <b>FQDN</b>, threat intelligence, DNAT/SNAT, logs complets. Placé dans le hub.</li>
<li><b>UDR (route table)</b> : surcharge le routage système. Cas classique : <code>0.0.0.0/0</code> → IP privée du firewall (next hop = Virtual Appliance) pour forcer l'inspection.</li>
<li><b>Application Gateway</b> (L7 + WAF) vs <b>Load Balancer</b> (L4) vs <b>Front Door</b> (global, CDN + WAF).</li>
</ul>

<h3>Private Endpoint — la question qui revient</h3>
<p>Il donne une <b>IP privée dans ton VNet</b> à un service PaaS (Storage, SQL, Key Vault) : le trafic ne passe plus par internet, et on désactive <code>publicNetworkAccess</code>.</p>
<div class="box piege"><b>Le piège DNS</b> : le FQDN public (<code>monstorage.blob.core.windows.net</code>) doit désormais résoudre vers l'IP privée. Il faut une <b>Private DNS Zone</b> (<code>privatelink.blob.core.windows.net</code>) liée au VNet, avec un enregistrement A. Sans elle, on retombe sur l'IP publique et ça échoue. Pour une App Service, il faut en plus la VNet Integration et <code>vnetRouteAllEnabled</code>.</p>
<p>Différence avec <b>Service Endpoint</b> : celui-ci garde l'IP publique mais route par le backbone Azure et permet de filtrer par subnet. Le Private Endpoint est plus fort (IP privée, accessible depuis l'on-premise via ExpressRoute).</div>

<h3>Topologie hub-and-spoke</h3>
<pre><code>Hub : Azure Firewall + VPN/ExpressRoute Gateway + Bastion + Private DNS
  ↕ peering
Spoke prod / Spoke rec / Spoke dev  (une app ou une équipe par spoke)
UDR dans chaque spoke : 0.0.0.0/0 → IP privée du firewall</code></pre>
<p>Les spokes ne se parlent pas directement : tout transite par le hub pour inspection. C'est le modèle standard des landing zones bancaires.</p>

<h3>Compute — comment choisir</h3>
<table>
<tr><th>Service</th><th>Quand</th></tr>
<tr><td><b>App Service</b></td><td>Application web classique, peu d'ops, slots de déploiement. Le défaut raisonnable</td></tr>
<tr><td><b>Container Apps</b></td><td>Microservices conteneurisés, scale-to-zero, KEDA, Dapr, sans gérer de cluster</td></tr>
<tr><td><b>AKS</b></td><td>Besoin de contrôle fin (opérateurs, CRD, mesh, multi-tenant) ET une équipe capable d'opérer</td></tr>
<tr><td><b>Functions</b></td><td>Événementiel, court, sporadique</td></tr>
<tr><td><b>VM / VMSS</b></td><td>Legacy, logiciel tiers, contraintes d'OS</td></tr>
</table>
<p><b>Deployment slots</b> : instance parallèle pour déployer, chauffer et tester, puis swap quasi instantané avec retour arrière possible. <b>Piège</b> : par défaut les app settings SUIVENT le swap — il faut cocher « deployment slot setting » (sticky) sur ce qui est spécifique à l'environnement.</p>

<h3>Stockage et données</h3>
<ul>
<li><b>Storage Account</b> : Blob (objet), File (SMB/NFS), Queue, Table. Redondance : <b>LRS</b> (3 copies, 1 datacenter) → <b>ZRS</b> (3 zones) → <b>GRS</b> (+ région appairée, asynchrone) → <b>GZRS</b>. Variantes RA-* pour lire le secondaire.</li>
<li><b>Azure SQL</b> : DTU vs vCore, Business Critical (réplicas locaux, latence faible) vs General Purpose. Failover groups pour le DR. Auth par Entra ID plutôt que login SQL, TDE par défaut.</li>
<li><b>Cosmos DB</b> : multi-modèle, distribution globale, <b>5 niveaux de cohérence</b> (strong, bounded staleness, session, consistent prefix, eventual) — la question piège est de savoir que « session » est le défaut et un bon compromis.</li>
<li><b>Key Vault</b> : secrets, clés, certificats. Accès par RBAC (ou access policies sur les coffres anciens). <b>Soft delete + purge protection</b> : le nom reste réservé après suppression → recréer le même coffre échoue tant que la rétention court (piège en environnement éphémère).</li>
</ul>

<h3>Gouvernance : Azure Policy</h3>
<table>
<tr><th>Effet</th><th>Usage</th></tr>
<tr><td><code>Deny</code></td><td>Bloquer la création non conforme (région interdite, IP publique, absence de tag)</td></tr>
<tr><td><code>Audit</code></td><td>Constater sans bloquer — pour mesurer avant d'imposer</td></tr>
<tr><td><code>DeployIfNotExists</code></td><td>Déployer automatiquement le manquant (diagnostic settings, agent)</td></tr>
<tr><td><code>Modify</code></td><td>Ajouter ou corriger des propriétés (tags)</td></tr>
</table>
<p><b>Policy ≠ RBAC</b> : le RBAC dit QUI peut agir, la Policy dit CE QUI peut exister. Un Owner reste bloqué par un Deny. Assigner les initiatives au niveau <b>management group</b> pour couvrir les subscriptions futures ; les exceptions passent par une <b>exemption datée</b>, jamais par une désactivation.</p>

<h3>Observabilité</h3>
<p><b>Azure Monitor</b> + <b>Log Analytics workspace</b> (centralise via les diagnostic settings de chaque ressource), <b>Application Insights</b> (APM, traces distribuées), <b>Container Insights</b> pour AKS. Langage de requête : <b>KQL</b>.</p>
<pre><code>AzureDiagnostics
| where TimeGenerated > ago(1h)
| where ResourceType == "APPLICATIONGATEWAYS"
| summarize count() by httpStatus_d, bin(TimeGenerated, 5m)
| order by TimeGenerated desc</code></pre>

<h3>Landing zone</h3>
<p>Le socle déployé avant toute application : hiérarchie de management groups, subscriptions par usage (identité, connectivité, management, landing zones prod/non-prod), initiatives Policy, RBAC + PIM, réseau hub-and-spoke, DNS privé, journalisation centralisée, sauvegarde et DR — le tout en IaC (Terraform CAF/ALZ ou Bicep). C'est le vocabulaire attendu chez un grand compte.</p>
`
}]);
