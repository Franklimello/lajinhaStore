"use client";
import { useState, useEffect, useContext, memo, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { db } from "../../firebase/config";
import { collection, getDocs, query, where, orderBy, limit, startAfter } from "firebase/firestore";
import { buildFormatSources, defaultSizes } from "../../utils/imageSources";
import { FaHeart, FaShoppingCart, FaStar, FaEye, FaCookie, FaSearch } from "react-icons/fa";
import { ShopContext } from "../../context/ShopContext";
import { CartContext } from "../../context/CartContext";
import CartAddAnimation from "../../components/CartAddAnimation";
import FilterBar from "../../components/FilterBar";
import { useProductFilters } from "../../hooks/useProductFilters";

// ✅ CONSTANTES para otimização
const CACHE_KEY = "products_salgados_joazinho";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const PRODUCTS_PER_PAGE = 20; // Limitar a 20 produtos por vez

const SalgadosDoJoazinho = memo(function SalgadosDoJoazinho({ searchTerm = "", isPreview = false }) {
  const { favorites, toggleFavorite } = useContext(ShopContext);
  const { addToCart } = useContext(CartContext);

  const [carousels, setCarousels] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false); // Desabilitar "carregar mais" por padrão (vamos carregar tudo)
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [productClickCounts, setProductClickCounts] = useState({});
  const [animatingProducts, setAnimatingProducts] = useState({});

  // ✅ Função: Busca produtos com LIMIT e paginação
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
            console.log(`✅ Cache hit: Salgados do Joazinho (${products.length} produtos)`);
            setAllProducts(products);
            setLoading(false);
            setHasMore(products.length >= PRODUCTS_PER_PAGE);
            
            // Não precisa de lastDoc quando não usa orderBy
            
            return;
          }
        }
      }
      
      // Quando não usa paginação com lastDoc, pode pular esse check

      console.log(`🔍 Buscando produtos do Firestore${isLoadMore ? ' (carregar mais)' : ''}...`);

      // ✅ Limpa cache se não for "carregar mais" para garantir produtos atualizados
      if (!isLoadMore) {
        sessionStorage.removeItem(CACHE_KEY);
      }

      // ✅ Query SEM orderBy para evitar necessidade de índice composto
      const catOptions = ["Salgados do Joazinho", "salgados do joazinho", "SalgadosDoJoazinho", "Salgados"];
      let q = query(
        collection(db, "produtos"),
        where("categoria", "in", catOptions)
      );

      const qs = await getDocs(q);
      
      let newProducts = qs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      console.log(`📦 Encontrados ${newProducts.length} produtos brutos do Firestore`);
      
      // ✅ Ordenar no cliente por título (alfabético)
      newProducts.sort((a, b) => {
        const titleA = (a.titulo || a.nome || "").toLowerCase();
        const titleB = (b.titulo || b.nome || "").toLowerCase();
        return titleA.localeCompare(titleB, 'pt-BR');
      });
      
      console.log(`✅ Carregados ${newProducts.length} produtos de Salgados do Joazinho (ordenados)`);
      
      // Log de debug - mostra as categorias encontradas
      const categoriasEncontradas = [...new Set(newProducts.map(p => p.categoria))];
      console.log(`📋 Categorias encontradas:`, categoriasEncontradas);

      // ✅ Verifica se há mais produtos (verifica se pegou todos na primeira carga)
      if (!isLoadMore) {
        setHasMore(newProducts.length >= PRODUCTS_PER_PAGE);
      } else {
        setHasMore(false); // Desabilita "carregar mais" após primeiro carregamento
      }

      if (isLoadMore) {
        setAllProducts(prev => [...prev, ...newProducts]);
      } else {
        setAllProducts(newProducts);
        
        // Salva no cache apenas na primeira carga
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          products: newProducts,
          timestamp: Date.now()
        }));
      }

    } catch (error) {
      console.error("❌ Erro ao buscar produtos dos salgados do Joazinho:", error);
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
  const handleLoadMore = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!loadingMore && hasMore) {
      console.log('🔄 Carregando mais produtos...');
      fetchProducts(true);
    }
  };

  // ✅ Função para normalizar texto
  const normalize = useCallback((str) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  // Hook de filtros e ordenação
  const {
    sortBy,
    priceRange,
    showOnlyInStock,
    showOnlyDiscounted,
    setSortBy,
    setPriceRange,
    setShowOnlyInStock,
    setShowOnlyDiscounted,
    clearFilters,
    filteredAndSortedProducts: filteredProducts
  } = useProductFilters(allProducts, normalize);

  // ✅ Função: Buscar produtos por termo
  const searchProducts = useCallback(async (searchTerm) => {
    try {
      setSearching(true);
      console.log(`🔍 Buscando produtos com termo: "${searchTerm}"...`);

      const catOptions = ["Salgados do Joazinho", "salgados do joazinho", "SalgadosDoJoazinho", "Salgados"];
      const q = query(
        collection(db, "produtos"),
        where("categoria", "in", catOptions)
      );

      const qs = await getDocs(q);
      let products = qs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Ordenar por título
      products.sort((a, b) => {
        const titleA = (a.titulo || a.nome || "").toLowerCase();
        const titleB = (b.titulo || b.nome || "").toLowerCase();
        return titleA.localeCompare(titleB, 'pt-BR');
      });
      
      const searchLower = searchTerm.toLowerCase().trim();
      const normalizedSearch = normalize(searchLower);
      const searchWords = normalizedSearch.split(' ').filter(w => w.length > 0);
      
      products = products.filter(p => {
        const titulo = normalize((p.titulo || "").toLowerCase());
        const descricao = normalize((p.descricao || "").toLowerCase());
        const categoria = normalize((p.categoria || "").toLowerCase());
        
        if (titulo.includes(normalizedSearch) || 
            descricao.includes(normalizedSearch) || 
            categoria.includes(normalizedSearch)) {
          return true;
        }
        
        if (searchWords.length > 0) {
          const allWordsMatch = searchWords.every(word => 
            titulo.includes(word) || 
            descricao.includes(word) || 
            categoria.includes(word)
          );
          
          if (allWordsMatch) {
            return true;
          }
        }
        
        return false;
      });

      products.sort((a, b) => {
        const titleA = normalize((a.titulo || a.nome || "").toLowerCase());
        const titleB = normalize((b.titulo || b.nome || "").toLowerCase());
        return titleA.localeCompare(titleB, 'pt-BR');
      });

      console.log(`✅ Encontrados ${products.length} produtos com "${searchTerm}"`);
      setAllProducts(products);
      setHasMore(false);
      setSearching(false);
    } catch (error) {
      console.error("❌ Erro ao buscar produtos:", error);
      setSearching(false);
      setAllProducts([]);
      setHasMore(false);
    }
  }, [normalize]);

  // ✅ useEffect para busca
  useEffect(() => {
    if (!isPreview) {
      if (localSearchTerm.trim() && localSearchTerm.trim().length >= 3) {
        const searchValue = localSearchTerm.trim();
        const timer = setTimeout(() => {
          searchProducts(searchValue);
        }, 400);
        return () => clearTimeout(timer);
      } else if (localSearchTerm.trim().length === 0) {
        setAllProducts([]);
        setHasMore(false);
        fetchProducts(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearchTerm, isPreview]);

  useEffect(() => {
    // Processar produtos para exibição (carrosséis)
    // Usar produtos filtrados e ordenados do hook
    const term = isPreview ? searchTerm.trim().toLowerCase() : localSearchTerm.trim().toLowerCase();
    let source = term
      ? filteredProducts.filter(p => (p.titulo || "").toLowerCase().includes(term))
      : filteredProducts;

    const productsToShow = isPreview ? source.slice(0, 10) : source;
    
    const chunkSize = 5;
    const grouped = [];
    for (let i = 0; i < productsToShow.length; i += chunkSize) {
      grouped.push(productsToShow.slice(i, i + chunkSize));
    }
    setCarousels(grouped);
  }, [filteredProducts, searchTerm, isPreview, localSearchTerm]);

  const isFavorited = (productId) => favorites.some(fav => fav.id === productId);

  // ✅ Loading screen
  if (loading && allProducts.length === 0 && !localSearchTerm) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600 text-lg">Carregando salgados deliciosos...</p>
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
    <section className="min-h-screen mt-10 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Filtros e Ordenação - apenas quando não for preview */}
        {!isPreview && (
          <FilterBar
            sortBy={sortBy}
            setSortBy={setSortBy}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            showOnlyInStock={showOnlyInStock}
            setShowOnlyInStock={setShowOnlyInStock}
            showOnlyDiscounted={showOnlyDiscounted}
            setShowOnlyDiscounted={setShowOnlyDiscounted}
            themeColor="amber"
          />
        )}

        {/* SearchBar - apenas quando não for preview */}
        {!isPreview && (
          <div className="w-full flex justify-center py-8 mb-8">
            <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-2xl shadow-xl border-2 border-orange-100 p-6 w-full max-w-3xl">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-full relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    {searching ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-500 border-t-transparent"></div>
                    ) : (
                      <FaSearch className="text-orange-500 text-xl" />
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar salgados... (ex: coxinha, pastel, empada)"
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                    className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl 
                              focus:outline-none focus:ring-4 focus:ring-orange-200 
                              text-lg transition-all duration-300 
                              ${
                                searching 
                                  ? 'border-orange-400 bg-orange-50' 
                                  : localSearchTerm.length >= 3
                                    ? 'border-green-400 bg-green-50/50 shadow-md'
                                    : 'border-gray-300 bg-white hover:border-orange-300 hover:bg-orange-50/30'
                              } 
                              shadow-sm hover:shadow-lg`}
                    aria-label="Pesquisar salgados"
                    autoComplete="off"
                    spellCheck="false"
                    disabled={searching}
                  />
                  {localSearchTerm && !searching && (
                    <button
                      onClick={() => {
                        setLocalSearchTerm("");
                        setAllProducts([]);
                        setHasMore(false);
                        fetchProducts(false);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-full p-1.5"
                      aria-label="Limpar busca"
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Indicadores visuais */}
                <div className="w-full flex items-center justify-between text-sm">
                  {localSearchTerm && localSearchTerm.length < 3 && (
                    <div className="flex items-center gap-2 text-amber-600 font-medium animate-pulse">
                      <span>💡</span>
                      <span>Digite pelo menos 3 caracteres ({localSearchTerm.length}/3)</span>
                    </div>
                  )}
                  
                  {localSearchTerm && localSearchTerm.length >= 3 && searching && (
                    <div className="flex items-center gap-2 text-orange-600 font-medium">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
                      <span>Pesquisando...</span>
                    </div>
                  )}
                  
                  {localSearchTerm && localSearchTerm.length >= 3 && !searching && allProducts.length > 0 && (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Salgados encontrados!</span>
                    </div>
                  )}
                  
                  <div className="ml-auto text-gray-500">
                    {localSearchTerm && localSearchTerm.length >= 3 && allProducts.length > 0 && (
                      <span className="font-semibold text-orange-600">
                        {allProducts.length} resultado{allProducts.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-full shadow-lg mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-amber-500 opacity-75 animate-pulse"></div>
            <FaCookie className="text-white text-xl relative z-10 animate-bounce" />
            <span className="text-sm font-bold uppercase tracking-wider relative z-10">
              🍴 Salgados Artesanais
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent mb-4">
            Salgados do Joaõzinho
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Os melhores salgados artesanais, feitos com carinho e qualidade
          </p>

          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex -space-x-1">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400 text-lg" />
              ))}
            </div>
            <span className="text-gray-600 ml-2">Sabor e qualidade garantidos</span>
          </div>

          {hasSearch && (
            <p className="mt-4 text-sm text-gray-600">
              Resultados para "{searchTerm}": {resultsCount} produto(s)
            </p>
          )}
          
          {!isPreview && localSearchTerm && localSearchTerm.length >= 3 && !searching && (
            <p className="mt-4 text-sm text-gray-600">
              {resultsCount > 0 ? (
                <span>Resultados para "<strong className="text-orange-600">{localSearchTerm}</strong>": {resultsCount} produto{resultsCount !== 1 ? 's' : ''}</span>
              ) : (
                <span className="text-amber-600">Nenhum produto encontrado para "<strong>{localSearchTerm}</strong>"</span>
              )}
            </p>
          )}
        </div>

        {/* Mensagem quando não há resultados */}
        {!isPreview && localSearchTerm && localSearchTerm.length >= 3 && !searching && carousels.length === 0 && (
          <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="flex flex-col items-center gap-4">
              <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-500 mb-4">
                  Não encontramos salgados que correspondam à busca "<strong className="text-gray-700">{localSearchTerm}</strong>"
                </p>
                <button
                  onClick={() => {
                    setLocalSearchTerm("");
                    setAllProducts([]);
                    setHasMore(false);
                    fetchProducts(false);
                  }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <span>Limpar busca</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Carousels */}
        {carousels.map((group, index) => (
          <div key={index} className="mb-10">
            <div className="relative -mx-2 sm:mx-0">
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
                          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            Artesanal
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

                      <div className="relative overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 aspect-square">
                        {(() => {
                          const src = product.fotosUrl?.[0] || product.imagem || '/placeholder.jpg';
                          const { avif, webp, fallback } = buildFormatSources(src);
                          return (
                            <picture>
                              {avif && <source srcSet={avif} type="image/avif" />}
                              {webp && <source srcSet={webp} type="image/webp" />}
                              <img
                                src={fallback}
                                alt={product.titulo || product.nome}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                                sizes={defaultSizes}
                              />
                            </picture>
                          );
                        })()}

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

                        <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors duration-200 uppercase">
                          {product.titulo || product.nome}
                        </h3>

                        {product.descricao && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                            {product.descricao}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                            R$ {parseFloat(product.preco || product.price || 0).toFixed(2)}
                          </span>
                          {product.precoOriginal && (
                            <span className="text-sm text-gray-400 line-through">
                              R$ {parseFloat(product.precoOriginal).toFixed(2)}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!product.esgotado) {
                              addToCart(product);
                              const currentCount = productClickCounts[product.id] || 0;
                              const newCount = currentCount + 1;
                              setProductClickCounts(prev => ({ ...prev, [product.id]: newCount }));
                              if (newCount >= 2) {
                                setAnimatingProducts(prev => ({ ...prev, [product.id]: newCount }));
                                setTimeout(() => {
                                  setAnimatingProducts(prev => {
                                    const updated = { ...prev };
                                    delete updated[product.id];
                                    return updated;
                                  });
                                }, 1600);
                              }
                            }
                          }}
                          disabled={product.esgotado}
                          style={{ touchAction: 'manipulation' }}
                          className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 transform relative overflow-hidden ${
                            product.esgotado
                              ? 'bg-gray-400 cursor-not-allowed'
                              : hoveredProduct === product.id
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg scale-105'
                                : 'bg-gradient-to-r from-orange-400 to-amber-400'
                          } ${!product.esgotado && 'hover:shadow-xl active:scale-95'} flex items-center justify-center gap-2`}
                          aria-label={product.esgotado ? "Produto esgotado" : "Adicionar ao carrinho"}
                        >
                          <CartAddAnimation 
                            count={productClickCounts[product.id] || 1} 
                            show={!!animatingProducts[product.id]} 
                          />
                          <FaShoppingCart className="text-sm relative z-10" />
                          <span className="relative z-10">{product.esgotado ? 'Esgotado' : 'Adicionar'}</span>
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
                window.location.href = '/salgados-do-joazinho';
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span>Ver todos os salgados</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Mostrando 10 de {allProducts.length} produtos
            </p>
          </div>
        )}

        {/* Botão "Carregar Mais" */}
        {!isPreview && hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 
                        text-white px-8 py-4 rounded-xl font-semibold text-lg
                        transition-all duration-200 
                        hover:scale-105 active:scale-95
                        shadow-lg hover:shadow-xl 
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 
                        flex items-center gap-3
                        focus:outline-none focus:ring-4 focus:ring-orange-300"
              aria-label="Carregar mais produtos"
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
                  <FaCookie className="text-xl pointer-events-none" />
                  <span>Carregar Mais Salgados</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Indicador de fim da lista */}
        {!isPreview && !hasMore && allProducts.length > 0 && (
          <div className="text-center mt-8 py-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-md">
            <div className="inline-flex items-center gap-2 text-orange-600 font-semibold text-lg mb-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Todos os salgados foram carregados!</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Total: <span className="font-bold text-orange-600">{allProducts.length}</span> produtos
            </p>
          </div>
        )}

        {/* Mensagem quando não há produtos */}
        {carousels.length === 0 && !loading && !localSearchTerm && (
          <div className="text-center py-20">
            <FaCookie className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Nenhum salgado disponível</h3>
            <p className="text-gray-500">Volte em breve para conferir nossos salgados artesanais!</p>
          </div>
        )}
        
      </div>
    </section>
  );
});

export default SalgadosDoJoazinho;
