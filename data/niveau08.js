window.QBANK = (window.QBANK || []).concat([
/* ================= NIVEAU 8 — INTERNES & CAS LIMITES ================= */

{ id:"n8-k8s-01", lvl:8, dom:"Kubernetes",
  q:"Comment kube-proxy implémente-t-il un Service, et quelle limite a le mode iptables ?",
  accept:["iptables","ipvs","regles","lineaire","performance"],
  explain:"kube-proxy programme des règles de redirection depuis l'IP virtuelle du Service vers les IP des Pods. En mode iptables, les règles sont évaluées de façon quasi linéaire : au-delà de quelques milliers de Services, le temps de mise à jour et de traversée devient un problème. Le mode IPVS utilise des tables de hachage (O(1)) et de vrais algorithmes de répartition. Cilium peut remplacer kube-proxy par de l'eBPF." },

{ id:"n8-k8s-02", lvl:8, dom:"Kubernetes",
  q:"Que se passe-t-il si etcd perd le quorum ? Le cluster continue-t-il à servir le trafic ?",
  accept:["lecture seule","plus d ecriture","raft","majorite","le trafic continue"],
  explain:"etcd utilise Raft : sans majorité (2/3, 3/5), plus aucune ÉCRITURE n'est possible, l'API server ne peut plus modifier l'état, donc plus de déploiements ni de reprogrammation de Pods. En revanche le trafic existant continue de fonctionner : kube-proxy et les Pods déjà en place tournent. C'est une panne du plan de CONTRÔLE, pas du plan de DONNÉES — distinction attendue en entretien senior." },

{ id:"n8-k8s-03", lvl:8, dom:"Kubernetes",
  q:"Quelle est la différence entre un mutating et un validating admission webhook, et dans quel ordre s'exécutent-ils ?",
  accept:["mutating avant","modifie","valide","rejette","schema entre les deux"],
  explain:"Les mutating webhooks s'exécutent D'ABORD et peuvent modifier l'objet (injection de sidecar, ajout de labels, valeurs par défaut). Le schéma OpenAPI est validé ensuite, puis les validating webhooks acceptent ou rejettent sans modifier. Ordre logique : on ne valide qu'après toutes les mutations. Piège d'exploitation : un webhook en <code>failurePolicy: Fail</code> et indisponible bloque tout le cluster." },

{ id:"n8-k8s-04", lvl:8, dom:"Kubernetes",
  q:"Explique le pattern controller / boucle de réconciliation. Pourquoi les contrôleurs sont-ils idempotents ?",
  accept:["etat desire","etat observe","watch","reconcilie","niveau","level triggered"],
  explain:"Un contrôleur observe l'état désiré (spec) et l'état observé (status) et agit pour réduire l'écart, en boucle. Il est <em>level-triggered</em> et non <em>edge-triggered</em> : il ne réagit pas à un événement ponctuel mais au niveau courant, donc il doit être idempotent — rejouer la réconciliation ne doit rien casser. C'est ce qui rend le système auto-réparant même après une perte d'événements." },

{ id:"n8-k8s-05", lvl:8, dom:"Kubernetes",
  q:"Qu'est-ce qu'une CRD et un opérateur ? Quand écris-tu un opérateur plutôt qu'un Helm chart ?",
  accept:["extension de l api","controleur dedie","logique metier","day 2","reconciliation continue"],
  explain:"Une CRD ajoute un type d'objet à l'API Kubernetes ; un opérateur est le contrôleur qui l'implémente, encodant la connaissance opérationnelle (sauvegarde, bascule, upgrade de version, resharding). Helm ne fait que rendre un template au moment de l'installation : il ne gère pas le jour 2. On écrit un opérateur quand il y a une logique CONTINUE à appliquer, pas juste des manifestes paramétrés." },

{ id:"n8-k8s-06", lvl:8, dom:"Kubernetes",
  q:"Un Pod avec un PVC ReadWriteOnce ne redémarre pas sur un autre nœud. Explique le mécanisme.",
  accept:["volume attache","detachement","multi-attach","un seul noeud","node affinity"],
  explain:"Un disque bloc (EBS, Azure Disk) ne peut être attaché qu'à un nœud à la fois. Tant que l'ancien nœud n'a pas relâché le volume — ou tant que le contrôleur ne peut pas confirmer que l'ancien Pod est mort (nœud injoignable) — le nouveau Pod reste en <code>Pending</code> avec une erreur Multi-Attach. C'est une protection contre la double écriture. Un forçage prématuré risque de corrompre le système de fichiers." },

{ id:"n8-linux-01", lvl:8, dom:"Linux",
  q:"Explique ce que fait <code>fork()</code> + <code>exec()</code> et le rôle du copy-on-write.",
  accept:["duplique le processus","remplace l image","copy on write","pas de copie immediate"],
  explain:"<code>fork()</code> duplique le processus courant (même espace mémoire, marqué copy-on-write : rien n'est réellement copié tant qu'on n'écrit pas). <code>exec()</code> remplace l'image du processus enfant par un autre programme. C'est ce que fait un shell à chaque commande. Le COW explique pourquoi forker un process de 8 Go est instantané et peu coûteux tant que l'enfant n'écrit pas." },

{ id:"n8-linux-02", lvl:8, dom:"Linux",
  q:"Qu'est-ce qu'un processus zombie et un processus orphelin ? Comment un zombie disparaît-il ?",
  accept:["wait","code de retour","parent","init","reaper","adopte par pid 1"],
  explain:"Un zombie a terminé mais son parent n'a pas lu son code de retour avec <code>wait()</code> : l'entrée reste dans la table des processus. Il disparaît quand le parent fait le <code>wait</code> — ou quand le parent meurt et que PID 1 l'adopte et le récolte. Un orphelin est un processus dont le parent est mort ; il est adopté par PID 1. Dans un conteneur, si PID 1 ne récolte pas, les zombies s'accumulent : d'où <code>tini</code> / <code>--init</code>." },

{ id:"n8-linux-03", lvl:8, dom:"Linux",
  q:"Que fait le noyau quand la mémoire manque ? Explique le rôle de l'OOM score et de l'overcommit.",
  accept:["oom killer","score","overcommit","tue le processus","badness"],
  explain:"Linux fait de l'overcommit : il accorde plus de mémoire virtuelle que de RAM+swap, en pariant que tout ne sera pas utilisé. Quand la RAM réelle manque, l'OOM killer choisit une victime selon un score (proportionnel à la mémoire consommée, ajustable par <code>oom_score_adj</code>) et la tue. Dans un conteneur, la limite du cgroup déclenche un OOM local qui tue le processus du cgroup, sans toucher l'hôte." },

{ id:"n8-linux-04", lvl:8, dom:"Linux",
  q:"Différence entre mémoire RSS, virtuelle et le working set d'un conteneur ?",
  accept:["rss physique","virtuelle reservee","working set","page cache"],
  explain:"VSZ/virtuelle = espace d'adressage réservé, souvent énorme et peu significatif. RSS = pages réellement en RAM, mais elle inclut des pages partagées et exclut le page cache. Le <em>working set</em> (métrique utilisée par Kubernetes pour l'OOM et le HPA) = usage courant moins le page cache récupérable. Un candidat qui confond les trois se fait piéger sur le dimensionnement des limites mémoire." },

{ id:"n8-tf-01", lvl:8, dom:"Terraform",
  q:"Explique le cycle de vie complet d'un provider Terraform : que se passe-t-il entre le plan et l'apply ?",
  accept:["grpc","plugin","readresource","planresourcechange","applyresourcechange"],
  explain:"Le provider est un binaire séparé, lancé par Terraform Core et piloté en gRPC. Au refresh, Core appelle <code>ReadResource</code> pour rafraîchir l'état réel ; au plan, <code>PlanResourceChange</code> où le provider annonce ce qu'il fera et quels attributs sont <em>known after apply</em> ; à l'apply, <code>ApplyResourceChange</code> exécute réellement les appels API. Comprendre ça explique les valeurs inconnues au plan et les diffs perpétuels." },

{ id:"n8-tf-02", lvl:8, dom:"Terraform",
  q:"Qu'est-ce qu'un « diff perpétuel » et comment le résous-tu proprement ?",
  accept:["difference a chaque plan","normalisation","api renvoie autre chose","ignore_changes","bug du provider"],
  explain:"À chaque plan, Terraform veut modifier un attribut déjà correct : l'API renvoie une valeur normalisée différente de celle écrite (casse, ordre d'une liste, JSON reformaté, valeur par défaut ajoutée côté cloud). Solutions par ordre de préférence : écrire la valeur sous la forme canonique renvoyée par l'API, utiliser <code>jsonencode</code>/tri déterministe, sinon <code>ignore_changes</code> ciblé — et remonter le bug au provider." },

{ id:"n8-tf-03", lvl:8, dom:"Terraform",
  q:"Pourquoi une valeur <code>known after apply</code> peut-elle rendre un plan inutilisable, et comment contourner ?",
  accept:["inconnue au plan","count","for_each","cascade","valeur non determinee"],
  explain:"Terraform ne peut pas construire le graphe si un <code>count</code> ou une clé de <code>for_each</code> dépend d'une valeur inconnue avant l'apply — il refuse le plan. Contournements : dériver la clé d'une valeur STATIQUE connue (nom, variable) plutôt que d'un attribut calculé, ou découper l'apply en deux étapes (<code>-target</code> en dépannage, ou deux states avec un contrat explicite entre eux)." },

{ id:"n8-tf-04", lvl:8, dom:"Terraform",
  q:"Que fait <code>terraform apply -target</code> et pourquoi HashiCorp le déconseille en usage courant ?",
  accept:["limite le graphe","partiel","etat incoherent","depannage","contourne les dependances"],
  explain:"Il limite l'apply à une ressource et ses dépendances, en ignorant le reste du graphe. Résultat : le state peut devenir partiellement cohérent et masquer une dérive qui explosera au prochain apply complet. C'est un outil de DÉPANNAGE (débloquer un cycle, réparer un apply cassé), pas un mode de fonctionnement. Si on en a besoin régulièrement, c'est que le state est mal découpé." },

{ id:"n8-aws-01", lvl:8, dom:"AWS",
  q:"Explique le modèle de cohérence de S3 aujourd'hui et ce qui a changé.",
  accept:["forte coherence","read after write","depuis 2020","strong consistency"],
  explain:"Depuis décembre 2020, S3 offre une cohérence FORTE en lecture après écriture pour les PUT, les overwrites et les DELETE, sur toutes les régions et sans surcoût. Avant, seuls les PUT de nouveaux objets l'étaient ; les overwrites et suppressions étaient à cohérence à terme, ce qui obligeait à des contournements (nommage unique, DynamoDB en index). Attention : le listing reste cohérent mais les métriques et la réplication restent asynchrones." },

{ id:"n8-aws-02", lvl:8, dom:"AWS",
  q:"Comment fonctionne le throttling d'une API AWS et comment un SDK doit-il réagir ?",
  accept:["token bucket","backoff exponentiel","jitter","retry","throttlingexception"],
  explain:"La plupart des API utilisent un seau à jetons (débit soutenu + capacité de burst) et renvoient <code>ThrottlingException</code>/429 au-delà. Le SDK doit faire un retry avec backoff EXPONENTIEL et JITTER, respecter un budget de retry, et idéalement utiliser le mode adaptatif. Les erreurs de throttling doivent être observées comme métrique : elles annoncent une saturation avant l'incident visible." },

{ id:"n8-aws-03", lvl:8, dom:"AWS",
  q:"Explique le fonctionnement des clés KMS : chiffrement par enveloppe et data key.",
  accept:["data key","enveloppe","cmk","chiffre la cle","jamais la donnee"],
  explain:"KMS ne chiffre pas tes données volumineuses : il génère une <em>data key</em> (symétrique), renvoie sa version en clair ET sa version chiffrée par la clé maître. Le service chiffre les données localement avec la clé en clair, la jette de la mémoire et stocke la version chiffrée à côté de la donnée. Au déchiffrement, il redemande à KMS de déchiffrer la data key. Avantages : performance, et la clé maître ne quitte jamais le HSM." },

{ id:"n8-az-01", lvl:8, dom:"Azure",
  q:"Comment fonctionne le throttling ARM et qu'est-ce qu'un « resource provider » ?",
  accept:["limite par abonnement","429","retry-after","microsoft.compute","enregistrement"],
  explain:"Un resource provider est le service qui expose un type de ressource (<code>Microsoft.Compute</code>, <code>Microsoft.Network</code>) et doit être enregistré sur l'abonnement. ARM applique des limites de requêtes par abonnement, par région et par provider ; au dépassement il renvoie 429 avec un en-tête <code>Retry-After</code> qu'il faut respecter. Un Terraform très parallèle sur un gros parc déclenche ce throttling : on réduit le <code>-parallelism</code>." },

{ id:"n8-az-02", lvl:8, dom:"Azure",
  q:"Quelle est la différence entre un soft delete et un purge protection sur Key Vault ? Pourquoi ça pose problème en IaC ?",
  accept:["retention","nom reserve","conflit","purge","recreation impossible"],
  explain:"Le soft delete conserve le coffre (et ses secrets) pendant une période de rétention ; la purge protection interdit la purge anticipée. Conséquence en IaC : après un <code>destroy</code>, le NOM reste réservé — recréer le même coffre échoue en conflit tant que la rétention court. Avec la purge protection, on ne peut même pas forcer. En environnement éphémère, on génère donc des noms uniques." },

{ id:"n8-res-01", lvl:8, dom:"Réseau",
  q:"Qu'est-ce que le conntrack et pourquoi sa saturation provoque-t-elle des pannes bizarres ?",
  accept:["table de suivi de connexion","nf_conntrack_max","paquets droppes","nat","etat"],
  explain:"Netfilter maintient une table des connexions suivies pour le NAT et les règles stateful. Quand <code>nf_conntrack_max</code> est atteint, les nouveaux paquets sont DROPPÉS silencieusement : symptômes erratiques, timeouts intermittents, DNS UDP qui échoue par intermittence, alors que CPU et réseau semblent sains. On le voit dans <code>dmesg</code> (« nf_conntrack: table full ») et on corrige en augmentant la table, réduisant les timeouts ou supprimant le NAT du chemin." },

{ id:"n8-res-02", lvl:8, dom:"Réseau",
  q:"Qu'est-ce que le TCP slow start et l'impact d'un RTT élevé sur le débit ?",
  accept:["fenetre de congestion","augmente progressivement","bandwidth delay product","latence limite le debit"],
  explain:"TCP démarre avec une petite fenêtre de congestion et l'augmente progressivement. Le débit maximal est borné par fenêtre / RTT (bandwidth-delay product) : sur une liaison Paris–Singapour à 200 ms de RTT, une fenêtre de 64 Ko plafonne à ~2,5 Mbit/s quelle que soit la bande passante achetée. D'où l'intérêt des CDN, du keep-alive, de HTTP/2-3 et du réglage des buffers pour les gros transferts longue distance." },

{ id:"n8-sec-01", lvl:8, dom:"Sécurité",
  q:"Explique la différence entre chiffrement symétrique et asymétrique, et pourquoi TLS utilise les deux.",
  accept:["meme cle","paire de cles","performance","echange de cle","lent"],
  explain:"Le symétrique (AES) est rapide mais suppose que les deux parties partagent déjà la clé. L'asymétrique (RSA, ECDSA) résout la distribution et l'authentification mais est bien plus lent. TLS combine : l'asymétrique sert à authentifier le serveur et à établir un secret partagé (ECDHE, qui apporte la forward secrecy), puis tout le trafic est chiffré en symétrique. La forward secrecy garantit qu'une compromission future de la clé privée ne déchiffre pas les sessions passées." },

{ id:"n8-sec-02", lvl:8, dom:"Sécurité",
  q:"Qu'est-ce que la confused deputy problem en IAM cloud, et comment AWS la traite ?",
  accept:["external id","condition","tiers","utilise les droits","sourceaccount"],
  explain:"Un service tiers légitimement autorisé à endosser ton rôle peut être manipulé pour agir sur les ressources d'un AUTRE client : il est le « député confus » qui utilise ses droits pour le mauvais demandeur. AWS traite ça avec l'<code>ExternalId</code> dans la trust policy pour les rôles cross-compte tiers, et les conditions <code>aws:SourceAccount</code> / <code>aws:SourceArn</code> pour les services. Question typique d'un entretien senior en sécurité cloud." },

{ id:"n8-docker-01", lvl:8, dom:"Docker",
  q:"Comment fonctionne le système de couches d'une image et le filesystem overlay ?",
  accept:["overlayfs","lowerdir","upperdir","copy on write","couches empilees"],
  explain:"Chaque instruction du Dockerfile crée une couche en lecture seule identifiée par son digest. OverlayFS les empile (lowerdirs) et ajoute une couche d'écriture (upperdir) pour le conteneur. Écrire dans un fichier d'une couche basse déclenche un copy-up : le fichier entier est copié dans la couche supérieure — d'où la lenteur des écritures sur de gros fichiers et l'intérêt de mettre les données en volume." },

{ id:"n8-docker-02", lvl:8, dom:"Docker",
  q:"Qu'est-ce qu'un manifest list / image index, et pourquoi c'est important en multi-architecture ?",
  accept:["multi arch","digest par plateforme","buildx","index","selection automatique"],
  explain:"Un manifest list est un index qui référence plusieurs manifestes d'image, un par couple OS/architecture. Le client tire le digest correspondant à sa plateforme automatiquement. C'est ce qui permet à <code>FROM alpine</code> de fonctionner sur amd64 et arm64. On le produit avec <code>docker buildx build --platform linux/amd64,linux/arm64 --push</code>. Sans lui, un build fait sur Mac M-series casse sur des nœuds x86." },

{ id:"n8-cicd-01", lvl:8, dom:"CI/CD",
  q:"Qu'est-ce qu'une attaque par pull_request_target / workflow d'un fork, et comment s'en protéger ?",
  accept:["execute avec les secrets","code non fiable","fork","approbation","permissions"],
  explain:"Certains déclencheurs exécutent le workflow avec les SECRETS du dépôt cible tout en checkoutant du code venant d'un fork non fiable : un contributeur malveillant exfiltre les secrets. Protections : ne jamais checkouter la référence du fork dans un contexte privilégié, exiger une approbation manuelle pour les workflows de contributeurs externes, restreindre <code>GITHUB_TOKEN</code> en lecture seule par défaut, et isoler les jobs qui manipulent des secrets." },

{ id:"n8-obs-01", lvl:8, dom:"Observabilité",
  q:"Qu'est-ce que l'explosion de cardinalité en métriques et pourquoi est-elle fatale ?",
  accept:["trop de series","label unique","memoire","user id","serie temporelle"],
  explain:"Chaque combinaison unique de labels crée une SÉRIE temporelle distincte, stockée en mémoire. Mettre un ID utilisateur, un trace ID ou une URL avec paramètres en label génère des millions de séries : le TSDB explose en RAM et devient injoignable. Règle : les labels doivent être de cardinalité BORNÉE et connue (service, méthode, code de statut, région). Le détail unitaire appartient aux logs et aux traces, pas aux métriques." },

{ id:"n8-sql-01", lvl:8, dom:"SQL",
  q:"Comment fonctionne le MVCC, et quel effet a-t-il sur PostgreSQL en écriture intensive ?",
  accept:["versions","pas de verrou en lecture","bloat","vacuum","tuples morts"],
  explain:"En MVCC, un UPDATE ne modifie pas la ligne : il écrit une nouvelle version et marque l'ancienne comme morte. Les lecteurs voient la version cohérente avec leur snapshot, donc les lectures ne bloquent pas les écritures. Contrepartie : accumulation de tuples morts (bloat) qu'il faut nettoyer avec VACUUM (autovacuum), sous peine de tables gonflées, d'index inefficaces et, à l'extrême, d'un risque de wraparound des transaction IDs." },

{ id:"n8-sre-01", lvl:8, dom:"SRE",
  q:"Explique pourquoi ajouter des retries peut AGGRAVER une panne, et ce qu'il faut mettre à la place.",
  accept:["amplification","charge multipliee","budget de retry","circuit breaker","effondrement"],
  explain:"Un service qui rame reçoit 3x plus de requêtes à cause des retries, ce qui l'achève : c'est l'effondrement métastable. Il faut un budget de retry global (par exemple max 10 % du trafic en retries), un backoff exponentiel avec jitter, un circuit breaker, des timeouts décroissants en profondeur (le service appelé doit avoir un timeout plus court que l'appelant), et un load shedding qui refuse tôt plutôt que de traiter mal." },

{ id:"n8-sre-02", lvl:8, dom:"SRE",
  q:"Qu'est-ce qu'une dépendance critique cachée, et comment la découvres-tu avant l'incident ?",
  accept:["dependance non identifiee","spof","cartographie","test de panne","dns","certificat"],
  explain:"Un composant dont la panne casse tout sans figurer dans les schémas : DNS, autorité de certification, service d'authentification, registry d'images, secret manager, ou même le pipeline CI dont dépend le rollback. On les découvre par cartographie des dépendances (traces distribuées), revue des chemins critiques, et surtout par des exercices de panne contrôlée. Question piège classique : « votre rollback dépend-il du système qui est tombé ? »" }

]);
