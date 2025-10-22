import React, { memo } from 'react';
import CachedImage from './CachedImage';

/**
 * OptimizedImage - Componente de imagem com múltiplos formatos
 * Suporte a AVIF, WebP e fallback com cache automático
 */
const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 80,
  ...props 
}) => {
  // Gera URLs para diferentes formatos e tamanhos
  const getOptimizedSrc = (originalSrc, format, size = '') => {
    if (!originalSrc) return '';
    
    // Remove extensão original
    const baseName = originalSrc.replace(/\.[^/.]+$/, '');
    
    // Adiciona sufixo de tamanho se especificado
    const sizeSuffix = size ? `-${size}` : '';
    
    return `${baseName}${sizeSuffix}.${format}`;
  };

  // Gera srcSet para diferentes tamanhos
  const generateSrcSet = (format) => {
    const sizes = ['sm', 'md', 'lg'];
    return sizes
      .map(size => {
        const url = getOptimizedSrc(src, format, size);
        const width = size === 'sm' ? '400w' : size === 'md' ? '800w' : '1200w';
        return `${url} ${width}`;
      })
      .join(', ');
  };

  // URLs para diferentes formatos
  const avifSrc = getOptimizedSrc(src, 'avif');
  const webpSrc = getOptimizedSrc(src, 'webp');
  const fallbackSrc = src;

  // SrcSets para responsividade
  const avifSrcSet = generateSrcSet('avif');
  const webpSrcSet = generateSrcSet('webp');
  const fallbackSrcSet = generateSrcSet('jpg');

  return (
    <picture>
      {/* AVIF - Formato mais moderno e eficiente */}
      {avifSrc && (
        <source 
          srcSet={avifSrcSet || avifSrc} 
          type="image/avif"
          sizes={sizes}
        />
      )}
      
      {/* WebP - Suporte amplo e boa compressão */}
      {webpSrc && (
        <source 
          srcSet={webpSrcSet || webpSrc} 
          type="image/webp"
          sizes={sizes}
        />
      )}
      
      {/* Fallback - Formato original otimizado */}
      <CachedImage
        src={fallbackSrc}
        alt={alt}
        className={className}
        sizes={sizes}
        fallback="/placeholder.jpg"
        {...props}
      />
    </picture>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;









