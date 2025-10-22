# 🔧 Configuração de Variáveis de Ambiente

## 📋 Variáveis Necessárias

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyCPOsZYAXUzdEZ_wQV7HpON_cZ0QGJpTqI
REACT_APP_FIREBASE_AUTH_DOMAIN=compreaqui-324df.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=compreaqui-324df
REACT_APP_FIREBASE_STORAGE_BUCKET=compreaqui-324df.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=821962501479
REACT_APP_FIREBASE_APP_ID=1:821962501479:web:2dbdb1744b7d5849a913c2
REACT_APP_FIREBASE_MEASUREMENT_ID=G-B5WBJYR1YT

# Firebase Cloud Messaging (FCM)
# IMPORTANTE: Obtenha sua VAPID Key em:
# Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates
REACT_APP_FIREBASE_VAPID_KEY=BEl62iUYgUivxIkv69yViEuiBIa2t2_6KjZQm2bY4k8

# Admin UIDs (separados por vírgula)
REACT_APP_ADMIN_UIDS=ZG5D6IrTRTZl5SDoEctLAtr4WkE2,6VbaNslrhQhXcyussPj53YhLiYj2

# App Configuration
REACT_APP_APP_NAME=Supermercado Lajinha
REACT_APP_PIX_KEY=12819359647
REACT_APP_WHATSAPP_NUMBER=5519997050303
REACT_APP_CONTACT_PHONE=+55-33-99999-9999
REACT_APP_CONTACT_ADDRESS=Lajinha, MG
```

## 🔑 Como Obter as Chaves

### 1. Firebase Configuration
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Project Settings** (ícone de engrenagem)
4. Na aba **General**, role até **Your apps**
5. Clique em **Config** para ver as configurações

### 2. VAPID Key para Push Notifications
1. No Firebase Console, vá em **Project Settings**
2. Na aba **Cloud Messaging**
3. Em **Web Push certificates**, clique em **Generate key pair**
4. Copie a chave gerada

### 3. Admin UIDs
1. No Firebase Console, vá em **Authentication**
2. Na aba **Users**, encontre os usuários administradores
3. Copie os **User UID** de cada admin
4. Separe por vírgula no arquivo `.env`

## 🚀 Deploy

Após configurar as variáveis:

```bash
# Build do projeto
npm run build

# Deploy para Firebase Hosting
firebase deploy --only hosting

# Deploy das Cloud Functions
firebase deploy --only functions
```

## ⚠️ Importante

- **NUNCA** commite o arquivo `.env` no Git
- Use valores reais em produção
- Mantenha as chaves seguras
- Teste sempre em ambiente de desenvolvimento primeiro

## 🔍 Verificação

Para verificar se as variáveis estão sendo carregadas:

1. Abra o DevTools do navegador
2. Vá na aba **Console**
3. Digite: `console.log(process.env)`
4. Verifique se as variáveis aparecem com `REACT_APP_` prefix
