import React, { useState, useEffect } from 'react';
import { FaTimes, FaImage, FaTrash, FaSave, FaSpinner } from 'react-icons/fa';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';

/**
 * Modal de Edição de Produto com Substituição de Imagem
 * 
 * Funcionalidades:
 * 1. Edita todos os dados do produto
 * 2. Substitui a imagem antiga pela nova no Firebase Storage
 * 3. Apaga automaticamente a imagem antiga
 * 4. Atualiza o link da nova imagem no Firestore
 * 5. Formulário pré-preenchido com dados atuais
 * 6. Feedback visual de sucesso/erro
 */
export default function EditProductModal({ produto, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: '',
    descricao: '',
    preco: '',
    esgotado: false,
  });

  // Preenche o formulário quando o produto muda
  useEffect(() => {
    if (produto) {
      setFormData({
        titulo: produto.titulo || '',
        categoria: produto.categoria || '',
        descricao: produto.descricao || '',
        preco: produto.preco || '',
        esgotado: produto.esgotado || false,
      });
      // Define a imagem atual como preview
      setImagePreview(produto.fotosUrl?.[0] || null);
      setNewImageFile(null);
    }
  }, [produto]);

  // Reseta o modal ao fechar
  useEffect(() => {
    if (!isOpen) {
      setImagePreview(null);
      setNewImageFile(null);
      setUploadingImage(false);
      setLoading(false);
    }
  }, [isOpen]);

  // Função para extrair o nome do arquivo do Storage URL
  const getStoragePathFromUrl = (url) => {
    try {
      if (!url) return null;
      
      // Decodifica a URL para lidar com caracteres especiais
      const decodedUrl = decodeURIComponent(url);
      
      // Extrai o caminho do arquivo após "/o/" e antes do "?"
      const match = decodedUrl.match(/\/o\/(.+?)\?/);
      if (match && match[1]) {
        return match[1];
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao extrair caminho do Storage:', error);
      return null;
    }
  };

  // Função para deletar imagem antiga do Storage
  const deleteOldImage = async (imageUrl) => {
    try {
      if (!imageUrl) {
        console.log('Nenhuma imagem para deletar');
        return { success: true };
      }

      const storagePath = getStoragePathFromUrl(imageUrl);
      
      if (!storagePath) {
        console.log('Não foi possível extrair o caminho da imagem');
        return { success: false, error: 'Caminho inválido' };
      }

      console.log('🗑️ Deletando imagem antiga:', storagePath);
      
      const imageRef = ref(storage, storagePath);
      await deleteObject(imageRef);
      
      console.log('✅ Imagem antiga deletada com sucesso');
      return { success: true };
      
    } catch (error) {
      // Se o erro for "object-not-found", a imagem já foi deletada ou não existe
      if (error.code === 'storage/object-not-found') {
        console.log('⚠️ Imagem antiga não encontrada no Storage (já foi deletada)');
        return { success: true };
      }
      
      console.error('❌ Erro ao deletar imagem antiga:', error);
      return { success: false, error: error.message };
    }
  };

  // Função para fazer upload da nova imagem
  const uploadNewImage = async (file) => {
    try {
      setUploadingImage(true);
      console.log('📤 Iniciando upload da nova imagem...');
      
      // Gera um nome único para a imagem
      const timestamp = Date.now();
      const fileName = `produtos/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      console.log('📝 Nome do arquivo:', fileName);
      
      // Cria referência no Storage
      const storageRef = ref(storage, fileName);
      
      // Faz o upload
      const snapshot = await uploadBytes(storageRef, file);
      console.log('✅ Upload concluído:', snapshot);
      
      // Obtém a URL de download
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('🔗 URL da nova imagem:', downloadURL);
      
      setUploadingImage(false);
      return { success: true, url: downloadURL };
      
    } catch (error) {
      setUploadingImage(false);
      console.error('❌ Erro ao fazer upload da imagem:', error);
      return { success: false, error: error.message };
    }
  };

  // Handler para seleção de nova imagem
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Valida o tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('❌ Por favor, selecione apenas arquivos de imagem!');
        return;
      }
      
      // Valida o tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('❌ A imagem deve ter no máximo 5MB!');
        return;
      }
      
      setNewImageFile(file);
      
      // Cria preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler para remover imagem selecionada
  const handleRemoveImage = () => {
    setNewImageFile(null);
    // Volta para a imagem original do produto
    setImagePreview(produto.fotosUrl?.[0] || null);
  };

  // Função principal de salvar
  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validações
    if (!formData.titulo.trim()) {
      alert('❌ O título é obrigatório!');
      return;
    }
    
    if (!formData.preco || parseFloat(formData.preco) <= 0) {
      alert('❌ O preço deve ser maior que zero!');
      return;
    }
    
    try {
      setLoading(true);
      console.log('💾 Iniciando atualização do produto...');
      
      let newImageUrl = produto.fotosUrl?.[0] || null;
      
      // Se houver nova imagem, faz o upload e deleta a antiga
      if (newImageFile) {
        console.log('🖼️ Nova imagem detectada, processando...');
        
        // 1. Faz upload da nova imagem
        const uploadResult = await uploadNewImage(newImageFile);
        
        if (!uploadResult.success) {
          throw new Error(`Erro ao fazer upload da imagem: ${uploadResult.error}`);
        }
        
        newImageUrl = uploadResult.url;
        console.log('✅ Nova imagem carregada:', newImageUrl);
        
        // 2. Deleta a imagem antiga (se existir e for diferente)
        const oldImageUrl = produto.fotosUrl?.[0];
        if (oldImageUrl && oldImageUrl !== newImageUrl) {
          console.log('🗑️ Deletando imagem antiga...');
          const deleteResult = await deleteOldImage(oldImageUrl);
          
          if (deleteResult.success) {
            console.log('✅ Imagem antiga deletada com sucesso');
          } else {
            console.warn('⚠️ Não foi possível deletar a imagem antiga:', deleteResult.error);
            // Continua mesmo se não conseguir deletar a antiga
          }
        }
      }
      
      // 3. Atualiza o documento no Firestore
      const produtoRef = doc(db, 'produtos', produto.id);
      
      const dadosAtualizados = {
        titulo: formData.titulo.trim(),
        categoria: formData.categoria.trim(),
        descricao: formData.descricao.trim(),
        preco: parseFloat(formData.preco).toFixed(2),
        esgotado: formData.esgotado,
        fotosUrl: [newImageUrl], // Atualiza com a nova URL
        atualizadoEm: new Date(),
      };
      
      console.log('📝 Atualizando Firestore com:', dadosAtualizados);
      await updateDoc(produtoRef, dadosAtualizados);
      
      console.log('✅ Produto atualizado com sucesso!');
      
      // 4. Mostra mensagem de sucesso
      alert('✅ Produto atualizado com sucesso!');
      
      // 5. Chama callback de sucesso e fecha o modal
      if (onSuccess) {
        onSuccess();
      }
      onClose();
      
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error);
      alert(`❌ Erro ao atualizar produto: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handler para mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen || !produto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaImage />
            Editar Produto
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors disabled:opacity-50"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {/* Upload de Imagem */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Imagem do Produto
            </label>
            
            {/* Preview da Imagem */}
            {imagePreview && (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                />
                {newImageFile && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Remover nova imagem"
                  >
                    <FaTrash />
                  </button>
                )}
                {newImageFile && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    NOVA IMAGEM
                  </div>
                )}
              </div>
            )}
            
            {/* Input de Upload */}
            <label className="block">
              <span className="sr-only">Escolher nova imagem</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading || uploadingImage}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  file:cursor-pointer cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>
            
            <p className="text-xs text-gray-500">
              * Selecione uma nova imagem para substituir a atual (máx 5MB)
            </p>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <label htmlFor="titulo" className="block text-sm font-semibold text-gray-700">
              Título *
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Ex: Arroz Tipo 1 - 5kg"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <label htmlFor="categoria" className="block text-sm font-semibold text-gray-700">
              Categoria *
            </label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Selecione uma categoria</option>
              <option value="Oferta">Oferta</option>
              <option value="Hortifruti">Hortifruti</option>
              <option value="Açougue">Açougue</option>
              <option value="Frios e laticínios">Frios e laticínios</option>
              <option value="Mercearia">Mercearia</option>
              <option value="Guloseimas e snacks">Guloseimas e snacks</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Bebidas Geladas">Bebidas Geladas</option>
              <option value="Limpeza">Limpeza</option>
              <option value="Higiene pessoal">Higiene pessoal</option>
              <option value="Cosméticos">Cosméticos</option>
              <option value="Utilidades domésticas">Utilidades domésticas</option>
              <option value="Pet shop">Pet shop</option>
              <option value="Infantil">Infantil</option>
              <option value="Farmácia">Farmácia</option>
            </select>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              disabled={loading}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Descrição do produto..."
            />
          </div>

          {/* Preço */}
          <div className="space-y-2">
            <label htmlFor="preco" className="block text-sm font-semibold text-gray-700">
              Preço (R$) *
            </label>
            <input
              type="number"
              id="preco"
              name="preco"
              value={formData.preco}
              onChange={handleChange}
              disabled={loading}
              required
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="0.00"
            />
          </div>

          {/* Esgotado */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="esgotado"
              name="esgotado"
              checked={formData.esgotado}
              onChange={handleChange}
              disabled={loading}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="esgotado" className="text-sm font-medium text-gray-700">
              Produto esgotado
            </label>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
            >
              {loading || uploadingImage ? (
                <>
                  <FaSpinner className="animate-spin" />
                  {uploadingImage ? 'Enviando imagem...' : 'Salvando...'}
                </>
              ) : (
                <>
                  <FaSave />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


