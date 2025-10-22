# 🔍 AUDITORIA COMPLETA - LEITURAS EXCESSIVAS NO FIRESTORE

**Data:** 21/10/2025  
**Status:** 🚨 **CRÍTICO** - Múltiplos problemas identificados

---

## 📊 RESUMO EXECUTIVO

### Leituras Estimadas por Sessão de Usuário:
- **Mínimo:** ~1.500 leituras por visita à Home
- **Máximo:** ~15.000+ leituras (se todos os componentes carregarem)
- **Custo mensal estimado (1000 usuários/dia):** Ultrapassando limite gratuito do Firestore

### Principais Problemas Identificados:
1. ✅ **15 páginas de categoria** fazendo `getDocs` completo SEM filtros ou limites
2. ✅ **Cada página** busca TODOS os produtos da categoria ao mesmo tempo
3. ✅ **Na Home:** Todas as 15 categorias podem carregar simultaneamente
4. ✅ **Sem paginação** em nenhuma página de categoria
5. ✅ **Sem cache efetivo** nas páginas de categoria
6. ✅ **Listener em tempo real** (`onSnapshot`) em notificações sem necessidade

---

## ✅ CHECKLIST DETALHADO

### 1. [ ] Consultas que buscam coleções inteiras sem `where`, `limit` ou `orderBy`?

#### ❌ **PROBLEMA CRÍTICO IDENTIFICADO**

**Localização:** Todas as 15 páginas de categoria  
**Exemplo:** `ecoomerce/src/pages/Mercearia/index.js` (linhas 34-45)

```javascript
// ❌ PROBLEMA: Busca TODOS os produtos da categoria SEM LIMIT
const q = query(collection(db, "produtos"), where("categoria", "in", catOptions));
const qs = await getDocs(q);
products = qs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Se falhar, busca TODOS OS PRODUTOS do banco!
const querySnapshot = await getDocs(collection(db, "produtos"));
products = querySnapshot.docs
  .map(doc => ({ id: doc.id, ...doc.data() }))
  .filter(product => {
    const categoria = (product.categoria || "").toLowerCase().trim();
    return categoria.includes("mercearia");
  });
```

**Páginas afetadas:**
- ✅ Mercearia (linha 34)
- ✅ Cosmeticos (linha 34)
- ✅ Limpeza (linha 34)
- ✅ Bebidas (linha 34)
- ✅ BebidasGeladas (linha 34)
- ✅ HigienePessoal (linha 34)
- ✅ Farmacia (linha 34)
- ✅ FriosLaticinios (linha 34)
- ✅ GulosemasSnacks (linha 34)
- ✅ Hortifruti (linha 34)
- ✅ Acougue (linha 34)
- ✅ Infantil (linha 34)
- ✅ PetShop (linha 34)
- ✅ UtilidadesDomesticas (linha 34)
- ✅ Ofertas (linha 34)

**Impacto:** Se você tem 500 produtos no banco, cada página carrega ~30-50 produtos da categoria, mas **FAZ LEITURA DE TODOS OS 500**.

---

### 2. [ ] Uso de `onSnapshot()` em listas grandes ou sem necessidade de tempo real?

#### ⚠️ **PROBLEMA MODERADO**

**Localização:** `ecoomerce/src/components/NotificationsList/index.js` (linha 31)

```javascript
// ⚠️ PROBLEMA: Listener em tempo real para notificações
const unsubscribe = onSnapshot(
  q,
  (snapshot) => {
    console.log('📬 Notificações atualizadas:', snapshot.size);
    // ... processa notificações
  }
);
```

**Por que é problema?**
- Cada mudança nas notificações gera uma nova leitura
- Se houver 100 notificações, são 100 leituras a cada mudança
- Usuário não precisa de notificações em tempo real (pode usar polling a cada 30s)

**Impacto:** Médio - depende do volume de notificações

---

### 3. [ ] Múltiplos `onSnapshot()` ou `getDocs()` sendo chamados várias vezes no mesmo componente?

#### ✅ **PROBLEMA CRÍTICO**

**Localização:** `ecoomerce/src/pages/Home/index.js` + `LazyCategorySection.jsx`

**Cenário:**
1. Usuário acessa a Home
2. `LazyCategorySection` carrega 15 componentes de categoria
3. **CADA categoria faz um `getDocs`** completo
4. **Total: 15 consultas simultâneas ao Firestore**

```javascript
// Home renderiza múltiplas categorias
<LazyCategorySection categoryName="Mercearia" searchTerm={searchTerm} />
<LazyCategorySection categoryName="Limpeza" searchTerm={searchTerm} />
<LazyCategorySection categoryName="Bebidas" searchTerm={searchTerm} />
// ... mais 12 categorias
```

**Cada uma dessas categorias dispara:**
```javascript
useEffect(() => {
  const fetchData = async () => {
    // ❌ Busca todos os produtos da categoria
    const q = query(collection(db, "produtos"), where("categoria", "in", catOptions));
    const qs = await getDocs(q);
    // ...
  };
  fetchData();
}, []); // Dispara SEMPRE que o componente monta
```

**Impacto:** 
- 15 categorias × 500 produtos = **7.500 leituras por visita à Home**
- Se 100 usuários acessarem simultaneamente: **750.000 leituras/dia**

---

### 4. [ ] `useEffect` sem array de dependências ou com dependências que mudam frequentemente?

#### ✅ **BOM** - Arrays de dependências estão corretos

Exemplo:
```javascript
// ✅ Correto - só executa uma vez
useEffect(() => {
  fetchData();
}, []);
```

**Mas atenção:**
- Em `useOptimizedProducts.js` (linha 102), há dependência de `searchTerm` e `category`, o que pode refazer consultas desnecessariamente se o usuário digitar rápido.

---

### 5. [ ] Mesma leitura em mais de um local?

#### ✅ **PROBLEMA MODERADO**

**Hook `useGetDocuments`** é usado em múltiplos lugares, mas cada um faz sua própria consulta:

- **Painel de Admin:** `useGetDocuments("produtos")` → busca TODOS os produtos
- **Cada página de categoria:** Faz sua própria query independente

**Não há compartilhamento de dados entre componentes.**

---

### 6. [ ] Re-renderizações desnecessárias refazendo leituras do Firestore?

#### ✅ **BOM COM RESSALVAS**

**Contextos estão otimizados:**
- `ShopContext`: ✅ Sem leituras do Firestore
- `AuthContext`: ✅ Apenas `onAuthStateChanged`
- `CartContext`: ✅ Apenas localStorage
- `StoreStatusContext`: ⚠️ **Faz `getDoc` a cada mount** (linha 16)

```javascript
// ⚠️ StoreStatusContext - pode ser otimizado
useEffect(() => {
  const loadStoreStatus = async () => {
    const docRef = doc(db, "config", "storeStatus");
    const docSnap = await getDoc(docRef); // Leitura toda vez que monta
    // ...
  };
  loadStoreStatus();
}, []);
```

**Solução:** Usar `onSnapshot` com cache ou salvar em `localStorage`.

---

### 7. [ ] Cache local para evitar leituras repetidas?

#### ⚠️ **PARCIALMENTE IMPLEMENTADO**

**Onde tem cache:**
- ✅ `useGetDocuments`: Cache com `sessionStorage` (TTL 5min)
- ✅ `useOptimizedProducts`: Cache com `sessionStorage` (TTL 5min)

**Onde NÃO tem cache:**
- ❌ **Todas as 15 páginas de categoria** (Mercearia, Limpeza, etc.)
- ❌ `StoreStatusContext`

**Problema:** As páginas de categoria fazem `getDocs` direto, ignorando qualquer hook de cache.

---

### 8. [ ] Paginação configurada?

#### ❌ **AUSENTE EM TODAS AS PÁGINAS DE CATEGORIA**

**Nenhuma página de categoria implementa paginação.**

Cada página carrega **TODOS os produtos da categoria de uma vez**, mesmo que o usuário veja apenas 10-20 na tela.

**Exemplo:**
```javascript
// ❌ Sem paginação - carrega tudo
const q = query(collection(db, "produtos"), where("categoria", "==", "Mercearia"));
const qs = await getDocs(q);
// Se tiver 200 produtos de mercearia, carrega os 200
```

---

### 9. [ ] Funções de leitura memorizadas com `useCallback`?

#### ✅ **BOM** - Funções estão memorizadas onde necessário

Exemplo em `useOptimizedProducts`:
```javascript
const fetchProducts = useCallback(async (isLoadMore = false) => {
  // ...
}, [searchTerm, category, pageSize, lastDoc, cacheKey]);
```

---

### 10. [ ] Centralização de dados para evitar múltiplas leituras?

#### ❌ **AUSENTE**

**Não há Context ou Store global para produtos.**

Cada componente busca seus próprios dados:
- Home busca via `useSimpleSearch`
- Cada categoria busca via `getDocs` direto
- Admin busca via `useGetDocuments`

**Resultado:** Dados duplicados, múltiplas leituras do mesmo produto.

---

## 🚨 PROBLEMAS CRÍTICOS PRIORIZADOS

### 🔴 **PRIORIDADE 1 - CRÍTICO (Resolver AGORA)**

#### **Problema 1: 15 páginas de categoria carregando TODOS os produtos**

**Arquivos afetados:** Todas as páginas em `src/pages/`

**Solução:**
```javascript
// ❌ ANTES (Mercearia/index.js, linha 34)
const q = query(collection(db, "produtos"), where("categoria", "in", catOptions));
const qs = await getDocs(q);

// ✅ DEPOIS - Com LIMIT e PAGINAÇÃO
const q = query(
  collection(db, "produtos"), 
  where("categoria", "in", catOptions),
  orderBy("titulo"),
  limit(20) // 👈 ADICIONAR LIMIT
);
const qs = await getDocs(q);
```

**Implementar:**
1. Adicionar `limit(20)` em TODAS as queries de categoria
2. Implementar botão "Carregar Mais" com `startAfter(lastDoc)`
3. Implementar cache com `sessionStorage` (TTL 5min)

**Redução esperada:** De 7.500 leituras para **300 leituras** por visita à Home (95% de redução!)

---

#### **Problema 2: Fallback buscando TODOS os produtos sem filtro**

**Localização:** Todas as páginas de categoria (linha 38)

```javascript
// ❌ PIOR CENÁRIO: Busca TODO O BANCO
const querySnapshot = await getDocs(collection(db, "produtos"));
products = querySnapshot.docs
  .map(doc => ({ id: doc.id, ...doc.data() }))
  .filter(product => {
    return categoria.includes("mercearia"); // Filtra DEPOIS da leitura!
  });
```

**Solução:**
```javascript
// ✅ REMOVER o fallback ou adicionar LIMIT obrigatório
const q = query(
  collection(db, "produtos"), 
  orderBy("categoria"), // Permite index para busca eficiente
  limit(100) // 👈 Limite máximo absoluto
);
```

**Redução esperada:** De potenciais 500 leituras para **100 máximo**.

---

### 🟡 **PRIORIDADE 2 - IMPORTANTE (Resolver esta semana)**

#### **Problema 3: Home carregando 15 categorias simultaneamente**

**Localização:** `Home/index.js` + `LazyCategorySection.jsx`

**Solução: Lazy Loading Inteligente**

```javascript
// ✅ Carregar apenas 3-5 categorias inicialmente
// Carregar demais sob demanda (scroll infinito ou botão)

// OPÇÃO A: Limitar categorias exibidas
const [visibleCategories, setVisibleCategories] = useState(5);

// OPÇÃO B: Usar Intersection Observer (já implementado em LazyCategorySection)
// Mas DESABILITAR nas primeiras 10 categorias se não estiverem visíveis

// OPÇÃO C: Modo "Preview" - carregar apenas 10 produtos por categoria
<CategoryComponent searchTerm={searchTerm} isPreview={true} limit={10} />
```

**Redução esperada:** De 15 consultas para **5 consultas** iniciais (66% de redução).

---

#### **Problema 4: NotificationsList usando `onSnapshot` sem necessidade**

**Localização:** `components/NotificationsList/index.js` (linha 31)

**Solução: Polling com intervalo**

```javascript
// ❌ ANTES: Listener em tempo real
const unsubscribe = onSnapshot(q, (snapshot) => {
  // Dispara a cada mudança
});

// ✅ DEPOIS: Polling a cada 30 segundos
useEffect(() => {
  const fetchNotifications = async () => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20) // 👈 ADICIONAR LIMIT
    );
    const snapshot = await getDocs(q);
    // ...
  };

  fetchNotifications(); // Inicial
  const interval = setInterval(fetchNotifications, 30000); // A cada 30s
  return () => clearInterval(interval);
}, [user]);
```

**Redução esperada:** De 100 leituras/minuto para **2 leituras/minuto** (98% de redução).

---

### 🟢 **PRIORIDADE 3 - OTIMIZAÇÃO (Resolver próximo sprint)**

#### **Problema 5: StoreStatusContext sem cache**

**Solução:**
```javascript
// ✅ Adicionar cache com localStorage
useEffect(() => {
  const loadStoreStatus = async () => {
    // Verifica cache primeiro
    const cached = localStorage.getItem('storeStatus');
    if (cached) {
      const { status, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 5 * 60 * 1000) { // 5min
        setIsClosed(status);
        setLoading(false);
        return;
      }
    }

    // Busca do Firestore se cache expirou
    const docRef = doc(db, "config", "storeStatus");
    const docSnap = await getDoc(docRef);
    // ...
    localStorage.setItem('storeStatus', JSON.stringify({
      status: docSnap.data().isClosed,
      timestamp: Date.now()
    }));
  };
  loadStoreStatus();
}, []);
```

---

#### **Problema 6: Centralização de dados de produtos**

**Solução: Context Global de Produtos**

```javascript
// 📁 src/context/ProductsContext.js
export const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [productsCache, setProductsCache] = useState({});
  const [loading, setLoading] = useState({});

  const getProductsByCategory = useCallback(async (category, limit = 20) => {
    // Verifica cache
    const cacheKey = `${category}_${limit}`;
    if (productsCache[cacheKey]) {
      return productsCache[cacheKey];
    }

    // Busca do Firestore
    setLoading(prev => ({ ...prev, [cacheKey]: true }));
    const q = query(
      collection(db, "produtos"),
      where("categoria", "==", category),
      orderBy("titulo"),
      limit(limit)
    );
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Salva no cache
    setProductsCache(prev => ({ ...prev, [cacheKey]: products }));
    setLoading(prev => ({ ...prev, [cacheKey]: false }));

    return products;
  }, [productsCache]);

  return (
    <ProductsContext.Provider value={{ getProductsByCategory, loading }}>
      {children}
    </ProductsContext.Provider>
  );
}
```

---

## 📈 IMPACTO ESPERADO DAS CORREÇÕES

| Prioridade | Mudança | Leituras Antes | Leituras Depois | Redução |
|------------|---------|----------------|-----------------|---------|
| 🔴 P1 | Adicionar `limit(20)` em categorias | 7.500 | 300 | **-96%** |
| 🔴 P1 | Remover fallback sem limit | 500 | 100 | **-80%** |
| 🟡 P2 | Lazy load inteligente na Home | 15 consultas | 5 consultas | **-66%** |
| 🟡 P2 | Polling em vez de `onSnapshot` | 100/min | 2/min | **-98%** |
| 🟢 P3 | Cache StoreStatus | 1/mount | 1/5min | **-95%** |

**TOTAL ESPERADO:** De ~15.000 leituras para **~500 leituras** por usuário/sessão.

**Economia mensal (1000 usuários/dia):**
- Antes: 450.000.000 leituras/mês (US$ 180 acima do limite gratuito)
- Depois: 15.000.000 leituras/mês (dentro do limite gratuito de 50k/dia)

---

## 🛠️ PLANO DE AÇÃO RECOMENDADO

### Semana 1: Correções Críticas (P1)
1. Adicionar `limit(20)` em todas as páginas de categoria
2. Implementar paginação com "Carregar Mais"
3. Adicionar cache `sessionStorage` (TTL 5min)
4. Remover ou limitar fallback que busca todo o banco

### Semana 2: Otimizações Importantes (P2)
1. Implementar lazy loading inteligente na Home
2. Converter `onSnapshot` para polling (30s)
3. Adicionar `limit` em todas as queries

### Semana 3: Refinamentos (P3)
1. Criar `ProductsContext` global
2. Adicionar cache em `StoreStatusContext`
3. Implementar IndexedDB para cache persistente

---

## 📚 BOAS PRÁTICAS RECOMENDADAS

### 1. **SEMPRE usar `limit()` em queries**
```javascript
// ❌ NUNCA
const q = query(collection(db, "produtos"));

// ✅ SEMPRE
const q = query(collection(db, "produtos"), limit(20));
```

### 2. **Implementar paginação em listas grandes**
```javascript
// ✅ Paginação com startAfter
const q = query(
  collection(db, "produtos"),
  orderBy("titulo"),
  startAfter(lastDoc),
  limit(20)
);
```

### 3. **Cache agressivo com TTL**
```javascript
// ✅ Cache com sessionStorage/localStorage
const cacheKey = `products_${category}`;
const cached = sessionStorage.getItem(cacheKey);
if (cached) {
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp < 5 * 60 * 1000) {
    return data;
  }
}
```

### 4. **Preferir `getDocs` sobre `onSnapshot` quando possível**
```javascript
// ⚠️ Usar onSnapshot APENAS se precisar de tempo real
const unsubscribe = onSnapshot(q, (snapshot) => { /* ... */ });

// ✅ Para dados que não mudam frequentemente, usar getDocs
const snapshot = await getDocs(q);
```

### 5. **Lazy loading com Intersection Observer**
```javascript
// ✅ Carregar componentes apenas quando visíveis
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadData();
  }
});
```

---

## 📞 PRÓXIMOS PASSOS

1. ✅ Revisar esta auditoria com a equipe
2. ✅ Priorizar correções (começar por P1)
3. ✅ Implementar monitoramento de leituras no Firebase Console
4. ✅ Configurar alertas de uso (quando ultrapassar 10k leituras/dia)
5. ✅ Validar correções com testes de carga

---

**Fim da Auditoria**  
*Documento criado automaticamente pelo assistente de IA*


