window.QBANK = (window.QBANK || []).concat([
/* ================= NIVEAU 1 — VOCABULAIRE & FONDATIONS ================= */

{ id:"n1-linux-01", lvl:1, dom:"Linux",
  q:"Que représente exactement le premier caractère de <code>drwxr-xr-x</code> dans une sortie <code>ls -l</code> ?",
  accept:["type","repertoire","dossier","directory","d pour"],
  explain:"C'est le TYPE de l'objet, pas une permission : <code>d</code> répertoire, <code>-</code> fichier ordinaire, <code>l</code> lien symbolique, <code>b</code>/<code>c</code> périphérique bloc/caractère, <code>s</code> socket, <code>p</code> pipe nommé." },

{ id:"n1-linux-02", lvl:1, dom:"Linux",
  q:"Traduis <code>chmod 640 fichier</code> en droits lisibles : qui peut faire quoi ?",
  must:[["proprietaire","owner","user"],["groupe","group"]],
  accept:["lecture ecriture","rw r","lit et ecrit"],
  explain:"6=rw- pour le propriétaire, 4=r-- pour le groupe, 0=--- pour les autres. Donc : le propriétaire lit et écrit, le groupe lit seulement, le reste du monde n'a aucun accès." },

{ id:"n1-linux-03", lvl:1, dom:"Linux",
  q:"Quelle est la différence entre <code>&gt;</code> et <code>&gt;&gt;</code> dans un shell ?",
  accept:["ecrase","remplace","truncate","ajoute a la fin","append"],
  explain:"<code>&gt;</code> écrase (truncate) le fichier cible, <code>&gt;&gt;</code> ajoute à la fin. Piège classique : <code>&gt;</code> vide le fichier même si la commande échoue ensuite." },

{ id:"n1-linux-04", lvl:1, dom:"Linux",
  q:"Que fait <code>2&gt;&amp;1</code> et pourquoi l'ordre <code>cmd &gt; f 2&gt;&amp;1</code> compte-t-il ?",
  accept:["stderr","erreur","descripteur 2","sortie d erreur"],
  explain:"Ça redirige stderr (fd 2) vers là où pointe stdout (fd 1) à cet instant. Écrit dans l'autre sens (<code>2&gt;&amp;1 &gt; f</code>), stderr part encore vers le terminal car il a copié la destination AVANT la redirection de stdout." },

{ id:"n1-git-01", lvl:1, dom:"Git",
  q:"Quelle est la différence fondamentale entre <code>git fetch</code> et <code>git pull</code> ?",
  accept:["pull = fetch + merge","fetch ne modifie pas","pull fusionne","merge automatique","rapatrie sans integrer"],
  explain:"<code>fetch</code> rapatrie les commits distants sans toucher à ta branche de travail. <code>pull</code> = <code>fetch</code> + <code>merge</code> (ou <code>rebase</code>) : il modifie ton working tree. En entretien : fetch d'abord, on regarde, puis on intègre." },

{ id:"n1-git-02", lvl:1, dom:"Git",
  q:"À quoi sert la zone d'index (staging area) de Git ?",
  accept:["preparer le commit","selectionner","zone intermediaire","choisir ce qui part","construire le prochain commit"],
  explain:"C'est le brouillon du prochain commit : elle permet de choisir précisément QUELS changements partent dans le commit, y compris des morceaux de fichier (<code>git add -p</code>). Un commit est un instantané de l'index, pas du disque." },

{ id:"n1-docker-01", lvl:1, dom:"Docker",
  q:"Quelle est la différence entre une image et un conteneur Docker ?",
  accept:["image = modele","template","lecture seule","instance","conteneur = image en execution","classe et instance"],
  explain:"L'image est un modèle immuable en lecture seule (empilement de couches). Le conteneur est une instance en cours d'exécution de cette image, avec une couche d'écriture éphémère au-dessus. Analogie : classe / objet." },

{ id:"n1-docker-02", lvl:1, dom:"Docker",
  q:"Pourquoi dit-on qu'un conteneur n'est PAS une machine virtuelle ?",
  accept:["partage le noyau","meme kernel","pas d os complet","isolation par namespaces","pas d hyperviseur"],
  explain:"Un conteneur partage le noyau de l'hôte et n'est qu'un processus isolé (namespaces + cgroups). Une VM embarque un OS complet au-dessus d'un hyperviseur. D'où : démarrage en ms, mais isolation plus faible et dépendance au kernel Linux." },

{ id:"n1-k8s-01", lvl:1, dom:"Kubernetes",
  q:"Qu'est-ce qu'un Pod, et pourquoi Kubernetes n'orchestre-t-il pas directement des conteneurs ?",
  accept:["plus petite unite","unite deployable","un ou plusieurs conteneurs","partagent le reseau","meme ip"],
  explain:"Le Pod est la plus petite unité déployable : un ou plusieurs conteneurs qui partagent la même IP, les mêmes volumes et le même namespace réseau. Il permet le pattern sidecar (proxy, log shipper) et donne un cycle de vie commun." },

{ id:"n1-k8s-02", lvl:1, dom:"Kubernetes",
  q:"Qu'est-ce qu'un Service Kubernetes résout comme problème ?",
  accept:["ip instable","pods ephemeres","point d entree stable","load balancing","adresse fixe","decouverte"],
  explain:"Les Pods sont éphémères et changent d'IP à chaque recréation. Le Service fournit une IP virtuelle + un nom DNS stables et répartit le trafic sur les Pods correspondant à son selector." },

{ id:"n1-tf-01", lvl:1, dom:"Terraform",
  q:"Qu'est-ce que ça change concrètement que Terraform soit déclaratif plutôt qu'impératif ?",
  accept:["etat final","etat desire","le quoi pas le comment","idempotent","terraform calcule"],
  explain:"Tu décris l'état FINAL voulu ; Terraform compare cet état au state et calcule lui-même les actions. Conséquence pratique : c'est idempotent — relancer un apply sans changement ne fait rien. Un script bash, lui, rejoue tout." },

{ id:"n1-tf-02", lvl:1, dom:"Terraform",
  q:"À quoi sert le fichier <code>terraform.tfstate</code> ? Pourquoi est-il critique ?",
  accept:["correspondance","mapping","memorise les ressources","lien entre le code et le reel","source de verite"],
  explain:"Il mémorise la correspondance entre ton code et les ressources réelles (IDs, attributs). Sans lui Terraform ne sait plus ce qu'il gère et voudrait tout recréer. Il contient souvent des secrets en clair : jamais dans Git, toujours en backend distant chiffré." },

{ id:"n1-tf-03", lvl:1, dom:"Terraform",
  q:"Quelle est la différence entre un bloc <code>resource</code> et un bloc <code>data</code> ?",
  accept:["data lit","lecture seule","resource cree","data ne gere pas","existant"],
  explain:"<code>resource</code> = Terraform crée et gère tout le cycle de vie (create/update/destroy). <code>data</code> = lecture seule d'un objet existant créé ailleurs, pour récupérer un ID ou un attribut. Un <code>destroy</code> ne supprime jamais une data source." },

{ id:"n1-aws-01", lvl:1, dom:"AWS",
  q:"Qu'est-ce qui différencie une Région AWS d'une Availability Zone ?",
  accept:["zone geographique","plusieurs az","datacenter","isolation physique","une region contient"],
  explain:"Une Région est une zone géographique (eu-west-3 = Paris) contenant plusieurs AZ. Une AZ est un ou plusieurs datacenters isolés physiquement, reliés aux autres AZ par un réseau à faible latence. La haute dispo se construit multi-AZ ; le DR se construit multi-région." },

{ id:"n1-aws-02", lvl:1, dom:"AWS",
  q:"Explique le modèle de responsabilité partagée AWS avec un exemple concret.",
  accept:["aws securise le cloud","toi dans le cloud","securite du cloud","securite dans le cloud","partage"],
  explain:"AWS assure la sécurité DU cloud (datacenters, hyperviseur, matériel, réseau physique). Le client assure la sécurité DANS le cloud (IAM, chiffrement, patchs de l'OS sur EC2, config des Security Groups, données). Exemple : un bucket S3 public, c'est ta faute, pas celle d'AWS." },

{ id:"n1-az-01", lvl:1, dom:"Azure",
  q:"À quoi sert un Resource Group dans Azure, et quelle contrainte impose-t-il ?",
  accept:["conteneur logique","regroupe des ressources","cycle de vie","supprime tout","une seule region"],
  explain:"C'est un conteneur logique regroupant des ressources partageant un cycle de vie. Toute ressource appartient à exactement un RG. Supprimer le RG supprime tout ce qu'il contient. Il porte aussi des tags et des assignations RBAC héritées." },

{ id:"n1-az-02", lvl:1, dom:"Azure",
  q:"Cite la hiérarchie de gestion Azure du plus large au plus fin.",
  must:[["management group","groupe d administration"],["subscription","abonnement"],["resource group","groupe de ressources"]],
  explain:"Management Group → Subscription → Resource Group → Ressource. Les policies et le RBAC s'héritent du haut vers le bas : une assignation au niveau subscription s'applique à tous les RG en dessous." },

{ id:"n1-res-01", lvl:1, dom:"Réseau",
  q:"Que signifie le <code>/24</code> dans <code>10.0.1.0/24</code> et combien d'adresses ça représente ?",
  accept:["24 bits","masque","256","bits de reseau"],
  explain:"Les 24 premiers bits identifient le réseau, les 8 restants les hôtes : 2^8 = 256 adresses (dont réseau et broadcast). Sur AWS, 5 sont réservées par la plateforme → 251 utilisables." },

{ id:"n1-res-02", lvl:1, dom:"Réseau",
  q:"Quelle est la différence entre TCP et UDP, et quand choisit-on UDP ?",
  accept:["connexion","fiable","sans connexion","accuse de reception","ordre garanti","plus rapide"],
  explain:"TCP est orienté connexion (handshake, retransmission, ordre garanti, contrôle de flux). UDP est sans connexion, sans garantie, mais sans surcoût : on le choisit pour le DNS, le streaming, la VoIP, les métriques — là où la latence prime sur la perte." },

{ id:"n1-res-03", lvl:1, dom:"Réseau",
  q:"Que fait un enregistrement DNS de type <code>CNAME</code>, et quelle limite a-t-il à la racine d'un domaine ?",
  accept:["alias","pointe vers un autre nom","interdit a l apex","pas a la racine","zone apex"],
  explain:"Un CNAME est un alias vers un autre NOM. Interdit à l'apex du domaine (<code>exemple.com</code>) car la racine doit porter SOA et NS. D'où les enregistrements ALIAS/ANAME propriétaires (Route 53 Alias, Azure DNS Alias)." },

{ id:"n1-cicd-01", lvl:1, dom:"CI/CD",
  q:"Quelle est la différence entre Continuous Delivery et Continuous Deployment ?",
  accept:["validation manuelle","approbation","automatique en prod","bouton","deploiement automatique"],
  explain:"Continuous Delivery : chaque build est prêt à partir en prod mais un humain déclenche la mise en production. Continuous Deployment : tout build qui passe les tests part en prod automatiquement, sans intervention. En banque, on est presque toujours en Delivery." },

{ id:"n1-cicd-02", lvl:1, dom:"CI/CD",
  q:"Qu'est-ce qu'un artefact de build, et pourquoi ne doit-on le construire qu'une seule fois ?",
  accept:["build once","une seule fois","meme binaire","reproductible","promotion"],
  explain:"C'est le livrable produit par la CI (jar, image, package). Principe <em>build once, deploy many</em> : on construit un artefact unique versionné, puis on le PROMEUT de dev → recette → prod. Reconstruire par environnement, c'est risquer de déployer autre chose que ce qui a été testé." },

{ id:"n1-sec-01", lvl:1, dom:"Sécurité",
  q:"Différence entre authentification et autorisation ?",
  accept:["qui tu es","identite","ce que tu as le droit","permissions","droits"],
  explain:"Authentification = prouver QUI tu es (mot de passe, certificat, token). Autorisation = déterminer ce que tu as le DROIT de faire une fois identifié (RBAC, policies IAM). AuthN puis AuthZ, toujours dans cet ordre." },

{ id:"n1-sec-02", lvl:1, dom:"Sécurité",
  q:"Qu'est-ce que le principe du moindre privilège, et comment le vérifie-t-on en pratique ?",
  accept:["strict necessaire","minimum de droits","juste ce qu il faut","access analyzer","revue"],
  explain:"N'accorder que les permissions strictement nécessaires, pour la durée strictement nécessaire. En pratique on part de zéro et on ajoute, on audite avec IAM Access Analyzer / Access Advisor (AWS) ou les PIM/Access Reviews (Azure AD) pour retirer ce qui n'a jamais servi." },

{ id:"n1-obs-01", lvl:1, dom:"Observabilité",
  q:"Cite les trois piliers de l'observabilité et ce que chacun répond.",
  must:[["metrique","metrics"],["log","journaux"],["trace","tracing"]],
  explain:"Métriques (QUOI : agrégats numériques, alerting), Logs (POURQUOI : événements détaillés horodatés), Traces (OÙ : parcours d'une requête à travers les services distribués). Les trois se corrèlent par un trace/correlation ID." },

{ id:"n1-obs-02", lvl:1, dom:"Observabilité",
  q:"Quelle différence fais-tu entre monitoring et observabilité ?",
  accept:["questions connues","inconnues","known unknowns","anticipe","explorer"],
  explain:"Le monitoring répond à des questions qu'on a prévues (dashboards et seuils définis à l'avance). L'observabilité, c'est la capacité à répondre à des questions qu'on n'avait PAS anticipées, à partir des données émises, sans redéployer." },

{ id:"n1-sre-01", lvl:1, dom:"SRE",
  q:"Qu'est-ce qu'un SLI, un SLO et un SLA ? Lequel a des pénalités ?",
  must:[["indicateur","mesure","indicator"],["objectif","cible","objective"],["contrat","penalite","juridique"]],
  explain:"SLI = l'indicateur mesuré (ex : % de requêtes &lt; 300 ms). SLO = l'objectif interne visé (99,9 %). SLA = l'engagement contractuel envers le client, avec pénalités. Règle : SLA &lt; SLO, pour garder une marge avant de payer." },

{ id:"n1-sre-02", lvl:1, dom:"SRE",
  q:"Qu'est-ce qu'un error budget et à quoi sert-il concrètement dans une équipe ?",
  accept:["marge d indisponibilite","budget d erreur","100 moins le slo","droit a l echec","arbitrage"],
  explain:"C'est 100 % moins le SLO : avec un SLO à 99,9 %, tu as droit à ~43 min d'indispo par mois. Tant qu'il reste du budget, on déploie vite ; quand il est consommé, on gèle les features et on repasse sur la fiabilité. C'est l'outil d'arbitrage entre vitesse et stabilité." },

{ id:"n1-sql-01", lvl:1, dom:"SQL",
  q:"Que garantit chacune des lettres d'ACID ?",
  must:[["atomic","atomicite","tout ou rien"],["coherence","consistency","contraintes"],["isolation"],["durab","persist"]],
  explain:"Atomicité (tout ou rien), Cohérence (les contraintes restent respectées), Isolation (les transactions concurrentes ne se voient pas à moitié), Durabilité (une fois commité, ça survit à un crash)." },

{ id:"n1-sql-02", lvl:1, dom:"SQL",
  q:"Différence entre <code>INNER JOIN</code> et <code>LEFT JOIN</code> ?",
  accept:["correspondance des deux","seulement les lignes qui matchent","toutes les lignes de gauche","null a droite"],
  explain:"INNER JOIN ne garde que les lignes ayant une correspondance des deux côtés. LEFT JOIN garde TOUTES les lignes de la table de gauche, en remplissant de NULL quand il n'y a pas de correspondance à droite — d'où son usage pour trouver les orphelins (<code>WHERE b.id IS NULL</code>)." },

{ id:"n1-linux-05", lvl:1, dom:"Linux",
  q:"Quelle différence entre une variable shell et une variable d'environnement ?",
  accept:["export","heritee","processus enfant","transmise"],
  explain:"Une variable shell n'existe que dans le shell courant. <code>export VAR=x</code> la promeut en variable d'environnement : elle est alors héritée par les processus enfants. C'est exactement ce mécanisme qui transporte la config dans les conteneurs (12-factor)." },

{ id:"n1-docker-03", lvl:1, dom:"Docker",
  q:"Que se passe-t-il pour les données écrites dans le système de fichiers d'un conteneur quand il est supprimé ?",
  accept:["perdues","ephemere","disparaissent","volume"],
  explain:"Elles sont perdues : la couche d'écriture est liée au cycle de vie du conteneur. Pour persister il faut un volume (nommé ou bind mount), ou du stockage externe. Corollaire : un conteneur doit être stateless par défaut." },

{ id:"n1-k8s-03", lvl:1, dom:"Kubernetes",
  q:"Qu'est-ce qu'un namespace Kubernetes, et qu'est-ce qu'il n'isole PAS ?",
  accept:["cloisonnement logique","separation logique","pas le reseau","pas d isolation reseau","quotas"],
  explain:"C'est un cloisonnement LOGIQUE des objets (noms uniques par namespace, quotas, RBAC). Il n'isole PAS le réseau par défaut : un Pod du namespace A joint un Pod du namespace B, sauf NetworkPolicy. Il n'isole pas non plus les nœuds ni les objets cluster-scoped (Node, PV, ClusterRole)." },

{ id:"n1-tf-04", lvl:1, dom:"Terraform",
  q:"Que fait <code>terraform init</code> exactement ?",
  accept:["telecharge les providers","initialise le backend","modules","plugins"],
  explain:"Il initialise le répertoire de travail : téléchargement des providers et des modules, configuration du backend de state, création du lock file <code>.terraform.lock.hcl</code>. Obligatoire au premier usage et après tout changement de provider/backend/module." },

{ id:"n1-git-03", lvl:1, dom:"Git",
  q:"Qu'est-ce qu'un commit Git, techniquement ?",
  accept:["instantane","snapshot","pointeur","arbre","hash","parent"],
  explain:"Un objet immuable identifié par un SHA-1/SHA-256, contenant : un pointeur vers un arbre (l'instantané complet du projet), le ou les parents, l'auteur, la date et le message. Git stocke des instantanés, pas des diffs — les diffs sont calculés à l'affichage." }

]);
