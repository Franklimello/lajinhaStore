# 📱 Guia Específico: Poco X7 (Xiaomi/MIUI)

## 🔧 **Permitir Instalação de Apps no Poco X7**

### **Método 1: Configurações de Segurança**

1. **Abra Configurações**
2. **Procure por:** "Segurança" ou "Privacy"
3. **Vá em:** "Instalar aplicativos desconhecidos" ou "Install unknown apps"
4. **Procure por uma dessas opções:**
   - **"ADB"**
   - **"Shell"** 
   - **"Android Studio"**
   - **"USB Debugging"**
   - **"Package Installer"**
5. **Se encontrar, ative:**
   - Toque na opção
   - Escolha **"Permitir desta fonte"** ou **"Allow from this source"**

---

### **Método 2: Configurações do Aplicativo (Mais Direto)**

1. **Configurações** → **Apps** (ou "Gerenciar apps")
2. **Menu (três pontinhos ⋮)** no canto superior direito
3. **"Acesso especial"** ou **"Special access"**
4. **"Instalar apps desconhecidos"** ou **"Install unknown apps"**
5. **Procure e selecione:**
   - **"Package Installer"** (ou "Instalador de Pacotes")
   - **"Shell"**
   - **"ADB"**
   - Qualquer opção relacionada a instalação de apps
6. **Ative:** "Permitir desta fonte" ou "Allow from this source"

---

### **Método 3: Durante a Instalação (Mais Fácil)**

**Quando você executar no Android Studio:**

1. **Olhe a tela do celular**
2. **Pode aparecer um popup** perguntando se permite instalar
3. **Toque em "Permitir"** ou "Allow"
4. **Marque "Sempre permitir"** (se aparecer opção)
5. **Confirme a instalação**

---

### **Método 4: Desativar Verificação de Apps (Temporário)**

1. **Configurações** → **Sistema** → **Opções do desenvolvedor**
2. **Procure por:**
   - **"Verificar aplicativos via USB"** ou **"Verify apps over USB"**
   - **"Proteção de instalação"** ou **"Install protection"**
3. **DESATIVE** essa opção (temporariamente para instalar)

⚠️ **Depois de instalar, você pode reativar se quiser.**

---

### **Método 5: Via ADB (Mais Técnico)**

Se nada funcionar, podemos tentar via ADB diretamente:

1. Conecte o celular via USB
2. Ative "Depuração USB" nas opções do desenvolvedor
3. Execute via terminal (vou ajudar com isso)

---

## 📱 **Passos Específicos Poco X7:**

### **1. Verificar Opções do Desenvolvedor:**
- **Configurações** → **Sobre o telefone**
- Toque 7 vezes em **"Versão MIUI"** (não "Número da compilação")
- Volte para **Configurações** → **Configurações adicionais** → **Opções do desenvolvedor**
- Ative **"Depuração USB"**

### **2. Permitir Instalação:**
- **Configurações** → **Apps**
- Menu (⋮) → **"Acesso especial"**
- Procure **"Instalar apps desconhecidos"**
- Procure qualquer opção que mencione **"Instalação"** ou **"Install"**
- Ative todas que parecerem relacionadas

### **3. Testar:**
- No Android Studio, clique em **Run** ▶
- **OLHE A TELA DO CELULAR**
- Se aparecer popup, confirme

---

## 🔍 **Se Ainda Não Encontrar:**

### **Tente Buscar nas Configurações:**

1. **Configurações** → **Buscar** (ícone de lupa)
2. **Digite:** "instalar" ou "install" ou "unknown" ou "desconhecido"
3. Veja quais opções aparecem
4. Toque na mais relevante

---

## ✅ **SOLUÇÃO ALTERNATIVA: Gerar APK e Instalar Manualmente**

Se não conseguir pelas configurações, vamos gerar o APK e instalar manualmente:

1. No Android Studio:
   - **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - Aguarde terminar

2. O APK estará em:
   - `android/app/build/outputs/apk/debug/app-debug.apk`

3. Copie para o celular:
   - Conecte via USB
   - Copie o arquivo `app-debug.apk` para o celular
   - Abra o arquivo no celular
   - Toque em "Instalar"
   - Confirme qualquer popup de segurança

---

## 🎯 **TESTE ESTE FLUXO:**

1. **Configurações** → **Apps**
2. **Menu (⋮)** → **"Acesso especial"**
3. Procure qualquer opção que mencione **"Instalação"**
4. **Ative tudo** que parecer relacionado
5. No Android Studio: **Run** ▶
6. **Olhe a tela do celular** - confirme qualquer popup

---

**Me diga o que você encontrou nas "Acesso especial"!** 🔍




