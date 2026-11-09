// Le-QLN — service worker : jeu jouable hors connexion après la première visite.
const VERSION = "qln-v26";
const FICHIERS = [
  "./", "index.html", "plateau.js", "multi.js", "progres.js", "compte.js", "config.js", "pub.js", "infos.js", "manifest.webmanifest", "data/fr.json",
  "pubs/spot1.jpg", "pubs/spot2.jpg", "pubs/spot3.jpg", "fonts/barlow-condensed-latin-500-normal.woff2", "fonts/barlow-condensed-latin-600-normal.woff2", "fonts/barlow-condensed-latin-700-normal.woff2", "fonts/barlow-condensed-latin-800-italic.woff2", "fonts/barlow-condensed-latin-800-normal.woff2", "fonts/barlow-latin-400-normal.woff2", "fonts/barlow-latin-500-normal.woff2", "fonts/barlow-latin-600-normal.woff2", "fonts/barlow-latin-700-normal.woff2", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
];

self.addEventListener("install", e => {
  // cache:"reload" : on contourne le cache HTTP du navigateur (GitHub Pages garde les fichiers 10 min)
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS.map(f => new Request(f, {cache:"reload"})))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(cles => Promise.all(cles.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Réseau d'abord pour les pages, le code et les données (toujours la dernière version en ligne) ;
// cache d'abord pour les polices, images et vidéos. Hors ligne, tout vient du cache.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  // documents (liste et fichiers) : réseau d'abord, pour voir les nouveautés sans attendre une nouvelle version
  const code = /\.(js|json|html|webmanifest)(\?|$)/.test(new URL(req.url).pathname) && new URL(req.url).origin === location.origin;
  if (req.mode === "navigate" || req.url.includes("/docs/") || code) {
    e.respondWith(
      fetch(req, {cache:"no-cache"}).then(r => { const copie = r.clone(); caches.open(VERSION).then(c => c.put(req, copie)); return r; })
        .catch(() => caches.match(req).then(r => r || (req.mode === "navigate" ? caches.match("index.html") : Response.error())))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(rep => {
      if (rep.ok && (new URL(req.url).origin === location.origin || req.url.includes("fonts.g"))) {
        const copie = rep.clone(); caches.open(VERSION).then(c => c.put(req, copie));
      }
      return rep;
    }))
  );
});
