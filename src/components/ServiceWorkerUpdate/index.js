import { useState, useEffect, useRef } from 'react';
import ConfirmModal from '../ConfirmModal';

export default function ServiceWorkerUpdate() {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const updatePromptRef = useRef(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleControllerChange = () => {
        window.location.reload();
      };
      
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      navigator.serviceWorker.ready.then((registration) => {
        const handleUpdateFound = () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✨ Nova versão disponível!');
              updatePromptRef.current = newWorker;
              setShowUpdateModal(true);
            }
          });
        };

        registration.addEventListener('updatefound', handleUpdateFound);
        
        // Verificar se já existe uma atualização pendente
        if (registration.waiting && navigator.serviceWorker.controller) {
          updatePromptRef.current = registration.waiting;
          setShowUpdateModal(true);
        }
      }).catch(err => {
        console.error('Erro no ServiceWorkerUpdate:', err);
      });
    }
  }, []);

  const handleUpdate = () => {
    if (updatePromptRef.current) {
      updatePromptRef.current.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
    setShowUpdateModal(false);
  };

  return (
    <ConfirmModal
      isOpen={showUpdateModal}
      onClose={() => setShowUpdateModal(false)}
      onConfirm={handleUpdate}
      title="Nova Versão Disponível"
      message="Uma nova versão do aplicativo está disponível! Deseja atualizar agora?"
      confirmText="Atualizar"
      cancelText="Depois"
      variant="info"
    />
  );
}

