// Service Worker customizado para cache e performance
const CACHE_NAME = 'compreaqui-v1';
const STATIC_CACHE = 'compreaqui-static-v1';
const DYNAMIC_CACHE = 'compreaqui-dynamic-v1';

// Recursos para cache estático
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico'
];

// Instala o service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Cache estático aberto');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker instalado');
        return self.skipWaiting();
      })
  );
});

// Ativa o service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativando...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker ativado');
        return self.clients.claim();
      })
  );
});

// Intercepta requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia para diferentes tipos de recursos
  if (request.method === 'GET') {
    if (url.origin === location.origin) {
      // Recursos do mesmo domínio
      event.respondWith(cacheFirst(request));
    } else if (url.hostname === 'firebasestorage.googleapis.com') {
      // Imagens do Firebase Storage
      event.respondWith(cacheFirst(request));
    } else {
      // Recursos externos
      event.respondWith(networkFirst(request));
    }
  }
});

// Estratégia Cache First (para recursos estáticos)
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Erro no cache first:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Estratégia Network First (para recursos dinâmicos)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Rede indisponível, tentando cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response('Offline', { status: 503 });
  }
}

// Background sync para ações offline
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Executa sincronização em background
async function doBackgroundSync() {
  try {
    // Recupera ações pendentes do IndexedDB ou localStorage
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await processAction(action);
        await removePendingAction(action.id);
      } catch (error) {
        console.error('Erro ao processar ação:', error);
      }
    }
  } catch (error) {
    console.error('Erro no background sync:', error);
  }
}

// Recupera ações pendentes
async function getPendingActions() {
  // Implementação simplificada usando localStorage
  const actions = localStorage.getItem('pendingActions');
  return actions ? JSON.parse(actions) : [];
}

// Processa uma ação pendente
async function processAction(action) {
  const response = await fetch(action.url, {
    method: action.method,
    headers: action.headers,
    body: action.body
  });
  
  if (!response.ok) {
    throw new Error(`Erro na ação: ${response.status}`);
  }
  
  return response;
}

// Remove ação pendente após processamento
async function removePendingAction(actionId) {
  const actions = await getPendingActions();
  const filteredActions = actions.filter(action => action.id !== actionId);
  localStorage.setItem('pendingActions', JSON.stringify(filteredActions));
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Push message recebida:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do Supermercado Lajinha',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'compreaqui-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'Ver',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Supermercado Lajinha', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event);
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Apenas fecha a notificação
  } else {
    // Clique na notificação (não em ação específica)
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
