import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { validateAllRules, testSecurityRules } from '../../utils/validateFirestoreRules';

const FirestoreRulesValidator = () => {
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [securityResults, setSecurityResults] = useState(null);

  const runValidation = async () => {
    if (!user) {
      alert('Você precisa estar logado para executar a validação');
      return;
    }

    setLoading(true);
    try {
      const validationResults = await validateAllRules(user);
      setResults(validationResults);
    } catch (error) {
      console.error('Erro na validação:', error);
      alert('Erro na validação: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const runSecurityTest = async () => {
    if (!user) {
      alert('Você precisa estar logado para executar o teste de segurança');
      return;
    }

    setLoading(true);
    try {
      await testSecurityRules(user);
      setSecurityResults('Teste de segurança executado. Verifique o console.');
    } catch (error) {
      console.error('Erro no teste de segurança:', error);
      alert('Erro no teste de segurança: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.uid === "ZG5D6IrTRTZl5SDoEctLAtr4WkE2";

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🛡️ Validador de Regras do Firestore</h2>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">👤 Informações do Usuário</h3>
        <p><strong>Email:</strong> {user?.email || 'Não logado'}</p>
        <p><strong>UID:</strong> {user?.uid || 'N/A'}</p>
        <p><strong>Tipo:</strong> {isAdmin ? '🔑 ADMINISTRADOR' : '👤 USUÁRIO COMUM'}</p>
      </div>

      {!user && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-red-800">❌ Você precisa estar logado para executar a validação</p>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={runValidation}
          disabled={loading || !user}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
        >
          {loading ? '🔄 Executando Validação...' : '🧪 Executar Validação das Regras'}
        </button>

        <button
          onClick={runSecurityTest}
          disabled={loading || !user}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold"
        >
          {loading ? '🔄 Executando Teste...' : '🔒 Testar Segurança'}
        </button>
      </div>

      {results && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-4">📊 Resultados da Validação</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded border">
              <h4 className="font-semibold text-blue-600 mb-2">📋 Pedidos</h4>
              <ul className="text-sm space-y-1">
                <li>Create: {results.pedidos.create ? '✅' : '❌'}</li>
                <li>Read: {results.pedidos.read ? '✅' : '❌'}</li>
                <li>Update: {results.pedidos.update ? '✅' : '❌'}</li>
                <li>Delete: {results.pedidos.delete ? '✅' : '❌'}</li>
              </ul>
            </div>

            <div className="p-3 bg-white rounded border">
              <h4 className="font-semibold text-green-600 mb-2">🛍️ Produtos</h4>
              <ul className="text-sm space-y-1">
                <li>Read: {results.produtos.read ? '✅' : '❌'}</li>
                <li>Write: {results.produtos.write ? '✅' : '❌'}</li>
              </ul>
            </div>

            <div className="p-3 bg-white rounded border">
              <h4 className="font-semibold text-purple-600 mb-2">📂 Categorias</h4>
              <ul className="text-sm space-y-1">
                <li>Read: {results.categorias.read ? '✅' : '❌'}</li>
                <li>Write: {results.categorias.write ? '✅' : '❌'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {securityResults && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">🔒 Teste de Segurança</h3>
          <p className="text-yellow-700">{securityResults}</p>
          <p className="text-sm text-yellow-600 mt-2">
            Verifique o console do navegador para detalhes completos.
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">📋 Instruções</h3>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>Execute a validação para testar as regras atuais</li>
          <li>Execute o teste de segurança para verificar isolamento de dados</li>
          <li>Verifique o console do navegador para logs detalhados</li>
          <li>Se houver falhas, ajuste as regras do Firestore</li>
        </ol>
      </div>

      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-800 mb-2">⚠️ Importante</h3>
        <ul className="text-sm text-red-700 space-y-1">
          <li>• Este validador cria dados de teste no Firestore</li>
          <li>• Execute apenas em ambiente de desenvolvimento</li>
          <li>• Limpe os dados de teste após a validação</li>
          <li>• Não execute em produção sem cuidado</li>
        </ul>
      </div>
    </div>
  );
};

export default FirestoreRulesValidator;
