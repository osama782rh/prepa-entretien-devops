# Préparation entretien DevOps

Quiz d'entraînement (610 questions, 10 niveaux) et fiches d'étude sur Terraform,
Kubernetes, AWS, Azure, Linux, réseau, CI/CD, sécurité, observabilité, SRE et SQL.

Réponses libres à taper — pas de QCM — avec répétition espacée.

## Utilisation

Ouvrir `index.html`. Aucune dépendance, aucun serveur nécessaire :
`quiz.html` et `etude.html` sont autonomes.

Installable en application hors ligne (PWA) quand le site est servi en HTTPS.

## Développement

Les questions sont dans `data/`, les fiches dans `fiches/`, les gabarits dans `src/`.

```bash
node build.js    # régénère quiz.html et etude.html autonomes
node serve.js    # serveur local, accessible depuis le réseau
```

Après toute modification de `data/` ou `fiches/`, relancer `node build.js`
et incrémenter `VERSION` dans `sw.js` pour forcer la mise à jour du cache.
