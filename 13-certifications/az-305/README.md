# Cours - AZ-305 : Designing Microsoft Azure Infrastructure Solutions

> Parcours : ce cours -> [questions.md](questions.md) -> [approfondissement.md](approfondissement.md) -> [questions-avancees.md](questions-avancees.md).
> Terraform sur Azure : [../terraform/README.md](../terraform/README.md), lab 5.

## Table des matieres

1. [Presentation de l'examen](#1-presentation-de-lexamen)
2. [Domaine 1 - Identite, gouvernance et supervision](#2-domaine-1---identite-gouvernance-et-supervision-25-30-)
3. [Domaine 2 - Stockage de donnees](#3-domaine-2---stockage-de-donnees-20-25-)
4. [Domaine 3 - Continuite d'activite](#4-domaine-3---continuite-dactivite-15-20-)
5. [Domaine 4 - Infrastructure](#5-domaine-4---infrastructure-30-35-)
6. [Well-Architected Framework et cout](#6-well-architected-framework-et-optimisation-des-couts)
7. [Tableaux de decision](#7-tableaux-de-decision-aide-memoire)
8. [Conseils pour l'examen](#8-conseils-pour-lexamen)

---

## 1. Presentation de l'examen

AZ-305 est l'examen de **conception** (architecte), pas d'administration. On ne vous demande pas "quelle commande ?" mais **"quelle solution repond a ces exigences ?"**.

- Questions a choix, **etudes de cas** (plusieurs questions sur un meme scenario, sans retour en arriere entre sections), glisser-deposer, ordonnancement, "oui/non".
- Les exigences contiennent des **contraintes** : cout minimal, effort d'administration minimal, haute disponibilite, conformite, latence, hybride.
- Regle d'or : **choisir le service manage (PaaS) le plus simple qui satisfait toutes les exigences**.

Pour obtenir la certification **Azure Solutions Architect Expert**, il faut AZ-305 **et** la certification Azure Administrator Associate (AZ-104).

---

## 2. Domaine 1 - Identite, gouvernance et supervision (25-30 %)

### 2.1 Microsoft Entra ID (ex-Azure AD)

Service d'identite cloud : authentification (SSO, MFA, sans mot de passe), autorisation d'applications, gestion des identites externes.

| Fonction | Usage |
|----------|-------|
| **Tenant** | Instance d'Entra ID d'une organisation (frontiere d'identite) |
| **Entra ID B2B** | Inviter des **partenaires/invites** avec leur propre identite a acceder a vos ressources |
| **Entra External ID (ex-Azure AD B2C)** | Identites **clients** (consommateurs) : inscription, connexion sociale, flux personnalises |
| **Conditional Access** | Politiques "si... alors..." : exiger MFA, appareil conforme, bloquer par pays/risque/application |
| **MFA** | Second facteur, active via Conditional Access ou Security Defaults |
| **Identity Protection** | Detection des **risques** (utilisateur, connexion), reponse automatique |
| **PIM (Privileged Identity Management)** | Acces **juste-a-temps** et **eligible** aux roles privilegies, approbation, journalisation, expiration |
| **Access reviews** | Revue periodique des acces (groupes, applications, roles) |
| **Entitlement management** | Catalogues et packages d'acces, cycle de vie des acces |
| **Application Proxy / Private Access** | Publier des applications web internes sans VPN |
| **Domain Services (Entra DS)** | Domaine manage (LDAP, Kerberos, GPO) pour applications legacy sans controleurs de domaine |

> Licences : Conditional Access, PIM et Identity Protection necessitent **Entra ID P1/P2** (P2 pour PIM et Identity Protection).

### 2.2 Identite hybride

| Option | Fonctionnement | A choisir quand |
|--------|----------------|-----------------|
| **Password Hash Sync (PHS)** | Hash du hash du mot de passe synchronise vers le cloud | **Simple, recommande par defaut**, haute disponibilite (pas de dependance on-prem), detection de fuite |
| **Pass-through Authentication (PTA)** | Validation du mot de passe **en temps reel** par des agents on-prem | Politique interdisant de stocker les hash dans le cloud, mais sans federation |
| **Federation (AD FS)** | Redirection vers l'AD FS on-prem | **Cartes a puce**, MFA tiers existant, exigences specifiques. Plus complexe |
| **Seamless SSO** | Connexion automatique depuis les appareils du domaine | Complement de PHS/PTA |

Outils de synchronisation : **Entra Connect Sync** (complet) et **Entra Cloud Sync** (leger, agent, **multi-forets deconnectees**, haute disponibilite).

### 2.3 Autorisation : Azure RBAC vs roles Entra

| | Azure RBAC | Roles Entra ID |
|---|------------|----------------|
| **Controle** | Ressources Azure (VM, stockage...) | Ressources d'identite/tenant (utilisateurs, applications, licences) |
| **Portee** | Management group > abonnement > groupe de ressources > ressource | Tenant, unite administrative |
| **Exemples** | Owner, Contributor, Reader, User Access Administrator | Global Administrator, User Administrator |
| **Heritage** | Oui, descendant | Selon la portee |

- **Moindre privilege**, a la portee la plus basse, accorde a des **groupes**.
- **Deny assignments** (via Blueprints/Managed Apps) : rares.
- **PIM** pour les roles Azure aussi (acces eligible).

### 2.4 Identites des applications

| Type | Description | Quand l'utiliser |
|------|-------------|------------------|
| **Managed identity system-assigned** | Liee au cycle de vie d'**une** ressource | Une ressource, un acces |
| **Managed identity user-assigned** | Ressource independante, **partageable** entre plusieurs ressources | Plusieurs ressources avec les memes droits, pre-provisionnement |
| **Service principal** | Identite d'application avec secret/certificat | Quand les managed identities ne sont pas possibles (hors Azure) ; preferer **federated credentials** (OIDC) pour CI/CD |

**Toujours preferer une managed identity** : aucun secret a gerer. Elle s'authentifie aupres de Key Vault, Storage, SQL, etc.

### 2.5 Azure Key Vault

| Option | Description |
|--------|-------------|
| **Vault Standard** | Cles protegees par logiciel, secrets, certificats |
| **Vault Premium** | Cles protegees par **HSM** (multi-tenant) |
| **Managed HSM** | **HSM dedie, mono-locataire**, FIPS 140-3 Level 3, controle total du domaine de securite |
| **Permissions** | Preferer **RBAC** aux access policies (modele historique) |
| **Protection** | **Soft delete** (actif par defaut) et **purge protection** (anti-suppression definitive) |
| **Reseau** | Private Endpoint / pare-feu |
| **Rotation** | Rotation automatique des cles, expiration des secrets, evenements via Event Grid |

Chiffrement : **cles gerees par Microsoft** (defaut) vs **cles gerees par le client (CMK)** dans Key Vault vs **BYOK/HYOK**. Chiffrement hote (*encryption at host*) pour les VM, Azure Disk Encryption (BitLocker/dm-crypt).

### 2.6 Gouvernance

```
Tenant Root Management Group
 |-- MG: Platform
 |     |-- MG: Identity     (abonnement identite)
 |     |-- MG: Connectivity (hub reseau)
 |     |-- MG: Management   (supervision)
 |-- MG: Landing Zones
 |     |-- MG: Corp         (workloads internes, connectes)
 |     |-- MG: Online       (workloads exposes Internet)
 |-- MG: Sandbox
 |-- MG: Decommissioned
```

C'est l'architecture **Azure Landing Zone** du Cloud Adoption Framework (CAF).

| Outil | Role |
|-------|------|
| **Management groups** | Hierarchie au-dessus des abonnements ; politiques et RBAC heritees (jusqu'a 6 niveaux) |
| **Abonnements** | Frontiere de facturation, de quotas et d'administration |
| **Azure Policy** | **Regles** et conformite : effets `Deny`, `Audit`, `Append`, `Modify`, `DeployIfNotExists`, `AuditIfNotExists`, `Disabled` |
| **Initiatives** | Regroupement de politiques (ex. ISO 27001, benchmark securite) |
| **Remediation tasks** | Corriger les ressources existantes non conformes (Modify/DeployIfNotExists) |
| **Resource locks** | `CanNotDelete` / `ReadOnly` contre les suppressions/modifications accidentelles |
| **Tags** | Metadonnees : cout, proprietaire, environnement (imposables via Policy) |
| **Blueprints** | **Deprecie** : preferer Template Specs + Deployment Stacks + Policy + IaC |
| **Azure Resource Graph** | Requetes (KQL) a grande echelle sur l'inventaire des ressources |
| **Microsoft Defender for Cloud** | Posture de securite (CSPM), recommandations, protection des workloads (CWPP), conformite reglementaire |
| **Cost Management + Budgets** | Analyse des couts, budgets, alertes, export |

**Policy vs RBAC** : RBAC dit **qui** peut faire quoi ; Policy dit **ce qui est autorise** (ex. regions autorisees, SKU interdits, tags obligatoires), quelle que soit la personne.

### 2.7 Supervision

```
 Sources (VM, App, PaaS, AKS, reseau, Entra ID, abonnement)
         | diagnostic settings / agents (Azure Monitor Agent) / SDK
         v
 +----------------------+----------------------+
 | Metrics (temps reel, | Logs (Log Analytics  |
 | 93 j, faible latence)| workspace, KQL)      |
 +----------------------+----------------------+
         |                         |
   Alertes (metrique, log,  Workbooks, dashboards, Sentinel,
   activity log) -> Action groups -> email/SMS/webhook/Logic App/Function
```

| Service | Usage |
|---------|-------|
| **Azure Monitor** | Plateforme commune : metriques, logs, alertes, autoscale |
| **Log Analytics workspace** | Stockage de logs + requetes **KQL** |
| **Application Insights** | **APM** applicatif : requetes, dependances, exceptions, cartes d'application, tests de disponibilite |
| **VM Insights / Container Insights** | Performance et dependances des VM / AKS |
| **Azure Monitor Agent (AMA)** + **Data Collection Rules** | Collecte moderne (remplace Log Analytics agent/MMA) |
| **Diagnostic settings** | Envoi des logs de ressources vers Log Analytics, Storage (archive), Event Hubs (SIEM tiers) |
| **Activity Log** | Operations du plan de controle de l'abonnement (qui a fait quoi) |
| **Network Watcher** | Diagnostic reseau : IP flow verify, next hop, NSG flow logs, connection monitor |
| **Microsoft Sentinel** | **SIEM/SOAR** cloud, construit sur Log Analytics |
| **Service Health / Resource Health** | Incidents Azure affectant vos ressources |
| **Alertes** | Metrique, log (KQL), activity log, smart detection ; **Action groups** reutilisables |

**Conception des workspaces Log Analytics** :
- **Un workspace centralise** : simplicite, correlation, cout (commitment tiers).
- **Plusieurs workspaces** : exigences de **residence des donnees**, separation de droits stricte, filiales independantes, facturation separee.
- Controle d'acces : RBAC au niveau workspace, ressource ou table.
- Retention : 30 j par defaut (interactive), extensible jusqu'a 12 ans (archive) ; niveaux **Basic/Auxiliary logs** pour reduire le cout.

---

## 3. Domaine 2 - Stockage de donnees (20-25 %)

### 3.1 Azure Storage

Types de comptes : **Standard general-purpose v2** (par defaut), **Premium** (block blobs, file shares, page blobs).

| Service | Usage |
|---------|-------|
| **Blob** (Block/Append/Page) | Stockage objet : fichiers, medias, backups, data lake |
| **Files** | Partages **SMB/NFS** manages, lift-and-shift de serveurs de fichiers |
| **Queue** | File de messages simple (jusqu'a 64 Ko par message) |
| **Table** | NoSQL cle-valeur simple (ou Cosmos DB Table) |
| **Disks** | Disques de VM (voir ci-dessous) |
| **ADLS Gen2** | Blob + **espace de noms hierarchique** : data lake analytique |

**Niveaux d'acces (Blob)** : Hot, Cool (30 j min), Cold (90 j min), Archive (180 j min, **hors ligne**, reactivation en heures). Gestion automatique avec les **lifecycle management policies**.

**Redondance** :

| Option | Copies | Protege contre | Lecture secondaire |
|--------|--------|----------------|--------------------|
| **LRS** | 3 dans un datacenter | Panne de disque/rack | - |
| **ZRS** | 3 dans 3 zones de disponibilite | Panne d'une **zone** | - |
| **GRS** | LRS + 3 dans la region jumelee | Panne **regionale** | Non (RA-GRS : oui) |
| **GZRS** | ZRS + LRS dans la region jumelee | Panne de zone **et** de region | Non (RA-GZRS : oui) |

> Le failover vers la region secondaire peut entrainer une perte de donnees (replication **asynchrone**, RPO ~15 min, non garanti par SLA).

**Fonctions de protection des donnees (Blob)** : soft delete, versioning, **change feed**, **point-in-time restore**, **immutable storage** (WORM : time-based retention / legal hold) pour la conformite (SEC 17a-4), **object replication**, **SFTP**.

**Securite** : chiffrement au repos (SSE, cles Microsoft ou CMK), TLS en transit, **Entra ID RBAC** (a preferer aux cles de compte), **SAS** (acces delegue limite, preferer *user delegation SAS*), pare-feu, **Private Endpoint**, desactivation de l'acces anonyme.

### 3.2 Options de fichiers

| Besoin | Service |
|--------|---------|
| Partage SMB standard, lift-and-shift | **Azure Files** (Standard ou Premium) |
| Synchroniser un serveur de fichiers on-prem avec cache local | **Azure File Sync** |
| Performance extreme, faible latence, NFS/SMB, SAP HANA, HPC, Oracle | **Azure NetApp Files** |
| Calcul haute performance, fichiers massifs | Azure Managed Lustre |
| Profils utilisateur AVD (FSLogix) | Azure Files Premium ou NetApp Files |

### 3.3 Disques manages

| Type | Usage |
|------|-------|
| **Standard HDD** | Sauvegardes, acces rare |
| **Standard SSD** | Serveurs web, dev/test |
| **Premium SSD** | Production, bases de donnees |
| **Premium SSD v2** | Performances (IOPS/debit) ajustables independamment de la capacite |
| **Ultra Disk** | Latence sous la milliseconde, charges les plus exigeantes |

Haute disponibilite : disques **ZRS** pour les VM multi-zones.

### 3.4 Bases de donnees relationnelles

| Option | Modele | Choisir quand |
|--------|--------|---------------|
| **Azure SQL Database** | PaaS, base unique / pool elastique | Nouvelles applications, effort d'admin minimal |
| **Azure SQL Managed Instance** | PaaS, compatibilite **quasi totale** SQL Server | **Migration avec changements minimaux** : SQL Agent, requetes inter-bases, CLR, Service Broker, liens |
| **SQL Server sur VM (IaaS)** | Controle total de l'OS | Acces OS necessaire, version/fonctions non supportees (SSRS, SSIS en natif...) |
| **Azure Database for PostgreSQL / MySQL (Flexible Server)** | PaaS open source | Applications PostgreSQL/MySQL |

**Azure SQL Database - options de conception** :

| Option | Detail |
|--------|--------|
| **Modeles d'achat** | **vCore** (flexible, Hybrid Benefit, reservations) ou DTU (bundle simple) |
| **Niveaux** | General Purpose, **Business Critical** (replicas locaux, faible latence, lecture secondaire), **Hyperscale** (jusqu'a ~100 To, scale rapide, replicas nommes) |
| **Serverless** | Autoscaling et **pause automatique** : charges **intermittentes/imprevisibles** |
| **Pool elastique** | Partage de ressources entre **plusieurs bases** a pics decales (SaaS multi-tenant) |
| **Haute disponibilite** | Redondance de zone, SLA jusqu'a 99,995 % |
| **Reprise apres sinistre** | **Active geo-replication** (par base) ou **Auto-failover groups** (groupe de bases, endpoint stable) |
| **Sauvegardes** | Automatiques, PITR 1-35 j, LTR jusqu'a 10 ans |
| **Securite** | Entra auth, TDE (par defaut), **Always Encrypted**, masquage dynamique, Row-level security, Defender for SQL, Private Endpoint |

### 3.5 Bases NoSQL : Azure Cosmos DB

Base **multi-modele distribuee globalement**, latence < 10 ms en lecture/ecriture a 99 %, SLA 99,999 % (multi-region).

| APIs | NoSQL (natif), MongoDB, Cassandra, Gremlin (graphe), Table, PostgreSQL |
|------|---|

**Les 5 niveaux de coherence** (du plus fort au plus faible) :

| Niveau | Garantie | Latence/Disponibilite |
|--------|----------|-----------------------|
| **Strong** | Lecture du dernier ecrit (lineaire) | Latence la plus haute |
| **Bounded staleness** | Retard borne (K versions ou T secondes) | |
| **Session** (**defaut**) | Coherence pour un client/session ("lis ce que tu as ecrit") | **Le meilleur compromis** |
| **Consistent prefix** | Ordre garanti, pas de trou | |
| **Eventual** | Aucune garantie d'ordre | Latence la plus basse |

Capacite : **provisionnee** (RU/s, autoscale) ou **serverless**. **Multi-region writes** pour ecritures locales partout. **Partition key** bien choisie (forte cardinalite, repartition uniforme) = cle de la performance.

### 3.6 Choisir le bon stockage de donnees

| Donnees / Besoin | Service |
|------------------|---------|
| Relationnel, transactionnel, nouvelle app | Azure SQL Database |
| Migration SQL Server avec peu de changements | SQL Managed Instance |
| Documents JSON, global, faible latence | Cosmos DB (API NoSQL) |
| Cle-valeur simple et bon marche | Table Storage |
| Cache, sessions, faible latence | Azure Cache for Redis |
| Fichiers/images/videos/backups | Blob Storage |
| Lac de donnees pour analytique | ADLS Gen2 |
| Entrepot de donnees, analytique massive SQL | Synapse Analytics / Microsoft Fabric |
| Series temporelles IoT/telemetrie | Azure Data Explorer |
| Recherche plein texte | Azure AI Search |
| Graphe | Cosmos DB (Gremlin) |

### 3.7 Integration de donnees et analytique

| Service | Role |
|---------|------|
| **Azure Data Factory** | Orchestration ETL/ELT (pipelines, copy, data flows), runtime d'integration auto-heberge pour le on-prem |
| **Synapse Analytics / Microsoft Fabric** | Plateforme analytique unifiee (SQL, Spark, pipelines) |
| **Azure Databricks** | Spark / ML / lakehouse |
| **Event Hubs** | **Ingestion** de flux d'evenements a tres grande echelle (millions/s), compatible Kafka |
| **Stream Analytics** | Requetes SQL en temps reel sur des flux |
| **Azure Purview / Microsoft Purview** | Catalogue, classification, gouvernance des donnees |

### 3.8 Migration de donnees

| Volume / Contexte | Solution |
|-------------------|----------|
| Quelques Go a To, bande passante correcte | **AzCopy**, Azure Storage Explorer, Data Factory |
| **Dizaines a centaines de To**, reseau lent | **Azure Data Box** (disque 80 To, Heavy 1 Po) |
| Bases de donnees | **Azure Database Migration Service**, Azure Migrate (assessment) |
| Synchronisation continue de fichiers | Azure File Sync |
| Serveurs complets | Azure Migrate (VM), Azure Site Recovery |

---

## 4. Domaine 3 - Continuite d'activite (15-20 %)

### 4.1 Concepts

| Terme | Signification |
|-------|---------------|
| **RTO** | Duree maximale acceptable de l'interruption |
| **RPO** | Quantite maximale de donnees perdue acceptable (dans le temps) |
| **SLA** | Engagement de disponibilite de Microsoft pour un service |
| **HA** | Resiste aux pannes **locales** (zone, serveur) |
| **DR** | Reprise apres sinistre **regional** |

### 4.2 SLA composites

- **Composants en serie** (tous necessaires) : on **multiplie**.
  Exemple : App Service 99,95 % x SQL 99,99 % = 0,9995 x 0,9999 = **99,94 %**.
- **Composants en parallele** (redondants) : `1 - (1 - A) x (1 - B)`.
  Exemple : deux regions a 99,95 % -> 1 - 0,0005 x 0,0005 = **99,999975 %** (avant prise en compte du routeur global).
- Ajouter un composant en serie **diminue** la disponibilite ; ajouter de la redondance l'**augmente**.
- Un **service de bascule** (Traffic Manager/Front Door) fait aussi partie du calcul.

### 4.3 Disponibilite des VM

| Option | Protege contre | SLA VM |
|--------|----------------|--------|
| **VM unique** (Premium SSD/Ultra) | Aucune panne au-dela de l'hote (SLA 99,9 %) | 99,9 % |
| **Availability Set** | Pannes de rack/maintenance (domaines de panne et de mise a jour) dans **un datacenter** | 99,95 % |
| **Availability Zones** | Panne d'un **datacenter entier** (zone) dans la region | **99,99 %** |
| **VM Scale Sets (VMSS)** | Autoscaling + repartition sur zones/domaines | 99,95 % - 99,99 % |
| **Regions jumelees / multi-region** | Panne **regionale** | Selon l'architecture |

Modes de deploiement : **zonal** (VM epinglee a une zone) vs **zone-redundant** (service qui repartit automatiquement). Beaucoup de services PaaS offrent la **redondance de zone** (App Service, SQL, Storage ZRS, AKS, Load Balancer Standard, Application Gateway v2...).

### 4.4 Sauvegarde : Azure Backup

| Element | Detail |
|---------|--------|
| **Recovery Services vault** | VM Azure, SQL/SAP HANA dans des VM, Azure Files, serveurs on-prem (MARS, MABS, DPM) |
| **Backup vault** | Blobs, disques, PostgreSQL, AKS |
| **Stockage du coffre** | LRS / ZRS / **GRS** (par defaut) + **Cross-Region Restore** |
| **Politiques** | Frequence, retention (jours, semaines, mois, annees) |
| **Securite anti-ransomware** | **Soft delete**, **immutable vault**, **Multi-User Authorization (Resource Guard)**, chiffrement CMK |
| **Instantanes** | Restauration instantanee de VM (retention 1-5 j) |

Blob Storage a ses propres protections (versioning, PITR, soft delete). Azure SQL a ses sauvegardes automatiques.

### 4.5 Reprise apres sinistre

| Charge | Solution DR |
|--------|-------------|
| **VM Azure -> autre region** | **Azure Site Recovery (ASR)** : replication continue, RPO de l'ordre de secondes/minutes, plans de reprise, tests sans impact |
| **VM on-prem (VMware/Hyper-V/physique) -> Azure** | ASR |
| **Azure SQL Database** | Auto-failover groups / geo-replication |
| **SQL Managed Instance** | Auto-failover groups |
| **SQL sur VM** | Always On (dispo + DR), log shipping |
| **Cosmos DB** | Multi-region, failover automatique |
| **Storage** | GRS/GZRS, failover de compte |
| **App Service** | Deploiement dans 2 regions + Front Door / Traffic Manager |
| **Cle des architectures** | **Actif-actif** (RTO ~0, cout eleve) / **Actif-passif chaud** / **Pilot light** / **Sauvegarde-restauration** (cheap, lent) |

### 4.6 Repartition de charge et bascule

| Service | Couche | Portee | Usage |
|---------|--------|--------|-------|
| **Azure Load Balancer** | L4 (TCP/UDP) | Regional (ou **global** : cross-region) | Trafic non HTTP, haute performance |
| **Application Gateway** | **L7** HTTP(S) | Regional | Routage URL/host, TLS, **WAF**, affinite de session |
| **Azure Front Door** | **L7** HTTP(S) | **Global** | Acceleration, WAF, cache, bascule multi-regions, anycast |
| **Traffic Manager** | **DNS** | Global | Routage DNS (priorite, pondere, performance, geographique, multivaleur) pour **tout protocole** |

Arbre de decision rapide :
```
HTTP(S) ?
 |- Oui -> Global ? -> Front Door     | Regional ? -> Application Gateway
 |- Non  -> Global ? -> Traffic Manager (DNS) ou LB cross-region
            Regional ? -> Load Balancer
```

---

## 5. Domaine 4 - Infrastructure (30-35 %)

### 5.1 Choisir le calcul

| Service | Type | Choisir quand |
|---------|------|---------------|
| **Virtual Machines** | IaaS | Controle total, logiciel legacy, lift-and-shift |
| **VM Scale Sets** | IaaS | Flotte de VM identiques avec autoscaling |
| **App Service** | PaaS | **Applications web/API** : deploiement simple, slots, autoscale |
| **Azure Functions** | FaaS | Code **evenementiel** court, facturation a l'execution (Consumption), **Premium** : pas de cold start + VNet, **Dedicated** |
| **Container Apps** | Conteneurs serverless | Microservices, **sans gerer Kubernetes**, **scale to zero**, KEDA, Dapr |
| **AKS** | Kubernetes manage | Besoin complet de Kubernetes, ecosysteme, controle fin |
| **Container Instances (ACI)** | Conteneurs a la demande | Taches courtes, burst, tests simples |
| **Azure Batch** | Calcul par lots | HPC, rendu, simulations |
| **Azure Virtual Desktop** | VDI | Postes de travail/applications distants (multi-session) |
| **Azure VMware Solution** | VMware natif | Migration VMware sans changement |
| **Logic Apps** | Workflows low-code | Integration SaaS/B2B, connecteurs |

Regle : **PaaS/serverless d'abord** (moins d'exploitation) ; descendre vers IaaS seulement si une contrainte l'impose.

**App Service** : plans (Free -> Premium v3/Isolated v2), **deployment slots** (staging, swap sans interruption), autoscale, VNet integration, Private Endpoint, **ASE** (Environnement dedie isole).

**AKS** : node pools (systeme / utilisateur), autoscaler, Entra ID + RBAC, **Azure CNI** (IP de VNet pour les pods) vs **kubenet**, CNI Overlay, ingress (App Gateway for Containers / NGINX), Workload Identity, Azure Policy pour K8s, ACR pour les images.

### 5.2 Reseau Azure

**Conception d'adressage** : plages RFC 1918 **sans chevauchement** entre VNets et avec le on-prem.

**Topologie hub-and-spoke** :

```
                       On-premise
                    (VPN / ExpressRoute)
                           |
                  +----------------+
                  |   Hub VNet     |  Azure Firewall, VPN/ER Gateway, Bastion, DNS
                  +----------------+
                   /       |        \     peering
           +-------+   +-------+   +-------+
           |Spoke 1|   |Spoke 2|   |Spoke 3|    (workloads isoles)
           +-------+   +-------+   +-------+
   Trafic spoke-a-spoke et Internet force via Azure Firewall grace aux UDR (routes personnalisees)
```

**Azure Virtual WAN** : hub manage Microsoft, **connectivite a grande echelle** (nombreux sites/branches, SD-WAN, VPN, ExpressRoute, transit automatique). Choisir quand il y a **beaucoup de branches** et que l'on veut moins d'administration.

**Connectivite hybride** :

| Option | Description | Choisir quand |
|--------|-------------|---------------|
| **VPN Gateway site-a-site** | Tunnel IPsec sur Internet | Rapide, peu couteux, debit modere (jusqu'a ~10 Gb/s) |
| **VPN point-a-site** | Utilisateurs distants | Teletravail |
| **ExpressRoute** | **Connexion privee** via un fournisseur, hors Internet | Debit eleve, latence faible/previsible, conformite ; **peering prive** (VNet) et **Microsoft peering** (M365, PaaS public) |
| **ExpressRoute + VPN** | VPN en secours de l'ER | **Resilience** |
| **ExpressRoute Global Reach** | Relier deux sites on-prem via le backbone Microsoft | |
| **ExpressRoute Direct** | Port 10/100 Gb/s directement | Tres gros debits |

**Connexions entre VNets** : **VNet peering** (faible latence, non transitif, global possible) ; **VNet-to-VNet via VPN** (si chiffrement necessaire) ; **hub + NVA/Firewall** pour le transit.

**Acces prive aux services PaaS** :

| | Service Endpoint | **Private Endpoint (Private Link)** |
|---|------------------|-------------------------------------|
| **Mecanisme** | Route optimisee vers le service via le backbone ; IP de destination = IP **publique** du service | Carte reseau avec une **IP privee** dans votre VNet |
| **Acces depuis le on-prem** | Non | **Oui** (ER/VPN) |
| **Desactiver l'acces public** | Pas completement | **Oui** |
| **Protection exfiltration** | Limitee (niveau service) | Forte (ressource specifique) |
| **DNS** | Pas de changement | **Zone DNS privee** requise (`privatelink.*`) |
| **Cout** | Gratuit | Payant |

Le plus securise = **Private Endpoint**.

**Securite reseau** :

| Service | Role |
|---------|------|
| **NSG** | Filtrage L3/L4 par sous-reseau ou NIC (stateful), **ASG** pour grouper les VM |
| **Azure Firewall** | Pare-feu manage L3-L7, FQDN/URL filtering, TLS inspection (Premium), threat intel, IDPS |
| **WAF** | Protection web (OWASP) sur Application Gateway ou Front Door |
| **DDoS Protection** | Protection DDoS **reseau** (IP publiques), SKU Network ou IP |
| **Azure Bastion** | **RDP/SSH securises via TLS**, sans IP publique sur les VM |
| **Just-in-Time VM access** | Ouverture temporaire des ports (Defender for Cloud) |
| **Network Virtual Appliance** | Pare-feu tiers (Palo Alto, Fortinet...) |
| **DNS Private Resolver** | Resolution DNS hybride (on-prem <-> Azure) |
| **Azure DNS (public/prive)** | Zones DNS manages |

### 5.3 Architecture d'applications

**Messagerie et evenements** :

| Service | Modele | Choisir quand |
|---------|--------|---------------|
| **Service Bus** | Messages d'entreprise : files, **topics/abonnements**, **sessions (FIFO)**, **dead-letter**, transactions, doublons, TTL | **Messages critiques/ordonnees**, integration d'entreprise |
| **Storage Queue** | File simple, tres economique, tres gros volumes | Decoupling basique, > 80 Go, sans fonctions avancees |
| **Event Grid** | **Evenements reactifs** (publication-abonnement, push) | Notification "il s'est passe quelque chose" (ex. blob cree) |
| **Event Hubs** | **Flux de telemetrie** a haut debit, rejouable, partitions | Ingestion massive de logs/IoT/analytique |

Mnemonique : **Service Bus** = commandes (ne pas perdre un message) ; **Event Grid** = reaction aux evenements ; **Event Hubs** = streaming/big data.

| Service | Role |
|---------|------|
| **API Management** | Passerelle d'API : auth (OAuth/JWT), **throttling**, cache, transformation, versioning, portail developpeur |
| **Logic Apps / Durable Functions** | Orchestration de workflows |
| **Azure Cache for Redis** | Cache, sessions : reduit la charge de la base |
| **Azure CDN / Front Door** | Contenu statique en peripherie |
| **Azure SignalR / Web PubSub** | Temps reel |

**Patterns** : decouplage asynchrone, CQRS, event sourcing, **Cache-aside**, **Circuit breaker**, **Retry**, **Bulkhead**, **Queue-based load leveling**, **Strangler fig** (migration progressive), **Competing consumers**, Sidecar.

**Architectures** : N-tier, microservices, event-driven, Web-Queue-Worker, Big data, ML.

### 5.4 Migration

Cadre : **Cloud Adoption Framework** -> *Strategy -> Plan -> Ready -> Migrate/Innovate -> Govern -> Secure -> Manage*.

**Les 5 R de la migration** :

| Strategie | Description |
|-----------|-------------|
| **Rehost** (lift-and-shift) | Meme application sur des VM Azure : rapide, peu de changement |
| **Refactor / Repackage** | Modifications mineures vers du PaaS (ex. SQL Server -> SQL MI, app -> App Service) |
| **Rearchitect** | Reconcevoir (monolithe -> microservices) |
| **Rebuild** | Reecrire cloud-native |
| **Replace** | Remplacer par du SaaS |

Outils :

| Besoin | Outil |
|--------|-------|
| Decouverte, evaluation, migration de serveurs/VM/bases/webapps | **Azure Migrate** |
| Replication de VM | Azure Migrate : Server Migration (ou ASR) |
| Migration de bases (online/offline) | **Azure Database Migration Service** |
| Migration d'applications web .NET/Java | **App Service Migration Assistant** |
| Grands volumes hors ligne | **Azure Data Box** |
| Estimation des couts | **Azure Pricing Calculator / TCO Calculator** |
| Gerer on-prem/multi-cloud depuis Azure | **Azure Arc** |

### 5.5 Hybride et multi-cloud

- **Azure Arc** : projette serveurs, clusters Kubernetes, bases (SQL MI, PostgreSQL) hors Azure dans Azure Resource Manager ; Policy, RBAC, Defender, Monitor applicables.
- **Azure Stack HCI / Azure Local** : infrastructure hyperconvergee on-prem geree avec Azure.
- **Azure Stack Hub** : cloud Azure complet on-prem (deconnecte).
- **Azure Stack Edge** : materiel edge avec calcul/IA.

### 5.6 Automatisation et DevOps

- **IaC** : **Bicep** (recommande), ARM templates, Terraform ; **Template Specs**, **Deployment Stacks**.
- **Azure DevOps / GitHub Actions** : CI/CD ; **Azure Automation** (runbooks, Update Manager), **Azure Policy Guest Configuration**.
- **Deployment slots** et **Traffic Manager/Front Door** pour livraisons progressives.

---

## 6. Well-Architected Framework et optimisation des couts

### Les 5 piliers Azure WAF

| Pilier | Idee cle |
|--------|----------|
| **Fiabilite** | Resilience, HA, DR, tests de panne |
| **Securite** | Confidentialite, integrite, disponibilite ; Zero Trust |
| **Optimisation des couts** | Valeur maximale, supprimer le gaspillage |
| **Excellence operationnelle** | Automatisation, observabilite, DevOps |
| **Efficacite des performances** | Scalabilite, charge, optimisation |

Outils : **Azure Advisor** (recommandations sur les 5 piliers), **WAF Assessment**, **Azure Architecture Center**, **Defender for Cloud**.

### Optimisation des couts

| Levier | Detail |
|--------|--------|
| **Reservations** (1 ou 3 ans) | Engagement sur une ressource precise, jusqu'a ~72 % d'economie |
| **Savings Plan for Compute** | Engagement de depense horaire flexible (VM, App Service premium, Functions premium, conteneurs) |
| **Spot VMs** | Capacite excedentaire, tres bon marche, eviction possible (batch, tolerant) |
| **Azure Hybrid Benefit** | Reutiliser les licences Windows Server / SQL Server avec Software Assurance (jusqu'a ~40-85 %) |
| **Dev/Test pricing** | Tarifs reduits pour les abonnements dev/test |
| **Autoscale + arret programme** | Eteindre hors horaires (Automation, DevTest Labs) |
| **Right-sizing** | Recommandations d'Advisor |
| **Stockage** | Tiering (Cool/Cold/Archive), lifecycle, reservations de capacite |
| **Serverless** | Functions, Container Apps, SQL serverless, Cosmos serverless |
| **Tags + budgets + alertes** | Responsabilisation (FinOps) |

---

## 7. Tableaux de decision (aide-memoire)

### Identite et securite
| Exigence | Solution |
|----------|----------|
| Partenaires externes accedent a une app | Entra B2B |
| Clients grand public s'inscrivent (social login) | Entra External ID (B2C) |
| Admins en acces juste-a-temps | PIM |
| MFA hors reseau d'entreprise | Conditional Access |
| App sur VM accede a Key Vault sans secret | Managed identity |
| Cles HSM dedie mono-locataire | Managed HSM |
| Revue periodique des acces | Access reviews |
| Imposer regions et tags | Azure Policy (Deny / Modify) |
| Empecher la suppression accidentelle | Resource lock |
| Acces RDP/SSH sans IP publique | Azure Bastion |
| Meme politique sur serveurs on-prem | Azure Arc + Policy |

### Donnees
| Exigence | Solution |
|----------|----------|
| Migration SQL Server a changements minimaux | SQL Managed Instance |
| Charge SQL intermittente, pause auto | SQL Database serverless |
| Beaucoup de petites bases, pics decales | Pool elastique |
| BD > 4 To, croissance rapide, scaling | Hyperscale |
| Ecritures locales dans plusieurs regions, < 10 ms | Cosmos DB multi-region writes |
| Coherence "lire ce que j'ai ecrit" | Cosmos DB Session |
| Archiver 7 ans, non modifiable | Blob immutable (WORM) + Archive tier |
| Survivre a une panne de zone ET lire la region secondaire | RA-GZRS |
| 200 To a transferer, reseau lent | Azure Data Box |
| Ingerer des millions d'evenements/s | Event Hubs |

### Continuite
| Exigence | Solution |
|----------|----------|
| DR de VM d'une region a l'autre | Azure Site Recovery |
| Survivre a la panne d'un datacenter | Availability Zones |
| Ransomware sur les sauvegardes | Immutable vault + soft delete + Resource Guard |
| Bascule HTTP globale avec WAF | Front Door |
| Bascule DNS tout protocole | Traffic Manager |
| LB L7 regional avec WAF | Application Gateway |
| LB L4 regional | Load Balancer |
| Bascule BD en groupe | Auto-failover group |

### Infrastructure
| Exigence | Solution |
|----------|----------|
| Microservices conteneurises sans Kubernetes, scale-to-zero | Container Apps |
| Kubernetes complet | AKS |
| App web simple, slots | App Service |
| Code evenementiel court | Functions |
| Messages ordonnes, fiables, topics | Service Bus |
| Reaction a "blob cree" | Event Grid |
| Exposer des API avec quotas/throttling | API Management |
| Acces prive depuis le on-prem a un PaaS | Private Endpoint |
| Beaucoup de branches, transit manage | Virtual WAN |
| Lien prive dedie vers Azure | ExpressRoute (+ VPN de secours) |
| Hub centralise, filtrage spoke-a-spoke | Hub-and-spoke + Azure Firewall + UDR |
| Evaluer/migrer des VM | Azure Migrate |
| Reduire le cout d'une charge stable | Reservation / Savings Plan + Hybrid Benefit |

---

## 8. Conseils pour l'examen

1. **Lisez toutes les exigences** : une seule contrainte (ex. "sans modifier le code", "dans le meme pays", "cout minimal") elimine souvent 3 options.
2. **PaaS > IaaS** a exigences egales (moins d'exploitation). IaaS seulement si acces OS/logiciel specifique.
3. **Managed identity** quand il faut eviter les secrets.
4. **Private Endpoint** est plus securise que Service Endpoint.
5. **Front Door** = HTTP global ; **Traffic Manager** = DNS ; **App Gateway** = L7 regional ; **Load Balancer** = L4.
6. **Zones = HA dans une region** ; **region jumelee/ASR = DR**.
7. **SQL MI** = migration quasi sans changement ; **SQL DB** = nouvelle app ; **SQL sur VM** = besoin d'OS.
8. **Service Bus / Event Grid / Event Hubs / Storage Queue** : memorisez la difference.
9. **Policy** (ce qui est autorise) **vs RBAC** (qui peut agir).
10. Etudes de cas : lisez d'abord **les questions**, puis parcourez le scenario pour retrouver les infos.
11. Pour les calculs de SLA : serie = multiplication ; parallele = `1 - (1-A)(1-B)`.
12. Pratiquez avec le **Practice Assessment** gratuit de Microsoft Learn et l'**Exam Sandbox**.
13. Les noms de produits evoluent (Azure AD -> Entra ID, B2C -> External ID, Blueprints -> Template Specs/Deployment Stacks) : revoyez les notes de mise a jour de l'examen.
