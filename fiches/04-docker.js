window.FICHES = (window.FICHES || []).concat([{
id:"docker",
titre:"Docker & conteneurs",
lead:"Savoir expliquer ce qu'est RÉELLEMENT un conteneur vaut plus que connaître 40 options de la CLI.",
html:`
<h3>Ce qu'est un conteneur, précisément</h3>
<p>Un processus Linux ordinaire, isolé par trois mécanismes du noyau :</p>
<table>
<tr><th>Mécanisme</th><th>Rôle</th><th>Exemples</th></tr>
<tr><td><b>namespaces</b></td><td>Isolent ce que le process VOIT</td><td>pid, net, mnt, uts, ipc, user, cgroup</td></tr>
<tr><td><b>cgroups</b></td><td>Limitent ce qu'il CONSOMME</td><td>cpu, memory, io, pids</td></tr>
<tr><td><b>capabilities / seccomp / LSM</b></td><td>Restreignent ce qu'il PEUT FAIRE</td><td>drop NET_ADMIN, filtrer les appels système</td></tr>
</table>
<p>Plus un système de fichiers en couches (OverlayFS). <b>Pas de machine virtuelle, pas d'hyperviseur, pas de noyau invité</b> — d'où le démarrage en millisecondes, mais aussi une isolation plus faible qu'une VM et une dépendance au noyau de l'hôte.</p>

<h3>Image vs conteneur</h3>
<p>L'<b>image</b> est un modèle immuable en lecture seule : un empilement de couches identifiées par leur digest, plus un manifeste. Le <b>conteneur</b> est une instance en exécution de cette image, avec une couche d'écriture éphémère au-dessus. Analogie : classe / objet.</p>
<p>Écrire dans un fichier d'une couche basse déclenche un <b>copy-up</b> : le fichier ENTIER est copié dans la couche d'écriture. D'où la lenteur des écritures sur de gros fichiers, et la règle : les données vont dans un volume, pas dans le conteneur.</p>
<p>Un <b>manifest list / image index</b> référence plusieurs manifestes, un par couple OS/architecture. C'est ce qui permet à <code>FROM alpine</code> de fonctionner sur amd64 et arm64 — et son absence explique qu'une image buildée sur un Mac M-series casse sur des nœuds x86.</p>

<h3>Dockerfile de production</h3>
<pre><code># syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./              # AVANT le code : cache des dépendances
RUN npm ci --omit=dev
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs20-debian12 AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER 10001
EXPOSE 3000
ENTRYPOINT ["/nodejs/bin/node", "dist/server.js"]</code></pre>
<ul>
<li><b>Multi-stage</b> : on compile dans une image lourde, on livre une image minimale sans compilateur ni sources.</li>
<li><b>Ordre des couches</b> : du moins changeant au plus changeant, pour maximiser le cache.</li>
<li><b>Nettoyer dans la MÊME couche</b> : <code>RUN apt-get update &amp;&amp; apt-get install -y x &amp;&amp; rm -rf /var/lib/apt/lists/*</code>. Supprimer dans une couche ultérieure n'enlève rien au poids.</li>
<li><b>Forme exec</b> (JSON) pour ENTRYPOINT/CMD : la forme shell met <code>/bin/sh</code> en PID 1, qui ne relaie pas SIGTERM.</li>
<li><b>Tag immuable</b> : version sémantique ou SHA de commit. Jamais <code>latest</code> en production.</li>
</ul>

<h3>Les instructions qui piègent</h3>
<table>
<tr><th>Instruction</th><th>Ce qu'elle fait vraiment</th></tr>
<tr><td><code>EXPOSE 8080</code></td><td><b>Rien</b> de fonctionnel : simple métadonnée. Publier exige <code>-p</code> au run ou un Service côté K8s</td></tr>
<tr><td><code>ENTRYPOINT</code></td><td>L'exécutable fixe, non remplacé par les arguments de <code>docker run</code></td></tr>
<tr><td><code>CMD</code></td><td>Les arguments par défaut, remplaçables</td></tr>
<tr><td><code>ARG</code></td><td>Variable de BUILD — reste visible dans <code>docker history</code>. Jamais de secret</td></tr>
<tr><td><code>ENV</code></td><td>Variable persistée dans l'image et l'exécution</td></tr>
<tr><td><code>ADD</code></td><td>Comme COPY mais décompresse et télécharge des URL — préférer <code>COPY</code>, plus prévisible</td></tr>
<tr><td><code>HEALTHCHECK</code></td><td>Utilisé par Docker/Compose, <b>ignoré par Kubernetes</b> (qui veut des probes)</td></tr>
</table>

<h3>Le PID 1 et les signaux</h3>
<p>Deux problèmes classiques quand le processus principal est un shell :</p>
<ul>
<li>Il ne relaie pas SIGTERM → <code>docker stop</code> attend 10 s puis SIGKILL. En Kubernetes, cela donne des 502 pendant les déploiements.</li>
<li>Il ne récolte pas les processus enfants terminés → accumulation de <b>zombies</b>.</li>
</ul>
<p>Solutions : forme exec, un init léger (<code>tini</code>, <code>docker run --init</code>), ou un gestionnaire de signaux dans l'application.</p>

<h3>Durcissement</h3>
<pre><code>docker run --read-only \\
  --cap-drop ALL --security-opt no-new-privileges \\
  --user 10001:10001 \\
  --memory 512m --cpus 1 \\
  --tmpfs /tmp \\
  --pids-limit 200 \\
  monimage:1.4.2</code></pre>
<p>Équivalent Kubernetes dans <code>securityContext</code> : <code>runAsNonRoot: true</code>, <code>readOnlyRootFilesystem: true</code>, <code>allowPrivilegeEscalation: false</code>, <code>capabilities.drop: [ALL]</code>, <code>seccompProfile: RuntimeDefault</code>.</p>
<div class="box piege"><b>Le socket Docker monté dans un conteneur</b>
<code>-v /var/run/docker.sock:/var/run/docker.sock</code> donne le contrôle du daemon : on peut lancer un conteneur privilégié qui monte <code>/</code> de l'hôte. C'est un <b>root sur le nœud</b>, donc sur tous les conteneurs voisins. Pour construire des images sans daemon : Kaniko, Buildah, ou BuildKit en mode rootless.</div>

<h3>Réseau et volumes</h3>
<ul>
<li><b>Réseau bridge personnalisé</b> (<code>docker network create</code>) : indispensable pour la résolution DNS par nom de conteneur, absente du bridge par défaut.</li>
<li><b>Volume nommé</b> vs <b>bind mount</b> : le volume est géré par Docker, portable, sauvegardable ; le bind mount dépend de l'arborescence de l'hôte et de ses permissions. En production : volume ou stockage externe.</li>
<li>Les données écrites hors volume disparaissent avec le conteneur — un conteneur doit être <b>stateless par défaut</b>.</li>
</ul>

<h3>BuildKit</h3>
<pre><code>DOCKER_BUILDKIT=1 docker build \\
  --secret id=npmrc,src=$HOME/.npmrc \\
  --cache-from type=registry,ref=monregistry/app:cache \\
  --cache-to   type=registry,ref=monregistry/app:cache,mode=max \\
  --platform linux/amd64,linux/arm64 \\
  -t monregistry/app:1.4.2 --push .</code></pre>
<p>Apports : parallélisation du graphe de build, cache exportable et partagé entre machines (crucial pour des runners CI éphémères), montage de secrets (<code>--mount=type=secret</code>) sans les laisser dans les couches, cache de dépendances (<code>--mount=type=cache</code>), builds multi-plateformes.</p>

<h3>Disque qui se remplit</h3>
<pre><code>docker system df -v              # ventilation images / conteneurs / volumes / cache
docker system prune -a --volumes # ATTENTION : supprime les volumes non utilisés
docker image prune -f</code></pre>
<p>Le coupable le plus fréquent : les <b>logs json-file sans rotation</b>. À configurer dans <code>/etc/docker/daemon.json</code> : <code>"log-opts": {"max-size":"10m","max-file":"3"}</code>. Côté Kubernetes, c'est la garbage collection du kubelet et les logs applicatifs écrits dans le conteneur au lieu de stdout.</p>

<h3>« Ça marche sur mon poste »</h3>
<div class="box piege">Les causes structurelles à citer :
<ol>
<li><b>Architecture</b> différente (build ARM sur Mac vs nœuds amd64) → <code>buildx --platform</code>.</li>
<li><b>Config et secrets</b> présents en local via un <code>.env</code> absent en cluster.</li>
<li><b>DNS et proxy</b> d'entreprise obligatoire, CA interne absente de l'image.</li>
<li><b>Contraintes de sécurité</b> en cluster : non-root imposé, filesystem read-only, capabilities retirées.</li>
<li><b>Limites de ressources</b> qui déclenchent un OOM absent en local.</li>
</ol></div>

<h3>Docker Compose</h3>
<p>Décrit et lance plusieurs conteneurs liés sur UNE machine. Excellent en dev et en test d'intégration. <b>Ce n'est pas un orchestrateur de production</b> : pas de haute disponibilité, pas de scheduling multi-nœuds, pas de self-healing réel, pas de rolling update sûr.</p>

<h3>Chaîne d'approvisionnement</h3>
<ul>
<li>Registry privé (ECR, ACR, Harbor, Nexus) miroir des images de base approuvées et durcies.</li>
<li><b>Pin par digest</b> (<code>image@sha256:…</code>) en production — un tag est mutable et ne prouve rien.</li>
<li><b>Scan continu</b> (Trivy, Grype) : un scan au build ne suffit pas, les CVE apparaissent après.</li>
<li><b>Signature</b> (Cosign) + politique d'admission qui refuse les images non signées.</li>
<li><b>SBOM</b> généré au build : c'est ce qui permet de répondre en minutes à « quelle application utilise cette bibliothèque vulnérable ? ».</li>
</ul>
<div class="box dire"><b>La phrase qui montre le niveau</b>
« Un conteneur, ce n'est pas une machine légère : c'est un processus normal avec des namespaces, des cgroups et un rootfs overlay. Ça explique à la fois pourquoi il démarre en millisecondes et pourquoi l'isolation est plus faible qu'une VM — donc pourquoi on ne mutualise pas n'importe quoi sur un même nœud en environnement sensible. »</div>
`
}]);
