import { createContext, useState, useEffect, useMemo, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { saveOrder } from "../utils/orderService";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" });

  // Carrega carrinho do localStorage
  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCart(savedCart.filter(Boolean));
    } catch (error) {
      console.error('Erro ao carregar carrinho do localStorage:', error);
      setCart([]);
    }
    setIsLoading(false);
  }, []);

  // Salva carrinho no localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isLoading]);

  // Adiciona produto no carrinho - MEMOIZADO
  const addToCart = useCallback((product) => {
    if (!product) {
      console.error('Produto não fornecido para addToCart');
      return;
    }

    const productId = product.id || uuidv4();

    setCart((prev) => {
      const exists = prev.find((item) => item.id === productId);

      if (exists) {
        // Se já existe, incrementa quantidade
        const newCart = prev.map((item) =>
          item.id === productId ? { ...item, qty: (item.qty || 1) + 1 } : item
        );
        
        setToast({ 
          isVisible: true, 
          message: `Quantidade de "${product.titulo || product.nome || 'Produto'}" atualizada!`, 
          type: "success" 
        });
        
        return newCart;
      }

      // Se não existe, adiciona como novo
      const newCart = [...prev, { ...product, id: productId, qty: 1 }];
      
      setToast({ 
        isVisible: true, 
        message: `"${product.titulo || product.nome || 'Produto'}" adicionado ao carrinho!`, 
        type: "success" 
      });
      
      return newCart;
    });
  }, []);

  // Remove produto do carrinho - MEMOIZADO
  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Atualiza quantidade - MEMOIZADO
  const updateQuantity = useCallback((id, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, qty } : item))
      );
    }
  }, []);

  // Limpa o carrinho - MEMOIZADO
  const clearCart = useCallback(() => {
    setCart([]);
    setToast({ isVisible: true, message: 'Carrinho limpo com sucesso!', type: 'success' });
  }, []);

  // Salva pedido no Firestore - MEMOIZADO
  const saveOrderToFirestore = useCallback(async (orderData) => {
    try {
      const result = await saveOrder(orderData);
      
      if (result.success) {
        setToast({ isVisible: true, message: 'Pedido realizado com sucesso!', type: 'success' });
        setCart([]);
        return { success: true, orderId: result.orderId };
      } else {
        setToast({ isVisible: true, message: 'Erro ao salvar pedido: ' + result.error, type: 'error' });
        return { success: false, error: result.error };
      }
    } catch (error) {
      setToast({ isVisible: true, message: 'Erro ao salvar pedido', type: 'error' });
      return { success: false, error: error.message };
    }
  }, []);

  // Mostra toast - MEMOIZADO
  const showToast = useCallback((message, type = "success") => {
    setToast({ isVisible: true, message, type });
  }, []);

  // Esconde toast - MEMOIZADO
  const hideToast = useCallback(() => {
    setToast({ isVisible: false, message: "", type: "success" });
  }, []);

  // MEMOIZA O VALUE - só recria quando cart ou isLoading mudam
  const value = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    saveOrderToFirestore,
    isLoading,
    toast,
    showToast,
    hideToast,
  }), [cart, isLoading, toast, addToCart, removeFromCart, updateQuantity, clearCart, saveOrderToFirestore, showToast, hideToast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}


