/**
 * Utilitários para Capacitor
 * Detecta se está rodando no Capacitor e fornece helpers
 */

import { Capacitor } from '@capacitor/core';

/**
 * Verifica se está rodando no Capacitor (app nativo)
 * @returns {boolean}
 */
export const isNative = () => {
  return Capacitor.isNativePlatform();
};

/**
 * Verifica se está rodando no Android
 * @returns {boolean}
 */
export const isAndroid = () => {
  return Capacitor.getPlatform() === 'android';
};

/**
 * Verifica se está rodando no iOS
 * @returns {boolean}
 */
export const isIOS = () => {
  return Capacitor.getPlatform() === 'ios';
};

/**
 * Verifica se está rodando no navegador web
 * @returns {boolean}
 */
export const isWeb = () => {
  return Capacitor.getPlatform() === 'web';
};

/**
 * Retorna a plataforma atual
 * @returns {'android' | 'ios' | 'web'}
 */
export const getPlatform = () => {
  return Capacitor.getPlatform();
};

/**
 * Hook para usar em componentes React
 * @returns {object} { isNative, isAndroid, isIOS, isWeb, platform }
 */
export const useCapacitor = () => {
  return {
    isNative: isNative(),
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    isWeb: isWeb(),
    platform: getPlatform()
  };
};

export default {
  isNative,
  isAndroid,
  isIOS,
  isWeb,
  getPlatform,
  useCapacitor
};





