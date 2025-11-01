# 📥 Como Instalar os Ícones Baixados do IconKitchen

## 📋 **PASSO A PASSO APÓS BAIXAR O ZIP:**

### **1. Encontrar o arquivo baixado:**

- Geralmente fica na pasta **Downloads**
- Nome do arquivo: algo como `android-icons.zip` ou similar

### **2. Extrair o ZIP:**

1. **Clique com botão direito** no arquivo ZIP
2. Selecione **"Extrair tudo"** ou **"Extract All"**
3. Escolha uma pasta temporária (ex: Desktop)
4. Clique em **"Extrair"**

### **3. Encontrar as pastas de ícones:**

Após extrair, você verá uma estrutura assim:
```
android-icons/
└── res/
    ├── mipmap-anydpi-v26/
    ├── mipmap-mdpi/
    ├── mipmap-hdpi/
    ├── mipmap-xhdpi/
    ├── mipmap-xxhdpi/
    └── mipmap-xxxhdpi/
```

### **4. Copiar para o projeto Android:**

1. **Abra** a pasta `res/` dentro do ZIP extraído
2. **Selecione TODAS as pastas** `mipmap-*`:
   - `mipmap-anydpi-v26`
   - `mipmap-mdpi`
   - `mipmap-hdpi`
   - `mipmap-xhdpi`
   - `mipmap-xxhdpi`
   - `mipmap-xxxhdpi`

3. **Copie** todas (Ctrl+C ou botão direito → Copiar)

4. **Navegue** até a pasta do projeto:
   ```
   lajinhaStore/android/app/src/main/res/
   ```

5. **Cole** as pastas (Ctrl+V ou botão direito → Colar)

6. Se perguntar para **substituir**, escolha **"Substituir todos"** ou **"Replace All"**

### **5. Verificar se está correto:**

A estrutura final deve ser:
```
lajinhaStore/android/app/src/main/res/
├── mipmap-anydpi-v26/
│   ├── ic_launcher.xml
│   └── ic_launcher_round.xml
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

## ✅ **APÓS COPIAR:**

### **1. No Android Studio:**

1. **File → Sync Project with Gradle Files**
   - Isso sincroniza os novos ícones

2. **Build → Clean Project**
   - Limpa builds antigos

3. **Build → Rebuild Project**
   - Recompila com os novos ícones

### **2. Testar:**

1. **Execute o app** (botão Run ▶️)
2. **Desinstale a versão antiga** do dispositivo (se necessário)
3. **Instale a nova versão**
4. Veja o novo ícone na tela inicial! 🎉

---

## ⚠️ **SE DER ERRO:**

### **Verifique:**

1. ✅ Todas as 6 pastas `mipmap-*` foram copiadas?
2. ✅ As pastas estão em `android/app/src/main/res/`?
3. ✅ Não está dentro de outra pasta `res/`?
4. ✅ Os arquivos `.png` estão dentro das pastas?

---

## 📍 **CAMINHO COMPLETO:**

```
C:\Users\Pichau\Desktop\supermercadolajinha\lajinhaStore\android\app\src\main\res\
```

**As pastas `mipmap-*` devem estar DENTRO desta pasta `res/`**

---

## 🚀 **PRONTO!**

Após copiar e sincronizar, o novo ícone aparecerá no app! ✅

---

## 📅 **Última Atualização:**
31 de outubro de 2025




