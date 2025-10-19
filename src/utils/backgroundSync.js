// Background sync para ações offline (gratuito)
export const backgroundSync = {
  // Registra sync em background
  registerSync: async (tag, data) => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Salva dados para sincronização
        await this.saveForSync(tag, data);
        
        // Registra o sync
        await registration.sync.register(tag);
        
        console.log('Background sync registrado:', tag);
        return true;
      } catch (error) {
        console.error('Erro ao registrar background sync:', error);
        return false;
      }
    }
    return false;
  },

  // Salva dados para sincronização
  saveForSync: async (tag, data) => {
    const syncData = {
      tag,
      data,
      timestamp: Date.now(),
      retries: 0
    };

    // Salva no localStorage (em produção, use IndexedDB)
    const existingSyncs = JSON.parse(localStorage.getItem('backgroundSyncs') || '[]');
    existingSyncs.push(syncData);
    localStorage.setItem('backgroundSyncs', JSON.stringify(existingSyncs));
  },

  // Sincroniza pedido offline
  syncOrder: async (orderData) => {
    return await this.registerSync('sync-order', {
      type: 'order',
      data: orderData
    });
  },

  // Sincroniza carrinho offline
  syncCart: async (cartData) => {
    return await this.registerSync('sync-cart', {
      type: 'cart',
      data: cartData
    });
  },

  // Sincroniza favoritos offline
  syncFavorites: async (favoritesData) => {
    return await this.registerSync('sync-favorites', {
      type: 'favorites',
      data: favoritesData
    });
  },

  // Sincroniza dados de usuário offline
  syncUserData: async (userData) => {
    return await this.registerSync('sync-user', {
      type: 'user',
      data: userData
    });
  },

  // Verifica se background sync é suportado
  isSupported: () => {
    return 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
  },

  // Processa sincronizações pendentes
  processPendingSyncs: async () => {
    if (!navigator.onLine) return;

    const pendingSyncs = JSON.parse(localStorage.getItem('backgroundSyncs') || '[]');
    
    for (const sync of pendingSyncs) {
      try {
        await this.processSync(sync);
        await this.removeSync(sync);
      } catch (error) {
        console.error('Erro ao processar sync:', error);
        await this.incrementRetries(sync);
      }
    }
  },

  // Processa uma sincronização específica
  processSync: async (sync) => {
    const { type, data } = sync.data;

    switch (type) {
      case 'order':
        return await this.syncOrderToServer(data);
      case 'cart':
        return await this.syncCartToServer(data);
      case 'favorites':
        return await this.syncFavoritesToServer(data);
      case 'user':
        return await this.syncUserDataToServer(data);
      default:
        throw new Error(`Tipo de sync não suportado: ${type}`);
    }
  },

  // Sincroniza pedido com servidor
  syncOrderToServer: async (orderData) => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      throw new Error(`Erro ao sincronizar pedido: ${response.status}`);
    }

    return response.json();
  },

  // Sincroniza carrinho com servidor
  syncCartToServer: async (cartData) => {
    const response = await fetch('/api/cart', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cartData)
    });

    if (!response.ok) {
      throw new Error(`Erro ao sincronizar carrinho: ${response.status}`);
    }

    return response.json();
  },

  // Sincroniza favoritos com servidor
  syncFavoritesToServer: async (favoritesData) => {
    const response = await fetch('/api/favorites', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(favoritesData)
    });

    if (!response.ok) {
      throw new Error(`Erro ao sincronizar favoritos: ${response.status}`);
    }

    return response.json();
  },

  // Sincroniza dados de usuário com servidor
  syncUserDataToServer: async (userData) => {
    const response = await fetch('/api/user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error(`Erro ao sincronizar dados do usuário: ${response.status}`);
    }

    return response.json();
  },

  // Remove sync após processamento bem-sucedido
  removeSync: async (sync) => {
    const pendingSyncs = JSON.parse(localStorage.getItem('backgroundSyncs') || '[]');
    const filteredSyncs = pendingSyncs.filter(s => s.timestamp !== sync.timestamp);
    localStorage.setItem('backgroundSyncs', JSON.stringify(filteredSyncs));
  },

  // Incrementa tentativas de sync
  incrementRetries: async (sync) => {
    const pendingSyncs = JSON.parse(localStorage.getItem('backgroundSyncs') || '[]');
    const updatedSyncs = pendingSyncs.map(s => {
      if (s.timestamp === sync.timestamp) {
        return { ...s, retries: s.retries + 1 };
      }
      return s;
    });
    localStorage.setItem('backgroundSyncs', JSON.stringify(updatedSyncs));
  },

  // Limpa syncs antigos
  cleanupOldSyncs: () => {
    const pendingSyncs = JSON.parse(localStorage.getItem('backgroundSyncs') || '[]');
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const recentSyncs = pendingSyncs.filter(sync => sync.timestamp > oneWeekAgo);
    localStorage.setItem('backgroundSyncs', JSON.stringify(recentSyncs));
  }
};

// Processa syncs quando volta online
window.addEventListener('online', () => {
  backgroundSync.processPendingSyncs();
});

// Limpa syncs antigos periodicamente
setInterval(() => {
  backgroundSync.cleanupOldSyncs();
}, 24 * 60 * 60 * 1000); // Uma vez por dia
