import Logo from "../../assets/ideal.png";
import { BsList, BsX } from "react-icons/bs";
import { FaShoppingCart, FaUser, FaHeart, FaSearch, FaBell, FaWhatsapp } from "react-icons/fa";
import { useState, useEffect, useCallback } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const location = useLocation();

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

  // Função para atualizar contadores (estabilizada)
  const updateCounts = useCallback(() => {
    setCartCount(getCartCount());
    setFavoritesCount(getFavoritesCount());
  }, []);

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

  // Escutar mudanças no localStorage
  useEffect(() => {
    // Função para escutar mudanças no localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'cart' || e.key === 'favorites') {
        updateCounts();
      }
    };

    // Escutar mudanças de outras abas/janelas
    window.addEventListener('storage', handleStorageChange);

    // Criar um intervalo para verificar mudanças na mesma aba
    // (localStorage events não disparam na mesma aba que fez a mudança)
    const interval = setInterval(updateCounts, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [updateCounts]);

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

  const navItems = [
    { path: "/", label: "Início", icon: "🏠" },
    { path: "/categorias", label: "Categorias", icon: "📂" },
    { path: "/ofertas", label: "Ofertas", icon: "🏷️" },
    { path: "/contato", label: "Contato", icon: "📞" },
  ];

  return (
    <>
      {/* Header principal */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-white shadow-md'
      }`}>
        
        {/* Barra superior com contato */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4">
          <div className="container mx-auto flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline">📞 (19) 99705-0303</span>
              <span className="hidden md:inline">✉️ contato@suaempresa.com</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Entrega somente R$ 5</span>
              <a 
                href="https://wa.me/5519997050303"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:bg-white/10 px-2 py-1 rounded transition-colors"
              >
                <FaWhatsapp className="text-green-300" />
                <span className="hidden sm:inline text-xs">WhatsApp</span>
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
              <BsList size={24} className="text-gray-700" />
            </button>

            {/* Logo */}
            <div className="flex items-center">
              <NavLink to="/" className="flex items-center gap-3 group">
                <div className="w-[100px] h-17 lg:w-16 lg:h-16 rounded-xl overflow-hidden ring-2 ring-transparent group-hover:ring-blue-500 transition-all duration-300 transform group-hover:scale-105">
                  <img 
                    src={Logo} 
                    alt="Logo da empresa" 
                    className="w-full h-full object-contain bg-gradient-to-br from-blue-50 to-purple-50 p-1"
                  />
                </div>
                <div className="hidden md:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Supermercado online lajinha
                  </h1>
                  <p className="text-xs text-gray-500">Qualidade e confiança</p>
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
                  className={({ isActive }) => `
                    flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    }
                  `}
                >
                  <span>{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Ações do usuário */}
            <div className="flex items-center gap-2">
              
              {/* Busca mobile */}
              

              {/* Favoritos */}
              <Link to="/favoritos" className="hidden sm:flex p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 relative">
                <FaHeart size={20} className="text-gray-700 hover:text-red-500" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
              </Link>

              {/* Notificações */}
              <button className="hidden sm:flex p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 relative">
                <FaBell size={20} className="text-gray-700 hover:text-yellow-500" />
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </button>

              {/* Carrinho */}
              <Link to="/carrinho" className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 group">
                <FaShoppingCart size={22} className="text-gray-700 group-hover:text-blue-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Admin */}
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
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleMenu}
          />
          
          {/* Menu lateral */}
          <nav className="fixed top-0 left-0 w-80 h-full bg-white z-50 lg:hidden transform transition-transform duration-300 shadow-2xl">
            <div className="p-6">
              
              {/* Header do menu */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-blue-500">
                    <img src={Logo} alt="Logo" className="w-full h-full object-contain bg-blue-50 p-1" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800">Menu</h2>
                    <p className="text-xs text-gray-500">Navegação rápida</p>
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
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={handleNavClick}
                      className={({ isActive }) => `
                        flex items-center gap-4 p-4 rounded-2xl transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
                
                <li className="pt-4 border-t border-gray-200 mt-6">
                  <NavLink
                    to="/painel"
                    onClick={handleNavClick}
                    className={({ isActive }) => `
                      flex items-center gap-4 p-4 rounded-2xl transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
                        : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-600'
                      }
                    `}
                  >
                    <FaUser className="text-xl" />
                    <span className="font-medium">Painel Admin</span>
                  </NavLink>
                </li>
              </ul>

              {/* Seção de contato no menu mobile */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">Fale Conosco</h3>
                <div className="space-y-3">
                  <a 
                    href="https://wa.me/5519997050303"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    <FaWhatsapp />
                    <span className="text-sm font-medium">WhatsApp</span>
                  </a>
                  <a 
                    href="tel:19997050303"
                    className="flex items-center gap-3 p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
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

      {/* Spacer para compensar header fixo */}
      <div className="h-32"></div>
    </>
  );
}