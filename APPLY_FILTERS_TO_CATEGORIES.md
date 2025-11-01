# Script para Aplicar Filtros em Todas as Categorias

Este documento lista as mudanças necessárias para aplicar filtros em cada página de categoria.

## Estrutura Comum para Todas as Páginas

### 1. Adicionar Imports
```jsx
import FilterBar from "../../components/FilterBar";
import { useProductFilters } from "../../hooks/useProductFilters";
```

### 2. Adicionar Hook após `normalize`
```jsx
// Hook de filtros e ordenação
const {
  sortBy,
  priceRange,
  showOnlyInStock,
  showOnlyDiscounted,
  setSortBy,
  setPriceRange,
  setShowOnlyInStock,
  setShowOnlyDiscounted,
  clearFilters,
  filteredAndSortedProducts: filteredProducts
} = useProductFilters(allProducts, normalize);
```

### 3. Atualizar useEffect de processamento
```jsx
useEffect(() => {
  // Processar produtos para exibição (carrosséis)
  // Usar produtos filtrados e ordenados do hook
  const term = isPreview ? searchTerm.trim().toLowerCase() : localSearchTerm.trim().toLowerCase();
  let source = term
    ? filteredProducts.filter(p => (p.titulo || "").toLowerCase().includes(term))
    : filteredProducts;

  // Limitar a 10 produtos apenas quando for preview na home
  const productsToShow = isPreview ? source.slice(0, 10) : source;
  
  const chunkSize = 5;
  const grouped = [];
  for (let i = 0; i < productsToShow.length; i += chunkSize) {
    grouped.push(productsToShow.slice(i, i + chunkSize));
  }
  setCarousels(grouped);
}, [filteredProducts, searchTerm, isPreview, localSearchTerm]);
```

### 4. Adicionar FilterBar no return (antes da SearchBar)
```jsx
{/* Filtros e Ordenação - apenas quando não for preview */}
{!isPreview && (
  <FilterBar
    sortBy={sortBy}
    setSortBy={setSortBy}
    priceRange={priceRange}
    setPriceRange={setPriceRange}
    showOnlyInStock={showOnlyInStock}
    setShowOnlyInStock={setShowOnlyInStock}
    showOnlyDiscounted={showOnlyDiscounted}
    setShowOnlyDiscounted={setShowOnlyDiscounted}
    themeColor="[COR_DO_TEMA]"
  />
)}
```

## Cores de Tema por Categoria

- **Mercearia**: `blue` ✅ (já aplicado)
- **Limpeza**: `green`
- **Frios e Laticínios**: `blue`
- **Guloseimas e Snacks**: `purple`
- **Bebidas**: `blue`
- **Bebidas Geladas**: `blue`
- **Higiene Pessoal**: `green`
- **Cosméticos**: `purple`
- **Utilidades Domésticas**: `blue`
- **Infantil**: `purple`
- **Hortifruti**: `green`
- **Açougue**: `red`
- **Cesta Básica**: `blue`
- **Salgados do Joazinho**: `amber`
- **Farmácia**: `green`

## Status

- ✅ **Mercearia** - Completo
- ⏳ **PetShop** - Já tem implementação própria (manter ou migrar)

