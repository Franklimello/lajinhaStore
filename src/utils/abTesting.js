// A/B Testing básico gratuito
export const abTesting = {
  // Configurações dos testes
  tests: {
    homepage_banner: {
      variants: ['A', 'B'],
      traffic: 0.5, // 50% dos usuários
      duration: 30 // dias
    },
    checkout_button: {
      variants: ['A', 'B', 'C'],
      traffic: 0.3, // 30% dos usuários
      duration: 14 // dias
    },
    product_layout: {
      variants: ['A', 'B'],
      traffic: 0.4, // 40% dos usuários
      duration: 21 // dias
    }
  },

  // Gera variante para um teste
  getVariant: (testName) => {
    const test = this.tests[testName];
    if (!test) return 'A';

    // Verifica se o teste ainda está ativo
    const testStart = localStorage.getItem(`ab_test_${testName}_start`);
    if (testStart) {
      const daysSinceStart = (Date.now() - parseInt(testStart)) / (1000 * 60 * 60 * 24);
      if (daysSinceStart > test.duration) {
        return 'A'; // Retorna variante padrão após expiração
      }
    }

    // Gera variante baseada no ID do usuário
    const userId = this.getUserId();
    const hash = this.hashCode(`${userId}_${testName}`);
    const variantIndex = Math.abs(hash) % test.variants.length;
    
    const variant = test.variants[variantIndex];
    
    // Salva a variante escolhida
    localStorage.setItem(`ab_test_${testName}`, variant);
    
    // Inicia o teste se for a primeira vez
    if (!testStart) {
      localStorage.setItem(`ab_test_${testName}_start`, Date.now().toString());
    }

    return variant;
  },

  // Gera ID único para o usuário
  getUserId: () => {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      userId = Math.random().toString(36).substr(2, 9);
      localStorage.setItem('user_id', userId);
    }
    return userId;
  },

  // Hash simples para distribuição consistente
  hashCode: (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  },

  // Track de conversão para teste
  trackConversion: (testName, conversionType, value = 1) => {
    const variant = localStorage.getItem(`ab_test_${testName}`) || 'A';
    const conversionData = {
      test: testName,
      variant,
      type: conversionType,
      value,
      timestamp: Date.now()
    };

    // Salva conversão
    const conversions = JSON.parse(localStorage.getItem('ab_conversions') || '[]');
    conversions.push(conversionData);
    localStorage.setItem('ab_conversions', JSON.stringify(conversions));

    // Track no analytics se disponível
    if (typeof gtag !== 'undefined') {
      gtag('event', 'ab_test_conversion', {
        test_name: testName,
        variant: variant,
        conversion_type: conversionType,
        value: value
      });
    }

    console.log('A/B Test Conversion:', conversionData);
  },

  // Obtém resultados de um teste
  getTestResults: (testName) => {
    const conversions = JSON.parse(localStorage.getItem('ab_conversions') || '[]');
    const testConversions = conversions.filter(c => c.test === testName);
    
    const results = {};
    testConversions.forEach(conversion => {
      if (!results[conversion.variant]) {
        results[conversion.variant] = {
          conversions: 0,
          value: 0,
          types: {}
        };
      }
      
      results[conversion.variant].conversions += 1;
      results[conversion.variant].value += conversion.value;
      
      if (!results[conversion.variant].types[conversion.type]) {
        results[conversion.variant].types[conversion.type] = 0;
      }
      results[conversion.variant].types[conversion.type] += 1;
    });

    return results;
  },

  // Limpa testes expirados
  cleanupExpiredTests: () => {
    Object.keys(this.tests).forEach(testName => {
      const testStart = localStorage.getItem(`ab_test_${testName}_start`);
      if (testStart) {
        const daysSinceStart = (Date.now() - parseInt(testStart)) / (1000 * 60 * 60 * 24);
        if (daysSinceStart > this.tests[testName].duration) {
          localStorage.removeItem(`ab_test_${testName}`);
          localStorage.removeItem(`ab_test_${testName}_start`);
        }
      }
    });
  },

  // Hook para usar A/B testing em React
  useABTest: (testName, defaultValue = 'A') => {
    const [variant, setVariant] = React.useState(defaultValue);

    React.useEffect(() => {
      const testVariant = this.getVariant(testName);
      setVariant(testVariant);
    }, [testName]);

    const trackConversion = (type, value) => {
      this.trackConversion(testName, type, value);
    };

    return { variant, trackConversion };
  }
};

// Limpa testes expirados periodicamente
setInterval(() => {
  abTesting.cleanupExpiredTests();
}, 24 * 60 * 60 * 1000); // Uma vez por dia
