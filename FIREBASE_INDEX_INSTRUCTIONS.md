# Instruções para Criar Índice no Firebase

Se você ainda encontrar erros de índice, siga estas instruções:

## 1. Acesse o Firebase Console
- Vá para: https://console.firebase.google.com/
- Selecione seu projeto: `compreaqui-324df`

## 2. Navegue para Firestore
- Clique em "Firestore Database" no menu lateral
- Vá para a aba "Índices"

## 3. Crie o Índice Composto
- Clique em "Criar Índice"
- Coleção: `pedidos`
- Campos:
  - Campo 1: `userId` (Ascendente)
  - Campo 2: `createdAt` (Descendente)
- Clique em "Criar"

## 4. Alternativa: Usar o Link Direto
Se o Firebase fornecer um link direto, use-o:
```
https://console.firebase.google.com/v1/r/project/compreaqui-324df/firestore/indexes?create_composite=ClBwcm9qZWN0cy9jb21wcmVhcXVpLTMyNGRmL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9wZWRpZG9zL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI
```

## 5. Verificação
Após criar o índice:
- Aguarde alguns minutos para o índice ser criado
- Teste a funcionalidade de "Meus Pedidos"
- O erro deve desaparecer

## Nota
O código foi otimizado para funcionar mesmo sem o índice, mas o índice melhora a performance das consultas.

