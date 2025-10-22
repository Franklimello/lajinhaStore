# ⚠️ TAREFA URGENTE DE SEGURANÇA

## 🔴 Token do Telegram Exposto

O token do bot do Telegram está **temporariamente hardcoded** no código para continuar funcionando.

**Status**: 🔴 TEMPORÁRIO - CORRIGIR QUANDO POSSÍVEL

---

## 📋 O que fazer quando tiver tempo:

### 1. Revogar o token antigo
- Telegram → @BotFather → /mybots → API Token → Revoke

### 2. Configurar novo token no Firebase
```bash
firebase functions:config:set telegram.token="NOVO_TOKEN"
firebase deploy --only functions
```

### 3. Limpar repositório GitHub (opcional)
- Apagar e recriar repositório
- Ou usar BFG Repo-Cleaner

---

**Guia completo**: `SEGURANCA_CORRECAO.md`

**Prazo recomendado**: O quanto antes (pode esperar alguém mal-intencionado usar seu bot)

---

**Por enquanto**: O sistema continua funcionando normalmente ✅


