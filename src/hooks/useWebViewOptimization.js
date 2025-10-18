import { useEffect } from 'react';
import { isSocialMediaWebView, optimizeForWebView } from '../utils/instagramWebView';

export const useWebViewOptimization = () => {
  useEffect(() => {
    if (isSocialMediaWebView()) {
      // Otimizar para WebView
      optimizeForWebView();
      
      // Reduzir complexidade de carregamento
      const style = document.createElement('style');
      style.textContent = `
        /* Reduzir animações em WebView */
        * {
          animation-duration: 0.1s !important;
          transition-duration: 0.1s !important;
        }
        
        /* Simplificar carregamento de imagens */
        img {
          loading: eager !important;
        }
        
        /* Otimizar para WebView */
        .swiper {
          overflow: visible !important;
        }
      `;
      document.head.appendChild(style);
      
      // Forçar carregamento de imagens
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach(img => {
        img.loading = 'eager';
        img.decoding = 'sync';
      });
      
      // Simplificar carrosséis
      const swipers = document.querySelectorAll('.swiper');
      swipers.forEach(swiper => {
        swiper.style.overflow = 'visible';
      });
    }
  }, []);
  
  return {
    isWebView: isSocialMediaWebView()
  };
};

