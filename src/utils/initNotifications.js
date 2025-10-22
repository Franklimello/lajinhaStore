// ============================================================
// SCRIPT PARA INICIALIZAR COLEÇÃO DE NOTIFICAÇÕES
// ============================================================

import { collection, addDoc, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Inicializa a coleção de notificações com dados de teste
 */
export const initializeNotifications = async () => {
  try {
    console.log('🔧 Inicializando coleção de notificações...');

    // Dados de teste para criar a coleção
    const testNotifications = [
      {
        userId: 'test-user-1',
        title: '🛒 Pedido Confirmado!',
        body: 'Seu pedido #12345678 foi criado com sucesso!',
        data: {
          orderId: 'test-order-1',
          type: 'order_created',
          url: '/pedidos/test-order-1'
        },
        read: false,
        type: 'order_created',
        createdAt: serverTimestamp()
      },
      {
        userId: 'test-user-1',
        title: '📦 Status Atualizado',
        body: 'Seu pedido #12345678 está sendo preparado.',
        data: {
          orderId: 'test-order-1',
          type: 'order_status_update',
          status: 'Em Separação',
          url: '/pedidos/test-order-1'
        },
        read: false,
        type: 'order_status_update',
        createdAt: serverTimestamp()
      },
      {
        userId: 'ZG5D6IrTRTZl5SDoEctLAtr4WkE2', // Admin UID
        title: '🔔 Novo Pedido Recebido!',
        body: 'Pedido #12345678 de Cliente Teste - R$ 150,00',
        data: {
          orderId: 'test-order-1',
          type: 'new_order_admin',
          total: 150.00,
          customerName: 'Cliente Teste',
          url: '/admin-pedidos'
        },
        read: false,
        type: 'new_order_admin',
        createdAt: serverTimestamp()
      }
    ];

    // Criar notificações de teste
    const promises = testNotifications.map(notification => 
      addDoc(collection(db, 'notifications'), notification)
    );

    const results = await Promise.all(promises);
    
    console.log('✅ Coleção de notificações inicializada com sucesso!');
    console.log('📝 IDs das notificações criadas:', results.map(doc => doc.id));
    
    return {
      success: true,
      message: 'Coleção inicializada com sucesso',
      notificationIds: results.map(doc => doc.id)
    };

  } catch (error) {
    console.error('❌ Erro ao inicializar notificações:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verifica se a coleção de notificações existe e tem dados
 */
export const checkNotificationsCollection = async () => {
  try {
    console.log('🔍 Verificando coleção de notificações...');

    const snapshot = await getDocs(collection(db, 'notifications'));
    
    console.log(`📊 Total de notificações encontradas: ${snapshot.size}`);
    
    if (snapshot.size > 0) {
      console.log('✅ Coleção de notificações existe e tem dados');
      return {
        exists: true,
        count: snapshot.size,
        notifications: snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    } else {
      console.log('⚠️ Coleção existe mas está vazia');
      return {
        exists: true,
        count: 0,
        notifications: []
      };
    }

  } catch (error) {
    console.error('❌ Erro ao verificar coleção:', error);
    
    if (error.code === 'permission-denied') {
      return {
        exists: false,
        error: 'Permissão negada - verifique as regras do Firestore'
      };
    }
    
    return {
      exists: false,
      error: error.message
    };
  }
};

/**
 * Limpa todas as notificações de teste
 */
export const clearTestNotifications = async () => {
  try {
    console.log('🧹 Limpando notificações de teste...');

    const snapshot = await getDocs(collection(db, 'notifications'));
    
    if (snapshot.size === 0) {
      console.log('ℹ️ Nenhuma notificação para limpar');
      return { success: true, message: 'Nenhuma notificação encontrada' };
    }

    // Deletar em lote
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    
    console.log(`✅ ${snapshot.size} notificações removidas`);
    return {
      success: true,
      message: `${snapshot.size} notificações removidas`
    };

  } catch (error) {
    console.error('❌ Erro ao limpar notificações:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  initializeNotifications,
  checkNotificationsCollection,
  clearTestNotifications
};
