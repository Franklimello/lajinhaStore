import { useState, useCallback, useMemo } from 'react';

/**
 * Hook personalizado para gerenciar filtros e ordenação de produtos
 * @param {Array} products - Array de produtos
 * @param {Function} normalize - Função para normalizar texto
 * @returns {Object} - Estados e funções de filtros/ordenação
 */
export function useProductFilters(products = [], normalize) {
  const [sortBy, setSortBy] = useState("titulo");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyDiscounted, setShowOnlyDiscounted] = useState(false);

  // Função para ordenar produtos
  const sortProducts = useCallback((productsList) => {
    const sorted = [...productsList];
    
    switch (sortBy) {
      case 'preco-asc':
        return sorted.sort((a, b) => {
          const priceA = parseFloat(a.preco || a.price || 0);
          const priceB = parseFloat(b.preco || b.price || 0);
          return priceA - priceB;
        });
      case 'preco-desc':
        return sorted.sort((a, b) => {
          const priceA = parseFloat(a.preco || a.price || 0);
          const priceB = parseFloat(b.preco || b.price || 0);
          return priceB - priceA;
        });
      case 'desconto':
        return sorted.sort((a, b) => {
          const discountA = parseFloat(a.desconto || 0);
          const discountB = parseFloat(b.desconto || 0);
          return discountB - discountA;
        });
      case 'titulo':
      default:
        if (normalize) {
          return sorted.sort((a, b) => {
            const titleA = normalize((a.titulo || a.nome || "").toLowerCase());
            const titleB = normalize((b.titulo || b.nome || "").toLowerCase());
            return titleA.localeCompare(titleB, 'pt-BR');
          });
        }
        return sorted.sort((a, b) => {
          const titleA = (a.titulo || a.nome || "").toLowerCase();
          const titleB = (b.titulo || b.nome || "").toLowerCase();
          return titleA.localeCompare(titleB, 'pt-BR');
        });
    }
  }, [sortBy, normalize]);

  // Função para filtrar produtos
  const filterProducts = useCallback((productsList) => {
    let filtered = [...productsList];
    
    // Filtro de estoque
    if (showOnlyInStock) {
      filtered = filtered.filter(p => !p.esgotado);
    }
    
    // Filtro de desconto
    if (showOnlyDiscounted) {
      filtered = filtered.filter(p => p.desconto && parseFloat(p.desconto) > 0);
    }
    
    // Filtro de preço
    filtered = filtered.filter(p => {
      const price = parseFloat(p.preco || p.price || 0);
      return price >= priceRange.min && price <= priceRange.max;
    });
    
    return filtered;
  }, [showOnlyInStock, showOnlyDiscounted, priceRange]);

  // Aplicar filtros e ordenação
  const filteredAndSortedProducts = useMemo(() => {
    let result = filterProducts(products);
    result = sortProducts(result);
    return result;
  }, [products, filterProducts, sortProducts]);

  // Limpar todos os filtros
  const clearFilters = useCallback(() => {
    setPriceRange({ min: 0, max: 1000 });
    setShowOnlyInStock(false);
    setShowOnlyDiscounted(false);
  }, []);

  return {
    // Estados
    sortBy,
    priceRange,
    showOnlyInStock,
    showOnlyDiscounted,
    
    // Setters
    setSortBy,
    setPriceRange,
    setShowOnlyInStock,
    setShowOnlyDiscounted,
    
    // Funções
    clearFilters,
    
    // Produtos filtrados e ordenados
    filteredAndSortedProducts
  };
}

