window.QBANK = (window.QBANK || []).concat([
/* ============ NIVEAU 9 — SÉRIE B ============ */

{ id:"b9-gov-01", lvl:9, dom:"Sécurité",
  q:"Qu'est-ce qu'un compte break-glass et comment le gères-tu ?",
  accept:["urgence","secours","scelle","surveille","hors fédération"],
  explain:"Un compte d'urgence à privilèges maximaux, utilisable quand l'authentification normale est cassée (panne de l'IdP, verrouillage MFA généralisé). Gestion : identifiants scellés et stockés physiquement, exclus de la fédération et des accès conditionnels, MFA matérielle dédiée, alerte immédiate à toute utilisation, test périodique de validité, et procédure de rotation après usage. Sans ce compte, une panne d'identité devient une panne totale sans possibilité d'intervention." },

{ id:"b9-gov-02", lvl:9, dom:"Sécurité",
  q:"Comment démontres-tu à un auditeur que seules des personnes habilitées ont accès à la production ?",
  must:[["revue d acces","liste","inventaire"],["journal","preuve","trace","approbation"]],
  explain:"Inventaire des accès généré depuis la source de vérité (groupes Entra/IAM Identity Center), revues d'accès périodiques signées par les responsables, preuve que l'attribution passe par une demande approuvée et tracée, journal des élévations juste-à-temps, et enregistrement des sessions. Le point qui convainc : montrer que l'accès EXPIRE automatiquement, donc qu'il n'y a pas de droits résiduels accumulés." },

{ id:"b9-gov-03", lvl:9, dom:"Sécurité",
  q:"Qu'est-ce qu'un registre des traitements et un registre des dépendances tierces ? Pourquoi un DevOps est concerné ?",
  accept:["rgpd","dora","inventaire","fournisseur","donnees"],
  explain:"Le registre des traitements (RGPD) documente quelles données personnelles sont traitées, où, pourquoi et combien de temps. Le registre des dépendances tierces (DORA) recense les prestataires critiques, dont les fournisseurs cloud et SaaS. Le DevOps est concerné parce que c'est lui qui SAIT où vont réellement les données (logs, sauvegardes, régions, sous-traitants du SaaS) — et que ces registres doivent refléter la réalité technique, pas une intention." },

{ id:"b9-dr-01", lvl:9, dom:"SRE",
  q:"Comment testes-tu un plan de reprise sans impacter la production ?",
  accept:["exercice","environnement isole","game day","bascule partielle","annonce"],
  explain:"Par paliers : (1) test de restauration technique dans un environnement isolé, chronométré ; (2) exercice sur table (game day) avec les équipes, sur un scénario écrit ; (3) bascule réelle d'un composant non critique ; (4) bascule complète planifiée en fenêtre annoncée, avec critères de succès et procédure de retour. Chaque palier produit des écarts documentés. Un plan de reprise jamais exercé est une hypothèse, pas un plan." },

{ id:"b9-dr-02", lvl:9, dom:"SRE",
  q:"Ta région primaire est perdue et tu bascules. Quelles sont les trois choses qu'on oublie systématiquement ?",
  must:[["dns","ttl","bascule"],["secret","cle","certificat","quota"]],
  explain:"1) Le DNS : TTL trop long, ou l'automatisation de bascule qui dépend d'un composant de la région perdue. 2) Les secrets, clés KMS et certificats : régionaux, non répliqués — l'application démarre mais ne peut rien déchiffrer. 3) Les quotas et la capacité réellement disponible dans la région de secours. Et souvent une quatrième : le pipeline de déploiement lui-même hébergé dans la région tombée." },

{ id:"b9-dr-03", lvl:9, dom:"SRE",
  q:"Comment protèges-tu une plateforme contre un ransomware ? Cite la chaîne complète.",
  must:[["sauvegarde immuable","hors ligne","isole"],["segmentation","moindre privilege","laterale"]],
  explain:"Prévention : durcissement, patching, MFA, moindre privilège, segmentation réseau pour limiter le mouvement latéral, contrôle applicatif. Détection : EDR, détection de comportements anormaux, alertes sur les suppressions massives. Résilience : sauvegardes immuables dans un compte/tenant séparé, hors de portée des identités de production, avec MFA delete et rétention verrouillée. Reprise : procédure de restauration testée, et capacité à reconstruire l'infrastructure depuis l'IaC plutôt que de restaurer des machines potentiellement infectées." },

{ id:"b9-cost-01", lvl:9, dom:"SRE",
  q:"Comment mets-tu en place une refacturation (chargeback) crédible des coûts cloud ?",
  must:[["tag","etiquetage","obligatoire"],["compte","subscription","separation"]],
  explain:"Deux leviers combinés : une séparation structurelle (un compte/subscription par équipe ou application — la répartition est alors native et incontestable) et un tagging obligatoire imposé par policy pour ce qui reste mutualisé. Ensuite : règles d'allocation des coûts partagés (cluster mutualisé, réseau, outillage) définies et acceptées à l'avance, rapports mensuels par équipe, et un propriétaire budgétaire nommé. Sans propriétaire, aucun rapport ne change quoi que ce soit." },

{ id:"b9-cost-02", lvl:9, dom:"SRE",
  q:"Le coût d'un cluster Kubernetes mutualisé explose. Comment identifies-tu qui consomme ?",
  accept:["kubecost","opencost","par namespace","requests","allocation"],
  explain:"On alloue le coût des nœuds aux workloads au prorata des <b>requests</b> (OpenCost/Kubecost), par namespace, label d'équipe ou déploiement. On repère alors les classiques : requests surdimensionnées « au cas où » qui réservent sans consommer, environnements de test jamais éteints, jobs oubliés, volumes orphelins. La correction passe par des ResourceQuota, du rightsizing basé sur l'usage réel (VPA en mode recommandation) et une visibilité rendue aux équipes." },

{ id:"b9-k8s-01", lvl:9, dom:"Kubernetes",
  q:"Comment gères-tu le cycle de vie des CRD et des opérateurs tiers dans un cluster de production ?",
  must:[["version","compatibilite","upgrade"],["sauvegarde","donnees","suppression"]],
  explain:"Traiter un opérateur comme une dépendance critique : version épinglée, compatibilité vérifiée avec la version de K8s cible avant chaque upgrade, sauvegarde des ressources personnalisées (ce sont des données), et attention à la suppression — supprimer une CRD supprime TOUTES ses instances, donc potentiellement les ressources cloud qu'elles pilotaient. Ajouter une revue de sécurité : un opérateur demande souvent des droits cluster très larges." },

{ id:"b9-k8s-02", lvl:9, dom:"Kubernetes",
  q:"Comment justifies-tu auprès d'un RSSI que Kubernetes est déployable en environnement bancaire ?",
  must:[["rbac","admission","policy","controle"],["reseau","networkpolicy","isolation","chiffrement"]],
  explain:"En traduisant chaque exigence en contrôle technique : RBAC et identités de charge de travail sans secret, admission policies qui rendent les règles non contournables, Pod Security restricted, NetworkPolicy default-deny et chiffrement en transit, secrets externalisés dans un coffre, images signées depuis un registry interne, journalisation d'audit exportée vers le SIEM, détection au runtime, et clusters séparés prod/hors-prod. Le message : Kubernetes est un plan de contrôle AUDITABLE, plus contrôlable qu'un parc de VM administrées à la main." },

{ id:"b9-arch-01", lvl:9, dom:"SRE",
  q:"Comment conduis-tu la migration d'un monolithe critique sans big bang ?",
  accept:["strangler","progressif","facade","routage","coexistence"],
  explain:"Pattern strangler fig : on place une façade (passerelle) devant le monolithe, on extrait un domaine à la fois vers un nouveau service, et on route progressivement le trafic de ce domaine vers le nouveau. Les deux coexistent le temps nécessaire, avec double écriture ou synchronisation des données puis bascule. Chaque étape est réversible. On commence par un domaine périphérique à faible risque pour valider la mécanique, jamais par le cœur métier." },

{ id:"b9-arch-02", lvl:9, dom:"SRE",
  q:"Comment gères-tu la coexistence de données entre l'ancien et le nouveau système pendant une migration ?",
  must:[["double ecriture","synchronisation","cdc","replication"],["source de verite","reconciliation","controle"]],
  explain:"On désigne une SOURCE DE VÉRITÉ unique à chaque instant, et on synchronise l'autre (double écriture applicative, ou capture de changements CDC). On ajoute une réconciliation automatique qui compare les deux et alerte sur les écarts — c'est ce qui manque dans la plupart des migrations ratées. Puis on bascule la source de vérité par domaine, avec une fenêtre de retour arrière définie, et on ne coupe l'ancien qu'après une période d'observation." },

{ id:"b9-cicd-01", lvl:9, dom:"CI/CD",
  q:"Comment concilies-tu déploiement continu et périodes de gel réglementaires ?",
  accept:["feature flag","decoupler","hotfix encadre","calendrier","preparer"],
  explain:"On découple déploiement et activation : le code part en production en continu, désactivé par feature flag, et l'activation métier respecte le calendrier. On maintient un chemin d'urgence documenté (correctif de sécurité ou incident) avec approbation renforcée. On utilise la période de gel pour ce qui ne touche pas la production (dette, tests, préparation). Et on l'annonce dans le pipeline pour éviter les surprises." },

{ id:"b9-cicd-02", lvl:9, dom:"CI/CD",
  q:"Comment garantis-tu la réversibilité d'un déploiement au sens réglementaire ?",
  must:[["rollback","retour arriere","procedure"],["teste","demontre","exercice"]],
  explain:"Une procédure de retour arrière DOCUMENTÉE, automatisée et TESTÉE régulièrement (pas seulement décrite) : artefact précédent conservé et immédiatement redéployable, migrations rétrocompatibles, données restaurables au point de bascule, et un temps de retour arrière mesuré. L'auditeur ne demandera pas si vous pouvez revenir en arrière : il demandera quand vous l'avez démontré pour la dernière fois, et avec quel chronomètre." },

{ id:"b9-sec-01", lvl:9, dom:"Sécurité",
  q:"Comment organises-tu la gestion des vulnérabilités à l'échelle d'un parc de 300 applications ?",
  must:[["inventaire","sbom","cartographie"],["priorisation","criticite","exposition","sla"]],
  explain:"1) Inventaire fiable : SBOM par artefact, cartographie composant → application → criticité métier → exposition. 2) Priorisation par risque réel (exploitabilité KEV/EPSS, exposition, présence dans le chemin d'exécution) et non par volume de CVE. 3) Délais de remédiation contractualisés par niveau de criticité. 4) Correction à la source (image de base, bibliothèque partagée) plutôt que 300 correctifs unitaires. 5) Tableau de bord suivi par la direction, avec les exceptions datées." },

{ id:"b9-sec-02", lvl:9, dom:"Sécurité",
  q:"Une CVE critique sort sur une bibliothèque très utilisée. Décris ta réponse dans les 24 heures.",
  must:[["identifier","sbom","ou est-elle","inventaire"],["prioriser","exposition","patcher","mitiger"]],
  explain:"Heure 0-2 : déterminer si on est concerné, où, et quelles applications sont exposées à internet — c'est ce que permet un SBOM à jour (sinon on passe la journée à chercher). Heure 2-6 : mitigation temporaire si un correctif n'existe pas (règle WAF, désactivation de fonctionnalité, restriction réseau). Heure 6-24 : correction de l'image de base ou de la dépendance partagée, rebuild et redéploiement par ordre d'exposition, vérification. Puis communication interne et post-mortem sur le délai de détection." },

{ id:"b9-obs-01", lvl:9, dom:"Observabilité",
  q:"Comment fixes-tu la rétention des logs en environnement bancaire ?",
  must:[["obligation","reglementaire","duree legale"],["cout","chaud","froid","archive"]],
  explain:"On part des obligations : certaines traces (audit, transactions, accès) ont une durée légale de conservation qui peut aller à plusieurs années, tandis que le RGPD impose au contraire de ne PAS conserver indéfiniment des données personnelles. On distingue donc les catégories, puis on applique une rétention par palier : chaud et requêtable quelques jours à semaines, froid moins cher pour quelques mois, archive immuable pour le légal. Et on documente la politique — c'est elle que l'auditeur lit." },

{ id:"b9-obs-02", lvl:9, dom:"Observabilité",
  q:"Comment définis-tu des SLO pour une plateforme interne (le cluster, le pipeline) et pas pour une application ?",
  accept:["utilisateur interne","disponibilite de l api","temps de build","developpeur"],
  explain:"Les utilisateurs sont les équipes internes, donc les SLI portent sur ce qu'elles subissent : disponibilité de l'API du cluster, temps entre un merge et la disponibilité en recette, taux de succès des pipelines hors erreurs applicatives, délai de provisionnement d'un environnement. C'est ce qui transforme une équipe plateforme en fournisseur de service mesurable — et ce qui permet d'arbitrer entre nouvelles fonctionnalités et fiabilité du socle." },

{ id:"b9-tf-01", lvl:9, dom:"Terraform",
  q:"Comment gères-tu les secrets qui finissent dans le state, à l'échelle d'une organisation ?",
  must:[["chiffrement","backend","kms","acces restreint"],["ne pas faire transiter","generer dans le coffre","reference"]],
  explain:"Deux axes. Protection : backend chiffré avec une clé gérée, accès limité aux seules identités de pipeline, journalisation des lectures, versioning. Évitement : ne pas faire transiter le secret par Terraform — le générer directement dans le coffre (ou via <code>random_password</code> écrit dans le coffre et jamais ressorti en output), et ne référencer que son identifiant. Politique organisationnelle : interdire les outputs sensibles et scanner les states." },

{ id:"b9-tf-02", lvl:9, dom:"Terraform",
  q:"Comment appliques-tu la séparation des tâches sur un pipeline Terraform ?",
  must:[["identite plan","lecture","identite apply","ecriture"],["approbation","revue","environnement protege"]],
  explain:"Deux identités distinctes : le job de plan n'a que des droits de LECTURE (il tourne sur du code non encore revu, y compris des forks), le job d'apply a les droits d'écriture et ne se déclenche qu'après merge et approbation d'un environnement protégé. Le plan appliqué est celui qui a été revu (fichier sauvegardé), personne ne peut approuver son propre changement, et tout est journalisé de façon immuable." },

{ id:"b9-aws-01", lvl:9, dom:"AWS",
  q:"Comment conçois-tu une stratégie de sortie (exit strategy) d'AWS, au sens DORA ?",
  must:[["portabilite","standard","conteneur","iac"],["donnees","export","reversibilite"]],
  explain:"Documenter les dépendances aux services propriétaires et leur criticité, privilégier des standards portables sur le chemin critique (conteneurs, PostgreSQL, S3-compatible, OpenTelemetry), garder l'infrastructure décrite en IaC, garantir l'exportabilité des données dans un format ouvert avec un délai mesuré, et estimer le coût et le délai réels d'une migration. Le régulateur ne demande pas d'être multi-cloud : il demande de savoir COMMENT on sortirait, en combien de temps et à quel prix." },

{ id:"b9-az-01", lvl:9, dom:"Azure",
  q:"Comment structures-tu les management groups pour une banque avec filiales et contraintes pays ?",
  must:[["hierarchie","par entite","par pays","par environnement"],["policy","heritage","exemption"]],
  explain:"Racine avec les policies non négociables du groupe (régions autorisées, chiffrement, journalisation), puis un niveau par entité/pays pour les contraintes locales de souveraineté, puis par environnement (prod / hors-prod) pour la rigueur différenciée. Les policies s'héritent et se cumulent ; les dérogations locales passent par des exemptions datées à un niveau bas. Éviter une hiérarchie trop profonde : elle devient impossible à raisonner et à déboguer." },

{ id:"b9-sql-01", lvl:9, dom:"SQL",
  q:"Comment gères-tu la conservation et la purge de données personnelles dans une base et ses sauvegardes ?",
  must:[["duree de conservation","purge","politique"],["sauvegarde","backup","rotation","anonymisation"]],
  explain:"Politique de rétention par catégorie de données, purge ou anonymisation automatisée en base (jobs planifiés, partitionnement par date qui permet de dropper une partition entière). Pour les sauvegardes : on ne réécrit pas une sauvegarde — on s'appuie sur leur rotation naturelle, avec une durée de rétention alignée sur la politique, et on documente que la donnée disparaît au plus tard à l'expiration du dernier jeu. Le droit à l'effacement doit être traité de bout en bout, logs et réplicas compris." },

{ id:"b9-sre-01", lvl:9, dom:"SRE",
  q:"Comment convaincs-tu une direction d'investir dans la fiabilité plutôt que dans de nouvelles fonctionnalités ?",
  must:[["chiffrer","cout","incident","euro"],["velocite","ralentit","dette","donnee"]],
  explain:"On parle en euros et en vélocité, pas en technique : coût des incidents de l'année (temps passé × coût, pertes, pénalités), part de la capacité de l'équipe consommée par le toil et les incidents plutôt que par les features, et corrélation entre instabilité et ralentissement des livraisons (métriques DORA). Puis on propose un investissement borné avec un résultat mesurable. L'error budget rend cet arbitrage automatique et dépassionné." },

{ id:"b9-sre-02", lvl:9, dom:"SRE",
  q:"Comment mesures-tu si une équipe est en surcharge opérationnelle avant qu'elle ne craque ?",
  must:[["astreinte","reveil","interruption","alerte"],["temps passe","toil","ratio"]],
  explain:"Indicateurs suivis dans le temps : nombre d'alertes hors heures et de réveils par tour d'astreinte, ratio temps passé en interruptions/toil vs travail planifié, délai moyen de traitement des demandes entrantes, taux d'absentéisme et rotation des personnes. Seuils définis à l'avance déclenchant une action (renfort, gel des nouveautés, chantier d'automatisation). Attendre le burn-out pour réagir, c'est déjà avoir perdu la compétence." }

]);
