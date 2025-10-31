import React, { memo } from 'react';
import Ofertas from '../../pages/Ofertas';

/**
 * OffersSection - Renderiza a página de ofertas completa (com banner animado)
 */
const OffersSection = memo(() => {
  return (
    <section className="w-full" aria-labelledby="offers-section">
      <div className="w-full">
        <Ofertas />
      </div>
    </section>
  );
});

OffersSection.displayName = 'OffersSection';

export default OffersSection;