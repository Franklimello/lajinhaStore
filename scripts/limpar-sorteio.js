const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'compreaqui-324df'
  });
}

const db = admin.firestore();

async function limparColecaoSorteio() {
  try {
    console.log('🧹 Iniciando limpeza da coleção sorteio...');
    
    // Buscar todos os documentos da coleção sorteio
    const sorteioRef = db.collection('sorteio');
    const snapshot = await sorteioRef.get();
    
    if (snapshot.empty) {
      console.log('✅ Coleção sorteio já está vazia');
      return;
    }
    
    console.log(`📊 Encontrados ${snapshot.size} documentos na coleção sorteio`);
    
    // Deletar todos os documentos em lotes
    const batch = db.batch();
    let deletedCount = 0;
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      deletedCount++;
    });
    
    await batch.commit();
    
    console.log(`✅ ${deletedCount} documentos deletados com sucesso!`);
    console.log('🎉 Coleção sorteio limpa completamente!');
    
  } catch (error) {
    console.error('❌ Erro ao limpar coleção sorteio:', error);
    throw error;
  }
}

async function verificarColecao() {
  try {
    console.log('🔍 Verificando estado da coleção sorteio...');
    
    const sorteioRef = db.collection('sorteio');
    const snapshot = await sorteioRef.limit(10).get();
    
    console.log(`📊 Documentos encontrados: ${snapshot.size}`);
    
    if (snapshot.size > 0) {
      console.log('📋 Primeiros documentos:');
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ID: ${doc.id}`);
        console.log(`   Pedido: ${data.orderNumber}`);
        console.log(`   Cliente: ${data.clientName}`);
        console.log(`   Data: ${data.createdAt?.toDate?.() || 'N/A'}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar coleção:', error);
  }
}

async function main() {
  try {
    console.log('🚀 Script de limpeza da coleção sorteio');
    console.log('=====================================');
    
    // Verificar estado atual
    await verificarColecao();
    
    // Confirmar limpeza
    console.log('\n⚠️  ATENÇÃO: Esta operação irá deletar TODOS os documentos da coleção sorteio!');
    console.log('Pressione Ctrl+C para cancelar ou aguarde 5 segundos...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Limpar coleção
    await limparColecaoSorteio();
    
    // Verificar resultado
    await verificarColecao();
    
    console.log('\n✅ Script concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no script:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Executar script
main();
