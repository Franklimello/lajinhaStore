import { useState, useEffect } from 'react';
import { FaSearch, FaDice, FaTrophy, FaTicketAlt, FaCalendar, FaShoppingCart, FaDollarSign, FaUser, FaPhone, FaPause, FaPlay, FaTrash } from 'react-icons/fa';
import { getSorteioData, togglePromocao, limparParticipantes, isPromocaoAtiva, adicionarClienteManual } from '../../services/sorteioService';
import SorteioAnimation from '../../components/SorteioAnimation';

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
  const [clienteManual, setClienteManual] = useState({
    orderNumber: '',
    clientName: '',
    clientPhone: '',
    totalItems: '',
    totalValue: ''
  });

  // Buscar status da promoção ao carregar
  useEffect(() => {
    const fetchStatus = async () => {
      const status = await isPromocaoAtiva();
      setPromocaoAtiva(status);
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
      alert('Busque os dados primeiro ou não há pedidos elegíveis para sortear.');
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
    
    if (window.confirm(confirmMessage)) {
      setLoadingStatus(true);
      try {
        const result = await togglePromocao(novoStatus);
        if (result.success) {
          setPromocaoAtiva(novoStatus);
          alert(`✅ ${result.message}`);
        } else {
          alert(`❌ ${result.message}`);
        }
      } catch (error) {
        console.error('Erro ao alterar status:', error);
        alert('❌ Erro ao alterar status da promoção.');
      } finally {
        setLoadingStatus(false);
      }
    }
  };

  // Função para limpar participantes
  const handleLimparParticipantes = async () => {
    const confirmMessage = 
      '⚠️ ATENÇÃO! Esta ação irá EXCLUIR TODOS os participantes do sorteio atual.\n\n' +
      'Esta ação NÃO pode ser desfeita!\n\n' +
      'Deseja realmente continuar?';
    
    if (window.confirm(confirmMessage)) {
      setLoadingLimpar(true);
      try {
        const result = await limparParticipantes();
        if (result.success) {
          alert(`✅ ${result.message}`);
          // Atualizar a lista
          setSorteioData([]);
          setDataLoaded(false);
        } else {
          alert(`❌ ${result.message}`);
        }
      } catch (error) {
        console.error('Erro ao limpar participantes:', error);
        alert('❌ Erro ao limpar participantes.');
      } finally {
        setLoadingLimpar(false);
      }
    }
  };

  // Função para adicionar cliente manualmente
  const handleAdicionarCliente = async () => {
    if (!clienteManual.orderNumber || !clienteManual.clientName || !clienteManual.clientPhone || !clienteManual.totalItems || !clienteManual.totalValue) {
      alert('❌ Todos os campos são obrigatórios!');
      return;
    }

    if (parseInt(clienteManual.totalItems) < 5) {
      alert('❌ O cliente deve ter pelo menos 5 itens para participar do sorteio!');
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
        alert('✅ Cliente adicionado ao sorteio com sucesso!');
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
        alert(`❌ Erro ao adicionar cliente: ${resultado.message}`);
      }
    } catch (error) {
      alert(`❌ Erro inesperado: ${error.message}`);
    } finally {
      setLoadingAdicionar(false);
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
                Gerencie e realize sorteios entre clientes com pedidos de 5+ itens
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
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            {/* Adicionar Cliente Manualmente */}
            <button
              onClick={() => setShowAdicionarManual(true)}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaUser className="text-xl" />
              Adicionar Cliente
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
                ? '✅ Promoção ATIVA - Novos pedidos com 5+ itens estão sendo salvos automaticamente'
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
    </div>
  );
}

