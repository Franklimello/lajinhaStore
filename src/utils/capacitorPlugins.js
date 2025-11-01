/**
 * Helpers para plugins do Capacitor
 * 
 * Importe apenas os plugins que você instalou:
 * npm install @capacitor/push-notifications --legacy-peer-deps
 * npm install @capacitor/status-bar --legacy-peer-deps
 * npm install @capacitor/splash-screen --legacy-peer-deps
 * etc.
 */

import { Capacitor } from '@capacitor/core';

/**
 * Verifica se está rodando em ambiente nativo
 */
const isNative = () => Capacitor.isNativePlatform();

/**
 * Notificações Push
 * npm install @capacitor/push-notifications --legacy-peer-deps
 */
export const usePushNotifications = async () => {
  if (!isNative()) {
    console.warn('Push notifications só funcionam no app nativo');
    return null;
  }

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    
    // Solicitar permissão
    const permission = await PushNotifications.requestPermissions();
    
    if (permission.receive === 'granted') {
      // Registrar para receber notificações
      await PushNotifications.register();
      
      return {
        register: () => PushNotifications.register(),
        addListener: (callback) => PushNotifications.addListener('pushNotificationReceived', callback),
        removeAllListeners: () => PushNotifications.removeAllListeners()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao configurar push notifications:', error);
    return null;
  }
};

/**
 * Status Bar (barra superior)
 * npm install @capacitor/status-bar --legacy-peer-deps
 */
export const useStatusBar = async () => {
  if (!isNative()) {
    return null;
  }

  try {
    const { StatusBar } = await import('@capacitor/status-bar');
    
    return {
      setBackgroundColor: (color) => StatusBar.setBackgroundColor({ color }),
      setStyle: (style) => StatusBar.setStyle({ style }), // 'dark' ou 'light'
      hide: () => StatusBar.hide(),
      show: () => StatusBar.show()
    };
  } catch (error) {
    console.error('Erro ao configurar status bar:', error);
    return null;
  }
};

/**
 * Splash Screen (tela de carregamento)
 * npm install @capacitor/splash-screen --legacy-peer-deps
 */
export const useSplashScreen = async () => {
  if (!isNative()) {
    return null;
  }

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    
    return {
      show: (options) => SplashScreen.show(options),
      hide: (options) => SplashScreen.hide(options),
      autoHide: () => SplashScreen.hide({ fadeOutDuration: 300 })
    };
  } catch (error) {
    console.error('Erro ao configurar splash screen:', error);
    return null;
  }
};

/**
 * Câmera (para escanear QR Code)
 * npm install @capacitor/camera --legacy-peer-deps
 */
export const useCamera = async () => {
  if (!isNative()) {
    return null;
  }

  try {
    const { Camera } = await import('@capacitor/camera');
    
    return {
      takePicture: async (options = {}) => {
        return await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: 'uri',
          source: 'CAMERA',
          ...options
        });
      },
      pickFromGallery: async (options = {}) => {
        return await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: 'uri',
          source: 'PHOTOLIBRARY',
          ...options
        });
      }
    };
  } catch (error) {
    console.error('Erro ao configurar câmera:', error);
    return null;
  }
};

/**
 * Geolocalização (para entrega)
 * npm install @capacitor/geolocation --legacy-peer-deps
 */
export const useGeolocation = async () => {
  if (!isNative()) {
    return null;
  }

  try {
    const { Geolocation } = await import('@capacitor/geolocation');
    
    return {
      getCurrentPosition: async () => {
        const coordinates = await Geolocation.getCurrentPosition();
        return {
          latitude: coordinates.coords.latitude,
          longitude: coordinates.coords.longitude,
          accuracy: coordinates.coords.accuracy
        };
      },
      watchPosition: (callback) => {
        return Geolocation.watchPosition({}, callback);
      },
      clearWatch: (watchId) => {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  } catch (error) {
    console.error('Erro ao configurar geolocalização:', error);
    return null;
  }
};

/**
 * Preferences (armazenamento local melhor que localStorage)
 * npm install @capacitor/preferences --legacy-peer-deps
 */
export const usePreferences = async () => {
  if (!isNative()) {
    // Fallback para localStorage no web
    return {
      set: async (key, value) => {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      },
      get: async (key) => {
        const value = localStorage.getItem(key);
        try {
          return { value: JSON.parse(value) };
        } catch {
          return { value };
        }
      },
      remove: async (key) => {
        localStorage.removeItem(key);
      },
      clear: async () => {
        localStorage.clear();
      }
    };
  }

  try {
    const { Preferences } = await import('@capacitor/preferences');
    
    return {
      set: async (key, value) => {
        await Preferences.set({
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value)
        });
      },
      get: async (key) => {
        return await Preferences.get({ key });
      },
      remove: async (key) => {
        await Preferences.remove({ key });
      },
      clear: async () => {
        await Preferences.clear();
      }
    };
  } catch (error) {
    console.error('Erro ao configurar preferences:', error);
    return null;
  }
};

/**
 * App (abrir URLs, lifecycle events)
 * npm install @capacitor/app --legacy-peer-deps
 */
export const useApp = async () => {
  if (!isNative()) {
    return null;
  }

  try {
    const { App } = await import('@capacitor/app');
    
    return {
      openUrl: async (url) => {
        return await App.openUrl({ url });
      },
      canOpenUrl: async (url) => {
        return await App.canOpenUrl({ url });
      },
      getLaunchUrl: async () => {
        return await App.getLaunchUrl();
      },
      addListener: (event, callback) => {
        return App.addListener(event, callback);
      }
    };
  } catch (error) {
    console.error('Erro ao configurar app:', error);
    return null;
  }
};

export default {
  usePushNotifications,
  useStatusBar,
  useSplashScreen,
  useCamera,
  useGeolocation,
  usePreferences,
  useApp
};





