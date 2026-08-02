window.FICHES = (window.FICHES || []).concat([{
id:"git-docker",
titre:"Git & Docker",
lead:"Deux outils que tu utilises tous les jours — donc deux domaines où l'approximation se voit immédiatement.",
html:`
<h3>Git — modèle mental</h3>
<p>Un commit = un objet immuable contenant un pointeur vers un ARBRE (instantané complet du projet), le ou les parents, l'auteur et le message. Git stocke des <b>instantanés</b>, pas des diffs — les diffs sont calculés à l'affichage.</p>
<p>Trois zones : <b>working tree</b> (tes fichiers) → <b>index / staging</b> (le brouillon du prochain commit) → <b>dépôt</b> (les commits).</p>

<h3>Les commandes qui comptent</h3>
<pre><code>git add -p                    # choisir morceau par morceau ce qui part
git commit --amend            # corriger le dernier commit (jamais après un push partagé)
git rebase -i HEAD~5          # nettoyer l'historique local avant la PR
git log --oneline --graph --all
git diff --staged
git stash / git stash pop
git bisect start / bad / good # trouver le commit fautif en log2(n) étapes
git reflog                    # LE filet de sécurité : retrouver ce qu'on a "perdu"
git blame -L 40,60 fichier
git cherry-pick &lt;sha&gt;         # rejouer un commit ailleurs (hotfix vers release)
git revert &lt;sha&gt;              # annuler en ajoutant un commit (sûr sur branche partagée)</code></pre>

<h3>reset : les trois modes</h3>
<table>
<tr><th>Mode</th><th>HEAD</th><th>Index</th><th>Fichiers</th><th>Quand</th></tr>
<tr><td>--soft</td><td>déplacé</td><td>gardé</td><td>gardés</td><td>Refaire le commit autrement</td></tr>
<tr><td>--mixed</td><td>déplacé</td><td>vidé</td><td>gardés</td><td>Défaire un <code>add</code></td></tr>
<tr><td>--hard</td><td>déplacé</td><td>vidé</td><td><b>écrasés</b></td><td>Tout jeter — irréversible sauf reflog</td></tr>
</table>

<h3>merge vs rebase</h3>
<ul>
<li><b>merge</b> : crée un commit de fusion, préserve l'histoire réelle, sûr sur une branche partagée.</li>
<li><b>rebase</b> : rejoue tes commits au-dessus de la cible → historique linéaire mais <b>nouveaux hash</b>.</li>
<li><b>Règle d'or</b> : jamais de rebase sur une branche déjà poussée et partagée. En pratique : rebase local pour nettoyer avant la PR, merge pour intégrer.</li>
</ul>

<div class="box piege"><b>Le piège du secret commité</b>
<code>git revert</code> ne protège rien : le blob reste dans l'historique. Il faut (1) <b>révoquer le secret immédiatement</b> — c'est la seule action qui compte —, (2) réécrire l'historique (<code>git filter-repo</code>, BFG), (3) forcer le push et purger les forks/caches, (4) chercher ce qui a été fait avec dans les logs d'audit. Un candidat qui répond juste « je fais un revert » se fait éliminer sur cette question.</div>

<h3>Stratégies de branches</h3>
<table>
<tr><th></th><th>GitFlow</th><th>Trunk-based</th></tr>
<tr><td>Branches</td><td>main, develop, feature, release, hotfix</td><td>main + branches de quelques heures</td></tr>
<tr><td>Intégration</td><td>Tardive, gros merges</td><td>Continue, petits lots</td></tr>
<tr><td>Inachevé</td><td>Reste en branche</td><td>Caché par feature flag</td></tr>
<tr><td>Adapté à</td><td>Releases versionnées, produits packagés</td><td>SaaS, livraison fréquente</td></tr>
</table>

<h3>Docker — Dockerfile de production</h3>
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
USER 10001                          # non-root
EXPOSE 3000
ENTRYPOINT ["/nodejs/bin/node", "dist/server.js"]</code></pre>
<ul>
<li><b>Multi-stage</b> : compile dans une image lourde, livre une image minimale sans compilateur ni sources.</li>
<li><b>Ordre des couches</b> : du moins changeant au plus changeant, pour maximiser le cache.</li>
<li><b>.dockerignore</b> : exclure <code>.git</code>, <code>node_modules</code>, <code>.env</code> — sinon on gonfle le contexte et on fuite des secrets.</li>
<li><b>Forme exec</b> (JSON) pour ENTRYPOINT/CMD : la forme shell met <code>/bin/sh</code> en PID 1 qui ne relaie pas SIGTERM.</li>
<li><b>Tag immuable</b> : version sémantique ou SHA de commit, jamais <code>latest</code> en prod.</li>
</ul>

<h3>CMD vs ENTRYPOINT</h3>
<table>
<tr><th></th><th>ENTRYPOINT</th><th>CMD</th></tr>
<tr><td>Rôle</td><td>L'exécutable fixe</td><td>Les arguments par défaut</td></tr>
<tr><td>Surcharge par <code>docker run</code></td><td>Non (sauf <code>--entrypoint</code>)</td><td>Oui, en passant des arguments</td></tr>
</table>

<h3>Durcissement d'un conteneur</h3>
<pre><code>docker run --read-only \\
  --cap-drop ALL --security-opt no-new-privileges \\
  --user 10001:10001 \\
  --memory 512m --cpus 1 \\
  --tmpfs /tmp \\
  monimage:1.4.2</code></pre>
<p>Équivalent Kubernetes : <code>securityContext</code> avec <code>runAsNonRoot</code>, <code>readOnlyRootFilesystem</code>, <code>allowPrivilegeEscalation: false</code>, <code>capabilities.drop: [ALL]</code>, <code>seccompProfile: RuntimeDefault</code>.</p>

<h3>Où va la place disque</h3>
<pre><code>docker system df -v              # ventilation images / conteneurs / volumes / cache
docker system prune -a --volumes # attention : supprime les volumes non utilisés
docker image prune -f</code></pre>
<p>Le coupable le plus fréquent : les <b>logs json-file sans rotation</b>. Configurer <code>log-opts: max-size=10m, max-file=3</code> dans le daemon.json.</p>

<div class="box piege"><b>« Ça marche sur mon poste »</b>
Causes structurelles à citer : architecture différente (build ARM sur Mac vs nœuds amd64 → <code>docker buildx --platform</code>), variables et secrets présents en local via <code>.env</code>, DNS et proxy d'entreprise, contraintes de sécurité en cluster (non-root, filesystem read-only, capabilities), et limites de ressources qui déclenchent un OOM absent en local.</div>

<h3>Registry et supply chain</h3>
<ul>
<li>Registry privé (ECR, ACR, Harbor, Nexus) avec des images de base approuvées et scannées.</li>
<li>Pin par <b>digest</b> (<code>image@sha256:…</code>) en production, pas par tag mutable.</li>
<li>Scan continu (Trivy, Grype) — un scan au build ne suffit pas, les CVE apparaissent après.</li>
<li>Signature (Cosign) + politique d'admission qui refuse les images non signées.</li>
<li>SBOM généré au build pour répondre à « quel composant est affecté par cette CVE ? » en minutes plutôt qu'en semaines.</li>
</ul>
`
}]);
