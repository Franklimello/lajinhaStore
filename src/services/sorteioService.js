import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

/**
 * Adiciona dados de compra elegível ao sorteio
 * Apenas salva se o pedido tiver 10 ou mais itens
 * 
 * @param {Object} order - Objeto do pedido
 * @param {string} order.orderNumber - Número do pedido
 * @param {string} order.clientName - Nome do cliente
 * @param {string} order.clientPhone - Telefone do cliente
 * @param {number} order.totalItems - Total de itens (quantidade)
 * @param {number} order.totalValue - Valor total do pedido
 * @returns {Promise<Object>} - { success: boolean, message: string, id?: string }
 */
export const addSorteioData = async (order) => {
  try {
    // Validação básica
    if (!order) {
      throw new Error('Dados do pedido não fornecidos');
    }

    const { orderNumber, clientName, clientPhone, totalItems, totalValue } = order;

    // Validação de campos obrigatórios
    if (!orderNumber || !clientName || !clientPhone || totalItems === undefined || totalValue === undefined) {
      throw new Error('Campos obrigatórios não preenchidos');
    }

    // VERIFICAR SE A PROMOÇÃO ESTÁ ATIVA
    const promocaoAtiva = await isPromocaoAtiva();
    if (!promocaoAtiva) {
      console.log(`⏸️ Promoção pausada - Pedido #${orderNumber} não será salvo no sorteio`);
      return {
        success: false,
        message: 'Promoção pausada no momento.',
        eligible: false,
        promocaoPausada: true
      };
    }

    // REGRA PRINCIPAL: Apenas pedidos com 10 ou mais itens são elegíveis
    if (totalItems < 10) {
      console.log(`⚠️ Pedido #${orderNumber} não elegível para sorteio (${totalItems} itens - mínimo 10)`);
      return {
        success: false,
        message: 'Pedido não elegível para sorteio. Mínimo de 10 itens necessários.',
        eligible: false
      };
    }

    // Salvar no Firestore
    const sorteioRef = collection(db, 'sorteio');
    const docRef = await addDoc(sorteioRef, {
      orderNumber: String(orderNumber),
      clientName: String(clientName),
      clientPhone: String(clientPhone),
      totalItems: Number(totalItems),
      totalValue: Number(totalValue),
      createdAt: Timestamp.now()
    });

    console.log(`✅ Pedido #${orderNumber} salvo no sorteio com sucesso! (${totalItems} itens)`);

    return {
      success: true,
      message: 'Pedido elegível salvo no sorteio com sucesso!',
      id: docRef.id,
      eligible: true
    };
  } catch (error) {
    console.error('❌ Erro ao salvar dados do sorteio:', error);
    return {
      success: false,
      message: `Erro ao salvar no sorteio: ${error.message}`,
      error: error.message
    };
  }
};

/**
 * Busca todos os dados de sorteio
 * Retorna apenas pedidos com 10+ itens, ordenados por data
 * 
 * @returns {Promise<Array>} - Lista de pedidos elegíveis
 */
export const getSorteioData = async () => {
  try {
    const sorteioRef = collection(db, 'sorteio');
    const q = query(sorteioRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const data = [];
    querySnapshot.forEach((doc) => {
      const docData = doc.data();
      
      // Filtro adicional: apenas pedidos com 10+ itens
      if (docData.totalItems >= 10) {
        data.push({
          id: doc.id,
          ...docData,
          // Converte Timestamp para Date se necessário
          createdAt: docData.createdAt?.toDate?.() || docData.createdAt
        });
      }
    });

    console.log(`✅ ${data.length} pedidos elegíveis encontrados no sorteio`);
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar dados do sorteio:', error);
    throw error;
  }
};

/**
 * Salva o vencedor do sorteio
 * 
 * @param {Object} winner - Dados do vencedor
 * @param {string} winner.clientName - Nome do cliente vencedor
 * @param {string} winner.clientPhone - Telefone do cliente
 * @param {string} winner.orderNumber - Número do pedido vencedor
 * @param {number} winner.totalItems - Total de itens do pedido
 * @param {number} winner.totalValue - Valor total do pedido
 * @returns {Promise<Object>} - { success: boolean, message: string, id?: string }
 */
export const saveWinner = async (winner) => {
  try {
    if (!winner) {
      throw new Error('Dados do vencedor não fornecidos');
    }

    const { clientName, clientPhone, orderNumber, totalItems, totalValue } = winner;

    if (!clientName || !clientPhone || !orderNumber) {
      throw new Error('Dados do vencedor incompletos');
    }

    // Salvar na coleção de vencedores
    const winnersRef = collection(db, 'sorteio_vencedores');
    const docRef = await addDoc(winnersRef, {
      clientName: String(clientName),
      clientPhone: String(clientPhone),
      orderNumber: String(orderNumber),
      totalItems: Number(totalItems) || 0,
      totalValue: Number(totalValue) || 0,
      createdAt: Timestamp.now() // Data/hora do sorteio
    });

    console.log(`🎉 Vencedor salvo com sucesso! Pedido #${orderNumber}`);

    return {
      success: true,
      message: 'Vencedor salvo com sucesso!',
      id: docRef.id
    };
  } catch (error) {
    console.error('❌ Erro ao salvar vencedor:', error);
    return {
      success: false,
      message: `Erro ao salvar vencedor: ${error.message}`,
      error: error.message
    };
  }
};

/**
 * Verifica se a promoção está ativa
 * @returns {Promise<boolean>} - true se ativa, false se pausada
 */
export const isPromocaoAtiva = async () => {
  try {
    const configRef = collection(db, 'sorteio_config');
    const q = query(configRef);
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Se não existe config, considera ativa por padrão
      return true;
    }
    
    const configDoc = querySnapshot.docs[0];
    return configDoc.data().ativa !== false; // true por padrão
  } catch (error) {
    console.error('Erro ao verificar status da promoção:', error);
    return true; // Em caso de erro, permite continuar
  }
};

/**
 * Ativa ou pausa a promoção
 * @param {boolean} ativa - true para ativar, false para pausar
 * @returns {Promise<Object>}
 */
export const togglePromocao = async (ativa) => {
  try {
    const configRef = collection(db, 'sorteio_config');
    const q = query(configRef);
    const querySnapshot = await getDocs(q);
    
    const data = {
      ativa: ativa,
      updatedAt: Timestamp.now()
    };
    
    if (querySnapshot.empty) {
      // Cria novo documento
      await addDoc(configRef, data);
    } else {
      // Atualiza documento existente
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, data);
    }
    
    console.log(`✅ Promoção ${ativa ? 'ATIVADA' : 'PAUSADA'} com sucesso!`);
    
    return {
      success: true,
      message: `Promoção ${ativa ? 'ativada' : 'pausada'} com sucesso!`,
      ativa: ativa
    };
  } catch (error) {
    console.error('Erro ao alterar status da promoção:', error);
    return {
      success: false,
      message: `Erro ao alterar status: ${error.message}`,
      error: error.message
    };
  }
};

/**
 * Limpa todos os participantes do sorteio
 * @returns {Promise<Object>}
 */
export const limparParticipantes = async () => {
  try {
    const sorteioRef = collection(db, 'sorteio');
    const querySnapshot = await getDocs(sorteioRef);
    
    const deletePromises = [];
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    
    console.log(`✅ ${querySnapshot.size} participante(s) excluído(s) com sucesso!`);
    
    return {
      success: true,
      message: `${querySnapshot.size} participante(s) excluído(s) com sucesso!`,
      deletedCount: querySnapshot.size
    };
  } catch (error) {
    console.error('Erro ao limpar participantes:', error);
    return {
      success: false,
      message: `Erro ao limpar participantes: ${error.message}`,
      error: error.message
    };
  }
};

// TODO: Implementar busca de vencedores anteriores
// export const getPastWinners = async () => { ... }

// TODO: Implementar filtro por intervalo de datas
// export const getSorteioDataByDateRange = async (startDate, endDate) => { ... }

// TODO: Implementar sorteio automático mensal
// export const scheduleMonthlyRaffle = () => { ... }

