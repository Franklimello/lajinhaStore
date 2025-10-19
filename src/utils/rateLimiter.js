// Rate limiting para prevenir spam e ataques
export const rateLimiter = {
  // Configurações de rate limiting
  limits: {
    // Limite de requisições por minuto
    requestsPerMinute: 60,
    // Limite de tentativas de login por hora
    loginAttemptsPerHour: 5,
    // Limite de adições ao carrinho por minuto
    cartAdditionsPerMinute: 30,
    // Limite de buscas por minuto
    searchesPerMinute: 20
  },

  // Storage para tracking de requisições
  requestLogs: new Map(),

  // Verifica se uma ação está dentro do limite
  isAllowed: (action, identifier = 'default') => {
    const key = `${action}_${identifier}`;
    const now = Date.now();
    
    if (!this.requestLogs.has(key)) {
      this.requestLogs.set(key, []);
    }

    const logs = this.requestLogs.get(key);
    const limit = this.limits[action] || 60;
    const windowMs = 60000; // 1 minuto

    // Remove logs antigos
    const recentLogs = logs.filter(timestamp => now - timestamp < windowMs);
    this.requestLogs.set(key, recentLogs);

    // Verifica se está dentro do limite
    if (recentLogs.length >= limit) {
      return false;
    }

    // Adiciona o timestamp atual
    recentLogs.push(now);
    this.requestLogs.set(key, recentLogs);

    return true;
  },

  // Rate limiting para login
  checkLoginLimit: (email) => {
    return this.isAllowed('loginAttemptsPerHour', email);
  },

  // Rate limiting para adição ao carrinho
  checkCartLimit: (userId) => {
    return this.isAllowed('cartAdditionsPerMinute', userId);
  },

  // Rate limiting para busca
  checkSearchLimit: (userId) => {
    return this.isAllowed('searchesPerMinute', userId);
  },

  // Rate limiting para requisições gerais
  checkRequestLimit: (userId) => {
    return this.isAllowed('requestsPerMinute', userId);
  },

  // Limpa logs antigos (executar periodicamente)
  cleanup: () => {
    const now = Date.now();
    const maxAge = 3600000; // 1 hora

    for (const [key, logs] of this.requestLogs.entries()) {
      const recentLogs = logs.filter(timestamp => now - timestamp < maxAge);
      
      if (recentLogs.length === 0) {
        this.requestLogs.delete(key);
      } else {
        this.requestLogs.set(key, recentLogs);
      }
    }
  },

  // Middleware para rate limiting
  middleware: (action, getIdentifier = () => 'default') => {
    return (req, res, next) => {
      const identifier = getIdentifier(req);
      
      if (!this.isAllowed(action, identifier)) {
        return res.status(429).json({
          error: 'Muitas requisições. Tente novamente em alguns minutos.',
          retryAfter: 60
        });
      }
      
      next();
    };
  },

  // Hook para usar rate limiting em React
  useRateLimit: (action, identifier) => {
    const [isAllowed, setIsAllowed] = useState(true);
    const [retryAfter, setRetryAfter] = useState(0);

    const checkLimit = useCallback(() => {
      const allowed = this.isAllowed(action, identifier);
      setIsAllowed(allowed);
      
      if (!allowed) {
        setRetryAfter(60);
        const timer = setInterval(() => {
          setRetryAfter(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              setIsAllowed(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }, [action, identifier]);

    return { isAllowed, retryAfter, checkLimit };
  }
};

// Limpa logs antigos a cada 5 minutos
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);
