# 🚀 Comandos para Atualizar Web e Mobile

## 📋 **Atualizar APENAS Web (Firebase Hosting):**

```bash
cd lajinhaStore
npm run build
firebase deploy --only hosting
```

**Tempo:** ~2-3 minutos  
**Resultado:** Site atualizado em https://compreaqui-324df.web.app

---

## 📱 **Atualizar APENAS Mobile (Android):**

```bash
cd lajinhaStore
npm run build
npm run cap:copy
cd android
.\gradlew.bat bundleRelease
```

**Tempo:** ~5-10 minutos  
**Resultado:** Novo AAB em `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🌐📱 **Atualizar WEB E MOBILE (Recomendado):**

### **Opção 1: Comandos Separados**

```bash
cd lajinhaStore

# 1. Build do React
npm run build

# 2. Deploy Web
firebase deploy --only hosting

# 3. Copiar para Android
npm run cap:copy

# 4. Gerar AAB Android
cd android
.\gradlew.bat bundleRelease
```

### **Opção 2: Script Automatizado (Recomendado)**

Adicione este script no `package.json`:

```json
{
  "scripts": {
    "deploy:all": "npm run build && firebase deploy --only hosting && npm run cap:copy && cd android && gradlew.bat bundleRelease"
  }
}
```

Depois execute:
```bash
npm run deploy:all
```

---

## ⚡ **Comandos Rápidos:**

### **Atualizar Web:**
```bash
cd lajinhaStore && npm run build && firebase deploy --only hosting
```

### **Atualizar Mobile:**
```bash
cd lajinhaStore && npm run build && npm run cap:copy && cd android && .\gradlew.bat bundleRelease
```

### **Atualizar Ambos:**
```bash
cd lajinhaStore && npm run build && firebase deploy --only hosting && npm run cap:copy && cd android && .\gradlew.bat bundleRelease
```

---

## 📝 **Ordem Correta dos Comandos:**

1. ✅ **`npm run build`** - Sempre primeiro! Cria a pasta `build/`
2. ✅ **`firebase deploy --only hosting`** - Atualiza o site web
3. ✅ **`npm run cap:copy`** - Copia `build/` para Android
4. ✅ **`.\gradlew.bat bundleRelease`** - Gera o AAB

**⚠️ IMPORTANTE:** Sempre faça `npm run build` ANTES de qualquer deploy!

---

## 🔄 **Atualizar Versão do App Mobile:**

Antes de gerar o AAB, atualize a versão em:

**Arquivo:** `android/app/build.gradle`

```gradle
defaultConfig {
    versionCode 3  // ⬆️ Incremente (não pode repetir)
    versionName "1.0.2"  // ⬆️ Versão visível
}
```

**Regra:**
- `versionCode`: SEMPRE incremente (1, 2, 3, 4...)
- `versionName`: Versão que usuários veem ("1.0.0", "1.0.1", "1.1.0"...)

---

## 📦 **Onde Ficam os Arquivos Gerados:**

### **Web:**
- Build: `lajinhaStore/build/`
- Deploy: Automaticamente no Firebase Hosting

### **Mobile:**
- AAB: `lajinhaStore/android/app/build/outputs/bundle/release/app-release.aab`
- APK (debug): `lajinhaStore/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🧪 **Testar Antes de Publicar:**

### **Testar Web:**
```bash
cd lajinhaStore
npm run build
npm install -g serve
serve -s build
```
Acesse: http://localhost:3000

### **Testar Mobile (Android Studio):**
```bash
cd lajinhaStore
npm run build
npm run cap:copy
npx cap open android
```
Depois clique no botão ▶️ Run no Android Studio

---

## ⏱️ **Tempos Estimados:**

| Operação | Tempo |
|----------|-------|
| `npm run build` | 1-2 min |
| `firebase deploy` | 30-60 seg |
| `npm run cap:copy` | 5-10 seg |
| `gradlew bundleRelease` | 5-10 min |
| **Total (ambos)** | **~10-15 min** |

---

## 🚨 **Problemas Comuns:**

### **Erro: "Build failed"**
```bash
# Limpe e reconstrua
cd lajinhaStore
rm -rf build node_modules/.cache
npm run build
```

### **Erro: "Gradle sync failed"**
```bash
cd lajinhaStore/android
.\gradlew.bat clean
.\gradlew.bat bundleRelease
```

### **App não atualiza no dispositivo**
- Desinstale o app antigo
- Instale o novo APK/AAB
- Ou limpe cache do app

---

## 💡 **Dicas:**

1. **Sempre faça `npm run build` primeiro** antes de qualquer deploy
2. **Teste localmente** antes de publicar
3. **Incremente versionCode** a cada atualização do app mobile
4. **Faça backup** do keystore antes de grandes atualizações
5. **Anote as mudanças** em "O que há de novo" para a Play Store

---

## 📋 **Checklist de Deploy:**

### **Para Web:**
- [ ] `npm run build` executado
- [ ] Teste local funcionando
- [ ] `firebase deploy --only hosting` executado
- [ ] Site testado em produção

### **Para Mobile:**
- [ ] `npm run build` executado
- [ ] `npm run cap:copy` executado
- [ ] `versionCode` incrementado
- [ ] `versionName` atualizado
- [ ] `.\gradlew.bat bundleRelease` executado
- [ ] AAB testado (se possível)
- [ ] AAB pronto para upload na Play Store

---

## 🔗 **Scripts Úteis no package.json:**

Você pode adicionar estes scripts para facilitar:

```json
{
  "scripts": {
    "deploy:web": "npm run build && firebase deploy --only hosting",
    "deploy:android": "npm run build && npm run cap:copy && cd android && gradlew.bat bundleRelease",
    "deploy:all": "npm run build && firebase deploy --only hosting && npm run cap:copy && cd android && gradlew.bat bundleRelease",
    "test:web": "npm run build && serve -s build"
  }
}
```

**Uso:**
```bash
npm run deploy:web      # Atualiza apenas web
npm run deploy:android  # Atualiza apenas mobile
npm run deploy:all      # Atualiza ambos
npm run test:web        # Testa localmente
```

---

**Última atualização:** 31 de outubro de 2025




