/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
/* global workbox, importScripts */

const CACHE_VERSION = 'v2';
const CACHE_NAME = `lajinha-pwa-${CACHE_VERSION}`;

console.log('🚀 Service Worker iniciando...');

try {
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
  console.log('✅ Workbox carregado com sucesso');
} catch (e) {
  console.error('❌ Erro ao carregar Workbox:', e);
}

if (typeof workbox !== 'undefined') {
  workbox.core.setCacheNameDetails({ 
    prefix: 'lajinha-pwa',
    suffix: CACHE_VERSION
  });

  console.log('✅ Service Worker configurado com cache:', CACHE_NAME);

  // Skip waiting and claim clients to update fast
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      console.log('⏩ Pulando espera e ativando novo Service Worker');
      self.skipWaiting();
    }
  });

  workbox.core.clientsClaim();

  // Log quando o Service Worker for instalado
  self.addEventListener('install', (event) => {
    console.log('📦 Service Worker instalado');
  });

  // Log quando o Service Worker for ativado
  self.addEventListener('activate', (event) => {
    console.log('✨ Service Worker ativado');
    
    // Limpar caches antigos
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.includes('lajinha-pwa') && !cacheName.includes(CACHE_VERSION)) {
              console.log('🗑️ Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      })
    );
  });

  // Cache JS/CSS with Stale-While-Revalidate
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'script' || request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'assets-js-css',
      plugins: [
        {
          cacheDidUpdate: async ({ cacheName, request }) => {
            console.log('📝 Arquivo JS/CSS atualizado no cache:', request.url);
          },
        },
      ],
    })
  );

  // Cache de imagens do Firebase Storage - PRIORITÁRIO
  workbox.routing.registerRoute(
    ({ url }) => {
      const isFirebaseStorage = url.hostname.includes('firebasestorage.googleapis.com') || 
                                 url.href.includes('firebasestorage');
      if (isFirebaseStorage) {
        console.log('🔥 Interceptando Firebase Storage:', url.href);
      }
      return isFirebaseStorage;
    },
    new workbox.strategies.CacheFirst({
      cacheName: 'firebase-storage-images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({ 
          maxEntries: 1000,
          maxAgeSeconds: 60 * 24 * 60 * 60 // 60 dias
        }),
        {
          // Log quando a requisição está prestes a ser feita
          requestWillFetch: async ({ request }) => {
            console.log('📥 Buscando imagem Firebase:', request.url);
            return request;
          },
          
          // Log quando a resposta do cache for usada (ou não)
          cachedResponseWillBeUsed: async ({ cacheName, cachedResponse, request }) => {
            if (cachedResponse) {
              console.log('💾 ✅ Imagem Firebase recuperada do CACHE:', request.url);
            } else {
              console.log('❌ Imagem Firebase NÃO está no cache:', request.url);
            }
            return cachedResponse;
          },
          
          // Log quando a resposta está prestes a ser salva no cache
          cacheWillUpdate: async ({ request, response }) => {
            // Status 0 = resposta opaca (cross-origin), status 200 = sucesso
            if (response && (response.status === 200 || response.status === 0)) {
              console.log('🖼️ ✅ Nova imagem Firebase SALVA no cache:', request.url);
              return response;
            }
            console.warn('⚠️ Resposta não será cacheada (status inválido):', response?.status);
            return response; // Retorna a resposta mesmo assim, deixa o Workbox decidir
          },
          
          // Log adicional quando efetivamente salvar no cache
          cacheDidUpdate: async ({ cacheName, request }) => {
            console.log('💾 ✅ Cache atualizado (Firebase):', request.url);
          },
          
          // Log quando o fetch falha
          fetchDidFail: async ({ request }) => {
            console.error('❌ FALHA ao buscar imagem Firebase (offline?):', request.url);
          },
        },
      ],
    })
  );

  // Cache de outras imagens (locais)
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'assets-images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({ 
          maxEntries: 500, 
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 dias
        }),
        {
          cachedResponseWillBeUsed: async ({ cacheName, cachedResponse }) => {
            if (cachedResponse) {
              console.log('💾 Imagem local recuperada do cache');
            }
            return cachedResponse;
          },
          cacheWillUpdate: async ({ request, response }) => {
            if (response && response.status === 200) {
              console.log('🖼️ ✅ Nova imagem local SALVA no cache:', request.url);
              return response;
            }
            return null;
          },
        },
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
        {
          cachedResponseWillBeUsed: async ({ cacheName, cachedResponse }) => {
            if (cachedResponse) {
              console.log('🏠 Página recuperada do cache (OFFLINE)');
            }
            return cachedResponse;
          },
          cacheDidUpdate: async ({ cacheName, request }) => {
            console.log('📄 Página HTML salva no cache');
          },
        },
      ],
    })
  );

  // Cache Firebase calls (Firestore, Auth, etc)
  workbox.routing.registerRoute(
    ({ url }) => 
      (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) &&
      !url.hostname.includes('firebasestorage'), // Excluir storage (já tratado acima)
    new workbox.strategies.NetworkFirst({
      cacheName: 'firebase-api-calls',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 10 * 60 // 10 minutos
        }),
        {
          cachedResponseWillBeUsed: async ({ cacheName, cachedResponse }) => {
            if (cachedResponse) {
              console.log('☁️ Dados Firebase recuperados do cache');
            }
            return cachedResponse;
          },
        },
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

  // Background sync para ações offline
  try {
    if (workbox.backgroundSync && typeof workbox.backgroundSync.register === 'function') {
      workbox.backgroundSync.register('offline-orders', {
        maxRetentionTime: 24 * 60 // 24 horas
      });
      console.log('🔄 Background sync ativado');
    }
  } catch (error) {
    console.warn('⚠️ Background sync não disponível:', error.message);
  }

  // Handler para quando estiver completamente offline
  workbox.routing.setCatchHandler(({ event }) => {
    console.warn('⚠️ Requisição falhou e não há cache disponível:', event.request.url);
    
    // Se for navegação, retorna página offline personalizada se existir
    if (event.request.mode === 'navigate') {
      return caches.match('/index.html').then((response) => {
        if (response) {
          console.log('🏠 Retornando página principal do cache (fallback offline)');
          return response;
        }
      });
    }
    
    return Response.error();
  });

  console.log('✅ Service Worker totalmente configurado e pronto!');
  console.log('📊 Estatísticas de cache disponíveis via Application > Cache Storage no DevTools');

} else {
  console.warn('⚠️ Workbox não está disponível. Service Worker funcionando em modo básico.');
}



