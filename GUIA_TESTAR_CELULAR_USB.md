# 📱 Como Testar no Celular Conectado via USB

## 🚀 **PASSO A PASSO COMPLETO**

### **📲 PASSO 1: Habilitar Modo Desenvolvedor no Celular**

1. **Abra as Configurações do Android**
2. **Vá em:** "Sobre o telefone" ou "Sobre o dispositivo"
3. **Encontre:** "Número da compilação" ou "Build number"
4. **Toque 7 vezes** no "Número da compilação"
   - Vai aparecer uma mensagem: "Você agora é um desenvolvedor!"
5. **Volte para Configurações**
6. **Procure por:** "Opções do desenvolvedor" ou "Developer options"
   - Pode estar em "Sistema" → "Opções do desenvolvedor"

---

### **🔌 PASSO 2: Habilitar Depuração USB**

1. **Abra:** "Opções do desenvolvedor"
2. **Ative:** "Depuração USB" ou "USB debugging"
3. **Confirme** se pedir permissão

---

### **💻 PASSO 3: Conectar no Android Studio**

1. **Conecte o celular no computador via USB**
2. **No celular:** Pode aparecer um popup pedindo permissão
   - Marque "Sempre permitir deste computador"
   - Toque em **"Permitir"**
3. **No Android Studio:**
   - Vá em **Run** → **Select Device...**
   - Ou clique no dropdown ao lado do botão ▶ (Run)
   - Seu celular deve aparecer na lista!
   - Selecione seu celular

---

### **▶️ PASSO 4: Executar o App**

1. **No Android Studio, clique no botão ▶ (Run)**
   - Ou pressione `Shift + F10`
2. **O app será instalado e executado no seu celular!**

---

## ✅ **VERIFICAR SE O CELULAR FOI RECONHECIDO**

### **Método 1: No Android Studio**
- Vá em **Run** → **Select Device...**
- Seu celular deve aparecer com o nome do modelo
- Status deve mostrar: **"Online"**

### **Método 2: Via Terminal/PowerShell**
```powershell
adb devices
```

**Se aparecer seu celular, está funcionando:**
```
List of devices attached
ABC123XYZ    device    ← Seu celular apareceu!
```

**Se não aparecer:**
- Verifique se a depuração USB está ativada
- Tente trocar o cabo USB
- Tente outra porta USB do computador

---

## 🐛 **PROBLEMAS COMUNS E SOLUÇÕES**

### **❌ Problema: "Dispositivo não aparece"**

**Soluções:**
1. ✅ Certifique-se que "Depuração USB" está ativada
2. ✅ No celular, permita o acesso quando aparecer o popup
3. ✅ Tente conectar em modo "Transferência de arquivos" (MTP)
4. ✅ Instale os drivers USB do seu celular (geralmente automático)
5. ✅ Tente outro cabo USB (alguns só carregam, não transferem dados)

### **❌ Problema: "Unauthorized" no adb devices**

**Soluções:**
1. ✅ No celular, apareceu um popup? Toque em **"Permitir"**
2. ✅ Marque **"Sempre permitir deste computador"**
3. ✅ Desconecte e reconecte o cabo
4. ✅ Revogue autorizações: **Opções do desenvolvedor** → **Revogar autorizações de depuração USB**

### **❌ Problema: "Driver não encontrado"**

**Soluções:**
1. ✅ Baixe os drivers do seu celular no site do fabricante
2. ✅ Ou use o **Android Studio SDK Manager** → **SDK Tools** → Instale "Google USB Driver"
3. ✅ Windows geralmente instala automaticamente via Windows Update

---

## 📊 **VER LOGS NO CELULAR**

### **Método 1: Logcat no Android Studio**
1. Abra o **Logcat**
2. Selecione seu celular no dropdown de dispositivos
3. Filtre por: `ReactNativeJS` ou `chromium`

### **Método 2: Chrome DevTools**
1. Abra o app no celular
2. No computador, abra: `chrome://inspect`
3. Seu celular aparecerá na lista
4. Clique em **"inspect"**
5. Vá na aba **Console**

### **Método 3: Via ADB no Terminal**
```powershell
# Ver todos os logs
adb logcat

# Filtrar por React
adb logcat | Select-String "React"

# Filtrar erros
adb logcat *:E
```

---

## 🎯 **TESTANDO O FLUXO DE PEDIDO**

1. **Execute o app no celular** (botão ▶ no Android Studio)
2. **No app:**
   - Faça login
   - Adicione produtos ao carrinho
   - Vá para finalizar pedido
   - Preencha os dados
   - Clique em "Gerar QR Code"
3. **No Logcat/Console:**
   - Observe os logs que aparecem
   - Procure por: `💾`, `✅`, `❌`

---

## 🔄 **ATUALIZAR O APP (Quando Fizer Mudanças)**

### **Opção 1: Rebuild Automático**
1. Faça suas alterações no código
2. No Android Studio, clique em **Run** → **Run 'app'**
3. O app será recompilado e reinstalado

### **Opção 2: Hot Reload (Mais Rápido)**
1. Faça alterações no React
2. Execute: `npm run build`
3. Execute: `npm run cap:copy`
4. No Android Studio: **Run** → **Run 'app'**

### **Opção 3: Sincronização Automática**
```powershell
cd lajinhaStore
npm run cap:sync
```

Depois execute no Android Studio normalmente.

---

## 📱 **VANTAGENS DE TESTAR NO CELULAR FÍSICO**

✅ **Performance real** - Não é emulado  
✅ **Sensores funcionam** - Câmera, GPS, etc  
✅ **Toque real** - Testa gestos e toques  
✅ **Notificações** - Testa push notifications reais  
✅ **Conexão real** - Testa internet móvel  
✅ **Mais rápido** - Geralmente mais rápido que emulador  

---

## ⚠️ **IMPORTANTE**

- **Mantenha o cabo conectado** enquanto testa
- **Não desative a depuração USB** durante os testes
- **Primeira vez:** Pode demorar alguns minutos para instalar
- **Atualizações:** O app será reinstalado a cada execução

---

## 🎉 **PRONTO!**

Agora você pode testar no celular físico. O app funcionará exatamente como se estivesse publicado na Play Store!

**Teste o fluxo de finalização de pedido e observe os logs!** 🚀




