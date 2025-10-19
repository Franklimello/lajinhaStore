import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata
} from 'firebase/storage';
import { storage } from '../firebase/config';

// Configurações do Storage
const STORAGE_CONFIG = {
  // Pasta onde as imagens serão armazenadas
  IMAGES_FOLDER: 'produtos',
  // Tamanho máximo por arquivo (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  // Tipos de arquivo permitidos
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  // Qualidade de compressão (0.8 = 80%)
  COMPRESSION_QUALITY: 0.8,
  // Largura máxima das imagens
  MAX_WIDTH: 1200
};

/**
 * Comprime uma imagem antes do upload
 */
export const compressImage = (file, maxWidth = STORAGE_CONFIG.MAX_WIDTH, quality = STORAGE_CONFIG.COMPRESSION_QUALITY) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Desenhar imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Converter para blob com formato otimizado
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Falha ao comprimir imagem'));
          }
        },
        'image/webp', // Sempre converter para WebP
        quality
      );
    };

    img.onerror = () => reject(new Error('Falha ao carregar imagem para compressão'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Valida um arquivo antes do upload
 */
export const validateFile = (file) => {
  // Verificar se o arquivo existe
  if (!file) {
    throw new Error('Nenhum arquivo foi fornecido');
  }

  // Verificar tamanho
  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    throw new Error(`Arquivo muito grande. Máximo permitido: ${STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Verificar tipo
  if (!STORAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Tipo de arquivo não suportado. Use: ${STORAGE_CONFIG.ALLOWED_TYPES.join(', ')}`);
  }

  return true;
};

/**
 * Faz upload de uma imagem para o Firebase Storage
 */
export const uploadImageToStorage = async (file, options = {}) => {
  const {
    folder = STORAGE_CONFIG.IMAGES_FOLDER,
    fileName = null,
    compress = true,
    onProgress = null,
    metadata = {}
  } = options;

  try {
    console.log('🚀 Iniciando upload para Firebase Storage...');
    console.log('📄 Arquivo:', file.name, file.size, file.type);
    
    // Validar arquivo
    validateFile(file);

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = file.type.split('/')[1];
    const finalFileName = fileName || `${timestamp}_${randomId}.webp`;

    console.log('📝 Nome do arquivo:', finalFileName);

    // Caminho completo no Storage
    const storageRef = ref(storage, `${folder}/${finalFileName}`);
    console.log('📦 Referência do Storage:', storageRef.fullPath);

    // Comprimir imagem se necessário
    let fileToUpload = file;
    if (compress && file.size > 500 * 1024) { // Só comprimir se > 500KB
      onProgress?.({ stage: 'compressing', progress: 0 });
      console.log('🗜️ Comprimindo imagem...');
      fileToUpload = await compressImage(file);
      console.log(`📊 Imagem comprimida: ${file.size} → ${fileToUpload.size} bytes (${Math.round((1 - fileToUpload.size/file.size) * 100)}% redução)`);
    }

    // Metadata do arquivo
    const uploadMetadata = {
      contentType: fileToUpload.type,
      customMetadata: {
        originalName: file.name,
        originalSize: file.size.toString(),
        compressedSize: fileToUpload.size.toString(),
        uploadedAt: new Date().toISOString(),
        ...metadata
      }
    };

    console.log('📤 Fazendo upload...');
    // Fazer upload
    onProgress?.({ stage: 'uploading', progress: 0 });
    const snapshot = await uploadBytes(storageRef, fileToUpload, uploadMetadata);
    console.log('✅ Upload concluído:', snapshot.ref.fullPath);
    
    // Obter URL de download
    onProgress?.({ stage: 'getting_url', progress: 90 });
    console.log('🔗 Obtendo URL de download...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ URL obtida:', downloadURL);

    onProgress?.({ stage: 'completed', progress: 100, url: downloadURL });

    return {
      success: true,
      url: downloadURL,
      fileName: finalFileName,
      path: `${folder}/${finalFileName}`,
      size: fileToUpload.size,
      originalSize: file.size,
      compressionRatio: Math.round((1 - fileToUpload.size/file.size) * 100)
    };

  } catch (error) {
    console.error('❌ Erro no upload para Firebase Storage:', error);
    console.error('❌ Detalhes do erro:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    onProgress?.({ stage: 'error', error: error.message });
    throw error;
  }
};

/**
 * Faz upload de múltiplas imagens
 */
export const uploadMultipleImages = async (files, options = {}) => {
  const results = [];
  const totalFiles = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    options.onProgress?.({ 
      stage: 'uploading_multiple', 
      current: i + 1, 
      total: totalFiles,
      fileName: file.name 
    });

    try {
      const result = await uploadImageToStorage(file, {
        ...options,
        onProgress: (progress) => {
          options.onProgress?.({
            ...progress,
            current: i + 1,
            total: totalFiles,
            fileName: file.name
          });
        }
      });
      results.push(result);
    } catch (error) {
      console.error(`❌ Erro ao fazer upload da imagem ${i + 1}:`, error);
      results.push({
        success: false,
        error: error.message,
        fileName: file.name
      });
    }
  }

  return results;
};

/**
 * Deleta uma imagem do Storage
 */
export const deleteImageFromStorage = async (imagePath) => {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    console.log('✅ Imagem deletada com sucesso:', imagePath);
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao deletar imagem:', error);
    throw error;
  }
};

/**
 * Lista todas as imagens em uma pasta
 */
export const listImagesInFolder = async (folder = STORAGE_CONFIG.IMAGES_FOLDER) => {
  try {
    const folderRef = ref(storage, folder);
    const result = await listAll(folderRef);
    
    const images = await Promise.all(
      result.items.map(async (item) => {
        const metadata = await getMetadata(item);
        const url = await getDownloadURL(item);
        
        return {
          name: item.name,
          path: item.fullPath,
          url,
          size: metadata.size,
          contentType: metadata.contentType,
          createdAt: metadata.timeCreated,
          updatedAt: metadata.updated,
          customMetadata: metadata.customMetadata
        };
      })
    );

    return { success: true, images };
  } catch (error) {
    console.error('❌ Erro ao listar imagens:', error);
    throw error;
  }
};

/**
 * Obtém informações de uma imagem específica
 */
export const getImageInfo = async (imagePath) => {
  try {
    const imageRef = ref(storage, imagePath);
    const metadata = await getMetadata(imageRef);
    const url = await getDownloadURL(imageRef);
    
    return {
      success: true,
      name: metadata.name,
      path: imagePath,
      url,
      size: metadata.size,
      contentType: metadata.contentType,
      createdAt: metadata.timeCreated,
      updatedAt: metadata.updated,
      customMetadata: metadata.customMetadata
    };
  } catch (error) {
    console.error('❌ Erro ao obter informações da imagem:', error);
    throw error;
  }
};

/**
 * Atualiza metadata de uma imagem
 */
export const updateImageMetadata = async (imagePath, newMetadata) => {
  try {
    const imageRef = ref(storage, imagePath);
    await updateMetadata(imageRef, {
      customMetadata: newMetadata
    });
    console.log('✅ Metadata atualizada:', imagePath);
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao atualizar metadata:', error);
    throw error;
  }
};

/**
 * Verifica se uma URL é do Firebase Storage
 */
export const isFirebaseStorageUrl = (url) => {
  return url && url.includes('firebasestorage.googleapis.com');
};

/**
 * Extrai o path do Storage de uma URL
 */
export const getStoragePathFromUrl = (url) => {
  if (!isFirebaseStorageUrl(url)) return null;
  
  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
    return pathMatch ? decodeURIComponent(pathMatch[1]) : null;
  } catch (error) {
    console.error('❌ Erro ao extrair path da URL:', error);
    return null;
  }
};

export default {
  uploadImageToStorage,
  uploadMultipleImages,
  deleteImageFromStorage,
  listImagesInFolder,
  getImageInfo,
  updateImageMetadata,
  compressImage,
  validateFile,
  isFirebaseStorageUrl,
  getStoragePathFromUrl,
  STORAGE_CONFIG
};
