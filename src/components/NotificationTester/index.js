import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaBell, FaPaperPlane, FaSpinner } from 'react-icons/fa';

const NotificationTester = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('🔔 Teste de Notificação');
  const [body, setBody] = useState('Esta é uma notificação de teste do sistema!');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');

  const sendTestNotification = async () => {
    if (!user) {
      setResult('❌ Faça login para testar notificações');
      return;
    }

    setSending(true);
    setResult('');

    try {
      const response = await fetch('https://us-central1-compreaqui-324df.cloudfunctions.net/sendNotification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          title,
          body,
          data: {
            type: 'test',
            url: '/notificacoes'
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult('✅ Notificação de teste enviada com sucesso!');
      } else {
        setResult(`❌ Erro: ${data.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      setResult(`❌ Erro de conexão: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Faça login para testar notificações</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaBell className="mr-2 text-blue-500" /> Teste de Notificações
      </h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="testTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Título da Notificação
          </label>
          <input
            type="text"
            id="testTitle"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={sending}
          />
        </div>
        
        <div>
          <label htmlFor="testBody" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Mensagem
          </label>
          <textarea
            id="testBody"
            rows="3"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={sending}
          ></textarea>
        </div>
        
        <button
          onClick={sendTestNotification}
          disabled={sending}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {sending ? (
            <FaSpinner className="animate-spin mr-2" />
          ) : (
            <FaPaperPlane className="mr-2" />
          )}
          Enviar Notificação de Teste
        </button>
        
        {result && (
          <p className={`mt-3 text-center text-sm ${result.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {result}
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificationTester;
