"use client";
import { useState, useEffect, useContext, memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { db } from "../../firebase/config";
import { collection, getDocs, query, where, orderBy, limit, startAfter } from "firebase/firestore";
import { FaHeart, FaShoppingCart, FaStar, FaEye, FaCookie, FaSearch } from "react-icons/fa";
import { ShopContext } from "../../context/ShopContext";
import { CartContext } from "../../context/CartContext";

// ✅ CONSTANTES para otimização
const CACHE_KEY = "products_guloseimas_snacks";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const PRODUCTS_PER_PAGE = 20; // Limitar a 20 produtos por vez

const GulosemasSnacks = memo(function GulosemasSnacks({ searchTerm = "", isPreview = false }) {
  const { favorites, toggleFavorite } = useContext(ShopContext);
  const { addToCart } = useContext(CartContext);

  const [carousels, setCarousels] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // ✅ Estado para "Carregar Mais"
  const [hasMore, setHasMore] = useState(true); // ✅ Indica se há mais produtos
  const [lastDoc, setLastDoc] = useState(null); // ✅ Último documento para paginação
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  // ✅ NOVA FUNÇÃO: Busca produtos com LIMIT e paginação
  const fetchProducts = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // ✅ Verifica cache APENAS na primeira carga
      if (!isLoadMore) {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { products, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            console.log(`✅ Cache hit: Guloseimas & Snacks (${products.length} produtos)`);
            setAllProducts(products);
            setLoading(false);
            setHasMore(products.length >= PRODUCTS_PER_PAGE);
            
            // ✅ CORREÇÃO: Busca em background para obter lastDoc
            console.log('🔄 Buscando lastDoc em background...');
            const catOptions = ["Guloseimas e snacks", "Guloseimas & Snacks"];
            const bgQuery = query(
              collection(db, "produtos"),
              where("categoria", "in", catOptions),
              orderBy("titulo"),
              limit(PRODUCTS_PER_PAGE)
            );
            getDocs(bgQuery).then(qs => {
              if (qs.docs.length > 0) {
                setLastDoc(qs.docs[qs.docs.length - 1]);
                console.log('✅ lastDoc obtido do background');
              }
            }).catch(err => {
              console.error('❌ Erro ao obter lastDoc:', err);
            });
            
            return;
          }
        }
      }
      
      if (isLoadMore && !lastDoc) {
        console.log('⏳ Aguardando lastDoc...');
        setLoadingMore(false);
        return;
      }

      console.log(`🔍 Buscando produtos do Firestore${isLoadMore ? ' (carregar mais)' : ''}...`);

      // ✅ Query com LIMIT e orderBy (requer índice composto)
      const catOptions = ["Guloseimas e snacks"]; // ✅ CORRIGIDO: nome EXATO do Firebase
      let q = query(
        collection(db, "produtos"),
        where("categoria", "in", catOptions),
        orderBy("titulo"), // 👈 Ordenação no Firestore
        limit(PRODUCTS_PER_PAGE)
      );

      // ✅ Se for "carregar mais", usa startAfter
      if (isLoadMore && lastDoc) {
        q = query(
          collection(db, "produtos"),
          where("categoria", "in", ["Guloseimas e snacks"]), // ✅ CORRIGIDO
          orderBy("titulo"),
          startAfter(lastDoc), // 👈 Começa após o último documento
          limit(PRODUCTS_PER_PAGE)
        );
      }

      const qs = await getDocs(q);

      // ✅ Salvar lastDoc para paginação
      if (qs.docs.length > 0) {
        setLastDoc(qs.docs[qs.docs.length - 1]);
      }

      const newProducts = qs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // ✅ Produtos já vêm ordenados do Firestore!

      console.log(`✅ Carregados ${newProducts.length} produtos de Guloseimas & Snacks`);

      // ✅ Verifica se há mais produtos
      setHasMore(qs.docs.length === PRODUCTS_PER_PAGE);

      if (isLoadMore) {
        // Adiciona novos produtos aos existentes
        setAllProducts(prev => [...prev, ...newProducts]);
      } else {
        // Substitui produtos (primeira carga)
        setAllProducts(newProducts);

        // ✅ Salva no cache apenas na primeira carga
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          products: newProducts,
          timestamp: Date.now()
        }));
      }

    } catch (error) {
      console.error("❌ Erro ao buscar produtos de guloseimas e snacks:", error);
      setAllProducts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ✅ useEffect: Busca produtos na montagem
  useEffect(() => {
    fetchProducts(false);
  }, []);

  // ✅ Função para carregar mais produtos
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(true);
    }
  };

  // ✅ NOVA: Função para buscar produtos por termo (busca no DB)
  const searchProducts = async (searchTerm) => {
    try {
      setLoading(true);
      console.log(`🔍 Buscando produtos com termo: "${searchTerm}"...`);

      const catOptions = ["Guloseimas e snacks"]; // ✅ CORRIGIDO: nome EXATO do Firebase
      const q = query(
        collection(db, "produtos"),
        where("categoria", "in", catOptions),
        limit(100) // Aumenta limite para busca mais abrangente
      );

      const qs = await getDocs(q);
      let products = qs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filtrar por termo de busca
      const searchLower = searchTerm.toLowerCase();
      products = products.filter(p =>
        (p.titulo || "").toLowerCase().includes(searchLower) ||
        (p.descricao || "").toLowerCase().includes(searchLower)
      );

      // Ordenar localmente
      products.sort((a, b) => {
        const titleA = (a.titulo || a.nome || "").toLowerCase();
        const titleB = (b.titulo || b.nome || "").toLowerCase();
        return titleA.localeCompare(titleB);
      });

      console.log(`✅ Encontrados ${products.length} produtos com "${searchTerm}"`);
      setAllProducts(products);
      setHasMore(false); // Desabilita "Carregar Mais" durante busca
      setLoading(false);
    } catch (error) {
      console.error("❌ Erro ao buscar produtos:", error);
      setLoading(false);
    }
  };

  // ✅ useEffect para busca (dispara quando localSearchTerm muda)
  useEffect(() => {
    // Busca apenas quando NÃO for preview
    if (!isPreview) {
      if (localSearchTerm.trim() && localSearchTerm.trim().length >= 3) {
        // Se tem termo de busca com mínimo 3 caracteres, busca no banco
        const timer = setTimeout(() => {
          searchProducts(localSearchTerm.trim());
        }, 500); // Debounce de 500ms
        return () => clearTimeout(timer);
      } else if (localSearchTerm.trim().length === 0) {
        // Se não tem termo, recarrega produtos normais
        setAllProducts([]);
        setLastDoc(null);
        setHasMore(true);
        fetchProducts(false);
      }
      // Se tiver menos de 3 caracteres, não faz nada (aguarda digitar mais)
    }
  }, [localSearchTerm, isPreview]);

  useEffect(() => {
    // Usar termo local quando não for preview, senão usar searchTerm da home
    const term = isPreview ? searchTerm.trim().toLowerCase() : localSearchTerm.trim().toLowerCase();
    const source = term
      ? allProducts.filter(p => (p.titulo || "").toLowerCase().includes(term))
      : allProducts;

    // Limitar a 10 produtos apenas quando for preview na home
    const productsToShow = isPreview ? source.slice(0, 10) : source;
    
    const chunkSize = 5;
    const grouped = [];
    for (let i = 0; i < productsToShow.length; i += chunkSize) {
      grouped.push(productsToShow.slice(i, i + chunkSize));
    }
    setCarousels(grouped);
  }, [allProducts, searchTerm, isPreview, localSearchTerm]);

  const isFavorited = (productId) => favorites.some(fav => fav.id === productId);

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500"></div>
            <p className="mt-4 text-gray-600 text-lg">Carregando produtos...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!loading && searchTerm && allProducts.length > 0 && carousels.length === 0) {
    return null;
  }

  const hasSearch = searchTerm.trim().length > 0;
  const resultsCount = carousels.reduce((acc, g) => acc + g.length, 0);

  return (
    <section className="min-h-screen mt-10 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* SearchBar - apenas quando não for preview */}
        {!isPreview && (
          <div className="w-full flex justify-center py-8 mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 w-full max-w-2xl">
              <div className="flex flex-col items-center justify-center">
                <div className="w-full relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="text"
                    placeholder="Pesquisar guloseimas e snacks..."
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl 
                              focus:outline-none focus:ring-2 focus:ring-amber-300 
                              focus:border-amber-400 text-lg transition-all duration-300 
                              bg-gray-50 hover:bg-white shadow-sm hover:shadow-md"
                    aria-label="Pesquisar guloseimas e snacks"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  {localSearchTerm && (
                    <button
                      onClick={() => setLocalSearchTerm("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Limpar busca"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {localSearchTerm && localSearchTerm.length < 3 && (
                  <p className="text-orange-600 text-sm font-semibold mt-2">
                    💡 Digite pelo menos 3 caracteres para buscar ({localSearchTerm.length}/3)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-6">
            <FaCookie className="text-amber-500 text-xl animate-pulse" />
            <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">
              Doces & Saborosos
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
            Guloseimas & Snacks
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Deliciosas guloseimas e snacks para seus momentos especiais
          </p>

          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex -space-x-1">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400 text-lg" />
              ))}
            </div>
            <span className="text-gray-600 ml-2">Produtos selecionados</span>
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
                      className="group relative bg-white  shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:scale-105"
                      onMouseEnter={() => setHoveredProduct(product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                        {product.esgotado ? (
                          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            Esgotado
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            Delicia
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

                        <button className="p-2 bg-white/90 text-gray-600 rounded-full shadow-lg hover:bg-amber-500 hover:text-white transition-all duration-200" aria-label="Visualizar produto">
                          <FaEye className="text-sm" />
                        </button>
                      </div>

                      <div className="relative overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 aspect-square">
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

                        <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors duration-200 uppercase">
                          {product.titulo || product.nome}
                        </h3>

                        {product.descricao && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                            {product.descricao}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
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
                          className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                            product.esgotado
                              ? 'bg-gray-400 cursor-not-allowed'
                              : hoveredProduct === product.id
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg scale-105'
                                : 'bg-gradient-to-r from-amber-400 to-orange-400'
                          } ${!product.esgotado && 'hover:shadow-xl active:scale-95'} flex items-center justify-center gap-2`}
                          aria-label={product.esgotado ? "Produto esgotado" : "Adicionar ao carrinho"}
                        >
                          <FaShoppingCart className="text-sm" />
                          <span>{product.esgotado ? 'Esgotado' : 'Carrinho'}</span>
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

        {/* Botão Ver Mais - só aparece no preview da home */}
        {isPreview && allProducts.length > 10 && (
          <div className="text-center mt-8">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/guloseimas-snacks';
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span>Ver todos os produtos</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Mostrando 10 de {allProducts.length} produtos
            </p>
          </div>
        )}

        {/* ✅ NOVO: Botão "Carregar Mais" - só aparece quando NÃO é preview */}
        {!isPreview && hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3"
            >
              {loadingMore ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Carregando...</span>
                </>
              ) : (
                <>
                  <FaCookie className="text-xl" />
                  <span>Carregar Mais Produtos</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ✅ Indicador de fim da lista */}
        {!isPreview && !hasMore && allProducts.length > 0 && (
          <div className="text-center mt-8 py-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-md">
            <div className="inline-flex items-center gap-2 text-green-600 font-semibold text-lg mb-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Todos os produtos foram carregados!</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Total: <span className="font-bold text-amber-600">{allProducts.length}</span> produtos
            </p>
          </div>
        )}
      </div>
    </section>
  );
});

export default GulosemasSnacks;