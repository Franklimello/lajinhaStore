# 🎨 Gerar Ícones do App - IconKitchen (Atualizado)

## ✅ **FERRAMENTA RECOMENDADA:**

**IconKitchen** - Substituiu o Android Asset Studio  
🔗 https://icon.kitchen/

---

## 📋 **PASSO A PASSO:**

### **1. Acesse o IconKitchen:**
👉 https://icon.kitchen/

### **2. Upload da Logo:**
- **Arraste** a imagem `logo512.png` para a página
- Ou clique em **"Upload"** e selecione: `lajinhaStore/public/logo512.png`

### **3. Configure:**

#### **Settings (Configurações):**
- **Platform**: Selecione **"Android"** ✅

#### **Foreground (Logo):**
- Sua logo será exibida automaticamente
- Ajuste o tamanho se necessário (use os controles deslizantes)

#### **Background (Fundo):**
- **Cor**: Digite `#3b82f6` (azul) ou escolha outra cor
- Ou deixe transparente se preferir

#### **Shape (Formato):**
- **Adaptive** (recomendado) - Ícone adaptativo Android moderno
- **Circle** - Ícone circular
- **Square** - Ícone quadrado
- **Rounded Square** - Ícone quadrado arredondado

### **4. Download:**
1. Clique no botão **"Download"** (canto superior direito)
2. Selecione **"Android (ZIP)"**
3. Salve o arquivo ZIP

### **5. Instalar os Ícones:**

1. **Extraia** o arquivo ZIP baixado
2. Você verá uma pasta `res/` dentro
3. **Abra** a pasta `res/`
4. Você verá várias pastas `mipmap-*`:
   - `mipmap-mdpi/`
   - `mipmap-hdpi/`
   - `mipmap-xhdpi/`
   - `mipmap-xxhdpi/`
   - `mipmap-xxxhdpi/`
   - `mipmap-anydpi-v26/`

5. **Copie TODAS essas pastas** para:
   ```
   lajinhaStore/android/app/src/main/res/
   ```
6. **Substitua** as pastas existentes se perguntar

### **6. Sincronizar no Android Studio:**

1. **File → Sync Project with Gradle Files**
2. **Build → Clean Project**
3. **Build → Rebuild Project**
4. **Execute o app** novamente

---

## ✅ **PRONTO!**

O novo ícone aparecerá na tela inicial do dispositivo! 🎉

---

## 📝 **NOTAS:**

- ✅ O nome do app já foi alterado para **"Sup Lajinha"**
- ✅ Use a logo `logo512.png` para melhor qualidade
- ✅ Ícones gerados funcionam em todos os tamanhos de tela Android

---

## 🔍 **VERIFICAÇÃO:**

Após instalar, verifique se as pastas estão corretas:
```
android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png
│   └── ic_launcher_foreground.png
├── mipmap-hdpi/
│   └── (mesmos arquivos)
├── mipmap-xhdpi/
│   └── (mesmos arquivos)
├── mipmap-xxhdpi/
│   └── (mesmos arquivos)
└── mipmap-xxxhdpi/
    └── (mesmos arquivos)
```

---

## 📅 **Última Atualização:**
31 de outubro de 2025




