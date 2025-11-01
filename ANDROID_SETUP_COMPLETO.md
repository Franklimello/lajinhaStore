# ✅ Android Setup Completo!

## 🎉 O que foi feito:

1. ✅ **Build de produção criado** (`npm run build`)
2. ✅ **@capacitor/android instalado**
3. ✅ **TypeScript instalado** (necessário para capacitor.config.ts)
4. ✅ **Plataforma Android adicionada** (`npx cap add android`)
5. ✅ **Build copiado para Android** (arquivos em `android/app/src/main/assets/public/`)
6. ✅ **Capacitor sincronizado** (`npx cap sync`)

---

## 📱 Estrutura do Projeto Android Criado:

```
android/
├── app/
│   ├── build.gradle                    # Configuração do app
│   ├── src/
│   │   └── main/
│   │       ├── AndroidManifest.xml    # Manifest do Android
│   │       ├── java/
│   │       │   └── com/supermercado/lajinha/
│   │       │       └── MainActivity.java  # Activity principal
│   │       ├── assets/
│   │       │   ├── capacitor.config.json  # Config do Capacitor
│   │       │   └── public/            # Seu app React (build/)
│   │       └── res/                   # Recursos (ícones, splash, etc.)
│   └── ...
├── build.gradle                       # Configuração do projeto
└── settings.gradle
```

---

## 🚀 Próximos Passos:

### 1. Abrir no Android Studio

```bash
npm run cap:android
```

**OU manualmente:**
```bash
npx cap open android
```

Isso abrirá o Android Studio com o projeto pronto.

---

### 2. Configurações no Android Studio

#### A. Configurar SDK (se necessário)

1. No Android Studio: `File` → `Project Structure`
2. Verifique se o **Android SDK** está configurado
3. Certifique-se de ter o **Android SDK Platform 33+** instalado

#### B. Configurar Emulador (opcional)

1. `Tools` → `Device Manager`
2. Clique em `Create Device`
3. Escolha um dispositivo (ex: Pixel 5)
4. Escolha uma versão do Android (API 33+)
5. Finalize a criação

#### C. Executar o App

1. Conecte um dispositivo Android via USB (com depuração USB ativada)
   **OU**
2. Inicie um emulador Android
3. Clique no botão **▶ Run** no Android Studio
   **OU**
4. Pressione `Shift + F10`

---

### 3. Personalizar o App

#### Alterar Nome do App

Edite: `android/app/src/main/res/values/strings.xml`

```xml
<string name="app_name">Supermercado Lajinha</string>
```

#### Alterar Ícone do App

1. Substitua os arquivos em:
   - `android/app/src/main/res/mipmap-hdpi/ic_launcher.png`
   - `android/app/src/main/res/mipmap-mdpi/ic_launcher.png`
   - `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png`
   - `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
   - `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`

2. Use ícones de 48x48, 72x72, 96x96, 144x144, 192x192 pixels respectivamente

#### Alterar Splash Screen

1. Substitua as imagens em `android/app/src/main/res/drawable*/splash.png`
2. Ou edite `android/app/src/main/res/values/styles.xml` para customizar

---

### 4. Gerar APK para Teste

1. No Android Studio: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. Aguarde a compilação
3. O APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`
4. Transfira para seu dispositivo e instale

---

### 5. Gerar AAB para Play Store

1. No Android Studio: `Build` → `Generate Signed Bundle / APK`
2. Selecione `Android App Bundle`
3. Se você já tem uma keystore:
   - Clique em `Choose existing...`
   - Selecione seu arquivo `.jks` ou `.keystore`
   - Digite senha e alias
4. Se você não tem keystore:
   - Clique em `Create new...`
   - Preencha os dados
   - Guarde a senha e o arquivo `.jks` gerado em local seguro!
5. Escolha `release` como build variant
6. Finalize o wizard
7. O AAB estará em: `android/app/release/app-release.aab`

---

## 🔄 Atualizar o App (Quando Fizer Mudanças no React)

Sempre que você modificar o código React:

```bash
# 1. Criar novo build
npm run build

# 2. Copiar para Android
npm run cap:copy

# 3. Sincronizar (se instalou novos plugins)
npm run cap:sync

# 4. Abrir no Android Studio novamente
npm run cap:android
```

**OU use o script que faz tudo:**
```bash
npm run cap:sync:android
```

---

## 📋 Checklist Antes de Publicar na Play Store:

### Configurações Básicas:
- [ ] Nome do app definido corretamente
- [ ] Ícone do app personalizado (todas as densidades)
- [ ] Versão e versionCode atualizados no `build.gradle`
- [ ] Permissões necessárias configuradas no `AndroidManifest.xml`

### Build:
- [ ] APK testado em dispositivos reais
- [ ] AAB gerado e assinado
- [ ] Testado em diferentes tamanhos de tela
- [ ] Testado em diferentes versões do Android (API 21+)

### Play Store:
- [ ] Screenshots do app preparados (pelo menos 2)
- [ ] Descrição do app escrita
- [ ] Categoria selecionada
- [ ] Política de privacidade (URL)
- [ ] Conta Google Play Developer criada ($25 uma vez)

---

## 🔧 Troubleshooting

### Erro: "SDK not found"
1. Abra Android Studio
2. `Tools` → `SDK Manager`
3. Instale `Android SDK Platform 33` ou superior
4. Instale `Android SDK Build-Tools`

### Erro: "Gradle sync failed"
1. No Android Studio: `File` → `Invalidate Caches / Restart`
2. Aguarde o Android Studio reiniciar
3. Deixe o Gradle sincronizar automaticamente

### App não carrega no dispositivo
1. Verifique se rodou `npm run build`
2. Verifique se rodou `npm run cap:copy`
3. Limpe o projeto: `Build` → `Clean Project`
4. Reconstrua: `Build` → `Rebuild Project`

### Build falha com erro de dependências
1. No Android Studio: `File` → `Sync Project with Gradle Files`
2. Se persistir, tente: `Build` → `Clean Project` → `Rebuild Project`

---

## 📚 Arquivos Importantes:

- **`capacitor.config.ts`** - Configuração principal do Capacitor
- **`android/app/build.gradle`** - Configuração do build Android
- **`android/app/src/main/AndroidManifest.xml`** - Permissões e configurações do app
- **`android/app/src/main/res/values/strings.xml`** - Strings do app (nome, etc.)

---

## ✅ Status Atual:

- [x] Capacitor instalado
- [x] Android configurado
- [x] Build copiado
- [x] Projeto Android criado
- [ ] Testado no dispositivo/emulador
- [ ] Personalizado (ícone, nome)
- [ ] APK/AAB gerado

---

## 🎯 Próximo Comando:

Para abrir o projeto no Android Studio:

```bash
npm run cap:android
```

**OU**

```bash
npx cap open android
```

Depois, basta clicar em **Run** ▶ no Android Studio!

---

## 📝 Notas:

- O app React roda dentro de uma **WebView nativa**
- Você pode usar **plugins nativos** do Capacitor
- O código React permanece o mesmo, apenas embrulhado
- Atualizações do React precisam de rebuild e recopy para o Android

---

**Tudo pronto para Android! 🎉📱**

Abra o Android Studio e comece a testar seu app nativo!





