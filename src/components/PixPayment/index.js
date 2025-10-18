import React, { useState, useContext, useEffect } from 'react';
import QRCode from 'qrcode';
import { ShopContext } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { createOrder } from '../../firebase/orders';

const PixPayment = () => {
  const { cart, showToast, saveOrderToFirestore } = useContext(ShopContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [nameError, setNameError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [pixCopyPaste, setPixCopyPaste] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const PIX_KEY = '12819359647';
  const MERCHANT_NAME = 'Sua Loja';
  const CITY = 'LAJINHA';

  const calculateCartTotal = () => {
    const subtotal = cart.reduce(
      (acc, item) => acc + (parseFloat(item.preco || 0) * (item.qty || 1)),
      0
    );
    return subtotal + 5; // taxa de entrega
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const generateOrderId = () => `PIX${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

  // Função auxiliar para adicionar tag ID + tamanho + valor
  const addEMVTag = (id, value) => {
    const length = value.length.toString().padStart(2, '0');
    return `${id}${length}${value}`;
  };

  // Função para calcular CRC16 CCITT
  const crc16CCITTFalse = (str) => {
    let crc = 0xFFFF;
    const strlen = str.length;
    
    for (let c = 0; c < strlen; c++) {
      crc ^= str.charCodeAt(c) << 8;
      for (let i = 0; i < 8; i++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
      }
    }
    
    const hex = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    return hex;
  };

  const generatePixPayload = async () => {
    if (!user) {
      showToast('Você precisa estar logado para fazer um pedido', 'error');
      navigate('/login');
      return;
    }

    if (!user.uid) {
      showToast('Erro de autenticação. Faça login novamente.', 'error');
      navigate('/login');
      return;
    }

    if (!clientName.trim()) {
      setNameError('Nome é obrigatório para continuar');
      return;
    }
    if (clientName.trim().length < 2) {
      setNameError('Nome deve ter pelo menos 2 caracteres');
      return;
    }
    setNameError('');
    setIsLoading(true);

    const total = calculateCartTotal();
    const newOrderId = generateOrderId();
    setOrderId(newOrderId);

    try {
      // Formata o valor com 2 casas decimais
      const amount = total.toFixed(2);
      
      // Cria o TxID (máximo 25 caracteres)
      const txid = newOrderId.substring(0, 25);
      
      // Monta o Merchant Account Information (ID 26) com sub-campos
      const gui = addEMVTag('00', 'BR.GOV.BCB.PIX'); // GUI
      const key = addEMVTag('01', PIX_KEY); // Chave PIX
      const merchantAccount = addEMVTag('26', gui + key);
      
      // Monta o Additional Data Field (ID 62) com sub-campos
      const txidField = addEMVTag('05', txid); // TxID
      const additionalData = addEMVTag('62', txidField);
      
      // Monta o payload sem o CRC
      let payload = '';
      payload += addEMVTag('00', '01'); // Payload Format Indicator
      payload += merchantAccount; // Merchant Account Information
      payload += addEMVTag('52', '0000'); // Merchant Category Code
      payload += addEMVTag('53', '986'); // Transaction Currency (986 = BRL)
      payload += addEMVTag('54', amount); // Transaction Amount
      payload += addEMVTag('58', 'BR'); // Country Code
      payload += addEMVTag('59', MERCHANT_NAME); // Merchant Name
      payload += addEMVTag('60', CITY); // Merchant City
      payload += additionalData; // Additional Data Field
      payload += '6304'; // CRC16 placeholder
      
      // Calcula e adiciona o CRC16
      const crc = crc16CCITTFalse(payload);
      payload += crc;

      console.log('Payload PIX gerado:', payload);
      console.log('Tamanho do payload:', payload.length);

      // Gera QR Code em base64
      const url = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 300
      });
      
      setQrCodeUrl(url);
      setPixCopyPaste(payload);

      // Salva pedido no Firestore usando o novo sistema
      const orderData = {
        userId: user.uid,
        total,
        subtotal: total - 5,
        frete: 5,
        items: cart.map((item) => ({
          id: item.id,
          nome: item.titulo || item.nome,
          quantidade: item.qty || 1,
          precoUnitario: item.preco || 0,
          subtotal: (item.preco || 0) * (item.qty || 1)
        })),
        endereco: {
          nome: clientName.trim(),
          rua: clientAddress.trim(),
          telefone: clientPhone.trim()
        },
        paymentReference: newOrderId,
        qrData: payload,
        metadata: {
          pixKey: PIX_KEY,
          merchantName: MERCHANT_NAME,
          originalOrderId: newOrderId
        }
      };

      console.log('Dados do pedido:', orderData);
      console.log('Usuário UID:', user.uid);
      
      const orderResult = await createOrder(orderData);
      
      if (orderResult.success) {
        showToast('✅ Pedido criado! QR Code gerado com sucesso!', 'success');
        // Não redireciona, mantém na tela para o usuário ver o QR Code
      } else {
        showToast('⚠️ Erro ao criar pedido: ' + orderResult.error, 'error');
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      showToast('❌ Erro ao gerar QR Code. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (!pixCopyPaste) {
      showToast('⚠️ Gere o QR Code primeiro!', 'warning');
      return;
    }
    
    navigator.clipboard.writeText(pixCopyPaste).then(() => {
      showToast('✅ Código PIX copiado! Cole no seu app de pagamento.', 'success');
    }).catch((err) => {
      console.error('Erro ao copiar:', err);
      showToast('❌ Erro ao copiar. Tente novamente.', 'error');
    });
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const cartTotal = calculateCartTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">💳 Pagamento Pix</h1>
        <p className="text-gray-600 mb-6">Gere seu QR Code para pagamento instantâneo</p>

        {/* Resumo do Pedido */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="text-green-800 font-semibold mb-3">🛒 Resumo do Pedido</h3>
          <div className="space-y-1 mb-2">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="truncate flex-1 mr-2">{item.titulo} x{item.qty}</span>
                <span className="font-medium">{formatCurrency(parseFloat(item.preco || 0) * (item.qty || 1))}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-green-300 pt-2 mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Subtotal:</span>
              <span>{formatCurrency(cartTotal - 5)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Entrega:</span>
              <span>{formatCurrency(5)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-green-800">
              <span>Total:</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
          </div>
        </div>

        {/* Dados do Cliente */}
        <div className={`border rounded-lg p-4 mb-6 ${nameError ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
          <h3 className={`font-semibold mb-3 ${nameError ? 'text-red-800' : 'text-blue-800'}`}>👤 Dados do Cliente</h3>
          <input
            type="text"
            placeholder="Nome completo *"
            value={clientName}
            onChange={(e) => {
              setClientName(e.target.value);
              if (nameError) setNameError('');
            }}
            className={`w-full p-3 rounded-lg mb-3 border-2 focus:outline-none focus:ring-2 ${
              nameError 
                ? 'border-red-500 focus:ring-red-300' 
                : 'border-gray-200 focus:ring-blue-300'
            }`}
          />
          <input
            type="tel"
            placeholder="Telefone/WhatsApp (opcional)"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full p-3 rounded-lg mb-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <textarea
            placeholder="Endereço completo (Rua, número, bairro, cidade)"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            className="w-full p-3 rounded-lg border-2 border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            rows="3"
          />
          {nameError && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{nameError}</span>
            </div>
          )}
        </div>

        {/* Botão Gerar QR Code */}
        {!qrCodeUrl && (
          <button
            onClick={generatePixPayload}
            disabled={isLoading || cart.length === 0}
            className="w-full py-4 mb-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Gerando QR Code...
              </span>
            ) : (
              '📱 Gerar QR Code Pix'
            )}
          </button>
        )}

        {/* QR Code e Ações */}
        {qrCodeUrl && (
          <div className="mt-6 space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200">
              <p className="text-sm text-gray-700 mb-3 font-medium">
                ✅ Pedido #{orderId}
              </p>
              <img 
                src={qrCodeUrl} 
                alt="QR Code Pix" 
                className="mx-auto rounded-lg shadow-lg border-4 border-white" 
              />
              <p className="text-xs text-gray-600 mt-3">
                Escaneie o QR Code ou use o Pix Copia e Cola
              </p>
            </div>

            <button
              onClick={handleCopyPix}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>📋</span>
              <span>Copiar Código PIX (Copia e Cola)</span>
            </button>

            {pixCopyPaste && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-2 font-medium">Código PIX:</p>
                <code className="text-xs text-gray-700 break-all block bg-white p-2 rounded border">
                  {pixCopyPaste.substring(0, 50)}...
                </code>
              </div>
            )}

            <a
              href={`https://wa.me/5519997050303?text=${encodeURIComponent(
                `Olá! Realizei o pagamento do pedido ${orderId} no valor de ${formatCurrency(cartTotal)}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
            >
              <span>📱</span>
              <span>Enviar Comprovante via WhatsApp</span>
            </a>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-semibold mb-1">ℹ️ Instruções:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700">
                <li>Abra seu app de pagamento (banco ou carteira digital)</li>
                <li>Escaneie o QR Code ou cole o código PIX</li>
                <li>Confirme o pagamento</li>
                <li>Envie o comprovante via WhatsApp</li>
              </ol>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/carrinho')}
          className="mt-6 w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          ← Voltar ao Carrinho
        </button>
      </div>
    </div>
  );
};

export default PixPayment;