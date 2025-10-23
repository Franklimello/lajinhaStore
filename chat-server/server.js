const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const server = http.createServer(app);

// Configuração do Telegram Bot
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8393627901:AAGmDARJlrBeNU6h_nNu3EKEPxzqn_Id5Zw';
const TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_IDS 
  ? process.env.TELEGRAM_CHAT_IDS.split(',') 
  : ['1493334673', '1430325412']; // Franklim e Nuke
const TELEGRAM_ENABLED = TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_IDS.length > 0;

// Configurar CORS para permitir qualquer origem
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Armazenamento em memória (sem banco de dados)
let onlineUsers = 0;
let conversations = {}; // { userId: { username, messages: [], lastMessage, unreadCount, isOnline } }
let adminSockets = new Set(); // Set de socket IDs dos admins conectados

// Socket.IO - Gerenciamento de conexões
io.on('connection', (socket) => {
  onlineUsers++;
  console.log(`✅ Novo usuário conectado! Total online: ${onlineUsers}`);
  
  let currentUserId = null;
  let currentUsername = null;
  let isAdmin = false;

  // Registrar usuário
  socket.on('registerUser', (data) => {
    currentUserId = data.userId;
    currentUsername = data.username;
    isAdmin = data.isAdmin || false;

    console.log(`📝 Usuário registrado: ${currentUsername} (${isAdmin ? 'ADMIN' : 'Cliente'})`);

    if (isAdmin) {
      // Admin conectado - adicionar ao set de admins
      adminSockets.add(socket.id);
      
      // Enviar lista de conversas para o admin
      const conversationsList = Object.entries(conversations).map(([userId, conv]) => ({
        userId,
        username: conv.username,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount || 0,
        isOnline: conv.isOnline || false,
        timestamp: conv.timestamp
      })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      socket.emit('conversationsList', conversationsList);
    } else {
      // Cliente conectado - criar/atualizar conversa
      if (!conversations[currentUserId]) {
        conversations[currentUserId] = {
          username: currentUsername,
          messages: [],
          unreadCount: 0,
          isOnline: true,
          timestamp: new Date().toISOString()
        };
      } else {
        conversations[currentUserId].isOnline = true;
        conversations[currentUserId].username = currentUsername;
      }

      // Entrar na sala privada do usuário
      socket.join(`user_${currentUserId}`);
      
      // Enviar histórico de mensagens para o cliente
      socket.emit('messageHistory', conversations[currentUserId].messages);
      
      // Notificar admins que novo cliente conectou
      notifyAdminsNewConversation(currentUserId);
    }
  });

  // Admin seleciona uma conversa
  socket.on('selectConversation', (userId) => {
    if (!isAdmin) return;
    
    console.log(`👨‍💼 Admin selecionou conversa: ${userId}`);
    
    // Entrar na sala do usuário selecionado
    socket.join(`user_${userId}`);
    
    // Enviar histórico da conversa
    if (conversations[userId]) {
      socket.emit('conversationMessages', {
        userId,
        messages: conversations[userId].messages,
        username: conversations[userId].username
      });
      
      // Marcar mensagens como lidas
      conversations[userId].unreadCount = 0;
    }
  });

  // Receber nova mensagem
  socket.on('chatMessage', (data) => {
    const { text, toUserId } = data;
    
    const message = {
      id: Date.now() + Math.random(),
      text,
      from: isAdmin ? 'admin' : currentUserId,
      fromUsername: isAdmin ? '👨‍💼 Suporte' : currentUsername,
      timestamp: new Date().toISOString(),
      isAdmin
    };

    if (isAdmin && toUserId) {
      // Admin enviando para cliente específico
      if (!conversations[toUserId]) {
        conversations[toUserId] = {
          username: 'Cliente',
          messages: [],
          unreadCount: 0,
          isOnline: false,
          timestamp: new Date().toISOString(),
          telegramNotified: false
        };
      }
      
      conversations[toUserId].messages.push(message);
      conversations[toUserId].lastMessage = text;
      conversations[toUserId].timestamp = message.timestamp;
      
      // Resetar flag de notificação quando admin responde
      // Assim, se o cliente responder depois, uma nova notificação será enviada
      conversations[toUserId].telegramNotified = false;
      
      console.log(`💬 Admin → Cliente ${toUserId}: ${text}`);
      
      // Enviar para o cliente específico
      io.to(`user_${toUserId}`).emit('chatMessage', message);
      
      // NÃO enviar de volta para o admin - ele já vê a mensagem no frontend
      
    } else if (!isAdmin && currentUserId) {
      // Cliente enviando para admin
      const isNewConversation = !conversations[currentUserId];
      
      if (!conversations[currentUserId]) {
        conversations[currentUserId] = {
          username: currentUsername,
          messages: [],
          unreadCount: 0,
          isOnline: true,
          timestamp: new Date().toISOString(),
          telegramNotified: false // Flag para controlar notificação Telegram
        };
      }
      
      conversations[currentUserId].messages.push(message);
      conversations[currentUserId].lastMessage = text;
      conversations[currentUserId].timestamp = message.timestamp;
      conversations[currentUserId].unreadCount++;
      
      console.log(`💬 Cliente ${currentUsername} → Admin: ${text}`);
      
      // Enviar de volta para o cliente (confirmação)
      socket.emit('chatMessage', message);
      
      // Enviar mensagem para todos os admins que estão visualizando essa conversa
      adminSockets.forEach(adminSocketId => {
        io.to(adminSocketId).emit('chatMessage', message);
      });
      
      // Notificar todos os admins sobre atualização da lista
      notifyAdminsNewMessage(currentUserId, isNewConversation);
    }
  });

  // Usuário está digitando
  socket.on('typing', (data) => {
    if (isAdmin && data.toUserId) {
      // Admin digitando para cliente
      io.to(`user_${data.toUserId}`).emit('typing', { from: 'admin', username: 'Suporte' });
    } else if (!isAdmin && currentUserId) {
      // Cliente digitando - notificar admins
      adminSockets.forEach(adminSocketId => {
        io.to(adminSocketId).emit('typing', { from: currentUserId, username: currentUsername });
      });
    }
  });

  // Parou de digitar
  socket.on('stopTyping', (data) => {
    if (isAdmin && data.toUserId) {
      io.to(`user_${data.toUserId}`).emit('stopTyping');
    } else if (!isAdmin && currentUserId) {
      adminSockets.forEach(adminSocketId => {
        io.to(adminSocketId).emit('stopTyping', { from: currentUserId });
      });
    }
  });

  // Desconexão
  socket.on('disconnect', () => {
    onlineUsers--;
    console.log(`❌ Usuário desconectado. Total online: ${onlineUsers}`);
    
    if (isAdmin) {
      adminSockets.delete(socket.id);
    } else if (currentUserId && conversations[currentUserId]) {
      conversations[currentUserId].isOnline = false;
      notifyAdminsNewConversation(currentUserId);
    }
  });
});

// Funções auxiliares
function notifyAdminsNewConversation(userId) {
  if (!conversations[userId]) return;
  
  const conversationsList = Object.entries(conversations).map(([uid, conv]) => ({
    userId: uid,
    username: conv.username,
    lastMessage: conv.lastMessage,
    unreadCount: conv.unreadCount || 0,
    isOnline: conv.isOnline || false,
    timestamp: conv.timestamp
  })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  adminSockets.forEach(adminSocketId => {
    io.to(adminSocketId).emit('conversationsList', conversationsList);
  });
}

function notifyAdminsNewMessage(userId, isNewConversation = false) {
  notifyAdminsNewConversation(userId);
  
  // Enviar notificação para o Telegram APENAS na primeira mensagem
  if (TELEGRAM_ENABLED && conversations[userId] && !conversations[userId].telegramNotified) {
    conversations[userId].telegramNotified = true;
    sendTelegramNotification(userId, isNewConversation);
  }
}

// Função para enviar notificação no Telegram
async function sendTelegramNotification(userId, isNewConversation) {
  try {
    const conv = conversations[userId];
    const message = `🔔 *Novo cliente entrou em contato!*\n\n👤 *Cliente:* ${conv.username}\n💬 *Primeira mensagem:* ${conv.lastMessage}\n⏰ ${new Date(conv.timestamp).toLocaleString('pt-BR')}\n\n🌐 *Acesse o painel:* https://compreaqui-324df.web.app`;
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    // Enviar para todos os chat IDs
    for (const chatId of TELEGRAM_CHAT_IDS) {
      try {
        await axios.post(url, {
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        });
        console.log(`📱 Notificação Telegram enviada (Chat ID: ${chatId}): Novo contato de ${conv.username}`);
      } catch (err) {
        console.error(`❌ Erro ao enviar para Chat ID ${chatId}:`, err.message);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao enviar notificação Telegram:', error.message);
  }
}

// Rota de status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    onlineUsers,
    totalConversations: Object.keys(conversations).length,
    adminsOnline: adminSockets.size,
    serverTime: new Date().toISOString()
  });
});

// Rota para limpar conversas (apenas para admin)
app.post('/api/clear-conversations', (req, res) => {
  conversations = {};
  console.log('🗑️ Conversas limpas');
  res.json({ success: true, message: 'Conversas limpas' });
});

// Porta do servidor (Fly.io usa 8080)
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════╗
  ║   🚀 SERVIDOR DE CHAT EM TEMPO REAL       ║
  ║                                            ║
  ║   📡 Socket.IO ativo                       ║
  ║   🌐 Servidor rodando na porta ${PORT}       ║
  ║   ✅ CORS habilitado para todas origens    ║
  ║                                            ║
  ║   Acesse: http://localhost:${PORT}          ║
  ╚════════════════════════════════════════════╝
  `);
});

