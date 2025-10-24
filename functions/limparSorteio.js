const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Função para limpar a coleção sorteio
exports.limparSorteio = functions.https.onCall(async (data, context) => {
  // Verificar se o usuário está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  // Verificar se é um administrador
  const adminUids = ['ZG5D6IrTRTZl5SDoEctLAtr4WkE2', '6VbaNslrhQhXcyussPj53YhLiYj2'];
  if (!adminUids.includes(context.auth.uid)) {
    throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem executar esta função');
  }

  try {
    console.log('🧹 Iniciando limpeza da coleção sorteio...');
    
    // Buscar todos os documentos da coleção sorteio
    const sorteioRef = admin.firestore().collection('sorteio');
    const snapshot = await sorteioRef.get();
    
    if (snapshot.empty) {
      console.log('✅ Coleção sorteio já está vazia');
      return {
        success: true,
        message: 'Coleção sorteio já estava vazia',
        deletedCount: 0
      };
    }
    
    console.log(`📊 Encontrados ${snapshot.size} documentos na coleção sorteio`);
    
    // Deletar todos os documentos em lotes
    const batch = admin.firestore().batch();
    let deletedCount = 0;
    let batchCount = 0;
    
    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
      deletedCount++;
      
      // Commit a cada 500 documentos
      if (deletedCount % 500 === 0) {
        await batch.commit();
        batchCount++;
        console.log(`✅ Lote ${batchCount} processado: ${deletedCount} documentos deletados`);
      }
    }
    
    // Commit documentos restantes
    if (deletedCount % 500 !== 0) {
      await batch.commit();
    }
    
    console.log(`✅ Total de ${deletedCount} documentos deletados com sucesso!`);
    
    return {
      success: true,
      message: `${deletedCount} documentos deletados com sucesso!`,
      deletedCount: deletedCount
    };
    
  } catch (error) {
    console.error('❌ Erro ao limpar coleção sorteio:', error);
    throw new functions.https.HttpsError('internal', `Erro ao limpar coleção: ${error.message}`);
  }
});

// Função para verificar o estado da coleção sorteio
exports.verificarSorteio = functions.https.onCall(async (data, context) => {
  // Verificar se o usuário está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  // Verificar se é um administrador
  const adminUids = ['ZG5D6IrTRTZl5SDoEctLAtr4WkE2', '6VbaNslrhQhXcyussPj53YhLiYj2'];
  if (!adminUids.includes(context.auth.uid)) {
    throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem executar esta função');
  }

  try {
    console.log('🔍 Verificando estado da coleção sorteio...');
    
    const sorteioRef = admin.firestore().collection('sorteio');
    const snapshot = await sorteioRef.limit(10).get();
    
    const documentos = [];
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      documentos.push({
        id: doc.id,
        orderNumber: data.orderNumber,
        clientName: data.clientName,
        createdAt: data.createdAt?.toDate?.() || null
      });
    });
    
    return {
      success: true,
      totalCount: snapshot.size,
      documentos: documentos
    };
    
  } catch (error) {
    console.error('❌ Erro ao verificar coleção:', error);
    throw new functions.https.HttpsError('internal', `Erro ao verificar coleção: ${error.message}`);
  }
});
