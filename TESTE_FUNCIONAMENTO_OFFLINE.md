# 🧪 Como Testar o Funcionamento Offline

## ✅ Pré-requisitos

- Site deve estar em **produção** (após `npm run build` e deploy)
- Ou em **localhost** em modo de desenvolvimento

## 📝 Passo a Passo para Testar

### 1️⃣ Primeira Visita (Online)

1. **Abra o site normalmente**
   - URL: `https://seu-site.com` ou `http://localhost:3000`

2. **Abra o DevTools**
   - Pressione `F12` ou `Ctrl+Shift+I`
   - Vá na aba **Console**

3. **Verifique os logs do Service Worker**
   
   Você deve ver:
   ```
   ✅ Service Worker registrado com sucesso!
   📦 Scope: https://seu-site.com/
   🎉 Service Worker está ativo e pronto!
   📦 Caches ativos: ['lajinha-pwa-v2-firebase-storage-images', ...]
   💾 Armazenamento usado: 5.23MB de 2048.00MB
   ```

4. **Navegue pelo site**
   - Vá para a página inicial
   - Clique em algumas categorias (Mercearia, Bebidas, etc.)
   - Veja produtos diferentes
   - Abra páginas de detalhes de produtos

5. **Observe os logs de cache**
   
   Conforme navega, você verá:
   ```
   🖼️ Nova imagem Firebase salva no cache: https://firebasestorage.googleapis.com/...
   📄 Página HTML salva no cache
   📝 Arquivo JS/CSS atualizado no cache
   ```

6. **Verifique o cache manualmente**
   - No DevTools, vá em **Application** (ou **Aplicação**)
   - Clique em **Cache Storage** no menu lateral
   - Você verá vários caches:
     - `lajinha-pwa-v2-firebase-storage-images`
     - `lajinha-pwa-v2-assets-images`
     - `lajinha-pwa-v2-app-shell`
     - `lajinha-pwa-v2-assets-js-css`
   - Clique em cada um para ver os arquivos armazenados

### 2️⃣ Teste Offline (Sem Internet)

#### Método 1: DevTools Network

1. **Com o site ainda aberto**, no DevTools:
   - Vá na aba **Network**
   - No dropdown onde está "No throttling"
   - Selecione **Offline**

2. **Recarregue a página** (`F5` ou `Ctrl+R`)

3. **✨ MÁGICA! O site deve carregar normalmente!**
   - Todas as páginas visitadas funcionam
   - Todas as imagens aparecem
   - Layout perfeito

4. **Verifique os logs**
   ```
   🏠 Página recuperada do cache (OFFLINE)
   💾 Imagem Firebase recuperada do cache
   💾 Imagem local recuperada do cache
   ```

#### Método 2: Desconectar WiFi Real

1. **Desconecte o WiFi** do computador
   - Ou desative o adaptador de rede

2. **Abra o site** no navegador

3. **Deve funcionar perfeitamente!** 🎉

### 3️⃣ Teste em Dispositivo Móvel

1. **Acesse o site no celular** (online)

2. **Navegue** por várias páginas

3. **Ative o Modo Avião** ✈️

4. **Abra o site** novamente

5. **Deve funcionar!** 📱✨

## 🔍 Verificações Detalhadas

### Ver Estatísticas de Cache

No Console do DevTools, execute:

```javascript
// Ver todos os caches
caches.keys().then(console.log)

// Ver conteúdo de um cache específico
caches.open('lajinha-pwa-v2-firebase-storage-images').then(cache => {
  cache.keys().then(keys => {
    console.log('Total de imagens:', keys.length);
    console.table(keys.map(k => ({ url: k.url })));
  });
});

// Ver uso de armazenamento
navigator.storage.estimate().then(estimate => {
  console.log('Usado:', (estimate.usage / 1024 / 1024).toFixed(2), 'MB');
  console.log('Total:', (estimate.quota / 1024 / 1024).toFixed(2), 'MB');
  console.log('Percentual:', ((estimate.usage / estimate.quota) * 100).toFixed(2), '%');
});
```

### Ver Status do Service Worker

No Console do DevTools, execute:

```javascript
// Ver Service Worker ativo
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg);
  console.log('Estado:', reg.active.state);
  console.log('Scope:', reg.scope);
});
```

## 🐛 Solução de Problemas

### Problema: Service Worker não registra

**Solução:**
```javascript
// No console do DevTools
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
  location.reload();
});
```

### Problema: Imagens não aparecem offline

**Verificar:**
1. As imagens foram carregadas **online** primeiro?
2. Verifique em **Application > Cache Storage** se as imagens estão lá
3. Veja logs do console

**Forçar novo cache:**
```javascript
// No console do DevTools
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
  location.reload();
});
```

### Problema: Site mostra versão antiga

**Solução:**
1. Force atualização: `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)
2. Ou limpe o cache manualmente no DevTools
3. Ou execute:
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.update());
});
```

## 📊 Resultados Esperados

### Cache de Imagens Firebase
- ✅ Até **1000 imagens** do Firebase Storage
- ✅ Mantidas por **60 dias**
- ✅ Carregamento instantâneo (< 50ms)

### Cache de Páginas
- ✅ Até **10 páginas HTML**
- ✅ Mantidas por **24 horas**
- ✅ Navegação offline perfeita

### Cache de Assets
- ✅ Todos os JS e CSS
- ✅ Atualização automática em background
- ✅ Sempre a versão mais recente

## 🎯 Checklist de Teste

- [ ] Service Worker registrou com sucesso
- [ ] Logs aparecem no console
- [ ] Caches visíveis em Application > Cache Storage
- [ ] Site funciona offline (método DevTools)
- [ ] Site funciona offline (WiFi desligado)
- [ ] Imagens do Firebase aparecem offline
- [ ] Navegação entre páginas funciona offline
- [ ] Estatísticas de armazenamento aparecem
- [ ] Atualização automática funciona
- [ ] Site funciona no celular offline

## 📸 Capturas de Tela Esperadas

### Console (Online)
```
🚀 Service Worker iniciando...
✅ Workbox carregado com sucesso
✅ Service Worker configurado com cache: lajinha-pwa-v2
📦 Service Worker instalado
✨ Service Worker ativado
✅ Service Worker registrado com sucesso!
🎉 Service Worker está ativo e pronto!
🖼️ Nova imagem Firebase salva no cache (várias vezes)
```

### Console (Offline)
```
🏠 Página recuperada do cache (OFFLINE)
💾 Imagem Firebase recuperada do cache (várias vezes)
💾 Imagem local recuperada do cache
```

### Application > Cache Storage
```
📁 lajinha-pwa-v2-firebase-storage-images
   - 45 items
📁 lajinha-pwa-v2-assets-images
   - 12 items
📁 lajinha-pwa-v2-app-shell
   - 3 items
📁 lajinha-pwa-v2-assets-js-css
   - 8 items
```

## 🎉 Sucesso!

Se todos os testes passaram, seu site está **100% offline-ready**! 🚀

As imagens do Firebase Storage, páginas HTML, e todos os recursos estão sendo automaticamente armazenados e servidos do cache quando offline.

## 📞 Suporte Adicional

Se algo não funcionar:
1. Veja os logs do console
2. Verifique Application > Service Workers
3. Limpe todos os caches e teste novamente
4. Teste em modo anônimo (sem extensões)

---

✨ **Documentação completa em:** `SERVICE_WORKER_OFFLINE_GUIDE.md`

