import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";  // IMPORT CORRETO NA VERSÃO 10+
import { FaWhatsapp } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";


export default function CardProduto({ fotosUrl = [] , titulo, descricao, preco }) {

  
  return (
    <div className=" flex flex-col justify-between border rounded p-4 shadow-sm">
      <div className="mb-4">
        <Swiper
          modules={[Navigation, Pagination]}
          
          pagination={{ clickable: true }}
          spaceBetween={10}
          slidesPerView={1}
          style={{ width: "100%", height: "200px" }}
        >
          {fotosUrl.slice(0, 3).map((url, index) => (
            <SwiperSlide key={index}>
              <img
                src={url}
                alt={`${titulo} - imagem ${index + 1}`}
                className="w-full max-h-[250px] md:max-h-[200px] lg:max-h-[200px] object-contain mx-auto rounded"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <h2 className="text-lg font-semibold">{titulo}</h2>
      <p className="text-sm text-gray-600">{descricao}</p>
      <p className="mt-2 font-bold text-orange-600 mb-2">R$ {preco}</p>
      <div className="flex items-center gap-2   p-2 rounded-md ">
        <a
      href={`https://wa.me/5519997050303?text=Olá! Tenho interesse no ${titulo} anunciado pelo preço ${preco}.`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
    >
        <span>Comprar</span>
        <FaWhatsapp className="text-2xl" />
      </a>
      </div>
    </div>
  );
}
