import React, { memo } from 'react';
import ofertaImage from '../../assets/oferta.png';

/**
 * OffersSection - Banner de ofertas com imagem
 * Visível apenas em mobile e tablet, escondido em desktop
 */
const OffersSection = memo(() => {
  return (
    <section className="w-full lg:hidden" aria-labelledby="offers-banner">
      <div className="relative w-full">
        <a 
          href="/ofertas"
          className="block w-full"
          aria-label="Ver todas as ofertas do supermercado"
        >
          <img 
            src={ofertaImage} 
            alt="Ofertas especiais do supermercado"
            className="w-full h-auto object-cover max-h-96 md:max-h-80 hover:opacity-90 transition-opacity duration-300"
            id="offers-banner"
            loading="lazy"
          />
        </a>
        
        {/* Overlay opcional para melhorar legibilidade se necessário */}
        <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </section>
  );
});

OffersSection.displayName = 'OffersSection';

export default OffersSection;