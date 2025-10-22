import React, { Component } from 'react';

/**
 * ErrorBoundary - Componente para capturar erros em Suspense
 * Fornece fallback elegante para falhas de carregamento
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-6xl text-gray-300 mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Ops! Algo deu errado
            </h3>
            <p className="text-gray-500 mb-4">
              Não foi possível carregar esta seção. Tente recarregar a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;









