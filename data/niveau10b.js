window.QBANK = (window.QBANK || []).concat([
/* ============ NIVEAU 10 — SÉRIE B ============ */

{ id:"b10-01", lvl:10, dom:"SRE",
  q:"« Présentez-vous en 90 secondes. » Que doit contenir ta réponse, et qu'est-ce qui la gâche ?",
  must:[["ce que j ai construit","realisation","concret"],["pourquoi ce poste","motivation","lien"]],
  explain:"Trois blocs : qui tu es professionnellement (une phrase), 2-3 réalisations CONCRÈTES avec un résultat mesurable, et pourquoi CE poste précisément. Ce qui gâche : dérouler son CV chronologiquement depuis le lycée, énumérer 30 technologies sans contexte, ou dépasser 2 minutes. Les seniors décident en 90 secondes s'ils vont creuser ou survoler — c'est le seul moment que tu contrôles entièrement, donc c'est celui qu'on répète à voix haute." },

{ id:"b10-02", lvl:10, dom:"SRE",
  q:"« Vous n'avez jamais travaillé en banque. Pourquoi vous prendrions-nous ? » Comment tu réponds ?",
  accept:["ce que j apporte","contrainte","apprendre","transferable","reconnais"],
  explain:"On ne nie pas et on ne s'excuse pas. On reconnaît l'écart, puis on montre ce qui est TRANSFÉRABLE (rigueur, traçabilité, gestion d'incident, environnements contraints) et ce qu'on a déjà compris de leur contexte (conformité, séparation des tâches, périodes de gel, réversibilité). On termine sur la vitesse d'apprentissage démontrée par un exemple précis. Prouver qu'on a fait l'effort de comprendre leur métier vaut plus que dix ans d'expérience générique." },

{ id:"b10-03", lvl:10, dom:"Kubernetes",
  q:"Ils te posent une question dont tu maîtrises la réponse à 80 %. Que fais-tu des 20 % restants ?",
  accept:["annonce la limite","je crois","a verifier","honnete","separer"],
  explain:"Tu réponds sur ce que tu sais avec assurance, puis tu MARQUES la frontière : « ça, j'en suis certain ; sur ce point précis, de mémoire c'est X mais je vérifierais avant de l'affirmer ». Cette séparation explicite entre ce qu'on sait et ce qu'on croit est un signal de fiabilité très fort en production. À l'inverse, noyer les 20 % dans le flot général donne l'impression que tout le reste est du même niveau de certitude." },

{ id:"b10-04", lvl:10, dom:"Terraform",
  q:"« Montrez-nous comment vous concevriez notre plateforme. » Ils te donnent un tableau blanc. Par quoi tu commences ?",
  accept:["questions","contraintes","exigences","clarifier","pas dessiner"],
  explain:"Pas par dessiner. Par écrire les CONTRAINTES à gauche du tableau : volumétrie, SLO, RTO/RPO, conformité et résidence des données, budget, taille et compétence de l'équipe, existant et dépendances. Puis on propose une architecture et on explique quelle contrainte justifie chaque choix. Dessiner immédiatement une architecture générique montre qu'on applique une recette au lieu de résoudre LEUR problème." },

{ id:"b10-05", lvl:10, dom:"CI/CD",
  q:"Un chef affirme quelque chose de techniquement faux devant les deux autres. Que fais-tu ?",
  accept:["ne pas humilier","poser une question","reformuler","peut-etre","sans le contredire","diplomatie"],
  explain:"Ni acquiescer (tu valides une erreur et tu perds en crédibilité technique), ni corriger frontalement devant ses pairs. On passe par la question ouverte : « je l'avais compris différemment — dans le cas X, est-ce que ça ne donnerait pas plutôt Y ? ». Ça ouvre la discussion sans confrontation, et si tu as raison, ils le verront. Cette question teste exactement ta capacité à travailler avec des seniors sans créer de conflit." },

{ id:"b10-06", lvl:10, dom:"Sécurité",
  q:"« Quelle est la décision technique dont vous êtes le plus fier ? » Comment tu la choisis ?",
  must:[["arbitrage","alternative","pourquoi ce choix"],["resultat","impact","mesure"]],
  explain:"Choisis une décision où tu as ARBITRÉ entre plusieurs options défendables, pas où tu as appliqué une évidence. Structure : le contexte et la contrainte, les options envisagées, pourquoi tu as tranché ainsi, le résultat mesuré, et ce que tu ferais différemment aujourd'hui. Cette dernière partie compte autant que le reste : elle montre que tu continues d'évaluer tes propres choix." },

{ id:"b10-07", lvl:10, dom:"SRE",
  q:"« Comment réagissez-vous quand un développeur refuse d'appliquer vos recommandations ? »",
  accept:["comprendre pourquoi","contrainte","proposer","co-construire","pas d autorite"],
  explain:"D'abord comprendre le refus : contrainte de délai, recommandation impraticable dans leur contexte, ou désaccord de fond ? Souvent la recommandation était juste mais coûteuse à appliquer, et le vrai travail est de la rendre facile (outiller, automatiser, fournir un modèle prêt à l'emploi). Si le désaccord persiste sur un risque important, on documente le risque, on le fait arbitrer, et on avance. Un DevOps qui impose par l'autorité n'a plus d'influence six mois plus tard." },

{ id:"b10-08", lvl:10, dom:"Kubernetes",
  q:"« Si vous deviez supprimer une seule technologie de notre stack, laquelle et pourquoi ? » Comment tu abordes ça ?",
  accept:["je ne connais pas assez","questions","coherence","complexite","prudence"],
  explain:"C'est un piège : critiquer une stack qu'on ne connaît pas depuis 40 minutes est présomptueux, mais botter en touche est mou. Bonne réponse : « je n'ai pas assez de contexte pour trancher, mais voici ce que je regarderais — les composants qui font doublon, ceux que personne ne maîtrise vraiment, et ceux dont la valeur ne justifie pas la charge opérationnelle. Est-ce qu'il y en a un qui vous pose déjà question ? » Tu montres une grille d'analyse et tu leur rends la parole." },

{ id:"b10-09", lvl:10, dom:"Observabilité",
  q:"« Vous êtes d'astreinte, tout est rouge, votre téléphone sonne, le métier vous appelle. Vous faites quoi dans les 5 premières minutes ? »",
  must:[["etat des lieux","impact","que se passe-t-il"],["communiquer","canal","informer"]],
  explain:"1) Accuser réception et ouvrir un canal unique — arrêter d'être appelé sur trois lignes. 2) Qualifier l'impact réel : quoi, depuis quand, combien d'utilisateurs. 3) Chercher le CHANGEMENT récent (déploiement, flag, config) — c'est la cause dans la majorité des cas. 4) Décider de mitiger (rollback, scale, bascule) sans attendre de comprendre. 5) Donner un premier point de situation avec une heure de prochain point. Ce qui est évalué : que tu communiques et que tu priorises la mitigation." },

{ id:"b10-10", lvl:10, dom:"AWS",
  q:"« Combien coûterait votre architecture ? » Tu n'as pas les chiffres exacts. Que fais-tu ?",
  accept:["ordre de grandeur","hypotheses","postes principaux","calculette","estimer"],
  explain:"On ne dit pas « je ne sais pas ». On raisonne en ordre de grandeur à voix haute : les postes dominants (calcul, base, transfert de données, licences), une hypothèse de volumétrie assumée, une fourchette, et ce qui la ferait basculer. Puis on propose de l'affiner avec le calculateur du fournisseur. Ce qui est testé : la conscience que chaque choix technique a un prix, pas la capacité à réciter un tarif." },

{ id:"b10-11", lvl:10, dom:"SRE",
  q:"« Qu'est-ce qui vous ferait refuser ce poste ? » Pourquoi cette question, et que répondre ?",
  accept:["honnete","conditions de travail","autonomie","ce que je cherche","reciproque"],
  explain:"Elle teste la maturité et vérifie que tu évalues aussi de ton côté — un candidat prêt à tout accepter inquiète. Réponse honnête et professionnelle : ce qui compte pour toi (autonomie sur la production, possibilité d'automatiser, astreinte soutenable, équipe qui fait des post-mortems) et ce qui serait rédhibitoire (accès prod interdit sans alternative, aucune capacité à corriger la dette). Sans agressivité : tu décris des conditions de réussite, pas des exigences." },

{ id:"b10-12", lvl:10, dom:"Sécurité",
  q:"« Notre sécurité impose des contraintes qui ralentissent tout. Vous en pensez quoi ? » Attention, c'est un test.",
  accept:["legitimes","automatiser","pas contourner","integrer","les deux"],
  explain:"Le piège est de se ranger du côté de la vitesse pour se rendre sympathique. Réponse solide : les contraintes sont légitimes en banque, le problème n'est pas leur existence mais leur COÛT d'application — quand un contrôle est manuel et répété, il ralentit ET il est mal appliqué. Le travail consiste à les automatiser et à les intégrer dans le chemin par défaut, pour qu'elles deviennent invisibles au développeur. Jamais « je trouverais un moyen de contourner »." },

{ id:"b10-13", lvl:10, dom:"CI/CD",
  q:"« Votre prédécesseur a mis en place quelque chose que vous jugez mauvais. Vous faites quoi ? »",
  accept:["comprendre le contexte","raison","ne pas juger","progressif","risque"],
  explain:"D'abord chercher POURQUOI : il y avait probablement une contrainte qu'on ignore (budget, délai, compétence disponible, exigence d'alors). Ensuite évaluer le risque réel et le coût du changement — beaucoup de choses « mauvaises » fonctionnent et ne valent pas la peine d'être refaites. Si le changement se justifie : le proposer avec les bénéfices chiffrés, et le faire progressivement. Arriver en critiquant le travail des autres est le meilleur moyen de perdre l'équipe en place." },

{ id:"b10-14", lvl:10, dom:"Réseau",
  q:"Ils te demandent de déboguer un problème au tableau, sans machine. Comment tu procèdes ?",
  must:[["hypothese","methodique","couche par couche"],["ce que je verifierais","commande","preuve"]],
  explain:"Tu verbalises une méthode : quelles hypothèses, dans quel ORDRE tu les testerais, quelle commande te donnerait quelle information, et comment chaque résultat orienterait la suite. « Je regarderais d'abord X ; si ça montre Y, alors j'irais vers Z, sinon vers W. » L'exercice n'évalue pas la bonne réponse mais la structure de ton raisonnement — un candidat qui saute directement à une conclusion échoue même s'il tombe juste." },

{ id:"b10-15", lvl:10, dom:"SRE",
  q:"« Où vous voyez-vous dans 3 ans ? » Comment répondre sans cliché ni piège ?",
  accept:["competence","profondeur","expertise","concret","lien avec le poste"],
  explain:"On évite les deux extrêmes : « manager » (tu pars du poste technique qu'ils recrutent) et « je ne sais pas » (aucun projet). Réponse efficace : une direction de compétence concrète et cohérente avec le poste (référent sur un domaine, capable de porter l'architecture d'une plateforme, de former les autres), en montrant que ce poste est une étape logique de ce chemin. Ils cherchent à savoir si tu resteras assez longtemps pour être rentable." },

{ id:"b10-16", lvl:10, dom:"Terraform",
  q:"« Quelle est la chose la plus difficile que vous ayez automatisée ? » Que cherchent-ils vraiment ?",
  must:[["complexite","pourquoi c etait dur","obstacle"],["resultat","avant apres","gain"]],
  explain:"Ils cherchent : est-ce que tu as affronté de la vraie complexité, ou juste enchaîné des tutoriels ? Structure : pourquoi c'était difficile (état existant, dépendances, absence de documentation, résistance humaine, contraintes de production), comment tu as découpé le problème, ce qui a échoué en chemin, et le gain mesuré. La difficulté humaine ou organisationnelle compte autant que la difficulté technique — souvent plus." },

{ id:"b10-17", lvl:10, dom:"Kubernetes",
  q:"Trois seniors, trois avis différents sur ta réponse. Comment évites-tu de te faire déchirer ?",
  accept:["reconnais","critere","contexte","pas de reponse unique","les faire parler"],
  explain:"Tu reconnais explicitement qu'il n'y a pas de réponse unique et tu ramènes au CRITÈRE : « les trois approches sont défendables, elles n'optimisent pas la même chose — dans votre contexte, qu'est-ce qui prime ? ». Tu passes de la position défensive à l'animation d'une discussion technique. C'est exactement la posture attendue d'un profil senior : savoir cadrer un désaccord entre gens compétents." },

{ id:"b10-18", lvl:10, dom:"Sécurité",
  q:"« Qu'est-ce que vous feriez le premier jour si on vous donnait les accès à la production ? »",
  accept:["rien","observer","lire","ne pas toucher","comprendre"],
  explain:"Rien qui modifie quoi que ce soit. On lit : architecture, runbooks, historique des incidents, dashboards, alertes des dernières semaines, et on écoute l'équipe. On identifie les risques immédiats sans y toucher (sauvegarde jamais testée, certificat qui expire, absence de rollback). Répondre « je commencerais par mettre en place X » le premier jour est le drapeau rouge numéro un pour un chef d'exploitation." },

{ id:"b10-19", lvl:10, dom:"SQL",
  q:"« Un batch de nuit dépasse sa fenêtre et empiète sur l'ouverture. Comment vous traitez ça ? »",
  must:[["mesurer","ou passe le temps","profil"],["decouper","parallele","incremental"]],
  explain:"1) Mesurer où passe réellement le temps (étape par étape) avant d'optimiser quoi que ce soit. 2) Leviers classiques : traitement incrémental plutôt que complet, parallélisation par partition, index adaptés, suppression des allers-retours ligne à ligne, exécution sur un réplica pour les lectures. 3) Court terme : découper en lots reprenables pour ne pas tout perdre à l'arrêt. 4) Poser un SLO sur ce batch et alerter AVANT le dépassement, pas après. En banque, ce sujet est très concret : les arrêtés de nuit conditionnent l'ouverture." },

{ id:"b10-20", lvl:10, dom:"SRE",
  q:"« Vous avez 6 mois et une équipe de 4 personnes. Quelle est votre priorité numéro un ? » Comment cadrer la réponse ?",
  accept:["depend du diagnostic","risque","je poserais des questions","valeur","reduire le risque"],
  explain:"On refuse poliment de répondre dans le vide : « ça dépend de ce que je trouverais, mais voici comment je trancherais ». Grille : d'abord ce qui met l'entreprise en risque (sauvegardes, rollback, sécurité des accès), ensuite ce qui coûte le plus de temps à l'équipe chaque semaine (le toil), enfin ce qui débloque le plus de valeur pour les équipes produit. Et un livrable visible sous 6 semaines pour établir la crédibilité." },

{ id:"b10-21", lvl:10, dom:"CI/CD",
  q:"« Combien de temps entre un commit et la production, chez vous ? » Comment répondre si c'était lent ?",
  accept:["honnete","chiffre","pourquoi","ce que j ai ameliore","contraintes"],
  explain:"Donne le chiffre réel, sans le maquiller — ils le sentiront. Puis explique POURQUOI (validation métier, contraintes réglementaires, dépendances, dette) et surtout ce que tu as fait pour l'améliorer, même partiellement, avec le gain obtenu. Un candidat qui connaît son chiffre et sa cause vaut mieux qu'un candidat qui annonce 15 minutes sans savoir ce qu'il y a dans le pipeline." },

{ id:"b10-22", lvl:10, dom:"AWS",
  q:"« On vous demande de réduire les coûts de 30 % en 3 mois. Vous commencez par quoi ? »",
  must:[["visibilite","mesurer","ou part l argent","tag"],["quick win","eteindre","rightsizing","engagement"]],
  explain:"1) Visibilité d'abord : ventilation par service, compte, équipe — sans ça, on optimise au hasard. 2) Quick wins sans risque : extinction du hors-production la nuit et le week-end, suppression des ressources orphelines (volumes, snapshots, IP, load balancers vides), rétention des logs. 3) Rightsizing basé sur l'usage réel. 4) Engagements (Savings Plans) sur la base stable une fois le parc assaini — jamais avant, sinon on s'engage sur du gaspillage. 5) Restitution aux équipes avec un objectif par périmètre." },

{ id:"b10-23", lvl:10, dom:"Observabilité",
  q:"« Comment sauriez-vous que votre travail a de la valeur ? » Que répondre concrètement ?",
  must:[["metrique","mesure","chiffre"],["avant apres","incident","temps gagne"]],
  explain:"En nommant des mesures : réduction du MTTR, baisse du nombre d'alertes nocturnes, temps de déploiement, taux d'échec des changements, temps gagné par les équipes produit sur une tâche récurrente, coût par transaction. Un candidat qui répond « quand ça marche bien » n'a jamais eu à défendre un budget. Ceux qui recrutent des seniors cherchent quelqu'un capable de rendre son impact visible sans qu'on le lui demande." },

{ id:"b10-24", lvl:10, dom:"Sécurité",
  q:"« Racontez-nous une fois où vous avez cassé la production. » Piège ou vraie question ?",
  accept:["vraie question","honnetete","ce que j ai appris","detecte","corrige"],
  explain:"Vraie question, et refuser d'y répondre (« ça ne m'est jamais arrivé ») est la pire réponse : soit tu n'as jamais touché à la production, soit tu ne l'assumes pas. Structure : ce que j'ai fait, comment je m'en suis rendu compte, ce que j'ai fait dans les 10 minutes suivantes, comment je l'ai communiqué, et le garde-fou mis en place après. Assumer une erreur avec cette rigueur inspire plus confiance qu'un parcours sans accroc." },

{ id:"b10-25", lvl:10, dom:"SRE",
  q:"L'entretien se termine, tu sens que tu as raté une question. Que fais-tu ?",
  accept:["revenir dessus","proposer","corriger","assume","email"],
  explain:"Si l'occasion se présente, tu y reviens brièvement et proprement : « tout à l'heure sur la question X, j'ai répondu trop vite — avec le recul, je dirais plutôt Y ». Ça transforme un point faible en démonstration de lucidité. Sinon, un message de remerciement court après l'entretien peut reprendre le point en deux phrases. Ce qu'il ne faut pas faire : ressasser pendant le reste de l'entretien et rater les questions suivantes." },

{ id:"b10-26", lvl:10, dom:"Kubernetes",
  q:"« Expliquez-nous un concept technique complexe comme si nous n'y connaissions rien. » Que testent-ils ?",
  accept:["vulgarisation","analogie","sans jargon","comprehension reelle","transmettre"],
  explain:"Ils testent deux choses : ta compréhension réelle (on ne vulgarise bien que ce qu'on maîtrise vraiment) et ta capacité à parler à des interlocuteurs non techniques — indispensable en banque où tu dialogueras avec le risque, la conformité et le métier. Bonne technique : une analogie du quotidien, zéro acronyme, puis vérifier que ça a été compris avant d'ajouter une couche." },

{ id:"b10-27", lvl:10, dom:"SRE",
  q:"« Préférez-vous être expert d'un domaine ou généraliste ? » Quel est le piège ?",
  accept:["les deux","profondeur sur","large","t-shaped","selon le poste"],
  explain:"Le piège est de choisir un camp de façon absolue. Réponse solide : le profil en T — une base large qui permet de dialoguer avec toutes les équipes et de diagnostiquer de bout en bout, et une ou deux profondeurs réelles où l'on est référent. Et tu précises tes profondeurs actuelles honnêtement. En DevOps, prétendre être expert de tout est une réponse éliminatoire face à trois spécialistes." },

{ id:"b10-28", lvl:10, dom:"CI/CD",
  q:"Ils te disent « merci, on vous rappelle ». Qu'est-ce que tu dois avoir fait avant de sortir de la salle ?",
  must:[["questions","poser"],["prochaines etapes","suite","delai"]],
  explain:"1) Avoir posé tes 2-3 questions (astreinte, dernier incident majeur, attentes à 6 mois). 2) Avoir demandé les prochaines étapes et le délai — ça montre de l'intérêt et ça t'évite d'attendre dans le flou. 3) Avoir noté les noms. 4) Éventuellement dit en une phrase pourquoi le poste t'intéresse après ce que tu as entendu. Sortir sans rien demander laisse une impression tiède, même après une bonne performance technique." }

]);
