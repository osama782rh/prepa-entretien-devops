window.QBANK = (window.QBANK || []).concat([
/* ============ NIVEAU 2 — SÉRIE B ============ */

{ id:"b2-linux-01", lvl:2, dom:"Linux",
  q:"Comment lances-tu un processus qui survit à la fermeture de ta session SSH ?",
  accept:["nohup","tmux","screen","systemd-run","disown"],
  explain:"<code>nohup cmd &amp;</code>, ou mieux <code>tmux</code>/<code>screen</code> pour pouvoir revenir dessus, ou <code>systemd-run --user</code>. Sans ça, la fermeture du terminal envoie SIGHUP au groupe de processus et tue le job. En production, la vraie réponse est : une unité systemd, pas un nohup." },

{ id:"b2-linux-02", lvl:2, dom:"Linux",
  q:"Que fait <code>tail -f</code> et quelle est sa limite avec la rotation de logs ?",
  accept:["suit le fichier","perd le fichier","tail -F","rotation","inode"],
  explain:"<code>-f</code> suit le descripteur : après une rotation, il continue de lire l'ANCIEN fichier renommé et n'affiche plus rien. <code>tail -F</code> suit le NOM et rouvre le fichier après rotation. Détail qui trahit l'expérience terrain." },

{ id:"b2-linux-03", lvl:2, dom:"Linux",
  q:"Comment vois-tu l'espace disque ET les inodes, et pourquoi les deux ?",
  must:[["df -h"],["df -i","inode"]],
  explain:"<code>df -h</code> pour les octets, <code>df -i</code> pour les inodes. On peut avoir 90 % d'espace libre et 100 % d'inodes utilisés : typiquement des millions de petits fichiers (sessions PHP, caches, messages). Le symptôme est un « No space left on device » incompréhensible." },

{ id:"b2-linux-04", lvl:2, dom:"Linux",
  q:"À quoi sert <code>cron</code> et quelle est la première cause d'échec d'un job cron qui marche en manuel ?",
  accept:["environnement","path","variables","pas le meme shell"],
  explain:"cron planifie des tâches récurrentes. Cause n°1 d'échec : l'environnement minimal — PATH réduit, pas de variables du <code>.bashrc</code>, pas de HOME identique. Correctif : chemins absolus partout, variables déclarées explicitement, et rediriger stdout/stderr vers un fichier pour voir l'erreur." },

{ id:"b2-linux-05", lvl:2, dom:"Linux",
  q:"Quelle différence entre <code>su</code>, <code>su -</code> et <code>sudo</code> ?",
  accept:["environnement de connexion","sudo journalise","par commande","login shell"],
  explain:"<code>su</code> change d'utilisateur en gardant l'environnement courant ; <code>su -</code> ouvre un login shell complet (PATH, HOME, profil de la cible). <code>sudo</code> élève les privilèges commande par commande, avec journalisation et politique fine dans sudoers — c'est le seul acceptable en production auditée." },

{ id:"b2-git-01", lvl:2, dom:"Git",
  q:"Comment résous-tu un conflit de merge ? Décris les étapes.",
  accept:["editer les marqueurs","git add","git merge --continue","choisir"],
  explain:"Git marque les zones en conflit (<code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code>, <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code>). On édite le fichier pour produire le résultat voulu (pas juste choisir un côté), on retire les marqueurs, <code>git add</code> le fichier, puis <code>git merge --continue</code>. <code>git merge --abort</code> pour tout annuler. Le vrai remède est en amont : petites branches et intégration fréquente." },

{ id:"b2-git-02", lvl:2, dom:"Git",
  q:"À quoi sert un tag Git et quelle différence entre tag léger et tag annoté ?",
  accept:["marquer une version","annote contient","objet","signature","metadonnees"],
  explain:"Un tag marque un point de l'historique (une release). Le tag léger est un simple pointeur ; le tag annoté est un OBJET Git avec auteur, date, message et possibilité de signature GPG. En production on utilise des tags annotés et signés — c'est ce qui rend la release auditable." },

{ id:"b2-git-03", lvl:2, dom:"Git",
  q:"Que fait <code>git push --force-with-lease</code> et pourquoi le préférer à <code>--force</code> ?",
  accept:["verifie","refuse si quelqu un a pousse","protege","etat attendu"],
  explain:"<code>--force</code> écrase le distant quoi qu'il arrive, y compris le travail poussé par un collègue entre-temps. <code>--force-with-lease</code> vérifie d'abord que le distant est bien à l'état que tu as observé, et refuse sinon. C'est le réflexe qui évite d'effacer le travail des autres." },

{ id:"b2-docker-01", lvl:2, dom:"Docker",
  q:"Différence entre <code>docker exec</code> et <code>docker attach</code> ?",
  accept:["nouveau processus","processus principal","pid 1","shell separe"],
  explain:"<code>exec</code> lance un NOUVEAU processus dans le conteneur (typiquement un shell) — c'est ce qu'on veut pour déboguer, et sortir ne tue rien. <code>attach</code> se branche sur le processus PID 1 existant : un Ctrl+C peut arrêter le conteneur." },

{ id:"b2-docker-02", lvl:2, dom:"Docker",
  q:"À quoi sert Docker Compose et quelle est sa limite en production ?",
  accept:["plusieurs conteneurs","dev","un seul hote","pas d orchestration","pas de ha"],
  explain:"Il décrit et lance plusieurs conteneurs liés (app + base + cache) sur UNE machine. Limite : pas de haute disponibilité, pas de scheduling multi-nœuds, pas de self-healing réel, pas de rolling update sûr. C'est excellent en dev et en test, ce n'est pas un orchestrateur de production." },

{ id:"b2-docker-03", lvl:2, dom:"Docker",
  q:"Que fait un HEALTHCHECK Docker et à quoi ça correspond dans Kubernetes ?",
  accept:["verifie la sante","readiness","liveness","statut unhealthy"],
  explain:"Il exécute périodiquement une commande dans le conteneur pour marquer son état (healthy/unhealthy), ce que Compose et Swarm exploitent. L'équivalent Kubernetes, ce sont les probes (liveness/readiness/startup) — et K8s ignore le HEALTHCHECK de l'image : il faut définir les probes." },

{ id:"b2-k8s-01", lvl:2, dom:"Kubernetes",
  q:"Quelle est la différence entre un Job et un CronJob ?",
  accept:["ponctuel","planifie","recurrent","schedule"],
  explain:"Un Job exécute un traitement jusqu'à complétion (avec <code>completions</code>, <code>parallelism</code>, <code>backoffLimit</code>). Un CronJob crée des Jobs selon une planification cron. Pièges du CronJob : <code>concurrencyPolicy</code> (que faire si le précédent tourne encore) et l'historique conservé qui remplit le namespace." },

{ id:"b2-k8s-02", lvl:2, dom:"Kubernetes",
  q:"Qu'est-ce qu'un initContainer et à quoi ça sert concrètement ?",
  accept:["avant les conteneurs","sequentiel","attendre","preparer","migration"],
  explain:"Un conteneur qui s'exécute jusqu'à son terme AVANT les conteneurs principaux, séquentiellement. Usages : attendre qu'une dépendance soit prête, appliquer une migration de base, récupérer un fichier de config ou un secret, ajuster des permissions sur un volume. S'il échoue, le Pod redémarre." },

{ id:"b2-k8s-03", lvl:2, dom:"Kubernetes",
  q:"Comment injectes-tu la valeur d'un ConfigMap dans un conteneur ? Cite les deux méthodes et leur différence majeure.",
  must:[["variable d environnement","env"],["volume","fichier","monte"]],
  explain:"1) En variables d'environnement (<code>envFrom</code> / <code>valueFrom</code>) : simple, mais figé au démarrage — modifier le ConfigMap n'a aucun effet sans redémarrage. 2) Monté en volume : les fichiers sont mis à jour automatiquement (avec un délai), ce qui permet le rechargement à chaud si l'application le gère." },

{ id:"b2-k8s-04", lvl:2, dom:"Kubernetes",
  q:"À quoi sert <code>kubectl rollout undo</code> et jusqu'où peut-on remonter ?",
  accept:["revenir a la version precedente","revisionhistorylimit","historique","rollback"],
  explain:"Il revient à la révision précédente du Deployment (ou à une révision précise avec <code>--to-revision</code>). L'historique conservé est limité par <code>revisionHistoryLimit</code> (10 par défaut) : au-delà, les anciens ReplicaSets sont supprimés et le rollback n'est plus possible." },

{ id:"b2-k8s-05", lvl:2, dom:"Kubernetes",
  q:"Que fait <code>kubectl port-forward</code> et pourquoi ce n'est pas une solution d'exposition ?",
  accept:["tunnel local","depuis ton poste","temporaire","un seul pod","debug"],
  explain:"Il ouvre un tunnel depuis ta machine vers un Pod ou un Service, via l'API server. C'est un outil de DEBUG : mono-utilisateur, éphémère, dépendant de ta session et de tes droits API. Exposer un service se fait par Service + Ingress." },

{ id:"b2-tf-01", lvl:2, dom:"Terraform",
  q:"À quoi sert un <code>output</code> et comment le récupère-t-on en dehors de Terraform ?",
  accept:["exposer une valeur","terraform output","json","module appelant"],
  explain:"Il expose une valeur calculée : au module appelant, ou à l'utilisateur. On le récupère avec <code>terraform output -raw nom</code> ou <code>-json</code> pour un pipeline. Marquer <code>sensitive = true</code> masque la valeur dans les logs — mais elle reste en clair dans le state." },

{ id:"b2-tf-02", lvl:2, dom:"Terraform",
  q:"Quelle est la différence entre <code>~&gt; 4.0</code> et <code>&gt;= 4.0</code> dans une contrainte de version ?",
  accept:["pessimiste","autorise 4.x","bloque la majeure","tout ce qui est superieur"],
  explain:"<code>~&gt; 4.0</code> (opérateur pessimiste) autorise 4.1, 4.9 mais PAS 5.0 : on se protège des breaking changes majeurs. <code>&gt;= 4.0</code> accepte tout, y compris une v5 qui casse ta configuration du jour au lendemain. En production : toujours borner." },

{ id:"b2-tf-03", lvl:2, dom:"Terraform",
  q:"Comment gères-tu une valeur conditionnelle en Terraform (créer une ressource seulement en prod) ?",
  accept:["count = var","condition","ternaire","0 ou 1"],
  explain:"<code>count = var.environnement == \"prod\" ? 1 : 0</code>, puis on référence <code>ressource[0]</code>. Attention : la référence doit alors être protégée (<code>try()</code> ou <code>one()</code>) quand count vaut 0. Pour plusieurs objets conditionnels, préférer un <code>for_each</code> sur une map filtrée." },

{ id:"b2-tf-04", lvl:2, dom:"Terraform",
  q:"À quoi servent les fonctions <code>lookup</code>, <code>try</code> et <code>coalesce</code> ?",
  accept:["valeur par defaut","gerer l absence","premiere non nulle","robustesse"],
  explain:"<code>lookup(map, cle, defaut)</code> lit une map avec un repli. <code>try(expr, repli)</code> renvoie le repli si l'expression échoue (attribut absent). <code>coalesce(a, b, c)</code> renvoie la première valeur non nulle/non vide. Ce sont les outils qui rendent un module tolérant aux entrées partielles." },

{ id:"b2-aws-01", lvl:2, dom:"AWS",
  q:"Qu'est-ce qu'un Target Group et quel est son lien avec le health check ?",
  accept:["cibles du load balancer","instances enregistrees","sain","retire du trafic"],
  explain:"C'est l'ensemble des cibles (instances, IP, Lambda, conteneurs) vers lesquelles un ALB/NLB route, avec son propre health check (chemin, seuils, intervalle). Une cible qui échoue est retirée du routage. Un health check mal calibré (trop strict, ou qui teste la base) provoque des retraits en cascade." },

{ id:"b2-aws-02", lvl:2, dom:"AWS",
  q:"Qu'est-ce que le service AWS Systems Manager Session Manager et pourquoi le préférer à SSH ?",
  accept:["pas de port ouvert","sans bastion","journalise","iam","agent"],
  explain:"Il ouvre un shell sur l'instance via l'agent SSM, sans ouvrir le port 22, sans bastion, sans clé à gérer. L'accès est contrôlé par IAM, journalisé dans CloudTrail et la session peut être enregistrée. C'est la réponse attendue sur « comment vous accédez aux serveurs en production »." },

{ id:"b2-aws-03", lvl:2, dom:"AWS",
  q:"Quelle est la différence entre un snapshot RDS automatique et manuel ?",
  accept:["retention","supprime avec l instance","conserve","backup window"],
  explain:"Les snapshots automatiques suivent la fenêtre de sauvegarde et une rétention configurée (0-35 jours) ; ils sont SUPPRIMÉS avec l'instance. Les snapshots manuels sont conservés jusqu'à suppression explicite. Le point de restauration dans le temps (PITR) repose sur les automatiques + les logs de transaction." },

{ id:"b2-az-01", lvl:2, dom:"Azure",
  q:"Comment fonctionnent les priorités de règles dans un NSG ?",
  accept:["numero croissant","premier match","100 a 4096","arrete l evaluation"],
  explain:"Les règles sont évaluées par priorité croissante (100 → 4096) et la PREMIÈRE qui correspond s'applique, l'évaluation s'arrête. Il existe des règles par défaut en fin de liste (autoriser le trafic intra-VNet, refuser le reste en entrée). Piège classique : une règle Allow à 300 qui ne sert jamais parce qu'un Deny existe à 200." },

{ id:"b2-az-02", lvl:2, dom:"Azure",
  q:"Qu'est-ce qu'un Availability Set et un Availability Zone dans Azure ? Différence ?",
  accept:["domaine de panne","fault domain","rack","zone = datacenter","physiquement separe"],
  explain:"L'Availability Set répartit les VM sur des fault domains et update domains DANS un même datacenter (protège d'une panne de rack ou d'une maintenance). Les Availability Zones répartissent sur des datacenters physiquement distincts de la région — protection bien supérieure. Les deux ne se combinent pas." },

{ id:"b2-az-03", lvl:2, dom:"Azure",
  q:"À quoi sert Azure Resource Graph ?",
  accept:["requeter l inventaire","kql","toutes les subscriptions","recherche rapide"],
  explain:"Il permet d'interroger en KQL l'inventaire de TOUTES tes ressources sur toutes les subscriptions, très rapidement — là où l'API ARM classique est lente et paginée. C'est l'outil pour répondre à « combien de VM sans tag Owner sur tout le tenant ? » en quelques secondes." },

{ id:"b2-res-01", lvl:2, dom:"Réseau",
  q:"À quoi sert un CDN et quel problème résout-il exactement ?",
  accept:["latence","proche de l utilisateur","cache","edge","charge"],
  explain:"Il met en cache le contenu sur des points de présence proches géographiquement des utilisateurs. Il réduit la latence (la vitesse de la lumière ne se négocie pas), décharge l'origine, absorbe les pics et sert souvent de première ligne WAF/anti-DDoS. Point clé : bien définir ce qui est cacheable et la stratégie d'invalidation." },

{ id:"b2-res-02", lvl:2, dom:"Réseau",
  q:"Qu'est-ce qu'un keep-alive HTTP et pourquoi ça change les performances ?",
  accept:["reutilise la connexion","evite le handshake","persistante","cout tcp tls"],
  explain:"Il réutilise la même connexion TCP/TLS pour plusieurs requêtes, au lieu de refaire handshake TCP + handshake TLS à chaque fois (plusieurs allers-retours). Sur une liaison à 50 ms de RTT, ça peut diviser le temps de réponse par deux. HTTP/2 va plus loin avec le multiplexage sur une seule connexion." },

{ id:"b2-cicd-01", lvl:2, dom:"CI/CD",
  q:"Qu'est-ce qu'un cache de pipeline et quel est le risque de mal le configurer ?",
  accept:["dependances","accelere","cache empoisonne","cle de cache","resultat faux"],
  explain:"Il conserve des dépendances entre exécutions pour accélérer le build. Risques : une clé de cache trop large donne des builds non reproductibles ou masque une régression ; un cache partagé entre projets ou entre branches non fiables est un vecteur d'empoisonnement. La clé doit dériver du hash du lockfile." },

{ id:"b2-cicd-02", lvl:2, dom:"CI/CD",
  q:"Quelle différence entre un artefact et une image de conteneur dans un pipeline ?",
  accept:["binaire","package","image = artefact executable","registry"],
  explain:"L'artefact est le livrable brut du build (jar, wheel, binaire, bundle). L'image de conteneur est un format d'artefact qui embarque en plus le runtime et les dépendances système, stocké dans un registry. Dans les deux cas : versionné, immuable, produit UNE fois puis promu." },

{ id:"b2-sec-01", lvl:2, dom:"Sécurité",
  q:"Pourquoi ne jamais logger le contenu d'un token ou d'un mot de passe, même en debug ?",
  accept:["logs centralises","conserves","sauvegarde","exfiltration","rgpd"],
  explain:"Les logs partent dans un SIEM, sont dupliqués, sauvegardés longtemps et accessibles à beaucoup plus de personnes que la production. Un secret loggué une fois est un secret compromis, à révoquer. Même logique pour les données personnelles (RGPD sur les logs et les sauvegardes)." },

{ id:"b2-sec-02", lvl:2, dom:"Sécurité",
  q:"Qu'est-ce qu'un scan de vulnérabilités d'image, et pourquoi le rejouer périodiquement ?",
  accept:["nouvelles cve","apparaissent apres","image inchangee","veille"],
  explain:"Il compare les paquets de l'image à des bases de CVE. Il faut le rejouer parce que de nouvelles vulnérabilités sont publiées APRÈS le build : une image scannée propre il y a trois mois peut être critique aujourd'hui, sans avoir changé d'un octet. D'où le scan continu au niveau du registry." },

{ id:"b2-obs-01", lvl:2, dom:"Observabilité",
  q:"Que signifie le fait qu'un compteur Prometheus soit toujours utilisé avec <code>rate()</code> ?",
  accept:["croissant","valeur brute inutile","par seconde","gere les reset"],
  explain:"Un counter ne fait qu'augmenter : sa valeur brute (« 4 823 191 requêtes depuis le démarrage ») n'a aucun intérêt. <code>rate()</code> calcule la variation par seconde sur une fenêtre et gère automatiquement les remises à zéro lors d'un redémarrage du process." },

{ id:"b2-obs-02", lvl:2, dom:"Observabilité",
  q:"Pourquoi faut-il horodater les logs en UTC avec le fuseau explicite ?",
  accept:["correlation","fuseau","ambiguite","heure d ete","ordre"],
  explain:"Pour corréler des événements entre serveurs, régions et services pendant un incident. Les heures locales créent des ambiguïtés (changement d'heure, machines mal réglées) et rendent l'ordre des événements impossible à établir — exactement au moment où on en a le plus besoin." },

{ id:"b2-sre-01", lvl:2, dom:"SRE",
  q:"Qu'est-ce qu'un runbook et en quoi diffère-t-il d'une documentation d'architecture ?",
  accept:["procedure","pendant l incident","actionnable","etapes","symptome"],
  explain:"Le runbook part d'un SYMPTÔME observé et donne les commandes exactes à exécuter, comment vérifier l'effet et quand escalader. La documentation d'architecture explique comment le système est construit. Pendant un incident à 3 h du matin, on a besoin du premier, pas du second." },

{ id:"b2-sql-01", lvl:2, dom:"SQL",
  q:"Que fait <code>GROUP BY</code> et quelle erreur classique commet-on avec ?",
  accept:["regroupe","agregat","colonne non agregee","select"],
  explain:"Il regroupe les lignes partageant les mêmes valeurs pour appliquer des fonctions d'agrégation. Erreur classique : sélectionner une colonne qui n'est ni dans le GROUP BY ni agrégée — PostgreSQL refuse, MySQL en mode permissif renvoie une valeur arbitraire, ce qui donne des résultats faux silencieusement." }

]);
