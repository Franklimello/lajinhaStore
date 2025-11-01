# ⚡ Capacitor - Comandos Rápidos

Guia rápido de comandos para trabalhar com Capacitor no projeto.

---

## 🚀 Comandos Principais

### Instalação Inicial (já feito ✅)
```bash
npm install @capacitor/core @capacitor/cli --legacy-peer-deps
```

### Adicionar Plataforma Android
```bash
npm install @capacitor/android --legacy-peer-deps
npx cap add android
```

### Adicionar Plataforma iOS (apenas Mac)
```bash
npm install @capacitor/ios --legacy-peer-deps
npx cap add ios
```

---

## 📦 Scripts NPM (adicionados ao package.json)

### Atualizar e Sincronizar
```bash
npm run cap:sync          # Sincroniza plugins após instalar novos
npm run cap:copy          # Copia build/ para plataformas
```

### Build e Abrir
```bash
npm run cap:build         # Build + Copy (tudo de uma vez)
npm run cap:android       # Abre Android Studio
npm run cap:ios           # Abre Xcode (Mac apenas)
```

### Build + Sync + Abrir (tudo de uma vez)
```bash
npm run cap:sync:android  # Build + Sync + Abre Android Studio
npm run cap:sync:ios      # Build + Sync + Abre Xcode
```

---

## 🔄 Fluxo de Trabalho Completo

### Quando fizer alterações no código React:

```bash
# 1. Criar build
npm run build

# 2. Copiar para Capacitor
npm run cap:copy

# 3. Sincronizar plugins (se instalou novos)
npm run cap:sync

# 4. Abrir no IDE
npm run cap:android   # ou npm run cap:ios
```

**OU simplesmente:**
```bash
npm run cap:sync:android   # Faz tudo de uma vez
```

---

## 🔌 Instalar Plugins Úteis

### Notificações Push
```bash
npm install @capacitor/push-notifications --legacy-peer-deps
npm run cap:sync
```

### Câmera
```bash
npm install @capacitor/camera --legacy-peer-deps
npm run cap:sync
```

### Geolocalização
```bash
npm install @capacitor/geolocation --legacy-peer-deps
npm run cap:sync
```

### Armazenamento Local
```bash
npm install @capacitor/preferences --legacy-peer-deps
npm run cap:sync
```

### Status Bar
```bash
npm install @capacitor/status-bar --legacy-peer-deps
npm run cap:sync
```

### Splash Screen
```bash
npm install @capacitor/splash-screen --legacy-peer-deps
npm run cap:sync
```

### App (abrir URLs, check updates)
```bash
npm install @capacitor/app --legacy-peer-deps
npm run cap:sync
```

---

## 🛠️ Comandos Nativos do Capacitor

```bash
npx cap init              # Inicializar (já feito)
npx cap add android       # Adicionar Android
npx cap add ios           # Adicionar iOS
npx cap sync              # Sincronizar tudo
npx cap copy              # Copiar build
npx cap update            # Atualizar Capacitor
npx cap open android      # Abrir Android Studio
npx cap open ios          # Abrir Xcode
npx cap run android       # Build e roda no dispositivo/emulador
npx cap run ios           # Build e roda no dispositivo/simulador
```

---

## 📝 Verificar Configuração

```bash
npx cap doctor            # Verifica se tudo está configurado corretamente
```

---

## 🐛 Troubleshooting

### Limpar e Reconstruir
```bash
# Limpar build
rm -rf build/

# Limpar plataformas (CUIDADO: remove modificações manuais!)
rm -rf android/
rm -rf ios/

# Rebuildar tudo
npm run build
npx cap add android       # ou ios
npx cap sync
```

### Verificar Logs
```bash
npx cap run android --verbose
npx cap run ios --verbose
```

---

## ✅ Checklist Antes de Publicar

### Android:
- [ ] `npm run build` executado
- [ ] `npm run cap:copy` executado
- [ ] Ícones configurados em `android/app/src/main/res/`
- [ ] Nome do app alterado em `android/app/src/main/res/values/strings.xml`
- [ ] `npx cap open android` - teste no dispositivo/emulador
- [ ] AAB gerado e assinado

### iOS:
- [ ] `npm run build` executado
- [ ] `npm run cap:copy` executado
- [ ] Ícones configurados no Xcode
- [ ] Bundle ID configurado
- [ ] `npx cap open ios` - teste no dispositivo/simulador
- [ ] Archive gerado e assinado

---

## 📚 Próximos Passos

1. Adicionar plataforma Android: `npm install @capacitor/android --legacy-peer-deps && npx cap add android`
2. Testar build: `npm run build && npm run cap:copy`
3. Abrir no Android Studio: `npm run cap:android`
4. Instalar plugins conforme necessidade

---

**💡 Dica:** Use sempre `--legacy-peer-deps` ao instalar plugins por causa do React 19.





