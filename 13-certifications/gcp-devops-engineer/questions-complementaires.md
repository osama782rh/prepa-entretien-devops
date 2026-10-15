# GCP DevOps Engineer - Questions complementaires

16 questions supplementaires couvrant des sujets peu traites dans `questions.md` : budget d'erreur, supply chain, Cloud Deploy, observabilite avancee, toil, couts.

## Domaine 2 - CI/CD et supply chain

### Q1
Vous voulez que **seules les images construites par votre pipeline Cloud Build** puissent etre deployees sur GKE en production. Quelle solution ?

- A. Restreindre l'acces en ecriture a Artifact Registry
- B. Activer Container Analysis pour scanner les vulnerabilites
- C. Activer **Binary Authorization** avec une politique exigeant une attestation signee par le pipeline
- D. Utiliser des noms d'image avec le tag `prod`

<details><summary>Reponse</summary>

**C.** Binary Authorization verifie a l'admission que l'image porte les attestations requises (signees par Cloud Build apres tests). A limite qui pousse, pas ce qui est deploye ; B detecte mais ne bloque pas ; D n'est pas un controle.
</details>

### Q2
Une application doit etre promue automatiquement de `dev` vers `staging`, puis **apres approbation manuelle** vers `prod`, avec un historique de releases. Quel service ?

- A. Cloud Scheduler
- B. **Cloud Deploy** (delivery pipeline avec cibles et approbation)
- C. Cloud Functions declenchee par Pub/Sub
- D. Un script Bash dans Cloud Build

<details><summary>Reponse</summary>

**B.** Cloud Deploy modelise une progression de cibles, des approbations, des rollbacks et un historique. D est faisable mais sans ces fonctions natives.
</details>

### Q3
Un deploiement Cloud Run doit envoyer **5 % du trafic** vers la nouvelle revision, puis augmenter si les metriques sont bonnes. Que faites-vous ?

- A. Deployer la nouvelle revision avec `--no-traffic`, puis repartir le trafic avec `gcloud run services update-traffic`
- B. Creer deux services et utiliser Cloud DNS
- C. Utiliser un Load Balancer externe pour chaque revision
- D. Impossible sur Cloud Run

<details><summary>Reponse</summary>

**A.** Cloud Run gere nativement la repartition du trafic par revision (canary, rollback instantane). Les autres options ajoutent de la complexite inutile.
</details>

### Q4
Vos builds Cloud Build doivent atteindre une base de donnees **sans IP publique** dans un VPC. Que faire ?

- A. Ouvrir la base a Internet avec une liste d'IP autorisees
- B. Utiliser un **private pool** Cloud Build connecte au VPC
- C. Executer le build en local
- D. Donner le role Owner au compte de service Cloud Build

<details><summary>Reponse</summary>

**B.** Les private pools executent les builds dans un reseau peered avec votre VPC. A affaiblit la securite, D n'aide pas le reseau.
</details>

## Domaine 3 - SRE

### Q5
Un service a un SLO de **99,9 %** de disponibilite sur 30 jours. Quel est le **budget d'erreur** en indisponibilite ?

- A. Environ 4,3 minutes
- B. Environ 43 minutes
- C. Environ 7 heures
- D. Environ 72 heures

<details><summary>Reponse</summary>

**B.** 30 j x 24 h x 60 min = 43 200 min ; 0,1 % = **43,2 min**. (99,99 % donnerait ~4,3 min ; 99 % ~7,2 h.)
</details>

### Q6
Le budget d'erreur du trimestre est **epuise** alors que l'equipe produit veut livrer de nouvelles fonctions. Que dit l'approche SRE ?

- A. Livrer quand meme, les clients comprendront
- B. **Geler les deploiements de fonctionnalites** et prioriser la fiabilite jusqu'au retour dans le budget
- C. Baisser le SLO pour remettre le budget a positif
- D. Supprimer les alertes

<details><summary>Reponse</summary>

**B.** La politique de budget d'erreur lie vitesse et fiabilite. C (modifier le SLO apres coup) masque le probleme, sauf revue legitime du SLO.
</details>

### Q7
Quelle alerte detecte le mieux un **epuisement rapide** du budget d'erreur tout en limitant les faux positifs ?

- A. Alerte sur chaque erreur 5xx
- B. Alerte sur un seuil CPU > 80 %
- C. Alerte basee sur le **burn rate** avec fenetres multiples (courte et longue)
- D. Alerte sur la latence moyenne

<details><summary>Reponse</summary>

**C.** Le burn rate mesure la vitesse de consommation du budget ; combiner une fenetre courte (reactivite) et longue (fiabilite) reduit le bruit. Les symptomes pour l'utilisateur priment sur les causes (CPU).
</details>

### Q8
Laquelle est un exemple de **toil** ?

- A. Ecrire un outil qui automatise le renouvellement des certificats
- B. Redemarrer manuellement chaque semaine le meme service qui fuit en memoire
- C. Rediger un postmortem
- D. Concevoir un nouveau SLO

<details><summary>Reponse</summary>

**B.** Le toil est manuel, repetitif, automatisable, sans valeur durable et croit avec le service. A est de l'ingenierie qui reduit le toil.
</details>

### Q9
Apres un incident majeur, quelle pratique de postmortem est recommandee ?

- A. Identifier la personne fautive pour la sanctionner
- B. Ne documenter que le correctif
- C. Postmortem **sans blame** : chronologie, causes racines, impact, actions suivies avec responsables
- D. Garder le document confidentiel dans l'equipe d'astreinte

<details><summary>Reponse</summary>

**C.** L'objectif est d'apprendre et d'ameliorer les systemes ; le blame decourage la transparence. Les actions doivent etre suivies jusqu'a cloture.
</details>

### Q10
Quels SLI choisir pour un **pipeline de traitement de donnees par lots** ? *(choisir 2)*

- A. Fraicheur des donnees
- B. Taux de requetes HTTP 200
- C. Debit / proportion d'enregistrements traites correctement
- D. Utilisation CPU moyenne

<details><summary>Reponse</summary>

**A et C.** Pour le batch : fraicheur, exactitude/couverture, debit. Disponibilite/latence de requetes conviennent aux services interactifs ; la CPU est une metrique de ressource, pas un SLI utilisateur.
</details>

## Domaine 4 - Supervision

### Q11
Vous devez surveiller **plusieurs projets** depuis un seul tableau de bord Cloud Monitoring. Que configurer ?

- A. Un export manuel de metriques vers chaque projet
- B. Une **portee de metriques** (metrics scope) dans un projet de supervision incluant les autres projets
- C. Un compte de service par projet
- D. Impossible

<details><summary>Reponse</summary>

**B.** Le projet hote du metrics scope peut lire les metriques des projets surveilles et centraliser tableaux de bord et alertes.
</details>

### Q12
Vous devez garder les logs d'audit **7 ans** au moindre cout, sans besoin de requetes frequentes. Quelle destination de sink ?

- A. BigQuery
- B. Pub/Sub
- C. **Cloud Storage** (classe Archive / Coldline avec retention)
- D. Cloud Logging avec retention 30 jours

<details><summary>Reponse</summary>

**C.** Pour de l'archivage long et peu consulte, Cloud Storage est le plus economique (avec bucket lock si exigence reglementaire). BigQuery convient a l'analyse SQL.
</details>

### Q13
Un service est lent en production et vous voulez savoir **quelle fonction consomme le plus de CPU**, avec un faible surcout. Quel outil ?

- A. Cloud Trace
- B. Cloud Profiler
- C. Error Reporting
- D. Uptime checks

<details><summary>Reponse</summary>

**B.** Cloud Profiler fait du profilage continu (CPU, tas) en production. Trace montre la latence par requete/appel distribue ; Error Reporting regroupe les exceptions.
</details>

### Q14
Votre facture Cloud Logging est elevee a cause de logs de debug tres verbeux et inutiles. Quelle action reduit le cout **sans modifier le code** ?

- A. Desactiver Cloud Monitoring
- B. Ajouter un **filtre d'exclusion** sur le routeur de logs (sink `_Default`)
- C. Passer les VM a un type plus petit
- D. Supprimer le projet

<details><summary>Reponse</summary>

**B.** Les exclusions evitent de stocker les logs correspondants (les logs d'audit des activites d'administration ne peuvent pas etre exclus). Le meilleur levier reste de reduire le niveau de log applicatif.
</details>

### Q15
Vous collectez des metriques **Prometheus** depuis GKE et voulez eviter d'exploiter votre propre serveur Prometheus. Que choisir ?

- A. Installer Prometheus sur un noeud
- B. **Google Cloud Managed Service for Prometheus**
- C. Exporter vers un fichier CSV
- D. Utiliser uniquement des logs

<details><summary>Reponse</summary>

**B.** Service gere, compatible PromQL, sans operations de stockage a assurer.
</details>

## Domaine 5 - Performance et cout

### Q16
Une charge GKE tres variable ; l'equipe ne veut **pas gerer les noeuds** et paye a la ressource demandee par les pods. Quel mode ?

- A. GKE Standard avec noeuds preemptibles
- B. GKE Autopilot
- C. Compute Engine avec MIG
- D. App Engine Flexible

<details><summary>Reponse</summary>

**B.** Autopilot gere les noeuds et facture les ressources des pods. Standard donne plus de controle mais plus d'exploitation.
</details>
