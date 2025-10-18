# 🛡️ Regras de Produção - Firestore Security Rules

## 🚨 **IMPORTANTE: App em Produção**

Como o app já está em produção, as regras devem ser implementadas com cuidado para não quebrar funcionalidades existentes.

## ✅ **Regras Definitivas de Produção**

### **📁 Arquivo:** `firestore-rules-producao.rules`

**🔐 Características das Regras:**

1. **Segurança Máxima** - Apenas usuários autenticados
2. **Controle de Acesso** - Usuários veem apenas seus dados
3. **Administrador Total** - UID `ZG5D6IrTRTZl5SDoEctLAtr4WkE2` tem acesso total
4. **Proteção de Dados** - Cada usuário acessa apenas seus pedidos
5. **Auditoria** - Logs e relatórios protegidos

## 🚀 **Como Implementar (PASSO A PASSO)**

### **Passo 1: Backup das Regras Atuais**
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá para "Firestore Database" → "Regras"
3. **COPIE** as regras atuais para um arquivo de backup
4. Anote a data/hora do backup

### **Passo 2: Implementar Regras Gradualmente**

**⚠️ RECOMENDAÇÃO: Implementar em etapas para evitar quebras**

#### **Etapa 1: Regras Básicas (Teste)**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para pedidos
    match /pedidos/{pedidoId} {
      allow read, write: if request.auth != null;
    }
    
    // Outras coleções
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### **Etapa 2: Regras Completas (Produção)**
- Use o arquivo `firestore-rules-producao.rules`
- Implemente após testar a Etapa 1

### **Passo 3: Testar Funcionalidades**

**✅ Checklist de Testes:**

1. **Login/Registro**
   - [ ] Usuário pode fazer login
   - [ ] Usuário pode se registrar
   - [ ] Sessão persiste

2. **Criação de Pedidos**
   - [ ] Usuário logado pode criar pedido
   - [ ] Pedido é salvo com userId correto
   - [ ] QR Code é gerado

3. **Consulta de Pedidos**
   - [ ] Usuário vê apenas seus pedidos
   - [ ] Administrador vê todos os pedidos
   - [ ] Status é atualizado corretamente

4. **Produtos e Categorias**
   - [ ] Usuários podem ver produtos
   - [ ] Administrador pode gerenciar produtos
   - [ ] Categorias são carregadas

### **Passo 4: Monitoramento**

**📊 Métricas a Acompanhar:**

1. **Erros de Permissão**
   - Monitorar console do Firebase
   - Verificar logs de erro
   - Acompanhar reclamações de usuários

2. **Performance**
   - Tempo de resposta das queries
   - Uso de índices
   - Custo de operações

## 🔧 **Configuração Detalhada**

### **1. Regras para Pedidos**
```javascript
match /pedidos/{pedidoId} {
  // Usuários podem criar pedidos apenas para si mesmos
  allow create: if request.auth != null && 
                   request.resource.data.userId == request.auth.uid;
  
  // Usuários podem ler apenas seus próprios pedidos
  allow read: if request.auth != null && 
                 (resource.data.userId == request.auth.uid || 
                  request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2");
  
  // Usuários podem atualizar apenas seus próprios pedidos
  allow update: if request.auth != null && 
                   (resource.data.userId == request.auth.uid || 
                    request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2");
}
```

### **2. Regras para Produtos**
```javascript
match /produtos/{produtoId} {
  // Todos os usuários autenticados podem ler produtos
  allow read: if request.auth != null;
  
  // Apenas administrador pode gerenciar produtos
  allow write: if request.auth != null && 
                  request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2";
}
```

### **3. Regras para Administrador**
```javascript
// UID do administrador: ZG5D6IrTRTZl5SDoEctLAtr4WkE2
// Tem acesso total a todas as coleções
```

## 🚨 **Plano de Rollback**

### **Se Algo Der Errado:**

1. **Voltar às Regras Anteriores**
   - Acesse Firebase Console
   - Cole as regras do backup
   - Clique em "Publicar"

2. **Regras de Emergência**
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

## 📱 **Testes em Produção**

### **1. Teste com Usuário Comum**
1. Faça login com conta de usuário
2. Adicione produtos ao carrinho
3. Crie um pedido
4. Verifique se aparece em "Meus Pedidos"
5. Teste visualizar detalhes do pedido

### **2. Teste com Administrador**
1. Faça login com conta de administrador
2. Acesse painel administrativo
3. Verifique se vê todos os pedidos
4. Teste atualizar status de pedidos
5. Verifique relatórios e dashboard

### **3. Teste de Segurança**
1. Usuário comum não deve ver pedidos de outros
2. Usuário comum não deve acessar painel admin
3. Administrador deve ter acesso total
4. Dados devem ser protegidos

## 🎯 **Resultado Esperado**

Após implementar as regras de produção:

- ✅ **Segurança máxima** - Dados protegidos
- ✅ **Controle de acesso** - Usuários veem apenas seus dados
- ✅ **Administração total** - Admin tem controle completo
- ✅ **Performance otimizada** - Queries eficientes
- ✅ **Auditoria completa** - Logs e relatórios protegidos

## 📞 **Suporte em Caso de Problemas**

### **Problemas Comuns:**

1. **"Permission denied"**
   - Verificar se usuário está autenticado
   - Verificar se userId está correto
   - Verificar regras específicas

2. **"Unauthenticated"**
   - Verificar se usuário fez login
   - Verificar se sessão não expirou
   - Verificar configuração de auth

3. **"Resource not found"**
   - Verificar se documento existe
   - Verificar se usuário tem permissão
   - Verificar se coleção está correta

### **Logs para Debug:**
```javascript
// No console do navegador
console.log('Usuário:', user);
console.log('UID:', user?.uid);
console.log('Autenticado:', !!user);
```

**As regras de produção estão prontas para implementação segura!** 🛡️
