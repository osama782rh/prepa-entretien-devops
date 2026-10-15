# Module 13 - Preparation aux certifications Cloud

Ce module regroupe la preparation a deux certifications cloud, plus un **socle Terraform avance** (votre outil principal) qui sert aux deux :

| Parcours | Editeur | Dossier | Niveau |
|----------|---------|---------|--------|
| **Professional Cloud DevOps Engineer** | Google Cloud | [gcp-devops-engineer/](gcp-devops-engineer/) | Professional |
| **AZ-305 : Designing Microsoft Azure Infrastructure Solutions** | Microsoft | [az-305/](az-305/) | Expert (Azure Solutions Architect Expert) |
| **Terraform avance** (+ prep. *HashiCorp Terraform Associate*) | HashiCorp | [terraform/](terraform/) | Associate -> expert |

Contenu de chaque dossier :

| Fichier | Role |
|---------|------|
| `README.md` | **Cours** complet, organise par domaine d'examen |
| `approfondissement.md` (GCP, AZ-305) | **Theorie avancee** : mecanismes, calculs, criteres de decision, etudes de cas |
| `questions.md` | Questions d'entrainement de base, avec reponses expliquees (blocs `<details>`) |
| `questions-avancees.md` (GCP, AZ-305) | Questions **difficiles** : multi-contraintes, calculs, lecture de configuration |
| `labs/` (Terraform) | **6 labs pratiques** avec solutions (local, GCP, Azure, CI/CD) |

Volume total : GCP 37 + 32 questions, AZ-305 42 + 34 questions (+ 2 etudes de cas), Terraform 58 questions.

### Ordre de travail recommande

```
1. Terraform (cours + labs 1-3, sans cloud)      <- votre socle, 1 semaine
2. Cours GCP ou AZ-305  ->  questions.md
3. approfondissement.md ->  questions-avancees.md
4. Labs 4-6 (Terraform sur GCP / Azure / CI)     <- consolide la pratique
5. Revoir uniquement les erreurs (carnet d'erreurs)
```

> **Important** : les pourcentages, durees et prix ci-dessous sont indicatifs et changent regulierement.
> Verifiez toujours le guide d'examen officiel avant de planifier :
> - GCP : https://cloud.google.com/learn/certification/cloud-devops-engineer
> - AZ-305 : https://learn.microsoft.com/credentials/certifications/exams/az-305/

---

## Vue d'ensemble des examens

| | GCP Professional Cloud DevOps Engineer | AZ-305 |
|---|---|---|
| **Format** | QCM / QCM multiples | QCM, etudes de cas, glisser-deposer, hot area |
| **Duree** | 2 heures | ~100-120 minutes |
| **Nombre de questions** | 50-60 | 40-60 |
| **Score de reussite** | Non communique | 700 / 1000 |
| **Langues** | Anglais, japonais | Anglais, francais, etc. |
| **Validite** | 2 ans | 1 an (renouvellement gratuit en ligne) |
| **Prerequis officiel** | Aucun (3 ans d'experience recommandes) | AZ-104 (Azure Administrator Associate) pour obtenir le titre Expert |
| **Nature** | Operations, CI/CD, SRE, observabilite | Conception d'architecture (choisir le bon service) |

## Domaines d'examen

### GCP Professional Cloud DevOps Engineer
1. Bootstrapping d'une organisation Google Cloud pour le DevOps (~15 %)
2. Construction et implementation de pipelines CI/CD (~25 %)
3. Pratiques SRE appliquees a un service (~23 %)
4. Strategies de supervision d'un service (~21 %)
5. Optimisation des performances d'un service (~16 %)

### AZ-305
1. Concevoir des solutions d'identite, de gouvernance et de supervision (25-30 %)
2. Concevoir des solutions de stockage de donnees (20-25 %)
3. Concevoir des solutions de continuite d'activite (15-20 %)
4. Concevoir des solutions d'infrastructure (30-35 %)

---

## Lien avec le reste du lab

| Sujet de certification | Module du lab a reviser avant |
|------------------------|-------------------------------|
| IaC (Terraform, Bicep) | 08 - Terraform / IaC |
| Reseau cloud (VPC, VNet, peering, LB) | 04 - Reseau TCP/IP, 10 - Cloud |
| DNS prive / hybride | 06 - DNS / IPAM |
| Load balancing L4/L7 | 07 - HAProxy, 10 - Cloud |
| Monitoring, SLI/SLO, alerting | 11 - Supervision |
| Git, GitOps, CI/CD | 09 - Git |
| Scripts gcloud / az / API | 01-03 - Python, API REST |

---

## Planning suggere

### Parcours GCP DevOps Engineer (~4 semaines, 1h30/jour)

| Semaine | Contenu | Pratique |
|---------|---------|----------|
| 1 | Domaine 1 (organisation, IAM, Org Policy) + bases CI/CD | Creer un projet, un pipeline Cloud Build simple |
| 2 | Domaine 2 (Cloud Build, Artifact Registry, Cloud Deploy, Binary Authorization) | Deployer sur Cloud Run/GKE avec canary |
| 3 | Domaine 3 (SRE : SLO, error budget, incidents, postmortems) + Domaine 4 (monitoring/logging) | Creer un SLO et une alerte de burn rate |
| 4 | Domaine 5 (performance) + questions d'entrainement + revisions | 2 passages complets de `questions.md` |

### Parcours AZ-305 (~4 semaines, 1h30/jour)

| Semaine | Contenu | Pratique |
|---------|---------|----------|
| 1 | Domaine 1 (Entra ID, RBAC, Policy, management groups, monitoring) | Creer une hierarchie MG + une Policy + un Log Analytics |
| 2 | Domaine 2 (stockage, SQL, Cosmos DB, integration de donnees) | Comparer SQL DB / MI / Cosmos sur un cas concret |
| 3 | Domaine 3 (BCDR) + debut Domaine 4 (compute, reseau) | Calculer des SLA composites, configurer ASR/Backup |
| 4 | Fin Domaine 4 (apps, migration, hybride) + questions + Microsoft Learn practice assessment | 2 passages de `questions.md` + etudes de cas |

> **Astuce** : les deux certifications sont tres orientees **scenarios**. Ne memorisez pas des listes de services,
> apprenez a repondre a : *"Quelle est la contrainte principale (cout, disponibilite, securite, effort operationnel) ?"*
> Le bon choix est presque toujours celui qui **repond a la contrainte avec le moins d'effort operationnel** (service manage).

## Ressources officielles gratuites

**GCP**
- Google Cloud Skills Boost : parcours *Cloud DevOps Engineer Learning Path*
- Livre *Site Reliability Engineering* et *The SRE Workbook* (gratuits sur sre.google)
- Exam guide + sample questions officiels
- Cloud Architecture Center

**Azure**
- Microsoft Learn : parcours *AZ-305 : Designing Microsoft Azure Infrastructure Solutions*
- *Azure Well-Architected Framework* et *Cloud Adoption Framework*
- Practice Assessment gratuit sur la page de l'examen
- Azure Architecture Center (architectures de reference)
- Exam Sandbox (pour decouvrir les types de questions)
