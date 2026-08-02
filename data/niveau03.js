window.QBANK = (window.QBANK || []).concat([
/* ================= NIVEAU 3 — USAGE QUOTIDIEN ================= */

{ id:"n3-linux-01", lvl:3, dom:"Linux",
  q:"La load average affiche <code>8.0</code> sur une machine à 4 cœurs. Est-ce forcément un problème CPU ?",
  accept:["non","iowait","attente disque","entrees sorties","uninterruptible","d state"],
  explain:"Non : sous Linux, la load compte les processus runnable ET ceux en attente ininterruptible (I/O disque, NFS). Une load de 8 sur 4 cœurs avec un CPU à 10 % = saturation I/O. Il faut croiser avec <code>%iowait</code> (<code>top</code>, <code>vmstat</code>, <code>iostat</code>)." },

{ id:"n3-linux-02", lvl:3, dom:"Linux",
  q:"Comment rendre un service persistant après reboot avec systemd, et comment lire ses logs ?",
  must:[["enable"],["journalctl"]],
  explain:"<code>systemctl enable --now mon.service</code> (enable = au boot, --now = démarre tout de suite). Logs : <code>journalctl -u mon.service -f</code>, avec <code>--since</code>, <code>-p err</code> pour filtrer la sévérité. <code>enable</code> sans <code>start</code> ne lance rien maintenant : piège classique." },

{ id:"n3-linux-03", lvl:3, dom:"Linux",
  q:"Quelle est la différence entre un hard link et un symlink ?",
  accept:["meme inode","pointe vers un chemin","lien cassé","traverse les systemes de fichiers","reference"],
  explain:"Un hard link est une seconde entrée de répertoire vers le MÊME inode : supprimer l'original ne casse rien, le contenu vit tant qu'il reste un lien. Un symlink stocke un CHEMIN : il devient un lien mort si la cible disparaît, mais peut traverser les systèmes de fichiers et pointer un répertoire." },

{ id:"n3-linux-04", lvl:3, dom:"Linux",
  q:"Que fait <code>grep -rn \"erreur\" . | awk '{print $1}' | sort | uniq -c | sort -rn</code> ?",
  accept:["compte","occurrences par fichier","classe","top fichiers"],
  explain:"Recherche récursive avec numéros de ligne, extraction du premier champ (fichier:ligne), tri, comptage des doublons puis tri décroissant : on obtient le classement des fichiers les plus bruyants. Le <code>sort</code> avant <code>uniq</code> est obligatoire — <code>uniq</code> ne dédoublonne que des lignes adjacentes." },

{ id:"n3-linux-05", lvl:3, dom:"Linux",
  q:"Différence entre <code>$@</code> et <code>$*</code> dans un script bash, et pourquoi les guillemets comptent ?",
  accept:["arguments separes","une seule chaine","preserve les espaces","tableau"],
  explain:"<code>\"$@\"</code> développe chaque argument comme un mot distinct (préserve les espaces dans les arguments) ; <code>\"$*\"</code> les concatène en une seule chaîne. Règle : toujours <code>\"$@\"</code> pour relayer des arguments." },

{ id:"n3-git-01", lvl:3, dom:"Git",
  q:"Explique le workflow GitFlow et pourquoi beaucoup d'équipes lui préfèrent le trunk-based.",
  accept:["branches longues","develop release hotfix","merges douloureux","integration continue","branches courtes"],
  explain:"GitFlow : main + develop + feature/release/hotfix. Rigoureux mais les branches vivent longtemps → gros merges, intégration tardive, feedback lent. Le trunk-based garde des branches de quelques heures fusionnées dans main, avec feature flags pour cacher l'inachevé : c'est ce qui rend la CI réellement continue." },

{ id:"n3-git-02", lvl:3, dom:"Git",
  q:"Tu as fait un <code>git reset --hard</code> et perdu deux commits. Récupérable ?",
  accept:["reflog","git reflog","oui"],
  explain:"Oui : <code>git reflog</code> conserve l'historique local des positions de HEAD (~90 jours par défaut). Tu retrouves le SHA puis <code>git reset --hard &lt;sha&gt;</code> ou <code>git cherry-pick</code>. Ne fonctionne que localement et seulement pour du travail déjà commité." },

{ id:"n3-git-03", lvl:3, dom:"Git",
  q:"À quoi sert <code>git cherry-pick</code> et quel est son principal inconvénient ?",
  accept:["un commit precis","copie","duplique","autre hash","doublon a la fusion"],
  explain:"Il rejoue un commit précis sur une autre branche (typiquement un hotfix vers une branche de release). Inconvénient : ça DUPLIQUE le changement avec un hash différent — au moment de fusionner les branches, on peut se retrouver avec des conflits ou une double application." },

{ id:"n3-docker-01", lvl:3, dom:"Docker",
  q:"Pourquoi faire tourner un conteneur en non-root, et comment ?",
  accept:["useradd","user","reduire l impact","escalade","uid"],
  explain:"Pour limiter l'impact d'une évasion ou d'une RCE : root dans le conteneur = souvent root sur l'hôte si le user namespace n'est pas remappé. On crée un utilisateur dans le Dockerfile puis <code>USER 10001</code>, et côté K8s <code>runAsNonRoot: true</code>, <code>readOnlyRootFilesystem: true</code>, <code>drop ALL capabilities</code>." },

{ id:"n3-docker-02", lvl:3, dom:"Docker",
  q:"Différence entre un bind mount et un volume nommé ?",
  accept:["chemin de l hote","gere par docker","portable","dependance au chemin"],
  explain:"Bind mount = un chemin de l'hôte monté dans le conteneur : pratique en dev, mais dépendant de l'arborescence de la machine et des permissions. Volume nommé = géré par Docker dans son espace, portable, sauvegardable, pilotable par des drivers (NFS, cloud). En prod : volume ou stockage externe." },

{ id:"n3-docker-03", lvl:3, dom:"Docker",
  q:"Ton conteneur ne s'arrête pas avec <code>docker stop</code> et met 10 s. Pourquoi ?",
  accept:["pid 1","ne recoit pas le signal","shell form","sigterm ignore","exec form"],
  explain:"Le process PID 1 ne gère pas SIGTERM. Typiquement parce que le CMD est en forme shell : c'est <code>/bin/sh -c</code> qui est PID 1 et il ne relaie pas les signaux. Solution : forme exec (JSON), un init léger (<code>tini</code>, <code>--init</code>) ou un handler de signal dans l'app. Après le timeout, Docker envoie SIGKILL." },

{ id:"n3-k8s-01", lvl:3, dom:"Kubernetes",
  q:"Un Pod reste en <code>Pending</code>. Cite trois causes possibles et comment tu les distingues.",
  must:[["ressource","cpu","memoire","insufficient"],["describe","event"]],
  explain:"<code>kubectl describe pod</code> et on lit les Events : 1) pas de nœud avec assez de CPU/mémoire, 2) taints sans toleration / nodeSelector ou affinity impossible à satisfaire, 3) PVC non lié (pas de StorageClass ou pas de volume dispo). Plus rare : quota de namespace atteint." },

{ id:"n3-k8s-02", lvl:3, dom:"Kubernetes",
  q:"Différence entre <code>CrashLoopBackOff</code> et <code>ImagePullBackOff</code> ?",
  accept:["demarre et plante","image introuvable","registry","droits de pull","redemarrage en boucle"],
  explain:"CrashLoopBackOff : le conteneur démarre puis se termine en boucle — bug applicatif, config manquante, liveness trop stricte ; on lit <code>kubectl logs --previous</code>. ImagePullBackOff : l'image n'a pas pu être téléchargée — tag inexistant, registry privé sans imagePullSecret, ou problème réseau/proxy." },

{ id:"n3-k8s-03", lvl:3, dom:"Kubernetes",
  q:"Différence entre requests et limits, et laquelle sert au scheduling ?",
  accept:["requests pour le scheduling","limits plafond","garantie","oomkill","throttle"],
  explain:"Les <code>requests</code> sont ce que le scheduler réserve pour placer le Pod (garantie minimale). Les <code>limits</code> sont un plafond : dépassement CPU = throttling, dépassement mémoire = OOMKill immédiat. La mémoire n'est pas compressible, contrairement au CPU." },

{ id:"n3-k8s-04", lvl:3, dom:"Kubernetes",
  q:"Quels sont les types de Service et à quoi sert chacun ?",
  must:[["clusterip"],["nodeport"],["loadbalancer"]],
  explain:"ClusterIP (défaut) : IP interne au cluster. NodePort : ouvre un port (30000-32767) sur chaque nœud. LoadBalancer : provisionne un LB cloud qui pointe vers le NodePort. ExternalName : simple alias DNS CNAME. En prod on expose plutôt via un Ingress/Gateway devant un seul LoadBalancer." },

{ id:"n3-k8s-05", lvl:3, dom:"Kubernetes",
  q:"Différence entre un Deployment et un StatefulSet ?",
  accept:["identite stable","nom ordonne","pvc par pod","ordre de demarrage","dns stable"],
  explain:"Le Deployment traite ses Pods comme du bétail interchangeable (noms aléatoires, ordre quelconque). Le StatefulSet donne une identité stable : noms ordinaux (<code>db-0</code>, <code>db-1</code>), DNS stable via un headless Service, un PVC dédié par Pod, démarrage/arrêt ordonnés. Pour les bases, brokers, clusters à quorum." },

{ id:"n3-tf-01", lvl:3, dom:"Terraform",
  q:"Explique la différence entre <code>count</code> et <code>for_each</code> et pourquoi ça compte au moment d'une suppression.",
  accept:["index","cle","decalage","recree","identifiant stable"],
  explain:"<code>count</code> indexe par position : supprimer l'élément 1 sur 3 décale tout et Terraform veut détruire/recréer les suivants. <code>for_each</code> indexe par CLÉ (map ou set) : chaque ressource a une adresse stable, la suppression n'affecte que l'entrée concernée. Règle : for_each dès que les éléments sont distincts." },

{ id:"n3-tf-02", lvl:3, dom:"Terraform",
  q:"Comment intégrer dans Terraform une ressource déjà créée à la main ?",
  accept:["terraform import","import block","importer"],
  explain:"<code>terraform import addr id</code> (ou un bloc <code>import</code> déclaratif depuis la 1.5, qui a l'avantage d'être revu en plan et versionné). L'import ne génère PAS le code : il faut écrire la ressource, importer, puis lancer un plan jusqu'à obtenir « no changes »." },

{ id:"n3-tf-03", lvl:3, dom:"Terraform",
  q:"À quoi servent <code>depends_on</code> et pourquoi l'utilise-t-on rarement ?",
  accept:["dependance explicite","implicite","reference","graphe"],
  explain:"Terraform déduit le graphe de dépendances des RÉFÉRENCES entre ressources — c'est implicite et suffisant à 95 %. <code>depends_on</code> ne sert que pour une dépendance non exprimable par une référence (ex : une policy IAM doit exister avant qu'une app l'utilise). En abuser sérialise inutilement et ralentit l'apply." },

{ id:"n3-tf-04", lvl:3, dom:"Terraform",
  q:"Comment gère-t-on plusieurs environnements (dev/rec/prod) avec Terraform ? Cite deux approches et leurs limites.",
  accept:["workspace","repertoires separes","tfvars","backend distinct"],
  explain:"1) Workspaces : un seul backend, un state par workspace — simple mais même code, même backend, risque d'erreur d'environnement. 2) Répertoires/dépôts séparés avec backends distincts et un module commun paramétré : plus verbeux mais isolation réelle des states et des droits. En banque, on prend presque toujours la 2." },

{ id:"n3-aws-01", lvl:3, dom:"AWS",
  q:"Différence entre un rôle IAM, une policy identity-based et une policy resource-based ?",
  accept:["attachee a l identite","attachee a la ressource","bucket policy","cross account","principal"],
  explain:"Identity-based : attachée à un user/rôle, dit ce que CETTE identité peut faire. Resource-based : attachée à la ressource (bucket policy, KMS key policy, SQS), avec un champ <code>Principal</code> — c'est elle qui permet l'accès cross-compte sans AssumeRole. Une action est autorisée si l'une des deux l'autorise et qu'aucune ne la refuse." },

{ id:"n3-aws-02", lvl:3, dom:"AWS",
  q:"Quelles sont les classes de stockage S3 principales et sur quel critère on choisit ?",
  accept:["standard","infrequent access","glacier","frequence d acces","cout de restitution"],
  explain:"Standard (accès fréquent), Standard-IA / One Zone-IA (rare mais immédiat, coût de récupération), Intelligent-Tiering (bascule automatique), Glacier Instant/Flexible/Deep Archive (archivage, restitution de minutes à heures). Critère : fréquence d'accès et tolérance au délai de restitution. On automatise avec des lifecycle policies." },

{ id:"n3-aws-03", lvl:3, dom:"AWS",
  q:"Différence entre un ALB et un NLB, et quand prend-on un NLB ?",
  accept:["couche 7","couche 4","ip statique","tres haute performance","tcp"],
  explain:"ALB = L7 HTTP/HTTPS : routage par path/host, WAF, authentification, mais IP dynamiques. NLB = L4 : latence ultra-faible, millions de connexions, IP statique par AZ (ou EIP), préserve l'IP source, supporte TCP/UDP et TLS passthrough. On prend le NLB pour du non-HTTP, une IP fixe à whitelister, ou de la performance extrême." },

{ id:"n3-az-01", lvl:3, dom:"Azure",
  q:"Différence entre un NSG et un Azure Firewall ?",
  accept:["couche 3 4","stateful l7","fqdn","service manage","regles reseau"],
  explain:"Le NSG est un filtre L3/L4 gratuit attaché à un subnet ou une NIC (5-tuple, service tags). L'Azure Firewall est un service managé payant, centralisé, avec règles applicatives par FQDN, threat intelligence, SNAT/DNAT et journalisation complète — c'est lui qu'on met en hub dans une topologie hub-and-spoke." },

{ id:"n3-az-02", lvl:3, dom:"Azure",
  q:"À quoi sert un Private Endpoint et quel problème DNS crée-t-il ?",
  accept:["ip privee","sort du reseau public","private dns zone","resolution","vnet"],
  explain:"Il donne une IP PRIVÉE dans ton VNet à un service PaaS (Storage, SQL, Key Vault) : le trafic ne passe plus par internet. Piège : le FQDN public doit désormais résoudre vers l'IP privée — il faut une Private DNS Zone (<code>privatelink.blob.core.windows.net</code>) liée au VNet, sinon on retombe sur l'IP publique." },

{ id:"n3-az-03", lvl:3, dom:"Azure",
  q:"Différence entre Azure Policy et Azure RBAC ?",
  accept:["rbac qui peut faire","policy ce qui est autorise","conformite","proprietes de la ressource","deny"],
  explain:"Le RBAC contrôle QUI peut faire quoi (identité → action). Azure Policy contrôle CE QUI peut exister : elle évalue les propriétés des ressources (deny sans tag, deny hors région autorisée, deployIfNotExists pour forcer des diagnostics). Un Owner reste bloqué par une policy deny." },

{ id:"n3-cicd-01", lvl:3, dom:"CI/CD",
  q:"Pourquoi un runner de CI doit-il être éphémère ?",
  accept:["etat residuel","pollution","reproductible","isolation","secrets residuels"],
  explain:"Pour garantir la reproductibilité et la sécurité : pas de cache pollué, pas de dépendance installée par un job précédent, pas de secrets résiduels dans le filesystem. Un runner persistant devient un point de compromission latérale entre projets — d'où les runners conteneurisés jetables." },

{ id:"n3-cicd-02", lvl:3, dom:"CI/CD",
  q:"Qu'est-ce que le GitOps et qu'est-ce qui le distingue d'un pipeline push classique ?",
  accept:["git source de verite","reconciliation","pull","agent dans le cluster","argocd","flux"],
  explain:"L'état désiré est déclaré dans Git ; un agent DANS le cluster (Argo CD, Flux) tire et réconcilie en continu. Différences avec le push : pas de credentials cluster dans la CI, dérive détectée et corrigée automatiquement, rollback = revert Git, audit natif via l'historique." },

{ id:"n3-sec-01", lvl:3, dom:"Sécurité",
  q:"Comment gères-tu les secrets dans un pipeline CI/CD ? Cite le mécanisme le plus solide.",
  accept:["oidc","federation","coffre","key vault","secrets manager","token court"],
  explain:"Le plus solide : fédération d'identité OIDC entre le fournisseur CI et le cloud — le pipeline échange un token signé contre des credentials temporaires, aucun secret long terme stocké. Sinon : coffre (Key Vault, Secrets Manager, Vault) avec injection au runtime, masquage des logs et rotation." },

{ id:"n3-sec-02", lvl:3, dom:"Sécurité",
  q:"Qu'est-ce qu'un scan SAST, DAST et SCA ? Où les place-t-on dans le pipeline ?",
  must:[["code source","statique"],["execution","application qui tourne","dynamique"],["dependance","librairie","cve"]],
  explain:"SAST = analyse statique du code source (tôt, à chaque commit). SCA = analyse des dépendances et CVE connues (au build, + veille continue). DAST = test dynamique contre l'application déployée (en recette). On complète par le scan d'images et la détection de secrets en pre-commit." },

{ id:"n3-obs-01", lvl:3, dom:"Observabilité",
  q:"Pourquoi alerte-t-on sur les symptômes plutôt que sur les causes ?",
  accept:["impact utilisateur","bruit","trop d alertes","symptome","fatigue"],
  explain:"Alerter sur les causes (CPU à 90 %, un pod redémarré) génère du bruit et de la fatigue d'astreinte alors que le service va peut-être très bien. On alerte sur ce que l'utilisateur subit — latence, taux d'erreur, saturation, trafic (méthode RED/USE) — et on utilise les causes comme éléments de diagnostic dans le dashboard." },

{ id:"n3-sql-01", lvl:3, dom:"SQL",
  q:"Différence entre <code>WHERE</code> et <code>HAVING</code> ?",
  accept:["avant l agregation","apres le group by","filtre les groupes","agregat"],
  explain:"<code>WHERE</code> filtre les lignes AVANT l'agrégation ; <code>HAVING</code> filtre les GROUPES après le <code>GROUP BY</code> et peut donc porter sur une fonction d'agrégation (<code>HAVING COUNT(*) &gt; 5</code>). Pour la performance, filtrer un maximum dans le WHERE." },

{ id:"n3-sre-01", lvl:3, dom:"SRE",
  q:"Qu'est-ce que le toil au sens SRE, et quel est l'objectif chiffré classique ?",
  accept:["tache manuelle","repetitive","automatisable","sans valeur durable","50"],
  explain:"Le toil = travail manuel, répétitif, automatisable, sans valeur durable, qui croît linéairement avec le service. Google fixe la limite à 50 % du temps d'un SRE ; au-delà, on arrête les nouveautés pour automatiser. C'est un argument très utile en entretien pour justifier un investissement d'outillage." }

]);
