import { useState, useEffect } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { imageCacheManager } from '../utils/ImageCacheManager';

/**
 * Hook customizado para imagens cacheadas do Firebase Storage
 * Baseado no código fornecido, otimizado para o projeto
 */
export function useCachedFirebaseImage(imagePath) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadImage() {
      if (!imagePath) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // 1. Obter URL do Firebase Storage
        const storage = getStorage();
        const imageRef = ref(storage, imagePath);
        const firebaseUrl = await getDownloadURL(imageRef);
        
        // 2. Buscar imagem (com cache)
        const cachedUrl = await imageCacheManager.getImage(firebaseUrl);
        
        if (mounted) {
          setImageUrl(cachedUrl);
          setLoading(false);
        }
      } catch (err) {
        console.error('Erro ao carregar imagem:', err);
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      }
    }

    loadImage();

    return () => {
      mounted = false;
    };
  }, [imagePath]);

  return { imageUrl, loading, error };
}







