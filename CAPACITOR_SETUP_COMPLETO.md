# ✅ Capacitor - Setup Completo

## 📋 O que foi implementado

### 1. ✅ Dependências Instaladas
- `@capacitor/core` v7.4.4
- `@capacitor/cli` v7.4.4

### 2. ✅ Arquivos Criados

#### Configuração Principal
- **`capacitor.config.ts`** - Configuração completa do Capacitor com:
  - App ID: `com.supermercado.lajinha`
  - App Name: `Supermercado Online Lajinha`
  - Splash Screen configurado
  - Status Bar configurado
  - Push Notifications configurado

#### Utilitários
- **`src/utils/capacitor.js`** - Helpers para detectar plataforma:
  - `isNative()` - Verifica se está no app nativo
  - `isAndroid()` - Verifica se está no Android
  - `isIOS()` - Verifica se está no iOS
  - `isWeb()` - Verifica se está no navegador
  - `useCapacitor()` - Hook para componentes React

- **`src/utils/capacitorPlugins.js`** - Helpers para plugins:
  - `usePushNotifications()` - Notificações push
  - `useStatusBar()` - Controlar barra superior
  - `useSplashScreen()` - Tela de carregamento
  - `useCamera()` - Câmera (para QR Code)
  - `useGeolocation()` - Localização (para entrega)
  - `usePreferences()` - Armazenamento local
  - `useApp()` - Eventos do app

#### Componentes
- **`src/components/CapacitorStatus/index.js`** - Componente de debug (só aparece em desenvolvimento)

#### Scripts NPM
Adicionados ao `package.json`:
- `npm run cap:sync` - Sincronizar plugins
- `npm run cap:copy` - Copiar build
- `npm run cap:android` - Abrir Android Studio
- `npm run cap:ios` - Abrir Xcode
- `npm run cap:build` - Build + Copy
- `npm run cap:sync:android` - Build + Sync + Abrir Android
- `npm run cap:sync:ios` - Build + Sync + Abrir iOS

#### Documentação
- **`GUIA_CAPACITOR_APP_NATIVO.md`** - Guia completo passo a passo
- **`CAPACITOR_COMANDOS_RAPIDOS.md`** - Comandos úteis

---

## 🚀 Próximos Passos

### Para Android:

1. **Instalar plataforma Android:**
```bash
npm install @capacitor/android --legacy-peer-deps
npx cap add android
```

2. **Criar build e copiar:**
```bash
npm run build
npm run cap:copy
```

3. **Abrir no Android Studio:**
```bash
npm run cap:android
```

4. **No Android Studio:**
   - Testar no emulador ou dispositivo
   - Configurar ícones e nome do app
   - Gerar APK ou AAB

### Para iOS (apenas Mac):

1. **Instalar plataforma iOS:**
```bash
npm install @capacitor/ios --legacy-peer-deps
npx cap add ios
```

2. **Criar build e copiar:**
```bash
npm run build
npm run cap:copy
```

3. **Abrir no Xcode:**
```bash
npm run cap:ios
```

4. **No Xcode:**
   - Testar no simulador ou dispositivo
   - Configurar ícones e Bundle ID
   - Gerar Archive para publicação

---

## 📝 Exemplo de Uso

### Detectar Plataforma

```javascript
import { useCapacitor } from './utils/capacitor';

function MeuComponente() {
  const { isNative, isAndroid, isIOS, platform } = useCapacitor();
  
  if (isNative) {
    console.log('Rodando no app nativo!');
  }
  
  return (
    <div>
      {isAndroid && <p>Você está no Android!</p>}
      {isIOS && <p>Você está no iOS!</p>}
    </div>
  );
}
```

### Usar Notificações Push (depois de instalar plugin)

```javascript
import { useEffect } from 'react';
import { usePushNotifications } from './utils/capacitorPlugins';

function App() {
  useEffect(() => {
    const setupNotifications = async () => {
      const push = await usePushNotifications();
      
      if (push) {
        push.addListener((notification) => {
          console.log('Notificação recebida:', notification);
          // Mostrar notificação ou atualizar estado
        });
      }
    };
    
    setupNotifications();
  }, []);
  
  return <div>...</div>;
}
```

### Usar Câmera para QR Code

```javascript
import { useState } from 'react';
import { useCamera } from './utils/capacitorPlugins';

function QRCodeScanner() {
  const [image, setImage] = useState(null);
  
  const handleScan = async () => {
    const camera = await useCamera();
    
    if (camera) {
      const photo = await camera.takePicture();
      setImage(photo.webPath);
      // Processar QR Code aqui
    }
  };
  
  return (
    <button onClick={handleScan}>
      Escanear QR Code
    </button>
  );
}
```

---

## 🔌 Plugins Recomendados para E-commerce

### Prioridade Alta:
1. **@capacitor/push-notifications** - Notificações de pedidos
2. **@capacitor/status-bar** - Customizar barra superior
3. **@capacitor/splash-screen** - Tela de carregamento

### Prioridade Média:
4. **@capacitor/preferences** - Armazenamento local melhorado
5. **@capacitor/app** - Lifecycle events, abrir URLs

### Prioridade Baixa (se necessário):
6. **@capacitor/camera** - Escanear QR Code PIX
7. **@capacitor/geolocation** - Rastrear entrega

---

## 📚 Arquivos de Referência

- `GUIA_CAPACITOR_APP_NATIVO.md` - Guia completo detalhado
- `CAPACITOR_COMANDOS_RAPIDOS.md` - Comandos úteis
- `capacitor.config.ts` - Configuração do Capacitor
- `src/utils/capacitor.js` - Helpers de plataforma
- `src/utils/capacitorPlugins.js` - Helpers de plugins

---

## ✅ Status Atual

- [x] Capacitor instalado
- [x] Configuração criada
- [x] Scripts NPM adicionados
- [x] Utilitários criados
- [x] Documentação completa
- [ ] Plataforma Android adicionada (próximo passo)
- [ ] Plataforma iOS adicionada (próximo passo - Mac)
- [ ] Plugins instalados (conforme necessidade)

---

## 🎯 Próximo Comando

Para começar a trabalhar com Android, execute:

```bash
npm install @capacitor/android --legacy-peer-deps && npx cap add android && npm run build && npm run cap:copy && npm run cap:android
```

Ou use o script simplificado:
```bash
npm run cap:sync:android
```

**Nota:** Certifique-se de ter o Android Studio instalado e configurado antes!

---

**Setup concluído! 🎉 Agora você pode transformar seu app web em nativo!**





