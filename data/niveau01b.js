window.QBANK = (window.QBANK || []).concat([
/* ============ NIVEAU 1 — SÉRIE B ============ */

{ id:"b1-linux-01", lvl:1, dom:"Linux",
  q:"Différence entre un chemin absolu et un chemin relatif ? Pourquoi ça compte dans un script de CI ?",
  accept:["part de la racine","commence par /","depend du repertoire courant","cwd"],
  explain:"Un chemin absolu part de <code>/</code> et est toujours le même. Un chemin relatif dépend du répertoire courant, qui n'est pas garanti dans un runner de CI ou un service systemd. D'où : chemins absolus, ou <code>cd \"$(dirname \"$0\")\"</code> en début de script." },

{ id:"b1-linux-02", lvl:1, dom:"Linux",
  q:"À quoi sert le pipe <code>|</code> et qu'est-ce qui transite dedans exactement ?",
  accept:["stdout vers stdin","sortie standard","chaine","enchainer"],
  explain:"Il connecte le <b>stdout</b> de la commande de gauche au <b>stdin</b> de celle de droite. Seul stdout passe — stderr continue vers le terminal, sauf <code>2>&1</code> ou <code>|&</code>. Les commandes s'exécutent en parallèle, pas l'une après l'autre." },

{ id:"b1-linux-03", lvl:1, dom:"Linux",
  q:"Que contient <code>/etc/passwd</code> et qu'est-ce qui n'y est PAS ?",
  accept:["pas les mots de passe","shadow","comptes","utilisateurs"],
  explain:"Les comptes utilisateurs : login, UID, GID, home, shell. Les mots de passe hachés sont dans <code>/etc/shadow</code>, lisible uniquement par root — d'où le <code>x</code> dans le champ mot de passe de passwd." },

{ id:"b1-linux-04", lvl:1, dom:"Linux",
  q:"Que fait <code>&amp;&amp;</code> par rapport à <code>;</code> entre deux commandes ?",
  accept:["si la premiere reussit","code de retour 0","conditionnel","succes"],
  explain:"<code>;</code> enchaîne inconditionnellement. <code>&amp;&amp;</code> n'exécute la seconde que si la première a retourné 0 (succès). <code>||</code> fait l'inverse : seulement en cas d'échec. C'est la base du <code>cmd || exit 1</code> dans les scripts." },

{ id:"b1-linux-05", lvl:1, dom:"Linux",
  q:"À quoi sert la variable <code>PATH</code> ?",
  accept:["repertoires de recherche","ou chercher les executables","liste de chemins"],
  explain:"Elle liste les répertoires où le shell cherche un exécutable quand on tape son nom sans chemin. <code>which</code>/<code>command -v</code> montre lequel est retenu (le premier trouvé). Piège de sécurité : ne jamais mettre <code>.</code> dans le PATH." },

{ id:"b1-docker-01", lvl:1, dom:"Docker",
  q:"Que fait <code>docker run</code> par rapport à <code>docker start</code> ?",
  accept:["cree un nouveau conteneur","relance un existant","creation"],
  explain:"<code>run</code> = <code>create</code> + <code>start</code> : il crée un NOUVEAU conteneur depuis une image. <code>start</code> relance un conteneur existant déjà créé (avec sa couche d'écriture et sa config). Enchaîner des <code>run</code> laisse des dizaines de conteneurs arrêtés qui remplissent le disque." },

{ id:"b1-docker-02", lvl:1, dom:"Docker",
  q:"À quoi sert <code>EXPOSE 8080</code> dans un Dockerfile ? Ça publie le port ?",
  accept:["documentation","ne publie pas","non","metadonnee","-p"],
  explain:"Non : c'est purement déclaratif (métadonnée + utilisable par <code>-P</code>). Pour rendre le port joignable depuis l'hôte il faut <code>-p 8080:8080</code> au run, ou un Service côté Kubernetes. Beaucoup de candidats se trompent là-dessus." },

{ id:"b1-docker-03", lvl:1, dom:"Docker",
  q:"À quoi sert un fichier <code>.dockerignore</code> ?",
  accept:["exclure du contexte","reduire le contexte","eviter d envoyer","secrets"],
  explain:"Il exclut des fichiers du CONTEXTE de build envoyé au daemon. Double bénéfice : builds beaucoup plus rapides (on n'envoie pas <code>node_modules</code> ni <code>.git</code>) et sécurité (on n'embarque pas <code>.env</code> ou des clés par un <code>COPY . .</code>)." },

{ id:"b1-k8s-01", lvl:1, dom:"Kubernetes",
  q:"Que signifie « Kubernetes est déclaratif » dans la pratique quotidienne ?",
  accept:["etat desire","yaml","reconcilie","tu decris le resultat"],
  explain:"Tu décris l'état voulu dans un manifeste (3 réplicas de cette image) et le cluster s'arrange en permanence pour l'atteindre et le maintenir. Tu ne dis jamais « démarre ce conteneur sur ce serveur ». Corollaire : supprimer un Pod à la main ne sert à rien, le contrôleur le recrée." },

{ id:"b1-k8s-02", lvl:1, dom:"Kubernetes",
  q:"Quelle est la différence entre <code>kubectl apply</code> et <code>kubectl create</code> ?",
  accept:["apply idempotent","create echoue si existe","met a jour","declaratif"],
  explain:"<code>create</code> est impératif : il échoue si l'objet existe déjà. <code>apply</code> est déclaratif et idempotent : il crée ou met à jour en calculant un diff (via l'annotation last-applied ou le server-side apply). En pipeline, c'est toujours <code>apply</code>." },

{ id:"b1-k8s-03", lvl:1, dom:"Kubernetes",
  q:"Que se passe-t-il si tu supprimes manuellement un Pod géré par un Deployment ?",
  accept:["recree","remplace","le controleur","nouveau pod"],
  explain:"Le ReplicaSet constate qu'il manque un réplica et en crée un nouveau (avec un nouveau nom et une nouvelle IP). C'est la boucle de réconciliation. Pour vraiment arrêter le service, il faut modifier le Deployment (réplicas à 0) ou le supprimer." },

{ id:"b1-tf-01", lvl:1, dom:"Terraform",
  q:"Que fait <code>terraform fmt</code> et pourquoi le mettre en CI ?",
  accept:["formate","indentation","canonique","coherence"],
  explain:"Il réécrit les fichiers au format canonique HCL. En CI on utilise <code>terraform fmt -check -recursive</code> qui échoue si du code n'est pas formaté : ça supprime définitivement les débats de style en revue de code et les diffs parasites." },

{ id:"b1-tf-02", lvl:1, dom:"Terraform",
  q:"Quelle est la différence entre <code>terraform validate</code> et <code>terraform plan</code> ?",
  accept:["hors ligne","sans appel api","syntaxe","coherence interne","plan interroge"],
  explain:"<code>validate</code> vérifie la syntaxe et la cohérence interne SANS appeler les API du cloud ni lire le state — donc très rapide, utilisable sans credentials. <code>plan</code> interroge réellement le fournisseur et compare avec le state." },

{ id:"b1-tf-03", lvl:1, dom:"Terraform",
  q:"À quoi sert un fichier <code>.tfvars</code> ?",
  accept:["valeurs des variables","par environnement","separer","alimenter"],
  explain:"Il fournit les valeurs des variables d'entrée, séparément du code : <code>terraform apply -var-file=prod.tfvars</code>. <code>terraform.tfvars</code> et <code>*.auto.tfvars</code> sont chargés automatiquement. Ne jamais y mettre de secret commité." },

{ id:"b1-aws-01", lvl:1, dom:"AWS",
  q:"Qu'est-ce qu'un bucket S3 et quelle est la contrainte sur son nom ?",
  accept:["globalement unique","unique au monde","conteneur d objets","dns"],
  explain:"Un conteneur d'objets. Son nom est <b>globalement unique sur tout AWS</b> (il fait partie d'un nom DNS), en minuscules, sans underscore. D'où les conventions de nommage avec préfixe entreprise + compte + région." },

{ id:"b1-aws-02", lvl:1, dom:"AWS",
  q:"Différence entre une IP publique EC2 et une Elastic IP ?",
  accept:["change au redemarrage","fixe","statique","reservee"],
  explain:"L'IP publique auto-assignée change à chaque arrêt/démarrage de l'instance. Une Elastic IP est une IP fixe réservée à ton compte, réattachable à une autre instance — utile pour du whitelisting partenaire ou un enregistrement DNS. Elle est facturée quand elle n'est PAS attachée." },

{ id:"b1-aws-03", lvl:1, dom:"AWS",
  q:"Qu'est-ce qu'AWS CloudFormation, et son équivalent Azure ?",
  accept:["iac natif","arm","bicep","templates"],
  explain:"C'est l'IaC native d'AWS (templates YAML/JSON, notion de <em>stack</em>, état géré par AWS). L'équivalent Azure est ARM / Bicep. Différence avec Terraform : pas de state à gérer soi-même, mais mono-cloud." },

{ id:"b1-az-01", lvl:1, dom:"Azure",
  q:"Qu'est-ce qu'un App Service Plan et pourquoi c'est un piège de facturation ?",
  accept:["ressources de calcul","factures meme sans app","tier","mutualise"],
  explain:"C'est le socle de calcul (VM sous-jacente, tier, nombre d'instances) sur lequel tournent une ou plusieurs App Services. On paie le PLAN, pas l'app : un plan Premium vide continue de coûter. Plusieurs apps sur un même plan se partagent CPU et mémoire." },

{ id:"b1-az-02", lvl:1, dom:"Azure",
  q:"À quoi sert Azure Blob Storage et quels sont ses tiers d'accès ?",
  accept:["hot","cool","archive","objet","non structure"],
  explain:"Stockage d'objets non structurés (fichiers, images, sauvegardes, logs). Tiers : Hot (accès fréquent, stockage cher / accès peu cher), Cool (30 j min), Cold, Archive (180 j min, réhydratation de plusieurs heures). On automatise le passage par des règles de cycle de vie." },

{ id:"b1-res-01", lvl:1, dom:"Réseau",
  q:"Quelle différence entre le port 80 et le port 443 ?",
  accept:["http","https","chiffre","tls"],
  explain:"80 = HTTP en clair, 443 = HTTPS (HTTP sur TLS). En production on redirige systématiquement 80 → 443 et on active HSTS pour que le navigateur n'essaie même plus le port 80." },

{ id:"b1-res-02", lvl:1, dom:"Réseau",
  q:"À quoi sert le fichier <code>/etc/hosts</code> et quelle est sa priorité par rapport au DNS ?",
  accept:["resolution locale","avant le dns","prioritaire","statique"],
  explain:"Il fait une résolution nom → IP locale, consultée AVANT le DNS (selon <code>/etc/nsswitch.conf</code>). Pratique pour tester une bascule ou contourner un DNS. Piège : un <code>/etc/hosts</code> oublié sur un serveur provoque des comportements incompréhensibles." },

{ id:"b1-res-03", lvl:1, dom:"Réseau",
  q:"Qu'est-ce qu'une passerelle par défaut (default gateway) ?",
  accept:["route par defaut","0.0.0.0/0","sortie du reseau","routeur"],
  explain:"C'est l'équipement vers lequel on envoie tout paquet dont la destination n'est pas sur le réseau local — la route <code>0.0.0.0/0</code>. Dans un VPC, ce rôle est tenu par l'Internet Gateway ou le NAT Gateway selon le subnet." },

{ id:"b1-git-01", lvl:1, dom:"Git",
  q:"À quoi sert le fichier <code>.gitignore</code> et que fait-il si le fichier est DÉJÀ suivi ?",
  accept:["ignorer","rien","deja suivi","git rm --cached"],
  explain:"Il empêche Git de suivre les fichiers correspondants. Mais il n'a AUCUN effet sur un fichier déjà suivi : il faut d'abord <code>git rm --cached fichier</code>. C'est la raison n°1 pour laquelle un <code>.env</code> continue d'apparaître dans les commits." },

{ id:"b1-git-02", lvl:1, dom:"Git",
  q:"Qu'est-ce qu'une branche Git, techniquement ?",
  accept:["pointeur","reference","vers un commit","leger"],
  explain:"Un simple pointeur mobile vers un commit (un fichier de 41 octets dans <code>.git/refs/heads/</code>). C'est pour ça que créer une branche est instantané et gratuit — contrairement à d'autres SCM où c'est une copie." },

{ id:"b1-git-03", lvl:1, dom:"Git",
  q:"Que fait <code>git clone</code> par rapport à <code>git init</code> ?",
  accept:["copie un depot existant","cree un depot vide","distant","origin"],
  explain:"<code>init</code> crée un dépôt vide localement. <code>clone</code> copie un dépôt distant complet (tout l'historique, toutes les branches) et configure automatiquement le remote <code>origin</code> ainsi que la branche de suivi." },

{ id:"b1-cicd-01", lvl:1, dom:"CI/CD",
  q:"Qu'est-ce qu'un runner (ou agent) de CI ?",
  accept:["machine qui execute","execute les jobs","worker"],
  explain:"C'est la machine (VM, conteneur, pod) qui exécute réellement les jobs du pipeline. Hébergé par le fournisseur (shared) ou par toi (self-hosted, souvent obligatoire en banque pour accéder au réseau interne)." },

{ id:"b1-cicd-02", lvl:1, dom:"CI/CD",
  q:"Qu'est-ce qu'un webhook et à quoi ça sert dans une chaîne CI/CD ?",
  accept:["appel http","declenche","notification","evenement"],
  explain:"C'est un appel HTTP envoyé automatiquement par un système quand un événement se produit (push, PR ouverte, tag créé). C'est le mécanisme qui déclenche un pipeline sans polling. Il doit être signé/vérifié, sinon n'importe qui peut déclencher tes builds." },

{ id:"b1-sec-01", lvl:1, dom:"Sécurité",
  q:"Qu'est-ce que le MFA et pourquoi un mot de passe fort ne suffit-il pas ?",
  accept:["deuxieme facteur","authentification multifacteur","quelque chose que tu possedes","phishing"],
  explain:"L'authentification multifacteur combine plusieurs catégories : ce que tu SAIS (mot de passe), ce que tu POSSÈDES (clé, téléphone), ce que tu ES (biométrie). Un mot de passe, même fort, peut être volé par phishing ou fuite de base. Le MFA rend ce vol seul inexploitable — d'où son caractère obligatoire sur les comptes privilégiés." },

{ id:"b1-sec-02", lvl:1, dom:"Sécurité",
  q:"Quelle différence entre hacher et chiffrer un mot de passe ?",
  accept:["hachage irreversible","sens unique","chiffrement reversible","bcrypt"],
  explain:"Le hachage est à SENS UNIQUE : on ne peut pas revenir en arrière, on compare des empreintes. Le chiffrement est réversible avec la clé. Un mot de passe se HACHE (bcrypt, argon2, avec un sel), jamais ne se chiffre — sinon quiconque a la clé a tous les mots de passe." },

{ id:"b1-obs-01", lvl:1, dom:"Observabilité",
  q:"Qu'est-ce qu'un dashboard utile par rapport à un dashboard décoratif ?",
  accept:["repond a une question","actionnable","decision","trop de graphiques"],
  explain:"Un dashboard utile répond à une question précise (« le service est-il sain ? », « où est le goulot ? ») et se lit en 10 secondes. Un dashboard à 40 graphiques ne se lit pas pendant un incident : on le regarde parce qu'il est joli, pas parce qu'il aide à décider." },

{ id:"b1-sre-01", lvl:1, dom:"SRE",
  q:"Qu'est-ce que la haute disponibilité, et en quoi diffère-t-elle de la reprise après sinistre ?",
  accept:["panne locale","automatique","dr = sinistre majeur","autre region","continuite"],
  explain:"La HA absorbe automatiquement une panne LOCALE (une instance, une AZ) sans intervention et sans coupure notable. Le DR répond à un sinistre MAJEUR (perte d'une région, corruption, ransomware) et implique généralement une bascule décidée, avec un RTO/RPO négociés. Beaucoup de candidats confondent les deux." },

{ id:"b1-sre-02", lvl:1, dom:"SRE",
  q:"Qu'est-ce qu'un single point of failure ? Donne un exemple qu'on oublie souvent.",
  accept:["point unique","spof","dns","certificat","une seule instance"],
  explain:"Un composant dont la panne suffit à tout arrêter. Les exemples oubliés : le DNS, l'autorité de certification, le service d'authentification, le registry d'images, le coffre à secrets — et parfois le pipeline CI dont dépend le rollback." },

{ id:"b1-sql-01", lvl:1, dom:"SQL",
  q:"Qu'est-ce qu'une clé primaire et une clé étrangère ?",
  accept:["identifie de maniere unique","reference","integrite referentielle","unique"],
  explain:"La clé primaire identifie de façon unique chaque ligne d'une table (unique + non nulle, indexée automatiquement). La clé étrangère référence la clé primaire d'une autre table et garantit l'intégrité référentielle : on ne peut pas créer une commande pour un client inexistant." },

{ id:"b1-sql-02", lvl:1, dom:"SQL",
  q:"Que fait <code>COMMIT</code> et que fait <code>ROLLBACK</code> ?",
  accept:["valide","annule","transaction","definitif"],
  explain:"<code>COMMIT</code> valide définitivement la transaction : les modifications deviennent visibles aux autres et durables. <code>ROLLBACK</code> annule tout depuis le début de la transaction. Tant qu'on n'a pas commité, on tient des verrous — d'où la règle des transactions courtes." },

{ id:"b1-sql-03", lvl:1, dom:"SQL",
  q:"Différence entre <code>DELETE</code>, <code>TRUNCATE</code> et <code>DROP</code> ?",
  must:[["ligne","where","transactionnel"],["vide la table","toutes les lignes"],["supprime la table","structure"]],
  explain:"<code>DELETE</code> supprime des lignes (avec WHERE), c'est journalisé et annulable. <code>TRUNCATE</code> vide toute la table très rapidement (peu de journalisation, remet souvent les séquences à zéro, souvent non annulable). <code>DROP</code> supprime la table elle-même, structure comprise." }

]);
