const CACHE_NAME = 'nestgame-v1';
const STATIC_ASSETS = [
  '/',
  '/library',
  '/manifest.json',
];

// Install: pre-cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for pages, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Only handle http and https requests
  if (!request.url.startsWith('http')) return;

  const url = new URL(request.url);

  // Skip API requests and ROM proxies
  if (url.pathname.startsWith('/api/')) return;

  // Skip external image domains that cause COEP/CORP issues in Service Workers
  const externalDomains = [
    'media.rawg.io',
    'thumbnails.libretro.com',
    'assets-prd.ignimgs.com',
    'images.igdb.com',
    'r2.dev',
    'r2.cloudflarestorage.com'
  ];
  if (externalDomains.some(domain => url.hostname.includes(domain))) {
    return;
  }

  // Cache-first for static assets (JS, CSS, images, WASM)
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|svg|woff2|wasm)$/) ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          // Opaque responses (status 0) can still be cached if they are basic resources,
          // but for external images we already skipped them above.
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      }).catch(() => {
        // Must always return a Response, never undefined
        return new Response('Network error and not cached', { status: 503, statusText: 'Service Unavailable' });
      })
    );
    return;
  }

  // Network-first for pages
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response('Network error and no cache available', { 
            status: 503, 
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      })
  );
});
