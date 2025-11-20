# 🚀 Splash Screen & Performance Optimization Guide

## O que foi implementado

### 1. **Splash Screen Controlada** ✅

A splash screen agora é **controlada programaticamente**:

```typescript
// _layout.tsx
SplashScreen.preventAutoHideAsync(); // Mantém visível durante inicialização

// index.tsx
await SplashScreen.hideAsync(); // Esconde após carregar dados
```

**Benefícios:**
- App só aparece quando estiver 100% pronto
- Evita flashes de conteúdo não carregado
- Melhor percepção de performance

### 2. **Hermes Engine** ⚡

Habilitei o Hermes (JavaScript engine otimizada do React Native):

```json
"jsEngine": "hermes"
```

**Benefícios:**
- **Startup 2-3x mais rápido**
- **50% menos uso de memória**
- **Tamanho de bundle menor**
- Melhor performance geral

### 3. **Error Handling Robusto** 🛡️

Adicionei try-catch em toda inicialização:
- Se algo falhar, splash esconde mesmo assim
- Logs detalhados para debugging
- Não trava a inicialização

---

## ⚡ Outras Otimizações Recomendadas

### A. Lazy Loading de Componentes

```typescript
// Em vez de:
import AnnotationPopover from './AnnotationPopover';

// Use:
const AnnotationPopover = lazy(() => import('./AnnotationPopover'));
```

### B. Otimizar AsyncStorage

```typescript
// Carregar apenas IDs primeiro, conteúdo depois
const quickLoad = async () => {
  // 1. Carrega só IDs e metadados (rápido)
  const docIds = await AsyncStorage.getItem('document-ids');
  
  // 2. Mostra UI
  await SplashScreen.hideAsync();
  
  // 3. Carrega conteúdo completo em background
  loadFullDocuments();
};
```

### C. Pre-cache de Assets

Se você tiver fontes/imagens customizadas:

```typescript
import * as Font from 'expo-font';
import * as Asset from 'expo-asset';

async function loadResourcesAsync() {
  await Promise.all([
    Font.loadAsync({
      'custom-font': require('./assets/fonts/custom.ttf'),
    }),
    Asset.loadAsync([
      require('./assets/images/logo.png'),
    ]),
  ]);
}
```

### D. Bundle Optimization

```javascript
// metro.config.js
module.exports = {
  transformer: {
    minifierConfig: {
      compress: {
        drop_console: true, // Remove console.logs em produção
      },
    },
  },
};
```

---

## 📊 Medindo Performance

### 1. **Tempo de Inicialização**

```typescript
// app/index.tsx
const startTime = Date.now();

useEffect(() => {
  const initializeApp = async () => {
    // ... seu código ...
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ App initialized in ${loadTime}ms`);
  };
}, []);
```

### 2. **React DevTools Profiler**

```bash
# Instalar
npm install --save-dev @react-native-community/eslint-config

# Usar no código
import { Profiler } from 'react';

<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>
```

---

## 🎨 Customizando a Splash Screen

> **📖 Guia completo de design:** Veja `assets/README_ASSETS.md` para especificações detalhadas e como criar os assets.

### Opção 1: Simples (Apenas Imagem)

Já configurado! Apenas troque a imagem:
- `assets/splash-icon.png` - Imagem da splash (1242x2436px)
- `assets/icon.png` - Ícone do app (1024x1024px)
- `assets/adaptive-icon.png` - Ícone Android (1024x1024px)

**Status atual:** ⚠️ Usando placeholders - substituir por assets reais

### Opção 2: Animada (Lottie)

```bash
npm install lottie-react-native
```

```typescript
import LottieView from 'lottie-react-native';
import * as SplashScreen from 'expo-splash-screen';

export default function AnimatedSplash() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await loadData();
      setIsReady(true);
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  if (!isReady) {
    return (
      <LottieView
        source={require('./assets/splash-animation.json')}
        autoPlay
        loop
      />
    );
  }

  return <YourApp />;
}
```

### Opção 3: Progressiva (com indicador de progresso)

```typescript
export default function Index() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function init() {
      setProgress(0.2); // Começou
      await loadDocuments();
      setProgress(0.6); // Documentos carregados
      await loadSettings();
      setProgress(0.9); // Quase lá
      await SplashScreen.hideAsync();
      setProgress(1); // Pronto!
    }
    init();
  }, []);

  // Mostrar progress bar
}
```

---

## 🎯 Benchmarks Esperados

Com as otimizações implementadas:

| Métrica | Antes | Depois |
|---------|-------|--------|
| Cold start (iOS) | ~2-3s | ~1-1.5s ⚡ |
| Cold start (Android) | ~3-4s | ~1.5-2s ⚡ |
| Bundle size | ~15MB | ~10MB 📦 |
| Memory usage | ~80MB | ~50MB 💾 |

---

## 🔧 Troubleshooting

### Splash não esconde?

```typescript
// Adicionar timeout de segurança
setTimeout(() => {
  SplashScreen.hideAsync();
}, 5000); // Força esconder após 5s
```

### Tela branca entre splash e app?

```typescript
// app.json - Garantir que backgroundColor combina
"splash": {
  "backgroundColor": "#ffffff"  // Mesma cor do app
}
```

### Splash pisca?

```typescript
// Garantir que SplashScreen.hideAsync() é chamado APÓS navegação
await loadData();
router.replace('/editor/123');
await new Promise(r => setTimeout(r, 100)); // Pequeno delay
await SplashScreen.hideAsync();
```

---

## ✅ Checklist de Performance

- [x] Splash screen controlada programaticamente
- [x] Hermes engine habilitada
- [x] Error handling robusto
- [ ] Lazy loading de componentes pesados
- [ ] Bundle optimization em produção
- [ ] Medição de performance implementada
- [ ] Assets pre-cached (se necessário)
- [ ] AsyncStorage otimizado para carga parcial

---

## 🚀 Próximos Passos

1. **Testar em dispositivos reais** (não só emulador)
2. **Medir tempo de inicialização** com logs
3. **Considerar lazy loading** para componentes grandes
4. **Otimizar bundle** removendo dependências não usadas
5. **Adicionar Sentry/Analytics** para monitorar performance em produção

---

## 📚 Referências

- [Expo Splash Screen Docs](https://docs.expo.dev/versions/latest/sdk/splash-screen/)
- [Hermes Engine](https://reactnative.dev/docs/hermes)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [Optimizing React Native](https://blog.expo.dev/optimizing-react-native-performance-3f6e8a9b0e3f)

