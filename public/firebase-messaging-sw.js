// firebase-messaging-sw.js
// Este arquivo deve estar na pasta PUBLIC/ do seu projeto

// ✅ VERSÃO ATUALIZADA DO FIREBASE (10.7.1)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuração do Firebase
// ⚠️ IMPORTANTE: Use as mesmas credenciais do seu firebase/config.js
firebase.initializeApp({
  apiKey: "AIzaSyCPOsZYAXUzdEZ_wQV7HpON_cZ0QGJpTqI",
  authDomain: "compreaqui-324df.firebaseapp.com",
  projectId: "compreaqui-324df",
  storageBucket: "compreaqui-324df.firebasestorage.app",
  messagingSenderId: "821962501479",
  appId: "1:821962501479:web:2dbdb1744b7d5849a913c2"
});

const messaging = firebase.messaging();

console.log('🔥 Firebase Messaging Service Worker inicializado');

// ============================================================
// HANDLER PARA MENSAGENS EM BACKGROUND
// ============================================================
// Este handler é chamado quando:
// 1. O app está fechado
// 2. O app está em background
// 3. Uma mensagem FCM chega do servidor (Cloud Functions)
messaging.onBackgroundMessage((payload) => {
  console.log('📬 [Background] Mensagem FCM recebida:', payload);

  // Extrair dados da notificação
  const notificationTitle = payload.notification?.title || 'CompraAqui';
  const notificationOptions = {
    body: payload.notification?.body || 'Você tem uma nova notificação',
    icon: payload.notification?.icon || '/logo192.png',
    badge: '/logo192.png',
    tag: payload.data?.tag || `notification-${Date.now()}`,
    
    // Dados customizados (podem ser acessados no click)
    data: {
      url: payload.notification?.click_action || payload.data?.url || '/',
      orderId: payload.data?.orderId,
      type: payload.data?.type || 'general',
      timestamp: Date.now(),
      ...payload.data
    },
    
    // Ações interativas (botões na notificação)
    actions: [
      {
        action: 'open',
        title: '👁️ Abrir',
        icon: '/icons/view.png'
      },
      {
        action: 'close',
        title: '✖️ Fechar'
      }
    ],
    
    // Configurações adicionais
    vibrate: [200, 100, 200], // Padrão de vibração
    requireInteraction: false, // Não força interação
    silent: false, // Com som
    timestamp: Date.now(),
    
    // Imagem grande (se disponível)
    image: payload.notification?.image || payload.data?.image
  };

  // Exibe a notificação
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ============================================================
// HANDLER PARA CLIQUES NA NOTIFICAÇÃO
// ============================================================
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 [SW] Notificação clicada:', event.action);
  
  // Fecha a notificação
  event.notification.close();

  // Obtém URL de destino
  const urlToOpen = event.notification.data?.url || '/';
  const action = event.action;

  // Se clicar em "Fechar", apenas fecha
  if (action === 'close') {
    console.log('👋 Notificação fechada pelo usuário');
    return;
  }

  // Abre ou foca a janela do app
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    })
    .then((clientList) => {
      console.log('🔍 Procurando janelas abertas...');
      
      // Verifica se já existe uma janela aberta
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          console.log('✅ Janela encontrada, focando...');
          
          // Envia mensagem para o cliente (app) sobre o clique
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            url: urlToOpen,
            data: event.notification.data
          });
          
          return client.focus();
        }
      }
      
      // Se não encontrou janela aberta, abre nova
      console.log('🆕 Abrindo nova janela:', urlToOpen);
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
    .catch(error => {
      console.error('❌ Erro ao abrir janela:', error);
    })
  );
});

// ============================================================
// HANDLER PARA FECHAR NOTIFICAÇÃO (ANALYTICS)
// ============================================================
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 [SW] Notificação fechada:', event.notification.tag);
  
  // Você pode enviar analytics aqui
  const data = event.notification.data;
  
  // Exemplo: registrar fechamento
  event.waitUntil(
    logNotificationClose(data)
  );
});

async function logNotificationClose(data) {
  console.log('📊 Notificação fechada sem clique:', {
    type: data?.type,
    orderId: data?.orderId,
    timestamp: data?.timestamp
  });
  
  // Aqui você pode enviar para analytics se desejar
  // Por exemplo, usando Fetch API para seu backend
}

// ============================================================
// INSTALAÇÃO DO SERVICE WORKER
// ============================================================
self.addEventListener('install', (event) => {
  console.log('⚙️ [SW] Instalando Service Worker...');
  
  // Força o SW a ser ativado imediatamente
  self.skipWaiting();
});

// ============================================================
// ATIVAÇÃO DO SERVICE WORKER
// ============================================================
self.addEventListener('activate', (event) => {
  console.log('✅ [SW] Service Worker ativado');
  
  event.waitUntil(
    // Limpa caches antigos se necessário
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('old-cache-')) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Assume controle de todas as páginas imediatamente
      return self.clients.claim();
    })
  );
});

// ============================================================
// PUSH EVENT (para push notifications genéricas)
// ============================================================
self.addEventListener('push', (event) => {
  console.log('📨 [SW] Push recebido');
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Nova Notificação', body: event.data.text() };
    }
  }
  
  const title = data.title || 'Nova Notificação';
  const options = {
    body: data.body || '',
    icon: data.icon || '/logo192.png',
    badge: '/logo192.png',
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ============================================================
// MENSAGENS DO CLIENTE (PÁGINA WEB)
// ============================================================
self.addEventListener('message', (event) => {
  console.log('💬 [SW] Mensagem recebida do cliente:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
});

// ============================================================
// ERROR HANDLERS
// ============================================================
self.addEventListener('error', (event) => {
  console.error('❌ [SW] Erro no Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ [SW] Promise rejeitada:', event.reason);
});

console.log('🚀 [SW] Firebase Messaging Service Worker pronto!');