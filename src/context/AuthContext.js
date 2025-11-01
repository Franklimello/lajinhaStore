import { createContext, useContext, useEffect, useState } from "react";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { Capacitor } from "@capacitor/core";
import { isNative } from "../utils/capacitor";
import { app } from "../firebase/config";

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
    const auth = getAuth(app);
    
    // Inicializar GoogleAuth plugin do Capacitor (apenas no mobile)
    if (isNative()) {
      try {
        GoogleAuth.initialize({
          clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID_WEB || "821962501479-62l3rrcc0vk9suhnvip7lqfslg4v8po2.apps.googleusercontent.com",
          scopes: ["profile", "email"],
          grantOfflineAccess: true,
        });
        console.log("✅ GoogleAuth plugin inicializado (Capacitor)");
        console.log("📋 Client ID configurado:", process.env.REACT_APP_GOOGLE_CLIENT_ID_WEB || "821962501479-62l3rrcc0vk9suhnvip7lqfslg4v8po2.apps.googleusercontent.com");
      } catch (error) {
        console.warn("⚠️ Erro ao inicializar GoogleAuth plugin:", error);
      }
    }
    
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
    
    // ⚠️ NÃO usar getRedirectResult quando estiver usando plugin do Capacitor
    // O plugin do Capacitor não usa redirects, usa o app nativo do Google
    // getRedirectResult só é necessário quando usando signInWithRedirect do Firebase
    // Agora estamos usando GoogleAuth.signIn() que não precisa de redirect
    
    // Verificar se já existe um usuário logado (apenas para web/não-redirect)
    const currentUser = auth.currentUser;
    console.log("🔍 Verificando usuário atual:", currentUser ? "Encontrado" : "Não encontrado");
    
    // Não setar user aqui se estamos processando redirect - deixar onAuthStateChanged fazer
    if (currentUser && !isNative()) {
      console.log("🔐 AuthContext: Usuário já logado encontrado:", {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        emailVerified: currentUser.emailVerified,
        lastSignInTime: currentUser.metadata?.lastSignInTime,
        creationTime: currentUser.metadata?.creationTime
      });
    }
    
    // Configurar listener de estado de autenticação
    // Este listener vai capturar mudanças de autenticação, incluindo redirects
    const unsub = onAuthStateChanged(auth, (u) => {
      clearTimeout(timeoutId); // Limpa timeout quando auth responde
      const timestamp = new Date().toLocaleTimeString();
      console.log(`🔐 AuthContext [${timestamp}]: Estado de autenticação mudou:`, u ? "Usuário logado" : "Usuário deslogado");
      
      // Adicionar pequeno delay após redirect para evitar conflitos com Firestore
      const updateUser = () => {
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
      };
      
      // Com o plugin do Capacitor, não há redirects, então podemos atualizar imediatamente
      updateUser();
    }, (error) => {
      // Tratamento de erros do listener
      console.error("❌ Erro no listener de autenticação:", error);
      // Não bloquear a aplicação - apenas logar o erro
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
    // Inicializar auth com app configurado (para usar authDomain correto)
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    
    // Configurações adicionais do provider
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      console.log("🔐 Tentando login com Google...");
      console.log("📱 Ambiente:", isNative() ? "Mobile/Capacitor" : "Web");
      
      // 🔄 DETECTAR AMBIENTE E USAR MÉTODO CORRETO
      if (isNative()) {
        // MOBILE/CAPACITOR: Usar plugin nativo do Capacitor (NÃO usa localhost)
        console.log("📱 Ambiente detectado: Mobile/Capacitor");
        console.log("📱 Plataforma:", Capacitor.getPlatform());
        console.log("📱 Usando GoogleAuth plugin do Capacitor (mobile)...");
        
        // Verificar se o plugin foi inicializado
        try {
          // O plugin do Capacitor usa o app nativo do Google, não WebView/localhost
          console.log("🔄 Chamando GoogleAuth.signIn()...");
          const result = await GoogleAuth.signIn();
          
          console.log("✅ Login Google (Capacitor) bem-sucedido:", result);
          console.log("📋 Resultado completo:", JSON.stringify(result, null, 2));
          
          // Converter o resultado do plugin para credencial do Firebase
          if (result && result.authentication && result.authentication.idToken) {
            console.log("🔑 ID Token recebido, criando credencial Firebase...");
            // Criar credencial do Firebase usando o ID token do Google
            const credential = GoogleAuthProvider.credential(result.authentication.idToken);
            
            console.log("🔐 Fazendo login no Firebase com credencial...");
            // Fazer login no Firebase com a credencial
            const firebaseUser = await signInWithCredential(auth, credential);
            
            console.log("✅ Login Firebase bem-sucedido:", firebaseUser.user);
            return { success: true, user: firebaseUser.user };
          } else {
            console.error("❌ Token de autenticação não encontrado no resultado");
            console.error("📋 Estrutura do resultado:", result);
            throw new Error("Token de autenticação não recebido do Google. Estrutura do resultado: " + JSON.stringify(result));
          }
        } catch (error) {
          console.error("❌ Erro no login Google (Capacitor):", error);
          console.error("📋 Tipo do erro:", typeof error);
          console.error("📋 Classe do erro:", error?.constructor?.name);
          console.error("📋 Detalhes completos:", {
            code: error?.code,
            message: error?.message,
            stack: error?.stack,
            name: error?.name,
            toString: error?.toString(),
            stringified: JSON.stringify(error, Object.getOwnPropertyNames(error))
          });
          
          // NÃO usar signInWithRedirect como fallback - causa o problema de localhost
          // Mostrar erro claro ao usuário com mais detalhes
          let errorMessage = "Erro ao fazer login com Google.";
          
          // Verificar diferentes tipos de erros
          const errorStr = String(error?.message || error || "");
          
          if (errorStr.toLowerCase().includes("cancel") || errorStr.toLowerCase().includes("cancelled")) {
            errorMessage = "Login cancelado pelo usuário.";
          } else if (errorStr.toLowerCase().includes("network") || errorStr.toLowerCase().includes("connection")) {
            errorMessage = "Erro de conexão. Verifique sua internet.";
          } else if (error?.code === "auth/operation-not-allowed") {
            errorMessage = "Login com Google não está habilitado.";
          } else if (errorStr.toLowerCase().includes("sign_in")) {
            errorMessage = "Erro ao iniciar login. Verifique se o Google Play Services está instalado.";
          } else if (errorStr.toLowerCase().includes("not found") || errorStr.toLowerCase().includes("undefined")) {
            errorMessage = "Plugin do Google não encontrado. Reinstale o app.";
          } else {
            // Mostrar o erro original para debug
            errorMessage = `Erro: ${errorStr.substring(0, 100)}`;
          }
          
          return { 
            success: false, 
            error: errorMessage,
            code: error?.code,
            details: errorStr,
            fullError: error?.toString()
          };
        }
      } else {
        // WEB: Usar signInWithPopup (funciona melhor no navegador)
        console.log("🌐 Usando signInWithPopup (web)...");
        
        // Verifica se estamos em um ambiente seguro
        if (!window.isSecureContext && window.location.hostname !== 'localhost') {
          throw new Error('Login com Google requer HTTPS em produção');
        }
        
        const result = await signInWithPopup(auth, provider);
        console.log("✅ Login com Google bem-sucedido:", result.user);
        return { success: true, user: result.user };
      }
    } catch (error) {
      console.error("❌ Erro no login com Google:", error);
      console.error("Detalhes:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
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
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'Domínio não autorizado. Entre em contato com o suporte.';
      } else if (error.message && error.message.includes('estado inicial')) {
        errorMessage = 'Erro de sessão. Tente fechar e abrir o app novamente.';
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
