import { useState, useEffect, useMemo, useDeferredValue } from "react";
import CardProduto from "../../components/CardProduto";
import { useGetDocuments } from "../../hooks/useGetDocuments";
import { FaTruck, FaShieldAlt, FaHeart, FaSearch, FaArrowUp } from "react-icons/fa";
import Hortifruti from "../../pages/Hortifruti";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import Acougue from "../../pages/Acougue";
import FriosLaticinios from "../../pages/FriosLaticinios";
import Mercearia from "../../pages/Mercearia";
import GulosemasSnacks from "../../pages/GulosemasSnacks";
import Bebidas from "../../pages/Bebidas";
import Limpeza from "../../pages/Limpeza";
import HigienePessoal from "../../pages/HigienePessoal";
import UtilidadesDomesticas from "../../pages/UtilidadesDomesticas";
import PetShop from "../../pages/PetShop";
import Infantil from "../../pages/Infantil";
import Farmacia from "../../pages/farmacia";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Home() {
  const [termo, setTermo] = useState("");
  const debouncedTerm = useDebouncedValue(termo, 350);
  const deferredTerm = useDeferredValue(debouncedTerm);
  const [isScrollTopVisible, setIsScrollTopVisible] = useState(false);
  const { documents: produtos, loading } = useGetDocuments("produtos", { realTime: false, ttlMs: 2 * 60 * 1000 });
  const filteredByName = useMemo(() => {
    const t = deferredTerm.trim().toLowerCase();
    return (produtos || []).filter(p => (p.titulo || "").toLowerCase().includes(t));
  }, [produtos, deferredTerm]);

  // Função para limpar o input de busca
  const handleClearSearch = () => {
    setTermo("");
  };

  // Controla visibilidade do botão de voltar ao topo
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsScrollTopVisible(true);
      } else {
        setIsScrollTopVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const categories = [
    { 
      name: 'Mercearia', 
      icon: '🛒',
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      name: 'Limpeza', 
      icon: '🧹',
      color: 'from-teal-500 to-cyan-600'
    },
    { 
      name: 'Frios e laticínios', 
      icon: '🧀',
      color: 'from-yellow-500 to-amber-600'
    },
    { 
      name: 'Guloseimas e snacks', 
      icon: '🍫',
      color: 'from-pink-500 to-fuchsia-600'
    },
    { 
      name: 'Bebidas', 
      icon: '🥤',
      color: 'from-cyan-500 to-blue-600'
    },
    { 
      name: 'Higiene pessoal', 
      icon: '🧴',
      color: 'from-purple-500 to-violet-600'
    },
    { 
      name: 'Farmácia', 
      icon: '💊',
      color: 'from-emerald-500 to-green-600'
    },
    { 
      name: 'Utilidades domésticas', 
      icon: '🏠',
      color: 'from-orange-500 to-red-600'
    },
    { 
      name: 'Pet shop', 
      icon: '🐾',
      color: 'from-amber-500 to-orange-600'
    },
    { 
      name: 'Infantil', 
      icon: '👶',
      color: 'from-sky-500 to-blue-600'
    },
    { 
      name: 'Hortifruti', 
      icon: '🥬',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      name: 'Açougue', 
      icon: '🥩',
      color: 'from-red-500 to-rose-600'
    },
  ];

  const scrollToCategory = (categoryName) => {
    const element = document.getElementById(`category-${categoryName}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="hidden md:block relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              🚚 <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Entregamos
              </span> na sua casa
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Descubra produtos incríveis com entrega rápida e segura. Qualidade garantida e os melhores preços do mercado!
            </p>
          </div>

          {/* Benefícios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              <FaTruck className="text-3xl text-yellow-300 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Entrega a domicilio</h3>
              <p className="text-blue-100 text-sm">Somente R$ 5</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              <FaShieldAlt className="text-3xl text-green-300 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Garantia Total</h3>
              <p className="text-blue-100 text-sm"></p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              <FaHeart className="text-3xl text-pink-300 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Atendimento</h3>
              <p className="text-blue-100 text-sm">Suporte especializado via WhatsApp</p>
            </div>
          </div>
        </div>
        
        {/* Ondas decorativas */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" className="w-full h-12 text-gray-50">
            <path d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z" fill="currentColor"></path>
          </svg>
        </div>
      </div>
      <div className=" bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-4 rounded-2xl shadow-xl text-center md:hidden">
        <h1 className="text-4xl mt-10 md:text-6xl font-bold text-white mb-4 leading-tight">
          <span className="inline-block animate-bounce mr-3">🚚</span>
          <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)] hover:drop-shadow-[0_4px_12px_rgba(251,191,36,0.7)] transition-all duration-300 font-extrabold">
            Entregamos
          </span>
          <span className="relative ml-2 text-white font-bold">
            na sua casa
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full shadow-md"></span>
          </span>
        </h1>
        
        <div className="text-white text-sm md:text-base space-y-1 mt-4">
          <p className="font-medium">
            Seg a Sáb: 8h às 19h
          </p>
          <p className="font-medium">
            Domingo: 8h às 11h
          </p>
        </div>
      </div>

      {/* Busca */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-3xl shadow-2xl p-1 border border-blue-300">
          <div className="bg-white rounded-3xl p-8 shadow-inner">
            <div className="flex items-center justify-center">
              <div className="flex-1 max-w-2xl relative">
                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 text-xl" />
                <input
                  type="text"
                  placeholder="Pesquisar produtos..."
                  value={termo}
                  onChange={(e) => setTermo(e.target.value)}
                  className="w-full pl-14 pr-4 py-5 border border-gray-200 rounded-2xl 
                            focus:outline-none focus:ring-4 focus:ring-blue-400 
                            focus:border-transparent text-lg transition-all duration-300 
                            bg-gray-50 hover:bg-white shadow-sm hover:shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Grid de Categorias - Só aparece quando não há busca */}
      {!termo.trim() && (
        <div className="container mx-auto px-4 pb-8">
          <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Escolha uma categoria
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => scrollToCategory(category.name)}
                  className={`group relative flex flex-col items-center p-3 md:p-4 bg-gradient-to-br ${category.color} rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95`}
                >
                  {/* Icon */}
                  <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  
                  {/* Name */}
                  <span className="text-xs md:text-sm font-bold text-white text-center leading-tight">
                    {category.name}
                  </span>

                  {/* Hover shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none rounded-2xl"></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {termo.trim() ? (
        <div className="container mx-auto px-4 pb-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredByName.length === 0 ? (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="text-6xl text-gray-300 mb-6">🔍</div>
                    <h3 className="text-2xl font-bold text-gray-600 mb-4">Nenhum produto encontrado</h3>
                    <p className="text-gray-500 mb-6">Tente outro nome ou limpe a busca.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-4 lg:gap-6">
                  {filteredByName.slice(0, 48).map((produto, index) => (
                    <div key={produto.id} className="produto-card opacity-100 translate-y-0 transition-all duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                      <CardProduto
                        fotosUrl={produto.fotosUrl}
                        titulo={produto.titulo}
                        descricao={produto.descricao}
                        preco={produto.preco}
                        id={produto.id}
                        onAddToCart={handleClearSearch}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="container mx-auto  pb-4 space-y-10">
          <div id="category-Mercearia">
            <Mercearia searchTerm={termo} />
          </div>
          <div id="category-Limpeza">
            <Limpeza searchTerm={termo} />
          </div>
          <div id="category-Frios e laticínios">
            <FriosLaticinios searchTerm={termo} />
          </div>
          <div id="category-Guloseimas e snacks">
            <GulosemasSnacks searchTerm={termo} />
          </div>
          <div id="category-Bebidas">
            <Bebidas searchTerm={termo} />
          </div>
          <div id="category-Higiene pessoal">
            <HigienePessoal searchTerm={termo} />
          </div>
          <div id="category-Farmácia">
            <Farmacia searchTerm={termo} />
          </div>
          <div id="category-Utilidades domésticas">
            <UtilidadesDomesticas searchTerm={termo} />
          </div>
          <div id="category-Pet shop">
            <PetShop searchTerm={termo} />
          </div>
          <div id="category-Infantil">
            <Infantil searchTerm={termo} />
          </div>
          <div id="category-Hortifruti">
            <Hortifruti searchTerm={termo} />
          </div>
          <div id="category-Açougue">
            <Acougue searchTerm={termo} />
          </div>
        </div>
      )}
      
      {/* Botão Voltar ao Topo */}
      {isScrollTopVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 group"
          aria-label="Voltar ao topo"
        >
          <FaArrowUp className="text-xl group-hover:translate-y-[-2px] transition-transform" />
        </button>
      )}
    </div>
  );
}