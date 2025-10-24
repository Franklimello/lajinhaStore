import { useState, useEffect } from "react";
import { useAdmin } from "../../hooks/useAdmin";
import { getAllOrders, updateOrderStatus, deleteOrder } from "../../firebase/orders";
import OrderStatusBadge from "../../components/OrderStatusBadge";
import { formatOrderDate } from "../../firebase/orders";

export default function AdminOrders() {
  const { isAdmin } = useAdmin();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState({});
  const [deleting, setDeleting] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  // Estado para controlar itens separados (marcados) - persistido no localStorage
  const [itemsSeparados, setItemsSeparados] = useState(() => {
    const saved = localStorage.getItem('itemsSeparados');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    if (isAdmin) {
      loadAllOrders();
    }
  }, [isAdmin]);

  // Salvar estado de itens separados no localStorage
  useEffect(() => {
    localStorage.setItem('itemsSeparados', JSON.stringify(itemsSeparados));
  }, [itemsSeparados]);

  const loadAllOrders = async () => {
    try {
      setLoading(true);
      const result = await getAllOrders();
      
      if (result.success) {
        setPedidos(result.pedidos);
      } else {
        setError("Erro ao carregar pedidos: " + result.error);
      }
    } catch (err) {
      setError("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdating(prev => ({ ...prev, [orderId]: true }));
      
      const result = await updateOrderStatus(orderId, newStatus);
      
      if (result.success) {
        // Atualiza o status localmente
        setPedidos(prev => prev.map(pedido => 
          pedido.id === orderId 
            ? { ...pedido, status: newStatus }
            : pedido
        ));
        alert("Status atualizado com sucesso!");
      } else {
        alert("Erro ao atualizar status: " + result.error);
      }
    } catch (error) {
      alert("Erro ao atualizar status");
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      setDeleting(prev => ({ ...prev, [orderId]: true }));
      
      const result = await deleteOrder(orderId);
      
      if (result.success) {
        // Remove o pedido da lista local
        setPedidos(prev => prev.filter(pedido => pedido.id !== orderId));
        alert("Pedido excluído com sucesso!");
        setShowDeleteConfirm(null);
      } else {
        alert("Erro ao excluir pedido: " + result.error);
      }
    } catch (error) {
      console.error("Erro ao excluir pedido:", error);
      alert("Erro ao excluir pedido: " + error.message);
    } finally {
      setDeleting(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const confirmDelete = (orderId) => {
    setShowDeleteConfirm(orderId);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  // Função para marcar/desmarcar item como separado
  const toggleItemSeparado = (pedidoId, itemIndex) => {
    const key = `${pedidoId}-${itemIndex}`;
    setItemsSeparados(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Função para verificar se item está separado
  const isItemSeparado = (pedidoId, itemIndex) => {
    const key = `${pedidoId}-${itemIndex}`;
    return itemsSeparados[key] || false;
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Pedidos</h1>
            <button
              onClick={loadAllOrders}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Atualizar
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {pedidos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum pedido encontrado
              </h3>
              <p className="text-gray-600">
                Não há pedidos para gerenciar no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidos.map((pedido) => (
                <div key={pedido.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Pedido #{pedido.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatOrderDate(pedido.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <OrderStatusBadge status={pedido.status} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-medium text-gray-700">Total:</span>
                      <span className="ml-2 text-green-600 font-semibold">
                        R$ {pedido.total?.toFixed(2) || "0,00"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Itens:</span>
                      <span className="ml-2">{pedido.items?.length || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Cliente:</span>
                      <span className="ml-2">{pedido.endereco?.nome || "N/A"}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Telefone:</span>
                      <span className="ml-2">{pedido.endereco?.telefone || "N/A"}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Endereço:</span>
                      <div className="ml-2 text-sm">
                        {pedido.endereco?.rua && (
                          <div>Rua: {pedido.endereco.rua}</div>
                        )}
                        {pedido.endereco?.numero && (
                          <div>Número: {pedido.endereco.numero}</div>
                        )}
                        {pedido.endereco?.bairro && (
                          <div>Bairro: {pedido.endereco.bairro}</div>
                        )}
                        {pedido.endereco?.cidade && (
                          <div>Cidade: {pedido.endereco.cidade}</div>
                        )}
                        {pedido.endereco?.referencia && (
                          <div>Referência: {pedido.endereco.referencia}</div>
                        )}
                        {!pedido.endereco?.rua && !pedido.endereco?.numero && !pedido.endereco?.bairro && !pedido.endereco?.cidade && (
                          <div>N/A</div>
                        )}
                      </div>
                    </div>
                    {pedido.horarioEntrega && (
                      <div>
                        <span className="font-medium text-gray-700">Horário de Entrega:</span>
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          🕐 {pedido.horarioEntrega}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-700">Pagamento:</span>
                      <span className={`ml-2 ${pedido.paymentMethod === 'dinheiro' ? 'text-green-600' : 'text-blue-600'}`}>
                        {pedido.paymentMethod === 'dinheiro' ? '💵 Dinheiro' : '📱 PIX'}
                      </span>
                    </div>
                    
                    {/* Informações específicas para pagamento em dinheiro */}
                    {pedido.paymentMethod === 'dinheiro' && (pedido.valorPago || pedido.troco) && (
                      <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                        <h6 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                          💰 Informações de Pagamento
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="bg-white p-2 rounded border border-green-100">
                            <span className="font-medium text-green-700">Valor Total:</span>
                            <div className="text-lg font-bold text-green-800">
                              R$ {(pedido.valorTotal || pedido.total)?.toFixed(2) || "0,00"}
                            </div>
                          </div>
                          <div className="bg-white p-2 rounded border border-green-100">
                            <span className="font-medium text-green-700">Valor Pago:</span>
                            <div className="text-lg font-bold text-blue-800">
                              R$ {(pedido.valorPago || 0)?.toFixed(2) || "0,00"}
                            </div>
                          </div>
                          <div className="bg-white p-2 rounded border border-green-100">
                            <span className="font-medium text-green-700">Troco:</span>
                            <div className={`text-lg font-bold ${(pedido.troco || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              R$ {(pedido.troco || 0)?.toFixed(2) || "0,00"}
                            </div>
                          </div>
                        </div>
                        {(pedido.troco || 0) > 0 && (
                          <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                            <p className="text-yellow-800 text-xs">
                              ⚠️ <strong>Importante:</strong> O entregador deve ter troco de R$ {(pedido.troco || 0)?.toFixed(2)} disponível.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Itens do pedido */}
                  {pedido.items && pedido.items.length > 0 && (
                    <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-gray-800 flex items-center gap-2 text-base">
                        🛒 Itens do Pedido
                      </h5>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Separados: {pedido.items.filter((_, idx) => isItemSeparado(pedido.id, idx)).length} / {pedido.items.length}
                        </span>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          pedido.items.filter((_, idx) => isItemSeparado(pedido.id, idx)).length === pedido.items.length
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {pedido.items.filter((_, idx) => isItemSeparado(pedido.id, idx)).length === pedido.items.length
                            ? '✅ Completo'
                            : '⏳ Em separação'}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 bg-white rounded-lg border border-gray-200 p-3">
                      {pedido.items.map((item, index) => {
                        const separado = isItemSeparado(pedido.id, index);
                        return (
                          <div 
                            key={index} 
                            className={`flex items-start gap-3 py-2 border-b border-gray-100 last:border-0 transition-all duration-200 ${
                              separado ? 'bg-green-50 opacity-60' : ''
                            }`}
                          >
                            {/* Checkbox para marcar item como separado */}
                            <div className="flex-shrink-0 pt-1">
                              <button
                                onClick={() => toggleItemSeparado(pedido.id, index)}
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                                  separado 
                                    ? 'bg-green-500 border-green-500' 
                                    : 'bg-white border-gray-300 hover:border-green-400'
                                }`}
                                title={separado ? 'Marcar como não separado' : 'Marcar como separado'}
                              >
                                {separado && (
                                  <svg 
                                    className="w-4 h-4 text-white" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round" 
                                      strokeWidth={3} 
                                      d="M5 13l4 4L19 7" 
                                    />
                                  </svg>
                                )}
                              </button>
                            </div>

                            <div className="flex-1 min-w-0 pr-3">
                              <p className={`text-gray-800 font-semibold text-sm leading-tight ${
                                separado ? 'line-through' : ''
                              }`}>
                                {item.nome}
                              </p>
                              {item.corte && (
                                <p className="text-xs text-red-600 font-semibold mt-1 bg-red-50 inline-block px-2 py-0.5 rounded">
                                  🥩 Corte: {item.corte}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Qtd: {item.quantidade}
                                </span>
                                <span className="text-xs text-gray-500">
                                  R$ {(item.subtotal / item.quantidade).toFixed(2)} un.
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className={`text-base font-bold text-green-600 ${
                                separado ? 'line-through' : ''
                              }`}>
                                R$ {item.subtotal?.toFixed(2) || "0,00"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  )}

                  {/* Controles de Status */}
                  <div className="border-t pt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Atualizar Status:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Pendente", "Aguardando Pagamento", "Pago", "Em Separação", "Enviado", "Entregue", "Cancelado"].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(pedido.id, status)}
                          disabled={updating[pedido.id] || pedido.status === status}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            pedido.status === status
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          } ${updating[pedido.id] ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {updating[pedido.id] ? "..." : status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Botão de Exclusão */}
                  <div className="border-t pt-3 mt-3">
                    <button
                      onClick={() => confirmDelete(pedido.id)}
                      disabled={deleting[pedido.id]}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {deleting[pedido.id] ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Excluindo...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Excluir Pedido
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Confirmar Exclusão</h3>
                <p className="text-sm text-gray-500">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Tem certeza que deseja excluir este pedido? Todos os dados relacionados serão permanentemente removidos.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteOrder(showDeleteConfirm)}
                disabled={deleting[showDeleteConfirm]}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting[showDeleteConfirm] ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
