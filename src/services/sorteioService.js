import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  Timestamp,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

/**
 * Adiciona dados de compra elegível ao sorteio
 * Apenas salva se o pedido tiver 5 ou mais itens
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

    // 🔍 VERIFICAR SE JÁ EXISTE PARTICIPANTE COM ESTE PEDIDO
    const sorteioRef = collection(db, 'sorteio');
    const existingQuery = query(sorteioRef, where('orderNumber', '==', String(orderNumber)));
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      console.log(`⚠️ Pedido #${orderNumber} já existe no sorteio - evitando duplicata`);
      return {
        success: false,
        message: 'Pedido já participa do sorteio.',
        eligible: false,
        alreadyExists: true
      };
    }

    // 🛡️ PROTEÇÃO ADICIONAL: Verificar se há muitos documentos recentes
    const recentQuery = query(
      sorteioRef, 
      where('createdAt', '>=', new Date(Date.now() - 60000)), // Últimos 60 segundos
      orderBy('createdAt', 'desc')
    );
    const recentSnapshot = await getDocs(recentQuery);
    
    if (recentSnapshot.size > 10) {
      console.log(`🚨 ALERTA: ${recentSnapshot.size} documentos criados nos últimos 60 segundos - possível loop detectado!`);
      return {
        success: false,
        message: 'Sistema temporariamente pausado para evitar loop.',
        eligible: false,
        loopDetected: true
      };
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

    // 🎯 VERIFICAR REGRA CONFIGURADA (itens ou valor)
    const config = await getSorteioConfig();
    let isElegivel = false;
    let motivo = '';

    if (config.regraTipo === 'itens') {
      isElegivel = totalItems >= config.regraValor;
      motivo = isElegivel 
        ? `Pedido elegível (${totalItems} itens >= ${config.regraValor})`
        : `Pedido não elegível (${totalItems} itens < ${config.regraValor} mínimo)`;
    } else if (config.regraTipo === 'valor') {
      isElegivel = totalValue >= config.regraValor;
      motivo = isElegivel
        ? `Pedido elegível (R$ ${totalValue.toFixed(2)} >= R$ ${config.regraValor.toFixed(2)})`
        : `Pedido não elegível (R$ ${totalValue.toFixed(2)} < R$ ${config.regraValor.toFixed(2)} mínimo)`;
    }

    if (!isElegivel) {
      console.log(`⚠️ ${motivo} - Pedido #${orderNumber}`);
      return {
        success: false,
        message: `Pedido não elegível para sorteio. ${motivo.split(' - ')[0]}`,
        eligible: false
      };
    }

    // 🔍 LOG DETALHADO PARA DEBUG
    console.log(`🔍 DEBUG SORTEIO - Pedido #${orderNumber}:`);
    console.log(`   📊 Total de itens: ${totalItems}`);
    console.log(`   👤 Cliente: ${clientName}`);
    console.log(`   📱 Telefone: ${clientPhone}`);
    console.log(`   💰 Valor: R$ ${totalValue}`);
    console.log(`   ⚙️ Regra: ${config.regraTipo} >= ${config.regraValor}`);
    console.log(`   ✅ Elegível: SIM`);

    // Salvar no Firestore
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
 * Retorna apenas pedidos com 5+ itens, ordenados por data
 * 
 * @returns {Promise<Array>} - Lista de pedidos elegíveis
 */
export const getSorteioData = async () => {
  try {
    // Buscar configuração atual da regra
    const config = await getSorteioConfig();
    
    const sorteioRef = collection(db, 'sorteio');
    const q = query(sorteioRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const data = [];
    querySnapshot.forEach((doc) => {
      const docData = doc.data();
      
      // Aplicar filtro baseado na regra configurada
      let isElegivel = false;
      if (config.regraTipo === 'itens') {
        isElegivel = docData.totalItems >= config.regraValor;
      } else if (config.regraTipo === 'valor') {
        isElegivel = docData.totalValue >= config.regraValor;
      }
      
      if (isElegivel) {
        data.push({
          id: doc.id,
          ...docData,
          // Converte Timestamp para Date se necessário
          createdAt: docData.createdAt?.toDate?.() || docData.createdAt
        });
      }
    });

    console.log(`✅ ${data.length} pedidos elegíveis encontrados no sorteio (regra: ${config.regraTipo} >= ${config.regraValor})`);
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar dados do sorteio:', error);
    throw error;
  }
};

// Cache para evitar múltiplas chamadas simultâneas
let savingWinnerInProgress = false;
let lastSavedWinner = null;
let lastSaveTime = 0;

/**
 * Salva o vencedor do sorteio
 * 🛡️ PROTEÇÃO CONTRA LOOPS: Verifica duplicatas e previne múltiplas chamadas
 * 
 * @param {Object} winner - Dados do vencedor
 * @param {string} winner.clientName - Nome do cliente vencedor
 * @param {string} winner.clientPhone - Telefone do cliente
 * @param {string} winner.orderNumber - Número do pedido vencedor
 * @param {number} winner.totalItems - Total de itens do pedido
 * @param {number} winner.totalValue - Valor total do pedido
 * @returns {Promise<Object>} - { success: boolean, message: string, id?: string, alreadyExists?: boolean }
 */
export const saveWinner = async (winner) => {
  try {
    // 🛡️ PROTEÇÃO 1: Verificar se já está salvando
    if (savingWinnerInProgress) {
      console.log('⚠️ Tentativa de salvar vencedor enquanto outra operação está em andamento - ignorando');
      return {
        success: false,
        message: 'Operação já em andamento',
        alreadyExists: false,
        inProgress: true
      };
    }

    // 🛡️ PROTEÇÃO 2: Rate limiting - bloquear múltiplas chamadas em 5 segundos
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTime;
    if (timeSinceLastSave < 5000 && lastSavedWinner?.orderNumber === winner?.orderNumber) {
      console.log(`⚠️ Tentativa de salvar o mesmo vencedor muito rapidamente (${timeSinceLastSave}ms) - ignorando`);
      return {
        success: false,
        message: 'Vencedor já foi salvo recentemente',
        alreadyExists: true,
        rateLimited: true
      };
    }

    if (!winner) {
      throw new Error('Dados do vencedor não fornecidos');
    }

    const { clientName, clientPhone, orderNumber, totalItems, totalValue } = winner;

    if (!clientName || !clientPhone || !orderNumber) {
      throw new Error('Dados do vencedor incompletos');
    }

    // 🛡️ PROTEÇÃO 3: Verificar se já existe vencedor com este orderNumber nos últimos 24h
    const winnersRef = collection(db, 'sorteio_vencedores');
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    
    const existingQuery = query(
      winnersRef,
      where('orderNumber', '==', String(orderNumber)),
      orderBy('createdAt', 'desc')
    );
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      const recentWinner = existingSnapshot.docs[0].data();
      const winnerDate = recentWinner.createdAt?.toDate?.() || new Date(recentWinner.createdAt);
      const hoursAgo = (now - winnerDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursAgo < 24) {
        console.log(`⚠️ Vencedor com pedido #${orderNumber} já foi salvo há ${hoursAgo.toFixed(1)} horas - evitando duplicata`);
        return {
          success: false,
          message: `Este vencedor já foi salvo há ${hoursAgo.toFixed(1)} horas`,
          alreadyExists: true,
          existingId: existingSnapshot.docs[0].id
        };
      }
    }

    // 🛡️ PROTEÇÃO 4: Verificar se há muitos vencedores salvos recentemente (últimos 60 segundos)
    const oneMinuteAgo = Timestamp.fromDate(new Date(now - 60000));
    const recentQuery = query(
      winnersRef,
      where('createdAt', '>=', oneMinuteAgo),
      orderBy('createdAt', 'desc')
    );
    const recentSnapshot = await getDocs(recentQuery);
    
    if (recentSnapshot.size > 3) {
      console.log(`🚨 ALERTA: ${recentSnapshot.size} vencedores salvos nos últimos 60 segundos - possível loop detectado!`);
      return {
        success: false,
        message: 'Sistema temporariamente pausado para evitar loop. Aguarde alguns segundos.',
        alreadyExists: false,
        loopDetected: true
      };
    }

    // 🛡️ Marcar como em progresso
    savingWinnerInProgress = true;

    // Salvar na coleção de vencedores
    const docRef = await addDoc(winnersRef, {
      clientName: String(clientName),
      clientPhone: String(clientPhone),
      orderNumber: String(orderNumber),
      totalItems: Number(totalItems) || 0,
      totalValue: Number(totalValue) || 0,
      createdAt: Timestamp.now() // Data/hora do sorteio
    });

    // Atualizar cache
    lastSavedWinner = { ...winner };
    lastSaveTime = now;

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
  } finally {
    // Sempre liberar o lock após 2 segundos (caso algo dê errado)
    setTimeout(() => {
      savingWinnerInProgress = false;
    }, 2000);
  }
};

/**
 * Busca a configuração completa do sorteio
 * @returns {Promise<Object>} - { ativa: boolean, regraTipo: 'itens'|'valor', regraValor: number }
 */
export const getSorteioConfig = async () => {
  try {
    const configRef = collection(db, 'sorteio_config');
    const q = query(configRef);
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Configuração padrão
      return {
        ativa: true,
        regraTipo: 'itens', // 'itens' ou 'valor'
        regraValor: 5 // mínimo de 5 itens ou R$ 5,00
      };
    }
    
    const configDoc = querySnapshot.docs[0];
    const data = configDoc.data();
    
    return {
      ativa: data.ativa !== false,
      regraTipo: data.regraTipo || 'itens',
      regraValor: data.regraValor || 5
    };
  } catch (error) {
    console.error('Erro ao buscar configuração do sorteio:', error);
    return {
      ativa: true,
      regraTipo: 'itens',
      regraValor: 5
    };
  }
};

/**
 * Verifica se a promoção está ativa
 * @returns {Promise<boolean>} - true se ativa, false se pausada
 */
export const isPromocaoAtiva = async () => {
  try {
    const config = await getSorteioConfig();
    return config.ativa;
  } catch (error) {
    console.error('Erro ao verificar status da promoção:', error);
    return true; // Em caso de erro, permite continuar
  }
};

/**
 * Atualiza a configuração do sorteio
 * @param {Object} config - { ativa?: boolean, regraTipo?: 'itens'|'valor', regraValor?: number }
 * @returns {Promise<Object>}
 */
export const updateSorteioConfig = async (config) => {
  try {
    const configRef = collection(db, 'sorteio_config');
    const q = query(configRef);
    const querySnapshot = await getDocs(q);
    
    // Buscar config atual para preservar campos não informados
    const currentConfig = await getSorteioConfig();
    
    const data = {
      ...currentConfig,
      ...config,
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
    
    console.log(`✅ Configuração do sorteio atualizada:`, data);
    
    return {
      success: true,
      message: 'Configuração atualizada com sucesso!',
      config: data
    };
  } catch (error) {
    console.error('❌ Erro ao atualizar configuração:', error);
    return {
      success: false,
      message: `Erro ao atualizar configuração: ${error.message}`,
      error: error.message
    };
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

/**
 * Adiciona manualmente um cliente ao sorteio (para casos especiais)
 * @param {Object} cliente - Dados do cliente
 * @returns {Promise<Object>}
 */
export const adicionarClienteManual = async (cliente) => {
  try {
    console.log('🔧 ADICIONANDO CLIENTE MANUALMENTE AO SORTEIO...');
    console.log('📊 Dados do cliente:', cliente);
    
    const resultado = await addSorteioData(cliente);
    
    if (resultado.success) {
      console.log('✅ Cliente adicionado manualmente com sucesso!');
    } else {
      console.log('❌ Falha ao adicionar cliente manualmente:', resultado.message);
    }
    
    return resultado;
  } catch (error) {
    console.error('❌ Erro ao adicionar cliente manualmente:', error);
    return {
      success: false,
      message: `Erro: ${error.message}`,
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

