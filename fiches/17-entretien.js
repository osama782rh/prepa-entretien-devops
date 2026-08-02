window.FICHES = (window.FICHES || []).concat([{
id:"entretien",
titre:"Jour J — posture & pièges",
lead:"Trois seniors qui te challengent : ce qui se joue là n'est plus seulement technique.",
html:`
<h3>Ce qu'ils cherchent réellement</h3>
<table>
<tr><th>Ils testent</th><th>Comment</th><th>Ce qui les rassure</th></tr>
<tr><td>La profondeur</td><td>Trois relances sur la même question</td><td>Tu descends d'un cran à chaque fois au lieu de répéter</td></tr>
<tr><td>L'honnêteté</td><td>Une question hors de ton périmètre</td><td>« Je ne sais pas, voilà comment je chercherais »</td></tr>
<tr><td>Le réflexe d'exploitant</td><td>« Et si ça tombe à 3 h du matin ? »</td><td>Tu parles détection, mitigation, rollback</td></tr>
<tr><td>L'arbitrage</td><td>« Pourquoi pas l'autre solution ? »</td><td>Tu nommes les critères et tu assumes un choix</td></tr>
<tr><td>La collaboration</td><td>Ils te contredisent</td><td>Tu restes calme et tu ramènes aux faits</td></tr>
</table>

<h3>La structure de réponse en 4 temps</h3>
<ol>
<li><b>Réponse directe</b> en une phrase. Ne commence jamais par « alors, ça dépend… ».</li>
<li><b>Le pourquoi</b> : le mécanisme, en 2-3 phrases.</li>
<li><b>Un cas concret</b> ou un piège associé — c'est ce qui prouve l'expérience.</li>
<li><b>La nuance</b> : « en revanche, si le contexte est X, je ferais plutôt Y ».</li>
</ol>
<p>Exemple : « Requests et limits ? — Les requests servent au scheduler à placer le Pod, les limits sont un plafond. [pourquoi] Concrètement, dépasser la limite CPU provoque du throttling, dépasser la limite mémoire provoque un OOMKill immédiat, parce que la mémoire n'est pas compressible. [piège] L'erreur classique, c'est de définir un HPA sans requests : le calcul de pourcentage devient impossible et il reste inactif. [nuance] En pratique, je mets requests = limits sur la mémoire, et je reste large sur le CPU pour éviter un throttling inutile. »</p>

<h3>Répondre à une question dont tu ne sais rien</h3>
<p>Ne bluffe jamais : ils sont trois, l'un d'eux saura. La formule qui marche :</p>
<p><em>« Je n'ai pas travaillé avec ça directement. De ce que j'en comprends, c'est [analogie avec ce que tu connais]. Si je devais m'y mettre, je commencerais par [démarche concrète]. Est-ce que c'est central dans le poste ? »</em></p>
<p>Ça montre : lucidité, capacité d'analogie, méthode d'apprentissage, et intérêt pour leur contexte. Un bluff démonté coûte beaucoup plus cher qu'un trou assumé.</p>

<h3>Quand ils te contredisent</h3>
<ul>
<li><b>Ne cède pas immédiatement</b> — ça montre que tu n'avais pas d'argument.</li>
<li><b>Ne campe pas non plus</b> — ça montre que tu es difficile à travailler.</li>
<li>Reformule leur objection : « si je comprends bien, votre inquiétude porte sur l'exploitabilité plutôt que sur la technique ? »</li>
<li>Reconnais ce qui est vrai, puis propose : « vous avez raison sur le coût opérationnel. Une version plus simple serait X, on perdrait Y — est-ce acceptable dans votre contexte ? »</li>
<li>Ramène aux critères : « on optimise pour le time-to-market, le coût d'exploitation, ou la conformité ? »</li>
</ul>

<h3>Vocabulaire qui te classe (à placer naturellement)</h3>
<ul>
<li><b>Rayon d'impact</b> / blast radius</li>
<li><b>Idempotence</b>, <b>rétrocompatibilité</b>, <b>expand/contract</b></li>
<li><b>Error budget</b>, <b>SLO</b>, <b>toil</b>, <b>post-mortem blameless</b></li>
<li><b>Moindre privilège</b>, <b>séparation des tâches</b>, <b>juste-à-temps</b></li>
<li><b>Décision réversible vs irréversible</b></li>
<li><b>Plan de contrôle vs plan de données</b></li>
<li><b>DORA</b> (les 4 métriques ET le règlement européen — les deux existent, ne les confonds pas)</li>
</ul>

<h3>Vocabulaire qui te dessert</h3>
<ul>
<li>« C'est une best practice » sans dire pourquoi.</li>
<li>« Il suffit de… » — rien ne suffit en production.</li>
<li>« On fait toujours comme ça » — c'est l'absence d'arbitrage.</li>
<li>« Le dev n'avait qu'à… » — jamais de mépris pour une autre équipe, même justifié.</li>
<li>Nommer des outils sans nommer le problème qu'ils résolvent.</li>
</ul>

<h3>Raconter un incident (format attendu)</h3>
<ol>
<li><b>Contexte + impact chiffré</b> : « service de paiement, 40 minutes, ~3 000 transactions en échec ».</li>
<li><b>Détection</b> : comment on l'a su — alerte, client, hasard (sois honnête).</li>
<li><b>Décision</b> : ce que tu as fait EN PREMIER et pourquoi — mitiger avant de comprendre.</li>
<li><b>Résolution</b> : la cause réelle, sans jargon inutile.</li>
<li><b>Ce qui a changé après</b> : l'action systémique. <b>C'est cette partie qu'ils écoutent le plus.</b></li>
</ol>
<div class="box dire">Si tu n'as pas vécu d'incident majeur, ne l'invente pas. Prends un incident réel de ton périmètre, même modeste, et traite-le avec cette rigueur : un candidat qui analyse proprement un petit incident vaut mieux qu'un candidat qui raconte mal une grosse panne.</div>

<h3>Questions à leur poser (choisis-en 3)</h3>
<ul>
<li>Comment se passe l'astreinte, et à quelle fréquence elle sonne réellement ?</li>
<li>Quel a été le dernier incident majeur, et qu'est-ce qui a changé après ?</li>
<li>Quelle autonomie a l'équipe pour mettre en production ? Combien de temps entre un commit et la prod ?</li>
<li>Quelle est la plus grosse dette technique que vous assumez aujourd'hui ?</li>
<li>Qu'est-ce qui ferait que dans six mois vous seriez très contents d'avoir recruté cette personne ?</li>
<li>Comment cohabitent les équipes plateforme et les équipes applicatives ?</li>
</ul>
<p>Ne poser aucune question, ou seulement sur le télétravail et les congés, gâche une bonne performance technique.</p>

<h3>Spécificités du contexte bancaire</h3>
<ul>
<li>La <b>conformité n'est pas un frein à contourner</b> : c'est une contrainte de conception. Le bon discours est « je rends le contrôle automatique et non contournable », pas « je trouve un moyen de passer outre ».</li>
<li>Les <b>périodes de gel</b> (clôtures, arrêtés comptables) sont légitimes. Montre que tu sais vivre avec, et que tu gardes un chemin d'urgence encadré.</li>
<li>Le <b>legacy</b> est massif et ne disparaîtra pas. Un candidat qui veut tout réécrire fait peur ; un candidat qui parle de pattern strangler et de migration progressive rassure.</li>
<li>La <b>réversibilité</b> et la <b>stratégie de sortie</b> vis-à-vis d'un fournisseur cloud sont des sujets réels (DORA). Savoir que ça existe te distingue.</li>
<li>L'environnement est <b>contraint</b> : proxy obligatoire, pas de sortie internet, registry interne, CA d'entreprise. Montre que tu sais travailler comme ça.</li>
</ul>

<h3>Les 30 dernières minutes avant l'entretien</h3>
<ol>
<li>Relis uniquement : les 4 métriques DORA, SLI/SLO/SLA/error budget, SG vs NACL, requests vs limits, liveness vs readiness, expand/contract.</li>
<li>Prépare une phrase de présentation de 90 secondes : qui tu es, ce que tu as construit, pourquoi ce poste. Répète-la à voix haute.</li>
<li>Prépare ton incident et ton « dernière fois où tu t'es trompé ».</li>
<li>Note tes 3 questions pour eux.</li>
<li>Respire. Ils cherchent quelqu'un avec qui travailler, pas une encyclopédie.</li>
</ol>

<div class="box dire"><b>La phrase à garder en tête</b>
Tu n'as pas besoin de tout savoir. Tu as besoin de montrer que face à ce que tu ne sais pas, tu as une méthode — et qu'en production, tu penses d'abord à ce qui casse, comment tu le détectes et comment tu reviens en arrière.</div>
`
}]);
