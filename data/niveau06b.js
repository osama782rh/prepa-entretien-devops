window.QBANK = (window.QBANK || []).concat([
/* ============ NIVEAU 6 — SÉRIE B ============ */

{ id:"b6-k8s-01", lvl:6, dom:"Kubernetes",
  q:"Un Pod démarre puis passe en Error après 30 secondes, sans log applicatif. Quelles hypothèses ?",
  accept:["oomkill","liveness","exit code","secret manquant","dependance"],
  explain:"Lire <code>kubectl describe</code> : <b>Last State</b> et l'exit code. 137 = OOMKill (limite mémoire), 143 = SIGTERM (liveness ou éviction), 1/2 = sortie applicative, 126/127 = commande introuvable ou non exécutable. Sans log, suspecter aussi : ConfigMap/Secret référencé absent, volume non montable, ou un crash avant l'initialisation du logger (écrire sur stderr très tôt dans l'app aide énormément)." },

{ id:"b6-k8s-02", lvl:6, dom:"Kubernetes",
  q:"Le cluster répond très lentement à toutes les commandes kubectl. Où regardes-tu ?",
  accept:["api server","etcd","latence","webhook","audit"],
  explain:"1) Santé et latence d'etcd (<code>etcd_disk_wal_fsync_duration</code> — etcd est très sensible aux I/O disque). 2) Charge de l'API server, throttling client (message « client-side throttling »). 3) Un admission webhook lent ou injoignable qui ajoute un aller-retour à chaque requête. 4) Volume d'objets (millions d'Events, Secrets, Jobs terminés non nettoyés). 5) Log d'audit sur un disque saturé." },

{ id:"b6-k8s-03", lvl:6, dom:"Kubernetes",
  q:"Un HPA oscille : il monte à 10 réplicas, redescend à 2, remonte. Comment corriges-tu ?",
  accept:["stabilization window","behavior","metrique instable","cooldown","seuil"],
  explain:"C'est du <em>flapping</em>. Correctifs : augmenter la <code>stabilizationWindowSeconds</code> en scale-down (300 s par défaut, souvent à allonger), configurer <code>behavior</code> avec des politiques de montée et descente asymétriques (monter vite, descendre lentement), choisir une métrique moins bruyante ou l'agréger sur une fenêtre plus longue, et vérifier que la cible n'est pas trop proche de la charge nominale." },

{ id:"b6-k8s-04", lvl:6, dom:"Kubernetes",
  q:"Après un upgrade de cluster, certains manifestes sont refusés. Quelle est la cause probable et comment l'anticiper ?",
  accept:["api depreciee","version d api","supprimee","pluto","kubent"],
  explain:"Une version d'API a été supprimée (par exemple le passage de <code>batch/v1beta1</code> à <code>batch/v1</code> pour CronJob). Anticipation : lire les notes de dépréciation AVANT l'upgrade, scanner les manifestes et les releases Helm avec <code>pluto</code> ou <code>kubent</code>, activer les métriques d'API dépréciées côté API server (<code>apiserver_requested_deprecated_apis</code>) pour repérer qui utilise encore quoi." },

{ id:"b6-k8s-05", lvl:6, dom:"Kubernetes",
  q:"Un namespace reste bloqué en <code>Terminating</code> indéfiniment. Que se passe-t-il ?",
  accept:["finalizer","ressource bloquee","api service","non supprimable"],
  explain:"Un objet du namespace porte un <em>finalizer</em> qu'aucun contrôleur ne lève — souvent parce que le contrôleur ou l'APIService qui devait le traiter n'existe plus (opérateur désinstallé, webhook injoignable). On identifie l'objet bloqué (<code>kubectl get namespace x -o json</code>, section conditions), on répare ou supprime le contrôleur fautif ; retirer le finalizer à la main est un dernier recours qui peut laisser des ressources cloud orphelines." },

{ id:"b6-k8s-06", lvl:6, dom:"Kubernetes",
  q:"Des Pods sont évincés avec le message <code>Evicted: The node was low on resource: ephemeral-storage</code>. Explique.",
  accept:["disque du noeud","logs","emptydir","couche d ecriture","stockage ephemere"],
  explain:"Le kubelet applique une pression d'éviction quand le disque du nœud se remplit. Coupables : logs applicatifs écrits dans le conteneur au lieu de stdout, gros fichiers temporaires dans un emptyDir, images accumulées. Correctifs : logger sur stdout, définir <code>ephemeral-storage</code> en requests/limits, garbage collection des images, et volumes dédiés pour les fichiers volumineux." },

{ id:"b6-linux-01", lvl:6, dom:"Linux",
  q:"Un serveur a une charge CPU normale mais toutes les requêtes sont lentes. Le réseau semble bon. Quelles pistes ?",
  accept:["verrou","pool sature","gc","descripteurs","dependance lente","thread"],
  explain:"Chercher les points de sérialisation plutôt que la saturation : pool de connexions base ou HTTP saturé, verrou applicatif, pauses de garbage collector, descripteurs de fichiers épuisés, threads bloqués sur une dépendance lente, conntrack plein, ou throttling CPU du cgroup (visible dans <code>cpu.stat</code> : <code>nr_throttled</code>) alors que l'usage moyen paraît faible." },

{ id:"b6-linux-02", lvl:6, dom:"Linux",
  q:"Comment prouves-tu qu'un problème vient du réseau et non de l'application ?",
  must:[["tcpdump","capture","des deux cotes"],["latence","temps","curl","mesure"]],
  explain:"On isole par la mesure : <code>curl -w</code> décompose DNS / connect / TLS / première octet / total — si le TTFB est lent mais que connect est rapide, c'est l'application. Une capture <code>tcpdump</code> des deux côtés montre si le SYN arrive, si le SYN-ACK repart, s'il y a des retransmissions. Des retransmissions élevées (<code>ss -ti</code>, <code>netstat -s</code>) désignent le réseau ; leur absence l'innocente." },

{ id:"b6-linux-03", lvl:6, dom:"Linux",
  q:"Le serveur swappe massivement. Faut-il désactiver le swap ?",
  accept:["depend","kubernetes exige","cause racine","swappiness","memoire insuffisante"],
  explain:"Le swap n'est pas la cause, c'est le symptôme d'un manque de mémoire. Le désactiver transforme une lenteur en OOMKill franc — ce qui est parfois PRÉFÉRABLE (Kubernetes l'exigeait historiquement, pour que les limites soient prévisibles). La vraie réponse : identifier le consommateur, ajuster les limites ou la taille de la machine ; ajuster <code>vm.swappiness</code> n'est qu'un pansement." },

{ id:"b6-docker-01", lvl:6, dom:"Docker",
  q:"Le build Docker en CI est très lent alors qu'il est rapide en local. Pourquoi ?",
  accept:["pas de cache","runner ephemere","cache distant","telechargement","contexte"],
  explain:"Le runner est éphémère : aucun cache de couches local, tout est retéléchargé et reconstruit. Solutions : cache de build distant BuildKit (<code>--cache-from/--cache-to</code> vers le registry), image de base miroir interne, <code>.dockerignore</code> pour réduire le contexte envoyé, et ordonner le Dockerfile pour que les dépendances soient cachables. Vérifier aussi qu'on ne builde pas pour plusieurs plateformes sans le vouloir." },

{ id:"b6-docker-02", lvl:6, dom:"Docker",
  q:"Un conteneur consomme toute la mémoire de l'hôte alors qu'il a une limite. Comment est-ce possible ?",
  accept:["page cache","limite non appliquee","enfant","limite mal definie","hote"],
  explain:"Pistes : la limite n'a pas été appliquée (<code>--memory</code> oublié, ou en Kubernetes des limits absentes), le conteneur tourne en privileged ou partage un namespace, ou ce qu'on observe est du page cache imputé au cgroup mais récupérable. Vérifier les compteurs réels du cgroup (<code>memory.current</code>, <code>memory.max</code>) plutôt que la vue globale de l'hôte, qui mélange tout." },

{ id:"b6-tf-01", lvl:6, dom:"Terraform",
  q:"<code>terraform destroy</code> échoue en boucle sur une ressource. Quelles causes classiques ?",
  accept:["dependance externe","protection","lock","ressource creee hors terraform","timeout"],
  explain:"1) Une dépendance créée HORS Terraform s'accroche à la ressource (un endpoint dans un subnet, une ENI orpheline, un enregistrement DNS). 2) Une protection : deletion protection, resource lock Azure, <code>prevent_destroy</code>, politique de rétention. 3) Un ordre de destruction que Terraform ne connaît pas (dépendance implicite non exprimée). 4) Un timeout trop court. On lit l'erreur du provider, on nettoie la dépendance, on relance." },

{ id:"b6-tf-02", lvl:6, dom:"Terraform",
  q:"Deux équipes ont importé la même ressource dans deux states différents. Quel est le problème et comment tu le règles ?",
  accept:["deux sources de verite","conflit","state rm","une seule","ecrasement"],
  explain:"Deux states pensent gérer le même objet : chaque apply peut écraser la configuration de l'autre, et un destroy d'un côté supprime une ressource dont l'autre dépend. Résolution : décider d'un propriétaire unique, faire un <code>state rm</code> côté non-propriétaire, retirer le code correspondant, et exposer la valeur nécessaire via un output ou une data source. Prévention : découpage clair des périmètres et convention de propriété." },

{ id:"b6-tf-03", lvl:6, dom:"Terraform",
  q:"Le plan Terraform met 20 minutes sur un gros périmètre. Comment tu accélères ?",
  accept:["decouper le state","parallelism","refresh","cibler","trop de ressources"],
  explain:"Cause principale : trop de ressources dans un seul state, chaque refresh appelant l'API. Solutions durables : découper les states par domaine et cycle de vie. Palliatifs : ajuster <code>-parallelism</code> (attention au throttling API), <code>-refresh=false</code> quand on sait qu'il n'y a pas eu de dérive, et remplacer des data sources coûteuses par des valeurs figées. <code>-target</code> n'est pas une solution de routine." },

{ id:"b6-cicd-01", lvl:6, dom:"CI/CD",
  q:"Le même pipeline réussit sur une branche et échoue sur une autre. Quelles hypothèses ?",
  accept:["variables","secrets scopes","environnement protege","code different","runner"],
  explain:"1) Variables/secrets restreints à certaines branches ou environnements (le cas le plus fréquent : les secrets ne sont pas exposés aux branches non protégées ni aux forks). 2) Le code de la branche diffère réellement (dépendance, version). 3) Runner ou image de job différents. 4) Cache pollué propre à la branche. 5) Règles de protection qui ajoutent des étapes. On compare les deux exécutions ligne à ligne plutôt que de relancer." },

{ id:"b6-cicd-02", lvl:6, dom:"CI/CD",
  q:"Un déploiement a réussi mais l'ancienne version continue de servir du trafic. Que vérifies-tu ?",
  accept:["cache","cdn","rollout incomplet","endpoints","session persistante","replicaset"],
  explain:"1) Le rollout est-il vraiment terminé (<code>kubectl rollout status</code>) ou bloqué sur des Pods non Ready ? 2) Cache CDN ou navigateur non invalidé. 3) Sticky sessions qui maintiennent les clients sur d'anciens backends. 4) Un ancien ReplicaSet encore à réplicas > 0. 5) Deux Services/Ingress qui pointent vers des sélecteurs différents. 6) Une image taguée <code>latest</code> avec <code>imagePullPolicy: IfNotPresent</code> : le nœud garde l'ancienne image." },

{ id:"b6-aws-01", lvl:6, dom:"AWS",
  q:"Une Lambda échoue par intermittence avec des timeouts sur une base RDS. Quelles pistes ?",
  accept:["connexions","cold start","pool","rds proxy","concurrence"],
  explain:"Chaque environnement d'exécution Lambda ouvre sa propre connexion : sous forte concurrence, on épuise les connexions de la base. Solutions : RDS Proxy pour mutualiser, réutiliser la connexion hors du handler, plafonner la concurrence réservée, timeouts courts côté client. Vérifier aussi les ENI dans le VPC (cold start réseau) et les DNS de la base." },

{ id:"b6-aws-02", lvl:6, dom:"AWS",
  q:"Des objets S3 sont accessibles alors que le bucket est privé. Comment est-ce possible ?",
  accept:["acl d objet","presigned url","cloudfront","policy","proprietaire different"],
  explain:"1) Une ACL au niveau OBJET le rend public (d'où Block Public Access et Object Ownership « bucket owner enforced » qui désactivent les ACL). 2) Une URL pré-signée valide circule. 3) Une distribution CloudFront ou un autre service sert le contenu avec ses propres droits. 4) Une bucket policy plus permissive qu'on ne le croit (Principal <code>*</code> avec une condition mal écrite). CloudTrail et Access Analyzer tranchent." },

{ id:"b6-az-01", lvl:6, dom:"Azure",
  q:"Une VM Azure ne démarre plus après une modification. Quels outils de diagnostic ?",
  accept:["boot diagnostics","serial console","capture de disque","redeploy"],
  explain:"Boot diagnostics (capture d'écran de démarrage + logs série), Serial Console pour intervenir même sans réseau, attachement du disque OS à une VM saine pour réparer un fstab ou une config, <em>Redeploy</em> pour la migrer vers un autre hôte physique, ou restauration depuis un snapshot/sauvegarde. Réflexe préalable : toujours faire un snapshot du disque OS avant une modification risquée." },

{ id:"b6-az-02", lvl:6, dom:"Azure",
  q:"Les métriques d'une ressource Azure n'apparaissent pas dans Log Analytics. Pourquoi ?",
  accept:["diagnostic settings","categorie","pas active","destination","delai"],
  explain:"Les diagnostic settings ne sont pas activés sur la ressource, ou la bonne CATÉGORIE de log/métrique n'est pas cochée, ou la destination pointe vers un autre workspace. Ajouter aussi : le délai d'ingestion (plusieurs minutes), et le fait que les métriques de plateforme et les logs de ressource sont deux flux distincts. Correctif systémique : imposer les diagnostic settings par Azure Policy <code>DeployIfNotExists</code>." },

{ id:"b6-sec-01", lvl:6, dom:"Sécurité",
  q:"Tu découvres qu'un conteneur en production tourne en root avec le socket Docker monté. Quel est le risque et que fais-tu ?",
  accept:["evasion","controle de l hote","equivalent root","urgence","isoler"],
  explain:"Le socket Docker donne le contrôle du daemon : on peut lancer un conteneur privilégié qui monte <code>/</code> de l'hôte — c'est un root sur le nœud, et donc sur tous les conteneurs voisins. Actions : évaluer l'exposition et l'usage réel, isoler la charge, retirer le montage (utiliser une API dédiée ou un builder sans daemon comme Kaniko/Buildah), puis une politique d'admission qui interdit hostPath sur le socket et les conteneurs privilégiés." },

{ id:"b6-sec-02", lvl:6, dom:"Sécurité",
  q:"Un pipeline s'est mis à déployer en production sans approbation. Comment enquêtes-tu ?",
  must:[["journal","log","audit","historique"],["regle","protection","configuration","qui a modifie"]],
  explain:"1) Journal d'audit du forge : qui a modifié les règles de protection, les environnements ou les approbateurs, et quand. 2) Historique des exécutions : quel déclencheur, quelle identité, quel commit. 3) Vérifier un contournement (droit administrateur, workflow modifié dans la PR elle-même, self-approval). 4) Révoquer, restaurer les règles, puis post-mortem : le contrôle doit être non contournable, y compris par un admin." },

{ id:"b6-obs-01", lvl:6, dom:"Observabilité",
  q:"Les traces sont incomplètes : elles s'arrêtent au deuxième service. Pourquoi ?",
  accept:["propagation","contexte non transmis","header","instrumentation manquante","format"],
  explain:"Le contexte de trace n'est pas propagé : service non instrumenté, en-têtes <code>traceparent</code> non transmis par un client HTTP maison ou un proxy qui les filtre, format incompatible (B3 vs W3C) entre deux bibliothèques, ou passage par une file de messages sans injection du contexte dans les en-têtes du message. Vérifier aussi que l'échantillonnage n'est pas décidé différemment d'un service à l'autre." },

{ id:"b6-obs-02", lvl:6, dom:"Observabilité",
  q:"Prometheus consomme 40 Go de RAM et redémarre. Quelles causes et quelles actions ?",
  accept:["cardinalite","trop de series","retention","recording rule","federation"],
  explain:"Presque toujours la cardinalité : un label à valeurs illimitées a explosé le nombre de séries. Diagnostic : <code>topk</code> sur <code>count by (__name__)</code>, la page TSDB status, <code>prometheus_tsdb_head_series</code>. Actions : supprimer le label fautif (relabeling au scrape), réduire la rétention locale et déporter le long terme (Thanos, Mimir, Cortex), pré-agréger avec des recording rules, et poser des limites de séries par cible." },

{ id:"b6-sre-01", lvl:6, dom:"SRE",
  q:"Un incident est résolu mais reviendra sûrement. Comment traites-tu ça correctement ?",
  accept:["cause racine","action systemique","ticket","echeance","proprietaire"],
  explain:"On distingue la MITIGATION (fait) de la CORRECTION (à faire). Post-mortem avec chronologie et causes systémiques, actions concrètes avec un propriétaire nommé et une échéance, priorisées dans le backlog au même titre que les features — sinon elles n'existent pas. Et on ajoute une détection : si ça revient, l'alerte doit se déclencher avant les utilisateurs." },

{ id:"b6-sre-02", lvl:6, dom:"SRE",
  q:"Comment mènes-tu une analyse de cause racine sans tomber dans le « c'est la faute du dev » ?",
  accept:["5 pourquoi","facteurs contributifs","systeme","pourquoi c etait possible","barriere"],
  explain:"On demande « pourquoi c'était POSSIBLE » plutôt que « qui l'a fait ». Méthode des 5 pourquoi ou arbre des causes, en cherchant les facteurs contributifs multiples : absence de garde-fou, revue insuffisante, alerte manquante, documentation ambiguë, pression de délai. Une erreur humaine est toujours le DERNIER maillon d'une chaîne de défenses absentes — ce sont ces défenses qu'on ajoute." },

{ id:"b6-sql-01", lvl:6, dom:"SQL",
  q:"Une requête qui prenait 50 ms prend soudain 30 s sans changement de code. Que s'est-il passé ?",
  accept:["statistiques","plan change","volume","index supprime","parametre"],
  explain:"Le plan d'exécution a changé : statistiques périmées après une forte croissance de volume, index devenu inefficace ou supprimé, bind parameter sniffing (un plan mis en cache pour une valeur atypique), ou bascule d'un index scan vers un seq scan quand la sélectivité change. Diagnostic : comparer <code>EXPLAIN ANALYZE</code> avec l'ancien plan, relancer <code>ANALYZE</code>, vérifier la croissance de la table." },

{ id:"b6-res-01", lvl:6, dom:"Réseau",
  q:"Un service est joignable depuis un Pod mais pas depuis un autre, dans le même cluster. Que vérifies-tu ?",
  accept:["networkpolicy","namespace","dns","noeud","selecteur"],
  explain:"1) NetworkPolicy : une policy sélectionne-t-elle le Pod source ou destination (podSelector, namespaceSelector) ? 2) Le namespace d'origine et le FQDN utilisé. 3) Les deux Pods sont-ils sur des nœuds différents — auquel cas c'est le CNI ou une règle de sécurité inter-nœuds. 4) Résolution DNS depuis chaque Pod. 5) mTLS / service mesh : le sidecar est-il injecté des deux côtés ?" },

{ id:"b6-res-02", lvl:6, dom:"Réseau",
  q:"Les connexions vers une API externe échouent une fois sur dix. Comment tu diagnostiques ?",
  accept:["plusieurs ip","un backend en panne","dns round robin","retry","capture"],
  explain:"Un nom qui résout vers plusieurs IP dont une seule est défaillante donne exactement ce taux. On teste chaque IP individuellement (<code>curl --resolve</code>), on regarde si l'échec suit une IP précise. Autres pistes : conntrack saturé, pool NAT épuisé, MTU sur un chemin, ou throttling côté fournisseur. Un retry avec backoff masque le symptôme mais il faut identifier la cause avant de l'accepter." }

]);
