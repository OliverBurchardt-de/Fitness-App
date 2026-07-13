// Service Worker für The Maestro Plan – App-Shell-Caching für Offline-Betrieb.
// Strategie: Cache-first für die statische Shell, network-first für Navigations-
// anfragen mit Cache-Fallback, damit die App auch offline startet.
const CACHE = 'maestro-plan-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './assets/maestro-logo.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-512-maskable.png',
  './assets/apple-touch-icon.png',
  './assets/Oswald-SemiBold.ttf',
  './assets/TitilliumWeb-Regular.ttf',
  './assets/TitilliumWeb-SemiBold.ttf',
  './assets/TitilliumWeb-Bold.ttf'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  // Navigationsanfragen: erst Netzwerk, sonst gecachte App-Shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Übrige GETs: Cache-first mit Netzwerk-Nachladen.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok && new URL(request.url).origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
