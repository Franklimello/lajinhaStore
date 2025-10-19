/**
 * Firebase Cloud Functions - E-commerce Email Service
 * Função para envio de e-mails via Resend API
 *
 * @author Seu Nome
 * @version 1.0.0
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {Resend} = require("resend");

// Inicializa o Firebase Admin SDK
admin.initializeApp();

// Inicializa o cliente Resend com a API key das variáveis de ambiente
const resend = new Resend(functions.config().resend.key);

/**
 * Função para envio de e-mails via Resend
 * Endpoint: POST /enviarEmail
 *
 * @param {Object} req - Objeto da requisição HTTP
 * @param {Object} res - Objeto da resposta HTTP
 * @returns {Promise<void>}
 */
exports.enviarEmail = functions.https.onRequest(async (req, res) => {
  // Configura CORS para permitir requisições do frontend
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Responde a requisições OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    res.status(200).send("");
    return;
  }

  // Valida se o método é POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Método não permitido. Use POST.",
    });
  }

  try {
    // Extrai dados do corpo da requisição
    const {nome, email, mensagem} = req.body;

    // Validação dos campos obrigatórios
    if (!nome || !email || !mensagem) {
      return res.status(400).json({
        success: false,
        error: "Campos obrigatórios: nome, email e mensagem são necessários.",
        missing: {
          nome: !nome,
          email: !email,
          mensagem: !mensagem,
        },
      });
    }

    // Validação básica do formato do e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Formato de e-mail inválido.",
      });
    }

    // Validação do tamanho da mensagem (máximo 5000 caracteres)
    if (mensagem.length > 5000) {
      return res.status(400).json({
        success: false,
        error: "Mensagem muito longa. Máximo 5000 caracteres.",
      });
    }

    // E-mail de destino (configurado como variável de ambiente)
    const emailDestino = functions.config().resend.destination || "frank.melo.wal@gmail.com";

    // Dados do e-mail a ser enviado
    const emailData = {
      from: "E-commerce CompreAqui <onboarding@resend.dev>", // Domínio verificado da Resend
      to: [emailDestino],
      subject: `Nova mensagem de contato - ${nome}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">📧 Nova Mensagem de Contato</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">E-commerce - Sistema de Contato</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">👤 Informações do Cliente</h2>
              <p style="margin: 10px 0;"><strong>Nome:</strong> ${nome}</p>
              <p style="margin: 10px 0;"><strong>E-mail:</strong> <a href="mailto:${email}" style="color: #667eea;">${email}</a></p>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">💬 Mensagem</h2>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #667eea; white-space: pre-wrap; line-height: 1.6;">${mensagem}</div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 6px; border-left: 4px solid #2196f3;">
              <p style="margin: 0; color: #1565c0; font-size: 14px;">
                <strong>📅 Data/Hora:</strong> ${new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>Este e-mail foi enviado automaticamente pelo sistema de contato do e-commerce.</p>
          </div>
        </div>
      `,
      text: `
Nova mensagem de contato - E-commerce

Informações do Cliente:
Nome: ${nome}
E-mail: ${email}

Mensagem:
${mensagem}

Data/Hora: ${new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})}
      `,
    };

    // Envia o e-mail via Resend
    const result = await resend.emails.send(emailData);

    // Log do sucesso (apenas em desenvolvimento)
    console.log("E-mail enviado com sucesso:", {
      id: result.data?.id,
      destinatario: emailDestino,
      remetente: email,
      timestamp: new Date().toISOString(),
    });

    // Resposta de sucesso
    return res.status(200).json({
      success: true,
      message: "E-mail enviado com sucesso!",
      data: {
        id: result.data?.id,
        destinatario: emailDestino,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    // Log do erro para debugging
    console.error("Erro ao enviar e-mail:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    // Resposta de erro interno
    return res.status(500).json({
      success: false,
      error: "Erro interno do servidor. Tente novamente mais tarde.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * Função para notificar por e-mail quando um novo pedido é criado
 * Trigger: onCreate na coleção "pedidos"
 */
exports.notificarNovoPedido = functions.firestore
  .document("pedidos/{pedidoId}")
  .onCreate(async (snap, context) => {
    try {
      const pedido = snap.data();
      const pedidoId = context.params.pedidoId;

      console.log("🆕 Novo pedido detectado:", {
        id: pedidoId,
        total: pedido.total,
        cliente: pedido.endereco?.nome || "Não informado",
        timestamp: new Date().toISOString(),
      });

      // E-mail de destino (configurado como variável de ambiente)
      const emailDestino = functions.config().resend.destination || "frank.melo.wal@gmail.com";

      // Dados do e-mail de notificação
      const emailData = {
        from: "E-commerce CompreAqui <onboarding@resend.dev>", // Domínio verificado da Resend
        to: [emailDestino],
        subject: `🆕 Novo Pedido #${pedidoId.slice(-8).toUpperCase()} - R$ ${pedido.total?.toFixed(2) || "0,00"}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">🆕 Novo Pedido Recebido!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">E-commerce - Sistema de Notificações</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #28a745; padding-bottom: 10px;">📋 Informações do Pedido</h2>
                <p style="margin: 10px 0;"><strong>ID do Pedido:</strong> #${pedidoId.slice(-8).toUpperCase()}</p>
                <p style="margin: 10px 0;"><strong>Valor Total:</strong> R$ ${pedido.total?.toFixed(2) || "0,00"}</p>
                <p style="margin: 10px 0;"><strong>Status:</strong> ${pedido.status || "Aguardando Pagamento"}</p>
                <p style="margin: 10px 0;"><strong>Método de Pagamento:</strong> ${pedido.paymentMethod === 'dinheiro' ? '💵 Dinheiro' : '📱 PIX'}</p>
                ${pedido.paymentMethod === 'dinheiro' && (pedido.valorPago || pedido.troco) ? `
                  <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #3b82f6;">
                    <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">💰 Informações de Pagamento em Dinheiro</h4>
                    <p style="margin: 5px 0;"><strong>Valor Total:</strong> R$ ${(pedido.valorTotal || pedido.total)?.toFixed(2) || "0,00"}</p>
                    <p style="margin: 5px 0;"><strong>Valor Pago:</strong> R$ ${pedido.valorPago?.toFixed(2) || "0,00"}</p>
                    <p style="margin: 5px 0;"><strong>Troco:</strong> R$ ${pedido.troco?.toFixed(2) || "0,00"}</p>
                    ${(pedido.troco || 0) > 0 ? `<p style="margin: 10px 0 0 0; color: #dc2626; font-weight: bold;">⚠️ IMPORTANTE: O entregador deve ter troco de R$ ${pedido.troco?.toFixed(2)} disponível!</p>` : ''}
                  </div>
                ` : ''}
              </div>
              
              <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #28a745; padding-bottom: 10px;">👤 Dados do Cliente</h2>
                <p style="margin: 10px 0;"><strong>Nome:</strong> ${pedido.endereco?.nome || "Não informado"}</p>
                <p style="margin: 10px 0;"><strong>Telefone:</strong> ${pedido.endereco?.telefone || "Não informado"}</p>
                <p style="margin: 10px 0;"><strong>Endereço:</strong> ${pedido.endereco?.rua || ""}, ${pedido.endereco?.numero || ""}</p>
                <p style="margin: 10px 0;"><strong>Bairro:</strong> ${pedido.endereco?.bairro || ""}</p>
                <p style="margin: 10px 0;"><strong>Cidade:</strong> ${pedido.endereco?.cidade || ""}</p>
                ${pedido.endereco?.referencia ? `<p style="margin: 10px 0;"><strong>Referência:</strong> ${pedido.endereco.referencia}</p>` : ''}
              </div>
              
              <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #28a745; padding-bottom: 10px;">🛒 Itens do Pedido</h2>
                ${pedido.items?.map(item => `
                  <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                    <p style="margin: 5px 0; font-weight: bold;">${item.nome || item.titulo}</p>
                    <p style="margin: 5px 0; color: #666;">Quantidade: ${item.quantidade || item.qty} | Preço: R$ ${item.precoUnitario?.toFixed(2) || item.preco?.toFixed(2) || "0,00"}</p>
                    <p style="margin: 5px 0; font-weight: bold; color: #28a745;">Subtotal: R$ ${item.subtotal?.toFixed(2) || ((item.preco || 0) * (item.qty || 1)).toFixed(2)}</p>
                  </div>
                `).join('') || '<p>Nenhum item encontrado</p>'}
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 6px; border-left: 4px solid #2196f3;">
                <p style="margin: 0; color: #1565c0; font-size: 14px;">
                  <strong>📅 Data/Hora:</strong> ${new Date().toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>Este e-mail foi enviado automaticamente pelo sistema de notificações do e-commerce.</p>
              <p><strong>Ação necessária:</strong> Acesse o painel administrativo para gerenciar este pedido.</p>
            </div>
          </div>
        `,
        text: `
🆕 NOVO PEDIDO RECEBIDO!

📋 Informações do Pedido:
ID: #${pedidoId.slice(-8).toUpperCase()}
Valor Total: R$ ${pedido.total?.toFixed(2) || "0,00"}
Status: ${pedido.status || "Aguardando Pagamento"}
Método de Pagamento: ${pedido.paymentMethod === 'dinheiro' ? 'Dinheiro' : 'PIX'}
${pedido.paymentMethod === 'dinheiro' && (pedido.valorPago || pedido.troco) ? `
💰 INFORMAÇÕES DE PAGAMENTO EM DINHEIRO:
Valor Total: R$ ${(pedido.valorTotal || pedido.total)?.toFixed(2) || "0,00"}
Valor Pago: R$ ${pedido.valorPago?.toFixed(2) || "0,00"}
Troco: R$ ${pedido.troco?.toFixed(2) || "0,00"}
${(pedido.troco || 0) > 0 ? `⚠️ IMPORTANTE: O entregador deve ter troco de R$ ${pedido.troco?.toFixed(2)} disponível!` : ''}
` : ''}

👤 Dados do Cliente:
Nome: ${pedido.endereco?.nome || "Não informado"}
Telefone: ${pedido.endereco?.telefone || "Não informado"}
Endereço: ${pedido.endereco?.rua || ""}, ${pedido.endereco?.numero || ""}
Bairro: ${pedido.endereco?.bairro || ""}
Cidade: ${pedido.endereco?.cidade || ""}

🛒 Itens do Pedido:
${pedido.items?.map(item => `- ${item.nome || item.titulo} (Qtd: ${item.quantidade || item.qty}) - R$ ${item.subtotal?.toFixed(2) || ((item.preco || 0) * (item.qty || 1)).toFixed(2)}`).join('\n') || 'Nenhum item encontrado'}

📅 Data/Hora: ${new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"})}

Ação necessária: Acesse o painel administrativo para gerenciar este pedido.
        `,
      };

      // Envia o e-mail via Resend
      const result = await resend.emails.send(emailData);

      console.log("📧 E-mail de notificação enviado:", {
        id: result.data?.id,
        destinatario: emailDestino,
        pedidoId: pedidoId,
        timestamp: new Date().toISOString(),
      });

      return { success: true, emailId: result.data?.id };
    } catch (error) {
      console.error("❌ Erro ao enviar e-mail de notificação:", {
        error: error.message,
        stack: error.stack,
        pedidoId: context.params.pedidoId,
        timestamp: new Date().toISOString(),
      });

      // Não relança o erro para não quebrar o fluxo de criação do pedido
      return { success: false, error: error.message };
    }
  });

/**
 * Função de teste para verificar se a API está funcionando
 * Endpoint: GET /test
 */
exports.test = functions.https.onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  res.status(200).json({
    success: true,
    message: "API de e-mail funcionando corretamente!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});