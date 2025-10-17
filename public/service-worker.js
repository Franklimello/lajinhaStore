/* global workbox */

try {
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
} catch (e) {
  // Workbox not available; no-op
}

if (typeof workbox !== 'undefined') {
  workbox.core.setCacheNameDetails({ prefix: 'compreaqui' });

  // Skip waiting and claim clients to update fast
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });

  workbox.core.clientsClaim();

  // Cache JS/CSS with Stale-While-Revalidate
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'script' || request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'assets-js-css',
    })
  );

  // Cache images with Cache-First and max entries
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'assets-images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }),
      ],
    })
  );

  // Cache app shell (index.html) with Network-First for offline navigation
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({ cacheName: 'app-shell' })
  );
}



