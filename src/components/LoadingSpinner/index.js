import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'blue', 
  text = 'Carregando...',
  fullScreen = false 
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    yellow: 'border-yellow-600',
    gray: 'border-gray-600'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}></div>
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;


