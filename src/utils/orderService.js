import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase/config";

// Função para salvar um pedido no Firestore
export const saveOrder = async (orderData) => {
  try {
    console.log("💾 saveOrder: Iniciando salvamento...", {
      userId: orderData.userId,
      total: orderData.total,
      itemsCount: orderData.items?.length || 0,
      paymentMethod: orderData.paymentMethod
    });

    // Verifica se o db está definido
    if (!db) {
      console.error("❌ saveOrder: Firestore db não está inicializado");
      return { success: false, error: "Firestore não está configurado" };
    }

    const now = new Date();
    const orderDataToSave = {
      ...orderData,
      createdAt: now,
      updatedAt: now,
      createdAtTimestamp: now.getTime() // Timestamp numérico para ordenação
    };

    console.log("💾 saveOrder: Dados preparados para salvar:", {
      userId: orderDataToSave.userId,
      total: orderDataToSave.total,
      status: orderDataToSave.status || 'Aguardando Pagamento'
    });

    const orderRef = await addDoc(collection(db, "pedidos"), orderDataToSave);
    
    console.log("✅ saveOrder: Pedido salvo com sucesso! ID:", orderRef.id);
    return { success: true, orderId: orderRef.id };
  } catch (error) {
    console.error("❌ Erro ao salvar pedido:", error);
    console.error("❌ Detalhes do erro:", {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    return { 
      success: false, 
      error: error.message || "Erro desconhecido ao salvar pedido",
      code: error.code 
    };
  }
};

// Função para buscar pedidos de um usuário específico
export const getPedidosByUser = async (userId) => {
  try {
    // Tenta primeiro com filtro no Firestore
    try {
      const q = query(
        collection(db, "pedidos"),
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(q);
      const pedidos = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        pedidos.push({
          id: doc.id,
          ...data
        });
      });
      
      // Ordena localmente por data de criação (mais recente primeiro)
      pedidos.sort((a, b) => {
        // Prioriza o timestamp numérico se disponível
        let timestampA, timestampB;
        
        if (a.createdAtTimestamp && b.createdAtTimestamp) {
          timestampA = a.createdAtTimestamp;
          timestampB = b.createdAtTimestamp;
        } else {
          // Fallback para conversão de data
          timestampA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
          timestampB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
        }
        
        return timestampB - timestampA; // Mais recente primeiro
      });
      
      return { success: true, pedidos };
    } catch (indexError) {
      // Se falhar por causa do índice, busca todos os pedidos e filtra localmente
      console.log("Tentando busca alternativa sem filtro no Firestore...");
      
      const allPedidosQuery = query(collection(db, "pedidos"));
      const querySnapshot = await getDocs(allPedidosQuery);
      const pedidos = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filtra apenas os pedidos do usuário
        if (data.userId === userId) {
          pedidos.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      // Ordena localmente por data de criação (mais recente primeiro)
      pedidos.sort((a, b) => {
        let timestampA, timestampB;
        
        if (a.createdAtTimestamp && b.createdAtTimestamp) {
          timestampA = a.createdAtTimestamp;
          timestampB = b.createdAtTimestamp;
        } else {
          timestampA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
          timestampB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
        }
        
        return timestampB - timestampA;
      });
      
      return { success: true, pedidos };
    }
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return { success: false, error: error.message, pedidos: [] };
  }
};

// Função para buscar um pedido específico por ID
export const getPedidoById = async (orderId) => {
  try {
    const docRef = doc(db, "pedidos", orderId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        success: true, 
        pedido: { id: docSnap.id, ...docSnap.data() } 
      };
    } else {
      return { success: false, error: "Pedido não encontrado" };
    }
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    return { success: false, error: error.message };
  }
};

// Função para atualizar o status de um pedido
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const orderRef = doc(db, "pedidos", orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    return { success: false, error: error.message };
  }
};

// Função para formatar data para exibição
export const formatDate = (timestamp) => {
  if (!timestamp) return "Data não disponível";
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

// Função para obter o status em português
export const getStatusText = (status) => {
  const statusMap = {
    "pending": "Pendente",
    "processing": "Processando",
    "shipped": "Enviado",
    "delivered": "Entregue",
    "cancelled": "Cancelado"
  };
  
  return statusMap[status] || status;
};
