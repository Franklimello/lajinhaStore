# 📥 Como Adicionar google-services.json

## 📋 **PASSO A PASSO:**

### **1. Baixar o arquivo do Firebase Console:**

1. No Firebase Console, após registrar o app, clique em **"Baixar google-services.json"**
2. O arquivo será baixado para sua pasta de Downloads

### **2. Copiar para o projeto:**

O arquivo deve ir para:
```
lajinhaStore/android/app/google-services.json
```

### **3. Verificar se está correto:**

O arquivo `google-services.json` deve conter algo assim:
```json
{
  "project_info": {
    "project_number": "821962501479",
    "project_id": "compreaqui-324df",
    "storage_bucket": "compreaqui-324df.firebasestorage.app"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:821962501479:android:...",
        "android_client_info": {
          "package_name": "com.supermercado.lajinha"
        }
      },
      ...
    }
  ],
  ...
}
```

**Importante:** O `package_name` deve ser exatamente `com.supermercado.lajinha`

---

## ⚠️ **IMPORTANTE - ANTES DE BAIXAR:**

**Certifique-se de adicionar os SHA-1 primeiro!**

No Firebase Console, antes de baixar o arquivo, adicione:

### **SHA-1 Debug:**
```
26:0F:04:9F:ED:4C:84:28:B0:EE:6F:02:EC:E7:18:72:FA:7D:6B:42
```

### **SHA-1 Release:**
```
2F:51:41:28:13:BC:84:08:9F:37:4D:83:C7:11:9D:01:04:ED:4B:8C
```

**Como adicionar:**
1. Após inserir o package name, clique em **"Adicionar impressão digital"**
2. Cole o SHA-1 Debug
3. Clique em **"Adicionar impressão digital"** novamente
4. Cole o SHA-1 Release
5. **Depois** baixe o arquivo google-services.json

---

## ✅ **VERIFICAÇÃO:**

Após adicionar o arquivo, o `build.gradle` já está configurado para detectá-lo automaticamente (linha 47-54 do `android/app/build.gradle`).

O plugin do Google Services será aplicado automaticamente quando o arquivo existir.

---

## 🚀 **PRÓXIMOS PASSOS:**

1. ✅ Adicionar SHA-1 (debug e release)
2. ✅ Baixar google-services.json
3. ✅ Copiar para `android/app/google-services.json`
4. ✅ Continuar com o passo 3 no Firebase (adicionar SDK)
5. ✅ Rebuild o app no Android Studio
6. ✅ Testar login com Google

---

## 📅 **Última Atualização:**
31 de outubro de 2025




