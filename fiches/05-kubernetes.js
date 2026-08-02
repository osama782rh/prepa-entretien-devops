window.FICHES = (window.FICHES || []).concat([{
id:"kubernetes",
titre:"Kubernetes",
lead:"Le domaine le plus challengé en entretien DevOps. Vise la profondeur : le cycle de vie, le réseau, le troubleshooting.",
html:`
<h3>Architecture</h3>
<table>
<tr><th>Composant</th><th>Rôle</th></tr>
<tr><td><b>kube-apiserver</b></td><td>Seule porte d'entrée : authN, authZ (RBAC), admission, validation, écriture dans etcd</td></tr>
<tr><td><b>etcd</b></td><td>Base clé-valeur distribuée (Raft) = l'unique source de vérité</td></tr>
<tr><td><b>kube-scheduler</b></td><td>Choisit un nœud pour chaque Pod non assigné (filtrage puis scoring)</td></tr>
<tr><td><b>controller-manager</b></td><td>Boucles de réconciliation (Deployment, ReplicaSet, Node, Job…)</td></tr>
<tr><td><b>kubelet</b></td><td>Agent sur chaque nœud : démarre les conteneurs via CRI, remonte le statut, exécute les probes</td></tr>
<tr><td><b>kube-proxy</b></td><td>Programme iptables/IPVS pour implémenter les Services</td></tr>
<tr><td><b>CoreDNS</b></td><td>DNS interne du cluster</td></tr>
</table>

<h3>Le chemin d'un <code>kubectl apply</code></h3>
<p>kubectl → API server (authentification, RBAC, <b>mutating</b> webhooks, validation de schéma, <b>validating</b> webhooks) → etcd → Deployment controller crée un ReplicaSet → ReplicaSet controller crée les Pods (sans nœud) → scheduler assigne un nœud → kubelet du nœud appelle containerd (CRI) → conteneurs démarrés → statut remonté.</p>
<p><b>Le concept clé</b> : boucle de réconciliation <em>level-triggered</em>. Les contrôleurs comparent en permanence état désiré et état observé, ils sont idempotents, et le système s'auto-répare même après une perte d'événements.</p>

<h3>Workloads</h3>
<table>
<tr><th>Objet</th><th>Pour quoi</th></tr>
<tr><td>Deployment</td><td>Stateless, Pods interchangeables, rolling update et rollback</td></tr>
<tr><td>StatefulSet</td><td>Identité stable (<code>db-0</code>), PVC par Pod, ordre de démarrage — bases, brokers</td></tr>
<tr><td>DaemonSet</td><td>Un Pod par nœud — agents de logs, CNI, monitoring</td></tr>
<tr><td>Job / CronJob</td><td>Traitement ponctuel / planifié</td></tr>
</table>

<h3>Probes — la question qui tombe toujours</h3>
<table>
<tr><th>Probe</th><th>Échec ⇒</th><th>Usage</th></tr>
<tr><td><b>liveness</b></td><td>Le conteneur est REDÉMARRÉ</td><td>Détecter un blocage définitif (deadlock)</td></tr>
<tr><td><b>readiness</b></td><td>Retiré des Endpoints (plus de trafic), pas de redémarrage</td><td>Dépendance temporairement indisponible, démarrage</td></tr>
<tr><td><b>startup</b></td><td>Désactive les deux autres tant qu'elle n'a pas réussi</td><td>Applications longues à démarrer (JVM)</td></tr>
</table>
<div class="box piege"><b>Piège liveness</b> : une liveness qui teste la base de données transforme une panne de base en boucle de redémarrage de TOUS les pods. La liveness ne doit tester QUE la santé interne du process. Les dépendances externes, c'est la readiness.</div>

<h3>Requests / limits</h3>
<ul>
<li><b>requests</b> : ce que le scheduler réserve. C'est la base du placement ET du calcul du HPA.</li>
<li><b>limits</b> : plafond. CPU dépassé → <b>throttling</b> (ralentissement). Mémoire dépassée → <b>OOMKill</b> immédiat (exit 137).</li>
<li>Classes QoS : <b>Guaranteed</b> (requests = limits, évincé en dernier), <b>Burstable</b>, <b>BestEffort</b> (rien de défini, évincé en premier).</li>
<li>Bonne pratique courante : requests mémoire = limits mémoire (la mémoire n'est pas compressible), et pas de limite CPU trop serrée pour éviter un throttling inutile.</li>
</ul>

<h3>Réseau</h3>
<p><b>Modèle CNI</b> : chaque Pod a son IP, tous les Pods se joignent <b>sans NAT</b>, un Pod se voit avec la même IP que les autres le voient.</p>
<table>
<tr><th>Service</th><th>Effet</th></tr>
<tr><td>ClusterIP</td><td>IP virtuelle interne (défaut)</td></tr>
<tr><td>NodePort</td><td>Port 30000-32767 ouvert sur chaque nœud</td></tr>
<tr><td>LoadBalancer</td><td>Provisionne un LB cloud</td></tr>
<tr><td>Headless (<code>clusterIP: None</code>)</td><td>Renvoie les IP des Pods — pour les StatefulSets</td></tr>
</table>
<p>DNS : <code>&lt;service&gt;.&lt;namespace&gt;.svc.cluster.local</code>. Pour un StatefulSet : <code>db-0.db.default.svc.cluster.local</code>.</p>
<p><b>NetworkPolicy</b> : par défaut tout est ouvert. Dès qu'une policy sélectionne un Pod dans une direction, tout le reste devient interdit DANS CETTE DIRECTION. Bonne pratique : default-deny par namespace puis ouverture explicite. Nécessite un CNI qui les implémente (Calico, Cilium).</p>

<h3>Stockage</h3>
<p><b>PVC</b> (la demande) → <b>StorageClass</b> (le type + provisioner) → <b>PV</b> (le volume réel, créé dynamiquement).</p>
<ul>
<li><code>ReadWriteOnce</code> : un seul nœud à la fois (disque bloc : EBS, Azure Disk).</li>
<li><code>ReadWriteMany</code> : plusieurs nœuds (NFS, EFS, Azure Files).</li>
<li><code>reclaimPolicy</code> : <b>Delete</b> (le volume part avec le PVC — dangereux en prod) vs <b>Retain</b>.</li>
<li>Un Pod RWO bloqué en Pending avec « Multi-Attach » = l'ancien nœud n'a pas relâché le volume. C'est une protection contre la double écriture, pas un bug.</li>
</ul>

<h3>Autoscaling</h3>
<table>
<tr><th>Mécanisme</th><th>Ajuste</th><th>Prérequis</th></tr>
<tr><td>HPA</td><td>Nombre de réplicas</td><td>metrics-server + <b>requests définies</b></td></tr>
<tr><td>VPA</td><td>requests/limits d'un Pod</td><td>Redémarre le Pod ; ne pas combiner avec HPA sur la même métrique</td></tr>
<tr><td>Cluster Autoscaler</td><td>Nombre de NŒUDS</td><td>Se déclenche sur des Pods Pending</td></tr>
<tr><td>KEDA</td><td>Réplicas sur événement (file, Kafka, cron)</td><td>Permet le scale-to-zero</td></tr>
</table>

<h3>Placement</h3>
<ul>
<li><b>Taint / toleration</b> : le NŒUD repousse ; seuls les Pods tolérants y vont (nœuds GPU, nœuds système).</li>
<li><b>nodeSelector / nodeAffinity</b> : le POD choisit où aller (required ou preferred).</li>
<li><b>podAntiAffinity</b> / <b>topologySpreadConstraints</b> : répartir les réplicas sur des nœuds et des zones différents. <b>Indispensable</b> pour une vraie HA — sinon les 3 réplicas peuvent atterrir sur le même nœud.</li>
<li><b>PodDisruptionBudget</b> : protège pendant les disruptions VOLONTAIRES (drain, upgrade). Ne protège pas d'un crash.</li>
</ul>

<h3>Troubleshooting — la méthode</h3>
<pre><code>kubectl get pods -o wide
kubectl describe pod &lt;pod&gt;            # EVENTS en bas = 80% des réponses
kubectl logs &lt;pod&gt; -c &lt;conteneur&gt; --previous --tail=200
kubectl get events --sort-by=.lastTimestamp -A
kubectl get endpoints &lt;svc&gt;            # vide = selector/readiness
kubectl exec -it &lt;pod&gt; -- sh
kubectl debug -it &lt;pod&gt; --image=busybox --target=&lt;conteneur&gt;   # image sans shell
kubectl top pods / nodes
kubectl auth can-i create pods --as=system:serviceaccount:ns:sa</code></pre>
<table>
<tr><th>Symptôme</th><th>Causes à vérifier dans l'ordre</th></tr>
<tr><td>Pending</td><td>Ressources insuffisantes → taints/affinity → PVC non lié → quota de namespace</td></tr>
<tr><td>ImagePullBackOff</td><td>Tag inexistant → imagePullSecret manquant → registry injoignable (proxy)</td></tr>
<tr><td>CrashLoopBackOff</td><td><code>logs --previous</code> : bug, config manquante, liveness trop stricte, OOM</td></tr>
<tr><td>OOMKilled (137)</td><td>Pic mémoire &gt; limit ; regarder le <b>max</b> du working set, pas la moyenne ; régler le heap sur le cgroup</td></tr>
<tr><td>Service sans trafic</td><td>Endpoints vides → selector ≠ labels → readiness KO → targetPort ≠ port écouté</td></tr>
<tr><td>502 pendant un déploiement</td><td>Race d'arrêt : ajouter <code>preStop</code> sleep, readiness qui bascule avant l'arrêt, arrêt gracieux</td></tr>
<tr><td>DNS intermittent</td><td>CoreDNS saturé, <code>ndots:5</code>, conntrack plein → NodeLocal DNSCache</td></tr>
</table>

<h3>Sécurité</h3>
<ul>
<li><b>RBAC</b> : Role (namespacé) / ClusterRole + RoleBinding / ClusterRoleBinding. Un ServiceAccount dédié par application, jamais <code>default</code>, jamais <code>cluster-admin</code>.</li>
<li><b>Pod Security Admission</b> : niveaux <code>privileged</code> / <code>baseline</code> / <code>restricted</code> par namespace.</li>
<li><b>Secrets</b> : base64, <b>pas chiffrés</b> par défaut dans etcd. Activer l'encryption at rest, ou externaliser (External Secrets Operator + Key Vault/Secrets Manager, CSI Secret Store).</li>
<li><b>Admission policies</b> (Kyverno, Gatekeeper) : imposer registry approuvé, image signée, non-root, labels obligatoires, interdiction de <code>latest</code>.</li>
<li><b>Identité cloud</b> : IRSA / Pod Identity (AWS), Workload Identity (Azure/GCP) — droits par application, aucune clé statique.</li>
</ul>

<h3>Helm / Kustomize / GitOps</h3>
<ul>
<li><b>Helm</b> : templating + gestion de releases. Bien pour packager du tiers. <code>helm template</code> pour voir le rendu, <code>helm diff</code> avant upgrade.</li>
<li><b>Kustomize</b> : superposition de patches sans templating, natif dans kubectl. Bien pour des variantes d'environnement.</li>
<li><b>Opérateur (CRD + contrôleur)</b> : quand il y a une logique CONTINUE (jour 2 : sauvegarde, bascule, upgrade). Helm ne fait que rendre un template à l'installation.</li>
<li><b>GitOps</b> (Argo CD, Flux) : l'agent dans le cluster tire depuis Git et réconcilie. Pas de credentials cluster dans la CI, dérive corrigée, rollback = revert Git.</li>
</ul>

<div class="box dire"><b>Ce qui distingue un candidat senior</b>
Il ne récite pas les objets : il parle du <b>cycle de vie</b> (comment un Pod naît, devient prêt, reçoit du trafic, s'arrête proprement), de ce qui casse et de comment il le détecte. Si on te demande « c'est quoi un Deployment », enchaîne spontanément sur le ReplicaSet, le rolling update et le rollback : tu réponds à la question suivante avant qu'elle soit posée.</div>
`
}]);
