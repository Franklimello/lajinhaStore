// Configuração de Temas e Cores Personalizáveis
// Permite personalização visual do sistema sem alterar código

export const themeConfig = {
  // Cores Principais (do .env ou padrão)
  colors: {
    primary: process.env.REACT_APP_THEME_PRIMARY || '#3B82F6', // Azul padrão
    secondary: process.env.REACT_APP_THEME_SECONDARY || '#8B5CF6', // Roxo padrão
    accent: process.env.REACT_APP_THEME_ACCENT || '#10B981', // Verde padrão
    danger: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
  },

  // Gradientes para Botões (Tailwind CSS)
  gradients: {
    primary: process.env.REACT_APP_GRADIENT_PRIMARY || 'from-blue-500 to-blue-600',
    secondary: process.env.REACT_APP_GRADIENT_SECONDARY || 'from-purple-500 to-pink-500',
    accent: process.env.REACT_APP_GRADIENT_ACCENT || 'from-green-500 to-emerald-600',
  },

  // Temas Pré-definidos (pode ser selecionado via UI admin no futuro)
  presets: {
    default: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#10B981',
      name: 'Padrão (Azul/Roxo)'
    },
    green: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#3B82F6',
      name: 'Verde Natural'
    },
    orange: {
      primary: '#F97316',
      secondary: '#EA580C',
      accent: '#EF4444',
      name: 'Laranja Vibrante'
    },
    purple: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#A855F7',
      name: 'Roxo Elegante'
    },
    red: {
      primary: '#EF4444',
      secondary: '#DC2626',
      accent: '#F97316',
      name: 'Vermelho Energético'
    },
    dark: {
      primary: '#1F2937',
      secondary: '#111827',
      accent: '#3B82F6',
      name: 'Escuro Moderno'
    },
  }
};

/**
 * Aplica um tema ao sistema
 * @param {string} themeName - Nome do tema preset ou 'custom'
 * @returns {object} Objeto com cores do tema
 */
export const applyTheme = (themeName = 'default') => {
  const theme = themeConfig.presets[themeName] || themeConfig.presets.default;
  
  // Atualiza variáveis CSS customizadas (se necessário)
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-accent', theme.accent);
  }
  
  return theme;
};

/**
 * Obtém cores do tema atual (do .env ou preset)
 */
export const getThemeColors = () => {
  return {
    primary: themeConfig.colors.primary,
    secondary: themeConfig.colors.secondary,
    accent: themeConfig.colors.accent,
    danger: themeConfig.colors.danger,
    warning: themeConfig.colors.warning,
    success: themeConfig.colors.success,
  };
};

/**
 * Obtém gradientes configurados
 */
export const getThemeGradients = () => {
  return themeConfig.gradients;
};

export default themeConfig;

