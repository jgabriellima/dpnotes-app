# 🎨 Assets Guide - dpnotes

## 📋 Status dos Assets

### ✅ Pronto:
- `images/logo.png` - Logo completo (ícone + texto "dpnotes")
- `images/logo-icon.png` - Apenas o ícone
- `images/logo-transparent.png` - Logo com fundo transparente

### ⚠️ Precisa Substituir (Placeholders):
- `splash-icon.png` - Imagem da splash screen
- `icon.png` - Ícone do app
- `adaptive-icon.png` - Ícone adaptativo Android

---

## 🎯 Como Criar os Assets

### **1. Splash Screen** (`splash-icon.png`)

**Especificações:**
```
Tamanho: 1242 x 2436 pixels
Formato: PNG
Peso: < 200KB
```

**Design recomendado:**
```
┌────────────────────┐
│                    │
│                    │  ← Espaço superior
│                    │
│    ┌─────────┐    │
│    │         │    │
│    │  📝     │    │  ← Logo dpnotes centralizado
│    │         │    │     (usar images/logo-icon.png)
│    └─────────┘    │
│                    │
│                    │  ← Espaço inferior
│                    │
└────────────────────┘
   Fundo: #FFFFFF
```

**Opções:**

**A) Simples (recomendado):**
- Fundo branco puro
- Logo coral centralizado
- Sem texto

**B) Com texto:**
- Fundo branco
- Logo coral no centro
- Texto "dpnotes" abaixo (cinza escuro)

**C) Com gradiente:**
- Fundo: gradiente sutil branco → cinza claro
- Logo no centro
- Mais sofisticado

---

### **2. App Icon** (`icon.png`)

**Especificações:**
```
Tamanho: 1024 x 1024 pixels
Formato: PNG
Peso: < 100KB
Bordas: Retas (iOS/Android arredondam automaticamente)
```

**Design recomendado:**
```
┌──────────────┐
│              │
│   ┌──────┐   │
│   │  📝  │   │  ← Ícone dpnotes
│   │      │   │     (documento + lápis)
│   └──────┘   │
│              │
└──────────────┘
```

**Opções de fundo:**

**A) Coral sólido (recomendado):**
- Fundo: `#FF7B61` (coral)
- Ícone: branco
- Moderno e chamativo

**B) Branco:**
- Fundo: branco
- Ícone: coral (#FF7B61)
- Mais clean

**C) Gradiente:**
- Fundo: gradiente coral → laranja
- Ícone: branco
- Mais vibrante

---

### **3. Adaptive Icon Android** (`adaptive-icon.png`)

**Especificações:**
```
Tamanho: 1024 x 1024 pixels
Formato: PNG com transparência
Safe zone: 66% do centro (Android corta bordas)
```

**Design:**
```
┌──────────────────┐
│ ← Pode ser cortado
│                  │
│   ┌──────────┐   │
│   │          │   │
│   │   📝     │   │  ← Logo na safe zone
│   │          │   │     (centralizado)
│   └──────────┘   │
│                  │
│ ← Pode ser cortado
└──────────────────┘
   Fundo: Transparente
```

**Configurado em app.json:**
```json
"backgroundColor": "#FF7B61"
```

---

## 🛠️ Ferramentas para Criar

### **Opção 1: Figma (Recomendado)** ⭐

1. Criar frames com os tamanhos corretos
2. Importar `images/logo-icon.png`
3. Adicionar fundos e ajustar
4. Exportar como PNG

**Templates prontos:**
- [Expo App Icon Template](https://www.figma.com/community/file/1234567890/expo-app-icon-template)

### **Opção 2: Canva (Mais Simples)**

1. Criar design customizado
2. Definir dimensões corretas
3. Upload do logo
4. Adicionar fundo
5. Download PNG

### **Opção 3: Ferramentas Online**

**Geradores automáticos:**
- [App Icon Generator](https://www.appicon.co)
- [Make App Icon](https://makeappicon.com)
- [Icon Kitchen](https://icon.kitchen)

**Como usar:**
1. Upload do seu logo (`images/logo-icon.png`)
2. Escolher cores de fundo
3. Gerar todos os tamanhos
4. Download e substituir

---

## 📦 Estrutura Final dos Assets

```
assets/
├── splash-icon.png         ← 1242x2436px (Splash screen)
├── icon.png                ← 1024x1024px (App icon)
├── adaptive-icon.png       ← 1024x1024px (Android)
├── favicon.png            ← 48x48px (Web)
└── images/
    ├── logo.png           ← Logo completo ✅
    ├── logo-icon.png      ← Apenas ícone ✅
    └── logo-transparent.png ← Com transparência ✅
```

---

## 🎨 Paleta de Cores dpnotes

```css
/* Primary */
--coral: #FF7B61;      /* Cor principal do logo */
--coral-dark: #E66A52; /* Versão mais escura */
--coral-light: #FF9580; /* Versão mais clara */

/* Neutral */
--white: #FFFFFF;
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-900: #1F2937;    /* Texto */

/* Background */
--bg-primary: #FFFFFF;
--bg-secondary: #F9FAFB;
```

---

## ✅ Checklist de Qualidade

Antes de substituir os assets, verifique:

### Splash Screen:
- [ ] Tamanho: 1242x2436px
- [ ] Formato: PNG
- [ ] Peso: < 200KB
- [ ] Logo centralizado e legível
- [ ] Fundo branco (#FFFFFF)
- [ ] Sem textos muito pequenos

### App Icon:
- [ ] Tamanho: 1024x1024px
- [ ] Formato: PNG
- [ ] Peso: < 100KB
- [ ] Logo ocupa 60-80% do espaço
- [ ] Bordas retas (não arredondar manualmente)
- [ ] Alto contraste

### Adaptive Icon:
- [ ] Tamanho: 1024x1024px
- [ ] Logo no centro (safe zone 66%)
- [ ] Fundo transparente
- [ ] Funciona com backgroundColor coral

---

## 🚀 Solução Rápida (5 minutos)

**Se você quer algo funcional AGORA:**

### **Usar App Icon Generator:**

1. Vá para: https://www.appicon.co
2. Upload: `assets/images/logo-icon.png`
3. Escolha:
   - Background: Coral (#FF7B61) OU Branco
   - Padding: 15-20%
4. Clique "Generate"
5. Download todos os assets
6. Substituir:
   ```bash
   cp Downloads/icon-1024.png assets/icon.png
   cp Downloads/adaptive-icon-1024.png assets/adaptive-icon.png
   ```

### **Criar Splash Manualmente:**

```bash
# Opção A: Usar logo existente como base
open assets/images/logo-icon.png  # Abrir em editor

# Criar canvas: 1242x2436px, fundo branco
# Colar logo centralizado
# Salvar como: assets/splash-icon.png
```

### **Ou use ImageMagick (terminal):**

```bash
# Criar splash automaticamente
convert -size 1242x2436 xc:white \
  assets/images/logo-icon.png -resize 600x600 \
  -gravity center -composite \
  assets/splash-icon.png

# Criar icon (com fundo coral)
convert -size 1024x1024 xc:"#FF7B61" \
  assets/images/logo-icon.png -resize 800x800 \
  -gravity center -composite \
  assets/icon.png
```

---

## 🧪 Testar os Assets

Após substituir os arquivos:

```bash
# 1. Limpar cache
npm start -- --clear

# 2. Rebuild (iOS)
cd ios && pod install && cd ..
npm run ios

# 3. Rebuild (Android)
npm run android
```

**Verifique:**
- ✅ Splash aparece ao abrir o app
- ✅ Ícone aparece na home screen
- ✅ Cores corretas
- ✅ Sem distorções

---

## 💡 Dicas Pro

### 1. **Teste em Dark Mode:**
```json
// app.json
"splash": {
  "dark": {
    "image": "./assets/splash-icon-dark.png",
    "backgroundColor": "#1F2937"
  }
}
```

### 2. **Otimizar Tamanho:**
```bash
# Comprimir PNG sem perder qualidade
# Upload em: https://tinypng.com
# Ou use:
pngquant assets/splash-icon.png --quality=70-85
```

### 3. **Variações por Plataforma:**
```json
"ios": {
  "icon": "./assets/icon-ios.png"  // Versão específica iOS
},
"android": {
  "icon": "./assets/icon-android.png"  // Versão específica Android
}
```

---

## 📚 Referências

- [Expo App Icons](https://docs.expo.dev/develop/user-interface/app-icons/)
- [Expo Splash Screen](https://docs.expo.dev/develop/user-interface/splash-screen/)
- [iOS HIG - App Icon](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android - Adaptive Icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)

---

## ❓ Precisa de Ajuda?

Se você não tem as ferramentas ou tempo para criar os assets:

1. **Use geradores online** (mais rápido)
2. **Contratar designer** (Fiverr, 99designs)
3. **Usar templates prontos** (Figma Community)
4. **Pedir para um designer amigo**

---

**Status:** ⚠️ Assets placeholder ativos - Substituir antes do lançamento

**Próximo passo:** Criar os 3 arquivos principais (splash-icon.png, icon.png, adaptive-icon.png)

