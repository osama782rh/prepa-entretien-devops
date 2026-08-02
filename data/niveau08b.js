window.QBANK = (window.QBANK || []).concat([
/* ============ NIVEAU 8 — SÉRIE B ============ */

{ id:"b8-k8s-01", lvl:8, dom:"Kubernetes",
  q:"Comment fonctionne le mécanisme de leader election entre plusieurs réplicas d'un contrôleur ?",
  accept:["lease","bail","un seul actif","renouvelle","coordination"],
  explain:"Les réplicas tentent d'acquérir un objet <code>Lease</code> (anciennement une annotation sur un ConfigMap/Endpoints) dans l'API. Celui qui l'obtient devient leader et le renouvelle périodiquement ; les autres restent en veille. Si le leader cesse de renouveler, le bail expire et un autre prend la main. C'est ce qui permet d'avoir des contrôleurs en haute disponibilité sans double exécution — et c'est exactement ce que fait le kube-controller-manager." },

{ id:"b8-k8s-02", lvl:8, dom:"Kubernetes",
  q:"Explique le fonctionnement de <code>resourceVersion</code> et du mécanisme de watch.",
  accept:["optimistic concurrency","conflit","reprendre","etcd revision","informer"],
  explain:"Chaque objet porte une <code>resourceVersion</code> issue de la révision etcd. En écriture, elle sert de contrôle de concurrence optimiste : si l'objet a changé depuis votre lecture, l'API renvoie un conflit (409) et le client rejoue. En lecture, un <code>watch</code> depuis une resourceVersion permet de reprendre le flux d'événements là où on s'était arrêté — c'est le socle des informers et donc de tous les contrôleurs." },

{ id:"b8-k8s-03", lvl:8, dom:"Kubernetes",
  q:"Qu'est-ce que le server-side apply et quel problème résout-il ?",
  accept:["field manager","propriete des champs","conflit","last-applied","plusieurs acteurs"],
  explain:"L'API suit QUI possède chaque champ (field manager). Quand deux acteurs modifient le même objet (un dev, un opérateur, un HPA), les conflits sont détectés explicitement au lieu d'être écrasés silencieusement. Cela remplace l'ancien mécanisme basé sur l'annotation <code>last-applied-configuration</code>, qui gérait mal la suppression de champs et les acteurs multiples." },

{ id:"b8-k8s-04", lvl:8, dom:"Kubernetes",
  q:"Comment le scheduler choisit-il un nœud ? Décris les deux phases.",
  must:[["filtrage","predicat","eligibles"],["score","priorite","meilleur"]],
  explain:"1) <b>Filtrage</b> : élimine les nœuds inéligibles (ressources insuffisantes, taints non tolérés, affinités impossibles, ports en conflit, volume non attachable). 2) <b>Scoring</b> : note les nœuds restants selon des plugins (répartition, ressources les moins utilisées, localité de l'image, topologie) et prend le meilleur. Puis il « binde » le Pod au nœud. On peut étendre les deux phases par des plugins ou un scheduler personnalisé." },

{ id:"b8-k8s-05", lvl:8, dom:"Kubernetes",
  q:"Qu'est-ce que la préemption de Pods et à quoi sert une PriorityClass ?",
  accept:["evincer","priorite plus basse","liberer de la place","critique"],
  explain:"Si un Pod de haute priorité ne peut pas être placé, le scheduler peut ÉVINCER des Pods de priorité inférieure pour lui faire de la place. Les PriorityClass définissent cette hiérarchie (les composants système utilisent <code>system-cluster-critical</code>). Utile pour garantir que les charges critiques passent avant le batch. Danger : mal calibrées, elles provoquent des évictions en cascade — et un PDB peut freiner mais pas empêcher la préemption." },

{ id:"b8-k8s-06", lvl:8, dom:"Kubernetes",
  q:"Pourquoi une application Java en conteneur peut-elle se faire OOMKill alors que son heap est bien inférieur à la limite ?",
  accept:["hors heap","metaspace","thread","overhead","jvm ne voit pas le cgroup"],
  explain:"La mémoire d'une JVM ne se limite pas au heap : metaspace, piles de threads, buffers directs, code natif, GC. Le cgroup compte TOUT. De plus, une JVM ancienne ne détecte pas la limite du cgroup et dimensionne son heap sur la RAM de l'hôte. Correctifs : JVM récente avec <code>-XX:MaxRAMPercentage</code>, limite mémoire avec une marge de 25-30 % au-dessus du heap, et surveillance du working set, pas du heap." },

{ id:"b8-linux-01", lvl:8, dom:"Linux",
  q:"Explique ce qu'est un appel système et pourquoi seccomp est un contrôle de sécurité efficace.",
  accept:["interface noyau","restreint les appels","surface d attaque","filtre"],
  explain:"Un appel système est le seul point d'entrée d'un programme vers le noyau (open, read, socket, clone...). seccomp filtre les appels autorisés pour un processus : un conteneur qui n'a pas besoin de <code>mount</code>, <code>ptrace</code> ou <code>keyctl</code> ne peut plus les invoquer, ce qui neutralise des familles entières d'exploits d'évasion. Le profil <code>RuntimeDefault</code> bloque déjà une bonne partie des appels dangereux — et il n'est pas actif par défaut partout." },

{ id:"b8-linux-02", lvl:8, dom:"Linux",
  q:"Qu'est-ce que le user namespace remapping et pourquoi ça change la donne pour les conteneurs ?",
  accept:["root dans le conteneur","non privilegie sur l hote","uid different","isolation"],
  explain:"Il fait correspondre l'UID 0 DANS le conteneur à un UID non privilégié sur l'hôte. Conséquence : même si un processus est root dans le conteneur, une évasion ne donne qu'un utilisateur ordinaire sur l'hôte. C'est une des rares protections structurelles contre l'évasion, longtemps peu utilisée par défaut (contraintes sur les volumes et les permissions), aujourd'hui disponible dans Kubernetes." },

{ id:"b8-linux-03", lvl:8, dom:"Linux",
  q:"Qu'est-ce qu'eBPF et pourquoi ça transforme l'observabilité et le réseau ?",
  accept:["programme dans le noyau","sans module","verifie","sans modifier l application","cilium"],
  explain:"eBPF permet d'exécuter des programmes vérifiés et sandboxés DANS le noyau, attachés à des points d'instrumentation (appels système, pile réseau, tracepoints), sans module noyau ni redémarrage. Applications : observabilité sans instrumenter les applications, réseau et politiques haute performance (Cilium remplace kube-proxy et iptables), détection de sécurité au runtime (Falco, Tetragon). C'est le sujet où l'on gagne des points en entretien senior." },

{ id:"b8-tf-01", lvl:8, dom:"Terraform",
  q:"Comment fonctionne le graphe de dépendances de Terraform et qu'implique-t-il pour la parallélisation ?",
  accept:["dag","acyclique","references","parallele","ordre"],
  explain:"Terraform construit un graphe orienté acyclique à partir des RÉFÉRENCES entre ressources, puis parcourt ce graphe en exécutant en parallèle (10 par défaut) tout ce qui n'a pas de dépendance mutuelle. Conséquences : abuser de <code>depends_on</code> sérialise inutilement, un cycle bloque le plan, et l'ordre de destruction est simplement l'inverse du graphe." },

{ id:"b8-tf-02", lvl:8, dom:"Terraform",
  q:"Que se passe-t-il si le processus Terraform est tué pendant un apply ?",
  accept:["lock reste","state partiel","force-unlock","ressource orpheline"],
  explain:"Le verrou reste posé (il faudra un <code>force-unlock</code> après vérification) et le state peut ne pas refléter la dernière opération en cours : une ressource créée côté cloud mais non écrite dans le state devient ORPHELINE — Terraform voudra la recréer et échouera sur un conflit de nom. Reprise : lever le verrou, faire un plan, identifier les orphelines, les importer ou les supprimer manuellement." },

{ id:"b8-tf-03", lvl:8, dom:"Terraform",
  q:"Quelle est la différence entre <code>sensitive = true</code> sur une variable et un secret réellement protégé ?",
  accept:["masque l affichage","toujours en clair dans le state","pas du chiffrement","logs"],
  explain:"<code>sensitive</code> masque simplement la valeur dans la sortie du plan et des outputs — c'est un garde-fou d'affichage, pas une protection. La valeur reste EN CLAIR dans le state, et peut fuiter par une ressource qui l'expose ou par un provider verbeux. La vraie protection : chiffrement et contrôle d'accès du state, et surtout ne pas faire transiter le secret par Terraform." },

{ id:"b8-aws-01", lvl:8, dom:"AWS",
  q:"Comment fonctionne le mécanisme d'éventuelle cohérence d'IAM et quel piège pratique ça crée ?",
  accept:["propagation","delai","reessayer","role vient d etre cree","globalement"],
  explain:"IAM est un service global dont les modifications se propagent avec un léger délai. Piège classique en automatisation : on crée un rôle puis on l'utilise immédiatement, et l'appel échoue en AccessDenied ou « role cannot be assumed ». Parade : retry avec backoff sur ces créations, ou dépendance explicite plus une temporisation. C'est un cas typique où l'on croit à tort à un bug de permissions." },

{ id:"b8-aws-02", lvl:8, dom:"AWS",
  q:"Explique le fonctionnement des partitions DynamoDB et le problème de la clé chaude.",
  accept:["partition key","repartition","hot partition","throttling","cardinalite"],
  explain:"Les données sont réparties par hachage de la clé de partition ; chaque partition a sa part de capacité. Si une clé concentre le trafic (une date du jour, un identifiant de tenant dominant), on obtient une <em>hot partition</em> : throttling alors que la capacité globale semble suffisante. Parades : choisir une clé à haute cardinalité et bien distribuée, ajouter un suffixe de répartition (write sharding), ou utiliser le mode on-demand avec adaptive capacity." },

{ id:"b8-aws-03", lvl:8, dom:"AWS",
  q:"Qu'est-ce que le modèle de facturation d'une NAT Gateway et pourquoi c'est un piège d'architecture ?",
  accept:["par heure","par go traite","tout le trafic","endpoints","inter-az"],
  explain:"On paie à l'heure ET au Go TRAITÉ, y compris pour du trafic vers S3 ou une autre AZ. Sur une plateforme qui télécharge beaucoup d'images ou écrit massivement dans S3, la NAT peut coûter plus cher que le calcul. Parades : VPC endpoints (gateway pour S3/DynamoDB, gratuits), registry miroir interne, et vérifier qu'on ne fait pas transiter du trafic interne par la NAT à cause d'une route mal placée." },

{ id:"b8-az-01", lvl:8, dom:"Azure",
  q:"Comment fonctionne le modèle de cohérence de Cosmos DB ? Cite les niveaux et l'arbitrage.",
  must:[["strong","forte"],["eventual","eventuelle"],["session"]],
  explain:"Cinq niveaux : Strong (linéarisable, latence et coût maximaux, limite la distribution), Bounded Staleness (retard borné en versions ou en temps), <b>Session</b> (défaut : cohérence garantie pour la session d'un client — le bon compromis dans la majorité des cas), Consistent Prefix (ordre respecté sans garantie de fraîcheur), Eventual (le moins cher et le plus rapide). L'arbitrage porte sur latence, disponibilité, coût en RU et fraîcheur." },

{ id:"b8-az-02", lvl:8, dom:"Azure",
  q:"Qu'est-ce qu'un ARM template deployment mode « Complete » et pourquoi c'est dangereux ?",
  accept:["supprime ce qui n est pas dans le template","incremental","destruction","resource group"],
  explain:"En mode Complete, tout ce qui existe dans le resource group mais n'apparaît PAS dans le template est SUPPRIMÉ. C'est puissant pour garantir la conformité stricte, et catastrophique si le template est incomplet ou si le RG contient des ressources créées ailleurs. Le mode Incremental (par défaut) ne fait qu'ajouter/mettre à jour. À manier avec des RG dédiés et jamais en découverte." },

{ id:"b8-sec-01", lvl:8, dom:"Sécurité",
  q:"Qu'est-ce que la forward secrecy et pourquoi c'est important pour de la donnée bancaire ?",
  accept:["cle de session ephemere","compromission future","dechiffrer le passe","ecdhe"],
  explain:"Chaque session dérive une clé éphémère (ECDHE) qui n'est jamais transmise ni dérivable de la clé privée du serveur. Conséquence : un attaquant qui enregistre le trafic aujourd'hui et vole la clé privée dans trois ans ne peut PAS déchiffrer les sessions passées. Pour des données à longue durée de sensibilité (données bancaires, santé), c'est essentiel — et c'est obligatoire en TLS 1.3." },

{ id:"b8-sec-02", lvl:8, dom:"Sécurité",
  q:"Qu'est-ce qu'une attaque SSRF et pourquoi est-elle particulièrement dangereuse dans le cloud ?",
  accept:["metadonnees","169.254.169.254","imds","credentials","serveur fait la requete"],
  explain:"L'attaquant fait émettre une requête PAR le serveur vers une adresse qu'il choisit. Dans le cloud, la cible est l'endpoint de métadonnées (<code>169.254.169.254</code>) : on en extrait les credentials temporaires du rôle de l'instance, donc un accès direct au compte. Parades : IMDSv2 obligatoire (requête avec token, hop limit), Managed Identity via des mécanismes non exposés, validation stricte des URL sortantes, et egress filtré." },

{ id:"b8-cicd-01", lvl:8, dom:"CI/CD",
  q:"Qu'est-ce que SLSA et à quoi servent les attestations de provenance ?",
  accept:["chaine d approvisionnement","niveaux","prouver l origine","build","integrite"],
  explain:"SLSA est un référentiel de niveaux de maturité pour l'intégrité de la chaîne de build. Une attestation de provenance est un document signé produit par le système de build qui déclare : quel code source, quel commit, quel builder, quels paramètres ont produit CET artefact. Vérifiée à l'admission, elle empêche de déployer un artefact qui n'a pas été produit par le pipeline officiel — une réponse directe aux attaques type SolarWinds." },

{ id:"b8-cicd-02", lvl:8, dom:"CI/CD",
  q:"Comment gères-tu un monorepo de 200 services pour ne construire que ce qui a changé ?",
  accept:["detection de changement","graphe de dependances","bazel","nx","turborepo","affected"],
  explain:"Détection des chemins modifiés dans le commit, puis résolution du graphe de dépendances internes pour inclure ce qui est impacté indirectement (outils : Bazel, Nx, Turborepo, ou un script maison sur les paths). Cache d'artefacts indexé par hash des entrées pour réutiliser un build identique. Piège : oublier les dépendances transitives ou les fichiers partagés — on rate alors une régression, ce qui est pire que de tout builder." },

{ id:"b8-obs-01", lvl:8, dom:"Observabilité",
  q:"Explique la différence entre échantillonnage head-based et tail-based, et l'arbitrage.",
  must:[["au debut","des le premier span","head"],["apres","trace complete","tail","erreur"]],
  explain:"Head-based : la décision de garder la trace est prise au DÉBUT, avant de savoir si elle sera intéressante — simple, peu coûteux, mais on jette des erreurs et des requêtes lentes. Tail-based : on bufferise la trace complète puis on décide (garder 100 % des erreurs et des traces au-dessus d'un seuil de latence, échantillonner le reste) — bien plus utile, mais nécessite un collector qui garde les traces en mémoire et voit tous les spans d'une même trace." },

{ id:"b8-obs-02", lvl:8, dom:"Observabilité",
  q:"Qu'est-ce qu'un exemplar en Prometheus et quel problème ça résout ?",
  accept:["lien metrique trace","trace id","du graphe vers la trace","correlation"],
  explain:"C'est un identifiant de trace attaché à une observation d'histogramme : depuis un graphe de latence, on clique sur le point aberrant et on ouvre LA trace correspondante. Ça résout le trou classique entre « je vois que le p99 est mauvais » et « je ne sais pas quelle requête regarder ». C'est la corrélation métriques → traces sans passer par une recherche à l'aveugle dans les logs." },

{ id:"b8-sre-01", lvl:8, dom:"SRE",
  q:"Qu'est-ce qu'une défaillance métastable et pourquoi est-elle si difficile à résoudre ?",
  accept:["persiste apres la cause","boucle","retry","ne revient pas seul","effondrement"],
  explain:"Le système entre dans un état dégradé qui s'AUTO-ENTRETIENT même après la disparition de la cause initiale : les retries, les files pleines et les caches froids maintiennent la surcharge. Retirer la cause ne suffit donc plus. Sortie : réduire drastiquement la charge (load shedding, coupure du trafic, vidage des files) pour casser la boucle, puis remonter progressivement. C'est le mode de panne qui explique les incidents de plusieurs heures chez les grands acteurs." },

{ id:"b8-sre-02", lvl:8, dom:"SRE",
  q:"Pourquoi un cache peut-il aggraver une panne ? Explique deux mécanismes.",
  accept:["cache stampede","cache froid","expiration simultanee","dependance","tout arrive en meme temps"],
  explain:"1) <b>Cache stampede</b> : de nombreuses entrées expirent en même temps, tous les clients frappent l'origine simultanément et la tuent (parades : TTL avec jitter, verrou de recalcul, rafraîchissement anticipé). 2) <b>Cache froid</b> : après un redémarrage ou un vidage, le service ne peut plus absorber le trafic nominal car il comptait sur un taux de hit élevé — d'où l'intérêt de remonter progressivement et de dimensionner l'origine pour un scénario sans cache." },

{ id:"b8-sql-01", lvl:8, dom:"SQL",
  q:"Qu'est-ce que le write amplification et pourquoi ça compte pour une base sur SSD cloud ?",
  accept:["ecriture reelle superieure","index","wal","iops","cout"],
  explain:"Une écriture logique déclenche plusieurs écritures physiques : journal (WAL), page de données, chaque index, réplication, puis la gestion interne du SSD. Une table à 8 index peut multiplier les IOPS par un facteur important. Conséquences cloud : on atteint la limite d'IOPS provisionnées bien avant la limite de CPU, et la facture de stockage explose. D'où : n'indexer que l'utile, regrouper les écritures par lots." },

{ id:"b8-sql-02", lvl:8, dom:"SQL",
  q:"Comment fonctionne la réplication en flux (streaming) PostgreSQL et que se passe-t-il si le réplica prend du retard ?",
  accept:["wal","lag","slot de replication","disque plein","lecture perimee"],
  explain:"Le primaire envoie son flux de WAL au réplica qui les rejoue. Si le réplica prend du retard : les lectures sur le réplica renvoient des données périmées, et surtout — avec un <em>replication slot</em> — le primaire CONSERVE les WAL non consommés, ce qui peut remplir son disque et arrêter la base. C'est un piège d'exploitation classique : un réplica arrêté et oublié met le primaire à genoux (d'où <code>max_slot_wal_keep_size</code>)." },

{ id:"b8-res-01", lvl:8, dom:"Réseau",
  q:"Qu'apporte HTTP/2 et HTTP/3 par rapport à HTTP/1.1, et quel problème résout QUIC ?",
  must:[["multiplexage","une seule connexion"],["udp","quic","head of line"]],
  explain:"HTTP/2 : multiplexage de plusieurs flux sur une connexion TCP, compression des en-têtes, priorisation — mais une perte de paquet bloque TOUS les flux (head-of-line blocking au niveau TCP). HTTP/3 sur QUIC (UDP) résout ça : les flux sont indépendants, le handshake est fusionné avec TLS 1.3 (0-RTT possible) et la connexion survit à un changement d'IP. Gain surtout sensible sur réseau mobile et à latence élevée." },

{ id:"b8-docker-01", lvl:8, dom:"Docker",
  q:"Pourquoi une image <code>scratch</code> ou distroless complique-t-elle l'exploitation, et comment on s'en sort ?",
  accept:["pas de shell","pas d outils","ephemeral container","debug","kubectl debug"],
  explain:"Pas de shell, pas de <code>ps</code>, pas de résolveur DNS parfois, pas de certificats CA si on ne les copie pas. Bénéfice : surface d'attaque minimale et quasi zéro CVE système. On s'en sort par les conteneurs éphémères (<code>kubectl debug --target</code>), une variante « debug » de l'image utilisée ponctuellement, une observabilité applicative solide, et en copiant explicitement les certificats CA et le fichier de zones horaires dans l'image." }

]);
