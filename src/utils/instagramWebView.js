// Utilitários para detectar e lidar com Instagram WebView
export const isInstagramWebView = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('instagram') || userAgent.includes('fbav');
};

export const isFacebookWebView = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('fban') || userAgent.includes('fbav');
};

export const isWhatsAppWebView = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('whatsapp');
};

export const isSocialMediaWebView = () => {
  return isInstagramWebView() || isFacebookWebView() || isWhatsAppWebView();
};

// Função para abrir no navegador padrão
export const openInBrowser = () => {
  const currentUrl = window.location.href;
  
  // Tentar diferentes métodos para abrir no navegador
  if (window.open) {
    window.open(currentUrl, '_blank');
  } else {
    // Fallback: mostrar instruções
    alert('Para melhor experiência, abra este link no seu navegador padrão (Chrome, Safari, etc.)');
  }
};

// Função para detectar problemas de carregamento
export const detectLoadingIssues = () => {
  const isWebView = isSocialMediaWebView();
  const hasProducts = document.querySelectorAll('[data-testid="product-card"]').length > 0;
  
  return {
    isWebView,
    hasProducts,
    needsBrowser: isWebView && !hasProducts
  };
};

// Função para mostrar banner de aviso
export const showWebViewBanner = () => {
  const banner = document.createElement('div');
  banner.id = 'webview-banner';
  banner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px;
      text-align: center;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    ">
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <span>📱</span>
        <span>Para melhor experiência, abra no seu navegador</span>
        <button onclick="window.open(window.location.href, '_blank')" style="
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        ">Abrir</button>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          margin-left: 8px;
        ">×</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(banner);
  
  // Ajustar padding do body para não sobrepor o banner
  document.body.style.paddingTop = '60px';
};

// Função para otimizar carregamento em WebView
export const optimizeForWebView = () => {
  if (isSocialMediaWebView()) {
    // Reduzir animações
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
    
    // Simplificar carregamento
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => {
      img.loading = 'eager';
    });
    
    // Mostrar banner se necessário
    setTimeout(() => {
      const { needsBrowser } = detectLoadingIssues();
      if (needsBrowser) {
        showWebViewBanner();
      }
    }, 3000);
  }
};

