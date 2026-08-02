window.FICHES = (window.FICHES || []).concat([{
id:"linux",
titre:"Linux & Bash",
lead:"Le socle. Un DevOps qui bafouille sur Linux perd la confiance des seniors en 3 minutes.",
html:`
<h3>Permissions</h3>
<p>Format <code>drwxr-xr-x</code> : 1er caractère = TYPE (<code>d</code> répertoire, <code>-</code> fichier, <code>l</code> lien), puis 3 triplets rwx pour propriétaire / groupe / autres.</p>
<table>
<tr><th>Octal</th><th>Droits</th><th>Usage typique</th></tr>
<tr><td>400</td><td>r--------</td><td>Clé privée .pem non modifiable</td></tr>
<tr><td>600</td><td>rw-------</td><td>Clé SSH, fichier de secrets</td></tr>
<tr><td>644</td><td>rw-r--r--</td><td>Fichier de config lisible</td></tr>
<tr><td>755</td><td>rwxr-xr-x</td><td>Script exécutable, répertoire</td></tr>
</table>
<p>Sur un répertoire : <code>x</code> = droit de TRAVERSER, <code>r</code> = droit de LISTER. Un répertoire en 644 est illisible en pratique.</p>
<p>Bits spéciaux : <b>setuid</b> (4xxx, s'exécute avec les droits du propriétaire — <code>passwd</code>), <b>setgid</b> (2xxx, hérite du groupe), <b>sticky bit</b> (1xxx, seul le propriétaire peut supprimer — <code>/tmp</code>).</p>

<h3>Processus et signaux</h3>
<table>
<tr><th>Signal</th><th>N°</th><th>Effet</th></tr>
<tr><td>SIGHUP</td><td>1</td><td>Rechargement de config (convention)</td></tr>
<tr><td>SIGINT</td><td>2</td><td>Ctrl+C, interceptable</td></tr>
<tr><td>SIGTERM</td><td>15</td><td>Arrêt propre demandé, interceptable — le défaut de <code>kill</code></td></tr>
<tr><td>SIGKILL</td><td>9</td><td>Tué par le noyau, NON interceptable</td></tr>
<tr><td>SIGSTOP</td><td>19</td><td>Suspend, non interceptable</td></tr>
</table>
<p>Exit code d'un process tué par signal = <b>128 + n°</b>. Donc <b>137</b> = SIGKILL (souvent OOM), <b>143</b> = SIGTERM. À connaître par cœur : ça tombe sur Kubernetes.</p>
<p>États : R (running), S (sleep interruptible), <b>D</b> (uninterruptible, attente I/O — compte dans la load), Z (zombie), T (stoppé).</p>

<h3>Diagnostic — la séquence à réciter</h3>
<pre><code>uptime              # load 1/5/15 min — comparer au nb de cœurs (nproc)
top / htop          # qui consomme, %CPU, %MEM, %wa
free -m             # mémoire + SWAP (swap actif = mort lente)
vmstat 1 5          # si/so (swap in/out), wa (iowait), r (run queue)
iostat -x 1         # %util par device, await
df -h / df -i       # espace ET inodes
ss -tulnp           # ports en écoute + process
dmesg -T | tail     # OOM killer, erreurs matérielles, réseau
journalctl -u svc -f --since "10 min ago"</code></pre>

<div class="box piege"><b>Pièges classiques</b>
<ul>
<li><b>Load élevée mais CPU bas</b> = attente I/O (état D), pas un problème de CPU.</li>
<li><b>df plein mais du ne trouve rien</b> = fichier supprimé encore ouvert (<code>lsof | grep deleted</code>) ou inodes épuisés (<code>df -i</code>).</li>
<li><b>« Too many open files »</b> = <code>LimitNOFILE</code> dans l'unité systemd, pas <code>ulimit</code> dans le shell. Et chercher la fuite d'abord.</li>
<li><b>Le swap qui s'active</b> dégrade tout : mieux vaut souvent un OOM franc qu'un serveur qui rame une heure.</li>
</ul></div>

<h3>Bash — les réflexes de production</h3>
<pre><code>#!/usr/bin/env bash
set -euo pipefail          # échec immédiat, var non définie = erreur, échec dans un pipe
IFS=$'\\n\\t'               # évite le découpage sur les espaces
trap 'echo "erreur ligne $LINENO" >&2' ERR
trap 'rm -f "$TMP"' EXIT   # nettoyage garanti

TMP=$(mktemp)
: "\${API_URL:?API_URL est obligatoire}"   # échoue avec un message clair</code></pre>
<ul>
<li><code>"$@"</code> et jamais <code>$*</code> pour relayer des arguments.</li>
<li>Toujours guillemeter les variables : <code>"$var"</code>. Un chemin avec espace casse tout sinon.</li>
<li><code>$(cmd)</code> plutôt que les backticks (imbricable, lisible).</li>
<li><code>[[ ]]</code> plutôt que <code>[ ]</code> en bash (pas de découpage de mots, regex avec <code>=~</code>).</li>
<li>Vérifier avec <b>shellcheck</b> en CI — mentionne-le, c'est un signal de maturité.</li>
</ul>

<h3>Texte : les 5 outils qui suffisent</h3>
<pre><code>grep -rniE "pattern" .          # récursif, insensible, numéros de ligne, regex étendue
grep -v / -c / -A3 -B3          # inverse / compte / contexte
awk -F: '{print $1, $3}'        # colonnes, séparateur custom
awk '$3 > 100 {sum+=$3} END{print sum}'
sed -i 's/ancien/nouveau/g' f   # remplacement en place
sort -k2 -rn | uniq -c | head   # tri numérique inverse + comptage
cut -d: -f1,3 /etc/passwd
xargs -r -n1 -P4 cmd            # parallélisation, -r = rien si entrée vide
find . -type f -mtime +30 -name "*.log" -delete</code></pre>
<p><b>À retenir</b> : <code>uniq</code> ne dédoublonne que des lignes ADJACENTES → toujours <code>sort | uniq</code>.</p>

<h3>systemd</h3>
<pre><code>systemctl status|start|stop|restart|reload mon.service
systemctl enable --now mon.service     # au boot + tout de suite
systemctl list-units --failed
systemctl daemon-reload                # après modif d'un fichier .service
journalctl -u mon.service -f -n 100 --since "1 hour ago" -p err</code></pre>
<pre><code>[Unit]
Description=Mon API
After=network-online.target

[Service]
Type=simple
User=app
ExecStart=/opt/app/bin/api
Restart=on-failure
RestartSec=5
LimitNOFILE=65536
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target</code></pre>
<p><code>enable</code> ≠ <code>start</code> : <code>enable</code> crée le lien pour le boot, il ne lance rien maintenant (d'où <code>--now</code>).</p>

<h3>Namespaces & cgroups (le socle des conteneurs)</h3>
<table>
<tr><th>Mécanisme</th><th>Rôle</th><th>Exemples</th></tr>
<tr><td>Namespaces</td><td>Isolent ce que le process VOIT</td><td>pid, net, mnt, uts, ipc, user, cgroup</td></tr>
<tr><td>cgroups</td><td>Limitent ce qu'il CONSOMME</td><td>cpu, memory, io, pids</td></tr>
<tr><td>capabilities</td><td>Découpent les privilèges root</td><td>NET_ADMIN, SYS_TIME…</td></tr>
</table>
<p>Un conteneur = un processus normal + namespaces + cgroups + un rootfs overlay. Savoir dire ça posément impressionne toujours.</p>

<div class="box dire"><b>Formulation qui marque des points</b>
« Avant de regarder l'application, je valide le système : load, mémoire et swap, iowait, espace disque et inodes, ports en écoute, et <code>dmesg</code> pour un éventuel OOM. Ça élimine 80 % des fausses pistes en deux minutes. »</div>
`
}]);
