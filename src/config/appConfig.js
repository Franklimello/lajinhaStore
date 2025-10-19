// App Configuration
// This file contains all app configuration values
// In production, these should be moved to environment variables

export const appConfig = {
  // Google Analytics
  GA_ID: process.env.REACT_APP_GA_ID || 'G-B5WBJYR1YT',
  
  // Admin UIDs
  ADMIN_UIDS: [
    process.env.REACT_APP_ADMIN_UID || 'ZG5D6IrTRTZl5SDoEctLAtr4WkE2',
    process.env.REACT_APP_ADMIN_UID_2 || '6VbaNslrhQhXcyussPj53YhLiYj2'
  ],
  
  // PIX Configuration
  PIX_KEY: process.env.REACT_APP_PIX_KEY || '12819359647',
  
  // Contact Information
  CONTACT: {
    PHONE: process.env.REACT_APP_CONTACT_PHONE || '+55-33-99999-9999',
    ADDRESS: process.env.REACT_APP_CONTACT_ADDRESS || 'Lajinha, MG',
    WHATSAPP: process.env.REACT_APP_WHATSAPP_NUMBER || '5519997050303'
  },
  
  // App Information
  APP: {
    NAME: process.env.REACT_APP_APP_NAME || 'Supermercado Online Lajinha',
    DESCRIPTION: process.env.REACT_APP_APP_DESCRIPTION || 'Seu supermercado com os melhores produtos e preços. Faça suas compras online com praticidade e segurança.',
    URL: process.env.REACT_APP_APP_URL || 'https://compreaqui-324df.web.app'
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
