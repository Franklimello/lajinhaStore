import React, { useState, useEffect } from 'react';
import { imageCacheManager } from '../../utils/ImageCacheManager';

/**
 * CacheStatsPanel - Painel de estatísticas do cache de imagens
 * Baseado no código fornecido, otimizado para o projeto
 */
export default function CacheStatsPanel() {
  const [stats, setStats] = useState(imageCacheManager.getStats());
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Escutar atualizações do cache
    const handleStatsUpdate = (event) => {
      setStats(event.detail);
    };

    window.addEventListener('cacheStatsUpdated', handleStatsUpdate);

    return () => {
      window.removeEventListener('cacheStatsUpdated', handleStatsUpdate);
    };
  }, []);

  const handleClearCache = async () => {
    if (window.confirm('Deseja limpar todo o cache de imagens?')) {
      await imageCacheManager.clearCache();
    }
  };

  const handleClearExpired = async () => {
    await imageCacheManager.clearExpiredCache();
    alert('Cache expirado removido!');
  };

  const handleUpdateStats = async () => {
    await imageCacheManager.updateStats();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        📊 Mostrar Cache
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-2xl p-4 w-80 border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">💾</span>
          Cache de Imagens
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total de imagens:</span>
          <span className="font-bold text-gray-800">{stats.totalImages}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Cached:</span>
          <span className="font-bold text-green-600">{stats.cachedImages}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tamanho do cache:</span>
          <span className="font-bold text-blue-600">{stats.cacheSize}</span>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Taxa de cache:</span>
            <span className="font-bold text-purple-600">{stats.cacheRate}%</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.cacheRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleUpdateStats}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors text-sm font-medium"
        >
          🔄 Atualizar Stats
        </button>

        <button
          onClick={handleClearExpired}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg transition-colors text-sm font-medium"
        >
          🧹 Limpar Expirados
        </button>

        <button
          onClick={handleClearCache}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors text-sm font-medium"
        >
          🗑️ Limpar Tudo
        </button>
      </div>

      {/* Info Footer */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          ⚡ Imagens são cacheadas por 7 dias
        </p>
      </div>
    </div>
  );
}
