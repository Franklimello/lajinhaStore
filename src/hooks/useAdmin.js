import { useAuth } from '../context/AuthContext';

// UID do administrador autorizado
const ADMIN_UID = 'ZG5D6IrTRTZl5SDoEctLAtr4WkE2';

export const useAdmin = () => {
  const { user } = useAuth();
  
  // Verifica se o usuário atual é o administrador
  const isAdmin = user?.uid === ADMIN_UID;
  
  return {
    isAdmin,
    user
  };
};

