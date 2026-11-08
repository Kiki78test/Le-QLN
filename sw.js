// Le-QLN — service worker : jeu jouable hors connexion après la première visite.
const VERSION = "qln-v9";
const FICHIERS = [
  "./", "index.html", "plateau.js", "pub.js", "infos.js", "manifest.webmanifest", "data/fr.json",
  "pubs/spot1.jpg", "pubs/spot2.jpg", "pubs/spot3.jpg", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(cles => Promise.all(cles.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Réseau d'abord pour les pages (mises à jour rapides), cache d'abord pour le reste.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(r => { const copie = r.clone(); caches.open(VERSION).then(c => c.put(req, copie)); return r; })
        .catch(() => caches.match(req).then(r => r || caches.match("index.html")))
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
