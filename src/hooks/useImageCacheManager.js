import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar cache de imagens de forma eficiente
 * Implementa cache persistente com TTL e limpeza automática
 */
export const useImageCacheManager = () => {
  const [cacheStats, setCacheStats] = useState({
    totalImages: 0,
    cachedImages: 0,
    cacheSize: 0
  });

  // Chave única para o cache baseada na URL
  const getCacheKey = useCallback((url) => {
    return `img_cache_${btoa(url).replace(/[^a-zA-Z0-9]/g, '')}`;
  }, []);

  // Carrega imagem do cache ou baixa e salva
  const loadImage = useCallback(async (imageUrl) => {
    if (!imageUrl) return null;

    const cacheKey = getCacheKey(imageUrl);
    
    try {
      // 1. Verifica se está no cache
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        const cacheAge = 24 * 60 * 60 * 1000; // 24 horas
        
        if (now - timestamp < cacheAge) {
          console.log(`📷 Cache hit: ${imageUrl.substring(0, 50)}...`);
          return data;
        } else {
          sessionStorage.removeItem(cacheKey);
        }
      }

      // 2. Baixa a imagem
      console.log(`⬇️ Downloading: ${imageUrl.substring(0, 50)}...`);
      
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // 3. Converte para base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      // 4. Salva no cache
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: base64,
        timestamp: Date.now()
      }));
      
      console.log(`✅ Cached: ${imageUrl.substring(0, 50)}...`);
      return base64;
      
    } catch (error) {
      console.warn(`⚠️ Error loading ${imageUrl}:`, error.message);
      return imageUrl; // Fallback para URL original
    }
  }, [getCacheKey]);

  // Pré-carrega múltiplas imagens
  const preloadImages = useCallback(async (imageUrls) => {
    const promises = imageUrls
      .filter(url => url && url.trim() !== '')
      .map(url => loadImage(url));
    
    await Promise.allSettled(promises);
  }, [loadImage]);

  // Calcula estatísticas do cache
  const calculateCacheStats = useCallback(() => {
    let totalImages = 0;
    let cachedImages = 0;
    let cacheSize = 0;

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('img_cache_')) {
        totalImages++;
        const data = sessionStorage.getItem(key);
        if (data) {
          cachedImages++;
          cacheSize += data.length;
        }
      }
    }

    setCacheStats({
      totalImages,
      cachedImages,
      cacheSize: Math.round(cacheSize / 1024) // KB
    });
  }, []);

  // Limpa cache expirado
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    const cacheAge = 24 * 60 * 60 * 1000; // 24 horas
    let cleanedCount = 0;

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('img_cache_')) {
        const data = sessionStorage.getItem(key);
        if (data) {
          try {
            const { timestamp } = JSON.parse(data);
            if (now - timestamp > cacheAge) {
              sessionStorage.removeItem(key);
              cleanedCount++;
            }
          } catch (error) {
            // Remove dados corrompidos
            sessionStorage.removeItem(key);
            cleanedCount++;
          }
        }
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned ${cleanedCount} expired cache entries`);
    }
  }, []);

  // Limpa todo o cache
  const clearAllCache = useCallback(() => {
    const keysToRemove = [];
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('img_cache_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
    console.log(`🗑️ Cleared ${keysToRemove.length} cache entries`);
  }, []);

  // Atualiza estatísticas quando o cache muda
  useEffect(() => {
    calculateCacheStats();
    
    // Limpa cache expirado a cada 5 minutos
    const interval = setInterval(cleanExpiredCache, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [calculateCacheStats, cleanExpiredCache]);

  return {
    loadImage,
    preloadImages,
    cleanExpiredCache,
    clearAllCache,
    cacheStats,
    calculateCacheStats
  };
};






