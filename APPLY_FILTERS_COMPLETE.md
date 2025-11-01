# Script de Aplicação de Filtros - Finalização

Para finalizar a aplicação de filtros em todas as páginas, é necessário:

1. Atualizar os useEffects que processam produtos:
   - Trocar `allProducts` por `filteredProducts`
   - Trocar dependências `[allProducts, ...]` por `[filteredProducts, ...]`

2. Adicionar FilterBar no return (antes da SearchBar):
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

## Temas por Categoria:
- GulosemasSnacks: purple
- BebidasGeladas: blue
- HigienePessoal: green
- Cosmeticos: purple
- UtilidadesDomesticas: blue
- Infantil: purple
- Hortifruti: green
- Acougue: red
- CestaBasica: blue
- SalgadosDoJoazinho: amber
- farmacia: green

