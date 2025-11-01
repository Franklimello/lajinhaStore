# 🔐 Credenciais Google OAuth - Supermercado Lajinha

## 📋 Informações de Configuração

### **Client ID do Google OAuth (Web - Para Plugin Capacitor):**
```
821962501479-62l3rrcc0vk9suhnvip7lqfslg4v8po2.apps.googleusercontent.com
```
**Status:** ✅ Configurado no código - Usado pelo plugin `@codetrix-studio/capacitor-google-auth`

### **Client ID do Google OAuth (Android - Para Firebase SDK):**
```
821962501479-38079mhrh98468ug2b3f1uhl0ftt99rq.apps.googleusercontent.com
```
**Status:** ✅ Criado especificamente para Android - Configurado no Firebase Console

### **Package Name (Android):**
```
com.supermercado.lajinha
```

### **SHA-1 Certificate Fingerprint (Release):**
```
2F:51:41:28:13:BC:84:08:9F:37:4D:83:C7:11:9D:01:04:ED:4B:8C
```
**Status:** ✅ Configurado no Firebase Console

### **SHA-1 Certificate Fingerprint (Debug - PARA TESTES):**
```
26:0F:04:9F:ED:4C:84:28:B0:EE:6F:02:EC:E7:18:72:FA:7D:6B:42
```
**Status:** ⚠️ **PRECISA SER ADICIONADO NO FIREBASE!** (Este é o SHA-1 do keystore de debug que está sendo usado para testar)

### **SHA-256 Certificate Fingerprint:**
```
1B:D7:23:2C:B4:BC:AD:9F:0E:9E:9E:CF:EF:BE:D1:AB:59:7A:24:EB:FC:FA:AC:95:A3:17:CE:A6:E7:73:7A:A9
```

### **Redirect URI (Deep Link):**
```
com.supermercado.lajinha://
```

### **Firebase Project ID:**
```
compreaqui-324df
```

### **Firebase Auth Domain:**
```
compreaqui-324df.firebaseapp.com
```

---

## ✅ **Status da Configuração**

### **Firebase Console:**
- [ ] Google Auth Provider habilitado
- [ ] Package name adicionado: `com.supermercado.lajinha`
- [ ] SHA-1 adicionado: `2F:51:41:28:13:BC:84:08:9F:37:4D:83:C7:11:9D:01:04:ED:4B:8C`
- [ ] Redirect URI adicionado: `com.supermercado.lajinha://`

### **Android App:**
- [x] Intent-filter configurado no AndroidManifest.xml
- [x] Scheme configurado no capacitor.config.ts
- [x] Deep link handler implementado

### **Código:**
- [x] AuthContext com suporte a redirect
- [x] Login page com tratamento de redirect
- [x] Detecção de ambiente (mobile/web)

---

## 📝 **Notas Importantes**

1. **Client ID Web configurado para Plugin Capacitor**
   - ✅ Client ID Web: `821962501479-62l3rrcc0vk9suhnvip7lqfslg4v8po2.apps.googleusercontent.com`
   - ✅ Configurado em `src/context/AuthContext.js` para o plugin do Capacitor
   - ✅ Usado pelo `@codetrix-studio/capacitor-google-auth` no mobile

2. **Client ID Android configurado para Firebase**
   - ✅ Client ID Android: `821962501479-38079mhrh98468ug2b3f1uhl0ftt99rq.apps.googleusercontent.com`
   - ✅ Não precisa ser configurado no código (Firebase SDK gerencia)
   - ✅ Configurado via Firebase Console → Authentication → Sign-in method → Google

3. **SHA-1 é obrigatório para Android**
   - ✅ Necessário para login com Google funcionar no mobile
   - ⚠️ **IMPORTANTE:** Adicionar TANTO o SHA-1 de debug quanto o de release!
   - ✅ SHA-1 Release já adicionado: `2F:51:41:28:13:BC:84:08:9F:37:4D:83:C7:11:9D:01:04:ED:4B:8C`
   - ⚠️ SHA-1 Debug precisa ser adicionado: `26:0F:04:9F:ED:4C:84:28:B0:EE:6F:02:EC:E7:18:72:FA:7D:6B:42`
   - **Veja:** `CORRIGIR_CODE_10_GOOGLE_AUTH.md` para instruções completas

4. **Redirect URI deve estar autorizado**
   - ✅ No Firebase Console → Authentication → Sign-in method → Google
   - ✅ Adicionar: `https://compreaqui-324df.firebaseapp.com/__/auth/handler`
   - ⚠️ **NÃO** adicione `com.supermercado.lajinha://` (Firebase não aceita custom schemes)
   - ✅ O deep link é usado automaticamente pelo Capacitor/Firebase

5. **Package name deve ser único**
   - ✅ Já está configurado: `com.supermercado.lajinha`
   - ⚠️ Não alterar após publicação na Play Store

---

## 🔗 **Links Úteis**

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)

---

## 📅 **Última Atualização**
31 de outubro de 2025
