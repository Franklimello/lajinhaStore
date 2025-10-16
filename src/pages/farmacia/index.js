"use client";
import { useState, useEffect, useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { FaHeart, FaShoppingCart, FaStar, FaEye, FaPrescriptionBottleAlt } from "react-icons/fa";
import { ShopContext } from "../../context/ShopContext";

export default function Farmacia({ searchTerm = "" }) {
  const { favorites, toggleFavorite, addToCart } = useContext(ShopContext);

  const [carousels, setCarousels] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar todos os produtos do Firestore
        const querySnapshot = await getDocs(collection(db, "produtos"));
        
        // Filtrar localmente por categoria (aceita com ou sem acento)
        const products = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(product => {
            const categoria = (product.categoria || "").toLowerCase().trim();
            // Remove acentos para comparação
            const categoriaNormalized = categoria.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return categoria.includes("farmacia") || 
                   categoria.includes("farmácia") ||
                   categoriaNormalized.includes("farmacia");
          });
        
        // Ordenar produtos por ordem alfabética (título)
        const sortedProducts = products.sort((a, b) => {
          const titleA = (a.titulo || a.nome || "").toLowerCase();
          const titleB = (b.titulo || b.nome || "").toLowerCase();
          return titleA.localeCompare(titleB);
        });
        
        console.log(`✅ Encontrados ${sortedProducts.length} produtos de Farmácia (ordenados A-Z)`);
        
        // Debug: mostrar as categorias encontradas
        if (sortedProducts.length === 0) {
          console.warn("⚠️ Nenhum produto de Farmácia encontrado. Verificando todas as categorias disponíveis:");
          const allCategories = querySnapshot.docs.map(doc => doc.data().categoria);
          console.log("Categorias no banco:", [...new Set(allCategories)]);
        }
        
        setAllProducts(sortedProducts);
      } catch (error) {
        console.error("❌ Erro ao buscar produtos farmacêuticos:", error);
        setAllProducts([]);
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

  const isFavorited = (productId) => favorites.some(fav => fav.id === productId);

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-600 text-lg">Carregando produtos farmacêuticos...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!loading && allProducts.length === 0) {
    return null;
  }

  if (!loading && searchTerm && allProducts.length > 0 && carousels.length === 0) {
    return null;
  }

  const hasSearch = searchTerm.trim().length > 0;
  const resultsCount = carousels.reduce((acc, g) => acc + g.length, 0);

  return (
    <section className="min-h-screen mt-10 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-6">
            <FaPrescriptionBottleAlt className="text-green-500 text-xl animate-pulse" />
            <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">
              Saúde e Bem-Estar
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Farmácia
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Medicamentos, produtos de higiene e cuidados para sua saúde
          </p>

          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex -space-x-1">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400 text-lg" />
              ))}
            </div>
            <span className="text-gray-600 ml-2">Produtos confiáveis</span>
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
                modules={[Navigation, Pagination, Autoplay]}
                navigation={{
                  prevEl: `.swiper-button-prev-${index}`,
                  nextEl: `.swiper-button-next-${index}`,
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                }}
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
                      className="group relative bg-white  shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:scale-105"
                      onMouseEnter={() => setHoveredProduct(product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      <div className="absolute top-4 left-4 z-10">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          Farmácia
                        </div>
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

                        <button className="p-2 bg-white/90 text-gray-600 rounded-full shadow-lg hover:bg-green-500 hover:text-white transition-all duration-200" aria-label="Visualizar produto">
                          <FaEye className="text-sm" />
                        </button>
                      </div>

                      <div className="relative overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 aspect-square">
                        <img
                          src={product.fotosUrl?.[0] || product.imagem || '/placeholder.jpg'}
                          alt={product.titulo || product.nome}
                          className="w-full h-full"
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

                        <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors duration-200">
                          {product.titulo || product.nome}
                        </h3>

                        {product.descricao && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                            {product.descricao}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            R$ {parseFloat(product.preco || product.price || 0).toFixed(2)}
                          </span>
                          {product.precoOriginal && (
                            <span className="text-sm text-gray-400 line-through">
                              R$ {parseFloat(product.precoOriginal).toFixed(2)}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => addToCart(product)}
                          className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                            hoveredProduct === product.id
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg scale-105'
                              : 'bg-gradient-to-r from-green-400 to-emerald-400'
                          } hover:shadow-xl active:scale-95 flex items-center justify-center gap-2`}
                          aria-label="Adicionar ao carrinho"
                        >
                          <FaShoppingCart className="text-sm" />
                          <span>Carrinho</span>
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
      </div>
    </section>
  );
}