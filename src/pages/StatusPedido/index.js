import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes, FaClock, FaShoppingCart, FaWhatsapp, FaArrowLeft, FaCopy, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const StatusPedido = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lastStatus, setLastStatus] = useState(null);
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    loadOrder();
    
    const interval = setInterval(() => {
      loadOrder();
      setCountdown(5);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 5);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const loadOrder = () => {
    try {
      const orders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      const foundOrder = orders.find(o => o.id === orderId);
      
      if (foundOrder) {
        // Verifica mudança de status
        if (lastStatus && lastStatus !== foundOrder.status) {
          setShowStatusChange(true);
          setTimeout(() => setShowStatusChange(false), 3000);
          
          if (foundOrder.status === 'confirmed') {
            showClientNotification('🎉 Pagamento Confirmado!', `Seu pedido ${orderId} foi confirmado e está sendo preparado.`);
          } else if (foundOrder.status === 'cancelled') {
            showClientNotification('❌ Pedido Cancelado', `Seu pedido ${orderId} foi cancelado. Entre em contato conosco.`);
          }
        }
        
        setOrder(foundOrder);
        setLastStatus(foundOrder.status);
        setNotFound(false);
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
        icon: '/favicon.ico',
        badge: '/favicon.ico'
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
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeElapsed = (dateString) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} minuto${diffMins > 1 ? 's' : ''} atrás`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Feedback visual
      const btn = document.activeElement;
      if (btn) {
        btn.classList.add('scale-95');
        setTimeout(() => btn.classList.remove('scale-95'), 200);
      }
    });
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: '⏳',
          text: 'Aguardando Confirmação',
          color: 'bg-yellow-50 text-yellow-800 border-yellow-300',
          bgGradient: 'from-yellow-400 to-orange-400',
          description: 'Seu pagamento foi recebido e está sendo processado. Aguarde a confirmação do lojista.',
          steps: [
            { label: 'Pedido Criado', completed: true },
            { label: 'Aguardando Pagamento', completed: true },
            { label: 'Pagamento em Análise', completed: true, active: true },
            { label: 'Pedido Confirmado', completed: false },
            { label: 'Em Preparação', completed: false }
          ]
        };
      case 'confirmed':
        return {
          icon: '✅',
          text: 'Pagamento Confirmado',
          color: 'bg-green-50 text-green-800 border-green-300',
          bgGradient: 'from-green-400 to-emerald-500',
          description: 'Seu pagamento foi confirmado com sucesso! O pedido está sendo preparado para entrega.',
          steps: [
            { label: 'Pedido Criado', completed: true },
            { label: 'Aguardando Pagamento', completed: true },
            { label: 'Pagamento em Análise', completed: true },
            { label: 'Pedido Confirmado', completed: true, active: true },
            { label: 'Em Preparação', completed: true }
          ]
        };
      case 'cancelled':
        return {
          icon: '❌',
          text: 'Pedido Cancelado',
          color: 'bg-red-50 text-red-800 border-red-300',
          bgGradient: 'from-red-400 to-pink-500',
          description: 'O pedido foi cancelado. Entre em contato conosco para mais informações.',
          steps: [
            { label: 'Pedido Criado', completed: true },
            { label: 'Aguardando Pagamento', completed: true },
            { label: 'Pedido Cancelado', completed: true, active: true, error: true }
          ]
        };
      default:
        return {
          icon: '❓',
          text: 'Status Desconhecido',
          color: 'bg-gray-50 text-gray-800 border-gray-300',
          bgGradient: 'from-gray-400 to-gray-500',
          description: 'Status do pedido não identificado.',
          steps: []
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Carregando status do pedido...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fadeIn">
          <div className="text-7xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Pedido Não Encontrado</h1>
          <p className="text-gray-600 mb-6">
            O pedido <span className="font-mono font-bold text-blue-600">{orderId}</span> não foi encontrado em nosso sistema.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            ← Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-5">
      <div className="max-w-4xl mx-auto">
        {/* Notificação de Mudança de Status */}
        {showStatusChange && (
          <div className="fixed top-4 right-4 bg-white rounded-lg shadow-2xl p-4 animate-slideIn z-50 max-w-sm">
            <div className="flex items-center gap-3">
              <div className={`text-3xl ${order.status === 'confirmed' ? 'animate-bounce' : ''}`}>
                {statusInfo.icon}
              </div>
              <div>
                <p className="font-bold text-gray-800">Status Atualizado!</p>
                <p className="text-sm text-gray-600">{statusInfo.text}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header com Voltar */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors mb-6 font-medium"
        >
          <FaArrowLeft />
          <span>Voltar para Loja</span>
        </button>

        {/* Card Principal com Status */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6 animate-fadeIn">
          {/* Banner de Status */}
          <div className={`bg-gradient-to-r ${statusInfo.bgGradient} p-8 text-white text-center`}>
            <div className="text-8xl mb-4 animate-bounce">{statusInfo.icon}</div>
            <h1 className="text-3xl font-bold mb-2">{statusInfo.text}</h1>
            <p className="text-lg opacity-90">{statusInfo.description}</p>
          </div>

          {/* Informações do Pedido */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-gray-100">
              <div>
                <p className="text-sm text-gray-500 mb-1">Número do Pedido</p>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-800 font-mono">{order.id}</h2>
                  <button
                    onClick={() => copyToClipboard(order.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                    title="Copiar ID"
                  >
                    <FaCopy className="text-gray-400 hover:text-blue-600" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Criado</p>
                <p className="font-semibold text-gray-700">{getTimeElapsed(order.createdAt)}</p>
                <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            {/* Timeline de Status */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📍 Acompanhe seu Pedido</h3>
              <div className="relative">
                {statusInfo.steps.map((step, index) => (
                  <div key={index} className="flex items-start mb-6 last:mb-0">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        step.error ? 'bg-red-500 border-red-500' :
                        step.completed ? 'bg-green-500 border-green-500' : 
                        step.active ? 'bg-blue-500 border-blue-500 animate-pulse' : 
                        'bg-gray-200 border-gray-300'
                      }`}>
                        {step.error ? (
                          <FaTimesCircle className="text-white text-xl" />
                        ) : step.completed ? (
                          <FaCheckCircle className="text-white text-xl" />
                        ) : (
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        )}
                      </div>
                      {index < statusInfo.steps.length - 1 && (
                        <div className={`absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-8 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className={`font-semibold ${
                        step.error ? 'text-red-700' :
                        step.active ? 'text-blue-700' : 
                        step.completed ? 'text-green-700' : 
                        'text-gray-500'
                      }`}>
                        {step.label}
                      </p>
                      {step.active && !step.error && (
                        <p className="text-sm text-gray-500 mt-1">Em andamento...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detalhes do Cliente */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">👤 Dados do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nome</p>
                  <p className="font-semibold text-gray-800">{order.clientName || 'Não informado'}</p>
                </div>
                {order.clientPhone && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Telefone</p>
                    <p className="font-semibold text-gray-800">{order.clientPhone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Informações de Pagamento */}
            <div className="bg-green-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">💰 Informações de Pagamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Valor Total</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(order.total)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Método de Pagamento</p>
                  <p className="font-semibold text-gray-800">PIX - {order.pixKey}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Beneficiário</p>
                  <p className="font-semibold text-gray-800">{order.merchantName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status do Pagamento</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border-2 ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>
              </div>
            </div>

            {/* Itens do Pedido */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📦 Itens do Pedido</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{item.titulo}</p>
                        <p className="text-sm text-gray-500">
                          Quantidade: {item.qty} × {formatCurrency(parseFloat(item.preco))}
                        </p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-gray-800">
                      {formatCurrency(parseFloat(item.preco) * item.qty)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t-2 border-gray-200 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Total</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <a
            href={`https://wa.me/5519997050303?text=${encodeURIComponent(`Olá! Tenho uma dúvida sobre o pedido ${order.id}. Status: ${statusInfo.text}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
          >
            <FaWhatsapp className="text-2xl" />
            Falar no WhatsApp
          </a>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-3 bg-white text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg"
          >
            <FaShoppingCart className="text-xl" />
            Continuar Comprando
          </button>
        </div>

        {/* Auto-refresh Indicator */}
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 text-center">
          <p className="text-white font-medium flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Atualizando em {countdown}s... (Auto-refresh ativo)
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusPedido;

