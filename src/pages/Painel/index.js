import { useState } from "react";
import { FaTimes, FaEdit, FaSave } from "react-icons/fa";
import FormAnuncio from "../../components/FormAnuncio"
import { useGetDocuments } from "../../hooks/useGetDocuments";
import { useDeleteDocument } from "../../hooks/useDeleteDocument";
import { useUpdateDocument } from "../../hooks/useUpdateDocument";

export default function Painel() {
  const { documents: produtos } = useGetDocuments("produtos");
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

      {/* Lista de produtos */}
      <div className="mt-6 space-y-3">
        {produtos && produtos.map((produto) => (
          <div key={produto.id} className="bg-white border p-4 hover:shadow-md transition-shadow">
            
            {editandoId === produto.id ? (
              // MODO EDIÇÃO - Layout expandido
              <div className="space-y-3">
                <div className="flex gap-4">
                  <img
                    src={produto.fotosUrl?.[0] || '/placeholder.jpg'}
                    alt={produto.titulo}
                    className="w-24 h-24 object-cover flex-shrink-0"
                  />
                  
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={formEdit.titulo}
                        onChange={(e) => setFormEdit({ ...formEdit, titulo: e.target.value })}
                        className="w-full border p-2 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Categoria</label>
                      <input
                        type="text"
                        value={formEdit.categoria}
                        onChange={(e) => setFormEdit({ ...formEdit, categoria: e.target.value })}
                        className="w-full border p-2 text-sm"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={formEdit.descricao}
                        onChange={(e) => setFormEdit({ ...formEdit, descricao: e.target.value })}
                        className="w-full border p-2 text-sm h-20 resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Preço</label>
                      <input
                        type="number"
                        value={formEdit.preco}
                        onChange={(e) => setFormEdit({ ...formEdit, preco: e.target.value })}
                        className="w-full border p-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleSalvar(produto.id)}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 text-sm hover:bg-green-700"
                  >
                    <FaSave />
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditandoId(null)}
                    className="bg-gray-500 text-white px-6 py-2 text-sm hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              // MODO VISUALIZAÇÃO - Layout compacto
              <div className="flex gap-4 items-center">
                <img
                  src={produto.fotosUrl?.[0] || '/placeholder.jpg'}
                  alt={produto.titulo}
                  className="w-16 h-16 object-cover flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base truncate">{produto.titulo}</h3>
                  <p className="text-sm text-gray-600 truncate">{produto.descricao}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-green-600 font-semibold">R$ {produto.preco}</span>
                    <span className="text-xs text-gray-500">{produto.categoria}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEditar(produto)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700"
                  >
                    <FaEdit />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja excluir este produto?')) {
                        deleteDocument(produto.id);
                      }
                    }}
                    className="bg-red-600 text-white p-2 hover:bg-red-700"
                    title="Excluir produto"
                  >
                    <FaTimes className="text-lg" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Mensagem quando não há produtos */}
        {(!produtos || produtos.length === 0) && (
          <div className="bg-white border p-12 text-center text-gray-500">
            Nenhum produto cadastrado
          </div>
        )}
      </div>
    </div>
  );
}