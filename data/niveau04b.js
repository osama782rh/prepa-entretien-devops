window.QBANK = (window.QBANK || []).concat([
/* ============ NIVEAU 4 — SÉRIE B ============ */

{ id:"b4-k8s-01", lvl:4, dom:"Kubernetes",
  q:"Qu'est-ce qu'un sidecar ? Donne deux usages réels et le principal inconvénient.",
  accept:["conteneur additionnel","meme pod","proxy","log","consomme des ressources"],
  explain:"Un conteneur secondaire dans le même Pod, partageant réseau et volumes. Usages : proxy de service mesh (Envoy), collecteur de logs, rechargeur de config/secrets, adaptateur de métriques. Inconvénients : ressources consommées par Pod, ordre d'arrêt à gérer (le sidecar ne doit pas mourir avant l'app), et complexité de debug. Les <em>native sidecars</em> (initContainers avec restartPolicy Always) règlent le problème du cycle de vie." },

{ id:"b4-k8s-02", lvl:4, dom:"Kubernetes",
  q:"Comment fais-tu tourner une charge sur des nœuds Spot sans compromettre la disponibilité ?",
  must:[["taint","toleration","node pool","selector"],["pdb","replicas","stateless","tolerant"]],
  explain:"Node pool Spot avec un taint, tolerations uniquement sur les charges tolérantes aux interruptions, réplicas répartis (topologySpread) sur Spot ET on-demand, PDB, arrêt gracieux court, et gestion du signal d'interruption (2 min sur AWS, 30 s sur Azure) pour drainer. Jamais de charge à état ou de composant unique du chemin critique uniquement sur du Spot." },

{ id:"b4-k8s-03", lvl:4, dom:"Kubernetes",
  q:"Qu'est-ce qu'un headless Service et pour quel besoin l'utilise-t-on ?",
  accept:["clusterip none","ip des pods","statefulset","dns par pod","pas de load balancing"],
  explain:"<code>clusterIP: None</code> : pas d'IP virtuelle ni de répartition, le DNS renvoie directement les IP de tous les Pods. Usages : StatefulSets (adresser <code>db-0</code> précisément), clients qui font leur propre équilibrage ou découverte de pairs (Kafka, Cassandra, Elasticsearch), et gRPC qui a besoin des endpoints individuels." },

{ id:"b4-k8s-04", lvl:4, dom:"Kubernetes",
  q:"Pourquoi gRPC s'équilibre-t-il mal derrière un Service ClusterIP classique ?",
  accept:["connexion persistante","http/2","multiplexe","une seule connexion","l4"],
  explain:"gRPC utilise HTTP/2 avec des connexions longue durée multiplexées : le Service, qui équilibre au niveau CONNEXION (L4), envoie tout le trafic d'un client vers un seul Pod. Résultat : charge très déséquilibrée. Solutions : équilibrage côté client via un headless Service, un proxy L7 conscient de gRPC, ou un service mesh." },

{ id:"b4-k8s-05", lvl:4, dom:"Kubernetes",
  q:"Comment gères-tu les secrets dans Kubernetes sans les stocker dans Git ?",
  accept:["external secrets","secrets store csi","sealed secrets","coffre externe"],
  explain:"1) External Secrets Operator ou Secrets Store CSI Driver : le secret reste dans Key Vault / Secrets Manager / Vault, le cluster le synchronise ou le monte à la demande. 2) Sealed Secrets / SOPS : le secret CHIFFRÉ est versionné dans Git, seul le cluster peut le déchiffrer. La première approche est préférable en banque (rotation centralisée, audit des accès)." },

{ id:"b4-k8s-06", lvl:4, dom:"Kubernetes",
  q:"Que se passe-t-il exactement entre le moment où tu supprimes un Pod et sa disparition ?",
  must:[["sigterm"],["grace","terminationgraceperiod","delai"]],
  explain:"Le Pod passe en Terminating, il est retiré des Endpoints (en parallèle, d'où les races), le hook <code>preStop</code> s'exécute, puis SIGTERM est envoyé au PID 1. Le conteneur a <code>terminationGracePeriodSeconds</code> (30 s par défaut) pour finir ses requêtes en cours et sortir ; passé ce délai, SIGKILL. D'où : arrêt gracieux applicatif + preStop pour couvrir la propagation du retrait." },

{ id:"b4-tf-01", lvl:4, dom:"Terraform",
  q:"Comment migres-tu un state d'un backend local vers un backend distant, sans perdre l'infrastructure ?",
  accept:["init -migrate-state","copier","terraform init","confirmation"],
  explain:"On ajoute le bloc <code>backend</code> dans la configuration puis <code>terraform init -migrate-state</code> : Terraform propose de copier le state existant vers le nouveau backend. On vérifie ensuite par un <code>plan</code> qui doit annoncer « no changes ». Sauvegarder le fichier local avant, par prudence." },

{ id:"b4-tf-02", lvl:4, dom:"Terraform",
  q:"À quoi servent les <code>dynamic</code> blocks et quel est leur inconvénient ?",
  accept:["generer des blocs","boucle","for_each imbrique","lisibilite"],
  explain:"Ils génèrent dynamiquement des blocs imbriqués répétitifs (règles de security group, settings) à partir d'une collection. Inconvénient : ça dégrade sérieusement la lisibilité et complique le diff du plan. Règle pratique : n'y recourir que quand le nombre de blocs est réellement variable, pas pour économiser cinq lignes." },

{ id:"b4-tf-03", lvl:4, dom:"Terraform",
  q:"Comment structures-tu le nommage et le tagging de tes ressources en Terraform ?",
  accept:["locals","convention","tags communs","merge","default_tags"],
  explain:"Une convention centralisée dans des <code>locals</code> (<code>{projet}-{env}-{composant}-{région}</code>) et un bloc de tags communs fusionné partout avec <code>merge(local.tags_communs, {...})</code>. Sur AWS, <code>default_tags</code> au niveau provider ; sur Azure, une Azure Policy en mode Modify pour imposer les tags. Sans ça, aucune refacturation ni inventaire fiable." },

{ id:"b4-tf-04", lvl:4, dom:"Terraform",
  q:"Terraform doit créer une ressource qui dépend d'une valeur générée aléatoirement. Comment garantis-tu la stabilité ?",
  accept:["random provider","keepers","dans le state","ne change pas"],
  explain:"On utilise le provider <code>random</code> (<code>random_password</code>, <code>random_id</code>) : la valeur est générée UNE fois et conservée dans le state, donc stable aux apply suivants. Les <code>keepers</code> permettent de forcer une régénération quand une entrée change. Un <code>uuid()</code> ou un <code>timestamp()</code> dans une ressource provoque au contraire un diff perpétuel." },

{ id:"b4-aws-01", lvl:4, dom:"AWS",
  q:"Comment fonctionne le chiffrement S3 côté serveur ? Différence SSE-S3, SSE-KMS, SSE-C.",
  must:[["kms","cle geree"],["s3","aws gere"]],
  explain:"SSE-S3 : clés entièrement gérées par AWS, simple, pas de contrôle ni de traçabilité fine. SSE-KMS : clé dans KMS, avec politique d'accès, journalisation CloudTrail de chaque déchiffrement et possibilité de clé gérée par le client (CMK) — le choix bancaire. SSE-C : tu fournis la clé à chaque requête, AWS ne la stocke pas (rare, contraignant). À savoir : SSE-KMS ajoute un coût et un quota de requêtes KMS." },

{ id:"b4-aws-02", lvl:4, dom:"AWS",
  q:"Qu'est-ce qu'AWS Step Functions et quand le préfère-t-on à une Lambda qui appelle d'autres Lambdas ?",
  accept:["orchestration","machine a etats","retry","visibilite","longue duree"],
  explain:"C'est un orchestrateur de workflow (machine à états) : il gère les retries, les branchements, les erreurs, les timeouts et les traitements longs, avec une visualisation de l'exécution. On le préfère dès qu'il y a plusieurs étapes : chaîner des Lambdas à la main, c'est réimplémenter mal la gestion d'erreurs, et perdre toute traçabilité du parcours." },

{ id:"b4-aws-03", lvl:4, dom:"AWS",
  q:"Comment sécurises-tu un bucket S3 qui ne doit JAMAIS être public ? Cite les couches.",
  must:[["block public access"],["bucket policy","deny","policy"]],
  explain:"1) Block Public Access au niveau bucket ET au niveau compte. 2) Bucket policy avec un Deny explicite sur tout principal non autorisé et un Deny si <code>aws:SecureTransport = false</code>. 3) SCP d'organisation interdisant de désactiver Block Public Access. 4) Chiffrement SSE-KMS avec une key policy restrictive. 5) Access Analyzer + Config pour détecter toute dérive. Défense en profondeur : une seule couche finit toujours par sauter." },

{ id:"b4-aws-04", lvl:4, dom:"AWS",
  q:"Différence entre ECS sur EC2 et ECS sur Fargate ? Sur quoi arbitres-tu ?",
  accept:["gerer les instances","serverless","cout","controle","densite"],
  explain:"Sur EC2 : tu gères les instances (patchs, capacité, AMI), tu peux optimiser la densité et le coût, utiliser du Spot et des types spécifiques (GPU). Sur Fargate : plus de nœuds à gérer, isolation par tâche, facturation à la ressource demandée — plus cher à l'unité mais souvent moins cher tout compris quand on valorise le temps humain. Arbitrage : contrôle et coût unitaire vs charge opérationnelle." },

{ id:"b4-az-01", lvl:4, dom:"Azure",
  q:"Comment mets-tu en place une identité de pipeline Azure DevOps / GitHub vers Azure sans secret ?",
  accept:["workload identity federation","oidc","federated credential","sans secret"],
  explain:"Workload identity federation : on crée une application/identité managée dans Entra ID et on lui ajoute un <em>federated credential</em> qui fait confiance à l'émetteur OIDC du fournisseur CI, restreint au dépôt/branche/environnement précis. Le pipeline échange son token OIDC contre un token Entra — aucun secret à stocker ni à faire tourner." },

{ id:"b4-az-02", lvl:4, dom:"Azure",
  q:"Qu'est-ce qu'un Azure Front Door et en quoi diffère-t-il d'une Application Gateway ?",
  accept:["global","regional","anycast","edge","multi region"],
  explain:"Front Door est GLOBAL : points de présence en périphérie, routage anycast, cache CDN, WAF, bascule multi-région et accélération. Application Gateway est RÉGIONALE : L7 + WAF pour les backends d'une région. Architecture typique : Front Door en entrée mondiale → Application Gateway par région → backends." },

{ id:"b4-az-03", lvl:4, dom:"Azure",
  q:"Comment fonctionne le patching des VM Azure à l'échelle ?",
  accept:["update manager","maintenance configuration","fenetre","conformite"],
  explain:"Azure Update Manager : évaluation périodique de la conformité, planification par <em>maintenance configuration</em> (fenêtres définies), déploiement par vagues avec exclusions, et rapports. En complément : images dorées reconstruites régulièrement plutôt que patchées en place — plus proche de l'immuabilité, et c'est l'argument à donner." },

{ id:"b4-az-04", lvl:4, dom:"Azure",
  q:"Différence entre Azure Files et Azure Blob pour une application conteneurisée ?",
  accept:["systeme de fichiers","smb nfs","objet","readwritemany","api rest"],
  explain:"Azure Files expose un système de fichiers (SMB/NFS) montable par plusieurs Pods simultanément — c'est l'option ReadWriteMany. Blob est du stockage objet accédé par API/SDK, bien plus performant et économique pour de gros volumes, mais ce n'est pas un filesystem POSIX. Choisir Files uniquement quand l'application EXIGE un montage partagé." },

{ id:"b4-cicd-01", lvl:4, dom:"CI/CD",
  q:"Comment implémentes-tu un déploiement canary sur Kubernetes ? Cite deux approches.",
  accept:["argo rollouts","flagger","ingress weight","service mesh","deux deployments"],
  explain:"1) Manuellement : deux Deployments (stable et canary) derrière le même Service, ratio piloté par le nombre de réplicas — grossier. 2) Par pondération au niveau du routage : annotations de l'ingress controller, Gateway API, ou service mesh. 3) Automatisé avec Argo Rollouts ou Flagger : montée progressive avec ANALYSE automatique des métriques et rollback si les seuils sont dépassés — c'est la bonne réponse." },

{ id:"b4-cicd-02", lvl:4, dom:"CI/CD",
  q:"Qu'est-ce qu'un feature flag, et quelle dette crée-t-il ?",
  accept:["activer sans deployer","decouple","nettoyage","combinatoire","dette"],
  explain:"Un interrupteur qui active/désactive une fonctionnalité sans redéployer : il découple la mise en production de la mise à disposition, permet le déploiement progressif par segment et le kill switch instantané. Dette : chaque flag ajoute un chemin de code et une combinatoire de tests. Il faut une date de péremption et un nettoyage systématique — un flag permanent est devenu une option de configuration, il faut l'assumer comme telle." },

{ id:"b4-cicd-03", lvl:4, dom:"CI/CD",
  q:"Comment garantis-tu qu'un artefact déployé en production est bien celui qui a été testé ?",
  accept:["digest","immuable","signature","promotion","meme identifiant"],
  explain:"Référencer par identifiant IMMUABLE (digest SHA256 de l'image, pas un tag), signer l'artefact au build et vérifier la signature à l'admission, tracer la promotion (quel digest a passé quel environnement), et produire une attestation de provenance. Un tag mutable ne prouve rien — il peut être réaffecté à tout moment." },

{ id:"b4-sec-01", lvl:4, dom:"Sécurité",
  q:"Qu'est-ce qu'OAuth 2.0 et OpenID Connect ? Ne confonds pas les deux.",
  must:[["autorisation","acces","deleguer"],["authentification","identite","id token"]],
  explain:"OAuth 2.0 est un protocole d'AUTORISATION : il délègue un accès à une ressource via un access token, sans partager le mot de passe. OpenID Connect est une couche d'AUTHENTIFICATION construite au-dessus : il ajoute l'<code>id_token</code> (un JWT décrivant l'utilisateur) et le endpoint userinfo. Utiliser OAuth seul pour authentifier est une erreur classique de conception." },

{ id:"b4-sec-02", lvl:4, dom:"Sécurité",
  q:"Qu'est-ce qu'une permission boundary AWS et quand l'utilise-t-on ?",
  accept:["plafond","delegation","limite maximale","developpeur peut creer des roles"],
  explain:"C'est un plafond de permissions attaché à une identité : les droits effectifs sont l'INTERSECTION de la policy et de la boundary. Usage typique : autoriser des équipes à créer leurs propres rôles IAM (autonomie) sans qu'elles puissent s'octroyer plus que ce que la boundary permet — délégation encadrée, très utilisée en grande organisation." },

{ id:"b4-sec-03", lvl:4, dom:"Sécurité",
  q:"Comment détectes-tu qu'un secret a été commité, avant qu'il n'arrive dans l'historique partagé ?",
  accept:["pre-commit","gitleaks","trufflehog","scan","push protection"],
  explain:"Hook pre-commit (gitleaks, detect-secrets, trufflehog) sur les postes, DOUBLÉ d'un contrôle côté serveur non contournable : push protection du forge, ou job CI bloquant qui scanne l'historique de la PR. Le hook local seul est contournable avec <code>--no-verify</code> — c'est un accélérateur, pas un contrôle." },

{ id:"b4-obs-01", lvl:4, dom:"Observabilité",
  q:"Comment instrumentes-tu une application pour exposer des métriques Prometheus ?",
  accept:["client library","/metrics","counter","histogram","exporter"],
  explain:"Bibliothèque cliente (ou OpenTelemetry avec export Prometheus) qui expose un endpoint <code>/metrics</code> : counters pour les requêtes et erreurs, histogrammes pour les latences, gauges pour les états. Pour un composant qu'on ne peut pas modifier, on utilise un <em>exporter</em> dédié. Règle : labels de cardinalité bornée uniquement." },

{ id:"b4-obs-02", lvl:4, dom:"Observabilité",
  q:"Qu'est-ce qu'Alertmanager apporte par rapport à une simple règle d'alerte ?",
  accept:["regroupement","inhibition","silence","routage","deduplication"],
  explain:"Il gère le cycle de vie de la notification : regroupement (une notification pour 50 pods tombés, pas 50), déduplication, inhibition (ne pas alerter sur les symptômes quand la cause parente est déjà connue), silences planifiés pour les maintenances, et routage vers la bonne équipe selon les labels. Sans lui, une panne génère une avalanche qui noie l'information utile." },

{ id:"b4-sre-01", lvl:4, dom:"SRE",
  q:"Qu'est-ce qu'un test de charge, un test de stress et un test d'endurance ?",
  must:[["charge attendue","nominal","cible"],["limite","rupture","au-dela"],["duree","longue","fuite"]],
  explain:"Charge : on valide le comportement à la charge ATTENDUE (latence, erreurs). Stress : on pousse jusqu'à la RUPTURE pour connaître le point de bascule et vérifier que la dégradation est gracieuse. Endurance (soak) : charge nominale pendant des heures pour révéler les fuites mémoire, la saturation de pools et le gonflement des logs. Les trois répondent à des questions différentes." },

{ id:"b4-sre-02", lvl:4, dom:"SRE",
  q:"Comment estimes-tu le coût d'une minute d'indisponibilité, et pourquoi c'est utile ?",
  accept:["chiffre d affaires","transactions","penalite","justifier l investissement"],
  explain:"Chiffre d'affaires ou volume de transactions par minute sur la période concernée, plus les pénalités contractuelles, le coût de traitement des réclamations, et l'impact réputationnel/réglementaire (en banque, un incident majeur se déclare au régulateur). Utilité : c'est le seul argument qui fait accepter un investissement en résilience par une direction." },

{ id:"b4-linux-01", lvl:4, dom:"Linux",
  q:"Qu'est-ce que le TIME_WAIT et faut-il s'en inquiéter sur un reverse proxy ?",
  accept:["fermeture","2msl","normal","ports ephemeres","reutilisation"],
  explain:"C'est l'état d'attente (2×MSL, ~60 s) du côté qui ferme la connexion, pour absorber les paquets retardataires. Sur un proxy à fort trafic, en voir des dizaines de milliers est NORMAL. Ça ne devient un problème que si on épuise les ports éphémères — la solution est le keep-alive et le pooling de connexions, pas de bricoler les sysctl à l'aveugle." },

{ id:"b4-linux-02", lvl:4, dom:"Linux",
  q:"Comment fonctionne la rotation de logs et quel est le piège avec un processus qui écrit en continu ?",
  accept:["logrotate","copytruncate","signal","reouvre le fichier","descripteur"],
  explain:"logrotate renomme le fichier et en crée un nouveau — mais le processus écrit toujours dans l'ancien descripteur. Il faut soit lui envoyer un signal pour qu'il rouvre (<code>postrotate</code> + SIGHUP/<code>systemctl reload</code>), soit utiliser <code>copytruncate</code> (copie puis tronque, avec un petit risque de perte). Oublier ça, c'est le disque qui se remplit avec un fichier « supprimé »." },

{ id:"b4-res-01", lvl:4, dom:"Réseau",
  q:"Qu'est-ce qu'un routage asymétrique et pourquoi ça casse un firewall stateful ?",
  accept:["aller et retour differents","pas le meme chemin","etat inconnu","drop"],
  explain:"L'aller passe par un chemin et le retour par un autre. Un firewall stateful qui voit le retour sans avoir vu l'aller ne trouve pas d'entrée dans sa table d'états et jette le paquet. C'est un classique des architectures hybrides avec VPN + ExpressRoute/Direct Connect actifs simultanément et des préférences BGP mal réglées." },

{ id:"b4-res-02", lvl:4, dom:"Réseau",
  q:"Comment fonctionne le health check d'un load balancer et quel réglage cause le plus de faux positifs ?",
  accept:["intervalle","seuil","timeout","trop agressif","unhealthy threshold"],
  explain:"Le LB interroge périodiquement un endpoint ; après N échecs consécutifs la cible est retirée, après M succès elle revient. Faux positifs classiques : timeout plus court que la latence réelle sous charge, seuil d'échec à 1, ou endpoint de santé qui teste les dépendances externes — un ralentissement de la base retire alors TOUTES les cibles d'un coup." }

]);
