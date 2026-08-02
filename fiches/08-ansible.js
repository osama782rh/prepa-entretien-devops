window.FICHES = (window.FICHES || []).concat([{
id:"ansible",
titre:"Ansible & gestion de configuration",
lead:"Le parc de VM ne disparaîtra pas. En banque, Ansible reste omniprésent — et c'est un sujet où beaucoup de candidats cloud sont pris de court.",
html:`
<h3>Où Ansible se place</h3>
<table>
<tr><th>Outil</th><th>Répond à</th></tr>
<tr><td><b>Terraform</b></td><td><i>Provisionner</i> : créer la VM, le réseau, la base — le CYCLE DE VIE des ressources</td></tr>
<tr><td><b>Ansible</b></td><td><i>Configurer</i> : ce qui se passe DANS la machine — paquets, fichiers, services, utilisateurs</td></tr>
<tr><td><b>Packer</b></td><td><i>Fabriquer l'image</i> : figer une configuration dans une AMI / image managée</td></tr>
</table>
<div class="box dire"><b>La réponse attendue sur « Terraform ou Ansible ? »</b>
« Ce ne sont pas des concurrents. Terraform gère le cycle de vie de l'infrastructure, Ansible la configuration à l'intérieur. Dans une approche immuable, on utilise plutôt Packer + Ansible pour construire une image dorée, et Terraform pour déployer cette image — on ne configure plus les machines en place, on les remplace. Ansible garde toute sa valeur sur le legacy, les appliances, les bases, et l'orchestration de procédures (bascules, patching coordonné). »</div>

<h3>Les concepts</h3>
<table>
<tr><th>Terme</th><th>Ce que c'est</th></tr>
<tr><td><b>Inventaire</b></td><td>La liste des hôtes, groupés (statique en INI/YAML, ou dynamique depuis AWS/Azure)</td></tr>
<tr><td><b>Playbook</b></td><td>Un fichier YAML : quelles tâches, sur quels hôtes, dans quel ordre</td></tr>
<tr><td><b>Tâche (task)</b></td><td>Un appel à un module, avec ses paramètres</td></tr>
<tr><td><b>Module</b></td><td>L'unité de travail (<code>apt</code>, <code>copy</code>, <code>systemd</code>, <code>user</code>…) — c'est lui qui porte l'idempotence</td></tr>
<tr><td><b>Rôle</b></td><td>Un ensemble réutilisable et structuré (tasks, handlers, templates, defaults, vars)</td></tr>
<tr><td><b>Handler</b></td><td>Une tâche déclenchée SEULEMENT si une autre a produit un changement (redémarrer nginx)</td></tr>
<tr><td><b>Facts</b></td><td>Les informations collectées sur l'hôte (OS, IP, mémoire), utilisables comme variables</td></tr>
<tr><td><b>Collection</b></td><td>Le format de distribution moderne (modules + rôles + plugins), installé via Ansible Galaxy</td></tr>
</table>

<h3>Ce qui distingue Ansible</h3>
<ul>
<li><b>Sans agent</b> : il se connecte en SSH (ou WinRM) et exécute du Python sur la cible. Rien à installer ni à maintenir sur les serveurs — argument décisif face à Puppet ou Chef en environnement contraint.</li>
<li><b>Push</b> : c'est le poste de contrôle qui déclenche, contrairement au modèle pull de Puppet/Chef. Simple, mais il faut un déclencheur (pipeline, AWX/Tower).</li>
<li><b>Déclaratif au niveau du module</b>, procédural au niveau du playbook : les tâches s'exécutent dans l'ordre, mais chaque module vise un ÉTAT.</li>
</ul>

<h3>L'idempotence — le concept central</h3>
<p>Rejouer le même playbook ne doit rien changer si l'état est déjà correct. Ansible le rapporte : <code>ok</code> (déjà conforme) vs <code>changed</code> (a modifié).</p>
<div class="box piege"><b>Ce qui casse l'idempotence</b>
<ul>
<li>Le module <b><code>shell</code> / <code>command</code></b> : Ansible ne peut pas savoir si l'action est nécessaire — il l'exécute toujours et rapporte <code>changed</code>. Correctifs : <code>creates=</code>, <code>removes=</code>, <code>when:</code>, ou <code>changed_when: false</code> pour une commande de simple lecture.</li>
<li><code>lineinfile</code> avec une regex trop lâche, qui réécrit à chaque passage.</li>
<li>Toute génération aléatoire ou horodatée dans un template.</li>
</ul>
Règle : chercher d'abord un module dédié. <code>shell</code> est un aveu d'échec — accepté, mais à justifier.</div>

<h3>Un playbook lisible</h3>
<pre><code>---
- name: Socle applicatif
  hosts: web
  become: true
  vars:
    version_app: "1.4.2"
  tasks:
    - name: Paquets requis
      ansible.builtin.apt:
        name: [nginx, curl]
        state: present
        update_cache: true

    - name: Configuration nginx
      ansible.builtin.template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
        owner: root
        mode: "0644"
        validate: "nginx -t -c %s"     # refuse d'écrire une conf invalide
      notify: Recharger nginx

    - name: Service actif au démarrage
      ansible.builtin.systemd:
        name: nginx
        state: started
        enabled: true

  handlers:
    - name: Recharger nginx
      ansible.builtin.systemd:
        name: nginx
        state: reloaded</code></pre>
<p>Points de qualité visibles ici : noms explicites, modules dédiés plutôt que <code>shell</code>, <code>validate</code> qui empêche de casser le service, handler déclenché uniquement sur changement réel.</p>

<h3>Structure d'un projet</h3>
<pre><code>inventaires/
  prod/hosts.yml
  prod/group_vars/web.yml
  rec/hosts.yml
roles/
  socle/{tasks,handlers,templates,defaults,vars,meta}/
  applicatif/
playbooks/
  site.yml
ansible.cfg
requirements.yml        # collections et rôles externes, VERSIONNÉS</code></pre>
<p><b>Précédence des variables</b> : <code>defaults/</code> du rôle (la plus faible, donc surchargeable) &lt; <code>group_vars</code> &lt; <code>host_vars</code> &lt; <code>vars/</code> du rôle &lt; <code>-e</code> en ligne de commande (la plus forte). Mettre les valeurs par défaut dans <code>defaults/</code> et jamais dans <code>vars/</code> est ce qui rend un rôle réutilisable.</p>

<h3>Sécurité et secrets</h3>
<ul>
<li><b>Ansible Vault</b> chiffre des fichiers ou des variables : <code>ansible-vault encrypt_string</code>. La clé de déchiffrement doit venir d'un coffre ou du pipeline, jamais d'un fichier commité.</li>
<li>Mieux : lire les secrets à l'exécution depuis Key Vault / Secrets Manager / HashiCorp Vault via un lookup, pour ne rien stocker dans le dépôt.</li>
<li><code>no_log: true</code> sur les tâches manipulant un secret, sinon il apparaît dans la sortie et les logs du pipeline.</li>
<li>Le poste (ou le runner) qui exécute Ansible détient des accès SSH privilégiés sur tout le parc : c'est une cible de premier ordre, à traiter comme un bastion.</li>
</ul>

<h3>Exploitation</h3>
<pre><code>ansible-playbook site.yml --check --diff     # dry-run + montre les différences
ansible-playbook site.yml --limit web-03      # cibler un hôte
ansible-playbook site.yml --tags nginx
ansible-playbook site.yml --start-at-task "Configuration nginx"
ansible-inventory --graph
ansible-lint                                   # qualité, en CI</code></pre>
<p><b><code>--check --diff</code> est l'équivalent du <code>terraform plan</code></b> : c'est le réflexe à citer. Limite honnête : en mode check, les tâches dépendant du résultat d'une tâche précédente non exécutée peuvent échouer ou rapporter faux.</p>

<h3>Déploiement sans coupure</h3>
<pre><code>- hosts: web
  serial: "25%"          # par vagues de 25% du parc
  max_fail_percentage: 0 # on arrête au premier échec
  pre_tasks:
    - name: Retirer du load balancer
      ...
  post_tasks:
    - name: Remettre dans le load balancer après contrôle de santé
      ...</code></pre>
<p><code>serial</code> transforme un playbook en <b>rolling update</b>. C'est ce qui permet de patcher un parc en production sans interruption, et c'est exactement l'usage bancaire typique.</p>

<h3>À savoir dire en entretien</h3>
<div class="box dire">
<ul>
<li>« Ansible ne remplace pas Terraform : l'un provisionne, l'autre configure. »</li>
<li>« Je préfère l'immuable quand c'est possible — Packer + Ansible pour construire l'image, puis on remplace les machines au lieu de les modifier. Ansible en place reste pertinent pour le legacy et l'orchestration de procédures. »</li>
<li>« L'idempotence n'est pas magique : elle vient des modules. Dès qu'on tombe dans <code>shell</code>, c'est à nous de la garantir. »</li>
<li>« En CI : <code>ansible-lint</code>, puis <code>--check --diff</code> sur un environnement de recette avant tout run en production, et un déploiement par vagues avec <code>serial</code>. »</li>
</ul></div>
`
}]);
