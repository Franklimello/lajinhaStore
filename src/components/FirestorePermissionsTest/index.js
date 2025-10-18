import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, query, limit } from 'firebase/firestore';

const FirestorePermissionsTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testCollections = [
    'produtos',
    'categorias', 
    'pedidos',
    'usuarios',
    'notificacoes'
  ];

  const testPermissions = async () => {
    setLoading(true);
    setError('');
    const newResults = {};

    for (const collectionName of testCollections) {
      try {
        console.log(`🔍 Testando coleção: ${collectionName}`);
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef, limit(1));
        const querySnapshot = await getDocs(q);
        
        newResults[collectionName] = {
          success: true,
          count: querySnapshot.size,
          message: `✅ Acesso permitido (${querySnapshot.size} documentos)`
        };
        
        console.log(`✅ ${collectionName}: OK`);
      } catch (error) {
        console.error(`❌ ${collectionName}:`, error);
        newResults[collectionName] = {
          success: false,
          error: error.message,
          message: `❌ Erro: ${error.message}`
        };
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  const getStatusColor = (success) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBg = (success) => {
    return success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        🔥 Teste de Permissões do Firestore
      </h2>
      
      <div className="mb-6">
        <button
          onClick={testPermissions}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testando...' : 'Testar Permissões'}
        </button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Resultados dos Testes:
          </h3>
          
          {testCollections.map(collectionName => {
            const result = results[collectionName];
            if (!result) return null;
            
            return (
              <div
                key={collectionName}
                className={`p-4 rounded-lg border ${getStatusBg(result.success)}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 capitalize">
                      {collectionName}
                    </h4>
                    <p className={`text-sm ${getStatusColor(result.success)}`}>
                      {result.message}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    {result.success ? (
                      <span className="text-green-600 font-bold">✅ OK</span>
                    ) : (
                      <span className="text-red-600 font-bold">❌ ERRO</span>
                    )}
                  </div>
                </div>
                
                {!result.success && result.error && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                    <strong>Erro:</strong> {result.error}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">Erro Geral:</h4>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Como Resolver:</h4>
        <ol className="text-blue-700 text-sm space-y-1">
          <li>1. Acesse o Firebase Console</li>
          <li>2. Vá em Firestore Database > Regras</li>
          <li>3. Use as regras do arquivo <code>firestore-rules-permissivas.rules</code></li>
          <li>4. Clique em "Publicar"</li>
          <li>5. Teste novamente</li>
        </ol>
      </div>
    </div>
  );
};

export default FirestorePermissionsTest;

