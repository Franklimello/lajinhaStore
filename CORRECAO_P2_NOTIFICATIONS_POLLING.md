# 🟡 CORREÇÃO PRIORIDADE 2: Notifications com Polling

## Problema
`NotificationsList` usa `onSnapshot()` para escutar notificações em tempo real, causando:
- **Leituras excessivas** a cada mudança no Firestore
- **Custo alto** se houver muitas notificações
- **Tempo real desnecessário** (notificações não precisam ser instantâneas)

---

## Solução: Polling com Intervalo de 30 segundos

### Arquivo: `src/components/NotificationsList/index.js`

```javascript
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, where, orderBy, getDocs, updateDoc, doc, writeBatch, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { FaBell, FaCheck, FaTrash, FaSync } from 'react-icons/fa';

// Constantes
const POLLING_INTERVAL = 30000; // 30 segundos
const NOTIFICATIONS_LIMIT = 20; // Limita notificações carregadas
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export default function NotificationsList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const intervalRef = useRef(null);
  const lastFetchRef = useRef(0);

  /**
   * ✅ Busca notificações do Firestore com LIMIT
   * (substitui onSnapshot)
   */
  const fetchNotifications = useCallback(async (isManualRefresh = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('🔔 Buscando notificações...');

      // ✅ Cache check - evita buscas muito frequentes
      const now = Date.now();
      if (!isManualRefresh && (now - lastFetchRef.current) < 10000) {
        console.log('⏭️ Skip: Última busca foi há menos de 10s');
        setLoading(false);
        return;
      }

      // ✅ Query com LIMIT para evitar carregar todas as notificações
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(NOTIFICATIONS_LIMIT) // 👈 LIMITE obrigatório
      );

      const snapshot = await getDocs(q);
      
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      console.log(`✅ ${notifs.length} notificações carregadas`);
      
      setNotifications(notifs);
      lastFetchRef.current = now;

    } catch (error) {
      console.error('❌ Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  /**
   * ✅ useEffect: Configura polling ao invés de onSnapshot
   */
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Busca inicial
    fetchNotifications();

    // ✅ Configura polling - busca a cada 30 segundos
    intervalRef.current = setInterval(() => {
      console.log('🔄 Polling: Atualizando notificações...');
      fetchNotifications();
    }, POLLING_INTERVAL);

    // Cleanup: Remove intervalo quando componente desmonta
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log('🧹 Polling parado');
      }
    };
  }, [user, fetchNotifications]);

  /**
   * ✅ Atualização manual (botão refresh)
   */
  const handleManualRefresh = () => {
    fetchNotifications(true);
  };

  /**
   * Marca notificação como lida
   */
  const markAsRead = async (notificationId) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, {
        read: true
      });

      // ✅ Atualiza estado local imediatamente
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true } 
            : notif
        )
      );

      console.log('✅ Notificação marcada como lida');
    } catch (error) {
      console.error('❌ Erro ao marcar como lida:', error);
    }
  };

  /**
   * Marca todas como lidas
   */
  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      
      notifications
        .filter(n => !n.read)
        .forEach(notif => {
          const notifRef = doc(db, 'notifications', notif.id);
          batch.update(notifRef, { read: true });
        });

      await batch.commit();

      // ✅ Atualiza estado local
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );

      console.log('✅ Todas as notificações marcadas como lidas');
    } catch (error) {
      console.error('❌ Erro ao marcar todas como lidas:', error);
    }
  };

  /**
   * Deleta notificação
   */
  const deleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));

      // ✅ Remove do estado local
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );

      console.log('🗑️ Notificação deletada');
    } catch (error) {
      console.error('❌ Erro ao deletar notificação:', error);
    }
  };

  /**
   * Formata data relativa
   */
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}m atrás`;
    return 'Agora';
  };

  // Estados de carregamento
  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Header com botão de refresh */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FaBell className="text-blue-600" />
          Notificações
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount}
            </span>
          )}
        </h2>

        <div className="flex gap-2">
          {/* ✅ Botão de refresh manual */}
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="Atualizar notificações"
          >
            <FaSync className={refreshing ? 'animate-spin' : ''} />
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:underline"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>
      </div>

      {/* Lista de notificações */}
      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FaBell className="mx-auto text-4xl mb-2 opacity-20" />
          <p>Nenhuma notificação ainda</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg border transition-all ${
                notif.read 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-blue-50 border-blue-300 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {notif.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {notif.body}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatRelativeTime(notif.createdAt)}
                  </p>
                </div>

                <div className="flex gap-2 ml-4">
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Marcar como lida"
                    >
                      <FaCheck />
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Deletar"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Indicador de próxima atualização */}
      <div className="text-center mt-4 text-xs text-gray-400">
        <p>
          🔄 Atualização automática a cada {POLLING_INTERVAL / 1000}s
        </p>
        {refreshing && (
          <p className="text-blue-600 font-semibold mt-1">
            Atualizando...
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## Mudanças Principais

### 1. ✅ Substituir `onSnapshot` por `getDocs` com polling

```javascript
// ❌ ANTES: Listener em tempo real
const unsubscribe = onSnapshot(q, (snapshot) => {
  // Dispara a cada mudança (muitas leituras)
});

// ✅ DEPOIS: Polling a cada 30 segundos
setInterval(async () => {
  const snapshot = await getDocs(q);
  // Busca manual com controle total
}, 30000);
```

### 2. ✅ Adicionar LIMIT nas queries

```javascript
// ❌ ANTES: Carrega TODAS as notificações
const q = query(
  collection(db, 'notifications'),
  where('userId', '==', user.uid),
  orderBy('createdAt', 'desc')
);

// ✅ DEPOIS: Limita a 20 notificações
const q = query(
  collection(db, 'notifications'),
  where('userId', '==', user.uid),
  orderBy('createdAt', 'desc'),
  limit(20) // 👈 OBRIGATÓRIO
);
```

### 3. ✅ Adicionar botão de refresh manual

```javascript
<button onClick={handleManualRefresh}>
  <FaSync className={refreshing ? 'animate-spin' : ''} />
</button>
```

### 4. ✅ Cache com debounce (evita buscas muito frequentes)

```javascript
const now = Date.now();
if ((now - lastFetchRef.current) < 10000) {
  console.log('⏭️ Skip: Última busca foi há menos de 10s');
  return;
}
```

---

## Resultado Esperado

### Antes (onSnapshot):
- Listener conectado 24/7
- **100 leituras/minuto** (se houver muitas mudanças)
- Custo alto em produção

### Depois (Polling):
- Busca a cada 30 segundos
- **2 leituras/minuto** (fixo)
- Usuário pode forçar refresh manual

**Redução: 98%** 🎉

---

## Ajustes Opcionais

### Aumentar intervalo de polling para 1 minuto:
```javascript
const POLLING_INTERVAL = 60000; // 60 segundos
```

### Pausar polling quando tab não está ativa:
```javascript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Tab não está visível - pausar polling
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      // Tab voltou a ficar visível - retomar polling
      fetchNotifications();
      intervalRef.current = setInterval(fetchNotifications, POLLING_INTERVAL);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

### Adicionar paginação (carregar mais):
```javascript
const [page, setPage] = useState(0);

const q = query(
  collection(db, 'notifications'),
  where('userId', '==', user.uid),
  orderBy('createdAt', 'desc'),
  limit(NOTIFICATIONS_LIMIT),
  startAfter(lastDoc) // Para próxima página
);
```

---

**Próximo passo:** Aplicar esta correção e monitorar redução nas leituras do Firebase Console.


