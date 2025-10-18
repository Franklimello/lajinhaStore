import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Login from "../../pages/Login";
import Register from "../../pages/Register";

export default function CheckoutGuard({ children, onAuthSuccess }) {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  // Se o usuário está autenticado, mostra o checkout
  if (user) {
    return children;
  }

  // Se não está autenticado, mostra opções de login/cadastro
  const handleLoginSuccess = () => {
    setShowLogin(false);
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  const handleBackToCart = () => {
    navigate("/carrinho");
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto pt-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Finalizar Compra</h2>
              <button
                onClick={() => setShowLogin(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Faça login para continuar com sua compra
            </p>
          </div>
          <Login onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>
    );
  }

  if (showRegister) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto pt-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Finalizar Compra</h2>
              <button
                onClick={() => setShowRegister(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Crie uma conta para continuar com sua compra
            </p>
          </div>
          <Register onRegisterSuccess={handleRegisterSuccess} />
        </div>
      </div>
    );
  }

  // Modal de autenticação obrigatória
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Login Obrigatório
          </h2>
          <p className="text-gray-600">
            Você precisa estar logado para finalizar sua compra
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setShowLogin(true)}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Fazer Login
          </button>
          
          <button
            onClick={() => setShowRegister(true)}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Criar Conta
          </button>
          
          <button
            onClick={handleBackToCart}
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Voltar ao Carrinho
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Seus itens estão seguros no carrinho
          </p>
        </div>
      </div>
    </div>
  );
}

