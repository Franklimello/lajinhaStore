import React, { memo } from 'react';
import { useCachedFirebaseImage } from '../../hooks/useCachedFirebaseImage';

/**
 * CachedFirebaseImage - Componente de imagem com cache do Firebase Storage
 * Baseado no código fornecido, otimizado para o projeto
 */
const CachedFirebaseImage = memo(({ 
  imagePath, 
  alt, 
  className = '', 
  fallback = '/placeholder.jpg',
  onLoad,
  onError,
  ...props 
}) => {
  const { imageUrl, loading, error } = useCachedFirebaseImage(imagePath);

  const handleLoad = () => {
    onLoad?.();
  };

  const handleError = () => {
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        src={error ? fallback : (imageUrl || fallback)}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loading ? 'opacity-0' : 'opacity-100'
        } ${error ? 'grayscale' : ''}`}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      
      {error && (
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

CachedFirebaseImage.displayName = 'CachedFirebaseImage';

export default CachedFirebaseImage;







