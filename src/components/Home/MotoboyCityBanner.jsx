import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useGetDocuments } from '../../hooks/useGetDocuments';

// Função helper para detectar se é URL externa
const isExternalUrl = (url) => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * MotoboyCityBanner - Banner promocional dinâmico para Motoboy City
 */
const MotoboyCityBanner = memo(() => {
  const { documents: anuncios } = useGetDocuments("anuncios", { realTime: true });

  // Filtra anúncios configurados para Motoboy OU anúncios antigos com "motoboy" no texto (backward compatibility)
  const motoboyAd = (anuncios || []).find(a => 
    a?.ativo !== false && 
    a?.texto && 
    (a?.localizacao === "motoboy" || (a?.localizacao !== "marquee" && a.texto.toLowerCase().includes('motoboy')))
  );

  // Se não houver anúncio, não renderiza nada
  if (!motoboyAd) {
    return null;
  }

  // Renderiza o anúncio dinâmico
  const bgColor = motoboyAd.bgColor || '#EAB308';
  const textColor = motoboyAd.textColor || '#000000';
  const rota = motoboyAd.rota || '/motoboy-city';
  const isExternal = isExternalUrl(rota);

  const content = (
      <div 
        className="w-full overflow-hidden border-y border-gray-200/50 group relative shadow-sm" 
        style={{ 
          background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}f5 100%)`
        }}
      >
        {/* Efeito de brilho sutil */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
            animation: 'shimmer 4s ease-in-out infinite'
          }}
        />

        {/* Pattern de fundo discreto */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle, ${textColor} 0.5px, transparent 0.5px)`,
            backgroundSize: '16px 16px'
          }}
        />

        {/* trilho animado - duplicado para loop sem fim */}
        <div className="flex relative z-10">
          <div
            className="flex items-center whitespace-nowrap py-3 group-hover:[animation-play-state:paused]"
            style={{ 
              color: textColor,
              animation: `marquee ${Math.max(15, Number(motoboyAd.speedSeconds || 25))}s linear infinite` 
            }}
          >
            {/* primeira sequência */}
            {[0,1,2,3,4,5,6,7,8,9].map((i) => (
              <div key={`track-a-${i}`} className="flex items-center">
                {isExternal ? (
                  <a
                    href={rota}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-10 py-1 rounded-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                    title={motoboyAd.texto || "Anúncio"}
                  >
                    {motoboyAd.imagemUrl && (
                      <img
                        src={motoboyAd.imagemUrl}
                        alt={motoboyAd.texto || "Anúncio"}
                        className="w-7 h-7 object-contain rounded-md shadow-sm flex-shrink-0"
                        loading="lazy"
                      />
                    )}
                    {motoboyAd.texto && (
                      <span 
                        className="text-sm sm:text-base font-bold leading-snug tracking-wide"
                        style={{
                          textShadow: `0 1px 3px ${bgColor}aa`
                        }}
                      >
                        {motoboyAd.texto}
                      </span>
                    )}
                  </a>
                ) : (
                  <Link
                    to={rota}
                    className="flex items-center gap-3 px-10 py-1 rounded-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                    title={motoboyAd.texto || "Anúncio"}
                  >
                    {motoboyAd.imagemUrl && (
                      <img
                        src={motoboyAd.imagemUrl}
                        alt={motoboyAd.texto || "Anúncio"}
                        className="w-7 h-7 object-contain rounded-md shadow-sm flex-shrink-0"
                        loading="lazy"
                      />
                    )}
                    {motoboyAd.texto && (
                      <span 
                        className="text-sm sm:text-base font-bold leading-snug tracking-wide"
                        style={{
                          textShadow: `0 1px 3px ${bgColor}aa`
                        }}
                      >
                        {motoboyAd.texto}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>
          
          {/* segunda sequência idêntica para continuidade */}
          <div
            className="flex items-center whitespace-nowrap py-3 group-hover:[animation-play-state:paused]"
            style={{ 
              color: textColor,
              animation: `marquee ${Math.max(15, Number(motoboyAd.speedSeconds || 25))}s linear infinite` 
            }}
          >
            {[0,1,2,3,4,5,6,7,8,9].map((i) => (
              <div key={`track-b-${i}`} className="flex items-center">
                {isExternal ? (
                  <a
                    href={rota}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-10 py-1 rounded-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                    title={motoboyAd.texto || "Anúncio"}
                  >
                    {motoboyAd.imagemUrl && (
                      <img
                        src={motoboyAd.imagemUrl}
                        alt={motoboyAd.texto || "Anúncio"}
                        className="w-7 h-7 object-contain rounded-md shadow-sm flex-shrink-0"
                        loading="lazy"
                      />
                    )}
                    {motoboyAd.texto && (
                      <span 
                        className="text-sm sm:text-base font-bold leading-snug tracking-wide"
                        style={{
                          textShadow: `0 1px 3px ${bgColor}aa`
                        }}
                      >
                        {motoboyAd.texto}
                      </span>
                    )}
                  </a>
                ) : (
                  <Link
                    to={rota}
                    className="flex items-center gap-3 px-10 py-1 rounded-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                    title={motoboyAd.texto || "Anúncio"}
                  >
                    {motoboyAd.imagemUrl && (
                      <img
                        src={motoboyAd.imagemUrl}
                        alt={motoboyAd.texto || "Anúncio"}
                        className="w-7 h-7 object-contain rounded-md shadow-sm flex-shrink-0"
                        loading="lazy"
                      />
                    )}
                    {motoboyAd.texto && (
                      <span 
                        className="text-sm sm:text-base font-bold leading-snug tracking-wide"
                        style={{
                          textShadow: `0 1px 3px ${bgColor}aa`
                        }}
                      >
                        {motoboyAd.texto}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bordas com gradiente sutil */}
        <div 
          className="absolute top-0 left-0 right-0 h-px opacity-40"
          style={{
            background: `linear-gradient(90deg, transparent, ${textColor}, transparent)`
          }}
        />
        <div 
          className="absolute bottom-0 left-0 right-0 h-px opacity-40"
          style={{
            background: `linear-gradient(90deg, transparent, ${textColor}, transparent)`
          }}
        />

        <style>{`
          @keyframes marquee { 
            from { transform: translateX(0); } 
            to { transform: translateX(-100%); } 
          }
          @keyframes shimmer {
            0%, 100% { transform: translateX(-100%); opacity: 0; }
            50% { opacity: 0.1; }
          }
        `}</style>
      </div>
  );

  return isExternal ? (
    <a href={rota} target="_blank" rel="noopener noreferrer" className="block w-full mt-2 group">
      {content}
    </a>
  ) : (
    <Link to={rota} className="block w-full mt-2 group">
      {content}
    </Link>
  );
});

MotoboyCityBanner.displayName = 'MotoboyCityBanner';

export default MotoboyCityBanner;