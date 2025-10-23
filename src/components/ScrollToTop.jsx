import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que força o scroll para o topo ao navegar entre páginas
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Rola para o topo da página
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}


