import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import React, { Suspense, lazy, useContext, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartToast from "./components/CartToast";
import StoreClosedModal from "./components/StoreClosedModal";
import WebViewBanner from "./components/WebViewBanner";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/protectedRoute";
import AdminRoute from "./components/AdminRoute";
import ImageMigration from "./components/ImageMigration";
import StorageTest from "./components/StorageTest";
import ProductList from "./components/ProductList";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ShopProvider, ShopContext } from "./context/ShopContext";
import { CartProvider } from "./context/CartContext";
import { StoreStatusProvider } from "./context/StoreStatusContext";
import { ProductsProvider } from "./context/ProductsContext";
import { NotificationService } from "./services/notificationService";

// Lazy loading para melhor performance
const Painel = lazy(() => import("./pages/Painel"));
const Categorias = lazy(() => import("./pages/Categorias"));
const Hortifruti = lazy(() => import("./pages/Hortifruti"));
const Acougue = lazy(() => import("./pages/Acougue"));
const FriosLaticinios = lazy(() => import("./pages/FriosLaticinios"));
const Mercearia = lazy(() => import("./pages/Mercearia"));
const GulosemasSnacks = lazy(() => import("./pages/GulosemasSnacks"));
const Bebidas = lazy(() => import("./pages/Bebidas"));
const BebidasGeladas = lazy(() => import("./pages/BebidasGeladas"));
const Limpeza = lazy(() => import("./pages/Limpeza"));
const HigienePessoal = lazy(() => import("./pages/HigienePessoal"));
const Cosmeticos = lazy(() => import("./pages/Cosmeticos"));
const UtilidadesDomesticas = lazy(() => import("./pages/UtilidadesDomesticas"));
const PetShop = lazy(() => import("./pages/PetShop"));
const Infantil = lazy(() => import("./pages/Infantil"));
// Lazy loading para páginas principais
const Ofertas = lazy(() => import("./pages/Ofertas"));
const Favoritos = lazy(() => import("./pages/Favoritos"));
const Cart = lazy(() => import("./pages/Cart"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
// Lazy loading para páginas restantes
const Detalhes = lazy(() => import("./pages/Detalhes"));
const Farmacia = lazy(() => import("./pages/farmacia"));
const Home = lazy(() => import("./pages/Home"));
const PagamentoPix = lazy(() => import("./pages/PagamentoPix"));
const StatusPedido = lazy(() => import("./pages/StatusPedido"));
// Lazy loading para páginas administrativas
const ConsultaPedidos = lazy(() => import("./pages/ConsultaPedidos"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const MeusPedidos = lazy(() => import("./pages/MeusPedidos"));
const PedidoDetalhes = lazy(() => import("./pages/PedidoDetalhes"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
// Lazy loading para páginas finais
const Contato = lazy(() => import("./pages/Contato"));
const Notificacoes = lazy(() => import("./pages/Notificacoes"));
const FirestoreTest = lazy(() => import("./components/FirestoreTest"));
const SorteioPage = lazy(() => import("./pages/SorteioPage"));
// Lazy loading para componentes de debug
const FirestoreDiagnostic = lazy(() => import("./components/FirestoreDiagnostic"));
const FirestoreRulesValidator = lazy(() => import("./components/FirestoreRulesValidator"));
const FirestorePermissionsTest = lazy(() => import("./components/FirestorePermissionsTest"));
const AuthDebug = lazy(() => import("./components/AuthDebug"));
const LogoutDiagnostic = lazy(() => import("./components/LogoutDiagnostic"));

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
  const { isLoading: shopLoading } = useContext(ShopContext);
  
  // Nota: removemos cartLoading para evitar re-renders desnecessários
  // O CartContext é carregado de forma independente
  
  // Exibe um spinner de carregamento enquanto o contexto está sendo inicializado
  if (shopLoading) {
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
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        }>
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
          <Route path="/cosmeticos" element={<Cosmeticos />} />
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
          <Route path="/notificacoes" element={<Notificacoes />} />
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
            path="/sorteio"
            element={
              <AdminRoute>
                <SorteioPage />
              </AdminRoute>
            }
          />
                      <Route
                        path="/test-permissions"
                        element={<FirestorePermissionsTest />}
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
        </Suspense>
      </Layout>
      
      {/* Toast de notificação global - Componente isolado */}
      <CartToast />
      
      {/* Modal de loja fechada */}
      <StoreClosedModal />
      
      {/* Debug de autenticação - apenas em desenvolvimento */}
      <AuthDebug />
      
      {/* Diagnóstico de logout - apenas em desenvolvimento */}
      <LogoutDiagnostic />
    </>
  );
}

// Componente principal do App
function App() {
  // Inicializar sistema de notificações
  useEffect(() => {
    try {
      NotificationService.setupMessageListener();
    } catch (error) {
      console.warn('Erro ao configurar notificações:', error);
    }
  }, []);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ThemeProvider>
          <AuthProvider>
            <StoreStatusProvider>
              <ProductsProvider>
                <ShopProvider>
                  <CartProvider>
                    <AppContent />
                  </CartProvider>
                </ShopProvider>
              </ProductsProvider>
            </StoreStatusProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;