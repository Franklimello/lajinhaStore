// Suporte offline para o PWA
export const offlineSupport = {
  // Verifica se está offline
  isOffline: () => !navigator.onLine,

  // Adiciona listener para mudanças de conectividade
  onConnectionChange: (callback) => {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  },

  // Cache de dados críticos
  cacheCriticalData: () => {
    const criticalData = {
      categories: ['Hortifruti', 'Açougue', 'Frios e Laticínios', 'Mercearia'],
      contactInfo: {
        phone: '+55-33-99999-9999',
        address: 'Lajinha, MG'
      },
      lastUpdate: Date.now()
    };

    localStorage.setItem('offline-data', JSON.stringify(criticalData));
  },

  // Recupera dados do cache
  getCachedData: () => {
    const cached = localStorage.getItem('offline-data');
    return cached ? JSON.parse(cached) : null;
  },

  // Mostra notificação de offline
  showOfflineNotification: () => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      new Notification('Modo Offline', {
        body: 'Você está offline. Algumas funcionalidades podem estar limitadas.',
        icon: '/logo192.png',
        tag: 'offline-notification'
      });
    }
  },

  // Queue de ações offline
  offlineQueue: [],

  // Adiciona ação à queue offline
  addToOfflineQueue: (action) => {
    const queue = JSON.parse(localStorage.getItem('offline-queue') || '[]');
    queue.push({
      ...action,
      timestamp: Date.now()
    });
    localStorage.setItem('offline-queue', JSON.stringify(queue));
  },

  // Processa queue quando volta online
  processOfflineQueue: async () => {
    const queue = JSON.parse(localStorage.getItem('offline-queue') || '[]');
    
    for (const action of queue) {
      try {
        // Aqui você implementaria a lógica para processar cada ação
        console.log('Processando ação offline:', action);
      } catch (error) {
        console.error('Erro ao processar ação offline:', error);
      }
    }

    // Limpa a queue após processar
    localStorage.removeItem('offline-queue');
  }
};


