import React, { useState, memo } from 'react';

/**
 * CachedImage - Componente de imagem simples com lazy loading
 * Versão simplificada sem cache de Base64 para evitar problemas de CORS
 */
const CachedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  fallback = '/placeholder.jpg',
  onLoad,
  onError,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
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
        src={hasError ? fallback : src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${hasError ? 'grayscale' : ''}`}
        loading="lazy"
        onLoad={handleLoad}
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

CachedImage.displayName = 'CachedImage';

export default CachedImage;