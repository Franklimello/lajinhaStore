import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';
import { FaComments, FaPaperPlane, FaTimes, FaCircle } from 'react-icons/fa';

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
  
  // ID do admin
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

    socketRef.current.on('messageHistory', (history) => {
      setMessages(history);
    });

    socketRef.current.on('chatMessage', (message) => {
      console.log('📨 Mensagem recebida:', message);
      
      const isAdminUser = user?.uid === 'ZG5D6IrTRTZl5SDoEctLAtr4WkE2';
      const isOwnAdminMessage = isAdminUser && message.isAdmin;
      
      if (!isOwnAdminMessage) {
        setMessages(prev => [...prev, message]);
        
        if (!message.isAdmin || !isAdminUser) {
          playNotificationSound();
        }
      }
    });

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
      const message = {
        id: Date.now() + Math.random(),
        text,
        from: 'admin',
        fromUsername: '👨‍💼 Suporte',
        timestamp: new Date().toISOString(),
        isAdmin: true
      };
      
      setMessages(prev => [...prev, message]);
      
      socketRef.current.emit('chatMessage', {
        text,
        toUserId: selectedConversation.userId
      });
    } else if (!isAdmin) {
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
      <div className="fixed bottom-4 right-4 w-full max-w-4xl h-[600px] max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200" style={{ zIndex: 99999 }}>
        {/* Header Admin */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👨‍💼</span>
            <div>
              <h3 className="text-white font-semibold text-sm">Painel de Atendimento</h3>
              <p className="text-blue-100 text-xs">
                {conversations.length} {conversations.length === 1 ? 'conversa' : 'conversas'}
              </p>
            </div>
            {totalUnread > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-2">
                {totalUnread}
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Lista de Conversas */}
          <div className="w-72 border-r border-gray-200 flex flex-col bg-gray-50">
            <div className="p-3 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700">Conversas Ativas</h4>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Nenhuma conversa ainda
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.userId}
                    className={`p-3 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-100 ${
                      selectedConversation?.userId === conv.userId ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {conv.username.charAt(0).toUpperCase()}
                        </div>
                        <FaCircle 
                          className={`absolute bottom-0 right-0 text-xs ${
                            conv.isOnline ? 'text-green-500' : 'text-gray-400'
                          }`} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate">
                          {conv.username}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {conv.lastMessage || 'Sem mensagens'}
                        </div>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Painel de Chat */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header da Conversa */}
                <div className="p-3 border-b border-gray-200 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedConversation.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">
                        {selectedConversation.username}
                      </div>
                      <div className="text-xs text-gray-500">
                        {conversations.find(c => c.userId === selectedConversation.userId)?.isOnline ? (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Online
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            Offline
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${msg.isAdmin ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'} rounded-2xl px-4 py-2 shadow-sm`}>
                        <div className="text-sm">{msg.text}</div>
                        <div className={`text-xs mt-1 ${msg.isAdmin ? 'text-blue-100' : 'text-gray-500'}`}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Indicador de digitação */}
                {isTyping && (
                  <div className="px-4 py-2 text-xs text-gray-500 italic">
                    {typingUsername} está digitando...
                  </div>
                )}

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      ref={messageInputRef}
                      type="text"
                      value={inputMessage}
                      onChange={handleInputChange}
                      placeholder="Digite sua resposta..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      disabled={!isConnected}
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={!inputMessage.trim()}
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <FaComments size={60} />
                <p className="mt-4 text-sm">Selecione uma conversa</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // INTERFACE PARA CLIENTE
  return (
    <div className="fixed bottom-4 right-4 w-full max-w-md h-[600px] max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200" style={{ zIndex: 99999 }}>
      {/* Header Cliente */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
              👨‍💼
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Atendimento Online</h3>
              <p className="text-xs flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                <span className="text-blue-100">{isConnected ? 'Conectado' : 'Desconectado'}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {/* Mensagem de boas-vindas */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <span className="text-3xl mb-2 block">👋</span>
          <p className="font-semibold text-gray-900 text-sm mb-1">Bem-vindo ao suporte!</p>
          <p className="text-gray-600 text-xs">Como podemos ajudar você hoje?</p>
        </div>

        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[80%] ${
              msg.isAdmin 
                ? 'bg-white border border-gray-200 text-gray-900' 
                : 'bg-blue-600 text-white'
            } rounded-2xl px-4 py-2 shadow-sm`}>
              {msg.isAdmin && (
                <div className="text-xs font-semibold mb-1 text-blue-600">
                  {msg.fromUsername}
                </div>
              )}
              <div className="text-sm">{msg.text}</div>
              <div className={`text-xs mt-1 ${msg.isAdmin ? 'text-gray-500' : 'text-blue-100'}`}>
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Indicador de digitação */}
      {isTyping && (
        <div className="px-4 py-2 text-xs text-gray-500 italic flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
          </div>
          {typingUsername} digitando...
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white rounded-b-2xl">
        <div className="flex gap-2">
          <input
            ref={messageInputRef}
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder={isConnected ? "Digite sua mensagem..." : "Conectando..."}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={!isConnected}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={!inputMessage.trim() || !isConnected}
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;