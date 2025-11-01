import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.supermercado.lajinha',
  appName: 'Sup Lajinha',
  webDir: 'build',
  server: {
    // Descomente durante desenvolvimento para apontar para servidor local
    // url: 'http://192.168.1.100:3000',
    // cleartext: true
    
    // Para produção, remova ou comente a seção server acima
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
    },
    StatusBar: {
      style: "default",
      backgroundColor: "#3b82f6"
    }
  },
  android: {
    allowMixedContent: true,
    // Scheme para deep links e redirects (necessário para login Google)
    scheme: "com.supermercado.lajinha",
    buildOptions: {
      // Configuração do keystore para assinar o app
      // IMPORTANTE: Guarde essas senhas em local seguro!
      keystorePath: "android/app/lajinha-release-key.jks",
      keystorePassword: "lajinha2024!",  // Senha do keystore
      keystoreAlias: "lajinha-key",
      keystoreAliasPassword: "lajinha2024!"  // Senha do alias
      
      // Para usar variáveis de ambiente (RECOMENDADO para produção):
      // keystorePath: process.env.KEYSTORE_PATH || "android/app/lajinha-release-key.jks",
      // keystorePassword: process.env.KEYSTORE_PASSWORD || "",
      // keystoreAlias: process.env.KEYSTORE_ALIAS || "lajinha-key",
      // keystoreAliasPassword: process.env.KEYSTORE_ALIAS_PASSWORD || ""
    }
  },
  ios: {
    scheme: "Supermercado Lajinha",
    contentInset: "automatic"
  }
};

export default config;


