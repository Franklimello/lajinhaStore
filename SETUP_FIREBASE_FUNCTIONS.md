# 🚀 Firebase Cloud Functions - Setup Completo

## 📋 Pré-requisitos

1. **Node.js** (versão 18 ou superior)
2. **Firebase CLI** instalado globalmente
3. **Conta Firebase** configurada
4. **Conta Resend** com API key

## 🛠️ Configuração Inicial

### 1. Instalar Firebase CLI (se não tiver)
```bash
npm install -g firebase-tools
```

### 2. Fazer login no Firebase
```bash
firebase login
```

### 3. Inicializar projeto Firebase (se não tiver)
```bash
firebase init functions
```

### 4. Instalar dependências
```bash
cd functions
npm install
```

## 🔑 Configuração das Variáveis de Ambiente

### 1. Configurar API Key da Resend
```bash
firebase functions:config:set resend.key="re_1234567890abcdef"
```

### 2. Configurar e-mail de destino (opcional)
```bash
firebase functions:config:set resend.destination="frank.melo.wal@gmail.com"
```

### 3. Verificar configurações
```bash
firebase functions:config:get
```

## 🚀 Deploy da Função

### 1. Deploy completo
```bash
firebase deploy --only functions
```

### 2. Deploy de função específica
```bash
firebase deploy --only functions:enviarEmail
```

### 3. Verificar logs
```bash
firebase functions:log
```

## 📡 URLs das Funções

Após o deploy, você terá URLs como:
- **Enviar E-mail**: `https://us-central1-seu-projeto.cloudfunctions.net/enviarEmail`
- **Teste**: `https://us-central1-seu-projeto.cloudfunctions.net/test`

## 🧪 Testando a Função

### 1. Teste básico (GET)
```bash
curl https://us-central1-seu-projeto.cloudfunctions.net/test
```

### 2. Teste de envio de e-mail (POST)
```bash
curl -X POST https://us-central1-seu-projeto.cloudfunctions.net/enviarEmail \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "mensagem": "Teste de envio de e-mail via API"
  }'
```

## 🔧 Comandos Úteis

### Desenvolvimento Local
```bash
# Iniciar emulador
firebase emulators:start --only functions

# Testar localmente
curl -X POST http://localhost:5001/seu-projeto/us-central1/enviarEmail \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"teste@teste.com","mensagem":"Teste local"}'
```

### Gerenciamento
```bash
# Ver logs em tempo real
firebase functions:log --follow

# Deletar função
firebase functions:delete enviarEmail

# Listar funções
firebase functions:list
```

## 🛡️ Segurança

### 1. Configurar CORS (se necessário)
A função já inclui CORS básico, mas você pode restringir:

```javascript
res.set('Access-Control-Allow-Origin', 'https://seudominio.com');
```

### 2. Rate Limiting
Para implementar rate limiting, adicione validação de IP ou token.

### 3. Validação de Domínio
Adicione validação para aceitar apenas requisições do seu domínio.

## 📊 Monitoramento

### 1. Firebase Console
- Acesse: https://console.firebase.google.com
- Vá em "Functions" para ver logs e métricas

### 2. Logs Detalhados
```bash
firebase functions:log --only enviarEmail
```

## 🚨 Troubleshooting

### Erro: "Function failed to load"
- Verifique se todas as dependências estão instaladas
- Confirme se a API key está configurada corretamente

### Erro: "CORS policy"
- Verifique se o domínio está configurado corretamente
- Teste com Postman ou curl primeiro

### Erro: "Resend API"
- Confirme se a API key da Resend está válida
- Verifique se o domínio está verificado na Resend

## 📝 Próximos Passos

1. **Configurar domínio verificado** na Resend
2. **Implementar rate limiting** se necessário
3. **Adicionar logs estruturados** para monitoramento
4. **Configurar alertas** para falhas de envio
5. **Implementar retry logic** para falhas temporárias
