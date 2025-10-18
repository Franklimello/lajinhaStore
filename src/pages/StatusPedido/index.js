import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes, FaClock, FaShoppingCart, FaWhatsapp, FaArrowLeft } from 'react-icons/fa';

const StatusPedido = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadOrder();
    
    // Atualiza status a cada 5 segundos
    const interval = setInterval(loadOrder, 5000);
    
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrder = () => {
    try {
      const orders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      const foundOrder = orders.find(o => o.id === orderId);
      
      if (foundOrder) {
        setOrder(foundOrder);
        setNotFound(false);
        
        // Notifica cliente quando status muda
        if (foundOrder.status === 'confirmed') {
          showClientNotification('Pagamento Confirmado!', `Seu pedido ${orderId} foi confirmado e está sendo preparado.`);
        } else if (foundOrder.status === 'cancelled') {
          showClientNotification('Pedido Cancelado', `Seu pedido ${orderId} foi cancelado. Entre em contato conosco.`);
        }
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const showClientNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/favicon.ico'
      });
    }
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

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: <FaClock className="text-yellow-500" />,
          text: '⏳ Aguardando Confirmação',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          description: 'Seu pagamento foi recebido e está sendo processado. Aguarde a confirmação.'
        };
      case 'confirmed':
        return {
          icon: <FaCheck className="text-green-500" />,
          text: '✅ Pagamento Confirmado',
          color: 'bg-green-100 text-green-800 border-green-200',
          description: 'Seu pagamento foi confirmado! O pedido está sendo preparado.'
        };
      case 'cancelled':
        return {
          icon: <FaTimes className="text-red-500" />,
          text: '❌ Pedido Cancelado',
          color: 'bg-red-100 text-red-800 border-red-200',
          description: 'O pedido foi cancelado. Entre em contato conosco para mais informações.'
        };
      default:
        return {
          icon: <FaClock className="text-gray-500" />,
          text: '❓ Status Desconhecido',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          description: 'Status do pedido não identificado.'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando status do pedido...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Pedido Não Encontrado</h1>
          <p className="text-gray-600 mb-6">
            O pedido <strong>{orderId}</strong> não foi encontrado em nosso sistema.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            ← Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-5">
      <div className="max-w-2xl mx-auto">
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
              Status do Pedido
            </h1>
          </div>
          
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{order.id}</h2>
            <p className="text-gray-600">Criado em: {formatDate(order.createdAt)}</p>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="text-center">
            <div className="text-6xl mb-4">{statusInfo.icon}</div>
            <div className={`inline-block px-6 py-3 rounded-full text-lg font-semibold border-2 ${statusInfo.color} mb-4`}>
              {statusInfo.text}
            </div>
            <p className="text-gray-600 text-lg">{statusInfo.description}</p>
          </div>
        </div>

        {/* Informações do Pedido */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">💰 Informações do Pagamento</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-1">Valor Total</label>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(order.total)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-1">Chave Pix</label>
              <p className="font-mono text-sm">{order.pixKey}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-1">Beneficiário</label>
              <p className="font-medium">{order.merchantName}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-1">Método</label>
              <p className="font-medium">{order.paymentMethod.toUpperCase()}</p>
            </div>
          </div>

          {/* Itens do Pedido */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">📦 Itens do Pedido ({order.items.length})</h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.titulo}</p>
                    <p className="text-sm text-gray-500">Quantidade: {item.qty}</p>
                  </div>
                  <p className="font-semibold text-gray-800">
                    {formatCurrency(parseFloat(item.preco) * item.qty)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📞 Precisa de Ajuda?</h3>
          
          <div className="space-y-3">
            <a
              href={`https://wa.me/5519997050303?text=${encodeURIComponent(`Olá! Tenho uma dúvida sobre o pedido ${order.id}. Status atual: ${statusInfo.text}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <FaWhatsapp className="text-xl" />
              Falar no WhatsApp
            </a>
            
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Continuar Comprando
            </button>
          </div>
        </div>

        {/* Auto-refresh indicator */}
        <div className="text-center mt-4">
          <p className="text-white text-sm opacity-75">
            🔄 Status atualizado automaticamente a cada 5 segundos
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusPedido;
