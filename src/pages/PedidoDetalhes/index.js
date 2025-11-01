import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getOrderById, formatOrderDate } from "../../firebase/orders";
import OrderStatusBadge from "../../components/OrderStatusBadge";
import QRCode from "qrcode";
import AlertModal from "../../components/AlertModal";

export default function PedidoDetalhes() {
  const { id } = useParams();
  const { user } = useAuth();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState({ isOpen: false, message: "", type: "info" });

  useEffect(() => {
    if (id) {
      loadPedido();
    }
  }, [id]);

  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const loadPedido = async () => {
    try {
      setLoading(true);
      const result = await getOrderById(id);
      
      if (result.success) {
        // Verifica se o pedido pertence ao usuário logado
        if (result.pedido.userId !== user?.uid) {
          setError("Você não tem permissão para visualizar este pedido.");
          return;
        }
        setPedido(result.pedido);
        
        // Gera QR code se existir qrData
        if (result.pedido.qrData) {
          try {
            const qrUrl = await QRCode.toDataURL(result.pedido.qrData, {
              errorCorrectionLevel: 'M',
              margin: 1,
              width: 300
            });
            setQrCodeUrl(qrUrl);
          } catch (qrError) {
            console.error("Erro ao gerar QR code:", qrError);
          }
        }
      } else {
        setError("Erro ao carregar pedido: " + result.error);
      }
    } catch (err) {
      setError("Erro ao carregar pedido");
    } finally {
      setLoading(false);
    }
  };

  const handleReenviarQR = async () => {
    if (pedido?.qrData) {
      try {
        const qrUrl = await QRCode.toDataURL(pedido.qrData, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 300
        });
        setQrCodeUrl(qrUrl);
        setAlert({ isOpen: true, message: "QR Code reenviado com sucesso!", type: "success" });
      } catch (error) {
        console.error("Erro ao reenviar QR code:", error);
        setAlert({ isOpen: true, message: "Erro ao reenviar QR code", type: "error" });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              to="/meus-pedidos" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar para Meus Pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pedido não encontrado</h2>
            <p className="text-gray-600 mb-6">O pedido solicitado não foi encontrado.</p>
            <Link 
              to="/meus-pedidos" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar para Meus Pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Pedido #{pedido.id.slice(-8).toUpperCase()}
            </h1>
            <Link 
              to="/meus-pedidos" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Voltar para Meus Pedidos
            </Link>
          </div>

          {/* Status do Pedido */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <OrderStatusBadge status={pedido.status} size="large" />
            </div>
            <p className="text-sm text-gray-600">
              Pedido realizado em {formatOrderDate(pedido.createdAt)}
            </p>
          </div>

          {/* Informações de Pagamento */}
          {pedido.paymentMethod === 'dinheiro' ? (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">💵 Pagamento em Dinheiro</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-600 mb-1">Valor Total</p>
                  <p className="text-xl font-bold text-green-800">
                    R$ {Number(pedido.valorTotal || pedido.total || 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-600 mb-1">Valor Pago</p>
                  <p className="text-xl font-bold text-blue-800">
                    R$ {Number(pedido.valorPago || 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-600 mb-1">Troco</p>
                  <p className={`text-xl font-bold ${Number(pedido.troco || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {Number(pedido.troco || 0).toFixed(2)}
                  </p>
                </div>
              </div>
              {Number(pedido.troco || 0) > 0 && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ <strong>Importante:</strong> O entregador terá troco de R$ {Number(pedido.troco || 0).toFixed(2)} disponível.
                  </p>
                </div>
              )}
            </div>
          ) : qrCodeUrl ? (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💳 Pagamento PIX</h3>
              <div className="text-center">
                <img src={qrCodeUrl} alt="QR Code PIX" className="mx-auto mb-4 rounded-lg shadow-lg" />
                <button
                  onClick={handleReenviarQR}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 Reenviar QR Code
                </button>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações do Pedido */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Pedido</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total do Pedido:</span>
                  <span className="font-semibold text-green-600">
                    R$ {Number(pedido.total || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Método de Pagamento:</span>
                  <span className="font-medium">
                    {pedido.paymentMethod === 'dinheiro' ? '💵 Dinheiro' : '📱 PIX'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantidade de Itens:</span>
                  <span className="font-medium">{pedido.items?.length || 0}</span>
                </div>
                {pedido.observacoes && (
                  <div>
                    <span className="text-gray-600">Observações:</span>
                    <p className="text-sm text-gray-800 mt-1">{pedido.observacoes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Endereço de Entrega */}
            {pedido.endereco && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Endereço de Entrega</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium">{pedido.endereco.nome}</p>
                  <p className="text-gray-600">{pedido.endereco.rua}, {pedido.endereco.numero}</p>
                  {pedido.endereco.complemento && (
                    <p className="text-gray-600">{pedido.endereco.complemento}</p>
                  )}
                  <p className="text-gray-600">
                    {pedido.endereco.bairro} - {pedido.endereco.cidade}/{pedido.endereco.estado}
                  </p>
                  <p className="text-gray-600">CEP: {pedido.endereco.cep}</p>
                </div>
              </div>
            )}
          </div>

          {/* Itens do Pedido */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Itens do Pedido</h3>
            <div className="space-y-3">
              {pedido.items?.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  {item.imagem && (
                    <img 
                      src={item.imagem} 
                      alt={item.titulo || item.nome}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {item.titulo || item.nome}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Quantidade: {item.qty || 1}
                    </p>
                    <p className="text-sm text-gray-600">
                      Preço unitário: R$ {Number(item.preco || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      R$ {(Number(item.preco || 0) * Number(item.qty || 1)).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo Final */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total do Pedido:</span>
              <span className="text-2xl font-bold text-green-600">
                R$ {Number(pedido.total || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.type === "success" ? "Sucesso" : alert.type === "error" ? "Erro" : "Aviso"}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
}
