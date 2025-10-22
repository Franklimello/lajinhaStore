import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase/config';

// Push notifications com Firebase Cloud Messaging
export const pushNotifications = {
  swRegistration: null,
  fcmToken: null,

  // Inicializa o service worker e solicita permissão
  async init() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('❌ Push notifications não suportadas neste navegador');
      return { success: false, error: 'not_supported' };
    }

    try {
      // Registra o service worker
      this.swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      console.log('✅ Service Worker registrado:', this.swRegistration);

      // Aguarda o service worker estar pronto
      await navigator.serviceWorker.ready;

      // Solicita permissão para notificações
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ Permissão para notificações concedida');
        
        // Obtém token FCM
        await this.getFCMToken();
        
        // Configura listener para mensagens em foreground
        this.setupForegroundListener();
        
        return { success: true, token: this.fcmToken };
      } else {
        console.log('❌ Permissão para notificações negada');
        return { success: false, error: 'permission_denied' };
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar push notifications:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtém token FCM
  async getFCMToken() {
    try {
      if (!messaging) {
        throw new Error('Firebase Messaging não inicializado');
      }

      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: this.swRegistration
      });

      if (token) {
        this.fcmToken = token;
        console.log('🔑 Token FCM obtido:', token);
        
        // Salva token no localStorage para referência
        localStorage.setItem('fcm_token', token);
        
        return token;
      } else {
        console.log('❌ Nenhum token disponível. Solicite permissão primeiro.');
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao obter token FCM:', error);
      return null;
    }
  },

  // Configura listener para mensagens quando app está em foreground
  setupForegroundListener() {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log('📬 Mensagem recebida (foreground):', payload);
      
      const { title, body, icon, click_action } = payload.notification || {};
      const notificationData = payload.data || {};

      // Exibe notificação local
      this.showLocalNotification(
        title || 'Nova Notificação',
        body || '',
        icon || '/logo192.png',
        click_action || notificationData.url || '/'
      );
    });
  },

  // Mostra notificação local (simplificada - sem actions)
  showLocalNotification(title, body, icon = '/logo192.png', clickAction = '/') {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.log('❌ Permissão de notificação não concedida');
      return;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon,
        badge: '/logo192.png',
        tag: `compreaqui-${Date.now()}`, // Tag única para cada notificação
        requireInteraction: false,
        silent: false,
        data: { url: clickAction }
      });

      // Ação ao clicar na notificação
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        if (clickAction && clickAction !== '/') {
          window.location.href = clickAction;
        }
        
        notification.close();
      };

      // Auto-close após 6 segundos
      setTimeout(() => {
        notification.close();
      }, 6000);

    } catch (error) {
      console.error('❌ Erro ao exibir notificação:', error);
    }
  },

  // Notificação de novo pedido (para administradores)
  notifyNewOrder(orderData) {
    const { orderId, clientName, total, items } = orderData;
    const itemCount = items?.length || 0;
    
    this.showLocalNotification(
      '🛒 Novo Pedido Recebido!',
      `Pedido #${orderId} de ${clientName}\n${itemCount} ${itemCount === 1 ? 'item' : 'itens'} • R$ ${total?.toFixed(2)}`,
      '/logo192.png',
      `/painel/pedidos/${orderId}`
    );

    // Toca som de notificação (opcional)
    this.playNotificationSound();
  },

  // Notificação de pedido atualizado
  notifyOrderUpdate(orderData) {
    const statusText = {
      pending: 'Pendente',
      processing: 'Em Processamento',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };

    this.showLocalNotification(
      '📦 Status do Pedido Atualizado',
      `Pedido #${orderData.orderId}\nStatus: ${statusText[orderData.status] || orderData.status}`,
      '/logo192.png',
      `/pedidos/${orderData.orderId}`
    );
  },

  // Notificação de oferta especial
  notifySpecialOffer(offerData) {
    this.showLocalNotification(
      '🎉 Oferta Especial!',
      offerData.message || 'Confira nossas ofertas imperdíveis!',
      offerData.icon || '/logo192.png',
      offerData.url || '/ofertas'
    );
  },

  // Notificação de carrinho abandonado
  notifyCartAbandonment(cartData) {
    const itemCount = cartData.items?.length || 0;
    
    this.showLocalNotification(
      '🛒 Você esqueceu algo!',
      `${itemCount} ${itemCount === 1 ? 'item' : 'itens'} esperando por você no carrinho`,
      '/logo192.png',
      '/carrinho'
    );
  },

  // Notificação de produto de volta ao estoque
  notifyBackInStock(productData) {
    this.showLocalNotification(
      '✨ Produto Disponível!',
      `${productData.name} está de volta ao estoque!`,
      productData.image || '/logo192.png',
      `/produto/${productData.id}`
    );
  },

  // Toca som de notificação (opcional)
  playNotificationSound() {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Erro ao tocar som:', err));
    } catch (error) {
      // Ignora erro se não houver arquivo de som
    }
  },

  // Verifica se notificações estão habilitadas
  isNotificationEnabled() {
    return 'Notification' in window && Notification.permission === 'granted';
  },

  // Solicita permissão para notificações
  async requestPermission() {
    if (!('Notification' in window)) {
      return { success: false, error: 'not_supported' };
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      await this.getFCMToken();
      return { success: true, token: this.fcmToken };
    }
    
    return { success: false, error: 'permission_denied' };
  },

  // Remove token FCM (logout/desabilitar notificações)
  async removeToken() {
    try {
      localStorage.removeItem('fcm_token');
      this.fcmToken = null;
      console.log('✅ Token FCM removido');
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover token:', error);
      return false;
    }
  },

  // Obtém token armazenado
  getStoredToken() {
    return localStorage.getItem('fcm_token');
  }
};