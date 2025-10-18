import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  // Carrega tema salvo no localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
      setTheme('light');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Aplica o tema ao documento
  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Alterna entre temas
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  // Define tema específico
  const setThemeMode = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const value = {
    theme,
    toggleTheme,
    setThemeMode,
    isLoading
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
