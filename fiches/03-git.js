window.FICHES = (window.FICHES || []).concat([{
id:"git",
titre:"Git & workflows",
lead:"Outil quotidien, donc domaine où l'approximation se remarque immédiatement.",
html:`
<h3>Le modèle mental</h3>
<p>Un commit est un objet <b>immuable</b> identifié par un hash, contenant : un pointeur vers un ARBRE (l'instantané complet du projet), le ou les parents, l'auteur, la date, le message. Git stocke des <b>instantanés</b>, pas des diffs — les diffs sont calculés à l'affichage.</p>
<p>Une <b>branche</b> n'est qu'un pointeur mobile vers un commit : un fichier de 41 octets dans <code>.git/refs/heads/</code>. D'où la gratuité totale des branches.</p>
<p>Trois zones : <b>working tree</b> (tes fichiers) → <b>index / staging</b> (le brouillon du prochain commit) → <b>dépôt</b> (les commits). Un commit fige l'INDEX, pas le disque.</p>

<h3>Les objets Git</h3>
<table>
<tr><th>Objet</th><th>Contient</th></tr>
<tr><td><b>blob</b></td><td>Le contenu d'un fichier (sans son nom)</td></tr>
<tr><td><b>tree</b></td><td>Une arborescence : noms, modes, pointeurs vers blobs et trees</td></tr>
<tr><td><b>commit</b></td><td>Un tree + parents + métadonnées</td></tr>
<tr><td><b>tag annoté</b></td><td>Un pointeur nommé + auteur + message + signature éventuelle</td></tr>
</table>
<p>Tout est adressé par le contenu : deux fichiers identiques dans dix branches = un seul blob stocké. C'est ce qui explique la compacité des dépôts Git.</p>

<h3>Les commandes qui comptent vraiment</h3>
<pre><code>git add -p                    # choisir morceau par morceau ce qui part
git commit --amend            # corriger le dernier commit (jamais après un push partagé)
git rebase -i HEAD~5          # nettoyer l'historique local avant la PR
git log --oneline --graph --all --decorate
git log -S "motDePasse"       # chercher un commit qui a AJOUTÉ ou RETIRÉ ce texte
git log --follow -- fichier   # suivre un fichier à travers ses renommages
git diff --staged
git stash push -m "wip" / git stash pop
git bisect start / bad / good # trouver le commit fautif en log2(n) étapes
git reflog                    # LE filet de sécurité
git blame -L 40,60 fichier
git cherry-pick &lt;sha&gt;
git revert &lt;sha&gt;              # sûr sur une branche partagée
git clean -nd                 # -n = simulation AVANT de supprimer les non suivis</code></pre>

<h3>reset : les trois modes</h3>
<table>
<tr><th>Mode</th><th>HEAD</th><th>Index</th><th>Fichiers</th><th>Quand</th></tr>
<tr><td>--soft</td><td>déplacé</td><td>gardé</td><td>gardés</td><td>Refaire le commit autrement</td></tr>
<tr><td>--mixed <i>(défaut)</i></td><td>déplacé</td><td>vidé</td><td>gardés</td><td>Défaire un <code>add</code></td></tr>
<tr><td>--hard</td><td>déplacé</td><td>vidé</td><td><b>écrasés</b></td><td>Tout jeter — irréversible sauf reflog</td></tr>
</table>
<p><b>reset vs revert vs checkout</b> : <code>reset</code> déplace la branche (réécrit l'histoire), <code>revert</code> ajoute un commit d'annulation (sûr en partagé), <code>checkout</code>/<code>switch</code>/<code>restore</code> change ce que tu as sous les yeux sans toucher à l'historique.</p>

<h3>merge vs rebase</h3>
<table>
<tr><th></th><th>merge</th><th>rebase</th></tr>
<tr><td>Effet</td><td>Commit de fusion, histoire réelle préservée</td><td>Commits rejoués au-dessus de la cible</td></tr>
<tr><td>Hash</td><td>Inchangés</td><td><b>Nouveaux</b></td></tr>
<tr><td>Historique</td><td>Graphe</td><td>Linéaire</td></tr>
<tr><td>Sur branche partagée</td><td>Sûr</td><td><b>Jamais</b></td></tr>
</table>
<p>Pratique courante : rebase local pour nettoyer avant la PR, merge (ou squash-merge) pour intégrer. <code>git pull --rebase</code> évite les commits de merge parasites sur une branche personnelle.</p>
<p><b>Squash merge</b> : toute la branche devient un seul commit sur main. Historique très lisible, mais on perd le détail — et attention, la branche source apparaît alors comme « non fusionnée » à Git, ce qui casse le cherry-pick ultérieur.</p>

<h3>Résoudre un conflit</h3>
<pre><code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
ma version
=======
la leur
&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/x</code></pre>
<ol>
<li>Éditer pour produire le résultat VOULU (pas juste choisir un côté).</li>
<li>Retirer les marqueurs.</li>
<li><code>git add fichier</code></li>
<li><code>git merge --continue</code> (ou <code>rebase --continue</code>).</li>
</ol>
<p><code>git merge --abort</code> annule tout. <code>git rerere</code> mémorise la résolution pour la rejouer automatiquement si le même conflit revient (utile en rebase long).</p>
<p>Le vrai remède est en amont : branches courtes et intégration fréquente. Un conflit énorme est un symptôme d'organisation, pas de Git.</p>

<h3>Stratégies de branches</h3>
<table>
<tr><th></th><th>GitFlow</th><th>Trunk-based</th><th>GitHub Flow</th></tr>
<tr><td>Branches</td><td>main, develop, feature, release, hotfix</td><td>main + branches de quelques heures</td><td>main + feature branches courtes</td></tr>
<tr><td>Intégration</td><td>Tardive, gros merges</td><td>Continue</td><td>Continue</td></tr>
<tr><td>Inachevé</td><td>Reste en branche</td><td>Caché par feature flag</td><td>Feature flag</td></tr>
<tr><td>Adapté à</td><td>Produits versionnés livrés au client</td><td>SaaS, livraison fréquente</td><td>Web, équipes petites</td></tr>
</table>
<div class="box dire"><b>Ce qu'il faut savoir dire</b>
« GitFlow est rigoureux mais il fait vivre les branches longtemps : l'intégration est tardive, les merges sont douloureux et la CI n'est plus vraiment continue. En trunk-based, on intègre plusieurs fois par jour et on cache l'inachevé derrière des feature flags. En banque, GitFlow reste fréquent pour les composants versionnés livrés à d'autres équipes — ce n'est pas absurde, c'est un choix lié au mode de livraison. »</div>

<h3>Protection de branche — les règles attendues</h3>
<ul>
<li>Push direct interdit sur <code>main</code>, tout passe par PR.</li>
<li>N approbations dont au moins un <b>CODEOWNER</b>, réapprobation à chaque nouveau commit.</li>
<li>Checks de CI obligatoires au vert.</li>
<li>Force-push et suppression de branche interdits.</li>
<li><b>Commits signés</b> exigés (GPG, SSH ou signature du forge).</li>
<li>Pas de bypass administrateur — c'est le point que regarde un auditeur.</li>
</ul>
<p>Ces règles matérialisent la <b>séparation des tâches</b> : personne ne peut seul écrire et faire partir un changement en production.</p>

<h3>Secrets et historique</h3>
<div class="box piege"><b>Le piège classique</b>
<code>git revert</code> ne protège rien : le blob reste dans l'historique et reste récupérable. L'ordre correct :
<ol>
<li><b>RÉVOQUER le secret</b> — c'est la seule action qui compte vraiment.</li>
<li>Réécrire l'historique (<code>git filter-repo</code>, BFG) et forcer le push.</li>
<li>Purger les forks, caches, PR et artefacts de CI qui en gardent une copie.</li>
<li>Auditer ce qui a été fait avec le secret pendant sa période d'exposition.</li>
<li>Post-mortem : pourquoi il existait, et mise en place de la détection.</li>
</ol>
Un candidat qui répond seulement « je fais un revert » se fait éliminer sur cette question.</div>
<p>Prévention : hook <code>pre-commit</code> (gitleaks, detect-secrets) — accélérateur contournable avec <code>--no-verify</code> — DOUBLÉ d'un contrôle côté serveur non contournable (push protection du forge, ou job CI bloquant).</p>

<h3>Divers utile</h3>
<ul>
<li><b><code>.gitignore</code></b> n'a aucun effet sur un fichier DÉJÀ suivi : il faut <code>git rm --cached</code> d'abord.</li>
<li><b>Tag annoté et signé</b> pour les releases (<code>git tag -s v1.2.0 -m "..."</code>) — c'est ce qui rend une release auditable.</li>
<li><b><code>--force-with-lease</code></b> plutôt que <code>--force</code> : refuse d'écraser si quelqu'un a poussé entre-temps.</li>
<li><b><code>git worktree</code></b> : plusieurs branches dans plusieurs répertoires depuis le même dépôt, sans re-cloner ni stasher.</li>
<li><b>Monorepo vs multi-repo</b> : le monorepo simplifie le refactoring transverse et la cohérence des versions, mais impose de l'outillage (détection des changements, build sélectif). Le multi-repo isole mais fait dériver les versions.</li>
</ul>
`
}]);
