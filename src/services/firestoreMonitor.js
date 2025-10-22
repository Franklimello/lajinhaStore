/**
 * 📊 Firestore Monitor - Sistema de Monitoramento de Leituras
 * 
 * Rastreia todas as leituras do Firestore para identificar gargalos
 * e otimizar o uso do banco de dados.
 */

class FirestoreMonitor {
  constructor() {
    this.reads = [];
    this.totalReads = 0;
    this.readsByCollection = {};
    this.readsByPage = {};
    this.startTime = Date.now();
    this.isEnabled = true;
    
    // Limites de alerta
    this.ALERT_THRESHOLDS = {
      readsPerMinute: 100,
      readsPerPage: 50,
      totalReadsPerSession: 1000
    };

    // Carregar estatísticas do localStorage
    this.loadStats();
  }

  /**
   * 📝 Registrar uma leitura do Firestore
   */
  trackRead(collection, count = 1, metadata = {}) {
    if (!this.isEnabled) return;

    const read = {
      collection,
      count,
      timestamp: Date.now(),
      page: window.location.pathname,
      metadata,
      stackTrace: this._getStackTrace()
    };

    this.reads.push(read);
    this.totalReads += count;

    // Atualizar estatísticas por coleção
    this.readsByCollection[collection] = (this.readsByCollection[collection] || 0) + count;

    // Atualizar estatísticas por página
    const page = window.location.pathname;
    this.readsByPage[page] = (this.readsByPage[page] || 0) + count;

    // Log no console
    console.log(`📖 [FirestoreMonitor] Leitura registrada:`, {
      collection,
      count,
      page,
      totalSession: this.totalReads
    });

    // Verificar alertas
    this._checkAlerts();

    // Salvar estatísticas
    this.saveStats();

    // Limitar tamanho do array (últimas 1000 leituras)
    if (this.reads.length > 1000) {
      this.reads = this.reads.slice(-1000);
    }
  }

  /**
   * 📊 Obter estatísticas gerais
   */
  getStats() {
    const sessionDuration = (Date.now() - this.startTime) / 1000 / 60; // minutos
    const readsPerMinute = this.totalReads / sessionDuration;

    return {
      totalReads: this.totalReads,
      sessionDuration: sessionDuration.toFixed(2),
      readsPerMinute: readsPerMinute.toFixed(2),
      readsByCollection: this.readsByCollection,
      readsByPage: this.readsByPage,
      lastReads: this.reads.slice(-10) // Últimas 10 leituras
    };
  }

  /**
   * 📈 Obter estatísticas detalhadas por período
   */
  getDetailedStats(periodMinutes = 5) {
    const cutoffTime = Date.now() - (periodMinutes * 60 * 1000);
    const recentReads = this.reads.filter(r => r.timestamp > cutoffTime);

    const byCollection = {};
    const byPage = {};

    recentReads.forEach(read => {
      byCollection[read.collection] = (byCollection[read.collection] || 0) + read.count;
      byPage[read.page] = (byPage[read.page] || 0) + read.count;
    });

    return {
      period: `${periodMinutes} minutos`,
      totalReads: recentReads.reduce((sum, r) => sum + r.count, 0),
      byCollection,
      byPage,
      timeline: this._groupByMinute(recentReads)
    };
  }

  /**
   * 🔍 Encontrar leituras mais custosas
   */
  getExpensiveReads(limit = 10) {
    return [...this.reads]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 📍 Obter leituras de uma página específica
   */
  getReadsByPage(page = window.location.pathname) {
    return this.reads.filter(r => r.page === page);
  }

  /**
   * 🗑️ Limpar histórico
   */
  clear() {
    this.reads = [];
    this.totalReads = 0;
    this.readsByCollection = {};
    this.readsByPage = {};
    this.startTime = Date.now();
    this.saveStats();
    console.log('🧹 [FirestoreMonitor] Histórico limpo');
  }

  /**
   * 💾 Salvar estatísticas no localStorage
   */
  saveStats() {
    try {
      localStorage.setItem('firestore_monitor_stats', JSON.stringify({
        totalReads: this.totalReads,
        readsByCollection: this.readsByCollection,
        readsByPage: this.readsByPage,
        startTime: this.startTime,
        lastUpdate: Date.now()
      }));
    } catch (e) {
      console.warn('⚠️ [FirestoreMonitor] Erro ao salvar stats:', e);
    }
  }

  /**
   * 📥 Carregar estatísticas do localStorage
   */
  loadStats() {
    try {
      const saved = localStorage.getItem('firestore_monitor_stats');
      if (saved) {
        const stats = JSON.parse(saved);
        
        // Verificar se é da mesma sessão (menos de 1 hora)
        if (Date.now() - stats.lastUpdate < 60 * 60 * 1000) {
          this.totalReads = stats.totalReads || 0;
          this.readsByCollection = stats.readsByCollection || {};
          this.readsByPage = stats.readsByPage || {};
          this.startTime = stats.startTime || Date.now();
          console.log('📥 [FirestoreMonitor] Estatísticas carregadas:', stats);
        } else {
          console.log('🔄 [FirestoreMonitor] Sessão expirada, iniciando nova');
          this.clear();
        }
      }
    } catch (e) {
      console.warn('⚠️ [FirestoreMonitor] Erro ao carregar stats:', e);
    }
  }

  /**
   * 🚨 Verificar se há alertas
   */
  _checkAlerts() {
    const stats = this.getDetailedStats(1); // Último minuto

    // Alerta: Muitas leituras por minuto
    if (stats.totalReads > this.ALERT_THRESHOLDS.readsPerMinute) {
      console.warn(`🚨 [FirestoreMonitor] ALERTA: ${stats.totalReads} leituras no último minuto (limite: ${this.ALERT_THRESHOLDS.readsPerMinute})`);
      this._sendAlert('readsPerMinute', stats.totalReads);
    }

    // Alerta: Muitas leituras na página atual
    const currentPage = window.location.pathname;
    if (this.readsByPage[currentPage] > this.ALERT_THRESHOLDS.readsPerPage) {
      console.warn(`🚨 [FirestoreMonitor] ALERTA: ${this.readsByPage[currentPage]} leituras na página ${currentPage} (limite: ${this.ALERT_THRESHOLDS.readsPerPage})`);
    }

    // Alerta: Muitas leituras na sessão
    if (this.totalReads > this.ALERT_THRESHOLDS.totalReadsPerSession) {
      console.error(`🚨 [FirestoreMonitor] ALERTA CRÍTICO: ${this.totalReads} leituras na sessão (limite: ${this.ALERT_THRESHOLDS.totalReadsPerSession})`);
      this._sendAlert('totalReadsPerSession', this.totalReads);
    }
  }

  /**
   * 📧 Enviar alerta (pode ser conectado a serviço externo)
   */
  _sendAlert(type, value) {
    // Aqui você pode enviar para um serviço de monitoramento
    // Como Sentry, LogRocket, ou criar uma notificação no admin
    console.error(`🚨 ALERTA: ${type} = ${value}`);
    
    // Salvar alertas no localStorage
    try {
      const alerts = JSON.parse(localStorage.getItem('firestore_alerts') || '[]');
      alerts.push({
        type,
        value,
        timestamp: Date.now(),
        page: window.location.pathname
      });
      
      // Manter apenas últimos 100 alertas
      if (alerts.length > 100) {
        alerts.splice(0, alerts.length - 100);
      }
      
      localStorage.setItem('firestore_alerts', JSON.stringify(alerts));
    } catch (e) {
      console.warn('⚠️ Erro ao salvar alerta:', e);
    }
  }

  /**
   * 📚 Obter stack trace (para debug)
   */
  _getStackTrace() {
    try {
      throw new Error();
    } catch (e) {
      const stack = e.stack.split('\n').slice(2, 4); // Primeiras 2 linhas relevantes
      return stack.join(' -> ');
    }
  }

  /**
   * ⏰ Agrupar leituras por minuto
   */
  _groupByMinute(reads) {
    const grouped = {};
    
    reads.forEach(read => {
      const minute = Math.floor(read.timestamp / 60000) * 60000;
      grouped[minute] = (grouped[minute] || 0) + read.count;
    });

    return grouped;
  }

  /**
   * 📊 Gerar relatório completo
   */
  generateReport() {
    const stats = this.getStats();
    const detailed = this.getDetailedStats(5);
    const expensive = this.getExpensiveReads(5);

    const report = `
╔════════════════════════════════════════════════════════════╗
║         📊 RELATÓRIO DE LEITURAS DO FIRESTORE              ║
╚════════════════════════════════════════════════════════════╝

📈 ESTATÍSTICAS GERAIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total de Leituras: ${stats.totalReads}
Duração da Sessão: ${stats.sessionDuration} minutos
Leituras/Minuto: ${stats.readsPerMinute}

📚 LEITURAS POR COLEÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${Object.entries(stats.readsByCollection)
  .map(([col, count]) => `  ${col}: ${count} leituras`)
  .join('\n')}

📄 LEITURAS POR PÁGINA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${Object.entries(stats.readsByPage)
  .map(([page, count]) => `  ${page}: ${count} leituras`)
  .join('\n')}

⚠️ LEITURAS MAIS CUSTOSAS (Top 5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${expensive
  .map((r, i) => `  ${i + 1}. ${r.collection} - ${r.count} docs (${r.page})`)
  .join('\n')}

🕐 ÚLTIMOS 5 MINUTOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: ${detailed.totalReads} leituras

Por Coleção:
${Object.entries(detailed.byCollection)
  .map(([col, count]) => `  ${col}: ${count}`)
  .join('\n')}

╚════════════════════════════════════════════════════════════╝
`;

    console.log(report);
    return report;
  }

  /**
   * 🎯 Ativar/Desativar monitoramento
   */
  enable() {
    this.isEnabled = true;
    console.log('✅ [FirestoreMonitor] Monitoramento ativado');
  }

  disable() {
    this.isEnabled = false;
    console.log('⏸️ [FirestoreMonitor] Monitoramento desativado');
  }
}

// Singleton global
const firestoreMonitor = new FirestoreMonitor();

// Expor globalmente para debug no console
if (typeof window !== 'undefined') {
  window.firestoreMonitor = firestoreMonitor;
  console.log('🔍 FirestoreMonitor disponível globalmente: window.firestoreMonitor');
  console.log('📊 Comandos úteis:');
  console.log('  - firestoreMonitor.getStats()');
  console.log('  - firestoreMonitor.generateReport()');
  console.log('  - firestoreMonitor.getDetailedStats(5)');
  console.log('  - firestoreMonitor.clear()');
}

export default firestoreMonitor;

