# 🔧 Correção: Erro "FIRESTORE INTERNAL ASSERTION FAILED"

## 📋 Problema

Erro interno do Firestore após implementação do login com Google via redirect:
```
FIRESTORE (12.4.0) INTERNAL ASSERTION FAILED: Unexpected state (ID: ca9)
```

## 🔍 Causa

Este erro geralmente acontece quando:
1. **Mudanças rápidas de estado** após redirect do Google
2. **Múltiplos listeners** tentando processar o mesmo evento
3. **Conflitos de estado interno** do Firestore durante autenticação
4. **Problemas com persistência IndexedDB** em múltiplas abas

## ✅ Correções Aplicadas

### 1. **AuthContext.js** - Melhor tratamento de redirect
- ✅ Adicionado delay de 100ms antes de processar `getRedirectResult`
- ✅ Delay de 200ms após redirect antes de atualizar estado do usuário
- ✅ Evita setar usuário diretamente - deixa `onAuthStateChanged` fazer isso
- ✅ Melhor tratamento de erros no listener de autenticação
- ✅ Tratamento específico para erros esperados (sem redirect pendente)

### 2. **firebase/config.js** - Melhor tratamento de persistência
- ✅ Mudado `enableIndexedDbPersistence` para usar `.then()` e `.catch()` em vez de try/catch
- ✅ Tratamento específico para erro `failed-precondition` (múltiplas abas)
- ✅ Logs mais informativos sobre estado da persistência

## 🚀 Como Testar

### 1. **Reinicie o servidor de desenvolvimento**
```bash
# Pare o servidor atual (Ctrl+C)
# Depois inicie novamente:
cd lajinhaStore
npm start
```

### 2. **Teste no navegador**
1. Abra o app no navegador
2. Clique em "Entrar com Google"
3. Faça login
4. Verifique se não há erros no console

### 3. **Teste no mobile (se aplicável)**
1. Faça rebuild do app:
```bash
cd lajinhaStore
npm run build
npm run cap:copy
```

2. Abra no Android Studio e execute

## 🔍 Monitoramento

### Logs esperados:
- ✅ "✅ Login com Google via redirect bem-sucedido" (mobile)
- ✅ "✅ Persistência IndexedDB habilitada" (ou aviso se múltiplas abas)
- ✅ "🔐 AuthContext: Estado de autenticação mudou: Usuário logado"

### Se o erro persistir:
1. **Limpe o cache do navegador**
2. **Feche todas as abas** do app e abra apenas uma
3. **Verifique o console** para logs de erro mais específicos
4. **Recarregue a página** (F5 ou Ctrl+R)

## ⚠️ Observações

- O delay de 200ms após redirect é necessário para permitir que o Firestore se estabilize
- Erros de "no pending redirect" são **normais** se não houver redirect pendente
- A persistência IndexedDB pode falhar se houver múltiplas abas - isso é esperado

## 📚 Referências

- [Firestore Persistence](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Firebase Auth Redirect](https://firebase.google.com/docs/auth/web/redirect-best-practices)



