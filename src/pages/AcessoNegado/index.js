import { Link } from "react-router-dom";

export default function AcessoNegado() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Acesso Negado
        </h1>
        <p className="text-gray-600 mb-6">
          Você não tem permissão para acessar esta área. 
          Esta seção é restrita apenas para administradores.
        </p>
        <div className="space-y-3">
          <Link 
            to="/" 
            className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para a Home
          </Link>
          <Link 
            to="/meus-pedidos" 
            className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Ver Meus Pedidos
          </Link>
        </div>
      </div>
    </div>
  );
}

