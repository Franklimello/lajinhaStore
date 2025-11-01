import { useState } from "react";
import { FaChevronDown, FaChevronUp, FaArrowLeft, FaImage, FaTag, FaPalette, FaLink, FaMapMarkerAlt, FaTachometerAlt, FaCheckCircle, FaTimesCircle, FaEdit, FaTrash, FaPowerOff, FaSave, FaTimes, FaBullhorn } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useGetDocuments } from "../../hooks/useGetDocuments";
import { useAddDocument } from "../../hooks/useAddDocument";
import { useDeleteDocument } from "../../hooks/useDeleteDocument";
import { useUpdateDocument } from "../../hooks/useUpdateDocument";
import { storage } from "../../firebase/config";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import ConfirmModal from "../../components/ConfirmModal";
import AlertModal from "../../components/AlertModal";

export default function Promocoes() {
  const navigate = useNavigate();
  
  // Estados para modais
  const [alert, setAlert] = useState({ isOpen: false, message: "", type: "info" });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ type: null, id: null, callback: null });

  // Gestão de cupons
  const { documents: cupons, loading: cuponsLoading, error: cuponsError } = useGetDocuments("cupons", { realTime: true });
  const { addDocument: addCupom, response: addCupomResponse } = useAddDocument("cupons");
  const { deleteDocument: deleteCupom } = useDeleteDocument("cupons");
  const { updateDocument: updateCupom } = useUpdateDocument("cupons");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cabeçalho Melhorado */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <button
            onClick={() => navigate("/painel")}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all duration-200 hover:gap-3 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar ao Painel</span>
          </button>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                  <FaBullhorn className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    Promoções e Anúncios
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm md:text-base">Gerencie anúncios em marquee e cupons de desconto</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Letreiro de Anúncios - Card Melhorado */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header do Card */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 md:p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <FaImage className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">Letreiro de Anúncios</h2>
                  <p className="text-blue-100 text-sm mt-0.5">Cadastre pequenos anúncios com imagem, texto e rota clicável</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-white font-semibold text-sm">
                    {Array.isArray(anuncios) ? anuncios.length : 0} {Array.isArray(anuncios) && anuncios.length === 1 ? 'anúncio' : 'anúncios'}
                  </span>
                </div>
                <button
                  onClick={() => setAnunciosCollapsed(!anunciosCollapsed)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-200 text-white"
                  aria-label={anunciosCollapsed ? "Expandir" : "Colapsar"}
                  title={anunciosCollapsed ? "Expandir seção" : "Colapsar seção"}
                >
                  {anunciosCollapsed ? (
                    <FaChevronDown className="text-sm" />
                  ) : (
                    <FaChevronUp className="text-sm" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {!anunciosCollapsed && (
            <div className="p-6 md:p-8 space-y-6">
              {/* Formulário de Criação - Grid Melhorado */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaEdit className="text-blue-600" />
                  Criar Novo Anúncio
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {/* Texto */}
                  <div className="lg:col-span-2 xl:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaBullhorn className="text-gray-400" />
                      Texto do Anúncio
                    </label>
                    <input
                      type="text"
                      value={anuncioForm.texto}
                      onChange={(e) => setAnuncioForm({ ...anuncioForm, texto: e.target.value })}
                      placeholder="Ex.: Frete R$5 em toda a cidade"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white shadow-sm"
                    />
                  </div>

                  {/* Imagem */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaImage className="text-gray-400" />
                      Imagem (Opcional)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAnuncioForm({ ...anuncioForm, file: e.target.files?.[0] || null })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1.5">Selecione uma imagem pequena (icônico)</p>
                    </div>
                  </div>

                  {/* Localização */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400" />
                      Localização
                    </label>
                    <select
                      value={anuncioForm.localizacao}
                      onChange={(e) => setAnuncioForm({ ...anuncioForm, localizacao: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white shadow-sm"
                    >
                      <option value="marquee">Marquee (topo, rolagem horizontal)</option>
                      <option value="motoboy">Banner Motoboy City</option>
                      <option value="custom">Custom (adicione keyword no texto)</option>
                    </select>
                  </div>

                  {/* Rota */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaLink className="text-gray-400" />
                      Rota/Link
                    </label>
                    <input
                      type="text"
                      value={anuncioForm.rota}
                      onChange={(e) => setAnuncioForm({ ...anuncioForm, rota: e.target.value })}
                      placeholder="/ofertas ou https://exemplo.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white shadow-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Use / para rotas internas ou https:// para links externos</p>
                  </div>

                  {/* Cores */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FaPalette className="text-gray-400" />
                        Cor de Fundo
                      </label>
                      <div className="relative">
                        <input
                          type="color"
                          value={anuncioForm.bgColor}
                          onChange={(e) => setAnuncioForm({ ...anuncioForm, bgColor: e.target.value })}
                          className="w-full h-12 px-2 py-2 border-2 border-gray-200 rounded-xl cursor-pointer shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FaPalette className="text-gray-400" />
                        Cor do Texto
                      </label>
                      <div className="relative">
                        <input
                          type="color"
                          value={anuncioForm.textColor}
                          onChange={(e) => setAnuncioForm({ ...anuncioForm, textColor: e.target.value })}
                          className="w-full h-12 px-2 py-2 border-2 border-gray-200 rounded-xl cursor-pointer shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Velocidade e Status */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FaTachometerAlt className="text-gray-400" />
                        Velocidade (segundos)
                      </label>
                      <input
                        type="number"
                        min="4"
                        max="120"
                        step="1"
                        value={anuncioForm.speedSeconds}
                        onChange={(e) => setAnuncioForm({ ...anuncioForm, speedSeconds: Number(e.target.value || 8) })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white shadow-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                      <select
                        value={anuncioForm.ativo ? 'ativo' : 'inativo'}
                        onChange={(e) => setAnuncioForm({ ...anuncioForm, ativo: e.target.value === 'ativo' })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white shadow-sm"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Botão Criar */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={async () => {
                      setAnuncioMsg("");
                      const texto = (anuncioForm.texto || "").trim();
                      const rota = (anuncioForm.rota || "").trim() || "/";
                      try {
                        if (!texto && !anuncioForm.file) { setAnuncioMsg("Informe texto ou selecione uma imagem."); return; }

                        let imagemUrl = "";
                        if (anuncioForm.file) {
                          const path = `anuncios/${Date.now()}-${anuncioForm.file.name}`;
                          const ref = storageRef(storage, path);
                          const blob = anuncioForm.file;
                          await uploadBytes(ref, blob, { contentType: blob.type });
                          imagemUrl = await getDownloadURL(ref);
                        }

                        await addAnuncio({ texto, imagemUrl, rota, localizacao: anuncioForm.localizacao, ativo: !!anuncioForm.ativo, bgColor: anuncioForm.bgColor, textColor: anuncioForm.textColor, speedSeconds: Number(anuncioForm.speedSeconds) || 8 });
                        setAnuncioForm({ texto: "", imagemUrl: "", rota: "", localizacao: "marquee", ativo: true, file: null, bgColor: "#F1F5F9", textColor: "#111827", speedSeconds: 8 });
                        setAnuncioMsg("✅ Anúncio criado com sucesso!");
                      } catch (e) {
                        setAnuncioMsg("❌ Erro ao criar anúncio.");
                      }
                    }}
                    disabled={addAnuncioResp.loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                  >
                    <FaImage />
                    {addAnuncioResp.loading ? 'Salvando...' : 'Criar Anúncio'}
                  </button>
                </div>

                {anuncioMsg && (
                  <div className={`mt-4 p-4 rounded-xl ${anuncioMsg.includes('✅') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    <p className="text-sm font-medium">{anuncioMsg}</p>
                  </div>
                )}
              </div>

              {/* Lista de Anúncios - Tabela Melhorada */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaBullhorn className="text-blue-600" />
                  Anúncios Cadastrados
                </h3>
                
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Imagem</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Texto</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rota</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cores</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Velocidade</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {(anuncios || []).map((a) => (
                        <tr key={a.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            {editAnuncioId === a.id ? (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setAnuncioEditForm({ ...anuncioEditForm, file: e.target.files?.[0] || null })}
                                className="text-xs border rounded-lg px-2 py-1"
                              />
                            ) : (
                              a.imagemUrl ? (
                                <img src={a.imagemUrl} alt={a.texto || 'Anúncio'} className="w-12 h-12 object-contain rounded-lg shadow-sm border border-gray-200" />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <FaImage className="text-gray-400 text-xl" />
                                </div>
                              )
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {editAnuncioId === a.id ? (
                              <input
                                type="text"
                                value={anuncioEditForm.texto}
                                onChange={(e) => setAnuncioEditForm({ ...anuncioEditForm, texto: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-900 max-w-xs truncate block">{a.texto || <span className="text-gray-400 italic">Sem texto</span>}</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {editAnuncioId === a.id ? (
                              <input
                                type="text"
                                value={anuncioEditForm.rota}
                                onChange={(e) => setAnuncioEditForm({ ...anuncioEditForm, rota: e.target.value })}
                                className="w-40 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="/ofertas ou https://..."
                              />
                            ) : (
                              <span className="text-sm text-blue-600 font-medium">{a.rota || '/'}</span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {editAnuncioId === a.id ? (
                              <label className="inline-flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!anuncioEditForm.ativo}
                                  onChange={(e) => setAnuncioEditForm({ ...anuncioEditForm, ativo: e.target.checked })}
                                  className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className={`text-sm font-semibold flex items-center gap-1 ${anuncioEditForm.ativo ? 'text-green-700' : 'text-gray-500'}`}>
                                  {anuncioEditForm.ativo ? <FaCheckCircle /> : <FaTimesCircle />}
                                  {anuncioEditForm.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                              </label>
                            ) : (
                              <label className="inline-flex items-center gap-2 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={a.ativo !== false}
                                  onChange={async (e) => { try { await updateAnuncio(a.id, { ativo: e.target.checked }); } catch {} }}
                                  className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 group-hover:border-blue-400 transition-colors"
                                />
                                <span className={`text-sm font-semibold flex items-center gap-1 ${a.ativo !== false ? 'text-green-700' : 'text-gray-500'}`}>
                                  {a.ativo !== false ? <FaCheckCircle /> : <FaTimesCircle />}
                                  {a.ativo !== false ? 'Ativo' : 'Inativo'}
                                </span>
                              </label>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {editAnuncioId === a.id ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  type="color" 
                                  value={anuncioEditForm.bgColor} 
                                  onChange={(e)=>setAnuncioEditForm({...anuncioEditForm,bgColor:e.target.value})} 
                                  className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                                />
                                <input 
                                  type="color" 
                                  value={anuncioEditForm.textColor} 
                                  onChange={(e)=>setAnuncioEditForm({...anuncioEditForm,textColor:e.target.value})} 
                                  className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-gray-500">BG</span>
                                  <span className="inline-block w-8 h-8 rounded-lg shadow-sm border-2 border-gray-200" style={{backgroundColor: a.bgColor || '#F1F5F9'}}></span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-gray-500">TXT</span>
                                  <span className="inline-block w-8 h-8 rounded-lg shadow-sm border-2 border-gray-300" style={{backgroundColor: a.textColor || '#111827'}}></span>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {editAnuncioId === a.id ? (
                              <input
                                type="number"
                                min="4"
                                max="120"
                                step="1"
                                value={anuncioEditForm.speedSeconds ?? a.speedSeconds ?? 8}
                                onChange={(e)=>setAnuncioEditForm({...anuncioEditForm, speedSeconds: Number(e.target.value || 8) })}
                                className="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                                <FaTachometerAlt className="text-xs" />
                                {a.speedSeconds || 8}s
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {editAnuncioId === a.id ? (
                              <div className="flex items-center gap-2">
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
                                      setAnuncioMsg('✅ Anúncio atualizado com sucesso!');
                                    } catch (e) {
                                      setAnuncioMsg('❌ Erro ao atualizar anúncio.');
                                    }
                                  }}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
                                >
                                  <FaSave />
                                  Salvar
                                </button>
                                <button
                                  onClick={() => setEditAnuncioId(null)}
                                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-semibold flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
                                >
                                  <FaTimes />
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={async () => {
                                    try { await updateAnuncio(a.id, { ativo: false }); } catch {}
                                  }}
                                  disabled={a.ativo === false}
                                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md ${a.ativo === false ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
                                  title="Desativar anúncio"
                                >
                                  <FaPowerOff />
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
                                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
                                  title="Editar anúncio"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm({ type: 'anuncio', id: a.id, callback: () => deleteAnuncio(a.id) })}
                                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
                                  title="Excluir anúncio"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {(!anuncios || anuncios.length === 0) && (
                        <tr>
                          <td colSpan="7" className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                              <FaBullhorn className="text-4xl" />
                              <p className="text-base font-medium">Nenhum anúncio cadastrado</p>
                              <p className="text-sm">Crie seu primeiro anúncio usando o formulário acima</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gestão de Cupons - Card Melhorado */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header do Card */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-5 md:p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <FaTag className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">Cupons de Promoção</h2>
                  <p className="text-purple-100 text-sm mt-0.5">Crie cupons com desconto em porcentagem ou valor fixo</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-white font-semibold text-sm">
                    {cuponsLoading ? 'Carregando...' : `${Array.isArray(cupons) ? cupons.length : 0} ${Array.isArray(cupons) && cupons.length === 1 ? 'cupom' : 'cupons'}`}
                    {cuponsError && <span className="text-red-200 ml-2">• Erro</span>}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    if (!cupons || cupons.length === 0) { setCupomMsg('Não há cupons para desativar.'); return; }
                    setConfirmModal({
                      isOpen: true,
                      title: "Desativar Todos os Cupons",
                      message: "Deseja desativar todos os cupons?",
                      onConfirm: async () => {
                        setConfirmModal({ isOpen: false });
                        try {
                          const ativos = cupons.filter(c => c.ativo !== false);
                          if (ativos.length === 0) { setCupomMsg('Todos os cupons já estão inativos.'); return; }
                          await Promise.all(ativos.map(c => updateCupom(c.id, { ativo: false })));
                          setCupomMsg('✅ Todos os cupons foram desativados.');
                        } catch (e) {
                          setCupomMsg('❌ Erro ao desativar cupons.');
                        }
                      }
                    });
                  }}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  <FaPowerOff />
                  Desativar todos
                </button>
                <button
                  onClick={() => setCuponsCollapsed(!cuponsCollapsed)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-200 text-white"
                  aria-label={cuponsCollapsed ? "Expandir" : "Colapsar"}
                  title={cuponsCollapsed ? "Expandir seção" : "Colapsar seção"}
                >
                  {cuponsCollapsed ? (
                    <FaChevronDown className="text-sm" />
                  ) : (
                    <FaChevronUp className="text-sm" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {!cuponsCollapsed && (
            <div className="p-6 md:p-8 space-y-6">
              {/* Formulário de Criação */}
              <div className="bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaEdit className="text-purple-600" />
                  Criar Novo Cupom
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaTag className="text-gray-400" />
                      Código do Cupom
                    </label>
                    <input
                      type="text"
                      value={cupomForm.codigo}
                      onChange={(e) => setCupomForm({ ...cupomForm, codigo: e.target.value })}
                      placeholder="Ex.: MEUCUPOM10"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm bg-white shadow-sm uppercase font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Desconto</label>
                    <select
                      value={cupomForm.tipo}
                      onChange={(e) => setCupomForm({ ...cupomForm, tipo: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm bg-white shadow-sm"
                    >
                      <option value="percentual">Porcentagem (%)</option>
                      <option value="fixo">Valor fixo (R$)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mínimo do Pedido</label>
                    <select
                      value={String(cupomForm.minSubtotal)}
                      onChange={(e) => setCupomForm({ ...cupomForm, minSubtotal: Number(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm bg-white shadow-sm"
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valor</label>
                    <input
                      type="number"
                      step="0.01"
                      value={cupomForm.valor}
                      onChange={(e) => setCupomForm({ ...cupomForm, valor: e.target.value })}
                      placeholder={cupomForm.tipo === 'percentual' ? 'Ex.: 10 (para 10%)' : 'Ex.: 5 (para R$ 5,00)'}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm bg-white shadow-sm"
                    />
                  </div>
                  <div className="flex items-end">
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
                          setCupomMsg("✅ Cupom criado com sucesso!");
                        } catch (e) {
                          setCupomMsg("❌ Erro ao criar cupom: " + (e?.message || ''));
                        }
                      }}
                      disabled={addCupomResponse.loading}
                      className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <FaTag />
                      {addCupomResponse.loading ? 'Salvando...' : 'Criar Cupom'}
                    </button>
                  </div>
                </div>

                {cupomMsg && (
                  <div className={`mt-4 p-4 rounded-xl ${cupomMsg.includes('✅') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    <p className="text-sm font-medium">{cupomMsg}</p>
                  </div>
                )}
              </div>

              {/* Lista de Cupons - Tabela Melhorada */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaTag className="text-purple-600" />
                  Cupons Cadastrados
                </h3>
                
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Código</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tipo</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Valor</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mínimo Pedido</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {(cupons || []).map((c) => (
                        <tr key={c.id} className="hover:bg-purple-50/50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            {editCupomId === c.id ? (
                              <input
                                type="text"
                                value={cupomEditForm.codigo}
                                onChange={(e) => setCupomEditForm({ ...cupomEditForm, codigo: e.target.value })}
                                className="w-36 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 uppercase font-semibold text-sm"
                              />
                            ) : (
                              <span className="inline-flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-800 rounded-lg font-bold text-sm">
                                <FaTag className="text-xs" />
                                {c.codigo}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {editCupomId === c.id ? (
                              <select
                                value={cupomEditForm.tipo}
                                onChange={(e) => setCupomEditForm({ ...cupomEditForm, tipo: e.target.value })}
                                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                              >
                                <option value="percentual">Percentual (%)</option>
                                <option value="fixo">Fixo (R$)</option>
                              </select>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold">
                                {c.tipo === 'fixo' ? 'Fixo (R$)' : 'Percentual (%)'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {editCupomId === c.id ? (
                              <input
                                type="number"
                                step="0.01"
                                value={cupomEditForm.valor}
                                onChange={(e) => setCupomEditForm({ ...cupomEditForm, valor: e.target.value })}
                                className="w-28 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                              />
                            ) : (
                              <span className="text-lg font-bold text-green-600">
                                {c.tipo === 'fixo' ? `R$ ${Number(c.valor || 0).toFixed(2)}` : `${Number(c.valor || 0)}%`}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {editCupomId === c.id ? (
                              <label className="inline-flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!cupomEditForm.ativo}
                                  onChange={(e) => setCupomEditForm({ ...cupomEditForm, ativo: e.target.checked })}
                                  className="w-5 h-5 rounded border-2 border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className={`text-sm font-semibold flex items-center gap-1 ${cupomEditForm.ativo ? 'text-green-700' : 'text-gray-500'}`}>
                                  {cupomEditForm.ativo ? <FaCheckCircle /> : <FaTimesCircle />}
                                  {cupomEditForm.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                              </label>
                            ) : (
                              <label className="inline-flex items-center gap-2 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={!!c.ativo}
                                  onChange={async (e) => {
                                    try {
                                      await updateCupom(c.id, { ativo: e.target.checked });
                                    } catch (err) {
                                      setAlert({ isOpen: true, message: 'Erro ao atualizar status do cupom', type: "error" });
                                    }
                                  }}
                                  className="w-5 h-5 rounded border-2 border-gray-300 text-purple-600 focus:ring-purple-500 group-hover:border-purple-400 transition-colors"
                                />
                                <span className={`text-sm font-semibold flex items-center gap-1 ${c.ativo ? 'text-green-700' : 'text-gray-500'}`}>
                                  {c.ativo ? <FaCheckCircle /> : <FaTimesCircle />}
                                  {c.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                              </label>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {editCupomId === c.id ? (
                              <select
                                value={String(cupomEditForm.minSubtotal)}
                                onChange={(e) => setCupomEditForm({ ...cupomEditForm, minSubtotal: Number(e.target.value) })}
                                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
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
                              <span className="text-sm text-gray-700 font-medium">
                                {Number(c.minSubtotal || 0) > 0 ? `R$ ${Number(c.minSubtotal).toFixed(2)}` : <span className="text-gray-400 italic">Sem mínimo</span>}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {editCupomId === c.id ? (
                              <div className="flex items-center gap-2">
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
                                      setCupomMsg('✅ Cupom atualizado com sucesso!');
                                    } catch (e) {
                                      setCupomMsg('❌ Erro ao atualizar cupom.');
                                    }
                                  }}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
                                >
                                  <FaSave />
                                  Salvar
                                </button>
                                <button
                                  onClick={() => setEditCupomId(null)}
                                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-semibold flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
                                >
                                  <FaTimes />
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
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
                                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
                                  title="Editar cupom"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm({ type: 'cupom', id: c.id, callback: () => deleteCupom(c.id) })}
                                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
                                  title="Excluir cupom"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {(!cupons || cupons.length === 0) && !cuponsLoading && (
                        <tr>
                          <td colSpan="6" className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                              <FaTag className="text-4xl" />
                              <p className="text-base font-medium">Nenhum cupom cadastrado</p>
                              <p className="text-sm">Crie seu primeiro cupom usando o formulário acima</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      <ConfirmModal
        isOpen={deleteConfirm.type !== null}
        onClose={() => setDeleteConfirm({ type: null, id: null, callback: null })}
        onConfirm={() => {
          if (deleteConfirm.callback) deleteConfirm.callback();
          setDeleteConfirm({ type: null, id: null, callback: null });
        }}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir este ${deleteConfirm.type === 'anuncio' ? 'anúncio' : 'cupom'}? Esta ação não pode ser desfeita.`}
        variant="danger"
      />

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.type === "success" ? "Sucesso" : alert.type === "error" ? "Erro" : alert.type === "warning" ? "Atenção" : "Aviso"}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
}
