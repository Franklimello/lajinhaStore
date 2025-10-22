import React, { useState } from 'react';
import { NotificationService } from '../../services/notificationService';
import { FaBell, FaPaperPlane } from 'react-icons/fa';

const AdminNotifications = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      setResult('❌ Preencha título e mensagem');
      return;
    }

    setSending(true);
    setResult('');

    try {
      // Aqui você enviaria para todos os usuários ou um usuário específico
      // Por enquanto, vamos simular o envio
      console.log('Enviando notificação:', { title, message });
      
      setResult('✅ Notificação enviada com sucesso!');
      setTitle('');
      setMessage('');
    } catch (error) {
      setResult('❌ Erro ao enviar notificação');
    }

    setSending(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FaBell className="text-blue-600" />
        Enviar Notificação
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título da Notificação
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Pedido Confirmado!"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mensagem
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ex: Seu pedido foi confirmado e está sendo preparado!"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={handleSendNotification}
          disabled={sending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <FaPaperPlane />
          {sending ? 'Enviando...' : 'Enviar Notificação'}
        </button>
        
        {result && (
          <div className={`p-3 rounded-md text-sm ${
            result.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
