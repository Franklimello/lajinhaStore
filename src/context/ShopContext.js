import { createContext, useState, useEffect } from "react";

export const ShopContext = createContext();

export function ShopProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega favoritos do localStorage
  useEffect(() => {
    try {
      const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Carregando favoritos do localStorage:', savedFavorites);
      }
      
      setFavorites(savedFavorites.filter(Boolean));
    } catch (error) {
      console.error('Erro ao carregar favoritos do localStorage:', error);
      setFavorites([]);
    }
    setIsLoading(false);
  }, []);

  // Salva favoritos no localStorage
  useEffect(() => {
    if (!isLoading) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Salvando favoritos no localStorage:', favorites);
      }
      
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  }, [favorites, isLoading]);

  // Alterna favorito - compatível com ID ou produto completo
  const toggleFavorite = (productOrId) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('toggleFavorite chamado com:', productOrId);
    }
    
    if (!productOrId) {
      console.error('Produto ou ID não fornecido');
      return;
    }

    // Determina se é um ID (string) ou produto completo (objeto)
    const isProductObject = typeof productOrId === 'object' && productOrId.id;
    const productId = isProductObject ? productOrId.id : productOrId;
    const product = isProductObject ? productOrId : { id: productOrId };

    console.log('ID do produto:', productId);
    console.log('Produto:', product);

    setFavorites((prev) => {
      console.log('Favoritos anteriores:', prev);
      
      const exists = prev.some((item) => {
        // Compatibilidade: item pode ser ID ou objeto
        const itemId = typeof item === 'object' ? item.id : item;
        return itemId === productId;
      });

      console.log('Produto já existe nos favoritos?', exists);

      if (exists) {
        // Remove dos favoritos
        const newFavorites = prev.filter((item) => {
          const itemId = typeof item === 'object' ? item.id : item;
          return itemId !== productId;
        });
        console.log('Removendo. Novos favoritos:', newFavorites);
        return newFavorites;
      } else {
        // Adiciona aos favoritos (sempre salva o produto completo se disponível)
        const newFavorites = [...prev, product];
        console.log('Adicionando. Novos favoritos:', newFavorites);
        return newFavorites;
      }
    });
  };

  const value = {
    favorites,
    toggleFavorite,
    isLoading,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}