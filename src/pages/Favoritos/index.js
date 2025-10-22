import React, { useContext, useState } from "react";
import { ShopContext } from "../../context/ShopContext";
import { CartContext } from "../../context/CartContext";
import { FaHeart, FaShoppingCart, FaArrowLeft, FaTrash, FaCheck } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

export default function Favoritos() {
  const { favorites, toggleFavorite } = useContext(ShopContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [addedItems, setAddedItems] = useState(new Set());

  // Como os favoritos agora já contêm os produtos completos, não precisamos mais buscar
  const favoriteProducts = favorites || [];

  const handleAddToCart = (product) => {
    try {
      // Chama a função do contexto se existir
      if (addToCart && typeof addToCart === 'function') {
        addToCart(product);
      } else {
        // Implementação manual se a função do contexto não estiver disponível
        addToCartManually(product);
      }
      
      // Feedback visual
      setAddedItems(prev => new Set(prev).add(product.id));
      
      // Remove o feedback após 2 segundos
      setTimeout(() => {
        setAddedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(product.id);
          return newSet;
        });
      }, 2000);

      // Opcional: mostrar notificação ou navegar
      // navigate('/carrinho');
      
    } catch (error) {
      console.error('Erro ao adicionar produto ao carrinho:', error);
    }
  };

  // Função manual para adicionar ao carrinho (caso a do contexto não funcione)
  const addToCartManually = (product) => {
    try {
      // Buscar carrinho atual do localStorage
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Verificar se o produto já existe no carrinho
      const existingProductIndex = currentCart.findIndex(item => item.id === product.id);
      
      let updatedCart;
      if (existingProductIndex !== -1) {
        // Se já existe, aumenta a quantidade
        updatedCart = currentCart.map((item, index) => 
          index === existingProductIndex 
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      } else {
        // Se não existe, adiciona novo produto
        const productToAdd = {
          id: product.id,
          titulo: product.titulo,
          preco: product.preco || product.price,
          fotosUrl: product.fotosUrl,
          quantity: 1
        };
        updatedCart = [...currentCart, productToAdd];
      }
      
      // Salvar no localStorage
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Disparar evento para atualizar o header
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      console.log('Produto adicionado ao carrinho:', product.titulo);
      
    } catch (error) {
      console.error('Erro ao adicionar produto manualmente ao carrinho:', error);
    }
  };

  const handleRemoveFavorite = (product) => {
    toggleFavorite(product);
    // Disparar evento para atualizar o header
    window.dispatchEvent(new CustomEvent('favoritesUpdated'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header com navegação */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors duration-200"
          >
            <FaArrowLeft />
            <span className="font-medium">Voltar</span>
          </button>
          
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaHeart className="text-red-500" />
            Favoritos ({favorites.length})
          </h1>
          
          <div className="w-20"></div> {/* Espaçador para centralizar o título */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {favorites.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-6">💖</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Nenhum favorito ainda</h2>
              <p className="text-gray-500 text-lg mb-8">
                Explore nossos produtos e adicione seus favoritos aqui!
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-red-600 transform hover:scale-[1.02] transition-all duration-200"
              >
                Descobrir Produtos
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Cabeçalho da seção */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <FaHeart className="text-red-500" />
                    Meus Favoritos
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {favorites.length} {favorites.length === 1 ? 'produto' : 'produtos'} na sua lista de desejos
                  </p>
                </div>
                
                {favorites.length > 0 && (
                  <div className="flex gap-3">
                    <Link
                      to="/carrinho"
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium flex items-center gap-2"
                    >
                      <FaShoppingCart />
                      Ver Carrinho
                    </Link>
                    <Link
                      to="/"
                      className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                    >
                      Continuar Comprando
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Grid de produtos favoritos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group">
                  {/* Imagem do produto */}
                  <div className="relative">
                    <Link to={`/detalhes/${product.id}`}>
                      <img 
                        src={product.fotosUrl?.[0] || '/placeholder-image.jpg'} 
                        alt={product.titulo} 
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    
                    {/* Botão de remover favorito */}
                    <button
                      onClick={() => handleRemoveFavorite(product)}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
                      title="Remover dos favoritos"
                    >
                      <FaHeart className="text-lg" />
                    </button>
                    
                    {/* Badge de favorito */}
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Favorito
                    </div>

                    {/* Indicador de adicionado ao carrinho */}
                    {addedItems.has(product.id) && (
                      <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center">
                        <div className="bg-white rounded-full p-3">
                          <FaCheck className="text-green-500 text-2xl" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Conteúdo do card */}
                  <div className="p-4">
                    <Link to={`/detalhes/${product.id}`} className="block mb-4">
                      <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 hover:text-blue-600 transition-colors duration-200">
                        {product.titulo}
                      </h3>
                      <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        R$ {parseFloat(product.preco || product.price || 0).toFixed(2)}
                      </p>
                    </Link>
                    
                    {/* Botões de ação */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={addedItems.has(product.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transform active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl ${
                          addedItems.has(product.id)
                            ? 'bg-green-500 text-white cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02]'
                        }`}
                      >
                        {addedItems.has(product.id) ? (
                          <>
                            <FaCheck className="text-sm" />
                            Adicionado!
                          </>
                        ) : (
                          <>
                            <FaShoppingCart className="text-sm" />
                            Adicionar
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleRemoveFavorite(product)}
                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 hover:scale-110 transition-all duration-200"
                        title="Remover dos favoritos"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Botões adicionais */}
            <div className="flex justify-center gap-4 mt-12">
              <Link
                to="/carrinho"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FaShoppingCart />
                Ver Carrinho
              </Link>
              
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-red-600 hover:to-pink-600 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Descobrir Mais Produtos
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}