# GCP DevOps Engineer - Questions avancees

32 questions **plus difficiles** que `questions.md` : plusieurs contraintes, calculs, lecture de configuration, pieges.
A faire **apres** [approfondissement.md](approfondissement.md). Chronometrez-vous : ~2 min / question.

Plan : A. IAM/securite (Q1-6) · B. CI/CD (Q7-14) · C. SRE et calculs (Q15-22) · D. Observabilite (Q23-28) · E. GKE/performance (Q29-32)

---

## A. IAM et securite

### Q1
Un pipeline sur un **fork de depot public** doit etre empeche d'obtenir des identifiants GCP. Votre WIF accepte `assertion.repository_owner == "acme"`. Un attaquant cree un depot `acme-evil/app`. Est-il protege ?

- A. Oui, car le proprietaire commence par "acme"
- B. Oui, `repository_owner` est un nom exact et `acme-evil` != `acme` **mais** la condition devrait aussi restreindre le **depot** et la **branche/environnement**
- C. Non, l'attaquant peut usurper le proprietaire
- D. Non, WIF n'a pas de condition

<details><summary>Reponse</summary>

**B.** L'egalite est exacte, donc `acme-evil` ne passe pas. Mais restreindre seulement a l'organisation autorise **tous** les depots de l'organisation (y compris un depot de test compromis). Bonne condition : `assertion.repository == "acme/app" && assertion.ref == "refs/heads/main"` (ou `environment`).
</details>

### Q2
Alice a `roles/iam.serviceAccountUser` sur `sa-prod-deploy` mais pas `serviceAccountTokenCreator`. Que peut-elle faire ?

- A. Generer un jeton d'acces pour `sa-prod-deploy` en local
- B. **Attacher** `sa-prod-deploy` a une ressource qu'elle cree (VM, Cloud Run, build) et agir ainsi avec ses droits ; mais pas generer directement de jeton
- C. Rien
- D. Supprimer le SA

<details><summary>Reponse</summary>

**B.** `serviceAccountUser` = droit d'attachement (escalade indirecte possible si elle peut creer des ressources executant du code). `tokenCreator` = impersonation directe. Les deux sont sensibles.
</details>

### Q3
Une deny policy interdit `compute.instances.delete` au niveau du dossier `Prod` a tous sauf au groupe `sre-oncall`. Bob (membre de `sre-oncall`) a `roles/owner` sur un projet du dossier. Peut-il supprimer une VM ?

- A. Non, deny l'emporte toujours
- B. **Oui**, car l'exception (`exceptionPrincipals`) l'exclut de la deny et son role Owner l'autorise
- C. Non, Owner ne contient pas cette permission
- D. Oui, mais seulement la nuit

<details><summary>Reponse</summary>

**B.** La deny s'applique aux principaux non exceptes. Bob est excepte et l'allow Owner s'applique. Sans exception, la deny l'emporterait meme sur Owner.
</details>

### Q4
Une Org Policy `constraints/gcp.resourceLocations` autorise `in:eu-locations` a l'organisation. Un projet pose une policy qui autorise `in:us-locations` **sans** `inheritFromParent`. Resultat dans ce projet ?

- A. EU et US autorises
- B. **Seul US autorise** (la policy du projet remplace celle du parent)
- C. Seul EU autorise
- D. Rien n'est autorise

<details><summary>Reponse</summary>

**B.** Sans fusion/heritage explicite, la policy enfant remplace celle du parent. Avec `inheritFromParent: true` : EU + US. (Piege : un projet peut ainsi contourner une contrainte si on n'en protege pas l'edition.)
</details>

### Q5
Pour que Cloud Build **n'utilise plus** le compte de service par defaut tres permissif, quelle approche est la meilleure ?

- A. Retirer tous les roles du compte par defaut et esperer
- B. Creer un SA dedie avec moindre privilege et le specifier dans le trigger/build (`serviceAccount`), avec un bucket de logs configure
- C. Utiliser un compte utilisateur
- D. Executer les builds en local

<details><summary>Reponse</summary>

**B.** Un SA par pipeline/fonction, droits minimaux ; ne pas oublier la configuration des logs (`CLOUD_LOGGING_ONLY` ou bucket dedie).
</details>

### Q6 *(choisir 2)*
Quelles mesures empechent l'exfiltration de donnees BigQuery/Cloud Storage vers un projet externe ?

- A. **VPC Service Controls** (perimetre)
- B. Role Viewer a tous
- C. **Restreindre les domaines IAM** (`iam.allowedPolicyMemberDomains`) et limiter les partages publics
- D. Desactiver Cloud Logging

<details><summary>Reponse</summary>

**A et C.** VPC-SC bloque les flux hors perimetre meme avec des identifiants valides ; l'Org Policy empeche d'accorder l'acces a des identites externes.
</details>

---

## B. CI/CD

### Q7
Lisez ce `cloudbuild.yaml`. Quel est le probleme ?

```yaml
steps:
  - name: gcr.io/cloud-builders/docker
    args: ['build', '-t', 'europe-west1-docker.pkg.dev/$PROJECT_ID/apps/api:$SHORT_SHA', '.']
  - name: gcr.io/cloud-builders/docker
    args: ['push', 'europe-west1-docker.pkg.dev/$PROJECT_ID/apps/api:$SHORT_SHA']
  - name: gcr.io/cloud-builders/gcloud
    args: ['run', 'deploy', 'api', '--image=europe-west1-docker.pkg.dev/$PROJECT_ID/apps/api:latest', '--region=europe-west1']
```

- A. Il manque `timeout`
- B. Le **deploiement utilise le tag `latest`** alors que l'image poussee est taggee `$SHORT_SHA` : on deploie une image inattendue / non tracable
- C. `$PROJECT_ID` n'est pas supporte
- D. Docker ne peut pas pousser vers Artifact Registry

<details><summary>Reponse</summary>

**B.** Incoherence de tag. Bonnes pratiques : deployer par **digest ou SHA immuable**, jamais `latest` (reproductibilite, rollback). Ici le deploiement prendrait une ancienne image `latest` ou echouerait.
</details>

### Q8
Un build doit utiliser un token npm prive. Quelle configuration est **correcte et sure** ?

- A. `substitutions: { _NPM_TOKEN: "abc123" }`
- B. `availableSecrets.secretManager` + `secretEnv` sur l'etape concernee, avec entrypoint `bash` et `$$NPM_TOKEN`
- C. Le coder dans le Dockerfile
- D. Le passer en argument `--build-arg NPM_TOKEN=...` (visible dans l'historique de l'image)

<details><summary>Reponse</summary>

**B.** Les secrets sont injectes en variables d'environnement a l'execution de l'etape ; le `$$` echappe pour que le shell (et non Cloud Build) fasse l'expansion. D laisse le secret dans les couches de l'image.
</details>

### Q9
Votre pipeline doit empecher un deploiement en production si une image contient une vulnerabilite **CRITICAL** non corrigee. Quelle architecture ?

- A. Alerte email apres deploiement
- B. Artifact Analysis (scan) -> une etape CI verifie le resultat et **cree l'attestation seulement si OK** -> Binary Authorization n'accepte que les images attestees
- C. Cloud Armor
- D. Scanner manuellement chaque semaine

<details><summary>Reponse</summary>

**B.** Le blocage est applique a l'**admission** (shift-right enforce), l'attestation est conditionnee au scan (shift-left). Prevoir le mode dry-run et le break-glass.
</details>

### Q10
Sur Cloud Run, une revision `v2` recoit 100 % du trafic des qu'elle est deployee. Vous voulez un deploiement qui **ne bascule jamais automatiquement**. Que faites-vous ?

- A. `gcloud run deploy --no-traffic` puis `update-traffic` progressif apres verification (ou Cloud Deploy canary)
- B. Supprimer l'ancienne revision
- C. Desactiver l'autoscaling
- D. Utiliser `latest`

<details><summary>Reponse</summary>

**A.** `--no-traffic` cree la revision sans trafic ; avec `--tag` on peut la tester via une URL dediee avant de basculer.
</details>

### Q11
Une migration de BDD supprime une colonne utilisee par l'ancienne version. Vous voulez un deploiement **blue/green sans risque de rollback casse**. Quelle approche ?

- A. Supprimer la colonne au meme moment que le deploiement
- B. Pattern **expand/contract** : ajouter sans casser, deployer, migrer, supprimer la colonne dans une release **ulterieure**
- C. Arreter le service pour la migration
- D. Forcer le rollback de la BDD

<details><summary>Reponse</summary>

**B.** Chaque etape reste compatible N-1, donc un rollback applicatif est possible a tout moment. Une migration destructive rend le rollback impossible.
</details>

### Q12
Dans Cloud Deploy, vous voulez que seuls certains **ingenieurs seniors** puissent promouvoir en production, mais que tous les developpeurs puissent creer des releases. Quelle approche ?

- A. Donner `clouddeploy.admin` a tous
- B. `clouddeploy.releaser` aux developpeurs ; `requireApproval: true` sur la target prod ; `clouddeploy.approver` uniquement au groupe senior
- C. Un seul compte partage
- D. Desactiver l'approbation

<details><summary>Reponse</summary>

**B.** Separation des taches : creation vs approbation. Le SA d'execution de la target prod a, lui, les droits de deploiement.
</details>

### Q13
Le depot Docker Hub limite vos pulls (rate limit) et un package npm malveillant a un nom proche de votre package interne (**dependency confusion**). Que mettre en place dans Artifact Registry ?

- A. Un depot standard seulement
- B. Des **depots remote** (cache de Docker Hub/npm/PyPI) et un **depot virtuel** avec priorites (interne d'abord) pour controler la resolution
- C. Rien
- D. Interdire npm

<details><summary>Reponse</summary>

**B.** Le remote evite les rate limits et fournit un point de controle ; le virtuel avec priorites empeche qu'un package public ecrase un package interne.
</details>

### Q14
`terraform apply` s'execute dans Cloud Build avec le SA `tf-apply` tres puissant. Comment reduire le risque ? *(choisir 2)*

- A. Declencher l'apply uniquement depuis `main` avec **approbation de build** requise
- B. Donner `roles/owner` pour eviter les erreurs
- C. Utiliser un SA different pour `plan` (lecture) et `apply` (ecriture)
- D. Executer Terraform sur le poste de chaque developpeur

<details><summary>Reponse</summary>

**A et C.** Approbation + separation plan/apply. B et D augmentent le risque.
</details>

---

## C. SRE et calculs

### Q15
SLO : 99,95 % sur 30 jours, trafic de 20 M requetes. Combien de requetes en erreur sont **autorisees** ?

- A. 1 000
- B. **10 000**
- C. 100 000
- D. 20 000

<details><summary>Reponse</summary>

**B.** `0,0005 x 20 000 000 = 10 000`.
</details>

### Q16
SLO 99,9 % sur 30 jours. Pendant 30 minutes, 20 % des requetes echouent. Quelle part du budget est consommee ?

- A. 20 %
- B. **Environ 13,9 %**
- C. 50 %
- D. 1 %

<details><summary>Reponse</summary>

**B.** Burn rate = `0,20 / 0,001 = 200`. Budget consomme = `burn x duree / fenetre = 200 x 0,5 h / 720 h = 13,9 %`.
</details>

### Q17
Meme SLO (99,9 %/30 j). Un taux d'erreur **constant de 0,6 %** depuis 12 heures. Quel burn rate et que faire ?

- A. Burn rate 0,6 : rien
- B. **Burn rate 6** : correspond a la condition "6 h / 30 min" => **page**
- C. Burn rate 60 : incident majeur
- D. Burn rate 1 : ticket

<details><summary>Reponse</summary>

**B.** `0,006 / 0,001 = 6`. A ce rythme, 5 % du budget part en 6 h : alerte de page. Si le taux continue 12 h, 10 % du budget est deja consomme.
</details>

### Q18
Votre service depend de 3 services critiques, chacun a 99,9 %, appeles en serie sans degradation. Quelle est la disponibilite maximale theorique ?

- A. 99,9 %
- B. **~99,7 %** (0,999^3)
- C. 99,99 %
- D. 99,0 %

<details><summary>Reponse</summary>

**B.** Produit des disponibilites. Votre SLO de 99,9 % est irrealiste sans redondance ou degradation gracieuse.
</details>

### Q19
Pour rendre un SLO de 99,95 % realiste malgre une dependance a 99,9 %, quelle strategie est la plus efficace ?

- A. Baisser le SLO a 99,9 %
- B. **Rendre la dependance non critique** (cache, mode degrade, appel asynchrone) ou ajouter de la redondance
- C. Doubler les timeouts
- D. Supprimer les alertes

<details><summary>Reponse</summary>

**B.** Decoupler le chemin critique de la dependance (ou la dupliquer) releve le plafond. Baisser le SLO (A) est une option de negociation, pas une solution technique.
</details>

### Q20
Une equipe a 6 mois sans incident et 90 % de budget d'erreur **inutilise**. Quelle conclusion SRE ?

- A. Parfait, ne rien changer
- B. Le SLO est probablement **trop strict** : on peut prendre plus de risque (releases plus rapides, experimentation) ou revoir l'objectif
- C. Il faut embaucher
- D. Supprimer la supervision

<details><summary>Reponse</summary>

**B.** Un budget jamais utilise signale une prudence excessive : l'objectif est d'**utiliser** le budget pour innover.
</details>

### Q21
Lors d'un incident SEV1, l'IC remarque que deux ingenieurs modifient la meme configuration simultanement avec des actions contradictoires. Que fait l'IC ?

- A. Rien, ils savent ce qu'ils font
- B. Rappeler que **seul l'Operations Lead modifie la production**, redistribuer les roles et faire annoncer chaque action dans le canal
- C. Prendre le clavier lui-meme
- D. Clore l'incident

<details><summary>Reponse</summary>

**B.** Les actions concurrentes aggravent les incidents ; un seul point de changement et un journal des actions.
</details>

### Q22
Quel element est **le plus important** dans un postmortem ?

- A. Le nom du fautif
- B. Des **actions correctives** concretes, assignees, datees et suivies
- C. Un long recit chronologique
- D. Le cout financier uniquement

<details><summary>Reponse</summary>

**B.** Sans actions suivies, les incidents se repetent. Le recit et l'impact sont necessaires mais ne protegent de rien en eux-memes.
</details>

---

## D. Observabilite

### Q23
Votre sink agrege d'organisation vers BigQuery ne contient aucune ligne depuis 2 jours. Aucune erreur visible. Cause **la plus probable** ?

- A. BigQuery est en panne
- B. La **`writer_identity` du sink n'a pas le role** (ex. `roles/bigquery.dataEditor`) sur le dataset de destination
- C. Les logs sont desactives
- D. Le filtre est trop large

<details><summary>Reponse</summary>

**B.** Erreur classique : creer le sink sans accorder a son identite d'ecriture le droit sur la destination. Verifier la metrique `logging.googleapis.com/exports/error_count`.
</details>

### Q24
Vous voulez une alerte quand une chaine d'erreur precise apparait, **sans creer de metrique** intermediaire. Option ?

- A. Uptime check
- B. **Alerte basee sur les journaux (log-based alert / log match)**
- C. Error Reporting uniquement
- D. Trace

<details><summary>Reponse</summary>

**B.** Alerte de type "log match" avec filtre et limite de notifications. Pour des seuils de frequence, preferer une log-based metric.
</details>

### Q25
Un dashboard Monitoring est tres lent et la facture de metriques explose apres l'ajout d'un label `user_id` sur une metrique personnalisee. Pourquoi ?

- A. Bug de Monitoring
- B. **Cardinalite explosive** : chaque `user_id` cree une serie temporelle distincte
- C. Les labels sont interdits
- D. Trop de dashboards

<details><summary>Reponse</summary>

**B.** Eviter les labels non bornes ; mettre ces details dans les **logs/traces**.
</details>

### Q26
Vous voulez une alerte de burn rate **rapide mais sans faux positifs**. Quelle configuration ?

- A. Une seule condition : taux d'erreur > 0 sur 1 min
- B. **Deux fenetres** : longue (ex. 1 h) ET courte (ex. 5 min) sur le meme burn rate (14,4)
- C. Seuil CPU
- D. Alerte hebdomadaire

<details><summary>Reponse</summary>

**B.** La fenetre longue confirme que c'est significatif ; la courte permet a l'alerte de **s'eteindre vite** quand le probleme est resolu.
</details>

### Q27
Vous devez isoler les logs de l'equipe Paiement : ils ne doivent etre visibles que par cette equipe, sans dupliquer les donnees. Quelle fonction ?

- A. Un projet par equipe obligatoirement
- B. **Log views** sur un log bucket + IAM sur la vue
- C. Export BigQuery
- D. Desactiver les logs des autres equipes

<details><summary>Reponse</summary>

**B.** Les vues donnent acces a un sous-ensemble de logs d'un bucket, controle par IAM.
</details>

### Q28
Pour tracer des requetes a travers 12 microservices dont certains sont dans des langages differents, quelle approche ?

- A. Un logger maison
- B. **OpenTelemetry** avec **propagation du contexte** (`traceparent`) + export vers Cloud Trace, echantillonnage adapte
- C. Cloud Profiler
- D. Uptime checks

<details><summary>Reponse</summary>

**B.** Standard independant du langage ; le contexte doit etre propage a chaque saut.
</details>

---

## E. GKE et performance

### Q29
HPA cible CPU 50 %. 5 pods, utilisation moyenne 80 %. Combien de replicas voulus ?

- A. 6
- B. **8**
- C. 10
- D. 5

<details><summary>Reponse</summary>

**B.** `ceil(5 x 80/50) = ceil(8) = 8`.
</details>

### Q30
Un Deployment a `maxSurge: 25%`, `maxUnavailable: 0`, 8 replicas. Combien de pods maximum existent pendant la mise a jour et combien sont au minimum disponibles ?

- A. 10 max, 8 min
- B. 8 max, 6 min
- C. 12 max, 6 min
- D. 9 max, 7 min

<details><summary>Reponse</summary>

**A.** `maxSurge 25 % de 8 = 2` (arrondi vers le haut) => 10 pods max ; `maxUnavailable 0` => 8 toujours disponibles.
</details>

### Q31
Des pods sont `OOMKilled` regulierement alors que le noeud a de la memoire libre. Cause ?

- A. Le noeud est defectueux
- B. La **limite memoire du conteneur** (`limits.memory`) est depassee : le noyau tue le conteneur meme si le noeud a de la memoire libre
- C. Probleme reseau
- D. HPA mal configure

<details><summary>Reponse</summary>

**B.** Solution : mesurer l'usage reel (Profiler/metriques), ajuster requests/limits, corriger la fuite.
</details>

### Q32 *(choisir 2)*
Un service Cloud Run subit des **pics brutaux** avec cold starts penalisants et sature sa BDD. Quels reglages ?

- A. `min-instances` > 0 (reduit les cold starts)
- B. `max-instances` illimite
- C. `max-instances` borne en accord avec la capacite de la BDD (+ pooling)
- D. Desactiver la concurrence

<details><summary>Reponse</summary>

**A et C.** Min-instances pour la latence de demarrage ; max-instances (et pooling de connexions) pour proteger la BDD.
</details>

---

## Correction globale

| Score (/32) | Niveau |
|-------------|--------|
| 29-32 | Excellent : pret pour l'examen |
| 24-28 | Bon : cibler les sections ratees d'approfondissement |
| < 24 | Reprendre approfondissement.md, refaire `questions.md` puis ce test |

Pour chaque erreur de calcul (Q15-Q19, Q29-Q30), **refaites le calcul a la main** : l'examen en contient peu mais ils discriminent.
