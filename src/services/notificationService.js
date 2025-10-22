// services/notificationService.js
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, messaging } from '../firebase/config';

/**
 * Serviço de Notificações usando Firebase Cloud Messaging (FCM)
 * 
 * ⚠️ IMPORTANTE:
 * - Este serviço lida apenas com o FRONTEND
 * - O ENVIO real de push notifications é feito via Cloud Functions (backend)
 * - Este arquivo: solicita permissão, salva tokens, escuta mensagens
 */
export class NotificationService {
  static fcmToken = null;
  static messageUnsubscribe = null;

  /**
   * Solicita permissão para notificações e obtém token FCM
   * @returns {Promise<string|null>} Token FCM ou null se negado
   */
  static async requestPermission() {
    try {
      console.log('🔔 Solicitando permissão para notificações...');

      // 1. Verificar se notificações são suportadas
      if (!('Notification' in window)) {
        console.warn('⚠️ Notificações não suportadas neste navegador');
        return null;
      }

      // 2. Solicitar permissão
      const permission = await Notification.requestPermission();
      console.log('📋 Permissão:', permission);

      if (permission !== 'granted') {
        console.warn('❌ Permissão para notificações negada');
        return null;
      }

      // 3. Obter token FCM
      const token = await this.getFCMToken();
      
      if (token) {
        console.log('✅ Token FCM obtido com sucesso');
        this.fcmToken = token;
        
        // Salva no localStorage para referência
        localStorage.setItem('fcm_token', token);
        localStorage.setItem('fcm_token_date', new Date().toISOString());
        
        return token;
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
      return null;
    }
  }

  /**
   * Obtém o token FCM do dispositivo
   * @returns {Promise<string|null>}
   */
  static async getFCMToken() {
    try {
      if (!messaging) {
        console.error('❌ Firebase Messaging não inicializado');
        return null;
      }

      // Obter VAPID Key do .env
      const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;
      
      if (!vapidKey) {
        console.error('❌ VAPID Key não configurada no .env');
        console.error('Configure REACT_APP_FIREBASE_VAPID_KEY no arquivo .env');
        return null;
      }

      console.log('🔑 Obtendo token FCM...');

      const token = await getToken(messaging, {
        vapidKey: vapidKey
      });

      if (token) {
        console.log('✅ Token FCM:', token.substring(0, 20) + '...');
        return token;
      } else {
        console.warn('⚠️ Nenhum token disponível. Solicite permissão primeiro.');
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao obter token FCM:', error);
      
      if (error.code === 'messaging/permission-blocked') {
        console.error('🚫 Permissão bloqueada. O usuário precisa habilitar nas configurações do navegador.');
      }
      
      return null;
    }
  }

  /**
   * Salva o token FCM do usuário no Firestore
   * @param {string} userId - ID do usuário
   * @param {string} token - Token FCM
   * @returns {Promise<boolean>}
   */
  static async saveUserToken(userId, token) {
    if (!userId || !token) {
      console.error('❌ userId e token são obrigatórios');
      return false;
    }

    try {
      console.log('💾 Salvando token no Firestore...');

      await setDoc(
        doc(db, 'userTokens', userId),
        {
          token,
          userId,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          active: true,
          platform: this.getPlatform(),
          userAgent: navigator.userAgent
        },
        { merge: true } // Atualiza sem sobrescrever tudo
      );

      console.log('✅ Token salvo com sucesso no Firestore');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar token:', error);
      return false;
    }
  }

  /**
   * Remove o token FCM do usuário (logout/desabilitar notificações)
   * @param {string} userId - ID do usuário
   * @returns {Promise<boolean>}
   */
  static async removeUserToken(userId) {
    try {
      await setDoc(
        doc(db, 'userTokens', userId),
        { active: false, updatedAt: serverTimestamp() },
        { merge: true }
      );

      localStorage.removeItem('fcm_token');
      localStorage.removeItem('fcm_token_date');
      this.fcmToken = null;

      console.log('✅ Token removido com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover token:', error);
      return false;
    }
  }

  /**
   * Cria uma notificação no Firestore (histórico)
   * ⚠️ IMPORTANTE: Isso NÃO envia push notification
   * O push real é enviado via Cloud Functions
   * 
   * @param {string} userId - ID do usuário destinatário
   * @param {string} title - Título da notificação
   * @param {string} body - Corpo da notificação
   * @param {Object} data - Dados adicionais
   * @returns {Promise<boolean>}
   */
  static async createNotification(userId, title, body, data = {}) {
    try {
      console.log('📝 Criando notificação no Firestore...', { userId, title });

      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        body,
        data,
        createdAt: serverTimestamp(),
        read: false,
        type: data.type || 'general'
      });

      // Mostra notificação local apenas se o app estiver aberto
      if (Notification.permission === 'granted' && !document.hidden) {
        this.showLocalNotification(title, body, data);
      }

      console.log('✅ Notificação criada no Firestore');
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error);
      return false;
    }
  }

  /**
   * Configura listener para mensagens FCM em foreground
   * (quando o app está aberto)
   * 
   * @param {Function} callback - Função chamada ao receber mensagem
   * @returns {Function} Função para cancelar o listener
   */
  static setupMessageListener(callback) {
    if (!messaging) {
      console.warn('⚠️ Firebase Messaging não inicializado');
      return () => {};
    }

    console.log('👂 Configurando listener de mensagens FCM...');

    // Cancela listener anterior se existir
    if (this.messageUnsubscribe) {
      this.messageUnsubscribe();
    }

    // Cria novo listener
    this.messageUnsubscribe = onMessage(messaging, (payload) => {
      console.log('📬 [Foreground] Mensagem FCM recebida:', payload);

      const { title, body, icon } = payload.notification || {};
      const notificationData = payload.data || {};

      // Mostra notificação local
      this.showLocalNotification(
        title || 'Nova Notificação',
        body || '',
        {
          icon: icon || '/logo192.png',
          ...notificationData
        }
      );

      // Chama callback se fornecido
      if (callback && typeof callback === 'function') {
        callback(payload);
      }

      // Dispara evento customizado (para atualizar UI)
      window.dispatchEvent(new CustomEvent('fcm-message', { 
        detail: payload 
      }));
    });

    console.log('✅ Listener de mensagens configurado');
    return this.messageUnsubscribe;
  }

  /**
   * Mostra notificação local (no navegador)
   * Só funciona se o app estiver aberto
   * 
   * @param {string} title - Título
   * @param {string} body - Corpo
   * @param {Object} options - Opções adicionais
   */
  static showLocalNotification(title, body, options = {}) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.warn('⚠️ Permissão de notificação não concedida');
      return;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: options.icon || '/logo192.png',
        badge: '/logo192.png',
        tag: options.tag || `notification-${Date.now()}`,
        requireInteraction: false,
        silent: false,
        data: options
      });

      // Handler para clique na notificação
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();

        // Navega para URL se fornecida
        if (options.url) {
          window.location.href = options.url;
        }

        notification.close();
      };

      // Auto-close após 6 segundos
      setTimeout(() => {
        notification.close();
      }, 6000);

      console.log('✅ Notificação local exibida');
    } catch (error) {
      console.error('❌ Erro ao exibir notificação local:', error);
    }
  }

  /**
   * Verifica se notificações estão habilitadas
   * @returns {boolean}
   */
  static isNotificationEnabled() {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  /**
   * Obtém token armazenado localmente
   * @returns {string|null}
   */
  static getStoredToken() {
    return localStorage.getItem('fcm_token');
  }

  /**
   * Verifica se o token precisa ser renovado (mais de 7 dias)
   * @returns {boolean}
   */
  static shouldRenewToken() {
    const tokenDate = localStorage.getItem('fcm_token_date');
    if (!tokenDate) return true;

    const daysSinceCreation = (Date.now() - new Date(tokenDate).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation > 7;
  }

  /**
   * Detecta plataforma do dispositivo
   * @returns {string}
   */
  static getPlatform() {
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) return 'android';
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/mac/.test(ua)) return 'macos';
    if (/win/.test(ua)) return 'windows';
    if (/linux/.test(ua)) return 'linux';
    return 'unknown';
  }

  /**
   * Toca som de notificação (opcional)
   */
  static playNotificationSound() {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => {
        console.log('⚠️ Não foi possível tocar som:', err.message);
      });
    } catch (error) {
      // Ignora erro se não houver arquivo de som
    }
  }

  /**
   * Limpa todos os listeners
   */
  static cleanup() {
    if (this.messageUnsubscribe) {
      this.messageUnsubscribe();
      this.messageUnsubscribe = null;
    }
    console.log('🧹 Listeners de notificação limpos');
  }
}

// Export default para compatibilidade
export default NotificationService;