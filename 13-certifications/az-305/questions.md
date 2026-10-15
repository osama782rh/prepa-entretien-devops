# Questions d'entrainement - AZ-305

40 questions de type examen (scenarios de conception), par domaine, plus 2 mini etudes de cas.
Cliquez sur "Reponse" pour afficher la correction.

> Methode : soulignez les **contraintes** (cout, effort d'administration, disponibilite, conformite, hybride),
> eliminez les options qui en violent une, puis choisissez le service **manage le plus simple**.

---

## Domaine 1 - Identite, gouvernance et supervision

### Q1
Des employes d'un partenaire doivent acceder a votre application d'entreprise avec **leurs propres identifiants** d'entreprise, sans que vous creiez de comptes avec mot de passe. Quelle solution ?

- A. Creer des comptes locaux dans votre tenant
- B. **Microsoft Entra B2B** (utilisateurs invites)
- C. Entra Domain Services
- D. Azure AD Connect

<details><summary>Reponse</summary>

**B.** B2B invite des utilisateurs externes qui s'authentifient aupres de leur propre fournisseur d'identite.
</details>

### Q2
Vous lancez une application grand public. Les clients doivent s'inscrire avec Google, Facebook ou un email, avec des parcours d'inscription personnalises. Quelle solution ?

- A. Entra B2B
- B. Entra Connect Sync
- C. **Entra External ID (Azure AD B2C)**
- D. Entra Domain Services

<details><summary>Reponse</summary>

**C.** Le service d'identites clients (CIAM) gere inscription, connexion sociale et flux personnalises. B2B est pour les partenaires.
</details>

### Q3
Les administrateurs ne doivent avoir des droits Contributor sur la production que **pendant 2 heures, apres approbation et justification**. Quelle fonction ?

- A. Conditional Access
- B. Access reviews
- C. **Privileged Identity Management (PIM)**
- D. Azure Policy

<details><summary>Reponse</summary>

**C.** PIM fournit l'activation juste-a-temps des roles *eligibles* avec approbation, justification, duree limitee et audit.
</details>

### Q4
Une application sur une VM Azure doit lire des secrets dans Key Vault **sans stocker d'identifiants**. Trois autres VM identiques auront les memes droits. Que concevez-vous ?

- A. Un service principal avec secret stocke dans un fichier de config
- B. Une **managed identity user-assigned** partagee par les 4 VM
- C. Une cle d'acces de compte de stockage
- D. Des identifiants utilisateur d'un administrateur

<details><summary>Reponse</summary>

**B.** Une identite user-assigned est partageable entre plusieurs ressources (une seule attribution RBAC a gerer). System-assigned conviendrait a une seule ressource.
</details>

### Q5
Vous synchronisez Active Directory on-premise avec Entra ID. Exigences : **haute disponibilite de l'authentification meme si le on-prem est hors ligne**, deploiement minimal. Quelle methode ?

- A. Federation AD FS
- B. Pass-through Authentication
- C. **Password Hash Synchronization** (+ Seamless SSO)
- D. Authentification locale uniquement

<details><summary>Reponse</summary>

**C.** PHS ne depend pas du on-prem au moment de la connexion. PTA et AD FS dependent d'agents/serveurs on-prem disponibles.
</details>

### Q6
Une entreprise utilise des **cartes a puce** et un fournisseur MFA tiers existant avec AD FS pour l'authentification. Que choisir pour l'identite hybride ?

- A. Password Hash Sync
- B. **Federation avec AD FS**
- C. Pass-through Authentication
- D. Cloud-only

<details><summary>Reponse</summary>

**B.** La federation permet de conserver ces exigences specifiques (cartes a puce, MFA tiers), au prix d'une infrastructure plus lourde.
</details>

### Q7
Vous devez exiger le **MFA** pour tout acces depuis l'exterieur du reseau d'entreprise a Microsoft 365. Quelle solution ?

- A. NSG
- B. Azure Firewall
- C. **Conditional Access**
- D. Azure Policy

<details><summary>Reponse</summary>

**C.** Conditional Access evalue les signaux (emplacement, appareil, risque) et applique des controles comme le MFA.
</details>

### Q8
Chaque trimestre, les proprietaires de ressources doivent **confirmer que les membres de groupes privilegies ont encore besoin d'acces**. Quelle fonction ?

- A. PIM alerts
- B. **Access reviews** (Entra ID Governance)
- C. Azure Monitor
- D. Resource Graph

<details><summary>Reponse</summary>

**B.** Les access reviews automatisent les revues periodiques et retirent les acces non confirmes.
</details>

### Q9
Vous devez stocker des cles de chiffrement dans un **HSM dedie, mono-locataire, FIPS 140-3 Level 3**, avec controle total du domaine de securite. Quel service ?

- A. Key Vault Standard
- B. Key Vault Premium
- C. **Azure Key Vault Managed HSM**
- D. Un compte de stockage chiffre

<details><summary>Reponse</summary>

**C.** Managed HSM est un service HSM mono-locataire hautement disponible. Premium utilise des HSM multi-locataires.
</details>

### Q10
Toutes les ressources de tous les abonnements doivent etre deployees **uniquement en France Central et West Europe**, et un tag `CostCenter` doit etre ajoute automatiquement s'il manque. Que concevoir ?

- A. Role RBAC personnalise
- B. **Azure Policy** au niveau management group : *Allowed locations* (Deny) + *Modify* pour le tag
- C. Resource locks
- D. NSG

<details><summary>Reponse</summary>

**B.** Policy definit ce qui est autorise ; Deny pour les regions, Modify/Append pour les tags, avec heritage depuis le management group. RBAC ne controle que qui peut agir.
</details>

### Q11
Pour eviter la **suppression accidentelle** d'un groupe de ressources de production tout en permettant les modifications, que faites-vous ?

- A. Lock **ReadOnly**
- B. Lock **CanNotDelete**
- C. Retirer tous les droits
- D. Un tag "ne pas supprimer"

<details><summary>Reponse</summary>

**B.** CanNotDelete autorise lecture et modification mais interdit la suppression. ReadOnly bloquerait aussi les modifications.
</details>

### Q12
Vous gerez 40 abonnements et voulez appliquer les memes politiques et attributions RBAC a des groupes d'abonnements (Production, Non-production). Que concevoir ?

- A. Un abonnement unique
- B. **Une hierarchie de management groups**
- C. Un groupe de ressources par abonnement
- D. Des tags

<details><summary>Reponse</summary>

**B.** Les management groups heritent politiques et RBAC vers les abonnements, base de l'architecture Landing Zone.
</details>

### Q13
Plusieurs applications dans trois regions envoient leurs journaux. Exigence : correlation entre applications, administration simple, et **donnees des clients europeens qui doivent rester en Europe**. Quelle conception de Log Analytics ?

- A. Un workspace unique aux Etats-Unis
- B. Un workspace par application
- C. **Un workspace centralise par frontiere de residence des donnees (ex. un en Europe, un autre ailleurs)**
- D. Pas de workspace : stockage local

<details><summary>Reponse</summary>

**C.** On centralise au maximum (simplicite, correlation) mais on separe quand la residence des donnees l'exige.
</details>

### Q14
Vous voulez surveiller les performances d'une application web, tracer les dependances (SQL, API) et voir les exceptions avec une carte d'application. Quel service ?

- A. Network Watcher
- B. **Application Insights**
- C. Azure Advisor
- D. Service Health

<details><summary>Reponse</summary>

**B.** Application Insights est l'APM d'Azure Monitor (requetes, dependances, exceptions, application map).
</details>

---

## Domaine 2 - Stockage de donnees

### Q15
Un compte de stockage doit **survivre a la perte d'une zone ET d'une region entiere**, avec **acces en lecture** a la region secondaire. Quelle redondance ?

- A. LRS
- B. ZRS
- C. GRS
- D. **RA-GZRS**

<details><summary>Reponse</summary>

**D.** GZRS = ZRS en primaire + copie dans la region jumelee ; le prefixe RA ajoute la lecture secondaire.
</details>

### Q16
Des documents reglementaires doivent etre conserves 7 ans, **non modifiables et non supprimables**, au cout le plus bas possible. Que concevez-vous ?

- A. Blob Hot avec RBAC
- B. **Stockage immuable (time-based retention, WORM) + lifecycle vers le niveau Archive**
- C. Azure Files
- D. Disques manages

<details><summary>Reponse</summary>

**B.** L'immutabilite impose WORM ; le niveau Archive minimise le cout du stockage froid.
</details>

### Q17
Une application mondiale necessite des **ecritures locales dans plusieurs regions** avec des latences monocouche de ms et un schema JSON flexible. Quel service ?

- A. Azure SQL Database avec geo-replication
- B. **Azure Cosmos DB (API NoSQL) avec multi-region writes**
- C. Table Storage
- D. SQL Server sur VM

<details><summary>Reponse</summary>

**B.** Cosmos DB est distribue globalement, avec ecritures multi-regions et SLA de latence.
</details>

### Q18
Dans Cosmos DB, une application veut garantir qu'**un utilisateur lit toujours ses propres ecritures**, avec le meilleur compromis latence/coherence. Quel niveau ?

- A. Strong
- B. Eventual
- C. **Session**
- D. Consistent prefix

<details><summary>Reponse</summary>

**C.** Session (niveau par defaut) garantit "read your writes" dans une session, avec de bonnes performances.
</details>

### Q19
Vous migrez une base SQL Server on-prem qui utilise **SQL Agent, des requetes entre bases et le CLR**. Vous voulez un service **PaaS** avec le **minimum de changements**. Quelle cible ?

- A. Azure SQL Database (base unique)
- B. **Azure SQL Managed Instance**
- C. Cosmos DB
- D. PostgreSQL Flexible Server

<details><summary>Reponse</summary>

**B.** SQL MI offre une compatibilite quasi totale avec SQL Server en PaaS. SQL Database ne supporte pas SQL Agent ni les requetes inter-bases classiques.
</details>

### Q20
Une application interne utilise une base SQL **quelques heures par jour de maniere imprevisible**, et le cout doit etre minimal quand elle est inactive. Quelle option ?

- A. Business Critical provisionne
- B. **Azure SQL Database serverless (pause automatique)**
- C. SQL Server sur VM
- D. Hyperscale avec replicas

<details><summary>Reponse</summary>

**B.** Serverless adapte les vCores et met en pause en inactivite (facturation du stockage seulement).
</details>

### Q21
Un editeur SaaS heberge 300 bases clients dont les pics de charge ne coincident pas. Comment **optimiser le cout** ?

- A. Une base provisionnee au maximum pour chaque client
- B. **Un pool elastique Azure SQL**
- C. Une VM par client
- D. Cosmos DB uniquement

<details><summary>Reponse</summary>

**B.** Les pools elastiques mutualisent les ressources entre bases aux pics decales.
</details>

### Q22
Une base de **80 To** a croissance rapide necessite des sauvegardes rapides et une mise a l'echelle de la lecture. Quelle option Azure SQL ?

- A. General Purpose
- B. Business Critical
- C. **Hyperscale**
- D. DTU Basic

<details><summary>Reponse</summary>

**C.** Hyperscale supporte de tres grandes bases (~100 To), sauvegardes par instantanes et replicas de lecture nommes.
</details>

### Q23
Vous devez transferer **250 To** de donnees on-prem vers Azure, avec une connexion de 100 Mb/s. Quelle solution ?

- A. AzCopy sur Internet
- B. **Azure Data Box**
- C. Un VPN point-a-site
- D. Azure File Sync

<details><summary>Reponse</summary>

**B.** 250 To a 100 Mb/s prendrait plusieurs annees ; Data Box transfere par appareil physique.
</details>

### Q24
Vous concevez l'ingestion de **millions d'evenements par seconde** de telemetrie IoT pour traitement en temps reel. Quel service d'ingestion ?

- A. Storage Queue
- B. Service Bus
- C. **Event Hubs**
- D. Event Grid

<details><summary>Reponse</summary>

**C.** Event Hubs est concu pour l'ingestion de flux a tres haut debit (compatible Kafka).
</details>

### Q25
Des postes AVD utilisent des **profils FSLogix** et vous voulez des partages de fichiers manages **hautes performances SMB**. Quelle option ?

- A. Blob Storage
- B. **Azure Files Premium** (ou Azure NetApp Files)
- C. Table Storage
- D. Queue Storage

<details><summary>Reponse</summary>

**B.** Azure Files Premium/NetApp Files fournissent des partages SMB manages a faible latence adaptes a FSLogix.
</details>

---

## Domaine 3 - Continuite d'activite

### Q26
Une application web (App Service, SLA 99,95 %) utilise Azure SQL Database (SLA 99,99 %). Quel est le **SLA composite** approximatif ?

- A. 99,99 %
- B. 99,95 %
- C. **99,94 %**
- D. 99,999 %

<details><summary>Reponse</summary>

**C.** Composants en serie : 0,9995 x 0,9999 = 0,99940 -> 99,94 %. Le SLA composite est toujours inferieur au plus faible composant.
</details>

### Q27
Vous voulez proteger des VM contre la panne d'un **datacenter entier** dans une region, avec le meilleur SLA de VM. Que faites-vous ?

- A. Availability set
- B. VM unique Premium SSD
- C. **Deployer les VM sur plusieurs Availability Zones**
- D. Stockage LRS

<details><summary>Reponse</summary>

**C.** Les zones sont des datacenters physiquement separes (SLA 99,99 %). Un availability set protege seulement a l'interieur d'un datacenter (99,95 %).
</details>

### Q28
Vous devez assurer la **reprise apres sinistre de VM** vers une autre region avec un RPO tres faible et des tests de reprise sans impact en production. Quel service ?

- A. Azure Backup
- B. **Azure Site Recovery**
- C. Snapshots manuels
- D. Azure Migrate

<details><summary>Reponse</summary>

**B.** ASR replique en continu, propose des plans de reprise et des tests de failover isoles. Backup a un RPO bien plus eleve.
</details>

### Q29
Pour proteger les sauvegardes contre un **ransomware** avec un attaquant ayant obtenu des droits d'administrateur, quelles mesures sont les plus pertinentes ? *(choisir 2)*

- A. Desactiver le soft delete pour economiser
- B. **Coffre immuable (immutable vault)**
- C. **Multi-User Authorization avec Resource Guard** et soft delete
- D. Stocker les sauvegardes sur le meme disque que les donnees

<details><summary>Reponse</summary>

**B et C.** L'immuabilite empeche la modification/suppression des points de recuperation ; MUA exige une seconde autorisation pour les operations critiques.
</details>

### Q30
Une application web HTTP(S) est deployee dans **deux regions**. Elle necessite une bascule automatique, l'acceleration pour les utilisateurs mondiaux et un **WAF**. Quel service ?

- A. Azure Load Balancer
- B. Traffic Manager
- C. **Azure Front Door**
- D. Application Gateway (une seule region)

<details><summary>Reponse</summary>

**C.** Front Door est un L7 global avec WAF, acceleration et bascule multi-regions. Traffic Manager est DNS (sans WAF ni acceleration).
</details>

### Q31
Une application **non HTTP** (protocole TCP personnalise) est deployee dans deux regions et doit etre redirigee par basculement **DNS**. Quel service ?

- A. Front Door
- B. Application Gateway
- C. **Traffic Manager**
- D. WAF

<details><summary>Reponse</summary>

**C.** Traffic Manager fait du routage DNS pour n'importe quel protocole. Front Door et Application Gateway sont des services HTTP(S).
</details>

### Q32
Une base **Azure SQL Database** critique doit basculer automatiquement vers une autre region, avec une **chaine de connexion qui ne change pas** apres le failover pour un groupe de bases. Que concevez-vous ?

- A. Sauvegardes geo-redondantes uniquement
- B. **Auto-failover group**
- C. Restauration manuelle ponctuelle
- D. Elastic pool

<details><summary>Reponse</summary>

**B.** Un auto-failover group offre des endpoints de lecture/ecriture stables et un failover coordonne pour plusieurs bases.
</details>

---

## Domaine 4 - Infrastructure

### Q33
Vous deployez des **microservices conteneurises** et voulez eviter de gerer Kubernetes, avec **mise a l'echelle jusqu'a zero** et facturation a l'usage. Quel service ?

- A. AKS
- B. Virtual Machines
- C. **Azure Container Apps**
- D. Azure Batch

<details><summary>Reponse</summary>

**C.** Container Apps est un service de conteneurs serverless base sur Kubernetes (KEDA, Dapr) sans gestion du cluster, avec scale-to-zero.
</details>

### Q34
Des VM doivent acceder a un compte de stockage et une base SQL **uniquement via le reseau prive**, y compris depuis le on-prem par ExpressRoute, avec **acces public desactive**. Que concevoir ?

- A. Service endpoints
- B. **Private Endpoints + zones DNS privees**
- C. Regles de pare-feu IP publiques
- D. NSG uniquement

<details><summary>Reponse</summary>

**B.** Un Private Endpoint donne une IP privee accessible depuis le on-prem et permet de couper l'acces public. Les service endpoints ne sont pas accessibles depuis le on-prem.
</details>

### Q35
Une organisation a **150 sites** a connecter a Azure avec transit automatique et administration minimale. Quelle architecture ?

- A. Un VPN Gateway par site avec peerings manuels
- B. **Azure Virtual WAN**
- C. Un VNet unique
- D. Traffic Manager

<details><summary>Reponse</summary>

**B.** Virtual WAN fournit un hub manage avec connectivite site-a-site, ExpressRoute et transit automatise a grande echelle.
</details>

### Q36
Vous concevez un hub-and-spoke et devez **inspecter tout le trafic entre spokes** et vers Internet. Que faites-vous ?

- A. Aucun routage particulier
- B. **Azure Firewall dans le hub + routes definies par l'utilisateur (UDR) dans les spokes**
- C. Service endpoints
- D. NSG sur le hub uniquement

<details><summary>Reponse</summary>

**B.** Le peering n'est pas transitif et ne force pas l'inspection ; les UDR dirigent le trafic vers le pare-feu du hub.
</details>

### Q37
Une application de commandes doit echanger des messages **dans l'ordre (FIFO), avec dead-letter et transactions**. Quel service ?

- A. Storage Queue
- B. Event Grid
- C. **Service Bus** (queues/topics avec sessions)
- D. Event Hubs

<details><summary>Reponse</summary>

**C.** Service Bus offre sessions FIFO, dead-letter, transactions et detection de doublons.
</details>

### Q38
Vous voulez declencher une fonction quand un **blob est cree** dans un compte de stockage (reaction a un evenement). Quel service d'evenements ?

- A. Service Bus
- B. Event Hubs
- C. **Event Grid**
- D. Storage Queue

<details><summary>Reponse</summary>

**C.** Event Grid distribue des evenements reactifs (publication/abonnement) depuis les services Azure.
</details>

### Q39
Vous publiez des API internes vers des partenaires avec **quotas, throttling, authentification OAuth et portail developpeur**. Quel service ?

- A. Application Gateway
- B. **API Management**
- C. Azure Firewall
- D. Front Door

<details><summary>Reponse</summary>

**B.** API Management centralise securite, quotas, transformation, versioning et portail pour les API.
</details>

### Q40
Vous devez evaluer et migrer **300 VM VMware** vers Azure, avec dimensionnement et estimation des couts. Quel outil de depart ?

- A. Azure Site Recovery uniquement
- B. **Azure Migrate** (decouverte, evaluation, migration)
- C. Data Box
- D. AzCopy

<details><summary>Reponse</summary>

**B.** Azure Migrate decouvre, evalue (compatibilite, taille, cout) et migre les serveurs.
</details>

### Q41
Vous avez des licences **Windows Server et SQL Server avec Software Assurance** et une charge VM **stable pendant 3 ans**. Comment reduire le cout au maximum ?

- A. Spot VMs
- B. **Azure Hybrid Benefit + Reservations (ou Savings Plan) 3 ans**
- C. Pay-as-you-go
- D. Dev/Test pricing

<details><summary>Reponse</summary>

**B.** Hybrid Benefit supprime le cout de licence ; la reservation reduit le cout de calcul pour une charge previsible. Spot est inadapte a une charge stable et critique.
</details>

### Q42
Les administrateurs doivent acceder en RDP/SSH aux VM **sans IP publique et sans VPN**. Quelle solution ?

- A. NSG ouvrant le port 3389 a Internet
- B. **Azure Bastion**
- C. IP publique avec mot de passe
- D. Traffic Manager

<details><summary>Reponse</summary>

**B.** Bastion fournit RDP/SSH via TLS depuis le portail, sans exposer les VM.
</details>

---

## Mini etudes de cas

### Cas A - Contoso Retail

**Contexte** : Contoso exploite un site e-commerce sur des VM IIS et SQL Server on-premise. Objectifs : migration vers Azure, **reduction de l'effort d'administration**, **disponibilite 99,95 % minimum**, le site est utilise en France et en Allemagne, et les donnees clients doivent rester dans l'UE. La base utilise **SQL Agent** et plusieurs bases liees. Les administrateurs se connectent via AD on-premise.

**A1.** Quelle plateforme pour le site web ?
- A. VM IIS dans un availability set
- B. **App Service (plan Premium, redondance de zone)**
- C. AKS
- D. Azure Batch

<details><summary>Reponse</summary>

**B.** PaaS = moins d'administration ; la redondance de zone assure la haute disponibilite. AKS est excessif pour un site IIS.
</details>

**A2.** Quelle plateforme pour la base ?
- A. Azure SQL Database
- B. **Azure SQL Managed Instance**
- C. Cosmos DB
- D. Table Storage

<details><summary>Reponse</summary>

**B.** SQL Agent et bases liees imposent SQL MI (quasi-compatibilite totale) tout en restant PaaS.
</details>

**A3.** Comment les administrateurs s'authentifient-ils avec les identifiants AD existants, avec une infrastructure minimale et une haute disponibilite ?
- A. AD FS
- B. **Entra Connect avec Password Hash Sync**
- C. Comptes cloud separes
- D. Entra Domain Services

<details><summary>Reponse</summary>

**B.** PHS : simple, resilient (pas de dependance au on-prem). Combine avec PIM pour les roles d'administration.
</details>

**A4.** Comment garantir que les ressources restent dans l'UE ?
- A. Resource lock
- B. **Azure Policy "Allowed locations" (Deny) sur le management group**
- C. NSG
- D. Tags

<details><summary>Reponse</summary>

**B.** Policy empeche techniquement le deploiement hors des regions autorisees.
</details>

---

### Cas B - Fabrikam Telemetry

**Contexte** : Fabrikam collecte la telemetrie de 2 millions d'appareils IoT. Besoins : ingestion de millions d'evenements/s, analyse en temps reel et historique, **archivage 10 ans non modifiable**, DR vers une autre region avec RPO < 15 min, acces prive aux services PaaS depuis le on-prem (ExpressRoute).

**B1.** Service d'ingestion ?
- A. Service Bus
- B. Storage Queue
- C. **Event Hubs**
- D. Event Grid

<details><summary>Reponse</summary>

**C.** Ingestion a haut debit de flux.
</details>

**B2.** Stockage de l'historique et de l'archive ?
- A. Azure SQL Database
- B. **ADLS Gen2 (Blob) avec immutabilite et lifecycle vers Archive**
- C. Table Storage
- D. Managed disks

<details><summary>Reponse</summary>

**B.** Lac de donnees analytique ; WORM pour l'archivage reglementaire ; lifecycle pour le cout.
</details>

**B3.** Acces prive aux comptes de stockage depuis le on-prem ?
- A. Service endpoints
- B. **Private Endpoints (+ DNS prive) via ExpressRoute**
- C. IP publique restreinte
- D. SAS tokens

<details><summary>Reponse</summary>

**B.** Seuls les Private Endpoints sont joignables depuis le on-prem et permettent de desactiver l'acces public.
</details>

**B4.** Redondance du stockage pour le DR regional ?
- A. LRS
- B. ZRS
- C. **GZRS / GRS (avec acces secondaire en lecture si necessaire)**
- D. Aucune

<details><summary>Reponse</summary>

**C.** La replication geo-redondante protege d'une panne regionale ; GZRS ajoute la protection de zone.
</details>

---

## Grille d'auto-evaluation

| Score (sur 50) | Niveau |
|----------------|--------|
| 44-50 | Pret : faites le Practice Assessment officiel |
| 35-43 | Bon : revoyez vos points faibles par domaine |
| < 35 | Reprenez le cours, puis les tableaux de decision de la section 7 |

## Pour aller plus loin
- Microsoft Learn : parcours AZ-305 et **Practice Assessment** gratuit
- Azure Architecture Center : architectures de reference (hub-spoke, AKS baseline, etc.)
- Azure Well-Architected Framework : revue des 5 piliers
- Testez-vous en dessinant une architecture sur papier pour chaque scenario
