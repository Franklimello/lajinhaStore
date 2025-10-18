import { useState, useMemo } from "react";
import { FaTimes, FaEdit, FaSave, FaSearch, FaFilter, FaSort, FaChevronLeft, FaChevronRight } from "react-icons/fa";
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

  // Estados para busca e filtros
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [ordenacao, setOrdenacao] = useState("criadoEm");
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState("desc");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina] = useState(10);

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

  // Obter categorias únicas para o filtro
  const categorias = useMemo(() => {
    if (!produtos) return [];
    const cats = [...new Set(produtos.map(p => p.categoria))];
    return cats.sort();
  }, [produtos]);

  // Filtrar e ordenar produtos
  const produtosFiltrados = useMemo(() => {
    if (!produtos) return [];
    
    let filtrados = produtos.filter(produto => {
      const matchBusca = !busca || 
        produto.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(busca.toLowerCase());
      
      const matchCategoria = !categoriaFiltro || produto.categoria === categoriaFiltro;
      
      return matchBusca && matchCategoria;
    });

    // Ordenar
    filtrados.sort((a, b) => {
      let valorA, valorB;
      
      switch (ordenacao) {
        case "titulo":
          valorA = a.titulo.toLowerCase();
          valorB = b.titulo.toLowerCase();
          break;
        case "preco":
          valorA = parseFloat(a.preco) || 0;
          valorB = parseFloat(b.preco) || 0;
          break;
        case "categoria":
          valorA = a.categoria.toLowerCase();
          valorB = b.categoria.toLowerCase();
          break;
        case "criadoEm":
        default:
          valorA = new Date(a.criadoEm?.toDate?.() || a.criadoEm || 0);
          valorB = new Date(b.criadoEm?.toDate?.() || b.criadoEm || 0);
          break;
      }
      
      if (direcaoOrdenacao === "asc") {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });

    return filtrados;
  }, [produtos, busca, categoriaFiltro, ordenacao, direcaoOrdenacao]);

  // Paginação
  const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const produtosPagina = produtosFiltrados.slice(inicio, fim);

  // Resetar página quando filtros mudarem
  const handleFiltroChange = (novoFiltro) => {
    setPaginaAtual(1);
    if (typeof novoFiltro === 'function') {
      novoFiltro();
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Painel de Anúncios</h1>
      <FormAnuncio/>

      {/* Barra de busca e filtros */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Busca */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={busca}
              onChange={(e) => handleFiltroChange(() => setBusca(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por categoria */}
          <div>
            <select
              value={categoriaFiltro}
              onChange={(e) => handleFiltroChange(() => setCategoriaFiltro(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as categorias</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Ordenação */}
          <div>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="criadoEm">Data de criação</option>
              <option value="titulo">Título</option>
              <option value="preco">Preço</option>
              <option value="categoria">Categoria</option>
            </select>
          </div>

          {/* Direção da ordenação */}
          <div>
            <button
              onClick={() => setDirecaoOrdenacao(direcaoOrdenacao === "asc" ? "desc" : "asc")}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
            >
              <FaSort />
              {direcaoOrdenacao === "asc" ? "Crescente" : "Decrescente"}
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Mostrando {inicio + 1}-{Math.min(fim, produtosFiltrados.length)} de {produtosFiltrados.length} produtos
          </span>
          {busca && (
            <button
              onClick={() => handleFiltroChange(() => setBusca(""))}
              className="text-blue-600 hover:text-blue-800"
            >
              Limpar busca
            </button>
          )}
        </div>
      </div>

      {/* Lista de produtos */}
      <div className="mt-6 space-y-3">
        {produtosPagina.map((produto) => (
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
        {produtosFiltrados.length === 0 && (
          <div className="bg-white border p-12 text-center text-gray-500">
            {busca || categoriaFiltro ? "Nenhum produto encontrado com os filtros aplicados" : "Nenhum produto cadastrado"}
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <button
            onClick={() => setPaginaAtual(paginaAtual - 1)}
            disabled={paginaAtual === 1}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaChevronLeft />
            Anterior
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numero => (
              <button
                key={numero}
                onClick={() => setPaginaAtual(numero)}
                className={`px-3 py-2 border rounded-lg ${
                  numero === paginaAtual
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {numero}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setPaginaAtual(paginaAtual + 1)}
            disabled={paginaAtual === totalPaginas}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}