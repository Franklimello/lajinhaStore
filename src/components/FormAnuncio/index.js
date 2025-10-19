import { useState } from "react";
import { uploadMultipleImages } from "../../utils/firebaseStorage";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function FormAnuncio() {
  const [titulo, setTitulo] = useState("");
  const [preco, setPreco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState(""); // "sucesso" ou "erro"
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const categorias = [
    "Oferta",
    "Hortifruti",
    "Açougue",
    "Frios e laticínios",
    "Mercearia",
    "Guloseimas e snacks",
    "Bebidas",
    "Bebidas Geladas",
    "Limpeza",
    "Higiene pessoal",
    "Utilidades domésticas",
    "Pet shop",
    "Infantil",
    "Farmácia"
  ];

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 3) {
      setMensagem("Selecione no máximo 3 imagens.");
      setTipoMensagem("erro");
      return;
    }

    // Validar tamanho dos arquivos
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      setMensagem("Algumas imagens são muito grandes. Máximo 5MB por imagem.");
      setTipoMensagem("erro");
      return;
    }

    // Validar tipos de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setMensagem("Apenas arquivos JPEG, PNG, WEBP e GIF são permitidos.");
      setTipoMensagem("erro");
      return;
    }

    setFotos(files);
    setMensagem("");
  };

  const removePhoto = (index) => {
    const newFotos = fotos.filter((_, i) => i !== index);
    setFotos(newFotos);
  };

  const formatPrice = (value) => {
    // Remove tudo que não é número
    const numericValue = value.replace(/[^\d]/g, '');
    
    if (!numericValue) return '';
    
    // Formata como moeda brasileira
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue / 100);
    
    return formatted;
  };

  const handlePriceChange = (e) => {
    const formatted = formatPrice(e.target.value);
    setPreco(formatted);
  };

  const validateForm = () => {
    if (!titulo.trim()) {
      setMensagem("Título é obrigatório.");
      setTipoMensagem("erro");
      return false;
    }
    
    if (!preco.trim()) {
      setMensagem("Preço é obrigatório.");
      setTipoMensagem("erro");
      return false;
    }
    
    if (!categoria) {
      setMensagem("Selecione uma categoria.");
      setTipoMensagem("erro");
      return false;
    }
    
    
    
    if (fotos.length === 0) {
      setMensagem("Adicione pelo menos uma imagem.");
      setTipoMensagem("erro");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setIsUploading(true);
    setMensagem("");
    setUploadProgress(0);

    try {
      let fotosUrl = [];
      const totalFotos = fotos.length;

      // Upload das imagens para Firebase Storage
      setMensagem("Enviando imagens para Firebase Storage...");
      setTipoMensagem("info");

      const uploadResults = await uploadMultipleImages(fotos, {
        folder: 'produtos',
        compress: true,
        onProgress: (progress) => {
          if (progress.stage === 'uploading_multiple') {
            setMensagem(`Enviando imagem ${progress.current}/${progress.total}: ${progress.fileName}`);
            setUploadProgress((progress.current / progress.total) * 100);
          } else if (progress.stage === 'compressing') {
            setMensagem(`Comprimindo imagem ${progress.current}/${progress.total}: ${progress.fileName}`);
          } else if (progress.stage === 'uploading') {
            setMensagem(`Enviando para Firebase Storage: ${progress.fileName}`);
          }
        }
      });

      // Verificar resultados do upload
      const successfulUploads = uploadResults.filter(result => result.success);
      const failedUploads = uploadResults.filter(result => !result.success);

      if (failedUploads.length > 0) {
        console.warn('Alguns uploads falharam:', failedUploads);
        // Continuar com os uploads bem-sucedidos
      }

      fotosUrl.push(...successfulUploads.map(result => result.url));
      
      if (fotosUrl.length === 0) {
        throw new Error('Nenhuma imagem foi enviada com sucesso');
      }

      setIsUploading(false);
      setMensagem("Salvando anúncio...");

      // Converter preço para número
      const precoNumerico = parseFloat(preco.replace(/[^\d,]/g, '').replace(',', '.'));

      // Salvar no Firestore
      await addDoc(collection(db, "produtos"), {
        titulo: titulo.trim(),
        categoria,
        preco: precoNumerico,
        descricao: descricao.trim(),
        fotosUrl,
        criadoEm: new Date()
      });

      // Sucesso
      setMensagem("🎉 Anúncio criado com sucesso!");
      setTipoMensagem("sucesso");
      
      // Limpar formulário
      setTitulo("");
      setDescricao("");
      setPreco("");
      setCategoria("");
      setFotos([]);
      setUploadProgress(0);
      
      // Limpar inputs de arquivo
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');

    } catch (err) {
      console.error("Erro ao criar anúncio:", err);
      setMensagem("❌ " + err.message);
      setTipoMensagem("erro");
      setIsUploading(false);
    } finally {
      setLoading(false);
    }
  };

  const getMessageColor = () => {
    switch (tipoMensagem) {
      case "sucesso": return "text-green-600 bg-green-50 border-green-200";
      case "erro": return "text-red-600 bg-red-50 border-red-200";
      case "info": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <section className="flex justify-center p-6 min-h-screen bg-gray-50">
      <div className="flex flex-col gap-4 w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Criar Anúncio</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <input
            type="text"
            placeholder="Ex: iPhone 13 Pro Max 128GB"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => setTitulo(e.target.value)}
            value={titulo}
            disabled={loading}
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">{titulo.length}/100 caracteres</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preço *
          </label>
          <input
            type="text"
            placeholder="R$ 0,00"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={handlePriceChange}
            value={preco}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria *
          </label>
          <select
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => setCategoria(e.target.value)}
            value={categoria}
            disabled={loading}
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição *
          </label>
          <textarea
            placeholder="Descreva seu produto detalhadamente..."
            rows="4"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            onChange={(e) => setDescricao(e.target.value)}
            value={descricao}
            disabled={loading}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{descricao.length}/500 caracteres</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fotos * (máximo 3)
          </label>
          
          {/* Input file oculto */}
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            multiple
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
          />
          
          {/* Input file para galeria */}
          <input
            type="file"
            id="galleryInput"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
          />

          {/* Botões de seleção */}
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => document.getElementById('fileInput').click()}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📷 Câmera
            </button>
            
            <button
              type="button"
              onClick={() => document.getElementById('galleryInput').click()}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🖼️ Galeria
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Formatos: JPEG, PNG, WEBP, GIF. Máximo 5MB por imagem.
          </p>
          
          {/* Prévia das imagens selecionadas */}
          {fotos.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-green-600 mb-2">
                ✓ {fotos.length} imagem(ns) selecionada(s)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {fotos.map((foto, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(foto)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Barra de progresso do upload */}
        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed text-white' 
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {isUploading ? 'Enviando imagens...' : 'Salvando...'}
            </div>
          ) : (
            'Criar Anúncio'
          )}
        </button>

        {mensagem && (
          <div className={`p-3 rounded-lg border text-sm font-medium ${getMessageColor()}`}>
            {mensagem}
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-2">
          * Campos obrigatórios
        </p>
      </div>
    </section>
  );
}

