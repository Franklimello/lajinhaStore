import React, { createContext, useContext, useState, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from '../firebase/config';
import firestoreMonitor from '../services/firestoreMonitor';
import indexedDBCache from '../services/indexedDBCache';

const ProductsContext = createContext();

// ⏱️ TTL do cache: 5 minutos
const CACHE_TTL = 5 * 60 * 1000;

export const ProductsProvider = ({ children }) => {
  // 📦 Cache de produtos por categoria
  const [productsCache, setProductsCache] = useState({});
  
  // 📊 Metadados de paginação por categoria
  const [paginationMeta, setPaginationMeta] = useState({});

  /**
   * 🔍 Buscar produtos de uma categoria (com cache)
   * @param {string} categoria - Nome da categoria
   * @param {number} pageSize - Quantidade de produtos por página
   * @param {object} lastDoc - Último documento (para paginação)
   * @param {boolean} forceRefresh - Forçar busca no Firestore
   */
  const fetchProducts = useCallback(async (categoria, pageSize = 20, lastDoc = null, forceRefresh = false) => {
    const cacheKey = `${categoria}_${lastDoc ? 'page' : 'initial'}`;
    const now = Date.now();

    // ✅ 1. Verificar cache em memória (apenas para primeira página)
    if (!forceRefresh && !lastDoc && productsCache[cacheKey]) {
      const cached = productsCache[cacheKey];
      if (now - cached.timestamp < CACHE_TTL) {
        console.log(`✅ [ProductsContext] Cache hit (memória): ${categoria}`);
        return {
          products: cached.products,
          lastDoc: cached.lastDoc,
          hasMore: cached.hasMore,
          fromCache: true
        };
      }
    }

    // ✅ 2. Verificar IndexedDB (persistente)
    if (!forceRefresh && !lastDoc) {
      try {
        const cachedData = await indexedDBCache.get('products', cacheKey);
        if (cachedData) {
          console.log(`✅ [ProductsContext] Cache hit (IndexedDB): ${categoria}`);
          
          // Atualizar cache em memória
          setProductsCache(prev => ({
            ...prev,
            [cacheKey]: {
              products: cachedData,
              lastDoc: null,
              hasMore: true,
              timestamp: now
            }
          }));
          
          return {
            products: cachedData,
            lastDoc: null,
            hasMore: true,
            fromCache: true
          };
        }
      } catch (error) {
        console.warn('⚠️ [ProductsContext] Erro ao ler do IndexedDB:', error);
      }
    }

    try {
      console.log(`🔍 [ProductsContext] Buscando ${categoria} do Firestore...`);

      // 🔥 Query no Firestore
      let q = query(
        collection(db, "produtos"),
        where("categoria", "in", [categoria]),
        orderBy("titulo"),
        limit(pageSize)
      );

      // 📄 Paginação
      if (lastDoc) {
        q = query(
          collection(db, "produtos"),
          where("categoria", "in", [categoria]),
          orderBy("titulo"),
          startAfter(lastDoc),
          limit(pageSize)
        );
      }

      const snapshot = await getDocs(q);
      
      // 📊 Monitorar leitura
      firestoreMonitor.trackRead('produtos', snapshot.size, {
        categoria,
        isPagination: !!lastDoc,
        pageSize
      });
      
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const newLastDoc = snapshot.docs[snapshot.docs.length - 1];
      const hasMore = snapshot.docs.length === pageSize;

      // 💾 Salvar no cache (apenas primeira página)
      if (!lastDoc) {
        // 1. Cache em memória
        setProductsCache(prev => ({
          ...prev,
          [cacheKey]: {
            products,
            lastDoc: newLastDoc,
            hasMore,
            timestamp: now
          }
        }));

        // 2. IndexedDB (persistente)
        try {
          await indexedDBCache.set('products', cacheKey, products, CACHE_TTL);
        } catch (e) {
          console.warn('⚠️ Erro ao salvar no IndexedDB:', e);
        }

        // 3. Backup no sessionStorage
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({
            products,
            hasMore,
            timestamp: now
          }));
        } catch (e) {
          console.warn('SessionStorage cheio:', e);
        }
      }

      // 📊 Atualizar metadados de paginação
      setPaginationMeta(prev => ({
        ...prev,
        [categoria]: {
          lastDoc: newLastDoc,
          hasMore
        }
      }));

      console.log(`✅ [ProductsContext] ${categoria}: ${products.length} produtos carregados`);

      return {
        products,
        lastDoc: newLastDoc,
        hasMore,
        fromCache: false
      };

    } catch (error) {
      console.error(`❌ [ProductsContext] Erro ao buscar ${categoria}:`, error);
      throw error;
    }
  }, [productsCache]);

  /**
   * 🔎 Buscar produtos por termo de busca
   */
  const searchProducts = useCallback(async (categoria, searchTerm) => {
    try {
      console.log(`🔍 [ProductsContext] Buscando "${searchTerm}" em ${categoria}...`);

      const q = query(
        collection(db, "produtos"),
        where("categoria", "in", [categoria]),
        orderBy("titulo"),
        limit(100) // Limite maior para busca
      );

      const snapshot = await getDocs(q);
      
      // 📊 Monitorar leitura de busca
      firestoreMonitor.trackRead('produtos', snapshot.size, {
        categoria,
        searchTerm,
        isSearch: true
      });
      
      const allProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 🔎 Filtrar localmente
      const searchLower = searchTerm.toLowerCase();
      const filtered = allProducts.filter(product =>
        product.titulo?.toLowerCase().includes(searchLower) ||
        product.descricao?.toLowerCase().includes(searchLower)
      );

      console.log(`✅ [ProductsContext] Busca: ${filtered.length} produtos encontrados`);

      return filtered;

    } catch (error) {
      console.error(`❌ [ProductsContext] Erro na busca:`, error);
      throw error;
    }
  }, []);

  /**
   * 🗑️ Limpar cache de uma categoria ou tudo
   */
  const clearCache = useCallback(async (categoria = null) => {
    if (categoria) {
      // Limpar memória
      setProductsCache(prev => {
        const newCache = { ...prev };
        Object.keys(newCache).forEach(key => {
          if (key.startsWith(categoria)) {
            delete newCache[key];
          }
        });
        return newCache;
      });
      
      // Limpar sessionStorage
      sessionStorage.removeItem(`${categoria}_initial`);
      
      // Limpar IndexedDB
      try {
        await indexedDBCache.delete('products', `${categoria}_initial`);
      } catch (e) {
        console.warn('⚠️ Erro ao limpar IndexedDB:', e);
      }
      
      console.log(`🗑️ [ProductsContext] Cache limpo: ${categoria}`);
    } else {
      // Limpar tudo
      setProductsCache({});
      setPaginationMeta({});
      sessionStorage.clear();
      
      // Limpar IndexedDB
      try {
        await indexedDBCache.clear('products');
      } catch (e) {
        console.warn('⚠️ Erro ao limpar IndexedDB:', e);
      }
      
      console.log(`🗑️ [ProductsContext] Todo cache limpo`);
    }
  }, []);

  /**
   * 🔄 Obter metadados de paginação
   */
  const getPaginationMeta = useCallback((categoria) => {
    return paginationMeta[categoria] || { lastDoc: null, hasMore: true };
  }, [paginationMeta]);

  const value = {
    fetchProducts,
    searchProducts,
    clearCache,
    getPaginationMeta,
    productsCache
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

// 🎣 Hook personalizado
export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts deve ser usado dentro de ProductsProvider');
  }
  return context;
};

export default ProductsContext;

