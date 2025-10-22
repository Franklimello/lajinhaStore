import React, { memo } from 'react';

/**
 * SkeletonCard - Componente de skeleton reutilizável
 * Usa shimmer animation com Tailwind para melhor UX
 */
const SkeletonCard = memo(({ 
  variant = 'product', 
  count = 1, 
  className = '',
  showImage = true,
  showTitle = true,
  showDescription = true,
  showPrice = true
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'product':
        return (
          <div className={`bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse ${className}`}>
            {showImage && <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite]"></div>}
            <div className="p-4 space-y-3">
              {showTitle && <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded"></div>}
              {showDescription && <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded w-3/4"></div>}
              {showPrice && <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded w-1/2"></div>}
            </div>
          </div>
        );
      
      case 'category':
        return (
          <div className={`bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl shadow-md animate-pulse ${className}`}>
            <div className="flex flex-col items-center p-3 md:p-4">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded-full mb-2"></div>
              <div className="h-4 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded w-3/4"></div>
            </div>
          </div>
        );
      
      case 'hero':
        return (
          <div className={`h-64 bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]"></div>
          </div>
        );
      
      case 'search':
        return (
          <div className={`h-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded-3xl ${className}`}></div>
        );
      
      case 'offers':
        return (
          <div className={`h-32 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl animate-pulse ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]"></div>
          </div>
        );
      
      default:
        return (
          <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`}>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded"></div>
          </div>
        );
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {[...Array(count)].map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
});

SkeletonCard.displayName = 'SkeletonCard';

export default SkeletonCard;












