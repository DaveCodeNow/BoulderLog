/* Boulderlytics – Service Worker
   Absichtlich minimal: Die App selbst wird NICHT zwischengespeichert, damit jede neue Version sofort ankommt.
   Er sorgt nur dafür, dass (1) Browser die App zuverlässig als installierbar erkennen und
   (2) ohne Internet statt der Browser-Fehlerseite eine eigene Offline-Seite erscheint.
   Andere Anfragen (Supabase, Bilder, Skripte) laufen unverändert am Service Worker vorbei.
   Bei Änderungen an offline.html: CACHE hochzählen. */
const CACHE = 'boulderlytics-offline-v1';
const OFFLINE_URL = 'offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.all([OFFLINE_URL, 'icons/icon-192.png'].map((url) =>
        fetch(url, { cache: 'reload' }).then((res) => { if (res.ok) return cache.put(url, res); })
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('boulderlytics-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Nur Seitenaufrufe (App öffnen/neu laden): immer aus dem Netz, nur bei Fehler die Offline-Seite
  if (event.request.mode !== 'navigate') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE_URL))
  );
});
