#!/usr/bin/env node

/**
 * Script de Setup Wizard
 * Facilita a configuração inicial do sistema para novos clientes
 * 
 * Uso: npm run setup
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

async function setup() {
  log('\n🚀 Configuração Inicial do Sistema\n', 'bright');
  log('Este assistente vai ajudá-lo a configurar o sistema.\n', 'blue');
  log('Pressione Enter para usar valores padrão (mostrados entre colchetes).\n', 'yellow');
  
  const config = {};
  
  // ============================================
  // INFORMAÇÕES DA LOJA
  // ============================================
  log('\n📦 INFORMAÇÕES DA LOJA', 'bright');
  log('─────────────────────────────────────\n', 'blue');
  
  config.STORE_NAME = await question('Nome da Loja [Supermercado Online]: ') || 'Supermercado Online';
  config.STORE_SUBTITLE = await question('Subtítulo/Descrição: ') || 'Seu supermercado com os melhores produtos';
  config.CONTACT_PHONE = await question('Telefone de Contato (formato: +55-00-00000-0000): ');
  config.CONTACT_ADDRESS = await question('Endereço (Cidade, Estado): ');
  config.WHATSAPP_NUMBER = await question('WhatsApp (somente números, ex: 5519999999999): ');
  config.APP_URL = await question('URL do Site [https://seusite.com.br]: ') || 'https://seusite.com.br';
  config.APP_DESCRIPTION = await question('Descrição para SEO: ') || 'Seu supermercado online. Faça suas compras com praticidade e segurança.';
  
  // ============================================
  // CONFIGURAÇÕES FIREBASE
  // ============================================
  log('\n🔥 CONFIGURAÇÕES FIREBASE', 'bright');
  log('─────────────────────────────────────', 'blue');
  log('Você precisa criar um projeto no Firebase Console:', 'yellow');
  log('https://console.firebase.google.com/\n', 'yellow');
  
  config.FIREBASE_PROJECT_ID = await question('Firebase Project ID: ');
  config.FIREBASE_API_KEY = await question('Firebase API Key: ');
  config.FIREBASE_AUTH_DOMAIN = await question(`Firebase Auth Domain [${config.FIREBASE_PROJECT_ID || 'seu-projeto'}.firebaseapp.com]: `) 
    || `${config.FIREBASE_PROJECT_ID || 'seu-projeto'}.firebaseapp.com`;
  config.FIREBASE_STORAGE_BUCKET = await question(`Firebase Storage Bucket [${config.FIREBASE_PROJECT_ID || 'seu-projeto'}.appspot.com]: `)
    || `${config.FIREBASE_PROJECT_ID || 'seu-projeto'}.appspot.com`;
  config.FIREBASE_MESSAGING_SENDER_ID = await question('Firebase Messaging Sender ID: ');
  config.FIREBASE_APP_ID = await question('Firebase App ID: ');
  config.FIREBASE_MEASUREMENT_ID = await question('Firebase Measurement ID (opcional, para Analytics): ') || '';
  config.FIREBASE_VAPID_KEY = await question('Firebase VAPID Key (para Push Notifications): ') || '';
  
  // ============================================
  // ADMINISTRADORES
  // ============================================
  log('\n👤 ADMINISTRADORES', 'bright');
  log('─────────────────────────────────────', 'blue');
  log('Adicione os UIDs dos usuários que serão administradores.', 'yellow');
  log('Você pode adicionar mais depois editando o arquivo .env.local\n', 'yellow');
  
  config.ADMIN_UID = await question('Admin UID 1 (obrigatório): ');
  config.ADMIN_UID_2 = await question('Admin UID 2 (opcional): ') || '';
  
  // ============================================
  // PAGAMENTO PIX
  // ============================================
  log('\n💳 CONFIGURAÇÕES PIX', 'bright');
  log('─────────────────────────────────────\n', 'blue');
  
  config.PIX_KEY = await question('Chave PIX (CPF, CNPJ, Email ou Chave Aleatória): ');
  config.PIX_CITY = await question('Cidade para PIX (ex: SAO PAULO): ') || 'CIDADE';
  config.PIX_RECEIVER_NAME = await question('Nome do Recebedor: ') || 'NOME DO RECEBEDOR';
  
  // ============================================
  // ANALYTICS (Opcional)
  // ============================================
  log('\n📊 GOOGLE ANALYTICS (Opcional)', 'bright');
  log('─────────────────────────────────────\n', 'blue');
  
  config.GA_ID = await question('Google Analytics ID (opcional, formato: G-XXXXXXXXXX): ') || '';
  
  // ============================================
  // GERAR ARQUIVO .env.local
  // ============================================
  log('\n💾 Gerando arquivo .env.local...', 'blue');
  
  const envContent = `# ============================================
# CONFIGURAÇÕES GERADAS AUTOMATICAMENTE
# Arquivo criado em: ${new Date().toLocaleString('pt-BR')}
# ============================================

# Informações da Loja
REACT_APP_STORE_NAME=${config.STORE_NAME}
REACT_APP_STORE_SUBTITLE=${config.STORE_SUBTITLE}
REACT_APP_CONTACT_PHONE=${config.CONTACT_PHONE}
REACT_APP_CONTACT_ADDRESS=${config.CONTACT_ADDRESS}
REACT_APP_WHATSAPP_NUMBER=${config.WHATSAPP_NUMBER}
REACT_APP_APP_URL=${config.APP_URL}
REACT_APP_APP_DESCRIPTION=${config.APP_DESCRIPTION}

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=${config.FIREBASE_API_KEY}
REACT_APP_FIREBASE_AUTH_DOMAIN=${config.FIREBASE_AUTH_DOMAIN}
REACT_APP_FIREBASE_PROJECT_ID=${config.FIREBASE_PROJECT_ID}
REACT_APP_FIREBASE_STORAGE_BUCKET=${config.FIREBASE_STORAGE_BUCKET}
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=${config.FIREBASE_MESSAGING_SENDER_ID}
REACT_APP_FIREBASE_APP_ID=${config.FIREBASE_APP_ID}
${config.FIREBASE_MEASUREMENT_ID ? `REACT_APP_FIREBASE_MEASUREMENT_ID=${config.FIREBASE_MEASUREMENT_ID}` : ''}
${config.FIREBASE_VAPID_KEY ? `REACT_APP_FIREBASE_VAPID_KEY=${config.FIREBASE_VAPID_KEY}` : ''}

# Administradores
REACT_APP_ADMIN_UID=${config.ADMIN_UID}
${config.ADMIN_UID_2 ? `REACT_APP_ADMIN_UID_2=${config.ADMIN_UID_2}` : ''}

# PIX Configuration
REACT_APP_PIX_KEY=${config.PIX_KEY}
REACT_APP_PIX_CITY=${config.PIX_CITY}
REACT_APP_PIX_RECEIVER_NAME=${config.PIX_RECEIVER_NAME}

# Google Analytics
${config.GA_ID ? `REACT_APP_GA_ID=${config.GA_ID}` : ''}
`;

  const envPath = path.join(__dirname, '..', '.env.local');
  fs.writeFileSync(envPath, envContent);
  
  log('\n✅ Arquivo .env.local criado com sucesso!', 'green');
  log(`   Localização: ${envPath}`, 'blue');
  
  // ============================================
  // PRÓXIMOS PASSOS
  // ============================================
  log('\n📋 PRÓXIMOS PASSOS', 'bright');
  log('─────────────────────────────────────\n', 'blue');
  log('1. Instale as dependências:', 'yellow');
  log('   npm install\n', 'blue');
  log('2. Configure o Firebase:', 'yellow');
  log('   - Ative Authentication no Firebase Console', 'blue');
  log('   - Ative Firestore Database', 'blue');
  log('   - Ative Storage', 'blue');
  log('   - Configure as regras de segurança (firestore.rules)\n', 'blue');
  log('3. Inicie o desenvolvimento:', 'yellow');
  log('   npm start\n', 'blue');
  log('4. Para produção:', 'yellow');
  log('   npm run build\n', 'blue');
  log('\n✨ Configuração concluída!', 'green');
  log('   Revise o arquivo .env.local se necessário.\n', 'blue');
  
  rl.close();
}

// Executar setup
setup().catch((error) => {
  log(`\n❌ Erro durante a configuração: ${error.message}`, 'red');
  process.exit(1);
});

