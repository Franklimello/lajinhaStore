# Status de Aplicação de Filtros nas Categorias

## ✅ Completo
- **Mercearia** - Filtros aplicados (tema: blue)
- **Limpeza** - Filtros aplicados (tema: green)
- **PetShop** - Filtros implementados (tema: amber)

## 🔄 Em Progresso
- **Bebidas** - Imports adicionados, falta hook e FilterBar

## ⏳ Pendente
- FriosLaticinios
- GulosemasSnacks
- BebidasGeladas
- HigienePessoal
- Cosmeticos
- UtilidadesDomesticas
- Infantil
- Hortifruti
- Acougue
- CestaBasica
- SalgadosDoJoazinho
- farmacia

## 📋 Padrão de Aplicação

Todas as páginas seguem o mesmo padrão:

1. **Imports:**
```jsx
import FilterBar from "../../components/FilterBar";
import { useProductFilters } from "../../hooks/useProductFilters";
```

2. **Hook após normalize:**
```jsx
const {
  sortBy, priceRange, showOnlyInStock, showOnlyDiscounted,
  setSortBy, setPriceRange, setShowOnlyInStock, setShowOnlyDiscounted,
  filteredAndSortedProducts: filteredProducts
} = useProductFilters(allProducts, normalize);
```

3. **Atualizar useEffect:**
```jsx
useEffect(() => {
  const term = isPreview ? searchTerm.trim().toLowerCase() : localSearchTerm.trim().toLowerCase();
  let source = term
    ? filteredProducts.filter(p => (p.titulo || "").toLowerCase().includes(term))
    : filteredProducts;
  // ... resto igual
}, [filteredProducts, searchTerm, isPreview, localSearchTerm]);
```

4. **FilterBar no return (antes da SearchBar):**
```jsx
{!isPreview && (
  <FilterBar
    sortBy={sortBy} setSortBy={setSortBy}
    priceRange={priceRange} setPriceRange={setPriceRange}
    showOnlyInStock={showOnlyInStock} setShowOnlyInStock={setShowOnlyInStock}
    showOnlyDiscounted={showOnlyDiscounted} setShowOnlyDiscounted={setShowOnlyDiscounted}
    themeColor="[COR]"
  />
)}
```

## 🎨 Cores por Categoria
- Mercearia: `blue` ✅
- Limpeza: `green` ✅
- PetShop: `amber` ✅
- Bebidas: `blue`
- FriosLaticinios: `blue`
- GulosemasSnacks: `purple`
- BebidasGeladas: `blue`
- HigienePessoal: `green`
- Cosmeticos: `purple`
- UtilidadesDomesticas: `blue`
- Infantil: `purple`
- Hortifruti: `green`
- Acougue: `red`
- CestaBasica: `blue`
- SalgadosDoJoazinho: `amber`
- farmacia: `green`

