/**
 * Script de exemplo: Como usar o sistema de otimização
 * Demonstra o uso completo do sistema
 */

const { optimizeImages, uploadToStorage, cleanup } = require('./optimize-and-upload');

async function exemploCompleto() {
    console.log('🚀 EXEMPLO DE USO DO SISTEMA DE OTIMIZAÇÃO');
    console.log('─'.repeat(50));
    
    try {
        // 1. Verificar configuração
        console.log('1️⃣ Verificando configuração...');
        console.log(`📁 Pasta de imagens: src/assets/images/`);
        console.log(`☁️ Bucket: ${process.env.FIREBASE_STORAGE_BUCKET || 'compreaqui-324df.appspot.com'}`);
        console.log(`🔐 Credenciais: ${process.env.GOOGLE_APPLICATION_CREDENTIALS || 'Firebase CLI'}`);
        
        // 2. Otimizar imagens
        console.log('\n2️⃣ Otimizando imagens...');
        const optimizedFiles = await optimizeImages();
        
        if (optimizedFiles.length === 0) {
            console.log('⚠️ Nenhuma imagem encontrada para otimizar');
            console.log('💡 Adicione imagens em: src/assets/images/');
            return;
        }
        
        console.log(`✅ ${optimizedFiles.length} imagens otimizadas`);
        
        // 3. Upload para Firebase Storage
        console.log('\n3️⃣ Fazendo upload para Firebase Storage...');
        await uploadToStorage();
        
        // 4. Limpeza
        console.log('\n4️⃣ Limpando arquivos temporários...');
        cleanup();
        
        console.log('\n🎉 EXEMPLO CONCLUÍDO COM SUCESSO!');
        console.log('✅ Imagens otimizadas e enviadas para Firebase Storage');
        console.log('✅ Cache de 1 ano configurado');
        console.log('✅ Sistema funcionando perfeitamente');
        
    } catch (error) {
        console.error('❌ Erro durante o exemplo:', error.message);
        console.log('\n💡 SOLUÇÕES:');
        console.log('1. Verifique se as dependências estão instaladas');
        console.log('2. Configure as credenciais do Firebase');
        console.log('3. Verifique se o bucket existe');
        console.log('4. Adicione imagens em src/assets/images/');
    }
}

// Executar exemplo
if (require.main === module) {
    exemploCompleto().catch(console.error);
}

module.exports = { exemploCompleto };







