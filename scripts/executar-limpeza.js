// Script DIRETO para limpar coleções de sorteio
// Execute com: node executar-limpeza.js

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function limparColecao(nomeColecao) {
  console.log(`🧹 Limpando ${nomeColecao}...`);
  
  const colRef = collection(db, nomeColecao);
  const snapshot = await getDocs(colRef);
  
  if (snapshot.empty) {
    console.log(`✅ ${nomeColecao} já vazia`);
    return 0;
  }
  
  console.log(`📊 ${snapshot.size} documentos em ${nomeColecao}`);
  
  // Deletar em lotes de 500
  let deletados = 0;
  const batch = writeBatch(db);
  
  for (const docSnap of snapshot.docs) {
    batch.delete(docSnap.ref);
    deletados++;
    
    if (deletados % 500 === 0) {
      await batch.commit();
      console.log(`✅ ${deletados} deletados de ${nomeColecao}`);
    }
  }
  
  if (deletados % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`🎉 ${deletados} documentos deletados de ${nomeColecao}`);
  return deletados;
}

async function main() {
  console.log('🚀 LIMPEZA RÁPIDA - Coleções de Sorteio');
  console.log('=====================================');
  
  // Verificar quantos documentos existem
  const sorteioRef = collection(db, 'sorteio');
  const vencedoresRef = collection(db, 'sorteio_vencedores');
  
  const [sorteioSnapshot, vencedoresSnapshot] = await Promise.all([
    getDocs(sorteioRef),
    getDocs(vencedoresRef)
  ]);
  
  const totalSorteio = sorteioSnapshot.size;
  const totalVencedores = vencedoresSnapshot.size;
  const total = totalSorteio + totalVencedores;
  
  console.log(`📊 Documentos encontrados:`);
  console.log(`   - sorteio: ${totalSorteio}`);
  console.log(`   - sorteio_vencedores: ${totalVencedores}`);
  console.log(`   - TOTAL: ${total}`);
  
  if (total === 0) {
    console.log('✅ Todas as coleções já estão vazias!');
    return;
  }
  
  console.log(`\n⚠️  Deletando ${total} documentos...`);
  console.log('Pressione Ctrl+C para cancelar ou aguarde 3 segundos...');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Limpar ambas as coleções
  const [deletadosSorteio, deletadosVencedores] = await Promise.all([
    limparColecao('sorteio'),
    limparColecao('sorteio_vencedores')
  ]);
  
  console.log(`\n🎉 LIMPEZA CONCLUÍDA!`);
  console.log(`   - sorteio: ${deletadosSorteio} documentos deletados`);
  console.log(`   - sorteio_vencedores: ${deletadosVencedores} documentos deletados`);
  console.log(`   - TOTAL: ${deletadosSorteio + deletadosVencedores} documentos deletados`);
}

main().catch(console.error);
