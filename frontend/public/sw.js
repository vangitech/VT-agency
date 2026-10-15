/* Vangitech service worker — app-shell + asset caching with offline fallback.
   API, auth and realtime traffic are never cached. */
const VERSION = 'v1';
const STATIC_CACHE = `vangitech-static-${VERSION}`;
const PAGES_CACHE = `vangitech-pages-${VERSION}`;

const PRECACHE = [
  '/offline.html',
  '/site.webmanifest',
  '/favicon.svg',
  '/logo.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('vangitech-') && k !== STATIC_CACHE && k !== PAGES_CACHE)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

const isApiRequest = (url) =>
  url.pathname.startsWith('/api/') ||
  url.pathname.startsWith('/socket.io') ||
  url.pathname.startsWith('/uploads');

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Only handle same-origin; never cache API / realtime / uploads.
  if (url.origin !== self.location.origin || isApiRequest(url)) return;

  // Navigations: network-first, fall back to cached page, then offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PAGES_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // Static assets (JS/CSS/images/fonts): cache-first, then network.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
    )
  );
});
