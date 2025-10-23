import React, { useState } from 'react';
import { FaTruck, FaShieldAlt, FaHeart, FaClock, FaComments, FaWhatsapp } from 'react-icons/fa';

const HeroSection = () => {
  const [showChatMessage, setShowChatMessage] = useState(false);

  const handleChatClick = () => {
    window.dispatchEvent(new CustomEvent('openChat'));
    setShowChatMessage(true);
    setTimeout(() => setShowChatMessage(false), 3000);
  };

  return (
    <>
      {/* Hero Desktop */}
      <div className="hidden md:block relative overflow-hidden bg-white w-screen -ml-[50vw] left-1/2 right-1/2 -mr-[50vw]">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        {/* Content */}
        <div className="relative w-full max-w-7xl mx-auto px-4 py-12 text-center">
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

            {/* Chat and WhatsApp Buttons */}
            <div className="mt-6 mb-4 flex flex-col items-center gap-3">
              <button
                onClick={handleChatClick}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium text-base px-8 py-3 rounded-full shadow-lg hover:shadow-cyan-500/30 transform hover:scale-105 transition-all duration-300"
              >
                <FaComments className="text-lg group-hover:rotate-12 transition-transform" />
                <span>Fale com Nossa Equipe</span>
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-md">
                  Online
                </span>
              </button>
              
              {/* WhatsApp Button */}
              <a
                href="https://wa.me/5519997050303"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium text-base px-8 py-3 rounded-full shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 transition-all duration-300"
              >
                <FaWhatsapp className="text-lg group-hover:rotate-12 transition-transform" />
                <span>WhatsApp</span>
              </a>
              
              {showChatMessage && (
                <p className="text-gray-600 text-sm mt-1 font-light">
                  Conectando...
                </p>
              )}
            </div>
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>
        
        {/* Content */}
        <div className="relative px-4">
          {/* Title */}
          <h1 className="text-4xl  font-bold text-gray-900 mb-4 leading-tight">
            
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

            {/* Chat and WhatsApp Buttons Mobile */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleChatClick}
                className="group w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium text-base px-6 py-4 rounded-full shadow-lg hover:shadow-cyan-500/30 transform hover:scale-105 transition-all duration-300 relative"
              >
                <FaComments className="text-lg group-hover:rotate-12 transition-transform" />
                <span>Fale Conosco</span>
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-md">
                  Online
                </span>
              </button>
              
              {/* WhatsApp Button Mobile */}
              <a
                href="https://wa.me/5519997050303"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium text-base px-6 py-4 rounded-full shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 transition-all duration-300"
              >
                <FaWhatsapp className="text-lg group-hover:rotate-12 transition-transform" />
                <span>WhatsApp</span>
              </a>
              
              {showChatMessage && (
                <p className="text-gray-600 text-sm mt-1 text-center font-light">
                  Conectando...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;





