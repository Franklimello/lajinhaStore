// Script para limpar a coleção sorteio usando Firebase Web SDK
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';

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

async function limparColecaoSorteio() {
  try {
    console.log('🧹 Iniciando limpeza da coleção sorteio...');
    
    // Buscar todos os documentos da coleção sorteio
    const sorteioRef = collection(db, 'sorteio');
    const snapshot = await getDocs(sorteioRef);
    
    if (snapshot.empty) {
      console.log('✅ Coleção sorteio já está vazia');
      return;
    }
    
    console.log(`📊 Encontrados ${snapshot.size} documentos na coleção sorteio`);
    
    // Deletar todos os documentos em lotes de 500
    const batch = writeBatch(db);
    let deletedCount = 0;
    let batchCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      batch.delete(docSnapshot.ref);
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
    console.log('🎉 Coleção sorteio limpa completamente!');
    
  } catch (error) {
    console.error('❌ Erro ao limpar coleção sorteio:', error);
    throw error;
  }
}

async function verificarColecao() {
  try {
    console.log('🔍 Verificando estado da coleção sorteio...');
    
    const sorteioRef = collection(db, 'sorteio');
    const snapshot = await getDocs(sorteioRef);
    
    console.log(`📊 Documentos encontrados: ${snapshot.size}`);
    
    if (snapshot.size > 0) {
      console.log('📋 Primeiros documentos:');
      snapshot.docs.slice(0, 5).forEach((docSnapshot, index) => {
        const data = docSnapshot.data();
        console.log(`${index + 1}. ID: ${docSnapshot.id}`);
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
    console.log('Pressione Ctrl+C para cancelar ou aguarde 3 segundos...');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Limpar coleção
    await limparColecaoSorteio();
    
    // Verificar resultado
    await verificarColecao();
    
    console.log('\n✅ Script concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no script:', error);
    process.exit(1);
  }
}

// Executar script
main();
