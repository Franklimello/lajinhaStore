import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc,
  query,
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadImageToStorage, getStoragePathFromUrl } from './firebaseStorage';

/**
 * Migra todas as imagens existentes do Cloudinary para o Firebase Storage
 */
export const migrateAllImages = async (onProgress = null) => {
  try {
    console.log('🚀 Iniciando migração de imagens...');
    
    // Buscar todos os produtos no Firestore
    const produtosRef = collection(db, 'produtos');
    const snapshot = await getDocs(query(produtosRef, orderBy('criadoEm', 'desc')));
    
    const produtos = [];
    snapshot.forEach((doc) => {
      produtos.push({ id: doc.id, ...doc.data() });
    });

    console.log(`📊 Encontrados ${produtos.length} produtos para migrar`);

    const migrationResults = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      migratedProducts: []
    };

    // Processar cada produto
    for (let i = 0; i < produtos.length; i++) {
      const produto = produtos[i];
      migrationResults.total++;

      onProgress?.({
        stage: 'migrating',
        current: i + 1,
        total: produtos.length,
        productName: produto.titulo,
        progress: Math.round(((i + 1) / produtos.length) * 100)
      });

      try {
        // Verificar se o produto tem imagens
        if (!produto.fotosUrl || produto.fotosUrl.length === 0) {
          console.log(`⏭️ Produto "${produto.titulo}" não tem imagens, pulando...`);
          migrationResults.skipped++;
          continue;
        }

        // Verificar se as imagens já estão no Firebase Storage
        const alreadyMigrated = produto.fotosUrl.every(url => 
          url.includes('firebasestorage.googleapis.com')
        );

        if (alreadyMigrated) {
          console.log(`✅ Produto "${produto.titulo}" já está migrado, pulando...`);
          migrationResults.skipped++;
          continue;
        }

        console.log(`🔄 Migrando produto: ${produto.titulo} (${produto.fotosUrl.length} imagens)`);

        // Migrar imagens do produto
        const migratedImages = await migrateProductImages(produto, onProgress);
        
        if (migratedImages.success) {
          // Atualizar o produto no Firestore com as novas URLs
          await updateProductImages(produto.id, migratedImages.newUrls, migratedImages.oldUrls);
          
          migrationResults.success++;
          migrationResults.migratedProducts.push({
            id: produto.id,
            titulo: produto.titulo,
            oldUrls: migratedImages.oldUrls,
            newUrls: migratedImages.newUrls
          });

          console.log(`✅ Produto "${produto.titulo}" migrado com sucesso!`);
        } else {
          migrationResults.failed++;
          migrationResults.errors.push({
            productId: produto.id,
            productName: produto.titulo,
            error: migratedImages.error
          });
          console.error(`❌ Falha ao migrar produto "${produto.titulo}":`, migratedImages.error);
        }

      } catch (error) {
        migrationResults.failed++;
        migrationResults.errors.push({
          productId: produto.id,
          productName: produto.titulo,
          error: error.message
        });
        console.error(`❌ Erro ao processar produto "${produto.titulo}":`, error);
      }
    }

    console.log('🎉 Migração concluída!');
    console.log('📊 Resultados:', migrationResults);

    return {
      success: true,
      results: migrationResults
    };

  } catch (error) {
    console.error('❌ Erro geral na migração:', error);
    onProgress?.({ stage: 'error', error: error.message });
    throw error;
  }
};

/**
 * Migra as imagens de um produto específico
 */
export const migrateProductImages = async (produto, onProgress = null) => {
  try {
    const newUrls = [];
    const oldUrls = [...produto.fotosUrl];

    for (let i = 0; i < produto.fotosUrl.length; i++) {
      const imageUrl = produto.fotosUrl[i];
      
      onProgress?.({
        stage: 'migrating_image',
        current: i + 1,
        total: produto.fotosUrl.length,
        imageUrl,
        productName: produto.titulo
      });

      try {
        // Verificar se a imagem já está no Firebase Storage
        if (imageUrl.includes('firebasestorage.googleapis.com')) {
          console.log(`⏭️ Imagem já está no Firebase Storage: ${imageUrl}`);
          newUrls.push(imageUrl);
          continue;
        }

        // Baixar a imagem do serviço atual
        const imageBlob = await downloadImageFromUrl(imageUrl);
        
        // Fazer upload para o Firebase Storage
        const uploadResult = await uploadImageToStorage(imageBlob, {
          folder: 'produtos',
          fileName: `${produto.id}_${i + 1}.webp`,
          compress: true,
          metadata: {
            originalUrl: imageUrl,
            productId: produto.id,
            productName: produto.titulo,
            migrationDate: new Date().toISOString()
          }
        });

        newUrls.push(uploadResult.url);
        console.log(`✅ Imagem ${i + 1} migrada: ${uploadResult.url}`);

      } catch (error) {
        console.error(`❌ Erro ao migrar imagem ${i + 1}:`, error);
        // Em caso de erro, manter a URL original
        newUrls.push(imageUrl);
      }
    }

    return {
      success: true,
      newUrls,
      oldUrls
    };

  } catch (error) {
    console.error('❌ Erro ao migrar imagens do produto:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Baixa uma imagem de uma URL e retorna como Blob
 */
export const downloadImageFromUrl = async (url) => {
  try {
    console.log(`📥 Baixando imagem: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'image/*'
      }
    });

    if (!response.ok) {
      throw new Error(`Falha ao baixar imagem: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    console.log(`📊 Imagem baixada: ${blob.size} bytes`);
    
    return blob;

  } catch (error) {
    console.error('❌ Erro ao baixar imagem:', error);
    throw error;
  }
};

/**
 * Atualiza as URLs das imagens de um produto no Firestore
 */
export const updateProductImages = async (productId, newUrls, oldUrls) => {
  try {
    const productRef = doc(db, 'produtos', productId);
    
    await updateDoc(productRef, {
      fotosUrl: newUrls,
      // Manter histórico das URLs antigas para possível restauração
      fotosUrlBackup: oldUrls,
      migrationDate: new Date().toISOString()
    });

    console.log(`✅ URLs atualizadas para produto ${productId}`);
    return { success: true };

  } catch (error) {
    console.error('❌ Erro ao atualizar URLs do produto:', error);
    throw error;
  }
};

/**
 * Restaura as URLs originais de um produto (para voltar ao serviço anterior)
 */
export const restoreOriginalImages = async (productId) => {
  try {
    const productRef = doc(db, 'produtos', productId);
    
    // Buscar o produto para obter as URLs de backup
    const productDoc = await getDocs(query(collection(db, 'produtos'), where('__name__', '==', productId)));
    
    if (productDoc.empty) {
      throw new Error('Produto não encontrado');
    }

    const productData = productDoc.docs[0].data();
    
    if (!productData.fotosUrlBackup) {
      throw new Error('Não há backup das URLs originais');
    }

    // Restaurar URLs originais
    await updateDoc(productRef, {
      fotosUrl: productData.fotosUrlBackup,
      restoredDate: new Date().toISOString()
    });

    console.log(`✅ URLs originais restauradas para produto ${productId}`);
    return { success: true };

  } catch (error) {
    console.error('❌ Erro ao restaurar URLs originais:', error);
    throw error;
  }
};

/**
 * Lista produtos que ainda não foram migrados
 */
export const getUnmigratedProducts = async () => {
  try {
    const produtosRef = collection(db, 'produtos');
    const snapshot = await getDocs(produtosRef);
    
    const unmigratedProducts = [];
    
    snapshot.forEach((doc) => {
      const produto = { id: doc.id, ...doc.data() };
      
      // Verificar se tem imagens e se não estão no Firebase Storage
      if (produto.fotosUrl && produto.fotosUrl.length > 0) {
        const hasCloudinaryImages = produto.fotosUrl.some(url => 
          !url.includes('firebasestorage.googleapis.com')
        );
        
        if (hasCloudinaryImages) {
          unmigratedProducts.push(produto);
        }
      }
    });

    return { success: true, products: unmigratedProducts };

  } catch (error) {
    console.error('❌ Erro ao buscar produtos não migrados:', error);
    throw error;
  }
};

/**
 * Obtém estatísticas da migração
 */
export const getMigrationStats = async () => {
  try {
    const produtosRef = collection(db, 'produtos');
    const snapshot = await getDocs(produtosRef);
    
    let total = 0;
    let migrated = 0;
    let unmigrated = 0;
    let withoutImages = 0;

    snapshot.forEach((doc) => {
      const produto = doc.data();
      total++;
      
      if (!produto.fotosUrl || produto.fotosUrl.length === 0) {
        withoutImages++;
      } else if (produto.fotosUrl.every(url => url.includes('firebasestorage.googleapis.com'))) {
        migrated++;
      } else {
        unmigrated++;
      }
    });

    return {
      success: true,
      stats: {
        total,
        migrated,
        unmigrated,
        withoutImages,
        migrationProgress: total > 0 ? Math.round((migrated / (migrated + unmigrated)) * 100) : 0
      }
    };

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    throw error;
  }
};

export default {
  migrateAllImages,
  migrateProductImages,
  restoreOriginalImages,
  getUnmigratedProducts,
  getMigrationStats,
  downloadImageFromUrl,
  updateProductImages
};
