#!/bin/bash

# 🎨 Generate Premium Splash Screen for dpnotes
# Com degradê coral e logo transparente integrado

set -e

echo "🎨 dpnotes - Premium Splash Generator"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Paths
LOGO_TRANSPARENT="assets/images/logo-transparent.png"
LOGO_ICON="assets/images/logo-icon.png"
SPLASH_OUTPUT="assets/splash-icon.png"

# Check ImageMagick
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ ImageMagick não está instalado!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ ImageMagick encontrado!${NC}"

# Prefer transparent logo, fallback to icon
if [ -f "$LOGO_TRANSPARENT" ]; then
    LOGO_SOURCE="$LOGO_TRANSPARENT"
    echo -e "${GREEN}✅ Usando logo transparente${NC}"
else
    LOGO_SOURCE="$LOGO_ICON"
    echo -e "${YELLOW}⚠️  Logo transparente não encontrado, usando ícone${NC}"
fi

echo ""
echo "🎨 Opções de splash screen:"
echo ""
echo "1. Degradê Coral Suave (topo claro -> base escura)"
echo "2. Degradê Coral Vibrante (mais intenso)"
echo "3. Degradê Radial (centro claro)"
echo "4. Coral Sólido com Shape"
echo ""
read -p "Escolha uma opção [1-4] (padrão: 1): " choice
choice=${choice:-1}

echo ""
echo "🎨 Gerando splash screen..."

case $choice in
  2)
    # Degradê Vibrante
    echo "⏳ Degradê Coral Vibrante..."
    magick -size 1242x2436 \
      gradient:"#FFB4A3-#FF5533" \
      \( "$LOGO_SOURCE" -resize 600x600 -gravity center -extent 600x600 \) \
      -gravity center -composite \
      "$SPLASH_OUTPUT" 2>/dev/null || \
    convert -size 1242x2436 \
      gradient:"#FFB4A3-#FF5533" \
      \( "$LOGO_SOURCE" -resize 600x600 \) \
      -gravity center -composite \
      "$SPLASH_OUTPUT"
    ;;
    
  3)
    # Radial Gradient
    echo "⏳ Degradê Radial..."
    magick -size 1242x2436 radial-gradient:"#FFB4A3-#FF7B61" \
      \( "$LOGO_SOURCE" -resize 600x600 -gravity center -extent 600x600 \) \
      -gravity center -composite \
      "$SPLASH_OUTPUT" 2>/dev/null || \
    convert -size 1242x2436 radial-gradient:"#FFB4A3-#FF7B61" \
      \( "$LOGO_SOURCE" -resize 600x600 \) \
      -gravity center -composite \
      "$SPLASH_OUTPUT"
    ;;
    
  4)
    # Coral com Shape
    echo "⏳ Coral Sólido com Shape..."
    magick -size 1242x2436 xc:"#FF7B61" \
      \( -size 800x800 xc:none -fill "#FF9580" -draw "circle 400,400 400,0" \) \
      -gravity center -composite \
      \( "$LOGO_SOURCE" -resize 600x600 -gravity center -extent 600x600 \) \
      -gravity center -composite \
      "$SPLASH_OUTPUT" 2>/dev/null || \
    convert -size 1242x2436 xc:"#FF7B61" \
      \( "$LOGO_SOURCE" -resize 600x600 \) \
      -gravity center -composite \
      "$SPLASH_OUTPUT"
    ;;
    
  *)
    # Degradê Suave (padrão)
    echo "⏳ Degradê Coral Suave..."
    magick -size 1242x2436 \
      gradient:"#FFB4A3-#FF7B61" \
      \( "$LOGO_SOURCE" -resize 600x600 -gravity center -extent 600x600 \) \
      -gravity center -composite \
      "$SPLASH_OUTPUT" 2>/dev/null || \
    convert -size 1242x2436 \
      gradient:"#FFB4A3-#FF7B61" \
      \( "$LOGO_SOURCE" -resize 600x600 \) \
      -gravity center -composite \
      "$SPLASH_OUTPUT"
    ;;
esac

if [ -f "$SPLASH_OUTPUT" ]; then
    SIZE=$(du -h "$SPLASH_OUTPUT" | cut -f1)
    echo ""
    echo -e "${GREEN}✅ Splash screen premium criado!${NC} ($SPLASH_OUTPUT - $SIZE)"
    echo ""
    echo -e "${GREEN}🎉 Pronto!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "  1. Feche o app completamente"
    echo "  2. Reabra para ver o novo splash"
    echo ""
else
    echo -e "${RED}❌ Erro ao criar splash screen${NC}"
    exit 1
fi

