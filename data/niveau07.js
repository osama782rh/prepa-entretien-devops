window.QBANK = (window.QBANK || []).concat([
/* ================= NIVEAU 7 — ARCHITECTURE & PRODUCTION ================= */

{ id:"n7-arch-01", lvl:7, dom:"SRE",
  q:"On te demande une application « hautement disponible ». Quelles questions poses-tu AVANT de proposer une architecture ?",
  must:[["rto","rpo","perte de donnees","temps de reprise"],["budget","cout","slo","disponibilite cible"]],
  explain:"1) Quel SLO de disponibilité réel, et qui le subit ? 2) RTO et RPO acceptés ? 3) Budget, y compris le coût de la capacité dormante. 4) L'application est-elle stateless ou porte-t-elle un état ? 5) Contraintes réglementaires et de résidence des données. 6) Y a-t-il des dépendances externes hors de notre contrôle ? Répondre « multi-région actif/actif » sans ces réponses est le piège classique." },

{ id:"n7-k8s-01", lvl:7, dom:"Kubernetes",
  q:"Comment garantis-tu qu'un service reste disponible pendant l'upgrade d'un cluster AKS/EKS ?",
  must:[["pdb","poddisruptionbudget"],["anti-affinity","topology spread","reparti","plusieurs noeuds"]],
  explain:"Réplicas &gt; 1 répartis par <code>topologySpreadConstraints</code> ou anti-affinité sur des zones et des nœuds différents, PodDisruptionBudget avec <code>minAvailable</code>, readiness probes fiables, arrêt gracieux avec preStop, surge upgrade sur le node pool (on ajoute un nœud avant de vider l'ancien), et upgrade nœud par nœud hors des heures de pointe. On teste la procédure en recette d'abord." },

{ id:"n7-k8s-02", lvl:7, dom:"Kubernetes",
  q:"Faut-il faire tourner une base de données en Kubernetes ? Défends une position.",
  accept:["depend","operateur","statefulset","service manage","complexite"],
  explain:"Position défendable : par défaut NON en banque — un service managé (RDS, Azure SQL, Aurora) fournit sauvegardes, PITR, patchs, HA et certification sans coût opérationnel. On met une base dans K8s si on a un opérateur mature (CloudNativePG, Vitess), une vraie compétence interne, un besoin de portabilité multi-cloud ou du dev/test. Le point clé en entretien : montrer qu'on arbitre coût opérationnel vs contrôle, pas dire « ça se fait »." },

{ id:"n7-k8s-03", lvl:7, dom:"Kubernetes",
  q:"Multi-tenant : comment isoles-tu plusieurs équipes sur un même cluster ?",
  must:[["namespace"],["rbac"],["networkpolicy","reseau"],["quota","resourcequota","limitrange"]],
  explain:"Namespace par équipe + RBAC limité, ResourceQuota et LimitRange, NetworkPolicy default-deny, Pod Security Admission (restricted), politiques d'admission (Kyverno/Gatekeeper) pour imposer labels, images signées et absence de privilèges, node pools dédiés avec taints pour les charges sensibles. Limite honnête : l'isolation reste souple — pour du vrai cloisonnement réglementaire, on sépare les clusters." },

{ id:"n7-k8s-04", lvl:7, dom:"Kubernetes",
  q:"Qu'apporte un service mesh et quel est son coût réel ?",
  accept:["mtls","observabilite","trafic","sidecar","latence","complexite"],
  explain:"Apports : mTLS automatique entre services, routage fin (canary, mirroring), retries/timeouts/circuit breakers hors du code, métriques et traces uniformes. Coût : un sidecar par Pod (CPU, mémoire, latence de quelques ms), une couche de plus à opérer et déboguer, une courbe d'apprentissage réelle. À justifier par un besoin (zero trust, canaries fins), pas par la mode ; les modes ambient/eBPF réduisent le surcoût." },

{ id:"n7-tf-01", lvl:7, dom:"Terraform",
  q:"Comment découpes-tu tes states Terraform sur une plateforme d'entreprise, et pourquoi ?",
  must:[["par cycle de vie","par domaine","par environnement","blast radius","rayon"]],
  explain:"On découpe par RAYON D'IMPACT et par cycle de vie : réseau/landing zone (change rarement, très critique) / plateforme partagée (cluster, registry) / applications (change souvent). Plus un environnement par state. Bénéfices : plan rapide, erreur circonscrite, droits séparés par équipe, verrous indépendants. Le coût : des contrats explicites entre states (paramètres publiés, pas de lecture croisée)." },

{ id:"n7-tf-02", lvl:7, dom:"Terraform",
  q:"Décris un pipeline Terraform d'entreprise, de la PR à la prod.",
  must:[["plan","pr"],["approbation","validation","review"],["apply"]],
  explain:"PR → <code>fmt</code>/<code>validate</code>/<code>tflint</code> → scan de conformité (tfsec/Checkov/OPA) → <code>plan</code> publié en commentaire de PR → revue humaine (2 yeux minimum en prod) → merge → <code>apply</code> du plan SAUVEGARDÉ (pas un replan) → tests de smoke → notification. Identité du pipeline par OIDC, aucun credential statique, environnements protégés avec approbation manuelle sur la prod, et détection de drift planifiée." },

{ id:"n7-tf-03", lvl:7, dom:"Terraform",
  q:"Terraform ou Bicep/ARM/CloudFormation pour un client mono-cloud ? Argumente les deux côtés.",
  accept:["natif","multi cloud","state","ecosysteme","support day 0"],
  explain:"Natif (Bicep/CFN) : pas de state à gérer, support des nouveautés dès le jour 1, intégration native au support de l'éditeur, drift géré par la plateforme. Terraform : langage unique quel que soit le fournisseur, écosystème de modules et d'outils, gestion des ressources hors cloud (DNS, GitHub, Vault, Datadog), compétences transférables. En banque multi-cloud, Terraform gagne surtout par l'homogénéité des pratiques." },

{ id:"n7-aws-01", lvl:7, dom:"AWS",
  q:"Conçois une architecture web 3-tiers hautement disponible sur AWS. Cite les composants et où ils vivent.",
  must:[["multi az","plusieurs az","az"],["alb","load balancer"],["rds","base","multi-az"]],
  explain:"Route 53 → CloudFront (+ WAF) → ALB dans les subnets publics de 2-3 AZ → ASG d'instances (ou ECS/EKS) dans les subnets privés → RDS Multi-AZ dans les subnets base de données, avec réplicas en lecture. Sortie via NAT Gateway par AZ. Secrets dans Secrets Manager, statique sur S3, sauvegardes automatiques, alarmes CloudWatch, et tout décrit en IaC." },

{ id:"n7-aws-02", lvl:7, dom:"AWS",
  q:"Quelle stratégie multi-compte recommandes-tu et pourquoi ?",
  must:[["organizations","landing zone","control tower"],["scp","isolation","separation"]],
  explain:"AWS Organizations avec des OU par usage (Sécurité, Infrastructure, Workloads Prod, Workloads Non-Prod, Bac à sable), un compte par application ET par environnement. Bénéfices : isolation dure du rayon d'impact et des quotas, facturation par équipe, SCP différenciées par OU. Comptes centraux : log archive, audit/sécurité, réseau. Control Tower / Landing Zone Accelerator pour industrialiser." },

{ id:"n7-aws-03", lvl:7, dom:"AWS",
  q:"Comment optimises-tu sérieusement une facture AWS ? Cite au moins cinq leviers classés par impact.",
  must:[["savings plan","reserved","engagement"],["rightsizing","dimensionnement"],["arret","eteindre","planification"]],
  explain:"1) Rightsizing (les instances sont surdimensionnées par défaut). 2) Savings Plans / Reserved Instances sur la base stable (jusqu'à -70 %). 3) Extinction planifiée des environnements hors production. 4) Spot pour les charges tolérantes aux interruptions. 5) Cycle de vie du stockage (S3 tiering, suppression des snapshots et volumes orphelins). 6) Transfert de données : éviter l'inter-AZ inutile, revoir NAT Gateway et CloudFront. 7) Rétention des logs. Prérequis : tagging obligatoire pour attribuer les coûts." },

{ id:"n7-az-01", lvl:7, dom:"Azure",
  q:"Qu'est-ce qu'une landing zone Azure et que contient-elle ?",
  must:[["management group","hierarchie"],["policy","gouvernance"],["reseau","hub","connectivite"]],
  explain:"Le socle de gouvernance déployé avant les applications : hiérarchie de management groups, subscriptions par usage (identité, connectivité, management, landing zones prod/non-prod), Azure Policy et initiatives de conformité, RBAC et PIM, réseau hub-and-spoke avec firewall et DNS privé, journalisation centralisée dans un workspace Log Analytics, et sauvegarde/DR. Le tout en IaC (CAF/ALZ Terraform ou Bicep)." },

{ id:"n7-az-02", lvl:7, dom:"Azure",
  q:"AKS, App Service ou Container Apps : comment choisis-tu ?",
  accept:["controle","complexite","serverless","charge de travail","equipe"],
  explain:"App Service : application web classique, peu d'ops, déploiement simple, slots — le défaut raisonnable. Container Apps : microservices conteneurisés, scale-to-zero, KEDA, Dapr, sans gérer de cluster. AKS : besoin de contrôle fin (opérateurs, CRD, service mesh, réseau, multi-tenant), équipe capable d'opérer un cluster. Critère décisif : la maturité et la taille de l'équipe, pas la technologie." },

{ id:"n7-az-03", lvl:7, dom:"Azure",
  q:"Comment garantis-tu la conformité continue d'un parc Azure de 200 abonnements ?",
  must:[["azure policy","initiative"],["remediation","deployifnotexists","audit"]],
  explain:"Initiatives Azure Policy assignées au niveau management group (deny sur les régions non autorisées, deny sur IP publique, audit du chiffrement, deployIfNotExists pour les diagnostic settings), remédiation automatique sur l'existant, tableau de bord de conformité, Defender for Cloud avec un score de sécurité suivi, et blueprints/IaC pour tout nouveau compte. Les exceptions passent par une exemption tracée et datée, jamais par une désactivation." },

{ id:"n7-cicd-01", lvl:7, dom:"CI/CD",
  q:"Comment conçois-tu un pipeline pour 50 microservices sans dupliquer 50 fois le même YAML ?",
  accept:["template","pipeline reutilisable","workflow reutilisable","bibliotheque partagee","versionne"],
  explain:"Des templates/workflows réutilisables versionnés dans un dépôt central (GitLab <code>include</code>, GitHub reusable workflows, Azure DevOps templates, Jenkins shared library), paramétrés par service. Chaque dépôt applicatif ne contient qu'une dizaine de lignes. Points d'attention : versionner les templates (jamais <code>@main</code> en prod), tester leurs évolutions, et garder une porte de sortie pour les cas particuliers." },

{ id:"n7-cicd-02", lvl:7, dom:"CI/CD",
  q:"Quelles sont les quatre métriques DORA et que mesurent-elles ensemble ?",
  must:[["frequence de deploiement","deployment frequency"],["lead time","delai"],["mttr","temps de restauration"],["taux d echec","change failure"]],
  explain:"Fréquence de déploiement, Lead time for changes (du commit à la prod), Change failure rate (% de déploiements causant une dégradation), Time to restore service. Les deux premières mesurent la VITESSE, les deux dernières la STABILITÉ — et le résultat clé de l'étude DORA est qu'elles progressent ENSEMBLE : déployer plus souvent et par petits lots réduit le risque au lieu de l'augmenter. Argument très utile face à une culture bancaire prudente." },

{ id:"n7-cicd-03", lvl:7, dom:"CI/CD",
  q:"Comment gères-tu une release nécessitant la coordination de 5 services interdépendants ?",
  accept:["retrocompatibilite","contrat","versionner l api","feature flag","decoupler"],
  explain:"On refuse le big bang : rétrocompatibilité des contrats d'API (versionner, ne jamais casser un champ existant), tests de contrat (Pact) en CI, déploiement indépendant service par service, et feature flags pour activer la fonctionnalité une fois tous les morceaux en place. Si une coordination stricte reste nécessaire, c'est un signal de couplage à corriger dans l'architecture." },

{ id:"n7-sec-01", lvl:7, dom:"Sécurité",
  q:"Qu'est-ce que le modèle zero trust appliqué à une infrastructure cloud ?",
  must:[["jamais faire confiance","verifier","pas de confiance implicite"],["identite","moindre privilege","mtls","segmentation"]],
  explain:"On abandonne l'idée de réseau interne de confiance : chaque appel est authentifié et autorisé, quelle que soit sa provenance. En pratique : identité forte partout (MFA, identités de charge de travail, mTLS entre services), autorisation contextuelle et moindre privilège, micro-segmentation réseau, chiffrement systématique, journalisation exhaustive et vérification continue de la posture. Le périmètre reste utile en défense en profondeur, mais il n'est plus le contrôle principal." },

{ id:"n7-sec-02", lvl:7, dom:"Sécurité",
  q:"Comment sécurises-tu la chaîne CI/CD elle-même ?",
  must:[["oidc","identite federee","pas de secret statique"],["runner","isolation","ephemere"],["approbation","protection","branche protegee"]],
  explain:"Branches protégées avec revue obligatoire et commits signés, runners éphémères et isolés par niveau de sensibilité, identité fédérée OIDC sans secret longue durée, secrets scopés par environnement avec approbation manuelle en prod, actions/images tierces épinglées par digest, séparation des droits build vs deploy, et journalisation immuable des déploiements. La CI est la cible privilégiée : qui contrôle le pipeline contrôle la prod." },

{ id:"n7-obs-01", lvl:7, dom:"Observabilité",
  q:"Comment instrumentes-tu une architecture microservices pour pouvoir diagnostiquer une requête de bout en bout ?",
  must:[["trace","tracing distribue"],["correlation","trace id","propagation","context"]],
  explain:"OpenTelemetry comme standard d'instrumentation : propagation du contexte (W3C traceparent) à travers tous les appels HTTP/gRPC/messages, trace ID injecté dans TOUS les logs pour la corrélation, spans sur les appels sortants et les requêtes base, exemplars reliant métriques et traces, échantillonnage adaptatif (garder 100 % des erreurs et des requêtes lentes). Sans propagation du contexte, la trace se coupe au premier service non instrumenté." },

{ id:"n7-obs-02", lvl:7, dom:"Observabilité",
  q:"Comment définis-tu une alerte qui mérite de réveiller quelqu'un à 3 h du matin ?",
  must:[["actionnable","action possible"],["impact","utilisateur","urgent"]],
  explain:"Trois critères cumulatifs : impact utilisateur réel et en cours, urgence (attendre le matin aggrave), et ACTION possible par la personne d'astreinte (avec un runbook). Tout le reste va en ticket ou en dashboard. On alerte sur le budget d'erreur qui se consomme trop vite (burn rate multi-fenêtres) plutôt que sur un seuil instantané, et on mesure le taux de faux positifs." },

{ id:"n7-sre-01", lvl:7, dom:"SRE",
  q:"Qu'est-ce que le chaos engineering et comment l'introduis-tu dans une banque ?",
  must:[["hypothese","experience","injecter une panne"],["perimetre","controle","recette","progressif"]],
  explain:"Injecter volontairement des pannes pour VALIDER une hypothèse de résilience (« si une AZ tombe, le service tient »). En banque, on introduit progressivement : d'abord en recette avec un périmètre défini, une hypothèse écrite, un rayon d'impact limité, un bouton d'arrêt et une fenêtre annoncée. On ne passe en production qu'après avoir démontré la valeur et obtenu l'adhésion du risque opérationnel — c'est autant un sujet de gouvernance que technique." },

{ id:"n7-sre-02", lvl:7, dom:"SRE",
  q:"Comment dimensionnes-tu une capacité pour un pic connu (clôture mensuelle, Black Friday) ?",
  must:[["test de charge","load test","benchmark"],["marge","headroom","autoscaling"]],
  explain:"1) Mesurer le point de rupture par un test de charge représentatif (pas un ping). 2) Identifier le facteur limitant réel (souvent la base ou un pool de connexions, pas le CPU applicatif). 3) Extrapoler le pic attendu avec une marge (x2 typique). 4) Pré-scaler avant le pic plutôt que compter sur un autoscaling réactif qui arrive trop tard. 5) Prévoir la dégradation gracieuse (file d'attente, fonctionnalités secondaires coupées) et un plan de repli." },

{ id:"n7-res-01", lvl:7, dom:"Réseau",
  q:"Comment connectes-tu un datacenter on-premise à Azure et AWS de façon fiable ?",
  must:[["expressroute","direct connect"],["vpn","redondance","secours"]],
  explain:"Lien privé dédié (ExpressRoute côté Azure, Direct Connect côté AWS) pour la latence et la bande passante garanties, avec un VPN IPsec site-to-site en secours automatique par BGP. Redondance : deux circuits sur des points de présence distincts et si possible deux opérateurs. Attention aux chevauchements de plans d'adressage, à la propagation BGP et au routage asymétrique — c'est là que ça casse en pratique." },

{ id:"n7-sql-01", lvl:7, dom:"SQL",
  q:"Quand choisis-tu une base NoSQL plutôt que relationnelle ? Justifie sans clichés.",
  accept:["modele d acces","cle","echelle horizontale","schema flexible","jointure"],
  explain:"On choisit selon le MODÈLE D'ACCÈS, pas selon la mode. NoSQL clé-valeur/document (DynamoDB, Cosmos) quand les accès sont connus à l'avance, par clé, avec un besoin d'échelle horizontale massive et de latence constante. Relationnel quand on a des relations riches, des requêtes ad hoc, de l'intégrité transactionnelle forte et des besoins analytiques. En banque, le relationnel reste dominant : la cohérence et l'auditabilité priment." },

{ id:"n7-sql-02", lvl:7, dom:"SQL",
  q:"Explique le théorème CAP et ce qu'il implique concrètement lors d'une partition réseau.",
  must:[["coherence","consistency"],["disponibilite","availability"],["partition"]],
  explain:"En cas de PARTITION réseau (qui n'est pas optionnelle en distribué), il faut choisir : rester cohérent en refusant de répondre (CP — la base refuse les écritures du côté minoritaire), ou rester disponible en acceptant des réponses potentiellement périmées (AP). Concrètement : pour un solde de compte on prend CP, pour un catalogue produit on prend AP. Hors partition, on peut avoir les deux — d'où le modèle PACELC, plus honnête." },

{ id:"n7-arch-02", lvl:7, dom:"SRE",
  q:"Microservices ou monolithe pour une nouvelle application ? Ta réponse en entretien.",
  accept:["monolithe modulaire","commencer simple","cout organisationnel","conway","depend de l equipe"],
  explain:"Réponse défendable : commencer par un monolithe MODULAIRE bien découpé et n'extraire des services que quand un besoin réel apparaît (équipes indépendantes, scaling différencié, cycles de release divergents). Les microservices déplacent la complexité du code vers le réseau et l'exploitation : latence, cohérence distribuée, observabilité, coût. Loi de Conway : l'architecture reflétera l'organisation — c'est elle qui doit décider, pas l'inverse." }

]);
