import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot 
} from "firebase/firestore";
import { db } from "./config";

// UIDs dos administradores autorizados
const ADMIN_UIDS = [
  'ZG5D6IrTRTZl5SDoEctLAtr4WkE2',
  '6VbaNslrhQhXcyussPj53YhLiYj2'
];

// Função para obter o adminId (primeiro da lista)
const getAdminId = () => ADMIN_UIDS[0];

// Função para inicializar a coleção de notificações
export const initializeNotificationsCollection = async () => {
  try {
    console.log("🔧 Inicializando coleção de notificações...");
    
    // Criar uma notificação de exemplo para inicializar a coleção
    const exampleNotification = {
      type: "system",
      title: "Sistema Inicializado",
      message: "Coleção de notificações criada automaticamente",
      orderId: "system-init",
      userId: "system",
      adminId: getAdminId(),
      read: true,
      createdAt: serverTimestamp(),
      data: {
        orderId: "system-init",
        total: 0,
        itemsCount: 0,
        customerName: "Sistema",
        paymentMethod: "N/A"
      }
    };

    const notificationRef = collection(db, "notificacoes");
    const docRef = await addDoc(notificationRef, exampleNotification);
    
    console.log("✅ Coleção de notificações inicializada:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("❌ Erro ao inicializar coleção:", error);
    return { success: false, error: error.message };
  }
};

// Função para criar uma notificação
export const createNotification = async (notificationData) => {
  try {
    console.log("🔔 Salvando notificação no Firestore...");
    const notificationRef = collection(db, "notificacoes");
    const docRef = await addDoc(notificationRef, {
      ...notificationData,
      createdAt: serverTimestamp(),
      read: false
    });
    
    console.log("✅ Notificação criada com sucesso:", docRef.id);
    console.log("📄 Dados salvos:", {
      ...notificationData,
      createdAt: "serverTimestamp",
      read: false
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("❌ Erro ao criar notificação:", error);
    console.error("❌ Código do erro:", error.code);
    console.error("❌ Mensagem do erro:", error.message);
    
    // Se a coleção não existe, tentar inicializar
    if (error.code === 'not-found' || error.message.includes('collection')) {
      console.log("🔧 Coleção não existe, tentando inicializar...");
      const initResult = await initializeNotificationsCollection();
      if (initResult.success) {
        console.log("✅ Coleção inicializada, tentando criar notificação novamente...");
        // Tentar criar a notificação novamente
        try {
          const notificationRef = collection(db, "notificacoes");
          const docRef = await addDoc(notificationRef, {
            ...notificationData,
            createdAt: serverTimestamp(),
            read: false
          });
          console.log("✅ Notificação criada após inicialização:", docRef.id);
          return { success: true, id: docRef.id };
        } catch (retryError) {
          console.error("❌ Erro ao criar notificação após inicialização:", retryError);
          return { success: false, error: retryError.message };
        }
      }
    }
    
    return { success: false, error: error.message };
  }
};

// Função para criar notificação de novo pedido
export const createNewOrderNotification = async (orderData) => {
  try {
    console.log("🔔 Criando notificação para pedido:", orderData.id);
    
    const notificationData = {
      type: "new_order",
      title: "Novo Pedido Recebido",
      message: `Pedido #${orderData.id.slice(-8).toUpperCase()} - R$ ${orderData.total?.toFixed(2) || "0,00"}`,
      orderId: orderData.id,
      userId: orderData.userId,
      adminId: getAdminId(), // ID do admin
      data: {
        orderId: orderData.id,
        total: orderData.total,
        itemsCount: orderData.items?.length || 0,
        customerName: orderData.endereco?.nome || "Cliente",
        paymentMethod: orderData.paymentMethod || "PIX"
      }
    };

    console.log("📄 Dados da notificação:", notificationData);
    const result = await createNotification(notificationData);
    console.log("📊 Resultado da criação:", result);
    return result;
  } catch (error) {
    console.error("❌ Erro ao criar notificação de novo pedido:", error);
    return { success: false, error: error.message };
  }
};

// Função para obter notificações do admin
export const getAdminNotifications = async () => {
  try {
    console.log("🔍 Iniciando busca de notificações...");
    const notificationsRef = collection(db, "notificacoes");
    
    // Primeiro, tenta a query com filtro e ordenação
    try {
      console.log("🔍 Tentando query com filtro adminId...");
      const q = query(
        notificationsRef,
        where("adminId", "==", getAdminId()),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const notifications = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("📄 Notificação encontrada:", {
          id: doc.id,
          type: data.type,
          title: data.title,
          adminId: data.adminId,
          createdAt: data.createdAt
        });
        notifications.push({
          id: doc.id,
          ...data
        });
      });
      
      console.log("✅ Notificações carregadas:", notifications.length);
      return { success: true, notifications };
    } catch (indexError) {
      console.warn("⚠️ Índice composto não encontrado, usando fallback:", indexError.message);
      
      // Fallback: buscar todas as notificações e filtrar localmente
      console.log("🔍 Buscando todas as notificações...");
      const allNotificationsRef = collection(db, "notificacoes");
      const allQuery = query(allNotificationsRef);
      
      const querySnapshot = await getDocs(allQuery);
      const allNotifications = [];
      
      console.log("📊 Total de documentos encontrados:", querySnapshot.size);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("📄 Documento:", {
          id: doc.id,
          adminId: data.adminId,
          type: data.type,
          title: data.title
        });
        
        if (ADMIN_UIDS.includes(data.adminId)) {
          console.log("✅ Notificação do admin encontrada:", doc.id);
          allNotifications.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      // Ordenar localmente por createdAt
      allNotifications.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return bTime - aTime; // Mais recentes primeiro
      });
      
      console.log("✅ Notificações carregadas (fallback):", allNotifications.length);
      return { success: true, notifications: allNotifications };
    }
  } catch (error) {
    console.error("❌ Erro ao carregar notificações:", error);
    return { success: false, error: error.message };
  }
};

// Função para marcar notificação como lida
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, "notificacoes", notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
    
    console.log("✅ Notificação marcada como lida:", notificationId);
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao marcar notificação como lida:", error);
    return { success: false, error: error.message };
  }
};

// Função para marcar todas as notificações como lidas
export const markAllNotificationsAsRead = async () => {
  try {
    const notificationsRef = collection(db, "notificacoes");
    const q = query(
      notificationsRef,
      where("adminId", "==", getAdminId()),
      where("read", "==", false)
    );
    
    const querySnapshot = await getDocs(q);
    const updatePromises = [];
    
    querySnapshot.forEach((doc) => {
      const notificationRef = doc.ref;
      updatePromises.push(
        updateDoc(notificationRef, {
          read: true,
          readAt: serverTimestamp()
        })
      );
    });
    
    await Promise.all(updatePromises);
    
    console.log("✅ Todas as notificações marcadas como lidas");
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao marcar todas as notificações como lidas:", error);
    return { success: false, error: error.message };
  }
};

// Função para obter contagem de notificações não lidas
export const getUnreadNotificationsCount = async () => {
  try {
    const notificationsRef = collection(db, "notificacoes");
    
    // Primeiro, tenta a query com filtros
    try {
      const q = query(
        notificationsRef,
        where("adminId", "==", getAdminId()),
        where("read", "==", false)
      );
      
      const querySnapshot = await getDocs(q);
      const count = querySnapshot.size;
      
      console.log("✅ Contagem de notificações não lidas:", count);
      return { success: true, count };
    } catch (indexError) {
      console.warn("⚠️ Índice composto não encontrado, usando fallback:", indexError.message);
      
      // Fallback: buscar todas as notificações e filtrar localmente
      const allNotificationsRef = collection(db, "notificacoes");
      const allQuery = query(allNotificationsRef);
      
      const querySnapshot = await getDocs(allQuery);
      let count = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (ADMIN_UIDS.includes(data.adminId) && data.read === false) {
          count++;
        }
      });
      
      console.log("✅ Contagem de notificações não lidas (fallback):", count);
      return { success: true, count };
    }
  } catch (error) {
    console.error("❌ Erro ao obter contagem de notificações:", error);
    return { success: false, error: error.message };
  }
};

// Função para obter ícone da notificação
export const getNotificationIcon = (type) => {
  const icons = {
    "new_order": "🛒",
    "order_update": "📦",
    "payment_received": "💰",
    "order_cancelled": "❌",
    "system": "⚙️"
  };
  
  return icons[type] || "🔔";
};

// Função para obter cor da notificação
export const getNotificationColor = (type) => {
  const colors = {
    "new_order": "bg-blue-100 text-blue-800",
    "order_update": "bg-yellow-100 text-yellow-800",
    "payment_received": "bg-green-100 text-green-800",
    "order_cancelled": "bg-red-100 text-red-800",
    "system": "bg-gray-100 text-gray-800"
  };
  
  return colors[type] || "bg-gray-100 text-gray-800";
};

// Função para formatar data da notificação
export const formatNotificationDate = (timestamp) => {
  if (!timestamp) return "Data não disponível";
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return "Agora mesmo";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min atrás`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h atrás`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} dias atrás`;
  }
};

// Função para excluir uma notificação específica
export const deleteNotification = async (notificationId) => {
  try {
    console.log("🗑️ Excluindo notificação:", notificationId);
    const notificationRef = doc(db, "notificacoes", notificationId);
    await deleteDoc(notificationRef);
    
    console.log("✅ Notificação excluída com sucesso:", notificationId);
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao excluir notificação:", error);
    return { success: false, error: error.message };
  }
};

// Função para excluir todas as notificações
export const deleteAllNotifications = async () => {
  try {
    console.log("🗑️ Excluindo todas as notificações...");
    const notificationsRef = collection(db, "notificacoes");
    
    // Buscar todas as notificações
    const querySnapshot = await getDocs(notificationsRef);
    
    // Excluir cada notificação
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log("✅ Todas as notificações foram excluídas");
    return { success: true, count: querySnapshot.size };
  } catch (error) {
    console.error("❌ Erro ao excluir todas as notificações:", error);
    return { success: false, error: error.message };
  }
};

// Função para excluir notificações lidas
export const deleteReadNotifications = async () => {
  try {
    console.log("🗑️ Excluindo notificações lidas...");
    const notificationsRef = collection(db, "notificacoes");
    
    // Buscar notificações lidas
    const q = query(
      notificationsRef,
      where("adminId", "==", getAdminId()),
      where("read", "==", true)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Excluir cada notificação lida
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log("✅ Notificações lidas foram excluídas");
    return { success: true, count: querySnapshot.size };
  } catch (error) {
    console.error("❌ Erro ao excluir notificações lidas:", error);
    return { success: false, error: error.message };
  }
};
