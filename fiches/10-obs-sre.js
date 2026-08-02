window.FICHES = (window.FICHES || []).concat([{
id:"obs-sre",
titre:"Observabilité & SRE",
lead:"Ce qui prouve que tu as vraiment exploité de la production, et pas seulement construit des pipelines.",
html:`
<h3>Les trois piliers</h3>
<table>
<tr><th>Pilier</th><th>Répond à</th><th>Coût</th></tr>
<tr><td><b>Métriques</b></td><td>QUOI — agrégats numériques, tendances, alerting</td><td>Faible, mais cardinalité limitée</td></tr>
<tr><td><b>Logs</b></td><td>POURQUOI — événements détaillés horodatés</td><td>Élevé au volume</td></tr>
<tr><td><b>Traces</b></td><td>OÙ — parcours d'une requête entre services</td><td>Moyen, avec échantillonnage</td></tr>
</table>
<p>Ils se corrèlent par un <b>trace ID</b> propagé partout et injecté dans les logs. Sans cette corrélation, on a trois silos et pas de l'observabilité.</p>
<p><b>Monitoring vs observabilité</b> : le monitoring répond aux questions qu'on a prévues ; l'observabilité permet de répondre à celles qu'on n'avait <b>pas</b> anticipées, sans redéployer.</p>

<h3>Que mesurer</h3>
<ul>
<li><b>RED</b> (services) : <b>R</b>ate (req/s), <b>E</b>rrors (taux), <b>D</b>uration (latence en percentiles).</li>
<li><b>USE</b> (ressources) : <b>U</b>tilization, <b>S</b>aturation, <b>E</b>rrors — CPU, mémoire, disque, réseau, pools.</li>
<li><b>Four Golden Signals</b> (Google) : latence, trafic, erreurs, saturation.</li>
</ul>
<p><b>Percentiles, pas moyennes</b> : 99 requêtes à 50 ms et une à 10 s donnent une moyenne rassurante et un utilisateur furieux. Sur une page qui fait 20 appels, le p99 de chaque appel devient l'expérience normale.</p>
<div class="box piege">On ne <b>moyenne pas des percentiles</b> : ils ne sont pas additifs. Il faut agréger les buckets bruts de l'histogramme (<code>histogram_quantile()</code> sur la somme des buckets).</div>

<h3>Prometheus</h3>
<p>Modèle <b>pull</b> : Prometheus scrape des endpoints <code>/metrics</code> découverts par service discovery. Avantage : il sait qui ne répond plus (<code>up == 0</code>). Pour les jobs batch éphémères : Pushgateway, avec parcimonie.</p>
<table>
<tr><th>Type</th><th>Usage</th></tr>
<tr><td>Counter</td><td>Ne fait qu'augmenter (requêtes, erreurs) → toujours avec <code>rate()</code></td></tr>
<tr><td>Gauge</td><td>Monte et descend (mémoire, connexions actives)</td></tr>
<tr><td>Histogram</td><td>Buckets cumulatifs → quantiles agrégeables côté serveur</td></tr>
<tr><td>Summary</td><td>Quantiles calculés côté client → non agrégeables</td></tr>
</table>
<pre><code># Taux d'erreur 5xx sur 5 minutes
sum(rate(http_requests_total{status=~"5.."}[5m]))
  / sum(rate(http_requests_total[5m]))

# Latence p95
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

# Pods qui redémarrent
increase(kube_pod_container_status_restarts_total[15m]) > 0</code></pre>
<div class="box piege"><b>Explosion de cardinalité</b> : chaque combinaison de labels crée une série temporelle stockée en mémoire. Un ID utilisateur, un trace ID ou une URL avec paramètres en label = des millions de séries = TSDB à genoux. Les labels doivent être de cardinalité <b>bornée et connue</b> (service, méthode, code, région). Le détail unitaire appartient aux logs et aux traces.</div>

<h3>Logs</h3>
<ul>
<li><b>Structurés (JSON)</b> : indexables et requêtables par champ, sans regex fragile.</li>
<li>Champs indispensables : timestamp, level, service, version, environnement, <b>trace_id</b>, message.</li>
<li>Niveaux utilisés correctement : ERROR = quelque chose à corriger, WARN = anormal mais géré, INFO = événement métier, DEBUG = désactivé en prod.</li>
<li><b>Jamais</b> de données personnelles ou de secrets dans les logs — ils partent dans un SIEM et des sauvegardes longue durée (sujet RGPD).</li>
<li><b>Maîtriser le coût</b> : rétention différenciée (7 j chaud / 90 j froid / archive), échantillonnage des succès en gardant 100 % des erreurs, filtrage au niveau de l'agent.</li>
</ul>

<h3>Traces distribuées</h3>
<p><b>OpenTelemetry</b> est le standard : SDK d'instrumentation + collector + export vers le backend (Jaeger, Tempo, Datadog, App Insights). Propagation du contexte via l'en-tête W3C <code>traceparent</code>. Une trace se coupe au premier service non instrumenté — d'où l'importance de la couverture.</p>
<p>Échantillonnage : head-based (décision au départ, simple) vs tail-based (décision après la trace complète — permet de garder 100 % des erreurs et des requêtes lentes, plus coûteux).</p>

<h3>SLI / SLO / SLA / error budget</h3>
<table>
<tr><th>Terme</th><th>Définition</th></tr>
<tr><td><b>SLI</b></td><td>L'indicateur mesuré : % de requêtes réussies sous 300 ms</td></tr>
<tr><td><b>SLO</b></td><td>L'objectif interne : 99,9 % sur 28 jours glissants</td></tr>
<tr><td><b>SLA</b></td><td>L'engagement contractuel avec pénalités. Toujours <b>SLA &lt; SLO</b></td></tr>
<tr><td><b>Error budget</b></td><td>100 % − SLO. Avec 99,9 % : ~43 min/mois d'indisponibilité autorisée</td></tr>
</table>
<table>
<tr><th>SLO</th><th>Indispo / an</th><th>Indispo / mois</th></tr>
<tr><td>99 %</td><td>3,65 jours</td><td>7,2 h</td></tr>
<tr><td>99,9 %</td><td>8,76 h</td><td>43 min</td></tr>
<tr><td>99,95 %</td><td>4,38 h</td><td>22 min</td></tr>
<tr><td>99,99 %</td><td>52 min</td><td>4,3 min</td></tr>
</table>
<p><b>À savoir dire</b> : on ne peut pas être plus fiable que la somme de ses dépendances. Si les services managés sous-jacents sont à 99,9 %, promettre 99,99 % au métier est une fiction — sauf à payer du multi-région et de l'automatisation totale de bascule.</p>
<p><b>Construire un SLO</b> : parcours utilisateur critique → SLI mesuré <b>côté utilisateur</b> (au load balancer, pas dans l'app) → cible issue de l'historique et pas d'un chiffre rond → fenêtre glissante 28-30 jours → budget d'erreur → validation par le métier.</p>

<h3>Alerting</h3>
<ul>
<li>Alerter sur les <b>symptômes</b> (ce que l'utilisateur subit), pas sur les causes (CPU à 90 % ne dérange personne si le service répond).</li>
<li>Une alerte qui réveille doit cumuler : <b>impact réel</b> + <b>urgence</b> + <b>action possible</b> avec un runbook. Le reste va en ticket ou en dashboard.</li>
<li><b>Burn rate multi-fenêtres</b> plutôt qu'un seuil instantané : alerte rapide si on consomme le budget d'erreur 14× trop vite sur 1 h, alerte lente à 6× sur 6 h. Ça élimine l'essentiel des faux positifs.</li>
<li>Mesurer le taux de faux positifs et la charge d'astreinte : une équipe réveillée pour rien cesse de lire les alertes.</li>
</ul>

<h3>Gestion d'incident</h3>
<p>Rôles explicites : <b>Incident Commander</b> (décide, ne tape pas au clavier), Operations (investiguent), Communications (informe métier et direction), Scribe (horodate). Un canal unique, des points de situation réguliers.</p>
<p><b>Priorité : mitiger avant de comprendre.</b> Rollback, scale, bascule, circuit breaker — la compréhension vient après le rétablissement.</p>
<p><b>Post-mortem blameless</b> sous 48 h : chronologie, impact chiffré, causes systémiques, actions <b>assignées et datées</b>. Chercher un coupable garantit que les incidents suivants ne seront pas remontés.</p>

<h3>Concepts de résilience à maîtriser</h3>
<table>
<tr><th>Concept</th><th>Ce qu'il évite</th></tr>
<tr><td><b>Timeout</b></td><td>Attendre indéfiniment. Doit <b>décroître</b> en profondeur d'appel</td></tr>
<tr><td><b>Retry + backoff + jitter</b></td><td>Le retry storm. Le <b>jitter</b> est le détail que tout le monde oublie</td></tr>
<tr><td><b>Budget de retry</b></td><td>L'amplification : max ~10 % du trafic en retries</td></tr>
<tr><td><b>Circuit breaker</b></td><td>La cascade : échec rapide au lieu d'accumuler des threads en attente</td></tr>
<tr><td><b>Bulkhead</b></td><td>Qu'une dépendance lente consomme tout le pool de threads</td></tr>
<tr><td><b>Load shedding</b></td><td>Traiter mal 100 % plutôt que bien 80 %</td></tr>
<tr><td><b>Idempotence</b></td><td>Le double débit sur retry — <b>fondamental en finance</b></td></tr>
<tr><td><b>Dégradation gracieuse</b></td><td>Le tout ou rien : couper les fonctions secondaires, garder le cœur</td></tr>
</table>

<h3>Continuité et reprise</h3>
<table>
<tr><th>Stratégie DR</th><th>RTO</th><th>Coût</th></tr>
<tr><td>Backup & restore</td><td>Heures</td><td>Minimal</td></tr>
<tr><td>Pilot light</td><td>Dizaines de minutes</td><td>Faible</td></tr>
<tr><td>Warm standby</td><td>Minutes</td><td>Moyen</td></tr>
<tr><td>Multi-site actif/actif</td><td>Quasi nul</td><td>Maximal</td></tr>
</table>
<p><b>RTO</b> = en combien de temps on revient. <b>RPO</b> = combien de données on accepte de perdre. Les deux se négocient avec le métier, pas entre techniciens.</p>
<div class="box piege">Une sauvegarde jamais restaurée n'est pas une sauvegarde. Règle <b>3-2-1</b> (3 copies, 2 supports, 1 hors site) + 1 copie <b>immuable</b> contre les ransomwares, et un exercice de restauration <b>chronométré</b> au moins annuel — qui valide aussi la restauration des CLÉS de chiffrement et des dépendances (DNS, comptes de service).</div>

<h3>Toil et error budget policy</h3>
<p><b>Toil</b> : travail manuel, répétitif, automatisable, sans valeur durable, qui croît avec le service. Limite de référence : 50 % du temps. Au-delà, on gèle les nouveautés pour automatiser.</p>
<p><b>Error budget policy</b> : tant qu'il reste du budget, on déploie vite ; quand il est consommé, on gèle les features et on investit dans la fiabilité. C'est l'outil qui transforme un débat d'opinion en règle acceptée d'avance par le métier et la technique.</p>
`
}]);
