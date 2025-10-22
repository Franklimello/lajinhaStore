/**
 * Script de teste para verificar se o sistema de otimização está funcionando
 * Execute este script para testar sem fazer upload para o Firebase Storage
 */

const { optimizeImages } = require('./optimize-and-upload');
const fs = require('fs');
const path = require('path');

async function testOptimization() {
    console.log('🧪 Testando sistema de otimização...');
    
    // Verificar se a pasta de imagens existe
    const imagesFolder = 'src/assets/images';
    if (!fs.existsSync(imagesFolder)) {
        console.log('📁 Criando pasta de exemplo...');
        fs.mkdirSync(imagesFolder, { recursive: true });
        
        // Criar arquivo de exemplo
        const exampleFile = path.join(imagesFolder, 'README.md');
        fs.writeFileSync(exampleFile, `# Pasta de Imagens

Coloque suas imagens aqui:
- produto1.jpg
- produto2.png
- banner.jpg

Formato suportado: JPG, JPEG, PNG, GIF
`);
        
        console.log('✅ Pasta criada com arquivo de exemplo');
        console.log(`📁 Adicione suas imagens em: ${imagesFolder}`);
        return;
    }
    
    // Verificar se há imagens
    const imageFiles = fs.readdirSync(imagesFolder)
        .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
    
    if (imageFiles.length === 0) {
        console.log('📷 Nenhuma imagem encontrada');
        console.log(`📁 Adicione imagens em: ${imagesFolder}`);
        console.log('💡 Formatos suportados: JPG, JPEG, PNG, GIF');
        return;
    }
    
    console.log(`📊 Encontradas ${imageFiles.length} imagens:`);
    imageFiles.forEach(file => {
        const filePath = path.join(imagesFolder, file);
        const stats = fs.statSync(filePath);
        console.log(`  - ${file} (${formatBytes(stats.size)})`);
    });
    
    // Testar otimização
    try {
        console.log('\n🖼️ Iniciando teste de otimização...');
        const optimizedFiles = await optimizeImages();
        
        if (optimizedFiles.length > 0) {
            console.log('\n✅ Teste de otimização concluído!');
            console.log(`📊 ${optimizedFiles.length} arquivos otimizados`);
            
            // Mostrar arquivos gerados
            const tempFolder = 'temp_optimized';
            if (fs.existsSync(tempFolder)) {
                const generatedFiles = fs.readdirSync(tempFolder);
                console.log('\n📁 Arquivos gerados:');
                generatedFiles.forEach(file => {
                    const filePath = path.join(tempFolder, file);
                    const stats = fs.statSync(filePath);
                    console.log(`  - ${file} (${formatBytes(stats.size)})`);
                });
            }
            
            console.log('\n🎯 Próximos passos:');
            console.log('1. Configure as credenciais do Firebase');
            console.log('2. Execute: npm run optimize-and-upload');
            console.log('3. Verifique os arquivos no Firebase Storage');
            
        } else {
            console.log('⚠️ Nenhum arquivo foi otimizado');
        }
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
        console.log('\n💡 SOLUÇÕES:');
        console.log('1. Verifique se as dependências estão instaladas: npm install');
        console.log('2. Verifique se as imagens estão no formato correto');
        console.log('3. Verifique se há espaço em disco suficiente');
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Executar teste
testOptimization().catch(console.error);






