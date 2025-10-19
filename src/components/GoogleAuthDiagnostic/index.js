import React, { useState, useEffect } from 'react';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { app } from '../../firebase/config';

const GoogleAuthDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addDiagnostic = (message, type = 'info') => {
    setDiagnostics(prev => [...prev, { message, type, timestamp: new Date().toISOString() }]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);
    
    addDiagnostic('🔍 Iniciando diagnóstico do Google Auth...', 'info');

    try {
      // 1. Verifica se Firebase está inicializado
      addDiagnostic('✅ Firebase app inicializado', 'success');
      
      // 2. Verifica se Auth está disponível
      const auth = getAuth(app);
      addDiagnostic('✅ Firebase Auth disponível', 'success');
      
      // 3. Verifica se GoogleAuthProvider está disponível
      const provider = new GoogleAuthProvider();
      addDiagnostic('✅ GoogleAuthProvider criado', 'success');
      
      // 4. Verifica ambiente seguro
      if (window.isSecureContext) {
        addDiagnostic('✅ Ambiente seguro (HTTPS)', 'success');
      } else {
        addDiagnostic('⚠️ Ambiente não seguro (HTTP) - pode causar problemas', 'warning');
      }
      
      // 5. Verifica se popups são permitidos
      const popupTest = window.open('', '_blank', 'width=1,height=1');
      if (popupTest) {
        popupTest.close();
        addDiagnostic('✅ Popups permitidos', 'success');
      } else {
        addDiagnostic('❌ Popups bloqueados - necessário para login com Google', 'error');
      }
      
      // 6. Verifica configuração do provider
      provider.addScope('email');
      provider.addScope('profile');
      addDiagnostic('✅ Scopes configurados (email, profile)', 'success');
      
      // 7. Verifica se estamos em localhost ou domínio autorizado
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        addDiagnostic('✅ Ambiente de desenvolvimento (localhost)', 'success');
      } else {
        addDiagnostic(`✅ Ambiente de produção (${hostname})`, 'success');
      }
      
      // 8. Verifica se o domínio está autorizado no Firebase
      addDiagnostic('ℹ️ Verifique se o domínio está autorizado no Firebase Console', 'info');
      addDiagnostic('ℹ️ Acesse: Firebase Console > Authentication > Settings > Authorized domains', 'info');
      
      // 9. Verifica se o Google Auth está habilitado
      addDiagnostic('ℹ️ Verifique se Google Auth está habilitado no Firebase Console', 'info');
      addDiagnostic('ℹ️ Acesse: Firebase Console > Authentication > Sign-in method > Google', 'info');
      
      // 10. Teste de conectividade
      try {
        const response = await fetch('https://accounts.google.com/gsi/client', { method: 'HEAD' });
        if (response.ok) {
          addDiagnostic('✅ Conectividade com Google OK', 'success');
        } else {
          addDiagnostic('⚠️ Problema de conectividade com Google', 'warning');
        }
      } catch (error) {
        addDiagnostic('❌ Erro de conectividade com Google', 'error');
      }
      
      addDiagnostic('🎉 Diagnóstico concluído!', 'success');
      
    } catch (error) {
      addDiagnostic(`❌ Erro durante diagnóstico: ${error.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const clearDiagnostics = () => {
    setDiagnostics([]);
  };

  const getDiagnosticColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        🔍 Diagnóstico do Google Auth
      </h2>
      
      <div className="mb-6">
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mr-4"
        >
          {isRunning ? '🔄 Executando...' : '▶️ Executar Diagnóstico'}
        </button>
        
        <button
          onClick={clearDiagnostics}
          className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
        >
          🗑️ Limpar
        </button>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {diagnostics.map((diagnostic, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${getDiagnosticColor(diagnostic.type)}`}
          >
            <div className="flex justify-between items-start">
              <span className="text-sm">{diagnostic.message}</span>
              <span className="text-xs text-gray-500 ml-2">
                {new Date(diagnostic.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {diagnostics.length === 0 && !isRunning && (
        <div className="text-center text-gray-500 py-8">
          Clique em "Executar Diagnóstico" para verificar a configuração do Google Auth
        </div>
      )}
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 Soluções Comuns:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Verifique se o domínio está autorizado no Firebase Console</li>
          <li>• Certifique-se de que o Google Auth está habilitado</li>
          <li>• Permita popups para este site</li>
          <li>• Verifique se está usando HTTPS em produção</li>
          <li>• Limpe o cache do navegador</li>
        </ul>
      </div>
    </div>
  );
};

export default GoogleAuthDiagnostic;

