// Analytics avançado para tracking detalhado
export const advancedAnalytics = {
  // Tracking de jornada do usuário
  userJourney: {
    steps: [],
    startTime: Date.now(),
    
    // Adiciona um passo na jornada
    addStep: (step, data = {}) => {
      this.userJourney.steps.push({
        step,
        data,
        timestamp: Date.now(),
        timeFromStart: Date.now() - this.userJourney.startTime
      });
      
      // Salva no localStorage
      localStorage.setItem('user-journey', JSON.stringify(this.userJourney));
    },

    // Track de página visitada
    trackPageView: (pageName, data = {}) => {
      this.addStep('page_view', {
        page: pageName,
        url: window.location.href,
        referrer: document.referrer,
        ...data
      });
    },

    // Track de interação
    trackInteraction: (action, element, data = {}) => {
      this.addStep('interaction', {
        action,
        element,
        ...data
      });
    },

    // Track de conversão
    trackConversion: (type, value, data = {}) => {
      this.addStep('conversion', {
        type,
        value,
        ...data
      });
    }
  },

  // Tracking de performance
  performance: {
    // Mede tempo de carregamento
    measureLoadTime: () => {
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        
        if (typeof gtag !== 'undefined') {
          gtag('event', 'timing_complete', {
            name: 'page_load_time',
            value: Math.round(loadTime)
          });
        }
      });
    },

    // Mede tempo de interação
    measureInteractionTime: (element, action) => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (typeof gtag !== 'undefined') {
          gtag('event', 'timing_complete', {
            name: `${action}_duration`,
            value: Math.round(duration),
            custom_map: {
              element: element
            }
          });
        }
      };
    }
  },

  // Tracking de erros
  errorTracking: {
    // Track de erro JavaScript
    trackJSError: (error, fatal = false) => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
          description: error.message || error.toString(),
          fatal: fatal,
          custom_map: {
            error_type: 'javascript',
            stack_trace: error.stack
          }
        });
      }
    },

    // Track de erro de rede
    trackNetworkError: (url, status, error) => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
          description: `Network error: ${status} - ${url}`,
          fatal: false,
          custom_map: {
            error_type: 'network',
            url: url,
            status: status
          }
        });
      }
    }
  },

  // Tracking de conversões
  conversionTracking: {
    // Track de início de checkout
    trackCheckoutStart: (cartData) => {
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

    // Track de pedido concluído
    trackPurchaseComplete: (orderData) => {
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

    // Track de abandono de carrinho
    trackCartAbandonment: (cartData) => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'cart_abandonment', {
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
    }
  },

  // Tracking de engajamento
  engagement: {
    // Track de tempo na página
    trackTimeOnPage: (pageName) => {
      const startTime = Date.now();
      
      return () => {
        const timeSpent = Date.now() - startTime;
        
        if (typeof gtag !== 'undefined') {
          gtag('event', 'engagement_time', {
            value: timeSpent,
            custom_map: {
              page_name: pageName
            }
          });
        }
      };
    },

    // Track de scroll depth
    trackScrollDepth: () => {
      let maxScroll = 0;
      
      window.addEventListener('scroll', () => {
        const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        
        if (scrollDepth > maxScroll) {
          maxScroll = scrollDepth;
          
          if (typeof gtag !== 'undefined') {
            gtag('event', 'scroll_depth', {
              value: maxScroll
            });
          }
        }
      });
    }
  },

  // Inicializa todos os trackings
  init: () => {
    // Performance tracking
    this.performance.measureLoadTime();
    
    // Scroll depth tracking
    this.engagement.trackScrollDepth();
    
    // Error tracking
    window.addEventListener('error', (event) => {
      this.errorTracking.trackJSError(event.error, true);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.errorTracking.trackJSError(event.reason, false);
    });
    
    console.log('Advanced Analytics inicializado');
  }
};

// Inicializa automaticamente
advancedAnalytics.init();


