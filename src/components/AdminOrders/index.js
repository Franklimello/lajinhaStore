import React, { useState, useEffect, useContext } from 'react';
import { FaCheck, FaTimes, FaEye, FaTrash, FaBell, FaShoppingCart, FaWhatsapp, FaQrcode, FaCopy } from 'react-icons/fa';
import { ShopContext } from '../../context/ShopContext';

const AdminOrders = () => {
  const { clearCart, showToast } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadOrders();
    
    if (autoRefresh) {
      const interval = setInterval(loadOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadOrders = () => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      const sortedOrders = savedOrders.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setOrders([]);
    }
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

  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const updatedOrder = { 
          ...order, 
          status: newStatus, 
          updatedAt: new Date().toISOString() 
        };
        
        if (newStatus === 'confirmed') {
          showToast('✅ Pedido confirmado com sucesso!', 'success');
          notifyClient(order, 'confirmed');
        } else if (newStatus === 'cancelled') {
          showToast('❌ Pedido cancelado', 'info');
          notifyClient(order, 'cancelled');
        }
        
        return updatedOrder;
      }
      return order;
    });
    
    setOrders(updatedOrders);
    localStorage.setItem('pendingOrders', JSON.stringify(updatedOrders));
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Pedido ${newStatus === 'confirmed' ? 'Confirmado' : 'Cancelado'}!`, {
        body: `Pedido ${orderId} foi atualizado`,
        icon: '/favicon.ico'
      });
    }
  };

  const notifyClient = (order, status) => {
    const notification = {
      orderId: order.id,
      status,
      message: status === 'confirmed' 
        ? `Seu pedido ${order.id} foi confirmado e está sendo preparado!` 
        : `Seu pedido ${order.id} foi cancelado. Entre em contato conosco.`,
      timestamp: new Date().toISOString()
    };
    
    try {
      const existingNotifications = JSON.parse(localStorage.getItem('clientNotifications') || '[]');
      existingNotifications.push(notification);
      localStorage.setItem('clientNotifications', JSON.stringify(existingNotifications));
    } catch (error) {
      console.error('Erro ao salvar notificação:', error);
    }
  };

  const deleteOrder = (orderId) => {
    setDeleteConfirm(orderId);
  };

  const handleConfirmDelete = () => {
    const updatedOrders = orders.filter(order => order.id !== deleteConfirm);
    setOrders(updatedOrders);
    localStorage.setItem('pendingOrders', JSON.stringify(updatedOrders));
    showToast('🗑️ Pedido excluído', 'info');
    setDeleteConfirm(null);
  };

  const copyOrderItems = (order) => {
    const itemsList = order.items.map(item => 
      `${item.titulo} - Qtd: ${item.qty} - ${formatCurrency(parseFloat(item.preco) * item.qty)}`
    ).join('\n');
    
    const orderText = `
═══════════════════════════════════════
          PEDIDO #${order.id}
═══════════════════════════════════════

📦 ITENS DO PEDIDO
${itemsList}

───────────────────────────────────────
💰 VALOR TOTAL: ${formatCurrency(order.total)}
───────────────────────────────────────

👤 DADOS DO CLIENTE
Nome: ${order.clientName || 'Não informado'}
Telefone: ${order.clientPhone || 'Não informado'}
Endereço: ${order.clientAddress || 'Não informado'}

═══════════════════════════════════════
Data do Pedido: ${new Date(order.createdAt).toLocaleString('pt-BR')}
Status: ${getStatusText(order.status)}
═══════════════════════════════════════
    `.trim();
    
    navigator.clipboard.writeText(orderText).then(() => {
      showToast('📋 Pedido copiado para impressão!', 'success');
    });
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label} copiado!`, 'success');
    });
  };

  const sendWhatsAppMessage = (order) => {
    const message = `Olá ${order.clientName}! Confirmamos o recebimento do seu pagamento PIX no valor de ${formatCurrency(order.total)}. Pedido: ${order.id}. Seu pedido está sendo preparado! 🎉`;
    const phone = order.clientPhone?.replace(/\D/g, '') || '5519997050303';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

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
      case 'pending': return '⏳ Pendente';
      case 'confirmed': return '✅ Confirmado';
      case 'cancelled': return '❌ Cancelado';
      default: return '❓ Desconhecido';
    }
  };

  const calculateStats = () => {
    const pending = orders.filter(o => o.status === 'pending');
    const confirmed = orders.filter(o => o.status === 'confirmed');
    const totalRevenue = confirmed.reduce((acc, order) => acc + order.total, 0);
    
    return { pending: pending.length, confirmed: confirmed.length, totalRevenue };
  };

  const stats = calculateStats();

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header com Estatísticas */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaShoppingCart className="text-blue-600" />
                Painel de Pedidos PIX
              </h1>
              <p className="text-gray-600 mt-2">Gerencie e confirme pagamentos em tempo real</p>
            </div>
            
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                autoRefresh 
                  ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                  : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
              }`}
            >
              {autoRefresh ? '🔄 Auto-Refresh ON' : '⏸️ Auto-Refresh OFF'}
            </button>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Total de Pedidos</p>
              <p className="text-3xl font-bold text-blue-700">{orders.length}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border-2 border-yellow-200">
              <p className="text-sm text-yellow-600 font-medium">Aguardando Confirmação</p>
              <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-200">
              <p className="text-sm text-green-600 font-medium">Confirmados</p>
              <p className="text-3xl font-bold text-green-700">{stats.confirmed}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-200">
              <p className="text-sm text-purple-600 font-medium">Faturamento</p>
              <p className="text-2xl font-bold text-purple-700">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos ({orders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                filter === 'pending' 
                  ? 'bg-yellow-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ⏳ Pendentes ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                filter === 'confirmed' 
                  ? 'bg-green-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ✅ Confirmados ({stats.confirmed})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                filter === 'cancelled' 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ❌ Cancelados ({orders.filter(o => o.status === 'cancelled').length})
            </button>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-gray-300 text-7xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-600 mb-2">
                {filter === 'all' ? 'Nenhum pedido ainda' : `Sem pedidos ${getStatusText(filter).toLowerCase()}`}
              </h3>
              <p className="text-gray-500 text-lg">
                {filter === 'all' 
                  ? 'Quando os clientes gerarem QR Codes PIX, os pedidos aparecerão aqui.'
                  : 'Use os filtros acima para ver outros pedidos.'
                }
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
                {/* Cabeçalho do Pedido */}
                <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FaQrcode className="text-blue-600 text-2xl" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-800">{order.id}</h3>
                        <button
                          onClick={() => copyToClipboard(order.id, 'ID do pedido')}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <FaCopy size={14} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        👤 {order.clientName || 'Nome não informado'}
                      </p>
                      {order.clientAddress && (
                        <p className="text-xs text-gray-500">
                          📍 {order.clientAddress}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        🕐 {formatDate(order.createdAt)}
                      </p>
                      {order.clientPhone && (
                        <p className="text-xs text-gray-500">
                          📱 {order.clientPhone}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-4 py-2 rounded-lg text-sm font-bold border-2 ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </div>
                    <span className="text-3xl font-bold text-green-600">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div className="mb-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                      🛒 Itens do Pedido ({order.items.length})
                    </h4>
                    <button
                      onClick={() => copyOrderItems(order)}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium transition-colors"
                      title="Copiar pedido completo"
                    >
                      <FaCopy />
                      Copiar Pedido
                    </button>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg">
                        <span className="text-gray-700 font-medium">
                          {item.titulo} <span className="text-gray-500">x{item.qty}</span>
                        </span>
                        <span className="font-bold text-gray-800">
                          {formatCurrency(parseFloat(item.preco) * item.qty)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informações do Pagamento */}
                {order.paymentMethod === 'dinheiro' ? (
                  <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      💵 Pagamento em Dinheiro
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-green-700 font-medium">
                          <strong>Valor Total:</strong>
                        </p>
                        <p className="text-lg font-bold text-green-800">
                          {formatCurrency(order.valorTotal || order.total)}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-green-700 font-medium">
                          <strong>Valor Pago:</strong>
                        </p>
                        <p className="text-lg font-bold text-blue-800">
                          {formatCurrency(order.valorPago || 0)}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-green-700 font-medium">
                          <strong>Troco:</strong>
                        </p>
                        <p className={`text-lg font-bold ${(order.troco || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(order.troco || 0)}
                        </p>
                      </div>
                    </div>
                    {(order.troco || 0) > 0 && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-yellow-800 text-sm">
                          ⚠️ <strong>Importante:</strong> O entregador deve levar troco de {formatCurrency(order.troco)} para este pedido.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      💳 Dados do Pagamento PIX
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <p className="text-blue-700">
                        <strong>Chave PIX:</strong> {order.pixKey}
                      </p>
                      <p className="text-blue-700">
                        <strong>Beneficiário:</strong> {order.merchantName}
                      </p>
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors"
                    >
                      <FaEye />
                      Detalhes
                    </button>
                    
                    {order.clientPhone && (
                      <button
                        onClick={() => sendWhatsAppMessage(order)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-colors"
                      >
                        <FaWhatsapp />
                        WhatsApp
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors shadow-md"
                        >
                          <FaCheck />
                          Confirmar
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors shadow-md"
                        >
                          <FaTimes />
                          Cancelar
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                    >
                      <FaTrash />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de Detalhes */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">📋 Detalhes Completos</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center text-3xl transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Grid de Informações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-500 mb-1">ID do Pedido</label>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-gray-800">{selectedOrder.id}</p>
                      <button
                        onClick={() => copyToClipboard(selectedOrder.id, 'ID')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <FaCopy />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Status</label>
                    <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold border-2 ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Cliente</label>
                    <p className="text-lg font-semibold text-gray-800">{selectedOrder.clientName || 'Nome não informado'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Telefone</label>
                    <p className="text-base text-gray-800">{selectedOrder.clientPhone || 'Não informado'}</p>
                  </div>
                  
                  {selectedOrder.clientAddress && (
                    <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-500 mb-1">📍 Endereço de Entrega</label>
                      <p className="text-base text-gray-800">{selectedOrder.clientAddress}</p>
                    </div>
                  )}
                  
                  <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                    <label className="block text-sm font-semibold text-green-600 mb-1">Valor Total</label>
                    <p className="text-3xl font-bold text-green-700">{formatCurrency(selectedOrder.total)}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Data de Criação</label>
                    <p className="text-base text-gray-800">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                </div>
                
                {/* Itens do Pedido */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      🛒 Itens do Pedido
                    </h3>
                    <button
                      onClick={() => copyOrderItems(selectedOrder)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                      <FaCopy />
                      Copiar Pedido Completo
                    </button>
                  </div>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                        <div>
                          <p className="font-semibold text-gray-800">{item.titulo}</p>
                          <p className="text-sm text-gray-600">Quantidade: {item.qty} × {formatCurrency(parseFloat(item.preco))}</p>
                        </div>
                        <p className="text-xl font-bold text-gray-800">{formatCurrency(parseFloat(item.preco) * item.qty)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Informações de Pagamento */}
                {selectedOrder.paymentMethod === 'dinheiro' ? (
                  <div className="bg-green-50 border-2 border-green-300 p-5 rounded-lg">
                    <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2 text-lg">
                      💵 Pagamento em Dinheiro
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <label className="block text-sm font-semibold text-green-600 mb-1">Valor Total</label>
                        <p className="text-2xl font-bold text-green-800">
                          {formatCurrency(selectedOrder.valorTotal || selectedOrder.total)}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <label className="block text-sm font-semibold text-green-600 mb-1">Valor Pago</label>
                        <p className="text-2xl font-bold text-blue-800">
                          {formatCurrency(selectedOrder.valorPago || 0)}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <label className="block text-sm font-semibold text-green-600 mb-1">Troco</label>
                        <p className={`text-2xl font-bold ${(selectedOrder.troco || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(selectedOrder.troco || 0)}
                        </p>
                      </div>
                    </div>
                    {(selectedOrder.troco || 0) > 0 && (
                      <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                        <p className="text-yellow-800 font-medium">
                          ⚠️ <strong>ATENÇÃO:</strong> O entregador deve levar troco de {formatCurrency(selectedOrder.troco)} para este pedido.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50 border-2 border-blue-300 p-5 rounded-lg">
                    <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-lg">
                      💳 Informações do Pagamento PIX
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-blue-800"><strong>Chave PIX:</strong> {selectedOrder.pixKey}</p>
                      <p className="text-blue-800"><strong>Beneficiário:</strong> {selectedOrder.merchantName}</p>
                      <p className="text-blue-800"><strong>Método:</strong> {selectedOrder.paymentMethod?.toUpperCase()}</p>
                    </div>
                  </div>
                )}
                
                {/* Ações do Modal */}
                {selectedOrder.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'confirmed');
                        setSelectedOrder(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition-colors"
                    >
                      <FaCheck />
                      Confirmar Pagamento
                    </button>
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'cancelled');
                        setSelectedOrder(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors"
                    >
                      <FaTimes />
                      Cancelar Pedido
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="text-center mb-6">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirmar Exclusão</h2>
                <p className="text-gray-600">
                  Tem certeza que deseja excluir o pedido <strong>{deleteConfirm}</strong>?
                </p>
                <p className="text-red-600 text-sm mt-2">Esta ação não pode ser desfeita!</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;