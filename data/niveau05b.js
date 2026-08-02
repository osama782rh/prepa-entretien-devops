window.QBANK = (window.QBANK || []).concat([
/* ============ NIVEAU 5 — SÉRIE B ============ */

{ id:"b5-k8s-01", lvl:5, dom:"Kubernetes",
  q:"Explique ce qu'est un CSI driver et pourquoi Kubernetes l'a introduit.",
  accept:["interface de stockage","plugin externe","hors du core","standard"],
  explain:"Container Storage Interface : une interface standard qui permet à un fournisseur de stockage d'écrire un pilote HORS du code de Kubernetes. Avant, chaque intégration (EBS, Azure Disk) vivait dans le core (« in-tree ») et suivait le cycle de release de K8s. Le CSI permet des mises à jour indépendantes, et apporte snapshots, redimensionnement et clonage standardisés." },

{ id:"b5-k8s-02", lvl:5, dom:"Kubernetes",
  q:"Comment fonctionne la découverte de services entre namespaces, et comment la restreins-tu ?",
  must:[["fqdn","namespace","svc.cluster.local"],["networkpolicy","policy"]],
  explain:"On appelle <code>service.autre-namespace.svc.cluster.local</code> — le DNS résout à travers tout le cluster et rien n'est bloqué par défaut. Pour restreindre : NetworkPolicy default-deny en ingress ET egress dans chaque namespace, puis autorisation explicite par namespaceSelector. Le cloisonnement DNS seul n'existe pas : c'est le réseau qui filtre." },

{ id:"b5-k8s-03", lvl:5, dom:"Kubernetes",
  q:"Un cluster a 3 nœuds et tu déploies 3 réplicas. Es-tu protégé contre la perte d'un nœud ? Justifie.",
  accept:["pas garanti","topologyspread","anti-affinity","peuvent etre sur le meme noeud"],
  explain:"Pas automatiquement : le scheduler peut placer les 3 Pods sur le même nœud si les ressources le permettent. Il faut l'expliciter avec <code>topologySpreadConstraints</code> (topologyKey <code>kubernetes.io/hostname</code>, et <code>topology.kubernetes.io/zone</code> pour le multi-AZ) ou une podAntiAffinity. Et prévoir la capacité pour que N-1 nœuds absorbent la charge." },

{ id:"b5-k8s-04", lvl:5, dom:"Kubernetes",
  q:"Qu'est-ce que le Pod Security Admission et quels sont ses trois niveaux ?",
  must:[["privileged"],["baseline"],["restricted"]],
  explain:"Le contrôleur d'admission natif qui applique les Pod Security Standards par namespace via des labels. <b>privileged</b> : aucune restriction. <b>baseline</b> : bloque les élévations évidentes (privileged, hostNetwork, hostPath). <b>restricted</b> : durcissement complet (non-root obligatoire, capabilities drop ALL, seccomp RuntimeDefault). Modes <code>enforce</code>, <code>audit</code>, <code>warn</code> — on commence toujours par audit/warn." },

{ id:"b5-k8s-05", lvl:5, dom:"Kubernetes",
  q:"Comment sauvegardes-tu un cluster Kubernetes ? Que faut-il sauvegarder exactement ?",
  must:[["etcd","objets","manifestes"],["volume","pv","donnees"]],
  explain:"Deux choses distinctes : (1) l'état des objets — snapshot etcd, ou mieux, tout le désiré dans Git (GitOps) ce qui rend la sauvegarde presque inutile ; (2) les DONNÉES des volumes persistants, via des snapshots CSI. Velero fait les deux (objets + volumes + restauration sélective). Piège : sauvegarder etcd sans les PV ne restaure rien d'utile." },

{ id:"b5-k8s-06", lvl:5, dom:"Kubernetes",
  q:"Que fait un Ingress Controller concrètement quand tu crées un objet Ingress ?",
  accept:["watch","reconfigure","reload","genere la conf","proxy"],
  explain:"Il surveille (watch) les objets Ingress via l'API, génère la configuration du proxy sous-jacent (nginx.conf, routes Envoy, règles de l'ALB), la recharge à chaud, et met à jour le statut de l'Ingress avec l'adresse d'entrée. Il surveille aussi Services et Endpoints pour router directement vers les IP des Pods et éviter un double saut par le Service." },

{ id:"b5-tf-01", lvl:5, dom:"Terraform",
  q:"Comment gérerais-tu la création d'un cluster AKS/EKS ET des ressources Kubernetes dedans avec Terraform ?",
  accept:["deux states","separer","provider kubernetes","dependance","poule et oeuf"],
  explain:"On SÉPARE en deux states : un pour le cluster (provider cloud), un pour les objets Kubernetes (providers kubernetes/helm configurés depuis les outputs du premier). Raison : configurer un provider à partir d'une ressource créée dans le même apply crée un problème d'initialisation (valeurs inconnues au plan) et rend le destroy impossible. C'est une question de conception très discriminante." },

{ id:"b5-tf-02", lvl:5, dom:"Terraform",
  q:"Comment gérerais-tu 200 comptes AWS avec Terraform sans dupliquer 200 fois le code ?",
  accept:["module","for_each","pipeline par compte","assume role","matrice"],
  explain:"Un module de baseline unique, appliqué par compte via un pipeline paramétré (matrice) qui assume un rôle dans chaque compte, avec un state par compte. Alternative : une couche d'orchestration (Terragrunt, workspaces, ou un générateur de configuration). Ce qu'il ne faut PAS faire : un état géant avec 200 providers aliasés — plan interminable et rayon d'impact maximal." },

{ id:"b5-tf-03", lvl:5, dom:"Terraform",
  q:"Que se passe-t-il si tu supprimes un bloc de ressource du code sans faire de destroy ?",
  accept:["detruite au prochain apply","plan de destruction","supprime","state"],
  explain:"Au prochain plan, Terraform voit une ressource dans le state absente du code : il propose de la DÉTRUIRE. C'est le comportement normal et attendu. Si l'intention était de cesser de la gérer sans la supprimer, il fallait <code>terraform state rm</code> AVANT de retirer le code — ou un bloc <code>removed</code> (1.7+) qui exprime ça de façon déclarative." },

{ id:"b5-tf-04", lvl:5, dom:"Terraform",
  q:"Comment fais-tu une revue de code Terraform efficace ? Que regardes-tu en priorité ?",
  must:[["plan","destruction","remplacement"],["securite","public","chiffrement","droits"]],
  explain:"1) Le PLAN avant le code : y a-t-il des destroy ou des replacement inattendus ? 2) Sécurité : exposition publique, chiffrement, droits trop larges, secrets en clair. 3) Rayon d'impact : quel environnement, quelle criticité. 4) Réversibilité : peut-on revenir en arrière ? 5) Seulement ensuite : style, nommage, factorisation. Beaucoup de revues font l'inverse et laissent passer l'essentiel." },

{ id:"b5-aws-01", lvl:5, dom:"AWS",
  q:"Comment fonctionne le routage Route 53 ? Cite trois politiques et leur usage.",
  must:[["latency","latence","geo","weighted","failover"]],
  explain:"Simple (un enregistrement), Weighted (répartition par pourcentage — canary ou migration), Latency (l'utilisateur va vers la région la plus rapide), Geolocation/Geoproximity (conformité, contenu local), Failover (primaire/secours avec health check), Multivalue. Combinées aux health checks, elles permettent une bascule DR automatique — sous réserve d'un TTL court." },

{ id:"b5-aws-02", lvl:5, dom:"AWS",
  q:"Qu'est-ce qu'AWS Organizations SCP et pourquoi une SCP n'accorde-t-elle jamais de droits ?",
  accept:["plafond","filtre","garde-fou","intersection","limite"],
  explain:"Une SCP est un FILTRE appliqué à un compte ou une OU : elle définit le maximum autorisé, mais n'accorde rien par elle-même. Les droits effectifs = intersection SCP ∩ policies IAM. Usages : interdire les régions non autorisées, empêcher la désactivation de CloudTrail/GuardDuty, bloquer la suppression des sauvegardes. Elle ne s'applique pas au compte de gestion — piège classique." },

{ id:"b5-aws-03", lvl:5, dom:"AWS",
  q:"Explique le fonctionnement d'un Auto Scaling Group avec une politique de target tracking.",
  accept:["metrique cible","ajuste","cloudwatch","thermostat","cooldown"],
  explain:"On fixe une cible (par exemple CPU moyen à 50 %) et l'ASG ajuste le nombre d'instances pour s'en approcher, comme un thermostat, via des alarmes CloudWatch gérées automatiquement. Points d'attention : le délai de mise en service (warm-up) rend la réaction lente face à un pic brutal, d'où le pré-scaling planifié ; et le scale-in doit respecter un cooldown pour éviter l'oscillation." },

{ id:"b5-aws-04", lvl:5, dom:"AWS",
  q:"Comment isoles-tu les sauvegardes d'un ransomware sur AWS ?",
  must:[["compte separe","autre compte","isole"],["immuable","object lock","vault lock","worm"]],
  explain:"Copie des sauvegardes dans un COMPTE dédié auquel les identités de production n'ont aucun accès en écriture ou en suppression, avec immuabilité (S3 Object Lock en mode Compliance, AWS Backup Vault Lock), MFA delete, et SCP empêchant la suppression même pour un administrateur. Le principe : un attaquant qui compromet la prod ne doit pas pouvoir atteindre les sauvegardes." },

{ id:"b5-az-01", lvl:5, dom:"Azure",
  q:"Comment fonctionne l'authentification à Azure SQL par Entra ID plutôt que par login SQL ?",
  accept:["token","managed identity","pas de mot de passe","administrateur entra"],
  explain:"On définit un administrateur Entra ID sur le serveur, on crée des utilisateurs contenus depuis Entra (<code>CREATE USER [app] FROM EXTERNAL PROVIDER</code>), et l'application obtient un token via sa Managed Identity au lieu d'un mot de passe. Bénéfices : aucun secret, révocation centralisée, MFA et accès conditionnel possibles sur les accès humains, journalisation unifiée." },

{ id:"b5-az-02", lvl:5, dom:"Azure",
  q:"Qu'est-ce que le mode Kubenet vs Azure CNI dans AKS ? Quel impact sur le plan d'adressage ?",
  accept:["ip du vnet","pod ip routable","consomme des ip","overlay","nat"],
  explain:"Kubenet : les Pods ont des IP hors du VNet, routées par UDR — économe en IP mais limité et moins performant. Azure CNI : chaque Pod reçoit une IP DU VNET, donc directement routable et compatible avec les Private Endpoints, mais il faut dimensionner le subnet pour <code>nœuds × (max pods par nœud + 1)</code> — un sous-dimensionnement bloque la montée en charge et ne se corrige pas à chaud. Azure CNI Overlay est le compromis moderne." },

{ id:"b5-az-03", lvl:5, dom:"Azure",
  q:"Comment centralises-tu les logs de 50 subscriptions Azure ?",
  accept:["log analytics","diagnostic settings","policy","deployifnotexists","workspace central"],
  explain:"Un (ou quelques) workspace Log Analytics central dans une subscription de management, alimenté par les diagnostic settings de chaque ressource — imposés automatiquement par une initiative Azure Policy en <code>DeployIfNotExists</code> assignée au management group. Compléter par l'export vers un stockage immuable pour la rétention longue, et Sentinel pour le SIEM." },

{ id:"b5-res-01", lvl:5, dom:"Réseau",
  q:"Qu'est-ce que le split-horizon DNS et dans quel cas en a-t-on besoin ?",
  accept:["reponse differente","interne externe","meme nom","vue"],
  explain:"Le même nom résout vers des IP différentes selon l'origine de la requête : IP privée depuis le réseau interne, IP publique depuis internet. C'est exactement ce que font les Private DNS Zones Azure et les hosted zones privées Route 53. Indispensable pour utiliser le même FQDN partout tout en gardant le trafic interne sur le réseau privé." },

{ id:"b5-res-02", lvl:5, dom:"Réseau",
  q:"Comment fonctionne BGP dans un contexte de connexion hybride, en une explication simple ?",
  accept:["annonce des routes","annonce les prefixes","echange de routes","routage dynamique","preference","systeme autonome"],
  explain:"Chaque côté ANNONCE les préfixes qu'il sait joindre, et chacun choisit le meilleur chemin selon des attributs (AS path, local preference, MED). Concrètement : ton datacenter annonce ses plages à Azure/AWS et inversement, sans configuration statique. Intérêt : la bascule VPN ↔ lien dédié devient automatique. Risque : une annonce trop large ou une préférence mal réglée provoque un routage asymétrique ou une fuite de routes." },

{ id:"b5-res-03", lvl:5, dom:"Réseau",
  q:"Qu'est-ce qu'une attaque DDoS volumétrique et comment s'en protège-t-on dans le cloud ?",
  accept:["saturer la bande passante","shield","ddos protection","cdn","absorber"],
  explain:"On sature la bande passante ou les ressources par un volume massif de trafic. Protections : services dédiés (AWS Shield, Azure DDoS Protection Standard) qui absorbent et filtrent en amont, CDN/anycast qui répartissent la charge mondialement, WAF avec rate limiting pour les attaques applicatives (L7), et une architecture qui ne dépend pas d'une IP unique. Point clé : on ne se défend pas d'un DDoS volumétrique avec de l'autoscaling — on paierait la facture de l'attaquant." },

{ id:"b5-sec-01", lvl:5, dom:"Sécurité",
  q:"Comment fonctionne HashiCorp Vault et qu'apporte-t-il par rapport à un coffre cloud natif ?",
  accept:["secrets dynamiques","bail","lease","multi cloud","moteur"],
  explain:"Vault authentifie une identité (Kubernetes, OIDC, AppRole) et délivre des secrets, avec des moteurs qui GÉNÈRENT des secrets dynamiques à durée de vie limitée (un couple identifiant/mot de passe de base créé à la demande, révoqué à l'expiration du bail). Par rapport au natif : portable multi-cloud et on-premise, secrets dynamiques, chiffrement en tant que service. Coût : c'est un composant critique de plus à opérer en haute disponibilité." },

{ id:"b5-sec-02", lvl:5, dom:"Sécurité",
  q:"Qu'est-ce qu'un WAF et quelles sont ses limites ?",
  accept:["filtre applicatif","owasp","faux positifs","ne corrige pas","couche 7"],
  explain:"Un pare-feu applicatif qui inspecte le trafic HTTP et bloque les motifs d'attaque (injection SQL, XSS, top 10 OWASP) avec du rate limiting et des règles gérées. Limites : il ne corrige pas la vulnérabilité sous-jacente, il génère des faux positifs qui cassent des fonctionnalités légitimes (d'où un passage obligatoire en mode détection avant blocage), et il est contournable. C'est une couche de défense en profondeur, pas un substitut au code sûr." },

{ id:"b5-sec-03", lvl:5, dom:"Sécurité",
  q:"Comment gères-tu la révocation d'accès d'une personne qui quitte l'entreprise, en environnement cloud ?",
  must:[["desactiver le compte","identite","annuaire"],["cle","token","secret","session"]],
  explain:"Désactivation dans l'annuaire source (Entra ID/IdP) — ce qui coupe tout ce qui est fédéré —, révocation des sessions et tokens de rafraîchissement en cours, suppression des clés d'accès et tokens personnels (cloud, Git, registry), retrait des groupes et des accès break-glass, et rotation de tout secret partagé qu'elle connaissait. Puis vérification par revue d'accès. La leçon : plus les accès sont fédérés et temporaires, plus cette procédure est simple et fiable." },

{ id:"b5-obs-01", lvl:5, dom:"Observabilité",
  q:"Qu'est-ce qu'OpenTelemetry et pourquoi c'est important stratégiquement ?",
  accept:["standard","vendor neutral","instrumentation unique","collector","portabilite"],
  explain:"C'est le standard CNCF d'instrumentation (traces, métriques, logs) : une seule instrumentation dans le code, et un <em>collector</em> qui exporte vers n'importe quel backend. Enjeu stratégique : on ne réinstrumente pas 200 services le jour où on change d'éditeur d'APM. C'est un argument de négociation et de réversibilité, pas seulement technique." },

{ id:"b5-obs-02", lvl:5, dom:"Observabilité",
  q:"Comment calcules-tu un taux de disponibilité à partir de métriques ? Quel piège ?",
  accept:["requetes reussies","ratio","fenetre","zero trafic","division par zero"],
  explain:"Ratio requêtes réussies / requêtes totales sur une fenêtre glissante (SLI basé sur les requêtes), plutôt que du temps d'uptime — c'est plus proche du vécu utilisateur. Pièges : les périodes sans trafic (division par zéro ou disponibilité artificiellement parfaite la nuit), les erreurs client 4xx qu'il ne faut pas compter comme des échecs du service, et le point de mesure (mesurer dans l'app rate ce qui casse avant elle)." },

{ id:"b5-sre-01", lvl:5, dom:"SRE",
  q:"Qu'est-ce qu'une dégradation gracieuse ? Donne un exemple bancaire.",
  accept:["fonctionnalite reduite","au lieu de tomber","cache","mode degrade","essentiel"],
  explain:"Le service continue de rendre l'essentiel en désactivant l'accessoire au lieu de tomber entièrement. Exemple bancaire : si le service de scoring temps réel est indisponible, on continue d'afficher le solde et l'historique en désactivant les recommandations ; ou on sert un solde en cache daté explicitement plutôt qu'une erreur. Cela suppose d'avoir hiérarchisé les fonctions AVANT l'incident." },

{ id:"b5-sre-02", lvl:5, dom:"SRE",
  q:"Comment organises-tu une astreinte soutenable ?",
  accept:["rotation","suffisamment de personnes","runbook","compensation","alertes actionnables"],
  explain:"Rotation avec assez de personnes pour que le tour revienne rarement (6-8 minimum), alertes uniquement actionnables avec runbook, mesure du nombre de réveils par tour comme indicateur suivi, droit à la récupération après une nuit blanche, compensation, passation formelle entre tours, et budget explicite pour corriger ce qui a réveillé. Une astreinte qui sonne toutes les nuits est un problème d'ingénierie, pas de planning." },

{ id:"b5-sql-01", lvl:5, dom:"SQL",
  q:"Comment fonctionne le point-in-time recovery et de quoi dépend-il ?",
  accept:["sauvegarde complete","logs de transaction","wal","rejouer","instant precis"],
  explain:"On restaure une sauvegarde complète antérieure, puis on REJOUE les journaux de transactions (WAL / binlog) jusqu'à l'instant choisi. Cela dépend donc de la conservation continue de ces journaux et de la fenêtre de rétention. C'est ce qui permet de revenir juste avant un <code>DELETE</code> catastrophique — à condition de l'avoir testé, car la restauration d'une grosse base prend des heures." },

{ id:"b5-sql-02", lvl:5, dom:"SQL",
  q:"Qu'est-ce qu'une vue matérialisée et quand l'utilise-t-on ?",
  accept:["resultat stocke","precalcule","rafraichir","agregation couteuse"],
  explain:"Une vue dont le RÉSULTAT est stocké physiquement, à rafraîchir explicitement ou périodiquement. On l'utilise pour des agrégations coûteuses relues souvent (tableaux de bord, rapports). Contrepartie : les données sont périmées entre deux rafraîchissements, et le rafraîchissement lui-même peut être lourd et verrouillant (d'où <code>REFRESH ... CONCURRENTLY</code>)." },

{ id:"b5-cicd-01", lvl:5, dom:"CI/CD",
  q:"Comment gères-tu les migrations de base dans un pipeline Kubernetes ?",
  accept:["job","initcontainer","avant le deploiement","une seule instance","verrou"],
  explain:"Un Job Kubernetes (ou un hook Helm pre-upgrade) exécuté AVANT le rollout, en une seule instance, avec un verrou applicatif dans l'outil de migration (Flyway/Liquibase pose un verrou en base) pour éviter deux exécutions concurrentes. Un initContainer sur chaque Pod est un anti-pattern : N réplicas = N migrations simultanées. Et les migrations doivent rester rétrocompatibles pour permettre le rollback." },

{ id:"b5-docker-01", lvl:5, dom:"Docker",
  q:"Qu'est-ce que BuildKit apporte par rapport au builder Docker historique ?",
  accept:["parallelisation","cache","mount secret","plus rapide","cache distant"],
  explain:"Exécution parallèle des étapes indépendantes du graphe, cache plus fin et exportable/partagé entre machines (<code>--cache-from/--cache-to</code>), montage de secrets sans les laisser dans les couches (<code>--mount=type=secret</code>), montage de caches de dépendances (<code>--mount=type=cache</code>), et builds multi-plateformes. C'est ce qui rend les builds de CI à la fois plus rapides et plus sûrs." },

{ id:"b5-linux-01", lvl:5, dom:"Linux",
  q:"Comment fonctionne le DNS côté client Linux dans un conteneur ? Quels fichiers interviennent ?",
  accept:["resolv.conf","nsswitch","ndots","search","nameserver"],
  explain:"<code>/etc/nsswitch.conf</code> définit l'ordre des sources (files puis dns), <code>/etc/hosts</code> est consulté en premier, puis <code>/etc/resolv.conf</code> donne les <code>nameserver</code>, la liste <code>search</code> et les options dont <code>ndots</code>. Dans un Pod, ce fichier est injecté par le kubelet avec <code>ndots:5</code> — d'où les requêtes multiples pour un nom externe et la surcharge de CoreDNS." }

]);
