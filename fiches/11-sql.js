window.FICHES = (window.FICHES || []).concat([{
id:"sql",
titre:"SQL & bases de données",
lead:"En banque, la donnée est le sujet. Un DevOps qui ne sait pas lire un plan d'exécution plafonne vite.",
html:`
<h3>ACID</h3>
<table>
<tr><th>Lettre</th><th>Garantie</th></tr>
<tr><td><b>A</b>tomicité</td><td>Tout ou rien : la transaction s'applique entièrement ou pas du tout</td></tr>
<tr><td><b>C</b>ohérence</td><td>Les contraintes (clés, checks) restent respectées avant et après</td></tr>
<tr><td><b>I</b>solation</td><td>Les transactions concurrentes ne se voient pas à moitié</td></tr>
<tr><td><b>D</b>urabilité</td><td>Une fois commité, ça survit à un crash (WAL / journal)</td></tr>
</table>

<h3>Niveaux d'isolation</h3>
<table>
<tr><th>Niveau</th><th>Empêche</th><th>Reste possible</th></tr>
<tr><td>Read Uncommitted</td><td>—</td><td>Lecture sale (dirty read)</td></tr>
<tr><td>Read Committed</td><td>Lecture sale</td><td>Lecture non répétable</td></tr>
<tr><td>Repeatable Read</td><td>Lecture non répétable</td><td>Phantom read</td></tr>
<tr><td>Serializable</td><td>Tout</td><td>Coût en concurrence / conflits de sérialisation</td></tr>
</table>
<p>Défaut : Read Committed sur PostgreSQL et Oracle, Repeatable Read sur MySQL/InnoDB. Plus on monte, plus on verrouille : c'est un arbitrage cohérence / concurrence.</p>

<h3>Jointures</h3>
<table>
<tr><th>Type</th><th>Résultat</th></tr>
<tr><td>INNER JOIN</td><td>Uniquement les lignes ayant une correspondance des deux côtés</td></tr>
<tr><td>LEFT JOIN</td><td>Toutes les lignes de gauche, NULL à droite si pas de correspondance</td></tr>
<tr><td>RIGHT / FULL</td><td>Symétrique / union des deux</td></tr>
<tr><td>CROSS JOIN</td><td>Produit cartésien — presque toujours une erreur involontaire</td></tr>
</table>
<pre><code>-- Trouver les orphelins
SELECT c.id FROM clients c
LEFT JOIN commandes o ON o.client_id = c.id
WHERE o.id IS NULL;</code></pre>
<p><code>WHERE</code> filtre les LIGNES avant agrégation ; <code>HAVING</code> filtre les GROUPES après <code>GROUP BY</code> et peut porter sur un agrégat.</p>

<h3>Ordre d'exécution logique</h3>
<pre><code>FROM / JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT</code></pre>
<p>Ça explique pourquoi on ne peut pas utiliser un alias du SELECT dans le WHERE, mais qu'on le peut dans le ORDER BY.</p>

<h3>Index</h3>
<ul>
<li>Structure B-tree triée qui évite le parcours complet. Accélère la LECTURE, ralentit chaque INSERT/UPDATE/DELETE et occupe de l'espace.</li>
<li><b>Index composite</b> : l'ordre des colonnes compte (règle du préfixe le plus à gauche). Un index sur (a, b) sert pour <code>WHERE a=…</code> et <code>WHERE a=… AND b=…</code>, pas pour <code>WHERE b=…</code> seul.</li>
<li><b>Sélectivité</b> : indexer une colonne à 2 valeurs distinctes sur 10 M de lignes ne sert à rien.</li>
<li><b>Index couvrant</b> : contient toutes les colonnes de la requête → pas d'accès à la table (index-only scan).</li>
</ul>
<div class="box piege"><b>Ce qui casse un index</b> : une fonction appliquée à la colonne (<code>WHERE UPPER(nom) = 'X'</code>, <code>WHERE DATE(created_at) = …</code>), un <code>LIKE '%x'</code> avec joker en tête, une conversion implicite de type, un <code>OR</code> sur des colonnes différentes. Solution : index fonctionnel, ou réécrire (<code>created_at >= '2026-01-01' AND created_at < '2026-01-02'</code>).</div>

<h3>Diagnostiquer une requête lente</h3>
<pre><code>EXPLAIN ANALYZE SELECT …;    -- PostgreSQL : plan RÉEL avec les temps</code></pre>
<ol>
<li><b>Seq Scan</b> sur une grosse table filtrée → index manquant.</li>
<li>Estimation de lignes très différente du réel → <b>statistiques périmées</b> (<code>ANALYZE</code>).</li>
<li>Nested Loop sur un gros volume → mauvais ordre de jointure.</li>
<li>Tri sur disque (<code>external merge</code>) → <code>work_mem</code> insuffisant.</li>
<li>Volume ramené inutile : <code>SELECT *</code>, absence de pagination, N+1 côté ORM.</li>
<li>Sinon : contention, verrous, saturation I/O.</li>
</ol>

<h3>Verrous et deadlocks</h3>
<p>Un <b>deadlock</b> = deux transactions attendent chacune un verrou détenu par l'autre ; le SGBD tue une victime et l'application doit rejouer.</p>
<p><b>Prévention structurelle</b> : accéder aux ressources toujours dans le MÊME ordre, transactions courtes, éviter les traitements applicatifs à l'intérieur d'une transaction, indexer pour verrouiller des lignes plutôt que des plages.</p>
<p>Surveiller les sessions <code>idle in transaction</code> : une transaction ouverte et oubliée bloque le VACUUM et fait gonfler la base.</p>

<h3>MVCC (PostgreSQL)</h3>
<p>Un UPDATE n'écrase pas la ligne : il écrit une nouvelle version et marque l'ancienne comme morte. Les lecteurs ne bloquent pas les écrivains.</p>
<p><b>Contrepartie</b> : accumulation de tuples morts (bloat) → VACUUM / autovacuum indispensable, sous peine de tables gonflées, d'index inefficaces et, à l'extrême, d'un risque de wraparound des transaction IDs. C'est un sujet d'exploitation classique en production.</p>

<h3>Réplication et scaling</h3>
<table>
<tr><th>Mécanisme</th><th>Apporte</th><th>Limite</th></tr>
<tr><td>Réplique synchrone (RDS Multi-AZ, Always On)</td><td>Haute disponibilité, RPO ≈ 0</td><td>Latence d'écriture, pas de lecture sur le standby (RDS)</td></tr>
<tr><td>Réplique asynchrone (read replica)</td><td>Montée en charge en LECTURE</td><td><b>Lag</b> → lectures potentiellement périmées</td></tr>
<tr><td>Partitionnement (partitioning)</td><td>Tables énormes découpées par date/clé</td><td>Requêtes doivent filtrer sur la clé de partition</td></tr>
<tr><td>Sharding</td><td>Écriture horizontale</td><td>Jointures et transactions cross-shard très coûteuses</td></tr>
</table>
<div class="box piege"><b>Multi-AZ ≠ Read Replica</b> : le premier c'est de la DISPONIBILITÉ (bascule automatique, réplication synchrone), le second c'est de la PERFORMANCE en lecture (asynchrone, avec lag). Question fréquente et discriminante.</div>

<h3>Pool de connexions</h3>
<p>Une base sature souvent en connexions bien avant de saturer en CPU. Chaque connexion PostgreSQL = un processus. Avec 20 réplicas applicatifs × un pool de 20 = 400 connexions pour une base dimensionnée à 100.</p>
<p>Solutions : dimensionner le pool en fonction du nombre TOTAL d'instances, un proxy de connexions (PgBouncer, RDS Proxy), des timeouts d'inactivité, et surveiller les sessions <code>idle in transaction</code>.</p>

<h3>SQL vs NoSQL</h3>
<p>On choisit sur le <b>modèle d'accès</b>, pas sur la mode :</p>
<ul>
<li><b>Relationnel</b> : relations riches, requêtes ad hoc, intégrité transactionnelle, reporting. Domine en banque — la cohérence et l'auditabilité priment.</li>
<li><b>Clé-valeur / document</b> (DynamoDB, Cosmos) : accès connus à l'avance, par clé, échelle horizontale massive, latence constante.</li>
<li><b>Colonne</b> (Cassandra) : écriture massive, séries temporelles.</li>
<li><b>Graphe</b> (Neo4j) : relations profondes (détection de fraude, KYC).</li>
</ul>

<h3>CAP et PACELC</h3>
<p>En cas de <b>Partition</b> réseau (inévitable en distribué), il faut choisir : <b>C</b>ohérence (refuser de répondre du côté minoritaire) ou <b>A</b>vailability (répondre avec des données potentiellement périmées). Pour un solde de compte : CP. Pour un catalogue produit : AP.</p>
<p><b>PACELC</b> complète : en cas de Partition → A ou C ; <b>Else</b> (fonctionnement normal) → Latence ou Cohérence. C'est plus honnête, parce que l'arbitrage existe aussi hors panne.</p>

<h3>Migrations de schéma en production</h3>
<ul>
<li>Toujours <b>rétrocompatibles</b> (expand/contract) — voir la fiche CI/CD.</li>
<li>Versionnées et rejouables (Flyway, Liquibase, migrations applicatives), jamais de DDL manuel.</li>
<li>Attention aux verrous : ajouter une colonne NOT NULL avec valeur par défaut peut réécrire toute la table sur les vieilles versions. Sur PostgreSQL récent, c'est instantané — savoir vérifier la version compte.</li>
<li>Créer les index en <code>CONCURRENTLY</code> pour ne pas bloquer les écritures.</li>
<li>Sur les grosses tables : migrer par lots avec pauses, pas en une transaction géante.</li>
</ul>
`
}]);
