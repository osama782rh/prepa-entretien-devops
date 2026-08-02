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

<h3>SSH — au-delà du « je me connecte »</h3>
<pre><code>ssh-keygen -t ed25519 -C "osama@poste"     # ed25519, pas RSA 2048
ssh -i ~/.ssh/cle.pem -o IdentitiesOnly=yes user@hote
ssh -J bastion user@hote-prive              # rebond (ProxyJump)
ssh -L 5432:db-interne:5432 user@bastion    # tunnel LOCAL : port local → distant
ssh -R 8080:localhost:3000 user@serveur     # tunnel INVERSE
ssh-add -l                                   # clés chargées dans l'agent
ssh -vvv user@hote                           # debug d'authentification</code></pre>
<p><code>~/.ssh/config</code> évite de retaper les options et documente le parc :</p>
<pre><code>Host prod-*
  User deploy
  IdentityFile ~/.ssh/prod_ed25519
  IdentitiesOnly yes
  ProxyJump bastion.exemple.com
  ServerAliveInterval 60</code></pre>
<ul>
<li><b>Permissions</b> : <code>~/.ssh</code> en 700, clé privée en 600 (ou 400), <code>authorized_keys</code> en 600. SSH REFUSE une clé trop permissive — cause d'échec très fréquente.</li>
<li><b>Durcissement de sshd</b> : <code>PermitRootLogin no</code>, <code>PasswordAuthentication no</code>, <code>AllowGroups</code>, MFA. Toujours garder une session ouverte en testant une modification de sshd.</li>
<li><b>En production cloud</b>, la bonne réponse n'est plus SSH direct mais SSM Session Manager (AWS) ou Azure Bastion : pas de port 22 ouvert, pas de clé à gérer, accès contrôlé par IAM et session enregistrée.</li>
</ul>

<h3>Utilisateurs, groupes et élévation</h3>
<pre><code>id osama                        # uid, gid, groupes
usermod -aG docker osama        # -a INDISPENSABLE, sinon on REMPLACE les groupes
getent group docker
sudo -l                         # ce que j'ai le droit de faire
visudo                          # éditer sudoers avec validation syntaxique</code></pre>
<table>
<tr><th></th><th>Effet</th></tr>
<tr><td><code>su</code></td><td>Change d'utilisateur en gardant l'environnement courant</td></tr>
<tr><td><code>su -</code></td><td>Login shell complet (PATH, HOME, profil de la cible)</td></tr>
<tr><td><code>sudo</code></td><td>Élévation par commande, <b>journalisée</b>, politique fine — le seul acceptable en production auditée</td></tr>
</table>
<div class="box piege">Ajouter un utilisateur au groupe <code>docker</code> équivaut à lui donner root sur la machine : il peut lancer un conteneur privilégié qui monte <code>/</code>. Ce n'est pas une permission anodine, et un auditeur le sait.</div>

<h3>Disques, systèmes de fichiers, montages</h3>
<pre><code>lsblk -f                    # arborescence des disques + systèmes de fichiers + UUID
blkid                       # UUID à utiliser dans fstab
mount | column -t
findmnt /var
mkfs.ext4 /dev/sdb1
mount -o noatime /dev/sdb1 /data
df -h / df -i               # espace ET inodes
du -ah /var | sort -rh | head</code></pre>
<pre><code># /etc/fstab — TOUJOURS par UUID, jamais par /dev/sdX (l'ordre change au reboot)
UUID=1234-abcd  /data  ext4  defaults,noatime,nofail  0  2</code></pre>
<div class="box piege"><b>L'option <code>nofail</code></b> : sans elle, une entrée fstab invalide empêche la machine de démarrer et t'oblige à passer par la console de secours. Après toute modification de fstab, valider avec <code>mount -a</code> AVANT de redémarrer.</div>
<p><b>LVM</b> en trois mots : disques physiques (PV) → regroupés en volume group (VG) → découpés en volumes logiques (LV) redimensionnables à chaud. C'est ce qui permet d'agrandir <code>/var</code> sans réinstaller : <code>lvextend -L +20G /dev/vg0/var &amp;&amp; resize2fs /dev/vg0/var</code>.</p>

<h3>Paquets et démarrage</h3>
<pre><code># Debian/Ubuntu                    # RHEL/Rocky
apt update && apt install -y x      dnf install -y x
apt list --installed | grep x       rpm -qa | grep x
dpkg -S /usr/bin/curl               rpm -qf /usr/bin/curl   # quel paquet fournit ce fichier</code></pre>
<p><b>Séquence de démarrage</b> : firmware → bootloader (GRUB) → noyau + initramfs → <code>systemd</code> (PID 1) → target (<code>multi-user.target</code>, <code>graphical.target</code>). Diagnostic : <code>systemd-analyze blame</code> pour voir ce qui ralentit le boot, <code>journalctl -b -1</code> pour lire les logs du démarrage précédent après un crash.</p>

<h3>Planification : cron ou timer systemd ?</h3>
<pre><code># crontab -e         min heure jour mois jourSemaine
*/15 * * * *  /opt/scripts/collecte.sh >> /var/log/collecte.log 2>&1</code></pre>
<table>
<tr><th></th><th>cron</th><th>timer systemd</th></tr>
<tr><td>Journalisation</td><td>À gérer soi-même</td><td>Native dans journald</td></tr>
<tr><td>Rattrapage après extinction</td><td>Non</td><td>Oui (<code>Persistent=true</code>)</td></tr>
<tr><td>Dépendances, limites de ressources</td><td>Non</td><td>Oui (c'est une unité)</td></tr>
<tr><td>Chevauchement d'exécutions</td><td>Possible</td><td>Empêché par défaut</td></tr>
</table>
<div class="box piege"><b>Cause n°1 d'un cron qui échoue alors qu'il marche à la main</b> : l'environnement minimal — PATH réduit, pas de <code>.bashrc</code>, HOME différent. Réflexes : chemins absolus partout, variables déclarées explicitement en tête de crontab, et redirection de stdout ET stderr vers un fichier pour pouvoir lire l'erreur.</div>

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
