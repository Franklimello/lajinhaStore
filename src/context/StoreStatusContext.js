import { createContext, useState, useEffect, useContext } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export const StoreStatusContext = createContext();

export function StoreStatusProvider({ children }) {
  const [isClosed, setIsClosed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasSeenModal, setHasSeenModal] = useState(false);

  // Carrega o status da loja do Firestore
  useEffect(() => {
    const loadStoreStatus = async () => {
      try {
        const docRef = doc(db, "config", "storeStatus");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setIsClosed(docSnap.data().isClosed || false);
        }
      } catch (error) {
        console.error("Erro ao carregar status da loja:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStoreStatus();
  }, []);

  // Função para alternar o status da loja (apenas admin)
  const toggleStoreStatus = async () => {
    try {
      const newStatus = !isClosed;
      const docRef = doc(db, "config", "storeStatus");
      
      await setDoc(docRef, {
        isClosed: newStatus,
        updatedAt: new Date().toISOString(),
      });

      setIsClosed(newStatus);
      return { success: true };
    } catch (error) {
      console.error("Erro ao alterar status da loja:", error);
      return { success: false, error: error.message };
    }
  };

  // Marcar que o usuário já viu o modal
  const markModalAsSeen = () => {
    setHasSeenModal(true);
  };

  const value = {
    isClosed,
    loading,
    hasSeenModal,
    toggleStoreStatus,
    markModalAsSeen,
  };

  return (
    <StoreStatusContext.Provider value={value}>
      {children}
    </StoreStatusContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useStoreStatus() {
  const context = useContext(StoreStatusContext);
  if (!context) {
    throw new Error("useStoreStatus deve ser usado dentro de StoreStatusProvider");
  }
  return context;
}




