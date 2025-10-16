import { useState } from "react";
import { uploadImageToCloudinary } from "../../utils/uploadImage";
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
    "Hortifruti",
    "Açougue",
    "Frios e laticínios",
    "Mercearia",
    "Guloseimas e snacks",
    "Bebidas",
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

      // Upload das imagens com progresso
      for (let i = 0; i < fotos.length; i++) {
        const foto = fotos[i];
        setMensagem(`Enviando imagem ${i + 1} de ${totalFotos}...`);
        setTipoMensagem("info");
        
        try {
          const url = await uploadImageToCloudinary(foto, {
            maxRetries: 3,
            timeoutMs: 60000,
            onProgress: (status) => {
              if (status.stage === 'uploading') {
                setMensagem(`Enviando imagem ${i + 1}/${totalFotos} (tentativa ${status.attempt || 1})...`);
              }
            }
          });
          
          if (!url) {
            throw new Error(`Falha ao enviar a imagem ${i + 1}`);
          }
          
          fotosUrl.push(url);
          setUploadProgress(((i + 1) / totalFotos) * 100);
          
        } catch (uploadError) {
          throw new Error(`Erro na imagem ${i + 1}: ${uploadError.message}`);
        }
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
      
      // Limpar input de arquivo
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

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
          <input
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="w-full border border-gray-300 p-3 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={handleFileChange}
            disabled={loading}
          />

          <p className="text-xs text-gray-500 mt-1">
            Formatos: JPEG, PNG, WEBP, GIF. Máximo 5MB por imagem.
          </p>
          {fotos.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              ✓ {fotos.length} imagem(ns) selecionada(s)
            </p>
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

