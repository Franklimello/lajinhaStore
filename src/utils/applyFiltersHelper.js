/**
 * Helper para aplicar filtros em páginas de categoria
 * 
 * PASSO 1: Adicionar imports
 * ```jsx
 * import FilterBar from "../../components/FilterBar";
 * import { useProductFilters } from "../../hooks/useProductFilters";
 * ```
 * 
 * PASSO 2: Adicionar hook após normalize
 * ```jsx
 * const {
 *   sortBy, priceRange, showOnlyInStock, showOnlyDiscounted,
 *   setSortBy, setPriceRange, setShowOnlyInStock, setShowOnlyDiscounted,
 *   filteredAndSortedProducts: filteredProducts
 * } = useProductFilters(allProducts, normalize);
 * ```
 * 
 * PASSO 3: Atualizar useEffect de processamento
 * ```jsx
 * useEffect(() => {
 *   const term = isPreview ? searchTerm.trim().toLowerCase() : localSearchTerm.trim().toLowerCase();
 *   let source = term
 *     ? filteredProducts.filter(p => (p.titulo || "").toLowerCase().includes(term))
 *     : filteredProducts;
 *   // ... resto do código
 * }, [filteredProducts, searchTerm, isPreview, localSearchTerm]);
 * ```
 * 
 * PASSO 4: Adicionar FilterBar no return (antes da SearchBar)
 * ```jsx
 * {!isPreview && (
 *   <FilterBar
 *     sortBy={sortBy} setSortBy={setSortBy}
 *     priceRange={priceRange} setPriceRange={setPriceRange}
 *     showOnlyInStock={showOnlyInStock} setShowOnlyInStock={setShowOnlyInStock}
 *     showOnlyDiscounted={showOnlyDiscounted} setShowOnlyDiscounted={setShowOnlyDiscounted}
 *     themeColor="[COR]"
 *   />
 * )}
 * ```
 */

export const CATEGORY_THEMES = {
  'Mercearia': 'blue',
  'Limpeza': 'green',
  'FriosLaticinios': 'blue',
  'GulosemasSnacks': 'purple',
  'Bebidas': 'blue',
  'BebidasGeladas': 'blue',
  'HigienePessoal': 'green',
  'Cosmeticos': 'purple',
  'UtilidadesDomesticas': 'blue',
  'Infantil': 'purple',
  'Hortifruti': 'green',
  'Acougue': 'red',
  'CestaBasica': 'blue',
  'SalgadosDoJoazinho': 'amber',
  'farmacia': 'green',
  'PetShop': 'amber'
};

