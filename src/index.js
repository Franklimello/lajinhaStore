import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker para cache offline e performance
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado com sucesso!');
        console.log('📦 Scope:', registration.scope);
        
        // Verificar atualizações periodicamente
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 Nova versão do Service Worker detectada!');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✨ Nova versão disponível! Recarregue a página para atualizar.');
              
              // Atualização será gerenciada pelo componente ServiceWorkerUpdate no App.js
              console.log('Nova versão disponível! O usuário será notificado.');
            }
          });
        });
      })
      .catch((error) => {
        console.error('❌ Erro ao registrar Service Worker:', error);
      });

    // Recarregar quando novo SW assumir controle
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('🔄 Service Worker atualizado! Recarregando...');
        window.location.reload();
      }
    });
  });

  // Log status do Service Worker
  navigator.serviceWorker.ready.then((registration) => {
    console.log('🎉 Service Worker está ativo e pronto!');
    
    // Verificar caches disponíveis
    caches.keys().then((cacheNames) => {
      console.log('📦 Caches ativos:', cacheNames);
      
      // Estimar tamanho do cache (se disponível)
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then((estimate) => {
          const usedMB = (estimate.usage / 1024 / 1024).toFixed(2);
          const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2);
          console.log(`💾 Armazenamento usado: ${usedMB}MB de ${quotaMB}MB`);
        });
      }
    });
  });
} else {
  console.warn('⚠️ Service Worker não é suportado neste navegador.');
}

