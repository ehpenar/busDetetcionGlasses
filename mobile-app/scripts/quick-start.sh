#!/bin/bash

# 🚀 Quick Start Script para Bus Detection Mobile App
# Este script automatiza todo el proceso de inicio

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🐳 Bus Detection Mobile - Quick Start${NC}"
echo "=================================="
echo ""

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}❌ Docker no está instalado${NC}"
    echo "Por favor instala Docker desde: https://www.docker.com/get-started"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}❌ Docker Compose no está instalado${NC}"
    echo "Por favor instala Docker Compose desde: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker y Docker Compose están instalados${NC}"

# Construir imagen
echo -e "${BLUE}🔨 Construyendo imagen de Docker...${NC}"
docker-compose build --no-cache

# Iniciar contenedor
echo -e "${BLUE}🚀 Iniciando aplicación...${NC}"
docker-compose up -d

# Esperar a que el contenedor esté listo
echo -e "${BLUE}⏳ Esperando a que la aplicación esté lista...${NC}"
sleep 10

# Verificar estado
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}🎉 ¡Aplicación iniciada correctamente!${NC}"
    echo ""
    echo -e "${YELLOW}📱 Próximos pasos:${NC}"
    echo "1. Instala 'Expo Go' en tu celular:"
    echo "   - iOS: https://apps.apple.com/app/expo-go/id982107779"
    echo "   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent"
    echo ""
    echo "2. Abre Expo Go y escanea el código QR que aparece en:"
    echo "   - Metro Bundler: http://localhost:19000"
    echo "   - Expo DevTools: http://localhost:19001"
    echo ""
    echo "3. Para ver logs en tiempo real:"
    echo "   ./scripts/docker-dev.sh logs"
    echo ""
    echo "4. Para detener la aplicación:"
    echo "   ./scripts/docker-dev.sh stop"
    echo ""
    echo -e "${GREEN}¡Disfruta detectando objetos con tu celular! 🎯${NC}"
else
    echo -e "${YELLOW}❌ Error iniciando la aplicación${NC}"
    echo "Revisa los logs con: ./scripts/docker-dev.sh logs"
    exit 1
fi
