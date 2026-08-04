/* Comble les cases QCM vides : Azure niveau 10, Données & flux niveau 10.
   Propositions calibrées à longueur comparable. */
window.QCM = (window.QCM || []).concat([

/* ---------- AZURE — niveau 10 ---------- */
{ id:"cqt-az-10-01", lvl:10, dom:"Azure",
  q:"« Pourquoi Azure plutôt qu'AWS chez nous ? » Quelle réponse est la bonne ?",
  choix:["L'existant Microsoft, les compétences et les contrats","Azure est techniquement supérieur sur le PaaS","AWS est plus cher à volumétrie équivalente","Azure offre une meilleure conformité bancaire"],
  bonne:0,
  explain:"Le choix d'un cloud en grande entreprise n'est presque jamais technique : annuaire et licences existants, accords entreprise, compétences en place, conformité déjà négociée. Affirmer une supériorité technique est un piège — les deux couvrent 95 % des besoins." },

{ id:"cqt-az-10-02", lvl:10, dom:"Azure",
  q:"On te demande d'ouvrir un Storage Account en public « pour dépanner ». Que fais-tu ?",
  choix:["Tu proposes un SAS ou un Private Endpoint","Tu ouvres et tu refermes après le dépannage","Tu refuses en citant la politique de sécurité","Tu désactives la policy le temps du test"],
  bonne:0,
  explain:"On ne refuse pas le besoin, on refuse LA VOIE : SAS à portée et durée limitées, Private Endpoint, ou règle de pare-feu sur l'IP du partenaire. Si l'ouverture est vraiment imposée, elle passe par une exemption datée et approuvée." },

{ id:"cqt-az-10-03", lvl:10, dom:"Azure",
  q:"« Les Managed Identities ne marchent pas partout, donc on garde nos Service Principals. »",
  choix:["Vrai hors d'Azure, mais la conclusion est trop large","Faux : la Managed Identity fonctionne partout","Vrai : les Service Principals sont plus souples","Faux : les Service Principals sont dépréciés"],
  bonne:0,
  explain:"On distingue les cas : dans Azure, Managed Identity systématiquement ; hors d'Azure, fédération OIDC quand c'est possible ; Service Principal avec secret en dernier recours, à rotation automatisée. On réduit le périmètre au lieu de l'accepter en bloc." },

{ id:"cqt-az-10-04", lvl:10, dom:"Azure",
  q:"« Notre facture Azure a doublé, l'équipe cloud est incompétente. » Ta réaction ?",
  choix:["Tu proposes une ventilation des coûts sous une semaine","Tu expliques que les tarifs Azure ont augmenté","Tu défends le travail de l'équipe point par point","Tu demandes qui a créé les ressources concernées"],
  bonne:0,
  explain:"On ne se défend pas et on ne cherche pas de coupable : on transforme l'attaque en démarche mesurable. Puis on revient avec la répartition par équipe et par usage, et trois leviers chiffrés." },

{ id:"cqt-az-10-05", lvl:10, dom:"Azure",
  q:"Tu récupères une landing zone Azure mal construite. Par quoi commences-tu ?",
  choix:["L'inventaire et les risques immédiats","La refonte de la hiérarchie de management groups","La migration vers un nouveau tenant","La rédaction d'une cible d'architecture"],
  bonne:0,
  explain:"On traite d'abord accès admin permanents, sauvegardes non testées, ressources exposées, journalisation manquante. Puis on gèle les mauvaises pratiques pour le NOUVEAU et on migre l'existant par vagues. Un big bang casse la production." },

{ id:"cqt-az-10-06", lvl:10, dom:"Azure",
  q:"On te demande le coût d'une architecture, sans que tu aies les tarifs. Que fais-tu ?",
  choix:["Tu raisonnes en ordre de grandeur, à voix haute","Tu réponds que tu ne peux pas sans les données","Tu donnes un chiffre approximatif de mémoire","Tu proposes d'envoyer l'estimation plus tard"],
  bonne:0,
  explain:"Postes dominants, hypothèse de volumétrie assumée, fourchette, et ce qui la ferait basculer. Ce qui est testé, c'est la conscience que chaque choix technique a un prix, pas la mémorisation d'un tarif." },

{ id:"cqt-az-10-07", lvl:10, dom:"Azure",
  q:"Comment expliquer panne de zone et panne de région à un métier ?",
  choix:["Par une analogie de bâtiment et de campus","En détaillant les SLA de chaque service","En montrant le schéma d'architecture","En citant les incidents Azure passés"],
  bonne:0,
  explain:"Le bâtiment voisin prend le relais tout seul ; le campus entier impose de redémarrer ailleurs, ce qui se décide, prend du temps et fait perdre des données. L'objectif est de faire comprendre que la seconde a un coût qu'il faut avoir choisi à l'avance." },

{ id:"cqt-az-10-08", lvl:10, dom:"Azure",
  q:"Un audit demande la preuve que les données restent en France. Que montres-tu ?",
  choix:["Une policy Deny au niveau management group","La liste des régions utilisées aujourd'hui","Les conditions contractuelles signées avec Microsoft","La configuration réseau des VNets"],
  bonne:0,
  explain:"Une initiative « Allowed locations » assignée au management group racine couvre les abonnements présents ET futurs, avec son tableau de conformité et ses exemptions datées. Un inventaire ponctuel ne prouve rien sur demain — et attention aux réplications géo et aux logs." },

/* ---------- DONNÉES & FLUX — niveau 10 ---------- */
{ id:"cqt-don-10-01", lvl:10, dom:"SQL",
  q:"« Il nous faut du NoSQL, c'est plus moderne. » Comment recadres-tu ?",
  choix:["Tu demandes quel est le modèle d'accès","Tu expliques que le relationnel suffit","Tu proposes un comparatif des deux familles","Tu acceptes pour ne pas bloquer l'équipe"],
  bonne:0,
  explain:"Quelles requêtes, connues à l'avance ou ad hoc ? quelle volumétrie ? besoin de transactions ou d'analytique ? Poser les questions laisse l'équipe arriver elle-même à la conclusion — souvent le relationnel, surtout en banque." },

{ id:"cqt-don-10-02", lvl:10, dom:"SQL",
  q:"« Restaurez la production comme il y a deux heures. » Quelle est ta priorité ?",
  choix:["Faire acter qui assume la perte de données","Lancer la restauration immédiatement","Vérifier l'intégrité de la sauvegarde","Prévenir les équipes applicatives"],
  bonne:0,
  explain:"Une restauration est une décision MÉTIER : que perd-on, qui le valide, et les flux déjà partis (paiements, notifications) deviennent-ils incohérents ? Exécuter sans ces réponses transforme un incident en désastre." },

{ id:"cqt-don-10-03", lvl:10, dom:"Messagerie",
  q:"« On a perdu des messages. » Par quoi commences-tu l'analyse ?",
  choix:["Établir s'ils sont perdus ou seulement non traités","Augmenter la rétention du broker","Rejouer les messages depuis le producteur","Ajouter des réplicas aux consommateurs"],
  bonne:0,
  explain:"Profondeur de la DLQ, offsets consommés, journaux du producteur. On situe le point de rupture — production non acquittée, rétention expirée, commit avant traitement — puis on répare ET on rejoue si la rétention le permet." },

{ id:"cqt-don-10-04", lvl:10, dom:"Messagerie",
  q:"On propose de l'exactly-once entre 4 systèmes hétérogènes. Que réponds-tu ?",
  choix:["Que l'idempotence est la vraie réponse","Que c'est faisable avec les transactions Kafka","Que ça impose un commit à deux phases","Que seul un ESB peut le garantir"],
  bonne:0,
  explain:"L'exactly-once de Kafka vaut de Kafka à Kafka, pas à travers une base, une API partenaire et un mainframe. Ce qu'on vise, c'est un EFFET observable exactement une fois : clé d'idempotence, résultat mémorisé, rejeu sans effet." },

{ id:"cqt-don-10-05", lvl:10, dom:"SQL",
  q:"Comment annoncer à un directeur que la restauration prendra 6 heures ?",
  choix:["En reliant le délai au RTO validé ensemble","En expliquant la taille de la base","En s'excusant du délai technique","En promettant d'accélérer la procédure"],
  bonne:0,
  explain:"On rattache le délai à un choix déjà acté, et on propose la décision : « si ce n'est plus acceptable, une réplique chaude coûte X de plus par an ». On transforme un reproche en arbitrage." },

{ id:"cqt-don-10-06", lvl:10, dom:"SQL",
  q:"« Avez-vous déjà géré une corruption de données ? » Qu'écoutent-ils surtout ?",
  choix:["Comment tu l'as détectée","La rapidité de la réparation","Le volume de données touché","La technologie de base utilisée"],
  bonne:0,
  explain:"Détecter une corruption est bien plus difficile que la réparer : par une alerte, une réconciliation, ou pire par un client. Puis délimiter le périmètre, décider entre correction ciblée et restauration, et ajouter le contrôle automatique manquant." },

{ id:"cqt-don-10-07", lvl:10, dom:"Messagerie",
  q:"Le métier veut « zéro perte de message, quoi qu'il arrive ». Que réponds-tu ?",
  choix:["Tu chiffres ce que coûte chaque niveau de garantie","Tu confirmes que c'est techniquement atteignable","Tu expliques que la perte est inévitable","Tu proposes de doubler le nombre de brokers"],
  bonne:0,
  explain:"Réplication synchrone, acquittement de tous les réplicas, persistance avant réponse : chaque cran coûte en latence, en débit et en euros. On présente les paliers avec leur prix et on laisse le métier choisir — c'est sa décision, pas la nôtre." }

]);
