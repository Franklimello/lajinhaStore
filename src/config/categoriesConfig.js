// Configuração de Categorias Personalizáveis
// Permite adicionar/remover/editar categorias sem alterar código

/**
 * Categorias padrão do sistema
 * Cada categoria deve ter:
 * - name: Nome exibido
 * - icon: Emoji ou nome do ícone
 * - color: Classe Tailwind para gradiente
 * - route: Rota da página (deve corresponder ao arquivo em src/pages/)
 * - enabled: Se a categoria está ativa
 */
export const defaultCategories = [
  { 
    name: 'Mercearia', 
    icon: '🛒', 
    color: 'from-blue-500 to-indigo-600', 
    route: '/mercearia',
    enabled: true 
  },
  { 
    name: 'Limpeza', 
    icon: '🧹', 
    color: 'from-teal-500 to-cyan-600', 
    route: '/limpeza',
    enabled: true 
  },
  { 
    name: 'Frios e laticínios', 
    icon: '🧀', 
    color: 'from-yellow-500 to-amber-600', 
    route: '/frios-laticinios',
    enabled: true 
  },
  { 
    name: 'Guloseimas e snacks', 
    icon: '🍫', 
    color: 'from-pink-500 to-fuchsia-600', 
    route: '/guloseimas-snacks',
    enabled: true 
  },
  { 
    name: 'Bebidas', 
    icon: '🥤', 
    color: 'from-cyan-500 to-blue-600', 
    route: '/bebidas',
    enabled: true 
  },
  { 
    name: 'Bebidas Geladas', 
    icon: '🧊', 
    color: 'from-blue-500 to-indigo-600', 
    route: '/bebidas-geladas',
    enabled: true 
  },
  { 
    name: 'Higiene pessoal', 
    icon: '🧴', 
    color: 'from-purple-500 to-violet-600', 
    route: '/higiene-pessoal',
    enabled: true 
  },
  { 
    name: 'Cosméticos', 
    icon: '💄', 
    color: 'from-pink-500 to-purple-600', 
    route: '/cosmeticos',
    enabled: true 
  },
  { 
    name: 'Farmácia', 
    icon: '💊', 
    color: 'from-emerald-500 to-green-600', 
    route: '/farmacia',
    enabled: true 
  },
  { 
    name: 'Utilidades domésticas', 
    icon: '🏠', 
    color: 'from-orange-500 to-red-600', 
    route: '/utilidades-domesticas',
    enabled: true 
  },
  { 
    name: 'Pet shop', 
    icon: '🐾', 
    color: 'from-amber-500 to-orange-600', 
    route: '/pet-shop',
    enabled: true 
  },
  { 
    name: 'Infantil', 
    icon: '👶', 
    color: 'from-sky-500 to-blue-600', 
    route: '/infantil',
    enabled: true 
  },
  { 
    name: 'Hortifruti', 
    icon: '🥬', 
    color: 'from-green-500 to-emerald-600', 
    route: '/hortifruti',
    enabled: true 
  },
  { 
    name: 'Açougue', 
    icon: '🥩', 
    color: 'from-red-500 to-rose-600', 
    route: '/acougue',
    enabled: true 
  },
  { 
    name: 'Cesta Básica', 
    icon: '🛒', 
    color: 'from-green-500 to-emerald-600', 
    route: '/cesta-basica',
    enabled: true 
  },
];

/**
 * Carrega categorias do Firestore ou retorna as padrão
 * Útil para multi-tenancy ou configuração dinâmica
 * @returns {Promise<Array>} Array de categorias
 */
export const getCategories = async () => {
  // Opção 1: Carregar do Firestore (recomendado para multi-tenant)
  try {
    const { db } = await import('../firebase/config');
    const { doc, getDoc } = await import('firebase/firestore');
    const configRef = doc(db, 'config', 'categories');
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      const categories = configSnap.data().categories;
      if (Array.isArray(categories) && categories.length > 0) {
        return categories.filter(cat => cat.enabled !== false);
      }
    }
  } catch (error) {
    console.warn('⚠️ Erro ao carregar categorias do Firestore, usando padrão:', error.message);
  }
  
  // Opção 2: Usar categorias padrão
  return defaultCategories.filter(cat => cat.enabled !== false);
};

/**
 * Retorna categorias para exibição na Home
 * Pode filtrar ou ordenar diferentemente das categorias completas
 * @returns {Promise<Array>} Array de categorias para home
 */
export const getHomeCategories = async () => {
  const allCategories = await getCategories();
  
  // Por padrão, retorna todas as categorias habilitadas
  // Você pode adicionar lógica para:
  // - Limitar quantidade na home
  // - Ordenar por prioridade
  // - Filtrar por destaque
  
  return allCategories.slice(0, 16); // Limita a 16 categorias na home
};

/**
 * Busca uma categoria pelo nome
 * @param {string} categoryName - Nome da categoria
 * @returns {Promise<Object|null>} Categoria encontrada ou null
 */
export const getCategoryByName = async (categoryName) => {
  const categories = await getCategories();
  return categories.find(cat => 
    cat.name.toLowerCase() === categoryName.toLowerCase()
  ) || null;
};

/**
 * Valida se uma categoria existe e está habilitada
 * @param {string} categoryName - Nome da categoria
 * @returns {Promise<boolean>} True se existe e está habilitada
 */
export const isCategoryEnabled = async (categoryName) => {
  const category = await getCategoryByName(categoryName);
  return category !== null && category.enabled !== false;
};

export default {
  defaultCategories,
  getCategories,
  getHomeCategories,
  getCategoryByName,
  isCategoryEnabled
};

