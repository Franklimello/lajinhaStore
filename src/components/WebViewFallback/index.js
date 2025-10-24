import { useState, useEffect } from 'react';

const WebViewFallback = ({ children }) => {
  const [showInstagramFallback, setShowInstagramFallback] = useState(false);
  const [isInstagramWebView, setIsInstagramWebView] = useState(false);

  // Detectar Instagram WebView em iOS
  const detectInstagramWebView = () => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPhone|iPad/.test(userAgent);
    const isInstagram = /Instagram/.test(userAgent);
    
    return isIOS && isInstagram;
  };

  useEffect(() => {
    const isInstagram = detectInstagramWebView();
    setIsInstagramWebView(isInstagram);
    
    if (isInstagram) {
      // Mostrar fallback imediatamente para Instagram WebView em iOS
      setShowInstagramFallback(true);
    }
  }, []);

  // Se for Instagram WebView em iOS, mostrar tela informativa
  if (isInstagramWebView && showInstagramFallback) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-6 animate-bounce">📱</div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Parece que você está abrindo pelo Instagram.
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Para uma melhor experiência de navegação e visualização completa dos produtos, 
            recomendamos abrir no seu navegador externo (Safari).
          </p>
          
          <button
            onClick={() => window.open('https://compreaqui-324df.web.app/abrir.html', '_blank')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Abrir no Safari
          </button>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">💡 Dica:</h3>
            <p className="text-sm text-blue-700">
              No Safari você terá acesso completo a todos os produtos, 
              carrinho de compras e funcionalidades do site.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar conteúdo normal se não for Instagram WebView
  return children;
};

export default WebViewFallback;