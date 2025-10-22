import React, { memo } from 'react';

/**
 * OffersSection - Seção de ofertas do dia
 * Componente otimizado com memo
 */
const OffersSection = memo(() => {
  return (
    <div className="container mx-auto px-4 pb-8">
      <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-3xl shadow-2xl p-6 border-2 border-orange-300 relative overflow-hidden">
        {/* Efeito de fogo de fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-orange-500 opacity-30 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-ping"></div>
        
        {/* Partículas de fogo */}
        <div className="absolute -top-2 -left-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
        <div className="absolute -top-1 -right-4 w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute -bottom-2 -left-3 w-2 h-2 bg-red-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-1 -right-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
        
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl animate-bounce">🔥</span>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              OFERTA DO DIA
            </h2>
            <span className="text-4xl animate-bounce" style={{animationDelay: '0.2s'}}>🔥</span>
          </div>
          
          <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
            Produtos com preços especiais e descontos imperdíveis! 
            Não perca essas ofertas exclusivas.
          </p>
          
          <a
            href="/ofertas"
            className="inline-flex items-center gap-3 bg-white text-red-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden"
            aria-label="Ver ofertas do dia"
          >
            {/* Efeito de fogo no botão */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-orange-500 opacity-20 animate-pulse"></div>
            <span className="text-2xl relative z-10">🔥</span>
            <span className="relative z-10">VER OFERTAS</span>
            <span className="text-2xl relative z-10">🔥</span>
          </a>
        </div>
      </div>
    </div>
  );
});

OffersSection.displayName = 'OffersSection';

export default OffersSection;












