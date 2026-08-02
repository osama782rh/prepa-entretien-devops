window.FICHES = (window.FICHES || []).concat([{
id:"messagerie",
titre:"Messagerie & flux (Kafka, files)",
lead:"Le découplage asynchrone est la colonne vertébrale des SI bancaires. Savoir en parler correctement fait la différence au niveau architecture.",
html:`
<h3>Pourquoi de l'asynchrone</h3>
<table>
<tr><th></th><th>Appel synchrone</th><th>Messagerie</th></tr>
<tr><td>Couplage</td><td>Temporel : si l'appelé est mort, l'appelant l'est aussi</td><td>Découplé : le producteur n'attend pas le consommateur</td></tr>
<tr><td>Pics de charge</td><td>Se propagent immédiatement</td><td>Absorbés par le tampon</td></tr>
<tr><td>Consommateurs</td><td>Un appel, un destinataire</td><td>Plusieurs consommateurs indépendants du même flux</td></tr>
<tr><td>Cohérence</td><td>Immédiate</td><td>À terme (eventual)</td></tr>
<tr><td>Débogage</td><td>Simple, une pile d'appels</td><td>Difficile sans tracing distribué</td></tr>
</table>
<p><b>Quand choisir quoi</b> : synchrone quand l'utilisateur attend une réponse pour décider (autorisation de paiement, vérification de solde). Asynchrone pour la propagation (notification, mise à jour d'un référentiel, alimentation analytique, comptabilisation).</p>

<h3>File vs publication/abonnement</h3>
<ul>
<li><b>File (queue)</b> : un message, UN consommateur qui le traite. Répartition du travail entre workers. RabbitMQ, SQS, Azure Service Bus.</li>
<li><b>Pub/Sub</b> : un message, PLUSIEURS abonnés qui le reçoivent chacun. SNS, Event Grid, topics Service Bus.</li>
<li><b>Journal (log) distribué</b> : les messages sont conservés dans un journal ordonné et relisible ; chaque consommateur avance à son rythme avec son propre curseur. Kafka, Event Hubs, Kinesis.</li>
</ul>
<p><b>Pattern fan-out</b> : un topic pub/sub publie vers plusieurs files, chacune consommée par un service indépendant. Chaque consommateur a son propre rythme et sa propre DLQ — la panne de l'un n'affecte pas les autres.</p>

<h3>Kafka — le modèle</h3>
<table>
<tr><th>Notion</th><th>Ce que c'est</th></tr>
<tr><td><b>Topic</b></td><td>Un flux nommé de messages</td></tr>
<tr><td><b>Partition</b></td><td>Un journal ordonné et immuable. L'unité de parallélisme ET d'ordre</td></tr>
<tr><td><b>Offset</b></td><td>La position d'un message dans sa partition</td></tr>
<tr><td><b>Consumer group</b></td><td>Un ensemble de consommateurs qui se répartissent les partitions</td></tr>
<tr><td><b>Réplication</b></td><td>Chaque partition a un leader et des réplicas (ISR = in-sync replicas)</td></tr>
<tr><td><b>Rétention</b></td><td>Les messages restent N jours (ou N Go) même après lecture</td></tr>
</table>
<p><b>Les trois conséquences à connaître par cœur :</b></p>
<ol>
<li><b>L'ordre n'est garanti QUE dans une partition.</b> Si l'ordre compte pour un client donné, il faut que sa clé le range toujours dans la même partition.</li>
<li><b>Le parallélisme est plafonné par le nombre de partitions.</b> Ajouter un 11ᵉ consommateur à un topic de 10 partitions ne sert à rien — il restera inactif.</li>
<li><b>La lecture ne consomme pas.</b> Le message reste jusqu'à expiration de la rétention : on peut rejouer un flux depuis le début, ce qui est précieux pour reconstruire un état ou corriger un bug de traitement.</li>
</ol>
<div class="box piege"><b>La clé de partition, le vrai piège</b>
Une clé mal choisie déséquilibre tout : si 80 % des messages portent le même identifiant de tenant, une partition reçoit 80 % du trafic et son consommateur devient le goulot, pendant que les autres dorment. On veut une clé à <b>forte cardinalité et bien distribuée</b>, tout en préservant l'ordre là où c'est nécessaire. Et le nombre de partitions ne se réduit jamais : on ne peut qu'augmenter, ce qui redistribue les clés.</div>

<h3>Garanties de livraison</h3>
<table>
<tr><th>Garantie</th><th>Signifie</th><th>Coût</th></tr>
<tr><td><b>At most once</b></td><td>Jamais de doublon, mais perte possible</td><td>Inacceptable en finance</td></tr>
<tr><td><b>At least once</b></td><td>Jamais de perte, doublons possibles</td><td>Le défaut réaliste — impose l'idempotence côté consommateur</td></tr>
<tr><td><b>Exactly once</b></td><td>Ni perte ni doublon</td><td>Possible dans Kafka (producteur idempotent + transactions) mais uniquement de bout en bout Kafka→Kafka, avec un coût en débit</td></tr>
</table>
<div class="box dire"><b>Ce qu'il faut absolument savoir dire</b>
« En pratique on conçoit pour de l'<i>at least once</i> et on rend le traitement <b>idempotent</b> : chaque message porte une clé d'idempotence, le consommateur enregistre ce qu'il a déjà traité et ignore les rejeux. L'exactly-once de bout en bout à travers plusieurs systèmes hétérogènes est un mythe — ce qu'on obtient, c'est un effet observable exactement une fois. Sur un débit bancaire, c'est ce qui empêche de débiter deux fois. »</div>

<h3>Commit des offsets</h3>
<p>Le moment du commit détermine la garantie :</p>
<ul>
<li>Commit <b>avant</b> traitement → at most once (si le consommateur meurt, le message est perdu).</li>
<li>Commit <b>après</b> traitement → at least once (si le consommateur meurt après le traitement mais avant le commit, le message est rejoué).</li>
<li>L'auto-commit périodique est le pire des deux : on ne sait plus où on en est. À désactiver dans tout traitement sérieux.</li>
</ul>

<h3>Dead letter queue</h3>
<p>Un message « poison » (mal formé, provoquant une exception) est redélivré indéfiniment : il bloque le traitement, sature les logs et fait croire à une panne générale. La DLQ le met de côté après N tentatives.</p>
<ul>
<li>Toujours définir un <code>maxReceiveCount</code> (SQS) ou l'équivalent.</li>
<li><b>Alerter sur la profondeur de la DLQ</b> — une DLQ que personne ne regarde est une perte de données silencieuse.</li>
<li>Prévoir la procédure de rejeu après correction, et conserver la cause de l'échec avec le message.</li>
</ul>

<h3>Exploitation : ce qu'on surveille</h3>
<table>
<tr><th>Métrique</th><th>Ce qu'elle dit</th></tr>
<tr><td><b>Consumer lag</b></td><td>Le retard en messages. LA métrique reine : si elle croît, le consommateur ne tient pas la charge</td></tr>
<tr><td>Profondeur de file / DLQ</td><td>Accumulation, messages en échec</td></tr>
<tr><td>Âge du plus vieux message</td><td>Complète le lag : 10 000 messages de retard sur un flux rapide n'est pas grave, 30 minutes d'âge oui</td></tr>
<tr><td>Rééquilibrages (rebalances)</td><td>Trop fréquents = consommateurs instables, traitement interrompu en boucle</td></tr>
<tr><td>ISR sous le minimum</td><td>Risque de perte : les écritures peuvent être refusées ou non répliquées</td></tr>
</table>
<div class="box piege"><b>Le rebalance storm</b> : si le traitement d'un lot dépasse <code>max.poll.interval.ms</code>, le broker considère le consommateur mort, déclenche un rééquilibrage, le travail est réattribué… et le nouveau consommateur met le même temps. Le groupe passe son temps à se rééquilibrer sans jamais avancer. Correctifs : réduire la taille des lots, augmenter le délai, ou sortir le traitement lourd de la boucle de poll.</div>

<h3>Back-pressure et absorption</h3>
<p>Une file qui grossit indéfiniment n'est pas une solution, c'est un report du problème : la mémoire, le disque ou la rétention finiront par lâcher, et la latence de bout en bout devient inacceptable bien avant.</p>
<ul>
<li>Dimensionner la rétention et surveiller l'espace disque des brokers.</li>
<li>Autoscaler les consommateurs sur le <b>lag</b> (KEDA le fait nativement) plutôt que sur le CPU.</li>
<li>Prévoir un mécanisme de rejet ou de dégradation en amont quand le tampon dépasse un seuil.</li>
</ul>

<h3>Schémas et compatibilité</h3>
<p>Un flux vit des années et ses consommateurs évoluent séparément : le contrat doit être versionné. <b>Schema Registry</b> (Avro, Protobuf, JSON Schema) valide et impose des règles de compatibilité :</p>
<ul>
<li><b>Backward</b> : les nouveaux consommateurs lisent les anciens messages (on peut ajouter un champ optionnel).</li>
<li><b>Forward</b> : les anciens consommateurs lisent les nouveaux messages.</li>
<li><b>Full</b> : les deux.</li>
</ul>
<p>Règle pratique : on n'enlève jamais un champ et on ne change jamais son type — on ajoute, on déprécie, on retire bien plus tard. C'est le pendant du pattern expand/contract des bases de données.</p>

<h3>Patterns d'architecture associés</h3>
<ul>
<li><b>Outbox</b> : pour éviter d'écrire en base ET publier un message dans deux transactions distinctes (l'une peut échouer), on écrit le message dans une table <i>outbox</i> DANS la transaction métier, et un processus séparé (ou du CDC) le publie. Réponse classique au problème de la double écriture.</li>
<li><b>CDC (change data capture)</b> : on lit le journal de transactions de la base (Debezium) pour produire un flux d'événements sans modifier l'application.</li>
<li><b>Event sourcing</b> : l'état est reconstruit en rejouant les événements. Très puissant pour l'auditabilité bancaire, très coûteux en complexité — à ne proposer que si le besoin d'audit ou de reconstitution le justifie.</li>
<li><b>Saga</b> : une transaction distribuée découpée en étapes locales avec des compensations, puisqu'il n'y a pas de commit à deux phases praticable entre microservices.</li>
</ul>

<h3>Équivalences cloud</h3>
<table>
<tr><th>Concept</th><th>AWS</th><th>Azure</th></tr>
<tr><td>File</td><td>SQS</td><td>Service Bus Queue</td></tr>
<tr><td>Pub/Sub</td><td>SNS</td><td>Service Bus Topic / Event Grid</td></tr>
<tr><td>Journal distribué</td><td>Kinesis / MSK</td><td>Event Hubs (compatible protocole Kafka)</td></tr>
<tr><td>DLQ</td><td>Native sur SQS</td><td>Native sur Service Bus</td></tr>
</table>
`
}]);
