# 🎨 Onde Encontrar "Image Asset" no Android Studio

## 📍 **LOCALIZAÇÃO:**

### **Método 1: Menu File (Mais fácil):**

1. No Android Studio, clique em **File** (barra superior)
2. Selecione **New**
3. Se não aparecer "Image Asset", continue:
4. Vá em **File → New → Image Asset** 
   - (Pode aparecer como "Image Asset" ou "Asset Studio")

### **Método 2: Pelo Project View:**

1. No painel **Project** (esquerda)
2. Clique com botão direito na pasta **res**
3. Caminho: `android/app/src/main/res`
4. Selecione **New → Image Asset**
   - (Ou **New → Vector Asset** para ícones vetoriais)

### **Método 3: Menu de Contexto:**

1. No **Project View**, navegue até:
   ```
   app → src → main → res
   ```
2. **Clique com botão direito** em `res`
3. **New → Image Asset**

---

## ⚠️ **SE NÃO APARECER:**

### **Alternativa: Usar Site Online (Mais Simples - Recomendado):**

Se não encontrar no Android Studio, use o **IconKitchen** online (substituiu o Android Asset Studio):

1. **Acesse:** https://icon.kitchen/
2. **Upload** sua logo (`public/logo512.png`)
3. **Configure**:
   - Platform: **Android**
   - Background: `#3b82f6` (azul) ou outra cor
   - Shape: **Adaptive**
4. **Download** → **Android (ZIP)**
5. **Extraia** o ZIP e **copie** as pastas `mipmap-*` para `android/app/src/main/res/`

**Este método é mais rápido, atualizado e funciona 100%!** ✅

---

## 🔍 **VERIFICAR SE ESTÁ INSTALADO:**

Se a opção não aparecer, verifique:

1. Você está com o projeto Android aberto? (não apenas o projeto React)
2. O módulo Android está carregado?
3. Tente: **File → Invalidate Caches → Invalidate and Restart**

---

## 📅 **Última Atualização:**
31 de outubro de 2025

