#!/usr/bin/env node

/**
 * Script de Validação de Configuração
 * Verifica se todas as variáveis necessárias estão configuradas
 * 
 * Uso: npm run validate-config
 */

const fs = require('fs');
const path = require('path');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);
const error = (msg) => log(`❌ ${msg}`, 'red');
const success = (msg) => log(`✅ ${msg}`, 'green');
const warning = (msg) => log(`⚠️  ${msg}`, 'yellow');
const info = (msg) => log(`ℹ️  ${msg}`, 'blue');

// Variáveis obrigatórias
const REQUIRED_VARS = {
  // Informações da Loja
  'REACT_APP_STORE_NAME': 'Nome da Loja',
  'REACT_APP_CONTACT_PHONE': 'Telefone de Contato',
  'REACT_APP_WHATSAPP_NUMBER': 'WhatsApp',
  'REACT_APP_CONTACT_ADDRESS': 'Endereço',
  
  // Firebase
  'REACT_APP_FIREBASE_API_KEY': 'Firebase API Key',
  'REACT_APP_FIREBASE_PROJECT_ID': 'Firebase Project ID',
  'REACT_APP_FIREBASE_AUTH_DOMAIN': 'Firebase Auth Domain',
  'REACT_APP_FIREBASE_STORAGE_BUCKET': 'Firebase Storage Bucket',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID': 'Firebase Messaging Sender ID',
  'REACT_APP_FIREBASE_APP_ID': 'Firebase App ID',
  
  // Admin
  'REACT_APP_ADMIN_UID': 'Admin UID (Administrador 1)',
  
  // PIX
  'REACT_APP_PIX_KEY': 'Chave PIX',
  'REACT_APP_PIX_CITY': 'Cidade para PIX',
};

// Variáveis opcionais mas recomendadas
const OPTIONAL_VARS = {
  'REACT_APP_STORE_SUBTITLE': 'Subtítulo da Loja',
  'REACT_APP_APP_URL': 'URL do Site',
  'REACT_APP_FIREBASE_VAPID_KEY': 'Firebase VAPID Key (Notificações)',
  'REACT_APP_GA_ID': 'Google Analytics ID',
};

function loadEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const vars = {};
    
    content.split('\n').forEach(line => {
      line = line.trim();
      // Ignora comentários e linhas vazias
      if (line && !line.startsWith('#')) {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove aspas
          vars[key] = value;
        }
      }
    });
    
    return vars;
  } catch (error) {
    return null;
  }
}

function validateValue(key, value, defaultValue = null) {
  if (!value || value === defaultValue || value === '' || value === 'your-...') {
    return false;
  }
  
  // Verifica se é um valor padrão genérico
  const genericValues = ['example', 'placeholder', 'changeme', 'seu-', 'your-'];
  const lowerValue = value.toLowerCase();
  return !genericValues.some(generic => lowerValue.includes(generic));
}

function checkFiles() {
  log('\n📁 Verificando Arquivos...', 'bright');
  log('─────────────────────────────────────\n', 'blue');
  
  const checks = [
    { path: 'public/logo192.png', name: 'Logo 192x192', critical: false },
    { path: 'public/logo512.png', name: 'Logo 512x512', critical: false },
    { path: 'public/favicon.ico', name: 'Favicon', critical: false },
  ];
  
  let allOk = true;
  
  checks.forEach(check => {
    const fullPath = path.join(process.cwd(), check.path);
    if (fs.existsSync(fullPath)) {
      success(`${check.name}: Encontrado`);
    } else {
      if (check.critical) {
        error(`${check.name}: NÃO encontrado (CRÍTICO)`);
        allOk = false;
      } else {
        warning(`${check.name}: Não encontrado (opcional, mas recomendado)`);
      }
    }
  });
  
  return allOk;
}

function main() {
  log('\n🔍 Validação de Configuração White-Label', 'bright');
  log('═════════════════════════════════════════\n', 'blue');
  
  // Carregar .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  const envVars = loadEnvFile(envPath);
  
  if (!envVars) {
    error('Arquivo .env.local não encontrado!');
    warning('Execute: npm run setup');
    log('\n');
    process.exit(1);
  }
  
  log('📋 Variáveis Obrigatórias', 'bright');
  log('─────────────────────────────────────\n', 'blue');
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Validar variáveis obrigatórias
  Object.entries(REQUIRED_VARS).forEach(([key, name]) => {
    const value = envVars[key];
    if (!validateValue(key, value)) {
      error(`${name} (${key}): NÃO configurado ou valor padrão`);
      hasErrors = true;
    } else {
      success(`${name}: Configurado`);
    }
  });
  
  log('\n📋 Variáveis Opcionais (Recomendadas)', 'bright');
  log('─────────────────────────────────────\n', 'blue');
  
  // Validar variáveis opcionais
  Object.entries(OPTIONAL_VARS).forEach(([key, name]) => {
    const value = envVars[key];
    if (!validateValue(key, value)) {
      warning(`${name} (${key}): Não configurado`);
      hasWarnings = true;
    } else {
      success(`${name}: Configurado`);
    }
  });
  
  // Verificar arquivos
  const filesOk = checkFiles();
  
  // Resultado final
  log('\n═════════════════════════════════════════', 'blue');
  
  if (hasErrors) {
    error('\n❌ CONFIGURAÇÃO INCOMPLETA!');
    error('Corrija os erros acima antes de continuar.\n');
    process.exit(1);
  } else if (hasWarnings) {
    warning('\n⚠️  CONFIGURAÇÃO PARCIAL');
    warning('Algumas configurações opcionais estão faltando.\n');
    info('Recomendação: Complete as configurações opcionais para melhor experiência.\n');
    process.exit(0);
  } else {
    success('\n✅ CONFIGURAÇÃO COMPLETA!');
    success('Sistema pronto para uso.\n');
    process.exit(0);
  }
}

main();

