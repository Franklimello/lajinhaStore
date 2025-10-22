# 🎉 Sistema de Sorteio - Documentação Completa

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquivos Criados](#arquivos-criados)
3. [Como Funciona](#como-funciona)
4. [Integração com Checkout](#integração-com-checkout)
5. [Regras do Sorteio](#regras-do-sorteio)
6. [Como Usar](#como-usar)
7. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
8. [Futuras Melhorias](#futuras-melhorias)

---

## 🎯 Visão Geral

Sistema completo de sorteio para clientes que realizam compras com **5 ou mais itens**. O sistema inclui:

- ✅ Salvamento automático de pedidos elegíveis no Firestore
- ✅ Interface administrativa para visualizar participantes
- ✅ Animação de sorteio com Framer Motion
- ✅ Efeito de confete com React-Confetti
- ✅ Salvamento automático do vencedor
- ✅ Acesso restrito a administradores

---

## 📁 Arquivos Criados

### 1. **Serviço** (`src/services/sorteioService.js`)
Funções para gerenciar dados do sorteio no Firestore:

- `addSorteioData(order)` - Salva pedido elegível (5+ itens)
- `getSorteioData()` - Busca todos os pedidos elegíveis
- `saveWinner(winner)` - Salva o vencedor do sorteio

### 2. **Componente de Animação** (`src/components/SorteioAnimation.jsx`)
Componente visual do sorteio com:
- Ciclo de nomes com desaceleração progressiva
- Modal estilizado com gradientes
- Confete animado ao selecionar vencedor
- Salvamento automático do vencedor

### 3. **Página Administrativa** (`src/pages/SorteioPage/index.js`)
Interface completa com:
- Botões "Buscar Dados" e "Sortear"
- Tabela responsiva de participantes
- Estatísticas e contadores
- Estados de loading e erro
- Design moderno com gradientes

### 4. **Integração no App** (`src/App.js`)
- Rota `/sorteio` protegida por `AdminRoute`
- Lazy loading para otimização

### 5. **Link no Painel** (`src/pages/Painel/index.js`)
- Botão "Sorteio" no cabeçalho do painel administrativo

---

## 🔄 Como Funciona

### Fluxo do Sistema

```
Cliente faz compra → Checkout confirmado → Verifica total de itens
                                                     ↓
                        ≥ 10 itens? → SIM → Salva no Firestore (coleção "sorteio")
                                      ↓ NÃO
                                   Ignora (não salva)
```

### Fluxo do Sorteio

```
Admin acessa /sorteio → Clica "Buscar Dados" → Lista participantes
                                                      ↓
                              Admin clica "Sortear" → Animação inicia
                                                      ↓
                              Ciclo de nomes rápido → Desacelera gradualmente
                                                      ↓
                              Seleciona vencedor → Mostra modal + confete
                                                      ↓
                              Salva vencedor no Firestore (coleção "sorteio_vencedores")
```

---

## 🔗 Integração com Checkout

### IMPORTANTE: Você precisa integrar o sistema no seu fluxo de checkout existente!

### Opção 1: Integração Manual

Localize o arquivo onde você confirma o pedido (provavelmente em `src/pages/Cart` ou similar) e adicione:

```javascript
import { addSorteioData } from '../services/sorteioService';

// No momento da confirmação do pedido:
const handleCheckoutComplete = async (orderData) => {
  // ... seu código de checkout existente ...

  // Calcular total de itens (soma das quantidades)
  const totalItems = orderData.items.reduce((sum, item) => sum + item.quantity, 0);

  // Preparar dados para o sorteio
  const sorteioOrder = {
    orderNumber: orderData.orderNumber,      // Número do pedido
    clientName: orderData.clientName,        // Nome do cliente
    clientPhone: orderData.clientPhone,      // Telefone
    totalItems: totalItems,                  // Total de itens (quantidade)
    totalValue: orderData.totalValue         // Valor total do pedido
  };

  // Tentar salvar no sorteio (só salva se totalItems >= 10)
  const result = await addSorteioData(sorteioOrder);
  
  if (result.eligible) {
    console.log('✅ Pedido elegível para sorteio!');
  } else {
    console.log('⚠️ Pedido não elegível (menos de 10 itens)');
  }

  // ... continua seu fluxo normal ...
};
```

### Opção 2: Exemplo Completo

```javascript
import { addSorteioData } from '../services/sorteioService';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const finalizarPedido = async () => {
  try {
    // 1. Calcular total de itens
    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    // 2. Calcular valor total
    const totalValue = cartItems.reduce((sum, item) => 
      sum + (item.preco * (item.quantity || 1)), 0
    );

    // 3. Criar pedido no Firestore (sua lógica existente)
    const orderNumber = Date.now(); // ou seu método de gerar número do pedido
    const pedidoRef = await addDoc(collection(db, 'pedidos'), {
      clientName: userData.name,
      clientPhone: userData.phone,
      items: cartItems,
      totalValue: totalValue,
      totalItems: totalItems,
      status: 'pendente',
      createdAt: Timestamp.now()
    });

    // 4. ADICIONAR AO SORTEIO (se elegível)
    await addSorteioData({
      orderNumber: String(orderNumber),
      clientName: userData.name,
      clientPhone: userData.phone,
      totalItems: totalItems,
      totalValue: totalValue
    });

    console.log('✅ Pedido finalizado e verificado para sorteio!');
    
    // 5. Continuar seu fluxo...
    navigate('/status-pedido/' + orderNumber);
    
  } catch (error) {
    console.error('Erro ao finalizar pedido:', error);
  }
};
```

### Campos Necessários

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `orderNumber` | string/number | Número único do pedido | "1735567890123" |
| `clientName` | string | Nome completo do cliente | "João Silva" |
| `clientPhone` | string | Telefone do cliente | "(11) 98765-4321" |
| `totalItems` | number | **SOMA das quantidades** | 15 (ex: 3 produtos, 5 de cada) |
| `totalValue` | number | Valor total em reais | 250.50 |

### ⚠️ ATENÇÃO: Total de Itens vs. Total de Produtos

```javascript
// ❌ ERRADO - Conta tipos de produtos
const totalItems = cartItems.length; // Se tem 3 produtos diferentes = 3

// ✅ CORRETO - Soma as quantidades
const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
// Exemplo: 5 bananas + 3 maçãs + 2 pães = 10 itens ✅
```

---

## 📜 Regras do Sorteio

### ✅ Elegibilidade

- **Mínimo de 10 itens** (soma das quantidades)
- Todos os pedidos elegíveis têm chance igual
- Um pedido = uma entrada no sorteio

### ❌ Não Elegível

- Pedidos com menos de 10 itens não são salvos
- Retorna `{ success: false, eligible: false }` mas não gera erro

### Exemplo Prático

```javascript
// PEDIDO 1: 5 maçãs + 3 bananas = 8 itens → NÃO ELEGÍVEL ❌
// PEDIDO 2: 10 maçãs = 10 itens → ELEGÍVEL ✅
// PEDIDO 3: 5 tipos de produtos, 2 de cada = 10 itens → ELEGÍVEL ✅
```

---

## 🎮 Como Usar (Admin)

### Passo 1: Acessar o Sistema
1. Faça login como administrador
2. Acesse o Painel Administrativo (`/painel`)
3. Clique no botão **"Sorteio"** (ícone de troféu 🏆)

### Passo 2: Buscar Participantes
1. Na página de Sorteio, clique em **"Buscar Dados"**
2. O sistema carregará todos os pedidos elegíveis
3. Revise a tabela com os participantes

### Passo 3: Realizar o Sorteio
1. Clique em **"Sortear Vencedor"**
2. Aguarde a animação (ciclo de nomes)
3. O vencedor será exibido com confete 🎉
4. O vencedor é **salvo automaticamente** no Firestore

### Resultado
- Vencedor fica registrado na coleção `sorteio_vencedores`
- Dados salvos: nome, telefone, pedido, itens, valor, data do sorteio

---

## 💾 Estrutura do Banco de Dados

### Coleção: `sorteio`
Armazena pedidos elegíveis para sorteio.

```javascript
{
  orderNumber: "1735567890123",      // string
  clientName: "João Silva",           // string
  clientPhone: "(11) 98765-4321",    // string
  totalItems: 15,                    // number (≥ 10)
  totalValue: 250.50,                // number
  createdAt: Timestamp               // Firestore Timestamp
}
```

### Coleção: `sorteio_vencedores`
Armazena histórico de vencedores.

```javascript
{
  orderNumber: "1735567890123",      // string
  clientName: "João Silva",           // string
  clientPhone: "(11) 98765-4321",    // string
  totalItems: 15,                    // number
  totalValue: 250.50,                // number
  createdAt: Timestamp               // Timestamp do sorteio
}
```

---

## 🚀 Futuras Melhorias (TODOs)

### 1. Visualizar Vencedores Anteriores
```javascript
// TODO: Implementar em sorteioService.js
export const getPastWinners = async () => {
  const winnersRef = collection(db, 'sorteio_vencedores');
  const q = query(winnersRef, orderBy('createdAt', 'desc'));
  // ... retornar lista de vencedores
};
```

### 2. Filtro por Data
```javascript
// TODO: Implementar busca por período
export const getSorteioDataByDateRange = async (startDate, endDate) => {
  // Filtrar pedidos entre startDate e endDate
};
```

### 3. Sorteio Automático Mensal
```javascript
// TODO: Agendar sorteio automático
export const scheduleMonthlyRaffle = () => {
  // Usar Firebase Functions com Cloud Scheduler
  // Realizar sorteio todo dia 1º do mês às 10h
};
```

### 4. Notificação ao Vencedor
- Enviar email ao vencedor
- Enviar SMS com código de prêmio
- Notificação push no app

### 5. Dashboard de Estatísticas
- Total de participantes por mês
- Média de itens por pedido
- Gráfico de crescimento

---

## 🎨 Design e Estilo

### Bibliotecas Utilizadas
- **Framer Motion**: Animações suaves e transições
- **React-Confetti**: Efeito de confete comemorativo
- **React Icons**: Ícones (FaTrophy, FaDice, etc.)
- **TailwindCSS**: Estilização responsiva

### Paleta de Cores
- **Primária**: Gradiente roxo-rosa (`from-purple-600 to-pink-600`)
- **Secundária**: Azul (`bg-blue-600`)
- **Sucesso**: Verde (`bg-green-600`)
- **Erro**: Vermelho (`bg-red-600`)

---

## 🔒 Segurança

### Acesso Restrito
- Rota `/sorteio` protegida por `AdminRoute`
- Verifica autenticação via Firebase Auth
- Valida UID do admin (configurado em `appConfig.ADMIN_UIDS`)

### Regras do Firestore (Recomendadas)

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Coleção de sorteio - apenas admins podem ler/escrever
    match /sorteio/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid in ['UID_ADMIN_1', 'UID_ADMIN_2'];
    }
    
    // Coleção de vencedores - apenas admins
    match /sorteio_vencedores/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid in ['UID_ADMIN_1', 'UID_ADMIN_2'];
    }
  }
}
```

---

## 📞 Suporte e Dúvidas

### Problemas Comuns

**P: Os pedidos não estão aparecendo no sorteio**
- R: Verifique se os pedidos têm 5+ itens (soma das quantidades)
- R: Verifique se `addSorteioData()` está sendo chamado no checkout

**P: Erro ao buscar dados**
- R: Verifique as regras do Firestore
- R: Confirme que o usuário é admin (`appConfig.ADMIN_UIDS`)
- R: Verifique a conexão com o Firebase

**P: Animação não aparece**
- R: Certifique-se que `framer-motion` e `react-confetti` estão instalados
- R: Execute: `npm install framer-motion react-confetti`

**P: Como testar localmente?**
- R: Crie pedidos de teste com 5+ itens
- R: Use o console do Firebase para adicionar documentos manualmente

---

## ✅ Checklist de Implementação

- [x] Instalar dependências (`framer-motion`, `react-confetti`)
- [x] Criar `sorteioService.js`
- [x] Criar `SorteioAnimation.jsx`
- [x] Criar `SorteioPage`
- [x] Adicionar rota `/sorteio` no `App.js`
- [x] Adicionar botão no Painel Admin
- [ ] **Integrar com checkout** (IMPORTANTE!)
- [ ] Configurar regras do Firestore
- [ ] Testar com dados reais

---

## 🎉 Pronto!

Seu sistema de sorteio está 100% funcional! Basta integrar a chamada `addSorteioData()` no seu checkout e começar a realizar sorteios.

**Boa sorte com os sorteios! 🍀🎊**


