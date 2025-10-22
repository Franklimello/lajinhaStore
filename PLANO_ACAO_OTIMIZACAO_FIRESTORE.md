# 🚀 PLANO DE AÇÃO - OTIMIZAÇÃO FIRESTORE

## 📊 RESUMO EXECUTIVO

**Situação Atual:**
- ~15.000 leituras por usuário/sessão
- 15 páginas de categoria sem `limit()`
- Custo mensal ultrapassando limite gratuito do Firestore

**Objetivo:**
- Reduzir para ~500 leituras por usuário/sessão (**96% de redução**)
- Implementar cache efetivo
- Manter dentro do limite gratuito (50k leituras/dia)

**Prazo:** 3 semanas

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### 🔴 **SEMANA 1: CORREÇÕES CRÍTICAS (P1)**

#### [ ] 1. Adicionar `limit()` em TODAS as páginas de categoria

**Arquivos a modificar (15 total):**
- [ ] `src/pages/Mercearia/index.js`
- [ ] `src/pages/Cosmeticos/index.js`
- [ ] `src/pages/Limpeza/index.js`
- [ ] `src/pages/Bebidas/index.js`
- [ ] `src/pages/BebidasGeladas/index.js`
- [ ] `src/pages/HigienePessoal/index.js`
- [ ] `src/pages/farmacia/index.js`
- [ ] `src/pages/FriosLaticinios/index.js`
- [ ] `src/pages/GulosemasSnacks/index.js`
- [ ] `src/pages/Hortifruti/index.js`
- [ ] `src/pages/Acougue/index.js`
- [ ] `src/pages/Infantil/index.js`
- [ ] `src/pages/PetShop/index.js`
- [ ] `src/pages/UtilidadesDomesticas/index.js`
- [ ] `src/pages/Ofertas/index.js`

**Mudanças necessárias em cada arquivo:**
```javascript
// ❌ ANTES
const q = query(collection(db, "produtos"), where("categoria", "in", catOptions));

// ✅ DEPOIS
const q = query(
  collection(db, "produtos"), 
  where("categoria", "in", catOptions),
  orderBy("titulo"),
  limit(20) // 👈 ADICIONAR
);
```

**Tempo estimado:** 1 dia  
**Impacto:** 96% de redução nas leituras  
**Referência:** `CORRECAO_P1_CATEGORIAS_COM_LIMIT.md`

---

#### [ ] 2. Implementar paginação com "Carregar Mais"

**Em cada página de categoria, adicionar:**
1. Estado `lastDoc` para rastrear último documento
2. Estado `hasMore` para indicar se há mais produtos
3. Botão "Carregar Mais" no final da lista
4. Função `handleLoadMore()` com `startAfter(lastDoc)`

**Exemplo:**
```javascript
const [lastDoc, setLastDoc] = useState(null);
const [hasMore, setHasMore] = useState(true);

// Query com paginação
const q = query(
  collection(db, "produtos"),
  where("categoria", "==", "Mercearia"),
  orderBy("titulo"),
  startAfter(lastDoc), // 👈 Próxima página
  limit(20)
);
```

**Tempo estimado:** 2 dias  
**Impacto:** Permite carregar mais produtos sob demanda

---

#### [ ] 3. Implementar cache com `sessionStorage`

**Em cada página de categoria:**
```javascript
const CACHE_KEY = "products_mercearia";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Buscar do cache primeiro
const cached = sessionStorage.getItem(CACHE_KEY);
if (cached) {
  const { products, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp < CACHE_TTL) {
    setAllProducts(products);
    return;
  }
}

// Salvar no cache após busca
sessionStorage.setItem(CACHE_KEY, JSON.stringify({
  products: newProducts,
  timestamp: Date.now()
}));
```

**Tempo estimado:** 1 dia  
**Impacto:** Evita leituras duplicadas durante a sessão

---

#### [ ] 4. Remover ou limitar fallback que busca TODO o banco

**Localização:** Todas as páginas de categoria (linha ~38)

```javascript
// ❌ REMOVER OU LIMITAR
const querySnapshot = await getDocs(collection(db, "produtos"));
products = querySnapshot.docs
  .map(doc => ({ id: doc.id, ...doc.data() }))
  .filter(product => categoria.includes("mercearia"));

// ✅ Se precisar de fallback, adicionar LIMIT
const q = query(
  collection(db, "produtos"),
  orderBy("categoria"),
  limit(100) // 👈 Limite máximo absoluto
);
```

**Tempo estimado:** 2 horas  
**Impacto:** Evita pior cenário de 500+ leituras

---

### 🟡 **SEMANA 2: OTIMIZAÇÕES IMPORTANTES (P2)**

#### [ ] 5. Criar `ProductsContext` global

**Arquivo novo:** `src/context/ProductsContext.js`

**Funcionalidades:**
- Cache compartilhado entre componentes
- Gerenciamento centralizado de produtos
- Pré-carregamento de categorias populares
- Atualização de cache após edições

**Integração:**
1. [ ] Criar `ProductsContext.js`
2. [ ] Adicionar `<ProductsProvider>` no `App.js`
3. [ ] Refatorar 3-5 páginas para usar o contexto (teste)
4. [ ] Refatorar as 15 páginas restantes

**Tempo estimado:** 3 dias  
**Impacto:** 90% de redução em leituras duplicadas  
**Referência:** `CORRECAO_P2_CONTEXT_PRODUTOS.md`

---

#### [ ] 6. Converter NotificationsList para Polling

**Arquivo:** `src/components/NotificationsList/index.js`

**Mudanças:**
1. Substituir `onSnapshot` por `getDocs`
2. Implementar polling a cada 30 segundos
3. Adicionar botão de refresh manual
4. Adicionar `limit(20)` na query
5. Adicionar cache com debounce

**Tempo estimado:** 1 dia  
**Impacto:** 98% de redução nas leituras de notificações  
**Referência:** `CORRECAO_P2_NOTIFICATIONS_POLLING.md`

---

#### [ ] 7. Lazy Loading inteligente na Home

**Arquivo:** `src/pages/Home/index.js`

**Opções:**

**Opção A - Limitar categorias iniciais:**
```javascript
const [visibleCategories, setVisibleCategories] = useState(5);

// Renderizar apenas 5 categorias inicialmente
{categories.slice(0, visibleCategories).map(cat => (
  <LazyCategorySection key={cat} categoryName={cat} />
))}

// Botão "Ver Mais Categorias"
<button onClick={() => setVisibleCategories(15)}>
  Ver Mais Categorias
</button>
```

**Opção B - Desabilitar preview em categorias não visíveis:**
```javascript
<LazyCategorySection 
  categoryName="Mercearia" 
  searchTerm={searchTerm} 
  isPreview={true}
  disabled={!isVisible} // 👈 Não carrega se não estiver visível
/>
```

**Tempo estimado:** 1 dia  
**Impacto:** 66% de redução nas consultas iniciais da Home

---

#### [ ] 8. Adicionar cache em `StoreStatusContext`

**Arquivo:** `src/context/StoreStatusContext.js`

**Adicionar cache com `localStorage`:**
```javascript
// Verifica cache primeiro
const cached = localStorage.getItem('storeStatus');
if (cached) {
  const { status, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp < 5 * 60 * 1000) {
    setIsClosed(status);
    setLoading(false);
    return;
  }
}

// Busca do Firestore se cache expirou
const docRef = doc(db, "config", "storeStatus");
const docSnap = await getDoc(docRef);

// Salva no cache
localStorage.setItem('storeStatus', JSON.stringify({
  status: docSnap.data().isClosed,
  timestamp: Date.now()
}));
```

**Tempo estimado:** 2 horas  
**Impacto:** 95% de redução nas leituras de status

---

### 🟢 **SEMANA 3: REFINAMENTOS (P3)**

#### [ ] 9. Implementar monitoramento de leituras

**Criar hook de monitoramento:**
```javascript
// src/hooks/useFirestoreMonitor.js
export function useFirestoreMonitor() {
  const [readCount, setReadCount] = useState(0);
  const [lastReset, setLastReset] = useState(Date.now());

  const incrementReads = useCallback((count = 1) => {
    setReadCount(prev => prev + count);
  }, []);

  const resetDaily = useCallback(() => {
    setReadCount(0);
    setLastReset(Date.now());
  }, []);

  // Auto-reset diário
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastReset > 24 * 60 * 60 * 1000) {
        resetDaily();
      }
    }, 60 * 60 * 1000); // Verifica a cada hora

    return () => clearInterval(interval);
  }, [lastReset, resetDaily]);

  return { readCount, incrementReads, resetDaily };
}
```

**Integrar em `ProductsContext` e outros hooks de leitura:**
```javascript
const { incrementReads } = useFirestoreMonitor();

const snapshot = await getDocs(q);
incrementReads(snapshot.size); // 👈 Registra leituras
```

**Tempo estimado:** 1 dia

---

#### [ ] 10. Adicionar IndexedDB para cache persistente

**Criar utilitário:**
```javascript
// src/utils/indexedDBCache.js
export class IndexedDBCache {
  async get(key) {
    // Busca do IndexedDB
  }

  async set(key, value, ttl) {
    // Salva no IndexedDB com TTL
  }

  async clear() {
    // Limpa cache expirado
  }
}
```

**Usar em `ProductsContext`:**
```javascript
const cache = new IndexedDBCache();

// Buscar do IndexedDB primeiro
const cached = await cache.get(cacheKey);
if (cached) return cached;

// Buscar do Firestore
const products = await fetchFromFirestore();

// Salvar no IndexedDB
await cache.set(cacheKey, products, CACHE_TTL);
```

**Tempo estimado:** 2 dias  
**Impacto:** Cache sobrevive reloads da página

---

#### [ ] 11. Configurar Firestore Offline Persistence

**Habilitar no `firebase/config.js`:**
```javascript
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});
```

**Benefícios:**
- Cache nativo do Firestore
- Funciona offline
- Sincronização automática

**Tempo estimado:** 1 hora  
**Impacto:** Cache nativo + suporte offline

---

## 📈 MÉTRICAS DE SUCESSO

### Antes da Otimização:
- ❌ ~15.000 leituras/usuário/sessão
- ❌ 450 milhões de leituras/mês (1000 usuários/dia)
- ❌ US$ 180/mês acima do limite gratuito

### Depois da Otimização (Meta):
- ✅ ~500 leituras/usuário/sessão (96% ↓)
- ✅ 15 milhões de leituras/mês
- ✅ Dentro do limite gratuito (50k/dia)

---

## 🔍 COMO MONITORAR PROGRESSO

### 1. Firebase Console
- Acessar: https://console.firebase.google.com/
- Navegar: Firestore Database → Usage
- Verificar: Gráfico de "Document Reads"

### 2. Logs no Console do Navegador
```javascript
// Adicionar em cada query
console.log(`📊 Leituras: ${snapshot.size} documentos`);
```

### 3. Hook de Monitoramento
```javascript
const { readCount } = useFirestoreMonitor();
console.log(`📊 Total de leituras hoje: ${readCount}`);
```

### 4. Alertas no Firebase
- Configurar alerta: Quando ultrapassar 10k leituras/dia
- Email/SMS para o admin

---

## 🛠️ FERRAMENTAS ÚTEIS

### Debug de Queries
```javascript
// src/utils/queryDebugger.js
export function logQuery(queryName, snapshot) {
  console.group(`📊 Query: ${queryName}`);
  console.log(`Leituras: ${snapshot.size} documentos`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.groupEnd();
}

// Uso
const snapshot = await getDocs(q);
logQuery("Mercearia - Página 1", snapshot);
```

### Cache Inspector
```javascript
// src/utils/cacheInspector.js
export function inspectCache() {
  const cacheKeys = Object.keys(sessionStorage);
  const firestoreKeys = cacheKeys.filter(k => k.startsWith('products_'));
  
  console.table(firestoreKeys.map(key => {
    const data = JSON.parse(sessionStorage.getItem(key));
    return {
      key,
      products: data.products?.length || 0,
      age: Math.floor((Date.now() - data.timestamp) / 1000) + 's',
      expired: (Date.now() - data.timestamp) > 5 * 60 * 1000
    };
  }));
}

// Uso no console
window.inspectCache = inspectCache;
```

---

## ⚠️ PONTOS DE ATENÇÃO

### 1. Testar em Ambiente de Desenvolvimento
- [ ] Criar projeto Firebase de teste
- [ ] Testar correções antes de aplicar em produção
- [ ] Validar que cache funciona corretamente

### 2. Backup Antes de Mudanças
- [ ] Fazer commit do código atual
- [ ] Documentar estado atual das leituras
- [ ] Ter plano de rollback

### 3. Deploy Gradual
- [ ] Implementar P1 → testar → validar
- [ ] Implementar P2 → testar → validar
- [ ] Implementar P3 → testar → validar

### 4. Comunicar com Usuários
- Se houver mudanças visíveis (paginação, loading), informar usuários

---

## 📞 PRÓXIMOS PASSOS IMEDIATOS

1. ✅ Revisar documentos de correção:
   - `AUDITORIA_FIRESTORE_LEITURAS.md`
   - `CORRECAO_P1_CATEGORIAS_COM_LIMIT.md`
   - `CORRECAO_P2_CONTEXT_PRODUTOS.md`
   - `CORRECAO_P2_NOTIFICATIONS_POLLING.md`

2. ✅ Criar branch no Git:
   ```bash
   git checkout -b feature/optimize-firestore-reads
   ```

3. ✅ Começar por Mercearia (teste):
   - Aplicar correções P1 apenas nesta página
   - Testar comportamento
   - Validar leituras no Firebase Console
   - Se OK, replicar para outras 14 páginas

4. ✅ Monitorar métricas diariamente durante 1 semana

5. ✅ Ajustar conforme necessário

---

**Boa sorte com a otimização! 🚀**

*Se precisar de ajuda durante a implementação, consulte os arquivos de correção detalhados.*


