# 🚀 Deploy do Chat no Render

## Passos para Deploy

### 1. Criar conta no Render
- Acesse: https://render.com
- Clique em "Get Started for Free"
- Entre com GitHub, Google ou Email

### 2. Criar um novo Web Service

1. No Dashboard, clique em **"New +"** → **"Web Service"**

2. Conecte seu repositório:
   - Se ainda não conectou o GitHub, clique em "Connect account"
   - Autorize o Render a acessar seus repositórios
   - Selecione o repositório do projeto

3. Configure o serviço:
   
   **Name:** `chat-supermercado-lajinha` (ou outro nome)
   
   **Root Directory:** `ecoomerce/chat-server`
   
   **Environment:** `Node`
   
   **Region:** `Oregon (US West)` ou mais próximo do Brasil
   
   **Branch:** `main` (ou `master`)
   
   **Build Command:** `npm install`
   
   **Start Command:** `npm start`

4. **Plano:** Selecione **"Free"** (0 USD/mês)

5. Clique em **"Create Web Service"**

### 3. Aguardar o Deploy

O Render vai:
- ✅ Clonar seu código
- ✅ Instalar dependências
- ✅ Iniciar o servidor
- ✅ Gerar uma URL pública

URL gerada será algo como:
```
https://chat-supermercado-lajinha.onrender.com
```

### 4. Verificar se está funcionando

Acesse no navegador:
```
https://SEU-APP.onrender.com/api/status
```

Deve retornar:
```json
{
  "status": "online",
  "onlineUsers": 0,
  "totalMessages": 0
}
```

### 5. Atualizar o App React

No seu projeto React, atualize o `.env`:

```env
REACT_APP_CHAT_SERVER_URL=https://SEU-APP.onrender.com
```

### 6. Fazer Deploy do React

```bash
npm run build
firebase deploy --only hosting
```

## ⚠️ Importante sobre o Plano Free

- **Sleeps após 15 minutos de inatividade**
- Primeiro acesso pode demorar 30-50 segundos (cold start)
- Limite de 750 horas/mês (suficiente)
- **Solução:** Usar um serviço de ping (cron-job.org) para manter ativo

## 🔧 Configurações Avançadas

### Variáveis de Ambiente (se necessário)

No painel do Render, vá em:
- **Environment** → **Add Environment Variable**

Exemplo:
```
NODE_ENV=production
PORT=3000
```

### Health Check

O Render usa `/api/status` para verificar se o servidor está online.

### Logs

Para ver logs em tempo real:
- Dashboard → Seu serviço → **Logs**

## 🐛 Troubleshooting

**Erro: "Deploy failed"**
- Verifique os logs
- Certifique-se que `package.json` está correto
- Verifique se `npm install` funciona localmente

**Chat não conecta**
- Verifique se a URL está correta no `.env`
- Verifique CORS no `server.js` (já configurado)
- Veja os logs do navegador (F12)

**Servidor adormece (sleep)**
- Normal no plano free
- Use um serviço de ping: https://cron-job.org
- Configure para fazer GET a cada 10 minutos

## 📞 Suporte

Documentação oficial: https://render.com/docs

