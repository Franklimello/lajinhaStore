import React, { useState, useEffect, memo, useCallback } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { appConfig } from '../../config/appConfig';

/**
 * ChatWidget - Botão flutuante que redireciona para WhatsApp
 * Versão simplificada sem servidor de chat
 */
const ChatWidget = memo(() => {
  const [isVisible, setIsVisible] = useState(false);

  // Botão sempre visível
  useEffect(() => {
    console.log('🔧 ChatWidget: Inicializando...');
    setIsVisible(true);
    console.log('🔧 ChatWidget: Botão deve estar visível');
  }, []);

  // Função para abrir WhatsApp
  const handleWhatsAppClick = useCallback(() => {
    console.log('🔗 Tentando abrir WhatsApp...');
    const phoneNumber = appConfig.CONTACT.WHATSAPP;
    const message = `Olá! Gostaria de fazer um pedido pelo ${appConfig.APP.NAME}.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    console.log('📱 URL WhatsApp:', whatsappUrl);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }, []);

  // Escutar evento customizado para abrir o chat
  useEffect(() => {
    const handleOpenChat = () => {
      console.log('🔧 ChatWidget: Evento openChat recebido!');
      handleWhatsAppClick();
    };

    console.log('🔧 ChatWidget: Adicionando listener para openChat');
    window.addEventListener('openChat', handleOpenChat);
    return () => {
      console.log('🔧 ChatWidget: Removendo listener para openChat');
      window.removeEventListener('openChat', handleOpenChat);
    };
  }, [handleWhatsAppClick]);

  // Suporte a teclado
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleWhatsAppClick();
    }
  }, [handleWhatsAppClick]);

  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        pointerEvents: 'auto'
      }}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🖱️ Botão clicado!');
          // WhatsApp será aberto no link abaixo
          console.log('Abrindo WhatsApp...');
          handleWhatsAppClick();
        }}
        onKeyDown={handleKeyDown}
        style={{
          background: 'linear-gradient(135deg, #25D366, #128C7E)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
          fontSize: '24px',
          pointerEvents: 'auto'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
        }}
        aria-label="Fale conosco pelo WhatsApp"
        title="Fale conosco pelo WhatsApp"
      >
        <FaWhatsapp />
      </button>
    </div>
  );
});

ChatWidget.displayName = 'ChatWidget';

export default ChatWidget;