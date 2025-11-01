/**
 * Componente para exibir status do Capacitor (apenas em desenvolvimento)
 * Útil para debugar se está rodando no app nativo ou web
 */

import React from 'react';
import { useCapacitor } from '../../utils/capacitor';

export default function CapacitorStatus() {
  const { isNative, isAndroid, isIOS, isWeb, platform } = useCapacitor();

  // Só mostra em desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-lg shadow-lg text-xs z-50">
      <div className="font-bold mb-1">📱 Capacitor Status</div>
      <div>Plataforma: <span className="font-semibold">{platform}</span></div>
      <div>Nativo: {isNative ? '✅' : '❌'}</div>
      <div>Android: {isAndroid ? '✅' : '❌'}</div>
      <div>iOS: {isIOS ? '✅' : '❌'}</div>
      <div>Web: {isWeb ? '✅' : '❌'}</div>
    </div>
  );
}





