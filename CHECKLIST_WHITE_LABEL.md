# ✅ Checklist White-Label - Preparação para Entrega

## 📋 Antes de Entregar o Sistema para um Cliente

Use este checklist para garantir que o sistema está 100% configurado e personalizado.

---

## 🔴 CRÍTICO - Deve ser feito ANTES da entrega

### 1. Configurações Básicas (.env.local)
- [ ] **Nome da Loja** configurado em `REACT_APP_STORE_NAME`
- [ ] **Subtítulo/Descrição** configurado em `REACT_APP_STORE_SUBTITLE`
- [ ] **Telefone de contato** configurado em `REACT_APP_CONTACT_PHONE`
- [ ] **WhatsApp** configurado em `REACT_APP_WHATSAPP_NUMBER`
- [ ] **Endereço** configurado em `REACT_APP_CONTACT_ADDRESS`
- [ ] **URL do site** configurado em `REACT_APP_APP_URL`

### 2. Firebase (Projeto Próprio)
- [ ] **Firebase Project ID** único criado
- [ ] **Firebase API Key** configurada
- [ ] **Firebase Auth Domain** configurado
- [ ] **Firebase Storage Bucket** configurado
- [ ] **Firebase Messaging Sender ID** configurado
- [ ] **Firebase App ID** configurado
- [ ] **Firestore Database** habilitado
- [ ] **Firestore Rules** configuradas e testadas
- [ ] **Authentication** habilitado (Email/Password)
- [ ] **Storage** habilitado
- [ ] **Firebase VAPID Key** configurado (para notificações)

### 3. Administradores
- [ ] **Admin UID 1** configurado em `REACT_APP_ADMIN_UID`
- [ ] **Admin UID 2** configurado (se necessário) em `REACT_APP_ADMIN_UID_2`
- [ ] Usuários admin criados e testados no Firebase

### 4. Pagamento PIX
- [ ] **Chave PIX** configurada em `REACT_APP_PIX_KEY`
- [ ] **Cidade para PIX** configurada em `REACT_APP_PIX_CITY`
- [ ] **Nome do recebedor** configurado em `REACT_APP_PIX_RECEIVER_NAME`

### 5. Visual/Branding
- [ ] **Logo** substituído em `public/logo192.png`
- [ ] **Logo grande** substituído em `public/logo512.png`
- [ ] **Favicon** substituído em `public/favicon.ico`
- [ ] **Ícone PWA** atualizado (manifest.json)
- [ ] **Cores personalizadas** (opcional, via .env)

---

## 🟡 IMPORTANTE - Recomendado fazer

### 6. Mobile (Se Aplicável)
- [ ] **Package Name** único configurado em `capacitor.config.ts`
- [ ] **App Name** configurado em `capacitor.config.ts`
- [ ] **Package ID Android** único em `android/app/build.gradle`
- [ ] **Ícones do app** substituídos:
  - [ ] `android/app/src/main/res/mipmap-mdpi/ic_launcher.png`
  - [ ] `android/app/src/main/res/mipmap-hdpi/ic_launcher.png`
  - [ ] `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png`
  - [ ] `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
  - [ ] `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`
- [ ] **Keystore próprio** criado e configurado
- [ ] **Google Services JSON** baixado do Firebase e colocado em `android/app/`

### 7. SEO e Analytics
- [ ] **Google Analytics ID** configurado (se aplicável)
- [ ] **Meta tags** atualizadas (via appConfig)
- [ ] **Sitemap** gerado (se necessário)

### 8. Testes
- [ ] **Login de admin** funcionando
- [ ] **Criação de produto** testada
- [ ] **Processo de compra** completo testado
- [ ] **Pagamento PIX** testado
- [ ] **Notificações push** funcionando
- [ ] **WhatsApp** redirecionando corretamente

---

## 🟢 OPCIONAL - Melhorias

### 9. Personalização Avançada
- [ ] **Categorias customizadas** (se necessário)
- [ ] **Tema de cores** personalizado
- [ ] **Textos específicos** ajustados
- [ ] **Imagens de exemplo** substituídas

### 10. Documentação
- [ ] **README** atualizado com informações do cliente
- [ ] **Credenciais Firebase** documentadas
- [ ] **Manual do admin** fornecido
- [ ] **Guia de uso básico** fornecido

---

## 🔧 Como Usar Este Checklist

1. **Antes da entrega**, execute cada item
2. **Marque com ✅** quando completo
3. **Documente** qualquer configuração especial
4. **Teste** em ambiente de produção

---

## 🚀 Processo Rápido de Setup

### Para o Cliente (ou você):

```bash
# 1. Instalar dependências
npm install

# 2. Executar setup wizard
npm run setup

# 3. Substituir logos
# (Copiar logos para public/logo*.png e favicon.ico)

# 4. Iniciar desenvolvimento
npm start

# 5. Testar tudo

# 6. Build para produção
npm run build
```

---

## ⚠️ Atenção

### ❌ NUNCA Entregue:
- Arquivo `.env.local` com valores do Lajinha
- Firebase configurado com projeto do Lajinha
- Logo do Lajinha nos arquivos
- Telefone/WhatsApp do Lajinha hardcoded
- Package name do Lajinha no mobile

### ✅ SEMPRE Verifique:
- Todos os valores vêm de variáveis de ambiente
- Nenhum valor hardcoded específico do cliente original
- Firebase é projeto próprio do cliente
- Logos são do cliente

---

## 📞 Suporte

Se encontrar problemas durante a configuração:
1. Consulte `GUIA_ADAPTACAO_SISTEMA.md`
2. Verifique `README_CUSTOMIZACAO.md`
3. Revise o arquivo `.env.example` como referência

---

**Última atualização:** Data da última revisão do checklist

