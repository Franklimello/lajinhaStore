# 🚀 Deploy no Fly.io - Chat em Tempo Real

## ⭐ Por que Fly.io é Melhor?

✅ **Não dorme!** (diferente do Render)  
✅ **WebSocket sempre ativo** (perfeito para chat)  
✅ **Servidor em São Paulo, Brasil** (GRU - baixa latência!)  
✅ **GRÁTIS** até 3 máquinas  
✅ **Deploy rápido** (1-2 minutos)  
✅ **HTTPS automático**  

---

## 📋 PASSO 1: Instalar Fly CLI

### Windows (PowerShell como Administrador):

```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

### Ou baixe manualmente:
https://fly.io/docs/hands-on/install-flyctl/

### Verificar instalação:
```bash
fly version
```

---

## 📋 PASSO 2: Criar Conta e Fazer Login

### 2.1 - Criar conta:
```bash
fly auth signup
```

Ou entre no site: **https://fly.io/app/sign-up**

### 2.2 - Login:
```bash
fly auth login
```

Vai abrir o navegador para você fazer login.

### 2.3 - Adicionar cartão (necessário, mas não cobra):
- Fly.io pede cartão para verificação
- **Plano FREE é realmente grátis** até 3 máquinas
- Não vai cobrar nada se ficar no limite free

---

## 📋 PASSO 3: Deploy do Chat

### 3.1 - Ir para a pasta do chat:
```bash
cd "c:\Users\Pichau\Desktop\projeto web e mobile\ecoomerce\chat-server"
```

### 3.2 - Inicializar app no Fly.io:
```bash
fly launch
```

**Responda assim:**

```
? Choose an app name: chat-lajinha
  (ou deixe em branco para gerar automaticamente)

? Choose a region: gru (São Paulo, Brazil)
  ⭐ ESCOLHA GRU - Mais próximo do Brasil!

? Would you like to set up a Postgresql database? No

? Would you like to set up an Upstash Redis database? No

? Would you like to deploy now? No
  (vamos configurar antes)
```

### 3.3 - Editar fly.toml (já está configurado!):

O arquivo `fly.toml` já está pronto com as configurações ideais:
- ✅ Região: São Paulo (GRU)
- ✅ Auto-stop: DESABILITADO (não dorme!)
- ✅ Health check configurado
- ✅ Porta 8080

### 3.4 - Deploy!
```bash
fly deploy
```

Aguarde 1-2 minutos... ☕

---

## 📋 PASSO 4: Pegar a URL

Após o deploy, você verá algo como:

```
Visit your newly deployed app at https://chat-lajinha.fly.dev
```

**COPIE ESSA URL!** 📋

### Testar:
```
https://chat-lajinha.fly.dev/api/status
```

Deve retornar:
```json
{
  "status": "online",
  "onlineUsers": 0,
  "totalMessages": 0
}
```

---

## 📋 PASSO 5: Atualizar App React

### 5.1 - Editar .env:

No arquivo `ecoomerce/.env`:

```env
# Chat Server
REACT_APP_CHAT_SERVER_URL=https://chat-lajinha.fly.dev
```

**⚠️ Substitua pelo seu nome de app!**

### 5.2 - Testar localmente:
```bash
cd ../
npm start
```

Clique no botão de chat e veja se conecta!

---

## 📋 PASSO 6: Deploy no Firebase

```bash
npm run build
firebase deploy --only hosting
```

---

## 🎉 PRONTO!

Seu chat está rodando 24/7 no Fly.io em São Paulo! 🇧🇷🚀

---

## 🔧 Comandos Úteis

### Ver logs em tempo real:
```bash
fly logs
```

### Ver status do app:
```bash
fly status
```

### Abrir dashboard:
```bash
fly dashboard
```

### Ver informações do app:
```bash
fly info
```

### Reiniciar o app:
```bash
fly apps restart chat-lajinha
```

### SSH no servidor (debug):
```bash
fly ssh console
```

---

## 📊 Monitoramento

### Dashboard Web:
https://fly.io/dashboard

Lá você pode ver:
- ✅ Status do servidor
- ✅ Logs em tempo real
- ✅ Métricas de uso
- ✅ Região e latência

---

## 💰 Plano FREE - Limites

✅ **3 máquinas compartilhadas** (você usa só 1)  
✅ **160 GB de tráfego/mês** (muito para um chat!)  
✅ **256 MB RAM por máquina** (suficiente)  
✅ **3 GB armazenamento persistente**  

**Seu chat cabe tranquilamente no plano FREE!** 🎉

---

## 🌍 Regiões Disponíveis

Se quiser mudar depois:

```bash
fly regions list
```

Regiões próximas do Brasil:
- **gru** - São Paulo (⭐ MELHOR!)
- **gig** - Rio de Janeiro
- **eze** - Buenos Aires
- **scl** - Santiago

Para adicionar/mudar região:
```bash
fly regions add gru
fly regions set gru
```

---

## 🐛 Troubleshooting

### Deploy falhou:

1. Veja os logs:
```bash
fly logs
```

2. Verifique se `package.json` está correto

3. Tente novamente:
```bash
fly deploy --force
```

### Chat não conecta:

1. Veja se o app está rodando:
```bash
fly status
```

2. Teste a URL diretamente:
```bash
curl https://SUA-URL.fly.dev/api/status
```

3. Veja logs:
```bash
fly logs -a chat-lajinha
```

### CORS error:

- Já está configurado no `server.js`
- Se persistir, adicione sua URL Firebase manualmente

---

## 🔄 Atualizar o Chat

Quando fizer mudanças no código:

```bash
cd chat-server
fly deploy
```

Simples assim! 🚀

---

## 🆘 Precisa de Ajuda?

- **Documentação:** https://fly.io/docs
- **Community:** https://community.fly.io
- **Status:** https://status.fly.io

---

## 🎯 Resumo Rápido

```bash
# 1. Instalar Fly CLI
iwr https://fly.io/install.ps1 -useb | iex

# 2. Login
fly auth login

# 3. Ir para pasta do chat
cd chat-server

# 4. Lançar app
fly launch
# Escolha: gru (São Paulo)

# 5. Deploy
fly deploy

# 6. Copiar URL e colocar no .env
REACT_APP_CHAT_SERVER_URL=https://SEU-APP.fly.dev

# 7. Build e deploy React
npm run build
firebase deploy --only hosting

# ✅ Funciona!
```

---

**Boa sorte com o deploy! 🚀🇧🇷**

