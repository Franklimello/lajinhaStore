import { useState, useEffect } from 'react';
import { isSocialMediaWebView } from '../../utils/instagramWebView';

const WebViewFallback = ({ children, fallback }) => {
  const [showFallback, setShowFallback] = useState(false);
  const [isWebView, setIsWebView] = useState(false);

  useEffect(() => {
    const webView = isSocialMediaWebView();
    setIsWebView(webView);
    
    if (webView) {
      // Aguardar 5 segundos para verificar se os produtos carregaram
      const timer = setTimeout(() => {
        const hasProducts = document.querySelectorAll('[data-testid="product-card"], .swiper-slide, .produto-card').length > 0;
        if (!hasProducts) {
          setShowFallback(true);
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  if (isWebView && showFallback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Abra no seu navegador
          </h2>
          <p className="text-gray-600 mb-6">
            Para uma melhor experiência e visualizar todos os produtos, 
            abra este link no seu navegador padrão (Chrome, Safari, etc.)
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.open(window.location.href, '_blank')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Abrir no Navegador
            </button>
            
            <button
              onClick={() => setShowFallback(false)}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Tentar Novamente
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Como abrir:</h3>
            <ol className="text-sm text-blue-700 text-left space-y-1">
              <li>1. Toque no botão "Abrir no Navegador"</li>
              <li>2. Ou copie o link e cole no seu navegador</li>
              <li>3. Ou compartilhe com você mesmo no WhatsApp</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default WebViewFallback;

