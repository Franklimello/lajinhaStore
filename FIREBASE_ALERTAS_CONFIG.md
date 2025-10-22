# 🚨 Configuração de Alertas no Firebase

Este guia mostra como configurar alertas para monitorar o uso do Firestore e prevenir custos excessivos.

---

## 📋 Sumário

1. [Alertas Automáticos no Console](#1-alertas-automáticos-no-console)
2. [Budget Alerts (Alertas de Orçamento)](#2-budget-alerts)
3. [Monitoramento Programático](#3-monitoramento-programático)
4. [Alertas Locais (Client-Side)](#4-alertas-locais)
5. [Integração com Telegram](#5-integração-com-telegram)
6. [Melhores Práticas](#6-melhores-práticas)

---

## 1. Alertas Automáticos no Console

### 🎯 Objetivo
Receber notificações por email quando o uso do Firestore ultrapassar limites definidos.

### 📝 Passos

1. **Acesse o Firebase Console**
   - URL: https://console.firebase.google.com/
   - Selecione seu projeto: **compreaqui-324df**

2. **Vá para Firestore Database**
   ```
   Menu lateral → Build → Firestore Database → Usage
   ```

3. **Configure Alertas de Uso**
   - Clique no ícone de **sino (🔔)** no topo da página de Usage
   - Ou vá em: `Project Settings → Usage and billing → Set usage limits`

4. **Defina os Limites**
   ```
   ✅ Document Reads: 50,000 leituras/dia
   ✅ Document Writes: 10,000 escritas/dia
   ✅ Document Deletes: 2,000 deleções/dia
   ```

5. **Configure Notificações**
   ```
   Email: frank.melo.wal@gmail.com
   Frequência: Diária
   Threshold: 80% do limite
   ```

### 📧 Email de Alerta

Quando o limite for atingido, você receberá um email como:

```
🚨 ALERTA: Uso Excessivo do Firestore

Projeto: compreaqui-324df
Métrica: Document Reads
Uso Atual: 42,000 / 50,000 (84%)
Período: Últimas 24 horas

Ação Recomendada:
- Verificar logs de leitura
- Identificar queries pesadas
- Implementar mais cache
```

---

## 2. Budget Alerts (Alertas de Orçamento)

### 🎯 Objetivo
Limitar custos mensais com alertas quando atingir valores específicos.

### 📝 Passos

1. **Acesse Google Cloud Console**
   - URL: https://console.cloud.google.com/
   - Selecione o projeto do Firebase

2. **Vá para Billing**
   ```
   Menu → Billing → Budgets & alerts
   ```

3. **Crie um Novo Orçamento**
   - Clique em **CREATE BUDGET**

4. **Configure o Orçamento**

   **Scope (Escopo):**
   ```
   Projects: compreaqui-324df
   Services: 
     ✅ Cloud Firestore
     ✅ Cloud Storage
     ✅ Cloud Functions
   ```

   **Amount (Valor):**
   ```
   Budget type: Specified amount
   Target amount: R$ 100,00 / mês (ou seu limite)
   ```

   **Actions (Ações):**
   ```
   Threshold rules:
     ✅ 50% → Email notification
     ✅ 80% → Email notification
     ✅ 100% → Email notification + Telegram
     ✅ 120% → Email + Telegram + SMS (opcional)
   
   Email recipients:
     - frank.melo.wal@gmail.com
   ```

5. **Configurar Ação Automática (Opcional)**
   
   Você pode criar uma Cloud Function que **desabilita o Firebase** automaticamente quando atingir o limite:

   ```javascript
   // functions/budgetShutdown.js
   const admin = require('firebase-admin');
   
   exports.budgetShutdown = functions.pubsub
     .topic('budget-alerts')
     .onPublish(async (message) => {
       const data = message.data 
         ? JSON.parse(Buffer.from(message.data, 'base64').toString())
         : null;
       
       // Se atingiu 100% do orçamento
       if (data && data.costAmount >= data.budgetAmount) {
         console.log('🚨 Orçamento excedido! Desabilitando Firestore...');
         
         // Enviar notificação ao admin
         await sendTelegramAlert('Orçamento Firebase excedido!');
         
         // Opcional: Desabilitar regras do Firestore
         // (requer configuração manual)
       }
   });
   ```

---

## 3. Monitoramento Programático

### 🎯 Objetivo
Monitorar leituras em tempo real do lado do cliente.

### 📝 Implementação

Já está implementado! Veja `ecoomerce/src/services/firestoreMonitor.js`

**Comandos úteis no Console do Navegador:**

```javascript
// Ver estatísticas gerais
firestoreMonitor.getStats()

// Gerar relatório completo
firestoreMonitor.generateReport()

// Ver leituras dos últimos 5 minutos
firestoreMonitor.getDetailedStats(5)

// Ver as 10 leituras mais custosas
firestoreMonitor.getExpensiveReads(10)

// Limpar histórico
firestoreMonitor.clear()
```

### 🔔 Alertas Locais Configurados

O sistema já alerta automaticamente quando:

| Métrica | Limite | Ação |
|---------|--------|------|
| Leituras/minuto | > 100 | ⚠️ Log de warning |
| Leituras/página | > 50 | ⚠️ Log de warning |
| Leituras/sessão | > 1000 | 🚨 Log de erro crítico |

**Ajustar limites** em `firestoreMonitor.js`:

```javascript
this.ALERT_THRESHOLDS = {
  readsPerMinute: 100,     // ← Ajuste aqui
  readsPerPage: 50,        // ← Ajuste aqui
  totalReadsPerSession: 1000 // ← Ajuste aqui
};
```

---

## 4. Alertas Locais (Client-Side)

### 📊 Dashboard de Monitoramento

Você pode criar uma página de admin para visualizar os dados:

**Novo arquivo**: `ecoomerce/src/pages/AdminMonitoring/index.js`

```javascript
import React, { useState, useEffect } from 'react';
import firestoreMonitor from '../../services/firestoreMonitor';
import indexedDBCache from '../../services/indexedDBCache';

export default function AdminMonitoring() {
  const [stats, setStats] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);

  useEffect(() => {
    // Atualizar stats a cada 5 segundos
    const interval = setInterval(() => {
      setStats(firestoreMonitor.getStats());
      
      indexedDBCache.getStats('products').then(setCacheStats);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">📊 Monitoramento Firestore</h1>

      {/* Card: Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Total de Leituras</h3>
          <p className="text-4xl font-bold text-blue-600">{stats.totalReads}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Duração da Sessão</h3>
          <p className="text-4xl font-bold text-green-600">{stats.sessionDuration} min</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Leituras/Minuto</h3>
          <p className="text-4xl font-bold text-purple-600">{stats.readsPerMinute}</p>
        </div>
      </div>

      {/* Card: Por Coleção */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">📚 Leituras por Coleção</h3>
        <div className="space-y-2">
          {Object.entries(stats.readsByCollection).map(([collection, count]) => (
            <div key={collection} className="flex justify-between items-center">
              <span className="font-medium">{collection}</span>
              <span className="text-gray-600">{count} leituras</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card: Por Página */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">📄 Leituras por Página</h3>
        <div className="space-y-2">
          {Object.entries(stats.readsByPage).map(([page, count]) => (
            <div key={page} className="flex justify-between items-center">
              <span className="font-medium">{page}</span>
              <span className="text-gray-600">{count} leituras</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card: Cache Stats */}
      {cacheStats && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">💾 Estatísticas do Cache (IndexedDB)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{cacheStats.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Válidos</p>
              <p className="text-2xl font-bold text-green-600">{cacheStats.valid}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expirados</p>
              <p className="text-2xl font-bold text-red-600">{cacheStats.expired}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tamanho</p>
              <p className="text-2xl font-bold">{cacheStats.totalSizeKB} KB</p>
            </div>
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => firestoreMonitor.generateReport()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          📊 Gerar Relatório no Console
        </button>

        <button
          onClick={() => firestoreMonitor.clear()}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          🗑️ Limpar Histórico
        </button>

        <button
          onClick={() => indexedDBCache.clearExpired('products')}
          className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700"
        >
          🧹 Limpar Cache Expirado
        </button>
      </div>
    </div>
  );
}
```

**Adicionar rota no `App.js`:**

```javascript
import AdminMonitoring from "./pages/AdminMonitoring";

// Dentro de <Routes>
<Route 
  path="/admin-monitoring" 
  element={
    <AdminRoute>
      <Suspense fallback={<div>Carregando...</div>}>
        <AdminMonitoring />
      </Suspense>
    </AdminRoute>
  } 
/>
```

---

## 5. Integração com Telegram

### 🎯 Objetivo
Enviar alertas críticos para seu Telegram quando limites forem ultrapassados.

### 📝 Implementação

**1. Criar Bot no Telegram**

- Abra o Telegram e busque por `@BotFather`
- Envie `/newbot`
- Siga as instruções e anote o **Token**

**2. Obter seu Chat ID**

- Busque por `@userinfobot` no Telegram
- Envie `/start`
- Anote seu **Chat ID**

**3. Adicionar Cloud Function para Alertas**

**Arquivo**: `ecoomerce/functions/index.js`

```javascript
const functions = require('firebase-functions');
const axios = require('axios');

// Configurar no Firebase Console:
// firebase functions:config:set telegram.token="SEU_TOKEN_AQUI"
// firebase functions:config:set telegram.chatid="SEU_CHATID_AQUI"

exports.sendFirestoreAlert = functions.https.onCall(async (data, context) => {
  const { type, value, threshold } = data;
  
  const token = functions.config().telegram.token;
  const chatId = functions.config().telegram.chatid;
  
  const message = `
🚨 *ALERTA FIRESTORE*

📊 Tipo: ${type}
📈 Valor Atual: ${value}
⚠️ Limite: ${threshold}
⏰ Horário: ${new Date().toLocaleString('pt-BR')}

🔧 *Ação Recomendada:*
- Verificar logs de monitoramento
- Analisar queries pesadas
- Limpar cache se necessário

🔗 [Ver Dashboard](https://seu-site.com/admin-monitoring)
  `;
  
  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
    
    console.log('✅ Alerta enviado ao Telegram');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao enviar alerta:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao enviar alerta');
  }
});
```

**4. Integrar com firestoreMonitor**

Em `ecoomerce/src/services/firestoreMonitor.js`, modifique `_sendAlert`:

```javascript
async _sendAlert(type, value) {
  console.error(`🚨 ALERTA: ${type} = ${value}`);
  
  // Salvar no localStorage
  // ... código existente ...
  
  // 📧 Enviar para Telegram (apenas alertas críticos)
  if (type === 'totalReadsPerSession' && value > 1000) {
    try {
      const sendFirestoreAlert = httpsCallable(functions, 'sendFirestoreAlert');
      await sendFirestoreAlert({
        type,
        value,
        threshold: this.ALERT_THRESHOLDS[type]
      });
      console.log('📧 Alerta enviado ao Telegram');
    } catch (error) {
      console.error('❌ Erro ao enviar alerta ao Telegram:', error);
    }
  }
}
```

---

## 6. Melhores Práticas

### ✅ O Que Fazer

1. **Monitore Diariamente**
   - Verifique o dashboard de uso no Firebase Console
   - Analise os logs do `firestoreMonitor`

2. **Defina Limites Realistas**
   ```
   Para sites pequenos (< 1000 usuários/dia):
   - Document Reads: 20,000 - 50,000/dia
   - Document Writes: 5,000 - 10,000/dia
   
   Para sites médios (1000 - 10,000 usuários/dia):
   - Document Reads: 50,000 - 200,000/dia
   - Document Writes: 10,000 - 50,000/dia
   ```

3. **Use Cache Agressivamente**
   - IndexedDB para dados persistentes
   - sessionStorage para sessão atual
   - Cache em memória para componentes

4. **Otimize Queries**
   - Use `limit()` sempre
   - Evite `orderBy()` desnecessários
   - Crie índices compostos

### ❌ O Que Evitar

1. **Não use `onSnapshot` para tudo**
   - Prefira polling para dados não críticos
   - Reserve real-time apenas para chat, notificações urgentes

2. **Não busque todos os documentos**
   - Sempre use `limit()`
   - Implemente paginação

3. **Não ignore alertas**
   - Investigue imediatamente quando receber
   - Ajuste limites se necessário

---

## 📞 Suporte

Se os alertas dispararem constantemente:

1. Execute `firestoreMonitor.generateReport()` no console
2. Identifique as páginas/coleções com mais leituras
3. Implemente cache específico para essas áreas
4. Entre em contato com o desenvolvedor se precisar ajuda

---

**Configuração completa!** 🎉

Agora você tem um sistema robusto de monitoramento e alertas para prevenir custos excessivos no Firebase.


