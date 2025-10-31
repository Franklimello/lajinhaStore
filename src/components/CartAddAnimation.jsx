import { useState, useEffect } from 'react';

/**
 * Componente de animação "+1" que aparece quando um produto é adicionado ao carrinho
 * 
 * @param {number} count - Número total de unidades adicionadas nesta sessão
 * @param {boolean} show - Se deve mostrar a animação
 * @param {string} className - Classes CSS adicionais
 */
export default function CartAddAnimation({ count = 1, show = false, className = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (show && count > 0) {
      setIsVisible(true);
      setKey(prev => prev + 1); // Força re-render para nova animação
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 1500); // Animação desaparece após 1.5s

      return () => clearTimeout(timer);
    }
  }, [show, count]);

  if (!isVisible) return null;

  return (
    <div 
      key={key}
      className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 ${className}`}
      style={{
        animation: 'cartAddPulse 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }}
    >
      <div className="flex items-center justify-center">
        <span 
          className="text-3xl font-black text-green-500 drop-shadow-lg"
          style={{
            textShadow: '0 2px 12px rgba(34, 197, 94, 0.6), 0 0 24px rgba(34, 197, 94, 0.4)',
            animation: 'cartAddFade 1.5s ease-out forwards',
          }}
        >
          +{count > 1 ? count : 1}
        </span>
      </div>
      <style>{`
        @keyframes cartAddPulse {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.4) translateY(20px);
          }
          30% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.3) translateY(-15px);
          }
          60% {
            transform: translate(-50%, -50%) scale(1.1) translateY(-25px);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9) translateY(-45px);
          }
        }
        @keyframes cartAddFade {
          0%, 40% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

