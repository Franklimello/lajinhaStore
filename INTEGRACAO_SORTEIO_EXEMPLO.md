# 🎯 Exemplo de Integração do Sistema de Sorteio

## 📍 Localização da Integração

O sistema de sorteio deve ser integrado no arquivo:
**`src/components/PixPayment/index.js`**

Especificamente na função `generatePixPayload()`, após o salvamento bem-sucedido do pedido no Firestore.

---

## 🔧 Passo a Passo da Integração

### 1. Importar o Serviço de Sorteio

No início do arquivo `src/components/PixPayment/index.js`, adicione o import:

```javascript
import { addSorteioData } from '../../services/sorteioService';
```

Ficará assim:

```javascript
import React, { useState, useContext, useEffect } from 'react';
import QRCode from 'qrcode';
import { CartContext } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { appConfig } from '../../config/appConfig';
import { addSorteioData } from '../../services/sorteioService'; // ✅ ADICIONAR ESTA LINHA
```

---

### 2. Modificar a Função `generatePixPayload`

Localize a linha 263 onde o pedido é salvo:

```javascript
const orderResult = await saveOrderToFirestore(orderData);
```

Logo após essa linha, adicione a integração do sorteio:

```javascript
const orderResult = await saveOrderToFirestore(orderData);

// 🎉 INTEGRAÇÃO DO SISTEMA DE SORTEIO
if (orderResult.success) {
  // Calcular total de itens (soma das quantidades)
  const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  // Preparar dados para o sorteio
  const sorteioData = {
    orderNumber: newOrderId,                    // Número do pedido gerado
    clientName: clientName.trim(),              // Nome do cliente
    clientPhone: clientPhone.trim(),            // Telefone do cliente
    totalItems: totalItems,                     // Total de itens (soma das quantidades)
    totalValue: total                           // Valor total do pedido
  };

  // Tentar adicionar ao sorteio (só salva se totalItems >= 10)
  try {
    const sorteioResult = await addSorteioData(sorteioData);
    
    if (sorteioResult.eligible) {
      console.log('🎉 Cliente elegível para sorteio!', sorteioResult);
      // Opcional: mostrar mensagem ao cliente
      // showToast('🎉 Você está participando do nosso sorteio!', 'success');
    } else {
      console.log('⚠️ Pedido não elegível para sorteio (menos de 10 itens)');
    }
  } catch (sorteioError) {
    console.error('❌ Erro ao adicionar ao sorteio:', sorteioError);
    // Não interrompe o fluxo - o pedido já foi salvo com sucesso
  }

  // Continua o fluxo normal...
  if (paymentMethod === 'pix') {
    showToast('✅ Pedido criado! QR Code gerado com sucesso!', 'success');
  } else {
    showToast('✅ Pedido criado! Pagamento será feito na entrega em dinheiro.', 'success');
  }
} else {
  showToast('⚠️ Erro ao criar pedido: ' + orderResult.error, 'error');
}
```

---

## 📄 Código Completo da Seção Modificada

```javascript
// Linha ~260 em src/components/PixPayment/index.js

console.log('Dados do pedido:', orderData);
console.log('Usuário UID:', user.uid);

const orderResult = await saveOrderToFirestore(orderData);

// 🎉 INTEGRAÇÃO DO SISTEMA DE SORTEIO - INÍCIO
if (orderResult.success) {
  // Calcular total de itens (soma das quantidades)
  const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  // Preparar dados para o sorteio
  const sorteioData = {
    orderNumber: newOrderId,
    clientName: clientName.trim(),
    clientPhone: clientPhone.trim(),
    totalItems: totalItems,
    totalValue: total
  };

  // Tentar adicionar ao sorteio
  try {
    const sorteioResult = await addSorteioData(sorteioData);
    
    if (sorteioResult.eligible) {
      console.log('🎉 Cliente elegível para sorteio!', sorteioResult);
      // Opcional: Mostrar mensagem ao cliente que ele está participando
      // showToast('🎉 Parabéns! Você está participando do nosso sorteio!', 'success');
    } else {
      console.log('⚠️ Pedido não elegível para sorteio (menos de 10 itens)');
    }
  } catch (sorteioError) {
    console.error('❌ Erro ao adicionar ao sorteio:', sorteioError);
    // Não interrompe o fluxo - o pedido já foi salvo com sucesso
  }
  // 🎉 INTEGRAÇÃO DO SISTEMA DE SORTEIO - FIM

  if (paymentMethod === 'pix') {
    showToast('✅ Pedido criado! QR Code gerado com sucesso!', 'success');
  } else {
    showToast('✅ Pedido criado! Pagamento será feito na entrega em dinheiro.', 'success');
  }
} else {
  showToast('⚠️ Erro ao criar pedido: ' + orderResult.error, 'error');
}
```

---

## ✅ Verificação Final

Após a integração, certifique-se de:

1. **Importar o serviço**: `import { addSorteioData } from '../../services/sorteioService';`
2. **Calcular totalItems**: Somar as quantidades, não contar tipos de produtos
3. **Chamar após sucesso**: Só chamar `addSorteioData` se `orderResult.success` for `true`
4. **Try-catch**: Envolver em try-catch para não quebrar o fluxo se houver erro
5. **Logs**: Manter logs para debugging (podem ser removidos em produção)

---

## 🧪 Testando a Integração

### Teste 1: Pedido NÃO Elegível
1. Adicione 5 produtos ao carrinho (5 unidades no total)
2. Finalize o pedido
3. Console deve mostrar: `"⚠️ Pedido não elegível para sorteio (menos de 10 itens)"`
4. Banco de dados **NÃO** deve ter registro na coleção `sorteio`

### Teste 2: Pedido Elegível
1. Adicione 10 produtos ao carrinho (10 unidades no total)
2. Finalize o pedido
3. Console deve mostrar: `"🎉 Cliente elegível para sorteio!"`
4. Banco de dados **DEVE** ter registro na coleção `sorteio` com os dados do cliente

### Teste 3: Verificar no Painel Admin
1. Faça login como admin
2. Acesse `/painel` e clique no botão "Sorteio"
3. Clique em "Buscar Dados"
4. O pedido de teste deve aparecer na tabela
5. Clique em "Sortear Vencedor" para testar a animação

---

## 🎨 Mensagem Opcional ao Cliente

Se quiser informar ao cliente que ele está participando do sorteio, descomente esta linha:

```javascript
if (sorteioResult.eligible) {
  console.log('🎉 Cliente elegível para sorteio!', sorteioResult);
  showToast('🎉 Parabéns! Você está participando do nosso sorteio!', 'success'); // ✅ Descomentar
}
```

Isso exibirá um toast de sucesso informando o cliente.

---

## ⚠️ Pontos de Atenção

### 1. Cálculo de Total de Itens
**CORRETO:**
```javascript
const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
// Exemplo: 5 maçãs + 3 bananas + 2 pães = 10 itens ✅
```

**ERRADO:**
```javascript
const totalItems = cart.length; // Conta tipos de produtos, não quantidades ❌
```

### 2. Não Quebrar o Fluxo
O try-catch garante que, mesmo se houver erro no sorteio, o pedido continua sendo processado normalmente:

```javascript
try {
  await addSorteioData(sorteioData);
} catch (sorteioError) {
  console.error('❌ Erro ao adicionar ao sorteio:', sorteioError);
  // Não faz nada - o pedido já foi salvo com sucesso
}
```

### 3. Validação de Dados
O serviço `addSorteioData` já valida:
- Se os campos obrigatórios estão preenchidos
- Se `totalItems >= 10`
- Se houve erro ao salvar no Firestore

---

## 🔍 Debug e Logs

Para verificar se está funcionando, observe os logs no console:

### Logs de Sucesso (10+ itens):
```
✅ Pedido #PIX1735567890 salvo no sorteio com sucesso! (15 itens)
🎉 Cliente elegível para sorteio!
```

### Logs quando NÃO é elegível (< 10 itens):
```
⚠️ Pedido #PIX1735567891 não elegível para sorteio (5 itens - mínimo 10)
⚠️ Pedido não elegível para sorteio (menos de 10 itens)
```

### Logs de Erro:
```
❌ Erro ao salvar dados do sorteio: [mensagem de erro]
❌ Erro ao adicionar ao sorteio: [detalhes]
```

---

## 📊 Estrutura de Dados Salvos

Quando um pedido é elegível, o seguinte documento é salvo em `sorteio`:

```javascript
{
  orderNumber: "PIX17355678901234ABCDE",
  clientName: "João Silva",
  clientPhone: "(11) 98765-4321",
  totalItems: 15,
  totalValue: 250.50,
  createdAt: Timestamp (data/hora da compra)
}
```

---

## 🚀 Pronto!

Com essas modificações, seu sistema de sorteio estará 100% integrado e funcionando automaticamente para todos os pedidos com 10+ itens!

**Boa sorte com os sorteios! 🎉🍀**

