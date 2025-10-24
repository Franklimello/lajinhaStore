import Logo from "../../assets/ideal.png";
import { BsList, BsX } from "react-icons/bs";
import { FaShoppingCart, FaUser, FaHeart, FaSearch, FaWhatsapp, FaDownload, FaChartBar, FaSignInAlt, FaSignOutAlt, FaBox, FaBell } from "react-icons/fa";
import { useState, useEffect, useCallback } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { useAdmin } from "../../hooks/useAdmin";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";
import firestoreMonitor from "../../services/firestoreMonitor";


export default function Header() {
  const { user, logout } = useAuth();
  const { isAdmin } = useAdmin();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const location = useLocation();
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e) => {
      // Previna que o prompt apareça automaticamente
      e.preventDefault();
      // Armazenar deferredPrompt globalmente
      window.deferredPrompt = e;
      setShowInstallBtn(true);
    };

    const handleAppInstalled = () => {
      setShowInstallBtn(false);
      window.deferredPrompt = null;
    };

    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setShowInstallBtn(false);
    }

    // Para iOS, sempre mostrar botão (não tem beforeinstallprompt)
    if (isIOSDevice && !window.navigator.standalone) {
      setShowInstallBtn(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // Para iOS, mostrar instruções
      setShowIOSInstructions(true);
      return;
    }

    if (window.deferredPrompt) {
      setIsInstalling(true);
      try {
        // Mostra o prompt nativo de instalação
        window.deferredPrompt.prompt();
        const { outcome } = await window.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          // Solicitar permissão para notificações
          if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
          }
          
          // Mostrar notificação de sucesso
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Lajinha Instalado!', {
              body: 'O app foi instalado com sucesso!',
              icon: '/logo192.png',
              badge: '/logo192.png'
            });
          }
          
          // Só esconde o botão se aceitou
          setShowInstallBtn(false);
        } else {
          // Se recusou, mantém o botão visível para tentar novamente
          console.log('Usuário recusou a instalação, botão permanece visível');
        }
      } catch (error) {
        console.error('Erro durante instalação:', error);
      } finally {
        window.deferredPrompt = null;
        setIsInstalling(false);
      }
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const handleNavClick = () => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  };

  // Função para buscar itens do carrinho no localStorage
  const getCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      // Se o carrinho é um array de produtos
      if (Array.isArray(cart)) {
        // Se cada item tem uma propriedade 'quantity'
        return cart.reduce((total, item) => total + (item.quantity || 1), 0);
        // Ou se você quer apenas contar produtos únicos:
        // return cart.length;
      }
      return 0;
    } catch (error) {
      console.error('Erro ao ler carrinho do localStorage:', error);
      return 0;
    }
  };

  // Função para buscar itens dos favoritos no localStorage
  const getFavoritesCount = () => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      return Array.isArray(favorites) ? favorites.length : 0;
    } catch (error) {
      console.error('Erro ao ler favoritos do localStorage:', error);
      return 0;
    }
  };

  // Sistema de notificações removido

  // ============================================================
  // ✅ ATUALIZAÇÃO DE CARRINHO E FAVORITOS (mantém como está)
  // ============================================================

  const updateCounts = useCallback(() => {
    setCartCount(getCartCount());
    setFavoritesCount(getFavoritesCount());
    // ❌ NÃO atualiza mais notificações aqui - o listener faz isso automaticamente
  }, []); // user removido das dependências

  // Detectar scroll para efeito no header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar menu ao mudar de rota
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  // Carregar contadores iniciais
  useEffect(() => {
    updateCounts();
  }, [updateCounts]);

  // ============================================================
  // ✅ LISTENER DE NOTIFICAÇÕES NÃO LIDAS EM TEMPO REAL
  // ============================================================
  useEffect(() => {
    // Se não tem usuário, não precisa escutar
    if (!user) {
      setUnreadNotifications(0);
      return;
    }

    console.log('👂 [Header] Configurando listener de notificações não lidas...');

    // Query apenas das notificações NÃO LIDAS do usuário
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    // ✅ Listener em tempo real - atualiza automaticamente quando notificações mudam
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const count = snapshot.size;
        console.log(`📬 [Header] Notificações não lidas: ${count}`);
        
        // 📊 Monitorar leitura de notificações
        firestoreMonitor.trackRead('notifications', snapshot.size, {
          userId: user.uid,
          type: 'unread_count_realtime',
          isRealtime: true
        });
        
        setUnreadNotifications(count);
      },
      (error) => {
        console.error('❌ [Header] Erro ao escutar notificações:', error);
      }
    );

    // ✅ Cleanup ao desmontar ou quando user mudar
    return () => {
      console.log('🧹 [Header] Removendo listener de notificações');
      unsubscribe();
    };
  }, [user]); // Só recria listener quando user mudar

  // Sistema de notificações removido

  // Escutar mudanças no localStorage (carrinho e favoritos)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'cart' || e.key === 'favorites') {
        updateCounts();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // ✅ Intervalo apenas para carrinho/favoritos (não notificações)
    const interval = setInterval(updateCounts, 2000); // Pode aumentar para 2-3 segundos

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [updateCounts]);

  // ============================================================
  // ✅ LISTENER PARA MENSAGENS FCM (quando app está aberto)
  // ============================================================
  useEffect(() => {
    // Listener para mensagens FCM recebidas quando app está aberto
    const handleFCMMessage = (event) => {
      console.log('📬 [Header] Mensagem FCM recebida:', event.detail);
      
      // Mostra toast ou feedback visual se desejar
      // O contador de notificações já será atualizado pelo listener onSnapshot
    };

    window.addEventListener('fcm-message', handleFCMMessage);

    return () => {
      window.removeEventListener('fcm-message', handleFCMMessage);
    };
  }, []);

  // Alternativa mais eficiente: usar custom event
  useEffect(() => {
    const handleCartUpdate = () => updateCounts();
    
    // Escutar eventos customizados
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('favoritesUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('favoritesUpdated', handleCartUpdate);
    };
  }, [updateCounts]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const navItems = [
    { path: "/", label: "Início", icon: "🏠" },
    { path: "/categorias", label: "Categorias", icon: "📂" },
    { path: "/ofertas", label: "Ofertas", icon: "🏷️" },
    ...(user ? [{ path: "/meus-pedidos", label: "Meus Pedidos", icon: "📋" }] : []),
    { path: "/contato", label: "Contato", icon: "📞" },
  ];

  return (
    <>
      {/* Header principal */}
      <header 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          isScrolled 
            ? 'bg-white shadow-lg shadow-gray-200/50 border-b border-gray-200' 
            : 'bg-white shadow-lg shadow-gray-200/50'
        }`}
        style={{ 
          willChange: 'transform', 
          transform: 'translateZ(0)',
          isolation: 'isolate',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
      >
        
        
        {/* Barra superior com contato */}
        <div className="bg-gray-50 text-gray-800 py-2.5 px-4 border-b border-gray-200">
          <div className="container mx-auto flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-gray-700 font-medium">📞 (19) 99705-0303</span>
              <span className="hidden md:inline text-gray-600">✉️ contato@suaempresa.com</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1 rounded-full font-semibold shadow-lg">Entrega somente R$ 5</span>
              <a 
                href="https://wa.me/5519997050303"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-colors backdrop-blur-sm"
              >
                <FaWhatsapp className="text-emerald-400" />
                <span className="hidden sm:inline text-xs font-medium text-gray-300">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Header principal */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            
            {/* Menu hamburguer mobile */}
            <button 
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 relative"
            >
              {isMenuOpen ? (
                <BsX size={28} className="text-gray-700" />
              ) : (
                <BsList size={24} className="text-gray-700" />
              )}
            </button>
            
            {/* Logo */}
            <div className="flex items-center">
              <NavLink to="/" className="flex items-center gap-3 group">
                <div className="w-[100px] h-17 lg:w-16 lg:h-16 rounded-xl overflow-hidden ring-2 ring-gray-300 group-hover:ring-cyan-500 transition-all duration-300 transform group-hover:scale-105 shadow-2xl shadow-gray-400/50">
                  <img 
                    src={Logo} 
                    alt="Logo da empresa" 
                    className="w-full h-full object-contain bg-white/5 backdrop-blur-sm p-1"
                  />
                </div>
                <div className="hidden md:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                    Supermercado online lajinha
                  </h1>
                  <p className="text-xs text-gray-600">Qualidade e confiança</p>
                </div>
              </NavLink>
              
            </div>
            


            {/* Barra de busca desktop */}
            

            {/* Menu desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => {
                    const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200";
                    
                    if (item.path === "/ofertas") {
                      // Efeito especial para ofertas
                      return `${baseClasses} ${
                        isActive 
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg transform scale-105 relative overflow-hidden' 
                          : 'bg-gradient-to-r from-red-400 to-orange-400 text-white hover:from-red-500 hover:to-orange-500 hover:shadow-lg relative overflow-hidden'
                      }`;
                    }
                    
                    return `${baseClasses} ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/30 transform scale-105' 
                        : 'text-gray-300 hover:bg-white/10 hover:text-cyan-400'
                    }`;
                  }}
                >
                  {item.path === "/ofertas" && (
                    <>
                      {/* Efeito de fogo para ofertas */}
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-orange-500 opacity-50 animate-pulse"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-ping"></div>
                      
                      {/* Partículas de fogo */}
                      <div className="absolute -top-1 -left-1 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                      <div className="absolute -top-1 -right-1 w-1 h-1 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-red-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                    </>
                  )}
                  <span className="relative z-10">{item.path === "/ofertas" ? "🔥" : item.icon}</span>
                  <span className="text-sm relative z-10">{item.path === "/ofertas" ? "🔥 Ofertas 🔥" : item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Ações do usuário */}
            <div className="flex items-center gap-2">
              
              {/* Busca mobile */}
              

              {/* Favoritos */}
              <Link to="/favoritos" className="hidden sm:flex p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 relative group">
                <FaHeart size={20} className="text-gray-600 group-hover:text-pink-500 transition-colors" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg font-semibold">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
              </Link>

              {/* Contato */}
              <Link to="/contato" className="hidden sm:flex p-2 rounded-xl hover:bg-white/10 transition-colors duration-200 backdrop-blur-sm" title="Entre em contato">
                <span className="text-xl">📧</span>
              </Link>


              {/* Theme Toggle */}
              <ThemeToggle className="hidden sm:flex" />
              

              {/* Botão de Instalação PWA - Mobile Only */}
              {showInstallBtn && (
                <button
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  className="sm:hidden flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  title={isIOS ? "Como instalar no iPhone/iPad" : "Instalar App no seu celular"}
                >
                  {isInstalling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="text-xs font-medium">Instalando...</span>
                    </>
                  ) : (
                    <>
                      <FaDownload size={14} />
                      <span className="text-xs font-medium">
                        {isIOS ? "Instalar" : "Instalar App"}
                      </span>
                    </>
                  )}
                </button>
              )}


              {/* Notificações - apenas para usuários logados */}
              {user && (
                <Link to="/notificacoes" className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 group">
                  <FaBell size={22} className="text-gray-600 group-hover:text-cyan-500 transition-colors" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform ">
                      {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </span>
                  )}
                </Link>
              )}

              {/* Carrinho */}
              <Link to="/carrinho" className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 group">
                <FaShoppingCart size={22} className="text-gray-600 group-hover:text-cyan-500 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
              

              {/* Login/Logout */}
              {user ? (
                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-sm text-gray-700 font-medium">Olá, {user.email?.split('@')[0]}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                  >
                    <FaSignOutAlt size={16} />
                    <span className="text-sm">Sair</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-cyan-500/20"
                >
                  <FaSignInAlt size={16} />
                  <span className="text-sm">Entrar</span>
                </Link>
              )}


              {/* Admin - apenas para administradores */}
              {isAdmin && (
                <>
                  <NavLink
                    to="/painel"
                    className={({ isActive }) => `
                      hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
                        : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-600 hover:from-orange-200 hover:to-red-200'
                      }
                    `}
                  >
                    <FaUser size={16} />
                    <span className="text-sm">Admin</span>
                  </NavLink>

                  {/* Admin Pedidos */}
                  <NavLink
                    to="/admin-pedidos"
                    className={({ isActive }) => `
                      hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg' 
                        : 'bg-gradient-to-r from-green-100 to-blue-100 text-green-600 hover:from-green-200 hover:to-blue-200'
                      }
                    `}
                  >
                    <FaShoppingCart size={16} />
                    <span className="text-sm">Pedidos</span>
                  </NavLink>


                  {/* Dashboard */}
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `
                      hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                        : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 hover:from-purple-200 hover:to-pink-200'
                      }
                    `}
                  >
                    <FaChartBar size={16} />
                    <span className="text-sm">Dashboard</span>
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {/* Barra de busca mobile */}
          {isSearchOpen && (
            <div className="lg:hidden mt-4 animate-fade-in">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Menu mobile overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[105] lg:hidden"
            onClick={toggleMenu}
          />
          
          {/* Menu lateral */}
          <nav className="fixed top-0 left-0 w-80 h-full bg-white z-[110] lg:hidden transform transition-transform duration-300 shadow-2xl border-r border-gray-200 overflow-y-auto">
            <div className="p-6 pb-20">
              
              {/* Header do menu */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-cyan-500 shadow-2xl shadow-cyan-400/50">
                    <img src={Logo} alt="Logo" className="w-full h-full object-contain bg-white/5 backdrop-blur-sm p-1" />
                  </div>
                  <div>
                    <h2 className="font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">Menu</h2>
                    <p className="text-xs text-gray-600">Navegação rápida</p>
                  </div>
                </div>
                <button 
                  onClick={toggleMenu}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <BsX size={28} className="text-gray-700" />
                </button>
              </div>

              {/* Links de navegação */}
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={handleNavClick}
                      className={({ isActive }) => {
                        const baseClasses = "flex items-center gap-4 p-4 rounded-2xl transition-all duration-200";
                        
                        if (item.path === "/ofertas") {
                          // Efeito especial para ofertas
                          return `${baseClasses} ${
                            isActive 
                              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg transform scale-105 relative overflow-hidden' 
                              : 'bg-gradient-to-r from-red-400 to-orange-400 text-white hover:from-red-500 hover:to-orange-500 hover:shadow-lg relative overflow-hidden'
                          }`;
                        }
                        
                        return `${baseClasses} ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/30 transform scale-105' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`;
                      }}
                    >
                      {item.path === "/ofertas" && (
                        <>
                          {/* Efeito de fogo para ofertas */}
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-orange-500 opacity-50 animate-pulse"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-ping"></div>
                          
                          {/* Partículas de fogo */}
                          <div className="absolute -top-1 -left-1 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                          <div className="absolute -top-1 -right-1 w-1 h-1 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                          <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-red-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                        </>
                      )}
                      <span className="text-2xl relative z-10">{item.path === "/ofertas" ? "🔥" : item.icon}</span>
                      <span className="font-medium relative z-10">{item.path === "/ofertas" ? "🔥 Ofertas 🔥" : item.label}</span>
                    </NavLink>
                  </li>
                ))}
                
                {/* Seção de autenticação */}
                {user ? (
                  <>
                    <li className="pt-4 border-t border-gray-200 mt-6">
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl border border-emerald-200">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                          <FaUser className="text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Olá, {user.email?.split('@')[0]}</p>
                          <p className="text-sm text-gray-600">Bem-vindo de volta!</p>
                        </div>
                      </div>
                    </li>
                  {user && (
                    <li>
                      <Link
                        to="/notificacoes"
                        onClick={handleNavClick}
                        className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 relative border border-yellow-200"
                      >
                        <FaBell className="text-xl" />
                        <span className="font-medium">Notificações</span>
                        {unreadNotifications > 0 && (
                          <span className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2 py-1 shadow-lg font-semibold">
                            {unreadNotifications > 99 ? '99+' : unreadNotifications}
                          </span>
                        )}
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      to="/meus-pedidos"
                      onClick={handleNavClick}
                      className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 bg-blue-50 text-cyan-700 hover:bg-blue-100 border border-blue-200"
                    >
                      <FaBox className="text-xl" />
                      <span className="font-medium">Meus Pedidos</span>
                    </Link>
                  </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                      >
                        <FaSignOutAlt className="text-xl" />
                        <span className="font-medium">Sair</span>
                      </button>
                    </li>
                  </>
                ) : (
                  <li className="pt-4 border-t border-white/10 mt-6">
                    <Link
                      to="/login"
                      onClick={handleNavClick}
                      className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-cyan-500/20"
                    >
                      <FaSignInAlt className="text-xl" />
                      <span className="font-medium">Entrar</span>
                    </Link>
                  </li>
                )}

                {/* Seção administrativa - apenas para administradores */}
                {isAdmin && (
                  <>
                    <li className="pt-3 border-t border-white/10 mt-4">
                      <NavLink
                        to="/painel"
                        onClick={handleNavClick}
                        className={({ isActive }) => `
                          flex items-center gap-4 p-3 rounded-2xl transition-all duration-200
                          ${isActive 
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
                            : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-600'
                          }
                        `}
                      >
                        <FaUser className="text-lg" />
                        <span className="font-medium text-sm">Painel Admin</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/admin-pedidos"
                        onClick={handleNavClick}
                        className={({ isActive }) => `
                          flex items-center gap-4 p-3 rounded-2xl transition-all duration-200
                          ${isActive 
                            ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg' 
                            : 'bg-gradient-to-r from-green-100 to-blue-100 text-green-600'
                          }
                        `}
                      >
                        <FaShoppingCart className="text-lg" />
                        <span className="font-medium text-sm">Pedidos</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/dashboard"
                        onClick={handleNavClick}
                        className={({ isActive }) => `
                          flex items-center gap-4 p-3 rounded-2xl transition-all duration-200
                          ${isActive 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                            : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600'
                          }
                        `}
                      >
                        <FaChartBar className="text-lg" />
                        <span className="font-medium text-sm">Dashboard</span>
                      </NavLink>
                    </li>
                  </>
                )}
              </ul>

              {/* Theme Toggle Mobile */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm">Tema</h3>
                  <ThemeToggle />
                </div>
              </div>

              {/* Seção de contato no menu mobile */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="font-semibold text-white mb-3 text-sm">Fale Conosco</h3>
                <div className="space-y-2">
                  <a 
                    href="https://wa.me/5519997050303"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-colors backdrop-blur-sm border border-emerald-500/20"
                  >
                    <FaWhatsapp />
                    <span className="text-sm font-medium">WhatsApp</span>
                  </a>
                  <a 
                    href="tel:19997050303"
                    className="flex items-center gap-3 p-2 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-colors backdrop-blur-sm border border-cyan-500/20"
                  >
                    📞
                    <span className="text-sm font-medium">(19) 99705-0303</span>
                  </a>
                </div>
              </div>
            </div>
          </nav>
        </>
      )}


      {/* Modal de Instruções para iOS */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                📱 Instalar no iPhone/iPad
              </h3>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <BsX size={24} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Toque no botão <strong>Compartilhar</strong> (📤) na parte inferior da tela
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Toque em <strong>"Adicionar"</strong> no canto superior direito
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-blue-800 text-xs">
                💡 <strong>Dica:</strong> O app aparecerá na sua tela inicial como um ícone normal!
              </p>
            </div>
            
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {/* Spacer para compensar header fixo */}
      <div className="h-32"></div>
    </>
  );
}