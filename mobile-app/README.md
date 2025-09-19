# Bus Detection Mobile App

Una aplicación móvil que replica la funcionalidad de detección de objetos en tiempo real usando la cámara del celular, basada en el código Python original.

## Características

- 📱 **Detección en tiempo real** usando la cámara del celular
- 🔄 **Cambio de cámara** entre frontal y trasera
- 🎯 **Detección de objetos** con bounding boxes
- 🏷️ **Etiquetas personalizadas** (person → gay, como en el código original)
- 📊 **Métricas en tiempo real** (FPS, número de detecciones)
- 🎨 **Interfaz intuitiva** con controles táctiles
- 🐳 **Desarrollo con Docker** para aislamiento completo

## Requisitos

### Opción 1: Docker (Recomendado)
- Docker y Docker Compose
- Dispositivo móvil con cámara
- Conexión a internet

### Opción 2: Instalación Local
- Node.js (versión 16 o superior)
- Expo CLI
- Dispositivo móvil con cámara
- Conexión a internet (para descargar el modelo de IA)

## Instalación

### 🐳 Con Docker (Recomendado)

1. **Verificar Docker**:
```bash
docker --version
docker-compose --version
```

2. **Inicio rápido**:
```bash
cd mobile-app
./scripts/quick-start.sh
```

3. **O manualmente**:
```bash
cd mobile-app
docker-compose build
docker-compose up -d
```

4. **Instalar Expo Go** en tu celular:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

5. **Escanear el código QR** desde:
   - Metro Bundler: http://localhost:19000
   - Expo DevTools: http://localhost:19001

### 📱 Instalación Local

1. **Instalar Expo CLI** (si no lo tienes):
```bash
npm install -g @expo/cli
```

2. **Navegar al directorio del proyecto**:
```bash
cd mobile-app
```

3. **Instalar dependencias**:
```bash
npm install
```

4. **Iniciar el servidor de desarrollo**:
```bash
npx expo start
```

5. **Instalar Expo Go** en tu celular y escanear el código QR

## Uso

### 🐳 Comandos Docker

```bash
# Inicio rápido
./scripts/quick-start.sh

# Comandos individuales
./scripts/docker-dev.sh build     # Construir imagen
./scripts/docker-dev.sh start     # Iniciar contenedor
./scripts/docker-dev.sh stop      # Detener contenedor
./scripts/docker-dev.sh restart   # Reiniciar contenedor
./scripts/docker-dev.sh logs      # Ver logs en tiempo real
./scripts/docker-dev.sh status    # Ver estado de contenedores
./scripts/docker-dev.sh cleanup   # Limpiar todo
```

### 📱 Uso de la App

1. **Permisos de cámara**: La app solicitará permisos para acceder a la cámara
2. **Cambiar cámara**: Toca el botón 🔄 para alternar entre cámara frontal y trasera
3. **Detección manual**: Toca el botón 🔍 para detectar objetos en el frame actual
4. **Detección continua**: Toca el botón ▶️ para iniciar detección automática
5. **Salir**: Presiona el botón de atrás o cierra la app

## Funcionalidades

### Detección de Objetos
- Utiliza el modelo COCO-SSD para detectar objetos comunes
- Muestra bounding boxes alrededor de los objetos detectados
- Etiquetas con nombre de clase y confianza

### Personalización de Etiquetas
- Reemplaza automáticamente "person" por "gay" (como en el código original)
- Colores diferenciados: rojo para "gay", verde para otros objetos

### Métricas en Tiempo Real
- FPS (Frames Per Second) actualizado cada 30 frames
- Contador de detecciones activas
- Estado del modelo (cargado/cargando)

## Estructura del Proyecto

```
mobile-app/
├── App.js                    # Componente principal
├── package.json              # Dependencias
├── app.json                 # Configuración de Expo
├── Dockerfile               # Configuración de Docker
├── docker-compose.yml       # Orquestación de contenedores
├── .dockerignore            # Archivos excluidos de Docker
├── scripts/
│   ├── docker-dev.sh        # Script de desarrollo con Docker
│   └── quick-start.sh       # Script de inicio rápido
└── README.md                # Este archivo
```

## Tecnologías Utilizadas

- **React Native**: Framework para desarrollo móvil
- **Expo**: Plataforma para desarrollo React Native
- **TensorFlow.js**: Librería de machine learning para JavaScript
- **expo-camera**: Módulo para acceso a la cámara
- **COCO-SSD**: Modelo pre-entrenado para detección de objetos
- **Docker**: Contenedorización para desarrollo aislado
- **Docker Compose**: Orquestación de contenedores

## Limitaciones Actuales

- El modelo de detección es una versión simplificada para demostración
- Para detección en tiempo real completa, se necesitaría optimización adicional
- La detección continua puede consumir batería rápidamente

## Próximas Mejoras

- [ ] Integración con YOLO nativo para mejor rendimiento
- [ ] Guardado de imágenes con detecciones
- [ ] Filtros de confianza configurables
- [ ] Modo de grabación de video
- [ ] Detección específica de buses (como en el proyecto original)

## Solución de Problemas

### 🐳 Problemas con Docker

#### Docker no está instalado
```bash
# macOS
brew install docker docker-compose

# Windows
# Descargar Docker Desktop desde https://www.docker.com/get-started

# Linux
sudo apt-get install docker.io docker-compose
```

#### Error de permisos en Docker
```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
# Reiniciar sesión
```

#### Contenedor no inicia
```bash
# Ver logs detallados
./scripts/docker-dev.sh logs

# Limpiar y reconstruir
./scripts/docker-dev.sh cleanup
./scripts/docker-dev.sh build
```

### 📱 Problemas con la App

#### La cámara no funciona
- Verifica que hayas otorgado permisos de cámara
- Reinicia la app
- Verifica que no haya otras apps usando la cámara

#### El modelo no carga
- Verifica tu conexión a internet
- Reinicia la app
- Verifica que tengas suficiente espacio de almacenamiento

#### Rendimiento lento
- Cierra otras apps en segundo plano
- Reduce la frecuencia de detección
- Usa un dispositivo más potente

#### No puedo conectar con Expo Go
- Verifica que estés en la misma red WiFi
- Asegúrate de que los puertos 19000-19002 estén abiertos
- Prueba escanear el QR desde Expo DevTools: http://localhost:19001

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
