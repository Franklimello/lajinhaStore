const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Script de otimização de imagens para Firebase Hosting
 * Gera versões otimizadas em WebP, AVIF e comprime originais
 */
async function optimizeImages() {
  console.log('🖼️ Iniciando otimização de imagens...');

  const inputDir = 'src/assets/images';
  const outputDir = 'build/images';

  // Verifica se diretório de entrada existe
  if (!fs.existsSync(inputDir)) {
    console.log('⚠️ Diretório de imagens não encontrado. Criando estrutura...');
    fs.mkdirSync(inputDir, { recursive: true });
    fs.mkdirSync(outputDir, { recursive: true });
    return;
  }

  // Cria diretório de saída
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // 1. Otimizar imagens originais (JPEG e PNG)
    console.log('📸 Otimizando imagens originais...');
    await imagemin([`${inputDir}/*.{jpg,jpeg,png}`], {
      destination: outputDir,
      plugins: [
        imageminMozjpeg({ 
          quality: 85,
          progressive: true 
        }),
        imageminPngquant({ 
          quality: [0.6, 0.8],
          speed: 1
        })
      ]
    });

    // 2. Gerar versões WebP
    console.log('🌐 Gerando versões WebP...');
    await imagemin([`${inputDir}/*.{jpg,jpeg,png}`], {
      destination: outputDir,
      plugins: [
        imageminWebp({ 
          quality: 80,
          method: 6
        })
      ]
    });

    // 3. Gerar versões AVIF (formato mais moderno)
    console.log('🚀 Gerando versões AVIF...');
    const imageFiles = fs.readdirSync(inputDir);
    
    for (const file of imageFiles) {
      if (file.match(/\.(jpg|jpeg|png)$/i)) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file.replace(/\.(jpg|jpeg|png)$/i, '.avif'));
        
        try {
          await sharp(inputPath)
            .avif({ 
              quality: 80,
              effort: 4
            })
            .toFile(outputPath);
          
          console.log(`✅ ${file} → ${path.basename(outputPath)}`);
        } catch (error) {
          console.error(`❌ Erro ao processar ${file}:`, error.message);
        }
      }
    }

    // 4. Gerar versões responsivas (diferentes tamanhos)
    console.log('📱 Gerando versões responsivas...');
    const sizes = [
      { suffix: '-sm', width: 400 },
      { suffix: '-md', width: 800 },
      { suffix: '-lg', width: 1200 }
    ];

    for (const file of imageFiles) {
      if (file.match(/\.(jpg|jpeg|png)$/i)) {
        const inputPath = path.join(inputDir, file);
        
        for (const size of sizes) {
          const outputPath = path.join(
            outputDir, 
            file.replace(/\.(jpg|jpeg|png)$/i, `${size.suffix}.webp`)
          );
          
          try {
            await sharp(inputPath)
              .resize(size.width, null, { 
                withoutEnlargement: true,
                fit: 'inside'
              })
              .webp({ quality: 80 })
              .toFile(outputPath);
            
            console.log(`📏 ${file} → ${path.basename(outputPath)} (${size.width}px)`);
          } catch (error) {
            console.error(`❌ Erro ao redimensionar ${file}:`, error.message);
          }
        }
      }
    }

    // 5. Gerar relatório de otimização
    const originalSize = getDirectorySize(inputDir);
    const optimizedSize = getDirectorySize(outputDir);
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

    console.log('\n📊 RELATÓRIO DE OTIMIZAÇÃO:');
    console.log(`📁 Tamanho original: ${formatBytes(originalSize)}`);
    console.log(`📁 Tamanho otimizado: ${formatBytes(optimizedSize)}`);
    console.log(`💰 Economia: ${savings}%`);
    console.log(`🎯 Arquivos gerados: ${fs.readdirSync(outputDir).length}`);

    console.log('\n✅ Otimização concluída com sucesso!');
    console.log('🚀 Imagens prontas para deploy no Firebase Hosting');

  } catch (error) {
    console.error('❌ Erro durante otimização:', error);
    process.exit(1);
  }
}

// Função para calcular tamanho do diretório
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

// Função para formatar bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Executa otimização
optimizeImages().catch(console.error);









