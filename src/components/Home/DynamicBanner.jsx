import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useGetDocuments } from '../../hooks/useGetDocuments';

// Função helper para detectar se é URL externa
const isExternalUrl = (url) => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * DynamicBanner - Banner dinâmico genérico que busca anúncios por palavra-chave
 * 
 * @param {string} keyword - Palavra-chave para filtrar anúncios (ex: "motoboy", "promocao")
 * @param {boolean} excludeImage - Se true, não exibe anúncios com imagem
 * @param {string} className - Classes CSS customizadas
 */
const DynamicBanner = memo(({ keyword, excludeImage = false, className = "" }) => {
  const { documents: anuncios } = useGetDocuments("anuncios", { realTime: true });

  // Filtra anúncios pela palavra-chave
  const filteredAd = (anuncios || []).find(a => {
    const matchesKeyword = !keyword || (a?.texto && a.texto.toLowerCase().includes(keyword.toLowerCase()));
    const isActive = a?.ativo !== false;
    const hasNoImage = !excludeImage || !a.imagemUrl;
    
    return matchesKeyword && isActive && hasNoImage;
  });

  // Se não houver anúncio, não renderiza nada
  if (!filteredAd) {
    return null;
  }

  // Renderiza o anúncio dinâmico
  const bgColor = filteredAd.bgColor || '#EAB308';
  const textColor = filteredAd.textColor || '#000000';
  const rota = filteredAd.rota || '/';
  const isExternal = isExternalUrl(rota);

  const content = (
      <div 
        className="relative w-full py-5 px-6 text-center overflow-hidden flex items-center shadow-lg"
        style={{ 
          background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}ee 100%)`,
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Efeito de brilho animado */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
            animation: 'shimmer 3s ease-in-out infinite'
          }}
        />

        {/* Pattern de fundo sutil */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle, ${textColor} 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />

        <span className="text-3xl flex-shrink-0 relative z-10 transform group-hover:scale-110 transition-transform duration-300">
          🏷️
        </span>

        <div className="relative w-full overflow-hidden mx-4">
          <div className="flex" style={{ animation: 'slide-around 25s linear infinite' }}>
            {[0, 1, 2].map((i) => (
              <span 
                key={i}
                className="text-base sm:text-lg font-extrabold inline-block whitespace-nowrap px-6 min-w-max flex-shrink-0 tracking-wide"
                style={{ 
                  color: textColor,
                  textShadow: `0 2px 8px ${bgColor}99`,
                  letterSpacing: '0.5px'
                }}
              >
                {filteredAd.texto}
              </span>
            ))}
          </div>
        </div>

        <span className="text-3xl flex-shrink-0 relative z-10 transform group-hover:scale-110 transition-transform duration-300">
          🏷️
        </span>

        {/* Borda inferior com gradiente */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-1 opacity-60"
          style={{
            background: `linear-gradient(90deg, transparent, ${textColor}, transparent)`
          }}
        />

        <style>{`
          @keyframes slide-around {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
  );

  return isExternal ? (
    <a href={rota} target="_blank" rel="noopener noreferrer" className={`block w-full group ${className}`}>
      {content}
    </a>
  ) : (
    <Link to={rota} className={`block w-full group ${className}`}>
      {content}
    </Link>
  );
});

DynamicBanner.displayName = 'DynamicBanner';

export default DynamicBanner;



