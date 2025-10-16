export const uploadImageToCloudinary = async (file, options = {}) => {
  const {
    maxRetries = 3,
    timeoutMs = 60000, // 60 segundos
    maxSizeBytes = 10 * 1024 * 1024, // 10MB
    onProgress = null
  } = options;

  // Validações iniciais
  if (!file) {
    throw new Error("Nenhum arquivo foi fornecido");
  }

  if (file.size > maxSizeBytes) {
    throw new Error(`Arquivo muito grande. Máximo permitido: ${maxSizeBytes / (1024 * 1024)}MB`);
  }

  // Tipos de arquivo permitidos
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Tipo de arquivo não suportado. Use: JPEG, PNG, WEBP ou GIF");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "uploadEmpregue");

  // Função para fazer uma tentativa de upload
  const attemptUpload = async (attemptNumber) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      if (onProgress) {
        onProgress({ stage: 'uploading', attempt: attemptNumber });
      }

      const response = await fetch("https://api.cloudinary.com/v1_1/dxkmqaqjs/image/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Falha no upload da imagem'}`);
      }

      const data = await response.json();
      
      if (onProgress) {
        onProgress({ stage: 'completed', url: data.secure_url });
      }

      return data.secure_url;

    } catch (error) {
      clearTimeout(timeoutId);

      // Tratar diferentes tipos de erro
      if (error.name === 'AbortError') {
        throw new Error(`Timeout após ${timeoutMs / 1000} segundos. Tente com uma imagem menor.`);
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Problema de conexão com a internet. Verifique sua conexão.');
      }

      throw error;
    }
  };

  // Loop de tentativas com retry
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (onProgress && attempt > 1) {
        onProgress({ stage: 'retrying', attempt });
      }

      const result = await attemptUpload(attempt);
      return result;

    } catch (error) {
      lastError = error;
      console.warn(`Tentativa ${attempt}/${maxRetries} falhou:`, error.message);

      // Se não é a última tentativa, aguardar antes de tentar novamente
      if (attempt < maxRetries) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Backoff exponencial, máximo 5s
        console.log(`Aguardando ${delayMs}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  // Se chegou aqui, todas as tentativas falharam
  console.error("Erro final ao enviar imagem para Cloudinary:", lastError);
  throw new Error(`Upload falhou após ${maxRetries} tentativas: ${lastError.message}`);
};

// Função auxiliar para comprimir imagem (opcional)
export const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width = (width * maxWidth) / height;
          height = maxWidth;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Desenhar imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Converter para blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Falha ao comprimir imagem'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Falha ao carregar imagem para compressão'));
    img.src = URL.createObjectURL(file);
  });
};

// Exemplo de uso com progresso e compressão
export const uploadWithCompression = async (file, onProgress = null) => {
  try {
    onProgress?.({ stage: 'validating' });

    // Comprimir se a imagem for muito grande
    let fileToUpload = file;
    if (file.size > 2 * 1024 * 1024) { // Se > 2MB
      onProgress?.({ stage: 'compressing' });
      fileToUpload = await compressImage(file);
    }

    onProgress?.({ stage: 'preparing' });

    const url = await uploadImageToCloudinary(fileToUpload, {
      maxRetries: 3,
      timeoutMs: 60000,
      onProgress
    });

    return url;

  } catch (error) {
    onProgress?.({ stage: 'error', error: error.message });
    throw error;
  }
};

