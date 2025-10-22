import React, { memo, useEffect, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';

/**
 * SearchBar - Campo de busca otimizado com acessibilidade
 * Suporte a teclado, foco automático e atalhos
 */
const SearchBar = memo(({ termo, setTermo, onClearSearch }) => {
  const inputRef = useRef(null);

  // Foco automático com atalho Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Foco automático na montagem (apenas em desktop)
  useEffect(() => {
    if (window.innerWidth > 768) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClearSearch();
      inputRef.current?.blur();
    }
  };

  return (
    <div className="w-full flex justify-center py-16">
      <div className="w-[99%] max-w-6xl">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-center">
            <div className="w-full relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Pesquisar produtos... (Ctrl+K para focar)"
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl 
                          focus:outline-none focus:ring-2 focus:ring-gray-300 
                          focus:border-gray-400 text-lg transition-all duration-300 
                          bg-gray-50 hover:bg-white shadow-sm hover:shadow-md"
                aria-label="Pesquisar produtos"
                aria-describedby="search-help"
                autoComplete="off"
                spellCheck="false"
              />
              {termo && (
                <button
                  onClick={onClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Limpar busca"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div id="search-help" className="text-center mt-3 text-sm text-gray-500">
            Use <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+K</kbd> para focar rapidamente
          </div>
        </div>
      </div>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;