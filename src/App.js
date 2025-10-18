import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import Painel from "./pages/Painel";
import Categorias from "./pages/Categorias"
import Hortifruti from "./pages/Hortifruti"
import Acougue from "./pages/Acougue"
import FriosLaticinios from "./pages/FriosLaticinios"
import Mercearia from "./pages/Mercearia"
import GulosemasSnacks from "./pages/GulosemasSnacks"
import Bebidas from "./pages/Bebidas"
import Limpeza from "./pages/Limpeza"
import HigienePessoal from "./pages/HigienePessoal"
import UtilidadesDomesticas from "./pages/UtilidadesDomesticas"
import PetShop from "./pages/PetShop"
import Infantil from "./pages/Infantil"
import Ofertas from "./pages/Ofertas"
import Favoritos from "./pages/Favoritos";
import Cart from "./pages/Cart"
import Login from "./pages/Login";
import Detalhes from "./pages/Detalhes";
import Farmacia from "./pages/farmacia";
import Home from "./pages/Home";
import PagamentoPix from "./pages/PagamentoPix";
import PainelPedidos from "./pages/PainelPedidos";
import StatusPedido from "./pages/StatusPedido";
import ConsultaPedidos from "./pages/ConsultaPedidos";
import DashboardPage from "./pages/Dashboard";
import ProtectedRoute from "./components/protectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// Contexto de carrinho/favorito
import { ShopProvider, ShopContext } from "./context/ShopContext";

// Páginas
import ProductList from "./components/ProductList";

import { useContext } from "react";

// Componente Layout que lida com a navegação e o layout principal
function Layout({ children }) {
  const location = useLocation();
  // esconde Header e Footer na página de login
  const hideChrome = location.pathname === "/login"; 

  return (
    <section className="flex flex-col min-h-screen">
      {!hideChrome && <Header />}
      <main className="flex-1 overflow-auto p-4 bg-gray-50">{children}</main>
      {!hideChrome && <Footer />}
    </section>
  );
}

// Novo componente que lida com o carregamento do contexto
function AppContent() {
  // Obtém o estado de carregamento do contexto
  const { isLoading, toast, hideToast } = useContext(ShopContext);

  // Exibe um spinner de carregamento enquanto o contexto está sendo inicializado
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Quando o carregamento for concluído, renderiza o resto da aplicação
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/hortifruti" element={<Hortifruti />} />
          <Route path="/acougue" element={<Acougue />} />
          <Route path="/frios-laticinios" element={<FriosLaticinios />} />
          <Route path="/farmacia" element={<Farmacia />} />
          <Route path="/mercearia" element={<Mercearia />} />
          <Route path="/guloseimas-snacks" element={<GulosemasSnacks />} />
          <Route path="/bebidas" element={<Bebidas />} />
          <Route path="/limpeza" element={<Limpeza />} />
          <Route path="/higiene-pessoal" element={<HigienePessoal />} />
          <Route path="/utilidades-domesticas" element={<UtilidadesDomesticas />} />
          <Route path="/pet-shop" element={<PetShop />} />
          <Route path="/infantil" element={<Infantil />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/favoritos" element={<Favoritos />} />
          
          <Route path="/detalhes/:id" element={<Detalhes />} />
          <Route
            path="/painel"
            element={
              <ProtectedRoute>
                <Painel />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<ProductList />} />
          <Route path="/carrinho" element={<Cart />} />
          <Route path="/pagamento-pix" element={<PagamentoPix />} />
          <Route path="/consulta-pedidos" element={<ConsultaPedidos />} />
          <Route path="/status-pedido/:orderId" element={<StatusPedido />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/painel-pedidos"
            element={
              <ProtectedRoute>
                <PainelPedidos />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
      
      {/* Toast de notificação global */}
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  );
}

// Componente principal do App
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ShopProvider>
            <AppContent />
          </ShopProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;