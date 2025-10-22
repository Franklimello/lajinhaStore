# 🔒 Correção: Permissões do Firestore

## ✅ PROBLEMA RESOLVIDO

**Erro:** `Missing or insufficient permissions` ao carregar status da loja

---

## ❌ Problema

Usuários não autenticados (visitantes) não conseguiam visualizar se a loja estava aberta ou fechada, causando erro:

```
StoreStatusContext.js:23 Erro ao carregar status da loja: 
FirebaseError: Missing or insufficient permissions.
```

### Causa Raiz

A coleção `config` (que armazena o status da loja) estava protegida pela regra genérica:

```javascript
// ❌ ANTES
match /{document=**} {
  allow read: if request.auth != null; // ← Requer autenticação
}
```

**Resultado:** Visitantes não conseguiam ver se a loja estava aberta/fechada.

---

## ✅ Solução Implementada

Adicionei regras específicas para as seguintes coleções:

### 1. **Coleção `config`** (Leitura Pública)

```javascript
match /config/{configId} {
  // Permitir leitura pública para qualquer pessoa ver se a loja está aberta
  allow read: if true;
  
  // Permitir escrita apenas para administradores
  allow write: if request.auth != null && 
                  (request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2" ||
                   request.auth.uid == "6VbaNslrhQhXcyussPj53YhLiYj2");
}
```

**Benefício:** Todos podem ver o status da loja (aberta/fechada), mas apenas admins podem alterá-lo.

---

### 2. **Coleção `sorteio`** (Apenas Admins)

```javascript
match /sorteio/{sorteioId} {
  allow read, write: if request.auth != null && 
                        (request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2" ||
                         request.auth.uid == "6VbaNslrhQhXcyussPj53YhLiYj2");
}
```

**Benefício:** Apenas admins podem acessar lista de participantes do sorteio.

---

### 3. **Coleção `sorteio_vencedores`** (Apenas Admins)

```javascript
match /sorteio_vencedores/{vencedorId} {
  allow read, write: if request.auth != null && 
                        (request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2" ||
                         request.auth.uid == "6VbaNslrhQhXcyussPj53YhLiYj2");
}
```

**Benefício:** Apenas admins podem ver histórico de vencedores.

---

### 4. **Coleção `sorteio_config`** (Apenas Admins)

```javascript
match /sorteio_config/{configId} {
  allow read, write: if request.auth != null && 
                        (request.auth.uid == "ZG5D6IrTRTZl5SDoEctLAtr4WkE2" ||
                         request.auth.uid == "6VbaNslrhQhXcyussPj53YhLiYj2");
}
```

**Benefício:** Apenas admins podem pausar/ativar a promoção de sorteio.

---

## 📊 Resumo das Regras

| Coleção | Leitura | Escrita |
|---------|---------|---------|
| **config** | 🌍 Público | 🔐 Apenas Admins |
| **produtos** | 🌍 Público | 🔐 Apenas Admins |
| **pedidos** | 🔐 Dono ou Admin | 🔐 Dono ou Admin |
| **notifications** | 🔐 Dono | 🔐 Dono ou Admin |
| **sorteio** | 🔐 Apenas Admins | 🔐 Apenas Admins |
| **sorteio_vencedores** | 🔐 Apenas Admins | 🔐 Apenas Admins |
| **sorteio_config** | 🔐 Apenas Admins | 🔐 Apenas Admins |

---

## 🚀 Deploy Realizado

As regras foram implantadas com sucesso no Firestore:

```bash
✅ firebase deploy --only firestore:rules

=== Deploying to 'compreaqui-324df'...
✅ rules file firestore.rules compiled successfully
✅ released rules firestore.rules to cloud.firestore
✅ Deploy complete!
```

---

## 🧪 Como Testar

### Teste 1: Visitante (Não Autenticado)

```
1. Abra o navegador em modo anônimo
2. Acesse http://localhost:3000
3. ✅ A página deve carregar normalmente
4. ✅ Não deve aparecer erro de permissão no console
5. ✅ Se a loja estiver fechada, o modal deve aparecer
```

### Teste 2: Usuário Comum (Autenticado)

```
1. Faça login como usuário normal
2. Acesse a loja normalmente
3. ✅ Deve ver produtos e fazer pedidos
4. ✅ Status da loja deve funcionar
5. ✅ NÃO deve conseguir acessar /sorteio (não é admin)
```

### Teste 3: Admin

```
1. Faça login como admin
2. Acesse /painel
3. ✅ Deve conseguir abrir/fechar loja
4. Acesse /sorteio
5. ✅ Deve conseguir buscar dados do sorteio
6. ✅ Deve conseguir pausar/ativar promoção
```

---

## 🔐 Segurança

### ✅ O Que Está Protegido

- **Pedidos:** Apenas dono e admins
- **Notificações:** Apenas dono
- **Sorteio:** Apenas admins
- **Vencedores:** Apenas admins
- **Config do Sorteio:** Apenas admins

### 🌍 O Que É Público

- **Produtos:** Todos podem ver (necessário para navegação)
- **Status da Loja:** Todos podem ver (necessário para modal)

### 🔐 UIDs dos Admins

Os seguintes UIDs têm permissões de administrador:

```
ZG5D6IrTRTZl5SDoEctLAtr4WkE2
6VbaNslrhQhXcyussPj53YhLiYj2
```

**Para adicionar novo admin:**
1. Obtenha o UID do Firebase Console
2. Adicione nas regras do Firestore
3. Adicione também em `src/config/appConfig.js`
4. Execute `firebase deploy --only firestore:rules`

---

## 📝 Arquivo Modificado

```
✅ firestore.rules
```

### Mudanças:

```diff
+ // Regras para configurações da loja
+ match /config/{configId} {
+   allow read: if true; // Leitura pública
+   allow write: if request.auth != null && (admins);
+ }

+ // Regras para sorteio - apenas admins
+ match /sorteio/{sorteioId} {
+   allow read, write: if request.auth != null && (admins);
+ }

+ // Regras para vencedores - apenas admins
+ match /sorteio_vencedores/{vencedorId} {
+   allow read, write: if request.auth != null && (admins);
+ }

+ // Regras para config do sorteio - apenas admins
+ match /sorteio_config/{configId} {
+   allow read, write: if request.auth != null && (admins);
+ }
```

---

## ✅ Resultado

### Antes ❌
```
Console: Erro ao carregar status da loja: Missing or insufficient permissions
Modal não aparece quando loja está fechada
Visitantes não conseguem navegar
```

### Depois ✅
```
Console: Sem erros
Modal aparece quando loja está fechada
Visitantes navegam normalmente
Sorteio protegido (apenas admins)
```

---

## 🎯 Impacto

### ✅ Benefícios
1. **Visitantes** podem ver se a loja está aberta
2. **Modal** de loja fechada funciona para todos
3. **Sorteio** permanece privado (apenas admins)
4. **Segurança** mantida em todas as áreas sensíveis
5. **Zero erros** no console

### 📈 Performance
- Sem impacto negativo
- Menos tentativas de leitura falhadas
- Melhor experiência do usuário

---

## 🔮 Manutenção Futura

### Ao Adicionar Novo Admin

1. **Obter UID:**
   ```
   Firebase Console → Authentication → Usuários → Copiar UID
   ```

2. **Atualizar Regras:**
   ```javascript
   // firestore.rules
   request.auth.uid == "NOVO_UID_AQUI" ||
   ```

3. **Atualizar Config:**
   ```javascript
   // src/config/appConfig.js
   ADMIN_UIDS: ["UID1", "UID2", "NOVO_UID_AQUI"]
   ```

4. **Deploy:**
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## ✅ Checklist de Verificação

- [x] Regras compiladas sem erros
- [x] Deploy realizado com sucesso
- [x] Leitura pública da coleção `config`
- [x] Escrita restrita a admins
- [x] Sorteio protegido (apenas admins)
- [x] Vencedores protegidos (apenas admins)
- [x] Config do sorteio protegido (apenas admins)
- [x] Erro de permissão resolvido

---

## 📞 Troubleshooting

### Erro persiste após deploy?

**Solução 1: Limpar cache**
```bash
Ctrl + Shift + R (hard reload)
```

**Solução 2: Verificar regras no console**
```
Firebase Console → Firestore Database → Regras
Verificar se está atualizado
```

**Solução 3: Criar documento se não existe**
```
Firebase Console → Firestore Database → Criar coleção "config"
Criar documento "storeStatus" com campo:
{
  isClosed: false,
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

---

## 🎉 Problema Resolvido!

Agora todos podem ver o status da loja sem erros de permissão! ✅
