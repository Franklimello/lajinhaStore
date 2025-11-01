import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaArrowLeft, FaWhatsapp, FaCopy, FaCheckCircle } from 'react-icons/fa';
import AlertModal from '../../components/AlertModal';

const ConsultaPedidos = () => {
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [alert, setAlert] = useState({ isOpen: false, message: "", type: "info" });

  useEffect(() => {
    loadRecentOrders();
  }, []);

  const loadRecentOrders = () => {
    try {
      const allOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      // Mostra os 10 pedidos mais recentes
      const recentOrders = allOrders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
      setOrders(recentOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

  const handleSearch = () => {
    if (!searchId.trim()) {
      setAlert({ isOpen: true, message: 'Digite o ID do pedido para consultar.', type: "warning" });
      return;
    }
    
    setLoading(true);
    
    // Verifica se o pedido existe
    const allOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    const orderExists = allOrders.find(order => order.id === searchId.trim());
    
    setTimeout(() => {
      if (orderExists) {
        navigate(`/status-pedido/${searchId.trim()}`);
      } else {
        setAlert({ isOpen: true, message: 'Pedido não encontrado. Verifique o ID e tente novamente.', type: "error" });
      }
      setLoading(false);
    }, 500);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h atrás`;
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '⏳ Aguardando';
      case 'confirmed': return '✅ Confirmado';
      case 'cancelled': return '❌ Cancelado';
      default: return '❓ Desconhecido';
    }
  };

  const getStatusBadge = (status) => {
    const colors = getStatusColor(status);
    return (
      <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border-2 ${colors}`}>
        {getStatusText(status)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-3 sm:p-5">
      <div className="max-w-5xl mx-auto">
        {/* Header Responsivo */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <FaArrowLeft />
              <span>Voltar</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
              <FaShoppingCart className="text-blue-600" />
              Consulta de Pedidos
            </h1>
            <div className="w-20 hidden sm:block"></div>
          </div>
          
          <p className="text-sm sm:text-base text-gray-600 text-center">
            Consulte o status dos seus pedidos PIX
          </p>
        </div>

        {/* Busca por ID - Responsivo */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <FaSearch className="text-blue-600" />
            Buscar Pedido Específico
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Digite o ID do pedido"
              className="flex-1 p-3 sm:p-4 border-2 border-gray-200 rounded-lg text-sm sm:text-base focus:border-blue-500 focus:outline-none transition-colors"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 sm:py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Buscando...</span>
                </>
              ) : (
                <>
                  <FaSearch />
                  <span>Buscar</span>
                </>
              )}
            </button>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Exemplo: PIX-1703123456789-ABC12
          </p>
        </div>

        {/* Pedidos Recentes - Responsivo */}
        {orders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                📋 Pedidos Recentes
              </h2>
              <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
              </span>
            </div>
            
            <div className="space-y-3">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="border-2 border-gray-200 rounded-xl p-3 sm:p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/status-pedido/${order.id}`)}
                >
                  {/* Mobile Layout */}
                  <div className="block sm:hidden space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-sm text-gray-800 truncate">{order.id}</h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(order.id);
                            }}
                            className="text-gray-400 hover:text-blue-600 flex-shrink-0"
                          >
                            {copiedId === order.id ? (
                              <FaCheckCircle className="text-green-600" size={14} />
                            ) : (
                              <FaCopy size={14} />
                            )}
                          </button>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>👤 {order.clientName || 'Nome não informado'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>💰 {formatCurrency(order.total)}</span>
                        <span>📦 {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}</span>
                      </div>
                      <div className="text-gray-500">
                        🕐 {formatDate(order.createdAt)}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/status-pedido/${order.id}`);
                      }}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      Ver Detalhes
                    </button>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-800">{order.id}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(order.id);
                          }}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Copiar ID"
                        >
                          {copiedId === order.id ? (
                            <FaCheckCircle className="text-green-600" />
                          ) : (
                            <FaCopy />
                          )}
                        </button>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span>👤 {order.clientName || 'Nome não informado'}</span>
                        <span>💰 {formatCurrency(order.total)}</span>
                        <span>📦 {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}</span>
                        <span className="text-gray-500">🕐 {formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/status-pedido/${order.id}`);
                      }}
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem quando não há pedidos */}
        {orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 mb-4 sm:mb-6 text-center">
            <div className="text-6xl sm:text-7xl mb-4">📦</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-sm sm:text-base text-gray-500">
              Você ainda não fez nenhum pedido via PIX
            </p>
          </div>
        )}

        {/* Ajuda - Responsivo */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            ❓ Precisa de Ajuda?
          </h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
              <h3 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">
                📱 Como encontrar o ID do pedido?
              </h3>
              <p className="text-blue-700 text-xs sm:text-sm leading-relaxed">
                O ID do pedido aparece na tela após gerar o QR Code PIX. 
                Ele tem o formato: <strong className="font-mono bg-blue-100 px-1 rounded">PIX-1703123456789-ABC12</strong>
              </p>
            </div>
            
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 sm:p-4">
              <h3 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">
                💬 Suporte via WhatsApp
              </h3>
              <p className="text-green-700 text-xs sm:text-sm mb-3 leading-relaxed">
                Se você não encontrar seu pedido ou tiver dúvidas, entre em contato conosco:
              </p>
              <a
                href="https://wa.me/5519997050303?text=Olá! Preciso de ajuda para consultar meu pedido."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors w-full sm:w-auto text-sm sm:text-base"
              >
                <FaWhatsapp />
                Falar no WhatsApp
              </a>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-3 sm:p-4">
              <h3 className="font-semibold text-purple-800 mb-2 text-sm sm:text-base">
                🔍 Dica de Busca
              </h3>
              <p className="text-purple-700 text-xs sm:text-sm leading-relaxed">
                Você pode clicar em qualquer pedido da lista para ver todos os detalhes, 
                incluindo itens, endereço de entrega e forma de pagamento.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.type === "success" ? "Sucesso" : alert.type === "error" ? "Erro" : alert.type === "warning" ? "Atenção" : "Aviso"}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
};

export default ConsultaPedidos;