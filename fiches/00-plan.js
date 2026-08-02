window.FICHES = (window.FICHES || []).concat([{
id:"plan",
titre:"Plan de révision 15 jours",
lead:"Comment utiliser ce dossier pour arriver prêt le jour J.",
html:`
<h3>Le principe</h3>
<p>Tu ne retiendras pas en lisant. Tu retiendras en <b>essayant de répondre à voix haute, en te trompant, puis en corrigeant</b>. Le quiz est donc l'outil principal ; les fiches ne servent qu'à combler les trous que le quiz révèle.</p>
<p>Règle de fer : ne lis une fiche qu'<b>après</b> avoir raté les questions du domaine correspondant. Lire avant donne l'illusion de savoir.</p>

<h3>Rythme quotidien (≈ 2 à 3 h)</h3>
<ol>
<li><b>15 min — Révision du jour</b> : bouton « Révision du jour » dans le quiz. Ce sont les questions dues selon la répétition espacée. Non négociable, tous les jours.</li>
<li><b>45 min — Nouveau niveau</b> : un niveau du quiz, en formulant chaque réponse <b>à voix haute et en entier</b> avant de taper. Si tu ne peux pas l'expliquer oralement, tu ne le sais pas.</li>
<li><b>30 min — Fiches</b> : lis uniquement les fiches des domaines où tu es tombé sous 70 %.</li>
<li><b>45 min — Pratique réelle</b> : tape les commandes, écris le Terraform, casse un pod. La mémoire des mains compte double en entretien technique.</li>
<li><b>15 min — Mes points faibles</b> : bouton dédié, en fin de session.</li>
</ol>

<h3>Découpage sur 15 jours</h3>
<table>
<tr><th>Jours</th><th>Quiz</th><th>Focus pratique</th></tr>
<tr><td>J1–J2</td><td>Niveaux 1 et 2</td><td>Linux : permissions, redirections, systemd, scripts avec <code>set -euo pipefail</code></td></tr>
<tr><td>J3–J4</td><td>Niveau 3</td><td>Docker : multi-stage, non-root, debug d'un conteneur qui plante</td></tr>
<tr><td>J5–J6</td><td>Niveau 4</td><td>Kubernetes : deployment + service + ingress, probes, requests/limits</td></tr>
<tr><td>J7–J8</td><td>Niveau 5</td><td>Terraform : modules, for_each, backend distant, import, moved</td></tr>
<tr><td>J9–J10</td><td>Niveau 6</td><td>Troubleshooting : casse volontairement des choses et répare-les chronomètre en main</td></tr>
<tr><td>J11–J12</td><td>Niveaux 7 et 8</td><td>Architecture : dessine 3 archi au tableau (web 3-tiers, microservices, DR)</td></tr>
<tr><td>J13</td><td>Niveau 9</td><td>Gouvernance, coûts, conformité — spécifique banque</td></tr>
<tr><td>J14</td><td>Niveau 10</td><td>Oral : réponds aux 28 questions à voix haute, chronométré, sans lire</td></tr>
<tr><td>J15</td><td>Marathon complet</td><td>Repos relatif. Relis la fiche « Jour J » uniquement.</td></tr>
</table>

<div class="box dire"><b>À faire absolument</b>
Enregistre-toi en train de répondre à 5 questions du niveau 10. Réécoute. C'est brutal, et c'est ce qui te fera progresser le plus vite sur la forme — le débit, les « euh », les réponses qui partent dans tous les sens.</div>

<h3>Ce qui est évalué par trois seniors</h3>
<ul>
<li><b>La profondeur</b> : ils vont relancer 3 fois sur la même question. « Et pourquoi ? », « et si ça tombe ? », « et à 10 000 req/s ? ». Une réponse apprise par cœur s'effondre à la deuxième relance.</li>
<li><b>L'honnêteté</b> : dire « je ne sais pas, voilà comment je chercherais » vaut mieux qu'un bluff. Ils sont trois : l'un des trois saura.</li>
<li><b>Le raisonnement d'exploitant</b> : qu'est-ce qui casse, comment tu le détectes, comment tu reviens en arrière. Beaucoup plus que la syntaxe.</li>
<li><b>L'arbitrage</b> : à leur niveau, il n'y a pas de bonne réponse universelle. Il y a un contexte, des contraintes et un choix assumé.</li>
</ul>

<h3>Les 10 sujets qui tombent quasi sûrement</h3>
<ol>
<li>Explique ce qui se passe quand tu tapes une URL (version infra).</li>
<li>Différence Security Group / NACL, ou NSG / Azure Firewall.</li>
<li>Le state Terraform : à quoi il sert, comment tu le sécurises, que fait-on à plusieurs.</li>
<li>Pod en CrashLoopBackOff / Pending : ta démarche de diagnostic.</li>
<li>Comment tu gères les secrets dans un pipeline.</li>
<li>Rolling update, blue/green, canary : différences et quand tu prends quoi.</li>
<li>Comment tu fais un rollback quand la base a été migrée.</li>
<li>Requests vs limits, et pourquoi un pod se fait OOMKill.</li>
<li>Comment tu construis un SLO et à quoi sert un error budget.</li>
<li>Raconte un incident que tu as géré.</li>
</ol>
`
}]);
