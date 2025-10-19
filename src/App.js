import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import WebViewBanner from "./components/WebViewBanner";
import Painel from "./pages/Painel";
import Categorias from "./pages/Categorias"
import Hortifruti from "./pages/Hortifruti"
import Acougue from "./pages/Acougue"
import FriosLaticinios from "./pages/FriosLaticinios"
import Mercearia from "./pages/Mercearia"
import GulosemasSnacks from "./pages/GulosemasSnacks"
import Bebidas from "./pages/Bebidas"
import BebidasGeladas from "./pages/BebidasGeladas"
import Limpeza from "./pages/Limpeza"
import HigienePessoal from "./pages/HigienePessoal"
import UtilidadesDomesticas from "./pages/UtilidadesDomesticas"
import PetShop from "./pages/PetShop"
import Infantil from "./pages/Infantil"
import Ofertas from "./pages/Ofertas"
import Favoritos from "./pages/Favoritos";
import Cart from "./pages/Cart"
import Login from "./pages/Login";
import Register from "./pages/Register";
import Detalhes from "./pages/Detalhes";
import Farmacia from "./pages/farmacia";
import Home from "./pages/Home";
import PagamentoPix from "./pages/PagamentoPix";
import StatusPedido from "./pages/StatusPedido";
import ConsultaPedidos from "./pages/ConsultaPedidos";
import DashboardPage from "./pages/Dashboard";
import MeusPedidos from "./pages/MeusPedidos";
import PedidoDetalhes from "./pages/PedidoDetalhes";
import AdminOrders from "./pages/AdminOrders";
import Contato from "./pages/Contato";
import Notificacoes from "./pages/Notificacoes";
import NotificationDiagnostic from "./components/NotificationDiagnostic";
import NotificationTest from "./components/NotificationTest";
import FirestoreTest from "./components/FirestoreTest";
import FirestoreDiagnostic from "./components/FirestoreDiagnostic";
import FirestoreRulesValidator from "./components/FirestoreRulesValidator";
import FirestorePermissionsTest from "./components/FirestorePermissionsTest";
import AuthDebug from "./components/AuthDebug";
import LogoutDiagnostic from "./components/LogoutDiagnostic";
import ProtectedRoute from "./components/protectedRoute";
import AdminRoute from "./components/AdminRoute";
import ImageMigration from "./components/ImageMigration";
import StorageTest from "./components/StorageTest";
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
  // esconde Header e Footer nas páginas de login e cadastro
  const hideChrome = location.pathname === "/login" || location.pathname === "/register"; 

  return (
    <section className="flex flex-col min-h-screen">
      <WebViewBanner />
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
          <Route path="/register" element={<Register />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/hortifruti" element={<Hortifruti />} />
          <Route path="/acougue" element={<Acougue />} />
          <Route path="/frios-laticinios" element={<FriosLaticinios />} />
          <Route path="/farmacia" element={<Farmacia />} />
          <Route path="/mercearia" element={<Mercearia />} />
          <Route path="/guloseimas-snacks" element={<GulosemasSnacks />} />
          <Route path="/bebidas" element={<Bebidas />} />
          <Route path="/bebidas-geladas" element={<BebidasGeladas />} />
          <Route path="/limpeza" element={<Limpeza />} />
          <Route path="/higiene-pessoal" element={<HigienePessoal />} />
          <Route path="/utilidades-domesticas" element={<UtilidadesDomesticas />} />
          <Route path="/pet-shop" element={<PetShop />} />
          <Route path="/infantil" element={<Infantil />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/contato" element={<Contato />} />
          
          <Route path="/detalhes/:id" element={<Detalhes />} />
          <Route
            path="/painel"
            element={
              <AdminRoute>
                <Painel />
              </AdminRoute>
            }
          />
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<ProductList />} />
          <Route path="/carrinho" element={<Cart />} />
          <Route path="/pagamento-pix" element={<PagamentoPix />} />
          <Route path="/consulta-pedidos" element={<ConsultaPedidos />} />
          <Route path="/status-pedido/:orderId" element={<StatusPedido />} />
          <Route
            path="/meus-pedidos"
            element={
              <ProtectedRoute>
                <MeusPedidos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pedido/:id"
            element={
              <ProtectedRoute>
                <PedidoDetalhes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <DashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin-pedidos"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />
                      <Route
                        path="/notificacoes"
                        element={
                          <AdminRoute>
                            <Notificacoes />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="/test-permissions"
                        element={<FirestorePermissionsTest />}
                      />
          <Route
            path="/diagnostic-notifications"
            element={
              <AdminRoute>
                <NotificationDiagnostic />
              </AdminRoute>
            }
          />
          <Route
            path="/test-notifications"
            element={
              <AdminRoute>
                <NotificationTest />
              </AdminRoute>
            }
          />
          <Route
            path="/test-firestore"
            element={
              <ProtectedRoute>
                <FirestoreTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diagnostic-firestore"
            element={
              <ProtectedRoute>
                <FirestoreDiagnostic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validate-firestore-rules"
            element={
              <ProtectedRoute>
                <FirestoreRulesValidator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/migrate-images"
            element={
              <AdminRoute>
                <ImageMigration />
              </AdminRoute>
            }
          />
          <Route
            path="/test-storage"
            element={
              <AdminRoute>
                <StorageTest />
              </AdminRoute>
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
      
      {/* Debug de autenticação - apenas em desenvolvimento */}
      <AuthDebug />
      
      {/* Diagnóstico de logout - apenas em desenvolvimento */}
      <LogoutDiagnostic />
    </>
  );
}

// Componente principal do App
function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <ShopProvider>
              <AppContent />
            </ShopProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;