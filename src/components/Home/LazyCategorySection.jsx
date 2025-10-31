import React, { useState, useEffect, useRef, Suspense, lazy, memo, useMemo } from 'react';

// Skeleton otimizado e reutilizável
const CategorySkeleton = memo(function CategorySkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-gray-200 rounded-lg h-48"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// Lazy load dos componentes de categoria - FORA do componente para evitar recriação
const SalgadosDoJoazinho = lazy(() => import('../../pages/SalgadosDoJoazinho'));
const Mercearia = lazy(() => import('../../pages/Mercearia'));
const Limpeza = lazy(() => import('../../pages/Limpeza'));
const FriosLaticinios = lazy(() => import('../../pages/FriosLaticinios'));
const GulosemasSnacks = lazy(() => import('../../pages/GulosemasSnacks'));
const Bebidas = lazy(() => import('../../pages/Bebidas'));
const BebidasGeladas = lazy(() => import('../../pages/BebidasGeladas'));
const HigienePessoal = lazy(() => import('../../pages/HigienePessoal'));
const Cosmeticos = lazy(() => import('../../pages/Cosmeticos'));
const Farmacia = lazy(() => import('../../pages/farmacia'));
const UtilidadesDomesticas = lazy(() => import('../../pages/UtilidadesDomesticas'));
const PetShop = lazy(() => import('../../pages/PetShop'));
const Infantil = lazy(() => import('../../pages/Infantil'));
const Hortifruti = lazy(() => import('../../pages/Hortifruti'));
const Acougue = lazy(() => import('../../pages/Acougue'));
const CestaBasica = lazy(() => import('../../pages/CestaBasica'));

// Mapa de categorias
const categoryMap = {
  'Salgados do Joazinho': SalgadosDoJoazinho,
  'Mercearia': Mercearia,
  'Limpeza': Limpeza,
  'Frios e laticínios': FriosLaticinios,
  'Guloseimas e snacks': GulosemasSnacks,
  'Bebidas': Bebidas,
  'Bebidas Geladas': BebidasGeladas,
  'Higiene pessoal': HigienePessoal,
  'Cosméticos': Cosmeticos,
  'Farmácia': Farmacia,
  'Utilidades domésticas': UtilidadesDomesticas,
  'Pet shop': PetShop,
  'Infantil': Infantil,
  'Hortifruti': Hortifruti,
  'Açougue': Acougue,
  'Cesta Básica': CestaBasica,
};

// Categorias prioritárias que devem carregar imediatamente
const PRIORITY_CATEGORIES = ['Mercearia', 'Bebidas', 'Hortifruti'];

/**
 * LazyCategorySection - Carrega categorias sob demanda com Intersection Observer
 * Otimiza performance carregando apenas quando necessário
 * 
 * OTIMIZAÇÕES:
 * ✅ Intersection Observer com rootMargin inteligente
 * ✅ Carregamento prioritário para categorias principais
 * ✅ Skeleton otimizado e componentizado
 * ✅ Memoização para evitar re-renders
 */
const LazyCategorySection = memo(function LazyCategorySection({ categoryName, searchTerm, priority = false }) {
  const isPriorityCategory = priority || PRIORITY_CATEGORIES.includes(categoryName);
  const [isVisible, setIsVisible] = useState(isPriorityCategory);
  const [hasLoaded, setHasLoaded] = useState(isPriorityCategory);
  const sectionRef = useRef(null);

  // Pega o componente do mapa - MEMOIZADO
  const CategoryComponent = useMemo(() => {
    return categoryMap[categoryName] || (() => <div>Categoria não encontrada</div>);
  }, [categoryName]);

  // Intersection Observer para detectar quando a seção entra na tela
  // Apenas para categorias não prioritárias
  useEffect(() => {
    if (isPriorityCategory) return; // Categorias prioritárias já carregam imediatamente

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      {
        rootMargin: '200px', // Carrega 200px antes de entrar na tela (mais agressivo)
        threshold: 0.01 // Dispara mais cedo
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [hasLoaded, isPriorityCategory]);

  return (
    <div 
      id={`category-${categoryName}`}
      ref={sectionRef}
      className="min-h-[200px]"
    >
      {isVisible ? (
        <Suspense fallback={<CategorySkeleton />}>
          <CategoryComponent searchTerm={searchTerm} isPreview={true} />
        </Suspense>
      ) : (
        // Placeholder enquanto não carregou
        <CategorySkeleton />
      )}
    </div>
  );
});

export default LazyCategorySection;








