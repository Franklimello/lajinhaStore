import React, { useState } from 'react';
import { initializeNotifications, checkNotificationsCollection, clearTestNotifications } from '../../utils/initNotifications';
import { FaCog, FaCheck, FaTrash, FaInfoCircle } from 'react-icons/fa';

const NotificationInitializer = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [collectionInfo, setCollectionInfo] = useState(null);

  const handleInitialize = async () => {
    setLoading(true);
    setResult('');

    try {
      const result = await initializeNotifications();
      
      if (result.success) {
        setResult(`✅ ${result.message}\n📝 IDs: ${result.notificationIds.join(', ')}`);
      } else {
        setResult(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      setResult(`❌ Erro inesperado: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    setLoading(true);
    setResult('');

    try {
      const info = await checkNotificationsCollection();
      setCollectionInfo(info);
      
      if (info.exists) {
        setResult(`✅ Coleção existe\n📊 Total: ${info.count} notificações`);
      } else {
        setResult(`❌ Coleção não existe ou erro: ${info.error}`);
      }
    } catch (error) {
      setResult(`❌ Erro inesperado: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Tem certeza que deseja limpar TODAS as notificações? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const result = await clearTestNotifications();
      
      if (result.success) {
        setResult(`✅ ${result.message}`);
      } else {
        setResult(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      setResult(`❌ Erro inesperado: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <FaCog className="mr-2 text-blue-500" /> 
        Inicializador de Notificações
      </h2>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <FaInfoCircle className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Este componente ajuda a:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Verificar se a coleção <code>notifications</code> existe</li>
              <li>Criar notificações de teste para testar o sistema</li>
              <li>Limpar dados de teste quando necessário</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            onClick={handleCheck}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <FaInfoCircle />
            Verificar Coleção
          </button>

          <button
            onClick={handleInitialize}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <FaCheck />
            Inicializar
          </button>

          <button
            onClick={handleClear}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <FaTrash />
            Limpar Testes
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Processando...</span>
          </div>
        )}

        {result && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        {collectionInfo && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Informações da Coleção:</h3>
            <div className="text-sm text-green-700">
              <p><strong>Existe:</strong> {collectionInfo.exists ? 'Sim' : 'Não'}</p>
              <p><strong>Total de notificações:</strong> {collectionInfo.count}</p>
              {collectionInfo.error && (
                <p className="text-red-600"><strong>Erro:</strong> {collectionInfo.error}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationInitializer;
