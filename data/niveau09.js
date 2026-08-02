window.QBANK = (window.QBANK || []).concat([
/* ================= NIVEAU 9 — RÉSILIENCE, COÛTS, GOUVERNANCE ================= */

{ id:"n9-dr-01", lvl:9, dom:"SRE",
  q:"Cite les quatre stratégies de disaster recovery cloud, de la moins chère à la plus chère, avec leur RTO typique.",
  must:[["backup","sauvegarde"],["pilot light","veilleuse"],["warm standby","tiede"],["actif actif","multi site","hot"]],
  explain:"1) Backup & restore : RTO en heures, coût minimal. 2) Pilot light : le cœur (base répliquée) tourne, le reste est éteint — RTO en dizaines de minutes. 3) Warm standby : environnement complet à capacité réduite, RTO en minutes. 4) Multi-site actif/actif : RTO quasi nul, coût maximal et complexité de cohérence des données. Le choix découle du RTO/RPO négocié avec le métier, pas d'une préférence technique." },

{ id:"n9-dr-02", lvl:9, dom:"SRE",
  q:"Ta sauvegarde existe mais n'a jamais été restaurée. Quel est le problème, et quelle est la règle de référence ?",
  accept:["3-2-1","non testee","restauration","exercice","pas une sauvegarde"],
  explain:"Une sauvegarde jamais restaurée n'est pas une sauvegarde, c'est une hypothèse. Règle 3-2-1 : 3 copies, 2 supports différents, 1 hors site — complétée aujourd'hui par 1 copie immuable/hors ligne contre les ransomwares. Il faut un exercice de restauration PLANIFIÉ et chronométré (au moins annuel en banque), qui valide aussi la restauration des CLÉS de chiffrement et des dépendances (DNS, comptes de service)." },

{ id:"n9-dr-03", lvl:9, dom:"SRE",
  q:"Une région cloud entière tombe. Qu'est-ce qui casse en premier dans une architecture mal préparée ?",
  accept:["dns","bascule manuelle","etat","base primaire","dependance regionale"],
  explain:"Typiquement : la base primaire n'a pas de réplique promue automatiquement, le DNS pointe encore vers la région morte avec un TTL trop long, les secrets/clés KMS sont régionaux et non répliqués, le pipeline de déploiement lui-même vit dans la région tombée, et les quotas de la région de secours n'ont jamais été demandés. La capacité de secours indisponible au moment du besoin est l'échec le plus fréquent." },

{ id:"n9-gov-01", lvl:9, dom:"Sécurité",
  q:"Qu'est-ce que la séparation des tâches (SoD) et comment la mets-tu en œuvre dans un pipeline automatisé ?",
  accept:["celui qui developpe ne deploie pas","approbation","tracabilite","quatre yeux","role distinct"],
  explain:"Personne ne doit pouvoir seul écrire ET mettre en production un changement. En pipeline : branches protégées avec revue obligatoire par un tiers, environnements protégés avec approbation distincte pour la prod, identités de pipeline séparées (build ≠ deploy), interdiction du bypass des règles, journalisation immuable de qui a approuvé quoi. Le contrôle passe du geste manuel à la GOUVERNANCE DU PIPELINE — c'est cet argument qu'un auditeur bancaire attend." },

{ id:"n9-gov-02", lvl:9, dom:"Sécurité",
  q:"Un auditeur te demande de prouver ce qui tourne en production et qui l'a autorisé. Que lui montres-tu ?",
  must:[["git","historique","commit"],["pipeline","journal","log de deploiement"]],
  explain:"La chaîne complète : ticket/demande → PR avec revue et approbation nommée → commit signé → build tracé avec son artefact versionné et son SBOM → journal du pipeline de déploiement horodaté → état réel de la plateforme via l'IaC et l'inventaire (AWS Config, Azure Resource Graph). En GitOps, le dépôt Git EST la preuve de l'état désiré, et le contrôleur prouve la réconciliation." },

{ id:"n9-gov-03", lvl:9, dom:"Sécurité",
  q:"Comment gères-tu une exception à une politique de sécurité qui bloque une équipe en urgence ?",
  accept:["exemption tracee","duree limitee","approbation","risque accepte","ticket"],
  explain:"Jamais en désactivant la policy : on crée une EXEMPTION nommée, limitée à un périmètre, avec une date d'expiration, un propriétaire, une justification et une approbation du risque. On l'inscrit dans un registre revu périodiquement. Une exception sans date de fin devient une règle permanente que personne n'assume — c'est exactement ce que cherchent les auditeurs." },

{ id:"n9-cost-01", lvl:9, dom:"SRE",
  q:"Qu'est-ce que le FinOps et quelles sont ses trois phases ?",
  must:[["inform","visibilite","mesurer"],["optimize","optimiser"],["operate","gouverner","operer"]],
  explain:"Inform (visibilité : tagging, allocation des coûts par équipe, showback/chargeback), Optimize (rightsizing, engagements, architecture), Operate (gouvernance continue : budgets, alertes d'anomalie, coût intégré aux critères de conception). Le point clé : le coût devient une métrique d'ingénierie suivie comme la latence, avec un propriétaire — pas un rapport financier trimestriel." },

{ id:"n9-cost-02", lvl:9, dom:"SRE",
  q:"Une équipe veut du multi-cloud « pour ne pas être verrouillée ». Que réponds-tu ?",
  accept:["cout","denominateur commun","complexite","rarement justifie","competences"],
  explain:"Question honnête : le multi-cloud actif/actif coûte cher (double compétence, double outillage, réseau inter-cloud, dénominateur commun de services) et réduit souvent la fiabilité au lieu de l'augmenter. Alternatives : portabilité RAISONNABLE (conteneurs, IaC, standards ouverts, abstraction des points de sortie critiques) et négociation contractuelle. Le multi-cloud se justifie par une exigence réglementaire, une acquisition, ou un service unique — pas par la peur du verrouillage." },

{ id:"n9-k8s-01", lvl:9, dom:"Kubernetes",
  q:"Comment planifies-tu la mise à jour d'un cluster Kubernetes en production bancaire ?",
  must:[["notes de version","breaking change","api deprecie"],["recette","preprod","tester"],["node pool","progressif","par lot"]],
  explain:"1) Lire les notes de version et l'obsolescence des API ; scanner les manifestes (<code>pluto</code>, <code>kubent</code>). 2) Vérifier la compatibilité des addons (CNI, CSI, ingress, opérateurs, agents de sécurité). 3) Rejouer sur un cluster de recette identique. 4) Plan de contrôle d'abord, puis les node pools par lots avec surge, PDB en place et fenêtre annoncée. 5) Un saut de version mineure à la fois. 6) Plan de repli documenté et validation métier après chaque lot." },

{ id:"n9-k8s-02", lvl:9, dom:"Kubernetes",
  q:"Comment garantis-tu que seules des images approuvées peuvent tourner sur le cluster ?",
  must:[["admission","kyverno","gatekeeper","policy"],["signature","registry autorise","digest"]],
  explain:"Politique d'admission (Kyverno / OPA Gatekeeper) qui rejette toute image hors des registries approuvés, exige un digest plutôt qu'un tag mutable, et vérifie une signature Cosign contre une clé/identité de confiance. En amont : registry privé avec images de base durcies, scan bloquant en CI, et interdiction du pull depuis internet au niveau réseau. Le contrôle d'admission est la dernière barrière — il ne remplace pas la CI, il la rend non contournable." },

{ id:"n9-sec-01", lvl:9, dom:"Sécurité",
  q:"Comment conçois-tu la gestion des accès humains à la production ?",
  must:[["juste a temps","jit","temporaire","elevation"],["journal","audit","tracabilite"]],
  explain:"Accès juste-à-temps et temporaire (PIM Entra ID, AWS IAM Identity Center avec sessions courtes), avec justification, approbation et expiration automatique. Aucun compte permanent privilégié, MFA résistante au phishing, accès via bastion/Session Manager plutôt que SSH direct, enregistrement des sessions, et revues d'accès périodiques. L'objectif final : que l'accès humain direct devienne l'exception documentée, l'automatisation étant le chemin normal." },

{ id:"n9-sec-02", lvl:9, dom:"Sécurité",
  q:"Qu'est-ce que DORA (règlement européen) et pourquoi ça concerne un DevOps en banque ?",
  accept:["resilience operationnelle numerique","tiers","incident","test","2025"],
  explain:"Le Digital Operational Resilience Act, applicable depuis janvier 2025, impose au secteur financier européen : gestion du risque IT, notification des incidents majeurs dans des délais courts, tests de résilience (jusqu'aux tests de pénétration guidés par la menace), et surtout la surveillance des prestataires TIERS CRITIQUES — donc les fournisseurs cloud. Concrètement : registre des dépendances, stratégies de sortie, scénarios de bascule testés et documentés." },

{ id:"n9-data-01", lvl:9, dom:"Sécurité",
  q:"Quelles contraintes le RGPD impose-t-il à une architecture cloud, concrètement ?",
  must:[["localisation","residence","transfert"],["droit","effacement","minimisation","chiffrement"]],
  explain:"Localisation et encadrement des transferts hors UE, minimisation des données collectées, base légale et durée de conservation définies (donc des politiques de rétention réellement appliquées, y compris dans les logs et les sauvegardes), capacité à effacer et à exporter les données d'une personne, chiffrement et pseudonymisation, journalisation des accès, et notification d'une violation sous 72 h. Point sous-estimé : un ID utilisateur dans les logs et les backups est une donnée personnelle." },

{ id:"n9-arch-01", lvl:9, dom:"SRE",
  q:"Comment migres-tu une application legacy on-premise vers le cloud ? Cite la démarche et les stratégies possibles.",
  must:[["rehost","lift and shift"],["replatform","refactor","rearchitect"]],
  explain:"Inventaire et cartographie des dépendances d'abord, puis les 6R : Retire, Retain, Rehost (lift & shift, rapide mais aucun gain), Replatform (ajustements ciblés : base managée, conteneurisation), Repurchase (SaaS), Refactor (réécriture cloud-native, coûteux). Démarche : commencer par une application peu critique pour apprendre, pattern strangler pour découper progressivement, double run avec réversibilité, et migration des données planifiée avec sa fenêtre de bascule." },

{ id:"n9-arch-02", lvl:9, dom:"SRE",
  q:"Comment mesures-tu qu'une transformation DevOps réussit dans une organisation ?",
  must:[["dora","metrique","lead time","frequence"],["incident","qualite","satisfaction"]],
  explain:"Métriques DORA en tendance (fréquence, lead time, taux d'échec, MTTR), plus des indicateurs humains : temps passé en toil, charge d'astreinte et réveils nocturnes, satisfaction des développeurs, délai entre l'idée et le retour utilisateur. On évite les vanity metrics (nombre de pipelines, % de couverture). Une transformation qui accélère la livraison en épuisant les équipes n'est pas une réussite : elle est en dette." },

{ id:"n9-tf-01", lvl:9, dom:"Terraform",
  q:"Comment gères-tu la montée de version d'un provider majeur (ex : AzureRM v3 → v4) sur 40 states ?",
  must:[["notes de version","breaking change","changelog"],["progressif","par lot","non prod d abord"]],
  explain:"Lire le guide de migration et les breaking changes, épingler la version actuelle partout d'abord, faire un plan à blanc en non-prod pour mesurer l'impact réel (attention aux remplacements), corriger le code et les modules partagés, dérouler par lots en commençant par les périmètres à faible risque, avec un plan systématiquement relu par un humain. On ne monte JAMAIS un provider majeur sans plan préalable — le risque est la destruction/recréation silencieuse." },

{ id:"n9-tf-02", lvl:9, dom:"Terraform",
  q:"Comment fais-tu du Policy as Code sur l'infrastructure, et à quels moments ?",
  accept:["opa","conftest","sentinel","checkov","plan json","admission"],
  explain:"À trois moments complémentaires : 1) en CI sur le PLAN JSON (OPA/Conftest, Sentinel, Checkov) pour bloquer avant création — le moins cher. 2) À l'admission côté plateforme (Azure Policy deny, SCP AWS, Kyverno sur K8s) pour rendre le contrôle non contournable même hors pipeline. 3) En continu sur l'existant (Config, Defender for Cloud) pour détecter la dérive. La CI seule ne suffit pas : quelqu'un finira par agir hors pipeline." },

{ id:"n9-cicd-01", lvl:9, dom:"CI/CD",
  q:"Comment déploies-tu en production un vendredi à 16 h sans que ce soit une mauvaise idée ?",
  accept:["petits lots","rollback","feature flag","observabilite","progressif"],
  explain:"Ce n'est pas la date qui pose problème, c'est la confiance dans le processus : petits lots fréquents, déploiement progressif (canary) avec analyse automatique des métriques, feature flags pour découpler la mise en production de l'activation, rollback testé et rapide, observabilité qui détecte en minutes. Si on interdit le vendredi, c'est un aveu que le rollback n'est pas fiable — et c'est ÇA qu'il faut corriger. Nuance bancaire : les périodes de gel (clôture, arrêtés comptables) sont, elles, une contrainte métier légitime." },

{ id:"n9-cicd-02", lvl:9, dom:"CI/CD",
  q:"Quelle stratégie de branches et de versionnement recommandes-tu pour une plateforme partagée par 15 équipes ?",
  accept:["trunk based","semver","tags","branches courtes","compatibilite"],
  explain:"Trunk-based avec des branches de courte durée et intégration continue, versionnement sémantique des modules/templates partagés avec des tags immuables, dépréciation annoncée avant suppression (N-1 supporté), changelog et notes de migration. Les consommateurs épinglent une version et montent quand ils veulent, dans une fenêtre imposée. Ce qui casse une plateforme partagée, c'est le changement non versionné sur <code>main</code>." },

{ id:"n9-obs-01", lvl:9, dom:"Observabilité",
  q:"Comment construis-tu un SLO à partir de zéro pour une API critique ?",
  must:[["sli","indicateur","mesure"],["fenetre","periode","28","30 jours"],["budget d erreur","error budget"]],
  explain:"1) Identifier le parcours utilisateur critique. 2) Définir le SLI mesurable côté utilisateur (part de requêtes réussies sous 300 ms, mesurée au load balancer et non dans l'app). 3) Choisir une cible réaliste à partir de l'historique, pas un chiffre rond arbitraire. 4) Fenêtre glissante de 28-30 jours. 5) Dériver le budget d'erreur et les alertes de burn rate multi-fenêtres. 6) Faire VALIDER la cible par le métier — un SLO que le métier n'assume pas ne sert à rien." },

{ id:"n9-obs-02", lvl:9, dom:"Observabilité",
  q:"Pourquoi 99,99 % de disponibilité peut être un objectif déraisonnable ? Chiffre-le.",
  accept:["52 minutes","4 minutes par mois","cout","dependances","astreinte"],
  explain:"99,99 % = ~52 min d'indisponibilité par AN, soit ~4 min par mois : moins que le temps de détection humaine. Ça impose de l'automatisation totale de la bascule, du multi-région, une astreinte 24/7 et des dépendances au moins aussi fiables — or les SLA des services managés sous-jacents sont souvent à 99,9 %. On ne peut pas être plus fiable que la somme de ses dépendances : c'est l'argument à sortir quand un métier demande « du 100 % »." },

{ id:"n9-aws-01", lvl:9, dom:"AWS",
  q:"Comment centralises-tu la sécurité et les logs sur une organisation de 100 comptes AWS ?",
  must:[["compte dedie","log archive","centralise"],["organization","delegated","agrege"]],
  explain:"Comptes dédiés Log Archive et Security. CloudTrail organisationnel avec un trail unique vers un bucket centralisé immuable (Object Lock), VPC Flow Logs et logs de service agrégés, GuardDuty / Security Hub / Config activés par l'organisation avec un administrateur délégué, SCP interdisant de désactiver la journalisation, et alertes remontant à un SIEM unique. Point clé : le compte de logs doit être inaccessible en écriture aux comptes producteurs." },

{ id:"n9-az-01", lvl:9, dom:"Azure",
  q:"Comment appliques-tu une exigence de résidence des données « France uniquement » sur tout un tenant Azure ?",
  must:[["azure policy","allowed locations","deny"],["management group","niveau superieur"]],
  explain:"Initiative Azure Policy « Allowed locations » (et sa variante pour les resource groups) en mode Deny, assignée au niveau MANAGEMENT GROUP pour couvrir toutes les subscriptions présentes et futures, avec exemptions nominatives et datées pour les services globaux qui n'ont pas de notion de région. On complète par un contrôle de conformité continu, l'attention aux réplications géo (GRS vers la région appairée) et aux logs/sauvegardes qui peuvent sortir du périmètre sans qu'on y pense." }

]);
