window.QBANK = (window.QBANK || []).concat([
/* ================= NIVEAU 4 — INTERMÉDIAIRE ================= */

{ id:"n4-k8s-01", lvl:4, dom:"Kubernetes",
  q:"Décris le chemin complet d'un <code>kubectl apply -f deploy.yaml</code> jusqu'au conteneur qui tourne.",
  must:[["api server","apiserver"],["etcd"],["scheduler"],["kubelet"]],
  explain:"kubectl → API server (authN, authZ RBAC, admission controllers mutating puis validating) → persistance dans etcd → le Deployment controller crée un ReplicaSet → le ReplicaSet controller crée les Pods (sans nœud) → le scheduler leur assigne un nœud → le kubelet du nœud demande au container runtime (containerd via CRI) de démarrer les conteneurs → le kubelet remonte le statut à l'API server." },

{ id:"n4-k8s-02", lvl:4, dom:"Kubernetes",
  q:"Comment fonctionne un rolling update, et quel rôle jouent <code>maxSurge</code> et <code>maxUnavailable</code> ?",
  accept:["progressivement","nouveau replicaset","pods en plus","pods indisponibles","sans coupure"],
  explain:"Le Deployment crée un nouveau ReplicaSet et transfère progressivement les réplicas. <code>maxSurge</code> = combien de Pods EN PLUS du nominal on autorise temporairement ; <code>maxUnavailable</code> = combien peuvent manquer. maxUnavailable=0 + maxSurge=1 donne un déploiement sans perte de capacité, mais plus lent et il faut de la marge sur le cluster." },

{ id:"n4-k8s-03", lvl:4, dom:"Kubernetes",
  q:"À quoi sert un PodDisruptionBudget et contre quoi ne protège-t-il PAS ?",
  accept:["disruption volontaire","drain","minavailable","pas les crashs","pas involontaire"],
  explain:"Il garantit un nombre minimal de Pods disponibles pendant les disruptions VOLONTAIRES : <code>kubectl drain</code>, upgrade de nœuds, autoscaler qui réduit. Il ne protège pas des disruptions involontaires (crash de nœud, OOMKill, panne matérielle). Sans PDB, un upgrade de node pool peut vider ton service entier." },

{ id:"n4-k8s-04", lvl:4, dom:"Kubernetes",
  q:"Différence entre taints/tolerations et nodeAffinity ?",
  accept:["le noeud repousse","le pod attire","exclusion","preference","repulsion"],
  explain:"Taint = le NŒUD repousse les Pods sauf ceux qui ont la toleration correspondante (mécanisme d'exclusion : nœuds GPU, nœuds système). nodeAffinity = le POD exprime où il veut aller (attraction, avec required ou preferred). Les deux se combinent : la toleration autorise, l'affinity dirige." },

{ id:"n4-k8s-05", lvl:4, dom:"Kubernetes",
  q:"Comment le DNS interne résout-il un Service ? Donne le FQDN complet.",
  accept:["svc.namespace.svc.cluster.local","coredns","cluster.local"],
  explain:"<code>&lt;service&gt;.&lt;namespace&gt;.svc.cluster.local</code>, résolu par CoreDNS. Depuis le même namespace, le nom court suffit grâce au <code>search</code> du <code>/etc/resolv.conf</code> injecté. Un headless Service (<code>clusterIP: None</code>) renvoie directement les IP des Pods, d'où <code>db-0.db.default.svc.cluster.local</code> pour un StatefulSet." },

{ id:"n4-k8s-06", lvl:4, dom:"Kubernetes",
  q:"Qu'est-ce qu'un Ingress et pourquoi un objet Ingress seul ne fait rien ?",
  accept:["controller","besoin d un controleur","regles de routage","nginx","juste une declaration"],
  explain:"L'Ingress n'est qu'une déclaration de règles de routage HTTP (host/path → Service). Il faut un Ingress Controller (ingress-nginx, Traefik, AGIC, ALB Controller) qui les lit et configure un vrai reverse proxy. Sans controller, l'objet existe mais rien ne route. La Gateway API est le successeur normalisé." },

{ id:"n4-k8s-07", lvl:4, dom:"Kubernetes",
  q:"Comment donner à un Pod le droit d'appeler l'API Kubernetes, sans lui donner trop de droits ?",
  must:[["serviceaccount"],["role","rolebinding","rbac"]],
  explain:"Un ServiceAccount dédié au Pod + un Role (namespacé) ou ClusterRole limité aux verbes/ressources nécessaires, lié par un RoleBinding. Jamais le SA <code>default</code>, jamais <code>cluster-admin</code>, et <code>automountServiceAccountToken: false</code> quand le Pod n'appelle pas l'API." },

{ id:"n4-tf-01", lvl:4, dom:"Terraform",
  q:"Que fait <code>terraform state rm</code> et dans quel cas l'utilise-t-on ?",
  accept:["retire du state","sans detruire","cesse de gerer","migration"],
  explain:"Il retire une ressource du state SANS la détruire dans le cloud : Terraform cesse de la gérer. Cas d'usage : sortir une ressource pour la déplacer vers un autre state/module, ou abandonner la gestion d'un objet repris par une autre équipe. Un <code>apply</code> ensuite voudra la recréer si elle est encore dans le code." },

{ id:"n4-tf-02", lvl:4, dom:"Terraform",
  q:"À quoi sert le bloc <code>moved</code> et pourquoi c'est mieux que <code>terraform state mv</code> ?",
  accept:["renommer sans detruire","refactoring","declaratif","versionne","revue"],
  explain:"Il déclare dans le CODE qu'une ressource a changé d'adresse (renommage, passage en module, count → for_each). Avantages sur <code>state mv</code> : c'est versionné, revu en PR, visible dans le plan et rejoué automatiquement par tous les collaborateurs et la CI — pas une commande manuelle à reproduire partout." },

{ id:"n4-tf-03", lvl:4, dom:"Terraform",
  q:"Explique <code>lifecycle { prevent_destroy }</code>, <code>create_before_destroy</code> et <code>ignore_changes</code>.",
  must:[["prevent","bloque","empeche"],["avant de detruire","cree d abord"],["ignore"]],
  explain:"<code>prevent_destroy</code> : l'apply échoue si le plan veut détruire la ressource (base de données prod). <code>create_before_destroy</code> : crée le remplaçant avant de supprimer l'ancien (évite la coupure, attention aux noms uniques). <code>ignore_changes</code> : Terraform ignore la dérive sur certains attributs modifiés hors Terraform (tags posés par un outil, nombre d'instances géré par un autoscaler)." },

{ id:"n4-tf-04", lvl:4, dom:"Terraform",
  q:"Comment structures-tu un module Terraform réutilisable ? Que doit-il exposer et ne pas faire ?",
  must:[["variable","input"],["output"]],
  explain:"Fichiers <code>main.tf</code>/<code>variables.tf</code>/<code>outputs.tf</code>/<code>versions.tf</code>, variables typées avec description et validation, outputs pour tout ce dont l'appelant a besoin. Un module ne doit PAS déclarer de <code>provider</code> ni de <code>backend</code> (c'est le rôle du root module), et doit rester agnostique de l'environnement." },

{ id:"n4-tf-05", lvl:4, dom:"Terraform",
  q:"Que se passe-t-il si deux pipelines lancent <code>terraform apply</code> en même temps sur le même state ?",
  accept:["lock","verrou","le second attend","erreur de verrouillage","corruption sans lock"],
  explain:"Avec un backend qui supporte le locking, le second obtient une erreur de verrouillage (ou attend) — c'est le comportement voulu. Sans lock, les deux écrivent le state et l'un écrase l'autre : ressources orphelines et state incohérent. Un lock resté coincé se libère avec <code>terraform force-unlock &lt;id&gt;</code>, après avoir vérifié qu'aucun apply ne tourne." },

{ id:"n4-aws-01", lvl:4, dom:"AWS",
  q:"Un rôle IAM autorise <code>s3:GetObject</code> mais l'appel échoue en AccessDenied. Cite trois causes possibles.",
  must:[["bucket policy","resource"],["kms","chiffrement","scp","boundary"]],
  explain:"1) La bucket policy (ou un Block Public Access / une SCP d'organisation) refuse explicitement — un Deny gagne toujours. 2) L'objet est chiffré en KMS et le rôle n'a pas <code>kms:Decrypt</code> sur la clé. 3) Une permission boundary ou une session policy réduit les droits effectifs. On tranche avec le IAM Policy Simulator et CloudTrail." },

{ id:"n4-aws-02", lvl:4, dom:"AWS",
  q:"Explique l'ordre d'évaluation d'une décision IAM.",
  accept:["deny explicite gagne","deny par defaut","allow explicite","implicite"],
  explain:"1) Deny par défaut. 2) Un Deny EXPLICITE (SCP, policy, bucket policy, boundary) l'emporte toujours et arrête l'évaluation. 3) Sinon, un Allow explicite doit exister dans l'intersection des SCP / boundary / identity policy (ou dans une resource policy). Sans Allow, c'est refusé." },

{ id:"n4-aws-03", lvl:4, dom:"AWS",
  q:"Différence entre Auto Scaling Group et Elastic Load Balancer — et pourquoi les deux ensemble ?",
  accept:["capacite","repartition","health check","ajoute des instances","distribue le trafic"],
  explain:"L'ASG gère la CAPACITÉ (nombre d'instances, remplacement des instances non saines, scaling par métrique). L'ELB gère la RÉPARTITION du trafic. Ensemble : l'ASG enregistre automatiquement les nouvelles instances dans le target group, et peut utiliser le health check ELB pour décider qu'une instance est à remplacer." },

{ id:"n4-aws-04", lvl:4, dom:"AWS",
  q:"Qu'est-ce qu'un VPC Endpoint et quelle différence entre Gateway et Interface endpoint ?",
  accept:["sans passer par internet","route table","eni privee","privatelink","s3 dynamodb"],
  explain:"Il permet d'atteindre un service AWS sans sortir sur internet. Gateway endpoint : uniquement S3 et DynamoDB, gratuit, s'ajoute comme une ROUTE dans la route table. Interface endpoint (PrivateLink) : une ENI avec IP privée dans ton subnet, payant à l'heure et au Go, disponible pour la plupart des services." },

{ id:"n4-aws-05", lvl:4, dom:"AWS",
  q:"Quelle est la différence entre un snapshot EBS et une AMI ?",
  accept:["ami inclut","metadonnees","bloc","volume","bootable"],
  explain:"Un snapshot EBS est une copie incrémentale d'UN volume, stockée dans S3. Une AMI est un modèle de lancement complet : un ou plusieurs snapshots + les métadonnées (architecture, mode de virtualisation, mapping des devices, noyau) qui rendent l'ensemble bootable." },

{ id:"n4-az-01", lvl:4, dom:"Azure",
  q:"Comment une App Service accède-t-elle à un Key Vault sans stocker de secret ?",
  must:[["managed identity","identite manageee"],["access policy","rbac","role"]],
  explain:"On active une Managed Identity sur l'App Service, on lui donne le rôle <code>Key Vault Secrets User</code> (RBAC, ou une access policy sur les coffres anciens), puis on référence le secret dans les app settings via <code>@Microsoft.KeyVault(SecretUri=…)</code>. Aucun secret dans le code ni dans la config." },

{ id:"n4-az-02", lvl:4, dom:"Azure",
  q:"Qu'est-ce qu'un deployment slot App Service et quel piège au moment du swap ?",
  accept:["preproduction","swap","warm up","sticky","parametres de slot"],
  explain:"Un slot est une instance parallèle de l'app (même plan) permettant de déployer, chauffer et tester avant un swap quasi instantané avec la prod — et de revenir en arrière en re-swappant. Piège : par défaut, les app settings SUIVENT le swap ; il faut cocher « deployment slot setting » (sticky) sur les paramètres spécifiques à l'environnement (chaînes de connexion, feature flags)." },

{ id:"n4-az-03", lvl:4, dom:"Azure",
  q:"Différence entre Azure AD (Entra ID) et Azure RBAC — un Global Administrator peut-il tout faire sur les ressources ?",
  accept:["plan de controle different","non","elevate access","annuaire","ressources"],
  explain:"Entra ID gère l'ANNUAIRE (identités, groupes, applications, rôles d'annuaire). Azure RBAC gère les droits sur les RESSOURCES Azure. Ce sont deux plans distincts : un Global Admin n'a par défaut aucun droit sur les ressources, il doit d'abord activer « Elevate access » pour devenir User Access Administrator à la racine." },

{ id:"n4-az-04", lvl:4, dom:"Azure",
  q:"Décris une topologie hub-and-spoke et ce qu'on met dans le hub.",
  accept:["peering","firewall","bastion","vpn gateway","services partages"],
  explain:"Un VNet hub connecté par peering à des VNets spokes (une app / une équipe / un environnement par spoke). Dans le hub : Azure Firewall, VPN/ExpressRoute Gateway, Bastion, DNS privé, éventuellement les Private Endpoints partagés. Les spokes ne se parlent pas directement : on force le transit par le hub via des UDR pour inspecter le trafic." },

{ id:"n4-cicd-01", lvl:4, dom:"CI/CD",
  q:"Explique un déploiement blue/green et son coût par rapport à un canary.",
  accept:["deux environnements","bascule","rollback instantane","double capacite","progressif"],
  explain:"Blue/green : deux environnements complets, on bascule tout le trafic d'un coup, rollback instantané en repointant — mais il faut payer la double capacité. Canary : on route un petit pourcentage vers la nouvelle version et on augmente progressivement selon les métriques — moins cher, mais plus long et il faut deux versions compatibles simultanément." },

{ id:"n4-cicd-02", lvl:4, dom:"CI/CD",
  q:"Comment gères-tu une migration de base de données incompatible dans un déploiement sans coupure ?",
  accept:["expand contract","retrocompatible","deux etapes","backward compatible","ajouter puis supprimer"],
  explain:"Pattern expand/contract : 1) EXPAND — on ajoute la nouvelle colonne/table sans rien casser, l'ancienne version continue de fonctionner. 2) On déploie le code qui écrit dans les deux et lit la nouvelle. 3) On migre les données. 4) CONTRACT — une fois toutes les instances migrées, on supprime l'ancienne colonne. Jamais de migration destructive dans le même déploiement que le code." },

{ id:"n4-cicd-03", lvl:4, dom:"CI/CD",
  q:"Qu'est-ce qu'un test flaky et comment le traites-tu ?",
  accept:["resultat non deterministe","aleatoire","quarantaine","isole","depend du temps"],
  explain:"Un test qui passe ou échoue sans changement de code (dépendance au temps, à l'ordre d'exécution, au réseau, à un état partagé). On ne le relance pas en boucle : on le met en quarantaine hors du pipeline bloquant, on ouvre un ticket, on corrige la cause. Un pipeline qu'on relance « pour voir » a perdu toute valeur de signal." },

{ id:"n4-linux-01", lvl:4, dom:"Linux",
  q:"Que sont les namespaces et les cgroups, et lequel fait quoi pour un conteneur ?",
  must:[["namespace","isolation","visibilite"],["cgroup","ressource","limite"]],
  explain:"Les namespaces isolent la VISION du process : pid, net, mnt, uts, ipc, user, cgroup — ce qu'il peut voir. Les cgroups limitent la CONSOMMATION : CPU, mémoire, I/O, nombre de pids. Un conteneur = un process normal avec des namespaces + des cgroups + un filesystem overlay. Rien de magique." },

{ id:"n4-linux-02", lvl:4, dom:"Linux",
  q:"Ton application est tuée sans log applicatif. Comment vérifies-tu que c'est l'OOM killer ?",
  accept:["dmesg","journalctl -k","oom-killer","kern.log","exit code 137"],
  explain:"<code>dmesg -T | grep -i oom</code> ou <code>journalctl -k</code> : le noyau logue « Out of memory: Killed process ». Côté conteneur, un exit code 137 (128+9 = SIGKILL) et <code>OOMKilled</code> dans <code>kubectl describe</code>. Ensuite on regarde si c'est la limite du cgroup ou la mémoire physique de l'hôte." },

{ id:"n4-res-01", lvl:4, dom:"Réseau",
  q:"Quelle différence entre un firewall qui DROP et un qui REJECT, et comment le diagnostiques-tu côté client ?",
  accept:["timeout","connection refused","silencieux","rst","icmp"],
  explain:"DROP jette le paquet sans réponse : le client attend et finit en TIMEOUT. REJECT renvoie un RST TCP ou un ICMP unreachable : le client obtient « connection refused » immédiatement. Donc : timeout → suspecte un SG/NSG/NACL ou une route ; refused → la route est bonne mais rien n'écoute sur le port." },

{ id:"n4-res-02", lvl:4, dom:"Réseau",
  q:"Qu'est-ce que le MTU et quel symptôme typique donne un MTU mal réglé sur un tunnel VPN ?",
  accept:["taille maximale","fragmentation","petites requetes passent","gros paquets bloques","1500"],
  explain:"Le MTU est la taille max d'une trame (1500 en Ethernet, moins dans un tunnel à cause de l'encapsulation). Symptôme signature : les petites requêtes (ping, handshake) passent, mais les gros transferts se figent — les paquets pleins nécessitent une fragmentation refusée, souvent parce que l'ICMP « fragmentation needed » est bloqué (PMTUD cassé)." },

{ id:"n4-sec-01", lvl:4, dom:"Sécurité",
  q:"Qu'est-ce que le chiffrement au repos vs en transit, et pourquoi les deux ne suffisent pas ?",
  accept:["disque","reseau","tls","en memoire","cle","acces applicatif"],
  explain:"Au repos = données chiffrées sur le support (KMS/Key Vault, TDE, chiffrement de disque). En transit = TLS/mTLS sur le réseau. Ça ne protège pas d'un accès légitime détourné : si l'application ou l'identité qui a le droit de déchiffrer est compromise, tout est lisible. D'où IAM, segmentation, journalisation et chiffrement applicatif pour les données les plus sensibles." },

{ id:"n4-sec-02", lvl:4, dom:"Sécurité",
  q:"Qu'est-ce que mTLS et quand l'impose-t-on ?",
  accept:["authentification mutuelle","les deux presentent un certificat","service mesh","client aussi"],
  explain:"En TLS classique seul le serveur prouve son identité ; en mTLS le CLIENT présente aussi un certificat. On l'impose entre services internes (service mesh type Istio/Linkerd, zero trust), pour des API partenaires en banque, ou quand on ne veut pas dépendre d'un secret partagé. Coût : une PKI et une rotation de certificats à industrialiser." },

{ id:"n4-obs-01", lvl:4, dom:"Observabilité",
  q:"Explique la méthode RED et la méthode USE, et pour quoi chacune est faite.",
  must:[["rate","requete","debit"],["error","erreur"],["duration","latence"]],
  explain:"RED (services) : Rate (req/s), Errors (taux d'erreur), Duration (latence, en percentiles). USE (ressources) : Utilization, Saturation, Errors — pour CPU, mémoire, disque, réseau. RED répond « mes utilisateurs souffrent-ils ? », USE répond « quelle ressource est le goulot ? »." },

{ id:"n4-obs-02", lvl:4, dom:"Observabilité",
  q:"Pourquoi regarde-t-on le p95/p99 de latence plutôt que la moyenne ?",
  accept:["moyenne masque","valeurs extremes","queue","percentile","utilisateurs les plus lents"],
  explain:"La moyenne masque la queue de distribution : avec 99 requêtes à 50 ms et une à 10 s, la moyenne reste bonne alors qu'un utilisateur a une expérience catastrophique. Les percentiles décrivent l'expérience réelle des pires cas — et sur une page qui fait 20 appels, le p99 de chaque appel devient la norme pour l'utilisateur." },

{ id:"n4-sql-01", lvl:4, dom:"SQL",
  q:"Qu'est-ce qu'un deadlock en base et comment le résout-on structurellement ?",
  accept:["attente mutuelle","interblocage","ordre des verrous","transactions courtes","victime"],
  explain:"Deux transactions attendent chacune un verrou détenu par l'autre ; le SGBD en tue une (victime) et l'application doit rejouer. Structurellement : accéder aux ressources TOUJOURS dans le même ordre, garder les transactions courtes, réduire le niveau d'isolation si acceptable, et indexer pour verrouiller des lignes plutôt que des plages." },

{ id:"n4-sre-01", lvl:4, dom:"SRE",
  q:"Différence entre RTO et RPO ? Donne un exemple chiffré.",
  must:[["temps de reprise","duree d indisponibilite","recovery time"],["perte de donnees","recovery point"]],
  explain:"RTO = en combien de temps le service doit revenir. RPO = combien de données on accepte de perdre. Exemple : RTO 1 h / RPO 15 min → il faut des sauvegardes ou une réplication toutes les 15 min et une procédure de bascule tenant en une heure. Un RPO proche de zéro impose de la réplication synchrone, donc un coût et une latence." }

]);
