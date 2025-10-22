import { useEffect, useCallback } from 'react';
import { useSimpleImageCache } from './useSimpleImageCache';

/**
 * Hook para pré-carregar imagens dos produtos mais acessados
 * Executa automaticamente quando a página carrega
 */
export const useProductImagePreloader = (products = []) => {
  const { preloadImages } = useSimpleImageCache();

  // Pré-carrega imagens dos primeiros produtos
  const preloadProductImages = useCallback(async () => {
    if (products.length === 0) return;

    // Pega os primeiros 10 produtos (mais prováveis de serem vistos)
    const topProducts = products.slice(0, 10);
    
    // Extrai todas as URLs de imagens
    const imageUrls = topProducts
      .flatMap(product => product.fotosUrl || [])
      .filter(url => url && url.trim() !== '')
      .slice(0, 20); // Limita a 20 imagens para não sobrecarregar

    if (imageUrls.length > 0) {
      console.log(`🖼️ Pré-carregando ${imageUrls.length} imagens de produtos...`);
      await preloadImages(imageUrls);
      console.log('✅ Imagens pré-carregadas com sucesso!');
    }
  }, [products, preloadImages]);

  // Executa pré-carregamento quando produtos mudam
  useEffect(() => {
    if (products.length > 0) {
      // Delay de 2 segundos para não interferir no carregamento inicial
      const timer = setTimeout(() => {
        preloadProductImages();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [products, preloadProductImages]);

  return {
    preloadProductImages
  };
};
