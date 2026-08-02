window.QBANK = (window.QBANK || []).concat([
/* ================= NIVEAU 5 — RÉSEAU, SÉCURITÉ, ÉTAT ================= */

{ id:"n5-k8s-01", lvl:5, dom:"Kubernetes",
  q:"Comment fonctionne le réseau Kubernetes ? Quelles sont les règles imposées par le modèle CNI ?",
  accept:["chaque pod une ip","sans nat","tous les pods communiquent","plat","routable"],
  explain:"Le modèle impose : chaque Pod a sa propre IP, tous les Pods peuvent se joindre SANS NAT, et un Pod se voit avec la même IP que les autres le voient. Le plugin CNI (Calico, Cilium, Azure CNI, VPC CNI) implémente ce réseau plat, par overlay (VXLAN/IPIP) ou par routage natif dans le VPC/VNet." },

{ id:"n5-k8s-02", lvl:5, dom:"Kubernetes",
  q:"Qu'est-ce qu'une NetworkPolicy et quel est son comportement par défaut ?",
  accept:["tout ouvert par defaut","des qu une policy s applique","deny implicite","selecteur","whitelist"],
  explain:"Par défaut tout le trafic Pod-à-Pod est autorisé. Dès qu'une NetworkPolicy sélectionne un Pod pour une direction (ingress ou egress), tout ce qui n'est pas explicitement autorisé DANS CETTE DIRECTION devient interdit pour ce Pod. Bonne pratique : une policy default-deny par namespace, puis on ouvre. Nécessite un CNI qui les implémente." },

{ id:"n5-k8s-03", lvl:5, dom:"Kubernetes",
  q:"Explique la chaîne PV / PVC / StorageClass.",
  must:[["storageclass","classe"],["pvc","demande","claim"],["pv","volume"]],
  explain:"Le PVC est la DEMANDE du développeur (taille, mode d'accès, classe). La StorageClass décrit le type de stockage et son provisioner. Le provisioner crée dynamiquement le PV (le volume réel) et le lie au PVC. Points d'attention : <code>reclaimPolicy</code> (Delete vs Retain) et <code>accessModes</code> — un disque bloc est ReadWriteOnce, seul du NFS/Azure Files donne du ReadWriteMany." },

{ id:"n5-k8s-04", lvl:5, dom:"Kubernetes",
  q:"Comment fonctionne le HorizontalPodAutoscaler et quelle erreur classique le rend inopérant ?",
  accept:["metrics server","requests non definies","utilisation cpu","pourcentage des requests"],
  explain:"Le HPA compare une métrique (souvent CPU en % des <code>requests</code>) à une cible et ajuste le nombre de réplicas. Erreur classique : ne pas définir de <code>resources.requests</code> — sans référence, le calcul de pourcentage est impossible et le HPA reste inactif. Autre prérequis : le metrics-server (ou un adaptateur pour les métriques custom/externes)." },

{ id:"n5-k8s-05", lvl:5, dom:"Kubernetes",
  q:"Quelle différence entre HPA, VPA et Cluster Autoscaler ? Peuvent-ils cohabiter ?",
  must:[["replica","horizontal","nombre de pods"],["ressource","vertical","requests"],["noeud","node"]],
  explain:"HPA = plus de Pods. VPA = ajuste les requests/limits d'un Pod (et le redémarre). Cluster Autoscaler = ajoute/retire des NŒUDS quand des Pods sont Pending ou que des nœuds sont sous-utilisés. HPA + Cluster Autoscaler se complètent parfaitement ; HPA + VPA sur la MÊME métrique CPU se battent — on ne les combine que sur des métriques différentes." },

{ id:"n5-k8s-06", lvl:5, dom:"Kubernetes",
  q:"Que fait exactement <code>kubectl drain node1</code> et quelles précautions prends-tu avant ?",
  accept:["cordon","evince les pods","pdb","daemonset","ignore-daemonsets"],
  explain:"Il cordonne le nœud (plus de nouveaux Pods) puis évince les Pods existants en respectant les PodDisruptionBudgets. Précautions : vérifier qu'il y a de la capacité ailleurs, que les PDB sont définis, prévoir <code>--ignore-daemonsets</code>, et <code>--delete-emptydir-data</code> seulement si on accepte de perdre ces données. Sans PDB, l'éviction peut couper le service." },

{ id:"n5-tf-01", lvl:5, dom:"Terraform",
  q:"Qu'est-ce que la dérive (drift) et comment la détectes-tu de façon industrielle ?",
  accept:["modification hors terraform","plan detaille","refresh","plan en lecture seule","detect-drift"],
  explain:"C'est un écart entre le monde réel et le state, causé par une modification manuelle. On la détecte avec un <code>terraform plan -detailed-exitcode</code> (code 2 = changements) exécuté périodiquement en CI, ou avec le drift detection de HCP Terraform. La vraie solution est en amont : retirer les droits d'écriture manuels en prod." },

{ id:"n5-tf-02", lvl:5, dom:"Terraform",
  q:"Comment testes-tu du code Terraform ? Cite au moins trois niveaux.",
  must:[["validate","fmt","lint"],["plan","policy","tfsec","checkov","opa","sentinel"]],
  explain:"1) Statique : <code>fmt</code>, <code>validate</code>, <code>tflint</code>. 2) Sécurité/conformité : tfsec, Checkov, OPA/Conftest ou Sentinel sur le plan JSON. 3) Unitaire : <code>terraform test</code> (natif 1.6+) ou Terratest qui déploie réellement dans un compte bac à sable puis détruit. 4) Contrôle du plan en PR par un humain." },

{ id:"n5-tf-03", lvl:5, dom:"Terraform",
  q:"Comment récupérer une valeur produite par un autre state Terraform ? Cite deux méthodes et leur inconvénient.",
  accept:["remote state","data source","terraform_remote_state","couplage"],
  explain:"1) <code>terraform_remote_state</code> : simple, mais crée un couplage fort et exige un droit de LECTURE sur tout le state distant (donc sur ses secrets). 2) Publier la valeur dans une source de vérité (SSM Parameter Store, Key Vault, tag) et la lire avec une data source : découplé, droits fins, mais un contrat à maintenir. En banque, on préfère la 2." },

{ id:"n5-tf-04", lvl:5, dom:"Terraform",
  q:"Comment gères-tu plusieurs régions ou plusieurs comptes dans une même configuration Terraform ?",
  accept:["alias","provider alias","providers ="],
  explain:"Avec des providers aliasés : <code>provider \"aws\" { alias = \"eu\" region = \"eu-west-3\" }</code>, puis <code>provider = aws.eu</code> sur la ressource ou <code>providers = { aws = aws.eu }</code> sur le module. Attention : un module ne doit pas définir ses propres providers, il les reçoit — sinon on ne peut plus le supprimer proprement." },

{ id:"n5-tf-05", lvl:5, dom:"Terraform",
  q:"Ton state contient des secrets en clair. Quelles mesures prends-tu ?",
  must:[["backend","distant","chiffrement","kms"],["acces","rbac","droit","restreint"]],
  explain:"Backend distant chiffré (S3 + KMS, Storage Account chiffré), accès restreint aux seuls pipelines et à un groupe réduit, versioning et journalisation des accès, jamais dans Git ni en artefact de build. Et en amont : ne pas faire transiter le secret par Terraform — le générer dans le coffre et n'en référencer que l'URI." },

{ id:"n5-aws-01", lvl:5, dom:"AWS",
  q:"Un pod EKS doit lire un bucket S3. Décris la mise en place propre.",
  accept:["irsa","oidc","service account","annotation","assume role with web identity"],
  explain:"IRSA (ou EKS Pod Identity) : on associe un provider OIDC au cluster, on crée un rôle IAM dont la trust policy accepte le ServiceAccount précis (namespace + nom), on annote le ServiceAccount avec l'ARN du rôle. Le SDK récupère alors des credentials temporaires par <code>AssumeRoleWithWebIdentity</code>. Aucune clé statique, droits par application et non par nœud." },

{ id:"n5-aws-02", lvl:5, dom:"AWS",
  q:"Différence entre SQS et SNS, et à quoi sert le pattern fan-out ?",
  accept:["file","publication","pull","push","un a plusieurs"],
  explain:"SQS = file de messages consommée en PULL par un ou plusieurs workers, un message est traité une fois. SNS = pub/sub en PUSH vers plusieurs abonnés. Fan-out : SNS publie vers PLUSIEURS files SQS, chacune consommée par un service indépendant à son rythme — découplage et absorption des pics." },

{ id:"n5-aws-03", lvl:5, dom:"AWS",
  q:"Qu'est-ce qu'une dead-letter queue et pourquoi est-elle indispensable ?",
  accept:["messages en echec","apres n tentatives","isole","poison","empeche le blocage"],
  explain:"Une file où sont déplacés les messages ayant échoué après N tentatives (<code>maxReceiveCount</code>). Sans elle, un message « poison » est redélivré indéfiniment, bloque le traitement et sature les logs. Avec elle, on isole, on alerte sur la profondeur de la DLQ et on rejoue après correction." },

{ id:"n5-aws-04", lvl:5, dom:"AWS",
  q:"Qu'est-ce qu'un cold start Lambda et comment le réduire ?",
  accept:["initialisation","provisioned concurrency","taille du package","runtime","premiere invocation"],
  explain:"C'est le délai d'initialisation d'un nouvel environnement d'exécution (téléchargement du package, démarrage du runtime, code d'init). On le réduit : package léger, runtime rapide, dépendances hors du handler, plus de mémoire (donc plus de CPU), et Provisioned Concurrency pour garder des environnements chauds — au prix d'un coût fixe." },

{ id:"n5-aws-05", lvl:5, dom:"AWS",
  q:"Différence entre CloudTrail, CloudWatch et Config ?",
  must:[["api","audit","qui a fait quoi"],["metrique","log","monitoring"],["conformite","configuration","etat"]],
  explain:"CloudTrail = journal d'AUDIT des appels API (qui, quoi, quand, depuis où). CloudWatch = métriques, logs et alarmes (santé et performance). AWS Config = inventaire et historique de la CONFIGURATION des ressources, avec des règles de conformité et la possibilité de remédier. Question d'entretien fréquente en environnement régulé." },

{ id:"n5-az-01", lvl:5, dom:"Azure",
  q:"Différence entre Azure Storage Account : blob, file, queue, table — et les niveaux de redondance ?",
  must:[["lrs"],["zrs","grs"]],
  explain:"Blob (objet non structuré), File (SMB/NFS), Queue (messages simples), Table (NoSQL clé-valeur). Redondance : LRS (3 copies dans un datacenter), ZRS (3 zones de la région), GRS (LRS + réplication asynchrone dans la région appairée), GZRS (ZRS + géo), avec les variantes RA-* pour lire la copie secondaire." },

{ id:"n5-az-02", lvl:5, dom:"Azure",
  q:"Comment sécurises-tu l'accès à une Azure SQL Database depuis une VM dans un VNet ?",
  must:[["private endpoint","service endpoint"],["entra","managed identity","firewall","desactiver l acces public"]],
  explain:"Private Endpoint (IP privée + Private DNS Zone) et <code>publicNetworkAccess = Disabled</code>, authentification par Entra ID / Managed Identity plutôt que login SQL, TLS forcé, pare-feu SQL sans règle 0.0.0.0, audit et Defender for SQL activés, et chiffrement TDE (par défaut) avec éventuellement une clé gérée par le client." },

{ id:"n5-az-03", lvl:5, dom:"Azure",
  q:"Qu'est-ce qu'une UDR (route table) et dans quel cas est-elle obligatoire ?",
  accept:["route definie par l utilisateur","forcer le trafic","next hop","firewall","forced tunneling"],
  explain:"Une route personnalisée qui surcharge le routage système d'Azure. Cas typique : forcer tout le trafic sortant d'un spoke (<code>0.0.0.0/0</code>) vers l'IP privée de l'Azure Firewall du hub (next hop = Virtual Appliance) pour l'inspecter, ou le forced tunneling vers l'on-premise via ExpressRoute — exigence courante en banque." },

{ id:"n5-az-04", lvl:5, dom:"Azure",
  q:"À quoi sert Azure Monitor / Log Analytics et qu'est-ce que KQL ?",
  accept:["kusto","langage de requete","workspace","centralise les logs"],
  explain:"Log Analytics est le workspace qui centralise logs et métriques (diagnostic settings des ressources, agents, Container Insights). KQL (Kusto Query Language) est son langage de requête : <code>AzureDiagnostics | where TimeGenerated &gt; ago(1h) | summarize count() by ResourceId</code>. Il alimente aussi les alertes et les workbooks." },

{ id:"n5-res-01", lvl:5, dom:"Réseau",
  q:"Décris ce qui se passe quand tu tapes une URL et que la page s'affiche — version DevOps, en 8 étapes.",
  must:[["dns"],["tcp","connexion"],["tls","https"],["http","requete"]],
  explain:"1) Résolution DNS (cache navigateur/OS, resolver, récursion). 2) Ouverture TCP (3-way handshake) vers l'IP. 3) Handshake TLS et validation du certificat. 4) Requête HTTP envoyée au reverse proxy / load balancer. 5) Routage vers un backend sain (health checks). 6) L'application traite, interroge cache et base. 7) Réponse renvoyée, éventuellement compressée et mise en cache CDN. 8) Le navigateur rend la page et déclenche les appels secondaires." },

{ id:"n5-res-02", lvl:5, dom:"Réseau",
  q:"Différence entre un proxy et un reverse proxy ?",
  accept:["cote client","cote serveur","protege le client","expose le serveur","sortant"],
  explain:"Un proxy (forward) est côté CLIENT : il sort vers internet pour lui (filtrage, cache, anonymisation) — c'est le proxy d'entreprise obligatoire en banque. Un reverse proxy est côté SERVEUR : il reçoit le trafic entrant et le distribue aux backends (terminaison TLS, load balancing, WAF, cache) — nginx, ALB, Application Gateway, Ingress." },

{ id:"n5-res-03", lvl:5, dom:"Réseau",
  q:"Qu'est-ce que le NAT et pourquoi une IP source change-t-elle en sortie de VPC ?",
  accept:["translation d adresse","masque","source nat","ip publique partagee"],
  explain:"Le NAT réécrit les adresses dans l'en-tête IP. En sortie, la NAT Gateway fait du Source NAT : l'IP privée de l'instance est remplacée par l'IP publique du NAT, et une table de correspondance permet de router le retour. Conséquence pratique : côté partenaire, c'est l'IP du NAT qu'il faut whitelister, pas celle de l'instance." },

{ id:"n5-res-04", lvl:5, dom:"Réseau",
  q:"Deux VPC sont peerés mais A ne joint pas B. Quels points vérifies-tu, dans l'ordre ?",
  must:[["route","table de routage"],["security group","nacl","firewall"]],
  explain:"1) Le peering est-il bien accepté ? 2) Y a-t-il une route vers le CIDR distant dans les DEUX route tables ? 3) Les CIDR se chevauchent-ils (peering impossible) ? 4) SG/NACL autorisent-ils les deux sens ? 5) Le peering n'est pas transitif : A↔B et B↔C ne donne pas A↔C, il faut un Transit Gateway." },

{ id:"n5-sec-01", lvl:5, dom:"Sécurité",
  q:"Comment fonctionne un JWT et quelle est la principale erreur d'implémentation ?",
  accept:["signature","header payload signature","ne pas verifier","alg none","non chiffre"],
  explain:"Trois parties base64url : header, payload, signature. Le payload est SIGNÉ, pas chiffré — donc lisible par tous, jamais de secret dedans. Erreurs classiques : ne pas vérifier la signature, accepter <code>alg: none</code> ou laisser le token choisir l'algorithme, ne pas vérifier <code>exp</code>/<code>aud</code>/<code>iss</code>, et croire qu'on peut révoquer un JWT (il faut une liste de révocation ou des durées courtes)." },

{ id:"n5-sec-02", lvl:5, dom:"Sécurité",
  q:"Qu'est-ce que la rotation de secrets et pourquoi la rotation seule ne suffit pas ?",
  accept:["renouveler","periodiquement","detection","fuite","duree de vie courte"],
  explain:"C'est le renouvellement périodique ou à la demande d'un secret, idéalement automatisé (Secrets Manager, Key Vault avec versioning). Elle limite la fenêtre d'exploitation mais ne détecte pas la fuite : il faut aussi la détection de secrets dans le code, la journalisation des accès au coffre, l'alerte sur usage anormal — et surtout supprimer les secrets longue durée au profit de l'identité fédérée." },

{ id:"n5-sec-03", lvl:5, dom:"Sécurité",
  q:"Qu'est-ce qu'une supply chain attack sur une image de conteneur, et quelles parades ?",
  accept:["dependance compromise","image de base","signature","sbom","scan","cosign"],
  explain:"Compromission d'un maillon amont : image de base publique, paquet npm/pypi typosquatté, action de CI tierce non pinnée. Parades : registry privé miroir avec images de base approuvées, pin par digest, SBOM et scan continu (Trivy/Grype), signature et vérification (Cosign/Notary) avec une admission policy qui refuse les images non signées, builds reproductibles et attestations SLSA." },

{ id:"n5-obs-01", lvl:5, dom:"Observabilité",
  q:"Comment fonctionne Prometheus ? Modèle push ou pull, et comment gère-t-il les jobs éphémères ?",
  accept:["pull","scrape","pushgateway","service discovery","expose /metrics"],
  explain:"Prometheus SCRAPE (pull) des endpoints <code>/metrics</code> découverts par service discovery (K8s, EC2, Consul). Avantage : il sait qui ne répond plus (<code>up == 0</code>). Pour les jobs batch qui meurent avant le scrape, on passe par le Pushgateway — à utiliser avec parcimonie car il devient un point de vérité périmé." },

{ id:"n5-obs-02", lvl:5, dom:"Observabilité",
  q:"Qu'est-ce qu'un histogramme Prometheus et pourquoi ne peut-on pas moyenner des percentiles ?",
  accept:["buckets","histogram_quantile","non additifs","cumulatif"],
  explain:"Un histogramme compte les observations dans des buckets cumulatifs, ce qui permet de calculer un quantile agrégé côté serveur avec <code>histogram_quantile()</code>. On ne peut pas moyenner des p95 de plusieurs instances : les percentiles ne sont pas additifs, la moyenne de deux p95 n'a aucune signification statistique. Il faut agréger les buckets bruts." },

{ id:"n5-sql-01", lvl:5, dom:"SQL",
  q:"Explique les niveaux d'isolation et le phénomène que chacun empêche.",
  must:[["read committed","dirty read","lecture sale"],["repeatable read","serializable"]],
  explain:"Read Uncommitted (lectures sales possibles) → Read Committed (plus de lecture sale, mais lectures non répétables) → Repeatable Read (mêmes lignes stables, phantom reads possibles) → Serializable (comme si les transactions s'exécutaient l'une après l'autre). Plus on monte, plus on est sûr et plus on verrouille : c'est un arbitrage cohérence/concurrence." },

{ id:"n5-sql-02", lvl:5, dom:"SQL",
  q:"Une requête est lente. Comment tu diagnostiques, étape par étape ?",
  must:[["plan d execution","explain"],["index"]],
  explain:"1) <code>EXPLAIN ANALYZE</code> pour lire le plan réel : seq scan sur une grosse table, mauvais ordre de jointure, estimation de cardinalité fausse. 2) Vérifier les index sur les colonnes de filtre/jointure et leur sélectivité. 3) Chercher les fonctions sur colonne indexée qui cassent l'index (<code>WHERE UPPER(nom)=…</code>). 4) Statistiques à jour ? 5) Volume ramené vs nécessaire (SELECT *, absence de pagination). 6) Contention/verrous côté serveur." },

{ id:"n5-sre-01", lvl:5, dom:"SRE",
  q:"Qu'est-ce qu'un circuit breaker et pourquoi est-il vital dans une architecture microservices ?",
  accept:["coupe les appels","echec rapide","evite la cascade","half open","protege"],
  explain:"Après N échecs, il OUVRE le circuit et fait échouer immédiatement les appels vers le service défaillant, sans attendre le timeout, puis teste périodiquement (half-open) avant de refermer. Sans lui, les threads s'accumulent en attente et la panne d'un service en profondeur remonte en cascade jusqu'au front — c'est le mode de défaillance numéro un des microservices." },

{ id:"n5-cicd-01", lvl:5, dom:"CI/CD",
  q:"Qu'est-ce qu'un build reproductible et pourquoi ça intéresse une banque ?",
  accept:["meme sortie","meme entrees","deterministe","auditable","tracabilite"],
  explain:"Mêmes sources + mêmes dépendances épinglées = artefact bit à bit identique. Intérêt en banque : traçabilité et auditabilité (on peut prouver que le binaire en prod correspond au code revu), détection d'altération de la chaîne de build, et conformité DORA/réglementaire sur l'intégrité des livrables." }

]);
