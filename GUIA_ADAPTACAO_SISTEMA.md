# 🚀 Guia Completo de Adaptação do Sistema para Venda/Distribuição

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura de Configuração](#arquitetura-de-configuração)
3. [Variáveis de Ambiente](#variáveis-de-ambiente)
4. [Sistema de Temas](#sistema-de-temas)
5. [Categorias Customizáveis](#categorias-customizáveis)
6. [Multi-tenancy (Opcional)](#multi-tenancy-opcional)
7. [Scripts de Instalação](#scripts-de-instalação)
8. [Documentação para Clientes](#documentação-para-clientes)
9. [Checklist de Customização](#checklist-de-customização)

---

## 1. Visão Geral

Para tornar o sistema vendável/distribuível, você precisa:

✅ **Centralizar todas as configurações** em um único lugar  
✅ **Separar dados específicos** do cliente do código  
✅ **Criar sistema de temas** para personalização visual  
✅ **Documentar processo** de instalação e configuração  
✅ **Criar scripts automatizados** para setup inicial  

---

## 2. Arquitetura de Configuração

### Estrutura Recomendada

```
lajinhaStore/
├── src/
│   ├── config/
│   │   ├── appConfig.js          # ✅ Já existe - Melhorar
│   │   ├── themeConfig.js         # 🆕 Novo - Temas e cores
│   │   ├── categoriesConfig.js    # 🆕 Novo - Categorias
│   │   └── businessConfig.js      # 🆕 Novo - Dados do negócio
│   ├── templates/
│   │   └── .env.example          # 🆕 Template de variáveis
│   └── ...
├── .env.local                     # 🆕 Arquivo de configuração local
├── .env.example                   # 🆕 Template para distribuição
├── setup-wizard.js                # 🆕 Script de setup inicial
└── CUSTOMIZATION_GUIDE.md         # 🆕 Guia para clientes
```

---

## 3. Variáveis de Ambiente

### Arquivo `.env.example` (Template)

```env
# ============================================
# CONFIGURAÇÕES DO NEGÓCIO
# ============================================

# Nome da Loja
REACT_APP_STORE_NAME=Supermercado Online
REACT_APP_STORE_SUBTITLE=Seu supermercado com os melhores produtos

# Informações de Contato
REACT_APP_CONTACT_PHONE=+55-00-00000-0000
REACT_APP_CONTACT_ADDRESS=Cidade, Estado
REACT_APP_WHATSAPP_NUMBER=5500000000000

# URL do Site
REACT_APP_APP_URL=https://seusite.com.br

# Descrição para SEO
REACT_APP_APP_DESCRIPTION=Descrição do seu supermercado online

# ============================================
# CONFIGURAÇÕES FIREBASE
# ============================================

REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
REACT_APP_FIREBASE_VAPID_KEY=your-vapid-key

# ============================================
# ADMINISTRADORES
# ============================================

REACT_APP_ADMIN_UID=user-id-1
REACT_APP_ADMIN_UID_2=user-id-2

# ============================================
# PAGAMENTO PIX
# ============================================

REACT_APP_PIX_KEY=00000000000
REACT_APP_PIX_CITY=CIDADE
REACT_APP_PIX_RECEIVER_NAME=Nome do Recebedor

# ============================================
# ANALYTICS
# ============================================

REACT_APP_GA_ID=G-XXXXXXXXXX

# ============================================
# APP MOBILE (Android)
# ============================================

REACT_APP_ANDROID_PACKAGE_NAME=com.supermercado.loja
REACT_APP_ANDROID_APP_NAME=Nome do App
REACT_APP_KEYSTORE_PATH=android/app/release-key.jks
REACT_APP_KEYSTORE_PASSWORD=senha123
REACT_APP_KEYSTORE_ALIAS=app-key
REACT_APP_KEYSTORE_ALIAS_PASSWORD=senha123
```

---

## 4. Sistema de Temas

### Arquivo `src/config/themeConfig.js`

```javascript
// Configuração de Temas e Cores Personalizáveis

export const themeConfig = {
  // Cores Principais
  colors: {
    primary: process.env.REACT_APP_THEME_PRIMARY || '#3B82F6', // Azul
    secondary: process.env.REACT_APP_THEME_SECONDARY || '#8B5CF6', // Roxo
    accent: process.env.REACT_APP_THEME_ACCENT || '#10B981', // Verde
    danger: process.env.REACT_APP_THEME_DANGER || '#EF4444', // Vermelho
    warning: process.env.REACT_APP_THEME_WARNING || '#F59E0B', // Amarelo
    success: process.env.REACT_APP_THEME_SUCCESS || '#10B981', // Verde
  },

  // Gradientes para Botões
  gradients: {
    primary: process.env.REACT_APP_GRADIENT_PRIMARY || 'from-blue-500 to-blue-600',
    secondary: process.env.REACT_APP_GRADIENT_SECONDARY || 'from-purple-500 to-pink-500',
    accent: process.env.REACT_APP_GRADIENT_ACCENT || 'from-green-500 to-emerald-600',
  },

  // Temas Pré-definidos
  presets: {
    default: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      name: 'Padrão (Azul/Roxo)'
    },
    green: {
      primary: '#10B981',
      secondary: '#059669',
      name: 'Verde'
    },
    orange: {
      primary: '#F97316',
      secondary: '#EA580C',
      name: 'Laranja'
    },
    purple: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      name: 'Roxo'
    },
    red: {
      primary: '#EF4444',
      secondary: '#DC2626',
      name: 'Vermelho'
    },
  }
};

// Função para aplicar tema
export const applyTheme = (themeName = 'default') => {
  const theme = themeConfig.presets[themeName] || themeConfig.presets.default;
  
  // Atualiza variáveis CSS
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
  }
  
  return theme;
};

export default themeConfig;
```

---

## 5. Categorias Customizáveis

### Arquivo `src/config/categoriesConfig.js`

```javascript
// Configuração de Categorias Personalizáveis

const defaultCategories = [
  { name: 'Mercearia', icon: '🛒', color: 'from-blue-500 to-indigo-600', route: '/mercearia' },
  { name: 'Limpeza', icon: '🧹', color: 'from-teal-500 to-cyan-600', route: '/limpeza' },
  { name: 'Frios e laticínios', icon: '🧀', color: 'from-yellow-500 to-amber-600', route: '/frios-laticinios' },
  { name: 'Guloseimas e snacks', icon: '🍫', color: 'from-pink-500 to-fuchsia-600', route: '/guloseimas-snacks' },
  { name: 'Bebidas', icon: '🥤', color: 'from-cyan-500 to-blue-600', route: '/bebidas' },
  { name: 'Bebidas Geladas', icon: '🧊', color: 'from-blue-500 to-indigo-600', route: '/bebidas-geladas' },
  { name: 'Higiene pessoal', icon: '🧴', color: 'from-purple-500 to-violet-600', route: '/higiene-pessoal' },
  { name: 'Cosméticos', icon: '💄', color: 'from-pink-500 to-purple-600', route: '/cosmeticos' },
  { name: 'Farmácia', icon: '💊', color: 'from-emerald-500 to-green-600', route: '/farmacia' },
  { name: 'Utilidades domésticas', icon: '🏠', color: 'from-orange-500 to-red-600', route: '/utilidades-domesticas' },
  { name: 'Pet shop', icon: '🐾', color: 'from-amber-500 to-orange-600', route: '/pet-shop' },
  { name: 'Infantil', icon: '👶', color: 'from-sky-500 to-blue-600', route: '/infantil' },
  { name: 'Hortifruti', icon: '🥬', color: 'from-green-500 to-emerald-600', route: '/hortifruti' },
  { name: 'Açougue', icon: '🥩', color: 'from-red-500 to-rose-600', route: '/acougue' },
  { name: 'Cesta Básica', icon: '🛒', color: 'from-green-500 to-emerald-600', route: '/cesta-basica' },
];

// Carregar categorias customizadas do Firestore ou usar padrão
export const getCategories = async () => {
  // Opção 1: Carregar do Firestore (recomendado para multi-tenant)
  try {
    const { db } = await import('../firebase/config');
    const { doc, getDoc } = await import('firebase/firestore');
    const configRef = doc(db, 'config', 'categories');
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      return configSnap.data().categories || defaultCategories;
    }
  } catch (error) {
    console.warn('Erro ao carregar categorias do Firestore:', error);
  }
  
  // Opção 2: Usar categorias padrão
  return defaultCategories;
};

// Categorias para exibição na Home
export const getHomeCategories = () => {
  // Pode ser filtrado/diferente das categorias completas
  return defaultCategories;
};

export default {
  defaultCategories,
  getCategories,
  getHomeCategories
};
```

---

## 6. Multi-tenancy (Opcional)

Se você quiser oferecer o sistema como SaaS (uma instância para múltiplos clientes):

### Estrutura Firestore para Multi-tenant

```
stores/{storeId}/
  ├── config/
  │   ├── business/
  │   ├── theme/
  │   └── categories/
  ├── products/
  ├── orders/
  └── users/
```

### Código Exemplo

```javascript
// src/config/multiTenant.js

export const getStoreId = () => {
  // Opção 1: Subdomínio
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];
  return subdomain !== 'www' ? subdomain : 'default';
  
  // Opção 2: Query parameter
  // const params = new URLSearchParams(window.location.search);
  // return params.get('store') || 'default';
  
  // Opção 3: Path
  // const path = window.location.pathname.split('/')[1];
  // return path || 'default';
};

export const getStoreConfig = async (storeId) => {
  const { db } = await import('../firebase/config');
  const { doc, getDoc } = await import('firebase/firestore');
  const storeRef = doc(db, 'stores', storeId);
  const storeSnap = await getDoc(storeRef);
  
  return storeSnap.exists() ? storeSnap.data() : null;
};
```

---

## 7. Scripts de Instalação

### Script `setup-wizard.js`

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function setup() {
  console.log('🚀 Configuração Inicial do Sistema\n');
  
  const config = {};
  
  // Informações da Loja
  config.STORE_NAME = await question('Nome da Loja: ');
  config.STORE_SUBTITLE = await question('Subtítulo/Descrição: ');
  config.CONTACT_PHONE = await question('Telefone de Contato: ');
  config.CONTACT_ADDRESS = await question('Endereço: ');
  config.WHATSAPP_NUMBER = await question('WhatsApp (somente números): ');
  
  // Firebase
  console.log('\n📦 Configurações Firebase:');
  config.FIREBASE_API_KEY = await question('Firebase API Key: ');
  config.FIREBASE_PROJECT_ID = await question('Firebase Project ID: ');
  config.FIREBASE_AUTH_DOMAIN = await question('Firebase Auth Domain: ');
  config.FIREBASE_STORAGE_BUCKET = await question('Firebase Storage Bucket: ');
  
  // PIX
  console.log('\n💳 Configurações PIX:');
  config.PIX_KEY = await question('Chave PIX: ');
  config.PIX_CITY = await question('Cidade (para PIX): ');
  
  // Criar arquivo .env
  const envContent = `
# Configurações Geradas Automaticamente
REACT_APP_STORE_NAME=${config.STORE_NAME}
REACT_APP_STORE_SUBTITLE=${config.STORE_SUBTITLE}
REACT_APP_CONTACT_PHONE=${config.CONTACT_PHONE}
REACT_APP_CONTACT_ADDRESS=${config.CONTACT_ADDRESS}
REACT_APP_WHATSAPP_NUMBER=${config.WHATSAPP_NUMBER}
REACT_APP_FIREBASE_API_KEY=${config.FIREBASE_API_KEY}
REACT_APP_FIREBASE_PROJECT_ID=${config.FIREBASE_PROJECT_ID}
REACT_APP_FIREBASE_AUTH_DOMAIN=${config.FIREBASE_AUTH_DOMAIN}
REACT_APP_FIREBASE_STORAGE_BUCKET=${config.FIREBASE_STORAGE_BUCKET}
REACT_APP_PIX_KEY=${config.PIX_KEY}
REACT_APP_PIX_CITY=${config.PIX_CITY}
  `.trim();
  
  fs.writeFileSync(path.join(__dirname, '.env.local'), envContent);
  console.log('\n✅ Arquivo .env.local criado com sucesso!');
  
  rl.close();
}

setup();
```

### Adicionar ao `package.json`

```json
{
  "scripts": {
    "setup": "node setup-wizard.js",
    "setup:env": "cp .env.example .env.local"
  }
}
```

---

## 8. Documentação para Clientes

### Arquivo `CUSTOMIZATION_GUIDE.md`

```markdown
# 📖 Guia de Personalização do Sistema

## 🚀 Instalação Rápida

1. **Clone o repositório**
   ```bash
   git clone [repo-url]
   cd lajinhaStore
   ```

2. **Execute o setup wizard**
   ```bash
   npm run setup
   ```

3. **Instale dependências**
   ```bash
   npm install
   ```

4. **Configure Firebase**
   - Crie um projeto no Firebase Console
   - Ative Authentication, Firestore e Storage
   - Copie as credenciais para o `.env.local`

5. **Inicie o desenvolvimento**
   ```bash
   npm start
   ```

## 🎨 Personalização

### Alterar Cores

Edite o arquivo `.env.local`:
```env
REACT_APP_THEME_PRIMARY=#3B82F6
REACT_APP_THEME_SECONDARY=#8B5CF6
```

### Adicionar/Remover Categorias

Edite `src/config/categoriesConfig.js` ou configure via painel admin.

### Alterar Logo

Substitua os arquivos em `public/`:
- `logo192.png`
- `logo512.png`
- `favicon.ico`

## 📱 Configuração Mobile

1. Edite `capacitor.config.ts`
2. Configure package name e app name
3. Execute `npm run cap:copy`
4. Build Android: `cd android && ./gradlew bundleRelease`
```

---

## 9. Checklist de Customização

Antes de entregar o sistema para um cliente:

- [ ] **Configurações Centralizadas**
  - [ ] Todas as variáveis em `.env.local`
  - [ ] `appConfig.js` usando `process.env`
  - [ ] Nenhum valor hardcoded

- [ ] **Personalização Visual**
  - [ ] Logo substituído
  - [ ] Cores personalizadas
  - [ ] Nome da loja alterado
  - [ ] Favicon atualizado

- [ ] **Dados do Negócio**
  - [ ] Telefone/WhatsApp atualizados
  - [ ] Endereço correto
  - [ ] Chave PIX configurada
  - [ ] Google Analytics (se aplicável)

- [ ] **Firebase**
  - [ ] Projeto próprio criado
  - [ ] Rules de segurança configuradas
  - [ ] Storage habilitado
  - [ ] Authentication configurado

- [ ] **Mobile (se aplicável)**
  - [ ] Package name único
  - [ ] App name personalizado
  - [ ] Ícones atualizados
  - [ ] Keystore próprio

- [ ] **Documentação**
  - [ ] README atualizado
  - [ ] Guia de instalação
  - [ ] Manual do admin
  - [ ] Troubleshooting

---

## 🎯 Próximos Passos

1. ✅ Implementar sistema de configuração centralizada
2. ✅ Criar scripts de setup automatizado
3. ✅ Separar código de negócio de código específico
4. ✅ Documentar processo completo
5. ✅ Criar template de instalação
6. ✅ Testar em ambiente limpo

---

## 📞 Suporte

Para dúvidas ou problemas:
- Email: suporte@exemplo.com
- Documentação: https://docs.exemplo.com
- Issues: https://github.com/exemplo/issues

