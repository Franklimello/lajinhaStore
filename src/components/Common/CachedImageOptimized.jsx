import React, { useState, useEffect, memo, useCallback } from 'react';

/**
 * CachedImageOptimized - Componente de imagem com cache persistente
 * Implementa cache no navegador para evitar downloads repetidos
 */
const CachedImageOptimized = memo(({ 
  src, 
  alt, 
  className = '', 
  fallback = '/placeholder.jpg',
  onLoad,
  onError,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Chave única para o cache baseada na URL
  const getCacheKey = useCallback((url) => {
    return `img_cache_${btoa(url).replace(/[^a-zA-Z0-9]/g, '')}`;
  }, []);

  // Carrega imagem do cache ou baixa e salva
  const loadImage = useCallback(async (imageUrl) => {
    if (!imageUrl) return fallback;

    const cacheKey = getCacheKey(imageUrl);
    
    try {
      // 1. Verifica se está no cache do navegador (sessionStorage)
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        const cacheAge = 24 * 60 * 60 * 1000; // 24 horas
        
        // Se o cache não expirou, usa a imagem cached
        if (now - timestamp < cacheAge) {
          console.log(`📷 Imagem carregada do cache: ${imageUrl.substring(0, 50)}...`);
          return data;
        } else {
          // Remove cache expirado
          sessionStorage.removeItem(cacheKey);
        }
      }

      // 2. Se não está no cache, baixa a imagem
      console.log(`⬇️ Baixando imagem: ${imageUrl.substring(0, 50)}...`);
      
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // 3. Converte para base64 para cache
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
      
      console.log(`✅ Imagem salva no cache: ${imageUrl.substring(0, 50)}...`);
      return base64;
      
    } catch (error) {
      console.warn(`⚠️ Erro ao carregar imagem ${imageUrl}:`, error.message);
      return imageUrl; // Fallback para URL original
    }
  }, [getCacheKey, fallback]);

  // Carrega a imagem quando o componente monta
  useEffect(() => {
    if (!src) {
      setImageSrc(fallback);
      setIsLoading(false);
      return;
    }

    const loadImageAsync = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        const cachedImage = await loadImage(src);
        setImageSrc(cachedImage);
        onLoad?.();
        
      } catch (error) {
        console.error('Erro ao carregar imagem:', error);
        setHasError(true);
        setImageSrc(fallback);
        onError?.();
      } finally {
        setIsLoading(false);
      }
    };

    loadImageAsync();
  }, [src, loadImage, fallback, onLoad, onError]);

  const handleError = () => {
    setHasError(true);
    setImageSrc(fallback);
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        src={imageSrc || fallback}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${hasError ? 'grayscale' : ''}`}
        loading="lazy"
        onError={handleError}
        {...props}
      />
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-xs">Imagem não disponível</div>
          </div>
        </div>
      )}
    </div>
  );
});

CachedImageOptimized.displayName = 'CachedImageOptimized';

export default CachedImageOptimized;







