import { useState } from "react";
import { FaFilter, FaSort, FaChevronDown, FaChevronUp } from "react-icons/fa";

/**
 * Componente reutilizável de Filtros e Ordenação para páginas de categoria
 * @param {Object} props
 * @param {string} props.sortBy - Valor atual da ordenação
 * @param {Function} props.setSortBy - Função para atualizar ordenação
 * @param {Object} props.priceRange - { min: number, max: number }
 * @param {Function} props.setPriceRange - Função para atualizar faixa de preço
 * @param {boolean} props.showOnlyInStock - Mostrar apenas em estoque
 * @param {Function} props.setShowOnlyInStock - Função para atualizar filtro de estoque
 * @param {boolean} props.showOnlyDiscounted - Mostrar apenas com desconto
 * @param {Function} props.setShowOnlyDiscounted - Função para atualizar filtro de desconto
 * @param {string} props.themeColor - Cor do tema (padrão: "blue") - "blue", "amber", "green", "red", "purple"
 */
export default function FilterBar({
  sortBy = "titulo",
  setSortBy,
  priceRange = { min: 0, max: 1000 },
  setPriceRange,
  showOnlyInStock = false,
  setShowOnlyInStock,
  showOnlyDiscounted = false,
  setShowOnlyDiscounted,
  themeColor = "blue"
}) {
  const [showFilters, setShowFilters] = useState(false);

  // Configurações de cores por tema
  const themeConfig = {
    blue: {
      border: "border-blue-200",
      hoverBorder: "hover:border-blue-400",
      icon: "text-blue-600",
      focusRing: "focus:ring-blue-500",
      bg: "bg-blue-50"
    },
    amber: {
      border: "border-amber-200",
      hoverBorder: "hover:border-amber-400",
      icon: "text-amber-600",
      focusRing: "focus:ring-amber-500",
      bg: "bg-amber-50"
    },
    green: {
      border: "border-green-200",
      hoverBorder: "hover:border-green-400",
      icon: "text-green-600",
      focusRing: "focus:ring-green-500",
      bg: "bg-green-50"
    },
    red: {
      border: "border-red-200",
      hoverBorder: "hover:border-red-400",
      icon: "text-red-600",
      focusRing: "focus:ring-red-500",
      bg: "bg-red-50"
    },
    purple: {
      border: "border-purple-200",
      hoverBorder: "hover:border-purple-400",
      icon: "text-purple-600",
      focusRing: "focus:ring-purple-500",
      bg: "bg-purple-50"
    }
  };

  const theme = themeConfig[themeColor] || themeConfig.blue;

  const handleClearFilters = () => {
    setPriceRange({ min: 0, max: 1000 });
    setShowOnlyInStock(false);
    setShowOnlyDiscounted(false);
  };

  const hasActiveFilters = showOnlyInStock || showOnlyDiscounted || priceRange.min > 0 || priceRange.max < 1000;

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 mb-6">
      {/* Botão de Filtros Mobile */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`md:hidden flex items-center justify-center gap-2 bg-white px-4 py-3 rounded-xl shadow-lg border-2 ${theme.border} ${theme.hoverBorder} transition-all focus:outline-none focus:ring-2 ${theme.focusRing} focus:ring-offset-2`}
        aria-label={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
        aria-expanded={showFilters}
      >
        <FaFilter className={theme.icon} />
        <span className="font-semibold text-gray-700">Filtros</span>
        {hasActiveFilters && (
          <span className="ml-1 w-2 h-2 bg-red-500 rounded-full" aria-label="Filtros ativos" />
        )}
        {showFilters ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {/* Painel de Filtros */}
      <div className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-4 w-full bg-white rounded-2xl shadow-lg border-2 ${theme.border} p-4`}>
        {/* Filtro de Preço */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Faixa de Preço
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="0"
              max="1000"
              step="0.01"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: parseFloat(e.target.value) || 0 })}
              className={`w-20 px-3 py-2 border border-gray-300 rounded-lg ${theme.focusRing} focus:border-transparent`}
              aria-label="Preço mínimo"
            />
            <span className="text-gray-500">até</span>
            <input
              type="number"
              min="0"
              max="1000"
              step="0.01"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: parseFloat(e.target.value) || 1000 })}
              className={`w-20 px-3 py-2 border border-gray-300 rounded-lg ${theme.focusRing} focus:border-transparent`}
              aria-label="Preço máximo"
            />
          </div>
        </div>

        {/* Filtro de Estoque */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnlyInStock}
                      onChange={(e) => setShowOnlyInStock(e.target.checked)}
                      className={`w-4 h-4 ${theme.icon} rounded ${theme.focusRing}`}
                      aria-label="Mostrar apenas produtos em estoque"
                    />
            <span className="text-sm font-medium text-gray-700">Apenas em estoque</span>
          </label>
        </div>

        {/* Filtro de Desconto */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnlyDiscounted}
                      onChange={(e) => setShowOnlyDiscounted(e.target.checked)}
                      className={`w-4 h-4 ${theme.icon} rounded ${theme.focusRing}`}
                      aria-label="Mostrar apenas produtos com desconto"
                    />
            <span className="text-sm font-medium text-gray-700">Com desconto</span>
          </label>
        </div>

        {/* Botão Limpar Filtros */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Limpar todos os filtros"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Ordenação */}
      <div className={`flex items-center gap-2 bg-white rounded-xl shadow-lg border-2 ${theme.border} p-2`}>
        <FaSort className={theme.icon} />
        <label htmlFor="sort-select" className="text-sm font-semibold text-gray-700 sr-only">
          Ordenar produtos por
        </label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={`px-3 py-2 border border-gray-300 rounded-lg ${theme.focusRing} focus:border-transparent bg-white text-gray-700 font-medium focus:outline-none`}
          aria-label="Ordenar produtos"
        >
          <option value="titulo">Nome A-Z</option>
          <option value="preco-asc">Menor Preço</option>
          <option value="preco-desc">Maior Preço</option>
          <option value="desconto">Maior Desconto</option>
        </select>
      </div>
    </div>
  );
}

