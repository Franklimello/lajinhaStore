import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import Toast from "./Toast";

/**
 * CartToast - Componente isolado que consome o CartContext apenas para Toast
 * Evita que mudanças no carrinho causem re-render de toda a aplicação
 */
export default function CartToast() {
  const { toast, hideToast } = useContext(CartContext);

  return (
    <Toast
      message={toast.message}
      type={toast.type}
      isVisible={toast.isVisible}
      onClose={hideToast}
    />
  );
}




