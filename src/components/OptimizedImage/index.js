import { useState, useRef, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/placeholder.jpg',
  loading = 'lazy',
  quality = 80,
  width,
  height,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (loading !== 'lazy') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Carrega 50px antes de entrar na tela
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  // Gerar URL otimizada do Cloudinary
  const getOptimizedUrl = (originalUrl) => {
    if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
      return originalUrl;
    }

    // Se já tem parâmetros de transformação, não modificar
    if (originalUrl.includes('/upload/')) {
      return originalUrl;
    }

    // Adicionar transformações de otimização
    const baseUrl = originalUrl.split('/upload/')[0];
    const publicId = originalUrl.split('/upload/')[1];
    
    return `${baseUrl}/upload/q_${quality},f_auto,w_auto${width ? `,w_${width}` : ''}${height ? `,h_${height}` : ''}/${publicId}`;
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const optimizedSrc = isInView ? getOptimizedUrl(src) : placeholder;

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder/loading state */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width: '100%', height: '100%' }}
        >
          <div className="text-gray-400 text-sm">📷</div>
        </div>
      )}

      {/* Imagem otimizada */}
      <img
        src={hasError ? placeholder : optimizedSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          ...props.style 
        }}
        {...props}
      />

      {/* Skeleton loader personalizado */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}
    </div>
  );
};

export default OptimizedImage;
