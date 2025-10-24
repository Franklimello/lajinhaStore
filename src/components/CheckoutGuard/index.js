import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Login from "../../pages/Login";
import Register from "../../pages/Register";

export default function CheckoutGuard({ children, onAuthSuccess }) {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Aguarda o carregamento do contexto de autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se o usuário está autenticado, mostra o checkout
  if (user) {
    return (
      <>
        {children}
        {/* Mensagem de sucesso após login */}
        {showSuccessMessage && (
          <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-bounce">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-bold">Login realizado com sucesso!</p>
                <p className="text-sm">Agora você pode finalizar sua compra</p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Se não está autenticado, renderiza o botão desabilitado com tooltip
  const handleClick = (e) => {
    e.preventDefault();
    setShowLogin(true);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setShowSuccessMessage(true);
    
    // Remove mensagem após 3 segundos
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
    
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    setShowSuccessMessage(true);
    
    // Remove mensagem após 3 segundos
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
    
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  if (showLogin) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Faça Login para Continuar
            </h2>
            <p className="text-gray-600">
              Entre na sua conta para finalizar a compra
            </p>
          </div>
          
          <Login onLoginSuccess={handleLoginSuccess} />
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 mb-2">Não tem uma conta?</p>
            <button
              onClick={() => {
                setShowLogin(false);
                setShowRegister(true);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Criar Conta
            </button>
          </div>

          <button
            onClick={() => setShowLogin(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (showRegister) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">✨</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Crie sua Conta
            </h2>
            <p className="text-gray-600">
              Cadastre-se para finalizar sua compra
            </p>
          </div>
          
          <Register onRegisterSuccess={handleRegisterSuccess} />
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 mb-2">Já tem uma conta?</p>
            <button
              onClick={() => {
                setShowRegister(false);
                setShowLogin(true);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Fazer Login
            </button>
          </div>

          <button
            onClick={() => setShowRegister(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // Se não está autenticado, clona o children e adiciona handler de click
  return (
    <div className="relative">
      <div onClick={handleClick}>
        {children}
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm text-gray-600">
          🔐 <span className="font-medium">Faça login ou cadastre-se</span> para finalizar sua compra
        </p>
      </div>
    </div>
  );
}

