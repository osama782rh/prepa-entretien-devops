/**
 * Service worker : met tout en cache au premier chargement,
 * puis sert depuis le cache — l'application fonctionne sans réseau.
 *
 * Incrémenter VERSION à chaque nouvelle mise en ligne pour forcer la mise à jour.
 */
const VERSION = "prepa-bnp-v2";

const FICHIERS = [
  "./",
  "./index.html",
  "./quiz.html",
  "./etude.html",
  "./manifest.webmanifest",
  "./icone.svg"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(FICHIERS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(cles => Promise.all(cles.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  // Cache d'abord (hors ligne garanti), réseau en arrière-plan pour rafraîchir.
  e.respondWith(
    caches.match(e.request).then(enCache => {
      const reseau = fetch(e.request)
        .then(rep => {
          if (rep && rep.status === 200 && rep.type === "basic") {
            const copie = rep.clone();
            caches.open(VERSION).then(c => c.put(e.request, copie));
          }
          return rep;
        })
        .catch(() => enCache);

      return enCache || reseau;
    })
  );
});
