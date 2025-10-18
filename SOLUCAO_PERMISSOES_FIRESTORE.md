# 🔥 Solução para Erros de Permissão do Firestore

## ❌ Problema
```
FirebaseError: Missing or insufficient permissions
```

## ✅ Solução

### 1. **Aplicar Regras Permissivas**

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Vá em **Firestore Database** > **Regras**
3. Substitua as regras atuais por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ========================================
    // REGRAS PERMISSIVAS PARA DESENVOLVIMENTO
    // ========================================
    
    // Regras para produtos - LEITURA LIVRE
    match /produtos/{produtoId} {
      allow read: if true; // Qualquer um pode ler produtos
      allow write: if request.auth != null; // Apenas usuários logados podem escrever
    }
    
    // Regras para categorias - LEITURA LIVRE
    match /categorias/{categoriaId} {
      allow read: if true; // Qualquer um pode ler categorias
      allow write: if request.auth != null; // Apenas usuários logados podem escrever
    }
    
    // Regras para pedidos - USUÁRIOS AUTENTICADOS
    match /pedidos/{pedidoId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2");
      allow update: if request.auth != null && (resource.data.userId == request.auth.uid || request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2");
      allow delete: if request.auth != null && request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2";
    }
    
    // Regras para usuários - USUÁRIOS AUTENTICADOS
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2"; // Admin pode ler todos
    }
    
    // Regras para notificações - ADMIN E USUÁRIOS
    match /notificacoes/{notificacaoId} {
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2");
      allow create: if request.auth != null;
      allow update: if request.auth != null && (resource.data.userId == request.auth.uid || request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2");
      allow delete: if request.auth != null && request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2";
    }
    
    // Regras para configurações - ADMIN APENAS
    match /configuracoes/{configId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2";
    }
    
    // Regras para relatórios - ADMIN APENAS
    match /relatorios/{relatorioId} {
      allow read, write: if request.auth != null && request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2";
    }
    
    // Regras para logs - ADMIN APENAS
    match /logs/{logId} {
      allow read, write: if request.auth != null && request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2";
    }
    
    // Regra padrão - NEGAR TUDO
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 2. **Publicar as Regras**

1. Clique em **"Publicar"** no Firebase Console
2. Aguarde a confirmação
3. Teste o site novamente

### 3. **Verificar se Funcionou**

- ✅ Produtos devem carregar normalmente
- ✅ Categorias devem aparecer
- ✅ Busca deve funcionar
- ✅ Carrinho deve funcionar

### 4. **Regras de Segurança**

#### **Produtos e Categorias:**
- ✅ **Leitura livre**: Qualquer um pode ver produtos
- ✅ **Escrita protegida**: Apenas usuários logados podem modificar

#### **Pedidos:**
- ✅ **Criação**: Usuários podem criar seus próprios pedidos
- ✅ **Leitura**: Usuários veem apenas seus pedidos
- ✅ **Admin**: Pode ver e gerenciar todos os pedidos

#### **Notificações:**
- ✅ **Criação**: Sistema pode criar notificações
- ✅ **Leitura**: Usuários veem suas notificações
- ✅ **Admin**: Pode gerenciar todas as notificações

### 5. **Benefícios das Regras**

- 🔓 **Produtos acessíveis**: Sem necessidade de login para ver produtos
- 🔒 **Dados protegidos**: Pedidos e dados pessoais seguros
- 👤 **Admin privilegiado**: Acesso total para gerenciamento
- 🚀 **Performance**: Carregamento mais rápido

### 6. **Troubleshooting**

Se ainda houver problemas:

1. **Verificar UID do Admin**: Confirme se `ZG5D6IrTRTZl5SDoEctLAtr4WkE2` é seu UID
2. **Limpar Cache**: Ctrl+F5 no navegador
3. **Verificar Console**: F12 > Console para ver erros
4. **Testar Autenticação**: Fazer login e testar novamente

### 7. **Regras de Produção**

Para produção, considere regras mais restritivas:

```javascript
// Regras mais seguras para produção
match /produtos/{produtoId} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2";
}
```

## 🎯 Resultado Esperado

Após aplicar essas regras:
- ✅ Todos os produtos carregam
- ✅ Categorias funcionam
- ✅ Busca funciona
- ✅ Carrinho funciona
- ✅ Pedidos funcionam
- ✅ Notificações funcionam

## 📞 Suporte

Se ainda houver problemas, verifique:
1. UID do administrador no Firebase Auth
2. Estrutura dos dados no Firestore
3. Índices necessários no Firestore
4. Configuração de autenticação

