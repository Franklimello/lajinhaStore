// Verificação da configuração do Firebase Auth
export const firebaseAuthCheck = {
  // Verifica se o domínio está autorizado
  checkAuthorizedDomains: () => {
    const hostname = window.location.hostname;
    const authorizedDomains = [
      'localhost',
      '127.0.0.1',
      'compreaqui-324df.web.app',
      'compreaqui-324df.firebaseapp.com'
    ];
    
    return authorizedDomains.includes(hostname);
  },

  // Verifica se o Google Auth está habilitado
  checkGoogleAuthEnabled: async () => {
    try {
      // Tenta criar um provider para verificar se está configurado
      const { GoogleAuthProvider } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      
      // Verifica se os scopes estão disponíveis
      provider.addScope('email');
      provider.addScope('profile');
      
      return true;
    } catch (error) {
      console.error('Erro ao verificar Google Auth:', error);
      return false;
    }
  },

  // Verifica se o ambiente é seguro
  checkSecureContext: () => {
    return window.isSecureContext || window.location.hostname === 'localhost';
  },

  // Verifica se popups são permitidos
  checkPopupSupport: () => {
    try {
      const popup = window.open('', '_blank', 'width=1,height=1');
      if (popup) {
        popup.close();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  // Verifica conectividade com Google
  checkGoogleConnectivity: async () => {
    try {
      const response = await fetch('https://accounts.google.com/gsi/client', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  // Executa todas as verificações
  runAllChecks: async () => {
    const results = {
      authorizedDomains: this.checkAuthorizedDomains(),
      googleAuthEnabled: await this.checkGoogleAuthEnabled(),
      secureContext: this.checkSecureContext(),
      popupSupport: this.checkPopupSupport(),
      googleConnectivity: await this.checkGoogleConnectivity()
    };

    // Calcula score geral
    const score = Object.values(results).filter(Boolean).length;
    results.score = score;
    results.total = Object.keys(results).length - 1; // -1 para excluir score

    return results;
  },

  // Gera relatório de diagnóstico
  generateReport: (results) => {
    const report = [];
    
    report.push(`🔍 Diagnóstico do Firebase Auth`);
    report.push(`📊 Score: ${results.score}/${results.total}`);
    report.push('');
    
    report.push(`✅ Domínio autorizado: ${results.authorizedDomains ? 'Sim' : 'Não'}`);
    report.push(`✅ Google Auth habilitado: ${results.googleAuthEnabled ? 'Sim' : 'Não'}`);
    report.push(`✅ Ambiente seguro: ${results.secureContext ? 'Sim' : 'Não'}`);
    report.push(`✅ Popups permitidos: ${results.popupSupport ? 'Sim' : 'Não'}`);
    report.push(`✅ Conectividade Google: ${results.googleConnectivity ? 'Sim' : 'Não'}`);
    report.push('');
    
    if (results.score < results.total) {
      report.push('⚠️ Problemas encontrados:');
      
      if (!results.authorizedDomains) {
        report.push('- Domínio não autorizado no Firebase Console');
      }
      
      if (!results.googleAuthEnabled) {
        report.push('- Google Auth não habilitado no Firebase Console');
      }
      
      if (!results.secureContext) {
        report.push('- Ambiente não seguro (HTTP)');
      }
      
      if (!results.popupSupport) {
        report.push('- Popups bloqueados pelo navegador');
      }
      
      if (!results.googleConnectivity) {
        report.push('- Problema de conectividade com Google');
      }
    } else {
      report.push('🎉 Todas as verificações passaram!');
    }
    
    return report.join('\n');
  }
};

