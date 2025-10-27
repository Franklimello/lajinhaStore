import React from 'react';
import { FaTruck, FaShieldAlt, FaHeart, FaClock, FaComments, FaWhatsapp } from 'react-icons/fa';

const HeroSection = () => {

  return (
    <>
      {/* Hero Desktop */}
      <div className="hidden md:block relative overflow-hidden bg-white w-screen -ml-[50vw] left-1/2 right-1/2 -mr-[50vw]">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
        
        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="mb-8">
            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Entregamos
              </span>
              <br />
              <span className="text-gray-700 font-light">na sua casa</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6 font-light">
              Experiência premium em compras online. Qualidade superior, entrega expressa e atendimento personalizado.
            </p>

            {/* Horário Card */}
            <div className="inline-flex flex-col items-center bg-gray-50 px-8 py-4 rounded-3xl border border-gray-200 shadow-lg transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <FaClock className="text-lg text-cyan-600" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest">
                  Horário de Atendimento
                </h3>
              </div>
              <div className="flex gap-8 text-gray-900">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-gray-600 mb-1">Segunda a Sábado</span>
                  <span className="text-xl font-bold">8h às 19h</span>
                </div>
                <div className="w-px bg-gray-300"></div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-gray-600 mb-1">Domingo</span>
                  <span className="text-xl font-bold">8h às 11h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat and WhatsApp Buttons - CORRIGIDO */}
          <div className="relative z-50 flex flex-col gap-3 items-center mt-6 mb-6">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Botão "Fale com Nossa Equipe" clicado!');
                window.dispatchEvent(new CustomEvent('openChat'));
              }}
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium text-base transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl cursor-pointer"
            >
              <FaComments className="text-lg" />
              Fale com Nossa Equipe
            </button>
            
            <a
              href="https://wa.me/5519997050303"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                console.log('🖱️ Botão WhatsApp clicado!');
              }}
              className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium text-base transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl cursor-pointer"
            >
              <FaWhatsapp className="text-lg" />
              WhatsApp
            </a>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-6">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-all duration-300 shadow-sm">
              <FaTruck className="text-3xl text-cyan-600 mx-auto mb-3" />
              <h3 className="text-gray-900 font-semibold mb-2 text-sm">Entrega a domicílio</h3>
              <p className="text-gray-600 text-xs font-light">Somente R$ 5</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-all duration-300 shadow-sm">
              <FaShieldAlt className="text-3xl text-emerald-600 mx-auto mb-3" />
              <h3 className="text-gray-900 font-semibold mb-2 text-sm">Garantia Total</h3>
              <p className="text-gray-600 text-xs font-light">Produtos certificados</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-all duration-300 shadow-sm">
              <FaHeart className="text-3xl text-pink-600 mx-auto mb-3" />
              <h3 className="text-gray-900 font-semibold mb-2 text-sm">Atendimento</h3>
              <p className="text-gray-600 text-xs font-light">Suporte especializado via WhatsApp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Mobile */}
      <div className="bg-white w-screen -ml-[50vw] left-1/2 right-1/2 -mr-[50vw] py-2 shadow-lg text-center md:hidden relative overflow-hidden">
        {/* Background Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none"></div>
        
        {/* Content */}
        <div className="relative z-10 px-4">
          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
              Entregamos
            </span>
            <br />
            <span className="text-gray-700 font-light">na sua casa</span>
          </h1>

          {/* Horário Card Mobile */}
          <div className="mt-6 bg-gray-50 px-6 py-5 rounded-3xl border border-gray-200 shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center gap-2 mb-4">
              <FaClock className="text-lg text-cyan-600" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest">
                Horário de Atendimento
              </h3>
            </div>
            <div className="space-y-3">
              <div className="bg-white px-4 py-3 rounded-xl border border-gray-200">
                <p className="text-gray-900 font-medium text-sm">
                  <span className="text-gray-600">Segunda a Sábado</span>
                  <br />
                  <span className="text-lg font-bold">8h às 19h</span>
                </p>
              </div>
              <div className="bg-white px-4 py-3 rounded-xl border border-gray-200">
                <p className="text-gray-900 font-medium text-sm">
                  <span className="text-gray-600">Domingo</span>
                  <br />
                  <span className="text-lg font-bold">8h às 11h</span>
                </p>
              </div>
            </div>

            {/* Chat and WhatsApp Buttons Mobile - CORRIGIDO */}
            <div className="relative z-50 flex flex-col gap-3 mt-6 mb-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🖱️ Botão "Fale com Nossa Equipe" clicado (Mobile)!');
                  window.dispatchEvent(new CustomEvent('openChat'));
                }}
                className="flex items-center justify-center gap-3 bg-blue-600 active:bg-blue-700 text-white px-6 py-4 rounded-full font-medium text-base transition-all duration-200 active:scale-95 shadow-lg cursor-pointer w-full"
              >
                <FaComments className="text-lg" />
                Fale Conosco
              </button>
              
              <a
                href="https://wa.me/5519997050303"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  console.log('🖱️ Botão WhatsApp clicado (Mobile)!');
                }}
                className="flex items-center justify-center gap-3 bg-green-600 active:bg-green-700 text-white px-6 py-4 rounded-full font-medium text-base transition-all duration-200 active:scale-95 shadow-lg cursor-pointer w-full"
              >
                <FaWhatsapp className="text-lg" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default HeroSection;