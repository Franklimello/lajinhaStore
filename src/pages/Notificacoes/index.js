import { useState, useEffect } from "react";
import { useAdmin } from "../../hooks/useAdmin";
import { 
  getAdminNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getNotificationIcon,
  getNotificationColor,
  formatNotificationDate,
  initializeNotificationsCollection,
  deleteNotification,
  deleteAllNotifications,
  deleteReadNotifications
} from "../../firebase/notifications";
import { useNavigate } from "react-router-dom";
import { FaBell, FaCheck, FaCheckDouble, FaArrowLeft, FaTrash, FaTrashAlt } from "react-icons/fa";

export default function Notificacoes() {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAsRead, setMarkingAsRead] = useState({});
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [initializing, setInitializing] = useState(false);
  const [deleting, setDeleting] = useState({});

  useEffect(() => {
    if (isAdmin) {
      loadNotifications();
    }
  }, [isAdmin]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const result = await getAdminNotifications();
      
      if (result.success) {
        setNotifications(result.notifications);
      } else {
        setError("Erro ao carregar notificações: " + result.error);
      }
    } catch (err) {
      setError("Erro ao carregar notificações");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      setMarkingAsRead(prev => ({ ...prev, [notificationId]: true }));
      
      const result = await markNotificationAsRead(notificationId);
      
      if (result.success) {
        setNotifications(prev => prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true, readAt: new Date() }
            : notification
        ));
      } else {
        alert("Erro ao marcar notificação como lida: " + result.error);
      }
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      alert("Erro ao marcar notificação como lida");
    } finally {
      setMarkingAsRead(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead();
      
      if (result.success) {
        setNotifications(prev => prev.map(notification => 
          ({ ...notification, read: true, readAt: new Date() })
        ));
      } else {
        alert("Erro ao marcar todas as notificações como lidas: " + result.error);
      }
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
      alert("Erro ao marcar todas as notificações como lidas");
    }
  };

  const handleInitializeNotifications = async () => {
    try {
      setInitializing(true);
      const result = await initializeNotificationsCollection();
      
      if (result.success) {
        alert("✅ Coleção de notificações inicializada com sucesso!");
        // Recarregar notificações após inicialização
        await loadNotifications();
      } else {
        alert("❌ Erro ao inicializar coleção: " + result.error);
      }
    } catch (err) {
      alert("❌ Erro ao inicializar coleção: " + err.message);
    } finally {
      setInitializing(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      setDeleting(prev => ({ ...prev, [notificationId]: true }));
      
      const result = await deleteNotification(notificationId);
      
      if (result.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        alert("✅ Notificação excluída com sucesso!");
      } else {
        alert("❌ Erro ao excluir notificação: " + result.error);
      }
    } catch (err) {
      alert("❌ Erro ao excluir notificação: " + err.message);
    } finally {
      setDeleting(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (!window.confirm("⚠️ Tem certeza que deseja excluir TODAS as notificações? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      setDeleting({ all: true });
      
      const result = await deleteAllNotifications();
      
      if (result.success) {
        setNotifications([]);
        alert(`✅ ${result.count} notificações foram excluídas com sucesso!`);
      } else {
        alert("❌ Erro ao excluir notificações: " + result.error);
      }
    } catch (err) {
      alert("❌ Erro ao excluir notificações: " + err.message);
    } finally {
      setDeleting({ all: false });
    }
  };

  const handleDeleteReadNotifications = async () => {
    if (!window.confirm("⚠️ Tem certeza que deseja excluir todas as notificações LIDAS? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      setDeleting({ read: true });
      
      const result = await deleteReadNotifications();
      
      if (result.success) {
        setNotifications(prev => prev.filter(n => !n.read));
        alert(`✅ ${result.count} notificações lidas foram excluídas com sucesso!`);
      } else {
        alert("❌ Erro ao excluir notificações lidas: " + result.error);
      }
    } catch (err) {
      alert("❌ Erro ao excluir notificações lidas: " + err.message);
    } finally {
      setDeleting({ read: false });
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    if (notification.type === "new_order" && notification.data?.orderId) {
      navigate(`/admin-pedidos`);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">Apenas administradores podem acessar esta página.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {/* Header Responsivo */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <button
                onClick={() => navigate(-1)}
                className="mt-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaArrowLeft size={20} />
              </button>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
                  <FaBell className="text-blue-600" />
                  <span>Notificações</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Acompanhe todas as atividades do sistema
                </p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg w-full sm:w-auto"
              >
                <FaCheckDouble />
                <span>Marcar todas como lidas</span>
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === "unread"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Não lidas ({unreadCount})
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === "read"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Lidas ({notifications.length - unreadCount})
            </button>
          </div>

          {/* Botão de Inicializar Notificações */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleInitializeNotifications}
              disabled={initializing}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {initializing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Inicializando...</span>
                </>
              ) : (
                <>
                  <FaBell />
                  <span>Inicializar Coleção de Notificações</span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Use este botão se a coleção de notificações não existir no Firestore
            </p>
          </div>

          {/* Botões de Exclusão */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDeleteReadNotifications}
                disabled={deleting.read || notifications.filter(n => n.read).length === 0}
                className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {deleting.read ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <FaTrash />
                    <span>Excluir Lidas ({notifications.filter(n => n.read).length})</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDeleteAllNotifications}
                disabled={deleting.all || notifications.length === 0}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {deleting.all ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <FaTrashAlt />
                    <span>Excluir Todas ({notifications.length})</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ⚠️ Ações de exclusão não podem ser desfeitas
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-xl">⚠️</span>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="text-gray-400 text-6xl sm:text-7xl mb-4">🔔</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {filter === "unread" ? "Tudo lido! 🎉" : filter === "read" ? "Nenhuma notificação lida" : "Nenhuma notificação"}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                {filter === "unread" 
                  ? "Você leu todas as notificações. Ótimo trabalho!"
                  : filter === "read"
                  ? "Você ainda não leu nenhuma notificação."
                  : "Você não tem notificações no momento."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 sm:p-5 hover:bg-gray-50 transition-all cursor-pointer ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl ${
                        !notification.read ? 'bg-blue-100 ring-2 ring-blue-200' : 'bg-gray-100'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm sm:text-base font-semibold ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatNotificationDate(notification.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      {/* Type Badge and Order ID */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          getNotificationColor(notification.type)
                        }`}>
                          {notification.type === 'new_order' && '🆕 Novo Pedido'}
                          {notification.type === 'order_update' && '🔄 Atualização'}
                          {notification.type === 'payment_received' && '💰 Pagamento'}
                          {notification.type === 'order_cancelled' && '❌ Cancelamento'}
                          {notification.type === 'system' && '⚙️ Sistema'}
                        </span>
                        
                        {notification.data?.orderId && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            #{notification.data.orderId.slice(-8).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions - Desktop */}
                    <div className="hidden sm:flex flex-shrink-0 gap-2">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          disabled={markingAsRead[notification.id]}
                          className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                        >
                          <FaCheck />
                          {markingAsRead[notification.id] ? "..." : "Marcar como lida"}
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("⚠️ Tem certeza que deseja excluir esta notificação?")) {
                            handleDeleteNotification(notification.id);
                          }
                        }}
                        disabled={deleting[notification.id]}
                        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                      >
                        {deleting[notification.id] ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            <span>Excluindo...</span>
                          </>
                        ) : (
                          <>
                            <FaTrash />
                            <span>Excluir</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Actions - Mobile */}
                  <div className="sm:hidden mt-3 pt-3 border-t border-gray-200 space-y-2">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        disabled={markingAsRead[notification.id]}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                      >
                        <FaCheck />
                        {markingAsRead[notification.id] ? "Marcando..." : "Marcar como lida"}
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("⚠️ Tem certeza que deseja excluir esta notificação?")) {
                          handleDeleteNotification(notification.id);
                        }
                      }}
                      disabled={deleting[notification.id]}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      {deleting[notification.id] ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          <span>Excluindo...</span>
                        </>
                      ) : (
                        <>
                          <FaTrash />
                          <span>Excluir Notificação</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}