# Color Palette - dpnotes.ai

## Paleta Coral Pastel (Light Mode)

### Primary Colors - Coral
```
primary-darker:  #ff6b52  🟠 Coral escuro (alto contraste) - Para ícones e elementos importantes
primary-dark:    #ff8674  🟠 Coral médio escuro
primary:         #ffccc3  🟠 Coral pastel (main accent)
primary-light:   #ffd9d2  🟠 Coral pastel médio
primary-lighter: #ffe6e1  🟠 Coral pastel claro
primary-lightest:#fff2f0  🟠 Coral pastel mais claro (background)
```

### Quando Usar

#### `primary-darker` (#ff6b52)
- ✅ Ícones principais (ex: ícones de ações, avatar icons)
- ✅ Links importantes (ex: "View All")
- ✅ Elementos que precisam de alto contraste
- ✅ CTAs secundários

#### `primary-dark` (#ff8674)
- ✅ Hover states
- ✅ Ícones secundários
- ✅ Elementos decorativos com mais destaque

#### `primary` (#ffccc3)
- ✅ Botões principais
- ✅ Badges e pills
- ✅ Highlights suaves

#### `primary-light` (#ffd9d2)
- ✅ Backgrounds de botões secundários
- ✅ Hover states suaves

#### `primary-lighter` (#ffe6e1)
- ✅ Backgrounds de cards e seções
- ✅ Icon containers

#### `primary-lightest` (#fff2f0)
- ✅ Background principal do app
- ✅ Áreas de conteúdo

### Text Colors
```
text-primary:   #2D313E  ⚫ Texto principal (cinza escuro)
text-secondary: #6C6F7D  ⚫ Texto secundário (cinza médio)
```

### Functional Colors
```
badge:             #ffe6e1  🏷️  Badge background
highlight:         #fff9d9  ⭐  Text highlight
destructive:       #FF5C5C  🔴  Destructive actions
destructive-light: #FFE5E5  🔴  Destructive background
```

## Dark Mode (Future Implementation)
```
dark-background:    #1A202C
dark-surface:       #2D3748
dark-primary:       #4A5568
dark-accent:        #ffccc3
dark-text-primary:  #F7FAFC
dark-text-secondary:#E2E8F0
dark-border:        #4A5568
```

## Diretrizes de Contraste

### ✅ Alto Contraste (Melhor)
- Ícones importantes: `primary-darker` (#ff6b52)
- Textos: `text-primary` (#2D313E)
- Links e CTAs: `primary-darker` (#ff6b52)

### ⚠️ Médio Contraste
- Ícones decorativos: `primary-dark` (#ff8674)
- Subtítulos: `text-secondary` (#6C6F7D)

### ❌ Baixo Contraste (Evitar para elementos importantes)
- `primary` (#ffccc3) - Usar apenas em backgrounds ou elementos grandes
- Não usar para ícones pequenos ou textos importantes

## Exemplos de Uso

### Home Screen
- Avatar icon: `primary-darker` ✅
- Create project icons: `primary-darker` ✅
- "View All" link: `primary-darker` ✅
- Icon backgrounds: `primary-lighter`
- Card backgrounds: `white` (#ffffff)
- Screen background: `primary-lightest`

### Buttons
- Primary button bg: `primary`
- Primary button text: `white`
- Secondary button bg: `primary-lighter`
- Secondary button text: `text-primary`

### Icons
- Action icons (high priority): `primary-darker` (#ff6b52)
- Decorative icons: `primary-dark` (#ff8674)
- Disabled icons: `text-secondary` (#6C6F7D)

