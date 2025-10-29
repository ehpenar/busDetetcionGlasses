import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Camera } from 'expo-camera';

const { width, height } = Dimensions.get('window');

const LABELS = {
  0: 'person',
  1: 'bicycle',
  2: 'car',
  3: 'motorcycle',
  4: 'airplane',
  5: 'bus',
  6: 'train',
  7: 'truck',
  8: 'boat',
  9: 'traffic light',
  10: 'fire hydrant',
  11: 'stop sign',
  12: 'parking meter',
  13: 'bench',
  14: 'bird',
  15: 'cat',
  16: 'dog',
  17: 'horse',
  18: 'sheep',
  19: 'cow',
  20: 'elephant',
  21: 'bear',
  22: 'zebra',
  23: 'giraffe',
  24: 'backpack',
  25: 'umbrella',
  26: 'handbag',
  27: 'tie',
  28: 'suitcase',
  29: 'frisbee',
  30: 'skis',
  31: 'snowboard',
  32: 'sports ball',
  33: 'kite',
  34: 'baseball bat',
  35: 'baseball glove',
  36: 'skateboard',
  37: 'surfboard',
  38: 'tennis racket',
  39: 'bottle',
  40: 'wine glass',
  41: 'cup',
  42: 'fork',
  43: 'knife',
  44: 'spoon',
  45: 'bowl',
  46: 'banana',
  47: 'apple',
  48: 'sandwich',
  49: 'orange',
  50: 'broccoli',
  51: 'carrot',
  52: 'hot dog',
  53: 'pizza',
  54: 'donut',
  55: 'cake',
  56: 'chair',
  57: 'couch',
  58: 'potted plant',
  59: 'bed',
  60: 'dining table',
  61: 'toilet',
  62: 'tv',
  63: 'laptop',
  64: 'mouse',
  65: 'remote',
  66: 'keyboard',
  67: 'cell phone',
  68: 'microwave',
  69: 'oven',
  70: 'toaster',
  71: 'sink',
  72: 'refrigerator',
  73: 'book',
  74: 'clock',
  75: 'vase',
  76: 'scissors',
  77: 'teddy bear',
  78: 'hair drier',
  79: 'toothbrush',
};

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detections, setDetections] = useState([]);
  const [fps, setFps] = useState(0);

  const cameraRef = useRef(null);
  const frameCountRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      // Iniciar detección simulada después de un breve delay
      setTimeout(() => {
        setIsDetecting(true);
        const simulateDetection = () => {
          const mockDetections = [
            {
              class: 'bus',
              confidence: 0.85,
              bbox: [0.1, 0.2, 0.3, 0.4],
            },
            {
              class: 'car',
              confidence: 0.72,
              bbox: [0.6, 0.1, 0.2, 0.3],
            }
          ];
          setDetections(mockDetections);

          // Calcular FPS simulado
          frameCountRef.current++;
          if (frameCountRef.current % 30 === 0) {
            const currentTime = Date.now();
            const elapsedTime = (currentTime - startTimeRef.current) / 1000;
            const currentFps = frameCountRef.current / elapsedTime;
            setFps(currentFps);
          }

          setTimeout(simulateDetection, 100);
        };
        simulateDetection();
      }, 2000);
    })();
  }, []);

  function handleCameraReady() {
    console.log('📷 Camera ready! - Using virtual camera in emulator');
    setIsDetecting(true);
    
    // Mostrar información de la cámara
    Alert.alert(
      'Cámara Iniciada', 
      'La cámara está funcionando (virtual en emulador)\n\n' +
      '• En emulador: Cámara simulada\n' +
      '• En dispositivo real: Cámara física\n' +
      '• Detecciones: Simuladas para demo'
    );
    
    // Simular detecciones para demostración
    const simulateDetection = () => {
      const mockDetections = [
        {
          class: 'bus',
          confidence: 0.85,
          bbox: [0.1, 0.2, 0.3, 0.4],
        },
        {
          class: 'car',
          confidence: 0.72,
          bbox: [0.6, 0.1, 0.2, 0.3],
        }
      ];
      setDetections(mockDetections);

      // Calcular FPS simulado
      frameCountRef.current++;
      if (frameCountRef.current % 30 === 0) {
        const currentTime = Date.now();
        const elapsedTime = (currentTime - startTimeRef.current) / 1000;
        const currentFps = frameCountRef.current / elapsedTime;
        setFps(currentFps);
      }

      setTimeout(simulateDetection, 100);
    };
    simulateDetection();
  }

  if (hasPermission === null) {
    return (
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>🚌 Bus Detection App</Text>
        <Text style={styles.welcomeSubtitle}>Solicitando permisos de cámara...</Text>
        <Text style={styles.welcomeStatus}>✅ Aplicación funcionando correctamente</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No access to camera</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
          }}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        onCameraReady={handleCameraReady}
        ref={cameraRef}
      />
      <View style={styles.overlay}>
        {detections.map((detection, index) => (
          <View
            key={index}
            style={[
              styles.detectionBox,
              {
                left: detection.bbox[0] * width,
                top: detection.bbox[1] * height,
                width: (detection.bbox[2] - detection.bbox[0]) * width,
                height: (detection.bbox[3] - detection.bbox[1]) * height,
                borderColor: detection.class === 'bus' ? '#ff0000' : '#00ff00',
              },
            ]}
          >
            <Text style={styles.labelText}>
              {detection.class} {detection.confidence.toFixed(2)}
            </Text>
          </View>
        ))}
        <View style={styles.fpsContainer}>
          <Text style={styles.fpsText}>FPS: {fps.toFixed(1)}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {isDetecting ? '🔍 Detectando buses...' : '⏸️ Pausado'}
          </Text>
        </View>
        <View style={styles.cameraInfoContainer}>
          <Text style={styles.cameraInfoText}>
            📱 Emulador: Cámara Virtual
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  detectionBox: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  labelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'red',
    padding: 2,
  },
  fpsContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  fpsText: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cameraInfoContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cameraInfoText: {
    color: '#ffa500',
    fontSize: 12,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff00',
    textAlign: 'center',
    marginBottom: 20,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 30,
  },
  welcomeStatus: {
    fontSize: 16,
    color: '#00ff00',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00ff00',
  },
});