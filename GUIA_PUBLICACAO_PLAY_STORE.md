# 📱 Guia Completo: Publicar App na Play Store

## ⚠️ O que falta fazer ANTES de publicar:

### ✅ 1. **ASSINAR O APP (KEYSTORE) - OBRIGATÓRIO**

A Play Store exige que o app seja assinado digitalmente.

#### Criar o Keystore:

```bash
cd lajinhaStore/android/app
keytool -genkeypair -v -storetype PKCS12 -keystore lajinha-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias lajinha-key
```

**IMPORTANTE:**
- Guarde a senha do keystore e do alias em local SEGURO
- **NUNCA** perca esse arquivo! Se perder, não poderá atualizar o app na Play Store!
- O arquivo `lajinha-release-key.jks` deve ser adicionado ao `.gitignore`

#### Configurar no `capacitor.config.ts`:

```typescript
android: {
  buildOptions: {
    keystorePath: "android/app/lajinha-release-key.jks",
    keystorePassword: "SUA_SENHA_AQUI",
    keystoreAlias: "lajinha-key",
    keystoreAliasPassword: "SUA_SENHA_ALIAS_AQUI"
  }
}
```

⚠️ **NÃO COMMITE AS SENHAS!** Use variáveis de ambiente.

---

### ✅ 2. **GERAR BUILD DE RELEASE (AAB)**

A Play Store exige **AAB** (Android App Bundle), não APK:

```bash
cd lajinhaStore
npm run build
npm run cap:copy
cd android
./gradlew bundleRelease
```

O arquivo estará em:
`android/app/build/outputs/bundle/release/app-release.aab`

---

### ✅ 3. **ÍCONE DO APP PERSONALIZADO**

Atualmente está usando ícone padrão. Substitua as imagens em:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- `android/app/src/main/res/mipmap-*/ic_launcher_round.png`

**Tamanhos necessários:**
- hdpi: 72x72px
- mdpi: 48x48px
- xhdpi: 96x96px
- xxhdpi: 144x144px
- xxxhdpi: 192x192px

**Ferramenta recomendada:** [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)

---

### ✅ 4. **SPLASH SCREEN PERSONALIZADA**

Já existe splash, mas você pode personalizar:
- `android/app/src/main/res/drawable-*/splash.png`

---

### ✅ 5. **VERSION CODE E VERSION NAME**

Atualize em `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 2  // Incremente a cada publicação (2, 3, 4...)
    versionName "1.0.1"  // Versão visível para usuários
}
```

**Regra:**
- `versionCode`: SEMPRE incrementar (não pode repetir)
- `versionName`: Versão que o usuário vê (ex: "1.0.1", "1.1.0", "2.0.0")

---

### ✅ 6. **PERMISSÕES NECESSÁRIAS**

Verifique o `AndroidManifest.xml` e adicione conforme necessário:

```xml
<!-- Já tem -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Se precisar de notificações push -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Se precisar de localização -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Se precisar de câmera -->
<uses-permission android:name="android.permission.CAMERA" />
```

---

### ✅ 7. **POLÍTICA DE PRIVACIDADE**

A Play Store **EXIGE** uma URL de Política de Privacidade.

**O que fazer:**
1. Crie uma página no seu site com a política de privacidade
2. Exemplo: `https://seusite.com.br/politica-de-privacidade`
3. Informe essa URL no formulário da Play Store

**Conteúdo mínimo:**
- Quais dados são coletados
- Como são usados
- Se são compartilhados com terceiros
- Como entrar em contato

---

### ✅ 8. **INFORMAÇÕES PARA O FORMULÁRIO DA PLAY STORE**

Prepare estes dados:

- **Nome do App:** Supermercado Online Lajinha
- **Descrição curta (80 caracteres):** Ex: "Compre produtos do supermercado online com entrega rápida!"
- **Descrição completa (4000 caracteres):** Detalhes sobre o app
- **Categoria:** Compras / Shopping
- **Classificação de conteúdo:** PEGI 3 ou equivalente
- **Screenshots:** 
  - Pelo menos 2 screenshots (obrigatório)
  - Telefone: 1080x1920px ou maior
  - Tablet (7"): 1200x1920px
  - Tablet (10"): 1600x2560px
- **Ícone:** 512x512px (PNG, sem transparência)
- **Banner:** 1024x500px (opcional, mas recomendado)
- **Email de contato:** Seu email de suporte
- **Website:** URL do seu site
- **Política de Privacidade:** URL (obrigatório!)

---

### ✅ 9. **TESTAR O APP**

Antes de publicar, teste:

- [ ] App abre corretamente
- [ ] Todas as telas funcionam
- [ ] Compra funciona
- [ ] Notificações (se houver)
- [ ] Permissões solicitadas corretamente
- [ ] Splash screen aparece
- [ ] Botões funcionam
- [ ] Navegação funciona
- [ ] Imagens carregam
- [ ] Conexão com Firebase funciona

---

### ✅ 10. **CONTA DE DESENVOLVEDOR GOOGLE PLAY**

1. Acesse: [Google Play Console](https://play.google.com/console)
2. Crie conta de desenvolvedor (custo único: **$25 USD**)
3. Preencha dados bancários e fiscais
4. Aguarde aprovação (geralmente 24-48h)

---

## 🚀 PASSO A PASSO PARA PUBLICAR:

### **Passo 1: Preparar Build Final**

```bash
cd lajinhaStore

# 1. Build do React
npm run build

# 2. Copiar para Capacitor
npm run cap:copy

# 3. Sincronizar Android
cd android
./gradlew clean
./gradlew bundleRelease
```

### **Passo 2: Localizar o AAB**

O arquivo estará em:
```
lajinhaStore/android/app/build/outputs/bundle/release/app-release.aab
```

### **Passo 3: Fazer Upload na Play Store**

1. Acesse [Google Play Console](https://play.google.com/console)
2. Clique em "Criar app"
3. Preencha todas as informações
4. Na aba "Produção" → "Criar nova versão"
5. Faça upload do arquivo `.aab`
6. Preencha "O que há de novo nesta versão"
7. Envie para revisão

### **Passo 4: Aguardar Revisão**

- Tempo médio: 1-3 dias
- Google revisa o app antes de publicar
- Você receberá email quando aprovar ou rejeitar

---

## 📋 CHECKLIST FINAL:

- [ ] Keystore criado e configurado
- [ ] Senhas guardadas em local seguro
- [ ] Build AAB gerado com sucesso
- [ ] Ícone personalizado
- [ ] Splash screen personalizada
- [ ] Version code e version name atualizados
- [ ] Permissões verificadas
- [ ] Política de privacidade criada e publicada
- [ ] Screenshots preparados
- [ ] App testado completamente
- [ ] Conta de desenvolvedor Google criada
- [ ] AAB enviado para Play Store
- [ ] Formulário preenchido completamente

---

## ⚠️ PROBLEMAS COMUNS:

### **Erro: "App não assinado"**
- Verifique se o keystore está configurado corretamente
- Execute `./gradlew bundleRelease` novamente

### **Erro: "Version code já existe"**
- Incremente o `versionCode` no `build.gradle`

### **Erro: "Política de privacidade ausente"**
- Adicione URL da política de privacidade no formulário

### **App rejeitado pela Play Store:**
- Leia o motivo da rejeição
- Geralmente são problemas de privacidade ou conteúdo
- Corrija e reenvie

---

## 📞 PRÓXIMOS PASSOS:

1. **Criar o keystore** (comando acima)
2. **Configurar no capacitor.config.ts**
3. **Gerar o AAB de release**
4. **Criar conta de desenvolvedor** (se ainda não tiver)
5. **Fazer upload do AAB**
6. **Preencher formulário completo**
7. **Enviar para revisão**

---

**Precisa de ajuda em algum passo específico?** 🚀




