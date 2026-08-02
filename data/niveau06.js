window.QBANK = (window.QBANK || []).concat([
/* ================= NIVEAU 6 — TROUBLESHOOTING ================= */

{ id:"n6-k8s-01", lvl:6, dom:"Kubernetes",
  q:"Un Service ne route vers aucun Pod. Décris ta méthode de diagnostic en 4 étapes.",
  must:[["endpoints","endpointslice"],["selector","label"]],
  explain:"1) <code>kubectl get endpoints &lt;svc&gt;</code> : vide ⇒ aucun Pod ne matche. 2) Comparer le <code>selector</code> du Service aux labels réels des Pods (<code>--show-labels</code>). 3) Si des Pods matchent mais les endpoints restent vides : readiness probe en échec. 4) Vérifier <code>targetPort</code> vs port réellement écouté dans le conteneur, et le protocole. Ensuite seulement : NetworkPolicy et kube-proxy." },

{ id:"n6-k8s-02", lvl:6, dom:"Kubernetes",
  q:"Un Pod est <code>OOMKilled</code> alors que la métrique moyenne de mémoire semble basse. Explique et corrige.",
  accept:["pic","limite","moyenne masque","working set","augmenter la limite","fuite"],
  explain:"L'OOMKill se déclenche sur un PIC instantané dépassant la limite du cgroup, invisible sur une moyenne à 1 min. Diagnostic : <code>kubectl describe</code> (Last State: OOMKilled, exit 137), métrique <code>container_memory_working_set_bytes</code> au max plutôt qu'en moyenne. Correction : augmenter la limite, régler le heap de la JVM/Node en fonction du cgroup, chercher une fuite ou un traitement qui charge tout en mémoire." },

{ id:"n6-k8s-03", lvl:6, dom:"Kubernetes",
  q:"Après un déploiement, la moitié des requêtes échoue en 502 pendant 30 s. Quelle cause probable et quel correctif ?",
  accept:["arret brutal","preStop","grace period","endpoints pas a jour","connexions en cours"],
  explain:"Race entre la suppression du Pod et la propagation du retrait des endpoints : le proxy continue d'envoyer du trafic à un Pod qui a déjà reçu SIGTERM. Correctif : un hook <code>preStop</code> avec un court sleep (5-10 s), une readiness qui bascule en échec avant l'arrêt, un <code>terminationGracePeriodSeconds</code> suffisant, l'arrêt gracieux côté application, et le drain des connexions côté LB." },

{ id:"n6-k8s-04", lvl:6, dom:"Kubernetes",
  q:"Un nœud passe en <code>NotReady</code>. Que se passe-t-il pour ses Pods et au bout de combien de temps ?",
  accept:["taint","evince","pod-eviction-timeout","5 minutes","recree ailleurs"],
  explain:"Le node controller marque le nœud avec un taint <code>node.kubernetes.io/not-ready</code> ; les Pods deviennent Unknown puis sont évincés après le délai de toleration (5 min par défaut) et recréés ailleurs — sauf ceux d'un StatefulSet avec volume attaché, qui attendent que le volume soit détaché pour éviter la double écriture. Causes fréquentes : kubelet mort, pression disque, réseau, ou le nœud coupé." },

{ id:"n6-k8s-05", lvl:6, dom:"Kubernetes",
  q:"Comment débugges-tu un conteneur distroless sans shell dans un Pod en production ?",
  accept:["ephemeral container","kubectl debug","copie du pod","partage de namespace"],
  explain:"<code>kubectl debug -it &lt;pod&gt; --image=busybox --target=&lt;conteneur&gt;</code> : ça injecte un conteneur éphémère partageant les namespaces du conteneur cible, sans redémarrer le Pod. Variante <code>kubectl debug pod/x --copy-to=debug-x</code> pour travailler sur une copie. Sinon <code>kubectl debug node/&lt;node&gt;</code> pour ouvrir un shell privilégié sur l'hôte." },

{ id:"n6-k8s-06", lvl:6, dom:"Kubernetes",
  q:"Le DNS interne du cluster est intermittent. Quelles pistes explores-tu ?",
  accept:["coredns","ndots","resolv.conf","cache","cpu de coredns","nodelocaldns"],
  explain:"1) Santé et ressources des Pods CoreDNS (throttling CPU, réplicas insuffisants). 2) <code>ndots:5</code> du resolv.conf : chaque nom externe génère 4-5 requêtes inutiles — d'où la saturation ; on corrige avec un FQDN terminé par un point ou une <code>dnsConfig</code> personnalisée. 3) Conntrack saturé sur les nœuds / race UDP connue. 4) Déployer NodeLocal DNSCache. 5) NetworkPolicy bloquant le port 53." },

{ id:"n6-linux-01", lvl:6, dom:"Linux",
  q:"Une application répond lentement. Donne ta séquence de diagnostic système, du plus général au plus fin.",
  must:[["top","uptime","load","htop"],["iostat","io","disque"],["ss","reseau","netstat"]],
  explain:"1) <code>uptime</code>/<code>top</code> : load, CPU, mémoire, swap. 2) <code>vmstat 1</code>/<code>iostat -x 1</code> : iowait, saturation disque, %util. 3) <code>free -m</code> : swap actif = mort lente. 4) <code>ss -s</code>, retransmissions TCP, conntrack plein. 5) Descripteurs de fichiers (<code>ulimit -n</code>, <code>lsof | wc -l</code>). 6) Puis on descend dans l'app : <code>strace -c</code>, profil, GC, pool de connexions saturé." },

{ id:"n6-linux-02", lvl:6, dom:"Linux",
  q:"Un serveur refuse de nouvelles connexions avec « Too many open files ». Que fais-tu ?",
  accept:["ulimit","limitnofile","descripteurs","file-max","systemd"],
  explain:"Vérifier la limite du process (<code>cat /proc/&lt;pid&gt;/limits</code>) et le nombre réel (<code>ls /proc/&lt;pid&gt;/fd | wc -l</code>). Augmenter via <code>LimitNOFILE</code> dans l'unité systemd (le <code>ulimit</code> du shell ne s'applique pas à un service), ou <code>/etc/security/limits.conf</code>. Mais chercher d'abord la FUITE : sockets non fermés, connexions en CLOSE_WAIT, absence de pool." },

{ id:"n6-linux-03", lvl:6, dom:"Linux",
  q:"Comment identifies-tu quel processus écrit massivement sur le disque ?",
  accept:["iotop","pidstat","proc io","iostat"],
  explain:"<code>iotop -o</code> (processus faisant réellement de l'I/O), <code>pidstat -d 1</code>, ou <code>cat /proc/&lt;pid&gt;/io</code> pour les compteurs read_bytes/write_bytes. Compléter par <code>lsof -p &lt;pid&gt;</code> pour voir sur quels fichiers, et <code>iostat -x 1</code> pour identifier le device saturé (%util proche de 100)." },

{ id:"n6-docker-01", lvl:6, dom:"Docker",
  q:"Le disque de tes nœuds Docker se remplit continuellement. Où va la place et comment tu tries ?",
  accept:["images","logs des conteneurs","volumes orphelins","docker system df","prune","overlay2"],
  explain:"<code>docker system df -v</code> pour ventiler. Sources habituelles : images et couches non utilisées, volumes orphelins, et surtout les LOGS json-file sans rotation (<code>/var/lib/docker/containers/*/*-json.log</code>). Correctifs : <code>docker system prune</code> planifié, <code>log-opts max-size/max-file</code> dans le daemon.json, et côté K8s la garbage collection du kubelet (imageGCHighThreshold)." },

{ id:"n6-docker-02", lvl:6, dom:"Docker",
  q:"L'image fonctionne sur ton poste mais pas sur le cluster. Cite trois causes structurelles.",
  must:[["architecture","arm","amd64","plateforme"],["variable","config","environnement","secret"]],
  explain:"1) Architecture différente (build ARM sur Mac M-series vs nœuds amd64) → <code>docker buildx --platform</code>. 2) Config/secrets présents en local via un <code>.env</code> absent en cluster. 3) Réseau et DNS : localhost dans un Pod ne désigne pas le même hôte, et un proxy d'entreprise est peut-être obligatoire. 4) Droits : non-root imposé, filesystem read-only, capabilities retirées. 5) Ressources : limites qui déclenchent un OOM absent en local." },

{ id:"n6-tf-01", lvl:6, dom:"Terraform",
  q:"Un <code>apply</code> a échoué à mi-chemin. Dans quel état es-tu et comment tu reprends ?",
  accept:["etat partiel","state a jour pour les creees","relancer le plan","tainted"],
  explain:"Terraform écrit le state au fur et à mesure : les ressources créées y figurent, celles en échec non (ou marquées tainted). On ne restaure PAS un ancien state à l'aveugle. On relance un <code>plan</code> pour voir le delta réel, on corrige la cause, on relance l'apply. Si une ressource a été créée mais mal configurée hors du state, on l'importe ou on la supprime manuellement." },

{ id:"n6-tf-02", lvl:6, dom:"Terraform",
  q:"Le plan veut détruire et recréer une ressource critique alors que tu n'as changé qu'un tag. Comment tu investigues ?",
  accept:["forces replacement","attribut immuable","lire le plan","name","lifecycle"],
  explain:"Lire attentivement la ligne <code># forces replacement</code> du plan : un attribut immuable a changé. Causes fréquentes : un nom calculé qui a bougé, un changement de provider modifiant un défaut, un <code>for_each</code> dont la clé a changé, une valeur qui n'était pas connue au plan. Parades : <code>ignore_changes</code>, bloc <code>moved</code>, ou <code>prevent_destroy</code> pour se protéger le temps de comprendre." },

{ id:"n6-tf-03", lvl:6, dom:"Terraform",
  q:"Quelqu'un a supprimé une ressource à la main dans la console. Que fait Terraform au prochain plan et quelles options as-tu ?",
  accept:["la recree","refresh","detecte l absence","state rm"],
  explain:"Au refresh, Terraform constate l'absence et propose de la RECRÉER (elle est dans le code, pas dans le réel). Options : laisser recréer si c'est du stateless ; si la ressource a été remplacée par une autre créée à la main, l'importer à la place ; si on abandonne sa gestion, <code>state rm</code> + suppression du code. Le vrai correctif est organisationnel : retirer les droits d'écriture manuels." },

{ id:"n6-cicd-01", lvl:6, dom:"CI/CD",
  q:"Le pipeline passe mais le déploiement casse en prod uniquement. Quelles hypothèses testes-tu ?",
  must:[["config","variable","secret","environnement"],["donnee","volume","echelle","reseau"]],
  explain:"1) Écart de configuration (variables, secrets, feature flags, endpoints) — le plus fréquent. 2) Écart de données : volumétrie, jeux réels, migrations non appliquées. 3) Écart d'infrastructure : réseau, proxy, certificats, quotas, versions de la plateforme. 4) Écart d'échelle : concurrence, timeouts, limites de connexions. Parade structurelle : environnements iso-produits par IaC et smoke tests post-déploiement." },

{ id:"n6-cicd-02", lvl:6, dom:"CI/CD",
  q:"Comment fais-tu un rollback propre quand la nouvelle version a déjà migré la base ?",
  accept:["migration retrocompatible","pas de rollback de schema","roll forward","expand contract"],
  explain:"On ne « dé-migre » pas une base en prod : le rollback du schéma est risqué et souvent impossible sans perte. La bonne réponse : les migrations doivent être rétrocompatibles (expand/contract), donc on peut redéployer l'ancien binaire sur le nouveau schéma. Si ce n'est pas le cas, on fait du roll-FORWARD (correctif rapide) et on garde la restauration de sauvegarde comme dernier recours assumé." },

{ id:"n6-aws-01", lvl:6, dom:"AWS",
  q:"Une instance EC2 dans un subnet public ne répond pas en SSH. Déroule ton diagnostic.",
  must:[["security group"],["route","igw","ip publique"]],
  explain:"1) L'instance a-t-elle une IP publique/EIP ? 2) Route table du subnet : <code>0.0.0.0/0 → igw</code> ? 3) SG entrant : port 22 depuis ton IP ? 4) NACL : allow entrant sur 22 ET sortant sur les ports éphémères ? 5) L'instance est-elle passée en running avec ses status checks OK ? 6) sshd démarré (console série / Session Manager) ? 7) Bonne clé et bon utilisateur (ec2-user vs ubuntu) ?" },

{ id:"n6-aws-02", lvl:6, dom:"AWS",
  q:"Vos coûts AWS ont doublé ce mois-ci. Comment identifies-tu la cause ?",
  accept:["cost explorer","tags","par service","anomaly detection","cur"],
  explain:"Cost Explorer avec regroupement par service, puis par usage type et par tag/compte pour isoler l'équipe. Cost Anomaly Detection pour la date de bascule. Suspects classiques : transfert de données sortant et inter-AZ, NAT Gateway au Go, volumes EBS et snapshots orphelins, logs CloudWatch en rétention infinie, instances oubliées en dev, S3 sans lifecycle. Ensuite : tags obligatoires par policy et budgets avec alertes." },

{ id:"n6-az-01", lvl:6, dom:"Azure",
  q:"Une App Service n'arrive pas à joindre une base derrière un Private Endpoint. Quelles causes ?",
  must:[["vnet integration","integration"],["dns","private dns"]],
  explain:"1) L'App Service n'est pas intégrée au VNet (VNet Integration régionale absente ou plan non éligible). 2) La résolution DNS : sans la Private DNS Zone liée au VNet et sans <code>WEBSITE_DNS_SERVER</code>/<code>vnetRouteAllEnabled</code>, le FQDN résout encore vers l'IP publique. 3) NSG/UDR bloquant le subnet d'intégration. 4) Le pare-feu de la base refuse encore le réseau." },

{ id:"n6-az-02", lvl:6, dom:"Azure",
  q:"Un déploiement ARM/Bicep échoue en <code>Conflict</code> ou <code>ResourceGroupBeingDeleted</code>. Que comprends-tu du plan de contrôle Azure ?",
  accept:["asynchrone","operation en cours","verrou","eventual","attendre"],
  explain:"Le plan de contrôle Azure (ARM) est asynchrone et sérialise les opérations sur une même ressource : une opération encore en cours provoque un Conflict. Il faut attendre/retry avec backoff, éviter les apply concurrents sur un même RG, tenir compte de la cohérence à terme (une ressource peut apparaître avant d'être réellement utilisable) et des Resource Locks (CanNotDelete/ReadOnly)." },

{ id:"n6-obs-01", lvl:6, dom:"Observabilité",
  q:"Tu reçois une alerte « latence p99 élevée » sans autre information. Comment tu conduis l'investigation ?",
  must:[["dashboard","metrique","trace"],["deploiement","changement","recent"]],
  explain:"1) Qu'est-ce qui a CHANGÉ récemment (déploiement, feature flag, config, montée de trafic) — 80 % des incidents. 2) Est-ce global ou localisé (une région, un endpoint, un client) ? 3) Ouvrir une trace lente : quel span domine ? 4) Corréler avec les saturations (CPU, pool de connexions, base, dépendance externe). 5) Décider : mitiger d'abord (rollback, scale, circuit breaker), comprendre ensuite." },

{ id:"n6-obs-02", lvl:6, dom:"Observabilité",
  q:"Tes coûts de logs explosent. Comment réduis-tu sans perdre la capacité de diagnostic ?",
  accept:["echantillonnage","retention","niveau de log","filtrer","cardinalite","tiering"],
  explain:"Rétention différenciée (7 j chaud / 90 j froid / archive), échantillonnage des traces et des logs de succès en gardant 100 % des erreurs, suppression des logs de debug en prod, réduction de la CARDINALITÉ des labels (jamais d'ID utilisateur en label de métrique), agrégation en métriques pour ce qui n'a pas besoin du détail, et filtrage au niveau de l'agent plutôt qu'à l'ingestion." },

{ id:"n6-sec-01", lvl:6, dom:"Sécurité",
  q:"Une clé d'accès AWS a fuité sur GitHub. Décris ta procédure d'incident, dans l'ordre.",
  must:[["desactiver","revoquer","supprimer la cle"],["cloudtrail","audit","investiguer"]],
  explain:"1) Désactiver puis supprimer la clé immédiatement (ne pas juste retirer le commit). 2) Faire tourner tout secret associé. 3) CloudTrail : inventorier ce qui a été fait avec cette clé, sur quelle période, depuis quelles IP. 4) Chercher la persistance (nouveaux users/rôles/clés, règles modifiées, instances lancées). 5) Nettoyer l'historique Git. 6) Post-mortem : pourquoi une clé statique existait, mettre en place la détection de secrets et l'OIDC." },

{ id:"n6-sec-02", lvl:6, dom:"Sécurité",
  q:"Un scan remonte 200 CVE sur une image. Comment tu priorises ?",
  must:[["exploitabilite","severite","cvss","critique"],["accessible","exposition","exploit connu"]],
  explain:"On ne traite pas par volume mais par risque réel : sévérité ET exploitabilité (KEV/EPSS, exploit public), présence réelle du composant dans le chemin d'exécution, exposition du service (internet vs interne), et disponibilité d'un correctif. Beaucoup de CVE viennent de l'image de base : changer pour une base minimale (distroless, chainguard) en élimine souvent la majorité d'un coup." },

{ id:"n6-sre-01", lvl:6, dom:"SRE",
  q:"Une panne est en cours et personne ne sait qui décide. Comment organises-tu la gestion d'incident ?",
  must:[["incident commander","responsable","pilote"],["communication","role"]],
  explain:"Rôles explicites : un Incident Commander qui décide et ne met pas les mains dans le clavier, des Operations qui investiguent, un Communications Lead qui informe métier et direction, un Scribe qui horodate. Un canal unique, un point de situation régulier, la priorité à la MITIGATION avant la compréhension, et le post-mortem blameless sous 48 h avec des actions assignées et datées." },

{ id:"n6-sre-02", lvl:6, dom:"SRE",
  q:"Qu'est-ce qu'un thundering herd / retry storm, et comment l'évites-tu ?",
  accept:["retry simultane","backoff","jitter","amplification","surcharge"],
  explain:"Après une panne, tous les clients retentent en même temps et achèvent le service qui redémarre. Parades : backoff EXPONENTIEL avec JITTER aléatoire, budget de retry global, circuit breaker, limitation de débit côté serveur, démarrage progressif (slow start), et cache/valeur dégradée pour absorber. Le jitter est le détail que les candidats oublient — c'est lui qui casse la synchronisation." },

{ id:"n6-sql-01", lvl:6, dom:"SQL",
  q:"La base est saturée en connexions alors que le trafic est normal. Quelles causes et quel correctif ?",
  accept:["pool","connexions non fermees","pgbouncer","fuite","trop d instances"],
  explain:"Causes : absence de pool ou pool surdimensionné multiplié par le nombre de réplicas applicatifs, connexions non relâchées (transactions ouvertes, fuite), timeouts trop longs. Correctif : dimensionner le pool en fonction du nombre total d'instances, un proxy de connexions (PgBouncer, RDS Proxy), des timeouts d'inactivité, et surveiller les sessions <code>idle in transaction</code>." },

{ id:"n6-res-01", lvl:6, dom:"Réseau",
  q:"Un appel HTTPS échoue avec une erreur de certificat côté serveur uniquement. Quelles causes ?",
  accept:["chaine incomplete","intermediaire","ca d entreprise","truststore","sni","expire"],
  explain:"1) Chaîne incomplète : le serveur ne renvoie pas le certificat intermédiaire — un navigateur peut compenser, pas un client Java/Go. 2) CA d'entreprise absente du truststore du conteneur (fréquent derrière un proxy d'inspection TLS en banque). 3) SNI manquant sur un hôte mutualisé. 4) Certificat expiré, ou nom qui ne correspond pas. On vérifie avec <code>openssl s_client -connect host:443 -showcerts</code>." }

]);
