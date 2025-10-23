// Configuração do Socket.IO
const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling']
});

// Elementos DOM
const chatButton = document.getElementById('chatButton');
const chatWindow = document.getElementById('chatWindow');
const closeChat = document.getElementById('closeChat');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const chatMessages = document.getElementById('chatMessages');
const typingIndicator = document.getElementById('typingIndicator');
const userCountElement = document.getElementById('userCount');
const onlineIndicator = document.getElementById('onlineIndicator');

// Estado
let username = '';
let isSupport = false;
let typingTimeout;

// Gerar nome de usuário único
function generateUsername() {
  const adjectives = ['Rápido', 'Feliz', 'Esperto', 'Amigo', 'Legal', 'Top', 'Pro', 'Super'];
  const nouns = ['Comprador', 'Cliente', 'Visitante', 'User', 'Panda', 'Leão', 'Gato', 'Lobo'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 999);
  return `${adj}${noun}${num}`;
}

// Verificar se é suporte (baseado em localStorage ou URL)
function checkIfSupport() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('support') === 'true' || localStorage.getItem('isSupport') === 'true';
}

// Inicializar
function init() {
  username = localStorage.getItem('chatUsername') || generateUsername();
  localStorage.setItem('chatUsername', username);
  
  isSupport = checkIfSupport();
  if (isSupport) {
    localStorage.setItem('isSupport', 'true');
    username = '👨‍💼 Suporte';
  }
}

// Abrir/Fechar chat
chatButton.addEventListener('click', () => {
  chatWindow.classList.toggle('active');
  if (chatWindow.classList.contains('active')) {
    messageInput.focus();
    // Marcar como lido
    chatButton.style.animation = 'none';
  }
});

closeChat.addEventListener('click', () => {
  chatWindow.classList.remove('active');
});

// Enviar mensagem
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const text = messageInput.value.trim();
  if (!text) return;
  
  // Enviar mensagem via Socket.IO
  socket.emit('chatMessage', {
    text,
    username,
    isSupport
  });
  
  // Limpar campo
  messageInput.value = '';
  socket.emit('stopTyping');
});

// Detectar digitação
let lastTypingTime = 0;
messageInput.addEventListener('input', () => {
  const now = Date.now();
  
  if (now - lastTypingTime > 1000) {
    socket.emit('typing', username);
    lastTypingTime = now;
  }
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('stopTyping');
  }, 1000);
});

// Adicionar mensagem ao chat
function addMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  
  // Diferenciar mensagem do usuário atual, suporte e outros
  if (message.username === username) {
    messageDiv.classList.add('message-user');
  } else if (message.isSupport) {
    messageDiv.classList.add('message-support');
  } else {
    messageDiv.classList.add('message-support');
  }
  
  const time = new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  messageDiv.innerHTML = `
    <div class="message-username">${message.username}</div>
    <div class="message-text">${escapeHtml(message.text)}</div>
    <div class="message-time">${time}</div>
  `;
  
  chatMessages.appendChild(messageDiv);
  
  // Scroll automático
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Animação no botão se chat estiver fechado
  if (!chatWindow.classList.contains('active')) {
    chatButton.style.animation = 'pulse 0.5s ease-in-out 3';
  }
  
  // Tocar som (opcional)
  playNotificationSound();
}

// Escape HTML para prevenir XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Som de notificação
function playNotificationSound() {
  // Criar um beep simples
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

// ========== SOCKET.IO EVENTS ==========

// Conexão estabelecida
socket.on('connect', () => {
  console.log('✅ Conectado ao servidor de chat');
  onlineIndicator.style.background = '#10b981';
});

// Desconectado
socket.on('disconnect', () => {
  console.log('❌ Desconectado do servidor');
  onlineIndicator.style.background = '#ef4444';
  userCountElement.textContent = 'Desconectado';
});

// Receber contagem de usuários
socket.on('userCount', (count) => {
  userCountElement.textContent = `${count} online`;
});

// Receber histórico de mensagens
socket.on('messageHistory', (messages) => {
  messages.forEach(message => {
    addMessage(message);
  });
});

// Receber nova mensagem
socket.on('chatMessage', (message) => {
  addMessage(message);
});

// Alguém está digitando
socket.on('typing', (username) => {
  typingIndicator.querySelector('.typing-text').textContent = `${username} está digitando...`;
  typingIndicator.classList.add('active');
});

// Parou de digitar
socket.on('stopTyping', () => {
  typingIndicator.classList.remove('active');
});

// Histórico limpo
socket.on('historyCleared', () => {
  chatMessages.innerHTML = `
    <div class="welcome-message">
      <span class="wave-emoji">👋</span>
      <p><strong>Bem-vindo ao suporte!</strong></p>
      <p>Como podemos ajudar você hoje?</p>
    </div>
  `;
});

// Inicializar aplicação
init();

// Exibir informações no console
console.log(`
╔════════════════════════════════════════════╗
║   💬 CHAT DE SUPORTE ATIVO                 ║
║                                            ║
║   Usuário: ${username.padEnd(28)} ║
║   Tipo: ${(isSupport ? 'Atendente' : 'Cliente').padEnd(31)} ║
║                                            ║
║   Dica: Adicione ?support=true na URL      ║
║   para entrar como atendente!              ║
╚════════════════════════════════════════════╝
`);

