import React, { memo, useCallback } from 'react';

const CategoriesGrid = memo(({ onCategoryClick }) => {
  const categories = [
    { 
      name: 'Mercearia', 
      icon: '🛒',
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      name: 'Limpeza', 
      icon: '🧹',
      color: 'from-teal-500 to-cyan-600'
    },
    { 
      name: 'Frios e laticínios', 
      icon: '🧀',
      color: 'from-yellow-500 to-amber-600'
    },
    { 
      name: 'Guloseimas e snacks', 
      icon: '🍫',
      color: 'from-pink-500 to-fuchsia-600'
    },
    { 
      name: 'Bebidas', 
      icon: '🥤',
      color: 'from-cyan-500 to-blue-600'
    },
    { 
      name: 'Bebidas Geladas', 
      icon: '🧊',
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      name: 'Higiene pessoal', 
      icon: '🧴',
      color: 'from-purple-500 to-violet-600'
    },
    { 
      name: 'Cosméticos', 
      icon: '💄',
      color: 'from-pink-500 to-purple-600'
    },
    { 
      name: 'Farmácia', 
      icon: '💊',
      color: 'from-emerald-500 to-green-600'
    },
    { 
      name: 'Utilidades domésticas', 
      icon: '🏠',
      color: 'from-orange-500 to-red-600'
    },
    { 
      name: 'Pet shop', 
      icon: '🐾',
      color: 'from-amber-500 to-orange-600'
    },
    { 
      name: 'Infantil', 
      icon: '👶',
      color: 'from-sky-500 to-blue-600'
    },
    { 
      name: 'Hortifruti', 
      icon: '🥬',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      name: 'Açougue', 
      icon: '🥩',
      color: 'from-red-500 to-rose-600'
    }
  ];

  const handleCategoryClick = useCallback((categoryName) => {
    if (onCategoryClick) {
      onCategoryClick(categoryName);
    }
  }, [onCategoryClick]);

  return (
    <div className="container mx-auto px-4 pb-8">
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl shadow-cyan-500/10 p-6 border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]"></div>
        
        <div className="relative">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent mb-6 text-center">
            Escolha uma categoria
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => handleCategoryClick(category.name)}
                className={`group relative flex flex-col items-center p-3 md:p-4 bg-gradient-to-br ${category.color} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ring-1 ring-white/10`}
                aria-label={`Ir para categoria ${category.name}`}
              >
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                
                <span className="text-xs md:text-sm font-bold text-white text-center leading-tight drop-shadow-lg">
                  {category.name}
                </span>

                
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

CategoriesGrid.displayName = 'CategoriesGrid';

export default CategoriesGrid;
