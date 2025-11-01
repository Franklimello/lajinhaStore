# 📱 Guia Completo - Transformar em App Nativo com Capacitor

Este guia transforma seu app React web em um **app nativo para Android e iOS** usando Capacitor.

---

## 🎯 O QUE É O CAPACITOR?

Capacitor é um framework que:
- ✅ Embrulha seu código web em um app nativo
- ✅ Permite acesso a recursos nativos (câmera, notificações, etc.)
- ✅ Funciona com React, Vue, Angular, qualquer framework web
- ✅ Uma única base de código para Android e iOS

---

## 📋 PRÉ-REQUISITOS

### Para Android:
- [ ] Java JDK 11 ou superior
- [ ] Android Studio (com Android SDK)
- [ ] Variáveis de ambiente configuradas (JAVA_HOME, ANDROID_HOME)

### Para iOS (apenas Mac):
- [ ] Xcode 14+ instalado
- [ ] CocoaPods instalado (`sudo gem install cocoapods`)

---

## 🚀 PASSO A PASSO COMPLETO

### 1️⃣ Instalar o Capacitor

No terminal, dentro da pasta `lajinhaStore`:

```bash
npm install @capacitor/core @capacitor/cli
```

### 2️⃣ Inicializar o Capacitor

```bash
npx cap init supermercado-online-lajinha com.supermercado.lajinha
```

**Onde:**
- `supermercado-online-lajinha` = Nome do app
- `com.supermercado.lajinha` = Bundle ID (identificador único)

Isso cria o arquivo `capacitor.config.ts` na raiz do projeto.

### 3️⃣ Criar Build de Produção

```bash
npm run build
```

Isso gera a pasta `build/` com seu app otimizado.

### 4️⃣ Copiar Build para Capacitor

```bash
npx cap copy
```

Isso copia os arquivos da pasta `build/` para as plataformas nativas.

---

## 🤖 ANDROID

### 5️⃣ Adicionar Plataforma Android

```bash
npm install @capacitor/android
npx cap add android
```

### 6️⃣ Abrir no Android Studio

```bash
npx cap open android
```

Isso abre o projeto Android no Android Studio.

### 7️⃣ Configurar Android

#### No Android Studio:

1. **Alterar ícone do app:**
   - Vá em `android/app/src/main/res/`
   - Substitua os ícones em `mipmap-*` (hdpi, mdpi, xhdpi, xxhdpi, xxxhdpi)

2. **Alterar nome do app:**
   - Abra `android/app/src/main/res/values/strings.xml`
   - Altere `app_name`:
   ```xml
   <string name="app_name">Supermercado Lajinha</string>
   ```

3. **Configurar permissões:**
   - Abra `android/app/src/main/AndroidManifest.xml`
   - Adicione permissões necessárias (se usar plugins)

### 8️⃣ Gerar APK ou AAB

#### Para Testes (APK):
1. No Android Studio: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. APK gerado em: `android/app/build/outputs/apk/`

#### Para Play Store (AAB):
1. No Android Studio: `Build` → `Generate Signed Bundle / APK`
2. Selecione `Android App Bundle`
3. Siga o wizard para assinar o app

---

## 🍎 iOS

### 9️⃣ Adicionar Plataforma iOS

```bash
npm install @capacitor/ios
npx cap add ios
```

### 🔟 Abrir no Xcode

```bash
npx cap open ios
```

### 1️⃣1️⃣ Configurar iOS

#### No Xcode:

1. **Alterar ícone:**
   - Arraste ícones para `AppIcon` no Asset Catalog

2. **Alterar nome:**
   - Selecione o projeto → `General` → `Display Name`

3. **Configurar Bundle ID:**
   - Selecione o projeto → `Signing & Capabilities`
   - Configure sua conta Apple Developer

---

## 🔄 FLUXO DE ATUALIZAÇÃO

Sempre que fizer alterações no código React:

```bash
# 1. Criar build
npm run build

# 2. Copiar para plataformas
npx cap copy

# 3. Sincronizar (atualiza plugins)
npx cap sync

# 4. Abrir no IDE
npx cap open android   # ou ios
```

---

## 🔌 PLUGINS ÚTEIS PARA E-COMMERCE

### Notificações Push

```bash
npm install @capacitor/push-notifications
npx cap sync
```

**Uso no React:**
```javascript
import { PushNotifications } from '@capacitor/push-notifications';

// Solicitar permissão
PushNotifications.requestPermissions().then(result => {
  if (result.receive === 'granted') {
    PushNotifications.register();
  }
});

// Escutar notificações
PushNotifications.addListener('pushNotificationReceived', (notification) => {
  console.log('Notificação recebida:', notification);
});
```

### Câmera (para escanear QR Code PIX)

```bash
npm install @capacitor/camera
npx cap sync
```

**Uso no React:**
```javascript
import { Camera } from '@capacitor/camera';

const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera
  });
  
  return image.webPath;
};
```

### Geolocalização (para entrega)

```bash
npm install @capacitor/geolocation
npx cap sync
```

**Uso no React:**
```javascript
import { Geolocation } from '@capacitor/geolocation';

const getCurrentPosition = async () => {
  const coordinates = await Geolocation.getCurrentPosition();
  return {
    latitude: coordinates.coords.latitude,
    longitude: coordinates.coords.longitude
  };
};
```

### Armazenamento Local (melhor que localStorage)

```bash
npm install @capacitor/preferences
npx cap sync
```

**Uso no React:**
```javascript
import { Preferences } from '@capacitor/preferences';

// Salvar
await Preferences.set({ key: 'cart', value: JSON.stringify(cartItems) });

// Ler
const { value } = await Preferences.get({ key: 'cart' });
const cartItems = JSON.parse(value);
```

### Status Bar (customizar barra superior)

```bash
npm install @capacitor/status-bar
npx cap sync
```

**Uso no React:**
```javascript
import { StatusBar } from '@capacitor/status-bar';

// Mudar cor da barra
StatusBar.setBackgroundColor({ color: '#3b82f6' });

// Esconder/mostrar
StatusBar.hide();
StatusBar.show();
```

### Splash Screen (tela de carregamento)

```bash
npm install @capacitor/splash-screen
npx cap sync
```

**Uso no React:**
```javascript
import { SplashScreen } from '@capacitor/splash-screen';

// Esconder após carregar
SplashScreen.hide();

// Mostrar durante loading
SplashScreen.show();
```

---

## 📝 CONFIGURAÇÃO AVANÇADA

### Arquivo `capacitor.config.ts`

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.supermercado.lajinha',
  appName: 'Supermercado Online Lajinha',
  webDir: 'build',
  server: {
    // Para desenvolvimento (aponta para localhost)
    // url: 'http://192.168.1.100:3000',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#3b82f6",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot find module '@capacitor/core'"

```bash
npm install @capacitor/core @capacitor/cli --save
```

### Erro: "Android SDK not found"

1. Instale Android Studio
2. Configure `ANDROID_HOME` no ambiente:
   - Windows: `set ANDROID_HOME=C:\Users\SeuUser\AppData\Local\Android\Sdk`
   - Linux/Mac: `export ANDROID_HOME=$HOME/Android/Sdk`

### Erro: "Gradle build failed"

1. Abra Android Studio
2. Deixe sincronizar gradle
3. Tente novamente

### Build iOS não funciona

1. Certifique-se de estar no Mac
2. Instale Xcode Command Line Tools: `xcode-select --install`
3. Instale CocoaPods: `sudo gem install cocoapods`

### App não carrega no Android/iOS

1. Verifique se rodou `npm run build`
2. Verifique se rodou `npx cap copy`
3. Limpe e reconstrua: `npx cap sync`

---

## 📦 ESTRUTURA DE PASTAS APÓS CAPACITOR

```
lajinhaStore/
├── build/                    # Build do React (npm run build)
├── android/                   # Projeto Android (gerado)
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── java/      # Código Java/Kotlin
│   │   │       ├── res/       # Recursos (ícones, etc.)
│   │   │       └── AndroidManifest.xml
│   │   └── build.gradle
│   └── gradle/
├── ios/                       # Projeto iOS (gerado)
│   └── App/
│       ├── App/
│       │   └── App.xcodeproj
│       └── Podfile
├── capacitor.config.ts        # Configuração do Capacitor
└── package.json
```

---

## ✅ CHECKLIST DE PUBLICaÇÃO

### Android (Play Store):

- [ ] Ícone do app criado (512x512px)
- [ ] Screenshots do app (pelo menos 2)
- [ ] Descrição do app escrita
- [ ] Categoria selecionada
- [ ] Política de privacidade (URL)
- [ ] AAB assinado gerado
- [ ] Conta Google Play Developer criada ($25 uma vez)

### iOS (App Store):

- [ ] Ícone do app criado (1024x1024px)
- [ ] Screenshots do app (vários tamanhos)
- [ ] Descrição do app escrita
- [ ] Categoria selecionada
- [ ] Política de privacidade (URL)
- [ ] Bundle ID configurado
- [ ] Certificado de desenvolvimento/configuração
- [ ] Conta Apple Developer ($99/ano)

---

## 🎯 PRÓXIMOS PASSOS

1. **Instalar Capacitor** (Passo 1-2)
2. **Criar build** (Passo 3)
3. **Adicionar Android** (Passo 5-8)
4. **Testar no dispositivo** físico ou emulador
5. **Adicionar plugins** conforme necessidade
6. **Publicar** nas lojas

---

## 📚 RECURSOS ADICIONAIS

- [Documentação Oficial Capacitor](https://capacitorjs.com/docs)
- [Guia de Plugins](https://capacitorjs.com/docs/plugins)
- [Guia Android](https://capacitorjs.com/docs/android)
- [Guia iOS](https://capacitorjs.com/docs/ios)

---

## 🆘 SUPORTE

Se encontrar problemas:

1. Verifique a [documentação oficial](https://capacitorjs.com/docs)
2. Consulte issues no [GitHub do Capacitor](https://github.com/ionic-team/capacitor)
3. Verifique os logs: `npx cap run android --verbose`

---

**Boa sorte com seu app nativo! 🚀📱**





