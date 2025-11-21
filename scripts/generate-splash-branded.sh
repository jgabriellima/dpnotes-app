#!/bin/bash

# 🎨 Generate Branded Splash Screen for dpnotes
# Com degradê coral e identidade visual

set -e

echo "🎨 dpnotes - Branded Splash Generator"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ ImageMagick não está instalado!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ ImageMagick encontrado!${NC}"
echo ""

# Paths
LOGO_SOURCE="assets/images/logo-icon.png"
SPLASH_OUTPUT="assets/splash-icon.png"

# Check if source logo exists
if [ ! -f "$LOGO_SOURCE" ]; then
    echo -e "${RED}❌ Logo não encontrado: $LOGO_SOURCE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Logo encontrado: $LOGO_SOURCE${NC}"
echo ""

echo "🎨 Criando splash screen com degradê coral..."
echo ""

# Create splash with gradient and logo
# Gradient: #FF9580 (light coral) -> #FF7B61 (brand coral) -> #FF6B4E (darker coral)
magick -size 1242x2436 \
  gradient:"#FF9580-#FF7B61" \
  \( +clone -rotate 180 \) \
  -append -crop 1242x2436+0+0 \
  \( "$LOGO_SOURCE" -resize 500x500 -background none -gravity center -extent 500x500 \) \
  -gravity center -composite \
  "$SPLASH_OUTPUT" 2>/dev/null || \
convert -size 1242x2436 \
  gradient:"#FF9580-#FF7B61" \
  \( "$LOGO_SOURCE" -resize 500x500 \) \
  -gravity center -composite \
  "$SPLASH_OUTPUT"

if [ -f "$SPLASH_OUTPUT" ]; then
    SIZE=$(du -h "$SPLASH_OUTPUT" | cut -f1)
    echo -e "${GREEN}✅ Splash screen branded criado!${NC} ($SPLASH_OUTPUT - $SIZE)"
else
    echo -e "${RED}❌ Erro ao criar splash screen${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Splash screen atualizado com sucesso!${NC}"
echo ""
echo "Próximos passos:"
echo "  1. Feche o app completamente"
echo "  2. Reabra para ver o novo splash"
echo ""

