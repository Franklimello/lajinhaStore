import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getOrdersByUser, formatOrderDate } from "../../firebase/orders";
import { Link } from "react-router-dom";
import OrderStatusBadge from "../../components/OrderStatusBadge";

export default function MeusPedidos() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      loadPedidos();
    }
  }, [user]);

  const loadPedidos = async () => {
    try {
      setLoading(true);
      const result = await getOrdersByUser(user.uid);
      
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


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Meus Pedidos</h1>
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Voltar para a loja
            </Link>
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
              <p className="text-gray-600 mb-6">
                Você ainda não fez nenhum pedido. Que tal começar a comprar?
              </p>
              <Link 
                to="/" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ir para a loja
              </Link>
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
                      <Link 
                        to={`/pedido/${pedido.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Ver detalhes
                      </Link>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                      <span className="font-medium text-gray-700">Método de Pagamento:</span>
                      <span className="ml-2">
                        {pedido.paymentMethod === 'dinheiro' ? '💵 Dinheiro' : '📱 PIX'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Informações específicas para pagamento em dinheiro */}
                  {pedido.paymentMethod === 'dinheiro' && (pedido.valorPago || pedido.troco) && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-green-700">Valor Pago:</span>
                          <span className="ml-2 text-green-800 font-semibold">
                            R$ {(pedido.valorPago || 0)?.toFixed(2) || "0,00"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Troco:</span>
                          <span className={`ml-2 font-semibold ${(pedido.troco || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            R$ {(pedido.troco || 0)?.toFixed(2) || "0,00"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
