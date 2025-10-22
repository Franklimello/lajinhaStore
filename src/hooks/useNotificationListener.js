import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook customizado para escutar mensagens do Service Worker
 * e lidar com cliques em notificações
 */
export const useNotificationListener = () => {
  const navigate = useNavigate();

  // Handler para mensagens do Service Worker
  const handleServiceWorkerMessage = useCallback((event) => {
    console.log('📬 Mensagem do SW recebida:', event.data);

    if (event.data?.type === 'NOTIFICATION_CLICK') {
      const { url, data } = event.data;
      
      // Navega para a URL da notificação
      if (url && url !== '/') {
        navigate(url);
      }

      // Lógica adicional baseada no tipo de notificação
      switch (data?.type) {
        case 'new_order':
          handleNewOrderClick(data);
          break;
        case 'order_update':
          handleOrderUpdateClick(data);
          break;
        case 'special_offer':
          handleSpecialOfferClick(data);
          break;
        case 'cart_abandonment':
          handleCartAbandonmentClick(data);
          break;
        default:
          console.log('Tipo de notificação desconhecido:', data?.type);
      }
    }
  }, [navigate]);

  // Handlers específicos por tipo
  const handleNewOrderClick = (data) => {
    console.log('🛒 Novo pedido clicado:', data);
    // Atualiza lista de pedidos, toca som, etc.
  };

  const handleOrderUpdateClick = (data) => {
    console.log('📦 Status de pedido clicado:', data);
    // Atualiza status do pedido específico
  };

  const handleSpecialOfferClick = (data) => {
    console.log('🎉 Oferta especial clicada:', data);
    // Trackeia clique em analytics
  };

  const handleCartAbandonmentClick = (data) => {
    console.log('🛒 Carrinho abandonado clicado:', data);
    // Restaura carrinho do usuário
  };

  useEffect(() => {
    // Registra listener para mensagens do Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    // Cleanup
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [handleServiceWorkerMessage]);

  // Método para enviar mensagem ao Service Worker
  const sendMessageToSW = useCallback(async (message) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }, []);

  // Método para forçar atualização do Service Worker
  const updateServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        console.log('🔄 Service Worker atualizado');
      }
    }
  }, []);

  return {
    sendMessageToSW,
    updateServiceWorker
  };
};