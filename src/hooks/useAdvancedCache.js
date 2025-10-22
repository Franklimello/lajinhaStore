import { useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';

/**
 * Hook para cache avançado com IndexedDB
 * Implementa pré-busca e cache persistente
 */
export const useAdvancedCache = () => {
  const [cache, setCache] = useState(new Map());
  const [isReady, setIsReady] = useState(false);

  // Inicializa IndexedDB
  useEffect(() => {
    const initCache = async () => {
      try {
        // Configura localforage
        localforage.config({
          driver: localforage.INDEXEDDB,
          name: 'EcommerceCache',
          version: 1.0,
          storeName: 'products'
        });

        // Carrega cache existente
        const keys = await localforage.keys();
        const cacheData = new Map();
        
        for (const key of keys) {
          const value = await localforage.getItem(key);
          if (value) {
            cacheData.set(key, value);
          }
        }
        
        setCache(cacheData);
        setIsReady(true);
      } catch (error) {
        console.error('Erro ao inicializar cache:', error);
        setIsReady(true);
      }
    };

    initCache();
  }, []);

  // Função para salvar no cache
  const setCacheItem = useCallback(async (key, value, ttl = 5 * 60 * 1000) => {
    try {
      const cacheItem = {
        data: value,
        timestamp: Date.now(),
        ttl
      };
      
      await localforage.setItem(key, cacheItem);
      setCache(prev => new Map(prev.set(key, cacheItem)));
    } catch (error) {
      console.error('Erro ao salvar no cache:', error);
    }
  }, []);

  // Função para buscar do cache
  const getCacheItem = useCallback(async (key) => {
    try {
      const cached = cache.get(key);
      
      if (!cached) {
        const stored = await localforage.getItem(key);
        if (stored) {
          setCache(prev => new Map(prev.set(key, stored)));
          return stored;
        }
        return null;
      }

      // Verifica se o cache expirou
      if (Date.now() - cached.timestamp > cached.ttl) {
        await localforage.removeItem(key);
        setCache(prev => {
          const newCache = new Map(prev);
          newCache.delete(key);
          return newCache;
        });
        return null;
      }

      return cached;
    } catch (error) {
      console.error('Erro ao buscar do cache:', error);
      return null;
    }
  }, [cache]);

  // Função para pré-buscar produtos populares
  const preloadPopularProducts = useCallback(async () => {
    try {
      const popularCategories = ['Mercearia', 'Bebidas', 'Limpeza'];
      const promises = popularCategories.map(async (category) => {
        const cacheKey = `popular_${category}`;
        const cached = await getCacheItem(cacheKey);
        
        if (!cached) {
          // Simula busca de produtos populares
          const products = await fetchPopularProducts(category);
          await setCacheItem(cacheKey, products, 10 * 60 * 1000); // 10 minutos
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Erro na pré-busca:', error);
    }
  }, [getCacheItem, setCacheItem]);

  // Função para limpar cache expirado
  const cleanExpiredCache = useCallback(async () => {
    try {
      const keys = await localforage.keys();
      const now = Date.now();
      
      for (const key of keys) {
        const item = await localforage.getItem(key);
        if (item && now - item.timestamp > item.ttl) {
          await localforage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }, []);

  return {
    isReady,
    setCacheItem,
    getCacheItem,
    preloadPopularProducts,
    cleanExpiredCache
  };
};

// Função simulada para buscar produtos populares
const fetchPopularProducts = async (category) => {
  // Esta função seria implementada com a lógica real de busca
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: '1', titulo: 'Produto Popular 1', preco: 10.99, categoria: category },
        { id: '2', titulo: 'Produto Popular 2', preco: 15.99, categoria: category }
      ]);
    }, 100);
  });
};
