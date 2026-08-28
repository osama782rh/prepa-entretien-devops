# Préparation entretien DevOps

Quiz d'entraînement (610 questions, 10 niveaux) et fiches d'étude sur Terraform,
Kubernetes, AWS, Azure, Linux, réseau, CI/CD, sécurité, observabilité, SRE et SQL.

Réponses libres à taper — pas de QCM — avec répétition espacée.

## Utilisation

Ouvrir `index.html`. Aucune dépendance, aucun serveur nécessaire :
`quiz.html` et `etude.html` sont autonomes.

Le menu **Certifications** (`certifications.html`) donne accès à un simulateur
d'examen par certification, dans `certifs/<id>/index.html` : AZ-104, AZ-204,
AZ-400, DOP-C02, CKA, Terraform Associate, AZ-900 et CLF-C02. Chacun est un
fichier autonome avec ses trois niveaux, ses labs et sa répétition espacée.

Installable en application hors ligne (PWA) quand le site est servi en HTTPS.

## Développement

Les questions sont dans `data/`, les fiches dans `fiches/`, les gabarits dans `src/`.

```bash
node build.js         # régénère quiz.html, qcm.html, etude.html et formations.html
node sync-certifs.js  # recopie les simulateurs de certification + régénère certifications.html
node serve.js         # serveur local, accessible depuis le réseau
```

Après toute modification de `data/` ou `fiches/`, relancer `node build.js`.
Après toute modification d'un simulateur de certification (les dossiers
`../<nom>-quiz/`), relancer `node sync-certifs.js`.
Dans les deux cas, incrémenter `VERSION` dans `sw.js` pour forcer la mise à
jour du cache hors ligne.

`certifs/` et `certifications.html` sont générés : ne pas les éditer à la main.
