import { useState, useEffect, useCallback } from 'react';

/**
 * Hook simplificado para cache de imagens
 * Evita problemas de CORS usando fetch + FileReader
 */
export const useSimpleImageCache = () => {
  const [cache, setCache] = useState(new Map());
  const [loadingImages, setLoadingImages] = useState(new Set());

  // Carrega cache existente do sessionStorage
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('simple_image_cache');
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
      sessionStorage.setItem('simple_image_cache', JSON.stringify(cacheArray));
    } catch (error) {
      console.error('Erro ao salvar cache de imagens:', error);
    }
  }, []);

  // Carrega imagem com cache (versão simplificada)
  const loadImage = useCallback(async (imageUrl) => {
    if (!imageUrl) return imageUrl;

    // Verifica se já está no cache
    if (cache.has(imageUrl)) {
      return cache.get(imageUrl);
    }

    // Verifica se já está carregando
    if (loadingImages.has(imageUrl)) {
      return imageUrl; // Retorna URL original enquanto carrega
    }

    try {
      setLoadingImages(prev => new Set(prev).add(imageUrl));

      // Usa fetch para carregar a imagem
      const response = await fetch(imageUrl, {
        mode: 'cors', // Permite CORS
        credentials: 'omit' // Não envia cookies
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Converte blob para base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => {
          console.warn('Erro ao converter imagem para base64, usando URL original');
          resolve(imageUrl); // Fallback para URL original
        };
        reader.readAsDataURL(blob);
      });
      
      // Salva no cache apenas se conseguiu converter
      if (base64 && base64 !== imageUrl) {
        const newCache = new Map(cache);
        newCache.set(imageUrl, base64);
        setCache(newCache);
        saveCache(newCache);
        return base64;
      }
      
      return imageUrl; // Fallback para URL original

    } catch (error) {
      console.warn('Erro ao processar imagem, usando URL original:', error.message);
      return imageUrl; // Fallback para URL original
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

  // Limpa cache antigo
  const cleanOldCache = useCallback(() => {
    const newCache = new Map();
    cache.forEach((value, key) => {
      // Mantém apenas entradas válidas
      if (typeof value === 'string' && (value.startsWith('data:image') || value.startsWith('http'))) {
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
    sessionStorage.removeItem('simple_image_cache');
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









