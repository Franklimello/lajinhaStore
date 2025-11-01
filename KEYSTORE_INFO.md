# ⚠️ INFORMAÇÕES CRÍTICAS DO KEYSTORE

## 🔐 **GUARDE ESTAS INFORMAÇÕES EM LOCAL SEGURO!**

Se você perder estas informações, **NÃO PODERÁ ATUALIZAR SEU APP** na Play Store!

---

## 📋 Dados do Keystore Criado:

**Arquivo:** `android/app/lajinha-release-key.jks`

**Senha do Keystore:** `lajinha2024!`

**Alias:** `lajinha-key`

**Senha do Alias:** `lajinha2024!`

**Validade:** 10.000 dias (aproximadamente 27 anos)

---

## 🚨 IMPORTANTE:

1. **FAÇA BACKUP** deste arquivo em local seguro (pendrive, nuvem criptografada, etc.)
2. **NUNCA** commite o arquivo `.jks` no Git (já está no `.gitignore`)
3. **NUNCA** compartilhe essas senhas
4. **MESMO** que troque de computador, você precisa deste arquivo para atualizar o app

---

## 📝 Onde estas informações são usadas:

- `capacitor.config.ts` - Configuração do Capacitor
- `android/app/build.gradle` - Build do Android (pode usar variáveis de ambiente)

---

## 🔄 Se precisar gerar um novo keystore:

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore lajinha-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias lajinha-key
```

**MAS ATENÇÃO:** Só faça isso se **NUNCA** publicou o app na Play Store! Se já publicou, você PRECISA usar o mesmo keystore!

---

**Data de criação:** $(Get-Date -Format "dd/MM/yyyy HH:mm")




