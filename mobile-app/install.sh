#!/bin/bash

echo "🚀 Instalando Bus Detection Mobile App"
echo "======================================"

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm"
    exit 1
fi

echo "✅ Node.js y npm están instalados"

# Instalar Expo CLI globalmente si no está instalado
if ! command -v expo &> /dev/null; then
    echo "📦 Instalando Expo CLI..."
    npm install -g @expo/cli
    if [ $? -eq 0 ]; then
        echo "✅ Expo CLI instalado correctamente"
    else
        echo "❌ Error instalando Expo CLI"
        exit 1
    fi
else
    echo "✅ Expo CLI ya está instalado"
fi

# Instalar dependencias del proyecto
echo "📦 Instalando dependencias del proyecto..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error instalando dependencias"
    exit 1
fi

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📱 Próximos pasos:"
echo "1. Instala 'Expo Go' en tu celular:"
echo "   - iOS: https://apps.apple.com/app/expo-go/id982107779"
echo "   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent"
echo ""
echo "2. Ejecuta la app:"
echo "   npx expo start"
echo ""
echo "3. Escanea el código QR con Expo Go"
echo ""
echo "¡Disfruta detectando objetos con tu celular! 🎯"
