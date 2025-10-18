# 🔐 Configuração de Segurança do Firebase

## ❌ **Problema Identificado**

**Erro:** `missing or insufficient permissions`

**Causa:** As regras de segurança do Firestore estão bloqueando a criação de pedidos pelos usuários.

## ✅ **Solução: Configurar Regras do Firestore**

### **1. Acessar o Firebase Console**

1. Vá para [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: `compreaqui-324df`
3. No menu lateral, clique em **"Firestore Database"**
4. Clique na aba **"Regras"**

### **2. Substituir as Regras Atuais**

**Substitua todo o conteúdo da aba "Regras" por:**

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

### **3. Publicar as Regras**

1. Clique em **"Publicar"** no canto superior direito
2. Aguarde a confirmação de que as regras foram atualizadas

## 🔒 **Explicação das Regras**

### **Para Pedidos (`/pedidos/{pedidoId}`):**

**✅ Leitura:**
- Usuários podem ler seus próprios pedidos
- Administrador pode ler todos os pedidos

**✅ Criação:**
- Usuários autenticados podem criar pedidos
- Pedidos devem ter `userId` igual ao usuário logado

**✅ Atualização:**
- Usuários podem atualizar seus próprios pedidos
- Administrador pode atualizar qualquer pedido

### **Para Outras Coleções:**
- **Leitura:** Todos os usuários autenticados
- **Escrita:** Apenas administradores

## 🧪 **Teste das Regras**

### **1. Teste de Criação de Pedido**
```javascript
// Deve funcionar para usuário autenticado
const orderData = {
  userId: user.uid, // Deve ser igual ao usuário logado
  total: 100,
  items: [...],
  // ... outros campos
};
```

### **2. Teste de Leitura de Pedidos**
```javascript
// Usuário comum: só vê seus pedidos
// Administrador: vê todos os pedidos
```

## 🚨 **Regras Temporárias (Desenvolvimento)**

**⚠️ ATENÇÃO: Use apenas para testes!**

Se precisar de regras mais permissivas temporariamente:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ IMPORTANTE:** Volte às regras de segurança após os testes!

## 📱 **Verificação no Mobile**

Após configurar as regras:

1. **Teste de Login:** Verifique se o usuário está autenticado
2. **Teste de Criação:** Tente criar um pedido
3. **Verificação de Dados:** Confirme se o `userId` está correto

## 🔧 **Debugging**

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

## ✅ **Resultado Esperado**

Após configurar as regras:

- ✅ **Usuários autenticados** podem criar pedidos
- ✅ **Usuários** veem apenas seus pedidos
- ✅ **Administrador** vê todos os pedidos
- ✅ **Segurança** mantida para outras coleções

**O erro "missing or insufficient permissions" deve ser resolvido!** 🎉
