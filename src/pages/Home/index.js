import { useState } from "react";
import CardProduto from "../../components/CardProduto";
import { useGetDocuments } from "../../hooks/useGetDocuments";
import { FaTruck, FaShieldAlt, FaHeart, FaSearch } from "react-icons/fa";
import Hortifruti from "../../pages/Hortifruti";
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
  const { documents: produtos, loading } = useGetDocuments("produtos");
  const filteredByName = (produtos || []).filter(p => (p.titulo || "").toLowerCase().includes(termo.trim().toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
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

      {/* Busca */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Pesquisar produtos..."
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {filteredByName.map((produto, index) => (
                    <div key={produto.id} className="produto-card opacity-100 translate-y-0 transition-all duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                      <CardProduto
                        fotosUrl={produto.fotosUrl}
                        titulo={produto.titulo}
                        descricao={produto.descricao}
                        preco={produto.preco}
                        id={produto.id}
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
          <Mercearia searchTerm={termo} />
          <Limpeza searchTerm={termo} />
          <FriosLaticinios searchTerm={termo} />
          <GulosemasSnacks searchTerm={termo} />
          <Bebidas searchTerm={termo} />
          <HigienePessoal searchTerm={termo} />
          <Farmacia searchTerm={termo} />
          <UtilidadesDomesticas searchTerm={termo} />
          <PetShop searchTerm={termo} />
          <Infantil searchTerm={termo} />
          <Hortifruti searchTerm={termo} />
          <Acougue searchTerm={termo} />
        </div>
      )}
    </div>
  );
}