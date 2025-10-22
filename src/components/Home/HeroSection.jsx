import React from 'react';
import { FaTruck, FaShieldAlt, FaHeart, FaClock } from 'react-icons/fa';

/**
 * HeroSection - Seção principal com banner e benefícios
 * Otimizada com lazy loading de imagens e animações suaves
 */
const HeroSection = () => {
  return (
    <>
      {/* Hero Desktop */}
      <div className="hidden md:block relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              🚚 <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Entregamos
              </span> na sua casa
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed mb-6">
              Descubra produtos incríveis com entrega rápida e segura. Qualidade garantida e os melhores preços do mercado!
            </p>

            {/* Horário de Funcionamento - Destaque */}
            <div className="inline-flex flex-col items-center bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-8 py-4 rounded-2xl shadow-2xl border-2 border-white/30 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <FaClock className="text-2xl text-white animate-pulse" />
                <h3 className="text-xl font-black text-white uppercase tracking-wider">
                  Horário de Funcionamento
                </h3>
                <FaClock className="text-2xl text-white animate-pulse" />
              </div>
              <div className="flex gap-6 text-white font-bold text-lg">
                <div className="flex flex-col items-center bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <span className="text-sm font-semibold">Seg a Sáb</span>
                  <span className="text-2xl font-black">8h às 19h</span>
                </div>
                <div className="flex flex-col items-center bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <span className="text-sm font-semibold">Domingo</span>
                  <span className="text-2xl font-black">8h às 11h</span>
                </div>
              </div>
            </div>
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

      {/* Hero Mobile */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-4 rounded-2xl shadow-xl text-center md:hidden">
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
        
        {/* Horário de Funcionamento Mobile - Destaque */}
        <div className="mt-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-4 rounded-2xl shadow-2xl border-2 border-white/30 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-center gap-2 mb-3">
            <FaClock className="text-xl text-white animate-pulse" />
            <h3 className="text-lg font-black text-white uppercase tracking-wide">
              Horário de Funcionamento
            </h3>
          </div>
          <div className="space-y-2">
            <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
              <p className="text-white font-bold text-base">
                Seg a Sáb: <span className="text-xl font-black">8h às 19h</span>
              </p>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
              <p className="text-white font-bold text-base">
                Domingo: <span className="text-xl font-black">8h às 11h</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;



















