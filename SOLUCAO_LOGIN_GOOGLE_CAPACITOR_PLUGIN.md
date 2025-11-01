# ✅ Solução: Login Google no Mobile usando Plugin do Capacitor

## ❌ **PROBLEMA RESOLVIDO:**
```
Ao clicar em "Entrar com Google" no app mobile:
→ Redireciona para localhost/login
→ ERR_CONNECTION_REFUSED
```

**Causa:** O Firebase Authentication estava usando `window.location.origin` (que é `https://localhost` no Capacitor) para construir o redirect URL, que não funciona em apps nativos.

---

## ✅ **SOLUÇÃO IMPLEMENTADA:**

### **Plugin: `@codetrix-studio/capacitor-google-auth`**

Este plugin usa o **app nativo do Google** no dispositivo, não uma WebView com localhost. É a forma correta de fazer login Google em apps Capacitor.

---

## 🔧 **O QUE FOI FEITO:**

### 1. **Instalação do Plugin:**
```bash
npm install @codetrix-studio/capacitor-google-auth --legacy-peer-deps
npx cap sync
```

### 2. **Código Modificado:**

**`src/context/AuthContext.js`:**
- ✅ Importado `GoogleAuth` do plugin
- ✅ Importado `signInWithCredential` do Firebase
- ✅ Inicialização do plugin no `useEffect` (apenas no mobile)
- ✅ Modificada função `loginWithGoogle()` para usar o plugin no mobile

**Como funciona agora:**

1. **No Mobile (Capacitor):**
   - Usa `GoogleAuth.signIn()` do plugin
   - Abre o app nativo do Google no dispositivo
   - Recebe o token de autenticação
   - Converte para credencial do Firebase
   - Faz login no Firebase

2. **No Web:**
   - Continua usando `signInWithPopup()` normalmente
   - Funciona no navegador como antes

---

## 📝 **CONFIGURAÇÃO NECESSÁRIA:**

### **Client ID do Google:**

O plugin precisa do **Client ID Web** (não do Android). Configure no código:

```javascript
GoogleAuth.initialize({
  clientId: "SEU_CLIENT_ID_WEB.apps.googleusercontent.com",
  scopes: ["profile", "email"],
  grantOfflineAccess: true,
});
```

**Onde encontrar o Client ID Web:**
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione o projeto: **compreaqui-324df**
3. Vá em **APIs & Services** → **Credentials**
4. Procure por **OAuth 2.0 Client ID** do tipo **Web application**
5. Copie o **Client ID**

**Ou configure via variável de ambiente:**
```env
REACT_APP_GOOGLE_CLIENT_ID_WEB=seu-client-id-web.apps.googleusercontent.com
```

---

## 🚀 **TESTAR:**

### 1. **Rebuild do app:**
```bash
npm run build
npx cap sync
```

### 2. **No Android Studio:**
- **Sync Project** (File → Sync Project with Gradle Files)
- Execute no dispositivo ou emulador

### 3. **Teste o login:**
- Abra o app
- Clique em "Entrar com Google"
- Deve abrir o app nativo do Google (não localhost!)
- Após login, volta para o app automaticamente
- ✅ Login completo!

---

## ⚠️ **IMPORTANTE:**

### **Diferença entre Client IDs:**

| Tipo | Uso | Onde usar |
|------|-----|-----------|
| **Web Client ID** | Plugin do Capacitor | `GoogleAuth.initialize()` |
| **Android Client ID** | Firebase SDK | Firebase Console → Authentication |

**Para o plugin funcionar, você precisa do Client ID Web!**

---

## 🔍 **VERIFICAÇÃO:**

Se o login ainda não funcionar:

1. **Verifique o Client ID:**
   - Certifique-se de estar usando o **Client ID Web**
   - Não o Android Client ID

2. **Verifique os logs:**
   - No Android Studio → Logcat
   - Procure por: `🔐 Tentando login com Google...`
   - Procure por: `📱 Usando GoogleAuth plugin do Capacitor (mobile)...`

3. **Verifique a inicialização:**
   - Log deve mostrar: `✅ GoogleAuth plugin inicializado (Capacitor)`

---

## ✅ **VANTAGENS DESTA SOLUÇÃO:**

1. ✅ **Não usa localhost** - Usa app nativo do Google
2. ✅ **Mais seguro** - Login nativo é mais seguro que WebView
3. ✅ **Melhor UX** - Abre app nativo, não navegador
4. ✅ **Funciona offline** - Depois do primeiro login
5. ✅ **Compatível com Firebase** - Integra perfeitamente

---

## 📅 **Última Atualização:**
31 de outubro de 2025




