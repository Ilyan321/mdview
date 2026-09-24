const CACHE_NAME = 'mdview-v1.0.0';

// Helper to get base path from scope (e.g. '/mdview/' or '/')
function getBasePath() {
  try {
    return new URL(self.registration.scope).pathname;
  } catch (e) {
    return '/mdview/';
  }
}

// Install Event: precache core shell
self.addEventListener('install', (event) => {
  const base = getBasePath().replace(/\/$/, '');
  const PRECACHE_URLS = [
    `${base}/`,
    `${base}/index.html`,
    `${base}/manifest.webmanifest`,
    `${base}/favicon.svg`,
    `${base}/favicon.ico`,
    `${base}/icon-192.png`,
    `${base}/icon-512.png`,
    `${base}/og-preview.png`
  ];

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Use Promise.allSettled so individual failures don't abort SW installation
      await Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => console.warn('[SW] Precache skip:', url, err.message))
        )
      );
      return self.skipWaiting();
    })
  );
});

// Activate Event: clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key.startsWith('mdview-') && key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache-First for static assets, Network-First for navigation
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests and non-http(s) schemes (e.g. chrome-extension://)
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation requests (HTML document): Network-first with offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const base = getBasePath().replace(/\/$/, '');
          const cachedIndex = (await cache.match(`${base}/index.html`)) || (await cache.match(`${base}/`));
          return cachedIndex || Response.error();
        })
    );
    return;
  }

  // 2. Static Assets, Scripts, Styles, Fonts, CDN Libraries: Cache-First with Dynamic Cache Update
  const isStaticAsset =
    url.pathname.includes('/assets/') ||
    url.hostname.includes('cdnjs.cloudflare.com') ||
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        if (cachedRes) {
          // Return cached response immediately, update cache in background
          fetch(req)
            .then((networkRes) => {
              if (networkRes && networkRes.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(req, networkRes));
              }
            })
            .catch(() => {/* Offline, ignore */});
          return cachedRes;
        }

        // Cache miss: fetch from network and cache
        return fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // Default fallback for any other requests
  event.respondWith(
    caches.match(req).then((cachedRes) => cachedRes || fetch(req))
  );
});
