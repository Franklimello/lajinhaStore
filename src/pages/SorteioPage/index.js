import { useState, useEffect } from 'react';
import { FaSearch, FaDice, FaTrophy, FaTicketAlt, FaCalendar, FaShoppingCart, FaDollarSign, FaUser, FaPhone, FaPause, FaPlay, FaTrash, FaSync, FaCog, FaTimes } from 'react-icons/fa';
import { getSorteioData, togglePromocao, limparParticipantes, isPromocaoAtiva, adicionarClienteManual, addSorteioData, getSorteioConfig, updateSorteioConfig } from '../../services/sorteioService';
import { getAllOrders } from '../../firebase/orders';
import SorteioAnimation from '../../components/SorteioAnimation';
import ConfirmModal from '../../components/ConfirmModal';
import AlertModal from '../../components/AlertModal';

export default function SorteioPage() {
  const [sorteioData, setSorteioData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [promocaoAtiva, setPromocaoAtiva] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingLimpar, setLoadingLimpar] = useState(false);
  const [showAdicionarManual, setShowAdicionarManual] = useState(false);
  const [loadingAdicionar, setLoadingAdicionar] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [sorteioConfig, setSorteioConfig] = useState({
    regraTipo: 'itens', // 'itens' ou 'valor'
    regraValor: 5
  });
  const [alert, setAlert] = useState({ isOpen: false, message: "", type: "info" });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  const [clienteManual, setClienteManual] = useState({
    orderNumber: '',
    clientName: '',
    clientPhone: '',
    totalItems: '',
    totalValue: ''
  });

  // Buscar status da promoção e configuração ao carregar
  useEffect(() => {
    const fetchStatus = async () => {
      const status = await isPromocaoAtiva();
      setPromocaoAtiva(status);
      
      // Buscar configuração da regra
      const config = await getSorteioConfig();
      setSorteioConfig({
        regraTipo: config.regraTipo || 'itens',
        regraValor: config.regraValor || 5
      });
    };
    fetchStatus();
  }, []);

  // Função para buscar dados do sorteio
  const handleBuscarDados = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getSorteioData();
      setSorteioData(data);
      setDataLoaded(true);
      
      if (data.length === 0) {
        setError('Nenhum pedido elegível encontrado. Os pedidos precisam ter 5 ou mais itens.');
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao buscar dados do sorteio. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para iniciar o sorteio
  const handleSortear = () => {
    if (sorteioData.length === 0) {
      setAlert({ isOpen: true, message: 'Busque os dados primeiro ou não há pedidos elegíveis para sortear.', type: "warning" });
      return;
    }
    setShowAnimation(true);
  };

  // Função para pausar/ativar promoção
  const handleTogglePromocao = async () => {
    const novoStatus = !promocaoAtiva;
    const confirmMessage = novoStatus
      ? 'Deseja ATIVAR a promoção de sorteio? Novos pedidos com 5+ itens serão salvos automaticamente.'
      : 'Deseja PAUSAR a promoção de sorteio? Novos pedidos não serão mais salvos no banco de dados.';
    
    setConfirmModal({
      isOpen: true,
      title: novoStatus ? "Ativar Promoção" : "Pausar Promoção",
      message: confirmMessage,
      onConfirm: async () => {
        setConfirmModal({ isOpen: false });
        setLoadingStatus(true);
        try {
          const result = await togglePromocao(novoStatus);
          if (result.success) {
            setPromocaoAtiva(novoStatus);
            setAlert({ isOpen: true, message: result.message, type: "success" });
          } else {
            setAlert({ isOpen: true, message: result.message, type: "error" });
          }
        } catch (error) {
          console.error('Erro ao alterar status:', error);
          setAlert({ isOpen: true, message: 'Erro ao alterar status da promoção.', type: "error" });
        } finally {
          setLoadingStatus(false);
        }
      }
    });
  };

  // Função para limpar participantes
  const handleLimparParticipantes = async () => {
    const confirmMessage = 
      '⚠️ ATENÇÃO! Esta ação irá EXCLUIR TODOS os participantes do sorteio atual.\n\n' +
      'Esta ação NÃO pode ser desfeita!\n\n' +
      'Deseja realmente continuar?';
    
    setConfirmModal({
      isOpen: true,
      title: "Limpar Participantes",
      message: confirmMessage,
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal({ isOpen: false });
        setLoadingLimpar(true);
        try {
          const result = await limparParticipantes();
          if (result.success) {
            setAlert({ isOpen: true, message: result.message, type: "success" });
            // Atualizar a lista
            setSorteioData([]);
            setDataLoaded(false);
          } else {
            setAlert({ isOpen: true, message: result.message, type: "error" });
          }
        } catch (error) {
          console.error('Erro ao limpar participantes:', error);
          setAlert({ isOpen: true, message: 'Erro ao limpar participantes.', type: "error" });
        } finally {
          setLoadingLimpar(false);
        }
      }
    });
  };

  // Função para adicionar cliente manualmente
  const handleAdicionarCliente = async () => {
    if (!clienteManual.orderNumber || !clienteManual.clientName || !clienteManual.clientPhone || !clienteManual.totalItems || !clienteManual.totalValue) {
      setAlert({ isOpen: true, message: 'Todos os campos são obrigatórios!', type: "warning" });
      return;
    }

    if (parseInt(clienteManual.totalItems) < 5) {
      setAlert({ isOpen: true, message: 'O cliente deve ter pelo menos 5 itens para participar do sorteio!', type: "warning" });
      return;
    }

    setLoadingAdicionar(true);
    try {
      const dadosCliente = {
        orderNumber: clienteManual.orderNumber,
        clientName: clienteManual.clientName,
        clientPhone: clienteManual.clientPhone,
        totalItems: parseInt(clienteManual.totalItems),
        totalValue: parseFloat(clienteManual.totalValue)
      };

      const resultado = await adicionarClienteManual(dadosCliente);
      
      if (resultado.success) {
        setAlert({ isOpen: true, message: 'Cliente adicionado ao sorteio com sucesso!', type: "success" });
        setClienteManual({
          orderNumber: '',
          clientName: '',
          clientPhone: '',
          totalItems: '',
          totalValue: ''
        });
        setShowAdicionarManual(false);
        // Recarregar dados
        handleBuscarDados();
      } else {
        setAlert({ isOpen: true, message: `Erro ao adicionar cliente: ${resultado.message}`, type: "error" });
      }
    } catch (error) {
      setAlert({ isOpen: true, message: `Erro inesperado: ${error.message}`, type: "error" });
    } finally {
      setLoadingAdicionar(false);
    }
  };

  // Função para sincronizar pedidos antigos com o sorteio
  const handleSyncOldOrders = async () => {
    setLoadingSync(true);
    try {
      console.log('🔄 Iniciando sincronização de pedidos antigos...');
      
      // Buscar todos os pedidos
      const ordersResult = await getAllOrders();
      if (!ordersResult.success || !ordersResult.pedidos) {
        throw new Error(ordersResult.error || 'Erro ao buscar pedidos');
      }

      const allOrders = ordersResult.pedidos;
      console.log(`📦 Total de pedidos encontrados: ${allOrders.length}`);

      // Buscar pedidos já no sorteio para evitar duplicatas
      const existingSorteio = await getSorteioData();
      const existingOrderNumbers = new Set(existingSorteio.map(s => String(s.orderNumber)));
      console.log(`✅ Pedidos já no sorteio: ${existingOrderNumbers.size}`);

      // Filtrar pedidos elegíveis (5+ itens e não estão no sorteio)
      const eligibleOrders = [];
      for (const order of allOrders) {
        // Calcular total de itens - suporta múltiplos formatos de quantidade
        let totalItems = 0;
        if (Array.isArray(order.items)) {
          totalItems = order.items.reduce((sum, item) => {
            const qty = Number(item.qty || item.quantidade || item.quantity || 1);
            return sum + qty;
          }, 0);
        }
        
        // Verificar elegibilidade baseado na regra configurada
        const orderNumber = order.id || order.orderNumber || order.orderId || order.metadata?.originalOrderId;
        const totalValue = Number(order.total || order.totalValue || 0);
        
        // Buscar configuração da regra
        const config = await getSorteioConfig();
        
        // Verificar elegibilidade baseado na regra configurada
        let isElegivel = false;
        if (config.regraTipo === 'itens') {
          isElegivel = totalItems >= config.regraValor;
        } else if (config.regraTipo === 'valor') {
          isElegivel = totalValue >= config.regraValor;
        }
        
        // Debug log para os primeiros pedidos
        if (eligibleOrders.length < 3) {
          console.log(`🔍 DEBUG Pedido #${orderNumber}:`, {
            totalItems,
            totalValue,
            regra: `${config.regraTipo} >= ${config.regraValor}`,
            isElegivel,
            temEndereco: !!order.endereco,
            enderecoNome: order.endereco?.nome,
            enderecoTelefone: order.endereco?.telefone,
            clientName: order.clientName,
            clientPhone: order.clientPhone,
            itemsCount: order.items?.length || 0
          });
        }

        if (isElegivel && !existingOrderNumbers.has(String(orderNumber))) {
          // Extrair dados do cliente do pedido - prioriza endereco (formato atual)
          const clientName = order.endereco?.nome || order.clientName || order.nome || order.nomeCliente || 'Cliente';
          const clientPhone = order.endereco?.telefone || order.clientPhone || order.telefone || '';
          const totalValue = Number(order.total || order.totalValue || 0);

          // Validar se tem dados mínimos
          if (!clientName || clientName === 'Cliente' || !clientPhone) {
            console.warn(`⚠️ Pedido #${orderNumber} sem dados completos do cliente - pulando`);
            continue;
          }

          eligibleOrders.push({
            orderNumber: String(orderNumber),
            clientName: String(clientName),
            clientPhone: String(clientPhone),
            totalItems: totalItems,
            totalValue: totalValue,
            originalOrder: order
          });
        }
      }

      console.log(`🎯 Pedidos elegíveis encontrados: ${eligibleOrders.length}`);
      
      // Logs detalhados para debug
      const pedidosCom5Mais = allOrders.filter(order => {
        const totalItems = Array.isArray(order.items) 
          ? order.items.reduce((sum, item) => sum + (Number(item.qty || item.quantidade || item.quantity || 1)), 0)
          : 0;
        return totalItems >= 5;
      });
      
      console.log(`📊 Estatísticas:`, {
        totalPedidos: allOrders.length,
        pedidosCom5Mais: pedidosCom5Mais.length,
        jaNoSorteio: existingOrderNumbers.size,
        elegiveisParaAdicionar: eligibleOrders.length
      });

      if (eligibleOrders.length === 0) {
        const msg = pedidosCom5Mais.length === 0
          ? 'Nenhum pedido encontrado com 5 ou mais itens no banco de dados.'
          : pedidosCom5Mais.length === existingOrderNumbers.size
          ? `Todos os ${pedidosCom5Mais.length} pedido(s) com 5+ itens já estão no sorteio.`
          : 'Nenhum pedido elegível encontrado para adicionar ao sorteio.';
          
        setAlert({ 
          isOpen: true, 
          message: msg, 
          type: "info" 
        });
        setLoadingSync(false);
        return;
      }

      // Confirmar antes de adicionar
      setConfirmModal({
        isOpen: true,
        title: "Sincronizar Pedidos Antigos",
        message: `Encontrados ${eligibleOrders.length} pedido(s) elegível(eis) com 5+ itens que não estão no sorteio.\n\nDeseja adicionar todos ao sorteio?`,
        onConfirm: async () => {
          setConfirmModal({ isOpen: false });
          await processSyncOrders(eligibleOrders);
        }
      });

    } catch (error) {
      console.error('❌ Erro ao sincronizar pedidos:', error);
      setAlert({ 
        isOpen: true, 
        message: `Erro ao sincronizar pedidos: ${error.message}`, 
        type: "error" 
      });
      setLoadingSync(false);
    }
  };

  // Processar e adicionar pedidos ao sorteio
  const processSyncOrders = async (eligibleOrders) => {
    setLoadingSync(true);
    let added = 0;
    let skipped = 0;
    let errors = 0;

    try {
      for (const order of eligibleOrders) {
        try {
          const result = await addSorteioData(order);
          if (result.success && result.eligible) {
            added++;
            console.log(`✅ Pedido #${order.orderNumber} adicionado ao sorteio`);
          } else if (result.alreadyExists) {
            skipped++;
            console.log(`⚠️ Pedido #${order.orderNumber} já existe no sorteio`);
          } else {
            skipped++;
            console.log(`⚠️ Pedido #${order.orderNumber} não elegível: ${result.message}`);
          }
        } catch (error) {
          errors++;
          console.error(`❌ Erro ao adicionar pedido #${order.orderNumber}:`, error);
        }
      }

      // Recarregar dados do sorteio
      await handleBuscarDados();

      // Mostrar resultado
      const message = `Sincronização concluída!\n\n✅ Adicionados: ${added}\n⚠️ Ignorados: ${skipped}${errors > 0 ? `\n❌ Erros: ${errors}` : ''}`;
      setAlert({ 
        isOpen: true, 
        message: message, 
        type: added > 0 ? "success" : "warning" 
      });

    } catch (error) {
      console.error('❌ Erro ao processar pedidos:', error);
      setAlert({ 
        isOpen: true, 
        message: `Erro ao processar pedidos: ${error.message}`, 
        type: "error" 
      });
    } finally {
      setLoadingSync(false);
    }
  };

  // Função para salvar configuração da regra
  const handleSalvarConfig = async () => {
    setLoadingConfig(true);
    try {
      if (sorteioConfig.regraValor <= 0) {
        setAlert({ 
          isOpen: true, 
          message: 'O valor mínimo deve ser maior que zero!', 
          type: "warning" 
        });
        setLoadingConfig(false);
        return;
      }

      const result = await updateSorteioConfig({
        regraTipo: sorteioConfig.regraTipo,
        regraValor: sorteioConfig.regraValor
      });

      if (result.success) {
        setAlert({ 
          isOpen: true, 
          message: result.message, 
          type: "success" 
        });
        setShowConfigModal(false);
        // Recarregar dados para aplicar nova regra
        await handleBuscarDados();
      } else {
        setAlert({ 
          isOpen: true, 
          message: result.message, 
          type: "error" 
        });
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      setAlert({ 
        isOpen: true, 
        message: 'Erro ao salvar configuração', 
        type: "error" 
      });
    } finally {
      setLoadingConfig(false);
    }
  };

  // Formatar data
  const formatDate = (date) => {
    if (!date) return '-';
    
    try {
      const d = date instanceof Date ? date : new Date(date);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return '-';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 flex items-center gap-3">
                <FaTrophy className="text-yellow-500" />
                Sorteio de Clientes
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie e realize sorteios entre clientes elegíveis
                {sorteioConfig.regraTipo === 'itens' 
                  ? ` (${sorteioConfig.regraValor}+ itens)`
                  : ` (R$ ${sorteioConfig.regraValor.toFixed(2)}+ de compra)`}
              </p>
            </div>

            {/* Estatísticas rápidas */}
            {dataLoaded && (
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border-2 border-purple-300">
                <div className="text-center">
                  <p className="text-sm text-purple-700 font-semibold">Participantes Elegíveis</p>
                  <p className="text-4xl font-bold text-purple-600">{sorteioData.length}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controles da Promoção */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaTicketAlt className="text-purple-600" />
            Controles da Promoção
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Status da Promoção */}
            <button
              onClick={handleTogglePromocao}
              disabled={loadingStatus}
              className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 ${
                promocaoAtiva
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
              }`}
            >
              {promocaoAtiva ? <FaPlay className="text-xl" /> : <FaPause className="text-xl" />}
              {loadingStatus ? 'Alterando...' : (promocaoAtiva ? 'Promoção Ativa' : 'Promoção Pausada')}
            </button>

            {/* Limpar Participantes */}
            <button
              onClick={handleLimparParticipantes}
              disabled={loadingLimpar || sorteioData.length === 0}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              title="Excluir todos os participantes do banco de dados"
            >
              <FaTrash className="text-xl" />
              {loadingLimpar ? 'Excluindo...' : 'Limpar Participantes'}
            </button>

            {/* Atualizar Lista */}
            <button
              onClick={handleBuscarDados}
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              <FaSearch className="text-xl" />
              {loading ? 'Buscando...' : 'Atualizar Lista'}
            </button>

            {/* Sincronizar Pedidos Antigos */}
            <button
              onClick={handleSyncOldOrders}
              disabled={loadingSync}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              title="Buscar pedidos antigos no banco de dados e adicionar os elegíveis ao sorteio"
            >
              <FaSync className="text-xl" />
              {loadingSync ? 'Sincronizando...' : 'Sincronizar Pedidos'}
            </button>

            {/* Adicionar Cliente Manualmente */}
            <button
              onClick={() => setShowAdicionarManual(true)}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaUser className="text-xl" />
              Adicionar Cliente
            </button>

            {/* Configurar Regra */}
            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              title="Configurar regra do sorteio (itens ou valor mínimo)"
            >
              <FaCog className="text-xl" />
              Configurar Regra
            </button>
          </div>

          {/* Alerta de Status */}
          <div className={`mt-4 p-4 rounded-lg border-2 ${
            promocaoAtiva
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }`}>
            <p className={`text-sm font-semibold ${
              promocaoAtiva ? 'text-green-800' : 'text-red-800'
            }`}>
              {promocaoAtiva
                ? `✅ Promoção ATIVA - Novos pedidos ${sorteioConfig.regraTipo === 'itens' ? `com ${sorteioConfig.regraValor}+ itens` : `acima de R$ ${sorteioConfig.regraValor.toFixed(2)}`} estão sendo salvos automaticamente`
                : '⏸️ Promoção PAUSADA - Novos pedidos NÃO estão sendo salvos no banco de dados'}
            </p>
          </div>
        </div>

        {/* Botão de Sortear */}
        <div className="mb-6">
          <button
            onClick={handleSortear}
            disabled={loading || sorteioData.length === 0}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-6 rounded-xl font-bold text-2xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            <FaDice className="text-3xl" />
            Sortear Vencedor
          </button>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-md">
            <p className="font-semibold flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Instruções */}
        {!dataLoaded && !loading && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 mb-6 shadow-md">
            <h3 className="font-bold text-lg text-blue-900 mb-3 flex items-center gap-2">
              <FaTicketAlt className="text-blue-600" />
              Como funciona
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span>Clique em <strong>"Buscar Dados"</strong> para carregar todos os pedidos elegíveis (5+ itens)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>Revise a lista de participantes na tabela abaixo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>Clique em <strong>"Sortear Vencedor"</strong> para realizar o sorteio com animação</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <span>O vencedor será salvo automaticamente no banco de dados</span>
              </li>
            </ul>
          </div>
        )}

        {/* Tabela de dados */}
        {dataLoaded && sorteioData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaTicketAlt />
                Pedidos Elegíveis ({sorteioData.length})
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                Apenas pedidos com 5 ou mais itens
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaTicketAlt className="text-purple-600" />
                        Pedido
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-blue-600" />
                        Cliente
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-green-600" />
                        Telefone
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaShoppingCart className="text-orange-600" />
                        Itens
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaDollarSign className="text-green-600" />
                        Valor
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaCalendar className="text-red-600" />
                        Data
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sorteioData.map((item, index) => (
                    <tr 
                      key={item.id || index}
                      className="hover:bg-purple-50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-bold text-purple-600">
                          #{item.orderNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-gray-800">
                          {item.clientName}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-gray-600 font-mono text-sm">
                          {item.clientPhone}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                          {item.totalItems}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-bold text-green-600">
                          R$ {item.totalValue?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(item.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rodapé da tabela */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                <p className="text-sm text-gray-600">
                  Total de <strong className="text-purple-600">{sorteioData.length}</strong> participante(s) elegível(is)
                </p>
                <p className="text-xs text-gray-500">
                  Última atualização: {new Date().toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estado vazio quando não há dados após buscar */}
        {dataLoaded && sorteioData.length === 0 && !error && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Nenhum pedido elegível
            </h3>
            <p className="text-gray-600 mb-6">
              Não há pedidos com 5 ou mais itens para participar do sorteio.
            </p>
            <button
              onClick={handleBuscarDados}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Buscar Novamente
            </button>
          </div>
        )}

        {/* TODO: Seção de vencedores anteriores */}
        {/* <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Vencedores Anteriores
          </h3>
          <p className="text-gray-600">Em breve...</p>
        </div> */}

        {/* TODO: Filtros por data */}
        {/* <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Filtrar por Período
          </h3>
          <p className="text-gray-600">Em breve...</p>
        </div> */}
      </div>

      {/* Modal para adicionar cliente manualmente */}
      {showAdicionarManual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaUser className="text-purple-600" />
              Adicionar Cliente ao Sorteio
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Número do Pedido *
                </label>
                <input
                  type="text"
                  value={clienteManual.orderNumber}
                  onChange={(e) => setClienteManual({...clienteManual, orderNumber: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: PEDIDO-123"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  value={clienteManual.clientName}
                  onChange={(e) => setClienteManual({...clienteManual, clientName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: João Silva"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="text"
                  value={clienteManual.clientPhone}
                  onChange={(e) => setClienteManual({...clienteManual, clientPhone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: 11999999999"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total de Itens * (mínimo 5)
                </label>
                <input
                  type="number"
                  min="5"
                  value={clienteManual.totalItems}
                  onChange={(e) => setClienteManual({...clienteManual, totalItems: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: 12"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valor Total (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={clienteManual.totalValue}
                  onChange={(e) => setClienteManual({...clienteManual, totalValue: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: 120.00"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAdicionarManual(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionarCliente}
                disabled={loadingAdicionar}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50"
              >
                {loadingAdicionar ? 'Adicionando...' : 'Adicionar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de animação do sorteio */}
      {showAnimation && (
        <SorteioAnimation 
          entries={sorteioData}
          onClose={() => setShowAnimation(false)}
        />
      )}

      {/* Modal de Configuração */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaCog className="text-indigo-600" />
                Configurar Regra do Sorteio
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Fechar modal"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Regra
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="regraTipo"
                      value="itens"
                      checked={sorteioConfig.regraTipo === 'itens'}
                      onChange={(e) => setSorteioConfig({...sorteioConfig, regraTipo: e.target.value})}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-gray-700">Por Quantidade de Itens</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="regraTipo"
                      value="valor"
                      checked={sorteioConfig.regraTipo === 'valor'}
                      onChange={(e) => setSorteioConfig({...sorteioConfig, regraTipo: e.target.value})}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-gray-700">Por Valor da Compra</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {sorteioConfig.regraTipo === 'itens' 
                    ? `Quantidade Mínima de Itens * (atual: ${sorteioConfig.regraValor})`
                    : `Valor Mínimo da Compra (R$) * (atual: ${sorteioConfig.regraValor.toFixed(2)})`}
                </label>
                <input
                  type="number"
                  min="1"
                  step={sorteioConfig.regraTipo === 'valor' ? "0.01" : "1"}
                  value={sorteioConfig.regraValor}
                  onChange={(e) => setSorteioConfig({...sorteioConfig, regraValor: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={sorteioConfig.regraTipo === 'itens' ? "Ex: 5" : "Ex: 100.00"}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {sorteioConfig.regraTipo === 'itens' 
                    ? 'Pedidos com este número de itens ou mais serão elegíveis para o sorteio'
                    : 'Pedidos com valor igual ou superior a este valor serão elegíveis para o sorteio'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarConfig}
                disabled={loadingConfig}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingConfig ? 'Salvando...' : 'Salvar Configuração'}
              </button>
            </div>
          </div>
        </div>
      )}

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
        variant={confirmModal.variant || "warning"}
      />
    </div>
  );
}

