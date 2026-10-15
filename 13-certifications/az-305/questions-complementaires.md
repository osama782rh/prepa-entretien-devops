# AZ-305 - Questions complementaires

16 questions supplementaires : gouvernance, messagerie, reseau, calculs de SLA, migration, couts.

## Domaine 1 - Identite, gouvernance et supervision

### Q1
Vous devez garantir que **toutes les nouvelles ressources** de 30 abonnements recoivent automatiquement un parametre de diagnostic vers Log Analytics. Quelle solution ?

- A. Un script PowerShell lance manuellement
- B. **Azure Policy `DeployIfNotExists`** assignee a un management group
- C. Un resource lock
- D. Un tag obligatoire

<details><summary>Reponse</summary>

**B.** DeployIfNotExists deploie la configuration manquante (avec une identite managee de remediation) et s'applique a toute la hierarchie via le management group.
</details>

### Q2
Des administrateurs ont besoin du role Owner **seulement quelques heures par mois**, avec approbation et journalisation. Quelle fonctionnalite ?

- A. Role assignment permanent
- B. Acces conditionnel
- C. **Privileged Identity Management (PIM)** : activation Just-In-Time
- D. Entra B2B

<details><summary>Reponse</summary>

**C.** PIM fournit des roles eligibles, activation temporaire, MFA, justification et approbation (necessite Entra ID P2).
</details>

### Q3
Une application sur une VM Azure doit lire un secret dans Key Vault **sans stocker d'identifiants**. Quelle approche ?

- A. Stocker un client secret dans le fichier de configuration
- B. Utiliser une cle de stockage
- C. Une **identite managee** de la VM avec un role/une politique d'acces sur Key Vault
- D. Rendre le Key Vault public

<details><summary>Reponse</summary>

**C.** L'identite managee obtient des jetons Entra automatiquement ; aucun secret a stocker ni a faire tourner.
</details>

### Q4
Vous concevez l'espace de travail **Log Analytics**. Aucune contrainte de souverainete des donnees, equipes multiples. Quelle conception est recommandee par defaut ?

- A. Un workspace par ressource
- B. Un **workspace centralise** avec RBAC adapte (par ressource ou table)
- C. Un workspace par developpeur
- D. Aucun workspace

<details><summary>Reponse</summary>

**B.** Un nombre reduit de workspaces simplifie les requetes et la correlation ; on en separe seulement pour la souverainete, la facturation distincte ou une isolation de securite.
</details>

## Domaine 2 - Donnees

### Q5
Une application mondiale doit lire ses **propres ecritures immediatement** avec une faible latence, sans les couts de la coherence forte. Quel niveau de coherence Cosmos DB ?

- A. Strong
- B. Eventual
- C. **Session**
- D. Consistent Prefix

<details><summary>Reponse</summary>

**C.** Session garantit la lecture de ses propres ecritures dans une session client (c'est le niveau par defaut le plus utilise). Strong est limite en latence/geo ; Eventual ne garantit pas l'ordre.
</details>

### Q6
Vous hebergez 200 bases Azure SQL de petites applications, chacune avec des pics a des moments differents. Quelle option optimise le cout ?

- A. 200 bases provisionnees individuellement au pic
- B. **Un pool elastique (elastic pool)**
- C. Hyperscale pour chaque base
- D. 200 SQL Managed Instances

<details><summary>Reponse</summary>

**B.** Le pool partage les ressources entre bases dont les pics ne coincident pas.
</details>

### Q7
Des documents reglementaires doivent etre conserves **7 ans sans modification ni suppression**, meme par un administrateur. Que configurer ?

- A. Un verrou de ressource
- B. Un acces SAS en lecture seule
- C. **Immutable storage** (WORM) avec politique de retention verrouillee
- D. Le chiffrement avec cle client

<details><summary>Reponse</summary>

**C.** Une politique de retention basee sur le temps, une fois verrouillee, empeche modification et suppression. Un verrou de ressource ne protege pas les donnees du blob.
</details>

### Q8
Vous migrez une base SQL Server on-premise vers Azure avec **temps d'arret minimal**. Quel outil ?

- A. Copie manuelle de fichiers .bak par FTP
- B. **Azure Database Migration Service** (mode en ligne) / Azure Migrate
- C. Azure Backup
- D. Data Box

<details><summary>Reponse</summary>

**B.** La migration en ligne synchronise en continu puis permet une bascule courte. Data Box sert au transfert massif hors ligne.
</details>

## Domaine 3 - Continuite

### Q9
Une application depend en serie de deux composants avec SLA **99,95 %** et **99,9 %**. Quel est le SLA composite approximatif ?

- A. 99,95 %
- B. 99,9 %
- C. **99,85 %**
- D. 99,99 %

<details><summary>Reponse</summary>

**C.** Composants en serie : 0,9995 x 0,999 = 0,9985 -> **99,85 %**. Il est toujours inferieur au plus faible. La redondance (parallele) l'ameliore.
</details>

### Q10
Vous devez repliquer des VM IaaS vers une autre region pour le DR avec un **RPO de quelques minutes** et des plans de basculement orchestres. Quel service ?

- A. Azure Backup
- B. **Azure Site Recovery**
- C. Snapshots manuels
- D. Traffic Manager

<details><summary>Reponse</summary>

**B.** ASR realise la replication continue et les plans de recuperation. Backup protege les donnees mais avec un RPO plus long (sauvegardes planifiees).
</details>

### Q11
Les sauvegardes doivent survivre a une **suppression malveillante** par un attaquant ayant des droits. Que activer ?

- A. Rien, Azure Backup est inviolable
- B. **Soft delete et immutabilite du coffre Recovery Services**, MFA pour les operations critiques
- C. Une IP publique
- D. Un tag "ne pas supprimer"

<details><summary>Reponse</summary>

**B.** Soft delete conserve les sauvegardes supprimees plusieurs jours ; l'immutabilite empeche la reduction de retention ou la suppression prematuree.
</details>

## Domaine 4 - Infrastructure

### Q12
Vous avez besoin d'un equilibreur **global HTTP(S)** avec WAF, acceleration et basculement entre regions. Quel service ?

- A. Azure Load Balancer
- B. Application Gateway
- C. Traffic Manager
- D. **Azure Front Door**

<details><summary>Reponse</summary>

**D.** Front Door est un point d'entree global de couche 7 avec WAF et CDN. Application Gateway est regional ; Traffic Manager est du DNS sans proxy.
</details>

### Q13
Des commandes doivent etre traitees **dans l'ordre**, de facon transactionnelle, avec files d'attente de lettres mortes. Quel service de messagerie ?

- A. Event Grid
- B. Event Hubs
- C. Storage Queue
- D. **Service Bus** (sessions, dead-letter)

<details><summary>Reponse</summary>

**D.** Service Bus offre l'ordre FIFO via sessions, transactions, dead-letter et detection de doublons. Event Grid = evenements reactifs ; Event Hubs = flux de telemetrie.
</details>

### Q14
Une equipe veut deployer des **microservices conteneurises** avec mise a l'echelle jusqu'a zero, sans gerer de cluster Kubernetes. Quel service ?

- A. AKS
- B. VM Scale Sets
- C. **Azure Container Apps**
- D. Service Fabric

<details><summary>Reponse</summary>

**C.** Container Apps est serverless (KEDA, Dapr) sans administration de cluster. AKS apporte plus de controle mais plus d'operations.
</details>

### Q15
Dans une topologie **hub-spoke**, le trafic des spokes vers Internet doit passer par un pare-feu central. Que configurer ?

- A. Des NSG uniquement
- B. **Azure Firewall dans le hub + route definie par l'utilisateur (UDR) 0.0.0.0/0** sur les spokes
- C. Un peering sans route
- D. Une IP publique sur chaque VM

<details><summary>Reponse</summary>

**B.** L'UDR force le trafic vers l'appliance du hub. Les NSG filtrent mais ne centralisent pas l'inspection.
</details>

### Q16
Une liaison **ExpressRoute** est critique ; quelle conception ameliore sa resilience a faible cout ?

- A. Aucune redondance
- B. Ajouter une seconde ExpressRoute dans la meme ville uniquement
- C. **Ajouter une connexion VPN site-a-site** de secours (ou un second circuit sur un autre site)
- D. Utiliser uniquement Internet

<details><summary>Reponse</summary>

**C.** Un VPN en secours est l'option economique ; pour une haute disponibilite maximale, un second circuit dans un autre emplacement de peering.
</details>
