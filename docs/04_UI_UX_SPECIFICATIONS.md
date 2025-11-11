# 🎨 UI/UX Specifications - Deep Research Notes

> **Status:** Baseado nas telas HTML implementadas em `docs/UX_UI_REFERENCES/`
> 
> **Referência:** Todas as 20 telas estão disponíveis com código HTML e screenshots

---

## 📐 Design System

### 🎨 Paleta de Cores Pastel

A paleta principal do app utiliza tons pastel suaves derivados do coral/salmão:

```typescript
const colors = {
  // Paleta Pastel Principal (5 níveis)
  primary: '#ffccc3',          // Coral pastel (mais forte)
  primaryLight: '#ffd9d2',     // Coral pastel médio
  primaryLighter: '#ffe6e1',   // Coral pastel claro
  primaryLightest: '#fff2f0',  // Coral pastel mais claro (background)
  white: '#ffffff',             // Branco puro
  
  // Cores de Texto
  textPrimary: '#2D313E',      // Texto principal (cinza escuro)
  textSecondary: '#6C6F7D',    // Texto secundário (cinza médio)
  
  // Cores Funcionais
  destructive: '#FF5C5C',      // Vermelho para ações destrutivas
  destructiveLight: '#FFE5E5', // Fundo para alertas destrutivos
};
```

### 📝 Tipografia

**Família de Fonte:** Inter (Google Fonts)
**Pesos usados:** 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)

```typescript
const typography = {
  // Headings
  h1: {
    fontFamily: 'Inter',
    fontSize: 32,          // 2rem / text-3xl
    fontWeight: '700',     // font-bold
    lineHeight: 1.2,       // leading-tight
    letterSpacing: -0.6,   // tracking-tight
  },
  
  h2: {
    fontFamily: 'Inter',
    fontSize: 24,          // 1.5rem / text-2xl
    fontWeight: '700',     // font-bold
    lineHeight: 1.3,       // leading-tight
    letterSpacing: -0.4,
  },
  
  h3: {
    fontFamily: 'Inter',
    fontSize: 18,          // 1.125rem / text-lg
    fontWeight: '700',     // font-bold
    lineHeight: 1.4,       // leading-tight
    letterSpacing: -0.24,  // tracking-[-0.015em]
  },
  
  // Body Text
  body: {
    fontFamily: 'Inter',
    fontSize: 16,          // 1rem / text-base
    fontWeight: '400',     // font-normal
    lineHeight: 1.5,       // leading-relaxed
  },
  
  bodyMedium: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500',     // font-medium
    lineHeight: 1.5,
  },
  
  bodyBold: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',     // font-bold
    lineHeight: 1.5,
  },
  
  // Small Text
  small: {
    fontFamily: 'Inter',
    fontSize: 14,          // 0.875rem / text-sm
    fontWeight: '400',
    lineHeight: 1.43,      // leading-normal
  },
  
  smallMedium: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 1.43,
  },
  
  // Caption/Labels
  caption: {
    fontFamily: 'Inter',
    fontSize: 12,          // 0.75rem / text-xs
    fontWeight: '500',     // font-medium
    lineHeight: 1.33,
  },
};
```

### 🔲 Border Radius

```typescript
const borderRadius = {
  sm: 4,           // 0.25rem
  default: 8,      // 0.5rem
  lg: 16,          // 1rem
  xl: 24,          // 1.5rem
  full: 9999,      // Círculo completo
};
```

### 📏 Spacing Scale

Baseado no sistema Tailwind (múltiplos de 4px):

```typescript
const spacing = {
  1: 4,    // 0.25rem
  2: 8,    // 0.5rem
  3: 12,   // 0.75rem
  4: 16,   // 1rem
  5: 20,   // 1.25rem
  6: 24,   // 1.5rem
  8: 32,   // 2rem
  10: 40,  // 2.5rem
  12: 48,  // 3rem
  16: 64,  // 4rem
};
```

### 🎯 Icons

**Sistema:** Material Symbols Outlined (Google)
**Tamanhos:** 16px (small), 20px (medium), 24px (default), 32px (large)

```css
.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,      /* Outlined style */
    'wght' 400,    /* Regular weight */
    'GRAD' 0,      /* Normal gradient */
    'opsz' 24;     /* Optical size 24px */
}
```

---

## 🧩 Componentes Principais

### 1. Button Components

#### Primary Button
```tsx
// Baseado em: all-projects/, home/, profile-settings/
<button className="
  flex items-center justify-center gap-2
  rounded-lg px-4 py-3
  bg-primary text-red-900
  font-bold text-base
  hover:bg-opacity-90 transition-colors
">
  <span>Texto do Botão</span>
</button>
```

#### Secondary Button
```tsx
<button className="
  flex items-center justify-center gap-2
  rounded-lg px-4 py-3
  bg-primary-light text-red-800/80
  font-semibold text-sm
  hover:bg-primary-lighter transition-colors
">
  <span>Texto do Botão</span>
</button>
```

#### Ghost Button (Icon Only)
```tsx
<button className="
  flex size-10 items-center justify-center
  text-text-secondary
  hover:bg-primary-lightest rounded-lg transition-colors
">
  <span className="material-symbols-outlined">icon_name</span>
</button>
```

### 2. Card Components

#### Project Card
```tsx
// Baseado em: home/, all-projects/
<div className="
  flex flex-col gap-3 p-4
  bg-white rounded-xl
  hover:shadow-md transition-shadow
">
  <div className="flex items-start justify-between">
    <div className="flex items-center gap-3">
      <div className="
        size-12 flex items-center justify-center
        bg-primary-lighter rounded-lg
        text-primary
      ">
        <span className="material-symbols-outlined">folder</span>
      </div>
      <div className="flex-1">
        <p className="text-text-primary font-bold text-base">
          Project Title
        </p>
        <p className="text-text-secondary text-sm">
          3 docs • 45 annotations
        </p>
      </div>
    </div>
    <button className="text-text-secondary">
      <span className="material-symbols-outlined">more_vert</span>
    </button>
  </div>
</div>
```

#### Settings Option Card
```tsx
// Baseado em: profile-settings/, security-settings/
<button className="
  flex items-center gap-4 p-4
  bg-white rounded-xl
  hover:bg-primary-lightest transition-colors
  w-full text-left
">
  <div className="
    size-10 flex items-center justify-center
    bg-primary-lighter rounded-lg
    text-primary
  ">
    <span className="material-symbols-outlined">icon_name</span>
  </div>
  <div className="flex-1">
    <p className="text-text-primary font-medium text-base">
      Option Title
    </p>
    <p className="text-text-secondary text-sm">
      Option description
    </p>
  </div>
  <span className="material-symbols-outlined text-text-secondary">
    arrow_forward_ios
  </span>
</button>
```

### 3. Text Editor Components

#### Annotation Badge
```tsx
// Baseado em: main-text_editor_screen_1/, main-text_editor_screen_2/
<span className="
  inline-flex items-center gap-1
  h-6 px-2 py-1
  bg-badge rounded
  text-xs font-medium text-primary
  cursor-pointer
">
  <span className="material-symbols-outlined !text-[16px]">sell</span>
  <span>Label Name</span>
</span>
```

#### Icon Badge (Audio/Note)
```tsx
<span className="
  flex size-6 items-center justify-center
  bg-badge rounded
  text-primary
  cursor-pointer
">
  <span className="material-symbols-outlined !text-[16px]">mic</span>
</span>
```

#### Highlighted Text
```tsx
<span className="
  bg-highlight px-1 py-0.5 rounded
  text-gray-800
">
  Selected text content
</span>
```

### 4. Modal Components

#### Bottom Sheet Modal
```tsx
// Baseado em: annotation_modal/
<div className="
  absolute inset-0
  flex flex-col justify-end
  bg-black/50
">
  <div className="
    flex flex-col
    bg-white rounded-t-xl
    max-h-[90vh] overflow-y-auto
  ">
    {/* Handle */}
    <div className="flex h-5 w-full items-center justify-center pt-3">
      <div className="h-1 w-9 rounded-full bg-gray-300"></div>
    </div>
    
    {/* Content */}
    <div className="px-4 pt-4 pb-6">
      {/* Modal content here */}
    </div>
  </div>
</div>
```

### 5. Input Components

#### Text Input
```tsx
// Baseado em: signin/, signup/, security-settings-change-password/
<input 
  type="text"
  className="
    w-full px-4 py-3
    bg-white border border-primary-light
    rounded-lg
    text-text-primary text-base
    placeholder:text-text-secondary
    focus:border-primary focus:ring-2 focus:ring-primary/20
    transition-colors
  "
  placeholder="Enter text..."
/>
```

#### Textarea
```tsx
// Baseado em: annotation_modal/
<textarea 
  className="
    w-full min-h-[100px] resize-y
    px-3 py-3
    bg-white border border-primary-light
    rounded-lg
    text-text-primary text-base
    placeholder:text-text-secondary
    focus:border-primary focus:ring-2 focus:ring-primary/20
    transition-colors
  "
  placeholder="Digite sua anotação..."
/>
```

### 6. Label/Tag Components

#### Label Chip (Selectable)
```tsx
// Baseado em: annotation_modal/
<button className="
  flex h-8 items-center justify-center gap-2
  px-3 rounded-full
  bg-primary-light
  text-red-800/80 text-sm font-medium
  hover:bg-primary-lighter transition-colors
">
  <span>Label Name</span>
</button>
```

#### Add Label Button
```tsx
<button className="
  flex h-8 items-center justify-center gap-2
  px-3 rounded-full
  border border-dashed border-primary
  bg-transparent text-red-800/80
  hover:bg-primary-lightest transition-colors
">
  <span className="material-symbols-outlined text-base">add</span>
  <span className="text-sm font-medium">Nova Label</span>
</button>
```

---

## 📱 Telas Principais - Layout Specifications

### 1. Home Screen
**Referência:** `docs/UX_UI_REFERENCES/home/`

**Layout:**
```
┌─────────────────────────────────────┐
│ [Avatar]  dpnotes.ai      [Settings]│ <- Header (bg-primary-lightest)
├─────────────────────────────────────┤
│                                     │
│ ┌─ Create a New Project ─────────┐ │
│ │ Start a new research journey   │ │
│ │                                │ │
│ │ [📝] Start with Blank Note  →  │ │
│ │ [📋] Create from Clipboard  →  │ │
│ │ [📎] Import to Existing     →  │ │
│ └────────────────────────────────┘ │
│                                     │
│ Recent Projects                     │
│ ┌────────────────────────────────┐ │
│ │ [📁] Project Title             │ │
│ │      3 docs • 45 annotations   │ │
│ │      Last edited: 2h ago    [⋮]│ │
│ └────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Componentes:**
- Header fixo com avatar, título centralizado, botão settings
- Card principal: Create New Project (3 opções)
- Lista de projetos recentes (cards scrollable)
- Background: `bg-primary-lightest`

---

### 2. Text Editor Screen
**Referência:** `docs/UX_UI_REFERENCES/main-text_editor_screen_1/`, `main-text_editor_screen_2/`

**Layout:**
```
┌─────────────────────────────────────┐
│ [←] dpnotes.ai          Export      │ <- Header sticky (backdrop-blur)
├─────────────────────────────────────┤
│ Documento: Deep Research...    [⋮]  │
├─────────────────────────────────────┤
│                                     │
│ Aqui está uma frase de exemplo     │
│ que o usuário pode escrever.       │
│                                     │
│ Quando o usuário seleciona, ela    │
│ fica destacada. [🏷️ Expandir][🎤][✏️]│
│                                     │
│ Esta é outra frase que mostra      │
│ múltiplas anotações em camadas.    │
│ [🏷️ Simplificar][🏷️ Corrigir][✏️][🎤]│
│                                     │
│ ⋮                                   │
│                                     │
└─────────────────────────────────────┘
```

**Componentes:**
- Header com botão voltar e "Export"
- Título do documento com menu (⋮)
- Área de texto com scroll
- Texto selecionado: `bg-highlight`
- Badges inline com labels e ícones
- Background: `bg-white`

---

### 3. Annotation Modal
**Referência:** `docs/UX_UI_REFERENCES/annotation_modal/`

**Layout:**
```
┌─────────────────────────────────────┐
│        [Overlay bg-black/50]        │
│                                     │
│ ┌─ Bottom Sheet (rounded-t-xl) ───┐│
│ │         [Handle bar]             ││
│ │                                  ││
│ │ "Selected sentence text..."      ││
│ │ (highlighted background)         ││
│ │                                  ││
│ │ Labels                           ││
│ │ [Expand] [Simpl] [Remove] [+ Nova]││
│ │                                  ││
│ │ Gravação de Áudio                ││
│ │ [⏺️ Toque para gravar (máx 2min)]││
│ │                                  ││
│ │ Anotação de Texto                ││
│ │ [Textarea input field...]        ││
│ │                                  ││
│ │ [Cancelar]         [Salvar]      ││
│ └──────────────────────────────────┘│
└─────────────────────────────────────┘
```

**Componentes:**
- Overlay escuro (50% opacity)
- Bottom sheet com handle (drag indicator)
- Sentença destacada com borda esquerda
- Seção de labels (chips selecionáveis)
- Botão de gravação de áudio
- Textarea para nota de texto
- Botões de ação (Cancelar/Salvar)

---

### 4. Export Preview Screen
**Referência:** `docs/UX_UI_REFERENCES/export_preview/`

**Layout:**
```
┌─────────────────────────────────────┐
│ [←] dpnotes.ai        Configurar    │ <- Header sticky
├─────────────────────────────────────┤
│ Sumário das Anotações               │
│                                     │
│ [📝] [T1] Expandir                  │
│      Expandir esta seção para...   │
│                                     │
│ [✏️] [T2] Reformular                │
│      Simplificar esta frase...     │
│                                     │
│ [🎤] [T3] Áudio                     │
│      "Aqui eu quero que..."        │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ Texto Anotado                       │
│                                     │
│ Esta é uma sentença... [T1]        │
│                                     │
│ Esta sentença está... [T2][T3]     │
│                                     │
│ ⋮                                   │
│                                     │
│      [📋 Copiar Prompt]             │ <- Fixed bottom
│                                     │
└─────────────────────────────────────┘
```

**Componentes:**
- Header com voltar e "Configurar"
- Seção: Sumário das Anotações (lista de cards)
- Separador visual
- Seção: Texto Anotado (com referências [T1], [T2], etc.)
- Botão fixo no bottom: "Copiar Prompt"
- Background: `bg-pastel-bg` (#fff2f0)

---

### 5. Settings/Profile Screen
**Referência:** `docs/UX_UI_REFERENCES/profile-settings/`

**Layout:**
```
┌─────────────────────────────────────┐
│ [←]  Profile & Settings             │ <- Header
├─────────────────────────────────────┤
│                                     │
│ Account                             │
│ ┌─────────────────────────────────┐ │
│ │ [Avatar] Alex Thompson       →  │ │
│ │          alex@email.com         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ [🔔] Notifications          →  ┐ │
│ ┌─ [🔐] Security Settings      →  ┐ │
│ ┌─ [💳] Manage Subscription    →  ┐ │
│                                     │
│ App Info                            │
│ ┌─ [ℹ️] About dpnotes.ai       →  ┐ │
│ ┌─ [📄] Terms of Service       →  ┐ │
│ ┌─ [🔒] Privacy Policy         →  ┐ │
│                                     │
│ [🗑️ Remove All Data]               │
│                                     │
└─────────────────────────────────────┘
```

**Componentes:**
- Header com título e botão voltar
- Seções agrupadas (Account, App Info)
- Cards de opção com ícone, título, descrição, seta
- Botão destrutivo no final (vermelho)
- Background: `bg-primary-lightest`

---

### 6. Manage Tags Screen
**Referência:** `docs/UX_UI_REFERENCES/manage-tags-list/`

**Layout:**
```
┌─────────────────────────────────────┐
│ [←] Manage Tags           Done      │ <- Header sticky
├─────────────────────────────────────┤
│                                     │
│ PRE-DEFINED                         │
│ ┌─────────────────────────────────┐ │
│ │ Expand                          │ │
│ │ Elaborate on the selected text. │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Summarize                       │ │
│ │ Condense the key points.        │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Concept Details                 │ │
│ │ Explain concepts in more detail.│ │
│ └─────────────────────────────────┘ │
│                                     │
│ CUSTOM                              │
│ ┌─────────────────────────────────┐ │
│ │ Key Argument             [✏️][🗑️]│ │
│ │ Identify the main argument.     │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Counterpoint             [✏️][🗑️]│ │
│ │ Find opposing viewpoints.       │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Citation needed          [✏️][🗑️]│ │
│ └─────────────────────────────────┘ │
│                                     │
│                                     │
│                              [+ FAB]│ <- Fixed bottom-right
└─────────────────────────────────────┘
```

**Componentes:**
- Header com título e botão "Done"
- Duas seções: PRE-DEFINED e CUSTOM (headers uppercase)
- Tags pré-definidas: Apenas exibição (sem botões de ação)
- Tags customizadas: Com botões edit e delete
- FAB (Floating Action Button) fixo no canto inferior direito
- Background: `bg-subtle` (#fff2f0)

---

### 7. Add New Tag Screen
**Referência:** `docs/UX_UI_REFERENCES/manage-tags-add-tag/`

**Layout:**
```
┌─────────────────────────────────────┐
│ [←] Add New Tag       dpnotes.ai    │ <- Header sticky
├─────────────────────────────────────┤
│                                     │
│ Tag Label                           │
│ ┌─────────────────────────────────┐ │
│ │ e.g. Key Concept                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Description (Optional)              │
│ ┌─────────────────────────────────┐ │
│ │ Add a short description...      │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│                                     │
│                                     │
│ ⋮                                   │
│                                     │
├─────────────────────────────────────┤
│ [    Cancel    ]  [     Save     ]  │ <- Footer fixed
└─────────────────────────────────────┘
```

**Componentes:**
- Header com botão voltar e branding
- Form com 2 campos:
  - Input: Tag Label (obrigatório)
  - Textarea: Description (opcional, 4 rows)
- Footer fixo com dois botões (grid 2 colunas)
  - Cancel: `bg-badge` (light gray)
  - Save: `bg-accent` (coral pastel)
- Background: `bg-white`

---

### 8. Tag Management Components

#### Tag List Item (Pre-defined)
```tsx
// Baseado em: manage-tags-list/
<div className="
  flex items-center p-3
  bg-white rounded-lg
">
  <div className="flex-grow">
    <p className="font-semibold text-primary">Tag Name</p>
    <p className="text-sm text-primary-light">Tag description</p>
  </div>
</div>
```

#### Tag List Item (Custom - with actions)
```tsx
<div className="
  flex items-center p-3
  bg-white rounded-lg
">
  <div className="flex-grow">
    <p className="font-semibold text-primary">Custom Tag Name</p>
    <p className="text-sm text-primary-light">Tag description</p>
  </div>
  <div className="flex items-center gap-1">
    <button className="
      flex size-9 items-center justify-center
      rounded-full text-primary-light
      hover:bg-subtle transition-colors
    ">
      <span className="material-symbols-outlined text-xl">edit</span>
    </button>
    <button className="
      flex size-9 items-center justify-center
      rounded-full text-primary-light
      hover:bg-subtle transition-colors
    ">
      <span className="material-symbols-outlined text-xl">delete</span>
    </button>
  </div>
</div>
```

#### Floating Action Button (FAB)
```tsx
<button className="
  fixed bottom-6 right-4 z-20
  flex size-14 items-center justify-center
  rounded-xl bg-accent
  text-primary shadow-lg
  hover:scale-105 transition-transform
">
  <span className="material-symbols-outlined text-3xl">add</span>
</button>
```

#### Section Header
```tsx
<h2 className="
  mb-2 text-sm font-semibold uppercase
  text-primary-light
">
  Section Name
</h2>
```

---

### 9. Onboarding/Auth Screens
**Referência:** `docs/UX_UI_REFERENCES/onboarding/`, `signin/`, `signup/`

**Login/Signup Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│         [Logo/Illustration]         │
│                                     │
│         Welcome to dpnotes.ai       │
│         Deep Research Made Easy     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Email                           │ │
│ │ [input field]                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Password                        │ │
│ │ [input field]                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│        [Continue Button]            │
│                                     │
│ ─────────── or ───────────          │
│                                     │
│ [🔵 Continue with Google]           │
│ [⚫ Continue with Apple]            │
│                                     │
│   Don't have an account? Sign up    │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎭 Interações e Estados

### Touch Targets
```typescript
const touchTargets = {
  minimum: 44,      // Mínimo recomendado (Apple HIG)
  comfortable: 48,  // Preferencial para ações principais
  large: 56,        // Para botões importantes
};
```

### Transitions e Animations
```typescript
const transitions = {
  fast: '150ms',      // Hover states, ripple effects
  normal: '200ms',    // Button presses, color changes
  slow: '300ms',      // Modal appearances, page transitions
  
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',  // ease-in-out
    in: 'cubic-bezier(0.4, 0, 1, 1)',         // ease-in
    out: 'cubic-bezier(0, 0, 0.2, 1)',        // ease-out
  }
};
```

### Estados Visuais

#### Hover States
```css
/* Buttons */
hover:bg-opacity-90
hover:bg-primary-lighter

/* Cards */
hover:bg-primary-lightest
hover:shadow-md

/* Icons */
hover:text-primary
```

#### Focus States
```css
focus:border-primary
focus:ring-2
focus:ring-primary/20
focus:outline-none
```

#### Active/Pressed States
```css
active:scale-95
active:bg-primary
```

#### Disabled States
```css
disabled:opacity-50
disabled:cursor-not-allowed
disabled:pointer-events-none
```

---

## 🌓 Dark Mode

> **⚠️ NOTA:** Dark mode **não está implementado** nas telas HTML de referência. Esta seção documenta apenas o planejamento futuro (não prioritário).

**Status:** ⏸️ Planejado (não prioritário)

**Quando implementado**, o dark mode poderá usar classes do Tailwind (`dark:`) com a seguinte paleta sugerida:

```typescript
const darkColors = {
  background: '#1A202C',       // Fundo principal
  surface: '#2D3748',          // Cards e superfícies
  primary: '#4A5568',          // Ícones e textos
  accent: '#ffccc3',           // Mantém o coral pastel
  textPrimary: '#F7FAFC',      // Texto principal
  textSecondary: '#E2E8F0',    // Texto secundário
  border: '#4A5568',           // Bordas
};
```

**Exemplo de uso futuro:**
```tsx
<div className="
  bg-white dark:bg-background-dark
  text-text-primary dark:text-zinc-100
">
  Content
</div>
```

**Decisão:** Implementar dark mode apenas após MVP em Light Mode estar completo.

---

## ♿ Acessibilidade

### Princípios Seguidos

1. **Contraste de Cores:** Mínimo WCAG AA (4.5:1 para texto normal)
2. **Touch Targets:** Mínimo 44x44px
3. **Keyboard Navigation:** Suporte completo via teclado
4. **Screen Readers:** Labels descritivos e ARIA attributes
5. **Dynamic Type:** Suporte a tamanhos de fonte do sistema

### Implementação

```tsx
// Botões acessíveis
<button
  aria-label="Open settings"
  role="button"
  className="..."
>
  <span className="material-symbols-outlined">settings</span>
</button>

// Inputs acessíveis
<label htmlFor="email" className="...">
  Email
</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-describedby="email-error"
/>

// Links acessíveis
<a
  href="/project/123"
  aria-label="Open project: Research Notes"
>
  Research Notes
</a>
```

---

## 📱 Responsividade

### Breakpoints
```typescript
const breakpoints = {
  sm: 375,    // iPhone SE, small phones
  md: 414,    // iPhone 11 Pro Max, standard phones
  lg: 768,    // iPad Mini, tablets portrait
  xl: 1024,   // iPad Pro, tablets landscape
};
```

### Layout Adaptations

- **Mobile (< 768px):** Layout em coluna única, navegação em tabs
- **Tablet (768px - 1024px):** Possível layout em 2 colunas para editor
- **Desktop (> 1024px):** Layout otimizado com sidebars

---

## 📚 Referências Visuais

Todas as telas estão disponíveis em `docs/UX_UI_REFERENCES/` com:
- `code.html` - Implementação HTML/Tailwind completa
- `screen.png` - Screenshot da tela renderizada

### Navegação por Categoria:

**Authentication:**
- `onboarding/` - Carrossel de onboarding
- `signin/` - Login com social auth
- `signup/` - Registro com social auth

**Main App:**
- `home/` - Home screen com projetos
- `home-empty-state/` - Home sem projetos
- `all-projects/` - Lista completa de projetos
- `all-projects-action/` - Projetos com ações
- `main-text_editor_screen_1/` - Editor principal
- `main-text_editor_screen_2/` - Editor com opções
- `annotation_modal/` - Modal de anotações
- `export_preview/` - Preview de exportação
- `manage-tags-list/` - Gerenciamento de tags
- `manage-tags-add-tag/` - Adicionar nova tag

**Settings & Profile:**
- `profile-settings/` - Perfil e configurações
- `profile-settings-empty-state/` - Perfil sem dados
- `profile-settings-account-details/` - Detalhes da conta
- `profile-manage-subscription/` - Gerenciar assinatura
- `security-settings/` - Configurações de segurança
- `security-settings-2fa/` - Two-factor authentication
- `security-settings-change-password/` - Alterar senha
- `settings-remove-all-data/` - Confirmar ação destrutiva
- `about/` - Sobre o app

---

## 🎯 Próximos Passos

1. **Converter HTML → React Native**
   - Usar NativeWind para manter as classes Tailwind
   - Adaptar componentes HTML para componentes React Native

2. **Implementar Componentes Base**
   - Button variants (Primary, Secondary, Ghost)
   - Card variants (Project, Settings)
   - Input components (Text, Textarea)
   - Modal components (Bottom Sheet)

3. **Criar Theme Provider**
   - Color tokens centralizados (Light Mode)
   - Typography system
   - (Dark mode pode ser adicionado posteriormente)

4. **Adicionar Animações**
   - Reanimated 2 para animações performáticas
   - Gesture Handler para interações

---

**Última atualização:** 2025-11-10
**Status:** ✅ Todas as 22 telas HTML (Light Mode) implementadas e documentadas
