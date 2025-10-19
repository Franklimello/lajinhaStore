import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAuth } from 'firebase/auth';

export default function LogoutDiagnostic() {
  const { user, loading } = useAuth();
  const [authState, setAuthState] = useState(null);
  const [logoutEvents, setLogoutEvents] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    
    // Monitorar mudanças no Firebase Auth diretamente
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const timestamp = new Date().toLocaleTimeString();
      
      if (!user && authState) {
        // Logout detectado
        const logoutEvent = {
          timestamp,
          reason: 'Firebase Auth state changed to null',
          previousUser: authState.uid,
          stack: new Error().stack
        };
        
        setLogoutEvents(prev => [...prev.slice(-9), logoutEvent]);
        console.error('🚨 LOGOUT DETECTADO:', logoutEvent);
      }
      
      setAuthState(user);
    });

    return () => unsubscribe();
  }, [authState]);

  // Monitorar mudanças no contexto
  useEffect(() => {
    if (!user && authState) {
      const timestamp = new Date().toLocaleTimeString();
      const logoutEvent = {
        timestamp,
        reason: 'AuthContext user became null',
        previousUser: authState.uid,
        stack: new Error().stack
      };
      
      setLogoutEvents(prev => [...prev.slice(-9), logoutEvent]);
      console.error('🚨 LOGOUT DETECTADO NO CONTEXTO:', logoutEvent);
    }
  }, [user, authState]);

  // Monitorar erros globais
  useEffect(() => {
    const handleError = (event) => {
      if (event.error && event.error.message.includes('auth')) {
        const timestamp = new Date().toLocaleTimeString();
        const logoutEvent = {
          timestamp,
          reason: 'Global error with auth',
          error: event.error.message,
          stack: event.error.stack
        };
        
        setLogoutEvents(prev => [...prev.slice(-9), logoutEvent]);
        console.error('🚨 ERRO DE AUTH DETECTADO:', logoutEvent);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-red-900/90 text-white p-4 rounded-lg max-w-md text-xs z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-red-300">🚨 Logout Diagnostic</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-2 py-1 rounded text-xs ${
              isMonitoring ? 'bg-green-600' : 'bg-gray-600'
            }`}
          >
            {isMonitoring ? 'Monitoring' : 'Start'}
          </button>
          <button 
            onClick={() => setLogoutEvents([])}
            className="px-2 py-1 bg-gray-600 rounded text-xs"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="space-y-1 mb-2">
        <div>Context: {user ? '✅ Logado' : '❌ Deslogado'}</div>
        <div>Firebase: {authState ? '✅ Logado' : '❌ Deslogado'}</div>
        <div>Loading: {loading ? '⏳ Sim' : '✅ Não'}</div>
        <div>Events: {logoutEvents.length}</div>
      </div>
      
      {logoutEvents.length > 0 && (
        <div className="max-h-32 overflow-y-auto">
          {logoutEvents.map((event, index) => (
            <div key={index} className="text-xs border-b border-red-700 pb-1 mb-1">
              <div className="text-red-300">{event.timestamp}</div>
              <div className="font-mono text-red-200">{event.reason}</div>
              {event.previousUser && (
                <div className="text-red-400">User: {event.previousUser}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



