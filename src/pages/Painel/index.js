import { useState, useMemo } from "react";
import { FaTimes, FaEdit, FaSave, FaSearch, FaSort, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaSignOutAlt, FaUser, FaStore, FaLock, FaUnlock, FaTrophy, FaImage } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useStoreStatus } from "../../context/StoreStatusContext";
import FormAnuncio from "../../components/FormAnuncio"
import EditProductModal from "../../components/EditProductModal";
import { useGetDocuments } from "../../hooks/useGetDocuments";
import { useAddDocument } from "../../hooks/useAddDocument";
import { useDeleteDocument } from "../../hooks/useDeleteDocument";
import { useUpdateDocument } from "../../hooks/useUpdateDocument";
import { storage } from "../../firebase/config";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Painel() {
  const { documents: produtos } = useGetDocuments("produtos");
  const { deleteDocument } = useDeleteDocument("produtos");
  const { updateDocument } = useUpdateDocument("produtos");
  const { updateDocument: updateCupom } = useUpdateDocument("cupons");
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
  const [itensPorPagina] = useState(10);

  // Gestão de cupons
  const { documents: cupons, loading: cuponsLoading, error: cuponsError } = useGetDocuments("cupons", { realTime: true });
  const { addDocument: addCupom, response: addCupomResponse } = useAddDocument("cupons");
  const { deleteDocument: deleteCupom } = useDeleteDocument("cupons");
  const [cupomForm, setCupomForm] = useState({ codigo: "", tipo: "percentual", valor: "", minSubtotal: 0 });
  const [cupomMsg, setCupomMsg] = useState("");
  const [editCupomId, setEditCupomId] = useState(null);
  const [cupomEditForm, setCupomEditForm] = useState({ codigo: "", tipo: "percentual", valor: "", minSubtotal: 0, ativo: true });

  // Anúncios (letreiro)
  const { documents: anuncios } = useGetDocuments("anuncios", { realTime: true });
  const { addDocument: addAnuncio, response: addAnuncioResp } = useAddDocument("anuncios");
  const { deleteDocument: deleteAnuncio } = useDeleteDocument("anuncios");
  const { updateDocument: updateAnuncio } = useUpdateDocument("anuncios");
  const [anuncioForm, setAnuncioForm] = useState({ texto: "", imagemUrl: "", rota: "", localizacao: "marquee", ativo: true, file: null, bgColor: "#F1F5F9", textColor: "#111827", speedSeconds: 8 });
  const [anuncioMsg, setAnuncioMsg] = useState("");
  const [editAnuncioId, setEditAnuncioId] = useState(null);
  const [anuncioEditForm, setAnuncioEditForm] = useState({ texto: "", rota: "", ativo: true, bgColor: "#F1F5F9", textColor: "#111827", file: null });
  
  // Estados para colapsar/expandir seções
  const [anunciosCollapsed, setAnunciosCollapsed] = useState(false);
  const [cuponsCollapsed, setCuponsCollapsed] = useState(false);

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
      alert('Erro ao sair. Tente novamente.');
    }
  };

  const handleToggleStore = async () => {
    const confirmMessage = isClosed 
      ? "Deseja ABRIR a loja? Os clientes poderão realizar compras normalmente."
      : "Deseja FECHAR a loja? Os clientes verão um aviso ao acessar o site.";
    
    if (window.confirm(confirmMessage)) {
      const result = await toggleStoreStatus();
      if (result.success) {
        alert(isClosed ? "✅ Loja ABERTA com sucesso!" : "🔒 Loja FECHADA com sucesso!");
      } else {
        alert("❌ Erro ao alterar status da loja: " + result.error);
      }
    }
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

      {/* Gestão de Anúncios (Letreiro) */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800">Letreiro de Anúncios</h2>
              <button
                onClick={() => setAnunciosCollapsed(!anunciosCollapsed)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label={anunciosCollapsed ? "Expandir" : "Colapsar"}
                title={anunciosCollapsed ? "Expandir seção" : "Colapsar seção"}
              >
                {anunciosCollapsed ? (
                  <FaChevronDown className="text-gray-600" />
                ) : (
                  <FaChevronUp className="text-gray-600" />
                )}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">Cadastre pequenos anúncios com imagem, texto e rota clicável.</p>
          </div>
          <div className="text-xs text-gray-600">Anúncios: {Array.isArray(anuncios) ? anuncios.length : 0}</div>
        </div>

        {!anunciosCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Texto</label>
            <input
              type="text"
              value={anuncioForm.texto}
              onChange={(e) => setAnuncioForm({ ...anuncioForm, texto: e.target.value })}
              placeholder="Ex.: Frete R$5 em toda a cidade"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Imagem (arquivo)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAnuncioForm({ ...anuncioForm, file: e.target.files?.[0] || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Opcional: selecione uma imagem pequena (icônico).</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Localização</label>
            <select
              value={anuncioForm.localizacao}
              onChange={(e) => setAnuncioForm({ ...anuncioForm, localizacao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="marquee">Marquee (topo, rolagem horizontal)</option>
              <option value="motoboy">Banner Motoboy City</option>
              <option value="custom">Custom (adicione keyword no texto)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Escolha onde o anúncio aparecerá na home</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Rota (link interno ou externo)</label>
            <input
              type="text"
              value={anuncioForm.rota}
              onChange={(e) => setAnuncioForm({ ...anuncioForm, rota: e.target.value })}
              placeholder="/ofertas, /detalhes/123 ou https://exemplo.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Use / para rotas internas ou https:// para links externos</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Cor de fundo</label>
            <input
              type="color"
              value={anuncioForm.bgColor}
              onChange={(e) => setAnuncioForm({ ...anuncioForm, bgColor: e.target.value })}
              className="w-full h-[38px] px-2 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Cor do texto</label>
            <input
              type="color"
              value={anuncioForm.textColor}
              onChange={(e) => setAnuncioForm({ ...anuncioForm, textColor: e.target.value })}
              className="w-full h-[38px] px-2 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Velocidade (s)</label>
            <input
              type="number"
              min="4"
              max="120"
              step="1"
              value={anuncioForm.speedSeconds}
              onChange={(e) => setAnuncioForm({ ...anuncioForm, speedSeconds: Number(e.target.value || 8) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
            <select
              value={anuncioForm.ativo ? 'ativo' : 'inativo'}
              onChange={(e) => setAnuncioForm({ ...anuncioForm, ativo: e.target.value === 'ativo' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          <div>
            <button
              onClick={async () => {
                setAnuncioMsg("");
                const texto = (anuncioForm.texto || "").trim();
                const rota = (anuncioForm.rota || "").trim() || "/";
                try {
                  if (!texto && !anuncioForm.file) { setAnuncioMsg("Informe texto ou selecione uma imagem."); return; }

                  let imagemUrl = "";
                  if (anuncioForm.file) {
                    // upload para Firebase Storage
                    const path = `anuncios/${Date.now()}-${anuncioForm.file.name}`;
                    const ref = storageRef(storage, path);
                    const blob = anuncioForm.file;
                    await uploadBytes(ref, blob, { contentType: blob.type });
                    imagemUrl = await getDownloadURL(ref);
                  }

                  await addAnuncio({ texto, imagemUrl, rota, localizacao: anuncioForm.localizacao, ativo: !!anuncioForm.ativo, bgColor: anuncioForm.bgColor, textColor: anuncioForm.textColor, speedSeconds: Number(anuncioForm.speedSeconds) || 8 });
                  setAnuncioForm({ texto: "", imagemUrl: "", rota: "", localizacao: "marquee", ativo: true, file: null, bgColor: "#F1F5F9", textColor: "#111827", speedSeconds: 8 });
                  setAnuncioMsg("✅ Anúncio criado.");
                } catch (e) {
                  setAnuncioMsg("❌ Erro ao criar anúncio.");
                }
              }}
              disabled={addAnuncioResp.loading}
              className="w-full md:w-auto px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {addAnuncioResp.loading ? 'Salvando...' : 'Criar anúncio'}
            </button>
          </div>
        </div>
        )}

        {anuncioMsg && (
          <div className="mt-3 text-sm text-gray-700">{anuncioMsg}</div>
        )}

        {!anunciosCollapsed && (
          <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-4">Imagem</th>
                <th className="py-2 pr-4">Texto</th>
                <th className="py-2 pr-4">Rota</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Cores</th>
                <th className="py-2 pr-4">Velocidade</th>
                <th className="py-2 pr-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(anuncios || []).map((a) => (
                <tr key={a.id} className="border-t align-top">
                  <td className="py-2 pr-4">
                    {editAnuncioId === a.id ? (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAnuncioEditForm({ ...anuncioEditForm, file: e.target.files?.[0] || null })}
                        className="text-xs"
                      />
                    ) : (
                      a.imagemUrl ? (
                        <img src={a.imagemUrl} alt={a.texto || 'Anúncio'} className="w-8 h-8 object-contain rounded" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )
                    )}
                  </td>
                  <td className="py-2 pr-4 max-w-xs">
                    {editAnuncioId === a.id ? (
                      <input
                        type="text"
                        value={anuncioEditForm.texto}
                        onChange={(e) => setAnuncioEditForm({ ...anuncioEditForm, texto: e.target.value })}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    ) : (
                      <span className="truncate inline-block max-w-[220px]">{a.texto || <span className="text-gray-400">—</span>}</span>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {editAnuncioId === a.id ? (
                      <input
                        type="text"
                        value={anuncioEditForm.rota}
                        onChange={(e) => setAnuncioEditForm({ ...anuncioEditForm, rota: e.target.value })}
                        className="w-40 px-2 py-1 border rounded text-sm"
                        placeholder="/ofertas ou https://..."
                      />
                    ) : (
                      a.rota || '/'
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {editAnuncioId === a.id ? (
                      <label className="inline-flex items-center gap-2 select-none">
                        <input
                          type="checkbox"
                          checked={!!anuncioEditForm.ativo}
                          onChange={(e) => setAnuncioEditForm({ ...anuncioEditForm, ativo: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className={`text-xs font-semibold ${anuncioEditForm.ativo ? 'text-green-700' : 'text-gray-500'}`}>
                          {anuncioEditForm.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </label>
                    ) : (
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={a.ativo !== false}
                          onChange={async (e) => { try { await updateAnuncio(a.id, { ativo: e.target.checked }); } catch {} }}
                          className="w-4 h-4"
                        />
                        <span className={`text-xs font-semibold ${a.ativo !== false ? 'text-green-700' : 'text-gray-500'}`}>
                          {a.ativo !== false ? 'Ativo' : 'Inativo'}
                        </span>
                      </label>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {editAnuncioId === a.id ? (
                      <div className="flex items-center gap-2">
                        <input type="color" value={anuncioEditForm.bgColor} onChange={(e)=>setAnuncioEditForm({...anuncioEditForm,bgColor:e.target.value})} />
                        <input type="color" value={anuncioEditForm.textColor} onChange={(e)=>setAnuncioEditForm({...anuncioEditForm,textColor:e.target.value})} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">BG</span>
                        <span className="inline-block w-5 h-5 rounded" style={{backgroundColor: a.bgColor || '#F1F5F9'}}></span>
                        <span className="text-xs text-gray-600">TXT</span>
                        <span className="inline-block w-5 h-5 rounded border" style={{backgroundColor: a.textColor || '#111827'}}></span>
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {editAnuncioId === a.id ? (
                      <input
                        type="number"
                        min="4"
                        max="120"
                        step="1"
                        value={anuncioEditForm.speedSeconds ?? a.speedSeconds ?? 8}
                        onChange={(e)=>setAnuncioEditForm({...anuncioEditForm, speedSeconds: Number(e.target.value || 8) })}
                        className="w-24 px-2 py-1 border rounded text-sm"
                      />
                    ) : (
                      <span className="text-sm text-gray-700">{a.speedSeconds || 8}s</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 space-x-2 whitespace-nowrap">
                    {editAnuncioId === a.id ? (
                      <>
                        <button
                          onClick={async () => {
                            setAnuncioMsg("");
                            try {
                              let imagemUrl = a.imagemUrl || "";
                              if (anuncioEditForm.file) {
                                const path = `anuncios/${Date.now()}-${anuncioEditForm.file.name}`;
                                const ref = storageRef(storage, path);
                                await uploadBytes(ref, anuncioEditForm.file, { contentType: anuncioEditForm.file.type });
                                imagemUrl = await getDownloadURL(ref);
                              }
                              await updateAnuncio(a.id, {
                                texto: anuncioEditForm.texto,
                                rota: anuncioEditForm.rota || "/",
                                ativo: !!anuncioEditForm.ativo,
                                bgColor: anuncioEditForm.bgColor,
                                textColor: anuncioEditForm.textColor,
                                speedSeconds: Number(anuncioEditForm.speedSeconds ?? a.speedSeconds ?? 8),
                                imagemUrl,
                              });
                              setEditAnuncioId(null);
                              setAnuncioMsg('✅ Anúncio atualizado.');
                            } catch (e) {
                              setAnuncioMsg('❌ Erro ao atualizar anúncio.');
                            }
                          }}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditAnuncioId(null)}
                          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={async () => {
                            try { await updateAnuncio(a.id, { ativo: false }); } catch {}
                          }}
                          disabled={a.ativo === false}
                          className={`px-3 py-1 rounded text-sm ${a.ativo === false ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
                        >
                          Desativar
                        </button>
                        <button
                          onClick={() => {
                            setEditAnuncioId(a.id);
                            setAnuncioEditForm({
                              texto: a.texto || "",
                              rota: a.rota || "/",
                              ativo: a.ativo !== false,
                              bgColor: a.bgColor || "#F1F5F9",
                              textColor: a.textColor || "#111827",
                              speedSeconds: a.speedSeconds || 8,
                              file: null,
                            });
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => { if (window.confirm('Excluir este anúncio?')) deleteAnuncio(a.id); }}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Excluir
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {(!anuncios || anuncios.length === 0) && (
                <tr>
                  <td colSpan="5" className="py-4 text-gray-500">Nenhum anúncio cadastrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Gestão de Cupons */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800">Cupons de Promoção</h2>
              <button
                onClick={() => setCuponsCollapsed(!cuponsCollapsed)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label={cuponsCollapsed ? "Expandir" : "Colapsar"}
                title={cuponsCollapsed ? "Expandir seção" : "Colapsar seção"}
              >
                {cuponsCollapsed ? (
                  <FaChevronDown className="text-gray-600" />
                ) : (
                  <FaChevronUp className="text-gray-600" />
                )}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">Crie cupons com desconto em porcentagem ou valor fixo.</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-xs text-gray-600">
              {cuponsLoading ? 'Carregando cupons…' : `Cupons: ${Array.isArray(cupons) ? cupons.length : 0}`}
              {cuponsError && <span className="text-red-600 ml-2">Erro ao carregar</span>}
            </div>
            <button
              onClick={async () => {
                if (!cupons || cupons.length === 0) { setCupomMsg('Não há cupons para desativar.'); return; }
                if (!window.confirm('Deseja desativar todos os cupons?')) return;
                try {
                  const ativos = cupons.filter(c => c.ativo !== false);
                  if (ativos.length === 0) { setCupomMsg('Todos os cupons já estão inativos.'); return; }
                  await Promise.all(ativos.map(c => updateCupom(c.id, { ativo: false })));
                  setCupomMsg('✅ Todos os cupons foram desativados.');
                } catch (e) {
                  setCupomMsg('❌ Erro ao desativar cupons.');
                }
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-gray-800"
            >
              Desativar todos
            </button>
          </div>
        </div>

        {!cuponsCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Código do cupom</label>
            <input
              type="text"
              value={cupomForm.codigo}
              onChange={(e) => setCupomForm({ ...cupomForm, codigo: e.target.value })}
              placeholder="Ex.: MEUCUPOM10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de desconto</label>
            <select
              value={cupomForm.tipo}
              onChange={(e) => setCupomForm({ ...cupomForm, tipo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="percentual">Porcentagem (%)</option>
              <option value="fixo">Valor fixo (R$)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mínimo do pedido</label>
            <select
              value={String(cupomForm.minSubtotal)}
              onChange={(e) => setCupomForm({ ...cupomForm, minSubtotal: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="0">Sem mínimo</option>
              <option value="50">R$ 50,00</option>
              <option value="100">R$ 100,00</option>
              <option value="150">R$ 150,00</option>
              <option value="200">R$ 200,00</option>
              <option value="250">R$ 250,00</option>
              <option value="300">R$ 300,00</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Valor</label>
            <input
              type="number"
              step="0.01"
              value={cupomForm.valor}
              onChange={(e) => setCupomForm({ ...cupomForm, valor: e.target.value })}
              placeholder={cupomForm.tipo === 'percentual' ? 'Ex.: 10 (para 10%)' : 'Ex.: 5 (para R$ 5,00)'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <button
              onClick={async () => {
                setCupomMsg("");
                const codigo = (cupomForm.codigo || "").trim().toUpperCase();
                const tipo = cupomForm.tipo === 'fixo' ? 'fixo' : 'percentual';
                const valorNum = parseFloat(cupomForm.valor);
                const minSubtotal = Number(cupomForm.minSubtotal) || 0;
                if (!codigo) { setCupomMsg("Informe o código do cupom."); return; }
                if (!(valorNum > 0)) { setCupomMsg("Informe um valor de desconto válido."); return; }
                if (tipo === 'percentual' && valorNum > 100) { setCupomMsg("Porcentagem máxima é 100%."); return; }
                try {
                  await addCupom({ codigo, tipo, valor: valorNum, minSubtotal, ativo: true });
                  setCupomForm({ codigo: "", tipo: "percentual", valor: "", minSubtotal: 0 });
                  setCupomMsg("✅ Cupom criado com sucesso.");
                } catch (e) {
                  setCupomMsg("❌ Erro ao criar cupom: " + (e?.message || ''));
                }
              }}
              disabled={addCupomResponse.loading}
              className="w-full md:w-auto px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {addCupomResponse.loading ? 'Salvando...' : 'Criar cupom'}
            </button>
          </div>
        </div>
        )}

        {cupomMsg && (
          <div className="mt-3 text-sm text-gray-700">{cupomMsg}</div>
        )}

        {!cuponsCollapsed && (
          <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-4">Código</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">Valor</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Mínimo pedido</th>
                <th className="py-2 pr-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(cupons || []).map((c) => (
                <tr key={c.id} className="border-t align-top">
                  <td className="py-2 pr-4 font-semibold">
                    {editCupomId === c.id ? (
                      <input
                        type="text"
                        value={cupomEditForm.codigo}
                        onChange={(e) => setCupomEditForm({ ...cupomEditForm, codigo: e.target.value })}
                        className="w-36 px-2 py-1 border rounded uppercase text-sm"
                      />
                    ) : (
                      c.codigo
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {editCupomId === c.id ? (
                      <select
                        value={cupomEditForm.tipo}
                        onChange={(e) => setCupomEditForm({ ...cupomEditForm, tipo: e.target.value })}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="percentual">Percentual (%)</option>
                        <option value="fixo">Fixo (R$)</option>
                      </select>
                    ) : (
                      c.tipo === 'fixo' ? 'Fixo (R$)' : 'Percentual (%)'
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {editCupomId === c.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={cupomEditForm.valor}
                        onChange={(e) => setCupomEditForm({ ...cupomEditForm, valor: e.target.value })}
                        className="w-28 px-2 py-1 border rounded text-sm"
                      />
                    ) : (
                      c.tipo === 'fixo' ? `R$ ${Number(c.valor || 0).toFixed(2)}` : `${Number(c.valor || 0)}%`
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {editCupomId === c.id ? (
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!cupomEditForm.ativo}
                          onChange={(e) => setCupomEditForm({ ...cupomEditForm, ativo: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className={`text-xs font-semibold ${cupomEditForm.ativo ? 'text-green-700' : 'text-gray-500'}`}>
                          {cupomEditForm.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </label>
                    ) : (
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!c.ativo}
                          onChange={async (e) => {
                            try {
                              await updateCupom(c.id, { ativo: e.target.checked });
                            } catch (err) {
                              alert('Erro ao atualizar status do cupom');
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className={`text-xs font-semibold ${c.ativo ? 'text-green-700' : 'text-gray-500'}`}>
                          {c.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </label>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {editCupomId === c.id ? (
                      <select
                        value={String(cupomEditForm.minSubtotal)}
                        onChange={(e) => setCupomEditForm({ ...cupomEditForm, minSubtotal: Number(e.target.value) })}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="0">Sem mínimo</option>
                        <option value="50">R$ 50,00</option>
                        <option value="100">R$ 100,00</option>
                        <option value="150">R$ 150,00</option>
                        <option value="200">R$ 200,00</option>
                        <option value="250">R$ 250,00</option>
                        <option value="300">R$ 300,00</option>
                      </select>
                    ) : (
                      Number(c.minSubtotal || 0) > 0 ? `R$ ${Number(c.minSubtotal).toFixed(2)}` : 'Sem mínimo'
                    )}
                  </td>
                  <td className="py-2 pr-4 space-x-2 whitespace-nowrap">
                    {editCupomId === c.id ? (
                      <>
                        <button
                          onClick={async () => {
                            setCupomMsg("");
                            const codigo = (cupomEditForm.codigo || "").trim().toUpperCase();
                            const tipo = cupomEditForm.tipo === 'fixo' ? 'fixo' : 'percentual';
                            const valorNum = parseFloat(cupomEditForm.valor);
                            const minSubtotal = Number(cupomEditForm.minSubtotal) || 0;
                            if (!codigo) { setCupomMsg("Informe o código do cupom."); return; }
                            if (!(valorNum > 0)) { setCupomMsg("Informe um valor de desconto válido."); return; }
                            if (tipo === 'percentual' && valorNum > 100) { setCupomMsg("Porcentagem máxima é 100%."); return; }
                            try {
                              await updateCupom(c.id, { codigo, tipo, valor: valorNum, minSubtotal, ativo: !!cupomEditForm.ativo });
                              setEditCupomId(null);
                              setCupomMsg('✅ Cupom atualizado.');
                            } catch (e) {
                              setCupomMsg('❌ Erro ao atualizar cupom.');
                            }
                          }}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditCupomId(null)}
                          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditCupomId(c.id);
                            setCupomEditForm({
                              codigo: c.codigo || "",
                              tipo: c.tipo === 'fixo' ? 'fixo' : 'percentual',
                              valor: String(c.valor ?? ''),
                              minSubtotal: Number(c.minSubtotal || 0),
                              ativo: c.ativo !== false,
                            });
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Excluir este cupom?')) {
                              deleteCupom(c.id);
                            }
                          }}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Excluir
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {(!cupons || cupons.length === 0) && !cuponsLoading && (
                <tr>
                  <td colSpan="6" className="py-4 text-gray-500">Nenhum cupom cadastrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
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
          <div>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <FaSort />
              <span className="hidden sm:inline">{direcaoOrdenacao === "asc" ? "Crescente" : "Decrescente"}</span>
              <span className="sm:hidden">{direcaoOrdenacao === "asc" ? "↑" : "↓"}</span>
            </button>
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
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja excluir este produto?')) {
                        deleteDocument(produto.id);
                      }
                    }}
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
    </div>
  );
}