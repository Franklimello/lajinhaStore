# 🎛️ Sistema de Controle da Promoção de Sorteio

## ✅ IMPLEMENTADO COM SUCESSO

Sistema completo para gerenciar a promoção de sorteio, permitindo pausar/ativar e limpar participantes.

---

## 🎯 Funcionalidades Implementadas

### 1. **Pausar/Ativar Promoção** ⏸️▶️
- Botão para pausar a promoção
- Quando pausada, **novos pedidos não são salvos** no banco
- Status visual (verde = ativa, cinza = pausada)
- Confirmação antes de alterar status

### 2. **Limpar Participantes** 🗑️
- Botão para **excluir todos os participantes** do banco
- Confirmação de segurança (ação irreversível)
- Atualiza a lista automaticamente após exclusão

### 3. **Atualizar Lista** 🔄
- Botão para recarregar participantes do banco
- Útil após limpar ou após novos pedidos

---

## 📁 Nova Coleção no Firestore

### `sorteio_config`
**Propósito:** Armazena configuração do status da promoção

```javascript
{
  ativa: true,              // boolean - true = ativa, false = pausada
  updatedAt: Timestamp      // última atualização
}
```

---

## 🔧 Funções Adicionadas no `sorteioService.js`

### 1. `isPromocaoAtiva()`
Verifica se a promoção está ativa

```javascript
const ativa = await isPromocaoAtiva();
// Retorna: true ou false
```

### 2. `togglePromocao(ativa)`
Ativa ou pausa a promoção

```javascript
const result = await togglePromocao(true);  // Ativar
const result = await togglePromocao(false); // Pausar

// Retorna:
{
  success: true,
  message: "Promoção ativada com sucesso!",
  ativa: true
}
```

### 3. `limparParticipantes()`
Exclui todos os participantes do banco

```javascript
const result = await limparParticipantes();

// Retorna:
{
  success: true,
  message: "15 participante(s) excluído(s) com sucesso!",
  deletedCount: 15
}
```

---

## 🛡️ Segurança Implementada

### Validação no Checkout
O sistema agora verifica se a promoção está ativa **antes** de salvar:

```javascript
// Em addSorteioData()
const promocaoAtiva = await isPromocaoAtiva();
if (!promocaoAtiva) {
  console.log('⏸️ Promoção pausada - Pedido não será salvo');
  return {
    success: false,
    message: 'Promoção pausada no momento.',
    promocaoPausada: true
  };
}
```

### Confirmações Obrigatórias
- **Pausar promoção:** Confirma ação
- **Limpar participantes:** Dupla confirmação + alerta de irreversibilidade

---

## 🎨 Interface Administrativa

### Nova Seção: "Controles da Promoção"

```
┌─────────────────────────────────────────────────────────┐
│  🎫 Controles da Promoção                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [✅ Promoção Ativa]  [🗑️ Limpar Participantes]  [🔄 Atualizar] │
│                                                         │
│  ✅ Promoção ATIVA - Novos pedidos estão sendo salvos  │
└─────────────────────────────────────────────────────────┘
```

### Botão: "Promoção Ativa" (Verde)
- **Clique:** Pausa a promoção
- **Confirmação:** "Deseja PAUSAR a promoção?"
- **Resultado:** Botão fica cinza "Promoção Pausada"

### Botão: "Promoção Pausada" (Cinza)
- **Clique:** Ativa a promoção
- **Confirmação:** "Deseja ATIVAR a promoção?"
- **Resultado:** Botão fica verde "Promoção Ativa"

### Botão: "Limpar Participantes" (Vermelho)
- **Clique:** Exclui todos os participantes
- **Confirmação:** "⚠️ ATENÇÃO! Esta ação irá EXCLUIR TODOS..."
- **Resultado:** Lista fica vazia, banco limpo

### Botão: "Atualizar Lista" (Azul)
- **Clique:** Recarrega participantes do banco
- **Resultado:** Lista atualizada com dados atuais

---

## 🔄 Fluxos de Uso

### Fluxo 1: Iniciar Nova Promoção
```
1. Admin acessa /sorteio
2. Verifica status: "Promoção Ativa" ✅
3. Pronto! Novos pedidos estão sendo salvos
```

### Fluxo 2: Finalizar Promoção Atual
```
1. Admin clica "Promoção Ativa"
2. Confirma: "Deseja PAUSAR?"
3. Status muda para "Promoção Pausada" ⏸️
4. Novos pedidos param de ser salvos
5. Admin clica "Limpar Participantes"
6. Confirma: "⚠️ ATENÇÃO! EXCLUIR TODOS?"
7. Participantes são excluídos
8. Banco limpo para próxima promoção
```

### Fluxo 3: Realizar Sorteio e Iniciar Nova
```
1. Admin realiza sorteio (vencedor é salvo)
2. Admin clica "Limpar Participantes"
3. Participantes são excluídos
4. Vencedor continua salvo em "sorteio_vencedores"
5. Promoção continua ativa
6. Novos pedidos começam a acumular
```

### Fluxo 4: Pausar Temporariamente
```
1. Admin pausa a promoção
2. Nenhum novo pedido é salvo (mesmo com 10+ itens)
3. Admin resolve problema/prepara novo sorteio
4. Admin ativa novamente
5. Novos pedidos voltam a ser salvos
```

---

## 🧪 Como Testar

### Teste 1: Pausar Promoção
```
1. Acesse /sorteio
2. Veja status: "Promoção Ativa" (verde)
3. Clique no botão verde
4. Confirme: "Deseja PAUSAR?"
5. Botão fica cinza: "Promoção Pausada"
6. Mensagem: "⏸️ Promoção PAUSADA"
7. Faça um pedido com 10+ itens
8. Verifique console: "⏸️ Promoção pausada"
9. Vá para Firestore: pedido NÃO está em "sorteio" ✅
```

### Teste 2: Limpar Participantes
```
1. Acesse /sorteio
2. Clique "Atualizar Lista"
3. Veja participantes na tabela
4. Clique "Limpar Participantes" (vermelho)
5. Confirme: "⚠️ ATENÇÃO! EXCLUIR TODOS?"
6. Aguarde confirmação: "X participante(s) excluído(s)"
7. Tabela fica vazia
8. Vá para Firestore: coleção "sorteio" vazia ✅
```

### Teste 3: Ativar Novamente
```
1. Com promoção pausada (cinza)
2. Clique no botão cinza
3. Confirme: "Deseja ATIVAR?"
4. Botão fica verde: "Promoção Ativa"
5. Mensagem: "✅ Promoção ATIVA"
6. Faça novo pedido com 10+ itens
7. Verifique console: "🎉 Cliente elegível!"
8. Vá para Firestore: pedido está em "sorteio" ✅
```

---

## 📊 Logs do Console

### Quando promoção é pausada:
```
✅ Promoção PAUSADA com sucesso!
⏸️ Promoção pausada - Pedido #PIX123... não será salvo no sorteio
```

### Quando promoção é ativada:
```
✅ Promoção ATIVADA com sucesso!
```

### Quando participantes são limpos:
```
✅ 15 participante(s) excluído(s) com sucesso!
```

### Quando novo pedido chega (promoção ativa):
```
✅ Pedido #PIX123... salvo no sorteio com sucesso! (15 itens)
🎉 Cliente elegível para sorteio!
```

### Quando novo pedido chega (promoção pausada):
```
⏸️ Promoção pausada - Pedido #PIX123... não será salvo no sorteio
⚠️ Pedido não elegível para sorteio (menos de 10 itens)
```

---

## 🎯 Casos de Uso

### Caso 1: Sorteio Mensal
```
Dia 1 do mês:
- Admin limpa participantes do mês anterior
- Promoção continua ativa
- Novos pedidos começam a acumular

Dia 30 do mês:
- Admin realiza sorteio
- Vencedor é salvo
- Admin pode deixar participantes para próximo sorteio
  OU limpar tudo e começar do zero
```

### Caso 2: Problema Técnico
```
Durante a promoção:
- Surge um bug no sistema
- Admin PAUSA a promoção imediatamente
- Resolve o problema
- Admin ATIVA novamente
- Promoção continua normalmente
```

### Caso 3: Término da Campanha
```
Campanha acaba:
- Admin PAUSA a promoção
- Realiza último sorteio
- Limpa participantes
- Deixa pausado até próxima campanha
```

### Caso 4: Múltiplos Sorteios
```
Sorteio semanal:
- Segunda: Limpa participantes
- Segunda-Domingo: Acumula pedidos
- Domingo: Realiza sorteio
- Domingo: Limpa participantes
- Repete ciclo
```

---

## ⚙️ Configurações Recomendadas

### Regras do Firestore

Adicione acesso à nova coleção:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Coleção de config - apenas admins
    match /sorteio_config/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid in ['UID_ADMIN_1', 'UID_ADMIN_2'];
    }
    
    // Coleção de sorteio - apenas admins
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

## 🔒 Segurança

### Proteções Implementadas
- ✅ Apenas admins podem acessar `/sorteio`
- ✅ Verificação de status antes de salvar pedidos
- ✅ Confirmação antes de pausar/ativar
- ✅ Dupla confirmação antes de limpar participantes
- ✅ Alertas visuais claros de status
- ✅ Logs detalhados para auditoria

### Dados Preservados
- ✅ Vencedores anteriores **não são afetados** ao limpar participantes
- ✅ Configuração persiste no banco
- ✅ Status é verificado a cada checkout

---

## 📝 Resumo dos Botões

| Botão | Cor | Função | Confirmação | Reversível |
|-------|-----|--------|-------------|------------|
| **Promoção Ativa** | Verde | Pausar promoção | Sim | Sim |
| **Promoção Pausada** | Cinza | Ativar promoção | Sim | Sim |
| **Limpar Participantes** | Vermelho | Excluir todos | Sim (forte) | ❌ NÃO |
| **Atualizar Lista** | Azul | Recarregar dados | Não | N/A |
| **Sortear Vencedor** | Roxo/Rosa | Realizar sorteio | Não | Sim* |

\* Vencedor pode ser excluído manualmente do Firestore se necessário

---

## ✅ Checklist de Verificação

- [x] Função `isPromocaoAtiva()` implementada
- [x] Função `togglePromocao()` implementada
- [x] Função `limparParticipantes()` implementada
- [x] Verificação de status em `addSorteioData()`
- [x] Botões na interface administrativa
- [x] Status visual (verde/cinza)
- [x] Mensagens de confirmação
- [x] Alertas de status
- [x] Logs no console
- [x] Documentação completa

---

## 🎉 Pronto para Usar!

Agora você tem **controle total** sobre a promoção de sorteio:
- ✅ Pausar quando necessário
- ✅ Limpar participantes entre sorteios
- ✅ Status visual claro
- ✅ Segurança implementada

**Acesse `/sorteio` e teste os novos controles! 🚀**



