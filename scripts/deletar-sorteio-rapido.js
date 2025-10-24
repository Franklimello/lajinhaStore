import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, writeBatch } from "firebase/firestore";

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
      console.log('✅ Coleção já está vazia');
      return;
    }
    
    console.log(`📊 Encontrados ${snapshot.size} documentos`);
    
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
        console.log(`✅ Lote ${batchCount} processado: ${deletedCount} documentos deletados`);
        
        // Criar novo batch para próximos documentos
        if (deletedCount < snapshot.size) {
          // Não precisamos criar novo batch, continuamos com o mesmo
        }
      }
    }
    
    // Commit documentos restantes (se houver)
    if (deletedCount % batchSize !== 0) {
      await batch.commit();
    }
    
    console.log(`🎉 SUCESSO! Total de ${deletedCount} documentos deletados da coleção ${collectionName}`);
    
  } catch (error) {
    console.error('❌ Erro ao deletar coleção:', error);
    throw error;
  }
}

async function verificarColecao(collectionName) {
  try {
    console.log(`🔍 Verificando coleção: ${collectionName}`);
    
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    
    console.log(`📊 Documentos encontrados: ${snapshot.size}`);
    
    if (snapshot.size > 0) {
      console.log('📋 Primeiros 5 documentos:');
      snapshot.docs.slice(0, 5).forEach((docSnap, index) => {
        const data = docSnap.data();
        console.log(`${index + 1}. ID: ${docSnap.id}`);
        console.log(`   Pedido: ${data.orderNumber || 'N/A'}`);
        console.log(`   Cliente: ${data.clientName || 'N/A'}`);
        console.log(`   Data: ${data.createdAt?.toDate?.() || 'N/A'}`);
        console.log('---');
      });
      
      if (snapshot.size > 5) {
        console.log(`... e mais ${snapshot.size - 5} documentos`);
      }
    }
    
    return snapshot.size;
    
  } catch (error) {
    console.error('❌ Erro ao verificar coleção:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Script de Limpeza Rápida - Coleção Sorteio');
    console.log('=============================================');
    
    // Verificar estado atual
    const totalDocs = await verificarColecao('sorteio');
    
    if (totalDocs === 0) {
      console.log('✅ Coleção sorteio já está vazia - nada para deletar');
      return;
    }
    
    // Confirmar ação
    console.log(`\n⚠️  ATENÇÃO: Você está prestes a deletar ${totalDocs} documentos da coleção 'sorteio'!`);
    console.log('Esta ação é irreversível!');
    console.log('Pressione Ctrl+C para cancelar ou aguarde 5 segundos...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Deletar coleção
    await deleteCollection('sorteio');
    
    // Verificar resultado
    await verificarColecao('sorteio');
    
    console.log('\n✅ Script concluído com sucesso!');
    console.log('🎉 Coleção sorteio limpa completamente!');
    
  } catch (error) {
    console.error('❌ Erro no script:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Executar script
main();
