# AZ-305 - Questions avancees

34 questions **plus difficiles** que `questions.md` : plusieurs exigences simultanees, calculs de SLA, pieges de conception.
A faire **apres** [approfondissement.md](approfondissement.md). Dans l'examen, **chaque exigence elimine des options** : repérez-les toutes.

Plan : A. Identite/gouvernance (Q1-7) · B. Donnees (Q8-14) · C. Continuite et calculs (Q15-22) · D. Reseau (Q23-28) · E. Calcul/applications/migration (Q29-34)

---

## A. Identite, gouvernance et supervision

### Q1
Exigences : (1) les administrateurs activent leurs droits **a la demande**, (2) **approbation** par un responsable, (3) **MFA** a l'activation, (4) **revue trimestrielle** des affectations. Quelle combinaison ?

- A. Conditional Access seul
- B. **PIM** (roles eligibles, approbation, MFA) + **Access reviews**
- C. Azure Policy
- D. Groupes de securite statiques

<details><summary>Reponse</summary>

**B.** PIM couvre JIT, approbation et MFA ; les access reviews couvrent la revue periodique.
</details>

### Q2
Une application web sur **App Service** doit lire un secret Key Vault. Exigences : **aucun secret** dans la config, droits **minimaux**, secret **rotatif**. Quelle conception ?

- A. Service principal + secret client dans les parametres de l'application
- B. **Managed identity** de l'App Service + role RBAC **Key Vault Secrets User** sur le secret/coffre + reference Key Vault
- C. Cle d'acces du compte de stockage
- D. Access policy donnant "All" a l'application

<details><summary>Reponse</summary>

**B.** Pas de secret a gerer, moindre privilege (Secrets User = lecture seule), rotation geree dans Key Vault.
</details>

### Q3
Exigences : appliquer la meme baseline a **tous les abonnements presents et futurs**, **bloquer** les regions non autorisees, **activer automatiquement** les parametres de diagnostic vers Log Analytics. Quelle solution ?

- A. Policy `Deny` (regions) et `DeployIfNotExists` (diagnostics), assignees au **management group racine de la landing zone**, avec **identite manage** et remediation
- B. Un script PowerShell hebdomadaire
- C. RBAC Reader
- D. Tags

<details><summary>Reponse</summary>

**A.** Heritage vers les abonnements futurs ; `DeployIfNotExists` demande une managed identity avec droits suffisants et des remediation tasks pour l'existant.
</details>

### Q4
Un utilisateur **Owner** d'un abonnement ne peut pas creer une VM en `eastus`. Cause la plus probable ?

- A. Role insuffisant
- B. Une **Azure Policy Deny (Allowed locations)** heritee depuis un management group
- C. Quota ARM
- D. Probleme de licence

<details><summary>Reponse</summary>

**B.** Policy s'applique independamment de RBAC : meme un Owner est bloque.
</details>

### Q5
Une entreprise rachete une societe avec son propre **tenant**. Exigence : les employes de la filiale accedent a des applications du tenant principal **sans comptes dupliques**, et l'IT principale **gere des abonnements de la filiale** sans y creer de comptes. Que choisir ? *(choisir 2)*

- A. **Entra B2B** (ou cross-tenant access / synchronisation inter-tenants)
- B. **Azure Lighthouse** pour la gestion deleguee des abonnements
- C. Fusion immediate des tenants
- D. Partage de mots de passe

<details><summary>Reponse</summary>

**A et B.** B2B/cross-tenant pour l'acces applicatif ; Lighthouse pour la gestion deleguee sans comptes invites.
</details>

### Q6
Pour reduire le cout de **Log Analytics** tout en conservant 7 ans de logs d'audit consultables rarement : quelle conception ?

- A. Garder 7 ans en retention interactive Analytics
- B. Retention interactive courte (ex. 90 j) + **archivage long terme** (archive/Auxiliary) ; filtrer a la source avec **DCR** ; tables **Basic** pour logs verbeux
- C. Supprimer les logs
- D. Les stocker sur disque VM

<details><summary>Reponse</summary>

**B.** Combinaison de niveaux de tables, archive et filtrage a la source.
</details>

### Q7
Politiques de Conditional Access : un compte **break-glass** est necessaire. Quelle est la meilleure pratique ?

- A. Utiliser un compte nominatif d'administrateur
- B. Deux comptes **cloud-only**, mots de passe longs hors ligne, **exclus de la CA habituelle** ou proteges par MFA resistant au phishing dedie, avec **alertes de connexion**
- C. Aucun compte d'urgence
- D. Un compte partage avec MFA SMS

<details><summary>Reponse</summary>

**B.** Evite le verrouillage total du tenant en cas de panne MFA/CA, avec surveillance forte.
</details>

---

## B. Donnees

### Q8
Une application utilise SQL Server avec **SQL Agent**, des **requetes entre 12 bases**, et doit etre migree avec **le minimum de changements** vers un service **PaaS**. En outre elle doit pouvoir etre reliee en **reseau prive** au on-prem. Que choisir ?

- A. Azure SQL Database (base unique)
- B. **SQL Managed Instance** dans un VNet (acces prive)
- C. Pool elastique
- D. Cosmos DB

<details><summary>Reponse</summary>

**B.** MI offre SQL Agent et requetes inter-bases, deployee dans un VNet.
</details>

### Q9
Une base Azure SQL de **60 To** doit offrir des **restaurations rapides** et des **replicas de lecture**. Quel niveau ?

- A. General Purpose
- B. Business Critical (4 To max)
- C. **Hyperscale**
- D. DTU Standard

<details><summary>Reponse</summary>

**C.** Hyperscale : tres grandes bases, instantanes, replicas nommes.
</details>

### Q10
Cosmos DB : application mondiale avec ecritures dans 3 regions (**multi-region writes**). Un architecte propose le niveau de coherence **Strong**. Pourquoi est-ce problematique ?

- A. Aucun probleme
- B. **Strong n'est pas supporte avec les ecritures multi-regions** (et couterait en latence) ; choisir Session/Bounded staleness/Eventual
- C. Strong est moins couteux
- D. Strong supprime la replication

<details><summary>Reponse</summary>

**B.** Strong exige une ecriture synchrone coordonnee ; incompatible avec multi-write.
</details>

### Q11
Une collection Cosmos DB contient `{ "tenantId": ..., "orderId": ... }`. 95 % du trafic vient d'un seul tenant. Quelle partition key evite un point chaud ?

- A. `tenantId` seul
- B. **Une cle composite/synthetique** (`tenantId + orderId` ou hierarchical partition key)
- C. Une constante
- D. `country`

<details><summary>Reponse</summary>

**B.** `tenantId` seul concentrerait 95 % de la charge sur une partition. Cles hierarchiques ou synthetiques distribuent.
</details>

### Q12
Compte de stockage : exigences **(1)** survivre a la perte d'une zone, **(2)** survivre a la perte de la region, **(3)** lecture de la region secondaire **meme sans failover**, **(4)** cout aussi bas que possible. Quelle option ?

- A. LRS
- B. GRS
- C. **RA-GZRS** — mais si (1) n'etait pas exige, **RA-GRS** serait moins cher
- D. ZRS

<details><summary>Reponse</summary>

**C.** (1)+(2)+(3) => RA-GZRS. L'exigence (4) ne contredit pas : on choisit le moins cher qui **satisfait toutes** les autres.
</details>

### Q13
Des fichiers tres volumineux (HPC, Oracle) exigent **NFS** a **tres haute performance et faible latence**, avec choix du niveau de service. Quel service ?

- A. Azure Files Standard
- B. Blob Hot
- C. **Azure NetApp Files**
- D. Table Storage

<details><summary>Reponse</summary>

**C.** NetApp Files (niveaux Standard/Premium/Ultra) pour HPC/SAP/Oracle.
</details>

### Q14
Des evenements de capteurs (1,5 M/s) doivent etre stockes pour l'analyse **sans code**, tout en alimentant des alertes temps reel. Quelle architecture ?

- A. Service Bus -> SQL
- B. **Event Hubs** avec **Capture** vers ADLS Gen2 (cold path) + **Stream Analytics** (hot path)
- C. Storage Queue
- D. Event Grid

<details><summary>Reponse</summary>

**B.** Event Hubs gere le debit ; Capture archive sans code ; Stream Analytics pour le temps reel.
</details>

---

## C. Continuite et calculs

### Q15
Calculez le SLA composite : Front Door (99,99 %) -> App Service (99,95 %) -> Azure SQL (99,99 %), en serie.

- A. 99,99 %
- B. 99,95 %
- C. **~99,93 %**
- D. 99,90 %

<details><summary>Reponse</summary>

**C.** `0,9999 x 0,9995 x 0,9999 = 0,99930...` => 99,93 %.
</details>

### Q16
Deux regions actives, chacune avec un SLA applicatif de 99,9 %. Sans compter le routage, quel est le SLA combine ?

- A. 99,9 %
- B. 99,99 %
- C. **99,9999 %**
- D. 100 %

<details><summary>Reponse</summary>

**C.** `1 - (0,001 x 0,001) = 1 - 0,000001 = 99,9999 %`. En pratique, le routeur global en serie (ex. 99,99 %) devient le **plafond**.
</details>

### Q17
Meme architecture que Q16 avec **Traffic Manager (99,99 %)** en serie devant les deux regions. SLA global approximatif ?

- A. 99,9999 %
- B. **~99,99 %**
- C. 99,9 %
- D. 99,5 %

<details><summary>Reponse</summary>

**B.** `0,9999 x 0,999999 ~ 0,999899`, soit ~99,99 %. Le composant commun limite l'ensemble.
</details>

### Q18
Un SLA de **99,95 %** correspond a quelle indisponibilite maximale **par mois** (30 jours) ?

- A. 4,3 minutes
- B. **~21,6 minutes**
- C. 43,2 minutes
- D. 2,16 heures

<details><summary>Reponse</summary>

**B.** `0,0005 x 43 200 min = 21,6 min`.
</details>

### Q19
Exigences DR : **RTO 1 h**, **RPO 5 min**, VM IaaS legacy, regions Azure differentes, **tests de reprise sans impact**. Solution ?

- A. Azure Backup
- B. **Azure Site Recovery** avec plan de reprise et tests de failover
- C. Snapshots manuels
- D. Reinstaller

<details><summary>Reponse</summary>

**B.** Replication continue (RPO ~ minute) et tests de failover isoles. Backup n'atteint pas ce RPO/RTO.
</details>

### Q20
Une equipe sauvegarde ses VM dans un coffre du **meme abonnement** que la production. Un attaquant obtient les droits Owner de l'abonnement et supprime coffre et VM. Quelle conception aurait limite l'impact ? *(choisir 2)*

- A. **Coffre immuable + soft delete + MUA (Resource Guard)** dans un **abonnement distinct** gere par une autre equipe
- B. Stocker les sauvegardes en LRS
- C. Garder le meme abonnement pour simplicite
- D. **Cross-Region Restore** avec GRS pour la resilience regionale

<details><summary>Reponse</summary>

**A et D.** A protege contre la suppression malveillante (separation de responsabilites + immuabilite) ; D ajoute la resilience regionale. B reduit la protection, C est la cause du probleme.
</details>

### Q21
Une application dans un seul datacenter Azure (availability set) doit survivre a la **perte du datacenter**. Quelle modification **minimale** ?

- A. Ajouter des VM dans l'availability set
- B. **Repartir les VM sur des zones de disponibilite** (zone-redundant) + services zone-redundant
- C. Passer en LRS
- D. Ajouter un NSG

<details><summary>Reponse</summary>

**B.** Un availability set est limite a un datacenter. Les zones protegent d'une panne de datacenter.
</details>

### Q22
Quelle strategie DR minimise le **cout** pour une application dont l'indisponibilite acceptable est de **24 h** et la perte de donnees de **12 h** ?

- A. Actif-actif multi-region
- B. Warm standby
- C. **Sauvegarde/restauration vers une autre region** (GRS + cross-region restore)
- D. Pilot light avec replicas

<details><summary>Reponse</summary>

**C.** RTO/RPO larges : le plus economique suffit.
</details>

---

## D. Reseau

### Q23
Exigences : acces prive a un compte de stockage **depuis un reseau on-prem via ExpressRoute**, **aucun acces public**, resolution DNS correcte. Que faut-il ? *(choisir 3)*

- A. **Private Endpoint** `blob`
- B. Zone **Private DNS** `privatelink.blob.core.windows.net` liee au VNet
- C. **DNS Private Resolver** (ou forwarders) pour resoudre cette zone depuis le on-prem
- D. Service Endpoint sur le sous-reseau
- E. Ouvrir le pare-feu du stockage a 0.0.0.0/0

<details><summary>Reponse</summary>

**A, B, C.** Le Private Endpoint donne l'IP privee ; la zone DNS prive resout le nom ; le Private Resolver permet au on-prem de resoudre la zone Azure. Les service endpoints ne sont pas accessibles depuis le on-prem.
</details>

### Q24
Un hub-spoke : le trafic spoke-a-spoke et vers Internet doit etre **inspecte** par Azure Firewall dans le hub. Que configurer ? *(choisir 2)*

- A. **UDR** `0.0.0.0/0` -> IP privee du pare-feu sur les sous-reseaux des spokes (et routes spoke-a-spoke)
- B. **Peering** avec `allow forwarded traffic` active
- C. Un NSG autorisant tout
- D. Service Endpoints

<details><summary>Reponse</summary>

**A et B.** Les UDR dirigent le trafic ; le peering doit autoriser le trafic transfere. Le peering seul n'est pas transitif.
</details>

### Q25
Une organisation a 200 sites, SD-WAN, VPN et ExpressRoute, et souhaite un **transit automatique** minimisant l'administration. Que choisir ?

- A. Hub-spoke manuel avec peerings
- B. **Azure Virtual WAN**
- C. Un VPN par site vers un seul VNet
- D. Traffic Manager

<details><summary>Reponse</summary>

**B.** Hub manage a grande echelle.
</details>

### Q26
Une application HTTPS regionale necessite **routage par chemin (/api, /web)**, **terminaison TLS** et **WAF**. Quel service ?

- A. Azure Load Balancer
- B. Traffic Manager
- C. **Application Gateway (WAF v2)**
- D. NAT Gateway

<details><summary>Reponse</summary>

**C.** L7 regional avec WAF. Pour du global : Front Door.
</details>

### Q27
Des VM sortent massivement vers Internet et subissent des erreurs de **SNAT port exhaustion**. Solution ?

- A. Ajouter des NSG
- B. **NAT Gateway** associee au sous-reseau (IP publiques dediees)
- C. Reduire la taille des VM
- D. Activer Bastion

<details><summary>Reponse</summary>

**B.** NAT Gateway fournit un SNAT evolutif et previsible.
</details>

### Q28
Vous exposez **votre propre service** (derriere un Standard Load Balancer) a des **clients dans d'autres tenants/VNets**, en prive, sans peering. Quelle fonction ?

- A. VNet peering
- B. **Private Link Service** (le client cree un Private Endpoint)
- C. VPN point-a-site
- D. Service Endpoint

<details><summary>Reponse</summary>

**B.** Private Link Service expose un service a d'autres consommateurs via Private Endpoint.
</details>

---

## E. Calcul, applications et migration

### Q29
Microservices HTTP, **scale-to-zero**, equipe sans competences Kubernetes, besoin de **Dapr**. Quel service ?

- A. AKS
- B. VM Scale Sets
- C. **Azure Container Apps**
- D. Azure Batch

<details><summary>Reponse</summary>

**C.** Container Apps integre KEDA et Dapr sans gerer K8s.
</details>

### Q30
Une fonction doit s'executer **toute l'annee avec zero cold start**, acceder a des ressources **dans un VNet** et gerer des traitements longs. Quel plan ?

- A. Consumption
- B. **Premium** (ou Dedicated avec Always On)
- C. Logic Apps Consumption
- D. Container Instances

<details><summary>Reponse</summary>

**B.** Instances pre-chauffees, integration VNet, durees longues.
</details>

### Q31
Messages de commandes : **ordre par client (FIFO)**, **transactions**, **dead-letter**, plusieurs applications abonnees avec **filtres** differents. Quel service ?

- A. Storage Queue
- B. Event Grid
- C. **Service Bus Topics** (sessions)
- D. Event Hubs

<details><summary>Reponse</summary>

**C.** Topics/abonnements avec filtres + sessions FIFO + DLQ + transactions.
</details>

### Q32
Pour migrer 800 serveurs, vous devez d'abord obtenir **dimensionnement, readiness et estimation de cout** avec **dependances applicatives**. Quelle approche ?

- A. Migrer tout en rehost sans analyse
- B. **Azure Migrate** (appliance de decouverte + analyse de dependances + evaluation) puis vagues
- C. Excel manuel
- D. Data Box

<details><summary>Reponse</summary>

**B.** Decouverte + dependances + evaluation sont le point de depart.
</details>

### Q33
Charge de calcul **stable pendant 3 ans** mais dont la **taille des VM et les regions pourraient changer**. Quelle option de cout ?

- A. Spot
- B. Reservation 3 ans sur une taille precise
- C. **Savings Plan for compute** (3 ans)
- D. Pay-as-you-go

<details><summary>Reponse</summary>

**C.** Flexibilite (taille/region/service) pour un engagement de depense ; la reservation serait plus rigide.
</details>

### Q34 *(etude de cas)*
**Contexte** : une chaine de magasins veut moderniser son site e-commerce (.NET, SQL Server). Exigences : SLA 99,95 %, **aucun acces public** a la base, **WAF**, mondialisation (Europe + Amerique du Nord), **moins d'exploitation**, sauvegardes 35 jours.

Quelle architecture est la plus appropriee ?

- A. VM IIS + SQL Server sur VM dans une region
- B. **Front Door (WAF) -> App Service (zone-redundant, 2 regions) -> Azure SQL Database (zone-redundant + Auto-failover group) via Private Endpoint ; Redis pour le cache ; sauvegardes PITR 35 j ; Application Insights**
- C. AKS + Cosmos DB
- D. Container Instances + Table Storage

<details><summary>Reponse</summary>

**B.** PaaS partout (moins d'exploitation), WAF global, HA par zones, DR par FG, acces prive via Private Endpoint, PITR jusqu'a 35 j. AKS/Cosmos (C) changerait la technologie sans besoin ; IaaS (A) augmente l'exploitation.
</details>

---

## Correction globale

| Score (/34) | Niveau |
|-------------|--------|
| 31-34 | Excellent : pret pour AZ-305 |
| 25-30 | Bon : revoir la section de l'approfondissement correspondant aux erreurs |
| < 25 | Reprendre approfondissement.md et les tableaux de decision du cours |

**Methode** : pour chaque erreur, ecrivez la **phrase de l'enonce qui designait la bonne reponse** (ex. "meme depuis le on-prem" => Private Endpoint, pas Service Endpoint). C'est le meilleur entrainement au style de l'examen.
