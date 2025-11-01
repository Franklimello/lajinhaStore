# ✅ Checklist Final: Publicar na Play Store

## 🎉 **O QUE JÁ ESTÁ PRONTO:**

### ✅ **Técnico:**
- [x] App funcionando no dispositivo
- [x] Login com Google funcionando
- [x] Keystore criado e configurado
- [x] Nome do app: **"Sup Lajinha"**
- [x] Ícone personalizado configurado
- [x] Package name: `com.supermercado.lajinha`
- [x] Version code: `1`
- [x] Version name: `1.0.0`
- [x] Firebase configurado
- [x] Google OAuth configurado
- [x] SHA-1 adicionado no Firebase

---

## ⚠️ **O QUE AINDA FALTA FAZER:**

### **1. Gerar Build Final (AAB) - OBRIGATÓRIO**

**Execute no terminal:**
```bash
cd lajinhaStore
npm run build
npm run cap:copy
cd android
.\gradlew.bat bundleRelease
```

**O arquivo estará em:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

### **2. Criar Política de Privacidade - OBRIGATÓRIO**

A Play Store **EXIGE** uma URL de Política de Privacidade.

**O que fazer:**
1. Crie uma página no seu site com a política
2. Exemplo: `https://compreaqui-324df.web.app/politica-privacidade`
3. Ou hospede em qualquer lugar público

**Conteúdo mínimo:**
- Quais dados são coletados (email, nome, endereço)
- Como são usados (processar pedidos)
- Se são compartilhados (não compartilhamos com terceiros)
- Como entrar em contato

---

### **3. Preparar Screenshots - OBRIGATÓRIO**

Precisa de **pelo menos 2 screenshots**:

**Especificações:**
- **Telefone:** 1080x1920px ou maior
- **Tablet (7"):** 1200x1920px (opcional)
- **Tablet (10"):** 1600x2560px (opcional)

**Como fazer:**
1. Execute o app no emulador ou dispositivo
2. Tire screenshots das principais telas:
   - Tela inicial
   - Lista de produtos
   - Carrinho
   - Tela de login
   - Finalização de pedido

---

### **4. Criar Ícone para Play Store**

**Especificações:**
- **Tamanho:** 512x512 pixels
- **Formato:** PNG (sem transparência)
- **Fundo:** Deve ter fundo sólido

**Como fazer:**
1. Use o `logo512.png` que você tem
2. Ou gere com o IconKitchen selecionando "512x512" na exportação

---

### **5. Conta de Desenvolvedor Google Play**

**Se ainda não tiver:**
1. Acesse: https://play.google.com/console
2. Faça login com sua conta Google
3. Pague a taxa única de **$25 USD**
4. Preencha dados bancários e fiscais
5. Aguarde aprovação (24-48h)

---

### **6. Informações para o Formulário**

**Precisa ter pronto:**
- **Nome:** Sup Lajinha
- **Descrição curta (80 caracteres):** Ex: "Supermercado online com entrega rápida e os melhores preços!"
- **Descrição completa (4000 caracteres):** Detalhes sobre o app
- **Categoria:** Compras / Shopping
- **Email de contato:** Seu email
- **Website:** URL do seu site
- **Política de privacidade:** URL (obrigatório!)

---

## 🚀 **PASSO A PASSO PARA PUBLICAR:**

### **Passo 1: Gerar o AAB**
```bash
cd lajinhaStore
npm run build
npm run cap:copy
cd android
.\gradlew.bat bundleRelease
```

### **Passo 2: Criar Política de Privacidade**
- Crie página no site ou hospede em qualquer lugar
- Anote a URL

### **Passo 3: Preparar Screenshots**
- Tire 2+ screenshots do app
- Salve em 1080x1920px ou maior

### **Passo 4: Acessar Play Console**
1. https://play.google.com/console
2. Criar app (ou usar existente)

### **Passo 5: Preencher Formulário**
- Todas as informações acima
- Upload do AAB
- Upload dos screenshots
- Upload do ícone 512x512

### **Passo 6: Enviar para Revisão**
- Revise tudo
- Clique em "Enviar para revisão"
- Aguarde 1-3 dias

---

## 📋 **CHECKLIST RÁPIDO:**

**Antes de enviar, verifique:**
- [ ] AAB gerado (`app-release.aab` existe)
- [ ] Política de privacidade criada e com URL
- [ ] 2+ screenshots prontos (1080x1920px)
- [ ] Ícone 512x512px pronto
- [ ] Descrição do app escrita
- [ ] Conta desenvolvedor criada e aprovada
- [ ] App testado completamente
- [ ] Login funciona
- [ ] Compra funciona
- [ ] Todas as telas funcionam

---

## ⚡ **PRONTO PARA ENVIAR?**

Se TODOS os itens acima estiverem ✅, você pode enviar! 🚀

---

## 📅 **Última Atualização:**
31 de outubro de 2025




