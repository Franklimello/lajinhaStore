# 🛠️ Guia de Configuração para Clientes - Você Faz Tudo

Este guia é para **VOCÊ** configurar o sistema completo para cada cliente antes de entregar.

---

## 🎯 Processo Rápido

### 1. Copiar Template para Novo Cliente

```bash
# Na pasta do seu projeto
cp -r sistema-template cliente-[nome]
# ou Windows PowerShell:
Copy-Item -Path sistema-template -Destination cliente-[nome] -Recurse

# Exemplo:
cp -r sistema-template supermercado-xyz
```

### 2. Acessar Setup Web

```bash
cd cliente-[nome]
npm install
npm start
```

Acesse: `http://localhost:3000/setup`

### 3. Preencher Dados do Cliente

No setup web, preencha:

#### Passo 1: Informações da Loja
- ✅ Nome da loja
- ✅ Subtítulo
- ✅ URL do site (deixar em branco por enquanto, atualizar depois do deploy)
- ✅ Descrição (SEO)
- ✅ Horários de atendimento

#### Passo 2: Contato
- ✅ Telefone do cliente
- ✅ WhatsApp do cliente (formato: 5519999999999)
- ✅ Endereço do cliente

#### Passo 3: Firebase
**⚠️ IMPORTANTE: Criar Firebase NOVO para cada cliente**

1. Abrir Firebase Console: https://console.firebase.google.com/
2. Criar novo projeto com nome do cliente
3. Adicionar app Web
4. Copiar todas as credenciais
5. Habilitar Authentication (Email/Password)
6. Criar Firestore Database
7. Habilitar Storage
8. Criar usuário admin e copiar UID

Preencher no setup:
- ✅ Project ID
- ✅ API Key
- ✅ Auth Domain
- ✅ Storage Bucket
- ✅ Messaging Sender ID
- ✅ App ID
- ✅ Measurement ID (opcional)
- ✅ VAPID Key (opcional)

#### Passo 4: PIX
- ✅ Chave PIX do cliente
- ✅ Cidade (MAIÚSCULAS)
- ✅ Nome do recebedor

#### Passo 5: Administradores
- ✅ Admin UID 1 (do usuário criado no Firebase)
- ✅ Admin UID 2 (opcional)
- ✅ Google Analytics ID (opcional)

#### Passo 6: Temas (Opcional)
- ✅ Cores personalizadas (se o cliente quiser)

### 4. Baixar .env.local

No setup, clique em **"Download .env.local"** ou **"Copiar"** e salve como `.env.local` na pasta do projeto.

### 5. Substituir Logos

Substituir arquivos na pasta `public/`:

```bash
# Logos do cliente
public/logo192.png     # 192x192 pixels
public/logo512.png     # 512x512 pixels
public/favicon.ico     # 32x32 pixels (ou 16x16)
```

**Dica:** Use um editor online (como https://www.iloveimg.com/resize-image) para redimensionar.

### 6. Configurar Firestore Rules

No Firebase Console do cliente:

1. Ir em **Firestore Database** → **Regras**
2. Cole as regras (substituindo o UID do admin):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Produtos: todos podem ler, apenas admins podem escrever
    match /produtos/{produtoId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid in ['UID_DO_ADMIN_AQUI'];
    }
    
    // Pedidos: usuários veem seus próprios pedidos
    match /pedidos/{pedidoId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.uid in ['UID_DO_ADMIN_AQUI']);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid in ['UID_DO_ADMIN_AQUI'];
    }
    
    // Outras coleções...
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid in ['UID_DO_ADMIN_AQUI'];
    }
  }
}
```

**Substituir:** `'UID_DO_ADMIN_AQUI'` pelo UID real do admin do cliente.

### 7. Testar Localmente

```bash
# Parar o servidor (Ctrl+C)
# Reiniciar
npm start
```

**Testar:**
- [ ] Login como admin funciona
- [ ] Criar produto funciona
- [ ] Adicionar ao carrinho funciona
- [ ] Checkout funciona
- [ ] WhatsApp redireciona corretamente
- [ ] Logo aparece no header

### 8. Build para Produção

```bash
npm run build
```

### 9. Preparar para Deploy

**Opção A: Firebase Hosting (Recomendado)**

```bash
# Se ainda não tiver Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar (só na primeira vez)
firebase init hosting
# Escolher:
# - Usar projeto existente: SIM (selecionar projeto do cliente)
# - Public directory: build
# - Configure as a single-page app: YES
# - Set up automatic builds: NO
# - File build/index.html already exists: NO (sobrescrever)

# Deploy
firebase deploy --only hosting
```

A URL aparecerá no terminal (ex: `https://projeto-cliente.web.app`)

**Atualizar URL no .env.local:**

1. Copiar URL do deploy
2. Abrir `.env.local`
3. Atualizar `REACT_APP_APP_URL` com a URL real
4. Refazer build e deploy (opcional, mas recomendado)

**Opção B: Entregar para Cliente Fazer Deploy**

Se o cliente vai fazer deploy:

1. ZIPar a pasta (sem `node_modules/`)
2. Incluir instruções de deploy
3. Entregar para cliente

---

## ✅ Checklist de Configuração por Cliente

Use este checklist para cada cliente:

### Configuração Inicial
- [ ] Template copiado
- [ ] `npm install` executado
- [ ] Setup web acessado (`/setup`)

### Informações Básicas
- [ ] Nome da loja preenchido
- [ ] Subtítulo preenchido
- [ ] Telefone do cliente
- [ ] WhatsApp do cliente (formato correto)
- [ ] Endereço do cliente
- [ ] Horários configurados

### Firebase (CRÍTICO)
- [ ] Projeto Firebase NOVO criado para o cliente
- [ ] App Web adicionado no Firebase
- [ ] Todas as credenciais copiadas no setup
- [ ] Authentication habilitado (Email/Password)
- [ ] Firestore Database criado
- [ ] Storage habilitado
- [ ] Usuário admin criado no Firebase
- [ ] UID do admin copiado e configurado
- [ ] Firestore Rules configuradas com UID correto
- [ ] `.env.local` baixado e salvo

### PIX
- [ ] Chave PIX do cliente
- [ ] Cidade em MAIÚSCULAS
- [ ] Nome do recebedor

### Visual
- [ ] Logo 192x192 substituído
- [ ] Logo 512x512 substituído
- [ ] Favicon substituído
- [ ] Logo aparece corretamente no site

### Testes Locais
- [ ] Login admin funciona
- [ ] Criar produto funciona
- [ ] Carrinho funciona
- [ ] WhatsApp funciona
- [ ] Tudo testado e funcionando

### Deploy
- [ ] `npm run build` executado
- [ ] Deploy feito (Firebase Hosting ou outro)
- [ ] URL obtida e atualizada (se necessário)

---

## 📋 Template de Informações do Cliente

Crie um documento para cada cliente com:

```
CLIENTE: [Nome]
DATA: [Data]
====================================

INFORMAÇÕES:
- Nome da Loja: 
- Telefone: 
- WhatsApp: 
- Endereço: 
- Chave PIX: 
- Cidade PIX: 
- Nome Recebedor: 

FIREBASE:
- Project ID: 
- App ID: 
- Admin UID: 
- URL Deploy: 

LOGO:
- [ ] Recebido
- [ ] Tamanho correto
- [ ] Substituído

NOTAS:
- 
```

---

## 🚀 Script Rápido de Configuração

### Script Windows PowerShell (`configurar-cliente.ps1`):

```powershell
# Uso: .\configurar-cliente.ps1 "nome-cliente"

$nomeCliente = $args[0]

if (-not $nomeCliente) {
    Write-Host "Uso: .\configurar-cliente.ps1 'nome-cliente'" -ForegroundColor Red
    exit
}

Write-Host "Criando projeto para: $nomeCliente" -ForegroundColor Green

# Copiar template
Copy-Item -Path "sistema-template" -Destination "cliente-$nomeCliente" -Recurse

Write-Host "✅ Cópia criada!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. cd cliente-$nomeCliente" -ForegroundColor Cyan
Write-Host "2. npm install" -ForegroundColor Cyan
Write-Host "3. npm start" -ForegroundColor Cyan
Write-Host "4. Acesse http://localhost:3000/setup" -ForegroundColor Cyan
Write-Host "5. Preencha todos os dados do cliente" -ForegroundColor Cyan
Write-Host "6. Substitua os logos" -ForegroundColor Cyan
```

### Script Linux/Mac (`configurar-cliente.sh`):

```bash
#!/bin/bash

if [ -z "$1" ]; then
    echo "Uso: ./configurar-cliente.sh nome-cliente"
    exit 1
fi

NOME_CLIENTE=$1

echo "Criando projeto para: $NOME_CLIENTE"

# Copiar template
cp -r sistema-template cliente-$NOME_CLIENTE

echo "✅ Cópia criada!"
echo ""
echo "Próximos passos:"
echo "1. cd cliente-$NOME_CLIENTE"
echo "2. npm install"
echo "3. npm start"
echo "4. Acesse http://localhost:3000/setup"
echo "5. Preencha todos os dados do cliente"
echo "6. Substitua os logos"
```

---

## 💡 Dicas Rápidas

### 1. Firebase por Cliente
- **NUNCA** reutilize Firebase entre clientes
- Cada cliente precisa de projeto próprio
- Crie conta Firebase para cada cliente (ou use sua conta, mas projetos separados)

### 2. Logos
- Peça logos antes de começar
- Mantenha proporção (quadrado)
- Tamanhos: 192x192, 512x512, favicon 32x32

### 3. Teste Sempre
- Sempre teste login admin antes de entregar
- Teste criar produto
- Teste processo de compra completo

### 4. Backup
- Mantenha backup de cada configuração
- Documente credenciais importantes (em local seguro)
- Salve `.env.local` do cliente (criptografado)

### 5. Entrega
- Pode entregar ZIP (sem node_modules)
- Pode entregar via Git (cliente faz clone)
- Pode fazer deploy você mesmo e entregar só URL

---

## ⚠️ Atenção: O Que NUNCA Fazer

- ❌ **NUNCA** compartilhe Firebase entre clientes
- ❌ **NUNCA** use suas próprias credenciais no cliente
- ❌ **NUNCA** entregue com logo do Lajinha
- ❌ **NUNCA** esqueça de configurar Firestore Rules
- ❌ **NUNCA** entregue sem testar

---

## 📞 Estrutura Final de Cada Cliente

```
cliente-[nome]/
├── src/                      ✅ Código (configurado)
├── public/                   ✅ Logos do cliente
├── build/                     ✅ Build pronto (se fez)
├── .env.local                 ✅ Configuração do cliente
├── .gitignore
├── package.json
├── firebase.json             ✅ (se usou Firebase Hosting)
├── firestore.rules          ✅ (opcional, se salvou)
└── README.md                 ✅ Instruções (opcional)
```

---

## ✅ Checklist Final Antes de Entregar

- [ ] Todos os dados do cliente preenchidos
- [ ] Firebase próprio do cliente configurado
- [ ] Login admin testado e funcionando
- [ ] Logos do cliente substituídos
- [ ] Testes básicos passaram
- [ ] Build feito (se entregando build)
- [ ] Deploy feito (se você faz deploy)
- [ ] URL atualizada no .env.local (se aplicável)
- [ ] Cliente recebeu instruções de uso (se necessário)

---

**Pronto!** Agora é só seguir este processo para cada cliente. 🚀

