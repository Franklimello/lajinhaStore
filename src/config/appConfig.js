// App Configuration
// This file contains all app configuration values
// ⚠️ IMPORTANTE: Para personalizar, use variáveis de ambiente no arquivo .env.local
// ⚠️ NÃO edite os valores padrão aqui - eles são apenas fallback para desenvolvimento
// ⚠️ Execute 'npm run setup' para configurar o sistema

/**
 * Remove valores padrão específicos do cliente original
 * Todos os valores devem vir de variáveis de ambiente em produção
 */
const getEnvOrFallback = (envKey, fallback = '', description = '') => {
  const value = process.env[envKey];
  
  // Em produção, sempre exigir variável de ambiente
  if (process.env.NODE_ENV === 'production' && !value) {
    console.warn(`⚠️ [appConfig] ${envKey} não configurado! ${description}`);
  }
  
  return value || fallback;
};

export const appConfig = {
  // Google Analytics
  GA_ID: getEnvOrFallback('REACT_APP_GA_ID', 'G-B5WBJYR1YT', 'Google Analytics ID não configurado'),
  
  // Admin UIDs (suporta múltiplos admins via REACT_APP_ADMIN_UID, REACT_APP_ADMIN_UID_2, etc.)
  ADMIN_UIDS: (() => {
    const uids = [];
    // Busca todos os UIDs de admin definidos
    let i = 1;
    while (true) {
      const key = i === 1 ? 'REACT_APP_ADMIN_UID' : `REACT_APP_ADMIN_UID_${i}`;
      const uid = process.env[key];
      if (uid) {
        uids.push(uid);
        i++;
      } else {
        break;
      }
    }
    // Em produção, deve ter pelo menos 1 admin
    if (process.env.NODE_ENV === 'production' && uids.length === 0) {
      console.warn('⚠️ [appConfig] Nenhum admin UID configurado! Configure REACT_APP_ADMIN_UID');
    }
    // Fallback - VALORES DO LAJINHA (manter para funcionamento normal)
    // Quando distribuir para outros clientes, remover esses valores padrão
    if (uids.length === 0) {
      return [
        'ZG5D6IrTRTZl5SDoEctLAtr4WkE2',
        '6VbaNslrhQhXcyussPj53YhLiYj2'
      ];
    }
    return uids;
  })(),
  
  // PIX Configuration
  PIX_KEY: getEnvOrFallback('REACT_APP_PIX_KEY', '12819359647', 'Chave PIX não configurada'),
  PIX_CITY: getEnvOrFallback('REACT_APP_PIX_CITY', 'LAJINHA', 'Cidade para PIX não configurada'),
  PIX_RECEIVER_NAME: getEnvOrFallback('REACT_APP_PIX_RECEIVER_NAME', 'NOME DO RECEBEDOR', 'Nome do recebedor PIX não configurado'),
  
  // Firebase VAPID Key para Push Notifications
  FIREBASE_VAPID_KEY: getEnvOrFallback('REACT_APP_FIREBASE_VAPID_KEY', 'BEl62iUYgUivxIkv69yViEuiBIa2t2_6KjZQm2bY4k8', 'Firebase VAPID Key não configurada'),
  
  // Firebase Configuration (mantém valores padrão do Lajinha para funcionamento normal)
  FIREBASE_CONFIG: {
    apiKey: getEnvOrFallback('REACT_APP_FIREBASE_API_KEY', process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyCPOsZYAXUzdEZ_wQV7HpON_cZ0QGJpTqI', 'Firebase API Key não configurada'),
    authDomain: getEnvOrFallback('REACT_APP_FIREBASE_AUTH_DOMAIN', process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'compreaqui-324df.firebaseapp.com', 'Firebase Auth Domain não configurado'),
    projectId: getEnvOrFallback('REACT_APP_FIREBASE_PROJECT_ID', process.env.REACT_APP_FIREBASE_PROJECT_ID || 'compreaqui-324df', 'Firebase Project ID não configurado'),
    storageBucket: getEnvOrFallback('REACT_APP_FIREBASE_STORAGE_BUCKET', process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'compreaqui-324df.firebasestorage.app', 'Firebase Storage Bucket não configurado'),
    messagingSenderId: getEnvOrFallback('REACT_APP_FIREBASE_MESSAGING_SENDER_ID', process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '821962501479', 'Firebase Messaging Sender ID não configurado'),
    appId: getEnvOrFallback('REACT_APP_FIREBASE_APP_ID', process.env.REACT_APP_FIREBASE_APP_ID || '1:821962501479:web:2dbdb1744b7d5849a913c2', 'Firebase App ID não configurado'),
    measurementId: getEnvOrFallback('REACT_APP_FIREBASE_MEASUREMENT_ID', process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-B5WBJYR1YT', 'Firebase Measurement ID não configurado')
  },
  
  // Contact Information
  CONTACT: {
    PHONE: getEnvOrFallback('REACT_APP_CONTACT_PHONE', '+55-33-99999-9999', 'Telefone de contato não configurado'),
    ADDRESS: getEnvOrFallback('REACT_APP_CONTACT_ADDRESS', 'Lajinha, MG', 'Endereço não configurado'),
    WHATSAPP: getEnvOrFallback('REACT_APP_WHATSAPP_NUMBER', '5519997050303', 'WhatsApp não configurado')
  },
  
  // Store Hours (Horário de Atendimento)
  STORE_HOURS: {
    WEEKDAYS_LABEL: getEnvOrFallback('REACT_APP_STORE_HOURS_WEEKDAYS_LABEL', 'Segunda a Sábado', 'Label dos dias úteis'),
    WEEKDAYS_TIME: getEnvOrFallback('REACT_APP_STORE_HOURS_WEEKDAYS_TIME', '8h às 19h', 'Horário dos dias úteis'),
    WEEKDAYS_TIME_FORMATTED: getEnvOrFallback('REACT_APP_STORE_HOURS_WEEKDAYS_TIME_FORMATTED', '08:00 - 19:00', 'Horário formatado dos dias úteis'),
    SUNDAY_LABEL: getEnvOrFallback('REACT_APP_STORE_HOURS_SUNDAY_LABEL', 'Domingo', 'Label do domingo'),
    SUNDAY_TIME: getEnvOrFallback('REACT_APP_STORE_HOURS_SUNDAY_TIME', '8h às 11h', 'Horário do domingo'),
    SUNDAY_TIME_FORMATTED: getEnvOrFallback('REACT_APP_STORE_HOURS_SUNDAY_TIME_FORMATTED', '08:00 - 11:00', 'Horário formatado do domingo'),
    DELIVERY_TIME: getEnvOrFallback('REACT_APP_STORE_DELIVERY_TIME', '30 a 60 minutos', 'Tempo de entrega')
  },
  
  // App Information
  APP: {
    NAME: getEnvOrFallback('REACT_APP_STORE_NAME', process.env.REACT_APP_APP_NAME || 'Supermercado Online Lajinha', 'Nome da loja não configurado'),
    SUBTITLE: getEnvOrFallback('REACT_APP_STORE_SUBTITLE', 'Seu supermercado com os melhores produtos', 'Subtítulo não configurado'),
    DESCRIPTION: getEnvOrFallback('REACT_APP_APP_DESCRIPTION', 'Seu supermercado com os melhores produtos e preços. Faça suas compras online com praticidade e segurança.', 'Descrição não configurada'),
    URL: getEnvOrFallback('REACT_APP_APP_URL', 'https://compreaqui-324df.web.app', 'URL do site não configurada')
  },
  
  // Development flags
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production'
};

// Helper function to check if user is admin
export const isAdmin = (userId) => {
  return appConfig.ADMIN_UIDS.includes(userId);
};

// Helper function for safe logging
export const safeLog = (...args) => {
  if (!appConfig.IS_PRODUCTION) {
    console.log(...args);
  }
};

export default appConfig;
