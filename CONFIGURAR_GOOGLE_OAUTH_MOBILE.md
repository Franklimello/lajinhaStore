# 🔐 Configuração: Login Google no Mobile (OAuth Redirect)

## ❌ **PROBLEMA:**
```
ERR_CONNECTION_REFUSED ao acessar localhost/carrinho após login Google
```

**Causa:** Firebase está tentando redirecionar para `localhost`, mas app nativo precisa de `com.supermercado.lajinha://`

---

## ✅ **CORREÇÕES APLICADAS:**

### 1. **AndroidManifest.xml** ✅
- ✅ Adicionado intent-filter para deep links
- ✅ Scheme configurado: `com.supermercado.lajinha`

### 2. **capacitor.config.ts** ✅
- ✅ Scheme já estava configurado: `com.supermercado.lajinha`

---

## 🔧 **CONFIGURAÇÃO NO FIREBASE CONSOLE:**

### **PASSO 1: Adicionar Redirect URI**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: **compreaqui-324df**
3. Vá em **Authentication** → **Sign-in method**
4. Clique em **Google**
5. Role até **Authorized redirect URIs**
6. **Adicione os seguintes URIs (APENAS HTTP/HTTPS):**

```
https://compreaqui-324df.firebaseapp.com/__/auth/handler
http://localhost
```

**⚠️ IMPORTANTE:** NÃO adicione `com.supermercado.lajinha://` aqui! O Firebase não aceita custom schemes como redirect URI. O deep link é usado automaticamente pelo Capacitor.

### **PASSO 2: Configurar OAuth Consent Screen**

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione o projeto: **compreaqui-324df**
3. Vá em **APIs & Services** → **OAuth consent screen**
4. Em **Authorized domains**, adicione:
   - `compreaqui-324df.firebaseapp.com`
   - Seu domínio de produção (se tiver)

5. Em **Authorized redirect URIs**, adicione:
   - `https://compreaqui-324df.firebaseapp.com/__/auth/handler`
   
   **⚠️ NÃO adicione o custom scheme aqui!**

---

## 🚀 **APÓS CONFIGURAR:**

### 1. **Rebuild do App:**
```bash
cd lajinhaStore
npm run build
npm run cap:copy
```

### 2. **No Android Studio:**
- **Sync Project** (File → Sync Project with Gradle Files)
- **Build** → **Rebuild Project**
- Execute no dispositivo/emulador

---

## 🔍 **COMO FUNCIONA:**

### **Fluxo Completo:**

```
1. Cliente clica "Entrar com Google"
   ↓
2. App chama signInWithRedirect()
   ↓
3. Firebase redireciona para Google OAuth
   ↓
4. Cliente faz login no Google
   ↓
5. Google redireciona para: https://compreaqui-324df.firebaseapp.com/__/auth/handler
   ↓
6. Firebase detecta que é app nativo (Capacitor)
   ↓
7. Firebase usa automaticamente: com.supermercado.lajinha:// (deep link)
   ↓
8. Android detecta deep link e abre app
   ↓
8. AuthContext detecta resultado via getRedirectResult()
   ↓
9. ✅ Cliente logado!
```

---

## 🧪 **TESTAR:**

1. **Instale o app** no dispositivo/emulador
2. **Abra o app**
3. **Vá para Login**
4. **Clique em "Entrar com Google"**
5. **Faça login no Google**
6. **Verifique se volta para o app e está logado**

---

## ⚠️ **TROUBLESHOOTING:**

### **Erro: "ERR_CONNECTION_REFUSED"**
- ✅ Verifique se o intent-filter foi adicionado ao AndroidManifest.xml
- ✅ Verifique se fez rebuild do app
- ✅ Verifique se o scheme está correto: `com.supermercado.lajinha`

### **Erro: "redirect_uri_mismatch"**
- ✅ Verifique se adicionou `https://compreaqui-324df.firebaseapp.com/__/auth/handler` no Firebase Console
- ✅ **NÃO** adicione `com.supermercado.lajinha://` como redirect URI (Firebase não aceita)
- ✅ Verifique se o scheme no AndroidManifest.xml está correto
- ✅ Aguarde alguns minutos após alterar no Firebase (pode demorar para propagar)

### **App não abre após login Google**
- ✅ Verifique se `android:launchMode="singleTask"` está no AndroidManifest.xml
- ✅ Verifique se o intent-filter está dentro da `<activity>` correta

---

## 📝 **CHECKLIST:**

- [ ] Intent-filter adicionado ao AndroidManifest.xml
- [ ] Scheme configurado: `com.supermercado.lajinha`
- [ ] Redirect URI adicionado no Firebase Console
- [ ] OAuth Consent Screen configurado
- [ ] Rebuild do app feito
- [ ] App reinstalado no dispositivo
- [ ] Testado login com Google

---

## 🔗 **LINKS ÚTEIS:**

- [Firebase Auth - Deep Links](https://firebase.google.com/docs/auth/web/redirect-best-practices)
- [Capacitor - Deep Links](https://capacitorjs.com/docs/guides/deep-links)
- [Android Deep Links](https://developer.android.com/training/app-links/deep-linking)
