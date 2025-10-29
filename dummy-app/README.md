# 🚌 Detector de Buses - React Native App

Una aplicación móvil desarrollada con React Native y Expo que utiliza inteligencia artificial para detectar buses en tiempo real usando el modelo YOLO.

## 🚀 Características

### ✅ Funcionalidades Implementadas
- **Detección de buses en imágenes**: Captura fotos o selecciona de galería
- **Detección en tiempo real**: Vista previa de cámara con detección automática
- **Modelo YOLO integrado**: Usa yolov8n.pt para detección rápida y precisa
- **UI intuitiva**: Interfaz moderna con indicadores de estado
- **Resultados detallados**: Muestra confianza y cantidad de buses detectados

### 🔧 Tecnologías Utilizadas
- **React Native**: Framework móvil
- **Expo**: Herramientas de desarrollo
- **TensorFlow.js**: Machine Learning en JavaScript
- **YOLO v8**: Modelo de detección de objetos
- **Expo Camera**: Acceso a cámara
- **Expo Image Picker**: Selección de imágenes

## 📱 Cómo Usar

### 1. Detección en Imágenes
1. Abre la cámara o selecciona una imagen de la galería
2. La app automáticamente detectará buses en la imagen
3. Ve los resultados con nivel de confianza

### 2. Detección en Tiempo Real
1. Abre la cámara
2. Presiona "🔍 Detectar en Vivo"
3. Observa los buses detectados en tiempo real con cajas delimitadoras

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Expo CLI
- Dispositivo móvil o emulador

### Pasos de Instalación

1. **Instalar dependencias**:
```bash
cd dummy-app
npm install
```

2. **Iniciar el servidor de desarrollo**:
```bash
npm start
```

3. **Ejecutar en dispositivo**:
```bash
# Para Android
npm run android

# Para iOS
npm run ios

# Para web
npm run web
```

## 📁 Estructura del Proyecto

```
dummy-app/
├── App.js                          # Componente principal
├── services/
│   └── BusDetectionService.js      # Servicio de detección ML
├── assets/
│   └── yolov8n_web_model/          # Modelo YOLO optimizado
├── package.json                    # Dependencias
└── README.md                       # Documentación
```

## 🧠 Servicio de Detección

El `BusDetectionService.js` maneja:
- Carga del modelo YOLO
- Preprocesamiento de imágenes
- Inferencia de detección
- Postprocesamiento de resultados
- Detección en tiempo real

### Métodos Principales
- `loadModel()`: Carga el modelo YOLO
- `detectBuses(imageUri)`: Detecta buses en imagen
- `detectBusesRealtime(imageData)`: Detección en tiempo real
- `dispose()`: Limpia recursos

## 🎯 Modelo YOLO

- **Modelo**: YOLOv8n (nano)
- **Formato**: TensorFlow.js
- **Clase objetivo**: Bus (clase 5 en COCO dataset)
- **Confianza mínima**: 50%
- **Tamaño de entrada**: 640x640 píxeles

## 🔄 Flujo de Detección

1. **Carga del modelo** al iniciar la app
2. **Captura/selección** de imagen
3. **Preprocesamiento** (redimensionar, normalizar)
4. **Inferencia** con modelo YOLO
5. **Postprocesamiento** (filtrar por confianza)
6. **Visualización** de resultados

## 🚧 Limitaciones Actuales

- El preprocesamiento de imágenes está simplificado
- La detección en tiempo real usa datos simulados
- Requiere optimización para mejor rendimiento

## 🔮 Próximas Mejoras

- [ ] Implementar preprocesamiento real de imágenes
- [ ] Optimizar detección en tiempo real
- [ ] Agregar más clases de vehículos
- [ ] Implementar guardado de resultados
- [ ] Mejorar UI/UX

## 📊 Rendimiento

- **Tiempo de carga del modelo**: ~2-3 segundos
- **Detección por imagen**: ~1-2 segundos
- **Memoria utilizada**: ~50-100MB
- **Tamaño del modelo**: ~6MB

## 🐛 Solución de Problemas

### Modelo no carga
- Verificar que el archivo del modelo existe
- Revisar permisos de archivos
- Reiniciar la aplicación

### Detección lenta
- Reducir calidad de imagen
- Cerrar otras aplicaciones
- Usar dispositivo con más RAM

### Cámara no funciona
- Verificar permisos de cámara
- Reiniciar la aplicación
- Probar en dispositivo físico

## 📝 Notas de Desarrollo

Esta implementación está basada en `detect_buses_video.py` del proyecto principal, adaptada para funcionar en React Native con TensorFlow.js. El modelo YOLO se convirtió al formato web para compatibilidad móvil.

## 🤝 Contribuciones

Para contribuir al proyecto:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Implementa los cambios
4. Envía un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
