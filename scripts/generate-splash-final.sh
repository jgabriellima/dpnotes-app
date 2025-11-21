#!/bin/bash

# 🎨 Generate Final Splash Screen for dpnotes
# Degradê coral + círculo sutil + logo integrado

set -e

echo "🎨 dpnotes - Final Splash Generator"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

# Paths
LOGO_SOURCE="assets/images/logo-icon.png"
SPLASH_OUTPUT="assets/splash-icon.png"

# Check ImageMagick
if ! command -v magick &> /dev/null; then
    echo "❌ ImageMagick não está instalado!"
    exit 1
fi

echo -e "${GREEN}✅ Gerando splash screen...${NC}"
echo ""

# Remove fundo branco do logo e cria splash com degradê + círculo
magick "$LOGO_SOURCE" -fuzz 15% -transparent white /tmp/logo-no-bg.png

magick -size 1242x2436 gradient:"#FFB4A3-#FF7B61" \
  \( -size 800x800 xc:none -fill "rgba(255,255,255,0.2)" -draw "circle 400,400 400,50" \) \
  -gravity center -composite \
  \( /tmp/logo-no-bg.png -resize 600x600 \) \
  -gravity center -composite \
  "$SPLASH_OUTPUT"

# Otimiza o arquivo para carregar mais rápido
echo "⏳ Otimizando..."
magick "$SPLASH_OUTPUT" -colors 256 -quality 80 "$SPLASH_OUTPUT"

if [ -f "$SPLASH_OUTPUT" ]; then
    SIZE=$(du -h "$SPLASH_OUTPUT" | cut -f1)
    echo -e "${GREEN}✅ Splash screen criado com sucesso!${NC} ($SIZE)"
    echo ""
    echo "📱 Teste no app:"
    echo "   make ios     # iOS"
    echo "   make android # Android"
    echo ""
else
    echo "❌ Erro ao criar splash screen"
    exit 1
fi

