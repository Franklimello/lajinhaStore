import React, { useState, useEffect } from 'react';
import { FaBell, FaBellSlash } from 'react-icons/fa';
import { NotificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

const NotificationPermission = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    setPermission(Notification.permission);
  }, []);

  const handleRequestPermission = async () => {
    if (!user) {
      setMessage('Faça login para receber notificações');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = await NotificationService.requestPermission();
      
      if (token) {
        await NotificationService.saveUserToken(user.uid, token);
        setPermission('granted');
        setMessage('✅ Notificações ativadas! Você receberá atualizações sobre seus pedidos.');
      } else {
        setMessage('❌ Permissão negada. Você não receberá notificações.');
        setPermission('denied');
      }
    } catch (error) {
      setMessage('❌ Erro ao configurar notificações');
    }

    setLoading(false);
  };

  if (permission === 'granted') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2">
          <FaBell className="text-green-600" />
          <span className="text-green-800 font-medium">
            Notificações ativadas
          </span>
        </div>
        <p className="text-green-700 text-sm mt-1">
          Você receberá atualizações sobre seus pedidos
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaBellSlash className="text-blue-600" />
          <div>
            <h3 className="text-blue-800 font-medium">
              Receba notificações sobre seus pedidos
            </h3>
            <p className="text-blue-700 text-sm">
              Fique por dentro das atualizações do seu pedido
            </p>
          </div>
        </div>
        <button
          onClick={handleRequestPermission}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Ativando...' : 'Ativar'}
        </button>
      </div>
      
      {message && (
        <div className="mt-3 p-2 bg-white rounded border">
          <p className="text-sm">{message}</p>
        </div>
      )}
    </div>
  );
};

export default NotificationPermission;
