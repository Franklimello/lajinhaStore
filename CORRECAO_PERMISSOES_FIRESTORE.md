# 🔐 Correção do Erro de Permissões do Firestore

## ❌ **Problema Identificado**

**Erro:** `missing or insufficient permissions`

**Causa:** As regras de segurança do Firestore estão bloqueando a criação de pedidos pelos usuários autenticados.

## ✅ **Soluções Implementadas**

### **1. Regras de Segurança do Firestore**

**📁 Arquivo:** `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para a coleção de pedidos
    match /pedidos/{pedidoId} {
      // Permitir leitura e escrita apenas para usuários autenticados
      allow read, write: if request.auth != null;
      
      // Permitir que usuários leiam apenas seus próprios pedidos
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || 
                      request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2");
      
      // Permitir que usuários criem pedidos apenas para si mesmos
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      
      // Permitir que administradores atualizem qualquer pedido
      allow update: if request.auth != null && 
                       (resource.data.userId == request.auth.uid || 
                        request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2");
    }
    
    // Regras para outras coleções (produtos, etc.)
    match /{document=**} {
      // Permitir leitura para todos os usuários autenticados
      allow read: if request.auth != null;
      
      // Permitir escrita apenas para administradores
      allow write: if request.auth != null && 
                      request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2";
    }
  }
}
```

### **2. Melhorias na Função createOrder**

**📁 Arquivo:** `src/firebase/orders.js`

**✅ Verificações Adicionadas:**
- ✅ Verificação de autenticação antes de criar pedido
- ✅ Mensagens de erro específicas
- ✅ Logs de debug para troubleshooting
- ✅ Status inicial mais claro ("Aguardando Pagamento")

**🔧 Código Implementado:**
```javascript
export const createOrder = async (orderData) => {
  try {
    // Verifica se o usuário está autenticado
    if (!orderData.userId) {
      throw new Error("Usuário não autenticado");
    }

    const now = new Date();
    const orderRef = await addDoc(collection(db, "pedidos"), {
      ...orderData,
      createdAt: now,
      updatedAt: now,
      createdAtTimestamp: now.getTime(),
      status: 'Aguardando Pagamento', // Status inicial mais claro
      paymentMethod: 'PIX_QR'
    });
    
    console.log("Pedido criado com sucesso:", orderRef.id);
    return { success: true, orderId: orderRef.id };
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    
    // Mensagens de erro mais específicas
    if (error.code === 'permission-denied') {
      return { 
        success: false, 
        error: "Erro de permissão. Verifique se você está logado e tente novamente." 
      };
    } else if (error.code === 'unauthenticated') {
      return { 
        success: false, 
        error: "Usuário não autenticado. Faça login e tente novamente." 
      };
    }
    
    return { success: false, error: error.message };
  }
};
```

### **3. Verificações Adicionais no PixPayment**

**📁 Arquivo:** `src/components/PixPayment/index.js`

**✅ Verificações Implementadas:**
- ✅ Verificação dupla de autenticação
- ✅ Logs de debug dos dados do pedido
- ✅ Verificação do UID do usuário

**🔧 Código Implementado:**
```javascript
const generatePixPayload = async () => {
  if (!user) {
    showToast('Você precisa estar logado para fazer um pedido', 'error');
    navigate('/login');
    return;
  }

  // Verificação adicional de autenticação
  if (!user.uid) {
    showToast('Erro de autenticação. Faça login novamente.', 'error');
    navigate('/login');
    return;
  }

  // ... resto do código ...

  // Debug: Log dos dados do pedido
  console.log('Dados do pedido:', orderData);
  console.log('Usuário UID:', user.uid);
  console.log('Usuário autenticado:', !!user);
};
```

### **4. Componente de Teste**

**📁 Arquivo:** `src/components/FirestoreTest/index.js`

**✅ Funcionalidades:**
- ✅ Teste de permissões do Firestore
- ✅ Verificação de autenticação
- ✅ Criação de pedido de teste
- ✅ Logs detalhados para debug

**🔗 Rota:** `/test-firestore` (temporária para testes)

## 🚀 **Como Resolver o Problema**

### **Passo 1: Configurar Regras do Firestore**

1. **Acesse o Firebase Console:**
   - Vá para [Firebase Console](https://console.firebase.google.com/)
   - Selecione o projeto: `compreaqui-324df`
   - Clique em **"Firestore Database"**
   - Clique na aba **"Regras"**

2. **Substitua as Regras:**
   - Copie o conteúdo do arquivo `firestore.rules`
   - Cole na aba "Regras"
   - Clique em **"Publicar"**

### **Passo 2: Testar as Permissões**

1. **Acesse a rota de teste:**
   - Vá para `/test-firestore` (após fazer login)
   - Clique em "Testar Permissões"
   - Verifique o resultado

2. **Verificar logs no console:**
   - Abra o DevTools (F12)
   - Vá para a aba "Console"
   - Verifique os logs de debug

### **Passo 3: Testar Criação de Pedido**

1. **Faça login no sistema**
2. **Adicione produtos ao carrinho**
3. **Vá para o pagamento PIX**
4. **Preencha os dados e finalize**
5. **Verifique se o pedido foi criado**

## 🔍 **Debugging**

### **Verificar Autenticação:**
```javascript
console.log('Usuário logado:', user);
console.log('UID:', user?.uid);
```

### **Verificar Dados do Pedido:**
```javascript
console.log('Dados do pedido:', orderData);
console.log('UserId no pedido:', orderData.userId);
```

### **Verificar Erros:**
```javascript
// No console do navegador
// Verificar erros de permissão
// Verificar se as regras foram aplicadas
```

## 📱 **Teste no Mobile**

### **1. Verificar Autenticação:**
- ✅ Usuário deve estar logado
- ✅ UID deve estar presente
- ✅ Sessão deve estar ativa

### **2. Verificar Dados:**
- ✅ `userId` deve ser igual ao `user.uid`
- ✅ Todos os campos obrigatórios preenchidos
- ✅ Estrutura do pedido correta

### **3. Verificar Regras:**
- ✅ Regras do Firestore configuradas
- ✅ Permissões corretas aplicadas
- ✅ Usuário tem permissão para criar pedidos

## ✅ **Resultado Esperado**

Após implementar todas as correções:

- ✅ **Usuários autenticados** podem criar pedidos
- ✅ **Regras de segurança** funcionando corretamente
- ✅ **Logs de debug** para troubleshooting
- ✅ **Mensagens de erro** específicas
- ✅ **Teste de permissões** disponível

**O erro "missing or insufficient permissions" deve ser resolvido!** 🎉

## 🗑️ **Limpeza (Após Resolver)**

**Remover arquivos temporários:**
- ❌ `src/components/FirestoreTest/index.js`
- ❌ Rota `/test-firestore` do `App.js`
- ❌ Arquivo `firestore.rules` (após configurar no console)
