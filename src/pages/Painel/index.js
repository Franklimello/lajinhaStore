import { useState, useMemo } from "react";
import { FaTimes, FaEdit, FaSave, FaSearch, FaSort, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaSignOutAlt, FaUser, FaStore, FaLock, FaUnlock, FaTrophy, FaImage } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useStoreStatus } from "../../context/StoreStatusContext";
import FormAnuncio from "../../components/FormAnuncio"
import EditProductModal from "../../components/EditProductModal";
import { useGetDocuments } from "../../hooks/useGetDocuments";
import { useDeleteDocument } from "../../hooks/useDeleteDocument";
import { useUpdateDocument } from "../../hooks/useUpdateDocument";
import ConfirmModal from "../../components/ConfirmModal";
import AlertModal from "../../components/AlertModal";

export default function Painel() {
  const { documents: produtos } = useGetDocuments("produtos");
  const { deleteDocument } = useDeleteDocument("produtos");
  const { updateDocument } = useUpdateDocument("produtos");
  const { user } = useAuth();
  const { isClosed, toggleStoreStatus, loading: storeLoading } = useStoreStatus();
  const navigate = useNavigate();

  const [editandoId, setEditandoId] = useState(null);
  const [formEdit, setFormEdit] = useState({
    titulo: "",
    categoria:"",
    descricao: "",
    preco: "",
    esgotado: false,
  });

  // Estados para o modal de edição com imagem
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  // Estados para busca e filtros
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [ordenacao, setOrdenacao] = useState("criadoEm");
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState("desc");
  const [paginaAtual, setPaginaAtual] = useState(1);
  
  // Estados para modais
  const [alert, setAlert] = useState({ isOpen: false, message: "", type: "info" });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ type: null, id: null, callback: null }); // type: 'anuncio' | 'cupom' | 'produto'
  const [itensPorPagina] = useState(10);


  const handleEditar = (produto) => {
    setEditandoId(produto.id);
    setFormEdit({
      titulo: produto.titulo,
      categoria: produto.categoria,
      descricao: produto.descricao,
      preco: produto.preco,
      esgotado: produto.esgotado || false,
    });
  };

  const handleSalvar = async (id) => {
    await updateDocument(id, formEdit);
    setEditandoId(null);
  };

  // Funções para o modal de edição com imagem
  const handleEditarComImagem = (produto) => {
    setProdutoEmEdicao(produto);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setProdutoEmEdicao(null);
  };

  const handleSucessoEdicao = () => {
    // A lista será atualizada automaticamente pelo hook useGetDocuments
    console.log('Produto atualizado com sucesso!');
  };

  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setAlert({ isOpen: true, message: 'Erro ao sair. Tente novamente.', type: "error" });
    }
  };

  const handleToggleStore = async () => {
    const confirmMessage = isClosed 
      ? "Deseja ABRIR a loja? Os clientes poderão realizar compras normalmente."
      : "Deseja FECHAR a loja? Os clientes verão um aviso ao acessar o site.";
    
    setConfirmModal({
      isOpen: true,
      title: isClosed ? "Abrir Loja" : "Fechar Loja",
      message: confirmMessage,
      onConfirm: async () => {
        const result = await toggleStoreStatus();
        if (result.success) {
          setAlert({ isOpen: true, message: isClosed ? "Loja ABERTA com sucesso!" : "Loja FECHADA com sucesso!", type: "success" });
        } else {
          setAlert({ isOpen: true, message: "Erro ao alterar status da loja: " + result.error, type: "error" });
        }
        setConfirmModal({ isOpen: false });
      }
    });
  };

  // Lista completa de categorias disponíveis
  const todasCategorias = [
    "Oferta",
    "Salgados do Joazinho",
    "Hortifruti",
    "Açougue", 
    "Frios e laticínios",
    "Mercearia",
    "Guloseimas e snacks",
    "Bebidas",
    "Bebidas Geladas",
    "Limpeza",
    "Higiene pessoal",
    "Cosméticos",
    "Utilidades domésticas",
    "Pet shop",
    "Infantil",
    "Farmácia",
    "Cesta Básica"
  ];

  // Obter categorias únicas dos produtos + categorias disponíveis
  const categorias = useMemo(() => {
    if (!produtos) return todasCategorias;
    const catsProdutos = [...new Set(produtos.map(p => p.categoria))];
    const todasCategoriasSet = new Set([...catsProdutos, ...todasCategorias]);
    return Array.from(todasCategoriasSet).sort();
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
      {/* Header responsivo com título e botão de sair */}
      <div className="mb-6">
        {/* Linha do título */}
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Painel de Anúncios</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Gerencie seus produtos e anúncios</p>
        </div>
        
        {/* Linha de usuário e botões - responsiva */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          {/* Informações do usuário */}
          {user && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg flex-1 sm:flex-none">
              <FaUser className="text-gray-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 truncate">
                {user.displayName || user.email}
              </span>
            </div>
          )}
          
          {/* Botão Promoções */}
          <button
            onClick={() => navigate('/promocoes')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
            title="Gerenciar Anúncios e Cupons"
          >
            <FaImage className="text-lg" />
            <span>Promoções</span>
          </button>

          {/* Botão Sorteio */}
          <button
            onClick={() => navigate('/sorteio')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
            title="Sorteio de Clientes"
          >
            <FaTrophy className="text-lg" />
            <span>Sorteio</span>
          </button>
          
          {/* Botão Abrir/Fechar Loja */}
          <button
            onClick={handleToggleStore}
            disabled={storeLoading}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg w-full sm:w-auto ${
              isClosed 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isClosed ? "Loja está FECHADA - Clique para abrir" : "Loja está ABERTA - Clique para fechar"}
          >
            {isClosed ? <FaLock className="text-lg" /> : <FaUnlock className="text-lg" />}
            <FaStore className="text-lg" />
            <span>{isClosed ? 'Loja Fechada' : 'Loja Aberta'}</span>
          </button>
          
          {/* Botão de Sair */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg w-full sm:w-auto"
            title="Sair da conta"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      <FormAnuncio/>

      {/* Link para Promoções */}
      <div className="mt-6 bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg shadow-sm border-2 border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">📢 Anúncios e Cupons</h2>
            <p className="text-gray-600 text-sm">Gerencie anúncios em marquee e cupons de desconto em uma página dedicada</p>
          </div>
          <button
            onClick={() => navigate('/promocoes')}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg"
          >
            Gerenciar Promoções
          </button>
        </div>
      </div>

      {/* Barra de busca e filtros - Responsiva */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Busca */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={busca}
              onChange={(e) => handleFiltroChange(() => setBusca(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filtro por categoria */}
          <div className="sm:col-span-2 lg:col-span-1">
            <select
              value={categoriaFiltro}
              onChange={(e) => handleFiltroChange(() => setCategoriaFiltro(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Todas as categorias</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Ordenação */}
          <div className="sm:col-span-2 lg:col-span-1">
            <select
              value={ordenacao}
              onChange={(e) => handleFiltroChange(() => setOrdenacao(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="criadoEm">Data de criação</option>
              <option value="titulo">Nome (A-Z)</option>
              <option value="preco">Preço</option>
            </select>
          </div>

          {/* Direção da ordenação */}
          <div className="sm:col-span-2 lg:col-span-1">
            <select
              value={direcaoOrdenacao}
              onChange={(e) => handleFiltroChange(() => setDirecaoOrdenacao(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="desc">Decrescente</option>
              <option value="asc">Crescente</option>
            </select>
          </div>
        </div>

        {/* Estatísticas - Responsivas */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-600">
          <span>
            {produtosFiltrados.length > 0 ? (
              <>
                <span className="hidden sm:inline">
                  Mostrando {inicio + 1}-{Math.min(fim, produtosFiltrados.length)} de {produtosFiltrados.length} produtos
                </span>
                <span className="sm:hidden">
                  {inicio + 1}-{Math.min(fim, produtosFiltrados.length)} de {produtosFiltrados.length}
                </span>
              </>
            ) : (
              "Nenhum produto encontrado"
            )}
          </span>
          {busca && (
            <button
              onClick={() => handleFiltroChange(() => setBusca(""))}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpar busca
            </button>
          )}
        </div>
      </div>

      {/* Lista de produtos - Responsiva */}
      <div className="mt-6 space-y-3">
        {produtosPagina.map((produto) => (
          <div key={produto.id} className="bg-white border p-3 sm:p-4 hover:shadow-md transition-shadow">
            
            {editandoId === produto.id ? (
              // MODO EDIÇÃO - Layout expandido e responsivo
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={produto.fotosUrl?.[0] || '/placeholder.jpg'}
                    alt={produto.titulo}
                    className="w-full sm:w-24 h-48 sm:h-24 object-cover flex-shrink-0 rounded"
                  />
                  
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={formEdit.titulo}
                        onChange={(e) => setFormEdit({ ...formEdit, titulo: e.target.value })}
                        className="w-full border p-2 text-sm rounded"
                      />
                    </div>
                    
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Categoria</label>
                      <input
                        type="text"
                        value={formEdit.categoria}
                        onChange={(e) => setFormEdit({ ...formEdit, categoria: e.target.value })}
                        className="w-full border p-2 text-sm rounded"
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição</label>
                      <textarea
                        value={formEdit.descricao}
                        onChange={(e) => setFormEdit({ ...formEdit, descricao: e.target.value })}
                        className="w-full border p-2 text-sm h-20 resize-none rounded"
                      />
                    </div>
                    
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Preço</label>
                      <input
                        type="number"
                        value={formEdit.preco}
                        onChange={(e) => setFormEdit({ ...formEdit, preco: e.target.value })}
                        className="w-full border p-2 text-sm rounded"
                      />
                    </div>
                    
                    <div className="sm:col-span-2 lg:col-span-1 flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200">
                      <input
                        type="checkbox"
                        id={`esgotado-${produto.id}`}
                        checked={formEdit.esgotado}
                        onChange={(e) => setFormEdit({ ...formEdit, esgotado: e.target.checked })}
                        className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer"
                      />
                      <label htmlFor={`esgotado-${produto.id}`} className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
                        Produto esgotado
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 justify-end">
                  <button
                    onClick={() => handleSalvar(produto.id)}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-2 text-sm hover:bg-green-700 rounded"
                  >
                    <FaSave />
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditandoId(null)}
                    className="bg-gray-500 text-white px-6 py-2 text-sm hover:bg-gray-600 rounded"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              // MODO VISUALIZAÇÃO - Layout compacto e responsivo
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                <img
                  src={produto.fotosUrl?.[0] || '/placeholder.jpg'}
                  alt={produto.titulo}
                  className="w-full sm:w-16 h-40 sm:h-16 object-cover flex-shrink-0 rounded"
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base truncate">{produto.titulo}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 sm:truncate">{produto.descricao}</p>
                  <div className="flex items-center gap-3 sm:gap-4 mt-1 flex-wrap">
                    <span className="text-green-600 font-semibold text-sm sm:text-base">R$ {produto.preco}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{produto.categoria}</span>
                    {produto.esgotado && (
                      <span className="text-xs text-white bg-red-500 px-2 py-1 rounded font-semibold">Esgotado</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEditarComImagem(produto)}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 text-sm hover:bg-blue-700 rounded flex-1 sm:flex-none"
                    title="Editar produto (com opção de trocar imagem)"
                  >
                    <FaEdit />
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ type: 'produto', id: produto.id, callback: () => deleteDocument(produto.id) })}
                    className="bg-red-600 text-white p-2 hover:bg-red-700 rounded"
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
          <div className="bg-white border p-8 sm:p-12 text-center text-gray-500">
            {busca || categoriaFiltro ? "Nenhum produto encontrado com os filtros aplicados" : "Nenhum produto cadastrado"}
          </div>
        )}
      </div>

      {/* Paginação - Responsiva */}
      {totalPaginas > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2">
          <button
            onClick={() => setPaginaAtual(paginaAtual - 1)}
            disabled={paginaAtual === 1}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <FaChevronLeft />
            <span>Anterior</span>
          </button>
          
          <div className="flex gap-1 overflow-x-auto max-w-full">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numero => (
              <button
                key={numero}
                onClick={() => setPaginaAtual(numero)}
                className={`px-3 py-2 border rounded-lg text-sm flex-shrink-0 ${
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <span>Próxima</span>
            <FaChevronRight />
          </button>
        </div>
      )}

      {/* Modal de Edição com Imagem */}
      <EditProductModal
        produto={produtoEmEdicao}
        isOpen={modalAberto}
        onClose={handleFecharModal}
        onSuccess={handleSucessoEdicao}
      />

      {/* Modais */}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.type === "success" ? "Sucesso" : alert.type === "error" ? "Erro" : alert.type === "warning" ? "Atenção" : "Aviso"}
        message={alert.message}
        type={alert.type}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => {
          if (confirmModal.onConfirm) confirmModal.onConfirm();
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        variant="warning"
      />

      {deleteConfirm.type && (
        <ConfirmModal
          isOpen={!!deleteConfirm.type}
          onClose={() => setDeleteConfirm({ type: null, id: null, callback: null })}
          onConfirm={() => {
            if (deleteConfirm.callback) deleteConfirm.callback();
            setDeleteConfirm({ type: null, id: null, callback: null });
          }}
          title={deleteConfirm.type === 'anuncio' ? "Excluir Anúncio" : deleteConfirm.type === 'cupom' ? "Excluir Cupom" : "Excluir Produto"}
          message={deleteConfirm.type === 'anuncio' ? "Excluir este anúncio?" : deleteConfirm.type === 'cupom' ? "Excluir este cupom?" : "Tem certeza que deseja excluir este produto?"}
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="danger"
        />
      )}
    </div>
  );
}