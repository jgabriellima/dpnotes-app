# 📦 Guia de Otimização de Tamanho do App

Este documento contém estratégias para reduzir o tamanho final do aplicativo.

## 🎯 Tamanhos Esperados

| Build Type | Tamanho Esperado | Descrição |
|------------|------------------|-----------|
| **Development** | 100-150 MB | Build não otimizado com debug symbols |
| **Preview (APK)** | 40-80 MB | Build interno para testes, parcialmente otimizado |
| **Production (AAB)** | 15-30 MB | Build otimizado para Play Store |
| **Production (APK)** | 20-40 MB | Build otimizado standalone |

> **Nota**: A Play Store distribui APKs otimizados por arquitetura (~10-20 MB por dispositivo).

## ✅ Otimizações Já Implementadas

### 1. Assets Otimizados (~4.5 MB economizado)
- ✅ Ícones e splash screens comprimidos com pngquant
- ✅ Redução de 97-98% no tamanho das imagens
- ✅ Backup dos originais em `assets/backup/`

### 2. Configurações EAS Build
- ✅ Profile `production` usa AAB (Android App Bundle)
- ✅ Profile `production-apk` para APK otimizado
- ✅ Profile `preview` mantém APK para testes rápidos

## 🚀 Otimizações Adicionais Recomendadas

### Android ProGuard/R8 (Minificação de Código)

Adicione ao `android/app/build.gradle`:

```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

**Economia esperada**: 10-20 MB

### Habilitar Hermes Engine (Já Configurado)

✅ Já configurado em `app.json`:
```json
"jsEngine": "hermes"
```

**Benefícios**:
- Reduz tamanho do JS bundle
- Melhora performance de inicialização
- Menor uso de memória

### Remover Dependências Não Utilizadas

Revise periodicamente:
```bash
npx depcheck
```

### Code Splitting e Lazy Loading

Para componentes grandes, use lazy loading:

```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### Otimização de Imagens Runtime

Para imagens carregadas dinamicamente, considere:
- WebP format para Android/iOS moderno
- Lazy loading de imagens
- Placeholder progressivo

## 📊 Como Medir o Tamanho

### Durante o Build

```bash
# Build preview para teste rápido
eas build --platform android --profile preview

# Build production otimizado
eas build --platform android --profile production
```

### Analisar Bundle

```bash
# Analisar JS bundle
npx react-native-bundle-visualizer

# Ver tamanho dos assets
du -sh assets/
```

### Comparar Profiles

```bash
# Preview (maior, mais rápido de buildar)
eas build --platform android --profile preview

# Production (menor, otimizado)
eas build --platform android --profile production
```

## 🎨 Otimização de Assets

### Comandos Úteis

```bash
# Otimizar novos PNGs adicionados
pngquant --quality=65-85 --ext .png --force path/to/image.png

# Otimizar todos os PNGs
find assets -name "*.png" -exec pngquant --quality=65-85 --ext .png --force {} \;

# Verificar tamanhos
find assets -type f -exec ls -lh {} \; | awk '{print $5 "\t" $9}' | sort -hr
```

### Diretrizes de Tamanho

| Tipo | Dimensões | Tamanho Max |
|------|-----------|-------------|
| App Icon | 1024x1024 | 100 KB |
| Adaptive Icon | 1024x1024 | 100 KB |
| Splash Screen | Variável | 200 KB |
| Logo | 512x512 | 50 KB |
| Outros Assets | Variável | 100 KB |

## 🏗️ Build Profiles Explicados

### `preview` Profile
```json
{
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```

**Quando usar**:
- ✅ Testes internos rápidos
- ✅ QA e validação de features
- ✅ Distribuição via QR code

**Características**:
- Build mais rápido (~5-10 min)
- Tamanho maior (40-80 MB)
- Sem assinatura da Play Store
- Instalação direta

### `production` Profile
```json
{
  "autoIncrement": true,
  "android": {
    "buildType": "aab"
  }
}
```

**Quando usar**:
- ✅ Deploy para Play Store
- ✅ Builds de release oficiais
- ✅ Máxima otimização

**Características**:
- Build mais lento (~15-20 min)
- Tamanho menor (15-30 MB)
- Otimizações completas
- Play Store faz split por arquitetura

### `production-apk` Profile
```json
{
  "extends": "production",
  "android": {
    "buildType": "apk"
  }
}
```

**Quando usar**:
- ✅ Distribuição fora da Play Store
- ✅ Testing builds otimizados
- ✅ Enterprise distribution

## 🔍 Troubleshooting

### Build Preview Muito Grande (>80 MB)

1. Verifique assets:
```bash
find assets -type f -size +100k -exec ls -lh {} \;
```

2. Rode otimização de assets:
```bash
./scripts/optimize-assets.sh
```

3. Limpe cache e rebuilde:
```bash
eas build --clear-cache --platform android --profile preview
```

### Build Production Não Reduziu Tamanho

1. Verifique se ProGuard está habilitado
2. Verifique configuração do Hermes
3. Analise o bundle com visualizer
4. Remova dependências não utilizadas

### Imagens Ficaram com Baixa Qualidade

Ajuste o quality do pngquant:
```bash
# Qualidade mais alta (arquivos maiores)
pngquant --quality=75-95 --ext .png --force image.png

# Qualidade balanceada (recomendado)
pngquant --quality=65-85 --ext .png --force image.png

# Qualidade menor (arquivos menores)
pngquant --quality=50-75 --ext .png --force image.png
```

## 📈 Benchmarks do Projeto

### Antes da Otimização
- Preview APK: **~83 MB**
- Assets: **4.6 MB**
- Principais culpados: ícones não otimizados

### Depois da Otimização
- Preview APK: **~40-50 MB** (estimado)
- Assets: **~1 MB**
- Redução: **~35-40 MB**

### Próximo Build Production (Esperado)
- Production AAB: **~20-30 MB**
- Production APK: **~25-35 MB**

## 🎓 Recursos Adicionais

- [React Native Performance](https://reactnative.dev/docs/performance)
- [EAS Build Configuration](https://docs.expo.dev/build/eas-json/)
- [Android App Bundle](https://developer.android.com/guide/app-bundle)
- [Hermes Engine](https://reactnative.dev/docs/hermes)

---

**Última atualização**: 2025-11-20
**Status**: Assets otimizados, produção configurada


