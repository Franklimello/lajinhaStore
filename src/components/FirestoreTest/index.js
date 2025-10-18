import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../firebase/orders';

const FirestoreTest = () => {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testFirestorePermissions = async () => {
    if (!user) {
      setTestResult('❌ Usuário não autenticado');
      return;
    }

    setLoading(true);
    setTestResult('🔄 Testando permissões...');

    try {
      // Dados de teste
      const testOrderData = {
        userId: user.uid,
        total: 10.00,
        subtotal: 5.00,
        frete: 5.00,
        items: [{
          id: 'test',
          nome: 'Produto Teste',
          quantidade: 1,
          precoUnitario: 5.00,
          subtotal: 5.00
        }],
        endereco: {
          nome: 'Cliente Teste',
          rua: 'Rua Teste',
          telefone: '19999999999'
        },
        paymentReference: 'TEST-' + Date.now(),
        qrData: 'test-qr-data',
        metadata: {
          pixKey: 'test-key',
          merchantName: 'Teste',
          originalOrderId: 'TEST-' + Date.now()
        }
      };

      console.log('Testando com dados:', testOrderData);
      console.log('Usuário UID:', user.uid);

      const result = await createOrder(testOrderData);

      if (result.success) {
        setTestResult(`✅ Sucesso! Pedido criado com ID: ${result.orderId}`);
      } else {
        setTestResult(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro no teste:', error);
      setTestResult(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">🧪 Teste de Permissões Firestore</h2>
      
      <div className="mb-4">
        <p><strong>Usuário:</strong> {user ? user.email : 'Não logado'}</p>
        <p><strong>UID:</strong> {user ? user.uid : 'N/A'}</p>
      </div>

      <button
        onClick={testFirestorePermissions}
        disabled={loading || !user}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Testando...' : 'Testar Permissões'}
      </button>

      {testResult && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <pre className="text-sm">{testResult}</pre>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Instruções:</strong></p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Certifique-se de estar logado</li>
          <li>Configure as regras do Firestore</li>
          <li>Clique em "Testar Permissões"</li>
          <li>Verifique o resultado</li>
        </ol>
      </div>
    </div>
  );
};

export default FirestoreTest;
