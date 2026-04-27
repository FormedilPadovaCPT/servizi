const CACHE_NAME = 'formedil-padova-v1';
const STATIC_ASSETS = [
  '/servizi/',
  '/servizi/index.html',
  '/servizi/foto/logo_Formedil_pd_piccolo.png',
  '/servizi/foto/cantiere.png',
  '/servizi/foto/pericolo.png',
  '/servizi/foto/RLST.png',
  '/servizi/foto/CDS.jpg',
  '/servizi/foto/Paolo Balladore.jpg',
  '/servizi/foto/Caon Franco.jpg',
  '/servizi/foto/Camuffo Marco.jpg',
  '/servizi/foto/visentini Tommaso.jpg',
  '/servizi/foto/nicola-de marco.jpg',
  '/servizi/foto/Canova Mirco 20241013-.jpg',
  '/servizi/foto/Renato Squizzato.jpg',
  '/servizi/foto/Logo_Formedil_Padova_Positivo_colori.png',
  '/servizi/foto/logo_asseverazione_cpt.jpg',
  '/servizi/PWA/manifest.json'
];

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('PWA: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Google Apps Script requests - network only, no cache
  if (url.href.startsWith(GOOGLE_APPS_SCRIPT_URL)) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Network unavailable' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Cache-first strategy for static assets
  if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Network-first, fallback to cache for HTML (for offline support)
  if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match('/servizi/index.html');
          });
        })
    );
    return;
  }

  // Default: network with cache fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request);
    })
  );
});
