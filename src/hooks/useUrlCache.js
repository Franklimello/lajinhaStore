import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para cache simples de URLs de imagens
 * Evita problemas de CORS usando apenas cache de URLs
 */
export const useUrlCache = () => {
  const [cache, setCache] = useState(new Set());
  const [loadingImages, setLoadingImages] = useState(new Set());

  // Carrega cache existente do sessionStorage
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('url_cache');
      if (cached) {
        const cacheData = JSON.parse(cached);
        setCache(new Set(cacheData));
      }
    } catch (error) {
      console.error('Erro ao carregar cache de URLs:', error);
    }
  }, []);

  // Salva cache no sessionStorage
  const saveCache = useCallback((newCache) => {
    try {
      const cacheArray = Array.from(newCache);
      sessionStorage.setItem('url_cache', JSON.stringify(cacheArray));
    } catch (error) {
      console.error('Erro ao salvar cache de URLs:', error);
    }
  }, []);

  // Pré-carrega imagem (apenas marca como carregada)
  const preloadImage = useCallback(async (imageUrl) => {
    if (!imageUrl || cache.has(imageUrl)) return imageUrl;

    // Verifica se já está carregando
    if (loadingImages.has(imageUrl)) {
      return imageUrl;
    }

    try {
      setLoadingImages(prev => new Set(prev).add(imageUrl));

      // Cria uma nova imagem para pré-carregar
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Marca como carregada no cache
          const newCache = new Set(cache);
          newCache.add(imageUrl);
          setCache(newCache);
          saveCache(newCache);
          resolve();
        };
        
        img.onerror = () => {
          console.warn('Erro ao pré-carregar imagem:', imageUrl);
          resolve(); // Não falha, apenas não adiciona ao cache
        };
        
        img.src = imageUrl;
      });

      return imageUrl;

    } catch (error) {
      console.warn('Erro ao pré-carregar imagem:', error.message);
      return imageUrl;
    } finally {
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageUrl);
        return newSet;
      });
    }
  }, [cache, loadingImages, saveCache]);

  // Pré-carrega múltiplas imagens
  const preloadImages = useCallback(async (imageUrls) => {
    const promises = imageUrls
      .filter(url => url && !cache.has(url))
      .map(url => preloadImage(url));
    
    await Promise.allSettled(promises);
  }, [cache, preloadImage]);

  // Verifica se imagem está no cache
  const isCached = useCallback((imageUrl) => {
    return cache.has(imageUrl);
  }, [cache]);

  // Limpa cache antigo
  const cleanOldCache = useCallback(() => {
    // Mantém apenas URLs válidas
    const newCache = new Set();
    cache.forEach(url => {
      if (typeof url === 'string' && url.startsWith('http')) {
        newCache.add(url);
      }
    });
    
    if (newCache.size !== cache.size) {
      setCache(newCache);
      saveCache(newCache);
    }
  }, [cache, saveCache]);

  // Limpa todo o cache
  const clearCache = useCallback(() => {
    setCache(new Set());
    sessionStorage.removeItem('url_cache');
  }, []);

  return {
    preloadImage,
    preloadImages,
    isCached,
    cleanOldCache,
    clearCache,
    cacheSize: cache.size,
    isLoading: loadingImages.size > 0
  };
};







