# 🔧 Solução: "Install canceled by user"

## ❌ **ERRO:**
```
Install canceled by user
```

## 🔍 **CAUSA:**
O Android está bloqueando a instalação por questões de segurança ou você cancelou um popup de confirmação.

---

## ✅ **SOLUÇÕES:**

### **1. Permitir Instalação de Apps Desconhecidos**

#### **Método A - Via Configurações Gerais:**
1. **Configurações** → **Segurança**
2. Ative **"Fontes desconhecidas"** ou **"Instalar apps desconhecidos"**
3. Confirme

#### **Método B - Via Opções do Desenvolvedor:**
1. **Configurações** → **Sistema** → **Opções do desenvolvedor**
2. Ative: **"Instalar via USB"** ou **"Instalar aplicativos externos"**
3. Ative: **"Verificar aplicativos via USB"** (opcional, mas ajuda)

#### **Método C - Permissão Específica para ADB:**
1. **Configurações** → **Apps** → **Menu (⋮)** → **"Acesso especial"**
2. **"Instalar apps desconhecidos"**
3. Procure por **"Android Studio"** ou **"ADB"** ou **"Shell"**
4. Selecione e escolha **"Permitir desta fonte"**

---

### **2. Desinstalar Versão Anterior (Se Existir)**

1. **Configurações** → **Apps**
2. Procure por **"Supermercado Online Lajinha"** ou **"Supermercado Lajinha"**
3. Se encontrar, clique e **Desinstale**
4. Isso evita conflito de assinatura

---

### **3. Confirmar Popup de Instalação**

Quando você executar no Android Studio:
1. **Olhe a tela do celular**
2. Se aparecer um popup pedindo permissão:
   - ✅ Toque em **"Instalar"** ou **"Permitir"**
   - ✅ Marque **"Sempre permitir deste computador"** (se aparecer)
   - ❌ **NÃO** cancele ou ignore

---

### **4. Verificar Permissões de Depuração USB**

1. **Configurações** → **Sistema** → **Opções do desenvolvedor**
2. Verifique se está ativado:
   - ✅ **Depuração USB**
   - ✅ **Instalar via USB** (se disponível)
   - ✅ **Verificar aplicativos via USB** (opcional)

---

## 🚀 **DEPOIS DE CONFIGURAR:**

1. **No Android Studio:**
   - Clique em **Run** ▶ novamente
   - Ou pressione **Shift + F10**

2. **No celular:**
   - Fique de olho na tela
   - Se aparecer popup, confirme a instalação

3. **Aguarde:**
   - O app será instalado
   - E abrirá automaticamente

---

## 📱 **PARA XIAOMI/MIUI (Seu caso):**

Xiaomi tem segurança extra. Siga estes passos:

### **Passo 1:**
1. **Configurações** → **Apps** → **Gerenciar apps**
2. Menu (⋮) → **"Permissões especiais"**
3. **"Instalar apps desconhecidos"**
4. Procure por **"ADB"** ou **"Shell"** ou **"Android Studio"**
5. Selecione e escolha **"Permitir"**

### **Passo 2:**
1. **Configurações** → **Sistema** → **Opções do desenvolvedor**
2. Ative: **"Depuração USB"**
3. Ative: **"Instalar via USB"** (se disponível)
4. Ative: **"Verificar aplicativos via USB"** → Desative (pode bloquear)

### **Passo 3:**
1. **Configurações** → **Segurança**
2. Ative: **"Fontes desconhecidas"**

---

## 🔄 **SE AINDA NÃO FUNCIONAR:**

### **Opção 1: Reiniciar Conexão**
1. Desconecte o cabo USB
2. Desative e reative **"Depuração USB"**
3. Reconecte o cabo
4. Confirme o popup que aparecer
5. Tente instalar novamente

### **Opção 2: Instalar APK Manualmente**
1. No Android Studio: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Aguarde o build terminar
3. O APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`
4. Copie para o celular
5. Abra o arquivo no celular e instale manualmente

---

## ✅ **CHECKLIST:**

- [ ] "Fontes desconhecidas" está ativado?
- [ ] "Depuração USB" está ativada?
- [ ] Permissão para ADB/Shell está configurada?
- [ ] Versão anterior do app foi desinstalada?
- [ ] Popup de instalação foi confirmado (não cancelado)?

---

## 🎯 **TESTE AGORA:**

1. Configure as permissões acima
2. No Android Studio, clique em **Run** ▶
3. **Olhe a tela do celular** e confirme qualquer popup
4. O app deve instalar e abrir!

---

**Configure as permissões e tente novamente!** 🔧




