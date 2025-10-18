import React, { useState, useEffect, useContext } from 'react';
import { FaCheck, FaTimes, FaEye, FaTrash, FaBell, FaShoppingCart } from 'react-icons/fa';
import { ShopContext } from '../../context/ShopContext';

const AdminOrders = () => {
  const { clearCart } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Carrega pedidos do localStorage
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      setOrders(savedOrders);
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
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const updatedOrder = { ...order, status: newStatus, updatedAt: new Date().toISOString() };
        
        // Se confirmado, limpa o carrinho (simulado)
        if (newStatus === 'confirmed') {
          console.log('✅ Pedido confirmado! Carrinho seria limpo automaticamente.');
          // Aqui você pode adicionar lógica para notificar o cliente
          // Simula limpeza do carrinho após confirmação
          setTimeout(() => {
            clearCart();
          }, 1000);
          
          // Notifica o cliente sobre a confirmação
          notifyClient(orderId, 'confirmed');
        } else if (newStatus === 'cancelled') {
          // Notifica o cliente sobre o cancelamento
          notifyClient(orderId, 'cancelled');
        }
        
        return updatedOrder;
      }
      return order;
    });
    
    setOrders(updatedOrders);
    localStorage.setItem('pendingOrders', JSON.stringify(updatedOrders));
    
    // Notificação de atualização
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Pedido ${newStatus === 'confirmed' ? 'Confirmado' : 'Cancelado'}!`, {
        body: `Pedido ${orderId} foi ${newStatus === 'confirmed' ? 'confirmado' : 'cancelado'}`,
        icon: '/favicon.ico'
      });
    }
  };

  const notifyClient = (orderId, status) => {
    // Simula notificação para o cliente
    // Em um sistema real, isso seria enviado via push notification, email, SMS, etc.
    console.log(`🔔 Notificação para cliente: Pedido ${orderId} foi ${status}`);
    
    // Salva notificação para o cliente (simulado)
    const notification = {
      orderId,
      status,
      message: status === 'confirmed' 
        ? `Seu pedido ${orderId} foi confirmado e está sendo preparado!` 
        : `Seu pedido ${orderId} foi cancelado. Entre em contato conosco.`,
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
    const updatedOrders = orders.filter(order => order.id !== orderId);
    setOrders(updatedOrders);
    localStorage.setItem('pendingOrders', JSON.stringify(updatedOrders));
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Solicita permissão para notificações
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaShoppingCart className="text-blue-600" />
                Painel de Pedidos
              </h1>
              <p className="text-gray-600 mt-2">Gerencie os pedidos Pix dos seus clientes</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total de Pedidos</p>
                <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos ({orders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pendentes ({orders.filter(o => o.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'confirmed' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Confirmados ({orders.filter(o => o.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'cancelled' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cancelados ({orders.filter(o => o.status === 'cancelled').length})
            </button>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {filter === 'all' ? 'Nenhum pedido encontrado' : `Nenhum pedido ${filter === 'pending' ? 'pendente' : filter === 'confirmed' ? 'confirmado' : 'cancelado'}`}
              </h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'Os pedidos aparecerão aqui quando os clientes gerarem QR Codes Pix.'
                  : 'Mude o filtro para ver outros pedidos.'
                }
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{order.id}</h3>
                      <p className="text-sm text-gray-500">Criado em: {formatDate(order.createdAt)}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Itens ({order.items.length}):</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                        <span className="text-gray-600">
                          {item.titulo} (x{item.qty})
                        </span>
                        <span className="font-medium">
                          {formatCurrency(parseFloat(item.preco) * item.qty)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informações do Pagamento */}
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <h4 className="font-medium text-blue-800 mb-1">Informações do Pagamento:</h4>
                  <p className="text-sm text-blue-700">
                    <strong>Chave Pix:</strong> {order.pixKey} | 
                    <strong> Beneficiário:</strong> {order.merchantName}
                  </p>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <FaEye />
                      Ver Detalhes
                    </button>
                  </div>
                  
                  {order.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FaCheck />
                        Confirmar Pagamento
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <FaTimes />
                        Cancelar
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FaTrash />
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de Detalhes */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Detalhes do Pedido</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">ID do Pedido</label>
                      <p className="text-lg font-semibold">{selectedOrder.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Valor Total</label>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedOrder.total)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Data de Criação</label>
                      <p className="text-sm">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Itens do Pedido</label>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.titulo}</p>
                            <p className="text-sm text-gray-500">Quantidade: {item.qty}</p>
                          </div>
                          <p className="font-semibold">{formatCurrency(parseFloat(item.preco) * item.qty)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Informações do Pagamento Pix</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Chave Pix:</strong> {selectedOrder.pixKey}</p>
                      <p><strong>Beneficiário:</strong> {selectedOrder.merchantName}</p>
                      <p><strong>Método:</strong> {selectedOrder.paymentMethod}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
