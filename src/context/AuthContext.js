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
      setLoading(false);
    }
    
    const unsub = onAuthStateChanged(auth, (u) => {
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
    
    try {
      const result = await signInWithPopup(auth, provider);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
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
