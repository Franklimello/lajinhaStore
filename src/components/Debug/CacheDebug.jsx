import React, { useState, useEffect } from 'react';
import { useImageCacheManager } from '../../hooks/useImageCacheManager';

/**
 * CacheDebug - Componente para debug do cache de imagens
 * Mostra estatísticas e permite gerenciar o cache
 */
const CacheDebug = () => {
  const { cacheStats, cleanExpiredCache, clearAllCache, calculateCacheStats } = useImageCacheManager();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostra debug apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-gray-800">📷 Cache de Imagens</h4>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Total de imagens:</span>
          <span className="font-semibold">{cacheStats.totalImages}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Cached:</span>
          <span className="font-semibold text-green-600">{cacheStats.cachedImages}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Tamanho do cache:</span>
          <span className="font-semibold">{cacheStats.cacheSize} KB</span>
        </div>
        
        <div className="flex justify-between">
          <span>Taxa de cache:</span>
          <span className="font-semibold text-blue-600">
            {cacheStats.totalImages > 0 
              ? `${Math.round((cacheStats.cachedImages / cacheStats.totalImages) * 100)}%`
              : '0%'
            }
          </span>
        </div>
      </div>
      
      <div className="mt-3 space-y-2">
        <button
          onClick={calculateCacheStats}
          className="w-full px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
        >
          🔄 Atualizar Stats
        </button>
        
        <button
          onClick={cleanExpiredCache}
          className="w-full px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition-colors"
        >
          🧹 Limpar Expirados
        </button>
        
        <button
          onClick={clearAllCache}
          className="w-full px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
        >
          🗑️ Limpar Tudo
        </button>
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        💡 Imagens são cacheadas por 24h
      </div>
    </div>
  );
};

export default CacheDebug;






