import React, { useContext, useState, useCallback } from "react";
import { CartContext } from "../../context/CartContext";
import { FaTrash, FaShoppingCart, FaArrowLeft, FaPlus, FaMinus } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Login from "../Login";
import Register from "../Register";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useContext(CartContext);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState('pix'); // 'pix' ou 'dinheiro'
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Calcula o valor total do carrinho
  const total = cart.reduce((acc, item) => {
    const preco = parseFloat(item.preco) || 0;
    const quantidade = item.qty || 1;
    return acc + (preco * quantidade);
  }, 0);

  const entrega = 5;
  const totalComEntrega = total + entrega;

  const handleQuantityChange = useCallback((itemId, newQty, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (newQty <= 0) {
      removeFromCart(itemId);
    } else if (updateQuantity) {
      updateQuantity(itemId, newQty);
    }
  }, [removeFromCart, updateQuantity]);

  // Função para lidar com o checkout
  const handleCheckout = (e) => {
    e.preventDefault();
    
    // Se usuário não está logado, abre o modal
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    // Se está logado, salva método de pagamento e navega
    localStorage.setItem('selectedPaymentMethod', paymentMethod);
    navigate('/pagamento-pix');
  };

  // Função chamada após login bem-sucedido
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Após login, automaticamente navega para pagamento
    localStorage.setItem('selectedPaymentMethod', paymentMethod);
    navigate('/pagamento-pix');
  };

  // Função chamada após registro bem-sucedido
  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    // Após registro, automaticamente navega para pagamento
    localStorage.setItem('selectedPaymentMethod', paymentMethod);
    navigate('/pagamento-pix');
  };


  return (
    <div className="min-h-screen mt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header com navegação */}
      <div className="bg-white shadow-sm border-b sticky top-0 ">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <FaArrowLeft />
            <span className="font-medium">Voltar</span>
          </button>
          
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaShoppingCart className="text-blue-600" />
            Carrinho ({cart.length})
          </h1>
          
          <div className="w-20"></div>
        </div>
      </div>
      <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-center">
          <p className="font-bold flex items-center justify-center gap-2">
            <span>🕐</span> Horário de Funcionamento
          </p>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Segunda a Sábado:</span>
            <span className="text-blue-600 font-bold text-lg">08:00 - 19:00</span>
          </div>
          <div className="border-t border-gray-200"></div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Domingo:</span>
            <span className="text-purple-600 font-bold text-lg">08:00 - 11:00</span>
          </div>
        </div>
      </div>


      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-6">🛒</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Seu carrinho está vazio</h2>
              <p className="text-gray-500 text-lg mb-8">
                Adicione produtos para começar suas compras!
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transform hover:scale-[1.02] transition-all duration-200"
              >
                Continuar Comprando
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Lista de produtos */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <FaShoppingCart className="text-blue-600" />
                  Itens no Carrinho
                </h2>
              </div>
              
              <div className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <div key={item.id} className="p-2 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center gap-1">
                      <div className="flex-shrink-0">
                        <img 
                          src={item.fotosUrl?.[0] || '/placeholder-image.jpg'} 
                          alt={item.titulo} 
                          className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                        />
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <h3 className="text-sm font-semibold text-gray-800 truncate">
                          {item.titulo}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Preço unitário: R$ {parseFloat(item.preco || 0).toFixed(2)}
                        </p>
                        {item.meatCut && (
                          <p className="text-xs text-red-600 font-semibold mt-1 bg-red-50 inline-block px-2 py-1 rounded">
                            🥩 Corte: {item.meatCut}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-sm text-gray-600">Qtd:</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => handleQuantityChange(item.id, (item.qty || 1) - 1, e)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200 active:scale-95"
                              aria-label="Diminuir quantidade"
                            >
                              <FaMinus className="text-xs text-gray-600 pointer-events-none" />
                            </button>
                            
                            <span className="w-12 text-center font-semibold text-gray-800">
                              {item.qty || 1}
                            </span>
                            
                            <button
                              type="button"
                              onClick={(e) => handleQuantityChange(item.id, (item.qty || 1) + 1, e)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200 active:scale-95"
                              aria-label="Aumentar quantidade"
                            >
                              <FaPlus className="text-xs text-gray-600 pointer-events-none" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <span className="text-xl font-bold text-blue-600">
                          R$ {(parseFloat(item.preco || 0) * (item.qty || 1)).toFixed(2)}
                        </span>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeFromCart(item.id);
                          }}
                          className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                          title="Remover item"
                          aria-label="Remover item do carrinho"
                        >
                          <FaTrash className="pointer-events-none" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo do pedido */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Resumo do Pedido</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'itens'}):</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Entrega:</span>
                  <span className="text-green-600 font-semibold">R$ 5,00</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-800">Total:</span>
                    <span className="text-3xl font-bold text-blue-600">R$ {totalComEntrega.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Informações de pagamento */}
              <div className={`mb-6 p-4 rounded-xl ${
                paymentMethod === 'pix' 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                <h4 className={`font-bold mb-3 flex items-center gap-2 ${
                  paymentMethod === 'pix' ? 'text-blue-800' : 'text-green-800'
                }`}>
                  {paymentMethod === 'pix' ? '💳 Pagamento PIX' : '💵 Pagamento em Dinheiro'}
                </h4>
                <p className={`text-sm ${
                  paymentMethod === 'pix' ? 'text-blue-700' : 'text-green-700'
                }`}>
                  {paymentMethod === 'pix' 
                    ? 'Pagamento instantâneo via QR Code. Após finalizar, você receberá um QR code para pagamento.'
                    : 'Pagamento será feito em dinheiro na entrega. Tenha o valor exato para facilitar o processo.'
                  }
                </p>
              </div>
              
              {/* Seleção do Método de Pagamento */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">💳 Método de Pagamento</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-blue-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="pix"
                      checked={paymentMethod === 'pix'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 text-blue-600"
                    />
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📱</span>
                      <div>
                        <div className="font-semibold text-gray-800">PIX</div>
                        <div className="text-sm text-gray-600">Pagamento instantâneo via QR Code</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-green-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="dinheiro"
                      checked={paymentMethod === 'dinheiro'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 text-green-600"
                    />
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">💵</span>
                      <div>
                        <div className="font-semibold text-gray-800">Dinheiro</div>
                        <div className="text-sm text-gray-600">Pagamento na entrega</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Botão de ação */}
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className={`w-full py-4 text-white rounded-xl font-bold text-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl ${
                    paymentMethod === 'pix' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  }`}
                >
                  {paymentMethod === 'pix' ? '💳 Finalizar Compra com PIX' : '💵 Finalizar Compra (Dinheiro)'}
                </button>
                
                {!user && (
                  <p className="text-center text-sm text-gray-600">
                    🔐 Você precisa fazer login para continuar
                  </p>
                )}
                
                <Link
                  to="/"
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-center block hover:bg-gray-200 transition-colors duration-200"
                >
                  Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Login */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Faça Login para Continuar
              </h2>
              <p className="text-gray-600">
                Entre na sua conta para finalizar a compra
              </p>
            </div>
            
            <Login onLoginSuccess={handleLoginSuccess} />
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 mb-2">Não tem uma conta?</p>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setShowRegisterModal(true);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Criar Conta
              </button>
            </div>

            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Modal de Registro */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">✨</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Crie sua Conta
              </h2>
              <p className="text-gray-600">
                Cadastre-se para finalizar sua compra
              </p>
            </div>
            
            <Register onRegisterSuccess={handleRegisterSuccess} />
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 mb-2">Já tem uma conta?</p>
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setShowLoginModal(true);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Fazer Login
              </button>
            </div>

            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}