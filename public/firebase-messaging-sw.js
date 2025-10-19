// Service Worker para Firebase Cloud Messaging (gratuito)
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configuração do Firebase (substitua pelos seus dados)
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "compreaqui-324df.firebaseapp.com",
  projectId: "compreaqui-324df",
  storageBucket: "compreaqui-324df.appspot.com",
  messagingSenderId: "sua-sender-id",
  appId: "sua-app-id"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

// Inicializa Firebase Messaging
const messaging = firebase.messaging();

// Lida com mensagens em background
messaging.onBackgroundMessage((payload) => {
  console.log('Mensagem em background recebida:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/logo192.png',
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

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Lida com cliques na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event);

  event.notification.close();

  if (event.action === 'view') {
    // Abre a aplicação
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Apenas fecha a notificação
    event.notification.close();
  } else {
    // Clique na notificação (não em ação específica)
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Lida com mensagens quando o app está em foreground
messaging.onMessage((payload) => {
  console.log('Mensagem em foreground recebida:', payload);
  
  // Envia mensagem para o app principal
  if (self.clients) {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'FCM_MESSAGE',
          payload: payload
        });
      });
    });
  }
});


