window.FICHES = (window.FICHES || []).concat([{
id:"securite",
titre:"Sécurité & conformité",
lead:"En banque, c'est le domaine qui fait la différence entre un bon DevOps et un DevOps embauchable.",
html:`
<h3>Les fondamentaux à énoncer sans hésiter</h3>
<ul>
<li><b>AuthN puis AuthZ</b> : authentification = qui tu es ; autorisation = ce que tu as le droit de faire.</li>
<li><b>Moindre privilège</b> : le minimum de droits, pour la durée minimale. On part de zéro et on ajoute ; on audite ce qui n'a jamais servi (Access Advisor, Access Analyzer, Access Reviews) et on le retire.</li>
<li><b>Défense en profondeur</b> : plusieurs couches indépendantes (réseau, identité, chiffrement, détection). Aucune n'est censée être infaillible.</li>
<li><b>Séparation des tâches</b> : personne ne peut seul écrire ET mettre en production un changement.</li>
<li><b>Zero trust</b> : pas de réseau interne de confiance ; chaque appel est authentifié et autorisé quelle que soit sa provenance.</li>
</ul>

<h3>Chiffrement</h3>
<table>
<tr><th></th><th>Symétrique</th><th>Asymétrique</th></tr>
<tr><td>Clé</td><td>Une seule, partagée</td><td>Paire publique/privée</td></tr>
<tr><td>Vitesse</td><td>Rapide (AES)</td><td>Lent (RSA, ECDSA)</td></tr>
<tr><td>Problème résolu</td><td>Volume de données</td><td>Distribution des clés, authentification, signature</td></tr>
</table>
<p><b>TLS combine les deux</b> : l'asymétrique authentifie le serveur et établit un secret partagé (ECDHE → <b>forward secrecy</b>), puis tout le trafic passe en symétrique.</p>
<p><b>Chiffrement par enveloppe</b> (KMS / Key Vault) : le service génère une <b>data key</b>, la renvoie en clair ET chiffrée par la clé maître. On chiffre les données localement avec la clé en clair, on la jette de la mémoire, on stocke la version chiffrée à côté. La clé maître ne quitte jamais le HSM. C'est ce qui rend le chiffrement performant à grande échelle.</p>
<div class="box piege">Chiffrement au repos + en transit ne protègent <b>pas</b> d'un accès légitime détourné : si l'identité autorisée à déchiffrer est compromise, tout est lisible. D'où l'importance de l'IAM, de la segmentation et de la journalisation.</div>

<h3>Gestion des secrets — hiérarchie des bonnes pratiques</h3>
<ol>
<li><b>Pas de secret du tout</b> : identité fédérée (Managed Identity, IRSA, OIDC). Le meilleur secret est celui qui n'existe pas.</li>
<li><b>Coffre</b> (Key Vault, Secrets Manager, Vault) avec injection au runtime, rotation automatisée, journalisation des accès.</li>
<li><b>Variables de pipeline protégées</b>, scopées par environnement, masquées.</li>
<li><b>Jamais</b> : dans le code, dans une image, dans un tfvars commité, dans un fichier partagé.</li>
</ol>
<p><b>Secret fuité</b> : la seule action qui compte est de <b>le révoquer</b>. Réécrire l'historique Git ne protège rien si le secret reste valide. Ensuite : audit de ce qui a été fait avec, recherche de persistance, post-mortem sur pourquoi il existait.</p>

<h3>Sécurité des conteneurs et de la chaîne d'approvisionnement</h3>
<table>
<tr><th>Étape</th><th>Contrôle</th></tr>
<tr><td>Développement</td><td>Détection de secrets en pre-commit, SAST, revue de code</td></tr>
<tr><td>Dépendances</td><td>SCA + SBOM, lockfiles, dépôts internes miroirs (anti-typosquatting)</td></tr>
<tr><td>Build</td><td>Runner éphémère, base durcie (distroless), non-root, multi-stage</td></tr>
<tr><td>Registry</td><td>Privé, scan continu, signature Cosign, pin par digest</td></tr>
<tr><td>Déploiement</td><td>Admission policy : registry approuvé, image signée, non-root, pas de <code>latest</code></td></tr>
<tr><td>Runtime</td><td>read-only rootfs, capabilities drop ALL, seccomp, NetworkPolicy, détection runtime (Falco)</td></tr>
</table>
<p><b>Prioriser 200 CVE</b> : par risque réel — sévérité ET exploitabilité (KEV, EPSS, exploit public), présence effective dans le chemin d'exécution, exposition du service, disponibilité d'un correctif. Souvent, changer d'image de base en élimine 80 % d'un coup.</p>

<h3>Identité et accès humains</h3>
<ul>
<li>MFA résistante au phishing (FIDO2) obligatoire, surtout sur les comptes privilégiés.</li>
<li><b>Accès juste-à-temps</b> : PIM (Entra ID), IAM Identity Center avec sessions courtes. Aucun compte admin permanent.</li>
<li>Accès prod via bastion / Session Manager plutôt que SSH direct, avec enregistrement de session.</li>
<li>Revues d'accès périodiques, désactivation automatique des comptes dormants, départ = révocation immédiate.</li>
<li>Objectif final : l'accès humain direct est l'<b>exception documentée</b>, l'automatisation est le chemin normal.</li>
</ul>

<h3>JWT — ce qu'il faut savoir dire</h3>
<p>Trois parties base64url : header, payload, signature. Le payload est <b>signé, pas chiffré</b> → lisible par tous, jamais de secret dedans.</p>
<p>Erreurs classiques : ne pas vérifier la signature, accepter <code>alg: none</code> ou laisser le token choisir l'algorithme, ne pas valider <code>exp</code>/<code>aud</code>/<code>iss</code>, et croire qu'on peut révoquer un JWT (il faut des durées courtes + refresh token, ou une liste de révocation).</p>

<h3>Le confused deputy</h3>
<p>Un service tiers autorisé à endosser ton rôle peut être manipulé pour agir sur les ressources d'un autre client. Parades AWS : <code>ExternalId</code> dans la trust policy pour les rôles cross-compte tiers, conditions <code>aws:SourceAccount</code> / <code>aws:SourceArn</code> pour les services. Sortir ça en entretien te classe immédiatement.</p>

<h3>Conformité — le vocabulaire bancaire</h3>
<table>
<tr><th>Cadre</th><th>Ce qu'il impose (version DevOps)</th></tr>
<tr><td><b>DORA</b> (UE, applicable depuis janvier 2025)</td><td>Gestion du risque IT, notification rapide des incidents majeurs, tests de résilience, <b>surveillance des prestataires tiers critiques</b> (donc les clouds) : registre des dépendances, stratégies de sortie, scénarios de bascule testés</td></tr>
<tr><td><b>RGPD</b></td><td>Localisation et transferts, minimisation, durée de conservation appliquée <b>y compris dans les logs et les sauvegardes</b>, droit à l'effacement et à la portabilité, notification sous 72 h</td></tr>
<tr><td><b>PCI-DSS</b></td><td>Segmentation du périmètre carte, chiffrement, journalisation, revues d'accès, tests d'intrusion</td></tr>
<tr><td><b>ISO 27001 / NIST</b></td><td>Système de management de la sécurité, contrôles documentés et audités</td></tr>
<tr><td><b>ACPR / EBA</b></td><td>Externalisation informatique : réversibilité, auditabilité, continuité</td></tr>
</table>

<h3>Prouver la conformité à un auditeur</h3>
<p>La chaîne complète : demande/ticket → PR revue avec approbation nommée → commit signé → build tracé avec artefact versionné et SBOM → journal de déploiement horodaté → état réel via l'IaC et l'inventaire (AWS Config, Azure Resource Graph). En GitOps, le dépôt Git EST la preuve de l'état désiré et le contrôleur prouve la réconciliation.</p>
<p><b>Exceptions</b> : jamais en désactivant un contrôle. On crée une <b>exemption nommée, datée, avec un propriétaire et une justification</b>, inscrite dans un registre revu périodiquement.</p>

<h3>Policy as Code — les trois moments</h3>
<ol>
<li><b>En CI</b>, sur le plan Terraform JSON (OPA/Conftest, Sentinel, Checkov) — le moins cher, bloque avant création.</li>
<li><b>À l'admission</b> côté plateforme (Azure Policy Deny, SCP AWS, Kyverno/Gatekeeper) — rend le contrôle <b>non contournable</b>, même hors pipeline.</li>
<li><b>En continu</b> sur l'existant (Config, Defender for Cloud) — détecte la dérive.</li>
</ol>
<p>La CI seule ne suffit jamais : quelqu'un finira par agir hors pipeline.</p>

<h3>Réponse à incident de sécurité — l'ordre</h3>
<ol>
<li><b>Contenir</b> : révoquer/désactiver, isoler la ressource (sans la détruire — on préserve les preuves).</li>
<li><b>Évaluer</b> : logs d'audit, quelle période, quelles actions, quelles données.</li>
<li><b>Éradiquer</b> : chercher la persistance (nouvelles identités, clés, règles, tâches planifiées).</li>
<li><b>Restaurer</b> depuis un état sain vérifié.</li>
<li><b>Notifier</b> selon les obligations (RSSI, DPO, régulateur, clients).</li>
<li><b>Post-mortem blameless</b> avec actions systémiques datées.</li>
</ol>

<div class="box dire"><b>Formulation qui rassure en banque</b>
« Mon principe, c'est que le contrôle ne doit pas dépendre de la discipline des gens : il doit être dans la plateforme. Une policy en admission, une branche protégée, une identité fédérée — ce sont des contrôles qu'on ne peut pas oublier d'appliquer. »</div>
`
}]);
