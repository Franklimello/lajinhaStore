/**
 * 💾 IndexedDB Cache - Sistema de Cache Persistente
 * 
 * Cache mais robusto que sessionStorage, com maior capacidade
 * e persistência entre sessões.
 */

class IndexedDBCache {
  constructor() {
    this.dbName = 'CompreAquiCache';
    this.version = 1;
    this.db = null;
    this.isSupported = this._checkSupport();
    this.initPromise = this._init();
  }

  /**
   * 🔍 Verificar suporte a IndexedDB
   */
  _checkSupport() {
    if (typeof window === 'undefined') return false;
    
    const hasIndexedDB = 'indexedDB' in window;
    
    if (!hasIndexedDB) {
      console.warn('⚠️ IndexedDB não suportado neste navegador');
    }
    
    return hasIndexedDB;
  }

  /**
   * 🚀 Inicializar banco de dados
   */
  async _init() {
    if (!this.isSupported) {
      console.warn('⚠️ IndexedDB não disponível, usando fallback');
      return null;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('❌ Erro ao abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB inicializado com sucesso');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store para produtos
        if (!db.objectStoreNames.contains('products')) {
          const productsStore = db.createObjectStore('products', { keyPath: 'key' });
          productsStore.createIndex('categoria', 'categoria', { unique: false });
          productsStore.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('📦 Store "products" criado');
        }

        // Store para cache genérico
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('📦 Store "cache" criado');
        }

        // Store para imagens (URLs pré-carregadas)
        if (!db.objectStoreNames.contains('images')) {
          const imagesStore = db.createObjectStore('images', { keyPath: 'url' });
          imagesStore.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('📦 Store "images" criado');
        }
      };
    });
  }

  /**
   * 💾 Salvar no cache
   */
  async set(storeName, key, data, ttl = 5 * 60 * 1000) {
    await this.initPromise;
    
    if (!this.db) {
      console.warn('⚠️ IndexedDB não disponível, usando sessionStorage');
      return this._fallbackSet(storeName, key, data, ttl);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const cacheEntry = {
        key,
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl
      };

      const request = store.put(cacheEntry);

      request.onsuccess = () => {
        console.log(`💾 [IndexedDB] Salvo: ${storeName}/${key}`);
        resolve(true);
      };

      request.onerror = () => {
        console.error(`❌ [IndexedDB] Erro ao salvar: ${storeName}/${key}`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 📥 Ler do cache
   */
  async get(storeName, key) {
    await this.initPromise;
    
    if (!this.db) {
      console.warn('⚠️ IndexedDB não disponível, usando sessionStorage');
      return this._fallbackGet(storeName, key);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result;

        if (!entry) {
          console.log(`📭 [IndexedDB] Cache miss: ${storeName}/${key}`);
          resolve(null);
          return;
        }

        // Verificar expiração
        if (Date.now() > entry.expiresAt) {
          console.log(`⏰ [IndexedDB] Cache expirado: ${storeName}/${key}`);
          this.delete(storeName, key); // Limpar entrada expirada
          resolve(null);
          return;
        }

        console.log(`✅ [IndexedDB] Cache hit: ${storeName}/${key}`);
        resolve(entry.data);
      };

      request.onerror = () => {
        console.error(`❌ [IndexedDB] Erro ao ler: ${storeName}/${key}`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 🗑️ Deletar do cache
   */
  async delete(storeName, key) {
    await this.initPromise;
    
    if (!this.db) {
      return this._fallbackDelete(storeName, key);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        console.log(`🗑️ [IndexedDB] Deletado: ${storeName}/${key}`);
        resolve(true);
      };

      request.onerror = () => {
        console.error(`❌ [IndexedDB] Erro ao deletar: ${storeName}/${key}`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 🧹 Limpar cache expirado
   */
  async clearExpired(storeName = 'products') {
    await this.initPromise;
    
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.openCursor();

      let deletedCount = 0;
      const now = Date.now();

      request.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
          const entry = cursor.value;

          if (now > entry.expiresAt) {
            cursor.delete();
            deletedCount++;
          }

          cursor.continue();
        } else {
          console.log(`🧹 [IndexedDB] ${deletedCount} entradas expiradas removidas de ${storeName}`);
          resolve(deletedCount);
        }
      };

      request.onerror = () => {
        console.error(`❌ [IndexedDB] Erro ao limpar: ${storeName}`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 🗑️ Limpar toda a store
   */
  async clear(storeName) {
    await this.initPromise;
    
    if (!this.db) {
      return this._fallbackClear(storeName);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log(`🗑️ [IndexedDB] Store limpa: ${storeName}`);
        resolve(true);
      };

      request.onerror = () => {
        console.error(`❌ [IndexedDB] Erro ao limpar: ${storeName}`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 📊 Obter estatísticas do cache
   */
  async getStats(storeName = 'products') {
    await this.initPromise;
    
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result;
        const now = Date.now();

        const stats = {
          total: entries.length,
          valid: 0,
          expired: 0,
          totalSize: 0,
          byCategory: {}
        };

        entries.forEach(entry => {
          const isExpired = now > entry.expiresAt;
          
          if (isExpired) {
            stats.expired++;
          } else {
            stats.valid++;
          }

          // Estimar tamanho
          stats.totalSize += JSON.stringify(entry).length;

          // Agrupar por categoria (se houver)
          if (entry.categoria) {
            stats.byCategory[entry.categoria] = (stats.byCategory[entry.categoria] || 0) + 1;
          }
        });

        // Converter tamanho para KB
        stats.totalSizeKB = (stats.totalSize / 1024).toFixed(2);

        console.log(`📊 [IndexedDB] Stats de ${storeName}:`, stats);
        resolve(stats);
      };

      request.onerror = () => {
        console.error(`❌ [IndexedDB] Erro ao obter stats: ${storeName}`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 🔄 Migrar do sessionStorage para IndexedDB
   */
  async migrateFromSessionStorage() {
    console.log('🔄 [IndexedDB] Migrando dados do sessionStorage...');

    let migratedCount = 0;

    try {
      // Buscar todas as chaves do sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        
        // Apenas migrar chaves relacionadas a produtos
        if (key && key.startsWith('products_')) {
          const data = sessionStorage.getItem(key);
          
          try {
            const parsed = JSON.parse(data);
            
            // Salvar no IndexedDB
            await this.set('products', key, parsed.products || parsed, 5 * 60 * 1000);
            migratedCount++;
          } catch (e) {
            console.warn(`⚠️ Erro ao migrar ${key}:`, e);
          }
        }
      }

      console.log(`✅ [IndexedDB] ${migratedCount} entradas migradas do sessionStorage`);
    } catch (error) {
      console.error('❌ [IndexedDB] Erro na migração:', error);
    }
  }

  // ========================================
  // FALLBACKS para quando IndexedDB não está disponível
  // ========================================

  _fallbackSet(storeName, key, data, ttl) {
    try {
      const fullKey = `${storeName}_${key}`;
      const entry = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl
      };
      sessionStorage.setItem(fullKey, JSON.stringify(entry));
      console.log(`💾 [Fallback] Salvo no sessionStorage: ${fullKey}`);
      return true;
    } catch (e) {
      console.warn('⚠️ [Fallback] Erro ao salvar no sessionStorage:', e);
      return false;
    }
  }

  _fallbackGet(storeName, key) {
    try {
      const fullKey = `${storeName}_${key}`;
      const data = sessionStorage.getItem(fullKey);
      
      if (!data) return null;
      
      const entry = JSON.parse(data);
      
      if (Date.now() > entry.expiresAt) {
        sessionStorage.removeItem(fullKey);
        return null;
      }
      
      console.log(`✅ [Fallback] Lido do sessionStorage: ${fullKey}`);
      return entry.data;
    } catch (e) {
      console.warn('⚠️ [Fallback] Erro ao ler do sessionStorage:', e);
      return null;
    }
  }

  _fallbackDelete(storeName, key) {
    try {
      const fullKey = `${storeName}_${key}`;
      sessionStorage.removeItem(fullKey);
      console.log(`🗑️ [Fallback] Deletado do sessionStorage: ${fullKey}`);
      return true;
    } catch (e) {
      console.warn('⚠️ [Fallback] Erro ao deletar do sessionStorage:', e);
      return false;
    }
  }

  _fallbackClear(storeName) {
    try {
      const keysToDelete = [];
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(`${storeName}_`)) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => sessionStorage.removeItem(key));
      console.log(`🗑️ [Fallback] ${keysToDelete.length} itens limpos do sessionStorage`);
      return true;
    } catch (e) {
      console.warn('⚠️ [Fallback] Erro ao limpar sessionStorage:', e);
      return false;
    }
  }
}

// Singleton global
const indexedDBCache = new IndexedDBCache();

// Expor globalmente para debug
if (typeof window !== 'undefined') {
  window.indexedDBCache = indexedDBCache;
  console.log('💾 IndexedDBCache disponível globalmente: window.indexedDBCache');
  console.log('📊 Comandos úteis:');
  console.log('  - indexedDBCache.getStats("products")');
  console.log('  - indexedDBCache.clearExpired("products")');
  console.log('  - indexedDBCache.clear("products")');
}

// Limpar cache expirado ao inicializar
indexedDBCache.initPromise.then(() => {
  indexedDBCache.clearExpired('products');
  indexedDBCache.clearExpired('cache');
  indexedDBCache.clearExpired('images');
});

export default indexedDBCache;

