/* Complément QCM : comble les niveaux vides des blocs « Linux & Bash »
   et « Docker & Git ». Propositions calibrées à longueur comparable. */
window.QCM = (window.QCM || []).concat([

/* ---------- LINUX — niveau 4 ---------- */
{ id:"cq-lin-4-01", lvl:4, dom:"Linux",
  q:"Quelle directive systemd exprime une dépendance, et non un simple ordre de démarrage ?",
  choix:["<code>Requires=</code>","<code>After=</code>","<code>Before=</code>","<code>WantedBy=</code>"],
  bonne:0,
  explain:"<code>Requires=</code> lie les cycles de vie : si l'unité requise échoue, la nôtre est arrêtée. <code>After=</code>/<code>Before=</code> ne font qu'ordonner. Les deux sont indépendants — d'où le service qui démarre avant sa base quand on a mis l'un sans l'autre." },

{ id:"cq-lin-4-02", lvl:4, dom:"Linux",
  q:"Par défaut sur beaucoup de distributions, où journald stocke-t-il ses logs ?",
  choix:["En mémoire, dans <code>/run</code>","Sur disque, dans <code>/var/log</code>","Dans <code>/etc/systemd</code>","Dans la base du noyau"],
  bonne:0,
  explain:"Stockage volatile : les logs disparaissent au redémarrage. Pour les conserver : <code>Storage=persistent</code> dans <code>journald.conf</code>, ou création de <code>/var/log/journal</code>, avec <code>SystemMaxUse=</code> pour borner la taille." },

{ id:"cq-lin-4-03", lvl:4, dom:"Linux",
  q:"Que fait <code>systemctl mask</code> de plus que <code>disable</code> ?",
  choix:["Il rend l'unité indémarrable","Il supprime le fichier d'unité","Il arrête l'unité en cours","Il désactive ses dépendances"],
  bonne:0,
  explain:"<code>mask</code> crée un lien vers <code>/dev/null</code> : plus aucun démarrage possible, même manuel ou par dépendance. <code>disable</code> retire seulement le démarrage automatique. Utile pour neutraliser un service qu'un paquet réactiverait." },

{ id:"cq-lin-4-04", lvl:4, dom:"Linux",
  q:"Comment rendre un réglage <code>sysctl</code> permanent ?",
  choix:["Un fichier dans <code>/etc/sysctl.d/</code>","L'option <code>-w</code> de sysctl","Une ligne dans <code>/etc/fstab</code>","Une variable dans <code>/etc/environment</code>"],
  bonne:0,
  explain:"<code>sysctl -w</code> agit à chaud mais ne survit pas au redémarrage. Réglages fréquents en production : <code>net.core.somaxconn</code>, <code>fs.file-max</code>, <code>vm.max_map_count</code>." },

{ id:"cq-lin-4-05", lvl:4, dom:"Linux",
  q:"Comment autoriser un binaire non-root à écouter sur le port 80 ?",
  choix:["<code>setcap cap_net_bind_service</code>","<code>chmod +s</code> sur le binaire","<code>sysctl net.ipv4.ip_forward=1</code>","<code>usermod -aG netdev</code>"],
  bonne:0,
  explain:"Les capabilities découpent les privilèges de root : on accorde exactement celui qui manque. Le bit setuid donnerait tous les droits du propriétaire — bien trop large. Alternative plus propre : port haut + reverse proxy." },

{ id:"cq-lin-4-06", lvl:4, dom:"Linux",
  q:"Pourquoi <code>limits.conf</code> ne change-t-il rien pour un daemon systemd ?",
  choix:["Il n'est appliqué que par PAM, aux sessions","Il ne concerne que l'utilisateur root","Il est ignoré depuis systemd 240","Il faut redémarrer la machine"],
  bonne:0,
  explain:"Un service lancé par systemd ne passe pas par une session PAM. Il faut <code>LimitNOFILE=</code> et <code>LimitNPROC=</code> dans l'unité. C'est la cause du « j'ai pourtant augmenté ulimit » qui ne produit aucun effet." },

/* ---------- LINUX — niveau 5 ---------- */
{ id:"cq-lin-5-01", lvl:5, dom:"Linux",
  q:"Les permissions POSIX sont bonnes mais l'écriture est refusée. Quelle piste ?",
  choix:["SELinux ou AppArmor","Un disque monté en lecture seule","Un quota utilisateur atteint","Un verrou de fichier"],
  bonne:0,
  explain:"Un contrôle d'accès obligatoire se superpose aux permissions POSIX. Diagnostic : <code>getenforce</code>, <code>ausearch -m avc</code>, <code>audit2why</code>. Le correctif propre est de poser le bon contexte, pas de désactiver SELinux." },

{ id:"cq-lin-5-02", lvl:5, dom:"Linux",
  q:"Qu'apporte nftables par rapport à iptables ?",
  choix:["Une syntaxe unifiée et de meilleures performances","Le support du filtrage applicatif","Le chiffrement natif des flux","La compatibilité IPv6 exclusive"],
  bonne:0,
  explain:"Un seul cadre pour IPv4/IPv6/ARP/bridge au lieu de quatre outils, des ensembles et maps natifs pour de grands jeux de règles, et un rechargement atomique. <code>iptables</code> moderne est souvent un frontal traduisant vers nftables." },

{ id:"cq-lin-5-03", lvl:5, dom:"Linux",
  q:"À quoi sert auditd, par rapport à journald ?",
  choix:["Tracer les événements de sécurité du noyau","Centraliser les logs applicatifs","Faire tourner les fichiers de logs","Surveiller les performances système"],
  bonne:0,
  explain:"auditd enregistre les accès à des fichiers sensibles, des appels système ciblés et les changements de privilèges, avec des règles dédiées. En banque, c'est lui qui porte la traçabilité réglementaire : qui a lu quoi, qui a exécuté quoi en root." },

{ id:"cq-lin-5-04", lvl:5, dom:"Linux",
  q:"Quel est le point critique en exploitation d'un disque chiffré LUKS ?",
  choix:["Le déverrouillage automatique au démarrage","La performance en lecture séquentielle","La compatibilité avec les sauvegardes","La taille maximale du volume"],
  bonne:0,
  explain:"Une machine qui attend une passphrase au boot ne redémarre pas seule à 3 h du matin. D'où l'usage d'un TPM, d'un serveur de clés (Tang/Clevis) ou du chiffrement managé du cloud." },

{ id:"cq-lin-5-05", lvl:5, dom:"Linux",
  q:"Que règle <code>net.ipv4.ip_local_port_range</code> ?",
  choix:["La plage des ports source sortants","Les ports autorisés en écoute","La plage réservée aux conteneurs","Les ports filtrés par le pare-feu"],
  bonne:0,
  explain:"Sur un proxy ouvrant des dizaines de milliers de connexions vers une même destination, on épuise la plage et les connexions échouent. L'élargir aide, mais la vraie réponse est le keep-alive et le pooling." },

{ id:"cq-lin-5-06", lvl:5, dom:"Linux",
  q:"Comment crée-t-on proprement un compte de service Linux ?",
  choix:["Sans home, sans mot de passe, shell nologin","Avec un mot de passe fort et un home dédié","En le rattachant au groupe sudo","En réutilisant un compte existant"],
  bonne:0,
  explain:"<code>useradd --system --shell /usr/sbin/nologin</code>. L'objectif : qu'une compromission du service ne donne pas de session interactive. Convention d'UID sous 1000 pour les comptes système." },

{ id:"cq-lin-5-07", lvl:5, dom:"Linux",
  q:"Quelle directive systemd isole le <code>/tmp</code> d'un service ?",
  choix:["<code>PrivateTmp=yes</code>","<code>ProtectHome=yes</code>","<code>NoNewPrivileges=yes</code>","<code>ReadOnlyPaths=/tmp</code>"],
  bonne:0,
  explain:"Chaque service obtient son propre <code>/tmp</code>, invisible des autres. À combiner avec <code>ProtectSystem=strict</code>, <code>NoNewPrivileges=</code>, <code>SystemCallFilter=</code>. <code>systemd-analyze security</code> note l'unité et liste ce qui manque." },

{ id:"cq-lin-5-08", lvl:5, dom:"Linux",
  q:"Que révèle un grand nombre de sockets en état CLOSE_WAIT ?",
  choix:["L'application ne ferme pas ses sockets","Le réseau perd des paquets","Le pare-feu coupe les sessions","La charge dépasse la capacité"],
  bonne:0,
  explain:"CLOSE_WAIT signifie que le pair a fermé et que notre application n'a pas appelé <code>close()</code> : c'est un bug applicatif, pas un problème réseau. À distinguer de TIME_WAIT, normal et abondant sur un proxy." },

/* ---------- LINUX — niveau 7 ---------- */
{ id:"cq-lin-7-01", lvl:7, dom:"Linux",
  q:"Quel est l'argument principal de l'infrastructure immuable sur le patching en place ?",
  choix:["L'absence de dérive de configuration","Un coût de stockage plus faible","Un démarrage des machines plus rapide","Une compatibilité applicative accrue"],
  bonne:0,
  explain:"On reconstruit et on remplace au lieu de modifier : plus de dérive, retour arrière en redéployant l'image précédente, environnements reproductibles. Le patching en place reste nécessaire pour le legacy à état et les urgences." },

{ id:"cq-lin-7-02", lvl:7, dom:"Linux",
  q:"Pour tenir 100 000 connexions simultanées, quel plafond est le plus souvent oublié ?",
  choix:["Le backlog demandé par l'application","La taille de la mémoire vive","La fréquence du processeur","Le débit de la carte réseau"],
  bonne:0,
  explain:"On règle <code>net.core.somaxconn</code> et on oublie que l'application passe sa propre valeur à <code>listen()</code> : c'est le minimum des deux qui s'applique. À vérifier aussi : descripteurs, conntrack, ports éphémères." },

{ id:"cq-lin-7-03", lvl:7, dom:"Linux",
  q:"Quelle est la limite du kernel live patching ?",
  choix:["Tous les correctifs ne sont pas éligibles","Il exige une licence par cœur","Il dégrade les performances du noyau","Il ne fonctionne pas en machine virtuelle"],
  bonne:0,
  explain:"Un changement de structure de données impose un vrai redémarrage. C'est un outil pour absorber l'urgence, pas pour ne jamais redémarrer : un parc qui n'a pas rebooté depuis deux ans cache d'autres problèmes." },

{ id:"cq-lin-7-04", lvl:7, dom:"Linux",
  q:"Quel est le pire endroit où placer un secret sur une VM ?",
  choix:["Une variable d'environnement du service","Un fichier en 400 dans un tmpfs","Un coffre interrogé au démarrage","Un fichier chiffré par le TPM"],
  bonne:0,
  explain:"L'environnement d'un processus est lisible dans <code>/proc/&lt;pid&gt;/environ</code> et apparaît souvent dans les dumps et les outils de diagnostic. Préférer un fichier à permissions strictes en mémoire, renouvelé par un agent." },

{ id:"cq-lin-7-05", lvl:7, dom:"Linux",
  q:"Pourquoi borner la rotation des logs en TAILLE et pas seulement en durée ?",
  choix:["Un pic de logs peut saturer le disque avant l'échéance","La compression ne fonctionne que par taille","La durée n'est pas respectée par logrotate","Les logs anciens sont illisibles"],
  bonne:0,
  explain:"Une rotation « 30 jours » ne protège pas d'une boucle d'erreurs qui écrit 50 Go en une nuit. On borne les deux, et on met les logs sur une partition séparée pour qu'une saturation ne bloque pas le système." },

{ id:"cq-lin-7-06", lvl:7, dom:"Linux",
  q:"Lors d'un test de charge, quel est le facteur limitant le plus fréquent ?",
  choix:["La base de données ou un pool de connexions","Le processeur du serveur applicatif","La bande passante réseau","La taille du disque système"],
  bonne:0,
  explain:"Le CPU applicatif sature rarement en premier. On mesure jusqu'au point de rupture en observant latence par percentile, iowait, descripteurs et pools, puis on dimensionne avec une marge documentée." },

{ id:"cq-lin-7-07", lvl:7, dom:"Linux",
  q:"Quand préfère-t-on une microVM (Firecracker) à un conteneur ?",
  choix:["Pour exécuter du code non fiable ou multi-tenant","Pour réduire la taille des images","Pour accélérer les déploiements","Pour simplifier le réseau"],
  bonne:0,
  explain:"Une microVM embarque son propre noyau derrière un hyperviseur minimaliste : isolation de VM, démarrage en centaines de millisecondes. C'est ce qui sert de frontière quand un namespace ne suffit pas." },

/* ---------- LINUX — niveau 9 ---------- */
{ id:"cq-lin-9-01", lvl:9, dom:"Linux",
  q:"Comment déployer des correctifs sur 2000 serveurs en environnement bancaire ?",
  choix:["Par anneaux, du bac à sable à la prod critique","Simultanément, pendant une fenêtre unique","Par ordre alphabétique des machines","À la demande de chaque équipe applicative"],
  bonne:0,
  explain:"Chaque anneau valide le suivant, avec des fenêtres négociées et un retour arrière possible. Complété par un tableau de bord de conformité, des délais par criticité de CVE, et des exemptions datées." },

{ id:"cq-lin-9-02", lvl:9, dom:"Linux",
  q:"Comment applique-t-on un benchmark CIS sur un parc existant ?",
  choix:["En auditant d'abord, puis par lots validés","En appliquant le profil complet d'un coup","En ne gardant que les règles de niveau 1","En le déléguant à l'éditeur du système"],
  bonne:0,
  explain:"Appliquer un profil complet sur un serveur en production casse presque toujours quelque chose. On mesure l'écart en mode rapport (OpenSCAP), on traite par lots, on documente les exceptions justifiées." },

{ id:"cq-lin-9-03", lvl:9, dom:"Linux",
  q:"Où doit être stockée la base de référence d'un contrôle d'intégrité ?",
  choix:["Hors de la machine surveillée","Dans <code>/var/lib</code> de la machine","Dans un répertoire chiffré local","Dans la partition de démarrage"],
  bonne:0,
  explain:"Un attaquant root régénère la base locale après avoir modifié les fichiers, et le contrôle ne détecte plus rien. Même logique que pour les journaux : ils doivent partir en temps réel vers un collecteur inaccessible en écriture." },

{ id:"cq-lin-9-04", lvl:9, dom:"Linux",
  q:"Quelle conséquence pratique d'activer le mode FIPS ?",
  choix:["Des applications cessent de fonctionner","Les performances chutent de moitié","Le système refuse les mises à jour","Le chiffrement des disques est imposé"],
  bonne:0,
  explain:"Le système n'accepte que des implémentations cryptographiques validées : une application utilisant MD5 ou une bibliothèque non conforme casse. C'est à tester longtemps avant la mise en production." },

{ id:"cq-lin-9-05", lvl:9, dom:"Linux",
  q:"Un serveur est suspecté de compromission. Quel est le premier geste ?",
  choix:["L'isoler du réseau sans l'éteindre","L'éteindre pour stopper l'attaque","Réinstaller le système immédiatement","Changer tous les mots de passe locaux"],
  bonne:0,
  explain:"La mémoire vive contient des preuves qui disparaissent à l'extinction. On isole, on capture mémoire et disque, on préserve les journaux hors machine, puis on RECONSTRUIT depuis une source saine — on ne nettoie pas." },

{ id:"cq-lin-9-06", lvl:9, dom:"Linux",
  q:"Que vaut le support étendu payant d'une distribution en fin de vie ?",
  choix:["Un filet temporaire, pas une solution durable","Une alternative complète à la migration","Une obligation réglementaire en banque","Une garantie de compatibilité applicative"],
  bonne:0,
  explain:"Il couvre ce qui ne peut pas migrer à temps. Un système hors support en production reste un constat d'audit, même s'il fonctionne parfaitement. La migration se planifie avant la date d'échéance." },

{ id:"cq-lin-9-07", lvl:9, dom:"Linux",
  q:"Comment prouver qui a agi en root sur un serveur ?",
  choix:["Connexion nominative puis sudo, journaux exportés","Historique bash de l'utilisateur root","Fichier de log local d'auditd","Liste des clés SSH autorisées"],
  bonne:0,
  explain:"Jamais de login root direct ni de mot de passe partagé. Les journaux sudo et auditd doivent partir EN TEMPS RÉEL vers un collecteur que l'administrateur local ne peut pas modifier — sinon un attaquant root efface les traces." },

{ id:"cq-lin-9-08", lvl:9, dom:"Linux",
  q:"Quel est le coût principal d'un accès administrateur juste-à-temps ?",
  choix:["Le gestionnaire d'accès devient critique","La perte de traçabilité des actions","L'impossibilité d'automatiser les tâches","Une latence sur les commandes exécutées"],
  bonne:0,
  explain:"S'il tombe, plus personne n'entre — en pleine panne. D'où l'obligation d'un chemin de secours documenté (compte break-glass scellé, alerte à toute utilisation, rotation après usage)." },

/* ---------- LINUX — niveau 10 ---------- */
{ id:"cq-lin-10-01", lvl:10, dom:"Linux",
  q:"« Un serveur rame, 5 minutes, un SSH. » Qu'attendent-ils surtout ?",
  choix:["Que tu annonces un ordre de dépouillement","Que tu cites le plus de commandes possible","Que tu identifies la cause immédiatement","Que tu demandes l'accès aux dashboards"],
  bonne:0,
  explain:"Ce qui est évalué, c'est l'existence d'une méthode qui élimine des hypothèses : du plus général au plus fin — charge, mémoire et swap, I/O, disque et inodes, réseau, puis l'application." },

{ id:"cq-lin-10-02", lvl:10, dom:"Linux",
  q:"« Nos serveurs n'ont pas redémarré depuis 3 ans, c'est stable. » Que réponds-tu ?",
  choix:["Que le redémarrage est un test jamais passé","Que c'est effectivement un bon indicateur","Qu'il faut redémarrer chaque semaine","Que seuls les correctifs noyau comptent"],
  bonne:0,
  explain:"Les correctifs du noyau ne sont pas appliqués, la configuration a dérivé, et personne ne sait si la machine repartira le jour où un reboot sera imposé. À formuler sans arrogance : c'est souvent un héritage, pas un choix." },

{ id:"cq-lin-10-03", lvl:10, dom:"Linux",
  q:"Un développeur réclame root en production « pour aller plus vite ». Que fais-tu ?",
  choix:["Tu cherches le besoin réel derrière la demande","Tu refuses en citant la politique de sécurité","Tu lui donnes un accès en lecture seule","Tu transmets la demande à sa hiérarchie"],
  bonne:0,
  explain:"Neuf fois sur dix, il veut lire des logs ou un état — ce qui doit être accessible SANS root, par l'observabilité. Refuser sec sans traiter le besoin garantit un contournement, et là on perd la traçabilité en plus." },

{ id:"cq-lin-10-04", lvl:10, dom:"Linux",
  q:"« Red Hat ou Debian ? » — quel est le piège ?",
  choix:["Traiter la question comme une préférence","Ne pas connaître les deux distributions","Citer une distribution non professionnelle","Répondre par une autre question"],
  bonne:0,
  explain:"La bonne réponse porte sur le contexte : support commercial et certifications applicatives d'un côté, cycle et souplesse de l'autre, plus la compétence de l'équipe. En banque, le support contractuel pèse plus que le confort technique." },

{ id:"cq-lin-10-05", lvl:10, dom:"Linux",
  q:"« Quelle est la commande la plus dangereuse que vous ayez lancée ? » Quelle réponse échoue ?",
  choix:["« Aucune, je vérifie toujours »","Un <code>rm -rf</code> mal ciblé","Un <code>&gt;</code> sur un fichier de config","Un <code>chown -R</code> depuis la racine"],
  bonne:0,
  explain:"Prétendre n'avoir jamais fait d'erreur sonne faux et ferme la discussion. On donne un cas réel, comment on s'en est aperçu, et surtout le garde-fou mis en place après." },

{ id:"cq-lin-10-06", lvl:10, dom:"Linux",
  q:"Comment expliquer « disque plein mais moitié vide » à un non-technique ?",
  choix:["Par une analogie de classeur sans intercalaires","En détaillant le fonctionnement des inodes","En montrant la sortie de <code>df -i</code>","En expliquant les descripteurs de fichiers"],
  bonne:0,
  explain:"L'analogie d'abord, le détail seulement si l'interlocuteur le demande. Les deux causes réelles : inodes épuisés par des millions de petits fichiers, ou fichier supprimé encore ouvert par un processus." },

/* ---------- DOCKER & GIT — niveau 7 ---------- */
{ id:"cq-dg-7-01", lvl:7, dom:"Docker",
  q:"Quelle règle de tag adopter pour un registry d'entreprise ?",
  choix:["Tags immuables, référence par digest en prod","Un tag <code>latest</code> par environnement","Un tag par date de construction","Réécriture du tag à chaque correctif"],
  bonne:0,
  explain:"Un tag réécrit ne prouve rien : on ne sait plus ce qui tourne et le rollback devient impossible. On complète par une politique de rétention automatique, sans laquelle le registry devient un poste de coût majeur." },

{ id:"cq-dg-7-02", lvl:7, dom:"Docker",
  q:"Si le registry tombe, qu'est-ce qui devient impossible ?",
  choix:["Scaler et faire un rollback","Servir le trafic en cours","Accéder aux logs des Pods","Modifier les ConfigMaps"],
  bonne:0,
  explain:"Les Pods existants continuent, mais tout nouveau Pod échoue au pull — donc plus de montée en charge ni de retour arrière. C'est une dépendance critique du plan de reprise : réplication, cache pull-through, images préchargées sur les nœuds." },

{ id:"cq-dg-7-03", lvl:7, dom:"Docker",
  q:"Qu'est-ce qui accélère le plus le démarrage d'images volumineuses à grande échelle ?",
  choix:["Des couches de base partagées entre images","Un registry plus proche géographiquement","Un format de compression plus rapide","Un nombre de réplicas plus élevé"],
  bonne:0,
  explain:"Le nœud ne télécharge une couche qu'une fois : si toutes les images partagent la même base, seul le delta applicatif transite. On complète par le préchargement sur les nœuds et le lazy pulling (eStargz, SOCI)." },

{ id:"cq-dg-7-04", lvl:7, dom:"Git",
  q:"Quel est le critère décisif entre monorepo et multi-repo ?",
  choix:["La maturité de l'outillage disponible","Le nombre total de développeurs","Le langage de programmation utilisé","La politique de sécurité du forge"],
  bonne:0,
  explain:"Un monorepo sans build sélectif ni détection d'impact rend la CI interminable ; un multi-repo sans discipline fait diverger les versions. Le choix se joue sur ce qu'on est capable d'outiller, pas sur une préférence." },

{ id:"cq-dg-7-05", lvl:7, dom:"Git",
  q:"Un binaire compilé de 200 Mo doit-il aller dans Git LFS ?",
  choix:["Non : il appartient à un gestionnaire d'artefacts","Oui, LFS est fait pour ça","Oui, s'il change rarement","Non : il faut le compresser d'abord"],
  bonne:0,
  explain:"LFS traite le symptôme. Un artefact de build a sa place dans un registry ou un dépôt d'artefacts, versionné indépendamment du code. Et un gros fichier déjà commité reste dans l'historique tant qu'on ne le réécrit pas." },

{ id:"cq-dg-7-06", lvl:7, dom:"Git",
  q:"Comment attribuer les droits sur un forge partagé par 15 équipes ?",
  choix:["Par groupe, jamais nominativement","Par personne, pour la précision","Par projet, sans groupes","Par ancienneté dans l'entreprise"],
  bonne:0,
  explain:"Des droits nominatifs transforment chaque départ en chantier et rendent les revues d'accès ingérables. On y ajoute CODEOWNERS pour solliciter automatiquement le bon relecteur." },

/* ---------- DOCKER & GIT — niveau 8 ---------- */
{ id:"cq-dg-8-01", lvl:8, dom:"Docker",
  q:"Que contient un manifest list (image index) ?",
  choix:["Un manifeste par couple OS/architecture","La liste des couches de l'image","L'historique des commandes du build","Les signatures des mainteneurs"],
  bonne:0,
  explain:"Le client tire automatiquement le digest correspondant à sa plateforme. C'est ce qui permet à <code>FROM alpine</code> de marcher sur amd64 et arm64 — et son absence explique qu'une image buildée sur Mac casse sur des nœuds x86." },

{ id:"cq-dg-8-02", lvl:8, dom:"Docker",
  q:"Pourquoi supprimer un fichier dans une couche ultérieure ne réduit-il pas l'image ?",
  choix:["La couche précédente conserve le fichier","La suppression n'est pas propagée","Le cache de build le restaure","Le registry le recrée au pull"],
  bonne:0,
  explain:"Les couches sont empilées et immuables : la suppression n'ajoute qu'un marqueur. Il faut installer ET nettoyer dans le MÊME <code>RUN</code>, ou passer par un build multi-stage." },

{ id:"cq-dg-8-03", lvl:8, dom:"Docker",
  q:"Qu'est-ce qu'un copy-up en OverlayFS ?",
  choix:["La copie d'un fichier entier avant écriture","La fusion de deux couches d'image","La remontée d'un volume vers l'hôte","La duplication du conteneur au démarrage"],
  bonne:0,
  explain:"Écrire un octet dans un fichier d'une couche basse copie le fichier ENTIER dans la couche d'écriture. D'où la lenteur sur les gros fichiers, et la règle : les données vont dans un volume." },

{ id:"cq-dg-8-04", lvl:8, dom:"Git",
  q:"Que stocke réellement un objet blob Git ?",
  choix:["Le contenu d'un fichier, sans son nom","Le fichier et son chemin complet","Les différences avec la version précédente","Les métadonnées de l'auteur"],
  bonne:0,
  explain:"Le nom est porté par l'objet <em>tree</em>. Tout étant adressé par le contenu, deux fichiers identiques dans dix branches ne sont stockés qu'une fois — d'où la compacité des dépôts Git." },

{ id:"cq-dg-8-05", lvl:8, dom:"Git",
  q:"Pourquoi un squash merge complique-t-il un cherry-pick ultérieur ?",
  choix:["La branche apparaît comme non fusionnée","Les commits d'origine sont supprimés","Le squash réécrit la branche cible","Les conflits sont résolus automatiquement"],
  bonne:0,
  explain:"Git ne voit aucun lien entre le commit unique produit et les commits d'origine. On gagne un historique lisible, on perd la traçabilité fine et la détection automatique de ce qui a déjà été intégré." },

{ id:"cq-dg-8-06", lvl:8, dom:"Git",
  q:"Combien de temps le reflog conserve-t-il les références par défaut ?",
  choix:["Environ 90 jours","Indéfiniment","Jusqu'au prochain commit","Sept jours"],
  bonne:0,
  explain:"90 jours pour les entrées atteignables, 30 pour les autres, puis <code>git gc</code> les supprime. C'est un filet de sécurité LOCAL : il ne protège ni un collègue, ni une suppression côté serveur." },

/* ---------- DOCKER & GIT — niveau 9 ---------- */
{ id:"cq-dg-9-01", lvl:9, dom:"Docker",
  q:"Quelle démonstration convainc le plus un auditeur sur la chaîne d'images ?",
  choix:["Retrouver en minutes qui est affecté par une CVE","Montrer le rapport de scan du dernier build","Présenter la politique de sécurité écrite","Lister les images signées du registry"],
  bonne:0,
  explain:"C'est la preuve que le SBOM est exploitable et à jour. On complète par la signature avec attestation de provenance, l'admission qui refuse le non signé, et le journal immuable des publications." },

{ id:"cq-dg-9-02", lvl:9, dom:"Docker",
  q:"Sans quoi les équipes restent-elles sur une image de base vieille d'un an ?",
  choix:["Un rebuild automatique en cascade","Une politique de sécurité documentée","Un scan hebdomadaire des images","Une formation des développeurs"],
  bonne:0,
  explain:"Republier l'image de base ne suffit pas : il faut déclencher la reconstruction des images applicatives qui en dérivent, et un tableau de bord d'obsolescence avec des délais imposés." },

{ id:"cq-dg-9-03", lvl:9, dom:"Docker",
  q:"Qu'est-ce qui rend une reconstruction d'images impossible après perte du registry ?",
  choix:["Des dépendances externes non mirrorées","L'absence de sauvegarde des logs de build","Un Dockerfile sans commentaires","Des tags nommés par date"],
  bonne:0,
  explain:"Reconstruire depuis les sources suppose que tout l'amont soit encore disponible dans les mêmes versions. Sans miroir interne des dépôts de paquets, le plan de reprise repose sur internet et sur la bonne volonté d'éditeurs tiers." },

{ id:"cq-dg-9-04", lvl:9, dom:"Git",
  q:"Pourquoi le forge Git est-il une cible de premier ordre ?",
  choix:["Qui le contrôle contrôle ce qui part en prod","Il contient les mots de passe des équipes","Il est exposé directement sur internet","Il stocke les sauvegardes des bases"],
  bonne:0,
  explain:"D'où MFA résistante au phishing, commits signés sur les branches protégées, journalisation exportée vers le SIEM, durcissement des webhooks et jetons à durée limitée, et sauvegardes testées." },

{ id:"cq-dg-9-05", lvl:9, dom:"Git",
  q:"Un développeur part. Qu'est-ce qui survit à la désactivation de son compte ?",
  choix:["Ses jetons, clés SSH et deploy keys","Ses commits sur les branches protégées","Ses droits de revue sur les projets","Ses notifications d'intégration"],
  bonne:0,
  explain:"Ce sont eux qu'il faut révoquer explicitement. Vérifier aussi qu'aucun pipeline ne dépend d'un jeton nominatif lui appartenant, sinon la CI cassera quelques semaines plus tard sans qu'on comprenne pourquoi." },

{ id:"cq-dg-9-06", lvl:9, dom:"Git",
  q:"Que faire d'un dépôt inactif dont personne ne connaît le propriétaire ?",
  choix:["L'archiver en lecture seule après enquête","Le supprimer pour réduire la surface","Le laisser tel quel, il ne gêne pas","Le rendre public pour trouver son auteur"],
  bonne:0,
  explain:"L'archivage préserve l'historique — potentiellement soumis à une obligation légale de conservation — tout en gelant le dépôt. Un dépôt sans propriétaire identifié est le premier signe d'une dette de gouvernance." },

{ id:"cq-dg-9-07", lvl:9, dom:"Git",
  q:"Pourquoi un hook pre-commit ne suffit-il pas à empêcher la fuite d'un secret ?",
  choix:["Il se contourne avec <code>--no-verify</code>","Il ralentit trop les développeurs","Il ne détecte que les clés AWS","Il ne fonctionne pas sous Windows"],
  bonne:0,
  explain:"C'est un accélérateur côté client, pas un contrôle. Il faut une détection côté SERVEUR non contournable, plus un scan périodique de tout l'historique et une procédure de révocation immédiate." },

/* ---------- DOCKER & GIT — niveau 10 ---------- */
{ id:"cq-dg-10-01", lvl:10, dom:"Docker",
  q:"« Les conteneurs sont moins sûrs que les VM. » Comment répondre à un RSSI ?",
  choix:["Lui donner raison, puis déplacer le débat","Le contredire avec des références techniques","Proposer de tout migrer en machines virtuelles","Expliquer que le risque est théorique"],
  bonne:0,
  explain:"L'isolation par namespace EST plus faible qu'un hyperviseur. Mais un conteneur minimal, non-root, en filesystem read-only et sans capabilities a une surface d'attaque bien plus réduite qu'une VM complète non patchée." },

{ id:"cq-dg-10-02", lvl:10, dom:"Docker",
  q:"On te demande de conteneuriser un legacy qui écrit partout sur le disque. Que fais-tu ?",
  choix:["Tu conteneurises avec des volumes, sans le réécrire","Tu refuses tant qu'il n'est pas stateless","Tu proposes une réécriture complète","Tu le laisses en machine virtuelle"],
  bonne:0,
  explain:"On assume une étape, pas une cible : volumes pour les chemins d'écriture, un seul réplica, pas de scaling horizontal. Répondre « il faut le réécrire » à une équipe sans budget ferme la discussion." },

{ id:"cq-dg-10-03", lvl:10, dom:"Git",
  q:"Une équipe refuse les revues obligatoires : « ça nous ralentit ». Que fais-tu ?",
  choix:["Tu maintiens l'exigence et tu réduis la friction","Tu acceptes une exception pour cette équipe","Tu imposes la règle sans discussion","Tu remontes le refus à leur hiérarchie"],
  bonne:0,
  explain:"La revue est une exigence d'audit, pas une préférence. Mais leur douleur est réelle : PR plus petites, CODEOWNERS, automatisation de tout ce qui est mécanique, et délai d'attente suivi comme un indicateur." },

{ id:"cq-dg-10-04", lvl:10, dom:"Git",
  q:"« Quelle est votre stratégie de branches ? » Qu'est-ce qu'ils testent ?",
  choix:["Si tu relies la stratégie au mode de livraison","Si tu connais GitFlow en détail","Si tu as un avis tranché sur le sujet","Si tu maîtrises les commandes de rebase"],
  bonne:0,
  explain:"Trunk-based quand on déploie en continu ; branches de release quand on livre des versions à des tiers ou qu'on maintient plusieurs versions — fréquent en banque. Réciter un schéma sans le relier à la contrainte est ce qu'ils cherchent à détecter." },

{ id:"cq-dg-10-05", lvl:10, dom:"Git",
  q:"Un secret de production traîne dans l'historique depuis deux ans. Ta première phrase ?",
  choix:["« On le révoque maintenant »","« On nettoie l'historique »","« On rend le dépôt privé »","« On regarde s'il a été utilisé »"],
  bonne:0,
  explain:"Pendant deux ans, tous ceux qui ont cloné en ont une copie : le secret est à considérer comme compromis. La réécriture d'historique et l'analyse d'usage viennent ensuite. Commencer par le nettoyage est éliminatoire." },

{ id:"cq-dg-10-06", lvl:10, dom:"Docker",
  q:"Comment expliquer image et conteneur à un chef de projet ?",
  choix:["La recette figée et le plat qu'on en prépare","Le modèle objet et son instanciation","Le fichier binaire et son processus","Le disque système et sa machine"],
  bonne:0,
  explain:"Une analogie du quotidien, zéro jargon, et elle porte l'essentiel : immuabilité de l'image, jetabilité du conteneur. « Classe et instance » ne parle qu'à un développeur." }

]);
