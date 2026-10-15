# GCP DevOps Engineer - Approfondissement (theorie et competences)

A lire **apres** le [cours](README.md). Ce document descend d'un niveau : mecanismes internes, calculs, configurations concretes.
Chaque section se termine par **"Savoir-faire"** : ce que vous devez etre capable de faire sans aide.

## Sommaire
1. [IAM : evaluation des droits et identites](#1-iam--evaluation-des-droits-et-identites)
2. [Cloud Build en profondeur](#2-cloud-build-en-profondeur)
3. [Cloud Deploy et livraison progressive](#3-cloud-deploy-et-livraison-progressive)
4. [GKE pour un DevOps](#4-gke-pour-un-devops)
5. [Mathematiques des SLO](#5-mathematiques-des-slo)
6. [Monitoring et logging : mecanismes](#6-monitoring-et-logging--mecanismes)
7. [Fiabilite : pannes en cascade et capacite](#7-fiabilite--pannes-en-cascade-et-capacite)
8. [Reseau, load balancers et performance](#8-reseau-load-balancers-et-performance)
9. [Terraform pour cette certification](#9-terraform-pour-cette-certification)
10. [Etudes de cas type examen](#10-etudes-de-cas-type-examen)

---

## 1. IAM : evaluation des droits et identites

### 1.1 Ordre d'evaluation d'une requete

```
Requete (principal, permission, ressource)
   |
   1. Principal Access Boundary (PAB)  -> la ressource est-elle dans le perimetre du principal ?
   2. Deny policies (heritees)         -> un DENY applicable ? => REFUSE (prioritaire)
   3. Allow policies (heritees, union) -> une liaison accorde-t-elle la permission (conditions evaluees) ? => AUTORISE
   4. Sinon                             => REFUSE (implicite)
```

Points cles :
- Les **allow** s'**additionnent** le long de la hierarchie (org + dossier + projet + ressource) : on ne peut **pas retirer** par un allow plus bas un droit accorde plus haut. Pour retirer : **deny policy** ou ne pas l'accorder en haut.
- Les **deny** l'emportent toujours sur les allow.
- **IAM Conditions** : expressions CEL (ex. `request.time < timestamp("2026-12-31T00:00:00Z")`, `resource.name.startsWith("projects/_/buckets/dev-")`, `resource.matchTag(...)`).
- **Org Policy** n'est PAS de l'IAM : elle contraint **ce qui peut etre configure**. Les listes (allowed/denied values) **heritent** avec option `inheritFromParent`/`merge`, les booleennes se **remplacent** ou se fusionnent selon la regle.

### 1.2 Les types de comptes de service

| Type | Cree par | Usage |
|------|----------|-------|
| **Gere par l'utilisateur** | Vous | Vos workloads/pipelines |
| **Par defaut** (Compute/App Engine) | Google a l'activation de l'API | **A eviter** (role Editor historique) ; desactiver l'octroi automatique par Org Policy |
| **Agents de service** (service agents) | Google | Permettent a un service Google d'agir dans votre projet (ex. Cloud Build SA, `service-PROJECTNUM@gcp-sa-...`) : **ne pas modifier a la legere** |

### 1.3 Impersonation et chaines de delegation

- `roles/iam.serviceAccountTokenCreator` : permet de **generer des jetons** pour un SA (impersonation). Plus puissant qu'il n'y parait : equivaut a "etre" ce SA.
- `roles/iam.serviceAccountUser` : permet d'**attacher** le SA a une ressource (VM, Cloud Run, build) => agir **indirectement** avec ses droits.
- **Delegation** : A impersonne B qui impersonne C (`--impersonate-service-account=B,C`) ; utile pour des separations strictes.
- **Jetons de courte duree** (1 h par defaut, max 12 h avec politique) plutot que des cles.

### 1.4 Workload Identity Federation (WIF) : mecanique

```
GitHub (OIDC token, sub=repo:org/app:ref:refs/heads/main)
     |  1. echange STS
     v
Workload Identity Pool + Provider  (attribute_mapping + attribute_condition)
     |  2. jeton federe -> "principal://..." / "principalSet://..."
     v
roles/iam.workloadIdentityUser sur le SA cible  -> 3. generateAccessToken (jeton SA court)
```

- **attribute_condition** (CEL) est le filtre de securite : sans lui, tout depot du meme fournisseur OIDC pourrait s'authentifier.
- On peut accorder des roles **directement au principal federe** (principalSet) sans passer par un SA pour les services qui le supportent.
- **WIF for GKE (Workload Identity)** : `pod KSA` -> identite `principal://iam.googleapis.com/projects/NUM/locations/global/workloadIdentityPools/PROJECT.svc.id.goog/subject/ns/NAMESPACE/sa/KSA` ; a preferer a l'annotation KSA->GSA historique quand possible.

**Savoir-faire** : ecrire un `attribute_condition` limitant a un depot **et** une branche ; expliquer pourquoi `serviceAccountUser` != `tokenCreator` ; diagnostiquer un `PERMISSION_DENIED` avec **Policy Troubleshooter** et les **audit logs**.

---

## 2. Cloud Build en profondeur

### 2.1 Fonctionnement

- Chaque build s'execute sur une **VM ephemere** ; chaque etape = un conteneur ; le repertoire `/workspace` est **partage** entre etapes (c'est le seul lien de donnees entre etapes, avec les volumes).
- Les etapes **sequentielles par defaut** ; `waitFor` cree un DAG ; `waitFor: ['-']` = demarrer immediatement.
- Une etape en echec **arrete** le build (sauf `allowFailure: true` / `allowExitCodes`).

```yaml
steps:
  - id: deps                        # etapes paralleles
    name: node:20
    entrypoint: npm
    args: ['ci']
    waitFor: ['-']
  - id: lint
    name: node:20
    entrypoint: npm
    args: ['run', 'lint']
    waitFor: ['deps']
  - id: unit
    name: node:20
    entrypoint: npm
    args: ['test']
    waitFor: ['deps']
  - id: image
    name: gcr.io/kaniko-project/executor
    args: ['--destination=${_REGION}-docker.pkg.dev/$PROJECT_ID/apps/api:$SHORT_SHA', '--cache=true']
    waitFor: ['lint', 'unit']       # attend les DEUX
availableSecrets:
  secretManager:
    - versionName: projects/$PROJECT_ID/secrets/npm-token/versions/latest
      env: NPM_TOKEN
substitutions:
  _REGION: europe-west1
options:
  machineType: E2_HIGHCPU_8
  logging: CLOUD_LOGGING_ONLY
  substitutionOption: ALLOW_LOOSE
timeout: 1800s
```

### 2.2 Securite et reseau

| Sujet | A savoir |
|-------|----------|
| **Compte de service du build** | Utiliser un SA **specifie** (`serviceAccount:` dans le build/trigger) avec droits minimaux ; par defaut un SA historique (evolution des comptes par defaut : verifier la doc) |
| **Private pool** | Workers dans un VPC Google peerable a votre VPC : acces a ressources privees, **egress controlable**, taille de machine configurable ; **pas** d'IP publique fixe par defaut (utiliser Cloud NAT pour une IP stable) |
| **VPC Service Controls** | Cloud Build peut etre place dans un perimetre ; private pools recommandes |
| **Secrets** | `availableSecrets` -> **variables d'env** par etape ; jamais en substitution |
| **Provenance SLSA** | Cloud Build genere une provenance signee des images (attestation) ; verifiable par Binary Authorization |
| **Approbation de build** | `--require-approval` sur le trigger (pour apply, deploy prod) |
| **Pull Requests externes** | Controle de commentaire (`/gcbrun`) pour eviter l'execution de code non revu avec des droits eleves |
| **Logs** | `CLOUD_LOGGING_ONLY`, bucket de logs dedie (necessaire avec SA specifie) |

### 2.3 Performance du build

- **Cache de couches** : Kaniko (`--cache=true`, `--cache-ttl`) ou `docker build --cache-from` (pull de l'image precedente).
- **Cache de dependances** : bucket Cloud Storage restaure/sauvegarde via etapes (gsutil) ou volumes ; ou images de base contenant les deps.
- **Machine** : `E2_HIGHCPU_8/32`, `N1_HIGHCPU_32` ; plus de CPU accelere builds paralleles ; le cout est a la minute.
- **Eviter** les `pull` inutiles ; images d'etapes **epinglees par digest**.

### 2.4 Cloud Build + gouvernance

- **Triggers** : declares en Terraform (`google_cloudbuild_trigger`) ; filtres `included_files` pour ne builder que ce qui change (monorepo).
- **Notifications** : Pub/Sub topic `cloud-builds` -> Slack / Cloud Function / alerte d'echec.
- **Builds approuves** et **separation des SA** : SA "build" (ecrit Artifact Registry) != SA "deploy" (deploie).

**Savoir-faire** : ecrire un `cloudbuild.yaml` avec parallelisme + secret + cache ; choisir entre pool par defaut et private pool ; expliquer comment empecher qu'une PR d'un fork exfiltre un secret.

---

## 3. Cloud Deploy et livraison progressive

### 3.1 Cycle de vie

```
Release (immuable, images + manifestes RENDUS par Skaffold)
  -> Rollout #1 vers target dev   (auto)
  -> Promotion -> Rollout vers staging (verification post-deploy)
  -> Promotion -> [approbation requise] -> Rollout prod (canary 10% -> 50% -> 100%)
```

- Un **release** = rendu (render) des manifestes **une seule fois** : tous les environnements deploient **les memes artefacts** (la difference vient des **profils** Skaffold/Kustomize), ce qui garantit "build once, deploy many".
- **Rollback** = nouveau rollout d'un **release precedent** (immuable) ; plus fiable qu'un `kubectl rollout undo` car il repasse par le pipeline et conserve l'historique.
- **Verify** : job (conteneur) apres le deploiement ; echec => rollout en echec (et eventuel rollback via automation).
- **Deploy hooks** : jobs avant/apres deploiement (migrations de BDD, notifications).
- **Automations** : `PromoteRelease` (auto-promotion apres N minutes), `AdvanceRollout`, `RepairRollout` (retry/rollback sur echec).
- **Deploy policies** : fenetres de maintenance (pas de deploiement le vendredi soir), restrictions.
- **IAM** : `clouddeploy.releaser`, `clouddeploy.approver` (separer qui cree/qui approuve), `execution service account` par target.

### 3.2 Canary : ce que fait Cloud Deploy

- **Cloud Run** : repartit le trafic entre revisions (`automaticTrafficControl: true`), phases `percentages: [10, 50]` puis stable.
- **GKE** : via service mesh/Gateway API (traffic splitting) ou **ajustement de replicas** (canary "naif" : proportion de pods).
- Chaque phase peut avoir `verify: true`.

### 3.3 Decider : quelle strategie ?

| Question | Reponse |
|----------|---------|
| Rollback **instantane** exige ? | Blue/green (ou revision precedente Cloud Run) |
| Budget **infra limite** ? | Rolling / canary (pas de doublement) |
| Exposer a **peu d'utilisateurs d'abord** ? | Canary |
| Migration de schema **incompatible** ? | Decouper : expand/contract (changements retrocompatibles), puis blue/green ; la BDD est le vrai point dur |
| Tester sans impact utilisateur ? | Shadow traffic (mirroring) |

**Expand/contract** : (1) ajouter la nouvelle colonne/table sans casser l'ancien code, (2) deployer le code qui ecrit les deux, (3) migrer les donnees, (4) deployer le code qui lit le nouveau, (5) supprimer l'ancien. Chaque etape est compatible avec N-1 -> rollback sur.

**Savoir-faire** : ecrire un pipeline Cloud Deploy 3 etapes avec approbation prod et canary Cloud Run ; expliquer pourquoi un rollback d'application n'annule pas une migration destructive.

---

## 4. GKE pour un DevOps

### 4.1 Composants a connaitre

| Notion | Detail |
|--------|--------|
| **Standard vs Autopilot** | Standard : vous gerez les node pools ; Autopilot : Google gere noeuds, facturation par ressources de pod, durcissement par defaut |
| **Zonal vs regional** | Regional = control plane et noeuds repartis sur 3 zones (HA) |
| **Release channels** | Rapid / Regular / Stable / Extended : mises a jour automatiques du cluster |
| **Maintenance windows / exclusions** | Controler quand les mises a jour automatiques ont lieu |
| **Private cluster** | Noeuds sans IP publique ; control plane via endpoint prive/authorized networks |
| **Workload Identity** | Identite GCP par pod, sans cle |
| **Network Policy / Dataplane V2** | Isolation reseau entre pods |
| **Binary Authorization** | Controle d'admission des images |
| **Config Sync / Policy Controller** | GitOps + OPA Gatekeeper |

### 4.2 Deploiements sans interruption

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: api }
spec:
  replicas: 6
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%          # pods supplementaires pendant la maj
      maxUnavailable: 0      # jamais moins de 6 pods Ready -> zero downtime
  template:
    spec:
      containers:
        - name: api
          image: europe-west1-docker.pkg.dev/prj/apps/api:1.4.2
          resources:
            requests: { cpu: 250m, memory: 256Mi }   # base du scheduling ET de l'HPA
            limits:   { memory: 256Mi }              # limite memoire = requests (evite OOM surprise)
          readinessProbe:                             # le pod n'RECOIT du trafic que s'il est Ready
            httpGet: { path: /healthz/ready, port: 8080 }
            periodSeconds: 5
          livenessProbe:                              # redemarre le conteneur s'il est bloque
            httpGet: { path: /healthz/live, port: 8080 }
            initialDelaySeconds: 20
          startupProbe:                               # laisse le temps de demarrer
            httpGet: { path: /healthz/live, port: 8080 }
            failureThreshold: 30
            periodSeconds: 2
      terminationGracePeriodSeconds: 30
      topologySpreadConstraints:                      # repartit sur les zones
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: ScheduleAnyway
          labelSelector: { matchLabels: { app: api } }
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: api }
spec:
  minAvailable: 4                                      # protege lors des drains/upgrades de noeuds
  selector: { matchLabels: { app: api } }
```

Comprendre :
- **readiness** != **liveness** : readiness = "puis-je recevoir du trafic ?" (retire du Service) ; liveness = "dois-je etre redemarre ?" (une liveness trop agressive cause des **boucles de redemarrage**).
- **PDB** protege contre les interruptions **volontaires** (drain, upgrade), pas contre une panne de noeud.
- **Requests** determinent le **scheduling**, l'**HPA** et les **QoS classes** (Guaranteed / Burstable / BestEffort ; ordre d'eviction : BestEffort d'abord).
- Pods tues par OOM : `limits.memory` depasse -> `OOMKilled` (exit 137).

### 4.3 Autoscaling : formules

**HPA** : `replicas = ceil( replicasActuels x (metriqueActuelle / cible) )`
Exemple : 4 pods, CPU moyen 90 %, cible 60 % => `ceil(4 x 90/60) = 6`.
- La metrique CPU est en **% des requests** (donc requests irrealistes = HPA inefficace).
- **Cluster Autoscaler** reagit aux pods **Pending** par manque de ressources et reduit quand les noeuds sont sous-utilises (et si les pods peuvent migrer ; PDB/annotations `safe-to-evict`).
- **VPA** ajuste requests/limits (mode `Off` = recommandations seulement) ; **ne pas** combiner VPA et HPA sur la meme metrique CPU/memoire.
- **Autopilot** : pas de gestion de noeuds ; HPA/VPA restent utiles.

### 4.4 Diagnostic rapide

| Symptome | Commande / piste |
|----------|------------------|
| `Pending` | `kubectl describe pod` : insuffisance de ressources, taints, PVC, quotas |
| `CrashLoopBackOff` | `kubectl logs --previous`, probes trop strictes, config manquante |
| `ImagePullBackOff` | Droits Artifact Registry (SA des noeuds), nom/tag de l'image |
| `OOMKilled` | Augmenter la memoire / corriger la fuite (Profiler) |
| Service injoignable | Selector/labels, readiness, NetworkPolicy, firewall, NEG/health check du LB |
| Mise a jour bloquee | `kubectl rollout status`, readiness qui echoue, `maxUnavailable` |

**Savoir-faire** : ecrire un Deployment zero-downtime avec probes, PDB, requests/limits ; calculer un HPA ; diagnostiquer un pod Pending/OOMKilled.

---

## 5. Mathematiques des SLO

### 5.1 Definitions chiffrees

- **SLI** (ratio) = bons evenements / evenements valides.
- **Error budget** = `1 - SLO`, exprime en **evenements** (requetes) ou en **temps**.
- **Burn rate** = `taux d'erreur observe / (1 - SLO)`. Burn rate **1** = vous consommez exactement le budget sur la fenetre ; **10** = vous l'epuisez 10 fois plus vite.

### 5.2 Exemple complet

SLO : **99,9 %** de requetes reussies sur **30 jours**. Trafic : 10 000 000 requetes / 30 jours.
- Budget en requetes : `0,001 x 10 000 000 = 10 000` requetes en erreur autorisees.
- Budget en temps (pour un service 100 % indisponible) : 43,2 min.
- Incident : pendant 1 h, 5 % des requetes echouent => taux d'erreur 5 % => burn rate = `0,05 / 0,001 = 50`. A ce rythme le budget est epuise en `30 jours / 50 = 14,4 heures`.
- Budget consomme pendant cette heure : `burn x duree / fenetre = 50 x 1 h / 720 h = 6,9 %`.

**Seuils d'alerte multi-fenetres** (budget consomme -> burn rate = `% budget x fenetre / duree`) :

| % du budget en... | Burn rate | Fenetre longue / courte |
|-------------------|-----------|-------------------------|
| 2 % en 1 h | `0,02 x 720 / 1 = 14,4` | 1 h / 5 min |
| 5 % en 6 h | `0,05 x 720 / 6 = 6` | 6 h / 30 min |
| 10 % en 3 j | `0,10 x 720 / 72 = 1` | 3 j / 6 h |

**Savoir-faire** : retrouver ces nombres par calcul ; convertir un SLO en minutes/requetes ; justifier "page" vs "ticket".

### 5.3 SLO composes et dependances

- Service dependant de N composants **en serie** : disponibilite maximale ~ **produit** des disponibilites. 3 dependances a 99,9 % => `0,999^3 = 99,7 %` : votre SLO de 99,9 % est **impossible** sans redondance/degradation.
- **Redondance en parallele** : `1 - (1-A)(1-B)`.
- Une **degradation gracieuse** (cache, mode lecture seule) permet un SLO superieur a celui de la dependance la plus faible.

### 5.4 Fenetres et choix

| Fenetre | Avantages | Inconvenients |
|---------|-----------|---------------|
| **Glissante** (rolling 28/30 jours) | Reflète l'experience recente, pas de "reset" | Moins alignee avec les rapports mensuels |
| **Calendaire** (mois) | Alignee avec les contrats/SLA | Le budget se "reinitialise" -> comportement opportuniste en fin de mois |

SLI **par requete** (request-based) vs **par fenetre** (window-based : "% de minutes bonnes") : le premier est plus precis ; le second plus simple a expliquer.

### 5.5 Choisir un seuil de latence

SLO de latence : `95 % des requetes < 300 ms` ET `99 % < 1 s` (plusieurs paliers). Mesurer en **distribution** (histogramme/percentiles), jamais en moyenne.

---

## 6. Monitoring et logging : mecanismes

### 6.1 Metriques

| Notion | Detail |
|--------|--------|
| **Kinds** | `GAUGE` (valeur instantanee), `DELTA` (variation sur l'intervalle), `CUMULATIVE` (compteur croissant) |
| **Types de valeur** | INT64, DOUBLE, BOOL, STRING, **DISTRIBUTION** |
| **Alignement** | `alignment_period` + `per_series_aligner` (ex. `ALIGN_RATE` convertit un cumulatif en taux) |
| **Reduction** | `cross_series_reducer` + `group_by_fields` (agreger plusieurs series) |
| **Cardinalite** | Chaque combinaison de labels = une serie : **eviter** les labels a forte cardinalite (id utilisateur) -> cout et lenteur |

### 6.2 Alertes : comportement

- Condition **seuil**, **absence de donnees** (`condition_absent`), **taux de croissance**, **prevision** (forecast), **SLO burn rate**, **log match** (alerte sur un motif de log).
- **Duration** : la condition doit etre vraie pendant X minutes -> reduit les faux positifs mais **retarde** la detection.
- **Incidents** : ouverture automatique ; **auto-close** apres une periode sans violation ; **notification rate limit** (log-match) ; regroupement.
- **Canaux** : email, SMS, Slack, PagerDuty, Pub/Sub (-> automatisation : Cloud Function de remediation), webhook.
- Chaque alerte doit avoir une **documentation** (runbook) et une **severite**.

### 6.3 Cloud Logging : architecture detaillee

- Chaque entree traverse le **Log Router** : evaluee contre **tous les sinks** (plusieurs destinations possibles) ; `_Required` et `_Default` sont des sinks par defaut.
- **Exclusions** s'appliquent **par sink** ; une entree exclue de `_Default` peut quand meme etre routee vers un autre sink.
- **Log buckets** : region, retention, CMEK, **Log Analytics** (SQL) possible ; **log views** : acces par sous-ensemble (par equipe) sans copier les donnees.
- **Sinks agreges** (org/dossier) avec `--include-children`, `unique-writer-identity`, **droits d'ecriture sur la destination** (erreur classique : sink qui n'exporte rien car le writer n'a pas le role).
- **Log-based metrics** : **counter** (nombre de matches) ou **distribution** (extraire une valeur numerique par regex/champ) + **labels extraits** ; ne retroagissent pas sur les logs deja passes (s'appliquent aux nouveaux).
- **Audit logs** : `protoPayload.methodName`, `authenticationInfo.principalEmail`, `resourceName` ; Data Access desactive par defaut sauf BigQuery (activable par service, avec exemptions de principaux).
- **Couts** : ingestion au-dela du quota gratuit ; `_Required` gratuit ; exclusions et sampling reduisent la facture.

### 6.4 Prometheus et OpenTelemetry

- **Managed Service for Prometheus** : collecteurs manages par noeud (`PodMonitoring`), stockage Monarch, **PromQL** ; compatible Grafana (via frontend).
- **OpenTelemetry** : standard d'instrumentation (traces, metriques, logs) ; **Collector** exporte vers Cloud Trace/Monitoring/Logging.
- Pour le tracing : **propagation de contexte** (W3C `traceparent`) entre services ; **echantillonnage** (head/tail) pour maitriser le cout.

**Savoir-faire** : creer une metrique basee sur les logs avec label, une alerte dessus et un runbook ; expliquer pourquoi un sink n'exporte rien (droits du writer) ; choisir entre Log Analytics et export BigQuery.

---

## 7. Fiabilite : pannes en cascade et capacite

### 7.1 Pannes en cascade

Mecanisme : un composant sature -> latences -> **retries** des clients -> charge **amplifiee** -> effondrement.
Defenses :
- **Retries limites** : backoff exponentiel + **jitter** + **retry budget** (ex. max 10 % de trafic supplementaire) ; ne retenter que les erreurs **idempotentes/transitoires**.
- **Timeouts** adaptes et propagation de **deadlines** (ne pas continuer un travail dont le client est parti).
- **Load shedding** : rejeter proprement (503/429) au-dela de la capacite ; priorites (critique vs best-effort).
- **Circuit breaker**, **bulkheads** (pools de ressources isoles par dependance).
- **Graceful degradation** : cache, contenu reduit, mode lecture seule.
- **Quotas par client**, **rate limiting**.

### 7.2 Capacite et charge

- **N+2** : prevoir de quoi absorber la perte d'une zone **pendant** une maintenance.
- Tests de charge : mesurer le **point de saturation**, valider l'autoscaling (temps de reaction vs vitesse de montee de charge).
- **Quotas** (CPU, IP, API) : alerter a 80 %, demander les hausses a l'avance ; les pics predictibles (soldes) -> **pre-chauffer** (min instances/replicas).
- **Cold starts** : `min-instances` (Cloud Run), pods warm.

### 7.3 Gestion d'incident : details

| Notion | Detail |
|--------|--------|
| **Severite** | SEV1 (indisponibilite majeure/perte de donnees), SEV2 (degradation significative), SEV3 (impact mineur) : definit qui est reveille, delai de communication |
| **Declaration** | Declarer **tot** ; mieux vaut sur-declarer et clore |
| **Canal unique** + document d'incident | Journal horodate des actions |
| **Escalade** | Quand ? (pas de progres en X min, impact > Y) |
| **Passation (handoff)** | Explicite ("tu es maintenant IC") |
| **Mitigation** | Rollback, bascule de trafic, desactivation de feature flag, ajout de capacite, blocage d'un client abusif |
| **Fin** | Impact resolu -> fermeture ; postmortem planifie |

**Contenu d'un postmortem** : resume ; impact (utilisateurs, duree, budget consomme) ; **chronologie** ; **cause racine et facteurs** ; detection (qu'est-ce qui l'a detecte ? delai ?) ; ce qui a bien/mal marche ; **actions** (prevenir / detecter / attenuer) avec **responsable + date + priorite** ; lecons.

### 7.4 Releases et fiabilite

- **Freeze** temporaire (periodes critiques) vs error budget policy (freeze **conditionnel**).
- **Canary analysis** : comparer les SLI du canary et de la base ; seuils ; **rollback automatique**.
- **Feature flags** : desactivation instantanee sans deploiement ; dette a gerer (nettoyage).
- **Dark launch** : activer en production **sans exposer** (shadow).

**Savoir-faire** : proposer un plan anti-cascade pour un service qui s'effondre sous retry ; rediger les actions d'un postmortem ; definir une error budget policy en 5 lignes.

---

## 8. Reseau, load balancers et performance

### 8.1 Choisir le load balancer

| Besoin | LB |
|--------|----|
| HTTP(S) global, CDN, Cloud Armor, anycast | **Global external Application LB** |
| HTTP(S) regional (residence/cout) | Regional external Application LB |
| HTTP(S) interne (microservices) | Internal Application LB |
| TCP/SSL global | External proxy Network LB |
| TCP/UDP passthrough, IP source preservee, tres bas niveau | External passthrough Network LB |
| TCP/UDP interne | Internal passthrough Network LB |

- **Backends** : MIG, **NEG** (zonal/serverless/internet), buckets (CDN).
- **Health checks** : protocole/port/chemin ; ajuster `check-interval`, `unhealthy-threshold`, `timeout` ; **firewall** doit autoriser les plages de health check Google (`130.211.0.0/22`, `35.191.0.0/16`).
- **Connection draining** (delai de grace a la suppression de backend) ; **timeout** du backend adapte aux requetes longues.
- **Cloud Armor** : WAF/DDoS, regles, rate limiting.
- **Premium vs Standard tier** : Premium = backbone Google, LB global ; Standard = Internet public, regional.

### 8.2 Cloud Run : parametres de performance

| Parametre | Effet |
|-----------|-------|
| `concurrency` | Requetes simultanees par instance (defaut 80) : monter si le code est asynchrone/leger |
| `min-instances` | Evite les cold starts (cout) |
| `max-instances` | Protege les backends (BDD) et le budget |
| `cpu-boost`, `cpu always allocated` | Demarrage plus rapide / traitements d'arriere-plan |
| `timeout` | Duree max d'une requete |
| **Execution environment** gen1/gen2 | gen2 : compatibilite Linux complete, reseau |

### 8.3 Optimisation de cout (dans un cadre DevOps)

- **Recommender** : right-sizing VM, IAM, disques inactifs, IP non utilisees.
- **CUD** (engagement) pour la base stable ; **Spot** pour tolerant ; **arret planifie** pour dev/test.
- **Labels + export BigQuery** de la facturation => FinOps (cout par equipe/service).
- Logs : **exclusions**, retention adaptee ; Artifact Registry : **cleanup policies**.

---

## 9. Terraform pour cette certification

L'examen ne demande pas d'ecrire du HCL, mais les scenarios supposent de savoir **gerer l'organisation en code**. Le [cours Terraform](../terraform/README.md) et le lab 4 couvrent :
- Etat distant GCS, impersonation, WIF pour la CI.
- `google_project_iam_member` vs `binding` vs `policy`.
- Org policies, sinks, alertes, Cloud Run avec `ignore_changes`.
- Pipeline Terraform dans Cloud Build (SA dedie, approbation).

**Reponses-types a connaitre** :
| Question | Reponse |
|----------|---------|
| Ou stocker l'etat ? | Bucket GCS, versioning, acces restreint |
| Comment la CI s'authentifie ? | WIF (externe) / SA attache (Cloud Build) |
| Comment eviter la derive ? | Org Policy + IAM strict + plan planifie |
| Creation de projets standardises ? | Project factory (module) |

---

## 10. Etudes de cas type examen

### Cas 1 - "Fintech Orion"
**Contexte** : Orion exploite une API de paiement sur GKE regional. SLA client 99,9 %. Deploiements 3 fois/semaine. Incidents recents : 2 regressions en production detectees par des clients. L'equipe supervise le CPU des noeuds. Les logs d'audit ne sont conserves que 30 jours et la conformite exige 7 ans.

**Questions**
1. Quel SLO proposer ? *Reponse : SLO interne de 99,95 % de requetes de paiement reussies (< SLA 99,9 %), plus un SLO de latence p99.*
2. Comment detecter les regressions avant les clients ? *Canary via Cloud Deploy avec verification + alerte de burn rate ; rollback automatique.*
3. Comment remplacer l'alerte CPU ? *Alertes sur symptomes : burn rate multi-fenetres sur le SLI de requetes ; CPU en dashboard.*
4. Audit 7 ans ? *Sink agrege org -> bucket Cloud Storage avec retention policy verrouillee ; ou log bucket a retention personnalisee ; Data Access logs actives sur les services concernes.*
5. Pas de cles SA : *WIF pour la CI, Workload Identity pour les pods, Org Policy `disableServiceAccountKeyCreation`.*

### Cas 2 - "Retail Atlas"
**Contexte** : pipeline Jenkins auto-heberge, builds de 40 min, images sur Docker Hub (rate limits), deploiement manuel via `kubectl`, secrets dans des variables de pipeline.

**Plan de migration attendu** : Cloud Build (cache Kaniko, parallelisme) ; **Artifact Registry** avec depot **remote** pour Docker Hub (fiabilite, pas de rate limit) ; **Cloud Deploy** (dev -> staging -> prod avec approbation) ; secrets dans **Secret Manager** ; Binary Authorization (images signees) ; Terraform pour tout l'amorcage.

### Cas 3 - "Media Helios" (incident)
**Contexte** : pic de trafic ; un service de recommandation lent fait monter la latence du front ; les clients du front reessaient ; la BDD sature ; le site tombe.

**Analyse** : panne en **cascade** par retry storm. Mitigation immediate : **shed load** (desactiver les recommandations via feature flag / degradation gracieuse), augmenter la capacite, limiter les retries. Action durable : retries avec backoff + jitter + budget, timeouts/deadlines, circuit breaker sur le service de recommandation, **tests de charge** et capacity planning, postmortem sans blame avec actions suivies.
