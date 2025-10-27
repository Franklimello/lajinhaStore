/**
 * 🔍 DIAGNÓSTICO DO SISTEMA DE SORTEIO
 * 
 * Script para investigar por que um cliente com 12 cervejas não foi registrado no sorteio
 * 
 * Como usar:
 * 1. Abra o console do navegador (F12)
 * 2. Cole este código
 * 3. Execute: diagnosticoSorteio()
 */

// Importar as funções necessárias (se estiver no contexto da aplicação)
// Se não estiver, você pode executar este código diretamente no console

async function diagnosticoSorteio() {
  console.log('🔍 INICIANDO DIAGNÓSTICO DO SISTEMA DE SORTEIO');
  console.log('================================================');
  
  try {
    // 1. Verificar se a promoção está ativa
    console.log('\n1️⃣ VERIFICANDO STATUS DA PROMOÇÃO...');
    const promocaoAtiva = await isPromocaoAtiva();
    console.log(`Status da promoção: ${promocaoAtiva ? '✅ ATIVA' : '❌ PAUSADA'}`);
    
    if (!promocaoAtiva) {
      console.log('🚨 PROBLEMA ENCONTRADO: Promoção está pausada!');
      console.log('💡 SOLUÇÃO: Ative a promoção no painel admin (/sorteio)');
      return;
    }
    
    // 2. Verificar participantes atuais
    console.log('\n2️⃣ VERIFICANDO PARTICIPANTES ATUAIS...');
    const participantes = await getSorteioData();
    console.log(`Total de participantes: ${participantes.length}`);
    
    if (participantes.length > 0) {
      console.log('Últimos 3 participantes:');
      participantes.slice(0, 3).forEach((p, i) => {
        console.log(`  ${i+1}. ${p.clientName} - Pedido #${p.orderNumber} - ${p.totalItems} itens`);
      });
    }
    
    // 3. Simular teste com 12 cervejas
    console.log('\n3️⃣ SIMULANDO TESTE COM 12 CERVEJAS...');
    const testePedido = {
      orderNumber: `TESTE-${Date.now()}`,
      clientName: 'Cliente Teste',
      clientPhone: '11999999999',
      totalItems: 12, // 12 cervejas
      totalValue: 120.00
    };
    
    console.log('Dados do teste:', testePedido);
    
    const resultado = await addSorteioData(testePedido);
    console.log('Resultado do teste:', resultado);
    
    if (resultado.success) {
      console.log('✅ TESTE PASSOU: Sistema funcionando corretamente');
      console.log('💡 POSSÍVEIS CAUSAS do problema original:');
      console.log('   - Promoção estava pausada no momento do pedido');
      console.log('   - Erro de conexão durante o checkout');
      console.log('   - Pedido já existia (duplicata)');
      console.log('   - Erro no processo de checkout');
    } else {
      console.log('❌ TESTE FALHOU:', resultado.message);
      console.log('🔍 Motivo específico:', resultado);
    }
    
    // 4. Verificar logs de erro
    console.log('\n4️⃣ VERIFICANDO LOGS DE ERRO...');
    console.log('Verifique o console do navegador durante o checkout para erros como:');
    console.log('   - "❌ Erro ao adicionar ao sorteio"');
    console.log('   - "⚠️ Pedido não elegível para sorteio"');
    console.log('   - "⏸️ Promoção pausada"');
    console.log('   - "🚨 ALERTA: possível loop detectado"');
    
    // 5. Recomendações
    console.log('\n5️⃣ RECOMENDAÇÕES:');
    console.log('   ✅ Verifique se a promoção está ativa');
    console.log('   ✅ Teste com um novo pedido de 5+ itens');
    console.log('   ✅ Verifique os logs do console durante o checkout');
    console.log('   ✅ Acesse /sorteio para ver participantes atuais');
    
  } catch (error) {
    console.error('❌ ERRO NO DIAGNÓSTICO:', error);
    console.log('💡 Verifique se você está executando no contexto da aplicação');
  }
}

// Função para testar manualmente um pedido
async function testarPedidoSorteio(dadosPedido) {
  console.log('🧪 TESTANDO PEDIDO NO SORTEIO...');
  console.log('Dados:', dadosPedido);
  
  try {
    const resultado = await addSorteioData(dadosPedido);
    console.log('Resultado:', resultado);
    return resultado;
  } catch (error) {
    console.error('Erro no teste:', error);
    return { success: false, error: error.message };
  }
}

// Exemplo de uso:
// testarPedidoSorteio({
//   orderNumber: 'PEDIDO-123',
//   clientName: 'João Silva',
//   clientPhone: '11999999999',
//   totalItems: 12,
//   totalValue: 120.00
// });

console.log('🔍 DIAGNÓSTICO CARREGADO!');
console.log('Execute: diagnosticoSorteio() para iniciar o diagnóstico');
console.log('Execute: testarPedidoSorteio(dados) para testar um pedido específico');


