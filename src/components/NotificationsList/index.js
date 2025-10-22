import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { FaBell, FaCheck, FaTrash } from 'react-icons/fa';
import firestoreMonitor from '../../services/firestoreMonitor';

const NotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // ✅ LISTENER EM TEMPO REAL (onSnapshot)
  // Para notificações, tempo real é importante!
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.log('👂 Configurando listener de notificações em tempo real...');

    // Query do Firestore
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    // ✅ onSnapshot escuta mudanças em TEMPO REAL
    // Sempre que uma notificação for adicionada/atualizada/removida, este callback é chamado
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('📬 Notificações atualizadas em tempo real:', snapshot.size);
        
        // 📊 Monitorar leitura
        firestoreMonitor.trackRead('notifications', snapshot.size, {
          userId: user.uid,
          type: 'full_list_realtime',
          isRealtime: true
        });
        
        const notificationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setNotifications(notificationsData);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Erro ao escutar notificações:', error);
        setLoading(false);
      }
    );

    // ✅ IMPORTANTE: Cleanup ao desmontar componente
    return () => {
      console.log('🧹 Removendo listener de notificações');
      unsubscribe();
    };
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: new Date()
      });
      
      // ❌ NÃO precisa buscar novamente!
      // O listener onSnapshot vai atualizar automaticamente
      console.log('✅ Notificação marcada como lida');
    } catch (error) {
      console.error('❌ Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      
      if (unreadNotifications.length === 0) {
        console.log('ℹ️ Nenhuma notificação não lida');
        return;
      }

      console.log(`📝 Marcando ${unreadNotifications.length} notificações como lidas...`);

      // Usa Promise.all para executar em paralelo
      const promises = unreadNotifications.map(notif => 
        updateDoc(doc(db, 'notifications', notif.id), { 
          read: true,
          readAt: new Date()
        })
      );
      
      await Promise.all(promises);
      
      // ❌ NÃO precisa buscar novamente - o listener faz isso automaticamente
      console.log('✅ Todas as notificações marcadas como lidas');
    } catch (error) {
      console.error('❌ Erro ao marcar todas como lidas:', error);
    }
  };

  const deleteAllNotifications = async () => {
    if (!window.confirm('Tem certeza que deseja apagar TODAS as notificações? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      if (notifications.length === 0) {
        console.log('ℹ️ Nenhuma notificação para apagar');
        return;
      }

      console.log(`🗑️ Apagando ${notifications.length} notificações...`);

      // Usar batch para deletar em lote (mais eficiente)
      const batch = writeBatch(db);
      
      notifications.forEach(notif => {
        const notifRef = doc(db, 'notifications', notif.id);
        batch.delete(notifRef);
      });

      await batch.commit();
      
      // ❌ NÃO precisa buscar novamente - o listener faz isso automaticamente
      console.log('✅ Todas as notificações foram apagadas');
    } catch (error) {
      console.error('❌ Erro ao apagar notificações:', error);
      alert('Erro ao apagar notificações. Tente novamente.');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Faça login para ver suas notificações</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Carregando notificações...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FaBell className="text-blue-600" />
            Notificações
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 animate-pulse">
                {unreadCount}
              </span>
            )}
          </h3>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                title="Marcar todas como lidas"
              >
                <FaCheck className="inline mr-1" />
                Marcar todas como lidas
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={deleteAllNotifications}
                className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1 font-medium transition-colors"
                title="Apagar todas as notificações"
              >
                <FaTrash size={12} />
                Apagar todas
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaBell className="mx-auto text-4xl mb-2 opacity-50" />
            <p className="text-lg font-medium">Nenhuma notificação ainda</p>
            <p className="text-sm mt-1">Quando você receber notificações, elas aparecerão aqui</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${
                        !notification.read ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                          Nova
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">
                      {notification.body}
                    </p>
                    
                    {/* Metadados da notificação */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>
                        🕐 {notification.createdAt?.toDate?.()?.toLocaleString('pt-BR') || 
                           new Date(notification.createdAt).toLocaleString('pt-BR')}
                      </span>
                      {notification.data?.type && (
                        <span className="bg-gray-200 px-2 py-0.5 rounded">
                          {notification.data.type}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="ml-2 p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="Marcar como lida"
                    >
                      <FaCheck size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Indicador de atualização em tempo real */}
      {notifications.length > 0 && (
        <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>Atualizando em tempo real ⚡</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsList;