/* Complément : comble les niveaux vides ou minces des blocs
   « Linux & Bash » et « Docker & Git » en réponses libres. */
window.QBANK = (window.QBANK || []).concat([

/* ---------- LINUX — niveau 4 ---------- */
{ id:"cx-lin-4-01", lvl:4, dom:"Linux",
  q:"Quelle est la différence entre <code>Requires=</code> et <code>After=</code> dans une unité systemd ?",
  accept:["dependance","ordre","requires exige","after ordonne","l un n implique pas l autre"],
  explain:"<code>Requires=</code> exprime une DÉPENDANCE (si l'autre unité échoue ou s'arrête, la nôtre est arrêtée). <code>After=</code> exprime seulement un ORDRE de démarrage. Les deux sont indépendants : <code>Requires=</code> sans <code>After=</code> démarre les deux en parallèle, ce qui est une source classique de service qui démarre avant sa base." },

{ id:"cx-lin-4-02", lvl:4, dom:"Linux",
  q:"Par défaut, les logs de journald survivent-ils à un redémarrage ? Comment changer ça ?",
  accept:["non","volatile","run log journal","storage persistent","var log journal"],
  explain:"Non par défaut sur beaucoup de distributions : le journal vit dans <code>/run/log/journal</code>, en mémoire, et disparaît au reboot. Pour le rendre persistant : <code>Storage=persistent</code> dans <code>journald.conf</code> (ou créer <code>/var/log/journal</code>), avec <code>SystemMaxUse=</code> pour borner la taille." },

{ id:"cx-lin-4-03", lvl:4, dom:"Linux",
  q:"Que fait <code>systemctl mask</code> de plus que <code>disable</code> ?",
  accept:["lien vers dev null","impossible a demarrer","empeche tout demarrage","meme manuellement"],
  explain:"<code>disable</code> retire le démarrage automatique, mais l'unité reste démarrable à la main ou par dépendance. <code>mask</code> crée un lien vers <code>/dev/null</code> : l'unité devient totalement indémarrable. C'est ce qu'on utilise pour neutraliser un service qu'un paquet réactiverait à chaque mise à jour." },

{ id:"cx-lin-4-04", lvl:4, dom:"Linux",
  q:"À quoi sert <code>sysctl</code> et comment rendre un réglage permanent ?",
  accept:["parametres du noyau","runtime","sysctl.d","sysctl.conf","persistant"],
  explain:"Il lit et modifie les paramètres du noyau à chaud (<code>/proc/sys</code>). <code>sysctl -w</code> ne survit pas au reboot : il faut un fichier dans <code>/etc/sysctl.d/</code>. Réglages fréquents en production : <code>net.core.somaxconn</code>, <code>net.ipv4.tcp_max_syn_backlog</code>, <code>fs.file-max</code>, <code>vm.max_map_count</code> (exigé par Elasticsearch)." },

{ id:"cx-lin-4-05", lvl:4, dom:"Linux",
  q:"Comment donner à un binaire le droit d'ouvrir le port 80 sans le lancer en root ?",
  accept:["capability","cap_net_bind_service","setcap","capabilities"],
  explain:"<code>setcap 'cap_net_bind_service=+ep' /chemin/binaire</code>. Les capabilities découpent les privilèges de root en droits unitaires : on accorde exactement celui qui manque au lieu de tout donner. Alternative plus propre : écouter sur un port haut et laisser un reverse proxy exposer le 80." },

{ id:"cx-lin-4-06", lvl:4, dom:"Linux",
  q:"Quelle différence entre <code>/etc/security/limits.conf</code> et les directives de limite d'une unité systemd ?",
  accept:["session pam","service systemd","ne s applique pas","limitnofile"],
  explain:"<code>limits.conf</code> est appliqué par PAM, donc uniquement aux sessions utilisateur (login, SSH). Un service lancé par systemd n'y passe pas : il faut <code>LimitNOFILE=</code>, <code>LimitNPROC=</code> dans l'unité. C'est LA raison pour laquelle « j'ai pourtant augmenté ulimit » ne change rien à un daemon." },

/* ---------- LINUX — niveau 5 ---------- */
{ id:"cx-lin-5-01", lvl:5, dom:"Linux",
  q:"Un service refuse d'écrire dans un répertoire alors que les permissions POSIX sont bonnes. Quelle piste ?",
  accept:["selinux","apparmor","contexte","mac","audit2why","getenforce"],
  explain:"Un contrôle d'accès obligatoire (SELinux ou AppArmor) par-dessus les permissions POSIX. Diagnostic : <code>getenforce</code>, puis <code>ausearch -m avc</code> / <code>audit2why</code> pour lire le refus. Correctif propre : poser le bon contexte (<code>semanage fcontext</code> + <code>restorecon</code>), pas désactiver SELinux — ce que beaucoup font et qu'un auditeur relèvera." },

{ id:"cx-lin-5-02", lvl:5, dom:"Linux",
  q:"Quelle est la différence entre iptables et nftables ?",
  accept:["successeur","syntaxe unifiee","une seule table","performance","remplace"],
  explain:"nftables est le successeur : une syntaxe unifiée pour IPv4/IPv6/ARP/bridge, un seul cadre au lieu de quatre outils, de meilleures performances sur de grands jeux de règles (ensembles et maps natifs), et des règles atomiquement rechargeables. <code>iptables</code> moderne est d'ailleurs souvent un frontal traduisant vers nftables." },

{ id:"cx-lin-5-03", lvl:5, dom:"Linux",
  q:"À quoi sert auditd et en quoi diffère-t-il de journald ?",
  accept:["audit de securite","appels systeme","regles","tracabilite","qui a accede"],
  explain:"auditd enregistre les événements de SÉCURITÉ au niveau du noyau : accès à un fichier sensible, appels système précis, changements de privilèges — avec des règles ciblées. journald collecte les logs applicatifs et système. En banque, auditd sert la traçabilité réglementaire : qui a lu <code>/etc/shadow</code>, qui a exécuté quoi en root." },

{ id:"cx-lin-5-04", lvl:5, dom:"Linux",
  q:"Comment chiffre-t-on un disque au repos sous Linux, et quel est le point critique en exploitation ?",
  accept:["luks","cryptsetup","dm-crypt","cle au demarrage","deverrouillage"],
  explain:"LUKS/dm-crypt (<code>cryptsetup</code>). Le point critique n'est pas le chiffrement mais le DÉVERROUILLAGE : au redémarrage, il faut fournir la clé sans intervention humaine — d'où l'usage d'un TPM, d'un serveur de clés (Tang/Clevis) ou du chiffrement managé du cloud. Une machine qui attend une passphrase au boot ne redémarre pas toute seule à 3 h du matin." },

{ id:"cx-lin-5-05", lvl:5, dom:"Linux",
  q:"Que règle <code>net.ipv4.ip_local_port_range</code> et quand faut-il y toucher ?",
  accept:["ports ephemeres","plage","epuisement","beaucoup de connexions sortantes"],
  explain:"La plage des ports source utilisables pour les connexions SORTANTES. Sur un proxy ou un serveur qui ouvre des dizaines de milliers de connexions vers un même couple IP:port de destination, on épuise la plage et les connexions échouent. On l'élargit, mais la vraie réponse est le keep-alive et le pooling de connexions." },

{ id:"cx-lin-5-06", lvl:5, dom:"Linux",
  q:"Quelle est la différence entre un utilisateur système et un utilisateur normal ?",
  accept:["uid","inferieur a 1000","pas de home","shell nologin","pas de connexion"],
  explain:"Convention d'UID : en dessous de 1000 (souvent &lt; 500 selon la distribution) pour les comptes système, au-dessus pour les humains. Un compte de service se crée avec <code>--system</code>, sans home, sans mot de passe et avec <code>/usr/sbin/nologin</code> comme shell — pour qu'une compromission du service ne donne pas une session interactive." },

{ id:"cx-lin-5-07", lvl:5, dom:"Linux",
  q:"Comment durcir un service systemd sans modifier son code ?",
  accept:["protectsystem","privatetmp","nonewprivileges","protecthome","directives de durcissement"],
  explain:"Les directives de sandboxing de l'unité : <code>ProtectSystem=strict</code>, <code>ProtectHome=yes</code>, <code>PrivateTmp=yes</code>, <code>NoNewPrivileges=yes</code>, <code>RestrictAddressFamilies=</code>, <code>SystemCallFilter=</code>, <code>CapabilityBoundingSet=</code>. <code>systemd-analyze security mon.service</code> donne un score et liste ce qui manque — outil très parlant en revue de sécurité." },

/* ---------- LINUX — niveau 7 ---------- */
{ id:"cx-lin-7-01", lvl:7, dom:"Linux",
  q:"Infrastructure immuable ou patching en place : comment arbitres-tu sur un parc de VM ?",
  accept:["reconstruire","image doree","packer","derive","depend du legacy"],
  explain:"Immuable par défaut : on reconstruit une image (Packer + Ansible), on la teste, on remplace les machines. Bénéfices : pas de dérive, retour arrière = redéployer l'image précédente, environnements reproductibles. Le patching en place reste nécessaire pour le legacy à état, les appliances, et les correctifs d'urgence hors cycle. L'arbitrage porte sur la capacité à remplacer une machine sans douleur." },

{ id:"cx-lin-7-02", lvl:7, dom:"Linux",
  q:"Comment prépares-tu un serveur à tenir 100 000 connexions simultanées ?",
  must:[["descripteurs","fichiers ouverts","nofile"],["conntrack","backlog","somaxconn","tcp"]],
  explain:"Descripteurs de fichiers (<code>LimitNOFILE</code>, <code>fs.file-max</code>), backlog d'écoute (<code>net.core.somaxconn</code> ET le backlog demandé par l'application, souvent le vrai plafond), table conntrack si NAT ou firewall stateful, plage de ports éphémères, mémoire des buffers TCP. Et surtout : mesurer où ça casse réellement plutôt que de copier une liste de sysctl trouvée en ligne." },

{ id:"cx-lin-7-03", lvl:7, dom:"Linux",
  q:"Qu'est-ce que le kernel live patching et quelle est sa limite ?",
  accept:["sans redemarrer","correctif a chaud","kpatch","livepatch","pas tous les correctifs"],
  explain:"Il applique certains correctifs de sécurité du noyau sans redémarrer (kpatch, Ksplice, Canonical Livepatch). Limite : tous les correctifs ne sont pas éligibles — un changement de structure de données impose un vrai reboot. C'est un outil pour absorber l'urgence, pas pour ne jamais redémarrer : un parc qui n'a pas rebooté depuis deux ans cache d'autres problèmes." },

{ id:"cx-lin-7-04", lvl:7, dom:"Linux",
  q:"Comment gères-tu les secrets sur une VM qui ne peut pas utiliser d'identité cloud ?",
  accept:["agent","vault","permissions strictes","tmpfs","recuperation au demarrage"],
  explain:"Un agent local qui s'authentifie (Vault Agent avec AppRole ou certificat machine) et dépose le secret dans un tmpfs à permissions strictes, renouvelé automatiquement. À défaut : fichier lisible par le seul utilisateur du service, monté en mémoire, jamais dans l'image ni dans le dépôt. Et journalisation des accès. Le pire schéma reste le secret en variable d'environnement visible dans <code>/proc/&lt;pid&gt;/environ</code>." },

{ id:"cx-lin-7-05", lvl:7, dom:"Linux",
  q:"Quelle stratégie de rotation et de centralisation des logs sur un parc de serveurs ?",
  must:[["rotation","logrotate","taille"],["centralisation","agent","expedition","siem"]],
  explain:"Rotation locale bornée en taille (pas seulement en durée, sinon un pic remplit le disque) avec compression, ET expédition immédiate vers un collecteur central par un agent (Fluent Bit, Vector, rsyslog). Le local ne sert que de tampon en cas de coupure. Point souvent oublié : le disque de logs doit être une partition séparée pour qu'une saturation ne bloque pas le système." },

{ id:"cx-lin-7-06", lvl:7, dom:"Linux",
  q:"Comment mesures-tu la capacité réelle d'un serveur avant de le mettre en production ?",
  accept:["test de charge","point de rupture","profil","metrique","representatif"],
  explain:"Un test de charge représentatif du trafic réel (pas un ping), monté progressivement jusqu'au point de rupture, en observant CPU, mémoire, iowait, descripteurs, latence par percentile. On identifie le facteur limitant — presque jamais le CPU, souvent la base, un pool ou le disque. Puis on dimensionne avec une marge et on documente le chiffre pour l'autoscaling." },

{ id:"cx-lin-7-07", lvl:7, dom:"Linux",
  q:"Quelle différence entre un conteneur et une VM légère type Firecracker, et quand choisit-on la seconde ?",
  accept:["noyau dedie","isolation forte","microvm","multi-tenant","voisin non fiable"],
  explain:"Une microVM embarque son propre noyau derrière un hyperviseur minimaliste : l'isolation est celle d'une VM, le démarrage reste de l'ordre de la centaine de millisecondes. On la choisit quand on exécute du code non fiable ou multi-tenant (fonctions serverless, CI de contributeurs externes), là où un simple namespace ne suffit pas comme frontière de sécurité." },

/* ---------- LINUX — niveau 9 ---------- */
{ id:"cx-lin-9-01", lvl:9, dom:"Linux",
  q:"Comment industrialises-tu le patching de 2000 serveurs en environnement bancaire ?",
  must:[["par vagues","progressif","lots","anneaux"],["fenetre","conformite","rapport","validation"]],
  explain:"Inventaire fiable d'abord, puis déploiement par anneaux (bac à sable → non-prod → prod non critique → prod critique) dans des fenêtres de maintenance négociées, avec validation automatique entre chaque anneau et capacité de retour arrière. Tableau de bord de conformité suivi par le RSSI, délais contractualisés par criticité de CVE, et exemptions datées pour ce qui ne peut pas être patché." },

{ id:"cx-lin-9-02", lvl:9, dom:"Linux",
  q:"Qu'est-ce qu'un benchmark CIS et comment l'appliques-tu sans casser la production ?",
  accept:["referentiel de durcissement","audit d abord","mode rapport","exceptions","progressif"],
  explain:"Un référentiel de durcissement par système, avec des règles numérotées et deux niveaux de sévérité. On l'applique en commençant par un AUDIT (mode rapport, avec OpenSCAP ou un rôle Ansible en check), on mesure l'écart, on traite par lots en validant à chaque étape, et on documente les exceptions justifiées. Appliquer un profil complet d'un coup sur un serveur existant casse presque toujours quelque chose." },

{ id:"cx-lin-9-03", lvl:9, dom:"Linux",
  q:"Comment garantis-tu l'intégrité d'un serveur de production dans la durée ?",
  must:[["detection de modification","aide","integrite","fichiers"],["immuable","reconstruction","comparaison"]],
  explain:"Contrôle d'intégrité des fichiers (AIDE, Tripwire, ou l'agent EDR) avec une base de référence stockée hors de la machine, journalisation auditd des changements sensibles, et surtout infrastructure immuable : si le serveur est reconstruit à partir d'une image versionnée, toute divergence est détectable par comparaison plutôt que par confiance." },

{ id:"cx-lin-9-04", lvl:9, dom:"Linux",
  q:"Que signifie « mode FIPS » et pourquoi une banque peut l'exiger ?",
  accept:["algorithmes certifies","conformite","validation cryptographique","restreint"],
  explain:"Le système n'utilise que des implémentations cryptographiques validées par la norme FIPS 140, et refuse les algorithmes non approuvés. Certains contextes réglementaires ou contrats l'imposent. Conséquence pratique à connaître : des applications cessent de fonctionner parce qu'elles utilisaient MD5 ou une bibliothèque non conforme — c'est à tester bien avant la mise en production." },

{ id:"cx-lin-9-05", lvl:9, dom:"Linux",
  q:"Comment traites-tu un serveur suspecté de compromission ?",
  must:[["isoler","reseau","ne pas eteindre"],["preuve","memoire","image","analyse"]],
  explain:"On ISOLE au niveau réseau sans éteindre (la mémoire vive contient des preuves), on capture une image mémoire et disque, on préserve les journaux hors de la machine, on documente la chronologie. Puis on RECONSTRUIT à partir d'une source saine plutôt que de nettoyer — on ne fait plus confiance à un système compromis. Et on notifie selon les obligations réglementaires." },

{ id:"cx-lin-9-06", lvl:9, dom:"Linux",
  q:"Comment gères-tu la fin de support d'une distribution sur un parc important ?",
  accept:["planifier","inventaire","migration progressive","support etendu","risque"],
  explain:"On planifie AVANT la date : inventaire des machines et de leurs applications, tests de compatibilité, migration par vagues avec une image cible validée. Le support étendu payant (ELS/ESM) sert de filet pour ce qui ne peut pas migrer à temps, pas de solution durable. Un système hors support en production est un constat d'audit, même s'il fonctionne parfaitement." },

{ id:"cx-lin-9-07", lvl:9, dom:"Linux",
  q:"Comment démontres-tu à un auditeur qui a fait quoi en root sur un serveur ?",
  must:[["sudo","journal","nominatif"],["auditd","session","enregistrement","centralise"]],
  explain:"Connexion nominative obligatoire puis élévation par <code>sudo</code> (jamais de login root direct, jamais de mot de passe root partagé), journaux sudo et auditd expédiés EN TEMPS RÉEL vers un collecteur central que l'administrateur local ne peut pas modifier, et enregistrement de session pour les accès privilégiés. Sans expédition externe, un attaquant root efface simplement les traces." },

{ id:"cx-lin-9-08", lvl:9, dom:"Linux",
  q:"Quel est l'intérêt et le coût d'un accès administrateur juste-à-temps sur un parc Linux ?",
  accept:["pas de compte permanent","elevation temporaire","approbation","complexite","procedure de secours"],
  explain:"Intérêt : plus de comptes privilégiés permanents à compromettre, chaque élévation est demandée, approuvée, tracée et expire seule. Coût : une brique à opérer (le gestionnaire d'accès devient critique), une friction pour les équipes, et surtout l'obligation d'un chemin de secours si le système d'élévation tombe — sinon plus personne n'entre en pleine panne." },

/* ---------- LINUX — niveau 10 ---------- */
{ id:"cx-lin-10-01", lvl:10, dom:"Linux",
  q:"« Un serveur rame, vous avez 5 minutes et un SSH. » Comment structures-tu ta réponse à l'oral ?",
  must:[["general au fin","methodique","ordre"],["systeme","puis application"]],
  explain:"Annonce ta méthode AVANT de citer des commandes : « je pars du plus général vers le plus fin ». 1) Charge, mémoire, swap. 2) I/O et iowait. 3) Disque et inodes. 4) Réseau et connexions. 5) Seulement ensuite l'application. Ce qui est évalué n'est pas la liste de commandes, c'est l'existence d'un ordre de dépouillement qui élimine des hypothèses." },

{ id:"cx-lin-10-02", lvl:10, dom:"Linux",
  q:"On te dit : « nos serveurs n'ont pas redémarré depuis 3 ans, c'est un gage de stabilité. » Que réponds-tu ?",
  accept:["correctifs noyau","risque","reboot jamais teste","derive","pas un gage"],
  explain:"C'est l'inverse d'un gage : les correctifs de sécurité du noyau ne sont pas appliqués, la configuration a dérivé sans qu'on sache si elle redémarrera correctement, et le jour où un reboot est imposé — panne électrique, incident — personne ne sait ce qui va se passer. Un redémarrage régulier est un TEST de la capacité à repartir. À formuler sans arrogance : c'est souvent un héritage, pas un choix." },

{ id:"cx-lin-10-03", lvl:10, dom:"Linux",
  q:"Un développeur veut les droits root sur les serveurs de production pour « aller plus vite ». Comment tu gères ?",
  accept:["comprendre le besoin","observabilite","acces temporaire","outiller","pourquoi"],
  explain:"On cherche le besoin réel derrière la demande : que veut-il voir ou faire ? Neuf fois sur dix, c'est lire des logs ou un état — ce qui doit être accessible SANS root, par l'observabilité. Pour le reste, élévation juste-à-temps tracée. Refuser sec sans traiter le besoin garantit qu'il trouvera un contournement, et là on aura perdu la traçabilité en plus." },

{ id:"cx-lin-10-04", lvl:10, dom:"Linux",
  q:"Comment expliques-tu à un non-technique pourquoi un serveur « plein » alors que le disque est à moitié vide ?",
  accept:["analogie","inodes","fichier ouvert","vulgariser","nombre de fichiers"],
  explain:"Analogie : « le disque, c'est un classeur. Il reste de la place dans les pages, mais on n'a plus d'intercalaires pour ranger un nouveau document. » Puis, si l'interlocuteur veut plus : soit les inodes sont épuisés par des millions de petits fichiers, soit un fichier supprimé est encore ouvert par un programme qui en retient l'espace. Savoir vulgariser sans être condescendant est évalué." },

{ id:"cx-lin-10-05", lvl:10, dom:"Linux",
  q:"« Vous préférez Red Hat ou Debian ? » — quel est le piège de cette question ?",
  accept:["pas de guerre de chapelle","support","contexte","ecosysteme","depend"],
  explain:"Le piège est de la traiter comme une préférence personnelle. La bonne réponse porte sur le CONTEXTE : support commercial et certifications applicatives d'un côté, cycle et souplesse de l'autre, plus la compétence existante de l'équipe et l'outillage déjà en place. En banque, le support contractuel et la conformité pèsent plus que le confort technique." },

{ id:"cx-lin-10-06", lvl:10, dom:"Linux",
  q:"Quelle est la commande Linux la plus dangereuse que tu aies lancée, et qu'en as-tu tiré ?",
  accept:["honnete","garde-fou","ce que j ai change","verification","exemple reel"],
  explain:"Question d'honnêteté déguisée. Prends un exemple réel (un <code>rm -rf</code> mal ciblé, un <code>&gt;</code> sur un fichier de config, un <code>chown -R</code> à la racine), dis comment tu t'en es aperçu, ce que tu as fait dans les minutes suivantes, et surtout le garde-fou mis en place après : sauvegarde vérifiée, <code>--dry-run</code> systématique, confirmation sur les cibles de production. Répondre « jamais » sonne faux." },

/* ---------- DOCKER & GIT — niveau 7 ---------- */
{ id:"cx-dg-7-01", lvl:7, dom:"Docker",
  q:"Comment conçois-tu la stratégie de tags et de rétention d'un registry d'entreprise ?",
  must:[["immuable","digest","semver","tag"],["retention","purge","politique"]],
  explain:"Tags immuables (version sémantique ou SHA de commit), référence par digest en production, interdiction de réécrire un tag publié. Rétention par politique : on garde toutes les versions déployées en production et les N dernières par branche, on purge le reste automatiquement. Sans purge, un registry devient un poste de coût et de lenteur majeur en deux ans." },

{ id:"cx-dg-7-02", lvl:7, dom:"Docker",
  q:"Le registry devient un point de défaillance unique du cluster. Comment traites-tu ce risque ?",
  accept:["cache","miroir","replication","pull through","haute disponibilite"],
  explain:"Réplication ou géo-réplication du registry, cache pull-through au plus près des clusters, et surtout <code>imagePullPolicy: IfNotPresent</code> avec des images déjà présentes sur les nœuds pour que les Pods existants continuent de redémarrer. Point souvent oublié : si le registry tombe, on ne peut plus scaler NI faire de rollback — c'est une dépendance critique du plan de reprise." },

{ id:"cx-dg-7-03", lvl:7, dom:"Docker",
  q:"Comment réduis-tu le temps de démarrage d'un conteneur volumineux à grande échelle ?",
  accept:["couches partagees","image plus petite","prechargement","lazy pulling","cache sur le noeud"],
  explain:"Réduire l'image (multi-stage, base minimale), maximiser les couches PARTAGÉES entre images pour que le nœud n'en télécharge qu'une fois, précharger les images sur les nœuds (DaemonSet de warm-up ou image intégrée à l'AMI), et envisager le lazy pulling (eStargz, SOCI) qui démarre avant la fin du téléchargement. Sur un scale-out d'urgence, ces minutes comptent." },

{ id:"cx-dg-7-04", lvl:7, dom:"Git",
  q:"Monorepo ou multi-repo pour 40 microservices ? Quels sont les vrais critères ?",
  must:[["refactoring","coherence","transverse","atomique"],["outillage","ci","build selectif","cout"]],
  explain:"Monorepo : changement transverse atomique, une seule version de vérité pour les dépendances internes, refactoring simple — mais il faut de l'outillage (build sélectif, détection des impacts, gestion des droits par chemin) sinon la CI devient interminable. Multi-repo : autonomie et droits naturels, au prix de versions qui divergent et de changements transverses coûteux. Le critère décisif est la maturité de l'outillage, pas la préférence esthétique." },

{ id:"cx-dg-7-05", lvl:7, dom:"Git",
  q:"Comment gères-tu des fichiers volumineux dans Git sans faire exploser le dépôt ?",
  accept:["git lfs","pointeur","artefact","hors du depot","stockage externe"],
  explain:"Git LFS remplace le fichier par un pointeur et stocke le contenu ailleurs. Mais la vraie question est : ces fichiers ont-ils leur place dans Git ? Un binaire compilé ou un jeu de données appartient à un gestionnaire d'artefacts, pas au dépôt de code. Et attention : un gros fichier déjà commité reste dans l'historique — il faut le réécrire pour récupérer la place." },

{ id:"cx-dg-7-06", lvl:7, dom:"Git",
  q:"Comment structures-tu les droits sur un forge Git pour 15 équipes ?",
  must:[["groupe","equipe","par projet"],["codeowners","protection","revue"]],
  explain:"Droits par GROUPE et jamais nominatifs (sinon le départ d'une personne devient un chantier), organisation par équipe ou domaine, branches protégées avec CODEOWNERS pour que le bon expert soit sollicité automatiquement, et des droits en écriture réservés aux mainteneurs. Les revues d'accès périodiques sont ce que l'auditeur demandera, plus que la finesse du modèle." },

{ id:"cx-dg-7-07", lvl:7, dom:"Git",
  q:"Comment garantis-tu la traçabilité d'un livrable jusqu'à son commit d'origine ?",
  must:[["sha","commit","version"],["artefact","image","label","attestation"]],
  explain:"Le SHA du commit est injecté au build : dans le tag ou les labels OCI de l'image, dans les métadonnées de l'artefact, et exposé par l'application elle-même (endpoint de version). On complète par une attestation de provenance signée. Résultat : depuis un conteneur qui tourne en production, on remonte au commit, à la PR et à son approbateur — c'est exactement ce qu'un auditeur demande." },

/* ---------- DOCKER & GIT — niveau 9 ---------- */
{ id:"cx-dg-9-01", lvl:9, dom:"Docker",
  q:"Comment démontres-tu la conformité de la chaîne de construction d'images à un auditeur ?",
  must:[["sbom","inventaire","composant"],["signature","attestation","provenance","preuve"]],
  explain:"SBOM généré à chaque build et conservé, image signée avec une attestation de provenance liant image, commit et pipeline, admission qui refuse toute image non signée, journal immuable des publications, et politique de scan avec délais de remédiation. La démonstration décisive : partir d'une CVE et montrer en quelques minutes quelles applications en production sont concernées." },

{ id:"cx-dg-9-02", lvl:9, dom:"Docker",
  q:"Comment gères-tu le cycle de vie des images de base sur un parc de 300 applications ?",
  must:[["reconstruction","automatique","rebuild"],["obsolescence","tableau de bord","version"]],
  explain:"Un catalogue restreint d'images de base internes, durcies et scannées, republiées automatiquement à chaque correctif. Un mécanisme de rebuild déclenché en cascade sur les images applicatives, et un tableau de bord d'obsolescence qui montre qui tourne encore sur une base ancienne — avec des délais imposés. Sans automatisation du rebuild, les équipes restent sur la base d'il y a un an." },

{ id:"cx-dg-9-03", lvl:9, dom:"Docker",
  q:"Quel plan de reprise pour un registry privé qui héberge toutes tes images de production ?",
  must:[["sauvegarde","replication","copie"],["restauration testee","reconstruction","exercice"]],
  explain:"Stockage répliqué (idéalement géo-redondant) et sauvegardes des métadonnées, copie dans un compte isolé pour la protection anti-ransomware, et procédure de restauration TESTÉE. Complément indispensable : la capacité à reconstruire les images depuis les sources, ce qui suppose que les dépendances externes soient elles-mêmes mirrorées — sinon un registry perdu devient une reconstruction impossible." },

{ id:"cx-dg-9-04", lvl:9, dom:"Git",
  q:"Comment sécurises-tu le forge Git lui-même, qui contient tout le code de la banque ?",
  must:[["acces","mfa","authentification","droits"],["sauvegarde","journal","audit","integrite"]],
  explain:"MFA résistante au phishing et SSO obligatoire, droits par groupe avec revues périodiques, commits signés exigés sur les branches protégées, journalisation exportée vers le SIEM, sauvegardes régulières testées, et durcissement des intégrations (webhooks, applications tierces, jetons d'accès personnels à durée limitée). Le forge est une cible de premier ordre : qui le contrôle contrôle ce qui part en production." },

{ id:"cx-dg-9-05", lvl:9, dom:"Git",
  q:"Un développeur quitte l'entreprise. Que faut-il vérifier côté Git ?",
  must:[["revoquer","desactiver","acces"],["jeton","cle ssh","deploy key","integration"]],
  explain:"Désactivation via l'annuaire (SSO), mais surtout : révocation des jetons d'accès personnels, des clés SSH, des deploy keys et des intégrations qu'il avait créées — ce sont eux qui survivent à la désactivation du compte. Vérifier aussi qu'aucun pipeline ne dépend d'un jeton nominatif lui appartenant, sinon la CI cassera quelques semaines plus tard sans qu'on comprenne pourquoi." },

{ id:"cx-dg-9-06", lvl:9, dom:"Git",
  q:"Comment appliques-tu une politique de rétention et d'archivage sur des centaines de dépôts ?",
  accept:["archiver","lecture seule","inventaire","proprietaire","obligation legale"],
  explain:"Inventaire avec un propriétaire identifié par dépôt, archivage en lecture seule des projets inactifs plutôt que suppression, conservation alignée sur les obligations légales du code produit pour un métier régulé, et purge documentée du reste. Un dépôt sans propriétaire identifié est le premier signe d'une dette de gouvernance que l'auditeur relèvera." },

{ id:"cx-dg-9-07", lvl:9, dom:"Git",
  q:"Comment garantis-tu qu'aucun secret ne peut être poussé sur le forge ?",
  must:[["cote serveur","push protection","non contournable"],["scan","historique","revocation"]],
  explain:"Détection côté SERVEUR (push protection), non contournable — le hook local est un accélérateur qu'on désactive avec <code>--no-verify</code>. Complété par un scan périodique de tout l'historique de tous les dépôts, une procédure de révocation immédiate documentée, et la réduction du nombre de secrets qui existent (identité fédérée). Bloquer sans procédure de révocation ne sert à rien : le secret détecté est déjà à considérer comme compromis." },

/* ---------- DOCKER & GIT — niveau 10 ---------- */
{ id:"cx-dg-10-01", lvl:10, dom:"Docker",
  q:"« Les conteneurs, c'est moins sécurisé que les VM. » Comment réponds-tu à un RSSI ?",
  accept:["isolation plus faible","mais controlable","defense en profondeur","depend du modele de menace","reconnais"],
  explain:"Tu commences par lui donner raison sur le fond : l'isolation par namespace est plus faible que celle d'un hyperviseur. Puis tu déplaces le débat : la surface d'attaque d'un conteneur minimal, non-root, en filesystem read-only et sans capabilities est bien plus réduite que celle d'une VM complète non patchée. Et pour du multi-tenant non fiable, on garde une frontière VM (microVM, nœuds dédiés). Contredire frontalement un RSSI sur ce point est perdu d'avance." },

{ id:"cx-dg-10-02", lvl:10, dom:"Docker",
  q:"On te demande de conteneuriser une application legacy qui écrit partout sur le disque. Que fais-tu ?",
  accept:["comprendre","volumes","etapes","pas de reecriture","valeur reelle"],
  explain:"D'abord se demander ce qu'on cherche à gagner : si c'est la portabilité et l'homogénéité du déploiement, on peut conteneuriser sans rendre l'application stateless — volumes pour les chemins d'écriture, un seul réplica, pas de scaling horizontal. On assume que c'est une étape, pas une cible. Répondre « il faut la réécrire » à une équipe qui n'a ni le temps ni le budget ferme la discussion." },

{ id:"cx-dg-10-03", lvl:10, dom:"Git",
  q:"Une équipe refuse les revues de code obligatoires : « ça nous ralentit ». Comment tu argumentes ?",
  accept:["separation des taches","obligation","reduire la friction","petites pr","non negociable"],
  explain:"Deux registres à séparer. La revue est NON NÉGOCIABLE en banque : c'est la séparation des tâches, une exigence d'audit, pas une préférence d'ingénierie. En revanche leur douleur est réelle et traitable : PR plus petites, CODEOWNERS pour solliciter la bonne personne, automatisation de tout ce qui est mécanique (format, lint, tests) pour que la revue humaine porte sur le fond, et délai d'attente mesuré comme un indicateur." },

{ id:"cx-dg-10-04", lvl:10, dom:"Git",
  q:"« Quelle est votre stratégie de branches ? » — comment répondre sans réciter GitFlow ?",
  accept:["depend du mode de livraison","contexte","arbitrage","cadence"],
  explain:"Relie la stratégie au MODE DE LIVRAISON : trunk-based avec branches courtes et feature flags quand on déploie en continu ; GitFlow ou release branches quand on livre des versions à des tiers ou qu'on maintient plusieurs versions en parallèle — ce qui est fréquent en banque. Puis demande leur contexte. Réciter un schéma sans le relier à la contrainte est exactement ce qu'ils cherchent à détecter." },

{ id:"cx-dg-10-05", lvl:10, dom:"Git",
  q:"Tu découvres qu'un secret de production traîne dans l'historique Git depuis deux ans. Quelle est ta première phrase ?",
  accept:["revoquer","considerer comme compromis","urgence","des maintenant"],
  explain:"« On considère ce secret comme compromis et on le révoque maintenant. » Pas « on va nettoyer l'historique » : pendant deux ans, tous ceux qui ont cloné le dépôt en ont une copie, et personne ne peut affirmer qu'il n'a pas fuité. La réécriture d'historique vient ensuite, l'analyse d'usage aussi. C'est une question de réflexe : commencer par le nettoyage plutôt que par la révocation est éliminatoire." },

{ id:"cx-dg-10-06", lvl:10, dom:"Docker",
  q:"Comment expliques-tu la différence entre image et conteneur à un chef de projet, en une phrase ?",
  accept:["analogie","recette","plat","modele","exemplaire"],
  explain:"« L'image, c'est la recette figée ; le conteneur, c'est le plat qu'on prépare à partir de cette recette — on peut en préparer dix identiques, et jeter chaque plat sans abîmer la recette. » Une analogie, zéro jargon, et elle porte l'essentiel : immuabilité de l'image, jetabilité du conteneur." }

]);
