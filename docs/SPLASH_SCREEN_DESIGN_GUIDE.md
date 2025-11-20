# 🎨 Splash Screen - Guia de Design

## 📊 Status Atual

**Você tem:**
- ✅ Logo completo: `assets/images/logo.png` (ícone coral + "dpnotes")
- ⚠️ Splash placeholder: `assets/splash-icon.png` (precisa substituir)
- ⚠️ Ícone placeholder: `assets/icon.png` (precisa substituir)

---

## 📐 Especificações Técnicas

### 1. **Splash Screen Image** (`splash-icon.png`)

```
Tamanho recomendado: 1242x2436px (proporção iPhone)
Formato: PNG com transparência
Peso máximo: < 200KB (para carregamento rápido)
Safe area: 40% do centro (onde fica o conteúdo principal)
```

**Composição recomendada:**
```
┌─────────────────────┐
│                     │ ← Topo (pode ser cortado)
│                     │
│    ┌─────────┐     │
│    │  LOGO   │     │ ← Safe area (sempre visível)
│    └─────────┘     │
│                     │
│                     │ ← Base (pode ser cortado)
└─────────────────────┘
```

### 2. **App Icon** (`icon.png`)

```
Tamanho: 1024x1024px
Formato: PNG (sem transparência no fundo)
Bordas: Não precisa de bordas arredondadas (iOS/Android fazem automaticamente)
Peso máximo: < 100KB
```

### 3. **Adaptive Icon** Android (`adaptive-icon.png`)

```
Tamanho: 1024x1024px
Safe zone: 66% do centro (Android pode cortar bordas)
Formato: PNG
Fundo: Transparente ou sólido (definir em app.json)
```

---

## 🎨 Opções de Design para Splash

### **Opção 1: Minimalista (Recomendada)** ⭐
```
Fundo branco (#FFFFFF)
Logo centralizado
Sem texto adicional
Limpo e rápido
```

**Vantagens:**
- ✅ Carrega super rápido
- ✅ Profissional
- ✅ Atemporal

### **Opção 2: Com Branding**
```
Fundo branco ou gradiente sutil
Logo + texto "Deep Research Notes"
Versão minimalista do logo
```

**Vantagens:**
- ✅ Reforça marca
- ✅ Mais informativo

### **Opção 3: Com Gradiente**
```
Fundo: gradiente sutil (branco → cinza claro)
Logo central
Leve sombra/glow
```

**Vantagens:**
- ✅ Mais sofisticado
- ✅ Destaca o logo
- ⚠️ Arquivo um pouco maior

---

## 🛠️ Como Criar a Arte

### **Método 1: Usando Figma** (Recomendado)

1. **Criar arquivo Figma:**
```
Frame: 1242 x 2436px
Nome: "Splash Screen - dpnotes"
```

2. **Layout:**
```
- Fundo: #FFFFFF (ou cor desejada)
- Logo: Centralizado
- Escala: 30-40% da altura da tela
- Safe margins: 60px das bordas
```

3. **Exportar:**
```
Export as PNG
@3x (1242x2436)
Compression: Medium
```

### **Método 2: Usando Canva** (Mais simples)

1. **Template:**
```
Criar design customizado
Dimensões: 1242 x 2436 pixels
```

2. **Adicionar logo:**
```
Upload do logo
Centralizar
Ajustar tamanho (500-800px de altura)
```

3. **Download:**
```
Baixar como PNG
Qualidade máxima
```

### **Método 3: Usando IA** (Mais rápido)

Prompt para DALL-E/Midjourney:
```
"Simple, clean app splash screen for a note-taking app,
white background, minimalist icon in the center,
professional design, modern, 1242x2436px"
```

---

## 🎯 Design Recomendado para dpnotes

### **Baseado no seu logo atual:**

```
┌──────────────────────────────┐
│                              │
│                              │
│          ┌────────┐          │
│          │  📝    │          │ ← Ícone coral (documento+lápis)
│          │        │          │   Tamanho: ~600px
│          └────────┘          │
│                              │
│         dpnotes              │ ← Texto opcional (fonte Poppins/Inter)
│                              │   Cor: #1F2937 (cinza escuro)
│                              │
└──────────────────────────────┘
   Fundo: #FFFFFF
```

**Cores do seu branding:**
- Primary: `#FF7B61` (coral/laranja do logo)
- Background: `#FFFFFF` (branco)
- Text: `#1F2937` (cinza escuro)

---

## 📦 Assets Necessários

Crie e substitua estes arquivos:

### 1. **Splash Screen:**
```bash
assets/splash-icon.png
├─ Tamanho: 1242x2436px
├─ Conteúdo: Logo centralizado
└─ Formato: PNG
```

### 2. **App Icon:**
```bash
assets/icon.png
├─ Tamanho: 1024x1024px
├─ Conteúdo: Apenas o ícone (sem texto)
└─ Fundo: Coral (#FF7B61) ou Branco
```

### 3. **Adaptive Icon** (Android):
```bash
assets/adaptive-icon.png
├─ Tamanho: 1024x1024px
├─ Safe zone: Logo no centro (66%)
└─ Formato: PNG com transparência
```

---

## 🚀 Implementação Rápida

### **Já tenho o logo, e agora?**

**Opção A: Usar logo existente como splash**
```bash
# Simplesmente copiar e redimensionar
cp assets/images/logo.png assets/splash-icon.png

# Depois redimensionar para 1242x2436px
# (adicionar padding branco acima/abaixo)
```

**Opção B: Extrair apenas o ícone**
```bash
# Usar só a parte coral (ícone do documento)
# Centralizar em canvas branco 1242x2436px
```

---

## ✅ Checklist de Qualidade

Sua splash screen deve:

- [ ] Carregar em < 100ms
- [ ] Ser < 200KB de tamanho
- [ ] Ter logo centralizado e legível
- [ ] Funcionar em light e dark mode (se aplicável)
- [ ] Ter contraste adequado (WCAG AA)
- [ ] Não ter textos muito pequenos (< 18px)
- [ ] Não ter elementos muito próximos das bordas
- [ ] Ser consistente com o design do app

---

## 🎨 Ferramentas Úteis

### **Design:**
- [Figma](https://figma.com) - Design profissional (grátis)
- [Canva](https://canva.com) - Simples e rápido (grátis)
- [Sketch](https://sketch.com) - Mac only (pago)

### **Otimização de Imagens:**
- [TinyPNG](https://tinypng.com) - Comprime PNG sem perder qualidade
- [Squoosh](https://squoosh.app) - Google, várias opções
- [ImageOptim](https://imageoptim.com) - Mac app (grátis)

### **Geração de Assets:**
- [App Icon Generator](https://appicon.co) - Gera todos os tamanhos
- [Expo Icon Tool](https://docs.expo.dev/develop/user-interface/app-icons/) - Gerador oficial
- [MakeAppIcon](https://makeappicon.com) - Gera todos os assets

---

## 🔧 Configuração no app.json

```json
{
  "expo": {
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",          // ou "cover"
      "backgroundColor": "#ffffff"       // Cor de fundo
    },
    "icon": "./assets/icon.png",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FF7B61"     // Cor coral do logo
      }
    }
  }
}
```

### **ResizeMode:**

**`contain` (recomendado):**
```
┌─────────────┐
│             │ ← Padding
│   [LOGO]    │ ← Logo mantém proporção
│             │ ← Padding
└─────────────┘
```

**`cover`:**
```
┌─────────────┐
│ [  LOGO  ]  │ ← Logo preenche tudo
│ [  LOGO  ]  │ ← Pode cortar bordas
│ [  LOGO  ]  │
└─────────────┘
```

---

## 💡 Dicas Pro

### 1. **Teste em vários dispositivos:**
```bash
# iOS - vários tamanhos
iPhone SE (375x667)
iPhone 14 (390x844)
iPhone 14 Pro Max (430x932)

# Android - vários tamanhos
Galaxy S10 (360x760)
Pixel 7 (412x915)
```

### 2. **Considere Dark Mode:**
```json
"splash": {
  "image": "./assets/splash-icon.png",
  "dark": {
    "image": "./assets/splash-icon-dark.png",
    "backgroundColor": "#000000"
  }
}
```

### 3. **Animação sutil (opcional):**
```typescript
// Fade in suave ao esconder splash
import { Animated } from 'react-native';

const fadeAnim = useRef(new Animated.Value(0)).current;

await SplashScreen.hideAsync();
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true,
}).start();
```

---

## 🎯 Ação Imediata

**Para ter uma splash funcional AGORA:**

1. **Extrair ícone do logo:**
   - Abrir `assets/images/logo.png` em editor
   - Recortar só o ícone coral (parte esquerda)
   - Salvar como PNG 1024x1024px

2. **Criar splash temporária:**
   - Canvas branco 1242x2436px
   - Colar ícone no centro
   - Salvar como `assets/splash-icon.png`

3. **Testar:**
   ```bash
   npm run ios  # ou android
   ```

---

## 📚 Exemplos de Referência

**Apps similares com boas splash screens:**
- **Notion:** Logo minimalista no centro, fundo branco
- **Bear:** Ícone do urso, fundo coral
- **Obsidian:** Logo em gradiente sutil
- **Craft:** Logo simples, fundo branco premium

---

## ✨ Resultado Esperado

Com as otimizações de código + splash screen bem feita:

```
App Launch
    ↓
[Splash aparece INSTANTANEAMENTE] ← Arte otimizada
    ↓
[Logo visível 0.5-1s] ← Tempo de carregamento
    ↓
[Transição suave] ← Fade out
    ↓
✅ App pronto!
```

---

Quer que eu crie um template específico para você ou te ajude a preparar os assets?

