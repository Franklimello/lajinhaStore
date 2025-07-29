import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Busca from "./components/Busca";
import Painel from "./pages/Painel";
import Login from "./pages/Login";
import Home from "./pages/Home"
import ProtectedRoute from "./components/protectedRoute";
import { AuthProvider } from "./context/AuthContext";

function Layout({ children }) {
  const location = useLocation();
  const hideChrome = location.pathname === "/login"; // esconde Header/Busca/Footer no login

  return (
    <section className="flex flex-col min-h-screen">
      {!hideChrome && <Header />}
      {!hideChrome && <Busca />}
      <main className="flex-grow p-4 bg-gray-50">{children}</main>
      {!hideChrome && <Footer />}
    </section>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/painel"
              element={
                <ProtectedRoute>
                  <Painel />
                </ProtectedRoute>
              }
            />
            {/* (Opcional) rota inicial */}
            <Route path="/" element={<Home/>}/>
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
