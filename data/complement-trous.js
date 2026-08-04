/* Comble les 4 dernières cases vides : Azure niveau 10, Réseau niveau 9,
   Données & flux niveau 10. Réponses libres. */
window.QBANK = (window.QBANK || []).concat([

/* ---------- AZURE — niveau 10 (posture & arbitrages) ---------- */
{ id:"ct-az-10-01", lvl:10, dom:"Azure",
  q:"« Pourquoi Azure plutôt qu'AWS chez nous ? » Comment réponds-tu sans te tromper de registre ?",
  accept:["existant","competences","contrat","integration","pas de superiorite technique"],
  explain:"Le choix d'un cloud en grande entreprise n'est presque jamais technique : il tient à l'existant Microsoft (annuaire, licences, accords entreprise), aux compétences déjà présentes, aux engagements contractuels et à la conformité négociée. Répondre « Azure est meilleur » est un piège : les deux couvrent 95 % des besoins. Ce qu'ils testent, c'est que tu saches que la décision leur appartient et qu'elle est structurante." },

{ id:"ct-az-10-02", lvl:10, dom:"Azure",
  q:"On te demande d'ouvrir un Storage Account en accès public « juste pour dépanner une intégration ». Que fais-tu ?",
  accept:["refuser cette voie","private endpoint","sas","alternative","tracer"],
  explain:"On ne refuse pas le besoin, on refuse LA VOIE. Alternatives immédiates : SAS à portée et durée limitées, Private Endpoint, ou règle de pare-feu sur l'IP du partenaire. Si l'ouverture publique est réellement imposée par le métier, elle passe par une exemption de policy datée, nommée et approuvée — jamais par une désactivation silencieuse du contrôle." },

{ id:"ct-az-10-03", lvl:10, dom:"Azure",
  q:"Un architecte affirme : « les Managed Identities, c'est bien, mais ça ne marche pas partout, donc on garde nos Service Principals. » Que réponds-tu ?",
  accept:["partiellement vrai","hors azure","cas par cas","reduire","federation"],
  explain:"Il a partiellement raison : hors d'Azure (pipeline externe, machine on-premise), la Managed Identity n'existe pas. Mais la conclusion est trop large. On distingue : dans Azure, Managed Identity systématiquement ; hors d'Azure, fédération d'identité OIDC quand le fournisseur le permet ; Service Principal avec secret en dernier recours, avec rotation automatisée et durée courte. On réduit le périmètre au lieu de l'accepter en bloc." },

{ id:"ct-az-10-04", lvl:10, dom:"Azure",
  q:"« Notre facture Azure a doublé, l'équipe cloud est incompétente. » Comment tu gères cette remarque en réunion ?",
  accept:["ne pas se defendre","chiffrer","visibilite","attribuer","proposer"],
  explain:"On ne se défend pas et on ne cherche pas de coupable : on propose une ventilation. « Donnons-nous une semaine pour attribuer les coûts par équipe et par usage, on saura si c'est de la croissance, du gaspillage ou un changement de tarif. » Puis on revient avec des chiffres et trois leviers chiffrés. Transformer une attaque en démarche mesurable est exactement ce qui est évalué." },

{ id:"ct-az-10-05", lvl:10, dom:"Azure",
  q:"On te confie une landing zone Azure existante, mal construite. Par quoi commences-tu ?",
  accept:["ne rien casser","inventaire","risque immediat","progressif","comprendre"],
  explain:"Surtout pas par une refonte. Inventaire (Resource Graph), cartographie des flux critiques, puis identification des risques immédiats : accès admin permanents, absence de sauvegarde testée, ressources exposées publiquement, journalisation manquante. On traite ces risques d'abord, on gèle les mauvaises pratiques pour le NOUVEAU, et on migre l'existant par vagues. Refaire une landing zone en big bang casse la production." },

{ id:"ct-az-10-06", lvl:10, dom:"Azure",
  q:"« Combien coûte cette architecture Azure ? » Tu n'as pas les tarifs en tête. Comment procèdes-tu à l'oral ?",
  accept:["postes dominants","ordre de grandeur","hypothese","fourchette","calculateur"],
  explain:"On raisonne à voix haute sur les postes dominants — calcul, base de données, transfert sortant, licences — avec une hypothèse de volumétrie assumée et une fourchette, puis on dit ce qui la ferait basculer (le tier de la base, l'egress, le nombre d'environnements). On propose d'affiner avec le calculateur Azure. Ce qui est testé, c'est la conscience que chaque choix a un prix, pas la mémorisation d'un tarif." },

{ id:"ct-az-10-07", lvl:10, dom:"Azure",
  q:"Comment expliques-tu à un métier la différence entre une panne de zone et une panne de région Azure ?",
  accept:["analogie","batiment","ville","automatique","decision"],
  explain:"« Une zone, c'est un bâtiment du même campus : s'il brûle, on bascule automatiquement sur le bâtiment voisin, vous ne voyez rien. Une région, c'est le campus entier : là il faut redémarrer ailleurs, et ça se décide — ça prend du temps et on perd potentiellement les dernières minutes de données. » L'important est de faire comprendre que la seconde a un coût et un délai qu'il faut avoir choisis à l'avance." },

/* ---------- RÉSEAU — niveau 9 (résilience, coûts, gouvernance) ---------- */
{ id:"ct-res-9-01", lvl:9, dom:"Réseau",
  q:"Comment conçois-tu la redondance d'une interconnexion entre ton datacenter et le cloud ?",
  must:[["deux circuits","redondant","double","secours"],["operateur","point de presence","chemin different"]],
  explain:"Deux circuits sur des points de présence DIFFÉRENTS, idéalement chez deux opérateurs, plus un VPN IPsec en secours automatique par BGP. Le piège classique : deux liens qui passent physiquement dans la même gaine ou par le même POP — la redondance est contractuelle mais pas physique. On demande le tracé réel, et on teste la bascule au moins une fois par an." },

{ id:"ct-res-9-02", lvl:9, dom:"Réseau",
  q:"Pourquoi le plan d'adressage IP est-il un sujet de gouvernance et pas un détail technique ?",
  accept:["chevauchement","fusion","irreversible","ne se reduit pas","ipam"],
  explain:"Un CIDR de VPC ou de VNet ne se réduit pas, et deux plages qui se chevauchent rendent impossible tout peering, VPN ou rachat d'entreprise. Une décision prise en 5 minutes bloque l'architecture pendant dix ans. D'où un IPAM central, une allocation documentée par cloud, région et environnement, et des réserves larges — y compris pour les Pods, services et endpoints privés." },

{ id:"ct-res-9-03", lvl:9, dom:"Réseau",
  q:"Comment maîtrises-tu les coûts de transfert de données dans une architecture cloud ?",
  must:[["inter-az","sortant","egress","transfert"],["endpoint","cdn","proximite","cache"]],
  explain:"Les coûts cachés sont le trafic inter-AZ (facturé dans les deux sens), l'egress internet, la NAT Gateway facturée au Go, et la réplication cross-région. Leviers : routage conscient de la zone, VPC endpoints gratuits pour S3/DynamoDB, registry miroir interne, CDN devant les gros volumes sortants, compression. Prérequis : une ventilation des coûts qui isole le transfert, sinon on optimise à l'aveugle." },

{ id:"ct-res-9-04", lvl:9, dom:"Réseau",
  q:"Quelle stratégie de gestion des certificats TLS à l'échelle d'une banque ?",
  must:[["automatique","renouvellement","acme","rotation"],["inventaire","surveillance","expiration","alerte"]],
  explain:"Émission et renouvellement AUTOMATIQUES (ACME, Key Vault, ACM, ou la PKI interne avec cert-manager), inventaire centralisé de tous les certificats avec leur date d'expiration, alerte à J-30 et escalade à J-7, et durées de vie courtes qui forcent l'automatisation. Un certificat renouvelé à la main une fois par an est une panne programmée : c'est l'une des causes d'incident les plus fréquentes et les plus évitables." },

{ id:"ct-res-9-05", lvl:9, dom:"Réseau",
  q:"Comment le DNS peut-il devenir le point de défaillance unique d'un plan de reprise ?",
  accept:["ttl trop long","bascule","depend de la region tombee","propagation","resolveur"],
  explain:"Trois façons : un TTL trop long qui fige les clients sur l'ancienne IP pendant des heures, une automatisation de bascule hébergée dans la région tombée, ou des serveurs DNS internes eux-mêmes indisponibles. On abaisse le TTL AVANT la bascule, on héberge le pilotage DNS hors du périmètre à risque, et on teste la bascule pour mesurer le délai réel de propagation." },

{ id:"ct-res-9-06", lvl:9, dom:"Réseau",
  q:"Comment démontres-tu à un auditeur que les flux réseau sont maîtrisés ?",
  must:[["matrice","documentation","flux autorises"],["journal","flow logs","preuve","controle"]],
  explain:"Une matrice de flux documentée et à jour (source, destination, port, justification, propriétaire), des règles déployées en IaC donc revues et versionnées, des flow logs conservés qui prouvent ce qui circule RÉELLEMENT, et une réconciliation périodique entre le déclaré et l'observé. Le point qui convainc : montrer un flux détecté puis supprimé parce qu'il n'était pas dans la matrice." },

{ id:"ct-res-9-07", lvl:9, dom:"Réseau",
  q:"Quelle est la stratégie de défense face à un DDoS sur un service bancaire exposé ?",
  must:[["service dedie","protection","absorber","amont"],["cdn","anycast","rate limit","waf"]],
  explain:"Absorption en amont par un service dédié (Shield, Azure DDoS Standard) et une distribution anycast/CDN qui dilue la charge mondialement, WAF avec limitation de débit pour les attaques applicatives, et une architecture qui ne dépend pas d'une IP unique. Point clé à énoncer : on ne se défend PAS d'un DDoS volumétrique par de l'autoscaling — on paierait la facture de l'attaquant. Et on prépare le contact opérateur avant l'incident." },

/* ---------- DONNÉES & FLUX — niveau 10 (posture & arbitrages) ---------- */
{ id:"ct-don-10-01", lvl:10, dom:"SQL",
  q:"« Il nous faut du NoSQL, c'est plus moderne. » Comment recadres-tu sans braquer ?",
  accept:["modele d acces","quelles requetes","volumetrie","pas la modernite","question"],
  explain:"On ne discute pas de modernité, on demande le modèle d'accès : quelles requêtes, connues à l'avance ou ad hoc ? quelle volumétrie et quelle croissance ? besoin de transactions multi-entités ? besoin d'analytique ? Selon les réponses, le relationnel reste souvent le bon choix — surtout en banque où la cohérence et l'auditabilité priment. Poser les questions laisse l'équipe arriver elle-même à la conclusion." },

{ id:"ct-don-10-02", lvl:10, dom:"SQL",
  q:"On te demande de restaurer la production « comme il y a deux heures ». Quelles questions poses-tu AVANT d'agir ?",
  must:[["perimetre","tout ou une partie","quelles donnees"],["ecrites depuis","perte","impact","decision"]],
  explain:"1) Périmètre : toute la base ou quelques tables ? 2) Que perd-on des deux dernières heures, et qui décide d'assumer cette perte ? 3) Y a-t-il des flux sortants déjà partis (paiements, notifications) qui deviendraient incohérents ? 4) Qui valide l'arrêt de service ? Une restauration est une décision MÉTIER : l'exécuter sans ces réponses transforme un incident en désastre." },

{ id:"ct-don-10-03", lvl:10, dom:"Messagerie",
  q:"« On a perdu des messages en production. » Comment conduis-tu l'analyse ?",
  must:[["vraiment perdus","dlq","acquittement","preuve"],["idempotence","rejeu","ou","chaine"]],
  explain:"D'abord établir s'ils sont vraiment perdus ou seulement non traités : profondeur de la DLQ, offsets consommés, journaux du producteur. On situe le point de rupture — production non acquittée, rétention expirée, consommateur qui commite avant traitement, ou message rejeté silencieusement. Puis on répare ET on rejoue depuis le journal si la rétention le permet. C'est là que la valeur d'un broker à rétention se démontre." },

{ id:"ct-don-10-04", lvl:10, dom:"Messagerie",
  q:"Un architecte propose de l'exactly-once de bout en bout entre 4 systèmes hétérogènes. Que dis-tu ?",
  accept:["mythe","idempotence","effet observable","at least once","pas realiste"],
  explain:"Que c'est un objectif qu'on n'atteint pas entre systèmes hétérogènes : le exactly-once de Kafka vaut de Kafka à Kafka, pas à travers une base, une API partenaire et un mainframe. Ce qu'on vise, c'est un EFFET OBSERVABLE exactement une fois, obtenu par l'idempotence : clé d'idempotence portée par le message, résultat mémorisé, rejeu sans effet. C'est plus simple, plus robuste, et ça résiste aux pannes partielles." },

{ id:"ct-don-10-05", lvl:10, dom:"SQL",
  q:"Comment expliques-tu à un directeur pourquoi la restauration prendra 6 heures ?",
  accept:["volume","sans jargon","chiffrer","alternative","attendu"],
  explain:"Sans jargon et avec des ordres de grandeur : « la base fait 4 To, on la relit et on rejoue les journaux ; à cette taille ça prend 6 heures, c'est le RTO qu'on a validé ensemble l'an dernier. Si ce délai n'est plus acceptable, il existe des options — réplique chaude, bascule automatique — qui coûtent X de plus par an. » On relie le délai à un choix déjà fait, et on propose la décision plutôt que de subir le reproche." },

{ id:"ct-don-10-06", lvl:10, dom:"SQL",
  q:"« Vous avez déjà géré une corruption de données ? » Que doit contenir ta réponse ?",
  must:[["detection","comment on s en est apercu"],["perimetre","reconciliation","correction","apres"]],
  explain:"Comment ça a été DÉTECTÉ (alerte, réconciliation, ou pire : un client), comment tu as délimité le périmètre touché — souvent le plus dur —, la décision prise entre correction ciblée et restauration, la réconciliation pour prouver le retour à la cohérence, et le contrôle automatique ajouté après pour que la prochaine soit détectée en minutes. La partie détection intéresse plus que la réparation." }

]);
