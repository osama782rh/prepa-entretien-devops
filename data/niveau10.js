window.QBANK = (window.QBANK || []).concat([
/* ========== NIVEAU 10 — ENTRETIEN SENIOR : ARBITRAGES & CONTRADICTION ========== */

{ id:"n10-01", lvl:10, dom:"SRE",
  q:"« Votre solution est trop complexe pour notre équipe. » Comment tu réagis en entretien quand un chef attaque ta proposition ?",
  accept:["je demande le contexte","je reformule","alternative","assume","arbitrage"],
  explain:"On ne défend pas son ego : on reformule la contrainte (« la complexité vous inquiète sur l'exploitabilité ou sur la montée en compétence ? »), on reconnaît ce qui est vrai, et on propose une version dégradée assumée avec ce qu'on perd. Un senior cherche à voir si tu SAIS ARBITRER, pas si tu as raison. La pire réponse est de camper ou de céder immédiatement sans argument." },

{ id:"n10-02", lvl:10, dom:"SRE",
  q:"On te demande « quelle est la première chose que tu fais en arrivant sur une plateforme que tu ne connais pas ? »",
  accept:["comprendre","cartographier","ecouter","observer","ne rien changer"],
  explain:"Écouter et cartographier avant de toucher : quels services, quels flux critiques, quels incidents récents, où est la douleur des équipes, qu'est-ce qui réveille les gens la nuit. Puis identifier les risques immédiats (sauvegardes non testées, secrets en clair, absence de rollback) et poser des quick wins mesurables. Arriver en imposant sa stack est le signal d'alarme numéro un pour un chef d'équipe." },

{ id:"n10-03", lvl:10, dom:"Kubernetes",
  q:"« On veut Kubernetes. » Quelles questions poses-tu avant de dire oui ?",
  must:[["besoin","pourquoi","probleme"],["equipe","competence","qui exploite"]],
  explain:"Quel problème cherche-t-on à résoudre (scaling, densité, portabilité, standardisation) ? Combien de services, quel volume ? Qui exploite le cluster à 3 h du matin et avec quelle compétence ? Quelles contraintes réglementaires ? Quelle alternative plus simple a été écartée (App Service, ECS, Container Apps) et pourquoi ? Kubernetes est un coût opérationnel permanent qu'il faut justifier — dire ça posément marque des points." },

{ id:"n10-04", lvl:10, dom:"Terraform",
  q:"Un architecte te dit : « le state Terraform, c'est un point de défaillance unique, on ne veut pas de ça en prod ». Que réponds-tu ?",
  accept:["backend redonde","versioning","sauvegarde","reconstruction par import","risque gere"],
  explain:"C'est un risque RÉEL mais géré : backend managé et répliqué (S3 avec versioning + réplication, Storage Account GRS), verrouillage, chiffrement, accès restreint, sauvegardes et restauration testées, et en dernier recours reconstruction par import. Le vrai point de défaillance unique, c'est l'infrastructure non décrite que personne ne sait recréer. On ne nie pas l'objection : on montre les contrôles." },

{ id:"n10-05", lvl:10, dom:"CI/CD",
  q:"« Chez nous on met en prod une fois par trimestre, et ça marche très bien. » Comment argumentes-tu sans braquer ?",
  accept:["taille du lot","risque","dora","rollback","progressif"],
  explain:"On ne dit pas « c'est archaïque ». On pointe le coût caché : un lot trimestriel contient des centaines de changements, donc en cas d'incident on ne sait pas lequel accuse, le rollback annule tout, et la charge de test est massive. Les données DORA montrent que la fréquence RÉDUIT le taux d'échec. Puis on propose un chemin progressif : découpler déploiement et activation (feature flags), automatiser les tests, viser mensuel avant hebdomadaire." },

{ id:"n10-06", lvl:10, dom:"Sécurité",
  q:"Le RSSI refuse tout accès sortant internet depuis les nœuds Kubernetes. Comment fais-tu tourner la plateforme ?",
  must:[["registry interne","miroir","proxy"],["private endpoint","endpoint prive","liaison privee"]],
  explain:"Registry privé miroir pour les images (et un miroir des dépôts de paquets/modules), proxy sortant autorisé par liste blanche de FQDN pour ce qui doit vraiment sortir, endpoints privés vers les services managés (registry, coffre, stockage, API du plan de contrôle), et CA d'entreprise injectée dans les images pour l'inspection TLS. C'est standard en banque : la question teste si tu as déjà travaillé en environnement contraint." },

{ id:"n10-07", lvl:10, dom:"Sécurité",
  q:"Un développeur a besoin d'un accès prod « juste pour 10 minutes » pour débloquer un incident client. Que fais-tu ?",
  accept:["acces temporaire","jit","approbation","enregistre","tracé"],
  explain:"On ne refuse pas et on ne donne pas un accès permanent : élévation juste-à-temps avec approbation, périmètre minimal, expiration automatique, session enregistrée, et un ticket rattaché à l'incident. Puis, en post-mortem : pourquoi l'observabilité n'a pas suffi à diagnostiquer sans accès ? L'accès prod récurrent est un symptôme d'outillage insuffisant, pas un besoin légitime durable." },

{ id:"n10-08", lvl:10, dom:"SRE",
  q:"Raconte un incident que tu as géré : quelle structure de réponse en entretien ?",
  must:[["contexte","situation"],["action","ce que j ai fait"],["resultat","apprentissage","ce que j ai change"]],
  explain:"Structure STAR resserrée : contexte et impact chiffré → ce que j'ai fait ET comment j'ai décidé (hypothèses testées, pourquoi j'ai mitigé avant de comprendre) → résultat mesuré → ce que j'ai changé DURABLEMENT ensuite. Les seniors écoutent surtout la dernière partie : un candidat qui ne tire pas d'action systémique d'un incident rejouera le même incident chez eux." },

{ id:"n10-09", lvl:10, dom:"SRE",
  q:"« Quelle est la dernière fois où tu t'es trompé techniquement ? » Pourquoi cette question, et comment y répondre ?",
  accept:["honnetete","apprentissage","je reconnais","ce que j ai change"],
  explain:"Elle teste la lucidité et la sécurité psychologique : quelqu'un qui n'a jamais tort ne rapportera pas ses erreurs en production. Réponse efficace : une vraie erreur technique avec impact réel, comment tu l'as détectée et assumée, et le garde-fou que tu as mis en place après. À éviter absolument : la fausse humilité (« je suis trop perfectionniste ») et l'erreur d'un collègue déguisée." },

{ id:"n10-10", lvl:10, dom:"AWS",
  q:"Conçois en 5 minutes une plateforme de paiement à 10 000 transactions/seconde. Par où commences-tu ?",
  must:[["exigence","question","clarifier"],["idempotence","coherence","transaction"]],
  explain:"D'abord CLARIFIER : pic ou soutenu ? latence acceptable ? cohérence forte obligatoire (oui pour du paiement) ? contraintes réglementaires et de traçabilité ? Ensuite : découpler par file avec idempotence stricte (clé d'idempotence pour ne jamais débiter deux fois), écriture durable avant acquittement, base transactionnelle partitionnée, event sourcing/journal immuable pour l'audit, back-pressure et dégradation contrôlée. Commencer à dessiner sans poser de questions est éliminatoire." },

{ id:"n10-11", lvl:10, dom:"SRE",
  q:"Idempotence : pourquoi est-ce LE concept central d'un système financier distribué ?",
  accept:["rejouer sans effet","une seule fois","cle d idempotence","doublon","retry"],
  explain:"Dans un système distribué, on ne sait jamais si un appel a échoué ou si c'est la réponse qui s'est perdue — donc on retente. Sans idempotence, un retry débite deux fois. On l'implémente avec une clé d'idempotence fournie par le client, stockée avec le résultat : un second appel avec la même clé renvoie le résultat initial sans réexécuter. C'est le fondement des sémantiques « exactly-once » observables." },

{ id:"n10-12", lvl:10, dom:"Kubernetes",
  q:"Trois chefs te contredisent en même temps sur un choix technique. Que fais-tu ?",
  accept:["ecouter","clarifier le critere","donnees","test","decision reversible"],
  explain:"On ramène le débat sur les CRITÈRES plutôt que sur les opinions : « on optimise pour quoi — le time-to-market, le coût d'exploitation, ou la conformité ? ». Puis on propose de trancher par la donnée (un POC borné, un test de charge) et on distingue décision réversible (on essaie vite) de décision irréversible (on prend le temps). Rester calme et structurer le désaccord est exactement ce qui est évalué." },

{ id:"n10-13", lvl:10, dom:"Terraform",
  q:"« Pourquoi l'IaC plutôt que des scripts ou la console ? » Réponds comme à un directeur, pas à un dev.",
  accept:["auditable","reproductible","revue","tracabilite","reduction du risque"],
  explain:"Langage direction : réduction du risque opérationnel (tout changement est revu, tracé et rejouable), reprise après sinistre (on reconstruit une région en heures au lieu de semaines), conformité et preuve d'audit intégrées, réduction de la dépendance aux personnes, et vitesse de livraison. Le coût — formation et discipline — est réel et doit être annoncé. Parler de HCL et de state à un directeur est une erreur de registre." },

{ id:"n10-14", lvl:10, dom:"Observabilité",
  q:"Comment convaincs-tu d'investir dans l'observabilité alors qu'« il n'y a pas d'incident en ce moment » ?",
  accept:["mttr","cout d un incident","temps de diagnostic","chiffrer","assurance"],
  explain:"On chiffre : temps moyen passé à diagnostiquer par incident × coût horaire de l'équipe × nombre d'incidents, plus le coût métier d'une minute d'indisponibilité. On montre les incidents où on a « redémarré sans comprendre ». On propose un pilote mesurable sur un service critique avec un objectif de MTTR. L'argument gagnant n'est jamais technique : c'est le temps de diagnostic transformé en euros." },

{ id:"n10-15", lvl:10, dom:"Sécurité",
  q:"On te demande de mettre en prod quelque chose que tu juges dangereux. Comment tu gères ?",
  accept:["expliquer le risque","ecrit","alternative","decision assumee","escalade"],
  explain:"1) Expliquer le risque concrètement (scénario, impact, probabilité), pas en termes moraux. 2) Proposer une alternative ou une mitigation qui permet d'avancer. 3) Si la décision est maintenue, la faire acter par écrit par la personne qui l'assume, avec un plan de remédiation daté. 4) Escalader seulement si l'enjeu est majeur. Ce qui est évalué : savoir alerter sans bloquer, et accepter qu'on n'est pas le décideur final." },

{ id:"n10-16", lvl:10, dom:"CI/CD",
  q:"Comment introduis-tu le GitOps dans une organisation qui déploie via des tickets et des opérateurs manuels ?",
  accept:["progressif","un service pilote","co-construction","preuve","conserver l approbation"],
  explain:"On ne supprime pas le contrôle, on le déplace : l'approbation devient une PR approuvée, le ticket reste comme trace, l'opérateur devient garant du pipeline. On commence par un service pilote non critique, on démontre le rollback et l'audit à l'équipe risque, on documente la traçabilité pour les auditeurs, puis on étend. Imposer l'outil avant d'avoir traité la question du contrôle échoue systématiquement en banque." },

{ id:"n10-17", lvl:10, dom:"SRE",
  q:"Quelle est la différence entre un bon et un mauvais runbook ?",
  accept:["actionnable","teste","a jour","decision","pas juste des commandes"],
  explain:"Un bon runbook part du SYMPTÔME observé, donne les commandes exactes à exécuter, indique comment vérifier l'effet, précise quand escalader et à qui, et il a été TESTÉ par quelqu'un qui n'est pas l'auteur — idéalement pendant un exercice. Un mauvais runbook décrit l'architecture, date de deux ans, suppose un contexte implicite et renvoie vers une page qui n'existe plus." },

{ id:"n10-18", lvl:10, dom:"Réseau",
  q:"Un flux entre deux applications ne passe pas et quatre équipes se renvoient la balle. Comment tu tranches ?",
  must:[["couche par couche","methodique","isoler"],["test","preuve","capture","telnet","tcpdump"]],
  explain:"On produit des PREUVES au lieu d'arguments : résolution DNS depuis la source, test TCP sur le port (<code>nc -zv</code>), capture des deux côtés (<code>tcpdump</code>) pour voir si le SYN arrive et si le SYN-ACK repart, lecture des flow logs. Ça localise le point exact de rupture et met fin au débat. La compétence évaluée est autant méthodologique que politique : ramener une discussion à des faits vérifiables." },

{ id:"n10-19", lvl:10, dom:"Kubernetes",
  q:"Le cluster va bien, les métriques sont vertes, mais les utilisateurs se plaignent. Comment procèdes-tu ?",
  accept:["mesurer cote utilisateur","bout en bout","synthetique","hors du cluster","cdn dns"],
  explain:"Le problème est presque toujours en dehors du périmètre observé : DNS, CDN, WAF, certificat, réseau opérateur, client mobile, ou un endpoint particulier noyé dans les moyennes. On mesure depuis le POINT DE VUE UTILISATEUR (tests synthétiques externes, RUM), on segmente (région, version de client, endpoint), et on remonte le chemin. « Mes dashboards sont verts » n'est jamais une réponse acceptable face à des utilisateurs qui souffrent." },

{ id:"n10-20", lvl:10, dom:"SRE",
  q:"Quelles questions poses-tu, TOI, à la fin de l'entretien ? Pourquoi ça compte ?",
  accept:["astreinte","incident","dette","organisation","autonomie","roadmap"],
  explain:"Des questions qui montrent que tu penses en exploitant : comment se passe l'astreinte et à quelle fréquence ça sonne ? Quel a été le dernier incident majeur et qu'est-ce qui a changé après ? Quelle est la plus grosse dette technique assumée ? Quelle autonomie a l'équipe pour mettre en prod ? Qu'attendez-vous de cette personne dans 6 mois ? Ne poser aucune question, ou seulement sur le télétravail, casse une bonne performance technique." },

{ id:"n10-21", lvl:10, dom:"Sécurité",
  q:"Comment expliques-tu à un métier non technique pourquoi il faut arrêter les mots de passe partagés dans un fichier Excel ?",
  accept:["tracabilite","qui a fait quoi","revocation","coffre","impact"],
  explain:"Sans jargon : « aujourd'hui, si quelqu'un fait une erreur ou part, on ne peut ni savoir qui a agi ni couper son accès sans bloquer tout le monde ». On parle traçabilité, révocation individuelle et responsabilité — pas de chiffrement. Puis on propose la solution qui ne dégrade pas leur quotidien : un coffre avec accès nominatif, et on accompagne la bascule. La sécurité qui rend le travail impossible est contournée." },

{ id:"n10-22", lvl:10, dom:"AWS",
  q:"Ton prédécesseur a laissé une infrastructure entièrement créée à la main, sans documentation. Quel est ton plan sur 3 mois ?",
  must:[["inventaire","cartographie","decouvrir"],["import","iac","reprendre en code"]],
  explain:"1) Inventaire automatisé (Config/Resource Graph, tags, coûts) et cartographie des flux critiques. 2) Geler la création manuelle et exiger l'IaC pour tout ce qui est NOUVEAU — arrêter l'hémorragie avant de nettoyer. 3) Sauvegardes et accès d'urgence vérifiés en priorité. 4) Reprise en IaC par import, en commençant par le socle stable (réseau, IAM) puis les applications. 5) Documenter au fur et à mesure. Vouloir tout réécrire d'un coup est le piège." },

{ id:"n10-23", lvl:10, dom:"SRE",
  q:"« On n'a pas le temps de faire les choses proprement. » Comment tu réponds concrètement ?",
  accept:["dette","interet","chiffrer","incremental","negocier"],
  explain:"On accepte la contrainte mais on la nomme : c'est une DETTE, avec un intérêt qui se paiera en incidents et en lenteur. On demande à ce qu'elle soit tracée avec un propriétaire et une échéance, on négocie un pourcentage de capacité récurrent (10-20 % par sprint) plutôt qu'un grand chantier futur qui n'arrivera jamais, et on fait le minimum non négociable maintenant : sauvegardes, rollback, observabilité de base." },

{ id:"n10-24", lvl:10, dom:"Kubernetes",
  q:"Comment expliquerais-tu Kubernetes à un chef de projet qui n'est pas technique, en 30 secondes ?",
  accept:["chef d orchestre","maintient l etat","redemarre","repartit","automatise"],
  explain:"« C'est un chef d'orchestre pour nos applications : on lui décrit ce qu'on veut — trois copies de l'application, qui répondent sur ce port, avec ces ressources — et il s'assure en permanence que c'est le cas. Si une machine tombe ou qu'une copie plante, il redémarre ailleurs sans que personne n'intervienne, et il sait déployer une nouvelle version progressivement sans coupure. » Savoir vulgariser est une compétence évaluée à ce niveau." },

{ id:"n10-25", lvl:10, dom:"SRE",
  q:"Sur quoi te ferais-tu challenger si tu prétends être senior, et que tu ne maîtrises pas encore ? Comment le dis-tu ?",
  accept:["honnete","ce que je sais faire","comment j apprends","exemple"],
  explain:"On assume une zone précise (« je n'ai pas opéré de service mesh en production, j'ai fait un POC Istio ») et on montre immédiatement le processus : comment j'ai appris Kubernetes en partant de zéro, en combien de temps, avec quel résultat. Bluffer sur une technologie que trois seniors connaissent est éliminatoire en une relance. Dire « je ne sais pas, voilà comment je m'y prendrais » est une réponse forte." },

{ id:"n10-26", lvl:10, dom:"CI/CD",
  q:"Quelle est la valeur réelle d'un environnement de recette identique à la production, et pourquoi c'est rarement vrai ?",
  accept:["donnees","volume","cout","derive","charge"],
  explain:"La valeur : les bugs de configuration et d'intégration se voient avant la prod. Pourquoi c'est rarement vrai : le volume et la nature des données diffèrent (anonymisation), la charge n'est pas reproduite, la topologie réseau est simplifiée, et la recette dérive dès qu'on y touche à la main. D'où : générer les deux avec le MÊME code IaC paramétré, et compléter par des tests en production maîtrisée (canary, shadow traffic) plutôt que de croire à une recette parfaite." },

{ id:"n10-27", lvl:10, dom:"Sécurité",
  q:"Quelle est la première mesure de sécurité que tu mettrais en place sur une plateforme cloud qui n'en a aucune ?",
  accept:["mfa","identite","journalisation","supprimer les acces","racine"],
  explain:"Réponse défendable : verrouiller les IDENTITÉS — MFA obligatoire, sécurisation/blocage du compte racine, suppression des clés d'accès statiques et des comptes dormants, accès administrateur nominatif et temporaire. Juste après : activer la journalisation immuable pour pouvoir enquêter. Les identités et les traces d'abord ; le chiffrement et la segmentation viennent après, car sans identité maîtrisée le reste ne protège rien." },

{ id:"n10-28", lvl:10, dom:"SRE",
  q:"On te propose de rejoindre une équipe où tout est manuel mais où personne ne veut changer. Que fais-tu les 30 premiers jours ?",
  accept:["comprendre pourquoi","gagner la confiance","petit gain","aider","douleur"],
  explain:"Comprendre POURQUOI ça n'a pas changé — souvent une tentative passée qui a mal fini, un manque de temps, ou une peur légitime de perdre le contrôle. Gagner en crédibilité en prenant les tâches pénibles avec eux, puis automatiser UNE douleur concrète qu'ils ont nommée, et leur en donner le mérite. Le changement technique en environnement bancaire est d'abord un travail de confiance ; arriver en donneur de leçons garantit l'échec." }

]);
