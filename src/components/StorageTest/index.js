import { useState } from 'react';
import { uploadImageToStorage, listImagesInFolder } from '../../utils/firebaseStorage';
import { storage } from '../../firebase/config';

const StorageTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  const testStorageConnection = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);

      console.log('🧪 Testando conexão com Firebase Storage...');
      console.log('📦 Storage instance:', storage);
      console.log('📦 Storage bucket:', storage.bucket);

      // Teste 1: Verificar se o Storage está acessível
      const testResult = {
        connection: false,
        bucket: storage.bucket,
        error: null
      };

      try {
        // Tentar listar imagens (mesmo que vazio)
        const result = await listImagesInFolder('test');
        testResult.connection = true;
        testResult.imagesCount = result.images.length;
        console.log('✅ Conexão com Firebase Storage funcionando!');
      } catch (error) {
        testResult.error = error.message;
        console.error('❌ Erro na conexão:', error);
      }

      setTestResult(testResult);

    } catch (error) {
      console.error('❌ Erro no teste:', error);
      setTestResult({
        connection: false,
        error: error.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  const testImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsTesting(true);
      setUploadProgress({ stage: 'uploading', progress: 0 });

      console.log('🧪 Testando upload de imagem...');
      console.log('📄 Arquivo:', file.name, file.size, file.type);

      const result = await uploadImageToStorage(file, {
        folder: 'test',
        compress: true,
        onProgress: (progress) => {
          setUploadProgress(progress);
        }
      });

      console.log('✅ Upload de teste bem-sucedido:', result);
      setTestResult(prev => ({
        ...prev,
        uploadTest: {
          success: true,
          url: result.url,
          fileName: result.fileName,
          size: result.size,
          compressionRatio: result.compressionRatio
        }
      }));

    } catch (error) {
      console.error('❌ Erro no upload de teste:', error);
      setTestResult(prev => ({
        ...prev,
        uploadTest: {
          success: false,
          error: error.message
        }
      }));
    } finally {
      setIsTesting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        🧪 Teste do Firebase Storage
      </h1>

      {/* Informações do Storage */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">📦 Configuração do Storage</h2>
        <div className="text-sm text-blue-700">
          <p><strong>Bucket:</strong> {storage?.bucket || 'Não configurado'}</p>
          <p><strong>App:</strong> {storage?.app?.name || 'Não configurado'}</p>
        </div>
      </div>

      {/* Botão de Teste */}
      <div className="mb-6">
        <button
          onClick={testStorageConnection}
          disabled={isTesting}
          className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
            isTesting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg'
          }`}
        >
          {isTesting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Testando...
            </div>
          ) : (
            '🧪 Testar Conexão com Firebase Storage'
          )}
        </button>
      </div>

      {/* Teste de Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📤 Teste de Upload de Imagem
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={testImageUpload}
          disabled={isTesting}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Progresso do Upload */}
      {uploadProgress && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-800">
              {uploadProgress.stage === 'uploading' && 'Enviando...'}
              {uploadProgress.stage === 'compressing' && 'Comprimindo...'}
              {uploadProgress.stage === 'getting_url' && 'Obtendo URL...'}
              {uploadProgress.stage === 'completed' && 'Concluído!'}
            </span>
            {uploadProgress.progress && (
              <span className="text-sm text-blue-600">{Math.round(uploadProgress.progress)}%</span>
            )}
          </div>
          {uploadProgress.progress && (
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress.progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Resultados do Teste */}
      {testResult && (
        <div className="space-y-4">
          {/* Teste de Conexão */}
          <div className={`p-4 rounded-lg ${
            testResult.connection ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <h3 className={`text-lg font-semibold mb-2 ${
              testResult.connection ? 'text-green-800' : 'text-red-800'
            }`}>
              {testResult.connection ? '✅ Conexão Funcionando' : '❌ Erro na Conexão'}
            </h3>
            
            {testResult.connection ? (
              <div className="text-sm text-green-700">
                <p>• Firebase Storage acessível</p>
                <p>• Bucket: {testResult.bucket}</p>
                <p>• Imagens encontradas: {testResult.imagesCount || 0}</p>
              </div>
            ) : (
              <div className="text-sm text-red-700">
                <p>• Erro: {testResult.error}</p>
              </div>
            )}
          </div>

          {/* Teste de Upload */}
          {testResult.uploadTest && (
            <div className={`p-4 rounded-lg ${
              testResult.uploadTest.success ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 ${
                testResult.uploadTest.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.uploadTest.success ? '✅ Upload Funcionando' : '❌ Erro no Upload'}
              </h3>
              
              {testResult.uploadTest.success ? (
                <div className="text-sm text-green-700">
                  <p>• Arquivo: {testResult.uploadTest.fileName}</p>
                  <p>• Tamanho: {Math.round(testResult.uploadTest.size / 1024)} KB</p>
                  <p>• Compressão: {testResult.uploadTest.compressionRatio}% menor</p>
                  <p>• URL: <a href={testResult.uploadTest.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver imagem</a></p>
                </div>
              ) : (
                <div className="text-sm text-red-700">
                  <p>• Erro: {testResult.uploadTest.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instruções */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">📋 Instruções</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>1. Clique em "Testar Conexão" para verificar se o Firebase Storage está acessível</li>
          <li>2. Selecione uma imagem para testar o upload</li>
          <li>3. Verifique se a imagem aparece no Firebase Console</li>
          <li>4. Se houver erros, verifique as configurações do Firebase</li>
        </ul>
      </div>

      {/* Logs do Console */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">📊 Logs do Console</h3>
        <p className="text-sm text-gray-600">
          Abra o console do navegador (F12) para ver logs detalhados dos testes.
        </p>
      </div>
    </div>
  );
};

export default StorageTest;
