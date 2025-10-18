import { useState, useEffect } from 'react';
import { isSocialMediaWebView, detectLoadingIssues } from '../../utils/instagramWebView';

const WebViewBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isWebView, setIsWebView] = useState(false);

  useEffect(() => {
    const checkWebView = () => {
      const webView = isSocialMediaWebView();
      setIsWebView(webView);
      
      if (webView) {
        // Aguardar um pouco para verificar se os produtos carregaram
        setTimeout(() => {
          const { needsBrowser } = detectLoadingIssues();
          if (needsBrowser) {
            setShowBanner(true);
          }
        }, 2000);
      }
    };

    checkWebView();
  }, []);

  const openInBrowser = () => {
    const currentUrl = window.location.href;
    window.open(currentUrl, '_blank');
  };

  const closeBanner = () => {
    setShowBanner(false);
  };

  if (!showBanner || !isWebView) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📱</span>
            <div>
              <p className="font-semibold text-sm">Para melhor experiência</p>
              <p className="text-xs opacity-90">Abra no seu navegador padrão</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={openInBrowser}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-white/30"
            >
              Abrir
            </button>
            <button
              onClick={closeBanner}
              className="text-white/80 hover:text-white text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebViewBanner;

