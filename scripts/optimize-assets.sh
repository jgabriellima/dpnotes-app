#!/bin/bash

# Script para otimizar assets e reduzir tamanho do app
# Reduz o tamanho das imagens mantendo qualidade aceitável

echo "🔧 Otimizando assets para reduzir tamanho do app..."

# Criar backup
echo "📦 Criando backup..."
mkdir -p assets/backup
cp assets/icon.png assets/backup/
cp assets/adaptive-icon.png assets/backup/
cp assets/splash-icon.png assets/backup/
cp assets/images/logo-transparent.png assets/backup/

# Otimizar icon.png (1024x1024)
echo "🖼️  Otimizando icon.png..."
convert assets/icon.png -strip -quality 85 -resize 1024x1024 assets/icon-temp.png
mv assets/icon-temp.png assets/icon.png

# Otimizar adaptive-icon.png (1024x1024)
echo "🖼️  Otimizando adaptive-icon.png..."
convert assets/adaptive-icon.png -strip -quality 85 -resize 1024x1024 assets/adaptive-icon-temp.png
mv assets/adaptive-icon-temp.png assets/adaptive-icon.png

# Otimizar splash-icon.png
echo "🖼️  Otimizando splash-icon.png..."
convert assets/splash-icon.png -strip -quality 85 assets/splash-icon-temp.png
mv assets/splash-icon-temp.png assets/splash-icon.png

# Otimizar logo-transparent.png
echo "🖼️  Otimizando logo-transparent.png..."
convert assets/images/logo-transparent.png -strip -quality 85 assets/images/logo-transparent-temp.png
mv assets/images/logo-transparent-temp.png assets/images/logo-transparent.png

# Mostrar resultados
echo ""
echo "✅ Otimização concluída!"
echo ""
echo "📊 Tamanhos após otimização:"
ls -lh assets/icon.png | awk '{print "icon.png: " $5}'
ls -lh assets/adaptive-icon.png | awk '{print "adaptive-icon.png: " $5}'
ls -lh assets/splash-icon.png | awk '{print "splash-icon.png: " $5}'
ls -lh assets/images/logo-transparent.png | awk '{print "logo-transparent.png: " $5}'
echo ""
echo "💾 Backups salvos em: assets/backup/"


