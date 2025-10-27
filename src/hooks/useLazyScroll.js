import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para lazy render baseado em scroll com Intersection Observer
 * 
 * Funcionalidades:
 * - Carrega itens progressivamente conforme o usuário faz scroll
 * - Usa Intersection Observer para detectar quando carregar mais itens
 * - Configurável com quantidade inicial e total de itens
 * - Otimizado para performance com cleanup automático
 * 
 * @param {number} initialCount - Quantidade inicial de itens visíveis
 * @param {number} totalCount - Total de itens disponíveis
 * @returns {number} - Quantidade atual de itens visíveis
 */
export function useLazyScroll(initialCount, totalCount) {
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const observerCallback = useCallback((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setVisibleCount(prev => Math.min(prev + 1, totalCount));
      }
    });
  }, [totalCount]);

  useEffect(() => {
    // Só cria observer se ainda há itens para carregar
    if (visibleCount >= totalCount) return;

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '100px', // Carrega 100px antes de entrar na tela
      threshold: 0.1,
    });

    // Observa apenas o último item visível
    const lastVisibleTarget = document.querySelector(`.lazy-category-anchor:nth-child(${visibleCount})`);
    
    if (lastVisibleTarget) {
      observer.observe(lastVisibleTarget);
    }

    return () => {
      if (lastVisibleTarget) {
        observer.unobserve(lastVisibleTarget);
      }
    };
  }, [visibleCount, totalCount, observerCallback]);

  return visibleCount;
}

