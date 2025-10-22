/**
 * Firebase Cloud Functions - E-commerce Notification Service
 * Sistema de Notificações via Telegram e Push Notifications
 * (Email desabilitado - Telegram já basta)
 *
 * @version 3.0.0
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Resend removido - usando apenas Telegram
// const {Resend} = require("resend");
const config = require("./config"); 

// Inicializa o Firebase Admin SDK
admin.initializeApp();

// ========================================
// E-MAIL DESABILITADO - Usando apenas Telegram
// ========================================
// Código de inicialização do Resend removido
// Notificações são enviadas apenas via Telegram
console.log("ℹ️ Sistema de email desabilitado - usando apenas Telegram para notificações");

// ========================================
// SISTEMA DE NOTIFICAÇÕES PUSH - NÚCLEO (MANTIDO)
// ========================================
async function sendNotificationToUser(userId, title, body, data = {}) {
  // ... Código da função sendNotificationToUser MANTIDO SEM ALTERAÇÕES ...
  // [CÓDIGO OMITIDO PARA CONCISÃO]
  try {
    console.log(`📤 Enviando notificação para: ${userId}`);
    const notificationRef = await admin.firestore().collection("notifications").add({
      userId, title, body, data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false, type: data.type || "general",
    });

    console.log(`✅ Notificação gravada no Firestore: ${notificationRef.id}`);

    try {
      const tokenDoc = await admin.firestore().collection("userTokens").doc(userId).get();
      if (tokenDoc.exists) {
        const {token, active} = tokenDoc.data();
        if (active && token) {
          const message = {
            notification: {title, body, icon: "/logo192.png"},
            data: {...data, notificationId: notificationRef.id, timestamp: Date.now().toString()},
            token,
          };
          const fcmResponse = await admin.messaging().send(message);
          console.log("✅ FCM enviado:", fcmResponse);
          await notificationRef.update({fcmMessageId: fcmResponse, sentViaFCM: true});
        } else {
          console.log(`⚠️ Token inativo para usuário: ${userId}`);
        }
      } else {
        console.log(`ℹ️ Token FCM não encontrado para: ${userId}`);
      }
    } catch (fcmError) {
      console.warn("⚠️ Erro ao enviar FCM (notificação gravada):", fcmError.message);
      if (fcmError.code === "messaging/registration-token-not-registered") {
        await admin.firestore().collection("userTokens").doc(userId).update({active: false});
      }
    }
    return {success: true, notificationId: notificationRef.id};
  } catch (error) {
    console.error("❌ ERRO CRÍTICO ao gravar notificação:", error);
    return {success: false, error: error.message};
  }
}


// ========================================
// TRIGGERS DE PEDIDOS
// ========================================

/**
 * Trigger quando um pedido é CRIADO
 * VERSÃO COM LOGS APRIMORADOS PARA E-MAIL
 */
exports.onOrderCreated = functions.firestore
    .document("pedidos/{orderId}")
    .onCreate(async (snap, context) => {
      console.log("🎯 === TRIGGER DISPARADO ===");

      try {
        const order = snap.data();
        const orderId = context.params.orderId;
        console.log("📦 Order ID:", orderId);
        console.log("🔍 DEBUG: Chegou até aqui - iniciando seção de e-mail...");

        // ========================================
        // SEÇÃO 1: E-MAIL DESABILITADA (Telegram já basta)
        // ========================================
        console.log("ℹ️ Envio de e-mail desabilitado - usando apenas Telegram");

        // ... O restante da seção de Notificações (MANTIDO) ...
        console.log("📱 === SEÇÃO NOTIFICAÇÕES INICIADA ===");
        if (order.userId) {
          const clientResult = await sendNotificationToUser(
              order.userId, "🛒 Pedido Confirmado!", `Seu pedido #${orderId.slice(-8)} foi criado com sucesso!`, 
              {orderId, type: "order_created", url: `/pedidos/${orderId}`});
          console.log("📱 Resultado notificação cliente:", clientResult);
        }
        const adminUIDs = ["ZG5D6IrTRTZl5SDoEctLAtr4WkE2", "6VbaNslrhQhXcyussPj53YhLiYj2"];
        for (const adminId of adminUIDs) {
          const adminResult = await sendNotificationToUser(
              adminId, "🔔 Novo Pedido Recebido!", 
              `Pedido #${orderId.slice(-8)} de ${order.endereco?.nome || "Cliente"} - R$ ${order.total?.toFixed(2)}`,
              {orderId, type: "new_order_admin", url: "/admin-pedidos"});
          console.log(`📱 Resultado admin ${adminId}:`, adminResult);
        }
        console.log("📱 === SEÇÃO NOTIFICAÇÕES FINALIZADA ===\n");
        console.log("✅ === TRIGGER FINALIZADO COM SUCESSO ===");
      } catch (error) {
        console.error("❌ === ERRO GERAL NO TRIGGER ===");
        console.error("❌ Mensagem:", error.message);
      }
    });

/**
 * Trigger quando status do pedido MUDA (MANTIDO)
 */
exports.onOrderStatusChange = functions.firestore
    .document("pedidos/{orderId}")
    .onUpdate(async (change, context) => {
      // ... Código da função onOrderStatusChange MANTIDO SEM ALTERAÇÕES ...
      // [CÓDIGO OMITIDO PARA CONCISÃO]
      const before = change.before.data();
      const after = change.after.data();
      const orderId = context.params.orderId;
      if (before.status === after.status) return;

      console.log("📦 TRIGGER: Status mudou:", before.status, "->", after.status);
      const statusMessages = {
        "Pago": "✅ Pagamento confirmado! Seu pedido está sendo preparado.",
        "Em Separação": "📦 Seu pedido está sendo separado.",
        "Enviado": "🚚 Seu pedido foi enviado e está a caminho!",
        "Entregue": "🎉 Seu pedido foi entregue! Obrigado pela compra.",
        "Cancelado": "❌ Seu pedido foi cancelado. Entre em contato conosco.",
      };
      const message = statusMessages[after.status] || `Status atualizado para: ${after.status}`;

      try {
        if (after.userId) {
          const result = await sendNotificationToUser(
              after.userId, `📦 Pedido #${orderId.slice(-8)}`, message,
              {orderId, type: "order_status_update", status: after.status, url: `/pedidos/${orderId}`});
          console.log("✅ Notificação de status enviada:", result);
        }
      } catch (error) {
        console.error("❌ Erro no trigger onOrderStatusChange:", error);
      }
    });

/**
 * Endpoint para envio de notificação manual (MANTIDO)
 */
exports.sendNotification = functions.https.onRequest(async (req, res) => {
  // ... Código da função sendNotification MANTIDO SEM ALTERAÇÕES ...
  // [CÓDIGO OMITIDO PARA CONCISÃO]
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).send("");
  if (req.method !== "POST") return res.status(405).json({success: false, error: "Método não permitido. Use POST."});
  try {
    const {userId, title, body, data} = req.body;
    if (!userId || !title || !body) return res.status(400).json({success: false, error: "Campos obrigatórios: userId, title, body"});
    const result = await sendNotificationToUser(userId, title, body, data || {});
    return res.status(200).json({success: result.success, message: result.success ? "Notificação enviada com sucesso!" : "Erro ao enviar notificação", data: result});
  } catch (error) {
    console.error("❌ Erro na função sendNotification:", error);
    return res.status(500).json({success: false, error: "Erro interno do servidor", details: error.message});
  }
});

/**
 * Função de teste para envio de e-mail (DESABILITADA)
 */
exports.testEmail = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    success: false,
    message: "Sistema de e-mail desabilitado. Usando apenas Telegram para notificações.",
    timestamp: new Date().toISOString()
  });
});

exports.enviarEmail = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).send("");
  
  return res.status(200).json({
    success: false,
    message: "Sistema de e-mail desabilitado. Entre em contato via Telegram ou WhatsApp.",
    timestamp: new Date().toISOString()
  });
});
exports.notificarNovoPedido = functions.firestore.document("pedidos/{pedidoId}").onCreate(async (snap, context) => {});
exports.test = functions.https.onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.status(200).json({success: true, message: "API funcionando!", timestamp: new Date().toISOString(), version: "2.1.0"});
});

/**
 * ========================================
 * NOTIFICAÇÕES TELEGRAM - NOVA FUNCIONALIDADE
 * ========================================
 */

const axios = require("axios");

// Configurações do Telegram
const TELEGRAM_TOKEN = "8393627901:AAGmDARJlrBeNU6h_nNu3EKEPxzqn_Id5Zw";

// Adicione todos os chat_ids aqui:
const CHAT_IDS = [
  "1493334673", // Você (Franklim)
  "1430325412"  // ID do Nuke
];

/**
 * Função que dispara quando um novo pedido é criado no Firestore
 * Envia notificação direta para o Telegram
 */
exports.notificarTelegram = functions.firestore
  .document("pedidos/{pedidoId}")
  .onCreate(async (snapshot, context) => {
    const pedido = snapshot.data();
    const pedidoId = context.params.pedidoId;
    
    console.log("🤖 === NOTIFICAÇÃO TELEGRAM INICIADA ===");
    console.log("🤖 Pedido ID:", pedidoId);
    console.log("🤖 Dados do pedido:", JSON.stringify(pedido, null, 2));

    try {
      // Monta a mensagem do Telegram
      const endereco = pedido.endereco || {};
      const isDinheiro = pedido.paymentMethod === "dinheiro";
      const paymentLabel = isDinheiro ? "Dinheiro" : "PIX";
      
      // Formata os itens
      const itensTexto = (pedido.items || [])
        .map(item => {
          const itemNome = item.titulo || item.nome || item.title || "Item";
          const itemQtd = item.qty || item.quantidade || 1;
          const itemCorte = item.corte ? ` 🥩 Corte: ${item.corte}` : "";
          return `• ${itemNome} (Qtd: ${itemQtd})${itemCorte}`;
        })
        .join("\n");

      const mensagem = `
🛒 *NOVO PEDIDO RECEBIDO!*

📋 *Pedido:* #${pedidoId.slice(-8)}
👤 *Cliente:* ${endereco.nome || "Cliente"}
📱 *Telefone:* ${endereco.telefone || "Não informado"}
💰 *Total:* R$ ${pedido.total?.toFixed(2) || "0,00"}
💳 *Pagamento:* ${paymentLabel}
${isDinheiro ? `💵 *Valor Pago:* R$ ${pedido.valorPago?.toFixed(2) || "0,00"}` : ""}
${isDinheiro ? `🔄 *Troco:* R$ ${pedido.troco?.toFixed(2) || "0,00"}` : ""}
${pedido.horarioEntrega ? `🕐 *Horário de Entrega:* ${pedido.horarioEntrega}` : ""}

📍 *Endereço:*
${endereco.rua || "Rua não informada"}, ${endereco.numero || "N/A"}
${endereco.bairro || "Bairro não informado"} - ${endereco.cidade || "Cidade não informada"}
${endereco.referencia ? `📍 *Referência:* ${endereco.referencia}` : ""}

📦 *Itens:*
${itensTexto}

${pedido.observacoes ? `📝 *Observações:* ${pedido.observacoes}` : ""}

⏰ *Data:* ${new Date().toLocaleString("pt-BR")}
`;

      console.log("🤖 Enviando mensagem para Telegram...");
      console.log("🤖 Mensagem:", mensagem);
      console.log("🤖 Chat IDs:", CHAT_IDS);

      // Envia a notificação para cada chat_id
      for (const chatId of CHAT_IDS) {
        try {
          const response = await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
            {
              chat_id: chatId,
              text: mensagem,
              parse_mode: "Markdown",
            }
          );
          
          console.log(`✅ Notificação enviada para chat ${chatId}:`, response.data);
        } catch (chatError) {
          console.error(`❌ Erro ao enviar para chat ${chatId}:`, chatError.message);
        }
      }

      console.log("✅ Notificações Telegram processadas!");

    } catch (error) {
      console.error("❌ Erro ao enviar notificação Telegram:", error.message);
      console.error("❌ Detalhes do erro:", error.response?.data || error.stack);
    }
  });