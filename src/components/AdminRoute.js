import { Navigate } from "react-router-dom";
import { useAdmin } from "../hooks/useAdmin";
import AcessoNegado from "../pages/AcessoNegado";

export default function AdminRoute({ children }) {
  const { isAdmin, user } = useAdmin();

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
