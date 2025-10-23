import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';
import { FaComments, FaPaperPlane, FaTimes, FaCircle } from 'react-icons/fa';
import './ChatWidget.css';

const ChatWindow = () => {
  // Auth
  const { user } = useAuth();
  
  // Estados
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsername, setTypingUsername] = useState('');
  
  // Estados Admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [totalUnread, setTotalUnread] = useState(0);
  
  // Refs
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);
  
  // URL do servidor
  const CHAT_SERVER_URL = process.env.REACT_APP_CHAT_SERVER_URL || 'https://chat-lajinha.fly.dev';
  
  // ID do admin (o seu UID)
  const ADMIN_UID = 'ZG5D6IrTRTZl5SDoEctLAtr4WkE2';

  // Verificar se é admin
  useEffect(() => {
    if (user && user.uid === ADMIN_UID) {
      setIsAdmin(true);
      console.log('👨‍💼 Modo Admin ativado');
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Conectar ao Socket.IO
  useEffect(() => {
    if (!isOpen) return;

    console.log('🔄 Conectando ao servidor:', CHAT_SERVER_URL);
    
    socketRef.current = io(CHAT_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Conectado ao chat');
      setIsConnected(true);
      
      // Registrar usuário
      const userId = user?.uid || `guest_${Date.now()}`;
      const username = user?.displayName || user?.email || `Visitante${Math.floor(Math.random() * 1000)}`;
      
      socketRef.current.emit('registerUser', {
        userId,
        username,
        isAdmin: isAdmin
      });
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Erro de conexão:', error);
      setIsConnected(false);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('❌ Desconectado:', reason);
      setIsConnected(false);
    });

    // Eventos para CLIENTE
    socketRef.current.on('messageHistory', (history) => {
      setMessages(history);
    });

    socketRef.current.on('chatMessage', (message) => {
      console.log('📨 Mensagem recebida:', message);
      
      // Admin não recebe de volta suas próprias mensagens (já adicionou localmente)
      const isAdminUser = user?.uid === 'ZG5D6IrTRTZl5SDoEctLAtr4WkE2';
      const isOwnAdminMessage = isAdminUser && message.isAdmin;
      
      if (!isOwnAdminMessage) {
        setMessages(prev => [...prev, message]);
        
        // Tocar som apenas se não for mensagem própria
        if (!message.isAdmin || !isAdminUser) {
          playNotificationSound();
        }
      }
    });

    // Eventos para ADMIN
    socketRef.current.on('conversationsList', (list) => {
      setConversations(list);
      const unread = list.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setTotalUnread(unread);
    });

    socketRef.current.on('conversationMessages', (data) => {
      setMessages(data.messages);
      setSelectedConversation(data);
    });

    socketRef.current.on('typing', (data) => {
      setIsTyping(true);
      setTypingUsername(data.username || 'Alguém');
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setTypingUsername('');
      }, 3000);
    });

    socketRef.current.on('stopTyping', () => {
      setIsTyping(false);
      setTypingUsername('');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isOpen, user, isAdmin, CHAT_SERVER_URL]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Escutar evento para abrir chat
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setTimeout(() => messageInputRef.current?.focus(), 100);
    };
    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, []);

  // Enviar mensagem
  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    
    const text = inputMessage.trim();
    if (!text || !socketRef.current) return;

    if (isAdmin && selectedConversation) {
      // Admin enviando para cliente específico
      const message = {
        id: Date.now() + Math.random(),
        text,
        from: 'admin',
        fromUsername: '👨‍💼 Suporte',
        timestamp: new Date().toISOString(),
        isAdmin: true
      };
      
      // Adicionar mensagem localmente para o admin (não esperar servidor)
      setMessages(prev => [...prev, message]);
      
      // Enviar para o servidor (que enviará para o cliente)
      socketRef.current.emit('chatMessage', {
        text,
        toUserId: selectedConversation.userId
      });
    } else if (!isAdmin) {
      // Cliente enviando para admin
      socketRef.current.emit('chatMessage', { text });
    }

    setInputMessage('');
    socketRef.current.emit('stopTyping', {
      toUserId: selectedConversation?.userId
    });
  }, [inputMessage, isAdmin, selectedConversation]);

  // Detectar digitação
  const handleInputChange = useCallback((e) => {
    setInputMessage(e.target.value);
    
    if (socketRef.current && e.target.value.length > 0) {
      socketRef.current.emit('typing', {
        toUserId: selectedConversation?.userId
      });
      
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('stopTyping', {
          toUserId: selectedConversation?.userId
        });
      }, 1000);
    }
  }, [selectedConversation]);

  // Selecionar conversa (admin)
  const handleSelectConversation = useCallback((conv) => {
    setSelectedConversation(conv);
    setMessages([]);
    socketRef.current.emit('selectConversation', conv.userId);
  }, []);

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
      console.warn('Erro ao tocar som:', error);
    }
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  // INTERFACE PARA ADMIN
  if (isAdmin) {
    return (
      <div className="chat-widget-window">
        <div className="chat-widget-header">
          <h3 className="chat-widget-title">
            👨‍💼 Painel de Atendimento
            {totalUnread > 0 && (
              <span className="chat-widget-badge">{totalUnread}</span>
            )}
          </h3>
          <button onClick={() => setIsOpen(false)} className="chat-widget-close">
            <FaTimes />
          </button>
        </div>

        <div className="chat-admin-container">
          {/* Lista de Conversas */}
          <div className="chat-conversations-list">
            <div className="chat-conversations-header">
              <h4>Conversas ({conversations.length})</h4>
            </div>
            {conversations.length === 0 ? (
              <div className="chat-empty-state">
                <p>Nenhuma conversa ainda</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.userId}
                  className={`chat-conversation-item ${selectedConversation?.userId === conv.userId ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="chat-conversation-avatar">
                    {conv.username.charAt(0).toUpperCase()}
                    <FaCircle className={`chat-status-dot ${conv.isOnline ? 'online' : 'offline'}`} />
                  </div>
                  <div className="chat-conversation-info">
                    <div className="chat-conversation-name">{conv.username}</div>
                    <div className="chat-conversation-last">
                      {conv.lastMessage || 'Sem mensagens'}
                    </div>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="chat-unread-badge">{conv.unreadCount}</span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Chat da Conversa Selecionada */}
          <div className="chat-conversation-panel">
            {selectedConversation ? (
              <>
                <div className="chat-conversation-header-panel">
                  <div className="chat-conversation-user">
                    <div className="chat-conversation-avatar-small">
                      {selectedConversation.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="chat-conversation-user-name">
                        {selectedConversation.username}
                      </div>
                      <div className="chat-conversation-user-status">
                        {conversations.find(c => c.userId === selectedConversation.userId)?.isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="chat-widget-messages">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={`chat-widget-message ${msg.isAdmin ? 'chat-widget-message-admin' : 'chat-widget-message-user'}`}
                    >
                      <div className="chat-widget-message-content-box">
                        <div className="chat-widget-message-text">{msg.text}</div>
                        <div className="chat-widget-message-time">{formatTime(msg.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {isTyping && (
                  <div className="chat-widget-typing">
                    <span>{typingUsername} está digitando...</span>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="chat-widget-form">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={inputMessage}
                    onChange={handleInputChange}
                    placeholder="Digite sua resposta..."
                    className="chat-widget-input"
                    disabled={!isConnected}
                  />
                  <button
                    type="submit"
                    className="chat-widget-send"
                    disabled={!inputMessage.trim()}
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </>
            ) : (
              <div className="chat-empty-conversation">
                <FaComments size={60} color="#ccc" />
                <p>Selecione uma conversa</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // INTERFACE PARA CLIENTE
  return (
    <div className="chat-widget-window">
      <div className="chat-widget-header">
        <div className="chat-widget-header-content">
          <div className="chat-widget-header-title">
            <span className="chat-widget-support-icon">👨‍💼</span>
            <div>
              <h3>Atendimento Online</h3>
              <p className="chat-widget-status">
                <span className={`chat-widget-status-dot ${isConnected ? 'online' : 'offline'}`}></span>
                {isConnected ? 'Conectado' : 'Desconectado'}
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="chat-widget-close">
            <FaTimes />
          </button>
        </div>
      </div>

      <div className="chat-widget-messages">
        <div className="chat-widget-welcome">
          <span className="chat-widget-wave">👋</span>
          <p><strong>Bem-vindo ao suporte!</strong></p>
          <p>Como podemos ajudar você hoje?</p>
        </div>

        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`chat-widget-message ${msg.isAdmin ? 'chat-widget-message-support' : 'chat-widget-message-user'}`}
          >
            <div className="chat-widget-message-username">{msg.fromUsername}</div>
            <div className="chat-widget-message-text">{msg.text}</div>
            <div className="chat-widget-message-time">{formatTime(msg.timestamp)}</div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {isTyping && (
        <div className="chat-widget-typing">
          <span className="chat-widget-typing-dot"></span>
          <span className="chat-widget-typing-dot"></span>
          <span className="chat-widget-typing-dot"></span>
          <span className="chat-widget-typing-text">{typingUsername} digitando...</span>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="chat-widget-form">
        <input
          ref={messageInputRef}
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          placeholder={isConnected ? "Digite sua mensagem..." : "Conectando..."}
          className="chat-widget-input"
          disabled={!isConnected}
        />
        <button
          type="submit"
          className="chat-widget-send"
          disabled={!inputMessage.trim() || !isConnected}
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
