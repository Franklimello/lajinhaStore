import React, { memo } from 'react';
import CardProduto from '../CardProduto';
import SkeletonCard from '../Common/SkeletonCard';

/**
 * SearchResults - Resultados da busca otimizados
 * Com animações suaves e mensagens amigáveis
 */
const SearchResults = memo(({ 
  filteredProducts, 
  loading
}) => {
  if (loading) {
    return (
      <div className="container mx-auto px-4 pb-12">
        <SkeletonCard variant="product" count={10} />
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 pb-12">
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="text-6xl text-gray-300 mb-6 animate-bounce">🔍</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-500 mb-6">
              Tente outro nome ou limpe a busca para ver todos os produtos.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 text-sm">
                💡 <strong>Dica:</strong> Use palavras-chave como "leite", "pão" ou "detergente"
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-12">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700">
          {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
        </h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-4 lg:gap-6">
        {filteredProducts.slice(0, 48).map((produto, index) => (
          <div 
            key={produto.id} 
            className="produto-card opacity-0 translate-y-4 animate-[fadeInUp_0.5s_ease-out_forwards] hover:scale-105 transition-transform duration-300" 
            style={{ 
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'forwards'
            }}
          >
            <CardProduto
              fotosUrl={produto.fotosUrl}
              titulo={produto.titulo}
              descricao={produto.descricao}
              preco={produto.preco}
              id={produto.id}
            />
          </div>
        ))}
      </div>
      
      {filteredProducts.length > 48 && (
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Mostrando os primeiros 48 resultados de {filteredProducts.length} encontrados
          </p>
        </div>
      )}
    </div>
  );
});

SearchResults.displayName = 'SearchResults';

export default SearchResults;