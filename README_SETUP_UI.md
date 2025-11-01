# 🎨 Interface de Configuração Interativa

Uma interface web moderna e intuitiva para configurar o sistema pela primeira vez.

## 🚀 Como Usar

### Acessar a Interface

1. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm start
   ```

2. **Acesse a página de setup:**
   ```
   http://localhost:3000/setup
   ```

### Características

✅ **6 Passos Organizados:**
- 📦 Informações da Loja
- 📞 Contato
- 🔥 Firebase
- 💳 Pagamento PIX
- 👤 Administradores
- 🎨 Temas (Opcional)

✅ **Recursos:**
- ✨ Interface moderna com gradientes e animações
- ✅ Validação em tempo real
- 💾 Auto-salvamento no localStorage
- 📥 Download do arquivo `.env.local`
- 📋 Copiar para área de transferência
- 🔍 Dicas e ajuda contextual
- 📱 Design responsivo

---

## 🎯 Passo a Passo

### Passo 1: Informações da Loja
- Nome da loja (obrigatório)
- Subtítulo
- URL do site
- Descrição para SEO

### Passo 2: Contato
- Telefone de contato (obrigatório)
- WhatsApp (obrigatório, apenas números)
- Endereço (obrigatório)

### Passo 3: Firebase
Preencha todas as credenciais do Firebase:
- Project ID (obrigatório)
- API Key (obrigatória)
- Auth Domain (obrigatório)
- Storage Bucket (obrigatório)
- Messaging Sender ID (obrigatório)
- App ID (obrigatório)
- Measurement ID (opcional)
- VAPID Key (opcional)

### Passo 4: Pagamento PIX
- Chave PIX (obrigatória)
- Cidade (obrigatória)
- Nome do recebedor (obrigatório)

### Passo 5: Administradores
- Admin UID 1 (obrigatório)
- Admin UID 2 (opcional)
- Google Analytics ID (opcional)

### Passo 6: Temas (Opcional)
- Cor primária
- Cor secundária
- Gradiente primário

---

## 💾 Salvando as Configurações

Ao finalizar, você terá duas opções:

### Opção 1: Download do Arquivo
1. Clique em "Baixar arquivo .env.local"
2. O arquivo será baixado automaticamente
3. Coloque o arquivo na raiz do projeto (mesma pasta do `package.json`)
4. Reinicie o servidor (`Ctrl+C` e `npm start`)

### Opção 2: Copiar Manualmente
1. Clique em "Copiar conteúdo"
2. Crie um arquivo `.env.local` na raiz do projeto
3. Cole o conteúdo copiado
4. Salve o arquivo
5. Reinicie o servidor

---

## 🔄 Auto-Salvamento

As configurações são **salvas automaticamente** no `localStorage` do navegador enquanto você preenche. Isso significa que:

- ✅ Você pode fechar a página e voltar depois
- ✅ As configurações serão mantidas
- ✅ Não perde o progresso

Para limpar as configurações salvas:
```javascript
localStorage.removeItem('setupConfig');
```

---

## ✨ Recursos Visuais

### Indicador de Progresso
- Mostra qual passo você está
- Passos completados ficam verdes
- Passo atual fica destacado

### Validação em Tempo Real
- Campos obrigatórios são marcados com *
- Erros aparecem em vermelho abaixo do campo
- Validação ao sair do campo (onBlur)

### Preview de Temas
- Visualize as cores antes de salvar
- Seletor de cor visual
- Input de texto para códigos hex

### Dicas Contextuais
- Ícones de informação em campos importantes
- Textos de ajuda abaixo dos campos
- Alertas informativos em seções complexas

---

## 🎨 Design

A interface foi projetada com:
- **Gradientes modernos** em cada seção
- **Animações suaves** nas transições
- **Cores vibrantes** mas profissionais
- **Layout responsivo** para mobile e desktop
- **Feedback visual** em todas as ações

---

## 🚨 Solução de Problemas

### A página não carrega
- Verifique se o servidor está rodando (`npm start`)
- Limpe o cache do navegador
- Verifique o console para erros

### Configurações não são salvas
- Verifique se o localStorage está habilitado
- Tente em outro navegador
- Verifique o console para erros JavaScript

### Download não funciona
- Verifique as permissões do navefador
- Tente usar "Copiar conteúdo" em vez de download
- Verifique se há bloqueadores de pop-up

---

## 🔐 Segurança

⚠️ **Importante:**
- As configurações são salvas apenas no navegador (localStorage)
- Não são enviadas para nenhum servidor
- O arquivo `.env.local` deve ser adicionado ao `.gitignore`
- Nunca commite credenciais no Git

---

## 📝 Próximas Melhorias

Possíveis melhorias futuras:
- [ ] Validação de conexão Firebase em tempo real
- [ ] Teste de WhatsApp antes de salvar
- [ ] Importar de arquivo .env existente
- [ ] Templates pré-configurados
- [ ] Salvar múltiplas configurações (profiles)

---

**Aproveite a interface moderna e fácil de usar! 🎉**

