import { useState, useEffect } from 'react';
import { FaUpload, FaCheck, FaExclamationTriangle, FaDownload, FaHistory, FaChartBar } from 'react-icons/fa';
import { 
  migrateAllImages, 
  getMigrationStats, 
  getUnmigratedProducts,
  restoreOriginalImages 
} from '../../utils/imageMigration';

const ImageMigration = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(null);
  const [stats, setStats] = useState(null);
  const [unmigratedProducts, setUnmigratedProducts] = useState([]);
  const [migrationResults, setMigrationResults] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar estatísticas iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [statsResult, unmigratedResult] = await Promise.all([
        getMigrationStats(),
        getUnmigratedProducts()
      ]);

      if (statsResult.success) {
        setStats(statsResult.stats);
      }

      if (unmigratedResult.success) {
        setUnmigratedProducts(unmigratedResult.products);
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMigration = async () => {
    try {
      setIsMigrating(true);
      setMigrationProgress({ stage: 'preparing', progress: 0 });
      setMigrationResults(null);

      const result = await migrateAllImages((progress) => {
        setMigrationProgress(progress);
      });

      if (result.success) {
        setMigrationResults(result.results);
        // Recarregar dados após migração
        await loadInitialData();
      }

    } catch (error) {
      console.error('Erro na migração:', error);
      setMigrationProgress({ stage: 'error', error: error.message });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleRestoreProduct = async (productId) => {
    try {
      await restoreOriginalImages(productId);
      // Usar toast ou feedback visual ao invés de alert
      await loadInitialData();
    } catch (error) {
      console.error('Erro ao restaurar:', error);
      // Usar toast ou feedback visual ao invés de alert
    }
  };

  const getProgressMessage = () => {
    if (!migrationProgress) return '';

    switch (migrationProgress.stage) {
      case 'preparing':
        return 'Preparando migração...';
      case 'migrating':
        return `Migrando produto: ${migrationProgress.productName} (${migrationProgress.current}/${migrationProgress.total})`;
      case 'migrating_image':
        return `Migrando imagem ${migrationProgress.current}/${migrationProgress.total} de ${migrationProgress.productName}`;
      case 'error':
        return `Erro: ${migrationProgress.error}`;
      default:
        return 'Migrando...';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaUpload className="text-blue-600" />
          Migração de Imagens para Firebase Storage
        </h1>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaChartBar className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total de Produtos</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaCheck className="text-green-600" />
                <span className="text-sm font-medium text-green-800">Migrados</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{stats.migrated}</p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaExclamationTriangle className="text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Pendentes</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{stats.unmigrated}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaDownload className="text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Sem Imagens</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.withoutImages}</p>
            </div>
          </div>
        )}

        {/* Barra de Progresso Geral */}
        {stats && stats.migrationProgress > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso da Migração</span>
              <span className="text-sm text-gray-500">{stats.migrationProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.migrationProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Botão de Migração */}
        {stats && stats.unmigrated > 0 && (
          <div className="mb-6">
            <button
              onClick={handleStartMigration}
              disabled={isMigrating}
              className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                isMigrating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg'
              }`}
            >
              {isMigrating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Migrando...
                </div>
              ) : (
                `Migrar ${stats.unmigrated} Produtos para Firebase Storage`
              )}
            </button>
          </div>
        )}

        {/* Progresso da Migração Atual */}
        {isMigrating && migrationProgress && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-800">{getProgressMessage()}</span>
              {migrationProgress.progress && (
                <span className="text-sm text-blue-600">{Math.round(migrationProgress.progress)}%</span>
              )}
            </div>
            {migrationProgress.progress && (
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${migrationProgress.progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {/* Resultados da Migração */}
        {migrationResults && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Migração Concluída!</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-700">Total:</span> {migrationResults.total}
              </div>
              <div>
                <span className="font-medium text-green-700">Sucesso:</span> {migrationResults.success}
              </div>
              <div>
                <span className="font-medium text-green-700">Falhas:</span> {migrationResults.failed}
              </div>
              <div>
                <span className="font-medium text-green-700">Pulados:</span> {migrationResults.skipped}
              </div>
            </div>
            {migrationResults.errors.length > 0 && (
              <div className="mt-3">
                <h4 className="font-medium text-red-700 mb-2">Erros:</h4>
                <ul className="text-sm text-red-600 space-y-1">
                  {migrationResults.errors.map((error, index) => (
                    <li key={index}>• {error.productName}: {error.error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Lista de Produtos Não Migrados */}
        {unmigratedProducts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Produtos Pendentes de Migração ({unmigratedProducts.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {unmigratedProducts.map((produto) => (
                <div key={produto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{produto.titulo}</p>
                    <p className="text-sm text-gray-600">{produto.fotosUrl?.length || 0} imagens</p>
                  </div>
                  <button
                    onClick={() => handleRestoreProduct(produto.id)}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    title="Restaurar URLs originais"
                  >
                    <FaHistory />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações Importantes */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Informações Importantes</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• As imagens originais são mantidas como backup no Firestore</li>
            <li>• Você pode restaurar as URLs originais a qualquer momento</li>
            <li>• O processo é reversível e seguro</li>
            <li>• Imagens são automaticamente comprimidas e convertidas para WebP</li>
            <li>• Cache otimizado reduz consumo de banda</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageMigration;
