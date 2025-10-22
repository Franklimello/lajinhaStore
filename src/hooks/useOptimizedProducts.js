import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Hook otimizado para buscar produtos com paginação e cache
 * Implementa cache local e busca apenas campos necessários
 */
export const useOptimizedProducts = (searchTerm = '', category = '', pageSize = 20) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [error, setError] = useState(null);

  // Cache key baseado nos parâmetros
  const cacheKey = useMemo(() => 
    `products_${searchTerm}_${category}_${pageSize}`, 
    [searchTerm, category, pageSize]
  );

  // Função para buscar produtos do Firestore
  const fetchProducts = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      // Verifica cache primeiro (apenas se não há termo de busca)
      if (!searchTerm.trim()) {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached && !isLoadMore) {
          const { products: cachedProducts, timestamp } = JSON.parse(cached);
          // Cache válido por 5 minutos
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            setProducts(cachedProducts);
            setLoading(false);
            return;
          }
        }
      }

      // Query otimizada - busca todos os produtos (para busca local)
      let q = query(
        collection(db, 'produtos'),
        orderBy('titulo'),
        limit(100) // Aumenta limite para busca mais abrangente
      );

      // Filtro por categoria se especificado
      if (category.trim() && !searchTerm.trim()) {
        q = query(
          collection(db, 'produtos'),
          where('categoria', '==', category),
          orderBy('titulo'),
          limit(100)
        );
      }

      // Paginação
      if (isLoadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const newProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        titulo: doc.data().titulo,
        preco: doc.data().preco,
        fotosUrl: doc.data().fotosUrl,
        categoria: doc.data().categoria,
        descricao: doc.data().descricao,
        // Apenas campos essenciais para performance
      }));

      if (isLoadMore) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
        // Salva no cache apenas se não há busca
        if (!searchTerm.trim()) {
          sessionStorage.setItem(cacheKey, JSON.stringify({
            products: newProducts,
            timestamp: Date.now()
          }));
        }
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 100);

    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, category, pageSize, lastDoc, cacheKey]);

  // Carrega produtos iniciais
  useEffect(() => {
    fetchProducts(false);
  }, [searchTerm, category]);

  // Função para carregar mais produtos
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchProducts(true);
    }
  }, [loading, hasMore, fetchProducts]);

  // Filtra produtos localmente com busca mais inteligente
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    return products.filter(product => {
      const titulo = product.titulo?.toLowerCase() || '';
      const descricao = product.descricao?.toLowerCase() || '';
      const categoria = product.categoria?.toLowerCase() || '';
      
      // Busca em título, descrição e categoria
      return titulo.includes(searchLower) || 
             descricao.includes(searchLower) || 
             categoria.includes(searchLower);
    });
  }, [products, searchTerm]);

  return {
    products: filteredProducts,
    loading,
    hasMore,
    error,
    loadMore,
    refetch: () => fetchProducts(false)
  };
};
