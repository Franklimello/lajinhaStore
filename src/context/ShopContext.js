import { createContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { saveOrder } from "../utils/orderService";

export const ShopContext = createContext();

export function ShopProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" });

  // Carrega dados salvos no localStorage
  useEffect(() => {
    try {
      const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Carregando do localStorage:');
        console.log('Favorites:', savedFavorites);
        console.log('Cart:', savedCart);
      }
      
      setFavorites(savedFavorites.filter(Boolean)); // remove null/undefined
      setCart(savedCart.filter(Boolean));
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
      setFavorites([]);
      setCart([]);
    }
    setIsLoading(false);
  }, []);

  // Salva alterações no localStorage
  useEffect(() => {
    if (!isLoading) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Salvando no localStorage:');
        console.log('Favorites:', favorites);
        console.log('Cart:', cart);
      }
      
      localStorage.setItem("favorites", JSON.stringify(favorites));
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [favorites, cart, isLoading]);

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

  // Adiciona produto no carrinho
  const addToCart = (product) => {
    if (!product) {
      console.error('Produto não fornecido para addToCart');
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('Adicionando ao carrinho:', product);
    }

    // Garante que o produto tenha ID único
    const productId = product.id || uuidv4();

    setCart((prev) => {
      const exists = prev.find((item) => item.id === productId);

      if (exists) {
        // Se já existe, incrementa quantidade
        const newCart = prev.map((item) =>
          item.id === productId ? { ...item, qty: (item.qty || 1) + 1 } : item
        );
        console.log('Produto já existe, incrementando quantidade:', newCart);
        
        // Mostra notificação de quantidade atualizada
        showToast(`Quantidade de "${product.titulo || product.nome || 'Produto'}" atualizada no carrinho!`, "success");
        
        return newCart;
      }

      // Se não existe, adiciona como novo
      const newCart = [...prev, { ...product, id: productId, qty: 1 }];
      if (process.env.NODE_ENV !== 'production') {
        console.log('Adicionando novo produto ao carrinho:', newCart);
      }
      
      // Mostra notificação de produto adicionado
      showToast(`"${product.titulo || product.nome || 'Produto'}" adicionado ao carrinho!`, "success");
      
      return newCart;
    });
  };

  // Função para mostrar toast
  const showToast = (message, type = "success") => {
    setToast({ isVisible: true, message, type });
  };

  // Função para esconder toast
  const hideToast = () => {
    setToast({ isVisible: false, message: "", type: "success" });
  };

  // Remove produto do carrinho
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Atualiza quantidade
  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, qty } : item))
      );
    }
  };

  // Limpa o carrinho completamente
  const clearCart = () => {
    setCart([]);
    showToast('Carrinho limpo com sucesso!', 'success');
  };

  // Salva um pedido no Firestore
  const saveOrderToFirestore = async (orderData) => {
    try {
      const result = await saveOrder(orderData);
      
      if (result.success) {
        showToast('Pedido realizado com sucesso!', 'success');
        clearCart(); // Limpa o carrinho após salvar o pedido
        return { success: true, orderId: result.orderId };
      } else {
        showToast('Erro ao salvar pedido: ' + result.error, 'error');
        return { success: false, error: result.error };
      }
    } catch (error) {
      showToast('Erro ao salvar pedido', 'error');
      return { success: false, error: error.message };
    }
  };

  const value = {
    favorites,
    cart,
    toggleFavorite,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    saveOrderToFirestore,
    isLoading,
    toast,
    showToast,
    hideToast,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}