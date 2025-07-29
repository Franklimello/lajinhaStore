import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";  // ajuste aqui
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// resto do código


import FormAnuncio from "../../components/FormAnuncio"
import {db} from "../../firebase/config"
import { useGetDocuments } from "../../hooks/useGetDocuments";
import { useDeleteDocument } from "../../hooks/useDeleteDocument";
import { useUpdateDocument } from "../../hooks/useUpdateDocument";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Painel() {
  const { documents: produtos, loading } = useGetDocuments("produtos");
  const { deleteDocument } = useDeleteDocument("produtos");
  const { updateDocument } = useUpdateDocument("produtos");

  const [editandoId, setEditandoId] = useState(null);
  const [formEdit, setFormEdit] = useState({
    titulo: "",
    categoria:"",
    descricao: "",
    preco: "",
  });

  const handleEditar = (produto) => {
    setEditandoId(produto.id);
    setFormEdit({
      titulo: produto.titulo,
      categoria: produto.categoria,
      descricao: produto.descricao,
      preco: produto.preco,
    });
  };

  const handleSalvar = async (id) => {
    await updateDocument(id, formEdit);
    setEditandoId(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Painel de Anúncios</h1>
      <FormAnuncio/>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtos && produtos.map((produto) => (
          <div key={produto.id} className="border p-4 rounded shadow bg-white">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={10}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
            >
              {produto.fotosUrl?.map((imgUrl, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={imgUrl}
                    alt={`Imagem ${index + 1}`}
                    className=" object-cover rounded"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {editandoId === produto.id ? (
              <>
                <input
                  type="text"
                  value={formEdit.titulo}
                  onChange={(e) => setFormEdit({ ...formEdit, titulo: e.target.value })}
                  className="mt-4 w-full border p-2 rounded"
                placeholder="titulo"/>
                <textarea
                  value={formEdit.descricao}
                  onChange={(e) => setFormEdit({ ...formEdit, descricao: e.target.value })}
                  className="mt-2 w-full border p-2 rounded"
                 placeholder="descricao"/>
                <input
                  type="number"
                  value={formEdit.preco}
                  onChange={(e) => setFormEdit({ ...formEdit, preco: e.target.value })}
                  className="mt-2 w-full border p-2 rounded"
                 placeholder="preco"/>
                <input
                  type="text"
                  value={formEdit.categoria}
                  onChange={(e) => setFormEdit({ ...formEdit, categoria: e.target.value })}
                  className="mt-2 w-full border p-2 rounded"
                 placeholder="categoria"/>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleSalvar(produto.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditandoId(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mt-4">{produto.titulo}</h2>
                <p>{produto.descricao}</p>
                <span className="block text-green-600 font-semibold">R$ {produto.preco}</span>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEditar(produto)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteDocument(produto.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
