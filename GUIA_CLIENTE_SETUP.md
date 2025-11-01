# 🚀 Guia de Instalação - Para o Cliente

Este guia é para você configurar o sistema pela primeira vez.

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

- ✅ **Node.js** instalado (versão 14 ou superior)
- ✅ **npm** ou **yarn** instalado
- ✅ **Conta no Firebase** (Google)
- ✅ **Chave PIX** para recebimentos
- ✅ **Logos** da sua loja (PNG, 192x192 e 512x512 pixels)

---

## 🎯 Passo 1: Instalar Dependências

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

Isso vai instalar todas as dependências necessárias. Aguarde a conclusão.

---

## 🎯 Passo 2: Configurar o Sistema

Execute o assistente de configuração:

```bash
npm run setup
```

O assistente vai fazer algumas perguntas. Você precisa ter em mãos:

### Informações da Loja:
- Nome da loja
- Subtítulo/descrição
- Telefone de contato
- Endereço completo
- Número do WhatsApp (somente números)

### Firebase:
Você precisa criar um projeto no Firebase primeiro:

1. Acesse: https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Dê um nome ao projeto
4. Siga as instruções
5. Quando criado, vá em "Configurações do projeto" (ícone de engrenagem)
6. Role até "Seus apps" e clique em "Web" (</>)
7. Registre o app e copie as credenciais

Você vai precisar de:
- Firebase Project ID
- Firebase API Key
- Firebase Auth Domain
- Firebase Storage Bucket
- Firebase Messaging Sender ID
- Firebase App ID

### Administradores:
Você vai precisar do **UID** do seu usuário no Firebase:
1. No Firebase Console, vá em "Authentication"
2. Crie um usuário (se ainda não tiver)
3. O UID aparece na lista de usuários
4. Copie o UID e use no setup

### PIX:
- Chave PIX (CPF, CNPJ, Email ou Chave Aleatória)
- Cidade onde está localizado
- Nome completo do recebedor

---

## 🎯 Passo 3: Substituir Logos

Copie seus logos para a pasta `public/`:

1. **Logo pequeno:** Substitua `public/logo192.png` (192x192 pixels)
2. **Logo grande:** Substitua `public/logo512.png` (512x512 pixels)
3. **Favicon:** Substitua `public/favicon.ico` (32x32 pixels)

> 💡 Dica: Use um editor de imagens para redimensionar suas logos.

---

## 🎯 Passo 4: Validar Configuração

Verifique se tudo está configurado corretamente:

```bash
npm run validate-config
```

O script vai verificar:
- ✅ Se todas as variáveis obrigatórias estão configuradas
- ✅ Se os arquivos de logo existem
- ✅ Se há valores padrão que precisam ser alterados

---

## 🎯 Passo 5: Testar Localmente

Inicie o servidor de desenvolvimento:

```bash
npm start
```

O sistema vai abrir automaticamente no navegador em `http://localhost:3000`.

Teste:
- ✅ Login como admin
- ✅ Criar um produto
- ✅ Adicionar ao carrinho
- ✅ Processo de checkout
- ✅ WhatsApp funcionando

---

## 🎯 Passo 6: Configurar Firebase

### 6.1. Habilitar Serviços

No Firebase Console, ative:

1. **Authentication:**
   - Vá em "Authentication" → "Começar"
   - Habilite "Email/Password"
   - Clique em "Salvar"

2. **Firestore Database:**
   - Vá em "Firestore Database" → "Criar banco de dados"
   - Escolha "Modo de teste" (pode mudar depois)
   - Escolha uma localização
   - Clique em "Ativar"

3. **Storage:**
   - Vá em "Storage" → "Começar"
   - Use as regras padrão
   - Escolha uma localização
   - Clique em "Concluir"

### 6.2. Configurar Regras de Segurança

Vá em "Firestore Database" → "Regras" e cole:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite leitura para todos
    match /{document=**} {
      allow read: if true;
    }
    
    // Produtos: qualquer um pode ler, apenas admins podem escrever
    match /produtos/{produtoId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid in ['SEU_ADMIN_UID_AQUI'];
    }
    
    // Pedidos: usuários só veem seus próprios pedidos
    match /pedidos/{pedidoId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.uid in ['SEU_ADMIN_UID_AQUI']);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid in ['SEU_ADMIN_UID_AQUI'];
    }
    
    // Outras coleções...
  }
}
```

> ⚠️ **Importante:** Substitua `'SEU_ADMIN_UID_AQUI'` pelo seu UID real!

---

## 🎯 Passo 7: Build para Produção

Quando estiver tudo funcionando, gere o build:

```bash
npm run build
```

Isso vai criar a pasta `build/` com os arquivos prontos para produção.

---

## 🎯 Passo 8: Deploy

### Opção A: Firebase Hosting (Recomendado)

1. Instale Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Faça login:
   ```bash
   firebase login
   ```

3. Inicialize o projeto:
   ```bash
   firebase init hosting
   ```
   - Escolha o projeto correto
   - Diretório público: `build`
   - Configure como SPA: `yes`
   - Não sobrescrever index.html: `no`

4. Faça o deploy:
   ```bash
   firebase deploy --only hosting
   ```

### Opção B: Outro Servidor

Simplesmente faça upload da pasta `build/` para seu servidor.

---

## ❓ Problemas Comuns

### "Firebase não está configurado"
- Verifique se o arquivo `.env.local` existe
- Verifique se todas as variáveis Firebase estão preenchidas
- Execute `npm run validate-config` para verificar

### "Não consigo fazer login"
- Verifique se Authentication está habilitado no Firebase
- Verifique se seu UID está correto em `REACT_APP_ADMIN_UID`
- Verifique as regras do Firestore

### "Imagens não carregam"
- Verifique se Storage está habilitado no Firebase
- Verifique as regras do Storage

### "WhatsApp não funciona"
- Verifique se `REACT_APP_WHATSAPP_NUMBER` está correto
- Formato: apenas números, ex: `5519999999999`

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique `GUIA_ADAPTACAO_SISTEMA.md` para informações técnicas
2. Execute `npm run validate-config` para diagnóstico
3. Revise o arquivo `.env.example` como referência

---

**Boa sorte com seu sistema! 🚀**

