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
  deleteDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./config";
import { createNewOrderNotification } from "./notifications";

// Função para criar um novo pedido
export const createOrder = async (orderData) => {
  try {
    // Verifica se o usuário está autenticado
    if (!orderData.userId) {
      throw new Error("Usuário não autenticado");
    }

    console.log("Tentando criar pedido com dados:", {
      userId: orderData.userId,
      total: orderData.total,
      itemsCount: orderData.items?.length || 0
    });

    const now = new Date();
    const orderRef = await addDoc(collection(db, "pedidos"), {
      ...orderData,
      createdAt: now,
      updatedAt: now,
      createdAtTimestamp: now.getTime(),
      status: 'Aguardando Pagamento', // Status inicial mais claro
      paymentMethod: 'PIX_QR'
    });
    
    console.log("✅ Pedido criado com sucesso:", orderRef.id);
    
    // Criar notificação para o admin
    console.log("🔔 Tentando criar notificação para o admin...");
    try {
      const notificationResult = await createNewOrderNotification({
        id: orderRef.id,
        ...orderData
      });
      
      if (notificationResult.success) {
        console.log("✅ Notificação criada para o admin com sucesso!");
        console.log("📄 ID da notificação:", notificationResult.id);
      } else {
        console.warn("⚠️ Falha ao criar notificação:", notificationResult.error);
      }
    } catch (notificationError) {
      console.warn("⚠️ Erro ao criar notificação:", notificationError);
    }
    
    return { success: true, orderId: orderRef.id };
  } catch (error) {
    console.error("❌ Erro ao criar pedido:", error);
    console.error("Código do erro:", error.code);
    console.error("Mensagem do erro:", error.message);
    
    // Mensagens de erro mais específicas
    if (error.code === 'permission-denied') {
      return { 
        success: false, 
        error: "Erro de permissão do Firestore. As regras de segurança precisam ser configuradas. Acesse o Firebase Console e configure as regras." 
      };
    } else if (error.code === 'unauthenticated') {
      return { 
        success: false, 
        error: "Usuário não autenticado. Faça login e tente novamente." 
      };
    } else if (error.code === 'failed-precondition') {
      return { 
        success: false, 
        error: "Erro de configuração do Firestore. Verifique se o banco de dados está ativo." 
      };
    }
    
    return { success: false, error: error.message };
  }
};

// Função para buscar pedidos de um usuário
export const getOrdersByUser = async (userId) => {
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
      const timestampA = a.createdAtTimestamp || (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime());
      const timestampB = b.createdAtTimestamp || (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime());
      return timestampB - timestampA;
    });
    
    return { success: true, pedidos };
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return { success: false, error: error.message, pedidos: [] };
  }
};

// Função para buscar todos os pedidos (admin)
export const getAllOrders = async () => {
  try {
    const q = query(
      collection(db, "pedidos")
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
      const timestampA = a.createdAtTimestamp || (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime());
      const timestampB = b.createdAtTimestamp || (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime());
      return timestampB - timestampA;
    });
    
    return { success: true, pedidos };
  } catch (error) {
    console.error("Erro ao buscar todos os pedidos:", error);
    return { success: false, error: error.message, pedidos: [] };
  }
};

// Função para buscar um pedido específico
export const getOrderById = async (orderId) => {
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

// Função para atualizar status do pedido
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const orderRef = doc(db, "pedidos", orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: new Date(),
      updatedAtTimestamp: new Date().getTime()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    return { success: false, error: error.message };
  }
};

// Função para formatar data para exibição
export const formatOrderDate = (timestamp) => {
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

// Função para obter cor do status
export const getStatusColor = (status) => {
  const colors = {
    "Pendente": "bg-yellow-100 text-yellow-800",
    "Aguardando Pagamento": "bg-blue-100 text-blue-800",
    "Pago": "bg-green-100 text-green-800",
    "Em Separação": "bg-purple-100 text-purple-800",
    "Enviado": "bg-indigo-100 text-indigo-800",
    "Entregue": "bg-green-100 text-green-800",
    "Cancelado": "bg-red-100 text-red-800"
  };
  
  return colors[status] || "bg-gray-100 text-gray-800";
};

// Função para obter ícone do status
export const getStatusIcon = (status) => {
  const icons = {
    "Pendente": "⏳",
    "Aguardando Pagamento": "💳",
    "Pago": "✅",
    "Em Separação": "📦",
    "Enviado": "🚚",
    "Entregue": "🎉",
    "Cancelado": "❌"
  };
  
  return icons[status] || "❓";
};

// Função para excluir um pedido
export const deleteOrder = async (orderId) => {
  try {
    const orderRef = doc(db, "pedidos", orderId);
    await deleteDoc(orderRef);
    
    console.log("✅ Pedido excluído com sucesso:", orderId);
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao excluir pedido:", error);
    return { success: false, error: error.message };
  }
};
