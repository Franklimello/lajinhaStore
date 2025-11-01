# 🔧 CORRIGIR PERMISSÕES DO FIRESTORE - URGENTE

## ❌ **ERRO ATUAL:**
```
FirebaseError: [code=permission-denied]: Missing or insufficient permissions.
```

**Isso está impedindo você de finalizar pedidos!**

---

## ✅ **SOLUÇÃO RÁPIDA (5 MINUTOS):**

### **PASSO 1: Abrir Firebase Console**

1. Acesse: **https://console.firebase.google.com/**
2. **Faça login** com sua conta Google
3. **Selecione o projeto:** `compreaqui-324df`

---

### **PASSO 2: Ir para Firestore**

1. No menu lateral, clique em **"Firestore Database"**
2. Clique na aba **"Regras"** (Rules)

---

### **PASSO 3: Substituir as Regras**

**SUBSTITUA TODO O CONTEÚDO** da aba Regras por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Produtos - Qualquer um pode ler
    match /produtos/{produtoId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Categorias - Qualquer um pode ler
    match /categorias/{categoriaId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Pedidos - Usuários autenticados podem criar e ler seus próprios pedidos
    match /pedidos/{pedidoId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2" || request.auth.uid == "6VbaNslrhQhXcyussPj53YhLiYj2");
      allow update: if request.auth != null && (resource.data.userId == request.auth.uid || request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2" || request.auth.uid == "6VbaNslrhQhXcyussPj53YhLiYj2");
      allow delete: if request.auth != null && (request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2" || request.auth.uid == "6VbaNslrhQhXcyussPj53YhLiYj2");
    }
    
    // Anúncios - Qualquer um pode ler
    match /anuncios/{anuncioId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Cupons - Qualquer um pode ler
    match /cupons/{cupomId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Notificações - Usuários podem ler suas próprias notificações
    match /notificacoes/{notificacaoId} {
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2" || request.auth.uid == "6VbaNslrhQhXcyussPj53YhLiYj2");
      allow create: if request.auth != null;
      allow update: if request.auth != null && (resource.data.userId == request.auth.uid || request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2" || request.auth.uid == "6VbaNslrhQhXcyussPj53YhLiYj2");
      allow delete: if request.auth != null && (request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2" || request.auth.uid == "6VbaNslrhQhXcyussPj53YhLiYj2");
    }
    
    // Sorteio - Usuários autenticados podem criar, admin pode ler todos
    match /sorteio/{sorteioId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2" || request.auth.uid == "6VbaNslrhQhXcyussPj53YhLiYj2");
      allow update, delete: if request.auth != null && (request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2" || request.auth.uid == "6VbaNslrhQhXcyussPj53YhLiYj2");
    }
    
    // Configurações - Admin apenas
    match /configuracoes/{configId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2" || request.auth.uid == "6VbaNslrhQhXcyussPj53YhLiYj2");
    }
    
    // Regra padrão - Negar tudo que não foi especificado acima
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

### **PASSO 4: Publicar as Regras**

1. Clique no botão **"Publicar"** (Publish) no topo
2. Aguarde a confirmação (geralmente alguns segundos)
3. Você verá uma mensagem: **"Rules published successfully"**

---

### **PASSO 5: Testar no App**

1. **Feche e abra o app novamente** no celular
2. **Faça login** (se necessário)
3. **Adicione produtos ao carrinho**
4. **Tente finalizar o pedido**

---

## ✅ **O QUE ISSO RESOLVE:**

- ✅ **Permite criar pedidos** - Usuários autenticados podem criar pedidos
- ✅ **Permite ler produtos** - Todos podem ver produtos sem login
- ✅ **Proteção de dados** - Usuários veem apenas seus próprios pedidos
- ✅ **Admin tem acesso total** - Administradores podem gerenciar tudo

---

## ⚠️ **IMPORTANTE:**

- As regras levam alguns segundos para aplicar globalmente
- Se ainda der erro, aguarde 30 segundos e tente novamente
- Certifique-se de estar **logado** antes de tentar finalizar pedido

---

## 🎯 **TESTE AGORA:**

Após publicar as regras:

1. Abra o app no celular
2. Faça login
3. Adicione produtos ao carrinho
4. Vá para finalizar pedido
5. Preencha os dados
6. Clique em "Gerar QR Code"

**Deve funcionar!** 🚀

---

**Me diga quando publicar as regras para confirmarmos que funcionou!**




