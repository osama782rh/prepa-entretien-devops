window.QBANK = (window.QBANK || []).concat([
/* ============ NIVEAU 3 — SÉRIE B ============ */

{ id:"b3-linux-01", lvl:3, dom:"Linux",
  q:"Comment mesures-tu ce qu'un processus fait réellement quand il semble bloqué ?",
  accept:["strace","proc","wchan","gdb","appels systeme"],
  explain:"<code>strace -p &lt;pid&gt;</code> montre les appels système en cours (souvent bloqué sur un <code>read</code>, un <code>futex</code> ou un <code>connect</code>). <code>cat /proc/&lt;pid&gt;/stack</code> ou <code>/proc/&lt;pid&gt;/wchan</code> indique où il attend dans le noyau. <code>strace -c</code> donne une synthèse. Attention : strace ralentit fortement le process, à utiliser avec prudence en prod." },

{ id:"b3-linux-02", lvl:3, dom:"Linux",
  q:"Qu'est-ce que le page cache et pourquoi <code>free -m</code> affiche-t-il souvent « peu de mémoire libre » ?",
  accept:["cache disque","recuperable","available","normal","buff/cache"],
  explain:"Linux utilise toute la RAM inutilisée comme cache de fichiers — c'est une optimisation, pas une fuite. La colonne à regarder est <b>available</b>, pas <b>free</b> : elle indique ce qui est réellement mobilisable, cache récupérable inclus. Une alerte basée sur <code>free</code> génère des faux positifs permanents." },

{ id:"b3-linux-03", lvl:3, dom:"Linux",
  q:"Comment limites-tu les ressources d'un service systemd ?",
  accept:["memorymax","cpuquota","limitnofile","cgroup","tasksmax"],
  explain:"Directives dans l'unité : <code>MemoryMax</code>, <code>CPUQuota</code>, <code>TasksMax</code>, <code>LimitNOFILE</code>, <code>IOWeight</code>. systemd les applique via les cgroups — exactement le même mécanisme que les limits Kubernetes. <code>systemd-cgtop</code> montre la consommation par unité." },

{ id:"b3-linux-04", lvl:3, dom:"Linux",
  q:"Comment cherches-tu efficacement dans 20 Go de logs sans saturer la machine ?",
  accept:["zgrep","journalctl --since","filtrer par date","rg","limiter la fenetre"],
  explain:"Réduire d'abord la fenêtre temporelle (<code>journalctl --since/--until</code>, fichiers du bon jour), utiliser <code>zgrep</code>/<code>zcat</code> pour les archives compressées, <code>LC_ALL=C grep -F</code> pour une recherche littérale rapide, <code>ripgrep</code> si disponible, et toujours borner la sortie (<code>| head</code>). Idéalement : requêter le backend de logs plutôt que la machine." },

{ id:"b3-git-01", lvl:3, dom:"Git",
  q:"Comment retrouves-tu le commit qui a introduit un bug dans un historique de 500 commits ?",
  accept:["git bisect","dichotomie","binaire","log2"],
  explain:"<code>git bisect start</code>, <code>git bisect bad</code> (version cassée), <code>git bisect good &lt;sha&gt;</code> (version saine), puis Git propose des commits intermédiaires par dichotomie : ~9 tests pour 500 commits. Avec <code>git bisect run ./test.sh</code>, c'est entièrement automatique." },

{ id:"b3-git-02", lvl:3, dom:"Git",
  q:"Qu'est-ce qu'un hook Git et quelle est sa limite en tant que contrôle de sécurité ?",
  accept:["script declenche","local","contournable","--no-verify","cote client"],
  explain:"Un script exécuté à un moment du cycle (pre-commit, pre-push, post-receive). Limite : les hooks CLIENT sont locaux, non versionnés par défaut et contournables avec <code>--no-verify</code>. Un contrôle de sécurité doit donc aussi exister côté serveur (hook serveur, règle de protection de branche, ou job de CI bloquant)." },

{ id:"b3-git-03", lvl:3, dom:"Git",
  q:"À quoi sert <code>git worktree</code> ?",
  accept:["plusieurs branches","plusieurs repertoires","meme depot","sans cloner"],
  explain:"Il permet d'avoir plusieurs répertoires de travail sur des branches différentes à partir du MÊME dépôt, sans re-cloner ni stasher. Très pratique pour traiter un hotfix urgent pendant qu'une feature est en cours de build." },

{ id:"b3-docker-01", lvl:3, dom:"Docker",
  q:"Comment réduis-tu la taille d'une image de 1,2 Go à quelques dizaines de Mo ? Cite trois leviers.",
  must:[["multi-stage","multi stage"],["image de base","alpine","distroless","slim"]],
  explain:"1) Multi-stage : ne garder que l'artefact. 2) Image de base minimale (alpine, slim, distroless, scratch pour du binaire statique). 3) Fusionner les RUN et nettoyer dans la MÊME couche (<code>rm -rf /var/lib/apt/lists/*</code>) — supprimer dans une couche ultérieure n'enlève rien au poids. 4) <code>.dockerignore</code>. 5) Ne pas installer les paquets de build en runtime." },

{ id:"b3-docker-02", lvl:3, dom:"Docker",
  q:"Deux conteneurs sur le même hôte doivent communiquer. Comment, et comment se résolvent-ils ?",
  accept:["reseau docker","bridge personnalise","par nom","dns integre"],
  explain:"On les place sur le même réseau bridge personnalisé (<code>docker network create</code>) : Docker fournit alors une résolution DNS interne par NOM de conteneur ou de service. Le bridge par défaut n'offre pas cette résolution par nom — d'où la recommandation systématique de créer un réseau dédié." },

{ id:"b3-docker-03", lvl:3, dom:"Docker",
  q:"Pourquoi une image construite aujourd'hui peut-elle différer de la même construite hier, avec le même Dockerfile ?",
  accept:["tag mutable","apt-get update","dependances non figees","non reproductible"],
  explain:"Parce que rien n'est figé : <code>FROM node:20</code> pointe vers une image qui a été republiée, <code>apt-get install</code> tire les dernières versions, <code>npm install</code> sans lockfile résout différemment. Pour la reproductibilité : pin par digest, lockfiles commités, versions de paquets épinglées." },

{ id:"b3-k8s-01", lvl:3, dom:"Kubernetes",
  q:"Comment exposer une application HTTPS avec un certificat automatique dans Kubernetes ?",
  accept:["ingress","cert-manager","lets encrypt","clusterissuer","tls secret"],
  explain:"Un Ingress (ou Gateway) avec une section <code>tls</code> référençant un Secret, et <b>cert-manager</b> qui obtient et renouvelle le certificat automatiquement via un Issuer/ClusterIssuer (ACME/Let's Encrypt, ou une PKI interne en banque). Sans renouvellement automatique, l'expiration est une panne annoncée." },

{ id:"b3-k8s-02", lvl:3, dom:"Kubernetes",
  q:"Quelle est la différence entre <code>kubectl delete pod</code> et <code>kubectl drain</code> ?",
  accept:["un pod","tous les pods du noeud","cordon","respecte les pdb"],
  explain:"<code>delete pod</code> supprime un Pod (recréé aussitôt par son contrôleur). <code>drain</code> vise un NŒUD : il le cordonne (plus de nouveaux Pods) puis évince tous ses Pods en respectant les PodDisruptionBudgets. C'est la procédure de maintenance d'un nœud." },

{ id:"b3-k8s-03", lvl:3, dom:"Kubernetes",
  q:"Que se passe-t-il quand tu changes une image dans un Deployment ? Décris la séquence.",
  accept:["nouveau replicaset","monte progressivement","reduit l ancien","rollout"],
  explain:"Le template du Pod change → le Deployment crée un NOUVEAU ReplicaSet avec 0 réplica → il monte progressivement le nouveau et réduit l'ancien selon maxSurge/maxUnavailable, en attendant que les nouveaux Pods soient Ready → l'ancien RS descend à 0 mais est CONSERVÉ pour permettre le rollback." },

{ id:"b3-k8s-04", lvl:3, dom:"Kubernetes",
  q:"À quoi sert un ResourceQuota et un LimitRange ?",
  accept:["quota du namespace","valeur par defaut","min max","total","par pod"],
  explain:"Le ResourceQuota plafonne la consommation TOTALE d'un namespace (CPU, mémoire, nombre d'objets, PVC). Le LimitRange agit par OBJET : valeurs par défaut si le dev n'en met pas, et bornes min/max. Les deux ensemble empêchent une équipe de consommer tout le cluster, volontairement ou par erreur." },

{ id:"b3-k8s-05", lvl:3, dom:"Kubernetes",
  q:"Comment vérifies-tu qu'un ServiceAccount a le droit de faire une action précise ?",
  accept:["auth can-i","kubectl auth","--as"],
  explain:"<code>kubectl auth can-i create deployments --as=system:serviceaccount:mon-ns:mon-sa -n mon-ns</code>. Avec <code>--list</code> pour tout énumérer. C'est l'outil qui évite de deviner en lisant des ClusterRoleBindings pendant une heure." },

{ id:"b3-tf-01", lvl:3, dom:"Terraform",
  q:"Comment testes-tu une modification Terraform sans risquer la production ?",
  accept:["plan","environnement de test","workspace dedie","compte bac a sable"],
  explain:"1) <code>plan</code> systématique et relu (jamais d'apply à l'aveugle). 2) D'abord sur un environnement de non-production issu du MÊME code paramétré. 3) Idéalement un compte/subscription bac à sable jetable. 4) <code>terraform test</code> ou Terratest pour les modules réutilisables. 5) Scans de conformité sur le plan JSON." },

{ id:"b3-tf-02", lvl:3, dom:"Terraform",
  q:"Que fait <code>terraform refresh</code> (ou <code>-refresh-only</code>) et pourquoi c'est délicat ?",
  accept:["met a jour le state","interroge les api","sans modifier l infra","drift"],
  explain:"Il met à jour le state avec l'état réel du cloud, sans modifier l'infrastructure. Délicat parce qu'il fait DISPARAÎTRE la trace d'une dérive du state : on peut masquer une modification manuelle au lieu de la traiter. <code>plan -refresh-only</code> permet de voir ce que le refresh changerait avant de l'accepter." },

{ id:"b3-tf-03", lvl:3, dom:"Terraform",
  q:"Comment passes-tu un secret à Terraform sans le committer ?",
  accept:["variable d environnement","tf_var","data source","coffre","vault"],
  explain:"Par ordre de préférence : (1) ne pas le faire transiter — le créer dans le coffre et n'en référencer que l'URI ; (2) une data source qui le lit dans Key Vault/Secrets Manager au moment de l'apply ; (3) <code>TF_VAR_mot_de_passe</code> injectée par le pipeline. Jamais dans un tfvars commité. Et rappeler qu'il finira quand même en clair dans le state." },

{ id:"b3-tf-04", lvl:3, dom:"Terraform",
  q:"Quelle différence entre un module local, un module de registry et un module Git ?",
  accept:["chemin relatif","versionne","source","ref"],
  explain:"Local (<code>source = \"./modules/x\"</code>) : versionné avec le dépôt, pas de version indépendante. Registry (<code>source = \"org/x/aws\"</code>, avec <code>version</code>) : versionnement sémantique propre. Git (<code>source = \"git::https://...?ref=v1.2.0\"</code>) : versionné par tag — toujours épingler le <code>ref</code>, jamais <code>main</code>." },

{ id:"b3-aws-01", lvl:3, dom:"AWS",
  q:"Comment donnes-tu à une Lambda l'accès à une base RDS dans un subnet privé ?",
  accept:["vpc config","eni","security group","role d execution"],
  explain:"On attache la Lambda au VPC (subnets privés + security group), ce qui lui crée des ENI ; on autorise ce SG en entrée sur le SG de la base. Conséquence : une Lambda dans un VPC n'a plus d'accès internet sans NAT Gateway ou VPC endpoints. Et pour l'authentification, préférer IAM auth plutôt qu'un mot de passe." },

{ id:"b3-aws-02", lvl:3, dom:"AWS",
  q:"Quelle est la différence entre une politique de cycle de vie S3 et la réplication ?",
  accept:["transition","suppression","copie vers un autre bucket","classe de stockage"],
  explain:"Le cycle de vie fait transiter les objets entre classes de stockage ou les supprime après N jours (optimisation de coût, rétention). La réplication (CRR/SRR) copie les objets vers un autre bucket, éventuellement dans une autre région ou un autre compte (DR, conformité, isolation des sauvegardes)." },

{ id:"b3-aws-03", lvl:3, dom:"AWS",
  q:"Qu'est-ce qu'un service quota AWS et pourquoi ça compte pour un plan de DR ?",
  accept:["limite par compte","par region","demander une augmentation","capacite indisponible"],
  explain:"Chaque compte a des limites par service et par région (nombre d'instances, d'EIP, de vCPU). Dans un plan de DR, la région de secours a ses PROPRES quotas, souvent jamais augmentés : au moment de la bascule, on ne peut pas lancer la capacité nécessaire. C'est un échec de DR très fréquent — les quotas se demandent à l'avance et se testent." },

{ id:"b3-az-01", lvl:3, dom:"Azure",
  q:"Comment sauvegardes-tu des VM Azure et que faut-il vérifier au-delà de la sauvegarde ?",
  accept:["recovery services vault","backup policy","restauration testee","retention"],
  explain:"Azure Backup avec un Recovery Services Vault et une politique (fréquence, rétention court/long terme). Au-delà : tester réellement la restauration, vérifier que le coffre est protégé (soft delete, immuabilité, RBAC séparé) et qu'il n'est pas dans le même périmètre de compromission que les VM — sinon un ransomware chiffre aussi les sauvegardes." },

{ id:"b3-az-02", lvl:3, dom:"Azure",
  q:"Qu'est-ce qu'un Azure Container Registry et comment un AKS y accède-t-il proprement ?",
  accept:["attach","managed identity","acrpull","sans secret"],
  explain:"C'est le registry privé d'images. L'accès propre depuis AKS : <code>az aks update --attach-acr</code>, qui donne le rôle <code>AcrPull</code> à l'identité managée du kubelet — aucun imagePullSecret à gérer ni à faire tourner. Compléter par un Private Endpoint sur le registry si la sortie internet est interdite." },

{ id:"b3-az-03", lvl:3, dom:"Azure",
  q:"Comment fonctionne l'autoscaling d'une App Service et quelle est sa limite ?",
  accept:["scale out","regles","metrique","tier","delai"],
  explain:"Scale out (nombre d'instances) sur règles de métrique ou planification, dans les limites du tier du plan. Limites : le scale UP (changer de tier) n'est pas automatique, la réaction prend plusieurs minutes — donc inefficace face à un pic brutal —, et la base de données derrière ne scale pas avec. D'où le pré-scaling avant un pic connu." },

{ id:"b3-cicd-01", lvl:3, dom:"CI/CD",
  q:"Comment structures-tu la promotion d'un artefact de dev à prod ? Que change-t-on entre les environnements ?",
  accept:["meme artefact","configuration","variables","pas de rebuild"],
  explain:"Le MÊME artefact circule ; seule la CONFIGURATION change (variables d'environnement, secrets, endpoints, feature flags), injectée au déploiement. Rien de spécifique à l'environnement ne doit être compilé dans l'artefact — c'est le principe 12-factor, et c'est ce qui rend la recette représentative." },

{ id:"b3-cicd-02", lvl:3, dom:"CI/CD",
  q:"Qu'est-ce qu'un smoke test post-déploiement et pourquoi c'est non négociable ?",
  accept:["verification rapide","apres le deploiement","valide le chemin critique","rollback automatique"],
  explain:"Une poignée de tests rapides sur le chemin critique, exécutés juste après le déploiement contre l'environnement réel (l'appli répond, elle joint sa base, un parcours métier clé fonctionne). Sans ça, on ne découvre l'échec que par les utilisateurs. Idéalement, leur échec déclenche un rollback automatique." },

{ id:"b3-cicd-03", lvl:3, dom:"CI/CD",
  q:"Comment gères-tu les dépendances entre jobs et l'exécution en parallèle dans un pipeline ?",
  accept:["stages","needs","dag","dependances explicites"],
  explain:"Par stages séquentiels (simple mais on attend le plus lent) ou en DAG avec des dépendances explicites (<code>needs</code>, <code>dependsOn</code>) qui laissent démarrer un job dès que SES prérequis sont satisfaits. Le DAG réduit fortement le temps total sur des pipelines à nombreux modules." },

{ id:"b3-sec-01", lvl:3, dom:"Sécurité",
  q:"Comment protèges-tu une branche principale ? Cite quatre règles.",
  must:[["revue","approbation","pull request"],["pipeline","checks","tests verts"]],
  explain:"1) Interdiction du push direct, tout passe par PR. 2) N approbations dont au moins un CODEOWNER. 3) Checks de CI obligatoires au vert. 4) Interdiction du force-push et de la suppression. 5) Commits signés. 6) Réapprobation à chaque nouveau commit. 7) Pas de bypass administrateur. Ces règles matérialisent la séparation des tâches attendue par un auditeur." },

{ id:"b3-sec-02", lvl:3, dom:"Sécurité",
  q:"Qu'est-ce qu'un bastion (jump host) et pourquoi les services managés le remplacent-ils ?",
  accept:["point d entree unique","rebond","session manager","azure bastion","a maintenir"],
  explain:"Une machine unique exposée servant de rebond vers le réseau privé, avec journalisation. Un bastion classique est lui-même une VM à patcher, à durcir et à surveiller — un point de défaillance et une cible. Les services managés (SSM Session Manager, Azure Bastion) offrent la même fonction sans machine à maintenir, avec un contrôle IAM et un enregistrement natifs." },

{ id:"b3-obs-01", lvl:3, dom:"Observabilité",
  q:"Comment détectes-tu qu'un certificat TLS va expirer, avant l'incident ?",
  accept:["sonde","blackbox exporter","alerte j-30","probe","surveillance"],
  explain:"Une sonde externe qui se connecte régulièrement et exporte les jours restants (blackbox_exporter <code>probe_ssl_earliest_cert_expiry</code>, ou équivalent), avec une alerte à J-30 et une escalade à J-7. Et surtout : automatiser le renouvellement (ACME, Key Vault, ACM) pour que la surveillance ne soit qu'un filet de sécurité." },

{ id:"b3-obs-02", lvl:3, dom:"Observabilité",
  q:"Qu'est-ce qu'un test synthétique et qu'apporte-t-il par rapport aux métriques serveur ?",
  accept:["depuis l exterieur","point de vue utilisateur","parcours","24/7"],
  explain:"C'est un robot qui exécute un parcours utilisateur depuis l'extérieur, en continu, même sans trafic réel. Il détecte ce que les métriques serveur ne voient pas : DNS cassé, certificat expiré, CDN en panne, WAF trop agressif, dégradation régionale. C'est la réponse à « mes dashboards sont verts mais les clients se plaignent »." },

{ id:"b3-sre-01", lvl:3, dom:"SRE",
  q:"Comment définis-tu la gravité d'un incident (P1/P2/P3) ?",
  accept:["impact","nombre d utilisateurs","service critique","perte financiere","escalade"],
  explain:"Sur l'IMPACT MÉTIER, pas sur la difficulté technique : nombre d'utilisateurs touchés, criticité de la fonction (paiement vs page d'aide), perte financière ou réglementaire, existence d'un contournement. Chaque niveau doit avoir un délai de prise en charge, un canal et une règle d'escalade définis à l'avance — pas décidés pendant la panne." },

{ id:"b3-sql-01", lvl:3, dom:"SQL",
  q:"Qu'est-ce qu'une transaction longue et pourquoi c'est un problème en production ?",
  accept:["verrous","bloque","vacuum","idle in transaction","concurrence"],
  explain:"Une transaction ouverte longtemps tient ses verrous, bloque les écritures concurrentes, empêche le nettoyage des anciennes versions (VACUUM) et fait gonfler la base. Sur PostgreSQL, surveiller les sessions <code>idle in transaction</code> et poser un <code>idle_in_transaction_session_timeout</code>." },

{ id:"b3-sql-02", lvl:3, dom:"SQL",
  q:"Comment fais-tu une pagination performante sur une grosse table ?",
  accept:["keyset","seek","curseur","where id >","offset lent"],
  explain:"Pas avec <code>OFFSET 100000</code> : la base doit parcourir et jeter 100 000 lignes, et le coût croît avec la page. On utilise la pagination par clé (keyset/seek) : <code>WHERE (created_at, id) &lt; (:dernier_date, :dernier_id) ORDER BY created_at DESC, id DESC LIMIT 50</code> — coût constant, avec un index adapté." }

]);
