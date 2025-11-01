# 🎨 Como Alterar o Ícone do App Android

## 📋 **PASSO A PASSO:**

### **1. Preparar a imagem base:**

A logo do site está em:
- `public/logo512.png` (512x512 pixels) ✅ **RECOMENDADO**
- `src/assets/ideal.png` (pode precisar ser redimensionado)

### **2. Gerar os ícones do Android:**

Você precisa criar ícones nos seguintes tamanhos:
- **mdpi**: 48x48 pixels
- **hdpi**: 72x72 pixels
- **xhdpi**: 96x96 pixels
- **xxhdpi**: 144x144 pixels
- **xxxhdpi**: 192x192 pixels

### **3. Ferramentas para gerar os ícones:**

#### **Opção 1: IconKitchen (Recomendado - Online - Atualizado):**
1. Acesse: https://icon.kitchen/
2. Upload a imagem: `public/logo512.png`
3. Configure:
   - **Platform**: Selecione **Android**
   - **Foreground**: Use sua logo (512x512)
   - **Background**: Cor de fundo (ex: #3b82f6 - azul)
   - **Shape**: Escolha "Adaptive" (recomendado)
4. Clique em **"Download"** → **"Android (ZIP)"**
5. Extraia o zip e copie as pastas para: `android/app/src/main/res/`

#### **Opção 2: Android Studio (Built-in):**
1. No Android Studio: **File → New → Image Asset**
2. Em **Foreground Layer**:
   - Clique em **Path** e selecione `public/logo512.png`
3. Em **Background Layer**:
   - Escolha uma cor de fundo (ex: #3b82f6)
4. Clique em **Next** → **Finish**
5. Os ícones serão gerados automaticamente!

### **4. Estrutura de pastas:**

Após gerar, os ícones devem ficar assim:
```
android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png
│   ├── ic_launcher_foreground.png
│   └── ic_launcher_round.png
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

## 🎯 **ALTERNATIVA RÁPIDA (Manual):**

Se você já tem os ícones prontos, pode usar o **Android Asset Studio** online:

1. Acesse: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
2. **Upload** da sua logo (`logo512.png`)
3. Configure cor de fundo: `#3b82f6` (ou outra cor)
4. **Download** do zip
5. Extraia e copie as pastas `mipmap-*` para `android/app/src/main/res/`
6. **Substitua** os arquivos existentes

---

## ✅ **APÓS ADICIONAR OS ÍCONES:**

1. No Android Studio: **File → Sync Project with Gradle Files**
2. **Build → Clean Project**
3. **Build → Rebuild Project**
4. Execute o app - o novo ícone aparecerá!

---

## 📝 **NOTA:**

O nome do app já foi alterado para **"Sup Lajinha"** em:
- ✅ `android/app/src/main/res/values/strings.xml`
- ✅ `capacitor.config.ts`

---

## 🚀 **TESTE:**

Depois de adicionar os ícones:
1. Rebuild o app
2. Desinstale a versão antiga do dispositivo (se necessário)
3. Instale a nova versão
4. Veja o novo ícone na tela inicial!

---

## 📅 **Última Atualização:**
31 de outubro de 2025

