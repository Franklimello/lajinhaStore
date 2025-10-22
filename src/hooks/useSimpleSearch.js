import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Hook simples e eficiente para busca de produtos
 * Carrega todos os produtos uma vez e faz busca local
 */
export const useSimpleSearch = (searchTerm = '', category = '') => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Carrega todos os produtos uma única vez
  const loadAllProducts = useCallback(async () => {
    if (hasLoaded) return; // Evita recarregar se já carregou

    try {
      setLoading(true);
      setError(null);

      // Verifica cache primeiro
      const cached = sessionStorage.getItem('all_products');
      if (cached) {
        const { products, timestamp } = JSON.parse(cached);
        // Cache válido por 10 minutos
        if (Date.now() - timestamp < 10 * 60 * 1000) {
          setAllProducts(products);
          setHasLoaded(true);
          setLoading(false);
          return;
        }
      }

      // Busca todos os produtos do Firestore
      const q = query(
        collection(db, 'produtos'),
        orderBy('titulo')
      );

      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        titulo: doc.data().titulo,
        preco: doc.data().preco,
        fotosUrl: doc.data().fotosUrl,
        categoria: doc.data().categoria,
        descricao: doc.data().descricao,
      }));

      setAllProducts(products);
      setHasLoaded(true);

      // Salva no cache
      sessionStorage.setItem('all_products', JSON.stringify({
        products,
        timestamp: Date.now()
      }));

    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [hasLoaded]);

  // Carrega produtos na inicialização
  useEffect(() => {
    loadAllProducts();
  }, [loadAllProducts]);

  // Filtra produtos com busca inteligente
  const filteredProducts = useMemo(() => {
    if (!hasLoaded) return [];

    let filtered = allProducts;

    // Filtro por categoria
    if (category.trim()) {
      filtered = filtered.filter(product => 
        product.categoria?.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Filtro por termo de busca
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      
      filtered = filtered.filter(product => {
        const titulo = product.titulo?.toLowerCase() || '';
        const descricao = product.descricao?.toLowerCase() || '';
        const categoria = product.categoria?.toLowerCase() || '';
        
        // Busca em título, descrição e categoria
        return titulo.includes(searchLower) || 
               descricao.includes(searchLower) || 
               categoria.includes(searchLower);
      });
    }

    return filtered;
  }, [allProducts, searchTerm, category, hasLoaded]);

  // Função para recarregar produtos
  const refetch = useCallback(() => {
    setHasLoaded(false);
    setAllProducts([]);
    sessionStorage.removeItem('all_products');
    loadAllProducts();
  }, [loadAllProducts]);

  return {
    products: filteredProducts,
    loading,
    error,
    hasLoaded,
    refetch,
    totalProducts: allProducts.length
  };
};










