import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para cache de imagens dos produtos
 * Salva imagens no cache após o primeiro acesso
 */
export const useImageCache = () => {
  const [cache, setCache] = useState(new Map());
  const [loadingImages, setLoadingImages] = useState(new Set());

  // Carrega cache existente do sessionStorage
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('image_cache');
      if (cached) {
        const cacheData = JSON.parse(cached);
        const cacheMap = new Map(cacheData);
        setCache(cacheMap);
      }
    } catch (error) {
      console.error('Erro ao carregar cache de imagens:', error);
    }
  }, []);

  // Salva cache no sessionStorage
  const saveCache = useCallback((newCache) => {
    try {
      const cacheArray = Array.from(newCache.entries());
      sessionStorage.setItem('image_cache', JSON.stringify(cacheArray));
    } catch (error) {
      console.error('Erro ao salvar cache de imagens:', error);
    }
  }, []);

  // Carrega imagem com cache
  const loadImage = useCallback(async (imageUrl) => {
    if (!imageUrl) return null;

    // Verifica se já está no cache
    if (cache.has(imageUrl)) {
      return cache.get(imageUrl);
    }

    // Verifica se já está carregando
    if (loadingImages.has(imageUrl)) {
      return null;
    }

    try {
      setLoadingImages(prev => new Set(prev).add(imageUrl));

      // Usa fetch para carregar a imagem e converter para base64
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Converte blob para base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      // Salva no cache
      const newCache = new Map(cache);
      newCache.set(imageUrl, base64);
      setCache(newCache);
      saveCache(newCache);
      
      return base64;

    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      // Em caso de erro, retorna a URL original
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
      .map(url => loadImage(url));
    
    await Promise.allSettled(promises);
  }, [cache, loadImage]);

  // Limpa cache antigo (mais de 1 hora)
  const cleanOldCache = useCallback(() => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    const newCache = new Map();
    cache.forEach((value, key) => {
      // Se o cache não tem timestamp, mantém
      if (typeof value === 'string' && value.startsWith('data:image')) {
        newCache.set(key, value);
      }
    });
    
    if (newCache.size !== cache.size) {
      setCache(newCache);
      saveCache(newCache);
    }
  }, [cache, saveCache]);

  // Limpa todo o cache
  const clearCache = useCallback(() => {
    setCache(new Map());
    sessionStorage.removeItem('image_cache');
  }, []);

  return {
    loadImage,
    preloadImages,
    cleanOldCache,
    clearCache,
    cacheSize: cache.size,
    isLoading: loadingImages.size > 0
  };
};
