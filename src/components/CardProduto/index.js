import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { FaWhatsapp, FaHeart, FaShare, FaEye, FaShoppingCart } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { ShopContext } from "../../context/ShopContext";

export default function CardProduto({ fotosUrl = [], titulo, descricao, preco, id, onAddToCart }) {
  const { addToCart } = useContext(ShopContext);
  
  const produto = { id, fotosUrl, titulo, descricao, preco };

  const handleAddToCart = () => {
    addToCart(produto);
    // Chama o callback para limpar a busca (se fornecido)
    if (onAddToCart) {
      onAddToCart();
    }
  };

  return (
    <div className="group relative bg-white shadow-lg overflow-hidden border border-gray-50 hover:shadow-2xl transition-all duration-200 ease-out">
      
      {/* Badge de destaque */}
      <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 text-xs font-semibold shadow-lg">
        Oferta
      </div>
      
      {/* Botões de ação rápida */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button className="bg-white/80 backdrop-blur-sm p-2 shadow-lg hover:bg-white transition-all duration-200">
          <FaHeart className="text-red-500 text-sm" />
        </button>
        <button className="bg-white/80 backdrop-blur-sm p-2 shadow-lg hover:bg-white transition-all duration-200">
          <FaShare className="text-blue-500 text-sm" />
        </button>
      </div>
      
      {/* Slider de imagens */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10 pointer-events-none" />
        
        <Swiper
          modules={[Navigation, Pagination]}
          pagination={{ 
            clickable: true,
            bulletClass: "swiper-pagination-bullet !bg-white/60 !opacity-100",
            bulletActiveClass: "swiper-pagination-bullet-active !bg-white"
          }}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom"
          }}
          spaceBetween={0}
          slidesPerView={1}
          className="h-56 relative"
        >
          {fotosUrl.slice(0, 5).map((url, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100">
                <img
                  src={url}
                  alt={`${titulo} - imagem ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out"
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          ))}
          
          {/* Navegação customizada */}
          <div className="swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer hover:bg-white">
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div className="swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer hover:bg-white">
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Swiper>
        
        {/* Indicador de fotos */}
        {fotosUrl.length > 1 && (
          <div className="absolute bottom-3 left-3 z-20 bg-black/60 backdrop-blur-sm text-white px-2 py-1 text-xs font-medium">
            +{fotosUrl.length} fotos
          </div>
        )}
      </div>
      
      {/* Conteúdo */}
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 leading-tight group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
            {titulo}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2 hidden sm:block">
            {descricao}
          </p>
        </div>
        
        {/* Preço */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              R$ {preco}
            </span>
            
          </div>
          
          {/* Estrelas */}
          
        </div>
        
        {/* Botões */}
        <div className="space-y-2 sm:space-y-3">
          <a
            href={`https://wa.me/5519997050303?text=Olá! Tenho interesse no produto "${titulo}" anunciado por R$ ${preco}. Poderia me dar mais informações?`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center rounded-md justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FaWhatsapp className="text-lg" />
            Comprar
          </a>
          
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center rounded-md gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FaShoppingCart className="text-lg" />
            Carrinho
          </button>
          
          <Link
            to={`/detalhes/${id}`}
            className="flex items-center  justify-center rounded-md gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden"
          >
            <FaEye className="text-lg" />
            Detalhes
          </Link>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
    </div>
  );
}