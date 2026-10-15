# Cours - Google Cloud Professional Cloud DevOps Engineer

> Parcours : ce cours -> [questions.md](questions.md) -> [approfondissement.md](approfondissement.md) -> [questions-avancees.md](questions-avancees.md).
> Terraform (outil d'IaC du parcours) : [../terraform/README.md](../terraform/README.md), lab 4.

## Table des matieres

1. [Presentation de l'examen](#1-presentation-de-lexamen)
2. [Domaine 1 - Bootstrapping de l'organisation](#2-domaine-1---bootstrapping-de-lorganisation-15-)
3. [Domaine 2 - CI/CD](#3-domaine-2---pipelines-cicd-25-)
4. [Domaine 3 - SRE](#4-domaine-3---pratiques-sre-23-)
5. [Domaine 4 - Supervision](#5-domaine-4---supervision-21-)
6. [Domaine 5 - Performance et cout](#6-domaine-5---optimisation-des-performances-16-)
7. [Aide-memoire gcloud et exemples](#7-aide-memoire)
8. [Pieges classiques et conseils](#8-pieges-classiques-et-conseils)

---

## 1. Presentation de l'examen

Cet examen valide la capacite a **construire des pipelines de livraison, operer des services de maniere fiable (SRE) et les superviser** sur Google Cloud.

Etat d'esprit attendu : *"Comment livrer vite **et** de maniere fiable, en mesurant la fiabilite avec des SLO, et en automatisant tout ce qui est repetitif ?"*

Le vocabulaire **SRE de Google** (SLI, SLO, error budget, toil, postmortem sans blame) est au coeur de l'examen. Les reponses qui suivent la philosophie SRE de Google sont presque toujours les bonnes.

---

## 2. Domaine 1 - Bootstrapping de l'organisation (~15 %)

### 2.1 Hierarchie des ressources

```
Organisation (example.com)            <- Org Policies, IAM, audit logs agreges
 |-- Dossier : Production
 |     |-- Projet : app-prod
 |     |-- Projet : network-host-prod   (Shared VPC host)
 |-- Dossier : Non-production
 |     |-- Projet : app-dev
 |     |-- Projet : app-staging
 |-- Dossier : Shared-services
       |-- Projet : cicd-tools         (Cloud Build, Artifact Registry)
       |-- Projet : logging-central    (sinks agreges)
```

Regles de base :
- **IAM et Org Policies sont heritees** de haut en bas. Une permission accordee a l'organisation s'applique a tout.
- Le **projet** est l'unite de facturation, de quotas, d'activation d'API et d'isolation.
- Bonne pratique : **un projet par environnement et par application/equipe** (isolation des blast radius).
- Utiliser des **dossiers** pour appliquer des politiques par groupe (prod / non-prod).

### 2.2 IAM

| Concept | Detail |
|---------|--------|
| **Principal** | Compte Google, groupe Google, compte de service, domaine Workspace, `allAuthenticatedUsers`, `allUsers` |
| **Role primitif** | Owner / Editor / Viewer : **a eviter** en production (trop larges) |
| **Role predefini** | Granulaire, maintenu par Google (ex. `roles/cloudbuild.builds.editor`) |
| **Role personnalise** | Pour un besoin precis, defini au niveau projet ou organisation |
| **Deny policies** | Interdisent explicitement des permissions, evaluees **avant** les allow |
| **IAM Conditions** | Acces conditionnel (heure, ressource, tag...) |
| **Policy Troubleshooter / Recommender** | Debug des acces et suppression des permissions inutilisees |

Bonnes pratiques :
- Accorder des roles a des **groupes**, pas a des individus.
- **Moindre privilege**, a la portee la plus basse possible.
- Separer les roles (separation of duties) : celui qui deploie n'est pas celui qui administre l'IAM.

### 2.3 Comptes de service (Service Accounts)

- Identite pour une **application / un pipeline**, pas pour un humain.
- Un compte de service est a la fois une **identite** (on lui donne des roles) et une **ressource** (on donne a d'autres le droit de l'utiliser : `roles/iam.serviceAccountUser`, `roles/iam.serviceAccountTokenCreator`).
- **Eviter les cles JSON** (risque de fuite, pas d'expiration). Alternatives :

| Besoin | Solution |
|--------|----------|
| Workload sur GCE / Cloud Run / GKE | **Service account attache** a la ressource (metadata server) |
| Pod GKE | **Workload Identity Federation for GKE** (KSA -> GSA ou acces direct) |
| Pipeline externe (GitHub Actions, GitLab, Azure DevOps, AWS) | **Workload Identity Federation** (OIDC / SAML) : pas de cle |
| Utilisateur qui doit agir comme SA | **Impersonation** (`--impersonate-service-account`) |

- Org Policy utile : `constraints/iam.disableServiceAccountKeyCreation`.
- Creer des SA **dediees par workload**, jamais le compte Compute Engine par defaut avec le role Editor.

### 2.4 Organization Policies

Contraintes appliquees a toute la hierarchie, independantes d'IAM (elles limitent **ce qui est possible**, meme pour un Owner).

| Contrainte | Effet |
|------------|-------|
| `constraints/compute.vmExternalIpAccess` | Interdit les IP externes sur les VM |
| `constraints/gcp.resourceLocations` | Limite les regions utilisables (residence des donnees) |
| `constraints/iam.disableServiceAccountKeyCreation` | Interdit la creation de cles SA |
| `constraints/iam.allowedPolicyMemberDomains` | Restreint les domaines des membres IAM |
| `constraints/storage.uniformBucketLevelAccess` | Impose l'acces uniforme sur les buckets |
| `constraints/compute.requireOsLogin` | Impose OS Login |
| `constraints/compute.requireShieldedVm` | Impose les Shielded VM |

### 2.5 Reseau : Shared VPC et connectivite

- **Shared VPC** : un projet **hote** possede le reseau, des projets **de service** y attachent leurs ressources. Gestion reseau centralisee, equipes applicatives autonomes (role `compute.networkUser` sur les sous-reseaux).
- **VPC Peering** : connecte deux VPC (non transitif).
- **Cloud NAT** : sortie Internet pour des VM sans IP externe.
- **Private Google Access** : acces aux API Google depuis des VM sans IP externe.
- **VPC Service Controls** : perimetre de securite contre l'exfiltration de donnees (BigQuery, Cloud Storage...).
- **Cloud VPN / Interconnect** : connectivite hybride.

### 2.6 Infrastructure as Code et bootstrap

- **Terraform** est l'outil de reference. Le **backend d'etat** doit etre distant : bucket Cloud Storage avec versioning (et verrouillage natif).
- **Cloud Foundation Toolkit / Terraform blueprints** : modules de reference (org bootstrap, projets, reseau).
- **Project factory** : module qui cree des projets standardises (APIs, budgets, labels, SA, Shared VPC).
- Appliquer l'IaC via un **pipeline** (Cloud Build) : `plan` sur Pull Request, `apply` apres merge, avec revue.
- Les labels (`env`, `team`, `cost-center`) permettent le suivi des couts.
- **Budgets et alertes** de facturation, export de la facturation vers BigQuery.
- **Config Connector / Config Controller** : gerer des ressources GCP via des manifestes Kubernetes.

### 2.7 Journaux d'audit

| Type | Active par defaut | Contenu | Retention bucket |
|------|-------------------|---------|------------------|
| **Admin Activity** | Oui, non desactivable | Modifications de config/metadata | 400 jours (`_Required`) |
| **System Event** | Oui, non desactivable | Actions systeme Google | 400 jours (`_Required`) |
| **Data Access** | **Non** (sauf BigQuery) | Lecture/ecriture de donnees | 30 jours (`_Default`) |
| **Policy Denied** | Oui | Refus par VPC-SC / Org Policy | 30 jours (`_Default`) |

Pour conserver plus longtemps ou centraliser : **sink agrege** au niveau organisation/dossier (`--include-children`) vers Cloud Storage (avec **retention policy / Bucket Lock** pour conformite), BigQuery ou un bucket de logs central.

---

## 3. Domaine 2 - Pipelines CI/CD (~25 %)

### 3.1 Vue d'ensemble

```
 Git push --> [Cloud Build] --> build + test --> [Artifact Registry]
                                                     |
                                       scan de vulnerabilites + attestation
                                                     v
              [Cloud Deploy]  dev --> staging --> (approbation) --> prod
                                                     |
                                    [Binary Authorization] verifie la signature
                                                     v
                                          GKE / Cloud Run / GCE
```

### 3.2 Cloud Build

Service CI manage, serverless. Chaque etape est un **conteneur**.

```yaml
# cloudbuild.yaml
steps:
  # 1. Tests
  - id: test
    name: 'python:3.12-slim'
    entrypoint: bash
    args: ['-c', 'pip install -r requirements.txt && pytest']

  # 2. Build + push de l'image (avec cache)
  - id: build
    name: 'gcr.io/kaniko-project/executor:latest'
    args:
      - '--destination=europe-west1-docker.pkg.dev/$PROJECT_ID/apps/api:$SHORT_SHA'
      - '--cache=true'

  # 3. Creation d'une release Cloud Deploy
  - id: release
    name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - deploy
      - releases
      - create
      - rel-$SHORT_SHA
      - --delivery-pipeline=api-pipeline
      - --region=europe-west1
      - --images=api=europe-west1-docker.pkg.dev/$PROJECT_ID/apps/api:$SHORT_SHA

options:
  logging: CLOUD_LOGGING_ONLY
  machineType: E2_HIGHCPU_8
timeout: 1200s
```

Points cles :
| Sujet | A retenir |
|-------|-----------|
| **Triggers** | Push, Pull Request, tag, Pub/Sub, webhook, manuel, planifie (Cloud Scheduler) |
| **Substitutions** | Variables integrees (`$PROJECT_ID`, `$COMMIT_SHA`, `$SHORT_SHA`, `$BRANCH_NAME`, `$TAG_NAME`, `$BUILD_ID`) et personnalisees (`_MA_VAR`, doivent commencer par `_`) |
| **Compte de service** | Utiliser un **SA specifie par l'utilisateur** avec moindre privilege plutot que le compte par defaut |
| **Private pools** | Workers dans un reseau prive (acces a des ressources VPC : Cloud SQL prive, GKE prive, depots on-prem) |
| **Secrets** | `availableSecrets` + Secret Manager. **Jamais** de secret en clair dans le YAML ou les substitutions |
| **Cache** | Kaniko `--cache=true`, `--cache-from` Docker, ou cache dans Cloud Storage ; machine plus puissante (`machineType`) |
| **Duree** | Timeout par defaut 10 minutes (`timeout` modifiable, max 24 h) |
| **Parallelisme** | `waitFor: ['-']` pour demarrer immediatement, `waitFor: [id]` pour creer un graphe |
| **Artefacts** | `images:` (pousses a la fin) et `artifacts:` (fichiers vers Cloud Storage) |
| **Approbation** | Trigger avec **approbation manuelle** requise avant execution |
| **Pull Requests** | Trigger PR (GitHub/GitLab/Bitbucket) avec `comment-control` pour les contributeurs externes |

### 3.3 Artifact Registry

Remplace Container Registry (GCR, deprecie). Stocke **images Docker/OCI, Helm, Maven, npm, Python, Apt, Yum, Go, Generic**.

| Fonction | Detail |
|----------|--------|
| **Depots standard** | Vos propres artefacts |
| **Depots remote** | Proxy/cache de depots publics (Docker Hub, PyPI, npm, Maven Central) : fiabilite, pas de rate limit |
| **Depots virtuels** | Un point d'entree qui agrege plusieurs depots (priorites) : protection contre le *dependency confusion* |
| **Artifact Analysis** | Scan de vulnerabilites automatique a la poussee, SBOM, metadonnees de provenance |
| **IAM** | Par depot : `artifactregistry.reader / writer / admin` |
| **Cleanup policies** | Suppression automatique des anciennes versions (cout) |
| **Regional / multi-regional** | Placer le depot **pres du runtime** pour la vitesse et la sortie reseau |

### 3.4 Cloud Deploy

Livraison continue **geree** vers GKE, Cloud Run, GKE Enterprise (et plus). Basee sur **Skaffold**.

```yaml
# clouddeploy.yaml
apiVersion: deploy.cloud.google.com/v1
kind: DeliveryPipeline
metadata:
  name: api-pipeline
serialPipeline:
  stages:
    - targetId: dev
    - targetId: staging
    - targetId: prod
      strategy:
        canary:
          runtimeConfig:
            cloudRun:
              automaticTrafficControl: true
          canaryDeployment:
            percentages: [10, 50]
            verify: true
---
apiVersion: deploy.cloud.google.com/v1
kind: Target
metadata:
  name: prod
requireApproval: true
run:
  location: projects/my-prod/locations/europe-west1
```

| Concept | Description |
|---------|-------------|
| **Delivery pipeline** | Sequence de cibles (stages) |
| **Target** | Environnement de deploiement (cluster, service Cloud Run), `requireApproval` pour la prod |
| **Release** | Instantane immuable (manifestes rendus + images) cree a chaque build |
| **Rollout** | Deploiement d'une release vers une cible |
| **Promotion** | Passage de la release a l'etape suivante |
| **Strategies** | Standard, **canary**, (blue/green via configuration) |
| **Verification** | Tests post-deploiement (job conteneur), echec = rollback |
| **Automations** | Promotion automatique, reparation (relance/rollback) |
| **Rollback** | Redeployer une release precedente (immuable, donc fiable) |

### 3.5 Strategies de deploiement

| Strategie | Principe | Avantages | Inconvenients |
|-----------|----------|-----------|---------------|
| **Recreate** | On arrete l'ancienne version, on demarre la nouvelle | Simple | Interruption de service |
| **Rolling update** | Remplacement progressif des instances | Sans interruption, pas de surcout | Deux versions coexistent, rollback lent |
| **Blue/Green** | Deux environnements complets, bascule du trafic | **Rollback instantane**, test complet avant bascule | Double de ressources |
| **Canary** | Une petite part du trafic (1-10 %) vers la nouvelle version, augmentation progressive | Risque limite, validation sur trafic reel | Complexite, necessite de bonnes metriques |
| **A/B testing** | Routage selon des criteres utilisateurs | Test de fonctionnalites | Pas une strategie de securite de livraison |
| **Shadow (mirror)** | Copie du trafic vers la nouvelle version sans impact | Test sans risque | Cout, effets de bord sur les ecritures |

Implementation sur GCP :
- **Cloud Run** : revisions + `gcloud run services update-traffic --to-revisions=api-v2=10` ; tags pour tester une revision (`--tag`).
- **GKE** : `RollingUpdate` (`maxSurge`, `maxUnavailable`), Cloud Deploy canary, Gateway API / service mesh (Cloud Service Mesh) pour le fractionnement de trafic.
- **MIG (Compute Engine)** : *rolling update* avec `maxSurge`/`maxUnavailable`, **canary** via deux templates (`--canary-version`).
- **App Engine** : repartition de trafic entre versions (`gcloud app services set-traffic --splits`).

### 3.6 Securite de la chaine d'approvisionnement

| Outil | Role |
|-------|------|
| **Artifact Analysis** | Detecte les vulnerabilites (CVE) des images |
| **Binary Authorization** | **Politique de deploiement** : seules les images **attestees** (signees) par des *attestors* peuvent tourner sur GKE/Cloud Run |
| **Attestations** | Signature cryptographique (cle KMS) emise par le pipeline apres tests/scan |
| **SLSA / provenance** | Cloud Build produit une provenance verifiable (niveau SLSA 3) |
| **Mode dry-run** | Journalise les violations sans bloquer (pour deployer progressivement) |
| **Break-glass** | Annotation permettant un deploiement d'urgence, journalise |
| **Continuous validation** | Verifie en continu que les pods en cours respectent encore la politique |
| **Secret Manager** | Stockage des secrets (versions, rotation, IAM, audit) |
| **Cloud KMS** | Cles de signature et de chiffrement |

Flux type : build -> scan -> tests OK -> **attestation signee** -> Binary Authorization verifie a l'admission dans GKE -> deploiement.

### 3.7 GitOps et configuration

- **Config Sync** (GKE Enterprise) / **Argo CD / Flux** : l'etat desire est dans Git, un agent dans le cluster **reconcilie** en continu (corrige la derive de configuration).
- **Policy Controller** (OPA Gatekeeper) : refuse les manifestes non conformes.
- Pull Request = revue + historique + rollback via `git revert`.
- Separer **depot applicatif** (code) et **depot de configuration** (manifestes / environnements).

### 3.8 Tests dans le pipeline

Pyramide : tests unitaires (rapides, nombreux) > integration > bout-en-bout (lents, peu nombreux).
Ajouter : analyse statique / SAST, scan de dependances, scan d'images, tests de charge en pre-prod, **tests de fumee** apres deploiement, validation des politiques (OPA/conftest), `terraform validate/plan`.

---

## 4. Domaine 3 - Pratiques SRE (~23 %)

### 4.1 Vocabulaire fondamental

| Terme | Definition | Exemple |
|-------|------------|---------|
| **SLI** (Service Level Indicator) | **Mesure** quantitative de la qualite du service | % de requetes reussies, latence p95 |
| **SLO** (Service Level Objective) | **Objectif** cible pour un SLI sur une fenetre | 99,9 % de requetes reussies sur 30 jours |
| **SLA** (Service Level Agreement) | **Contrat** avec penalites si non respecte | Remboursement si < 99,5 % |
| **Error budget** | `100 % - SLO` : fiabilite que l'on peut "depenser" | 0,1 % = ~43 min / 30 jours |
| **Toil** | Travail manuel, repetitif, automatisable, tactique, sans valeur durable, qui croit avec le service | Redemarrer a la main un service |

Regle : **SLO plus strict que le SLA** (marge de securite). SLA = affaire commerciale, SLO = affaire d'ingenierie.

### 4.2 Choisir de bons SLI

Forme generique : `SLI = evenements bons / evenements valides x 100`

| Type de service | SLI typiques |
|-----------------|--------------|
| **Service requete/reponse** | Disponibilite (reponses non 5xx), latence (% < seuil) |
| **Pipeline de donnees** | Fraicheur, exactitude, couverture, debit |
| **Stockage** | Durabilite, disponibilite, latence |

Conseils :
- Mesurer **du point de vue de l'utilisateur** (au load balancer plutot que sur le serveur).
- Preferer les **percentiles** (p95, p99) aux moyennes.
- Peu de SLI, relies a l'experience utilisateur (parcours critiques / CUJ).
- Exclure les erreurs client (4xx) du calcul de disponibilite.

### 4.3 Tableau de disponibilite

| SLO | Indisponibilite / 30 jours | / an |
|-----|----------------------------|------|
| 99 % | 7,2 h | 3,65 j |
| 99,5 % | 3,6 h | 1,8 j |
| 99,9 % | 43,2 min | 8,76 h |
| 99,95 % | 21,6 min | 4,38 h |
| 99,99 % | 4,32 min | 52,6 min |

### 4.4 Error budget et politique

L'**error budget policy** definit ce qu'on fait selon la consommation :

| Etat du budget | Action |
|----------------|--------|
| Budget **restant** | On livre des fonctionnalites, on prend des risques, on experimente |
| Budget **epuise** | **Gel des releases** non liees a la fiabilite ; priorite aux correctifs, a l'automatisation, aux postmortems |
| Budget epuise a cause d'une dependance externe | Escalade, ajustement de l'architecture, revoir le SLO |

L'error budget **aligne developpeurs et SRE** : fin du conflit "livrer vite / etre stable".

### 4.5 Gestion des incidents

Priorite n°1 : **attenuer l'impact (mitigation)**, ensuite trouver la cause racine.
> *Rollback d'abord, enquete ensuite.*

Roles (modele inspire de l'ICS) :

| Role | Responsabilite |
|------|----------------|
| **Incident Commander (IC)** | Coordonne, decide, delegue. **Ne depanne pas lui-meme.** Maintient la vue d'ensemble |
| **Operations Lead** | Seul(e) a modifier le systeme en production (evite les actions concurrentes) |
| **Communications Lead** | Communique aux parties prenantes / clients, met a jour la page de statut |
| **Planning Lead** | Suit les taches, prepare la passation, notes |

Bonnes pratiques :
- Declarer l'incident tot, avec une **severite** claire, un canal dedie, un document partage d'incident.
- **Passation explicite** du role d'IC lors d'un changement d'equipe.
- Runbooks / playbooks, alertes **actionnables** (qui contiennent le lien du runbook).
- Escalade rapide en cas de doute.

### 4.6 Postmortem

- **Sans blame** (*blameless*) : on cherche les failles du **systeme et des processus**, pas un coupable.
- Contenu : resume, impact, chronologie, cause(s) racine(s) et facteurs contributifs, ce qui a bien marche, ce qui a mal marche, **actions correctives avec responsable et echeance**, lecons.
- Rediger apres tout incident significatif (impact utilisateur, consommation importante du budget, intervention manuelle).
- Partager largement, suivre l'avancement des actions.
- **Wheel of Misfortune** : jeux de role pour s'entrainer ; **Game days / chaos engineering** : injection de pannes controlees.

### 4.7 Reduction du toil

- Cible Google : le toil **ne doit pas depasser 50 %** du temps d'un SRE ; le reste = ingenierie.
- Methode : mesurer -> automatiser (scripts, Cloud Functions, Cloud Scheduler, Workflows, IaC) -> supprimer la cause (ameliorer le service).
- Auto-reparation (health checks + autohealing des MIG, probes Kubernetes).

### 4.8 Conception pour la fiabilite

| Pattern | But |
|---------|-----|
| **Retries avec backoff exponentiel + jitter** | Eviter les "retry storms" qui aggravent une panne |
| **Circuit breaker** | Arreter d'appeler une dependance defaillante |
| **Timeouts et deadlines** | Ne jamais attendre indefiniment |
| **Load shedding** | Rejeter une partie de la charge pour proteger le service (429/503) |
| **Degradation gracieuse** | Fournir un service reduit plutot qu'une panne totale |
| **Idempotence** | Rejouer sans effet de bord |
| **Redondance multi-zone / multi-region** | Resister aux pannes de zone/region |
| **Health checks** (liveness / readiness) | Retirer ou redemarrer les instances malades |
| **Limitation du rayon d'impact** | Cellules, releases progressives, feature flags |

### 4.9 Livraison et fiabilite

- Petits changements frequents = moins de risque que de gros changements rares.
- **Feature flags** : decoupler deploiement et activation.
- Releases progressives (canary) avec **analyse automatique** des metriques (SLI) et rollback automatique.
- **Capacity planning** : previsions organique + inorganique, tests de charge, quotas verifies avant les pics.
- **Quotas** : surveiller et demander des augmentations a l'avance ; alerter a 80 %.

### 4.10 Reprise apres sinistre

| Strategie | RTO/RPO | Cout |
|-----------|---------|------|
| Sauvegarde / restauration | Heures | $ |
| Pilot light | Dizaines de minutes | $$ |
| Warm standby | Minutes | $$$ |
| Actif-actif multi-region | Proche de zero | $$$$ |

Outils : snapshots planifies, Backup and DR Service, replication Cloud Storage dual/multi-region, Cloud SQL HA + replicas cross-region, GKE multi-cluster, Cloud Load Balancing global avec bascule automatique.

---

## 5. Domaine 4 - Supervision (~21 %)

### 5.1 Les piliers de l'observabilite

| Pilier | Outil Google Cloud |
|--------|--------------------|
| **Metriques** | Cloud Monitoring, Managed Service for Prometheus |
| **Logs** | Cloud Logging |
| **Traces** | Cloud Trace (OpenTelemetry) |
| **Profils** | Cloud Profiler |
| **Erreurs** | Error Reporting |
| **Disponibilite externe** | Uptime checks |

L'**Ops Agent** (collecte metriques et logs sur Compute Engine) remplace les anciens agents Monitoring/Logging. GKE a la collecte integree (logs systeme/workloads, metriques systeme, Managed Prometheus).

### 5.2 Cloud Monitoring

- **Metrics scope** : un projet "scoping" peut afficher les metriques de **plusieurs projets** (vue unique multi-projets, ex. tous les environnements).
- **Types de metriques** : systeme (GCP), agent, **personnalisees** (API / OpenTelemetry), **basees sur les journaux** (log-based).
- **Requetes** : MQL (en transition) et **PromQL** (recommande).
- **Alert policies** : condition (seuil, absence de donnees, taux de croissance, SLO burn rate), canaux de notification (email, SMS, Slack, PagerDuty, Pub/Sub, webhook), documentation (runbook) incluse, regroupement des alertes.
- **Uptime checks** : HTTP/HTTPS/TCP depuis plusieurs regions ; **private uptime checks** pour des ressources internes.
- **Dashboards** : personnalises ou pre-construits, partageables.
- **Snooze** : mettre en sourdine pendant les maintenances.

### 5.3 SLO monitoring et burn rate

Cloud Monitoring permet de definir un **SLO** (service + SLI + objectif + fenetre) et d'alerter sur le **burn rate** (vitesse de consommation du budget).

> **Burn rate** = (taux d'erreur observe) / (taux d'erreur autorise). Burn rate 1 = on consomme exactement le budget sur la fenetre.

Alerting multi-fenetres recommande (SLO 30 jours) :

| Fenetre longue | Fenetre courte | Burn rate | Budget consomme | Action |
|----------------|----------------|-----------|-----------------|--------|
| 1 h | 5 min | 14,4 | 2 % | **Page** (urgence) |
| 6 h | 30 min | 6 | 5 % | **Page** |
| 3 jours | 6 h | 1 | 10 % | **Ticket** (non urgent) |

Pourquoi deux fenetres ? La longue evite les faux positifs, la courte permet de **se resoudre vite** quand le probleme est termine.

Alerter sur les **symptomes** (impact utilisateur, SLO) plutot que sur les **causes** (CPU a 90 %).

### 5.4 Cloud Logging

```
 Sources (GCE, GKE, Cloud Run, audit...)
          |
   [ Log Router ]  --- sinks (filtres d'inclusion) ---> Cloud Storage (archive)
          |                                          --> BigQuery (analyse SQL)
          |                                          --> Pub/Sub (SIEM, streaming)
          |                                          --> Log bucket (autre projet)
   exclusions (reduction de cout)
          v
   Log buckets : _Required (400 j, gratuit), _Default (30 j), personnalises
```

| Notion | Detail |
|--------|--------|
| **Log Router** | Evalue chaque entree contre les **sinks** ; l'entree est stockee dans `_Default` sauf **exclusion** |
| **Sink agrege** | Au niveau organisation/dossier (`--include-children`) pour centraliser |
| **Exclusion filters** | Ne pas stocker (ex. logs de debug, health checks) pour **reduire les couts** |
| **Retention** | Configurable par bucket ; `_Required` fixe a 400 jours |
| **Log Analytics** | Requetes **SQL** sur les buckets mis a niveau, sans export BigQuery |
| **Log-based metrics** | **Compteur** ou **distribution** a partir d'un filtre (ex. nombre d'erreurs "payment failed") -> alerte |
| **Droit d'acces** | `logging.viewer`, `logging.privateLogViewer` (Data Access), vues de logs par equipe |
| **Champs sensibles** | Eviter de journaliser PII/secrets ; masquage via Sensitive Data Protection |

Filtre exemple :
```
resource.type="k8s_container"
resource.labels.cluster_name="prod"
severity>=ERROR
jsonPayload.message:"timeout"
```

### 5.5 Trace, Profiler, Error Reporting

- **Cloud Trace** : latence de bout en bout d'une requete a travers les microservices (spans). Instrumenter via **OpenTelemetry**. Trouve **quel service/appel** ralentit.
- **Cloud Profiler** : profilage **continu**, a faible surcout (~quelques %), en production : montre **quelles fonctions** consomment CPU/memoire/temps. Trouve **quelle ligne de code**.
- **Error Reporting** : regroupe et compte les exceptions, alerte sur les nouvelles erreurs.
- **Cloud Debugger** est deprecie ; utiliser logs, snapshots via autres outils.

Regle d'or : metriques (*qu'est-ce qui ne va pas ?*) -> traces (*ou ?*) -> logs/profils (*pourquoi ?*).

### 5.6 Supervision de GKE

- **Managed Service for Prometheus** (PodMonitoring / ClusterPodMonitoring) : collecte compatible Prometheus, stockage Monarch, requetes PromQL, sans gerer de serveur Prometheus.
- Metriques cles : CPU/memoire (requests vs usage), `restart count`, pods `Pending` / `CrashLoopBackOff`, saturation des noeuds, latence et erreurs de l'Ingress.
- **GKE dashboards** et **Cloud Service Mesh** (SLO automatiques par service).
- Alertes sur : OOMKilled, noeuds NotReady, quota, volumes presque pleins.

### 5.7 Les 4 signaux dorees (SRE)

**Latence**, **Trafic**, **Erreurs**, **Saturation**. Methodes : **RED** (Rate, Errors, Duration) pour les services, **USE** (Utilization, Saturation, Errors) pour les ressources.

---

## 6. Domaine 5 - Optimisation des performances (~16 %)

### 6.1 Demarche

1. **Mesurer** (metriques, traces, profils) avant d'optimiser.
2. Identifier le **goulot d'etranglement**.
3. Corriger, **remesurer**.
4. Equilibrer **performance / cout / fiabilite**.

### 6.2 Autoscaling

| Cible | Mecanisme | Detail |
|-------|-----------|--------|
| **MIG** (Compute Engine) | Autoscaler | Selon CPU, metrique Cloud Monitoring, utilisation du LB, **planning**, mode predictif. **Cool-down / initialization period** pour les VM lentes a demarrer |
| **GKE pods** | **HPA** (Horizontal Pod Autoscaler) | Nombre de replicas selon CPU/memoire/metriques custom |
| **GKE pods** | **VPA** (Vertical) | Ajuste requests/limits (ne pas combiner HPA et VPA sur la meme metrique) |
| **GKE noeuds** | **Cluster Autoscaler** / auto-provisioning | Ajoute des noeuds quand des pods sont **Pending** faute de ressources |
| **GKE** | **Autopilot** | Google gere les noeuds ; facturation par ressources de pod |
| **Cloud Run** | Autoscaling natif | Concurrence par instance, `min-instances` (evite cold start), `max-instances` (protege les backends) |

Piege : un cluster autoscaler ne s'active que si les pods ont des **requests** definis.

### 6.3 Reseau et distribution

- **Load Balancer global** (Application LB externe) : anycast, un seul IP, routage vers la region la plus proche.
- **Cloud CDN** : cache en peripherie pour le contenu statique (reduit latence et charge).
- Choisir le LB selon : externe/interne, L7/L4, global/regional, proxy/passthrough.
- **Niveau de service reseau** : Premium (reseau Google) vs Standard (Internet public, moins cher).
- **Connection draining**, **health checks** bien calibres, **timeout** de backend adaptes.
- Placer les ressources **pres des utilisateurs** et **pres des donnees** (reduire la latence inter-regions et les couts de sortie).

### 6.4 Compute et stockage

- **Right-sizing** : suivre les recommandations (**Recommender / Active Assist**) ; machines **personnalisees** possibles.
- Familles : E2 (rentable), N2/N4 (general), C3 (compute), M (memoire), A/G (GPU).
- Disques : pd-balanced (defaut), pd-ssd (IOPS), Hyperdisk (perf configurable) ; **Local SSD** pour le tres faible latence (volatile).
- **Cloud Storage** : classes Standard / Nearline / Coldline / Archive + **lifecycle rules** automatiques.
- Bases de donnees : read replicas, cache (Memorystore), index, pooling de connexions (**Cloud SQL Auth Proxy**, PgBouncer).

### 6.5 Optimisation des couts

| Levier | Detail |
|--------|--------|
| **Remises automatiques d'utilisation continue** (SUD) | Appliquees automatiquement a certaines familles |
| **Committed Use Discounts** (CUD) | Engagement 1 ou 3 ans (ressources ou depense), jusqu'a ~55-70 % |
| **Spot VMs** | Jusqu'a ~60-91 % moins cher, interruptibles (pas de duree max) : batch, CI, workloads tolerants |
| **Arret programme** | Instance schedules pour dev/test |
| **Right-sizing** | Recommendations de taille |
| **Labels + export facturation BigQuery** | Allocation des couts par equipe |
| **Budgets et alertes** | Notification a 50/90/100 % |
| **Journaux** | Exclusion des logs a faible valeur |
| **Artifact Registry cleanup**, **lifecycle Cloud Storage** | Reduire le stockage inutile |

### 6.6 Performance du pipeline CI/CD

- Cache des dependances et des couches Docker (Kaniko cache).
- Etapes en **parallele** (`waitFor`).
- Machines plus grosses (`E2_HIGHCPU_32`) ou **private pools** dimensionnes.
- Images de build legeres et pre-construites ; builds incrementaux ; tests selectifs.

---

## 7. Aide-memoire

### gcloud

```bash
# Contexte
gcloud config set project mon-projet
gcloud auth login
gcloud auth application-default login
gcloud config list

# IAM
gcloud projects add-iam-policy-binding mon-projet \
  --member="group:devs@example.com" --role="roles/run.developer"
gcloud iam service-accounts create deployer --display-name="Deployer"
gcloud iam service-accounts add-iam-policy-binding deployer@mon-projet.iam.gserviceaccount.com \
  --member="user:alice@example.com" --role="roles/iam.serviceAccountTokenCreator"

# Org Policy
gcloud resource-manager org-policies enable-enforce \
  constraints/compute.requireOsLogin --organization=123456789

# Cloud Build
gcloud builds submit --config=cloudbuild.yaml .
gcloud builds triggers create github --repo-name=app --repo-owner=org \
  --branch-pattern='^main$' --build-config=cloudbuild.yaml
gcloud builds list --ongoing

# Artifact Registry
gcloud artifacts repositories create apps --repository-format=docker --location=europe-west1
gcloud auth configure-docker europe-west1-docker.pkg.dev

# Cloud Deploy
gcloud deploy apply --file=clouddeploy.yaml --region=europe-west1
gcloud deploy releases promote --release=rel-abc123 --delivery-pipeline=api-pipeline --region=europe-west1
gcloud deploy rollouts approve ROLLOUT --release=rel-abc123 --delivery-pipeline=api-pipeline --region=europe-west1

# Cloud Run : canary et rollback
gcloud run deploy api --image=IMAGE --no-traffic --tag=canary
gcloud run services update-traffic api --to-revisions=api-00002=10,api-00001=90
gcloud run services update-traffic api --to-latest

# GKE
gcloud container clusters get-credentials prod --region=europe-west1
kubectl rollout status deployment/api
kubectl rollout undo deployment/api

# MIG
gcloud compute instance-groups managed rolling-action start-update web-mig \
  --version=template=tpl-v2 --max-surge=3 --max-unavailable=0

# Logging
gcloud logging read 'severity>=ERROR AND resource.type="cloud_run_revision"' --limit=20 --freshness=1h
gcloud logging sinks create audit-sink \
  bigquery.googleapis.com/projects/logs-prj/datasets/audit \
  --organization=123456789 --include-children --log-filter='logName:"cloudaudit.googleapis.com"'
gcloud logging metrics create payment_errors \
  --description="Paiements en erreur" --log-filter='jsonPayload.event="payment_failed"'

# Monitoring
gcloud monitoring policies list
gcloud alpha monitoring policies create --policy-from-file=policy.json
```

### Exemple Binary Authorization (politique)

```yaml
# policy.yaml
globalPolicyEvaluationMode: ENABLE
defaultAdmissionRule:
  evaluationMode: REQUIRE_ATTESTATION
  enforcementMode: ENFORCED_BLOCK_AND_AUDIT_LOG
  requireAttestationsBy:
    - projects/cicd-tools/attestors/built-by-cloud-build
```

### Exemple SLO (alerte burn rate, concept)

```
Condition 1 : burn_rate(1h)  > 14.4  ET  burn_rate(5m)  > 14.4   -> PAGE
Condition 2 : burn_rate(6h)  > 6     ET  burn_rate(30m) > 6      -> PAGE
Condition 3 : burn_rate(3d)  > 1     ET  burn_rate(6h)  > 1      -> TICKET
```

### Arbre de decision rapide

| Besoin | Reponse |
|--------|---------|
| Pas de cle SA depuis GitHub Actions | Workload Identity Federation |
| Empecher les images non signees | Binary Authorization |
| Pipeline multi-environnements avec approbation | Cloud Deploy |
| Acceder a une ressource VPC depuis le build | Cloud Build private pool |
| Interdire les IP publiques sur toute l'org | Org Policy `vmExternalIpAccess` |
| Centraliser les logs de toute l'org | Sink agrege (include-children) |
| Reduire le cout des logs | Exclusion filters |
| Compteur a partir de logs | Log-based metric |
| Vue de plusieurs projets dans Monitoring | Metrics scope |
| Quelle fonction consomme le CPU en prod | Cloud Profiler |
| Quel microservice ralentit | Cloud Trace |
| Budget d'erreur epuise | Gel des releases, priorite a la fiabilite |
| Alerter sur la consommation du budget | Alerte de burn rate multi-fenetres |
| Rollback instantane | Blue/green (ou revision precedente Cloud Run) |
| Validation sur trafic reel limite | Canary |
| Batch tolerant aux interruptions | Spot VMs |
| Pods en Pending | Cluster Autoscaler |

---

## 8. Pieges classiques et conseils

1. **IAM** : "le plus restrictif possible", groupes, pas de role primitif, pas de cles SA.
2. **Mitigation avant cause racine** pendant un incident (rollback, bascule de trafic).
3. **Postmortem toujours sans blame**, avec actions suivies.
4. **L'IC coordonne, il ne depanne pas.** Un seul Operations Lead modifie la production.
5. **Alertes sur symptomes (SLO)**, pas sur causes ; peu d'alertes, toutes actionnables.
6. **Error budget epuise = gel des releases** (sauf correctifs de fiabilite).
7. **Services manages** (Cloud Build, Cloud Deploy, Cloud Run, Managed Prometheus) > solutions auto-hebergees quand les deux repondent au besoin.
8. **Pas de secret en clair** : Secret Manager.
9. **Data Access logs** : desactives par defaut (sauf BigQuery) : a activer pour l'audit des lectures.
10. **Audit Admin Activity** : toujours actif, non desactivable, 400 jours.
11. **Container Registry est deprecie** : reponse = Artifact Registry.
12. **Cloud Debugger est deprecie** ; Stackdriver = ancien nom de Cloud Operations (Monitoring/Logging).
13. Lisez les mots-cles : *"minimiser l'effort operationnel"*, *"sans interruption"*, *"le moins cher"*, *"conformite"*, *"sans cles"*. Ils designent la bonne reponse.
14. Pour les QCM multiples, lisez combien de reponses sont demandees (*Choose 2*).
15. Gerez votre temps : ~2 min par question, marquez et revenez.

> Le livre **Site Reliability Engineering** et **The SRE Workbook** (sre.google) sont les meilleures sources pour le domaine 3 : lisez au moins les chapitres sur les SLO, l'alerting sur les SLO, la gestion des incidents et les postmortems.
