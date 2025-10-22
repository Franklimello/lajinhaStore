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

  // Mantém o foco enquanto o usuário está digitando (até 3 caracteres)
  useEffect(() => {
    if (termo && termo.length > 0 && termo.length < 3) {
      // Garante que o input está focado
      const timer = setTimeout(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [termo]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClearSearch();
      // Mantém o foco no input mesmo após limpar
    }
  };

  return (
    <div className="w-full px-4 py-8">
      {/* Texto chamativo */}
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-2">
          🔍 Encontre o que procura rapidamente!
        </h2>
        <p className="text-gray-600 text-sm md:text-base">
          Digite o nome do produto e encontre em segundos
        </p>
        <p className="text-orange-600 text-xs md:text-sm font-semibold mt-1">
          💡 Mínimo de 3 caracteres para buscar
        </p>
      </div>

      {/* Input de busca - destaque total */}
      <div className="relative max-w-5xl mx-auto">
        <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500 text-2xl animate-pulse" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Digite aqui para pesquisar... (Ex: Arroz, Feijão, Coca-Cola)"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-16 pr-16 py-6 text-xl
                    border-4 border-orange-500 rounded-2xl
                    focus:outline-none focus:ring-4 focus:ring-orange-300 
                    focus:border-orange-600
                    transition-all duration-300 
                    bg-white shadow-2xl hover:shadow-orange-200
                    placeholder:text-gray-400"
          aria-label="Pesquisar produtos"
          autoComplete="off"
          spellCheck="false"
        />
        {termo && (
          <button
            type="button"
            onClick={(e) => {
              onClearSearch();
              // Mantém o foco no input após limpar
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            onMouseDown={(e) => {
              // Previne que o clique tire o foco do input
              e.preventDefault();
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 
                      flex items-center justify-center
                      w-10 h-10 rounded-full
                      bg-red-500 hover:bg-red-600
                      text-white font-bold text-xl
                      shadow-lg hover:shadow-xl
                      transition-all duration-200
                      hover:scale-110 active:scale-95
                      ring-2 ring-red-200 hover:ring-red-300"
            aria-label="Limpar busca"
            title="Limpar busca"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;