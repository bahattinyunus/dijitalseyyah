/* ==========================================================================
   Dijital Seyyah — Anadolu Seyahatnamesi Service Worker
   Cache Versioning: dijital-seyyah-v3
   Strategy:
     - Network-first for HTML documents, JS scripts, and JSON data
     - Cache-first for static assets (CSS, SVG, images, fonts, manifest)
   ========================================================================== */

const CACHE_VERSION = 'dijital-seyyah-v41';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './style.css?v=33',
  './css/modules.css?v=32',
  './css/modules-v2.css?v=32',
  './css/awwwards-polish.css?v=32',
  './css/nextgen-v4.css?v=32',
  './css/wave5-masterpiece.css?v=32',
  './css/wave6-architecture.css?v=32',
  './css/wave7-irfan-aesthetic.css?v=32',
  './css/wave8-magnum-opus.css?v=32',
  './css/wave9-encyclopedia.css?v=32',
  './css/wave10-ux-polish.css?v=39',
  './css/wave11-futuristic-hud.css?v=41',
  './css/mobile-responsive-fix.css?v=32',
  './manifest.json',
  './assets/logo.svg',
  './assets/logo.png',
  './assets/favicon.png',
  './assets/banner.svg',
  './assets/banner.jpg',
  './assets/og-cover.jpg'
];

/**
 * Determine whether a request should use network-first strategy
 * (HTML navigations, CSS stylesheets, JavaScript modules/data, JSON files).
 */
function isNetworkFirstRequest(request, url) {
  if (request.mode === 'navigate') {
    return true;
  }
  const pathname = url.pathname.toLowerCase();
  return (
    pathname.endsWith('/') ||
    pathname.endsWith('.html') ||
    pathname.endsWith('.htm') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.mjs') ||
    pathname.endsWith('.json')
  );
}

/**
 * Determine whether a response is safe to store in the cache.
 */
function isCacheableResponse(response) {
  return (
    response &&
    response.status === 200 &&
    (response.type === 'basic' || response.type === 'cors')
  );
}

/**
 * Install: Pre-cache core shell assets resiliently and activate immediately.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE_ASSETS.map((assetUrl) =>
            cache.add(new Request(assetUrl, { cache: 'reload' }))
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate: Remove all outdated caches and claim active clients.
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_VERSION)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

/**
 * Network-first strategy with cache fallback.
 */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const networkResponse = await fetch(request);
    if (isCacheableResponse(networkResponse)) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    if (request.mode === 'navigate') {
      const fallback = await cache.match('./index.html');
      if (fallback) {
        return fallback;
      }
    }
    throw err;
  }
}

/**
 * Cache-first strategy with background/network fill on miss.
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  const networkResponse = await fetch(request);
  if (isCacheableResponse(networkResponse)) {
    cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

/**
 * Fetch: Intercept GET requests on http/https same-origin URLs.
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  let url;
  try {
    url = new URL(request.url);
  } catch (_) {
    return;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  if (isNetworkFirstRequest(request, url)) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});

/**
 * Optional message channel for controlled updates.
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
