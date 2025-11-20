#!/bin/bash

# 🎨 Generate Splash Screen Assets for dpnotes
# Usage: ./scripts/generate-splash-assets.sh

set -e

echo "🎨 dpnotes - Splash Assets Generator"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ ImageMagick não está instalado!${NC}"
    echo ""
    echo "Instale com:"
    echo "  macOS:   brew install imagemagick"
    echo "  Ubuntu:  sudo apt-get install imagemagick"
    echo "  Windows: https://imagemagick.org/script/download.php"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ ImageMagick encontrado!${NC}"
echo ""

# Paths
LOGO_SOURCE="assets/images/logo-icon.png"
SPLASH_OUTPUT="assets/splash-icon.png"
ICON_OUTPUT="assets/icon.png"
ADAPTIVE_OUTPUT="assets/adaptive-icon.png"

# Check if source logo exists
if [ ! -f "$LOGO_SOURCE" ]; then
    echo -e "${RED}❌ Logo não encontrado: $LOGO_SOURCE${NC}"
    echo ""
    echo "Certifique-se de que o logo existe em:"
    echo "  assets/images/logo-icon.png"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Logo encontrado: $LOGO_SOURCE${NC}"
echo ""

# Ask for confirmation
echo "Isso vai gerar os seguintes assets:"
echo "  1. Splash Screen (1242x2436px) - Fundo branco"
echo "  2. App Icon (1024x1024px) - Fundo coral"
echo "  3. Adaptive Icon (1024x1024px) - Transparente"
echo ""
read -p "Continuar? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelado."
    exit 0
fi

echo ""
echo "🎨 Gerando assets..."
echo ""

# 1. Generate Splash Screen (1242x2436px, white background, logo centered)
echo "⏳ Gerando splash screen..."
convert -size 1242x2436 xc:white \
  "$LOGO_SOURCE" -resize 600x600 \
  -gravity center -composite \
  "$SPLASH_OUTPUT"

if [ -f "$SPLASH_OUTPUT" ]; then
    SIZE=$(du -h "$SPLASH_OUTPUT" | cut -f1)
    echo -e "${GREEN}✅ Splash screen criada!${NC} ($SPLASH_OUTPUT - $SIZE)"
else
    echo -e "${RED}❌ Erro ao criar splash screen${NC}"
    exit 1
fi

# 2. Generate App Icon (1024x1024px, coral background)
echo "⏳ Gerando app icon..."
convert -size 1024x1024 xc:"#FF7B61" \
  "$LOGO_SOURCE" -resize 800x800 \
  -gravity center -composite \
  "$ICON_OUTPUT"

if [ -f "$ICON_OUTPUT" ]; then
    SIZE=$(du -h "$ICON_OUTPUT" | cut -f1)
    echo -e "${GREEN}✅ App icon criado!${NC} ($ICON_OUTPUT - $SIZE)"
else
    echo -e "${RED}❌ Erro ao criar app icon${NC}"
    exit 1
fi

# 3. Generate Adaptive Icon (1024x1024px, transparent, centered for safe zone)
echo "⏳ Gerando adaptive icon..."
convert -size 1024x1024 xc:none \
  "$LOGO_SOURCE" -resize 650x650 \
  -gravity center -composite \
  "$ADAPTIVE_OUTPUT"

if [ -f "$ADAPTIVE_OUTPUT" ]; then
    SIZE=$(du -h "$ADAPTIVE_OUTPUT" | cut -f1)
    echo -e "${GREEN}✅ Adaptive icon criado!${NC} ($ADAPTIVE_OUTPUT - $SIZE)"
else
    echo -e "${RED}❌ Erro ao criar adaptive icon${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Todos os assets foram gerados com sucesso!${NC}"
echo ""
echo "Próximos passos:"
echo "  1. Verificar os assets gerados em assets/"
echo "  2. Testar no iOS:     npm run ios"
echo "  3. Testar no Android: npm run android"
echo ""
echo "Se quiser otimizar o tamanho dos arquivos:"
echo "  - Use TinyPNG: https://tinypng.com"
echo "  - Ou: pngquant assets/*.png --quality=70-85"
echo ""

