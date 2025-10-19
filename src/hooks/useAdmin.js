import { useAuth } from '../context/AuthContext';
import { appConfig } from '../config/appConfig';

export const useAdmin = () => {
  const { user } = useAuth();
  
  // Verifica se o usuário atual é um dos administradores
  const isAdmin = user?.uid && appConfig.ADMIN_UIDS.includes(user.uid);
  
  return {
    isAdmin,
    user
  };
};

