# Questions d'entrainement - GCP Professional Cloud DevOps Engineer

37 questions de type examen, classees par domaine. Cliquez sur "Reponse" pour afficher la correction.
Questions a choix unique sauf mention *(choisir 2)*.

> Methode : lisez la question, **identifiez la contrainte principale** (securite, effort operationnel, cout, disponibilite),
> eliminez 2 reponses, puis choisissez. Notez celles ratees et relisez le chapitre du cours correspondant.

---

## Domaine 1 - Bootstrapping de l'organisation

### Q1
Votre entreprise exige qu'**aucune VM de l'organisation** n'ait d'adresse IP externe, meme si un administrateur de projet dispose du role Owner. Que faites-vous ?

- A. Accorder `compute.instanceAdmin` uniquement aux equipes reseau
- B. Definir l'Organization Policy `constraints/compute.vmExternalIpAccess` au niveau organisation
- C. Creer une regle de pare-feu bloquant le trafic entrant sur toutes les VM
- D. Demander aux equipes de ne pas utiliser d'IP externe

<details><summary>Reponse</summary>

**B.** Les Organization Policies imposent des contraintes **independamment d'IAM** : meme un Owner ne peut pas les contourner. Le pare-feu (C) ne retire pas l'IP, IAM (A) n'est pas une garantie, et D n'est pas un controle technique.
</details>

### Q2
Un pipeline **GitHub Actions** doit deployer sur Cloud Run. La securite interdit les cles de compte de service JSON longue duree. Quelle solution ?

- A. Stocker la cle JSON dans les secrets GitHub et la renouveler tous les 90 jours
- B. Utiliser la **Workload Identity Federation** avec le fournisseur OIDC de GitHub
- C. Executer le pipeline sur une VM Compute Engine avec le compte par defaut
- D. Donner le role Editor a l'utilisateur qui lance le pipeline

<details><summary>Reponse</summary>

**B.** La Workload Identity Federation echange le jeton OIDC de GitHub contre des identifiants GCP **temporaires**, sans aucune cle. A garde une cle (meme renouvelee), C change l'architecture et utilise un compte trop permissif, D est trop large.
</details>

### Q3
Une equipe reseau centrale doit gerer **un reseau unique** partage par 15 projets applicatifs, tandis que chaque equipe garde le controle de ses propres ressources. Quelle architecture ?

- A. VPC Peering entre les 15 projets
- B. Un VPC par projet relie par Cloud VPN
- C. **Shared VPC** : un projet hote, 15 projets de service
- D. Un seul projet contenant tout

<details><summary>Reponse</summary>

**C.** Shared VPC centralise le reseau et la securite reseau dans le projet hote, tout en laissant chaque equipe gerer ses ressources dans son projet de service (role `compute.networkUser` sur les sous-reseaux). Le peering n'est pas transitif et decentralise la gestion ; D detruit l'isolation.
</details>

### Q4
Vous devez conserver les journaux d'audit de **tous les projets** de l'organisation pendant 7 ans, de facon **non modifiable** pour la conformite. Que configurez-vous ?

- A. Un sink par projet vers BigQuery
- B. Un **sink agrege au niveau organisation** (`--include-children`) vers un bucket Cloud Storage avec **retention policy verrouillee** (Bucket Lock)
- C. Augmenter la retention du bucket `_Required` a 7 ans
- D. Exporter manuellement les logs chaque mois

<details><summary>Reponse</summary>

**B.** Le sink agrege couvre tous les projets (presents et futurs) ; le Bucket Lock rend la retention irreversible. `_Required` est fixe a 400 jours et non modifiable (C). A est fastidieux, non garanti pour les futurs projets, et non immuable.
</details>

### Q5
Des developpeurs creent des cles JSON de comptes de service et les commitent par erreur dans Git. Quelle mesure **preventive** a le plus d'effet ?

- A. Former les developpeurs
- B. Activer la contrainte d'organisation `iam.disableServiceAccountKeyCreation` et utiliser des SA attaches / Workload Identity Federation
- C. Scanner les depots Git chaque semaine
- D. Faire tourner les cles toutes les semaines

<details><summary>Reponse</summary>

**B.** On supprime la cause : plus de creation de cles possible. Les autres options sont detectives ou palliatives.
</details>

### Q6
Une equipe de developpement doit pouvoir deployer des services Cloud Run en non-production mais **ne doit pas pouvoir modifier l'IAM**. Quelle approche respecte le moindre privilege ?

- A. Role Editor sur le projet
- B. Role Owner sur le projet de dev
- C. Role predefini `roles/run.developer` accorde a un **groupe Google** sur le dossier/projet non-prod
- D. Role personnalise accorde a chaque utilisateur individuellement

<details><summary>Reponse</summary>

**C.** Role predefini precis, accorde a un groupe, a la portee adequate. Editor/Owner sont trop larges (A, B) ; accorder a des individus (D) complique la gestion.
</details>

---

## Domaine 2 - CI/CD

### Q7
Un build Cloud Build doit appliquer des migrations sur une base **Cloud SQL a IP privee uniquement**. Quelle solution ?

- A. Ajouter l'IP publique de Cloud Build aux reseaux autorises
- B. Utiliser un **private pool Cloud Build** connecte a votre VPC
- C. Ouvrir la base a Internet temporairement
- D. Executer les migrations a la main

<details><summary>Reponse</summary>

**B.** Les private pools executent les builds dans un reseau prive (peering) ayant acces aux ressources VPC. Le pool par defaut n'y a pas acces ; les IP des workers par defaut ne sont pas fixes.
</details>

### Q8
Vous voulez **garantir que seules les images construites par votre pipeline** peuvent etre deployees sur GKE. Que mettez-vous en place ?

- A. Artifact Registry avec IAM restrictif uniquement
- B. **Binary Authorization** avec un attestor : le pipeline signe l'image apres les tests, GKE refuse toute image non attestee
- C. Un scan de vulnerabilites uniquement
- D. Un controle manuel avant chaque deploiement

<details><summary>Reponse</summary>

**B.** Binary Authorization applique une politique a l'admission : pas d'attestation valide = deploiement refuse. L'IAM du registre (A) n'empeche pas de deployer une image d'ailleurs ; le scan (C) detecte mais ne prouve pas la provenance.
</details>

### Q9
Vous devez livrer une application sur dev, puis staging, puis production, avec **approbation manuelle avant la production**, de maniere managee et auditable. Quel service ?

- A. Cloud Scheduler
- B. **Cloud Deploy** avec `requireApproval: true` sur la cible production
- C. Un script bash lance depuis un poste
- D. Cloud Functions declenchee par Pub/Sub

<details><summary>Reponse</summary>

**B.** Cloud Deploy gere pipelines de livraison, promotions, approbations, rollbacks et historique. Les autres n'offrent pas ces fonctions nativement.
</details>

### Q10
Les builds Docker prennent 25 minutes car toutes les couches sont reconstruites a chaque fois. Que faire en premier ?

- A. Reduire le nombre de tests
- B. Activer le **cache de couches** (Kaniko `--cache=true`) et augmenter le `machineType`
- C. Passer a un autre outil CI
- D. Desactiver les logs

<details><summary>Reponse</summary>

**B.** Le cache evite de reconstruire les couches inchangees ; une machine plus puissante accelere le reste. Reduire les tests (A) degrade la qualite.
</details>

### Q11
Vous deployez une nouvelle revision de votre service **Cloud Run** et voulez d'abord l'exposer a **10 % du trafic**, avec possibilite de revenir immediatement en arriere. Comment ?

- A. Deployer la nouvelle revision avec 100 % puis surveiller
- B. Deployer avec `--no-traffic`, puis `gcloud run services update-traffic --to-revisions=nouvelle=10,ancienne=90`
- C. Creer un second service et changer le DNS
- D. Utiliser un Cloud Scheduler pour changer les revisions

<details><summary>Reponse</summary>

**B.** Cloud Run gere nativement les revisions et le fractionnement du trafic ; le rollback = remettre 100 % sur l'ancienne revision (instantane).
</details>

### Q12
Une etape de build a besoin d'un **token d'API** tiers. Comment le fournir ?

- A. Le placer en clair dans `cloudbuild.yaml`
- B. Le passer en substitution `_TOKEN` dans le trigger
- C. Le stocker dans **Secret Manager** et le referencer via `availableSecrets`
- D. L'inclure dans l'image Docker

<details><summary>Reponse</summary>

**C.** Secret Manager : chiffre, versionne, controle d'acces IAM, audite. Les substitutions (B) apparaissent dans les logs et la configuration ; A et D exposent le secret.
</details>

### Q13
Vous voulez etre alerte automatiquement quand une **image poussee** contient des vulnerabilites critiques, et bloquer son deploiement. Quelle combinaison ?

- A. Artifact Analysis (scan a la poussee) + Binary Authorization (attestation conditionnee au resultat du scan)
- B. Cloud Monitoring uniquement
- C. Cloud Armor
- D. VPC Service Controls

<details><summary>Reponse</summary>

**A.** Le scan detecte, Binary Authorization applique le blocage. Cloud Armor protege des attaques web ; VPC-SC protege contre l'exfiltration.
</details>

### Q14
La configuration d'un cluster GKE **derive** car des administrateurs appliquent des modifications manuelles avec `kubectl`. Vous voulez que Git soit la source de verite et que la derive soit corrigee automatiquement. Que faites-vous ?

- A. Interdire kubectl aux developpeurs sans rien d'autre
- B. Adopter **Config Sync** (ou Argo CD/Flux) : l'agent reconcilie en continu le cluster avec le depot Git
- C. Recreer le cluster chaque semaine
- D. Documenter la configuration dans un wiki

<details><summary>Reponse</summary>

**B.** GitOps : etat desire dans Git, reconciliation continue, historique et rollback via Git.
</details>

### Q15
Une application critique necessite un **rollback instantane** et la possibilite de **tester completement le nouvel environnement** avant d'y envoyer du trafic. Le budget autorise de doubler temporairement les ressources. Quelle strategie ?

- A. Rolling update
- B. Recreate
- C. **Blue/Green**
- D. Canary a 1 %

<details><summary>Reponse</summary>

**C.** Blue/green : deux environnements complets, bascule du trafic, retour immediat. Le rolling est plus lent a annuler ; recreate cause une coupure ; le canary ne teste pas un environnement complet avant exposition.
</details>

---

## Domaine 3 - SRE

### Q16
Votre SLO de disponibilite est de **99,9 % sur 30 jours**. Quel est l'error budget en temps d'indisponibilite ?

- A. 4,3 minutes
- B. **43,2 minutes**
- C. 7,2 heures
- D. 8,76 heures

<details><summary>Reponse</summary>

**B.** 0,1 % de 30 j x 24 h x 60 min = 43 200 min x 0,001 = 43,2 min. (8,76 h correspond a 99,9 % **par an**.)
</details>

### Q17
Une equipe a consomme **100 % de l'error budget** du mois, a cause de plusieurs releases defectueuses. Selon les pratiques SRE, que faire ?

- A. Continuer les releases pour livrer les fonctionnalites promises
- B. **Geler les releases non liees a la fiabilite** et se concentrer sur la stabilite/automatisation
- C. Augmenter le SLO a 99,99 %
- D. Supprimer l'alerting pour reduire le bruit

<details><summary>Reponse</summary>

**B.** C'est le role de l'error budget policy : budget epuise = priorite a la fiabilite. Resserrer le SLO (C) n'aide pas, supprimer l'alerting (D) est dangereux.
</details>

### Q18
Quel est le **meilleur SLI** de disponibilite pour une API publique ?

- A. Utilisation CPU moyenne des serveurs
- B. Nombre de pods en etat Running
- C. **Proportion de requetes valides reussies (non-5xx), mesuree au load balancer**
- D. Temps de reponse moyen

<details><summary>Reponse</summary>

**C.** Un bon SLI mesure l'experience utilisateur : `bons evenements / evenements valides`, au plus pres de l'utilisateur (le LB). CPU et nombre de pods sont des causes/ressources, pas des symptomes ; la moyenne masque les latences extremes.
</details>

### Q19
Pendant un incident majeur, l'ingenieur d'astreinte le plus senior veut a la fois **coordonner l'equipe, communiquer avec la direction et depanner**. Que recommande l'approche SRE ?

- A. Qu'il fasse tout pour aller plus vite
- B. **Separer les roles** : un Incident Commander qui coordonne, un Operations Lead qui agit, un Communications Lead
- C. Attendre que l'incident se resolve seul
- D. Laisser chacun modifier la production librement

<details><summary>Reponse</summary>

**B.** Le cumul de roles degrade la prise de decision. Un seul Operations Lead modifie la production pour eviter les actions concurrentes ; l'IC garde la vue d'ensemble.
</details>

### Q20
Apres un incident, la direction demande **qui est responsable** pour le sanctionner. Quelle est la bonne approche de postmortem ?

- A. Identifier et sanctionner l'ingenieur fautif
- B. **Postmortem sans blame** : analyser les causes systemiques et definir des actions correctives avec responsables et echeances
- C. Ne pas rediger de postmortem
- D. Limiter le document a la direction

<details><summary>Reponse</summary>

**B.** Le blame decourage la transparence. On cherche pourquoi le systeme a permis l'erreur et on corrige le systeme.
</details>

### Q21
Un SRE passe 70 % de son temps a redemarrer manuellement des services et a mettre a jour des certificats a la main. Quel est le probleme principal et la reponse ?

- A. C'est normal pour un SRE
- B. C'est du **toil** (> 50 %) : il faut automatiser et eliminer les causes
- C. Il faut embaucher plus de personnel pour faire ces taches
- D. Il faut desactiver les certificats

<details><summary>Reponse</summary>

**B.** Taches manuelles, repetitives, automatisables, sans valeur durable = toil. L'objectif est de garder le toil sous 50 % et de le reduire par l'ingenierie.
</details>

### Q22
Un service A appelle un service B qui est partiellement en panne. A reessaie immediatement et sans limite, et B s'effondre completement. Quelle amelioration ?

- A. Augmenter le nombre de retries
- B. **Retries avec backoff exponentiel et jitter**, plus circuit breaker et timeouts
- C. Supprimer les timeouts
- D. Ajouter plus de threads cote A

<details><summary>Reponse</summary>

**B.** Le backoff avec jitter etale les tentatives et evite le "retry storm" ; le circuit breaker laisse B se retablir.
</details>

### Q23
Une nouvelle version vient d'etre deployee et le taux d'erreur monte a 15 %. Une cause possible est identifiee mais pas confirmee. Quelle est la **premiere action** ?

- A. Investiguer la cause racine en production pendant 2 heures
- B. **Faire un rollback vers la version precedente** pour attenuer l'impact, puis investiguer
- C. Ecrire le postmortem
- D. Desactiver la supervision

<details><summary>Reponse</summary>

**B.** Mitigation d'abord, cause racine ensuite. Un rollback est rapide et a faible risque.
</details>

---

## Domaine 4 - Supervision

### Q24
Vous voulez etre prevenu **rapidement** quand le service consomme son error budget trop vite, tout en evitant les faux positifs. Quelle alerte ?

- A. Alerte sur CPU > 80 % pendant 1 minute
- B. Alerte sur **burn rate multi-fenetres** (fenetre longue + fenetre courte)
- C. Alerte a chaque erreur 5xx
- D. Alerte hebdomadaire par email

<details><summary>Reponse</summary>

**B.** Exemple : burn rate 14,4 sur 1 h **et** sur 5 min pour une page. La fenetre longue limite les faux positifs, la courte permet de s'eteindre vite apres resolution. Les alertes sur causes (A) ou sur chaque erreur (C) generent du bruit.
</details>

### Q25
L'equipe securite veut analyser les journaux d'audit de toute l'organisation avec des **requetes SQL**. Que faire ?

- A. Lire les logs a la main dans la console
- B. Creer un **sink agrege** vers **BigQuery** (ou utiliser Log Analytics sur un bucket mis a niveau)
- C. Exporter vers Cloud Storage et ouvrir les fichiers localement
- D. Utiliser Cloud Trace

<details><summary>Reponse</summary>

**B.** Sink vers BigQuery ou Log Analytics = requetes SQL a grande echelle. Cloud Trace concerne la latence, pas les journaux d'audit.
</details>

### Q26
La facture Cloud Logging est elevee a cause de millions de logs de **health checks** sans valeur. Comment la reduire sans perdre les logs utiles ?

- A. Desactiver Cloud Logging
- B. Ajouter un **filtre d'exclusion** sur le sink `_Default` pour ces logs
- C. Reduire la retention a 1 jour pour tous les logs
- D. Supprimer le projet

<details><summary>Reponse</summary>

**B.** Les exclusions evitent le stockage des entrees ciblees, donc leur cout, sans toucher au reste.
</details>

### Q27
Vous gerez 12 projets (dev, staging, prod de 4 applications) et voulez **un seul tableau de bord** et des alertes couvrant toutes les metriques. Quelle fonction utilisez-vous ?

- A. Un dashboard par projet
- B. Un **projet de scoping avec un metrics scope** incluant les 12 projets
- C. Exporter les metriques vers BigQuery
- D. Un script qui agrege les metriques

<details><summary>Reponse</summary>

**B.** Le metrics scope permet a un projet de visualiser et d'alerter sur les metriques de plusieurs projets.
</details>

### Q28
Vous voulez declencher une alerte quand le message **"payment failed"** apparait plus de 50 fois par minute dans les logs applicatifs. Comment ?

- A. Lire les logs manuellement
- B. Creer une **metrique basee sur les journaux** (compteur) puis une alerte sur cette metrique
- C. Creer un uptime check
- D. Utiliser Error Reporting uniquement

<details><summary>Reponse</summary>

**B.** Une log-based metric transforme un motif de log en serie temporelle exploitable par Cloud Monitoring.
</details>

### Q29
Des auditeurs signalent qu'ils ne voient **aucune lecture d'objets** Cloud Storage dans les journaux d'audit. Pourquoi ?

- A. Les logs Admin Activity sont desactives
- B. Les **Data Access audit logs** ne sont pas actives par defaut (sauf BigQuery) et doivent etre actives explicitement
- C. Cloud Storage ne supporte pas l'audit
- D. Les logs sont supprimes apres une heure

<details><summary>Reponse</summary>

**B.** Seuls Admin Activity et System Event sont actives par defaut. Data Access doit etre active (couts a anticiper) via IAM > Audit Logs.
</details>

### Q30
Votre equipe utilise deja **Prometheus** et PromQL sur GKE et veut eviter de gerer des serveurs Prometheus. Quelle solution ?

- A. Heberger Prometheus sur une VM
- B. **Google Cloud Managed Service for Prometheus**
- C. Reecrire tous les tableaux de bord dans un autre outil
- D. Utiliser uniquement Cloud Trace

<details><summary>Reponse</summary>

**B.** Collecte compatible Prometheus, stockage manage, requetes PromQL, integre a Cloud Monitoring.
</details>

---

## Domaine 5 - Performance

### Q31
En production, le CPU d'un service est eleve et vous devez savoir **quelles fonctions du code** en sont responsables, avec un impact minimal sur la performance. Quel outil ?

- A. Cloud Trace
- B. **Cloud Profiler**
- C. Error Reporting
- D. Uptime check

<details><summary>Reponse</summary>

**B.** Profilage continu a faible surcout, par fonction. Trace montre la latence entre services (quel appel), pas quelle fonction consomme le CPU.
</details>

### Q32
Une requete traverse 8 microservices et la latence globale est elevee. Comment trouver **quel service** ajoute le plus de latence ?

- A. Cloud Profiler
- B. Cloud Trace (traces distribuees via OpenTelemetry)
- C. Cloud Billing
- D. IAM Recommender

<details><summary>Reponse</summary>

**B.** Les traces montrent la decomposition en spans par service. On utilise ensuite Profiler pour descendre au niveau du code.
</details>

### Q33
Un MIG demarre des VM qui mettent 4 minutes a etre pretes. L'autoscaler en ajoute beaucoup trop pendant le demarrage car il mesure des VM encore non pretes. Que configurer ?

- A. Reduire la taille maximale du MIG a 1
- B. Definir une **periode d'initialisation (cool-down)** adaptee au temps de demarrage
- C. Desactiver l'autoscaler
- D. Utiliser des disques plus petits

<details><summary>Reponse</summary>

**B.** La periode d'initialisation evite de prendre en compte les metriques des VM en cours de demarrage.
</details>

### Q34
Des pods GKE restent en etat **Pending** car aucun noeud n'a assez de ressources. Quel composant doit resoudre cela automatiquement ?

- A. HPA
- B. VPA
- C. **Cluster Autoscaler** (ou node auto-provisioning / Autopilot)
- D. Cloud NAT

<details><summary>Reponse</summary>

**C.** Il ajoute des noeuds quand des pods ne peuvent pas etre planifies. HPA ajuste le nombre de replicas, VPA les requests/limits.
</details>

### Q35
Un traitement batch de nuit est **tolerant aux interruptions** et doit couter le moins possible. Quelle option de compute ?

- A. VM On-Demand standard
- B. **Spot VMs**
- C. Committed Use Discount sur 3 ans
- D. Sole-tenant nodes

<details><summary>Reponse</summary>

**B.** Les Spot VMs offrent de fortes remises pour des charges interruptibles. Un CUD est pertinent pour une charge **continue et previsible**.
</details>

### Q36
Une application web a des utilisateurs en Europe, Asie et Amerique. Le contenu statique est servi lentement. Quelle architecture reduit la latence et la charge sur l'origine ?

- A. Un seul serveur puissant en Europe
- B. **Load balancer global avec Cloud CDN**
- C. Cloud VPN
- D. Plus de disques SSD

<details><summary>Reponse</summary>

**B.** Anycast + cache en peripherie rapprochent le contenu des utilisateurs et soulagent l'origine.
</details>

### Q37 *(choisir 2)*
Pour **accelerer** un pipeline Cloud Build lent, quelles actions sont pertinentes ?

- A. Executer les etapes independantes **en parallele** avec `waitFor`
- B. Supprimer les tests unitaires
- C. Utiliser un **cache** des dependances/couches et un `machineType` plus puissant
- D. Desactiver Artifact Registry

<details><summary>Reponse</summary>

**A et C.** Parallelisme et cache/machine plus puissante accelerent sans degrader la qualite. B degrade la qualite ; D n'a pas de sens.
</details>

---

## Grille d'auto-evaluation

| Score | Niveau |
|-------|--------|
| 33-37 | Pret : passez des practice exams officiels |
| 26-32 | Bon : revoyez les domaines ou vous avez perdu des points |
| < 26 | Reprenez le cours (surtout SRE et Cloud Build/Deploy) puis refaites le test |

## Pour aller plus loin
- Exam guide officiel et questions d'exemple : page de certification Google Cloud
- Qwiklabs / Cloud Skills Boost : labs *Cloud Build*, *Cloud Deploy*, *SLO monitoring*, *Binary Authorization*
- *The SRE Workbook* : chapitres "Implementing SLOs" et "Alerting on SLOs"
