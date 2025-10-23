import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import io from 'socket.io-client';
import './ChatWidget.css';

/**
 * ChatWidget - Chat em tempo real integrado ao site
 * Socket.IO + Design moderno
 */
const ChatWidget = memo(() => {
  // Estados
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isSupport, setIsSupport] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Refs
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);
  
  // URL do servidor de chat
  const CHAT_SERVER_URL = process.env.REACT_APP_CHAT_SERVER_URL || 'http://localhost:3000';

  // Gerar username único
  const generateUsername = useCallback(() => {
    const adjectives = ['Rápido', 'Feliz', 'Esperto', 'Amigo', 'Legal', 'Top', 'Pro', 'Super'];
    const nouns = ['Comprador', 'Cliente', 'Visitante', 'User', 'Panda', 'Leão', 'Gato', 'Lobo'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 999);
    return `${adj}${noun}${num}`;
  }, []);

  // Inicializar Socket.IO
  useEffect(() => {
    // Obter ou criar username
    let storedUsername = localStorage.getItem('chatUsername');
    if (!storedUsername) {
      storedUsername = generateUsername();
      localStorage.setItem('chatUsername', storedUsername);
    }
    setUsername(storedUsername);

    // Verificar se é suporte
    const urlParams = new URLSearchParams(window.location.search);
    const isSupportMode = urlParams.get('support') === 'true' || localStorage.getItem('isSupport') === 'true';
    setIsSupport(isSupportMode);
    if (isSupportMode) {
      setUsername('👨‍💼 Suporte');
    }

    // Conectar ao Socket.IO
    socketRef.current = io(CHAT_SERVER_URL, {
      transports: ['websocket', 'polling']
    });

    // Event listeners
    socketRef.current.on('connect', () => {
      console.log('✅ Conectado ao chat');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Desconectado do chat');
      setIsConnected(false);
    });

    socketRef.current.on('userCount', (count) => {
      setOnlineUsers(count);
    });

    socketRef.current.on('messageHistory', (history) => {
      setMessages(history);
    });

    socketRef.current.on('chatMessage', (message) => {
      setMessages(prev => [...prev, message]);
      playNotificationSound();
    });

    socketRef.current.on('typing', (user) => {
      setIsTyping(true);
    });

    socketRef.current.on('stopTyping', () => {
      setIsTyping(false);
    });

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [CHAT_SERVER_URL, generateUsername]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Escutar evento customizado para abrir o chat
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
    };

    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, []);

  // Enviar mensagem
  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    
    const text = inputMessage.trim();
    if (!text || !socketRef.current) return;

    socketRef.current.emit('chatMessage', {
      text,
      username,
      isSupport
    });

    setInputMessage('');
    socketRef.current.emit('stopTyping');
  }, [inputMessage, username, isSupport]);

  // Detectar digitação
  const handleInputChange = useCallback((e) => {
    setInputMessage(e.target.value);

    if (socketRef.current) {
      socketRef.current.emit('typing', username);
      
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('stopTyping');
      }, 1000);
    }
  }, [username]);

  // Som de notificação
  const playNotificationSound = useCallback(() => {
    try {
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
    } catch (error) {
      // Silenciar erro se AudioContext não disponível
    }
  }, []);

  // Formatar timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`chat-widget-button ${isOpen ? 'chat-widget-button-active' : ''}`}
        aria-label="Abrir chat de suporte"
      >
        <span className="chat-widget-icon">💬</span>
        <span className="chat-widget-text">Falar com Suporte</span>
        <span 
          className={`chat-widget-indicator ${isConnected ? 'online' : 'offline'}`}
        ></span>
        {!isOpen && messages.length > 0 && (
          <span className="chat-widget-badge">{messages.length}</span>
        )}
      </button>

      {/* Janela do chat */}
      {isOpen && (
        <div className="chat-widget-window">
          {/* Header */}
          <div className="chat-widget-header">
            <div className="chat-widget-header-content">
              <div className="chat-widget-header-title">
                <span className="chat-widget-support-icon">👨‍💼</span>
                <div>
                  <h3>Atendimento Online</h3>
                  <p className="chat-widget-status">
                    <span className={`chat-widget-status-dot ${isConnected ? 'online' : 'offline'}`}></span>
                    {isConnected ? `${onlineUsers} online` : 'Desconectado'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="chat-widget-close"
                aria-label="Fechar chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Mensagens */}
          <div className="chat-widget-messages">
            {/* Boas-vindas */}
            <div className="chat-widget-welcome">
              <span className="chat-widget-wave">👋</span>
              <p><strong>Bem-vindo ao suporte!</strong></p>
              <p>Como podemos ajudar você hoje?</p>
            </div>

            {/* Lista de mensagens */}
            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`chat-widget-message ${
                  msg.username === username ? 'chat-widget-message-user' : 'chat-widget-message-support'
                }`}
              >
                <div className="chat-widget-message-username">{msg.username}</div>
                <div className="chat-widget-message-text">{msg.text}</div>
                <div className="chat-widget-message-time">{formatTime(msg.timestamp)}</div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Indicador de digitação */}
          {isTyping && (
            <div className="chat-widget-typing">
              <span className="chat-widget-typing-dot"></span>
              <span className="chat-widget-typing-dot"></span>
              <span className="chat-widget-typing-dot"></span>
              <span className="chat-widget-typing-text">Digitando...</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSendMessage} className="chat-widget-form">
            <input
              ref={messageInputRef}
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              placeholder="Digite sua mensagem..."
              className="chat-widget-input"
              disabled={!isConnected}
            />
            <button
              type="submit"
              className="chat-widget-send"
              disabled={!isConnected || !inputMessage.trim()}
              aria-label="Enviar mensagem"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
});

ChatWidget.displayName = 'ChatWidget';

export default ChatWidget;

