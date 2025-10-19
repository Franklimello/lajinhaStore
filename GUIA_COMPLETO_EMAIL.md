# 📧 Guia Completo - Sistema de E-mail

## 🎯 **Status Atual**
✅ Firebase CLI instalado  
✅ Projeto configurado (`compreaqui-324df`)  
✅ Dependências instaladas  
✅ Estrutura da função criada  
✅ Componente React criado  
❌ **Falta**: API key da Resend + Deploy  

## 🚀 **Próximos Passos - Execute na Ordem**

### **1. OBTER API KEY DA RESEND** (CRÍTICO)

#### **A. Criar Conta na Resend**
1. Acesse: https://resend.com
2. Clique em "Get Started" 
3. Crie conta gratuita (até 3.000 e-mails/mês)
4. Confirme seu e-mail

#### **B. Obter API Key**
1. Faça login na Resend
2. Vá em "API Keys" no menu lateral
3. Clique em "Create API Key"
4. Dê um nome: "E-commerce CompreAqui"
5. **COPIE A CHAVE** (formato: `re_xxxxxxxxxx`)

### **2. CONFIGURAR API KEY**
```bash
firebase functions:config:set resend.key="re_SUA_CHAVE_AQUI"
```

### **3. FAZER DEPLOY**
```bash
firebase deploy --only functions
```

### **4. TESTAR A FUNÇÃO**
```bash
# Teste básico
curl https://us-central1-compreaqui-324df.cloudfunctions.net/test

# Teste de envio
curl -X POST https://us-central1-compreaqui-324df.cloudfunctions.net/enviarEmail \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"teste@teste.com","mensagem":"Teste de envio"}'
```

## 📱 **Integração no Frontend**

### **1. Adicionar Rota de Contato**
No seu `App.js`, adicione:
```javascript
import Contato from './pages/Contato';

// Na lista de rotas:
<Route path="/contato" element={<Contato />} />
```

### **2. Adicionar Link no Menu**
No seu header/menu, adicione:
```javascript
<Link to="/contato" className="...">
  📧 Contato
</Link>
```

## 🧪 **Testando o Sistema**

### **1. Teste Manual**
1. Acesse: `http://localhost:3000/contato`
2. Preencha o formulário
3. Clique em "Enviar Mensagem"
4. Verifique se recebeu o e-mail em `frank.melo.wal@gmail.com`

### **2. Verificar Logs**
```bash
firebase functions:log --only enviarEmail
```

## 🔧 **Troubleshooting**

### **Erro: "Function not found"**
- Verifique se o deploy foi feito corretamente
- Execute: `firebase functions:list`

### **Erro: "Invalid API key"**
- Verifique se a API key da Resend está correta
- Execute: `firebase functions:config:get`

### **Erro: "CORS policy"**
- A função já tem CORS configurado
- Teste com Postman primeiro

### **E-mail não chega**
- Verifique a pasta de spam
- Confirme se o domínio está verificado na Resend
- Verifique os logs: `firebase functions:log`

## 📊 **URLs Finais**

Após o deploy bem-sucedido:
- **Função de E-mail**: `https://us-central1-compreaqui-324df.cloudfunctions.net/enviarEmail`
- **Função de Teste**: `https://us-central1-compreaqui-324df.cloudfunctions.net/test`
- **Página de Contato**: `http://localhost:3000/contato`

## 🎉 **Próximos Passos**

1. **Configurar domínio verificado** na Resend (para e-mails não irem para spam)
2. **Adicionar captcha** para evitar spam
3. **Implementar rate limiting** se necessário
4. **Configurar templates** de e-mail personalizados
5. **Adicionar notificações** de novos contatos

## 📞 **Suporte**

Se tiver problemas:
1. Verifique os logs: `firebase functions:log`
2. Teste a função de teste primeiro
3. Confirme se a API key está correta
4. Verifique se o e-mail de destino está correto
