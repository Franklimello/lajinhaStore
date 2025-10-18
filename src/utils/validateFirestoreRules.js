// Script de validação das regras do Firestore
// Execute este script antes de implementar as regras de produção

import { db } from '../firebase/config';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// UID do administrador
const ADMIN_UID = "ZG5D6IrTRTZl5SDoEctLAtr4WkE2";

// Função para testar regras de pedidos
export const testPedidosRules = async (user, isAdmin = false) => {
  const results = {
    create: false,
    read: false,
    update: false,
    delete: false
  };

  try {
    // Teste 1: Criar pedido
    const testOrderData = {
      userId: user.uid,
      total: 10.00,
      subtotal: 5.00,
      frete: 5.00,
      items: [{ id: 'test', nome: 'Teste', quantidade: 1, precoUnitario: 5.00, subtotal: 5.00 }],
      endereco: { nome: 'Teste', rua: 'Teste', telefone: '19999999999' },
      paymentReference: 'TEST-' + Date.now(),
      qrData: 'test-data',
      metadata: { pixKey: 'test', merchantName: 'Teste', originalOrderId: 'TEST-' + Date.now() }
    };

    const orderRef = await addDoc(collection(db, 'pedidos'), testOrderData);
    results.create = true;
    console.log('✅ CREATE: Pedido criado com sucesso');

    // Teste 2: Ler pedido
    const orderDoc = await getDoc(doc(db, 'pedidos', orderRef.id));
    if (orderDoc.exists()) {
      results.read = true;
      console.log('✅ READ: Pedido lido com sucesso');
    }

    // Teste 3: Atualizar pedido
    await updateDoc(doc(db, 'pedidos', orderRef.id), {
      status: 'Teste',
      updatedAt: new Date()
    });
    results.update = true;
    console.log('✅ UPDATE: Pedido atualizado com sucesso');

    // Teste 4: Deletar pedido (apenas admin)
    if (isAdmin) {
      await deleteDoc(doc(db, 'pedidos', orderRef.id));
      results.delete = true;
      console.log('✅ DELETE: Pedido deletado com sucesso');
    } else {
      console.log('⚠️ DELETE: Apenas administrador pode deletar');
    }

  } catch (error) {
    console.error('❌ Erro no teste de pedidos:', error);
  }

  return results;
};

// Função para testar regras de produtos
export const testProdutosRules = async (user, isAdmin = false) => {
  const results = {
    read: false,
    write: false
  };

  try {
    // Teste 1: Ler produtos
    const produtosSnapshot = await getDocs(collection(db, 'produtos'));
    if (!produtosSnapshot.empty) {
      results.read = true;
      console.log('✅ READ: Produtos lidos com sucesso');
    }

    // Teste 2: Escrever produtos (apenas admin)
    if (isAdmin) {
      const testProduto = {
        nome: 'Produto Teste',
        preco: 10.00,
        categoria: 'teste',
        descricao: 'Produto de teste',
        imagem: 'teste.jpg',
        ativo: true,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'produtos'), testProduto);
      results.write = true;
      console.log('✅ WRITE: Produto criado com sucesso');
    } else {
      console.log('⚠️ WRITE: Apenas administrador pode criar produtos');
    }

  } catch (error) {
    console.error('❌ Erro no teste de produtos:', error);
  }

  return results;
};

// Função para testar regras de categorias
export const testCategoriasRules = async (user, isAdmin = false) => {
  const results = {
    read: false,
    write: false
  };

  try {
    // Teste 1: Ler categorias
    const categoriasSnapshot = await getDocs(collection(db, 'categorias'));
    if (!categoriasSnapshot.empty) {
      results.read = true;
      console.log('✅ READ: Categorias lidas com sucesso');
    }

    // Teste 2: Escrever categorias (apenas admin)
    if (isAdmin) {
      const testCategoria = {
        nome: 'Categoria Teste',
        descricao: 'Categoria de teste',
        ativa: true,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'categorias'), testCategoria);
      results.write = true;
      console.log('✅ WRITE: Categoria criada com sucesso');
    } else {
      console.log('⚠️ WRITE: Apenas administrador pode criar categorias');
    }

  } catch (error) {
    console.error('❌ Erro no teste de categorias:', error);
  }

  return results;
};

// Função principal de validação
export const validateAllRules = async (user) => {
  if (!user) {
    console.error('❌ Usuário não autenticado');
    return;
  }

  const isAdmin = user.uid === ADMIN_UID;
  console.log(`🧪 Testando regras para ${isAdmin ? 'ADMINISTRADOR' : 'USUÁRIO COMUM'}`);
  console.log(`👤 UID: ${user.uid}`);
  console.log('='.repeat(50));

  // Teste de pedidos
  console.log('📋 Testando regras de PEDIDOS...');
  const pedidosResults = await testPedidosRules(user, isAdmin);
  
  // Teste de produtos
  console.log('🛍️ Testando regras de PRODUTOS...');
  const produtosResults = await testProdutosRules(user, isAdmin);
  
  // Teste de categorias
  console.log('📂 Testando regras de CATEGORIAS...');
  const categoriasResults = await testCategoriasRules(user, isAdmin);

  // Resumo dos resultados
  console.log('='.repeat(50));
  console.log('📊 RESUMO DOS TESTES:');
  console.log('Pedidos:', pedidosResults);
  console.log('Produtos:', produtosResults);
  console.log('Categorias:', categoriasResults);

  return {
    pedidos: pedidosResults,
    produtos: produtosResults,
    categorias: categoriasResults
  };
};

// Função para testar segurança (usuário não deve acessar dados de outros)
export const testSecurityRules = async (user) => {
  if (!user) return;

  try {
    // Tentar acessar pedidos de outros usuários
    const allOrdersSnapshot = await getDocs(collection(db, 'pedidos'));
    const userOrders = [];
    const otherOrders = [];

    allOrdersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.userId === user.uid) {
        userOrders.push(doc.id);
      } else {
        otherOrders.push(doc.id);
      }
    });

    console.log('🔒 Teste de Segurança:');
    console.log(`✅ Pedidos do usuário: ${userOrders.length}`);
    console.log(`❌ Pedidos de outros: ${otherOrders.length}`);

    if (otherOrders.length > 0) {
      console.warn('⚠️ ATENÇÃO: Usuário pode estar vendo pedidos de outros!');
    } else {
      console.log('✅ Segurança OK: Usuário vê apenas seus pedidos');
    }

  } catch (error) {
    console.error('❌ Erro no teste de segurança:', error);
  }
};
