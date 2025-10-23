# 🚀 Instruções de Instalação e Uso

## 📋 Pré-requisitos

- **Node.js** versão 14 ou superior
- **npm** (vem com Node.js)

## 🔧 Instalação Rápida

### Passo 1: Instalar dependências

Abra o terminal/prompt de comando na pasta `chat-server` e execute:

```bash
npm install
```

Isso irá instalar:
- `express` - Framework web
- `socket.io` - WebSocket em tempo real
- `cors` - Permitir requisições de qualquer origem

### Passo 2: Iniciar o servidor

```bash
npm start
```

Você verá algo assim:

```
╔════════════════════════════════════════════╗
║   🚀 SERVIDOR DE CHAT EM TEMPO REAL       ║
║                                            ║
║   📡 Socket.IO ativo                       ║
║   🌐 Servidor rodando na porta 3000        ║
║   ✅ CORS habilitado para todas origens    ║
║                                            ║
║   Acesse: http://localhost:3000            ║
╚════════════════════════════════════════════╝
```

### Passo 3: Abrir no navegador

Abra **http://localhost:3000** no seu navegador favorito!

## 👥 Testar Múltiplos Usuários

1. Abra **2 ou mais abas** do navegador
2. Em cada aba, acesse `http://localhost:3000`
3. Clique no botão **"💬 Falar com Suporte"**
4. Digite mensagens - elas aparecerão **em tempo real** em todas as abas!

## 👨‍💼 Entrar como Atendente

Para simular um atendente de suporte:

```
http://localhost:3000?support=true
```

Suas mensagens aparecerão com o nome **"👨‍💼 Suporte"**

## 🎨 Funcionalidades

### ✅ O que funciona:

- [x] Mensagens em tempo real
- [x] Indicador de "alguém está digitando..."
- [x] Contagem de usuários online
- [x] Botão flutuante com animações
- [x] Chat popup moderno
- [x] Cores diferentes para cliente/suporte
- [x] Som de notificação
- [x] Histórico temporário (últimas 100 mensagens)
- [x] Scroll automático
- [x] Responsivo (funciona em mobile)
- [x] Escape de HTML (segurança contra XSS)

### ⚠️ Limitações (por design):

- Sem autenticação de usuários
- Sem banco de dados (tudo em memória)
- Histórico apaga ao reiniciar servidor
- Não há salas privadas
- Todos veem todas as mensagens

## 🔍 API de Status

Você pode checar o status do servidor acessando:

```
GET http://localhost:3000/api/status
```

Retorna:

```json
{
  "status": "online",
  "onlineUsers": 3,
  "totalMessages": 15,
  "serverTime": "2025-10-23T10:30:00.000Z"
}
```

## 🛑 Parar o Servidor

No terminal onde o servidor está rodando, pressione:

```
Ctrl + C
```

## 🔄 Desenvolvimento com Auto-Reload

Se você quiser editar o código e ver as mudanças automaticamente:

```bash
npm run dev
```

Isso usa o `nodemon` que reinicia o servidor a cada alteração.

## 📱 Testar em Celular

1. Descubra o IP da sua máquina:
   - Windows: `ipconfig` no CMD
   - Mac/Linux: `ifconfig` no terminal
   - Procure por algo como `192.168.x.x`

2. No celular, acesse:
   ```
   http://[SEU_IP]:3000
   ```
   Exemplo: `http://192.168.1.100:3000`

3. Certifique-se de que o celular está na **mesma rede Wi-Fi**

## 🎯 Cenários de Teste

### Cenário 1: Cliente + Atendente

**Aba 1 (Cliente):**
```
http://localhost:3000
```

**Aba 2 (Atendente):**
```
http://localhost:3000?support=true
```

### Cenário 2: Múltiplos Clientes

Abra 3+ abas normais e simule vários clientes conversando ao mesmo tempo!

## 🐛 Solução de Problemas

### Erro: "Port 3000 already in use"

A porta 3000 já está ocupada. Opções:

1. **Mudar a porta:**
   ```bash
   PORT=3001 npm start
   ```

2. **Ou parar o que está usando a porta 3000:**
   - Windows: `netstat -ano | findstr :3000`
   - Mac/Linux: `lsof -i :3000`

### Chat não conecta

1. Verifique se o servidor está rodando
2. Abra o Console do navegador (F12) e procure por erros
3. Confirme que está acessando `http://localhost:3000`

### Mensagens não aparecem

1. Verifique o console do navegador (F12)
2. Veja se há erros de conexão WebSocket
3. Tente recarregar a página

## 📚 Próximos Passos

Depois de testar localmente, você pode:

1. **Integrar ao React** - Usar os componentes no seu app
2. **Adicionar banco de dados** - MongoDB ou PostgreSQL
3. **Deploy na nuvem** - Heroku, Vercel, Railway
4. **Adicionar autenticação** - Login de usuários
5. **Criar salas privadas** - Chats 1-a-1

## 💡 Dicas

- Use **Ctrl + Shift + I** para abrir DevTools e ver logs
- O username é gerado automaticamente (ex: "RápidoComprador123")
- O histórico mantém as últimas 100 mensagens em memória
- Ao recarregar a página, você verá o histórico das mensagens anteriores

## 🎉 Pronto!

Agora você tem um chat em tempo real funcionando!

Qualquer dúvida, consulte o **README.md** para mais detalhes técnicos.

---

**Desenvolvido com ❤️ para Supermercado Online Lajinha**

