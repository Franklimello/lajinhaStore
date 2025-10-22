/**
 * Script: optimize-and-upload.js
 * Função: Otimiza imagens e envia para Firebase Storage com cache de 1 ano
 * 
 * REQUISITOS:
 * - Otimização automática (WebP, AVIF)
 * - Cache de 1 ano (max-age=31536000, immutable)
 * - Upload automático para Firebase Storage
 * - Processamento de imagens atuais e futuras
 * - Minimização de trabalho manual
 */

const { Storage } = require('@google-cloud/storage');
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// ================================
// CONFIGURAÇÃO
// ================================

const CONFIG = {
    // Pastas locais
    LOCAL_IMAGES_FOLDER: 'src/assets/images',
    TEMP_FOLDER: 'temp_optimized',
    
    // Firebase Storage
    BUCKET_NAME: process.env.FIREBASE_STORAGE_BUCKET || 'compreaqui-324df.appspot.com',
    STORAGE_FOLDER: 'products/',
    
    // Otimização
    WEBP_QUALITY: 80,
    AVIF_QUALITY: 80,
    JPEG_QUALITY: 85,
    PNG_QUALITY: [0.6, 0.8],
    
    // Tamanhos responsivos
    RESPONSIVE_SIZES: [
        { suffix: '-sm', width: 400 },
        { suffix: '-md', width: 800 },
        { suffix: '-lg', width: 1200 }
    ],
    
    // Cache headers
    CACHE_HEADERS: {
        cacheControl: 'public, max-age=31536000, immutable',
        contentType: 'image/webp'
    }
};

// ================================
// UTILITÁRIOS
// ================================

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function createDirectories() {
    const dirs = [CONFIG.TEMP_FOLDER];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`📁 Criado diretório: ${dir}`);
        }
    });
}

// ================================
// OTIMIZAÇÃO DE IMAGENS
// ================================

async function optimizeImages() {
    console.log('🖼️ Iniciando otimização de imagens...');
    
    if (!fs.existsSync(CONFIG.LOCAL_IMAGES_FOLDER)) {
        console.log(`⚠️ Diretório não encontrado: ${CONFIG.LOCAL_IMAGES_FOLDER}`);
        console.log('📁 Criando estrutura de diretórios...');
        fs.mkdirSync(CONFIG.LOCAL_IMAGES_FOLDER, { recursive: true });
        return;
    }

    const imageFiles = fs.readdirSync(CONFIG.LOCAL_IMAGES_FOLDER)
        .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

    if (imageFiles.length === 0) {
        console.log('📷 Nenhuma imagem encontrada para otimizar');
        return [];
    }

    console.log(`📊 Encontradas ${imageFiles.length} imagens para otimizar`);

    // 1. Otimizar imagens originais (JPEG/PNG)
    console.log('📸 Otimizando imagens originais...');
    await imagemin([`${CONFIG.LOCAL_IMAGES_FOLDER}/*.{jpg,jpeg,png}`], {
        destination: CONFIG.TEMP_FOLDER,
        plugins: [
            imageminMozjpeg({ 
                quality: CONFIG.JPEG_QUALITY,
                progressive: true 
            }),
            imageminPngquant({ 
                quality: CONFIG.PNG_QUALITY,
                speed: 1
            })
        ]
    });

    // 2. Gerar versões WebP
    console.log('🌐 Gerando versões WebP...');
    await imagemin([`${CONFIG.LOCAL_IMAGES_FOLDER}/*.{jpg,jpeg,png}`], {
        destination: CONFIG.TEMP_FOLDER,
        plugins: [
            imageminWebp({ 
                quality: CONFIG.WEBP_QUALITY,
                method: 6
            })
        ]
    });

    // 3. Gerar versões AVIF
    console.log('🚀 Gerando versões AVIF...');
    for (const file of imageFiles) {
        const inputPath = path.join(CONFIG.LOCAL_IMAGES_FOLDER, file);
        const outputPath = path.join(CONFIG.TEMP_FOLDER, file.replace(/\.(jpg|jpeg|png)$/i, '.avif'));
        
        try {
            await sharp(inputPath)
                .avif({ 
                    quality: CONFIG.AVIF_QUALITY,
                    effort: 4
                })
                .toFile(outputPath);
            
            console.log(`✅ ${file} → ${path.basename(outputPath)}`);
        } catch (error) {
            console.error(`❌ Erro ao processar ${file}:`, error.message);
        }
    }

    // 4. Gerar versões responsivas
    console.log('📱 Gerando versões responsivas...');
    for (const file of imageFiles) {
        const inputPath = path.join(CONFIG.LOCAL_IMAGES_FOLDER, file);
        
        for (const size of CONFIG.RESPONSIVE_SIZES) {
            const outputPath = path.join(
                CONFIG.TEMP_FOLDER, 
                file.replace(/\.(jpg|jpeg|png)$/i, `${size.suffix}.webp`)
            );
            
            try {
                await sharp(inputPath)
                    .resize(size.width, null, { 
                        withoutEnlargement: true,
                        fit: 'inside'
                    })
                    .webp({ quality: CONFIG.WEBP_QUALITY })
                    .toFile(outputPath);
                
                console.log(`📏 ${file} → ${path.basename(outputPath)} (${size.width}px)`);
            } catch (error) {
                console.error(`❌ Erro ao redimensionar ${file}:`, error.message);
            }
        }
    }

    // 5. Gerar relatório
    const originalSize = getDirectorySize(CONFIG.LOCAL_IMAGES_FOLDER);
    const optimizedSize = getDirectorySize(CONFIG.TEMP_FOLDER);
    const savings = originalSize > 0 ? ((originalSize - optimizedSize) / originalSize * 100).toFixed(1) : 0;

    console.log('\n📊 RELATÓRIO DE OTIMIZAÇÃO:');
    console.log(`📁 Tamanho original: ${formatBytes(originalSize)}`);
    console.log(`📁 Tamanho otimizado: ${formatBytes(optimizedSize)}`);
    console.log(`💰 Economia: ${savings}%`);
    console.log(`🎯 Arquivos gerados: ${fs.readdirSync(CONFIG.TEMP_FOLDER).length}`);

    return fs.readdirSync(CONFIG.TEMP_FOLDER);
}

function getDirectorySize(dirPath) {
    let totalSize = 0;
    
    function calculateSize(itemPath) {
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
            const files = fs.readdirSync(itemPath);
            files.forEach(file => {
                calculateSize(path.join(itemPath, file));
            });
        } else {
            totalSize += stats.size;
        }
    }
    
    if (fs.existsSync(dirPath)) {
        calculateSize(dirPath);
    }
    
    return totalSize;
}

// ================================
// UPLOAD PARA FIREBASE STORAGE
// ================================

async function uploadToStorage() {
    console.log('☁️ Iniciando upload para Firebase Storage...');
    
    // Inicializa Storage
    const storage = new Storage();
    const bucket = storage.bucket(CONFIG.BUCKET_NAME);

    // Verifica se bucket existe
    try {
        const [exists] = await bucket.exists();
        if (!exists) {
            throw new Error(`Bucket ${CONFIG.BUCKET_NAME} não encontrado`);
        }
    } catch (error) {
        console.error('❌ Erro ao acessar bucket:', error.message);
        console.log('💡 Verifique se:');
        console.log('   1. O bucket existe no Firebase Console');
        console.log('   2. As credenciais estão configuradas');
        console.log('   3. A variável FIREBASE_STORAGE_BUCKET está definida');
        return;
    }

    const files = fs.readdirSync(CONFIG.TEMP_FOLDER);
    let uploadedCount = 0;
    let totalSize = 0;

    for (const file of files) {
        const localFilePath = path.join(CONFIG.TEMP_FOLDER, file);
        const storagePath = path.join(CONFIG.STORAGE_FOLDER, file);
        
        try {
            const fileStats = fs.statSync(localFilePath);
            totalSize += fileStats.size;

            await bucket.upload(localFilePath, {
                destination: storagePath,
                metadata: {
                    cacheControl: CONFIG.CACHE_HEADERS.cacheControl,
                    contentType: file.endsWith('.webp') ? 'image/webp' : 
                                file.endsWith('.avif') ? 'image/avif' : 
                                'image/jpeg'
                }
            });

            console.log(`✅ Uploaded: ${file} (${formatBytes(fileStats.size)})`);
            uploadedCount++;

        } catch (error) {
            console.error(`❌ Erro ao fazer upload de ${file}:`, error.message);
        }
    }

    console.log('\n📊 RELATÓRIO DE UPLOAD:');
    console.log(`✅ Arquivos enviados: ${uploadedCount}/${files.length}`);
    console.log(`📁 Tamanho total: ${formatBytes(totalSize)}`);
    console.log(`⏰ Cache configurado: 1 ano (max-age=31536000, immutable)`);
}

// ================================
// LIMPEZA E FINALIZAÇÃO
// ================================

function cleanup() {
    console.log('🧹 Limpando arquivos temporários...');
    
    try {
        if (fs.existsSync(CONFIG.TEMP_FOLDER)) {
            fs.rmSync(CONFIG.TEMP_FOLDER, { recursive: true, force: true });
            console.log('✅ Pasta temporária removida');
        }
    } catch (error) {
        console.error('⚠️ Erro ao limpar pasta temporária:', error.message);
    }
}

// ================================
// FUNÇÃO PRINCIPAL
// ================================

async function main() {
    console.log('🚀 Iniciando otimização e upload de imagens...');
    console.log(`📁 Pasta de origem: ${CONFIG.LOCAL_IMAGES_FOLDER}`);
    console.log(`☁️ Bucket de destino: ${CONFIG.BUCKET_NAME}`);
    console.log('─'.repeat(50));

    try {
        // 1. Criar diretórios necessários
        createDirectories();

        // 2. Otimizar imagens
        const optimizedFiles = await optimizeImages();
        
        if (optimizedFiles.length === 0) {
            console.log('⚠️ Nenhuma imagem foi otimizada');
            return;
        }

        // 3. Upload para Firebase Storage
        await uploadToStorage();

        // 4. Limpeza
        cleanup();

        console.log('\n🎉 PROCESSO CONCLUÍDO COM SUCESSO!');
        console.log('✅ Imagens otimizadas e enviadas para Firebase Storage');
        console.log('✅ Cache de 1 ano configurado');
        console.log('✅ Arquivos temporários removidos');

    } catch (error) {
        console.error('❌ Erro durante o processo:', error);
        cleanup();
        process.exit(1);
    }
}

// ================================
// EXECUÇÃO
// ================================

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { optimizeImages, uploadToStorage, cleanup };