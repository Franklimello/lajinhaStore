import React, { useState, useContext } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { useNavigate } from 'react-router-dom';

const PixPayment = () => {
  const { cart, showToast } = useContext(ShopContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const PIX_KEY = '12819359647';
  const MERCHANT_NAME = 'Sua Loja';

  // Calcula o total do carrinho
  const calculateCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.preco || item.price || 0);
      const quantity = parseInt(item.qty || 1);
      return total + (price * quantity);
    }, 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const generateOrderId = () => {
    return 'PIX-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const generatePixPayload = (amount, pixKey, merchantName, orderId) => {
    // Formato simplificado do payload Pix com ID do pedido
    return `pix:${pixKey}:${amount}:${merchantName}:${orderId}`;
  };

  const saveOrderToLocalStorage = (orderData) => {
    try {
      const existingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      existingOrders.push(orderData);
      localStorage.setItem('pendingOrders', JSON.stringify(existingOrders));
      
      // Notifica o administrador (simulado)
      showNotificationToAdmin(orderData);
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      return false;
    }
  };

  const showNotificationToAdmin = (orderData) => {
    // Simula notificação para o administrador
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('💰 Novo Pedido Pix!', {
        body: `Pedido ${orderData.id} - ${formatCurrency(orderData.total)}`,
        icon: '/favicon.ico'
      });
    }
    
    // Log no console para desenvolvimento
    console.log('🔔 NOVO PEDIDO PIX:', orderData);
  };

  const handleGenerateQRCode = () => {
    const cartTotal = calculateCartTotal();
    
    if (cartTotal <= 0) {
      alert('Carrinho vazio! Adicione produtos antes de gerar o pagamento.');
      return;
    }

    if (cart.length === 0) {
      alert('Carrinho vazio! Adicione produtos antes de gerar o pagamento.');
      return;
    }

    setIsLoading(true);
    setShowQRCode(false);

    // Gera ID único do pedido
    const newOrderId = generateOrderId();
    setOrderId(newOrderId);

    // Salva dados do pedido
    const orderData = {
      id: newOrderId,
      total: cartTotal,
      items: cart.map(item => ({
        id: item.id,
        titulo: item.titulo,
        preco: item.preco,
        qty: item.qty,
        fotosUrl: item.fotosUrl
      })),
      pixKey: PIX_KEY,
      merchantName: MERCHANT_NAME,
      status: 'pending',
      createdAt: new Date().toISOString(),
      paymentMethod: 'pix'
    };

    // Salva no localStorage
    const saved = saveOrderToLocalStorage(orderData);

    if (!saved) {
      alert('Erro ao processar pedido. Tente novamente.');
      setIsLoading(false);
      return;
    }

    // Simula um pequeno delay para mostrar o loading
    setTimeout(() => {
      setIsLoading(false);
      setShowQRCode(true);
      showToast('Pedido gerado com sucesso! Aguarde confirmação do pagamento.', 'success');
    }, 1000);
  };

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }).catch(() => {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = PIX_KEY;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  };

  const cartTotal = calculateCartTotal();
  const pixPayload = showQRCode && orderId ? generatePixPayload(cartTotal, PIX_KEY, MERCHANT_NAME, orderId) : '';
  const qrCodeUrl = showQRCode ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixPayload)}` : '';

  // Solicita permissão para notificações
  React.useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">💳 Pagamento Pix</h1>
        <p className="text-gray-600 mb-6">Gere seu QR Code para pagamento instantâneo</p>
        
        {/* Valor do carrinho */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="text-green-800 font-semibold mb-2">🛒 Valor do Pedido</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(cartTotal)}</p>
          <p className="text-sm text-green-600 mt-1">{cart.length} {cart.length === 1 ? 'item' : 'itens'}</p>
        </div>

        {/* Lista resumida dos itens */}
        {cart.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-semibold text-gray-800 mb-2">📦 Itens do Pedido:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {cart.map((item, index) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate flex-1 mr-2">
                    {item.titulo} (x{item.qty || 1})
                  </span>
                  <span className="text-gray-800 font-medium">
                    {formatCurrency((parseFloat(item.preco || 0) * (item.qty || 1)))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chave Pix */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 font-mono text-sm text-gray-600">
          <strong>Chave Pix:</strong> {PIX_KEY}
        </div>

        {/* Botões */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleGenerateQRCode}
            disabled={cartTotal <= 0}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            📱 Gerar QR Code Pix
          </button>
          <button
            onClick={handleCopyPixKey}
            className="flex-1 bg-gray-600 text-white py-4 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
          >
            📋 Copiar Chave Pix
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Processando pedido...</p>
          </div>
        )}

        {/* Sucesso ao copiar */}
        {copySuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            ✅ Chave Pix copiada para a área de transferência!
          </div>
        )}

        {/* QR Code */}
        {showQRCode && (
          <div className="bg-gray-50 p-6 rounded-xl animate-fadeIn">
            <div className="bg-white p-5 rounded-lg mb-5 border-l-4 border-green-500">
              <h3 className="text-green-600 font-semibold mb-3 text-lg">💰 Informações do Pagamento</h3>
              <p className="mb-2"><strong>Pedido:</strong> <span className="text-lg font-bold text-gray-800">{orderId}</span></p>
              <p className="mb-2"><strong>Valor:</strong> <span className="text-2xl font-bold text-gray-800">{formatCurrency(cartTotal)}</span></p>
              <p className="mb-2"><strong>Chave Pix:</strong> {PIX_KEY}</p>
              <p className="mb-2"><strong>Beneficiário:</strong> {MERCHANT_NAME}</p>
            </div>
            
            <img
              src={qrCodeUrl}
              alt="QR Code Pix"
              className="max-w-xs mx-auto rounded-lg shadow-lg mb-4"
            />
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-sm font-medium">
                📱 Escaneie o QR Code com o app do seu banco para pagar
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-yellow-800 text-sm">
                ⏳ Após o pagamento, aguarde a confirmação. Você receberá uma notificação quando o pedido for confirmado.
              </p>
            </div>

            {/* Botão WhatsApp */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">📱 Enviar Comprovante</h4>
              <p className="text-green-700 text-sm mb-3">
                Após realizar o pagamento, envie o comprovante via WhatsApp para acelerar a confirmação:
              </p>
              <a
                href={`https://wa.me/5519997050303?text=${encodeURIComponent(`Olá! Realizei o pagamento do pedido ${orderId} no valor de ${formatCurrency(cartTotal)}. Segue o comprovante do Pix.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <span className="text-xl">📱</span>
                Enviar Comprovante via WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Botão consultar status */}
        {showQRCode && orderId && (
          <div className="mt-4">
            <button
              onClick={() => navigate(`/status-pedido/${orderId}`)}
              className="w-full py-3 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors duration-200"
            >
              🔍 Consultar Status do Pedido
            </button>
          </div>
        )}

        {/* Botão voltar */}
        <button
          onClick={() => navigate('/carrinho')}
          className="mt-6 w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
        >
          ← Voltar ao Carrinho
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease;
        }
      `}</style>
    </div>
  );
};

export default PixPayment;