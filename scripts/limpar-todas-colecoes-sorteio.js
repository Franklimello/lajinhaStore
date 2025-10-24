// Script para deletar TODAS as coleções relacionadas ao sorteio
// Execute com: node limpar-todas-colecoes-sorteio.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc, writeBatch } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ",
  authDomain: "compreaqui-324df.firebaseapp.com",
  projectId: "compreaqui-324df",
  storageBucket: "compreaqui-324df.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteCollection(collectionName) {
  console.log(`🧹 Iniciando limpeza da coleção: ${collectionName}`);
  
  try {
    // Buscar todos os documentos
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty) {
      console.log(`✅ Coleção ${collectionName} já está vazia`);
      return 0;
    }
    
    console.log(`📊 Encontrados ${snapshot.size} documentos na coleção ${collectionName}`);
    
    // Deletar em lotes de 500 (limite do Firestore)
    const batchSize = 500;
    let deletedCount = 0;
    let batchCount = 0;
    
    const batch = writeBatch(db);
    
    for (const docSnap of snapshot.docs) {
      batch.delete(docSnap.ref);
      deletedCount++;
      
      // Commit a cada 500 documentos
      if (deletedCount % batchSize === 0) {
        await batch.commit();
        batchCount++;
        console.log(`✅ Lote ${batchCount} processado: ${deletedCount} documentos deletados de ${collectionName}`);
        
        // Pequena pausa para não sobrecarregar o Firestore
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Commit documentos restantes (se houver)
    if (deletedCount % batchSize !== 0) {
      await batch.commit();
    }
    
    console.log(`🎉 SUCESSO! Total de ${deletedCount} documentos deletados da coleção ${collectionName}`);
    return deletedCount;
    
  } catch (error) {
    console.error(`❌ Erro ao deletar coleção ${collectionName}:`, error);
    throw error;
  }
}

async function verificarColecao(collectionName) {
  try {
    console.log(`🔍 Verificando coleção: ${collectionName}`);
    
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    
    console.log(`📊 Documentos encontrados em ${collectionName}: ${snapshot.size}`);
    
    if (snapshot.size > 0) {
      console.log(`📋 Primeiros 3 documentos de ${collectionName}:`);
      snapshot.docs.slice(0, 3).forEach((docSnap, index) => {
        const data = docSnap.data();
        console.log(`${index + 1}. ID: ${docSnap.id}`);
        console.log(`   Pedido: ${data.orderNumber || 'N/A'}`);
        console.log(`   Cliente: ${data.clientName || 'N/A'}`);
        console.log(`   Data: ${data.createdAt?.toDate?.() || 'N/A'}`);
        console.log('---');
      });
      
      if (snapshot.size > 3) {
        console.log(`... e mais ${snapshot.size - 3} documentos em ${collectionName}`);
      }
    }
    
    return snapshot.size;
    
  } catch (error) {
    console.error(`❌ Erro ao verificar coleção ${collectionName}:`, error);
    return 0;
  }
}

async function main() {
  try {
    console.log('🚀 Script de Limpeza COMPLETA - Todas as Coleções de Sorteio');
    console.log('============================================================');
    
    // Lista de coleções para limpar
    const colecoes = ['sorteio', 'sorteio_vencedores'];
    
    // Verificar estado atual de todas as coleções
    let totalDocs = 0;
    for (const colecao of colecoes) {
      const docs = await verificarColecao(colecao);
      totalDocs += docs;
    }
    
    if (totalDocs === 0) {
      console.log('✅ Todas as coleções de sorteio já estão vazias - nada para deletar');
      return;
    }
    
    // Confirmar ação
    console.log(`\n⚠️  ATENÇÃO: Você está prestes a deletar ${totalDocs} documentos das coleções:`);
    colecoes.forEach(colecao => console.log(`   - ${colecao}`));
    console.log('Esta ação é irreversível!');
    console.log('Pressione Ctrl+C para cancelar ou aguarde 5 segundos...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Deletar cada coleção
    let totalDeleted = 0;
    for (const colecao of colecoes) {
      const deletedCount = await deleteCollection(colecao);
      totalDeleted += deletedCount;
      
      // Pausa entre coleções
      if (colecao !== colecoes[colecoes.length - 1]) {
        console.log('⏳ Aguardando 2 segundos antes da próxima coleção...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Verificar resultado final
    console.log('\n🔍 Verificação final:');
    let remainingTotal = 0;
    for (const colecao of colecoes) {
      const remaining = await verificarColecao(colecao);
      remainingTotal += remaining;
    }
    
    if (remainingTotal === 0) {
      console.log('\n✅ Script concluído com sucesso!');
      console.log(`🎉 ${totalDeleted} documentos deletados de todas as coleções de sorteio!`);
    } else {
      console.log(`\n⚠️  Ainda restam ${remainingTotal} documentos. Execute o script novamente se necessário.`);
    }
    
  } catch (error) {
    console.error('❌ Erro no script:', error);
    process.exit(1);
  }
}

// Executar script
main();
