import React, { useState, useEffect, memo, useCallback } from 'react';
import { FaArrowUp } from 'react-icons/fa';

/**
 * ScrollToTopButton - Botão para voltar ao topo otimizado
 * Suporte completo a teclado e acessibilidade
 */
const ScrollToTopButton = memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Controla visibilidade do botão
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
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
    return () => window.removeEventListener("scroll", throttledToggle);
  }, []);

  // Função para scroll suave ao topo
  const scrollToTop = useCallback(() => {
    setIsScrolling(true);
    
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    // Reset do estado após animação
    setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  }, []);

  // Suporte a teclado
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToTop();
    }
  }, [scrollToTop]);

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      onKeyDown={handleKeyDown}
      className={`fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 group focus:outline-none focus:ring-4 focus:ring-blue-300 ${
        isScrolling ? 'animate-bounce' : 'hover:scale-110'
      }`}
      aria-label="Voltar ao topo da página"
      title="Voltar ao topo (Enter ou Espaço)"
    >
      <FaArrowUp className={`text-xl transition-transform ${
        isScrolling ? 'animate-pulse' : 'group-hover:translate-y-[-2px]'
      }`} />
    </button>
  );
});

ScrollToTopButton.displayName = 'ScrollToTopButton';

export default ScrollToTopButton;