import React, { useState, useContext, useEffect } from 'react';
import QRCode from 'qrcode';
import { ShopContext } from '../../context/ShopContext';
import { useNavigate, Link } from 'react-router-dom';

const PixPayment = () => {
  const { cart, showToast } = useContext(ShopContext);
  const navigate = useNavigate();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
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
    
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  };

  const generatePixPayload = async () => {
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
      
      // Garante que a chave PIX tenha o tamanho correto no payload
      const pixKeyLength = PIX_KEY.length.toString().padStart(2, '0');
      const merchantNameLength = MERCHANT_NAME.length.toString().padStart(2, '0');
      const cityLength = CITY.length.toString().padStart(2, '0');
      
      // Cria o TxID (máximo 25 caracteres)
      const txid = newOrderId.substring(0, 25);
      const txidLength = txid.length.toString().padStart(2, '0');
      
      // Monta o Merchant Account Information (ID 26)
      const merchantAccountInfo = `0014BR.GOV.BCB.PIX01${pixKeyLength}${PIX_KEY}`;
      const merchantAccountLength = merchantAccountInfo.length.toString().padStart(2, '0');
      
      // Monta o Additional Data Field (ID 62)
      const additionalData = `05${txidLength}${txid}`;
      const additionalDataLength = additionalData.length.toString().padStart(2, '0');
      
      // Monta o payload sem o CRC
      let payload = '';
      payload += '00020126'; // Payload Format Indicator
      payload += `${merchantAccountLength}${merchantAccountInfo}`; // Merchant Account Information
      payload += '52040000'; // Merchant Category Code
      payload += '5303986'; // Transaction Currency (986 = BRL)
      payload += `54${amount.length.toString().padStart(2, '0')}${amount}`; // Transaction Amount
      payload += '5802BR'; // Country Code
      payload += `59${merchantNameLength}${MERCHANT_NAME}`; // Merchant Name
      payload += `60${cityLength}${CITY}`; // Merchant City
      payload += `62${additionalDataLength}${additionalData}`; // Additional Data Field
      payload += '6304'; // CRC16 placeholder
      
      // Calcula e adiciona o CRC16
      const crc = crc16CCITTFalse(payload);
      payload += crc;

      // Gera QR Code em base64
      const url = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 300
      });
      
      setQrCodeUrl(url);
      setPixCopyPaste(payload);

      // Salva pedido no localStorage
      const orderData = {
        id: newOrderId,
        total,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        items: cart.map((item) => ({
          id: item.id,
          titulo: item.titulo,
          preco: item.preco,
          qty: item.qty,
          fotosUrl: item.fotosUrl,
        })),
        pixKey: PIX_KEY,
        merchantName: MERCHANT_NAME,
        status: 'pending',
        createdAt: new Date().toISOString(),
        paymentMethod: 'pix',
        pixPayload: payload
      };
      
      const existingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      existingOrders.push(orderData);
      localStorage.setItem('pendingOrders', JSON.stringify(existingOrders));

      showToast('QR Code gerado com sucesso! Copie ou escaneie para pagar.', 'success');
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      showToast('Erro ao gerar QR Code. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPix = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copiado para área de transferência!', 'success');
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
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between text-sm mb-1">
              <span className="truncate">{item.titulo} x{item.qty}</span>
              <span>{formatCurrency(parseFloat(item.preco || 0) * (item.qty || 1))}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
            <span>Total:</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
        </div>

        {/* Dados do Cliente */}
        <div className={`border rounded-lg p-4 mb-6 ${nameError ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
          <h3 className={`font-semibold mb-3 ${nameError ? 'text-red-800' : 'text-blue-800'}`}>👤 Dados do Cliente</h3>
          <input
            type="text"
            placeholder="Nome completo"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className={`w-full p-3 rounded-lg mb-3 border-2 ${nameError ? 'border-red-500' : 'border-gray-200'}`}
          />
          <input
            type="tel"
            placeholder="Telefone/WhatsApp (opcional)"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full p-3 rounded-lg border-2 border-gray-200"
          />
          {nameError && <p className="text-red-600 text-sm mt-2">{nameError}</p>}
        </div>

        {/* Botões */}
        <button
          onClick={generatePixPayload}
          disabled={isLoading || cart.length === 0}
          className="w-full py-4 mb-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
        >
          {isLoading ? 'Gerando QR Code...' : '📱 Gerar QR Code Pix'}
        </button>

        {/* QR Code */}
        {qrCodeUrl && (
          <div className="mt-6">
            <img src={qrCodeUrl} alt="QR Code Pix" className="mx-auto mb-4 rounded-lg shadow-lg" />
            <button
              onClick={() => handleCopyPix(pixCopyPaste)}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 mb-4"
            >
              📋 Copiar Chave Pix "Copia e Cola"
            </button>
            <a
              href={`https://wa.me/5519997050303?text=${encodeURIComponent(
                `Olá! Realizei o pagamento do pedido ${orderId} no valor de ${formatCurrency(cartTotal)}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600"
            >
              📱 Enviar Comprovante via WhatsApp
            </a>
          </div>
        )}

        <button
          onClick={() => navigate('/carrinho')}
          className="mt-6 w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
        >
          ← Voltar ao Carrinho
        </button>
      </div>
    </div>
  );
};

export default PixPayment;