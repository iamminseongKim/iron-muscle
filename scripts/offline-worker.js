/* Build injects CACHE_NAME and CORE. No activation during an active client session. */
const base = new URL('./', self.location.href);
const coreUrls = new Set(CORE.map(path => new URL(path, base).href));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll([...coreUrls])));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('iron-offline-') && name !== CACHE_NAME) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return;
  // Serve a consistent cached shell while a newer release waits for all tabs to close.
  if (request.mode === 'navigate') {
    event.respondWith(caches.open(CACHE_NAME).then(async cache => (await cache.match(new URL('index.html', base).href)) || fetch(request)));
  } else if (coreUrls.has(url.href)) {
    event.respondWith(caches.open(CACHE_NAME).then(async cache => (await cache.match(request)) || fetch(request)));
  } else if (/\.(glb|png|webp|svg|json)$/.test(url.pathname) && url.pathname.includes('/anatomy/')) {
    // Optional models are cached only after they have actually been viewed online.
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const saved = await cache.match(request); if (saved) return saved;
      const response = await fetch(request);
      if (response.ok) { try { await cache.put(request, response.clone()); } catch {} }
      return response;
    })());
  }
});
