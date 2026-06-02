// ============================================
// THY Route - Service Worker
// ============================================

const CACHE_NAME = 'thy-route-v51';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css?v=6.7',
  '/js/app.js?v=6.9',
  '/js/map.js?v=6.6',
  '/manifest.json',
  '/icons/splash.png',
  '/icons/favicon.png?v=6.6',
  '/icons/logo.png?v=6.6',
  '/icons/logo-dark.png?v=6.6',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512.svg'
];

// Install - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching core assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET, non-HTTP, and Google Maps API requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;
  if (event.request.url.includes('/api/')) return;
  if (event.request.url.includes('googleapis.com') || 
      event.request.url.includes('gstatic.com') ||
      event.request.url.includes('emailjs.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache (ignore search query params like ?tripId=...)
        return caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If not in cache and network failed, return a fallback empty response with error status
          return new Response('Çevrimdışı / Bağlantı hatası', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
          });
        });
      })
  );
});
