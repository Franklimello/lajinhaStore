# 🚨 CORREÇÃO DE SEGURANÇA - TOKEN DO TELEGRAM EXPOSTO

## ⚠️ O Problema

O token do bot do Telegram estava **hardcoded** no arquivo `functions/index.js`, o que significa que estava **exposto publicamente** no GitHub.

## ✅ Solução Implementada

O código foi corrigido para usar **variáveis de ambiente** ao invés de valores hardcoded.

---

## 🔧 PASSOS PARA CORRIGIR (URGENTE!)

### 1️⃣ Revogar o Token Antigo

**⚠️ FAÇA ISSO IMEDIATAMENTE!**

1. Abra o Telegram
2. Busque por `@BotFather`
3. Envie `/mybots`
4. Selecione seu bot
5. Clique em **"API Token"**
6. Clique em **"Revoke current token"**
7. **Copie o NOVO TOKEN** que será gerado

---

### 2️⃣ Configurar o Novo Token no Firebase

No terminal, execute:

```bash
cd ecoomerce/functions

# Configurar o token no Firebase Functions
firebase functions:config:set telegram.token="SEU_NOVO_TOKEN_AQUI"

# Verificar se foi configurado
firebase functions:config:get
```

Você deve ver algo como:
```json
{
  "telegram": {
    "token": "SEU_NOVO_TOKEN"
  }
}
```

---

### 3️⃣ Fazer Deploy das Functions

```bash
firebase deploy --only functions
```

---

### 4️⃣ Limpar o Histórico do Git (Opcional mas Recomendado)

Como o token antigo já foi commitado no histórico do Git, mesmo que você delete o código, ele ainda estará acessível no histórico. Existem duas opções:

#### Opção A: Apagar e Recriar o Repositório (Mais Simples)

1. **No GitHub:**
   - Vá em Settings → Scroll até o final → Delete this repository
   - Confirme a exclusão

2. **No seu computador:**
   ```bash
   cd "C:\Users\Pichau\Desktop\projeto web e mobile"
   
   # Deletar a pasta .git
   rm -rf .git
   
   # Inicializar novo repositório
   git init
   git add .
   git commit -m "Initial commit (seguro)"
   
   # Criar novo repositório no GitHub e fazer push
   git remote add origin https://github.com/Franklimelo/lajinhaStore.git
   git branch -M main
   git push -u origin main
   ```

#### Opção B: Limpar Histórico (Mais Complexo)

Use a ferramenta `git filter-branch` ou `BFG Repo-Cleaner`, mas é mais complicado.

---

### 5️⃣ Adicionar .gitignore (Prevenção)

Crie ou atualize o arquivo `.gitignore` na raiz do projeto:

```bash
# No terminal
cd "C:\Users\Pichau\Desktop\projeto web e mobile\ecoomerce"
```

Adicione ao `.gitignore`:
```
# Secrets e configurações
.env
.env.local
.env.production
functions/.env
functions/.runtimeconfig.json

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log

# Node
node_modules/
npm-debug.log
```

---

## 🔐 Boas Práticas de Segurança

### ✅ O que FAZER:
- ✅ Usar variáveis de ambiente para tokens/senhas
- ✅ Adicionar `.env` no `.gitignore`
- ✅ Usar `firebase functions:config:set` para secrets
- ✅ Revisar código antes de commitar

### ❌ O que NÃO FAZER:
- ❌ Nunca commitar tokens/senhas no código
- ❌ Nunca compartilhar tokens publicamente
- ❌ Nunca usar tokens em URLs ou logs

---

## 📊 Verificar se Está Seguro

Depois de fazer todas as correções:

1. **Verificar o código:**
   ```bash
   cd ecoomerce/functions
   grep -r "8393627901" .
   ```
   Não deve retornar nada!

2. **Verificar no GitHub:**
   - Vá no seu repositório
   - Procure por "8393627901" ou partes do token
   - Se encontrar algo, o histórico ainda tem o token antigo

3. **Testar o bot:**
   - Faça um pedido teste no site
   - Verifique se recebe a notificação no Telegram

---

## 🆘 Se Precisar de Ajuda

1. **Token não funciona:**
   ```bash
   firebase functions:config:get
   ```
   Verifique se o token está configurado

2. **Erro ao fazer deploy:**
   ```bash
   firebase deploy --only functions --debug
   ```
   Ver logs detalhados

3. **Bot não responde:**
   - Verifique se revogou o token antigo
   - Verifique se configurou o novo token
   - Verifique se fez deploy das functions

---

## ✅ Checklist Final

- [ ] Revogou o token antigo no @BotFather
- [ ] Copiou o NOVO token
- [ ] Configurou o token no Firebase: `firebase functions:config:set`
- [ ] Fez deploy: `firebase deploy --only functions`
- [ ] Testou enviando um pedido
- [ ] Recebeu notificação no Telegram
- [ ] (Opcional) Apagou e recriou o repositório GitHub
- [ ] Adicionou `.env` no `.gitignore`
- [ ] Commitou as alterações

---

**Status**: 🔴 AÇÃO URGENTE NECESSÁRIA

Após completar todos os passos, o status será: ✅ SEGURO


