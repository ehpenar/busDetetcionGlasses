# 🐳 Dockerfile para Bus Detection Mobile App
# Este archivo define cómo construir la imagen de Docker

# Usar Node.js 18 Alpine (ligero y seguro)
FROM node:18-alpine

# 📝 Explicación: Alpine Linux es una distribución muy ligera (5MB vs 200MB+ de Ubuntu)
# Node.js 18 es la versión LTS (Long Term Support) más estable

# Establecer directorio de trabajo dentro del contenedor
WORKDIR /app

# 📝 Explicación: WORKDIR crea y navega al directorio /app dentro del contenedor
# Todo lo que copiemos y ejecutemos estará en este directorio

# Instalar dependencias del sistema necesarias para Expo
RUN apk add --no-cache \
    git \
    curl \
    bash \
    python3 \
    make \
    g++

# 📝 Explicación: apk es el gestor de paquetes de Alpine Linux
# Instalamos herramientas necesarias para compilar dependencias nativas

# Copiar archivos de configuración de Node.js
COPY package*.json ./

# 📝 Explicación: Copiamos package.json y package-lock.json primero
# Esto permite que Docker cache las dependencias si no cambian

# Instalar dependencias de Node.js
RUN npm install --omit=dev --legacy-peer-deps

# 📝 Explicación: npm install instala las dependencias
# --omit=dev instala solo dependencias de producción (no devDependencies)

# Instalar Expo CLI globalmente dentro del contenedor
RUN npm install -g @expo/cli

# 📝 Explicación: Expo CLI se instala globalmente dentro del contenedor
# No afecta tu sistema host, solo el contenedor

# Copiar el código fuente de la aplicación
COPY . .

# 📝 Explicación: Copiamos todos los archivos del proyecto al contenedor
# El .dockerignore excluirá archivos innecesarios

# Exponer el puerto que usa Expo
EXPOSE 19000 19001 19002

# 📝 Explicación: Expo usa múltiples puertos:
# 19000: Metro bundler (servidor de desarrollo)
# 19001: Expo DevTools
# 19002: Expo DevTools (alternativo)

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S expo -u 1001 -G nodejs

# 📝 Explicación: Por seguridad, no ejecutamos como root
# Creamos un usuario específico para la aplicación

# Cambiar al usuario no-root
USER expo

# 📝 Explicación: Cambiamos al usuario expo antes de ejecutar la app
# Esto previene vulnerabilidades de seguridad

# Comando por defecto
CMD ["npx", "expo", "start", "--lan"]

# 📝 Explicación: --lan permite conexiones desde la red local
# Esto hace que la app sea accesible desde el celular en la misma red WiFi
