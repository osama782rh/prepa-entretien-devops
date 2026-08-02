window.QBANK = (window.QBANK || []).concat([
/* ================= NIVEAU 2 — BASES OPÉRATIONNELLES ================= */

{ id:"n2-linux-01", lvl:2, dom:"Linux",
  q:"Un process tourne mais tu ne sais pas quel port il écoute. Quelle commande et quelles options ?",
  accept:["ss -tulnp","netstat -tulnp","ss -lntp","lsof -i"],
  explain:"<code>ss -tulnp</code> (t=TCP, u=UDP, l=listening, n=numérique sans résolution DNS, p=processus). <code>lsof -i :8080</code> fait l'inverse : du port vers le process. <code>netstat</code> est déprécié mais encore demandé en entretien." },

{ id:"n2-linux-02", lvl:2, dom:"Linux",
  q:"Un disque est plein d'après <code>df -h</code> mais <code>du -sh</code> ne trouve rien. Quelle explication classique ?",
  accept:["fichier supprime encore ouvert","deleted","descripteur ouvert","inode","process tient le fichier"],
  explain:"Un fichier supprimé mais toujours ouvert par un process : l'inode n'est libéré qu'à la fermeture du descripteur. <code>lsof | grep deleted</code> le révèle ; il faut redémarrer le process (souvent un log rotaté à la sauvage). Autre piste : inodes épuisés (<code>df -i</code>)." },

{ id:"n2-linux-03", lvl:2, dom:"Linux",
  q:"Quelle est la différence entre <code>SIGTERM</code> et <code>SIGKILL</code> ?",
  accept:["term peut etre intercepte","gracieux","kill non interceptable","9 immediat","arret propre"],
  explain:"SIGTERM (15) est interceptable : le process peut fermer ses connexions, flusher ses buffers et sortir proprement. SIGKILL (9) est traité par le noyau, non interceptable, non ignorable — arrêt brutal, risque de corruption. C'est exactement la logique du <code>terminationGracePeriodSeconds</code> Kubernetes." },

{ id:"n2-linux-04", lvl:2, dom:"Linux",
  q:"À quoi sert <code>set -euo pipefail</code> en tête d'un script bash ?",
  must:[["e","erreur","echec"],["u","variable non definie","undefined"],["pipefail","pipe"]],
  explain:"<code>-e</code> arrête au premier échec, <code>-u</code> échoue sur une variable non définie (évite <code>rm -rf $DIR/</code> avec DIR vide), <code>pipefail</code> fait remonter l'échec de n'importe quelle commande d'un pipeline au lieu de ne regarder que la dernière. Réflexe obligatoire sur un script de CI." },

{ id:"n2-linux-05", lvl:2, dom:"Linux",
  q:"Comment trouver les 10 plus gros fichiers sous <code>/var</code> ?",
  accept:["du -a","sort -rh","find -size","du -h | sort"],
  explain:"<code>du -ah /var | sort -rh | head -10</code>, ou <code>find /var -type f -printf '%s %p\\n' | sort -rn | head</code>. Le <code>-h</code> de <code>sort</code> comprend les suffixes K/M/G." },

{ id:"n2-git-01", lvl:2, dom:"Git",
  q:"Différence entre <code>git merge</code> et <code>git rebase</code> — et le risque du rebase ?",
  accept:["reecrit l historique","nouveaux hash","historique lineaire","commit de merge","jamais sur une branche partagee"],
  explain:"<code>merge</code> crée un commit de fusion et préserve l'histoire réelle. <code>rebase</code> rejoue tes commits au-dessus de la cible : historique linéaire, mais NOUVEAUX hash. Donc jamais de rebase sur une branche déjà partagée/poussée, sinon les collègues divergent." },

{ id:"n2-git-02", lvl:2, dom:"Git",
  q:"Tu as commité un secret puis fait un <code>git revert</code>. Le secret est-il protégé ?",
  accept:["non","toujours dans l historique","reste accessible","revoquer"],
  explain:"Non — <code>revert</code> ajoute un commit qui annule l'effet, mais le blob reste dans l'historique et reste récupérable. Il faut réécrire l'historique (<code>git filter-repo</code>, BFG), forcer le push, purger les forks/caches… et surtout RÉVOQUER le secret : c'est la seule action qui compte vraiment." },

{ id:"n2-git-03", lvl:2, dom:"Git",
  q:"Différence entre <code>git reset --soft</code>, <code>--mixed</code> et <code>--hard</code> ?",
  must:[["soft"],["mixed","index"],["hard"]],
  explain:"<code>--soft</code> déplace HEAD, garde index + working tree (pour re-commiter autrement). <code>--mixed</code> (défaut) déplace HEAD et vide l'index, garde les fichiers modifiés. <code>--hard</code> écrase tout, y compris le travail non commité — irréversible sauf via le reflog." },

{ id:"n2-docker-01", lvl:2, dom:"Docker",
  q:"Différence entre <code>CMD</code> et <code>ENTRYPOINT</code> dans un Dockerfile ?",
  accept:["entrypoint executable","cmd arguments par defaut","cmd remplacable","surcharge"],
  explain:"ENTRYPOINT définit l'exécutable fixe du conteneur ; CMD fournit les arguments par défaut, remplaçables par ceux passés à <code>docker run</code>. Combo usuel : <code>ENTRYPOINT [\"nginx\"]</code> + <code>CMD [\"-g\",\"daemon off;\"]</code>. Toujours en forme exec (JSON) pour recevoir les signaux." },

{ id:"n2-docker-02", lvl:2, dom:"Docker",
  q:"Pourquoi place-t-on <code>COPY package.json</code> puis <code>RUN npm install</code> AVANT <code>COPY . .</code> ?",
  accept:["cache","couches","layer cache","invalidation","reutilisation"],
  explain:"Pour le cache de couches : tant que <code>package.json</code> ne change pas, la couche d'installation des dépendances est réutilisée. Si on copiait tout le code d'abord, la moindre modification d'un fichier source invaliderait le cache et relancerait un <code>npm install</code> complet." },

{ id:"n2-docker-03", lvl:2, dom:"Docker",
  q:"Qu'apporte un build multi-stage, concrètement ?",
  accept:["image finale legere","sans outils de build","separer compilation","surface d attaque","copie l artefact"],
  explain:"On compile dans une image lourde (SDK, compilateur, dépendances de build) puis on ne copie que l'artefact final dans une image runtime minimale. Résultat : image beaucoup plus petite, sans compilateur ni sources — donc surface d'attaque et temps de pull réduits." },

{ id:"n2-k8s-01", lvl:2, dom:"Kubernetes",
  q:"Quelle est la chaîne d'objets entre un Deployment et un Pod ?",
  accept:["replicaset","deployment cree un replicaset","rs"],
  explain:"Deployment → ReplicaSet → Pods. Le Deployment gère les versions et le rollout ; il crée un NOUVEAU ReplicaSet à chaque changement de template et fait varier les réplicas des deux RS. Les anciens RS sont conservés (<code>revisionHistoryLimit</code>) pour permettre le rollback." },

{ id:"n2-k8s-02", lvl:2, dom:"Kubernetes",
  q:"Différence entre une liveness probe et une readiness probe ?",
  accept:["liveness redemarre","readiness retire du service","endpoints","trafic"],
  explain:"Liveness : si elle échoue, kubelet REDÉMARRE le conteneur (il est bloqué). Readiness : si elle échoue, le Pod est retiré des Endpoints du Service — il ne reçoit plus de trafic mais reste vivant. Mettre une liveness trop agressive au démarrage = boucle de redémarrage : c'est le rôle de la startupProbe." },

{ id:"n2-k8s-03", lvl:2, dom:"Kubernetes",
  q:"Différence entre un ConfigMap et un Secret ? Le Secret est-il chiffré ?",
  accept:["base64","pas chiffre","encode","non chiffre par defaut","encryption at rest"],
  explain:"Même usage (injecter de la config), mais un Secret est seulement encodé en base64 dans etcd — PAS chiffré par défaut. Il faut activer <code>EncryptionConfiguration</code> côté API server, ou externaliser (External Secrets Operator + Key Vault / Secrets Manager). Le RBAC sur les Secrets doit être strict." },

{ id:"n2-k8s-04", lvl:2, dom:"Kubernetes",
  q:"À quoi sert un label et en quoi diffère-t-il d'une annotation ?",
  accept:["selection","selector","identification","annotation non selectionnable","metadonnee"],
  explain:"Les labels sont des paires clé/valeur indexées servant à SÉLECTIONNER des objets (Services, ReplicaSets, NetworkPolicies). Les annotations portent des métadonnées non sélectionnables et souvent volumineuses (config d'un ingress controller, checksum, outil externe)." },

{ id:"n2-tf-01", lvl:2, dom:"Terraform",
  q:"Que fait <code>terraform plan</code> et quelles sont les quatre actions possibles affichées ?",
  must:[["+","cree"],["-","detruit"],["~","modifie"]],
  explain:"Il rafraîchit l'état, compare config vs state et affiche un dry-run : <code>+</code> création, <code>-</code> destruction, <code>~</code> modification en place, <code>-/+</code> remplacement (destroy puis create). Aucun changement n'est appliqué. En CI, on sauvegarde le plan (<code>-out</code>) et on applique CE plan-là." },

{ id:"n2-tf-02", lvl:2, dom:"Terraform",
  q:"Pourquoi un backend distant est-il indispensable dès qu'on travaille à plusieurs ?",
  accept:["verrouillage","lock","state partage","concurrence","corruption"],
  explain:"Pour partager le state ET le verrouiller : sans lock, deux <code>apply</code> simultanés corrompent le state ou créent des ressources en double. S3 + DynamoDB (ou S3 lockfile natif), azurerm avec bail de blob, ou HCP Terraform. Bonus : chiffrement au repos et versioning pour restaurer." },

{ id:"n2-tf-03", lvl:2, dom:"Terraform",
  q:"À quoi sert <code>.terraform.lock.hcl</code> et doit-il être commité ?",
  accept:["versions des providers","hash","commite","versionne","reproductible"],
  explain:"Il fige les versions exactes des providers et leurs empreintes de hachage. OUI, il se commite : c'est ce qui garantit que ton poste, celui du collègue et la CI utilisent strictement les mêmes providers. Ne pas le confondre avec le verrou de state." },

{ id:"n2-tf-04", lvl:2, dom:"Terraform",
  q:"Quelle différence entre une variable et un local dans Terraform ?",
  accept:["variable = entree","local = calcul","interne","pas surchargeable","expression"],
  explain:"Une <code>variable</code> est une entrée du module, fournie de l'extérieur (tfvars, -var, env). Un <code>local</code> est une valeur calculée interne, non surchargeable, qui sert à factoriser une expression répétée (naming, tags communs, conditions)." },

{ id:"n2-aws-01", lvl:2, dom:"AWS",
  q:"Qu'est-ce qui rend un subnet AWS « public » ?",
  accept:["route table","table de routage","route vers l igw","0.0.0.0/0"],
  explain:"Uniquement sa route table : une route <code>0.0.0.0/0 → igw-xxx</code>. Le nom du subnet n'a aucune valeur technique. Il faut aussi une IP publique sur l'instance (ou une EIP) pour être joignable de l'extérieur." },

{ id:"n2-aws-02", lvl:2, dom:"AWS",
  q:"Security Group vs NACL : cite les trois différences majeures.",
  must:[["instance","eni"],["subnet"],["stateful","stateless","etat"]],
  explain:"1) Niveau : SG sur l'ENI/instance, NACL sur le subnet. 2) État : SG stateful (le retour est autorisé automatiquement), NACL stateless (il faut une règle explicite dans chaque sens, ports éphémères compris). 3) Deny : SG allow uniquement, NACL supporte allow ET deny, avec des règles numérotées évaluées dans l'ordre." },

{ id:"n2-aws-03", lvl:2, dom:"AWS",
  q:"À quoi sert un IAM Role par rapport à un IAM User, et pourquoi le préférer sur EC2 ?",
  accept:["credentials temporaires","pas de cle statique","assume","identite endossable","rotation automatique"],
  explain:"Un rôle n'a pas de credentials permanents : on l'endosse (<code>AssumeRole</code>/STS) et on reçoit des credentials temporaires à rotation automatique. Sur EC2 (instance profile) ou EKS (IRSA), ça supprime les clés d'accès statiques codées en dur — la première cause de fuite en entreprise." },

{ id:"n2-az-01", lvl:2, dom:"Azure",
  q:"Différence entre un Service Principal et une Managed Identity ?",
  accept:["gere le secret","pas de secret","rotation automatique","azure gere","identite managee"],
  explain:"Les deux sont des identités applicatives. Le Service Principal demande de gérer un secret ou un certificat (stockage, rotation, expiration). La Managed Identity est gérée par Azure : pas de secret à manipuler, le token est récupéré via l'endpoint IMDS. Toujours préférer la Managed Identity quand la ressource est dans Azure." },

{ id:"n2-az-02", lvl:2, dom:"Azure",
  q:"Différence entre une Managed Identity system-assigned et user-assigned ?",
  accept:["liee au cycle de vie","supprimee avec la ressource","partagee","plusieurs ressources","independante"],
  explain:"System-assigned : créée avec la ressource, supprimée avec elle, 1:1. User-assigned : objet indépendant, réutilisable par plusieurs ressources, survit à leur suppression — indispensable quand tu veux préassigner les droits RBAC avant même de créer la VM (évite le poule/œuf en Terraform)." },

{ id:"n2-res-01", lvl:2, dom:"Réseau",
  q:"Décris le handshake TCP en trois temps.",
  must:[["syn"],["syn ack","syn-ack"],["ack"]],
  explain:"SYN (client → serveur, propose un numéro de séquence), SYN-ACK (serveur accuse et propose le sien), ACK (client accuse). Une connexion bloquée en SYN_SENT côté client, c'est presque toujours un firewall/SG qui DROP silencieusement — un REJECT donnerait un « connection refused » immédiat." },

{ id:"n2-res-02", lvl:2, dom:"Réseau",
  q:"Que se passe-t-il pendant un handshake TLS, en trois idées ?",
  must:[["certificat","cert"],["cle de session","symetrique","session key"]],
  explain:"1) Négociation de version et de suite cryptographique. 2) Le serveur présente son certificat, le client valide la chaîne jusqu'à une CA de confiance. 3) Échange de clés (ECDHE) pour dériver une clé de SESSION symétrique — l'asymétrique ne sert qu'à établir la confiance, le trafic est ensuite chiffré symétriquement." },

{ id:"n2-res-03", lvl:2, dom:"Réseau",
  q:"Différence entre un load balancer L4 et L7 ?",
  accept:["couche 4 tcp","couche 7 http","routage par url","inspecte le contenu","header"],
  explain:"L4 route sur IP/port sans lire le contenu (rapide, tout protocole TCP/UDP) : NLB, Azure LB. L7 comprend HTTP : routage par host/path/header, terminaison TLS, réécriture, sticky sessions, WAF : ALB, Application Gateway, Ingress." },

{ id:"n2-cicd-01", lvl:2, dom:"CI/CD",
  q:"Pourquoi un pipeline doit-il échouer VITE (fail fast) et dans quel ordre ranger les étapes ?",
  accept:["lint puis tests unitaires","du plus rapide","feedback rapide","le moins couteux d abord"],
  explain:"Pour donner un feedback en quelques minutes et ne pas gaspiller des runners. Ordre : lint/format → tests unitaires → build → scan sécurité/SAST → tests d'intégration → déploiement. Le moins coûteux et le plus discriminant d'abord." },

{ id:"n2-cicd-02", lvl:2, dom:"CI/CD",
  q:"Pourquoi ne jamais taguer une image de production en <code>latest</code> ?",
  accept:["non deterministe","pas reproductible","mutable","rollback impossible","quelle version"],
  explain:"<code>latest</code> est un tag mutable : deux pulls peuvent donner deux images différentes, on ne sait plus ce qui tourne et le rollback est impossible. On tague par version sémantique ou SHA de commit, et en prod on référence idéalement le digest immuable (<code>@sha256:…</code>)." },

{ id:"n2-sec-01", lvl:2, dom:"Sécurité",
  q:"Pourquoi ne pas passer un secret via une variable d'environnement de build Docker (<code>ARG</code>) ?",
  accept:["reste dans l historique","docker history","couche","inspectable","persiste dans l image"],
  explain:"L'ARG et les commandes RUN restent visibles dans l'historique des couches (<code>docker history</code>) : quiconque a l'image a le secret. Il faut utiliser BuildKit <code>--mount=type=secret</code>, ou injecter le secret au RUNTIME depuis un coffre." },

{ id:"n2-obs-01", lvl:2, dom:"Observabilité",
  q:"Pourquoi préfère-t-on des logs structurés (JSON) à du texte libre ?",
  accept:["parsable","indexable","requetable","champs","correlation"],
  explain:"Parce qu'ils sont directement indexables et requêtables par champ (level, service, trace_id, user_id) sans regex fragiles. Ça permet l'agrégation, l'alerting sur un champ et la corrélation avec les traces. Le texte libre casse dès qu'un dev change le format d'un message." },

{ id:"n2-sql-01", lvl:2, dom:"SQL",
  q:"À quoi sert un index, et quel est son coût ?",
  accept:["accelere la lecture","ralentit les ecritures","occupe de l espace","maintenu a chaque insert"],
  explain:"Il accélère les lectures en évitant le full scan (structure B-tree triée). Coût : espace disque, et surcoût sur chaque INSERT/UPDATE/DELETE car l'index doit être maintenu. D'où : indexer les colonnes de filtre/jointure réellement utilisées, pas tout." },

{ id:"n2-sre-01", lvl:2, dom:"SRE",
  q:"Qu'est-ce qu'un post-mortem « blameless » et pourquoi cette approche ?",
  accept:["sans blamer","cause systemique","pas de coupable","apprendre","processus"],
  explain:"On analyse l'incident en cherchant les causes systémiques (manque de garde-fou, alerte absente, procédure ambiguë) plutôt qu'un coupable. Objectif : que les gens rapportent les incidents sans peur. Chercher un coupable fait taire l'information et garantit la récidive." }

]);
