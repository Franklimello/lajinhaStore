const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

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
let messageHistory = []; // Histórico temporário (limpa ao reiniciar)

// Socket.IO - Gerenciamento de conexões
io.on('connection', (socket) => {
  onlineUsers++;
  console.log(`✅ Novo usuário conectado! Total online: ${onlineUsers}`);
  
  // Enviar contagem de usuários para todos
  io.emit('userCount', onlineUsers);
  
  // Enviar histórico de mensagens recentes (últimas 50)
  socket.emit('messageHistory', messageHistory.slice(-50));

  // Receber nova mensagem
  socket.on('chatMessage', (data) => {
    const message = {
      id: Date.now() + Math.random(),
      text: data.text,
      username: data.username || 'Anônimo',
      timestamp: new Date().toISOString(),
      isSupport: data.isSupport || false
    };
    
    // Adicionar ao histórico
    messageHistory.push(message);
    
    // Manter apenas últimas 100 mensagens
    if (messageHistory.length > 100) {
      messageHistory = messageHistory.slice(-100);
    }
    
    console.log(`💬 Mensagem de ${message.username}: ${message.text}`);
    
    // Broadcast para todos os clientes
    io.emit('chatMessage', message);
  });

  // Usuário está digitando
  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username);
  });

  // Parou de digitar
  socket.on('stopTyping', () => {
    socket.broadcast.emit('stopTyping');
  });

  // Desconexão
  socket.on('disconnect', () => {
    onlineUsers--;
    console.log(`❌ Usuário desconectado. Total online: ${onlineUsers}`);
    io.emit('userCount', onlineUsers);
  });
});

// Rota de status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    onlineUsers,
    totalMessages: messageHistory.length,
    serverTime: new Date().toISOString()
  });
});

// Rota para limpar histórico (apenas para admin)
app.post('/api/clear-history', (req, res) => {
  messageHistory = [];
  io.emit('historyCleared');
  res.json({ success: true, message: 'Histórico limpo' });
});

// Porta do servidor
const PORT = process.env.PORT || 3000;

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

