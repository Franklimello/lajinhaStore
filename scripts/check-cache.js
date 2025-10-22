/**
 * Script para verificar cache de imagens no navegador
 * Execute no console do DevTools para monitorar performance
 */

// Função para verificar status de cache das imagens
function checkImageCache() {
  console.log('🔍 Verificando cache de imagens...');
  
  const images = document.querySelectorAll('img');
  let cachedCount = 0;
  let totalCount = images.length;
  let cachedSize = 0;
  let totalSize = 0;

  console.log(`📊 Total de imagens encontradas: ${totalCount}`);
  console.log('─'.repeat(50));

  images.forEach((img, index) => {
    const src = img.src;
    const isCached = src.startsWith('data:image');
    const size = img.naturalWidth * img.naturalHeight;
    
    if (isCached) {
      cachedCount++;
      cachedSize += size;
      console.log(`✅ ${index + 1}. ${src.substring(0, 50)}... (cached)`);
    } else {
      console.log(`❌ ${index + 1}. ${src} (not cached)`);
    }
    
    totalSize += size;
  });

  const cacheRate = ((cachedCount / totalCount) * 100).toFixed(1);
  const sizeReduction = totalSize > 0 ? ((cachedSize / totalSize) * 100).toFixed(1) : 0;

  console.log('─'.repeat(50));
  console.log(`📊 RESULTADO:`);
  console.log(`✅ Imagens cacheadas: ${cachedCount}/${totalCount} (${cacheRate}%)`);
  console.log(`💾 Redução de tamanho: ${sizeReduction}%`);
  
  return { 
    cached: cachedCount, 
    total: totalCount, 
    rate: cacheRate,
    sizeReduction 
  };
}

// Função para monitorar bandwidth em tempo real
function monitorBandwidth() {
  console.log('📡 Iniciando monitoramento de bandwidth...');
  
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.name.includes('.jpg') || 
          entry.name.includes('.png') || 
          entry.name.includes('.webp') || 
          entry.name.includes('.avif')) {
        
        const size = entry.transferSize || 0;
        const cached = entry.transferSize === 0;
        const status = cached ? '✅ (cached)' : '❌ (downloaded)';
        
        console.log(`📊 ${entry.name.split('/').pop()}: ${formatBytes(size)} ${status}`);
      }
    });
  });
  
  observer.observe({ entryTypes: ['resource'] });
  
  console.log('✅ Monitoramento ativo. Recarregue a página para ver resultados.');
  
  return observer;
}

// Função para verificar headers de cache
function checkCacheHeaders() {
  console.log('🔍 Verificando headers de cache...');
  
  const images = document.querySelectorAll('img');
  const promises = Array.from(images).map(async (img) => {
    try {
      const response = await fetch(img.src, { method: 'HEAD' });
      const cacheControl = response.headers.get('Cache-Control');
      const expires = response.headers.get('Expires');
      
      console.log(`📊 ${img.src.split('/').pop()}:`);
      console.log(`   Cache-Control: ${cacheControl || 'Not set'}`);
      console.log(`   Expires: ${expires || 'Not set'}`);
      
      return { src: img.src, cacheControl, expires };
    } catch (error) {
      console.log(`❌ Erro ao verificar ${img.src}: ${error.message}`);
      return null;
    }
  });
  
  return Promise.all(promises);
}

// Função para formatar bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Função para testar performance de carregamento
function testLoadingPerformance() {
  console.log('⚡ Testando performance de carregamento...');
  
  const startTime = performance.now();
  const images = document.querySelectorAll('img');
  
  let loadedCount = 0;
  const totalImages = images.length;
  
  const checkComplete = () => {
    loadedCount++;
    if (loadedCount === totalImages) {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      console.log(`⏱️ Tempo total de carregamento: ${loadTime.toFixed(2)}ms`);
      console.log(`📊 Média por imagem: ${(loadTime / totalImages).toFixed(2)}ms`);
    }
  };
  
  images.forEach(img => {
    if (img.complete) {
      checkComplete();
    } else {
      img.addEventListener('load', checkComplete);
      img.addEventListener('error', checkComplete);
    }
  });
}

// Exportar funções para uso no console
window.checkImageCache = checkImageCache;
window.monitorBandwidth = monitorBandwidth;
window.checkCacheHeaders = checkCacheHeaders;
window.testLoadingPerformance = testLoadingPerformance;

console.log('🛠️ Scripts de verificação carregados!');
console.log('📋 Comandos disponíveis:');
console.log('   checkImageCache() - Verificar cache de imagens');
console.log('   monitorBandwidth() - Monitorar bandwidth');
console.log('   checkCacheHeaders() - Verificar headers de cache');
console.log('   testLoadingPerformance() - Testar performance');

// Executar verificação automática
setTimeout(() => {
  checkImageCache();
}, 1000);









