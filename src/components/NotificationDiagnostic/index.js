import { useState, useEffect } from "react";
import { useAdmin } from "../../hooks/useAdmin";
import { 
  getAdminNotifications, 
  getUnreadNotificationsCount,
  createNewOrderNotification 
} from "../../firebase/notifications";
import { getAllOrders } from "../../firebase/orders";

export default function NotificationDiagnostic() {
  const { isAdmin } = useAdmin();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdmin) {
      loadDiagnosticData();
    }
  }, [isAdmin]);

  const loadDiagnosticData = async () => {
    try {
      setLoading(true);
      
      // Carregar notificações
      const notificationsResult = await getAdminNotifications();
      if (notificationsResult.success) {
        setNotifications(notificationsResult.notifications);
      }

      // Carregar contagem de não lidas
      const countResult = await getUnreadNotificationsCount();
      if (countResult.success) {
        setUnreadCount(countResult.count);
      }

      // Carregar pedidos recentes
      const ordersResult = await getAllOrders();
      if (ordersResult.success) {
        // Pegar os 5 pedidos mais recentes
        const recent = ordersResult.pedidos
          .sort((a, b) => {
            const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return bTime - aTime;
          })
          .slice(0, 5);
        setRecentOrders(recent);
      }

    } catch (err) {
      setError("Erro ao carregar dados de diagnóstico: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const testNotificationCreation = async () => {
    try {
      const testOrderData = {
        id: "test-" + Date.now(),
        userId: "test-user",
        total: 99.99,
        items: [{ nome: "Produto Teste", quantidade: 1, subtotal: 99.99 }],
        endereco: { nome: "Cliente Teste" },
        paymentMethod: "PIX"
      };

      const result = await createNewOrderNotification(testOrderData);
      
      if (result.success) {
        alert("✅ Notificação de teste criada com sucesso!");
        loadDiagnosticData(); // Recarregar dados
      } else {
        alert("❌ Erro ao criar notificação de teste: " + result.error);
      }
    } catch (error) {
      alert("❌ Erro ao testar notificação: " + error.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando diagnóstico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                🔧 Diagnóstico de Notificações
              </h1>
              <p className="text-gray-600 mt-1">
                Verificação do sistema de notificações
              </p>
            </div>
            
            <button
              onClick={testNotificationCreation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Testar Notificação
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estatísticas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Estatísticas</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Notificações:</span>
                <span className="font-semibold">{notifications.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Não Lidas:</span>
                <span className="font-semibold text-red-600">{unreadCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pedidos Recentes:</span>
                <span className="font-semibold">{recentOrders.length}</span>
              </div>
            </div>
          </div>

          {/* Notificações Recentes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔔 Notificações Recentes</h3>
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma notificação encontrada</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className={`p-3 rounded-lg border ${
                    notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-gray-600">{notification.message}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.read ? 'bg-gray-200 text-gray-600' : 'bg-blue-200 text-blue-600'
                        }`}>
                          {notification.read ? 'Lida' : 'Não lida'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pedidos Recentes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🛒 Pedidos Recentes</h3>
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum pedido encontrado</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Pedido #{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-gray-600">R$ {order.total?.toFixed(2) || "0,00"}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">
                          {order.createdAt?.toDate ? 
                            order.createdAt.toDate().toLocaleString() : 
                            'Data não disponível'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verificação de Notificações por Pedido */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Verificação de Notificações</h3>
            <div className="space-y-2">
              {recentOrders.map((order) => {
                const hasNotification = notifications.some(n => n.orderId === order.id);
                return (
                  <div key={order.id} className={`p-3 rounded-lg border ${
                    hasNotification ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Pedido #{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-gray-600">R$ {order.total?.toFixed(2) || "0,00"}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          hasNotification ? 'bg-green-200 text-green-600' : 'bg-red-200 text-red-600'
                        }`}>
                          {hasNotification ? '✅ Tem notificação' : '❌ Sem notificação'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Botão de Atualizar */}
        <div className="mt-6 text-center">
          <button
            onClick={loadDiagnosticData}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Atualizar Diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
}
