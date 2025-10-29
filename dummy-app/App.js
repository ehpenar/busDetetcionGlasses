import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import BusDetectionService from './services/BusDetectionService';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState('back');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [realtimeDetection, setRealtimeDetection] = useState(false);
  const [realtimeDetections, setRealtimeDetections] = useState([]);
  const cameraRef = useRef(null);

  // Load the YOLO model when component mounts
  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      console.log('🔄 Loading bus detection model...');
      const loaded = await BusDetectionService.loadModel();
      setModelLoaded(loaded);
      if (loaded) {
        console.log('✅ Model loaded successfully!');
      } else {
        console.log('❌ Failed to load model');
      }
    } catch (error) {
      console.error('Error loading model:', error);
      setModelLoaded(false);
    }
  };

  const detectBuses = async (imageUri) => {
    if (!modelLoaded) {
      Alert.alert('Modelo no cargado', 'El modelo de detección aún no está listo. Intenta de nuevo en unos segundos.');
      return;
    }

    setIsDetecting(true);
    try {
      console.log('🚌 Starting bus detection...');
      const results = await BusDetectionService.detectBuses(imageUri);
      setDetections(results);
      
      if (results.length > 0) {
        Alert.alert(
          '¡Buses detectados!', 
          `Se encontraron ${results.length} bus(es) en la imagen.`
        );
      } else {
        Alert.alert('Sin buses', 'No se detectaron buses en la imagen.');
      }
    } catch (error) {
      console.error('Error detecting buses:', error);
      Alert.alert('Error', 'No se pudo procesar la imagen para detectar buses.');
    } finally {
      setIsDetecting(false);
    }
  };

  const toggleRealtimeDetection = () => {
    if (!modelLoaded) {
      Alert.alert('Modelo no cargado', 'El modelo de detección aún no está listo.');
      return;
    }
    setRealtimeDetection(!realtimeDetection);
    if (!realtimeDetection) {
      setRealtimeDetections([]);
    }
  };

  const handleCameraFrame = async (frame) => {
    if (!realtimeDetection || !modelLoaded) return;

    try {
      // Simulate real-time detection (in a real app, you'd process the camera frame)
      // For now, we'll just show a placeholder
      const mockDetections = Math.random() > 0.7 ? [
        { class: 'bus', confidence: 0.85, bbox: { x: 100, y: 100, width: 200, height: 150 } }
      ] : [];
      
      setRealtimeDetections(mockDetections);
    } catch (error) {
      console.error('Error in real-time detection:', error);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setCapturedImage(photo.uri);
        setShowCamera(false);
        Alert.alert('¡Foto tomada!', 'La imagen se ha capturado exitosamente. Usa el botón "Detectar Buses" para analizarla.');
      } catch (error) {
        Alert.alert('Error', 'No se pudo tomar la foto');
      }
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos necesarios', 'Se necesitan permisos para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
      Alert.alert('¡Imagen seleccionada!', 'La imagen se ha seleccionado exitosamente. Usa el botón "Detectar Buses" para analizarla.');
    }
  };

  const toggleCameraType = () => {
    setCameraType(
      cameraType === 'back'
        ? 'front'
        : 'back'
    );
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No se tienen permisos para acceder a la cámara</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Solicitar Permisos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={cameraType}
          ref={cameraRef}
        >
          {/* Real-time Detection Overlay */}
          {realtimeDetection && (
            <View style={styles.detectionOverlay}>
              <Text style={styles.overlayText}>
                🔍 Detección en tiempo real: {realtimeDetections.length} buses
              </Text>
              {realtimeDetections.map((detection, index) => (
                <View
                  key={index}
                  style={[
                    styles.detectionBox,
                    {
                      left: detection.bbox.x,
                      top: detection.bbox.y,
                      width: detection.bbox.width,
                      height: detection.bbox.height,
                    }
                  ]}
                >
                  <Text style={styles.detectionLabel}>
                    Bus {Math.round(detection.confidence * 100)}%
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.cameraButton} onPress={toggleCameraType}>
              <Text style={styles.buttonText}>Cambiar Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <Text style={styles.buttonText}>Tomar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.cameraButton, realtimeDetection && styles.activeButton]} 
              onPress={toggleRealtimeDetection}
            >
              <Text style={styles.buttonText}>
                {realtimeDetection ? '⏹️ Parar Detección' : '🔍 Detectar en Vivo'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraButton} onPress={() => setShowCamera(false)}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚌 Detector de Buses</Text>
      
      {/* Model Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Modelo: {modelLoaded ? '✅ Cargado' : '⏳ Cargando...'}
        </Text>
        {isDetecting && (
          <View style={styles.detectingContainer}>
            <ActivityIndicator size="small" color="#3498db" />
            <Text style={styles.detectingText}>Detectando buses...</Text>
          </View>
        )}
      </View>
      
      {capturedImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          
          {/* Detection Results */}
          {detections.length > 0 && (
            <View style={styles.detectionResults}>
              <Text style={styles.detectionTitle}>
                🚌 Buses detectados: {detections.length}
              </Text>
              {detections.map((detection, index) => (
                <Text key={index} style={styles.detectionItem}>
                  Bus {index + 1}: {Math.round(detection.confidence * 100)}% confianza
                </Text>
              ))}
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={() => {
              setCapturedImage(null);
              setDetections([]);
            }}
          >
            <Text style={styles.buttonText}>🗑️ Eliminar Imagen</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setShowCamera(true)}>
          <Text style={styles.buttonText}>📷 Abrir Cámara</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={pickImageFromGallery}>
          <Text style={styles.buttonText}>🖼️ Seleccionar de Galería</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.detectButton, (!modelLoaded || isDetecting) && styles.disabledButton]} 
          onPress={() => {
            if (capturedImage) {
              detectBuses(capturedImage);
            } else {
              Alert.alert('Sin imagen', 'Primero selecciona una imagen de la galería o toma una foto.');
            }
          }}
          disabled={!modelLoaded || isDetecting}
        >
          <Text style={styles.buttonText}>
            {isDetecting ? '🔍 Detectando...' : '🚌 Detectar Buses'}
          </Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  text: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 15,
    borderRadius: 10,
  },
  captureButton: {
    backgroundColor: '#e74c3c',
    padding: 20,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#9b59b6',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detectingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  detectingText: {
    color: '#3498db',
    fontSize: 14,
    marginLeft: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  capturedImage: {
    width: width * 0.8,
    height: width * 0.6,
    borderRadius: 10,
    marginBottom: 15,
  },
  detectionResults: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: width * 0.8,
  },
  detectionTitle: {
    color: '#2ecc71',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  detectionItem: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width * 0.8,
  },
  detectButton: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  detectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  overlayText: {
    position: 'absolute',
    top: 50,
    left: 20,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  detectionBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#2ecc71',
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
  },
  detectionLabel: {
    position: 'absolute',
    top: -25,
    left: 0,
    color: '#2ecc71',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 2,
    borderRadius: 3,
  },
  activeButton: {
    backgroundColor: '#2ecc71',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
    opacity: 0.6,
  },
});