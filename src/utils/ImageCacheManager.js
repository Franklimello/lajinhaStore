/**
 * ImageCacheManager - Sistema completo de cache para Firebase Storage
 * Baseado no código fornecido, otimizado para o projeto
 */

class ImageCacheManager {
  constructor() {
    this.cacheName = 'firebase-images-cache';
    this.stats = {
      totalImages: 0,
      cachedImages: 0,
      cacheSize: 0,
      cacheRate: 0
    };
    this.initDB();
  }

  // Inicializar IndexedDB
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ImageCacheDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.updateStats();
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'url' });
        }
      };
    });
  }

  // Buscar imagem (cache-first strategy)
  async getImage(firebaseUrl) {
    try {
      this.stats.totalImages++;
      
      // 1. Tentar buscar do cache
      const cached = await this.getCachedImage(firebaseUrl);
      if (cached) {
        this.stats.cachedImages++;
        console.log('✓ Imagem do cache:', firebaseUrl.substring(0, 50));
        return cached.dataUrl;
      }

      // 2. Buscar da rede e cachear
      console.log('↓ Baixando imagem:', firebaseUrl.substring(0, 50));
      const response = await fetch(firebaseUrl, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Converter para base64 para armazenar
      const dataUrl = await this.blobToDataUrl(blob);
      
      // Salvar no cache
      await this.saveToCache(firebaseUrl, dataUrl, blob.size);
      
      this.updateStats();
      return dataUrl;
      
    } catch (error) {
      console.error('Erro ao buscar imagem:', error);
      return firebaseUrl; // Fallback
    }
  }

  // Buscar do cache
  async getCachedImage(url) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      const request = store.get(url);
      
      request.onsuccess = () => {
        const data = request.result;
        // Verificar se não expirou (7 dias)
        if (data && (Date.now() - data.timestamp) < 7 * 24 * 60 * 60 * 1000) {
          resolve(data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  }

  // Salvar no cache
  async saveToCache(url, dataUrl, size) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      
      const data = {
        url: url,
        dataUrl: dataUrl,
        size: size,
        timestamp: Date.now()
      };
      
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Converter blob para data URL
  blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Atualizar estatísticas
  async updateStats() {
    if (!this.db) return;
    
    return new Promise((resolve) => {
      const transaction = this.db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      const countRequest = store.count();
      
      countRequest.onsuccess = () => {
        const cachedCount = countRequest.result;
        
        // Calcular tamanho total
        const cursorRequest = store.openCursor();
        let totalSize = 0;
        
        cursorRequest.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            totalSize += cursor.value.size || 0;
            cursor.continue();
          } else {
            this.stats.cacheSize = totalSize;
            this.stats.cacheRate = this.stats.totalImages > 0 
              ? (this.stats.cachedImages / this.stats.totalImages) * 100 
              : 0;
            
            // Disparar evento para atualizar UI
            window.dispatchEvent(new CustomEvent('cacheStatsUpdated', { 
              detail: this.getStats() 
            }));
            
            resolve();
          }
        };
      };
    });
  }

  // Obter estatísticas formatadas
  getStats() {
    return {
      totalImages: this.stats.totalImages,
      cachedImages: this.stats.cachedImages,
      cacheSize: this.formatBytes(this.stats.cacheSize),
      cacheRate: Math.round(this.stats.cacheRate)
    };
  }

  // Formatar bytes
  formatBytes(bytes) {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Limpar cache
  async clearCache() {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      const request = store.clear();
      
      request.onsuccess = () => {
        this.stats = {
          totalImages: 0,
          cachedImages: 0,
          cacheSize: 0,
          cacheRate: 0
        };
        this.updateStats();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Limpar cache expirado (mais de 7 dias)
  async clearExpiredCache() {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve) => {
      const transaction = this.db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      const request = store.openCursor();
      const expirationTime = 7 * 24 * 60 * 60 * 1000;
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (Date.now() - cursor.value.timestamp > expirationTime) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          this.updateStats();
          resolve();
        }
      };
    });
  }
}

// Exportar instância única (singleton)
export const imageCacheManager = new ImageCacheManager();









