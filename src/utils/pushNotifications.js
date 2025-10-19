// Push notifications gratuitas usando Firebase Cloud Messaging
export const pushNotifications = {
  // Inicializa o service worker para push notifications
  async init() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications não suportadas neste navegador');
      return false;
    }

    try {
      // Registra o service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registrado:', registration);

      // Solicita permissão para notificações
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Permissão para notificações concedida');
        return true;
      } else {
        console.log('Permissão para notificações negada');
        return false;
      }
    } catch (error) {
      console.error('Erro ao inicializar push notifications:', error);
      return false;
    }
  },

  // Configura mensagens em background
  setupBackgroundMessages() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'FCM_MESSAGE') {
          const { title, body, icon, click_action } = event.data.payload.notification;
          
          // Mostra notificação local
          this.showLocalNotification(title, body, icon, click_action);
        }
      });
    }
  },

  // Mostra notificação local
  showLocalNotification(title, body, icon = '/logo192.png', clickAction = '/') {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon,
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
      });

      // Ação ao clicar na notificação
      notification.onclick = () => {
        window.focus();
        window.location.href = clickAction;
        notification.close();
      };

      // Auto-close após 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  },

  // Notificação de novo pedido
  notifyNewOrder(orderData) {
    this.showLocalNotification(
      '🛒 Novo Pedido!',
      `Pedido #${orderData.orderId} recebido de ${orderData.clientName}`,
      '/logo192.png',
      '/painel'
    );
  },

  // Notificação de pedido atualizado
  notifyOrderUpdate(orderData) {
    this.showLocalNotification(
      '📦 Pedido Atualizado',
      `Pedido #${orderData.orderId} - Status: ${orderData.status}`,
      '/logo192.png',
      `/pedido/${orderData.orderId}`
    );
  },

  // Notificação de oferta especial
  notifySpecialOffer(offerData) {
    this.showLocalNotification(
      '🎉 Oferta Especial!',
      offerData.message || 'Confira nossas ofertas imperdíveis!',
      '/logo192.png',
      '/ofertas'
    );
  },

  // Notificação de carrinho abandonado
  notifyCartAbandonment(cartData) {
    this.showLocalNotification(
      '🛒 Você esqueceu algo?',
      'Complete sua compra e aproveite nossas ofertas!',
      '/logo192.png',
      '/carrinho'
    );
  },

  // Verifica se notificações estão habilitadas
  isNotificationEnabled() {
    return 'Notification' in window && Notification.permission === 'granted';
  },

  // Solicita permissão para notificações
  async requestPermission() {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
};

// Inicializa automaticamente
pushNotifications.init();
pushNotifications.setupBackgroundMessages();


