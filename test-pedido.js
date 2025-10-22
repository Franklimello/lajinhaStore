// Script para testar o envio de e-mail de pedidos
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQ",
  authDomain: "compreaqui-324df.firebaseapp.com",
  projectId: "compreaqui-324df",
  storageBucket: "compreaqui-324df.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function criarPedidoTeste() {
  try {
    console.log('🧪 Criando pedido de teste...');
    
    const pedidoTeste = {
      userId: 'ZG5D6IrTRTZl5SDoEctLAtr4WkE2', // Seu ID de usuário
      total: 29.99,
      subtotal: 25.99,
      frete: 4.00,
      paymentMethod: 'pix',
      status: 'Aguardando Pagamento',
      items: [
        {
          id: 'produto-teste-1',
          titulo: 'Produto de Teste',
          preco: 25.99,
          qty: 1,
          imagem: 'https://via.placeholder.com/150'
        }
      ],
      endereco: {
        nome: 'Franklim Melo',
        telefone: '(11) 99999-9999',
        rua: 'Rua de Teste',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        referencia: 'Próximo ao shopping'
      },
      observacoes: 'Este é um pedido de teste para verificar o envio de e-mail',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'pedidos'), pedidoTeste);
    console.log('✅ Pedido de teste criado com ID:', docRef.id);
    console.log('📧 Verifique o e-mail em frank.melo.wal@gmail.com');
    console.log('📊 Verifique os logs: firebase functions:log --only onOrderCreated');
    
  } catch (error) {
    console.error('❌ Erro ao criar pedido de teste:', error);
  }
}

// Executar teste
criarPedidoTeste();







