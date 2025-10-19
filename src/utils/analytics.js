// Google Analytics e tracking de eventos
export const analytics = {
  // Inicializa o Google Analytics
  init: () => {
    // Função gtag será disponibilizada pelo script no HTML
    if (typeof gtag !== 'undefined') {
      console.log('Google Analytics inicializado');
    }
  },

  // Track de eventos de conversão
  trackPurchase: (orderData) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'purchase', {
        transaction_id: orderData.orderId,
        value: orderData.total,
        currency: 'BRL',
        items: orderData.items.map(item => ({
          item_id: item.id,
          item_name: item.nome || item.titulo,
          category: item.categoria,
          quantity: item.qty,
          price: item.preco
        }))
      });
    }
  },

  // Track de adição ao carrinho
  trackAddToCart: (product) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'add_to_cart', {
        currency: 'BRL',
        value: product.preco,
        items: [{
          item_id: product.id,
          item_name: product.nome || product.titulo,
          category: product.categoria,
          quantity: 1,
          price: product.preco
        }]
      });
    }
  },

  // Track de visualização de produto
  trackViewItem: (product) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'view_item', {
        currency: 'BRL',
        value: product.preco,
        items: [{
          item_id: product.id,
          item_name: product.nome || product.titulo,
          category: product.categoria,
          price: product.preco
        }]
      });
    }
  },

  // Track de início de checkout
  trackBeginCheckout: (cartData) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'begin_checkout', {
        currency: 'BRL',
        value: cartData.total,
        items: cartData.items.map(item => ({
          item_id: item.id,
          item_name: item.nome || item.titulo,
          category: item.categoria,
          quantity: item.qty,
          price: item.preco
        }))
      });
    }
  },

  // Track de páginas visitadas
  trackPageView: (pageName) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href
      });
    }
  },

  // Track de busca
  trackSearch: (searchTerm) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'search', {
        search_term: searchTerm
      });
    }
  },

  // Track de login
  trackLogin: (method = 'email') => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'login', {
        method: method
      });
    }
  },

  // Track de erro
  trackError: (error, fatal = false) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: error.message || error,
        fatal: fatal
      });
    }
  }
};

// Hook para usar analytics facilmente
export const useAnalytics = () => {
  return analytics;
};

// Função para trackar tempo na página
export const trackTimeOnPage = (pageName) => {
  const startTime = Date.now();
  
  return () => {
    const timeSpent = Date.now() - startTime;
    if (typeof gtag !== 'undefined') {
      gtag('event', 'timing_complete', {
        name: 'page_view_duration',
        value: timeSpent,
        custom_map: {
          page_name: pageName
        }
      });
    }
  };
};


