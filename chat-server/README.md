# 💬 Sistema de Chat em Tempo Real - Suporte ao Cliente

Sistema completo de chat em tempo real usando **Node.js**, **Express** e **Socket.IO**, sem banco de dados.

## 🚀 Características

✅ **Chat em tempo real** - Mensagens instantâneas entre todos os usuários  
✅ **Sem banco de dados** - Tudo armazenado em memória  
✅ **Interface moderna** - Design profissional e responsivo  
✅ **Botão flutuante** - Popup de chat no canto inferior direito  
✅ **Indicador de digitação** - Veja quando alguém está digitando  
✅ **Contagem de usuários online** - Saiba quantos estão conectados  
✅ **Diferenciação de mensagens** - Cores diferentes para cliente/suporte  
✅ **Notificações visuais e sonoras** - Nunca perca uma mensagem  
✅ **CORS habilitado** - Funciona de qualquer origem  
✅ **Histórico temporário** - Últimas 100 mensagens em memória  

## 📦 Instalação

### 1. Instalar dependências

```bash
cd chat-server
npm install
```

### 2. Iniciar o servidor

```bash
npm start
```

Ou com auto-reload (desenvolvimento):

```bash
npm run dev
```

O servidor estará rodando em: **http://localhost:3000**

## 🎯 Como Usar

### Cliente (Usuário Normal)

1. Abra o navegador em: `http://localhost:3000`
2. Clique no botão **"💬 Falar com Suporte"**
3. Digite sua mensagem e clique em **Enviar**
4. As mensagens aparecerão em **tempo real** para todos conectados

### Atendente (Suporte)

Para entrar como **atendente**, adicione `?support=true` na URL:

```
http://localhost:3000?support=true
```

Suas mensagens aparecerão com identificação de **"👨‍💼 Suporte"**

## 🛠️ Estrutura do Projeto

```
chat-server/
├── server.js          # Servidor Node.js + Socket.IO
├── package.json       # Dependências
├── README.md          # Documentação
└── public/
    ├── index.html     # Interface do chat
    ├── style.css      # Estilos modernos
    └── chat.js        # Lógica do cliente
```

## 🌐 API Endpoints

### GET `/api/status`

Retorna o status do servidor:

```json
{
  "status": "online",
  "onlineUsers": 5,
  "totalMessages": 42,
  "serverTime": "2025-10-23T10:30:00.000Z"
}
```

### POST `/api/clear-history`

Limpa o histórico de mensagens (útil para admin).

## 🎨 Personalização

### Alterar cores

Edite o arquivo `public/style.css` e modifique os gradientes:

```css
/* Botão de chat */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Mensagens do usuário */
.message-user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Mensagens do suporte */
.message-support {
  background: #e5e7eb;
  color: #1f2937;
}
```

### Mudar porta

Edite `server.js`:

```javascript
const PORT = 3000; // Altere para a porta desejada
```

Ou use variável de ambiente:

```bash
PORT=5000 npm start
```

## 🔧 Funcionalidades Técnicas

### Socket.IO Events

**Cliente → Servidor:**
- `chatMessage` - Enviar mensagem
- `typing` - Usuário está digitando
- `stopTyping` - Parou de digitar

**Servidor → Cliente:**
- `chatMessage` - Nova mensagem recebida
- `userCount` - Atualização de usuários online
- `messageHistory` - Histórico ao conectar
- `typing` - Alguém está digitando
- `stopTyping` - Parou de digitar
- `historyCleared` - Histórico foi limpo

### Armazenamento em Memória

- **Histórico**: Últimas 100 mensagens
- **Usuários**: Contagem de conexões ativas
- **Sem persistência**: Dados resetam ao reiniciar servidor

## 📱 Responsivo

O chat é totalmente responsivo e funciona perfeitamente em:

- 💻 Desktop (400px de largura)
- 📱 Mobile (largura total com margens)
- 📲 Tablets (adaptativo)

## 🎭 Demonstração

### Cliente
![Cliente](https://via.placeholder.com/400x600/667eea/ffffff?text=Cliente+Chat)

### Atendente
![Atendente](https://via.placeholder.com/400x600/764ba2/ffffff?text=Atendente+Chat)

## 🔒 Segurança

- ✅ Escape de HTML para prevenir XSS
- ✅ CORS configurado corretamente
- ✅ Validação de mensagens
- ⚠️ **Não use em produção sem autenticação!**

## 🚀 Produção

Para usar em produção, considere:

1. **Adicionar autenticação** (JWT, OAuth, etc)
2. **Usar banco de dados** (MongoDB, PostgreSQL, Redis)
3. **Load balancer** para múltiplas instâncias
4. **HTTPS** obrigatório
5. **Rate limiting** para prevenir spam
6. **Moderação de conteúdo**

## 📝 Licença

MIT - Livre para uso pessoal e comercial

## 💡 Melhorias Futuras

- [ ] Salas de chat separadas
- [ ] Envio de imagens
- [ ] Emojis e reações
- [ ] Histórico persistente
- [ ] Autenticação de usuários
- [ ] Admin panel
- [ ] Notificações push
- [ ] Suporte a vídeo/voz

## 🤝 Suporte

Precisa de ajuda? Abra uma issue ou entre em contato!

---

**Desenvolvido com ❤️ usando Node.js, Express e Socket.IO**

