# 🎮 Comandos Úteis - Monitoramento e Cache

Comandos práticos para usar no Console do Navegador (F12).

---

## 📊 Monitoramento de Leituras

### Ver Estatísticas Gerais
```javascript
firestoreMonitor.getStats()
```
**Retorna**:
```javascript
{
  totalReads: 245,
  sessionDuration: "12.34",
  readsPerMinute: "19.85",
  readsByCollection: { produtos: 200, notifications: 45 },
  readsByPage: { "/": 100, "/mercearia": 80, ... }
}
```

### Gerar Relatório Completo
```javascript
firestoreMonitor.generateReport()
```
**Mostra no console**: Relatório formatado com todas as estatísticas.

### Ver Leituras dos Últimos X Minutos
```javascript
firestoreMonitor.getDetailedStats(5)  // Últimos 5 minutos
firestoreMonitor.getDetailedStats(1)  // Último minuto
```

### Ver as Leituras Mais Custosas
```javascript
firestoreMonitor.getExpensiveReads(10)  // Top 10
```

### Ver Leituras da Página Atual
```javascript
firestoreMonitor.getReadsByPage()
```

### Limpar Histórico de Leituras
```javascript
firestoreMonitor.clear()
```

### Ativar/Desativar Monitoramento
```javascript
firestoreMonitor.disable()  // Pausar monitoramento
firestoreMonitor.enable()   // Retomar monitoramento
```

---

## 💾 Cache do IndexedDB

### Ver Estatísticas do Cache
```javascript
await indexedDBCache.getStats('products')
```
**Retorna**:
```javascript
{
  total: 15,
  valid: 12,
  expired: 3,
  totalSize: 245678,
  totalSizeKB: "239.92",
  byCategory: { Mercearia: 1, Limpeza: 1, ... }
}
```

### Limpar Cache Expirado
```javascript
await indexedDBCache.clearExpired('products')
await indexedDBCache.clearExpired('cache')
await indexedDBCache.clearExpired('images')
```

### Limpar TODO o Cache
```javascript
await indexedDBCache.clear('products')  // Apenas produtos
await indexedDBCache.clear('cache')     // Apenas cache genérico
await indexedDBCache.clear('images')    // Apenas imagens
```

### Salvar no Cache Manualmente
```javascript
await indexedDBCache.set('cache', 'minha-chave', { meusDados: 'aqui' }, 300000)
// 300000 = 5 minutos em milissegundos
```

### Ler do Cache
```javascript
const dados = await indexedDBCache.get('cache', 'minha-chave')
console.log(dados)
```

### Deletar Item Específico
```javascript
await indexedDBCache.delete('products', 'Mercearia_initial')
```

---

## 🔄 ProductsContext

### Buscar Produtos com Cache
```javascript
// Não é possível chamar diretamente do console,
// mas você pode ver os logs ao navegar:
// - Cache hit (memória)
// - Cache hit (IndexedDB)
// - Buscando do Firestore
```

### Limpar Cache de Produtos
```javascript
// Acessar através do contexto (se exposto globalmente)
// Ou simplesmente limpar o IndexedDB:
await indexedDBCache.clear('products')
sessionStorage.clear()
location.reload()
```

---

## 🧪 Testes

### Testar Performance de Cache

**1. Limpar tudo e medir primeira carga:**
```javascript
// 1. Limpar
await indexedDBCache.clear('products')
sessionStorage.clear()
firestoreMonitor.clear()

// 2. Recarregar
location.reload()

// 3. Após carregar, ver estatísticas
firestoreMonitor.getStats()
// Deve mostrar ~60-100 leituras
```

**2. Medir segunda carga (com cache):**
```javascript
// 1. Ver leituras atuais
const antes = firestoreMonitor.totalReads

// 2. Navegar para outra página e voltar
// (ou recarregar)

// 3. Ver diferença
const depois = firestoreMonitor.totalReads
console.log(`Leituras com cache: ${depois - antes}`)
// Deve ser 0 ou muito próximo de 0!
```

### Testar Alertas

**Simular muitas leituras:**
```javascript
// Ajustar limite para testar
firestoreMonitor.ALERT_THRESHOLDS.readsPerMinute = 5

// Navegar rapidamente entre várias páginas
// Você deve ver warnings no console
```

---

## 🚨 Debugging

### Ver Todos os Alertas Recentes
```javascript
const alerts = JSON.parse(localStorage.getItem('firestore_alerts') || '[]')
console.table(alerts)
```

### Ver Logs Detalhados
```javascript
// Ativar logs verbosos (se implementado)
localStorage.setItem('debug_mode', 'true')
location.reload()
```

### Verificar Status do IndexedDB
```javascript
// Ver se está disponível
console.log('IndexedDB suportado:', indexedDBCache.isSupported)

// Ver instância do banco
console.log('DB:', indexedDBCache.db)
```

### Migrar do sessionStorage para IndexedDB
```javascript
await indexedDBCache.migrateFromSessionStorage()
```

---

## 📈 Monitoramento Contínuo

### Script para Atualizar Estatísticas a Cada 10s
```javascript
// Colar no console
let monitorInterval = setInterval(() => {
  const stats = firestoreMonitor.getStats()
  console.clear()
  console.log('═══════════════════════════════════════')
  console.log('📊 MONITORAMENTO EM TEMPO REAL')
  console.log('═══════════════════════════════════════')
  console.log(`Total de Leituras: ${stats.totalReads}`)
  console.log(`Leituras/Min: ${stats.readsPerMinute}`)
  console.log(`Duração: ${stats.sessionDuration} min`)
  console.log('───────────────────────────────────────')
  console.log('Por Coleção:')
  Object.entries(stats.readsByCollection).forEach(([col, count]) => {
    console.log(`  ${col}: ${count}`)
  })
  console.log('═══════════════════════════════════════')
}, 10000)

// Para parar:
// clearInterval(monitorInterval)
```

---

## 🎯 Cenários Comuns

### Cenário 1: Site Lento
```javascript
// 1. Ver estatísticas de cache
await indexedDBCache.getStats('products')

// Se muitos expirados:
await indexedDBCache.clearExpired('products')

// Se nenhum cache:
// Verificar se ProductsContext está funcionando
// Ver logs no console ao navegar
```

### Cenário 2: Muitas Leituras
```javascript
// 1. Ver relatório completo
firestoreMonitor.generateReport()

// 2. Identificar a página/coleção problemática

// 3. Ver leituras mais custosas
firestoreMonitor.getExpensiveReads(10)

// 4. Verificar se essa página tem cache implementado
```

### Cenário 3: Cache Não Funciona
```javascript
// 1. Verificar suporte
console.log('IndexedDB:', indexedDBCache.isSupported)

// 2. Verificar se há dados
await indexedDBCache.getStats('products')

// 3. Limpar tudo e testar novamente
await indexedDBCache.clear('products')
sessionStorage.clear()
location.reload()
```

### Cenário 4: Resetar Tudo
```javascript
// ATENÇÃO: Isso limpa TUDO!
await indexedDBCache.clear('products')
await indexedDBCache.clear('cache')
await indexedDBCache.clear('images')
sessionStorage.clear()
localStorage.clear()
firestoreMonitor.clear()
location.reload()
```

---

## 📱 Mobile / DevTools

Se estiver testando no mobile via Chrome DevTools:

1. Conecte o celular via USB
2. Abra `chrome://inspect`
3. Clique em "Inspect" no seu dispositivo
4. Use os comandos acima no console remoto

---

## 💡 Dicas

1. **Sempre verifique os logs**
   - Ao navegar, você verá no console se o cache está funcionando
   - Procure por "Cache hit" vs "Buscando do Firestore"

2. **Use o relatório regularmente**
   ```javascript
   firestoreMonitor.generateReport()
   ```

3. **Limpe cache expirado semanalmente**
   ```javascript
   await indexedDBCache.clearExpired('products')
   ```

4. **Monitore o Firebase Console**
   - Veja o gráfico de "Document Reads"
   - Compare antes/depois das otimizações

---

## 🔗 Links Úteis

- **Firebase Console**: https://console.firebase.google.com/
- **IndexedDB em DevTools**: Application → Storage → IndexedDB
- **Ver sessionStorage**: Application → Storage → Session Storage
- **Ver localStorage**: Application → Storage → Local Storage

---

**Salve este arquivo nos favoritos!** 📌

Sempre que precisar debugar, volte aqui e use os comandos.


