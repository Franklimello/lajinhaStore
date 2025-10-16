import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, Zoom } from "swiper/modules";
import { FaWhatsapp, FaArrowLeft, FaHeart, FaShare, FaStar, FaShoppingCart } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { useFetchDocument } from "../../hooks/useGetDocument";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "swiper/css/zoom";

// Importe o contexto
import { ShopContext } from "../../context/ShopContext";

export default function Detalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  
  // Use o contexto para acessar favoritos e carrinho
  const { toggleFavorite, favorites, addToCart } = useContext(ShopContext);

  // Verificação se o contexto está funcionando
  if (!toggleFavorite) {
    console.error('toggleFavorite não está disponível no contexto!');
  }

  const { document: produto, loading, error } = useFetchDocument("produtos", id);

  // Debug logs mais detalhados
  console.log('=== DEBUG CARREGAMENTO ===');
  console.log('ID da URL:', id);
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Produto recebido:', produto);
  console.log('Tipo do produto:', typeof produto);
  
  if (produto) {
    console.log('Produto.id:', produto.id);
    console.log('Chaves do produto:', Object.keys(produto));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Carregando detalhes do produto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Erro detalhado:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl text-red-600 mb-4">Erro ao carregar produto</h2>
          <p className="text-gray-500 mb-4">ID do produto: {id}</p>
          <p className="text-gray-500 mb-6">
            {error?.message || 'Erro desconhecido'}
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <p className="text-xl text-gray-600">Produto não encontrado</p>
        </div>
      </div>
    );
  }

  // Verifica se o produto atual está na lista de favoritos
  const isFavorited = favorites.some(fav => fav.id === produto?.id);

  // Função para adicionar aos favoritos e navegar
  const handleToggleFavorite = () => {
    console.log('=== DEBUG FAVORITOS ===');
    console.log('Produto no momento do clique:', produto);
    console.log('ID do produto:', produto?.id);
    console.log('toggleFavorite função existe?', !!toggleFavorite);
    console.log('Favorites atual:', favorites);
    
    // Verificação mais flexível
    if (!produto) {
      console.error('Produto ainda não foi carregado');
      return;
    }
    
    if (!produto.id) {
      console.error('Produto não tem ID:', produto);
      return;
    }
    
    if (!toggleFavorite) {
      console.error('Função toggleFavorite não está disponível no contexto!');
      return;
    }
    
    try {
      console.log('Executando toggleFavorite com produto:', produto);
      
      // Passa o produto completo
      toggleFavorite(produto);
      console.log('toggleFavorite executado com sucesso');
      
      // Navega após um delay para garantir atualização do contexto
      setTimeout(() => {
        console.log('Navegando para favoritos...');
        navigate('/favoritos');
      }, 500);
    } catch (error) {
      console.error('Erro ao executar toggleFavorite:', error);
    }
  };

  // Função para adicionar ao carrinho e navegar
  const handleAddToCart = () => {
    if (!produto || !produto.id) {
      console.error('Produto não encontrado ou sem ID');
      return;
    }
    
    try {
      addToCart(produto);
      console.log('Produto adicionado ao carrinho:', produto);
      
      // Navega após um delay para garantir atualização do contexto
      setTimeout(() => {
        navigate('/carrinho');
      }, 300);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header com navegação */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <FaArrowLeft />
            <span className="font-medium">Voltar</span>
          </Link>
          
          <div className="flex items-center gap-3">
            {/* Botão de favorito */}
            <button 
              onClick={handleToggleFavorite}
              disabled={loading || !produto}
              className={`p-3 rounded-full transition-all duration-200 ${
                loading || !produto 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : isFavorited 
                    ? 'bg-red-100 text-red-500' 
                    : 'bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500'
              }`}
            >
              <FaHeart />
            </button>
            <button className="p-3 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-500 transition-all duration-200">
              <FaShare />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Galeria de imagens */}
          <div className="space-y-4">
            {produto.fotosUrl?.length > 0 && (
              <>
                {/* Slider principal */}
                <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
                  <Swiper
                    modules={[Navigation, Pagination, Thumbs, Zoom]}
                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                    zoom={true}
                    pagination={{ 
                      clickable: true,
                      bulletClass: "swiper-pagination-bullet !bg-blue-500 !opacity-100",
                      bulletActiveClass: "swiper-pagination-bullet-active !bg-blue-600"
                    }}
                    navigation={{
                      nextEl: ".swiper-button-next-custom",
                      prevEl: ".swiper-button-prev-custom"
                    }}
                    spaceBetween={0}
                    slidesPerView={1}
                    className="h-96 lg:h-[500px]"
                  >
                    {produto.fotosUrl.map((url, index) => (
                      <SwiperSlide key={`${produto.id}_main_${index}`}>
                        <div className="swiper-zoom-container">
                          <img
                            src={url}
                            alt={`${produto.titulo} - imagem ${index + 1}`}
                            className="w-full h-full object-contain p-4"
                            loading={index === 0 ? "eager" : "lazy"}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                    
                    {/* Navegação customizada */}
                    <div className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-200 cursor-pointer group">
                      <FaArrowLeft className="text-gray-700 group-hover:text-blue-600" />
                    </div>
                    <div className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-200 cursor-pointer group">
                      <FaArrowLeft className="text-gray-700 group-hover:text-blue-600 rotate-180" />
                    </div>
                  </Swiper>
                </div>

                {/* Thumbnails */}
                {produto.fotosUrl.length > 1 && (
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    modules={[Navigation, Thumbs]}
                    spaceBetween={12}
                    slidesPerView="auto"
                    watchSlidesProgress={true}
                    className="thumbs-swiper"
                  >
                    {produto.fotosUrl.map((url, index) => (
                      <SwiperSlide key={`${produto.id}_thumb_${index}`} className="!w-20 !h-20">
                        <div className="w-full h-full bg-white rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-200 cursor-pointer">
                          <img
                            src={url}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </>
            )}
          </div>

          {/* Informações do produto */}
          <div className="space-y-6">
            {/* Título e avaliação */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {produto.titulo}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-sm" />
                  ))}
                  <span className="text-gray-600 text-sm ml-2">(4.8) • 124 avaliações</span>
                </div>
              </div>
            </div>

            {/* Preço */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Preço especial</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    R$ {produto.preco}
                  </p>
                  
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Oferta limitada
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Descrição</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {produto.descricao}
              </p>
            </div>

            {/* Garantias e benefícios */}
            

            {/* Botões de ação */}
            <div className="space-y-4 sticky bottom-4">
              {/* Botão de Adicionar ao Carrinho */}
              <button 
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl w-full"
              >
                <FaShoppingCart className="text-2xl" />
                Adicionar ao Carrinho
              </button>
              
              {/* Botão do WhatsApp (mantido) */}
              <a
                href={`https://wa.me/5519997050303?text=Olá! Tenho interesse no produto "${produto.titulo}" anunciado por R$ ${produto.preco}. Poderia me enviar mais informações e condições de pagamento?`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-green-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl w-full relative overflow-hidden group"
              >
                <FaWhatsapp className="text-2xl" />
                Comprar pelo WhatsApp
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] skew-x-12 transition-transform duration-700" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}