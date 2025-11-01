# 🔧 Correção: Code 10 - Google Sign-In Error

## ❌ **PROBLEMA:**
```
Error: Something went wrong
code: 10
```

**Causa:** O SHA-1 configurado no Firebase Console não corresponde ao SHA-1 do app instalado no dispositivo.

---

## ✅ **SHA-1 ATUAL DO APP (DEBUG):**

### **SHA-1:**
```
26:0F:04:9F:ED:4C:84:28:B0:EE:6F:02:EC:E7:18:72:FA:7D:6B:42
```

### **SHA-256:**
```
08:EA:E0:6F:0D:C4:61:62:84:1B:D5:EC:DD:FD:0F:AC:04:2F:89:2E:4D:A5:03:7F:AF:39:F3:F7:DE:B8:B1:00
```

---

## 📝 **PASSO A PASSO PARA CORRIGIR:**

### **1. Acesse o Firebase Console:**
1. Vá para: https://console.firebase.google.com/
2. Selecione o projeto: **compreaqui-324df**

### **2. Adicione o SHA-1:**
1. Clique em **⚙️ Configurações do Projeto** (ícone de engrenagem no canto superior esquerdo)
2. Role até a seção **Seus apps**
3. Encontre o app Android: **com.supermercado.lajinha**
4. Clique em **Adicionar impressão digital**
5. Cole o SHA-1:
   ```
   26:0F:04:9F:ED:4C:84:28:B0:EE:6F:02:EC:E7:18:72:FA:7D:6B:42
   ```
6. Clique em **Salvar**

### **3. Adicione também o SHA-256 (opcional mas recomendado):**
1. Na mesma página, clique em **Adicionar impressão digital** novamente
2. Cole o SHA-256:
   ```
   08:EA:E0:6F:0D:C4:61:62:84:1B:D5:EC:DD:FD:0F:AC:04:2F:89:2E:4D:A5:03:7F:AF:39:F3:F7:DE:B8:B1:00
   ```
3. Clique em **Salvar**

### **4. Baixe o arquivo google-services.json (se necessário):**
1. Na mesma página do app Android
2. Clique em **Baixar google-services.json**
3. Substitua o arquivo em: `android/app/google-services.json`

### **5. Rebuild e teste:**
1. No Android Studio: **Build → Clean Project**
2. **Build → Rebuild Project**
3. Execute o app novamente
4. Teste o login com Google

---

## ⚠️ **IMPORTANTE:**

### **Para Debug (desenvolvimento):**
- Use o SHA-1 acima: `26:0F:04:9F:ED:4C:84:28:B0:EE:6F:02:EC:E7:18:72:FA:7D:6B:42`

### **Para Release (produção):**
- Você precisará adicionar o SHA-1 do keystore de release também
- O SHA-1 do release é: `2F:51:41:28:13:BC:84:08:9F:37:4D:83:C7:11:9D:01:04:ED:4B:8C`
- **Adicione AMBOS os SHA-1 no Firebase!**

---

## 🔍 **VERIFICAR SE ESTÁ CORRETO:**

Após adicionar o SHA-1, você deve ver na lista de **Impressões digitais SHA** no Firebase:
- ✅ `26:0F:04:9F:ED:4C:84:28:B0:EE:6F:02:EC:E7:18:72:FA:7D:6B:42` (debug)
- ✅ `2F:51:41:28:13:BC:84:08:9F:37:4D:83:C7:11:9D:01:04:ED:4B:8C` (release)

---

## 🚀 **APÓS CONFIGURAR:**

1. **Espere alguns minutos** para o Firebase propagar as mudanças (2-5 minutos)
2. **Rebuild o app** no Android Studio
3. **Teste o login** novamente

O erro Code 10 deve desaparecer! ✅

---

## 📋 **CHECKLIST:**

- [ ] SHA-1 debug adicionado no Firebase: `26:0F:04:9F:ED:4C:84:28:B0:EE:6F:02:EC:E7:18:72:FA:7D:6B:42`
- [ ] SHA-1 release adicionado no Firebase: `2F:51:41:28:13:BC:84:08:9F:37:4D:83:C7:11:9D:01:04:ED:4B:8C`
- [ ] google-services.json atualizado (se necessário)
- [ ] App rebuildado no Android Studio
- [ ] Login testado novamente

---

## 📅 **Última Atualização:**
31 de outubro de 2025




