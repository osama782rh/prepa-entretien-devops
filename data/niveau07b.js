window.QBANK = (window.QBANK || []).concat([
/* ============ NIVEAU 7 — SÉRIE B ============ */

{ id:"b7-arch-01", lvl:7, dom:"SRE",
  q:"Conçois une architecture d'ingestion de 500 000 événements par minute. Quels choix structurants ?",
  must:[["file","broker","kafka","queue","tampon"],["partition","scale","parallele","consommateur"]],
  explain:"Un broker en tampon (Kafka, Event Hubs, Kinesis) pour découpler production et consommation et absorber les pics, partitionné sur une clé qui répartit uniformément et préserve l'ordre là où c'est nécessaire. Consommateurs scalables horizontalement (un par partition au maximum), traitement idempotent avec gestion des rejeux, DLQ pour les messages empoisonnés, et stockage cible adapté (colonne/objet, pas une base transactionnelle). Points d'attention : rétention, back-pressure, et coût du transfert." },

{ id:"b7-arch-02", lvl:7, dom:"SRE",
  q:"Quelle différence entre une architecture pilotée par les événements et un appel synchrone ? Quand choisis-tu quoi ?",
  must:[["couplage","decouple","asynchrone"],["reponse immediate","synchrone","coherence"]],
  explain:"Synchrone : simple, réponse immédiate, mais couplage temporel — si le service appelé est lent ou mort, l'appelant l'est aussi. Événementiel : découplage, absorption des pics, plusieurs consommateurs, mais cohérence à terme, ordre à gérer, débogage plus difficile. On prend le synchrone quand l'utilisateur attend une réponse (autorisation de paiement), l'événementiel pour la propagation (notification, mise à jour d'un référentiel, analytique)." },

{ id:"b7-k8s-01", lvl:7, dom:"Kubernetes",
  q:"Comment dimensionnes-tu un cluster Kubernetes : peu de gros nœuds ou beaucoup de petits ?",
  accept:["granularite","rayon d impact","surcout","bin packing","depend"],
  explain:"Gros nœuds : meilleur remplissage (bin packing), moins de surcoût système par nœud, meilleur pour les Pods gourmands — mais rayon d'impact élevé à la perte d'un nœud et scaling par gros incréments. Petits nœuds : granularité fine, impact réduit, mais surcoût système et limite de Pods par nœud. Compromis usuel : nœuds moyens, plusieurs node pools par profil de charge, et au moins 3 nœuds répartis sur les zones." },

{ id:"b7-k8s-02", lvl:7, dom:"Kubernetes",
  q:"Un cluster ou plusieurs clusters ? Sur quels critères tranches-tu ?",
  must:[["isolation","conformite","rayon d impact"],["cout","complexite","operation"]],
  explain:"Plusieurs clusters quand : exigence d'isolation réglementaire, séparation prod / non-prod, régions distinctes, cycles d'upgrade indépendants, ou rayon d'impact inacceptable. Un cluster mutualisé quand : coût et charge opérationnelle priment, avec namespaces + RBAC + quotas + NetworkPolicy. En banque, la séparation prod / hors-prod par cluster est quasi systématique ; le multi-tenant fin se fait par namespace à l'intérieur." },

{ id:"b7-k8s-03", lvl:7, dom:"Kubernetes",
  q:"Comment gères-tu la configuration de 15 applications sur 4 environnements sans duplication ?",
  accept:["helm values","kustomize overlay","base commune","surcharge","hierarchie"],
  explain:"Une base commune + des surcharges par environnement : Kustomize (base + overlays, patches déclaratifs) ou Helm (un chart, des <code>values-{env}.yaml</code>). La règle : ne surcharger que ce qui DIFFÈRE réellement (réplicas, ressources, endpoints, noms de secrets) — si l'overlay redéfinit tout, la base ne sert à rien. Et versionner le chart/la base comme un contrat entre plateforme et applications." },

{ id:"b7-tf-01", lvl:7, dom:"Terraform",
  q:"Comment organises-tu un dépôt de modules Terraform partagé entre 10 équipes ?",
  must:[["version","tag","semver"],["documentation","exemple","readme","test"]],
  explain:"Un dépôt (ou un registry interne) avec un module par domaine, versionnement sémantique par tags immuables, README avec entrées/sorties et exemples exécutables, tests automatisés (<code>terraform test</code>/Terratest), changelog et politique de dépréciation (N-1 supporté, préavis annoncé). Les consommateurs épinglent une version. Le pire scénario : des modules consommés sur <code>main</code> — un changement casse dix équipes en même temps." },

{ id:"b7-tf-02", lvl:7, dom:"Terraform",
  q:"Une équipe applique du Terraform depuis les postes de travail. Quels risques et quel chemin de sortie ?",
  must:[["credentials","droits personnels","tracabilite"],["pipeline","ci","apply centralise"]],
  explain:"Risques : credentials personnels à privilèges élevés sur les postes, aucune traçabilité de qui a appliqué quoi, versions d'outils divergentes, verrous mal gérés, code non revu. Chemin de sortie progressif : d'abord state distant + verrouillage, puis plan obligatoire en PR, puis apply uniquement depuis le pipeline avec une identité fédérée, et enfin retrait des droits d'écriture humains en production." },

{ id:"b7-aws-01", lvl:7, dom:"AWS",
  q:"Comment conçois-tu une architecture multi-région active/passive sur AWS ? Cite les points durs.",
  must:[["donnees","replication","base"],["dns","bascule","route 53","failover"]],
  explain:"Réplication des données (Aurora Global Database, réplication S3 cross-région, backups répliqués), infrastructure décrite en IaC et déployée dans les deux régions, bascule DNS par Route 53 avec health checks. Points durs : la réplication de base est ASYNCHRONE (donc RPO > 0), les quotas de la région de secours, les secrets et clés KMS régionaux, les dépendances qui n'existent que dans la région primaire, et surtout le TEST réel de bascule — sinon on ne sait pas si ça marche." },

{ id:"b7-aws-02", lvl:7, dom:"AWS",
  q:"Comment réduis-tu la facture de transfert de données sur AWS ? Où se cachent les coûts ?",
  accept:["inter-az","nat gateway","sortie internet","cloudfront","endpoints"],
  explain:"Les coûts cachés : trafic inter-AZ (facturé dans les deux sens — un service qui appelle systématiquement une autre AZ coûte cher), NAT Gateway facturé au Go traité, sortie internet, réplication cross-région. Leviers : topology aware routing / zone affinity, VPC endpoints pour S3 et DynamoDB (gratuits en gateway), CloudFront devant les gros volumes sortants, compression, et regroupement des composants bavards dans la même AZ quand la HA le permet." },

{ id:"b7-aws-03", lvl:7, dom:"AWS",
  q:"Comment structures-tu la journalisation et la détection de sécurité sur une organisation AWS ?",
  must:[["cloudtrail","organisation","trail"],["compte de log","centralise","immuable"]],
  explain:"CloudTrail organisationnel vers un bucket dans un compte Log Archive dédié, en écriture seule pour les producteurs, avec Object Lock et chiffrement KMS. VPC Flow Logs et logs applicatifs agrégés au même endroit. GuardDuty, Security Hub et Config activés par l'organisation avec un administrateur délégué dans un compte Security. SCP interdisant la désactivation. Export vers le SIEM. Le principe : les traces doivent survivre à la compromission du compte qu'elles observent." },

{ id:"b7-az-01", lvl:7, dom:"Azure",
  q:"Comment garantis-tu que 200 subscriptions respectent les mêmes règles réseau ?",
  must:[["policy","initiative","management group"],["deny","remediation","audit"]],
  explain:"Initiatives Azure Policy assignées au niveau management group : deny des IP publiques sur les NIC, deny des NSG sans règles obligatoires, deny hors régions autorisées, deployIfNotExists pour associer les UDR et les diagnostic settings. Complété par une landing zone qui provisionne le réseau du spoke automatiquement (pas de VNet créé à la main), et un tableau de bord de conformité suivi avec les exemptions datées." },

{ id:"b7-az-02", lvl:7, dom:"Azure",
  q:"Comment conçois-tu la reprise d'activité d'une application Azure critique ?",
  must:[["region appairee","secondaire","autre region"],["rto","rpo","test"]],
  explain:"Partir du RTO/RPO négociés. Puis : données répliquées (geo-redundant storage, failover group Azure SQL, Cosmos multi-région), infrastructure décrite en IaC redéployable dans la région secondaire, Front Door ou Traffic Manager pour la bascule, secrets et clés répliqués (Key Vault dans les deux régions), quotas demandés à l'avance. Et un exercice de bascule réel, chronométré, au moins une fois par an — c'est ce que demandera l'auditeur." },

{ id:"b7-cicd-01", lvl:7, dom:"CI/CD",
  q:"Comment fais-tu cohabiter une équipe qui livre 10 fois par jour et une qui livre une fois par mois ?",
  accept:["autonomie","contrat d api","decouplage","plateforme","standards communs"],
  explain:"On ne les aligne pas sur le même rythme : on les DÉCOUPLE. Contrats d'API versionnés et rétrocompatibles, tests de contrat automatisés, déploiements indépendants, feature flags. La plateforme fournit un socle commun (pipeline, observabilité, sécurité) mais chaque équipe garde la main sur sa cadence. Forcer un rythme commun ramène au train de release, c'est-à-dire au plus lent." },

{ id:"b7-cicd-02", lvl:7, dom:"CI/CD",
  q:"Comment mesures-tu et améliores-tu le lead time d'un pipeline de 45 minutes ?",
  accept:["decomposer","paralleliser","cache","tests","chemin critique"],
  explain:"D'abord MESURER par étape pour trouver le chemin critique — l'intuition se trompe souvent. Ensuite : paralléliser en DAG, mettre en cache dépendances et couches, découper les tests (unitaires bloquants, intégration en parallèle, e2e en aval), ne rebuild que ce qui a changé sur un monorepo, dimensionner les runners, supprimer les étapes redondantes. Objectif : feedback utile en moins de 10 minutes sur une PR." },

{ id:"b7-sec-01", lvl:7, dom:"Sécurité",
  q:"Comment mets-tu en place une PKI interne pour du mTLS entre services ?",
  accept:["ca interne","cert-manager","rotation courte","automatique","service mesh"],
  explain:"Une CA racine hors ligne, des CA intermédiaires par environnement, et une émission AUTOMATISÉE de certificats à courte durée de vie (heures/jours) : cert-manager avec un issuer Vault ou une CA d'entreprise, ou la CA intégrée d'un service mesh. Le point critique n'est pas d'émettre mais de RENOUVELER sans intervention — un certificat manuel d'un an est une panne programmée. Prévoir aussi la révocation et la rotation de la CA." },

{ id:"b7-sec-02", lvl:7, dom:"Sécurité",
  q:"Une équipe veut exposer une API à un partenaire externe. Quelles couches de sécurité mets-tu ?",
  must:[["authentification","mtls","oauth","token"],["limitation","rate limit","quota","waf"]],
  explain:"Passerelle d'API en frontal : authentification forte (mTLS et/ou OAuth client credentials avec scopes), autorisation fine par scope, rate limiting et quotas par client, WAF et validation stricte des schémas, allowlist d'IP si le partenaire est fixe, journalisation complète et corrélation, chiffrement en transit, et versionnement du contrat. Côté organisation : convention de service, procédure d'onboarding et de révocation, et environnement de bac à sable pour le partenaire." },

{ id:"b7-obs-01", lvl:7, dom:"Observabilité",
  q:"Comment conçois-tu l'observabilité d'une plateforme utilisée par 20 équipes ?",
  must:[["standard","convention","socle commun","automatique"],["autonomie","dashboard","par equipe"]],
  explain:"La plateforme fournit le socle par défaut : collecte automatique (agents, sidecars, auto-instrumentation), conventions de nommage et de labels imposées, dashboards et alertes générés pour chaque service à sa création, quotas de cardinalité et de rétention. Les équipes gardent l'autonomie sur leurs métriques métier et leurs SLO. Le principe : l'observabilité doit être un défaut, pas un projet à mener par chaque équipe." },

{ id:"b7-obs-02", lvl:7, dom:"Observabilité",
  q:"Comment justifies-tu le choix entre une solution éditeur (Datadog, Dynatrace) et une stack open source ?",
  must:[["cout","licence","volume"],["charge operationnelle","competence","a operer"]],
  explain:"Éditeur : mise en route rapide, corrélation intégrée, support, mais coût qui croît avec le volume et l'ingestion, et un verrouillage réel. Open source (Prometheus, Grafana, Loki, Tempo) : coût maîtrisable et contrôle total, mais c'est une plateforme à opérer en haute disponibilité avec la compétence associée. Point de sortie commun : instrumenter en OpenTelemetry pour pouvoir changer d'avis sans réinstrumenter 200 services." },

{ id:"b7-sre-01", lvl:7, dom:"SRE",
  q:"Comment définis-tu la frontière entre une équipe plateforme et les équipes produit ?",
  accept:["produit interne","self-service","pave route","autonomie","responsabilite"],
  explain:"La plateforme est un PRODUIT interne : elle fournit des chemins pavés (golden paths) en self-service — pipeline, socle K8s, observabilité, sécurité par défaut — avec une documentation et un support. Les équipes produit gardent la responsabilité de leur service en production. L'anti-pattern : une plateforme qui devient un guichet de tickets, ce qui recrée l'ancien mur entre dev et ops sous un nouveau nom." },

{ id:"b7-sre-02", lvl:7, dom:"SRE",
  q:"Comment traites-tu une dépendance externe (SaaS, API partenaire) qui n'a pas le niveau de service attendu ?",
  must:[["circuit breaker","timeout","degradation","cache"],["contrat","sla","escalade","alternative"]],
  explain:"Techniquement : timeouts stricts, circuit breaker, cache ou valeur de repli, dégradation gracieuse, file d'attente pour le différé, et surveillance dédiée de CETTE dépendance avec son propre SLO observé. Contractuellement : SLA, pénalités, escalade, et — exigence DORA en banque — une stratégie de sortie et si possible un fournisseur alternatif. Ton SLO ne peut pas dépasser celui de ta dépendance sur le chemin critique." },

{ id:"b7-sql-01", lvl:7, dom:"SQL",
  q:"Comment conçois-tu la stratégie de sauvegarde d'une base bancaire critique ?",
  must:[["pitr","point in time","logs de transaction"],["test de restauration","teste","exercice"],["immuable","isole","hors ligne"]],
  explain:"Sauvegardes complètes régulières + journaux de transactions continus pour un PITR fin, rétention alignée sur les obligations réglementaires (souvent plusieurs années pour certaines données), copies isolées et immuables hors du périmètre de production (anti-ransomware), chiffrement avec des clés dont la restauration est elle-même testée, et exercices de restauration chronométrés documentés. Le RPO annoncé n'a de valeur que s'il a été démontré." },

{ id:"b7-sql-02", lvl:7, dom:"SQL",
  q:"Comment gères-tu l'anonymisation des données de production pour les environnements de test ?",
  must:[["anonymiser","pseudonymiser","masquer"],["coherence","referentiel","format","utilisable"]],
  explain:"Masquage ou substitution des données personnelles avec préservation du FORMAT et de la COHÉRENCE référentielle (même client → même pseudonyme partout, IBAN valide mais fictif), sinon les tests ne valent rien. Attention à la ré-identification par croisement, aux données dans les logs et les fichiers joints. Alternative : générer des jeux synthétiques. C'est une exigence RGPD, pas une bonne pratique optionnelle." },

{ id:"b7-linux-01", lvl:7, dom:"Linux",
  q:"Comment construis-tu et maintiens-tu une image de VM durcie (golden image) ?",
  accept:["packer","pipeline","cis","reconstruire","versionner"],
  explain:"Un pipeline qui construit l'image (Packer) à partir d'une base officielle, applique le durcissement (benchmarks CIS), installe les agents obligatoires, scanne le résultat, la teste puis la publie versionnée. On la RECONSTRUIT régulièrement (mensuellement, ou dès une CVE critique) au lieu de patcher en place — infrastructure immuable. Et on force l'expiration des anciennes versions pour éviter qu'un parc entier reste sur une image de l'an dernier." },

{ id:"b7-res-01", lvl:7, dom:"Réseau",
  q:"Comment conçois-tu le plan d'adressage IP d'une entreprise qui démarre sur le cloud ?",
  must:[["pas de chevauchement","overlap","on-premise"],["reserve","croissance","allouer"]],
  explain:"On part d'une allocation centrale documentée (IPAM) : plages distinctes par cloud, par région et par environnement, sans aucun chevauchement avec l'on-premise ni avec les partenaires (les fusions-acquisitions font mal). On réserve large — le CIDR d'un VNet/VPC ne se réduit pas et un subnet AKS sous-dimensionné bloque la croissance. Et on prévoit les plages spécifiques (Pods, services, endpoints privés, gateways)." },

{ id:"b7-docker-01", lvl:7, dom:"Docker",
  q:"Comment industrialises-tu la gestion des images de base dans une grande entreprise ?",
  must:[["images approuvees","catalogue","base interne"],["reconstruction","scan","mise a jour"]],
  explain:"Un catalogue d'images de base internes, dérivées d'images officielles, durcies, scannées et signées, republiées automatiquement à chaque correctif de sécurité. Les équipes ne peuvent tirer que depuis le registry interne (blocage réseau + politique d'admission). Un mécanisme de rebuild automatique des images applicatives quand la base change, et un tableau de bord d'obsolescence pour identifier qui tourne encore sur une base ancienne." }

]);
