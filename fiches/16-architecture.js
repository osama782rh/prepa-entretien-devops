window.FICHES = (window.FICHES || []).concat([{
id:"architecture",
titre:"Architecture & system design",
lead:"C'est là que trois chefs seniors passeront le plus de temps. Il n'y a pas de bonne réponse — il y a une méthode et des arbitrages assumés.",
html:`
<h3>La méthode, en 6 temps</h3>
<p>Face à « concevez-nous X », <b>ne dessine pas tout de suite</b>. Le réflexe qui distingue un senior :</p>
<ol>
<li><b>Clarifier</b> — 3 à 5 minutes de questions. C'est évalué autant que la solution.</li>
<li><b>Chiffrer</b> — volumétrie, débit, taille des données, ratio lecture/écriture.</li>
<li><b>Poser le contrat</b> — API, modèle de données, garanties.</li>
<li><b>Dessiner le chemin nominal</b> — simple, sans optimisation prématurée.</li>
<li><b>Passer à l'échelle</b> — identifier le goulot et le traiter, un à la fois.</li>
<li><b>Traiter les pannes</b> — qu'est-ce qui tombe, comment on le détecte, comment on dégrade.</li>
</ol>

<h3>1. Les questions à poser (apprends-les)</h3>
<table>
<tr><th>Catégorie</th><th>Questions</th></tr>
<tr><td><b>Charge</b></td><td>Combien d'utilisateurs ? de requêtes par seconde en moyenne et en pic ? le pic est-il prévisible ?</td></tr>
<tr><td><b>Données</b></td><td>Quel volume ? quelle croissance ? ratio lecture/écriture ? durée de conservation ?</td></tr>
<tr><td><b>Latence</b></td><td>Quel p99 acceptable ? l'utilisateur attend-il la réponse ?</td></tr>
<tr><td><b>Cohérence</b></td><td>Peut-on servir une donnée périmée de quelques secondes ? (réponse différente pour un solde et pour un catalogue)</td></tr>
<tr><td><b>Disponibilité</b></td><td>Quel SLO ? quel RTO/RPO ? que se passe-t-il concrètement pendant une indisponibilité ?</td></tr>
<tr><td><b>Contraintes</b></td><td>Résidence des données, conformité, existant à intégrer, budget, compétences de l'équipe</td></tr>
</table>
<div class="box dire"><b>Formulation</b> : « Avant de dessiner, j'ai besoin de cadrer : quel volume, quelle latence acceptable, et est-ce qu'on tolère une cohérence à terme sur cette donnée ? Les réponses changent complètement l'architecture. »</div>

<h3>2. Les ordres de grandeur à connaître</h3>
<table>
<tr><th>Opération</th><th>Ordre de grandeur</th></tr>
<tr><td>Lecture mémoire</td><td>~100 ns</td></tr>
<tr><td>Lecture SSD</td><td>~100 µs</td></tr>
<tr><td>Aller-retour réseau dans un datacenter</td><td>~0,5 ms</td></tr>
<tr><td>Aller-retour Paris → Francfort</td><td>~10 ms</td></tr>
<tr><td>Aller-retour Paris → Virginie</td><td>~80 ms</td></tr>
<tr><td>Requête SQL simple indexée</td><td>1 à 10 ms</td></tr>
<tr><td>Appel HTTP interne</td><td>5 à 50 ms</td></tr>
</table>
<p><b>Conversions utiles</b> : 1 million de requêtes/jour ≈ 12 req/s en moyenne (mais le pic vaut souvent 5 à 10× la moyenne). 100 Go/jour ≈ 1,2 Mo/s. Un serveur applicatif classique tient quelques milliers de req/s si la base suit — et c'est presque toujours la base qui ne suit pas.</p>

<h3>3. Le squelette d'une architecture web</h3>
<pre><code>DNS → CDN (statique, cache) → WAF → Load balancer L7
   → Passerelle d'API (authN/Z, rate limiting, routage)
     → Services applicatifs (stateless, plusieurs zones)
       → Cache (Redis)
       → Base de données (primaire + réplicas de lecture)
       → File / broker → workers asynchrones
Observabilité transverse · Secrets dans un coffre · Tout en IaC</code></pre>
<p><b>Le principe structurant</b> : garder les services <b>stateless</b>. L'état va dans la base, le cache ou l'objet — pas dans le processus. C'est ce qui rend le scaling horizontal, le rolling update et le remplacement d'instance triviaux.</p>

<h3>4. Passer à l'échelle : dans quel ordre</h3>
<ol>
<li><b>Mesurer</b> où est réellement le goulot. L'intuition se trompe.</li>
<li><b>Cache</b> : le levier au meilleur rapport gain/effort. Attention à l'invalidation et au cache froid.</li>
<li><b>Réplicas de lecture</b> si le trafic est majoritairement en lecture (le cas le plus fréquent).</li>
<li><b>Scaling horizontal</b> des services stateless.</li>
<li><b>Asynchrone</b> : sortir du chemin critique tout ce qui peut attendre (notifications, indexation, reporting).</li>
<li><b>Partitionnement</b> de la base (par date, par tenant) quand une table devient ingérable.</li>
<li><b>Sharding</b> en dernier recours : les jointures et transactions inter-shards coûtent très cher.</li>
</ol>
<div class="box piege">Ne propose jamais du sharding ou du multi-région en ouverture. Un senior entendra « il applique une recette ». On ajoute de la complexité quand une mesure le justifie, pas avant.</div>

<h3>5. Le cache — ce qu'il faut maîtriser</h3>
<table>
<tr><th>Stratégie</th><th>Fonctionnement</th><th>Risque</th></tr>
<tr><td><b>Cache-aside</b></td><td>L'app lit le cache, sinon la base puis remplit le cache</td><td>Le plus courant ; fenêtre d'incohérence après écriture</td></tr>
<tr><td><b>Write-through</b></td><td>Écriture simultanée cache + base</td><td>Latence d'écriture accrue</td></tr>
<tr><td><b>Write-behind</b></td><td>Écriture en cache, base mise à jour ensuite</td><td>Perte possible si le cache tombe</td></tr>
</table>
<p><b>Invalidation</b> : TTL (simple, incohérence bornée), invalidation explicite à l'écriture (juste mais fragile si un chemin l'oublie), ou versionnement de clé. « Il n'y a que deux problèmes difficiles en informatique : l'invalidation de cache et le nommage. »</p>
<div class="box piege"><b>Deux pannes que le cache provoque</b>
<ul>
<li><b>Cache stampede</b> : de nombreuses clés expirent en même temps, tous les clients frappent l'origine et la tuent. Parades : TTL avec <b>jitter</b>, verrou de recalcul, rafraîchissement anticipé.</li>
<li><b>Cache froid</b> : après un redémarrage, le service ne tient plus le trafic nominal car il comptait sur un taux de hit élevé. D'où la remontée progressive du trafic et le dimensionnement de l'origine pour un scénario sans cache.</li>
</ul></div>

<h3>6. Concevoir pour la panne</h3>
<table>
<tr><th>Mécanisme</th><th>Ce qu'il évite</th></tr>
<tr><td><b>Timeout</b></td><td>L'attente infinie. Doit <b>décroître</b> en profondeur d'appel</td></tr>
<tr><td><b>Retry + backoff + jitter</b></td><td>Le retry storm. Le jitter est le détail que tout le monde oublie</td></tr>
<tr><td><b>Budget de retry</b></td><td>L'amplification : plafonner à ~10 % du trafic</td></tr>
<tr><td><b>Circuit breaker</b></td><td>La cascade : échec rapide au lieu d'accumuler des threads en attente</td></tr>
<tr><td><b>Bulkhead</b></td><td>Qu'une dépendance lente consomme tout le pool</td></tr>
<tr><td><b>Load shedding</b></td><td>Traiter mal 100 % plutôt que bien 80 %</td></tr>
<tr><td><b>Idempotence</b></td><td>Le double débit sur retry — <b>fondamental en finance</b></td></tr>
<tr><td><b>Dégradation gracieuse</b></td><td>Le tout ou rien</td></tr>
</table>
<p><b>La question qui suit toujours</b> : « et si ce composant tombe ? » Prépare la réponse pour CHAQUE boîte de ton schéma : comment on le détecte, ce qui continue de fonctionner, comment on revient.</p>

<h3>7. Monolithe ou microservices</h3>
<table>
<tr><th></th><th>Monolithe modulaire</th><th>Microservices</th></tr>
<tr><td>Complexité</td><td>Dans le code</td><td>Déplacée dans le réseau et l'exploitation</td></tr>
<tr><td>Déploiement</td><td>Un seul, coordonné</td><td>Indépendants — le vrai gain</td></tr>
<tr><td>Transactions</td><td>ACID locales</td><td>Sagas et compensations</td></tr>
<tr><td>Observabilité</td><td>Une pile d'appels</td><td>Tracing distribué obligatoire</td></tr>
<tr><td>Prérequis</td><td>Discipline de découpage</td><td>Plateforme mature, équipes autonomes, CI/CD solide</td></tr>
</table>
<div class="box dire"><b>Réponse défendable</b>
« Je commencerais par un monolithe modulaire bien découpé, et je n'extrairais un service que quand un besoin réel apparaît : des équipes qui se bloquent mutuellement, un composant à scaler différemment, un cycle de release divergent. Les microservices ne suppriment pas la complexité, ils la déplacent du code vers le réseau et l'exploitation — et cette complexité-là se paie tous les jours. Loi de Conway : l'architecture finira par refléter l'organisation, donc c'est l'organisation qui doit décider du découpage. »</div>

<h3>8. Découper un domaine</h3>
<ul>
<li>Par <b>capacité métier</b> (paiement, KYC, tarification), pas par couche technique.</li>
<li>Un service possède ses données : <b>pas de base partagée</b> entre services — sinon c'est un monolithe distribué, le pire des deux mondes.</li>
<li>Les frontières doivent minimiser les allers-retours : si deux services s'appellent en boucle pour une seule requête utilisateur, la frontière est mal placée.</li>
<li>Contrats versionnés et rétrocompatibles, testés par des tests de contrat.</li>
</ul>

<h3>9. Haute disponibilité vs reprise après sinistre</h3>
<table>
<tr><th></th><th>Haute disponibilité</th><th>Reprise après sinistre</th></tr>
<tr><td>Couvre</td><td>Panne locale (instance, zone)</td><td>Sinistre majeur (région, corruption, ransomware)</td></tr>
<tr><td>Déclenchement</td><td>Automatique, sans intervention</td><td>Souvent une décision assumée</td></tr>
<tr><td>Mesure</td><td>SLO de disponibilité</td><td>RTO / RPO</td></tr>
<tr><td>Moyen</td><td>Multi-AZ, réplicas, load balancing</td><td>Multi-région, sauvegardes isolées, exercices</td></tr>
</table>
<p>Stratégies DR par coût croissant : <b>Backup &amp; restore</b> (heures) → <b>Pilot light</b> (dizaines de minutes) → <b>Warm standby</b> (minutes) → <b>Actif/actif</b> (quasi nul).</p>
<div class="box piege"><b>Ce qu'on oublie systématiquement en bascule de région</b> : le TTL DNS trop long, les secrets et clés de chiffrement régionaux non répliqués (l'app démarre mais ne déchiffre rien), les quotas jamais demandés dans la région de secours, et le pipeline de déploiement hébergé dans la région tombée.</div>

<h3>10. Cohérence : CAP et PACELC</h3>
<p>En cas de <b>partition</b> réseau (inévitable en distribué), il faut choisir : rester <b>cohérent</b> en refusant de répondre (CP), ou rester <b>disponible</b> en servant une donnée potentiellement périmée (AP).</p>
<ul>
<li>Solde de compte, autorisation de paiement → <b>CP</b>. On préfère refuser que se tromper.</li>
<li>Catalogue, recommandations, historique consultatif → <b>AP</b>.</li>
</ul>
<p><b>PACELC</b> complète : en cas de Partition → A ou C ; <b>Else</b> (fonctionnement normal) → Latence ou Cohérence. Plus honnête, car l'arbitrage existe aussi hors panne : une réplication synchrone multi-région coûte de la latence en permanence.</p>

<h3>11. Les patterns de migration</h3>
<ul>
<li><b>Strangler fig</b> : une façade devant le legacy, on extrait un domaine à la fois et on route progressivement. Chaque étape est réversible. On commence par un domaine périphérique, jamais par le cœur.</li>
<li><b>Expand / contract</b> pour les schémas de données : ajouter, migrer, basculer, puis seulement supprimer.</li>
<li><b>Double run</b> avec réconciliation automatique : les deux systèmes tournent, on compare les résultats et on alerte sur les écarts. C'est ce qui manque à la plupart des migrations ratées.</li>
<li><b>Les 6R</b> : Retire, Retain, Rehost (lift &amp; shift), Replatform, Repurchase, Refactor.</li>
</ul>

<h3>12. Trois architectures à savoir dessiner de tête</h3>
<div class="box dire"><b>Entraîne-toi au tableau, chronomètre en main</b>
<ol>
<li><b>Application web 3-tiers hautement disponible</b> : DNS → CDN/WAF → LB multi-AZ → services stateless → base primaire/réplicas → cache → sortie NAT. Sais dire où est chaque composant et ce qui se passe si chaque brique tombe.</li>
<li><b>Chaîne de traitement asynchrone</b> : API d'ingestion → broker partitionné → consommateurs idempotents scalables → stockage → DLQ + rejeu. Sais expliquer le choix de la clé de partition et la garantie de livraison.</li>
<li><b>Reprise multi-région</b> : réplication des données, bascule DNS avec health checks, secrets et quotas dans les deux régions, et la procédure d'exercice.</li>
</ol>
Dessine-les sur papier sans regarder. Si tu bloques sur une flèche, c'est là qu'il faut réviser.</div>

<h3>13. Les phrases qui font la différence</h3>
<ul>
<li>« Quelle contrainte justifie ce choix ? » — tu relies chaque décision à une exigence.</li>
<li>« C'est une décision <b>réversible</b>, donc on peut essayer vite ; celle-là ne l'est pas, on prend le temps. »</li>
<li>« Le goulot ici sera la base, pas les serveurs applicatifs. »</li>
<li>« On ne peut pas être plus fiable que la somme de nos dépendances. »</li>
<li>« Ce que je propose coûte X en complexité opérationnelle — est-ce que ça se justifie dans votre contexte ? »</li>
</ul>
`
}]);
