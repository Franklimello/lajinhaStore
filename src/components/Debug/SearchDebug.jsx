import React from 'react';

/**
 * SearchDebug - Componente para debug da busca
 * Mostra informações sobre a busca para facilitar o desenvolvimento
 */
const SearchDebug = ({ searchTerm, products, loading }) => {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <h3 className="font-bold mb-2">🔍 Debug da Busca</h3>
      <div className="space-y-1">
        <div><strong>Termo:</strong> "{searchTerm}"</div>
        <div><strong>Produtos encontrados:</strong> {products?.length || 0}</div>
        <div><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</div>
        {products?.length > 0 && (
          <div className="mt-2">
            <strong>Primeiros resultados:</strong>
            <ul className="text-xs mt-1">
              {products.slice(0, 3).map((product, index) => (
                <li key={index} className="truncate">
                  {product.titulo}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDebug;










