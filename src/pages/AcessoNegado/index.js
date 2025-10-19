import { Link } from "react-router-dom";

export default function AcessoNegado() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
        <p className="text-gray-600 mb-6">
          Você não tem permissão para acessar esta página. Apenas administradores podem visualizar este conteúdo.
        </p>
        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🏠 Voltar ao Início
          </Link>
          <Link
            to="/login"
            className="block w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            🔐 Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
}