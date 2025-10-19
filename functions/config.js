// Configurações do Firebase Functions
// Migração de functions.config() para variáveis de ambiente

const config = {
  resend: {
    key: process.env.RESEND_API_KEY || 're_LdvmKhK6_JGVfizY5MaTJk97imMDQq3bf',
    destination: process.env.RESEND_DESTINATION_EMAIL || 'frank.melo.wal@gmail.com'
  }
};

module.exports = config;
