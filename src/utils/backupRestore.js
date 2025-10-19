import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc,
  query,
  orderBy,
  writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  listImagesInFolder, 
  deleteImageFromStorage,
  getStoragePathFromUrl 
} from './firebaseStorage';

/**
 * Sistema de Backup e Restauração para Migração de Imagens
 */

/**
 * Cria um backup completo de todas as URLs de imagens
 */
export const createImageBackup = async () => {
  try {
    console.log('📦 Criando backup das URLs de imagens...');
    
    const produtosRef = collection(db, 'produtos');
    const snapshot = await getDocs(query(produtosRef, orderBy('criadoEm', 'desc')));
    
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      products: []
    };

    snapshot.forEach((doc) => {
      const produto = doc.data();
      
      // Incluir apenas produtos com imagens
      if (produto.fotosUrl && produto.fotosUrl.length > 0) {
        backup.products.push({
          id: doc.id,
          titulo: produto.titulo,
          fotosUrl: produto.fotosUrl,
          fotosUrlBackup: produto.fotosUrlBackup || null,
          migrationDate: produto.migrationDate || null,
          createdAt: produto.criadoEm || null
        });
      }
    });

    console.log(`✅ Backup criado com ${backup.products.length} produtos`);
    return { success: true, backup };

  } catch (error) {
    console.error('❌ Erro ao criar backup:', error);
    throw error;
  }
};

/**
 * Restaura todas as imagens para o serviço original
 */
export const restoreAllImages = async (onProgress = null) => {
  try {
    console.log('🔄 Iniciando restauração de todas as imagens...');
    
    const produtosRef = collection(db, 'produtos');
    const snapshot = await getDocs(query(produtosRef, orderBy('criadoEm', 'desc')));
    
    const products = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });

    const restoreResults = {
      total: 0,
      success: 0,
      failed: 0,
      noBackup: 0,
      errors: []
    };

    // Processar cada produto
    for (let i = 0; i < products.length; i++) {
      const produto = products[i];
      restoreResults.total++;

      onProgress?.({
        stage: 'restoring',
        current: i + 1,
        total: products.length,
        productName: produto.titulo,
        progress: Math.round(((i + 1) / products.length) * 100)
      });

      try {
        // Verificar se tem backup
        if (!produto.fotosUrlBackup) {
          console.log(`⚠️ Produto "${produto.titulo}" não tem backup, pulando...`);
          restoreResults.noBackup++;
          continue;
        }

        // Restaurar URLs originais
        const productRef = doc(db, 'produtos', produto.id);
        await updateDoc(productRef, {
          fotosUrl: produto.fotosUrlBackup,
          restoredDate: new Date().toISOString(),
          // Manter as URLs do Firebase como backup
          fotosUrlFirebase: produto.fotosUrl
        });

        restoreResults.success++;
        console.log(`✅ Produto "${produto.titulo}" restaurado com sucesso!`);

      } catch (error) {
        restoreResults.failed++;
        restoreResults.errors.push({
          productId: produto.id,
          productName: produto.titulo,
          error: error.message
        });
        console.error(`❌ Erro ao restaurar produto "${produto.titulo}":`, error);
      }
    }

    console.log('🎉 Restauração concluída!');
    console.log('📊 Resultados:', restoreResults);

    return { success: true, results: restoreResults };

  } catch (error) {
    console.error('❌ Erro geral na restauração:', error);
    onProgress?.({ stage: 'error', error: error.message });
    throw error;
  }
};

/**
 * Limpa imagens do Firebase Storage que não estão sendo usadas
 */
export const cleanupUnusedImages = async (onProgress = null) => {
  try {
    console.log('🧹 Iniciando limpeza de imagens não utilizadas...');
    
    // Listar todas as imagens no Storage
    const storageResult = await listImagesInFolder('produtos');
    if (!storageResult.success) {
      throw new Error('Falha ao listar imagens no Storage');
    }

    // Buscar todas as URLs de imagens em uso no Firestore
    const produtosRef = collection(db, 'produtos');
    const snapshot = await getDocs(produtosRef);
    
    const usedUrls = new Set();
    snapshot.forEach((doc) => {
      const produto = doc.data();
      if (produto.fotosUrl) {
        produto.fotosUrl.forEach(url => usedUrls.add(url));
      }
    });

    const cleanupResults = {
      total: storageResult.images.length,
      deleted: 0,
      kept: 0,
      errors: []
    };

    // Verificar cada imagem no Storage
    for (let i = 0; i < storageResult.images.length; i++) {
      const image = storageResult.images[i];
      
      onProgress?.({
        stage: 'cleanup',
        current: i + 1,
        total: storageResult.images.length,
        imageName: image.name,
        progress: Math.round(((i + 1) / storageResult.images.length) * 100)
      });

      try {
        // Verificar se a imagem está sendo usada
        if (usedUrls.has(image.url)) {
          console.log(`✅ Imagem "${image.name}" está em uso, mantendo...`);
          cleanupResults.kept++;
        } else {
          // Deletar imagem não utilizada
          await deleteImageFromStorage(image.path);
          console.log(`🗑️ Imagem "${image.name}" deletada (não utilizada)`);
          cleanupResults.deleted++;
        }

      } catch (error) {
        cleanupResults.errors.push({
          imageName: image.name,
          error: error.message
        });
        console.error(`❌ Erro ao processar imagem "${image.name}":`, error);
      }
    }

    console.log('🎉 Limpeza concluída!');
    console.log('📊 Resultados:', cleanupResults);

    return { success: true, results: cleanupResults };

  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
    onProgress?.({ stage: 'error', error: error.message });
    throw error;
  }
};

/**
 * Migra todas as imagens de volta para o Firebase Storage
 */
export const migrateBackToFirebase = async (onProgress = null) => {
  try {
    console.log('🚀 Migrando todas as imagens de volta para Firebase Storage...');
    
    const produtosRef = collection(db, 'produtos');
    const snapshot = await getDocs(query(produtosRef, orderBy('criadoEm', 'desc')));
    
    const products = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });

    const migrationResults = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    // Processar cada produto
    for (let i = 0; i < products.length; i++) {
      const produto = products[i];
      migrationResults.total++;

      onProgress?.({
        stage: 'migrating_back',
        current: i + 1,
        total: products.length,
        productName: produto.titulo,
        progress: Math.round(((i + 1) / products.length) * 100)
      });

      try {
        // Verificar se já está no Firebase Storage
        const alreadyInFirebase = produto.fotosUrl?.every(url => 
          url.includes('firebasestorage.googleapis.com')
        );

        if (alreadyInFirebase) {
          console.log(`⏭️ Produto "${produto.titulo}" já está no Firebase Storage, pulando...`);
          migrationResults.skipped++;
          continue;
        }

        // Restaurar URLs do Firebase se existirem
        if (produto.fotosUrlFirebase && produto.fotosUrlFirebase.length > 0) {
          const productRef = doc(db, 'produtos', produto.id);
          await updateDoc(productRef, {
            fotosUrl: produto.fotosUrlFirebase,
            migratedBackDate: new Date().toISOString()
          });

          migrationResults.success++;
          console.log(`✅ Produto "${produto.titulo}" restaurado para Firebase Storage!`);
        } else {
          console.log(`⚠️ Produto "${produto.titulo}" não tem URLs do Firebase para restaurar`);
          migrationResults.skipped++;
        }

      } catch (error) {
        migrationResults.failed++;
        migrationResults.errors.push({
          productId: produto.id,
          productName: produto.titulo,
          error: error.message
        });
        console.error(`❌ Erro ao restaurar produto "${produto.titulo}":`, error);
      }
    }

    console.log('🎉 Migração de volta concluída!');
    console.log('📊 Resultados:', migrationResults);

    return { success: true, results: migrationResults };

  } catch (error) {
    console.error('❌ Erro geral na migração de volta:', error);
    onProgress?.({ stage: 'error', error: error.message });
    throw error;
  }
};

/**
 * Obtém estatísticas do backup/restauração
 */
export const getBackupStats = async () => {
  try {
    const produtosRef = collection(db, 'produtos');
    const snapshot = await getDocs(produtosRef);
    
    let total = 0;
    let hasBackup = 0;
    let inFirebase = 0;
    let inOriginal = 0;

    snapshot.forEach((doc) => {
      const produto = doc.data();
      total++;
      
      if (produto.fotosUrlBackup) {
        hasBackup++;
      }
      
      if (produto.fotosUrl?.some(url => url.includes('firebasestorage.googleapis.com'))) {
        inFirebase++;
      } else if (produto.fotosUrl?.some(url => !url.includes('firebasestorage.googleapis.com'))) {
        inOriginal++;
      }
    });

    return {
      success: true,
      stats: {
        total,
        hasBackup,
        inFirebase,
        inOriginal,
        backupCoverage: total > 0 ? Math.round((hasBackup / total) * 100) : 0
      }
    };

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas do backup:', error);
    throw error;
  }
};

/**
 * Exporta backup para arquivo JSON
 */
export const exportBackupToFile = async () => {
  try {
    const backup = await createImageBackup();
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `image-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    console.log('✅ Backup exportado com sucesso!');
    return { success: true };

  } catch (error) {
    console.error('❌ Erro ao exportar backup:', error);
    throw error;
  }
};

export default {
  createImageBackup,
  restoreAllImages,
  cleanupUnusedImages,
  migrateBackToFirebase,
  getBackupStats,
  exportBackupToFile
};
