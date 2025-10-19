# 🚀 Comandos de Deploy - Firebase Functions

## 📋 Sequência Completa de Deploy

### 1. **Configuração Inicial**
```bash
# Fazer login no Firebase
firebase login

# Verificar projeto atual
firebase projects:list

# Definir projeto (se necessário)
firebase use seu-projeto-id
```

### 2. **Configurar Variáveis de Ambiente**
```bash
# Configurar API key da Resend
firebase functions:config:set resend.key="re_1234567890abcdef"

# Configurar e-mail de destino (opcional)
firebase functions:config:set resend.destination="frank.melo.wal@gmail.com"

# Verificar configurações
firebase functions:config:get
```

### 3. **Instalar Dependências**
```bash
cd functions
npm install
```

### 4. **Testar Localmente (Opcional)**
```bash
# Iniciar emulador local
firebase emulators:start --only functions

# Em outro terminal, testar a função
curl -X POST http://localhost:5001/seu-projeto/us-central1/enviarEmail \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"teste@teste.com","mensagem":"Teste local"}'
```

### 5. **Deploy da Função**
```bash
# Deploy completo (todas as funções)
firebase deploy --only functions

# Deploy de função específica
firebase deploy --only functions:enviarEmail

# Deploy com logs em tempo real
firebase deploy --only functions --debug
```

### 6. **Verificar Deploy**
```bash
# Listar funções deployadas
firebase functions:list

# Ver logs da função
firebase functions:log --only enviarEmail

# Testar função deployada
curl -X POST https://us-central1-seu-projeto.cloudfunctions.net/enviarEmail \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"teste@teste.com","mensagem":"Teste de produção"}'
```

## 🔧 Comandos de Gerenciamento

### **Verificar Status**
```bash
# Status do projeto
firebase projects:list

# Status das funções
firebase functions:list

# Logs em tempo real
firebase functions:log --follow
```

### **Gerenciar Configurações**
```bash
# Ver todas as configurações
firebase functions:config:get

# Ver configuração específica
firebase functions:config:get resend

# Deletar configuração
firebase functions:config:unset resend.destination

# Deletar todas as configurações
firebase functions:config:unset
```

### **Gerenciar Funções**
```bash
# Deletar função específica
firebase functions:delete enviarEmail

# Deletar múltiplas funções
firebase functions:delete enviarEmail test

# Forçar deploy (ignora cache)
firebase deploy --only functions --force
```

## 🐛 Troubleshooting

### **Erro: "Function failed to load"**
```bash
# Verificar logs detalhados
firebase functions:log --only enviarEmail --limit 50

# Verificar configurações
firebase functions:config:get

# Reinstalar dependências
cd functions
rm -rf node_modules package-lock.json
npm install
```

### **Erro: "Permission denied"**
```bash
# Verificar permissões do projeto
firebase projects:list

# Fazer login novamente
firebase logout
firebase login
```

### **Erro: "Config not found"**
```bash
# Reconfigurar variáveis
firebase functions:config:set resend.key="sua-nova-chave"
```

## 📊 Monitoramento Pós-Deploy

### **Verificar Logs**
```bash
# Logs gerais
firebase functions:log

# Logs de função específica
firebase functions:log --only enviarEmail

# Logs com filtro de erro
firebase functions:log --only enviarEmail | grep ERROR
```

### **Testar Endpoints**
```bash
# Teste básico
curl https://us-central1-seu-projeto.cloudfunctions.net/test

# Teste de envio
curl -X POST https://us-central1-seu-projeto.cloudfunctions.net/enviarEmail \
  -H "Content-Type: application/json" \
  -d '{"nome":"João","email":"joao@teste.com","mensagem":"Teste"}'
```

## 🔄 Atualizações e Manutenção

### **Atualizar Função**
```bash
# Fazer alterações no código
# Depois fazer deploy
firebase deploy --only functions:enviarEmail
```

### **Rollback (se necessário)**
```bash
# Ver histórico de deploys
firebase functions:log --limit 100

# Não há rollback automático, mas você pode:
# 1. Reverter código
# 2. Fazer novo deploy
firebase deploy --only functions:enviarEmail
```

## 📱 URLs Finais

Após o deploy bem-sucedido, você terá:

- **Função de E-mail**: `https://us-central1-seu-projeto.cloudfunctions.net/enviarEmail`
- **Função de Teste**: `https://us-central1-seu-projeto.cloudfunctions.net/test`

## 🎯 Próximos Passos

1. **Testar a função** com dados reais
2. **Configurar domínio personalizado** (opcional)
3. **Implementar monitoramento** com alertas
4. **Configurar backup** das configurações
5. **Documentar** para a equipe
