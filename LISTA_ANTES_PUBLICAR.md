# ✅ Lista: Antes de Publicar na Play Store

## 🎉 **O QUE JÁ ESTÁ PRONTO:**

- ✅ App funcionando no dispositivo
- ✅ Login com Google funcionando
- ✅ Keystore criado e configurado
- ✅ Nome do app: "Sup Lajinha"
- ✅ Ícone personalizado (você acabou de adicionar)
- ✅ Firebase configurado
- ✅ Google OAuth configurado

---

## ⚠️ **O QUE FALTA FAZER (5 coisas):**

### **1. Gerar Build Final (AAB) - OBRIGATÓRIO**

**No terminal, execute:**
```bash
cd lajinhaStore
npm run build
npm run cap:copy
cd android
.\gradlew.bat bundleRelease
```

**O arquivo será criado em:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

**Este é o arquivo que você vai enviar para a Play Store!**

---

### **2. Criar Política de Privacidade - OBRIGATÓRIO**

A Play Store **EXIGE** uma URL de Política de Privacidade.

**Opções:**
1. Criar uma página no seu site Firebase Hosting
2. Ou hospedar em qualquer lugar público

**Conteúdo básico:**
- Dados coletados (nome, email, endereço, telefone)
- Como são usados (processar pedidos, entregas)
- Não compartilhamos com terceiros
- Contato para dúvidas

**URL de exemplo:** `https://compreaqui-324df.web.app/politica-privacidade`

---

### **3. Preparar Screenshots - OBRIGATÓRIO**

Precisa de **pelo menos 2 screenshots**.

**Tamanhos:**
- **Telefone:** 1080x1920px ou maior (obrigatório)
- **Tablet:** Opcional

**Telas para capturar:**
- Tela inicial/home
- Lista de produtos
- Carrinho
- Tela de login
- Finalização de pedido

**Como fazer:**
- Execute o app no emulador/celular
- Tire screenshots
- Salve os arquivos

---

### **4. Ícone 512x512px para Play Store**

- Use o `logo512.png` que você tem em `public/logo512.png`
- Ou exporte do IconKitchen em 512x512px
- Deve ser PNG sem transparência

---

### **5. Conta de Desenvolvedor Google Play**

**Se ainda não tiver:**
1. Acesse: https://play.google.com/console
2. Faça login
3. Pague **$25 USD** (taxa única)
4. Preencha dados bancários
5. Aguarde aprovação (24-48h)

---

## 🚀 **ORDEM DE EXECUÇÃO:**

1. **Primeiro:** Gerar o AAB (comando acima)
2. **Segundo:** Criar política de privacidade
3. **Terceiro:** Preparar screenshots
4. **Quarto:** Criar conta desenvolvedor (se não tiver)
5. **Quinto:** Fazer upload na Play Store

---

## 📋 **RESUMO RÁPIDO:**

✅ **Já está pronto:**
- App funcional
- Login funcionando
- Keystore configurado
- Ícone configurado

⚠️ **Ainda precisa:**
- [ ] Gerar AAB (`.\gradlew.bat bundleRelease`)
- [ ] Criar política de privacidade (URL)
- [ ] Preparar 2+ screenshots
- [ ] Conta desenvolvedor (se não tiver)

---

## 💡 **DICA:**

Você pode fazer tudo isso agora mesmo:
1. Gerar o AAB (5 minutos)
2. Criar página simples de política (10 minutos)
3. Tirar screenshots (5 minutos)

**Total: ~20 minutos!** ⏱️

Depois é só criar a conta (se não tiver) e fazer upload! 🚀

---

## 📅 **Última Atualização:**
31 de outubro de 2025




