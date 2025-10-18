import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const FirestoreDiagnostic = () => {
  const { user } = useAuth();
  const [diagnostic, setDiagnostic] = useState({
    auth: 'Verificando...',
    firestore: 'Verificando...',
    permissions: 'Verificando...'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostic();
  }, [user]);

  const runDiagnostic = async () => {
    const results = {
      auth: 'Verificando...',
      firestore: 'Verificando...',
      permissions: 'Verificando...'
    };

    // 1. Verificar autenticação
    if (user) {
      results.auth = `✅ Autenticado: ${user.email} (UID: ${user.uid})`;
    } else {
      results.auth = '❌ Não autenticado';
    }

    // 2. Verificar conexão com Firestore
    try {
      const testCollection = collection(db, 'test');
      await getDocs(testCollection);
      results.firestore = '✅ Firestore conectado';
    } catch (error) {
      results.firestore = `❌ Erro Firestore: ${error.message}`;
    }

    // 3. Testar permissões
    if (user) {
      try {
        const testData = {
          userId: user.uid,
          test: true,
          timestamp: new Date()
        };
        
        const testCollection = collection(db, 'test');
        const docRef = await addDoc(testCollection, testData);
        results.permissions = `✅ Permissões OK (Doc ID: ${docRef.id})`;
      } catch (error) {
        results.permissions = `❌ Erro permissões: ${error.message} (Código: ${error.code})`;
      }
    } else {
      results.permissions = '❌ Não autenticado - não é possível testar permissões';
    }

    setDiagnostic(results);
    setLoading(false);
  };

  const testCreateOrder = async () => {
    if (!user) {
      alert('Você precisa estar logado para testar');
      return;
    }

    try {
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

      const testCollection = collection(db, 'pedidos');
      const docRef = await addDoc(testCollection, testOrderData);
      alert(`✅ Pedido de teste criado com sucesso! ID: ${docRef.id}`);
    } catch (error) {
      alert(`❌ Erro ao criar pedido de teste: ${error.message} (Código: ${error.code})`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🔍 Diagnóstico do Firestore</h2>
      
      {loading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Executando diagnóstico...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">🔐 Autenticação</h3>
            <p className="text-sm">{diagnostic.auth}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">🔥 Firestore</h3>
            <p className="text-sm">{diagnostic.firestore}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">🛡️ Permissões</h3>
            <p className="text-sm">{diagnostic.permissions}</p>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={runDiagnostic}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              🔄 Executar Diagnóstico Novamente
            </button>

            <button
              onClick={testCreateOrder}
              disabled={!user}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              🧪 Testar Criação de Pedido
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Instruções para Resolver</h4>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Acesse o <a href="https://console.firebase.google.com/" target="_blank" className="text-blue-600 underline">Firebase Console</a></li>
              <li>Vá para "Firestore Database" → "Regras"</li>
              <li>Substitua as regras pelo conteúdo do arquivo <code>firestore-rules-temporarias.rules</code></li>
              <li>Clique em "Publicar"</li>
              <li>Execute o diagnóstico novamente</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirestoreDiagnostic;
