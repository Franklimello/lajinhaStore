import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaArrowLeft, FaWhatsapp } from 'react-icons/fa';

const ConsultaPedidos = () => {
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecentOrders();
  }, []);

  const loadRecentOrders = () => {
    try {
      const allOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      // Mostra os 5 pedidos mais recentes
      const recentOrders = allOrders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setOrders(recentOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

  const handleSearch = () => {
    if (!searchId.trim()) {
      alert('Digite o ID do pedido para consultar.');
      return;
    }
    
    setLoading(true);
    
    // Simula busca (na prática, já temos o pedido)
    setTimeout(() => {
      navigate(`/status-pedido/${searchId.trim()}`);
      setLoading(false);
    }, 500);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '⏳ Pendente';
      case 'confirmed': return '✅ Confirmado';
      case 'cancelled': return '❌ Cancelado';
      default: return '❓ Desconhecido';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-5">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FaArrowLeft />
              <span>Voltar</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FaShoppingCart className="text-blue-600" />
              Consulta de Pedidos
            </h1>
          </div>
          
          <p className="text-gray-600 text-center">
            Consulte o status dos seus pedidos Pix
          </p>
        </div>

        {/* Busca por ID */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🔍 Consultar Pedido Específico</h2>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Digite o ID do pedido (ex: PIX-1703123456789-ABC12)"
              className="flex-1 p-4 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none transition-colors"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <FaSearch />
              )}
              Buscar
            </button>
          </div>
        </div>

        {/* Pedidos Recentes */}
        {orders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Pedidos Recentes</h2>
            
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-800">{order.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>👤 {order.clientName || 'Nome não informado'}</span>
                        <span>💰 {formatCurrency(order.total)}</span>
                        <span>📅 {formatDate(order.createdAt)}</span>
                        <span>📦 {order.items.length} itens</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate(`/status-pedido/${order.id}`)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ajuda */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">❓ Precisa de Ajuda?</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">📱 Como encontrar o ID do pedido?</h3>
              <p className="text-blue-700 text-sm">
                O ID do pedido aparece na tela após gerar o QR Code Pix. 
                Ele tem o formato: <strong>PIX-1703123456789-ABC12</strong>
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">💬 Suporte via WhatsApp</h3>
              <p className="text-green-700 text-sm mb-3">
                Se você não encontrar seu pedido ou tiver dúvidas, entre em contato conosco:
              </p>
              <a
                href="https://wa.me/5519997050303?text=Olá! Preciso de ajuda para consultar meu pedido."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <FaWhatsapp />
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultaPedidos;
