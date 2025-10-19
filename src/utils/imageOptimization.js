// Otimização de imagens gratuita
export const imageOptimization = {
  // Converte imagem para WebP se suportado
  convertToWebP: (imageUrl, quality = 0.8) => {
    return new Promise((resolve) => {
      if (!imageUrl) {
        resolve(imageUrl);
        return;
      }

      // Verifica se WebP é suportado
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Tenta converter para WebP
        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        
        if (webpDataUrl && webpDataUrl !== 'data:,') {
          resolve(webpDataUrl);
        } else {
          // Fallback para imagem original
          resolve(imageUrl);
        }
      };

      img.onerror = () => {
        resolve(imageUrl);
      };

      img.src = imageUrl;
    });
  },

  // Lazy loading de imagens
  lazyLoadImages: () => {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback para navegadores antigos
      images.forEach(img => {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
      });
    }
  },

  // Otimiza imagem baseada no dispositivo
  optimizeForDevice: (imageUrl, deviceType = 'desktop') => {
    if (!imageUrl) return imageUrl;

    // Tamanhos baseados no dispositivo
    const sizes = {
      mobile: { width: 400, quality: 0.7 },
      tablet: { width: 800, quality: 0.8 },
      desktop: { width: 1200, quality: 0.9 }
    };

    const config = sizes[deviceType] || sizes.desktop;
    
    // Adiciona parâmetros de otimização na URL
    const url = new URL(imageUrl);
    url.searchParams.set('w', config.width.toString());
    url.searchParams.set('q', config.quality.toString());
    
    return url.toString();
  },

  // Detecta tipo de dispositivo
  getDeviceType: () => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  },

  // Pré-carrega imagens críticas
  preloadCriticalImages: (imageUrls) => {
    imageUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  },

  // Compressa imagem antes do upload
  compressImage: (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcula novo tamanho mantendo proporção
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Desenha imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Converte para blob
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  },

  // Gera placeholder para imagens
  generatePlaceholder: (width, height, color = '#f3f4f6') => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    
    return canvas.toDataURL();
  }
};

// Inicializa lazy loading automaticamente
document.addEventListener('DOMContentLoaded', () => {
  imageOptimization.lazyLoadImages();
});
