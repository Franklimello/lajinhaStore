import { createContext, useContext, useEffect, useState } from "react";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";

const AuthContext = createContext({ 
  user: null, 
  loading: true, 
  login: () => {}, 
  register: () => {}, 
  loginWithGoogle: () => {},
  logout: () => {} 
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔐 AuthContext: Inicializando listener de autenticação...");
    const auth = getAuth();
    
    // ⏱️ Timeout de segurança: libera loading após 3 segundos (iPhone/Safari pode demorar)
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ AuthContext: Timeout de segurança ativado (3s) - liberando app');
      setLoading(false);
    }, 3000);
    
    // Configurar persistência local com mais detalhes
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log("✅ Persistência local configurada com sucesso");
      })
      .catch((error) => {
        console.error("❌ Erro ao configurar persistência:", error);
        console.error("Detalhes do erro:", {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
      });
    
    // Verificar se já existe um usuário logado
    const currentUser = auth.currentUser;
    console.log("🔍 Verificando usuário atual:", currentUser ? "Encontrado" : "Não encontrado");
    if (currentUser) {
      console.log("🔐 AuthContext: Usuário já logado encontrado:", {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        emailVerified: currentUser.emailVerified,
        lastSignInTime: currentUser.metadata?.lastSignInTime,
        creationTime: currentUser.metadata?.creationTime
      });
      setUser(currentUser);
      clearTimeout(timeoutId);
      setLoading(false);
    }
    
    const unsub = onAuthStateChanged(auth, (u) => {
      clearTimeout(timeoutId); // Limpa timeout quando auth responde
      const timestamp = new Date().toLocaleTimeString();
      console.log(`🔐 AuthContext [${timestamp}]: Estado de autenticação mudou:`, u ? "Usuário logado" : "Usuário deslogado");
      
      if (u) {
        console.log("👤 Usuário logado:", {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          emailVerified: u.emailVerified,
          lastSignInTime: u.metadata?.lastSignInTime,
          creationTime: u.metadata?.creationTime,
          providerData: u.providerData?.map(p => ({ providerId: p.providerId, uid: p.uid }))
        });
      } else {
        console.log("❌ Usuário deslogado - possíveis causas:");
        console.log("- Token expirado");
        console.log("- Sessão inválida");
        console.log("- Erro de rede");
        console.log("- Logout manual");
      }
      
      setUser(u);
      setLoading(false);
    });
    
    return () => {
      console.log("🔐 AuthContext: Removendo listener de autenticação");
      clearTimeout(timeoutId);
      unsub();
    };
  }, []);

  // Função de login
  const login = async (email, password) => {
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Função de cadastro
  const register = async (email, password) => {
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Função de login com Google
  const loginWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    
    // Configurações adicionais do provider
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      console.log("🔐 Tentando login com Google...");
      
      // Verifica se estamos em um ambiente seguro
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        throw new Error('Login com Google requer HTTPS em produção');
      }
      
      const result = await signInWithPopup(auth, provider);
      console.log("✅ Login com Google bem-sucedido:", result.user);
      return { success: true, user: result.user };
    } catch (error) {
      console.error("❌ Erro no login com Google:", error);
      
      // Tratamento específico de erros
      let errorMessage = error.message;
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login cancelado pelo usuário';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bloqueado pelo navegador. Permita popups para este site.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else if (error.code === 'auth/internal-error') {
        errorMessage = 'Erro interno. Tente novamente em alguns minutos.';
      }
      
      return { success: false, error: errorMessage, code: error.code };
    }
  };

  // Função de logout
  const logout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
