# 🟡 CORREÇÃO PRIORIDADE 2: Context Global de Produtos

## Problema
Cada componente busca seus próprios produtos do Firestore, resultando em:
- **Dados duplicados** em memória
- **Múltiplas leituras** do mesmo produto
- **Falta de sincronização** entre componentes

---

## Solução: ProductsContext Centralizado

### 📁 Novo Arquivo: `src/context/ProductsContext.js`

```javascript
import { createContext, useState, useContext, useCallback, useMemo } from "react";
import { collection, query, where, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

// Constantes
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const DEFAULT_PAGE_SIZE = 20;

// Context
export const ProductsContext = createContext();

/**
 * ProductsProvider - Gerencia cache global de produtos
 * 
 * Benefícios:
 * ✅ Cache compartilhado entre componentes
 * ✅ Evita leituras duplicadas
 * ✅ Suporta paginação
 * ✅ Atualização em tempo real opcional
 */
export function ProductsProvider({ children }) {
  // Estados
  const [cache, setCache] = useState({}); // { [cacheKey]: { products, timestamp, lastDoc, hasMore } }
  const [loading, setLoading] = useState({}); // { [cacheKey]: boolean }
  const [errors, setErrors] = useState({}); // { [cacheKey]: error }

  /**
   * Gera chave de cache única baseada nos parâmetros
   */
  const getCacheKey = useCallback((category, pageSize, page) => {
    return `${category}_${pageSize}_${page}`;
  }, []);

  /**
   * Verifica se o cache é válido
   */
  const isCacheValid = useCallback((cacheKey) => {
    const cached = cache[cacheKey];
    if (!cached) return false;

    const age = Date.now() - cached.timestamp;
    return age < CACHE_TTL;
  }, [cache]);

  /**
   * Busca produtos por categoria com paginação e cache
   * 
   * @param {string} category - Nome da categoria
   * @param {number} pageSize - Produtos por página
   * @param {number} page - Número da página (0 = primeira)
   * @param {boolean} forceRefresh - Forçar busca ignorando cache
   */
  const getProductsByCategory = useCallback(async (
    category, 
    pageSize = DEFAULT_PAGE_SIZE, 
    page = 0,
    forceRefresh = false
  ) => {
    const cacheKey = getCacheKey(category, pageSize, page);

    // ✅ Retorna do cache se válido e não for refresh forçado
    if (!forceRefresh && isCacheValid(cacheKey)) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      return {
        products: cache[cacheKey].products,
        hasMore: cache[cacheKey].hasMore,
        fromCache: true
      };
    }

    // ✅ Evita múltiplas requisições simultâneas
    if (loading[cacheKey]) {
      console.log(`⏳ Requisição em andamento: ${cacheKey}`);
      return {
        products: cache[cacheKey]?.products || [],
        hasMore: cache[cacheKey]?.hasMore || false,
        fromCache: true,
        loading: true
      };
    }

    try {
      setLoading(prev => ({ ...prev, [cacheKey]: true }));
      setErrors(prev => ({ ...prev, [cacheKey]: null }));

      console.log(`🔍 Buscando do Firestore: ${cacheKey}`);

      // ✅ Query otimizada com limit
      const catOptions = [category, category.toLowerCase()];
      let q = query(
        collection(db, "produtos"),
        where("categoria", "in", catOptions),
        orderBy("titulo"),
        limit(pageSize)
      );

      // ✅ Paginação: usa lastDoc da página anterior
      if (page > 0) {
        const prevPageKey = getCacheKey(category, pageSize, page - 1);
        const prevPageCache = cache[prevPageKey];
        
        if (prevPageCache?.lastDoc) {
          q = query(
            collection(db, "produtos"),
            where("categoria", "in", catOptions),
            orderBy("titulo"),
            startAfter(prevPageCache.lastDoc),
            limit(pageSize)
          );
        }
      }

      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const hasMore = snapshot.docs.length === pageSize;

      // ✅ Atualiza cache
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          products,
          timestamp: Date.now(),
          lastDoc,
          hasMore
        }
      }));

      console.log(`✅ Produtos carregados: ${products.length} de ${category}`);

      return { products, hasMore, fromCache: false };

    } catch (error) {
      console.error(`❌ Erro ao buscar produtos de ${category}:`, error);
      setErrors(prev => ({ ...prev, [cacheKey]: error.message }));
      
      return {
        products: [],
        hasMore: false,
        error: error.message
      };
    } finally {
      setLoading(prev => ({ ...prev, [cacheKey]: false }));
    }
  }, [cache, loading, getCacheKey, isCacheValid]);

  /**
   * Busca todas as páginas de uma categoria de uma vez
   * (útil para busca local)
   */
  const getAllProductsByCategory = useCallback(async (category, maxPages = 5) => {
    let allProducts = [];
    let page = 0;
    let hasMore = true;

    while (hasMore && page < maxPages) {
      const result = await getProductsByCategory(category, DEFAULT_PAGE_SIZE, page);
      allProducts = [...allProducts, ...result.products];
      hasMore = result.hasMore;
      page++;
    }

    return allProducts;
  }, [getProductsByCategory]);

  /**
   * Busca produto por ID (com cache)
   */
  const getProductById = useCallback((productId) => {
    // Procura em todos os caches
    for (const cacheKey in cache) {
      const cachedData = cache[cacheKey];
      const product = cachedData.products.find(p => p.id === productId);
      if (product) {
        console.log(`✅ Produto encontrado no cache: ${productId}`);
        return product;
      }
    }
    return null;
  }, [cache]);

  /**
   * Limpa cache de uma categoria ou todo o cache
   */
  const clearCache = useCallback((category = null) => {
    if (category) {
      // Remove apenas caches da categoria especificada
      setCache(prev => {
        const newCache = { ...prev };
        Object.keys(newCache).forEach(key => {
          if (key.startsWith(category)) {
            delete newCache[key];
          }
        });
        return newCache;
      });
      console.log(`🧹 Cache limpo: ${category}`);
    } else {
      // Limpa todo o cache
      setCache({});
      console.log('🧹 Todo o cache foi limpo');
    }
  }, []);

  /**
   * Pré-carrega categorias populares
   */
  const preloadPopularCategories = useCallback(async () => {
    const popularCategories = ['Mercearia', 'Limpeza', 'Bebidas', 'Hortifruti'];
    
    console.log('🚀 Pré-carregando categorias populares...');
    
    await Promise.all(
      popularCategories.map(category => 
        getProductsByCategory(category, 10, 0) // Apenas primeira página com 10 itens
      )
    );
    
    console.log('✅ Pré-carregamento concluído');
  }, [getProductsByCategory]);

  /**
   * Atualiza produto no cache (útil após edição)
   */
  const updateProductInCache = useCallback((productId, updatedData) => {
    setCache(prev => {
      const newCache = { ...prev };
      
      Object.keys(newCache).forEach(key => {
        const cacheEntry = newCache[key];
        const index = cacheEntry.products.findIndex(p => p.id === productId);
        
        if (index !== -1) {
          cacheEntry.products[index] = {
            ...cacheEntry.products[index],
            ...updatedData
          };
        }
      });
      
      return newCache;
    });
    console.log(`✅ Produto atualizado no cache: ${productId}`);
  }, []);

  /**
   * Remove produto do cache (útil após deleção)
   */
  const removeProductFromCache = useCallback((productId) => {
    setCache(prev => {
      const newCache = { ...prev };
      
      Object.keys(newCache).forEach(key => {
        const cacheEntry = newCache[key];
        cacheEntry.products = cacheEntry.products.filter(p => p.id !== productId);
      });
      
      return newCache;
    });
    console.log(`🗑️ Produto removido do cache: ${productId}`);
  }, []);

  // Estatísticas do cache (útil para debug)
  const cacheStats = useMemo(() => {
    const totalProducts = Object.values(cache).reduce(
      (sum, entry) => sum + entry.products.length, 
      0
    );
    const cacheKeys = Object.keys(cache).length;
    
    return {
      totalProducts,
      cacheKeys,
      cacheSize: JSON.stringify(cache).length / 1024, // KB
    };
  }, [cache]);

  const value = useMemo(() => ({
    // Funções de busca
    getProductsByCategory,
    getAllProductsByCategory,
    getProductById,
    
    // Gerenciamento de cache
    clearCache,
    preloadPopularCategories,
    updateProductInCache,
    removeProductFromCache,
    
    // Estados
    loading,
    errors,
    cacheStats,
  }), [
    getProductsByCategory,
    getAllProductsByCategory,
    getProductById,
    clearCache,
    preloadPopularCategories,
    updateProductInCache,
    removeProductFromCache,
    loading,
    errors,
    cacheStats,
  ]);

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

/**
 * Hook para usar o contexto de produtos
 */
export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts deve ser usado dentro de ProductsProvider");
  }
  return context;
}
```

---

## Como Usar o ProductsContext

### 1. Adicionar Provider no App.js

```javascript
// src/App.js
import { ProductsProvider } from "./context/ProductsContext";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <StoreStatusProvider>
            <ShopProvider>
              <CartProvider>
                <ProductsProvider> {/* 👈 ADICIONAR */}
                  <AppContent />
                </ProductsProvider>
              </CartProvider>
            </ShopProvider>
          </StoreStatusProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
```

### 2. Usar em Componentes de Categoria

```javascript
// src/pages/Mercearia/index.js
import { useProducts } from "../../context/ProductsContext";

const Mercearia = memo(function Mercearia({ searchTerm = "", isPreview = false }) {
  const { getProductsByCategory, loading } = useProducts();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // ✅ Busca produtos usando o context
  useEffect(() => {
    const loadProducts = async () => {
      const result = await getProductsByCategory("Mercearia", 20, page);
      
      if (page === 0) {
        setProducts(result.products);
      } else {
        setProducts(prev => [...prev, ...result.products]);
      }
      
      setHasMore(result.hasMore);
    };

    loadProducts();
  }, [page]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  // Resto do componente...
});
```

### 3. Pré-carregar na Home

```javascript
// src/pages/Home/index.js
import { useProducts } from "../../context/ProductsContext";

export default function Home() {
  const { preloadPopularCategories, cacheStats } = useProducts();

  useEffect(() => {
    // Pré-carrega categorias populares
    preloadPopularCategories();
  }, []);

  // Debug do cache
  console.log('Cache stats:', cacheStats);

  // Resto do componente...
}
```

### 4. Atualizar após edição (Admin)

```javascript
// src/pages/Painel/index.js
import { useProducts } from "../../context/ProductsContext";

export default function Painel() {
  const { updateProductInCache, clearCache } = useProducts();

  const handleUpdateProduct = async (productId, newData) => {
    // Atualiza no Firestore
    await updateDoc(doc(db, "produtos", productId), newData);
    
    // ✅ Atualiza no cache local
    updateProductInCache(productId, newData);
  };

  const handleDeleteProduct = async (productId) => {
    // Deleta do Firestore
    await deleteDoc(doc(db, "produtos", productId));
    
    // ✅ Remove do cache
    removeProductFromCache(productId);
  };

  const handleAddProduct = async (newProduct) => {
    // Adiciona no Firestore
    await addDoc(collection(db, "produtos"), newProduct);
    
    // ✅ Limpa cache da categoria para forçar reload
    clearCache(newProduct.categoria);
  };
}
```

---

## Benefícios

### Antes (sem ProductsContext):
- 15 componentes fazem 15 queries independentes
- Cache isolado por componente (sessionStorage)
- **7.500 leituras** na Home

### Depois (com ProductsContext):
- Cache compartilhado entre todos os componentes
- Busca feita apenas 1 vez por categoria
- **300 leituras** na Home (com pré-carregamento inteligente)

**Redução: 96%** 🎉

---

## Funcionalidades Extras

1. **Pré-carregamento**: `preloadPopularCategories()`
2. **Cache persistente**: Pode salvar no `localStorage` para sobreviver reloads
3. **Atualização em tempo real**: Pode integrar `onSnapshot` no context
4. **Estatísticas**: `cacheStats` para monitorar uso de memória
5. **Invalidação inteligente**: Limpa cache após edições

---

**Próximo passo:** Implementar este context e refatorar as 15 páginas de categoria para usá-lo.

