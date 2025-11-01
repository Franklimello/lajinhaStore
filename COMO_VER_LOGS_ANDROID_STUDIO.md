# 📱 Como Ver Logs no Android Studio

## 🎯 **Método 1: Logcat (Recomendado)**

### **Passo 1: Abrir o Logcat**
1. No Android Studio, na parte inferior da tela, procure pela aba **"Logcat"**
2. Se não aparecer, vá em: **View → Tool Windows → Logcat**
   - Ou use o atalho: `Alt + 6` (Windows/Linux) ou `Cmd + 6` (Mac)

### **Passo 2: Filtrar os Logs**
No Logcat, você verá vários campos de filtro:

1. **Dispositivo/Emulador:**
   - Selecione o emulador que está rodando o app

2. **Filtro por Tag/Pacote:**
   - Clique no campo de filtro (ícone de funil 🔽)
   - Digite: `ReactNativeJS` ou `console` ou `chromium`
   - Ou filtre por: `com.supermercado.lajinha`

3. **Nível de Log:**
   - Escolha o nível desejado:
     - **Verbose** (mostra tudo)
     - **Debug** (debug + info + warn + error)
     - **Info** (info + warn + error)
     - **Warn** (warn + error)
     - **Error** (só erros)

### **Passo 3: Procurar Logs Específicos**
Digite na barra de busca do Logcat:
- `saveOrder` - Para ver logs de salvamento de pedido
- `Erro ao salvar` - Para ver erros
- `Pedido salvo` - Para ver sucessos
- `Firebase` - Para ver logs do Firebase
- `💾` ou `❌` ou `✅` - Para ver nossos logs formatados

---

## 🎯 **Método 2: Chrome DevTools (Melhor para React)**

### **Para Apps Capacitor/React:**

1. **No Emulador/Dispositivo:**
   - Abra o app

2. **No Computador:**
   - Abra o Chrome
   - Digite na barra de endereços: `chrome://inspect`
   - Clique em **"inspect"** no seu app listado
   - Vá na aba **Console**

3. **Vantagens:**
   - ✅ Logs formatados melhor
   - ✅ Pode usar `console.log`, `console.error`, etc.
   - ✅ Debug interativo
   - ✅ Network tab para ver requisições

---

## 🎯 **Método 3: Terminal (adb logcat)**

### **Via PowerShell/Terminal:**

```powershell
# Ver todos os logs
adb logcat

# Filtrar por React
adb logcat | Select-String "React"

# Filtrar por nosso app
adb logcat | Select-String "supermercado"

# Filtrar erros apenas
adb logcat *:E

# Limpar logs anteriores e mostrar novos
adb logcat -c
adb logcat
```

---

## 🔍 **O Que Procurar nos Logs**

### **Logs de Sucesso:**
```
💾 saveOrder: Iniciando salvamento...
💾 saveOrder: Dados preparados para salvar...
✅ saveOrder: Pedido salvo com sucesso! ID: abc123
📦 Dados do pedido: {...}
✅ Pedido criado! QR Code gerado com sucesso!
```

### **Logs de Erro:**
```
❌ Erro ao salvar pedido: {...}
❌ saveOrder: Firestore db não está inicializado
❌ Falha ao salvar pedido: {...}
```

### **Erros Comuns do Firebase:**
```
Permission denied - Problema de permissões no Firestore
Network request failed - Problema de conexão
Firebase app not initialized - Firebase não configurado
```

---

## 🛠️ **Configurações Úteis do Logcat**

### **1. Salvar Logs em Arquivo:**
- No Logcat, clique com botão direito
- **Save Logcat to File**
- Escolha onde salvar

### **2. Limpar Logs:**
- Botão 🗑️ (trash) ou `Ctrl + L`

### **3. Scroll Lock:**
- Botão 📌 (pin) para travar a rolagem automática

### **4. Busca Avançada:**
- Use regex para buscar padrões específicos
- Exemplo: `error|Error|ERROR` para encontrar todos os erros

---

## 📱 **Para Testar Agora:**

1. **Abra o Logcat no Android Studio**
2. **Filtre por:** `ReactNativeJS` ou `chromium`
3. **No app, tente finalizar um pedido**
4. **Observe os logs que aparecem**

---

## 🐛 **Se Não Ver Nenhum Log:**

### **Verifique:**
- ✅ Emulador está rodando?
- ✅ App está instalado e aberto?
- ✅ Selecionou o dispositivo correto no Logcat?
- ✅ Nível de log está em "Verbose" ou "Debug"?

### **Solução Alternativa:**
Use o **Chrome DevTools** (`chrome://inspect`) - funciona melhor para apps React/WebView!

---

## 💡 **Dica Pro:**

**Para ver logs do React especificamente:**
1. Abra `chrome://inspect`
2. Clique em "inspect" no seu app
3. Vá na aba Console
4. Todos os `console.log()` do React aparecerão aqui!

**Isso é mais fácil que o Logcat para apps React/Capacitor!** 🚀




