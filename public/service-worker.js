/* global workbox */

try {
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
} catch (e) {
  // Workbox not available; no-op
}

if (typeof workbox !== 'undefined') {
  workbox.core.setCacheNameDetails({ prefix: 'lajinha-pwa' });

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
        new workbox.expiration.ExpirationPlugin({ 
          maxEntries: 500, 
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 dias
        }),
      ],
    })
  );

  // Cache API calls with Network-First
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-calls',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 5 * 60 // 5 minutos
        }),
      ],
    })
  );

  // Cache app shell (index.html) with Network-First for offline navigation
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({ 
      cacheName: 'app-shell',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 24 * 60 * 60 // 24 horas
        }),
      ],
    })
  );

  // Cache Firebase calls
  workbox.routing.registerRoute(
    ({ url }) => url.hostname.includes('firebase') || url.hostname.includes('googleapis'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'firebase-calls',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 10 * 60 // 10 minutos
        }),
      ],
    })
  );

  // Cache QR Code API calls
  workbox.routing.registerRoute(
    ({ url }) => url.hostname.includes('qrserver.com'),
    new workbox.strategies.CacheFirst({
      cacheName: 'qr-codes',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 dias
        }),
      ],
    })
  );

  // Cache fonts
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'font',
    new workbox.strategies.CacheFirst({
      cacheName: 'fonts',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 ano
        }),
      ],
    })
  );

  // Background sync for offline actions
  workbox.backgroundSync.register('offline-orders', {
    maxRetentionTime: 24 * 60 // 24 horas
  });
}



