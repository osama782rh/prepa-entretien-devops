window.FICHES = (window.FICHES || []).concat([{
id:"reseau",
titre:"Réseau (TCP/IP, DNS, TLS, HTTP)",
lead:"Le domaine où les seniors coincent le plus de candidats, parce que tout le monde le survole.",
html:`
<h3>Adressage et masques — à savoir de tête</h3>
<table>
<tr><th>CIDR</th><th>Adresses</th><th>Utilisables (AWS)</th><th>Usage</th></tr>
<tr><td>/16</td><td>65 536</td><td>—</td><td>Un VPC / VNet entier</td></tr>
<tr><td>/24</td><td>256</td><td>251</td><td>Un subnet standard</td></tr>
<tr><td>/26</td><td>64</td><td>59</td><td>Petit subnet (endpoints, bastion)</td></tr>
<tr><td>/28</td><td>16</td><td>11</td><td>Minimum AWS</td></tr>
<tr><td>/32</td><td>1</td><td>—</td><td>Une IP unique (règles de firewall)</td></tr>
</table>
<p>Calcul rapide : <b>2^(32 − masque)</b>. AWS réserve 5 adresses par subnet (réseau, routeur, DNS, réservé, broadcast), Azure en réserve 5 aussi.</p>
<p>Plages privées RFC1918 : <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code>, <code>192.168.0.0/16</code>. Ne jamais choisir un plan qui chevauche celui de l'on-premise : le peering et le VPN deviennent impossibles.</p>

<h3>TCP vs UDP</h3>
<table>
<tr><th></th><th>TCP</th><th>UDP</th></tr>
<tr><td>Connexion</td><td>Handshake 3 temps (SYN, SYN-ACK, ACK)</td><td>Aucune</td></tr>
<tr><td>Fiabilité</td><td>Retransmission, ordre garanti</td><td>Aucune garantie</td></tr>
<tr><td>Contrôle</td><td>Congestion + flux</td><td>Non</td></tr>
<tr><td>Usage</td><td>HTTP, SSH, bases de données</td><td>DNS, VoIP, streaming, métriques, QUIC</td></tr>
</table>
<p>Fermeture TCP : FIN / ACK / FIN / ACK, puis <b>TIME_WAIT</b> (2×MSL) côté initiateur. Beaucoup de TIME_WAIT = normal sur un proxy ; beaucoup de <b>CLOSE_WAIT</b> = <b>bug applicatif</b>, l'application ne ferme pas ses sockets.</p>

<h3>Diagnostic réseau : la logique DROP vs REJECT</h3>
<table>
<tr><th>Symptôme client</th><th>Cause probable</th></tr>
<tr><td>Timeout (ça pend)</td><td>Paquet DROPPÉ : SG/NSG/NACL, route absente, mauvaise IP</td></tr>
<tr><td>Connection refused (immédiat)</td><td>Le paquet arrive, mais rien n'écoute sur le port</td></tr>
<tr><td>Erreur DNS / nom inconnu</td><td>Résolution, pas réseau</td></tr>
<tr><td>Petites requêtes OK, gros transferts figés</td><td>MTU / PMTUD cassé (ICMP bloqué)</td></tr>
<tr><td>Intermittent et erratique</td><td>Conntrack saturé, un backend sur N en panne, DNS</td></tr>
</table>
<pre><code>dig +short api.exemple.com          # résolution seule
dig @8.8.8.8 api.exemple.com        # tester un autre resolver
nc -zv host 443                     # le port répond-il ?
curl -v https://host/path           # DNS + TCP + TLS + HTTP, avec les temps
curl -w "%{time_namelookup} %{time_connect} %{time_appconnect} %{time_total}\\n" -o /dev/null -s URL
openssl s_client -connect host:443 -servername host -showcerts
traceroute / mtr host               # où ça s'arrête
tcpdump -i any -n port 443 -c 50    # le SYN arrive-t-il ? le SYN-ACK repart-il ?
ip route get 10.0.2.15              # quelle route sera empruntée</code></pre>

<h3>DNS</h3>
<table>
<tr><th>Type</th><th>Rôle</th></tr>
<tr><td>A / AAAA</td><td>Nom → IPv4 / IPv6</td></tr>
<tr><td>CNAME</td><td>Alias vers un autre NOM. <b>Interdit à l'apex</b> du domaine</td></tr>
<tr><td>ALIAS / A-alias</td><td>Équivalent CNAME utilisable à l'apex (Route 53, Azure DNS)</td></tr>
<tr><td>MX / TXT / NS / SOA</td><td>Mail / vérifications et SPF-DKIM / serveurs de noms / autorité</td></tr>
<tr><td>SRV</td><td>Service + port (utilisé par K8s pour les headless services)</td></tr>
</table>
<p><b>TTL</b> : le nerf de la guerre en bascule. On abaisse le TTL (60 s) plusieurs heures AVANT une migration, sinon les caches gardent l'ancienne IP pendant des heures. Attention : certains resolvers ignorent les TTL très courts.</p>

<h3>TLS</h3>
<ol>
<li>ClientHello : versions et suites supportées, SNI (quel nom d'hôte on demande).</li>
<li>ServerHello + certificat (+ chaîne d'intermédiaires).</li>
<li>Le client valide : chaîne jusqu'à une CA de confiance, date de validité, nom qui correspond, révocation.</li>
<li>Échange de clés ECDHE → dérivation d'une <b>clé de session symétrique</b> (forward secrecy).</li>
<li>Tout le trafic est ensuite chiffré en symétrique (AES-GCM).</li>
</ol>
<div class="box piege"><b>Erreurs de certificat les plus fréquentes en entreprise</b>
<ul>
<li><b>Chaîne incomplète</b> : le navigateur compense, pas un client Java/Go/curl. Vérifier avec <code>openssl s_client -showcerts</code>.</li>
<li><b>CA d'entreprise absente</b> du truststore du conteneur — classique derrière un proxy d'inspection TLS bancaire. Il faut injecter le bundle CA dans l'image.</li>
<li><b>SNI manquant</b> sur un hôte mutualisé → on tombe sur le mauvais certificat.</li>
<li><b>Expiration</b> : la cause d'incident la plus bête et la plus fréquente. Il faut une alerte à J-30 et de l'automatisation (ACME, Key Vault, ACM).</li>
</ul></div>

<h3>HTTP — codes à connaître</h3>
<table>
<tr><th>Code</th><th>Sens</th><th>Ce que ça dit en prod</th></tr>
<tr><td>301 / 302</td><td>Redirection permanente / temporaire</td><td>301 est mis en cache par le navigateur — attention</td></tr>
<tr><td>400 / 422</td><td>Requête invalide</td><td>Problème client, pas serveur</td></tr>
<tr><td>401 / 403</td><td>Non authentifié / non autorisé</td><td>401 = qui es-tu, 403 = tu n'as pas le droit</td></tr>
<tr><td>429</td><td>Trop de requêtes</td><td>Throttling : respecter <code>Retry-After</code></td></tr>
<tr><td>499</td><td>Client parti (nginx)</td><td>Le client a abandonné : ton backend est trop lent</td></tr>
<tr><td>500</td><td>Erreur applicative</td><td>Bug côté code</td></tr>
<tr><td>502</td><td>Bad gateway</td><td>Le backend a répondu n'importe quoi ou est mort</td></tr>
<tr><td>503</td><td>Service indisponible</td><td>Aucun backend sain / surcharge</td></tr>
<tr><td>504</td><td>Gateway timeout</td><td>Le backend est trop lent, le proxy a coupé</td></tr>
</table>
<p><b>502 vs 503 vs 504</b> : question classique. 502 = réponse invalide du backend, 503 = pas de backend disponible, 504 = backend trop lent. Savoir les distinguer oriente immédiatement le diagnostic.</p>

<h3>Load balancing</h3>
<table>
<tr><th></th><th>L4</th><th>L7</th></tr>
<tr><td>Voit</td><td>IP + port</td><td>Host, path, headers, cookies</td></tr>
<tr><td>Permet</td><td>TCP/UDP, TLS passthrough, IP source préservée</td><td>Routage par URL, terminaison TLS, WAF, sticky session, réécriture</td></tr>
<tr><td>AWS / Azure</td><td>NLB / Azure Load Balancer</td><td>ALB / Application Gateway</td></tr>
</table>
<p><b>Health checks</b> : un LB ne route que vers les cibles saines. Une santé mal configurée (endpoint qui teste la base alors qu'on veut juste savoir si le process vit) provoque des retraits en cascade. Séparer « liveness » et « readiness » vaut aussi pour les LB.</p>

<h3>Proxy vs reverse proxy vs NAT</h3>
<ul>
<li><b>Proxy (forward)</b> : côté client, sortant. Filtrage, cache, inspection TLS. Obligatoire en banque — pense à <code>HTTP_PROXY</code>/<code>NO_PROXY</code> dans les conteneurs.</li>
<li><b>Reverse proxy</b> : côté serveur, entrant. nginx, ALB, App Gateway, Ingress.</li>
<li><b>NAT</b> : réécriture d'adresse. En sortie de VPC, l'IP source devient celle du NAT Gateway → c'est CETTE IP que le partenaire doit autoriser.</li>
</ul>

<div class="box dire"><b>La question « que se passe-t-il quand je tape une URL »</b>
Réponds en 8 étapes : résolution DNS (caches successifs) → connexion TCP → handshake TLS → requête HTTP au reverse proxy → sélection d'un backend sain → traitement applicatif (cache, base) → réponse (compression, cache CDN) → rendu et appels secondaires. Puis propose d'aller plus loin sur l'étape qui les intéresse. C'est LA question qui permet de démontrer toute ta culture infra en 2 minutes.</div>
`
}]);
