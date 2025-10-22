# Regras do Firestore para Store Status

## 📋 Instruções

Você precisa adicionar estas regras no **Firebase Console** para permitir que admins controlem o status da loja.

### 1️⃣ Acesse o Firebase Console
- Vá para: https://console.firebase.google.com/
- Selecione seu projeto
- No menu lateral, clique em **Firestore Database**
- Clique na aba **Regras** (Rules)

### 2️⃣ Adicione estas regras

Adicione as seguintes regras no seu arquivo de regras do Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ... suas regras existentes ...
    
    // Nova regra para controle de status da loja
    match /config/storeStatus {
      // Qualquer pessoa pode LER o status da loja
      allow read: if true;
      
      // Apenas ADMINS podem ALTERAR o status da loja
      // IMPORTANTE: Substitua 'SEU_EMAIL_ADMIN@gmail.com' pelo seu email de admin
      allow write: if request.auth != null && 
                      request.auth.token.email in [
                        'SEU_EMAIL_ADMIN@gmail.com',
                        'outro_admin@gmail.com'
                      ];
    }
  }
}
```

### 3️⃣ Substitua o email do admin

⚠️ **IMPORTANTE:** Na regra acima, substitua `'SEU_EMAIL_ADMIN@gmail.com'` pelo email que você usa para fazer login no painel de admin.

Exemplo:
```javascript
allow write: if request.auth != null && 
                request.auth.token.email in [
                  'admin@meusite.com',
                  'joao@empresa.com'
                ];
```

### 4️⃣ Publique as regras

Após adicionar as regras, clique em **Publicar** (Publish) no Firebase Console.

### 5️⃣ Teste

1. Faça login no painel de admin
2. Clique no botão "Loja Aberta" ou "Loja Fechada"
3. Confirme a ação
4. Abra o site em uma aba anônima e verifique se o modal aparece

---

## 🔧 Alternativa: Usar campo isAdmin

Se você quiser usar um campo `isAdmin` no documento do usuário ao invés de verificar o email:

```javascript
match /config/storeStatus {
  allow read: if true;
  allow write: if request.auth != null && 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}
```

Neste caso, você precisará adicionar um campo `isAdmin: true` no documento do usuário no Firestore.

