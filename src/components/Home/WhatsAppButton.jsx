import React, { useState, useEffect, memo, useCallback } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { appConfig } from '../../config/appConfig';

/**
 * WhatsAppButton - Botão fixo para contato via WhatsApp
 * Com animação de pulso e suporte a acessibilidade
 */
const WhatsAppButton = memo(() => {
  const [isVisible, setIsVisible] = useState(false);

  // Controla visibilidade do botão (aparece após scroll)
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Throttle para melhor performance
    let ticking = false;
    const throttledToggle = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          toggleVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledToggle, { passive: true });
    
    // Mostrar imediatamente se já estiver scrollado
    toggleVisibility();
    
    return () => window.removeEventListener("scroll", throttledToggle);
  }, []);

  // Função para abrir WhatsApp
  const handleWhatsAppClick = useCallback(() => {
    const phoneNumber = appConfig.CONTACT.WHATSAPP;
    const message = 'Olá! Gostaria de fazer um pedido pelo Supermercado Online Lajinha.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }, []);

  // Suporte a teclado
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleWhatsAppClick();
    }
  }, [handleWhatsAppClick]);

  if (!isVisible) return null;

  return (
    <button
      onClick={handleWhatsAppClick}
      onKeyDown={handleKeyDown}
      className="fixed bottom-24 right-8 z-50 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 group focus:outline-none focus:ring-4 focus:ring-green-300 hover:scale-110"
      aria-label="Fale conosco pelo WhatsApp"
      title="Fale conosco pelo WhatsApp"
    >
      <FaWhatsapp className="text-2xl group-hover:rotate-12 transition-transform" />
      
      {/* Badge de "Dúvidas?" */}
      <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg ">
        Dúvidas?
      </span>
    </button>
  );
});

WhatsAppButton.displayName = 'WhatsAppButton';

export default WhatsAppButton;

