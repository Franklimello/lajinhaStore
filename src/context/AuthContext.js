import { createContext, useContext, useEffect, useState } from "react";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut 
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
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
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
