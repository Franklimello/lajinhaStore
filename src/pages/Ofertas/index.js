"use client";
import { useState, useEffect, useContext, memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { db } from "../../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaHeart, FaShoppingCart, FaStar, FaEye, FaTag } from "react-icons/fa";
import { ShopContext } from "../../context/ShopContext";
import { CartContext } from "../../context/CartContext";

const Ofertas = memo(function Ofertas({ searchTerm = "" }) {
  const { favorites, toggleFavorite } = useContext(ShopContext);
  const { addToCart } = useContext(CartContext);

  const [carousels, setCarousels] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "produtos"),
          where("categoria", "==", "Oferta")
        );
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllProducts(products);
      } catch (error) {
        console.error("Erro ao buscar ofertas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    const source = term
      ? allProducts.filter(p => (p.titulo || "").toLowerCase().includes(term))
      : allProducts;

    const chunkSize = 5;
    const grouped = [];
    for (let i = 0; i < source.length; i += chunkSize) {
      grouped.push(source.slice(i, i + chunkSize));
    }
    setCarousels(grouped);
  }, [allProducts, searchTerm]);

  if (!loading && searchTerm && allProducts.length > 0 && carousels.length === 0) {
    return null;
  }

  const isFavorited = (productId) => favorites.some(fav => fav.id === productId);

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-red-500"></div>
            <p className="mt-4 text-gray-600 text-lg">Carregando ofertas...</p>
          </div>
        </div>
      </section>
    );
  }

  const hasSearch = searchTerm.trim().length > 0;
  const resultsCount = carousels.reduce((acc, g) => acc + g.length, 0);

  return (
    <section className="min-h-screen mt-10 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg mb-6 relative overflow-hidden">
            {/* Efeito de fogo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-orange-500 opacity-75 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-ping"></div>
            
            <FaTag className="text-white text-xl relative z-10 animate-bounce" />
            <span className="text-sm font-bold uppercase tracking-wider relative z-10">
              🔥 Ofertas em Chamas 🔥
            </span>
            
            {/* Partículas de fogo */}
            <div className="absolute -top-2 -left-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-3 w-1 h-1 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-red-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
          </div>

          <div className="relative inline-block">
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4 relative z-10">
              🔥 Ofertas 🔥
            </h1>
            
            {/* Efeito de fogo atrás do título */}
            <div className="absolute inset-0 text-5xl md:text-6xl font-black text-red-500 opacity-30 animate-pulse blur-sm">
              🔥 Ofertas 🔥
            </div>
            
            {/* Chamas animadas ao redor */}
            <div className="absolute -top-4 -left-4 text-2xl animate-bounce" style={{animationDelay: '0.2s'}}>🔥</div>
            <div className="absolute -top-2 -right-6 text-xl animate-bounce" style={{animationDelay: '0.4s'}}>🔥</div>
            <div className="absolute -bottom-2 -left-2 text-lg animate-bounce" style={{animationDelay: '0.6s'}}>🔥</div>
            <div className="absolute -bottom-1 -right-4 text-xl animate-bounce" style={{animationDelay: '0.8s'}}>🔥</div>
          </div>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Produtos com preços especiais e descontos imperdíveis
          </p>

          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex -space-x-1">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400 text-lg" />
              ))}
            </div>
            <span className="text-gray-600 ml-2">Ofertas limitadas e exclusivas</span>
          </div>

          {hasSearch && (
            <p className="mt-4 text-sm text-gray-600">
              Resultados para "{searchTerm}": {resultsCount} produto(s)
            </p>
          )}
        </div>

        {carousels.map((group, index) => (
          <div key={index} className="mb-10">
            <div className="relative -mx-4 sm:mx-0">
              <Swiper
                modules={[Navigation, Pagination]}
                navigation={{
                  prevEl: `.swiper-button-prev-${index}`,
                  nextEl: `.swiper-button-next-${index}`,
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                autoplay={false}
                spaceBetween={8}
                slidesPerView={2}
                breakpoints={{
                  640: { slidesPerView: 2, spaceBetween: 20 },
                  768: { slidesPerView: 3, spaceBetween: 24 },
                  1024: { slidesPerView: 4, spaceBetween: 28 },
                  1280: { slidesPerView: 5, spaceBetween: 32 },
                }}
                className="pb-12 !px-0"
              >
                {group.map(product => (
                  <SwiperSlide key={product.id}>
                    <div
                      className="group relative bg-white shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:scale-105"
                      onMouseEnter={() => setHoveredProduct(product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                        {product.esgotado ? (
                          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            Esgotado
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg relative overflow-hidden">
                            {/* Efeito de fogo no badge */}
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-red-500 opacity-50 animate-pulse"></div>
                            <span className="relative z-10">🔥 Oferta 🔥</span>
                          </div>
                        )}
                      </div>

                      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => toggleFavorite(product)}
                          className={`p-2 rounded-full shadow-lg transition-all duration-200 ${
                            isFavorited(product.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
                          }`}
                          aria-label="Favoritar produto"
                        >
                          <FaHeart className="text-sm" />
                        </button>

                        <button className="p-2 bg-white/90 text-gray-600 rounded-full shadow-lg hover:bg-blue-500 hover:text-white transition-all duration-200" aria-label="Visualizar produto">
                          <FaEye className="text-sm" />
                        </button>
                      </div>

                      <div className="relative overflow-hidden bg-gradient-to-br from-red-100 to-orange-100 aspect-square">
                        <img
                          src={product.fotosUrl?.[0] || product.imagem || '/placeholder.jpg'}
                          alt={product.titulo || product.nome}
                          className="w-full h-full object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {product.desconto && (
                          <div className="absolute bottom-4 left-4 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                            -{product.desconto}%
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`text-xs ${i < (product.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">({product.reviews || '12'})</span>
                        </div>

                        <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors duration-200 uppercase">
                          {product.titulo || product.nome}
                        </h3>

                        {product.descricao && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                            {product.descricao}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                            R$ {parseFloat(product.preco || product.price || 0).toFixed(2)}
                          </span>
                          {product.precoOriginal && (
                            <span className="text-sm text-gray-400 line-through">
                              R$ {parseFloat(product.precoOriginal).toFixed(2)}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => !product.esgotado && addToCart(product)}
                          disabled={product.esgotado}
                          className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 transform relative overflow-hidden ${
                            product.esgotado
                              ? 'bg-gray-400 cursor-not-allowed'
                              : hoveredProduct === product.id
                                ? 'bg-gradient-to-r from-red-500 to-orange-500 shadow-lg scale-105'
                                : 'bg-gradient-to-r from-red-400 to-orange-400'
                          } ${!product.esgotado && 'hover:shadow-xl active:scale-95'} flex items-center justify-center gap-2`}
                          aria-label={product.esgotado ? "Produto esgotado" : "Adicionar ao carrinho"}
                        >
                          {!product.esgotado && (
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-orange-500 opacity-30 animate-pulse"></div>
                          )}
                          <FaShoppingCart className="text-sm relative z-10" />
                          <span className="relative z-10">{product.esgotado ? 'Esgotado' : '🔥 Comprar 🔥'}</span>
                        </button>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        ))}

        {carousels.length === 0 && !loading && (
          <div className="text-center py-20">
            <FaTag className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Nenhuma oferta disponível</h3>
            <p className="text-gray-500">Volte em breve para conferir nossas ofertas especiais!</p>
          </div>
        )}
      </div>
    </section>
  );
});

export default Ofertas;
