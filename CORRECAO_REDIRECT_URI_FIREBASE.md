# 🔧 Correção: Redirect URI Firebase - App Nativo

## ❌ **PROBLEMA:**
```
Redirecionamento inválido: é preciso usar http ou https como esquema.
Erro ao adicionar: com.supermercado.lajinha://
```

**Causa:** Firebase não aceita custom URL schemes (`com.supermercado.lajinha://`) como redirect URI.

---

## ✅ **SOLUÇÃO:**

### **O que fazer no Firebase Console:**

1. **NÃO adicione** `com.supermercado.lajinha://` como redirect URI
2. **Adicione apenas URIs HTTP/HTTPS:**

```
https://compreaqui-324df.firebaseapp.com/__/auth/handler
http://localhost
https://compreaqui-324df.web.app/__/auth/handler
```

### **Por que funciona?**

O Firebase usa automaticamente o handler `__/auth/handler` que:
1. Recebe o resultado do OAuth do Google
2. Detecta automaticamente que é um app nativo (via Capacitor)
3. Usa o **custom scheme configurado no Capacitor** para voltar ao app
4. O deep link (`com.supermercado.lajinha://`) é usado internamente

---

## 🔧 **CONFIGURAÇÃO CORRETA:**

### **No Firebase Console:**

1. Acesse: https://console.firebase.google.com/
2. Vá em **Authentication** → **Sign-in method** → **Google**
3. Em **Authorized redirect URIs**, adicione **APENAS**:

```
https://compreaqui-324df.firebaseapp.com/__/auth/handler
http://localhost
```

### **No Google Cloud Console (se necessário):**

1. Acesse: https://console.cloud.google.com/
2. Vá em **APIs & Services** → **Credentials**
3. Encontre seu OAuth 2.0 Client ID
4. Em **Authorized redirect URIs**, adicione:

```
https://compreaqui-324df.firebaseapp.com/__/auth/handler
```

---

## ✅ **O QUE JÁ ESTÁ CONFIGURADO (correto):**

1. ✅ **AndroidManifest.xml** - Intent-filter com deep link
2. ✅ **capacitor.config.ts** - Scheme configurado
3. ✅ **AuthContext.js** - Suporte a redirect

**NÃO precisa alterar nada no código!**

---

## 🔍 **COMO FUNCIONA:**

```
1. Cliente clica "Entrar com Google"
   ↓
2. signInWithRedirect() é chamado
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
9. AuthContext detecta resultado via getRedirectResult()
   ↓
10. ✅ Cliente logado!
```

---

## 📝 **CHECKLIST CORRETO:**

### **Firebase Console:**
- [x] Google Auth habilitado
- [ ] **Redirect URI:** `https://compreaqui-324df.firebaseapp.com/__/auth/handler`
- [ ] **Redirect URI:** `http://localhost` (desenvolvimento)
- [ ] Package name: `com.supermercado.lajinha`
- [ ] SHA-1: `2F:51:41:28:13:BC:84:08:9F:37:4D:83:C7:11:9D:01:04:ED:4B:8C`

### **Google Cloud Console:**
- [ ] **Redirect URI:** `https://compreaqui-324df.firebaseapp.com/__/auth/handler`

### **App:**
- [x] Intent-filter configurado
- [x] Scheme configurado no Capacitor
- [x] Código implementado

---

## ⚠️ **IMPORTANTE:**

- ❌ **NÃO** adicione `com.supermercado.lajinha://` como redirect URI
- ✅ **USE** apenas URIs HTTP/HTTPS no Firebase
- ✅ O deep link é usado **automaticamente** pelo Firebase/Capacitor

---

## 🚀 **TESTAR:**

1. Configure os redirect URIs corretos no Firebase
2. Rebuild do app (já feito)
3. Teste no dispositivo
4. Login com Google deve funcionar! ✅



