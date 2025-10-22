import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook para lazy hydration
 * Adia a renderização de componentes não críticos até a interação do usuário
 */
export const useLazyHydration = (delay = 0) => {
  const [shouldHydrate, setShouldHydrate] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const timeoutRef = useRef(null);
  const interactionRef = useRef(false);

  // Detecta interações do usuário
  useEffect(() => {
    const handleInteraction = () => {
      if (!interactionRef.current) {
        interactionRef.current = true;
        setShouldHydrate(true);
      }
    };

    // Eventos que indicam interação do usuário
    const events = [
      'mousedown',
      'mousemove', 
      'keydown',
      'scroll',
      'touchstart',
      'click'
    ];

    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, []);

  // Timer para hydration automática
  useEffect(() => {
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setShouldHydrate(true);
      }, delay);
    } else {
      setShouldHydrate(true);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay]);

  // Callback para marcar como hidratado
  const markAsHydrated = useCallback(() => {
    setIsHydrated(true);
  }, []);

  return {
    shouldHydrate,
    isHydrated,
    markAsHydrated
  };
};












