import React, { useState, useContext, useEffect } from 'react';
import QRCode from 'qrcode';
import { CartContext } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { appConfig } from '../../config/appConfig';
import { addSorteioData } from '../../services/sorteioService';
// import { createOrder } from '../../firebase/orders'; // Removido - não usado

const PixPayment = () => {
  const { cart, showToast, saveOrderToFirestore } = useContext(CartContext);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientRua, setClientRua] = useState('');
  const [clientNumero, setClientNumero] = useState('');
  const [clientBairro, setClientBairro] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientCidade, setClientCidade] = useState('');
  const [clientReferencia, setClientReferencia] = useState('');
  const [horarioEntrega, setHorarioEntrega] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [valorPago, setValorPago] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [pixCopyPaste, setPixCopyPaste] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  // Obter método de pagamento do localStorage ou URL params
  const paymentMethod = (() => {
    // Primeiro tenta obter da URL
    const urlParams = new URLSearchParams(location.search);
    const methodFromUrl = urlParams.get('method');
    
    // Depois tenta obter do localStorage
    const methodFromStorage = localStorage.getItem('selectedPaymentMethod');
    
    // Retorna o método encontrado ou 'pix' como padrão
    return methodFromUrl || methodFromStorage || 'pix';
  })();

  const PIX_KEY = appConfig.PIX_KEY;
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

  // Calcular troco
  const calcularTroco = () => {
    if (!valorPago || valorPago <= 0) return 0;
    const valorPagoNum = parseFloat(valorPago);
    const total = calculateCartTotal();
    return Math.max(0, valorPagoNum - total);
  };

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

    // 🔒 PROTEÇÃO CONTRA MÚLTIPLAS EXECUÇÕES
    if (isProcessing) {
      console.log('⚠️ Processamento já em andamento - ignorando chamada duplicada');
      return;
    }

    setIsProcessing(true);

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
    
    // Validação do telefone
    if (!clientPhone.trim()) {
      setPhoneError('Telefone é obrigatório para entrega');
      return;
    }
    if (clientPhone.trim().length < 10) {
      setPhoneError('Telefone deve ter pelo menos 10 dígitos');
      return;
    }
    setPhoneError('');
    
    // Validação dos campos de endereço
    if (!clientRua.trim()) {
      setAddressError('Rua é obrigatória para entrega');
      return;
    }
    if (!clientNumero.trim()) {
      setAddressError('Número é obrigatório para entrega');
      return;
    }
    if (!clientBairro.trim()) {
      setAddressError('Bairro é obrigatório para entrega');
      return;
    }
    if (!clientCidade.trim()) {
      setAddressError('Cidade é obrigatória para entrega');
      return;
    }
    setAddressError('');
    
    // Validação específica para pagamento em dinheiro
    if (paymentMethod === 'dinheiro') {
      if (!valorPago || parseFloat(valorPago) <= 0) {
        setNameError('Valor pago é obrigatório para pagamento em dinheiro');
        return;
      }
      if (parseFloat(valorPago) < calculateCartTotal()) {
        setNameError('Valor pago deve ser maior ou igual ao total do pedido');
        return;
      }
    }
    
    setNameError('');
    setIsLoading(true);

    const total = calculateCartTotal();
    const newOrderId = generateOrderId();
    setOrderId(newOrderId);

    try {
      let payload = null;
      
      // Se for pagamento PIX, gera o QR Code
      if (paymentMethod === 'pix') {
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
        let pixPayload = '';
        pixPayload += addEMVTag('00', '01'); // Payload Format Indicator
        pixPayload += merchantAccount; // Merchant Account Information
        pixPayload += addEMVTag('52', '0000'); // Merchant Category Code
        pixPayload += addEMVTag('53', '986'); // Transaction Currency (986 = BRL)
        pixPayload += addEMVTag('54', amount); // Transaction Amount
        pixPayload += addEMVTag('58', 'BR'); // Country Code
        pixPayload += addEMVTag('59', MERCHANT_NAME); // Merchant Name
        pixPayload += addEMVTag('60', CITY); // Merchant City
        pixPayload += additionalData; // Additional Data Field
        pixPayload += '6304'; // CRC16 placeholder
        
        // Calcula e adiciona o CRC16
        const crc = crc16CCITTFalse(pixPayload);
        pixPayload += crc;

        console.log('Payload PIX gerado:', pixPayload);
        console.log('Tamanho do payload:', pixPayload.length);

        // Gera QR Code em base64
        const url = await QRCode.toDataURL(pixPayload, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 300
        });
        
        setQrCodeUrl(url);
        setPixCopyPaste(pixPayload);
        payload = pixPayload;
      }

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
          subtotal: (item.preco || 0) * (item.qty || 1),
          ...(item.meatCut && { corte: item.meatCut }), // Informação do corte de carne
          ...(item.observacao && { observacao: item.observacao }) // Observações adicionais
        })),
        endereco: {
          nome: clientName.trim(),
          telefone: clientPhone.trim(),
          rua: clientRua.trim(),
          numero: clientNumero.trim(),
          bairro: clientBairro.trim(),
          cidade: clientCidade.trim(),
          referencia: clientReferencia.trim()
        },
        horarioEntrega: horarioEntrega || 'Não especificado',
        paymentMethod: paymentMethod,
        paymentReference: newOrderId,
        qrData: paymentMethod === 'pix' ? payload : null,
        // Informações específicas para pagamento em dinheiro
        ...(paymentMethod === 'dinheiro' && {
          valorPago: parseFloat(valorPago),
          troco: calcularTroco(),
          valorTotal: total
        }),
        metadata: {
          pixKey: PIX_KEY,
          merchantName: MERCHANT_NAME,
          originalOrderId: newOrderId
        }
      };

      console.log('Dados do pedido:', orderData);
      console.log('Usuário UID:', user.uid);
      
      const orderResult = await saveOrderToFirestore(orderData);
      
      // 🎉 INTEGRAÇÃO DO SISTEMA DE SORTEIO
      if (orderResult.success) {
        // Calcular total de itens (soma das quantidades)
        const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

        // Preparar dados para o sorteio
        const sorteioDataPayload = {
          orderNumber: newOrderId,
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          totalItems: totalItems,
          totalValue: total
        };

        // Tentar adicionar ao sorteio (só salva se totalItems >= 5)
        try {
          console.log('🎯 INICIANDO PROCESSO DE SORTEIO...');
          console.log('📊 Dados do pedido para sorteio:', sorteioDataPayload);
          console.log('📈 Total de itens calculado:', totalItems);
          
          const sorteioResult = await addSorteioData(sorteioDataPayload);
          
          console.log('📋 Resultado do sorteio:', sorteioResult);
          
          if (sorteioResult.eligible) {
            console.log('🎉 Cliente elegível para sorteio!', sorteioResult);
            // Mostrar mensagem ao cliente que ele está participando
            if (totalItems >= 5) {
              setTimeout(() => {
                showToast('🎉 Parabéns! Você está participando do nosso sorteio!', 'success');
              }, 2000);
            }
          } else {
            console.log('⚠️ Pedido não elegível para sorteio:', sorteioResult.message);
            console.log('🔍 Motivo específico:', {
              eligible: sorteioResult.eligible,
              promocaoPausada: sorteioResult.promocaoPausada,
              alreadyExists: sorteioResult.alreadyExists,
              loopDetected: sorteioResult.loopDetected
            });
          }
        } catch (sorteioError) {
          console.error('❌ Erro ao adicionar ao sorteio:', sorteioError);
          console.error('📊 Dados que causaram o erro:', sorteioDataPayload);
          // Não interrompe o fluxo - o pedido já foi salvo com sucesso
        }

        // Continua o fluxo normal...
        if (paymentMethod === 'pix') {
          showToast('✅ Pedido criado! QR Code gerado com sucesso!', 'success');
        } else {
          showToast('✅ Pedido criado! Pagamento será feito na entrega em dinheiro.', 'success');
        }
        // Não redireciona, mantém na tela para o usuário ver o QR Code ou informações
      } else {
        showToast('⚠️ Erro ao criar pedido: ' + orderResult.error, 'error');
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      showToast('❌ Erro ao gerar QR Code. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
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

  // useEffect removido - permissão de notificações agora é solicitada apenas no componente NotificationPermission

  const cartTotal = calculateCartTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">💳 Finalizar Pedido</h1>
        <p className="text-gray-600 mb-6">Escolha seu método de pagamento e finalize seu pedido</p>

        {/* Resumo do Pedido */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="text-green-800 font-semibold mb-3">🛒 Resumo do Pedido</h3>
          <div className="space-y-2 mb-2">
            {cart.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between text-sm">
                  <span className="truncate flex-1 mr-2">{item.titulo} x{item.qty}</span>
                  <span className="font-medium">{formatCurrency(parseFloat(item.preco || 0) * (item.qty || 1))}</span>
                </div>
                {item.meatCut && (
                  <div className="text-xs text-red-600 font-semibold ml-2 bg-red-50 inline-block px-2 py-0.5 rounded mt-0.5">
                    🥩 Corte: {item.meatCut}
                  </div>
                )}
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

        {/* Método de Pagamento Selecionado */}
        <div className={`mb-6 p-4 rounded-xl ${
          paymentMethod === 'pix' 
            ? 'bg-blue-50 border border-blue-200' 
            : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center">
            <span className="text-2xl mr-3">
              {paymentMethod === 'pix' ? '📱' : '💵'}
            </span>
            <div>
              <h3 className={`font-semibold ${
                paymentMethod === 'pix' ? 'text-blue-800' : 'text-green-800'
              }`}>
                {paymentMethod === 'pix' ? 'Pagamento via PIX' : 'Pagamento em Dinheiro'}
              </h3>
              <p className={`text-sm ${
                paymentMethod === 'pix' ? 'text-blue-600' : 'text-green-600'
              }`}>
                {paymentMethod === 'pix' 
                  ? 'Você receberá um QR Code para pagamento instantâneo'
                  : 'O pagamento será feito em dinheiro na entrega'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Dados do Cliente */}
        <div className={`border rounded-lg p-4 mb-6 ${(nameError || phoneError || addressError) ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
          <h3 className={`font-semibold mb-3 ${(nameError || phoneError || addressError) ? 'text-red-800' : 'text-blue-800'}`}>👤 Dados do Cliente</h3>
          
          {/* Nome */}
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
          
          {/* Telefone */}
          <input
            type="tel"
            placeholder="Telefone/WhatsApp *"
            value={clientPhone}
            onChange={(e) => {
              setClientPhone(e.target.value);
              if (phoneError) setPhoneError('');
            }}
            className={`w-full p-3 rounded-lg mb-3 border-2 focus:outline-none focus:ring-2 ${
              phoneError 
                ? 'border-red-500 focus:ring-red-300' 
                : 'border-gray-200 focus:ring-blue-300'
            }`}
          />
          
          {/* Endereço - Rua e Número */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Rua *"
              value={clientRua}
              onChange={(e) => {
                setClientRua(e.target.value);
                if (addressError) setAddressError('');
              }}
              className={`p-3 rounded-lg border-2 focus:outline-none focus:ring-2 ${
                addressError 
                  ? 'border-red-500 focus:ring-red-300' 
                  : 'border-gray-200 focus:ring-blue-300'
              }`}
            />
            <input
              type="text"
              placeholder="Número *"
              value={clientNumero}
              onChange={(e) => {
                setClientNumero(e.target.value);
                if (addressError) setAddressError('');
              }}
              className={`p-3 rounded-lg border-2 focus:outline-none focus:ring-2 ${
                addressError 
                  ? 'border-red-500 focus:ring-red-300' 
                  : 'border-gray-200 focus:ring-blue-300'
              }`}
            />
          </div>
          
          {/* Bairro e Cidade */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Bairro *"
              value={clientBairro}
              onChange={(e) => {
                setClientBairro(e.target.value);
                if (addressError) setAddressError('');
              }}
              className={`p-3 rounded-lg border-2 focus:outline-none focus:ring-2 ${
                addressError 
                  ? 'border-red-500 focus:ring-red-300' 
                  : 'border-gray-200 focus:ring-blue-300'
              }`}
            />
            <input
              type="text"
              placeholder="Cidade *"
              value={clientCidade}
              onChange={(e) => {
                setClientCidade(e.target.value);
                if (addressError) setAddressError('');
              }}
              className={`p-3 rounded-lg border-2 focus:outline-none focus:ring-2 ${
                addressError 
                  ? 'border-red-500 focus:ring-red-300' 
                  : 'border-gray-200 focus:ring-blue-300'
              }`}
            />
          </div>
          
          {/* Referência */}
          <input
            type="text"
            placeholder="Ponto de referência (opcional)"
            value={clientReferencia}
            onChange={(e) => setClientReferencia(e.target.value)}
            className="w-full p-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          
          {/* Mensagens de erro */}
          {nameError && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{nameError}</span>
            </div>
          )}
          {phoneError && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{phoneError}</span>
            </div>
          )}
          {addressError && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{addressError}</span>
            </div>
          )}
        </div>

        {/* Horário de Entrega */}
        <div className="border rounded-lg p-4 mb-6 bg-purple-50 border-purple-200">
          <h3 className="font-semibold mb-3 text-purple-800 flex items-center gap-2">
            🕐 Melhor Horário para Entrega
          </h3>
          <input
            type="text"
            placeholder="Ex: 14h, 18h30, após 15h, manhã..."
            value={horarioEntrega}
            onChange={(e) => setHorarioEntrega(e.target.value)}
            className="w-full p-3 rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800 font-medium"
          />
          <p className="text-xs text-purple-700 mt-2">
            💡 Digite o melhor horário para receber sua entrega
          </p>
        </div>

        {/* Campo de Valor Pago - Apenas para Dinheiro */}
        {paymentMethod === 'dinheiro' && (
          <div className="border rounded-lg p-4 mb-6 bg-green-50 border-green-200">
            <h3 className="font-semibold mb-3 text-green-800">💰 Valor do Pagamento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Troco para quanto?
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 30.00"
                  value={valorPago}
                  onChange={(e) => setValorPago(e.target.value)}
                  className="w-full p-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>
              
              {valorPago && parseFloat(valorPago) > 0 && (
                <div className="bg-white rounded-lg p-4 border border-green-300">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total do pedido:</span>
                      <span className="font-medium">{formatCurrency(calculateCartTotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Valor pago:</span>
                      <span className="font-medium">{formatCurrency(parseFloat(valorPago) || 0)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span className={calcularTroco() > 0 ? 'text-green-600' : 'text-red-600'}>
                          {calcularTroco() > 0 ? 'Troco:' : 'Valor insuficiente:'}
                        </span>
                        <span className={calcularTroco() > 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(Math.abs(calcularTroco()))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
                {paymentMethod === 'pix' ? 'Gerando QR Code...' : 'Finalizando Pedido...'}
              </span>
            ) : (
              paymentMethod === 'pix' ? '📱 Gerar QR Code Pix' : '💵 Finalizar Pedido (Dinheiro)'
            )}
          </button>
        )}

        {/* QR Code e Ações - Apenas para PIX */}
        {qrCodeUrl && paymentMethod === 'pix' && (
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

        {/* Informações do Pedido - Pagamento em Dinheiro */}
        {orderId && paymentMethod === 'dinheiro' && (
          <div className="mt-6 space-y-4">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200">
              <div className="text-center">
                <div className="text-4xl mb-3">💵</div>
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Pedido Confirmado!
                </h3>
                <p className="text-green-700 mb-4">
                  Seu pedido foi criado com sucesso. O pagamento será feito em dinheiro na entrega.
                </p>
                
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-2">Número do Pedido:</div>
                  <div className="text-lg font-bold text-gray-800">#{orderId}</div>
                </div>
                
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-2">Valor Total:</div>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(cartTotal)}</div>
                </div>
                
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-2">Valor Pago:</div>
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(parseFloat(valorPago) || 0)}</div>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Troco:</div>
                  <div className={`text-2xl font-bold ${calcularTroco() > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calcularTroco())}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-yellow-600 mr-2">⚠️</span>
                <div className="text-sm text-yellow-800">
                  <strong>Importante:</strong> 
                  {calcularTroco() > 0 ? (
                    <>
                      O entregador terá troco de {formatCurrency(calcularTroco())} disponível. 
                      Confirme o valor pago de {formatCurrency(parseFloat(valorPago) || 0)}.
                    </>
                  ) : (
                    <>
                      Tenha o valor exato em dinheiro para facilitar a entrega. 
                      O entregador não terá troco disponível.
                    </>
                  )}
                </div>
              </div>
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