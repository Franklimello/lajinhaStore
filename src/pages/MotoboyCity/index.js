import React, { useState, useEffect } from "react";
// Imports de imagens do src/assets (são transformados em URLs no build)
import heroPng from "../../assets/motoboycity/principal-convertido-de-jpeg.png";
import img1Webp from "../../assets/motoboycity/img1-convertido-de-jpeg.webp";
import img2Png from "../../assets/motoboycity/img2-convertido-de-jpeg.png";
import img3Webp from "../../assets/motoboycity/imag3-convertido-de-jpeg.webp";

function ImageWithFallback({ srcs = [], alt = "", className = "", placeholderClassName = "bg-gradient-to-br from-yellow-900/30 to-black/60" }) {
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  const current = srcs[idx];
  if (!current || failed) {
    return <div className={`${className} ${placeholderClassName}`} aria-label={alt} />;
  }
  return (
    <img
      src={current}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (idx < srcs.length - 1) setIdx((i) => i + 1);
        else setFailed(true);
      }}
    />
  );
}

export default function MotoboyCity() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    setTimeout(() => setIsVisible(true), 100);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero com Parallax */}
      <section className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 transition-transform duration-300"
          style={{ transform: `scale(${1 + scrollY * 0.0003})` }}
        >
          <ImageWithFallback
            srcs={[img1Webp, heroPng]}
            alt="Motoboy City"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/60 to-yellow-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>
        
        {/* Efeito de grid animado */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,204,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,204,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />
        
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center px-6 max-w-5xl">
            <div className="inline-block mb-6 px-4 py-2 bg-yellow-400/20 border border-yellow-400/50 rounded-full backdrop-blur-sm">
              <span className="text-yellow-400 text-sm font-bold tracking-wider">DELIVERY PREMIUM</span>
            </div>
            
            <h1 className="text-6xl sm:text-8xl font-black tracking-tighter mb-6">
              <span className="bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 bg-clip-text text-transparent animate-pulse">
                MOTOBOY CITY
              </span>
            </h1>
            
            <p className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-wide">
              ENTREGA RÁPIDA. COMPROMISSO REAL.
            </p>
            
            <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Você pede. <span className="text-yellow-400 font-bold">Nós entregamos</span> com velocidade, cuidado e profissionalismo.
            </p>
            
            <a 
              href="https://wa.me/553398680141?text=vim%20do%20site%20supermercado%20online%20lajinha%20gostaria%20de%20falar%20com%20motoboy%20city" 
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-lg font-black rounded-full hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-yellow-400/50"
            >
              <span className="text-2xl group-hover:animate-bounce">🟢</span>
              <div className="text-left">
                <div className="text-xs font-semibold opacity-80">CHAMAR NO WHATSAPP</div>
                <div>(33) 9.9868-0141</div>
              </div>
            </a>
          </div>
        </div>

        {/* Indicador de scroll */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-yellow-400/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-2 bg-yellow-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-yellow-400/20 bg-gradient-to-r from-black via-yellow-900/10 to-black">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="group hover:scale-110 transition-transform duration-300">
              <div className="text-4xl sm:text-5xl font-black text-yellow-400 mb-2">24/7</div>
              <div className="text-sm sm:text-base text-gray-400 font-semibold">Disponível</div>
            </div>
            <div className="group hover:scale-110 transition-transform duration-300">
              <div className="text-4xl sm:text-5xl font-black text-yellow-400 mb-2">100%</div>
              <div className="text-sm sm:text-base text-gray-400 font-semibold">Confiável</div>
            </div>
            <div className="group hover:scale-110 transition-transform duration-300">
              <div className="text-4xl sm:text-5xl font-black text-yellow-400 mb-2">+1K</div>
              <div className="text-sm sm:text-base text-gray-400 font-semibold">Entregas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bloco Premium */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-yellow-400/5" />
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <ImageWithFallback
              srcs={[img3Webp, img2Png]}
              alt="Entrega rápida"
              className="relative w-full h-[400px] rounded-2xl shadow-2xl object-cover border-2 border-yellow-400/30 transform group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
          
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full">
              <span className="text-yellow-400 text-sm font-bold">NOSSO COMPROMISSO</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-black leading-tight">
              Nós nos movemos.{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Você relaxa.
              </span>
            </h2>
            
            <div className="h-1 w-20 bg-gradient-to-r from-yellow-400 to-transparent rounded-full" />
            
            <p className="text-xl text-gray-300 leading-relaxed">
              <strong className="text-yellow-400">Precisa que chegue rápido?</strong> Nós cuidamos de tudo. 
              De comida a encomendas — entregamos com cuidado, rapidez e um sorriso.
            </p>
            
            <ul className="space-y-4">
              {['Entregas expressas em toda cidade', 'Rastreamento em tempo real', 'Equipe profissional e treinada'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Serviços Premium */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,204,0,0.05),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Nossos <span className="text-yellow-400">Serviços</span>
            </h2>
            <div className="h-1 w-20 bg-yellow-400 rounded-full mx-auto" />
          </div>
          
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                title: "MOTOBOY CITY",
                subtitle: "Nós entregamos PARA VOCÊ",
                img: [img3Webp, img2Png],
                icon: "📦"
              },
              {
                title: "A TODA HORA",
                subtitle: "De onde estiver, para onde precisar",
                img: [img1Webp, heroPng],
                icon: "⚡"
              },
              {
                title: "EM TODO LUGAR",
                subtitle: "Cidade inteira com agilidade",
                img: [heroPng, img2Png],
                icon: "🏍️"
              }
            ].map((service, i) => (
              <div 
                key={i}
                className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/10 hover:-translate-y-2"
              >
                <div className="absolute top-6 right-6 text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300">
                  {service.icon}
                </div>
                
                <h3 className="text-yellow-400 text-xl font-black mb-2">{service.title}</h3>
                <p className="text-sm text-gray-400 mb-6">{service.subtitle}</p>
                
                {service.img ? (
                  <div className="relative overflow-hidden rounded-xl">
                    <ImageWithFallback
                      srcs={service.img}
                      alt={service.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                ) : (
                  <div className={`h-48 rounded-xl bg-gradient-to-br ${service.gradient} group-hover:scale-105 transition-transform duration-300`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-20 border-t border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-400/5 to-transparent" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            Conecte-se com a{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              MOTOBOY CITY
            </span>
          </h2>
          
          <p className="text-gray-400 text-lg mb-8">
            Fique por dentro das novidades e promoções exclusivas
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://instagram.com/motoboy_city_"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-full hover:from-pink-400 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
            >
              <span className="text-2xl group-hover:rotate-12 transition-transform">📱</span>
              <span>@motoboy_city_</span>
            </a>
            
            <a
              href="https://wa.me/553398680141?text=vim%20do%20site%20supermercado%20online%20lajinha%20gostaria%20de%20falar%20com%20motoboy%20city"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white/5 border-2 border-yellow-400/50 text-yellow-400 font-bold rounded-full hover:bg-yellow-400 hover:text-black transition-all duration-300 transform hover:scale-105"
            >
              <span className="text-2xl group-hover:animate-bounce">🟢</span>
              <span>(33) 9.9868-0141</span>
            </a>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <button 
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span className="font-semibold">Voltar para Home</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}