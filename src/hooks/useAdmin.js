import { useAuth } from '../context/AuthContext';

// UIDs dos administradores autorizados
const ADMIN_UIDS = [
  'ZG5D6IrTRTZl5SDoEctLAtr4WkE2',
  '6VbaNslrhQhXcyussPj53YhLiYj2'
];

export const useAdmin = () => {
  const { user } = useAuth();
  
  // Verifica se o usuário atual é um dos administradores
  const isAdmin = user?.uid && ADMIN_UIDS.includes(user.uid);
  
  return {
    isAdmin,
    user
  };
};

