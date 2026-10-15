# AZ-305 - Approfondissement (theorie et competences d'architecte)

A lire **apres** le [cours](README.md). Ce document donne les **criteres de decision** et les **mecanismes** que l'examen teste dans les scenarios difficiles.
Chaque section se termine par **"Savoir-faire"**.

## Sommaire
1. [Identite : conception de bout en bout](#1-identite--conception-de-bout-en-bout)
2. [Gouvernance et landing zone](#2-gouvernance-et-landing-zone)
3. [Supervision : conception de Log Analytics et alertes](#3-supervision)
4. [Reseau : conception detaillee](#4-reseau--conception-detaillee)
5. [Donnees : choix et dimensionnement](#5-donnees--choix-et-dimensionnement)
6. [Continuite : calculs et conception DR](#6-continuite--calculs-et-conception-dr)
7. [Calcul et applications : arbres de decision](#7-calcul-et-applications--arbres-de-decision)
8. [Migration](#8-migration)
9. [Cout et Well-Architected](#9-cout-et-well-architected)
10. [Infrastructure as Code pour AZ-305](#10-infrastructure-as-code-pour-az-305)
11. [Etudes de cas completes](#11-etudes-de-cas-completes)

---

## 1. Identite : conception de bout en bout

### 1.1 Tenants et abonnements

| Decision | Recommandation |
|----------|----------------|
| **Un tenant ou plusieurs ?** | **Un seul** tenant de production par organisation (sauf separation legale/acquisition/isolation forte). Un tenant de test/sandbox separe est courant. |
| **Multi-tenant (partenaires, MSP)** | **Azure Lighthouse** : gestion delegue multi-tenant sans comptes invites |
| **Rattachement d'abonnement** | Un abonnement est lie a **un seul** tenant ; peut etre **transfere** entre tenants (perte des RBAC/identites manages) |

### 1.2 Conditional Access : conception de politiques

Ensemble de base recommande :
1. **Exiger le MFA pour tous les administrateurs** (roles privilegies).
2. **Exiger le MFA pour tous les utilisateurs** (au moins hors reseaux de confiance).
3. **Bloquer l'authentification heritee** (legacy auth : IMAP/POP/SMTP basiques).
4. **Exiger un appareil conforme / joint** pour les applications sensibles.
5. **Exiger un MFA resistant au phishing** (FIDO2, Windows Hello, passkeys) pour les administrateurs.
6. **Bloquer / contraindre selon le risque** (Identity Protection : risque de connexion/utilisateur) — licence P2.
7. **Comptes d'urgence (break-glass)** : 2 comptes cloud-only, **exclus** des politiques CA (ou protegees par un MFA resistant au phishing dedie), mots de passe longs stockes hors ligne, **alertes** sur toute connexion.

Notions :
- **Report-only** : evaluer l'impact d'une politique avant de l'activer.
- **Named locations**, **filtres d'appareils**, **sessions** (frequence de connexion, persistance), **authentication strengths**.
- Les politiques CA s'appliquent **apres** l'authentification primaire.
- **Security Defaults** : base gratuite (MFA pour tous), incompatible avec CA personnalise.

### 1.3 PIM : parametres a connaitre

| Parametre | Detail |
|-----------|--------|
| **Eligible vs actif** | Eligible = doit activer ; actif = droits en permanence (a eviter) |
| **Duree d'activation maximale** | Heures (ex. 2-8 h) |
| **Exiger** | MFA, justification, **approbation**, ticket |
| **Alertes** | Roles non utilises, activations trop frequentes |
| **Access reviews PIM** | Revue periodique des affectations eligibles |
| **Portee** | Roles **Entra** et roles **Azure RBAC** (groupes PIM pour regrouper) |

### 1.4 Hybride : choisir

| Contrainte | Choix |
|------------|-------|
| Simplicite + resilience | **Password Hash Sync + Seamless SSO** |
| "Les mots de passe ne doivent pas etre stockes (meme hashes) dans le cloud" | **Pass-through Auth** (agents on-prem, minimum 2-3 pour HA) |
| Cartes a puce, MFA tiers, politiques de connexion AD FS | **Federation (AD FS)** — a eviter si possible (maintenance) |
| Plusieurs forets **deconnectees**, deploiement leger | **Cloud Sync** |
| Besoin d'un domaine pour applications legacy (LDAP/Kerberos) sans DC | **Entra Domain Services** |

PHS **en plus** de PTA/federation sert de **secours** (bascule en cas de panne du on-prem).

### 1.5 Identites d'application

- **App registration** (definition globale de l'application) vs **Enterprise application / service principal** (instance dans un tenant, ou on assigne utilisateurs, consentement, SSO).
- **Consentement** : utilisateur vs administrateur ; limiter le consentement utilisateur aux editeurs verifies.
- **Managed identity** : le plus sur ; pas de secret ; attribuee a une ressource Azure (**system** ou **user-assigned**).
- **Workload identity federation** (federated credentials) : GitHub/AKS/autres IdP -> pas de secret.
- Si secret inevitable : **certificat > secret**, expiration courte, stockage dans **Key Vault**, **rotation** automatique.

### 1.6 Key Vault : conception

- **Un coffre par application et par environnement** (limite du rayon d'impact, RBAC distinct) ; pas de coffre unique geant.
- **RBAC Azure** (recommande) plutot que les access policies.
- **Soft delete + purge protection** obligatoires pour les cles de chiffrement (CMK).
- **Reseau** : Private Endpoint + pare-feu ; "Allow trusted Microsoft services" selon besoin.
- **Rotation et expiration**, evenements Event Grid `SecretNearExpiry`.
- Hierarchie de chiffrement : **Key Encryption Key (KEK)** dans Key Vault chiffre la **Data Encryption Key (DEK)** utilisee par le service (envelope encryption).

**Savoir-faire** : concevoir l'acces d'une application Azure a Key Vault sans secret ; choisir PHS/PTA/federation selon des contraintes ; definir 5 politiques CA de base ; expliquer l'interet d'un compte break-glass.

---

## 2. Gouvernance et landing zone

### 2.1 Azure Landing Zone (CAF)

Principes de conception :
- **Separation** plateforme / workloads ; **abonnement = unite de mise a l'echelle** (quotas, facturation, isolation).
- **Hierarchie de management groups** modeste (3-4 niveaux) ; politiques **heritees**.
- **Subscription vending** : creation automatisee d'abonnements pre-configures.
- **Hub-spoke ou Virtual WAN** pour la connectivite ; **identite centralisee**.
- **Politiques en "guardrails"** (Deny/Audit/DeployIfNotExists) plutot que revues manuelles.

### 2.2 Azure Policy : effets et ordre

| Effet | Action | Cas d'usage |
|-------|--------|-------------|
| `Deny` | Bloque la creation/modification non conforme | Regions interdites, SKU interdits |
| `Audit` / `AuditIfNotExists` | Marque non conforme sans bloquer | Evaluer avant d'imposer |
| `Append` | Ajoute des champs a la demande | Anciennement tags/regles IP |
| `Modify` | Ajoute/modifie des proprietes (tags...) ; **necessite une identite manage** pour la remediation | Heritage de tags |
| `DeployIfNotExists` | Deploie une ressource associee si absente ; **identite manage** | Activer diagnostics, agent, Defender |
| `Disabled` | Desactive la regle | Tests |
| `DenyAction` | Bloque une action (ex. suppression) | Proteger contre `DELETE` |

Ordre d'evaluation : `Disabled` -> `Append`/`Modify` -> `Deny` -> `Audit`.
- **Initiative** (policy set) : regroupe des regles, une seule assignation.
- **Exemptions** : pour des exceptions **documentees et datees** (waiver / mitigated).
- **Remediation tasks** : corrigent les ressources **existantes** (la politique ne s'applique qu'aux nouvelles/modifiees sinon).
- Politique != RBAC : un utilisateur **Owner** est quand meme bloque par un `Deny`.

### 2.3 Gouvernance des couts et des acces

- **Tags** obligatoires + Policy pour heritage ; **budgets** a differents niveaux ; **Cost Management exports**.
- **RBAC** : donner les roles a des **groupes**, a la portee la plus basse ; **roles personnalises** si necessaire (JSON `Actions`/`NotActions`/`DataActions`).
- **Deny assignments** (non creables directement hors Blueprints/Managed Apps/Deployment Stacks).
- **Resource locks** protegent contre l'**action** de suppression/modification, y compris pour les Owners (il faut retirer le verrou).

**Savoir-faire** : dessiner une hierarchie MG pour une entreprise avec filiales et environnements ; choisir l'effet de policy adapte ; expliquer pourquoi `DeployIfNotExists` necessite une managed identity.

---

## 3. Supervision

### 3.1 Conception des espaces de travail Log Analytics

| Critere | Un seul workspace | Plusieurs workspaces |
|---------|-------------------|----------------------|
| Correlation / requetes croisees | **Simple** | Requetes cross-workspace (plus lourd) |
| Cout | Tarifs par **engagement** (commitment tiers) plus avantageux | Moins d'effet d'echelle |
| Residence des donnees | Une region | **Un workspace par region/juridiction** |
| Isolation des droits | RBAC par table / ressource-context | Isolation stricte |
| Facturation separee | Via tags/Workbooks | Natif |

Modes d'acces : **workspace-context** (acces au workspace entier) vs **resource-context** (acces uniquement aux logs des ressources sur lesquelles on a RBAC).
Niveaux de tables : **Analytics** (requetes completes, alertes), **Basic** (moins cher, requetes limitees, retention courte), **Auxiliary** (stockage tres bon marche, audit/conformite). **Archive** pour longue conservation (jusqu'a 12 ans).

### 3.2 Alertes et reponse

| Type | Latence | Usage |
|------|---------|-------|
| **Metrique** | ~1 min | Seuil sur CPU, disque ; **dynamique** (apprentissage) |
| **Log (KQL)** | Quelques minutes | Requetes complexes, correlations |
| **Activity log** | Evenements de plan de controle | Suppression de ressource, changement de politique |
| **Service Health** | Incidents Azure | Impact regional |

**Action groups** : email/SMS/voix, webhook, **Logic App**, **Function**, ITSM ; reutilisables. **Alert processing rules** : suppression pendant maintenance.

KQL a savoir lire :
```kusto
// Taux d'erreurs HTTP 5xx par 5 minutes
AppRequests
| where TimeGenerated > ago(1h)
| summarize total = count(), erreurs = countif(toint(ResultCode) >= 500) by bin(TimeGenerated, 5m)
| extend taux = todouble(erreurs) / total
| where taux > 0.05
```

### 3.3 Collecte moderne

- **Azure Monitor Agent (AMA)** + **Data Collection Rules (DCR)** : remplacent Log Analytics agent (MMA, retire) ; filtrage/transformation a la source (reduction de cout).
- **Diagnostic settings** par ressource -> Log Analytics / Storage (archive bon marche) / Event Hubs (SIEM tiers).
- **Microsoft Sentinel** : SIEM/SOAR sur Log Analytics ; connecteurs, regles analytiques, playbooks (Logic Apps).

**Savoir-faire** : choisir 1 vs N workspaces ; ecrire une alerte log simple ; expliquer comment reduire le cout de logs (DCR, tiers de tables, retention).

---

## 4. Reseau : conception detaillee

### 4.1 Plan d'adressage

- Plages **RFC 1918** non chevauchantes (VNets, on-prem, autres clouds).
- Prevoir la croissance : un VNet `/16` par spoke est courant ; sous-reseaux dedies : `GatewaySubnet` (/27 minimum recommande), `AzureFirewallSubnet` (/26), `AzureBastionSubnet` (/26), sous-reseau de **Private Endpoints**.
- Azure reserve **5 adresses** par sous-reseau (x.x.x.0-3 et la derniere).

### 4.2 Peering et transit

| Fonction | Detail |
|----------|--------|
| **VNet peering** | Faible latence, backbone Microsoft ; **non transitif** ; peut etre **global** (inter-regions) |
| **Gateway transit** | Un spoke peut utiliser la **gateway VPN/ER du hub** (`allow gateway transit` + `use remote gateways`) |
| **Forwarded traffic** | A autoriser pour qu'un NVA/Firewall du hub relaie |
| **UDR (User Defined Routes)** | Forcer le trafic via le pare-feu ; route `0.0.0.0/0` -> Firewall pour l'**egress** central |
| **BGP / route propagation** | Routes dynamiques depuis VPN/ER ; desactiver la propagation sur un sous-reseau pour forcer les UDR |

**Virtual WAN vs hub-spoke manuel**

| | Hub-spoke manuel | Virtual WAN |
|---|------------------|-------------|
| Administration | Vous gerez routage/peerings | **Manage** (routage automatique, transit) |
| Echelle | Dizaines de spokes | Centaines de branches/VNets |
| Flexibilite | Maximale (NVA custom) | Moindre, mais integrations (NVA partenaires, SD-WAN) |
| Quand ? | Peu de sites, besoins specifiques | **Beaucoup de branches**, minimiser l'exploitation |

### 4.3 Connectivite hybride

| Solution | Debit | Latence | Cout | Remarques |
|----------|-------|---------|------|-----------|
| **VPN S2S** | Jusqu'a ~10 Gb/s agrege par gateway (selon SKU) | Variable (Internet) | Faible | IPsec ; **active-active** + **zone-redundant** pour HA |
| **ExpressRoute** | 50 Mb/s - 10 Gb/s (circuit), jusqu'a 100 Gb/s (Direct) | Faible, previsible | Eleve | **Prive** (hors Internet) ; **2 connexions** redondantes par circuit ; **Premium** = geo-etendu / plus de routes |
| **ER + VPN secours** | | | | **Resilience** maximale |
| **Global Reach** | | | | Relie des sites on-prem entre eux via Microsoft |
| **FastPath** | | | | Contourne la gateway pour reduire la latence |

Peering ExpressRoute : **prive** (VNets), **Microsoft** (Microsoft 365, services PaaS publics).
Resilience : circuits dans **plusieurs emplacements de peering** pour survivre a la perte d'un site.

### 4.4 Services de protection et de distribution

| Besoin | Service |
|--------|---------|
| L3/L4 par sous-reseau/NIC | **NSG** (stateful) |
| FQDN/URL, IDPS, TLS inspection, egress central | **Azure Firewall** (Standard/Premium) |
| WAF OWASP | **WAF** sur Application Gateway ou Front Door |
| DDoS reseau | **DDoS Protection** (SKU Network/IP) |
| Acces admin sans IP publique | **Bastion** |
| NAT sortant evolutif (SNAT) | **NAT Gateway** (evite l'epuisement des ports SNAT) |
| DNS hybride | **DNS Private Resolver** (inbound/outbound endpoints) |
| Resolution privee des PaaS | **Private DNS zones** (`privatelink.*`) liees aux VNets |

### 4.5 Load balancing : tableau definitif

| Service | OSI | Portee | WAF | Protocoles | Choisir quand |
|---------|-----|--------|-----|------------|---------------|
| **Load Balancer** (Standard) | L4 | Regional (zone-redundant) | Non | TCP/UDP | Trafic non HTTP, performances ; **cross-region LB** pour L4 global |
| **Application Gateway v2** | L7 | Regional (zones) | **Oui** | HTTP/S, HTTP/2, WebSocket | Routage par URL/hote, TLS, WAF en region |
| **Front Door** | L7 | **Global** | **Oui** | HTTP/S | Acceleration, multi-region, cache, WAF global |
| **Traffic Manager** | DNS | Global | Non | **Tout** | Bascule DNS, non-HTTP, simple et economique |

### 4.6 Private Link : pieges

- Private Endpoint = **interface reseau + IP privee** vers **une** ressource/sous-ressource (ex. `blob`, `file` sont des endpoints distincts).
- **DNS** : sans zone `privatelink.*` liee au VNet (et aux resolveurs on-prem via **forwarders/Private Resolver**), le nom resout vers l'IP **publique** -> echec quand l'acces public est coupe.
- **NSG/UDR** sur sous-reseau de PE : support a activer (`PrivateEndpointNetworkPolicies`).
- **Service Endpoint** : route optimisee, IP source privee visible par le service, **pas** d'acces on-prem, ressource accessible **publiquement** malgre tout.
- **Private Link Service** : exposer **votre** service derriere un Standard LB a d'autres VNets/tenants.

**Savoir-faire** : dessiner un hub-spoke avec pare-feu, gateway et DNS prive ; expliquer pourquoi un PE ne marche pas depuis le on-prem (DNS) ; choisir le bon LB en 10 secondes.

---

## 5. Donnees : choix et dimensionnement

### 5.1 Azure SQL : decision approfondie

| Question | Si oui |
|----------|--------|
| Besoin d'**SQL Agent**, requetes **inter-bases**, CLR, Service Broker, DB Mail, **migration quasi sans changement** | **SQL Managed Instance** |
| Acces a l'**OS**, version non supportee, SSRS/SSIS/SSAS **sur la meme machine**, logiciel tiers installe | **SQL Server sur VM** |
| Nouvelle application, base unique, **moins d'administration** | **SQL Database** |
| Charge **intermittente** imprevisible | **Serverless** (pause auto) |
| **Nombreuses bases** a pics decales | **Pool elastique** |
| **> 4 To** a ~100 To, restauration rapide, scale-out lecture | **Hyperscale** |
| Latence minimale, replicas de lecture integres, IO fort | **Business Critical** |
| **DR** multi-region d'un ensemble de bases | **Auto-failover group** |

DTU vs vCore : **vCore** pour flexibilite, **Hybrid Benefit** et **reservations** ; DTU pour simplicite.
Sauvegardes : **PITR** (par defaut 7 j, jusqu'a 35 j), **LTR** (jusqu'a 10 ans), redondance du stockage de sauvegarde (LRS/ZRS/GRS).

### 5.2 Cosmos DB : RU et partitionnement

- **RU/s** : unite de debit (lecture 1 Ko par cle = ~1 RU ; ecriture de 1 Ko ~ 5 RU, ordres de grandeur).
- **Provisionne manuel**, **autoscale** (10 % a 100 % du max), **serverless** (charges faibles/intermittentes, limites).
- **Partition key** : forte cardinalite, repartition uniforme, presente dans les requetes principales ; **hot partition** = goulot ; partition logique max 20 Go.
- **Multi-region writes** : resolution de conflits (LWW par defaut) ; latence locale.
- **Change feed** : flux d'evenements -> Functions/pipelines (event sourcing, materialisation).
- **Choisir le niveau de coherence** : Strong (finance, **cout** latence/dispo ; pas avec multi-region writes), **Session** (defaut, apps utilisateur), **Eventual** (compteurs, flux non critiques).
- API : NoSQL (natif, recommande pour nouvelle app), **MongoDB/Cassandra** (compatibilite de migration), Gremlin (graphe), Table.

### 5.3 Stockage : options de performance

| Besoin | Option |
|--------|--------|
| Blobs a forte transaction/faible latence | **Premium block blob** |
| Partages de fichiers SMB, profils | **Azure Files Premium** (SSD) |
| NFS/SMB tres performant, SAP HANA, HPC, Oracle | **Azure NetApp Files** (niveaux Standard/Premium/Ultra) |
| Disques VM | Premium SSD (production), **Premium SSD v2** (IOPS/debit reglables), **Ultra Disk** (sub-ms) ; **bursting** pour pics |
| Donnees chaudes -> froides | **Lifecycle management** (Hot -> Cool -> Cold -> Archive) |

### 5.4 Analytique et ingestion

```
Sources -> [Event Hubs / IoT Hub] -> [Stream Analytics / Spark Streaming] -> hot path (alertes, dashboards)
                         \-> [Capture] -> [ADLS Gen2] -> [Synapse / Fabric / Databricks] -> cold path (BI)
Batch / ETL : [Data Factory] -> ADLS Gen2 -> transformation -> entrepot (Synapse/Fabric) -> Power BI
```

- **IoT Hub** (bidirectionnel, gestion d'appareils) vs **Event Hubs** (ingestion pure, debit).
- **Medallion** : bronze (brut) -> silver (nettoye) -> gold (agrege).
- **Purview** : catalogue, lineage, classification.

**Savoir-faire** : justifier un choix SQL en 3 contraintes ; choisir une partition key Cosmos ; dessiner un pipeline IoT hot/cold path.

---

## 6. Continuite : calculs et conception DR

### 6.1 SLA composites : exercices

**Serie** : `A x B x C`.
- Front Door (99,99 %) -> App Service (99,95 %) -> SQL (99,99 %) :
  `0,9999 x 0,9995 x 0,9999 = 0,99930` -> **99,93 %**.

**Parallele (deux regions actives)** : `1 - (1-A)(1-B)`.
- Chaque region = App Service x SQL = 99,94 % (`0,9994`).
- Deux regions : `1 - (0,0006)^2 = 1 - 0,00000036 = 99,999964 %`.
- Mais il faut inclure le **routeur global** (Front Door 99,99 %) en serie :
  `0,9999 x 0,99999964 ~ 99,99 %`. Le **point commun** (Front Door) devient le plafond !
- Lecon : la redondance n'ameliore pas **au-dela** du composant unique partage.

**Conversion temps** : 99,9 % = 8,76 h/an ; 99,95 % = 4,38 h ; 99,99 % = 52,6 min ; 99,999 % = 5,26 min.

### 6.2 Disponibilite dans une region

| Mecanisme | Protege de | Notes |
|-----------|-----------|-------|
| **Availability Zones** | Panne d'un datacenter | Zonal (epingle) vs zone-redundant (automatique) ; latence inter-zones < 2 ms environ |
| **Availability Set** | Rack/maintenance | Domaines de panne (FD) / de mise a jour (UD) ; non disponible avec zones |
| **VMSS flexible** | Repartition zones/FD | Autoscale |
| **Redondance de zone** services PaaS | Zone | App Service (plan zone-redundant), SQL, Storage ZRS, AKS (zones), Application Gateway v2, LB Standard |

### 6.3 Reprise regionale (DR)

| Strategie | RTO | RPO | Cout |
|-----------|-----|-----|------|
| **Backup/restore** | Heures-jours | Heures | $ |
| **Pilot light** | Dizaines de minutes | Minutes | $$ |
| **Warm standby** | Minutes | Minutes/secondes | $$$ |
| **Actif-actif** | ~0 | ~0-secondes | $$$$ |

- **ASR** : replication **asynchrone** de VM (RPO de l'ordre de la minute), **plans de reprise** (ordre de demarrage, scripts), **test de failover** non destructif, retour (failback).
- **Regions jumelees** : mises a jour sequencees, priorite de restauration en cas de panne regionale, GRS replique vers la region jumelee. Toutes les regions n'ont pas de jumelle (certaines **zones de disponibilite** suffisent).
- **Data** : SQL FG (RPO ~ secondes), Cosmos multi-region, Storage GRS/GZRS (**RPO ~15 min non garanti**), Backup cross-region restore.
- **Tests** : failover reguliers ; **Azure Chaos Studio** (injection de pannes) ; **Load Testing**.
- **App Service multi-region** : deux plans + Front Door ; configuration et secrets reproduits ; base de donnees geo-repliquee.
- **AKS multi-region** : deux clusters + Front Door/Traffic Manager + GitOps ; donnees via services geo-repliques.

### 6.4 Sauvegarde : choix

| Charge | Solution |
|--------|----------|
| VM Azure | Azure Backup (instantane + coffre) |
| SQL dans une VM / SAP HANA | Azure Backup (agent workload) |
| Azure SQL DB / MI | Sauvegardes automatiques (PITR/LTR) |
| Blobs | Soft delete, versioning, PITR, **Backup vault** (operationnel/coffre) |
| Azure Files | Azure Backup (instantanes) |
| Serveurs on-prem | MARS (fichiers), **MABS/DPM** (workloads) |
| Disques / AKS / PostgreSQL | **Backup vault** |

**Securite des sauvegardes** : soft delete (14 j+), **immutable vault**, **MUA via Resource Guard**, chiffrement CMK, isolation (**abonnement separe** pour les coffres de sauvegarde critiques), alertes sur suppressions.

**Savoir-faire** : calculer un SLA composite (serie/parallele avec point commun) ; choisir DR selon RTO/RPO/cout ; concevoir un backup resistant au ransomware.

---

## 7. Calcul et applications : arbres de decision

### 7.1 Choisir le calcul

```
Besoin de controle OS / logiciel legacy / drivers ?
  |-- Oui -> Virtual Machines (+ VMSS pour la mise a l'echelle)
  |-- Non -> Conteneurs ?
        |-- Oui -> Besoin de l'API Kubernetes / ecosysteme / controle fin ?
        |         |-- Oui -> AKS
        |         |-- Non -> Microservices/HTTP/evenements, scale-to-zero ? -> Container Apps
        |                    Tache courte isolee ? -> Container Instances
        |-- Non -> Application web/API ? -> App Service
                   Code evenementiel court ? -> Functions
                   Workflow d'integration low-code ? -> Logic Apps
                   Calcul par lots / HPC ? -> Batch
```

**Functions : plans**

| Plan | Mise a l'echelle | Cold start | VNet | Limite de duree | Facturation |
|------|------------------|-----------|------|-----------------|-------------|
| **Consumption** | A zero, auto | Oui | Limite | ~5-10 min | A l'execution |
| **Flex Consumption** | Auto, instances toujours pretes optionnelles | Reduit | Oui | Plus long | A l'usage |
| **Premium** | Instances pre-chauffees | **Non** | **Oui** | Long | Instances reservees |
| **Dedicated (App Service)** | Manuelle/auto | Non (Always On) | Oui | Illimitee | Plan App Service |

**App Service** : slots de deploiement (swap sans interruption, **warm-up**), autoscale (regles/planification), **VNet integration** (sortie) + **Private Endpoint** (entree), **ASE v3** (isolation, VNet dedie, forte echelle).

**AKS : decisions de conception**
- **Reseau** : **Azure CNI** (IP VNet par pod ; planifier l'espace d'adressage) ; **CNI Overlay** (economise les IP) ; kubenet (simple, limites).
- **Identite** : Entra ID + RBAC K8s ; **Workload Identity** pour les pods ; managed identity du cluster.
- **Noeuds** : pools **system** vs **user**, zones, autoscaler, **spot pools**, pools GPU.
- **Mises a jour** : canaux d'upgrade, fenetres de maintenance, surge.
- **Securite** : cluster prive, Azure Policy for K8s, Defender for Containers, Key Vault CSI driver, ACR + scan.
- **Ingress** : App Gateway for Containers / AGIC / NGINX ; **WAF**.
- **Observabilite** : Container Insights, Managed Prometheus + Grafana.

**Container Apps vs AKS**

| | Container Apps | AKS |
|---|----------------|-----|
| Complexite | Faible (pas d'API K8s) | Elevee |
| Scale-to-zero | Oui (KEDA) | Possible (KEDA) mais a configurer |
| Controle (CRD, operateurs, service mesh complet) | Limite | **Total** |
| Dapr / evenements | Integre | Add-on |
| Quand | Microservices standard, equipes sans K8s | Plateforme K8s, besoins avances |

### 7.2 Messagerie : decision

| Question | Service |
|----------|---------|
| Message critique, **ordre FIFO**, transactions, dead-letter, **topics/abonnements avec filtres**, planification | **Service Bus** (Premium pour isolation/VNet/gros messages) |
| File simple, tres gros volume, cout minimal, > 80 Go de file | **Storage Queue** |
| **Reaction** a un evenement Azure/SaaS (push, filtrage, fan-out) | **Event Grid** |
| **Flux** haut debit, telemetrie, replay, partitions, Kafka | **Event Hubs** |
| Appareils IoT bidirectionnels | **IoT Hub** |

Patterns : **Competing consumers**, **Queue-based load leveling**, **Priority queue**, **Claim check** (message = reference, donnees dans Blob), **Saga** (transactions distribuees), **Outbox**.

### 7.3 API et integration

- **API Management** : tiers (Consumption, Developer, Basic, Standard, Premium) ; **Premium** = multi-region, VNet, zones ; politiques (rate-limit, validate-jwt, cache, transform) ; **self-hosted gateway** (on-prem/multi-cloud).
- **Logic Apps** : connecteurs, workflows declaratifs (Consumption vs Standard) ; **Durable Functions** : orchestration en code (fan-out/fan-in, human interaction).
- **Front Door/CDN** : cache statique et acceleration.

**Savoir-faire** : parcourir l'arbre de decision calcul en 30 s ; choisir Service Bus/Event Grid/Event Hubs ; expliquer les plans Functions.

---

## 8. Migration

### 8.1 Demarche (CAF)

1. **Decouvrir** (Azure Migrate : appliance, dependances).
2. **Evaluer** (compatibilite, dimensionnement, **cout** TCO, **readiness**).
3. **Planifier** vagues (groupes d'applications, dependances).
4. **Migrer** (replication, test de migration, cutover).
5. **Optimiser** (right-sizing, reservations, PaaS).

### 8.2 Choix de l'approche

| Contrainte | Approche |
|------------|----------|
| Delai court, peu de changements | **Rehost** (lift-and-shift) |
| Reduire l'exploitation sans reecriture | **Replatform/Refactor** (SQL MI, App Service) |
| Modernisation profonde | **Rearchitect/Rebuild** |
| Application SaaS equivalente | **Replace** |
| Non migrable / reglementaire | **Hybride (Arc)** ou **retention on-prem** |

**Migration de BD** : **online** (replication continue, **cutover** court) vs **offline** (arret) ; DMS ; **Data Migration Assistant** (compatibilite) ; **Log Replay Service / MI link** pour SQL MI.
**Donnees massives** : **Data Box** (disque/Heavy), **AzCopy**, ExpressRoute ; **Data Box Gateway** (flux continu).
**VMware** : **Azure VMware Solution** (migration sans changement) vs conversion en VM Azure (Azure Migrate).
**Web apps** : **App Service Migration Assistant** / Azure Migrate web apps.

**Savoir-faire** : proposer une strategie 5R pour un portefeuille ; choisir online/offline ; estimer l'utilite de Data Box.

---

## 9. Cout et Well-Architected

### 9.1 Reservations vs Savings Plans

| | Reservation | Savings Plan (compute) |
|---|-------------|------------------------|
| Engagement | Sur une **ressource precise** (taille/region) | Sur une **depense horaire** |
| Flexibilite | Moindre (echange possible) | **Elevee** (famille, region, services) |
| Remise | **Plus forte** sur la ressource ciblee | Un peu moindre |
| Quand | Charge **stable et connue** | Charge **variable**, evolution des tailles/regions |

**Spot** : eviction avec preavis ; **checkpoints** ; pools mixtes (spot + a la demande). **Hybrid Benefit** : licences Windows/SQL (+ RHEL/SUSE). **Dev/Test** : tarif reduit. **Arret/desallocation** : une VM arretee *non desallouee* est facturee.

### 9.2 Piliers WAF : questions typiques

| Pilier | Question |
|--------|----------|
| Fiabilite | Quelle est la **charge de travail critique** et son SLO ? Zones ? DR ? |
| Securite | **Zero Trust** (verifier explicitement, moindre privilege, supposer la compromission) ? Identites, reseau, donnees |
| Cout | Quelle est la **valeur** par euro ? Gaspillage ? Reservations ? |
| Excellence op. | IaC ? CI/CD ? Observabilite ? Runbooks ? |
| Performance | Scalabilite, cache, CDN, choix de SKU, tests de charge |

Compromis types : **fiabilite vs cout** (multi-region ou non), **securite vs performance** (inspection TLS), **cout vs performance**.

---

## 10. Infrastructure as Code pour AZ-305

L'examen cite **Bicep/ARM** ; en entreprise on utilise souvent **Terraform** (voir [cours Terraform](../terraform/README.md), lab 5).

| Sujet | Bicep | Terraform |
|-------|-------|-----------|
| Etat | **Aucun** (ARM est la source de verite) | Fichier d'etat a gerer/proteger |
| Nouvelles fonctions Azure | **Jour 0** | Attendre le provider (ou **azapi**) |
| Multi-cloud | Non | Oui |
| Previsualisation | `what-if` | `plan` |
| Modules | Registre Bicep, **Template Specs** | Registry, **AVM** |
| Suppression | Mode `Complete` (dangereux) / **Deployment Stacks** | `destroy` / retrait de config |

**Deployment Stacks** : gerent le cycle de vie d'un ensemble de ressources (suppression/protection `denySettings`), remplace en partie Blueprints.
**AVM (Azure Verified Modules)** : modules officiels Bicep/Terraform alignes WAF.

---

## 11. Etudes de cas completes

### Cas 1 - "Northwind Logistics" (hybride + identite + DR)

**Contexte** : Northwind a 3 datacenters on-prem, AD DS sur 2 forets, 400 VM, 60 applications. Objectifs : migration en 18 mois, **identite unique**, **connexion privee stable**, **DR** (RTO 2 h, RPO 15 min) pour les 10 applications critiques, **conformite RGPD (donnees en UE)**, equipe d'exploitation reduite.

**Reponses attendues**
- **Identite** : Entra Connect **Cloud Sync** (2 forets) ou Connect Sync + **PHS + Seamless SSO** ; MFA via **Conditional Access** ; **PIM** pour les admins ; **break-glass**.
- **Connectivite** : **ExpressRoute** (2 circuits/2 emplacements) + **VPN S2S** de secours ; **Virtual WAN** si beaucoup de sites, sinon hub-spoke + gateway ; **Private Endpoints** + **DNS Private Resolver**.
- **Migration** : **Azure Migrate** (assessment/dependances) en vagues ; **rehost** majoritaire, **SQL MI** pour les bases lourdes (SQL Agent) ; **Data Box** si gros volumes de fichiers.
- **DR critiques** : **ASR** (RPO de l'ordre de la minute < 15 min) vers une region de DR **dans l'UE** (France Central est jumelee a France South, a acces restreint : verifier les regions utilisables, sinon choisir West Europe/North Europe) ; SQL **auto-failover group**.
- **Conformite/gouvernance** : **Azure Policy** "Allowed locations" ; **management groups** ; Defender for Cloud.
- **Exploitation reduite** : PaaS autant que possible, **Azure Monitor** centralise, **Update Manager**, **Backup**, IaC.

### Cas 2 - "Contoso Health" (donnees sensibles)

**Contexte** : application de dossiers medicaux (PaaS), donnees sensibles, exigences **chiffrement avec cles du client**, **aucun acces public**, audit complet, retention 10 ans non modifiable.

**Reponses attendues** : **Private Endpoints** pour SQL/Storage/Key Vault, **acces public desactive**, **CMK** dans **Key Vault Premium/Managed HSM** (purge protection) avec rotation, **TDE** avec CMK, **Always Encrypted** pour colonnes ultra-sensibles, **managed identities**, **Blob immutable (WORM)** + Archive pour la retention, **diagnostic settings -> Log Analytics** + **Sentinel**, **Policy** (Deny public access, exiger CMK), **Defender for Cloud**.

### Cas 3 - "Fabrikam Games" (global, pics de charge)

**Contexte** : jeu en ligne mondial, pics tres eleves, classements en temps reel, profils joueurs JSON, evenements de jeu a analyser.

**Reponses attendues** : **Front Door** + **AKS ou Container Apps** multi-region ; **Cosmos DB multi-region (Session)** pour profils ; **Azure Cache for Redis** (classements, sorted sets) ; **Event Hubs** pour les evenements -> **Stream Analytics/Fabric** + **ADLS** ; **Autoscale** + **tests de charge** ; **Savings Plan** pour la base + **Spot** pour le batch d'analyse.
