import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAuth } from 'firebase/auth';

export default function AuthDebug() {
  const { user, loading } = useAuth();
  const [authState, setAuthState] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    
    // Monitorar mudanças no Firebase Auth diretamente
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = {
        timestamp,
        source: 'Firebase Auth',
        user: user ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        } : null
      };
      
      setLogs(prev => [...prev.slice(-9), logEntry]); // Manter apenas os últimos 10 logs
      setAuthState(user);
    });

    return () => unsubscribe();
  }, []);

  // Monitorar mudanças no contexto
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      source: 'AuthContext',
      user: user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      } : null
    };
    
    setLogs(prev => [...prev.slice(-9), logEntry]);
  }, [user]);

  if (process.env.NODE_ENV === 'production') {
    return null; // Não mostrar em produção
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg max-w-sm text-xs z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold">🔐 Auth Debug</h3>
        <button 
          onClick={() => setLogs([])}
          className="text-gray-400 hover:text-white"
        >
          Clear
        </button>
      </div>
      
      <div className="space-y-1 mb-2">
        <div>Context: {user ? '✅ Logado' : '❌ Deslogado'}</div>
        <div>Firebase: {authState ? '✅ Logado' : '❌ Deslogado'}</div>
        <div>Loading: {loading ? '⏳ Sim' : '✅ Não'}</div>
      </div>
      
      <div className="max-h-32 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="text-xs border-b border-gray-700 pb-1 mb-1">
            <div className="text-gray-400">{log.timestamp}</div>
            <div className="font-mono">
              {log.source}: {log.user ? `✅ ${log.user.email}` : '❌ null'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



