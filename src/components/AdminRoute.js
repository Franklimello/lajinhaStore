import { Navigate } from "react-router-dom";
import { useAdmin } from "../hooks/useAdmin";
import { useAuth } from "../context/AuthContext";
import AcessoNegado from "../pages/AcessoNegado";

export default function AdminRoute({ children }) {
  const { isAdmin, user } = useAdmin();
  const { loading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se não está logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se está logado mas não é admin, mostra página de acesso negado
  if (!isAdmin) {
    return <AcessoNegado />;
  }

  // Se é admin, permite acesso
  return children;
}
