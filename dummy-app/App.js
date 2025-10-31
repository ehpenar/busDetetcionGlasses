import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as FileSystem from 'expo-file-system/legacy';
import BusDetectionService from './services/BusDetectionService';

const { width, height } = Dimensions.get('window');
const displayWidth = width * 0.8;
const displayHeight = width * 0.6;

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
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoDetections, setVideoDetections] = useState([]);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoProcessingProgress, setVideoProcessingProgress] = useState(0);
  const videoRef = useRef(null);
  const frameProcessingInterval = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detectionsByTime, setDetectionsByTime] = useState({}); // { timestamp: [detections] }
  const [currentVideoTime, setCurrentVideoTime] = useState(0);

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
      Alert.alert('Modelo YOLOv8 no cargado', 'El modelo de detección aún no está listo. Intenta de nuevo en unos segundos.');
      return;
    }

    setIsDetecting(true);
    try {
      console.log('🚗 Starting YOLOv8 car detection...');
      const results = await BusDetectionService.detectBuses(imageUri);
      setDetections(results);
      
      if (results.length > 0) {
        Alert.alert(
          '¡Detecciones YOLOv8!', 
          `Se encontraron ${results.length} vehículo(s) en la imagen.`
        );
      } else {
        Alert.alert('Sin detecciones', 'YOLOv8 no detectó vehículos en la imagen. Intenta con otra imagen.');
      }
    } catch (error) {
      console.error('Error detecting buses with YOLOv8:', error);
      Alert.alert(
        'Error de detección YOLOv8', 
        `No se pudo procesar la imagen: ${error.message}`
      );
      setDetections([]); // Clear any previous detections
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
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        skipProcessing: true,
      });
      setCapturedImage(photo.uri);
      setDetections([]);
      setShowCamera(false);
      // Solo hacer detección si el modelo está cargado
      if (modelLoaded && photo.base64) {
        setIsDetecting(true);
        try {
          const results = await BusDetectionService.detectBuses({ uri: photo.uri, base64: photo.base64 });
          setDetections(results);
          if (results.length > 0) {
            Alert.alert('¡Detecciones YOLOv8!', `Se encontraron ${results.length} vehículo(s) en la imagen.`);
          } else {
            Alert.alert('Sin detecciones', 'YOLOv8 no detectó vehículos en la imagen.');
          }
        } catch (error) {
          console.error('Error detecting:', error);
          Alert.alert('Error', 'No se pudo procesar la imagen.');
        } finally {
          setIsDetecting(false);
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos necesarios', 'Se necesitan permisos para acceder a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setCapturedImage(asset.uri);
        setDetections([]);
        // Solo hacer detección si el modelo está cargado
        if (modelLoaded && asset.base64) {
          setIsDetecting(true);
          try {
            const results = await BusDetectionService.detectBuses({ uri: asset.uri, base64: asset.base64 });
            setDetections(results);
            if (results.length > 0) {
              Alert.alert('¡Detecciones YOLOv8!', `Se encontraron ${results.length} vehículo(s) en la imagen.`);
            } else {
              Alert.alert('Sin detecciones', 'YOLOv8 no detectó vehículos en la imagen.');
            }
          } catch (error) {
            console.error('Error detecting:', error);
            Alert.alert('Error', 'No se pudo procesar la imagen.');
          } finally {
            setIsDetecting(false);
          }
        }
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Por favor intenta de nuevo.');
    }
  };

  const pickVideoFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos necesarios', 'Se necesitan permisos para acceder a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1.0,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedVideo(asset.uri);
        setVideoDetections([]);
        setVideoProcessingProgress(0);
      }
    } catch (error) {
      console.error('Error selecting video:', error);
      Alert.alert('Error', 'No se pudo seleccionar el video. Por favor intenta de nuevo.');
    }
  };

  const handleVideoPlaybackStatusUpdate = async (status) => {
    // Track video playback status and update current time for detection overlays
    if (status.isLoaded) {
      const currentTime = status.positionMillis || 0;
      setCurrentVideoTime(currentTime);
      // Redondear al segundo más cercano para buscar detecciones
      const timeKey = Math.round(currentTime / 1000) * 1000;
      // Las detecciones ya están en detectionsByTime y se mostrarán en el overlay
    }
  };

  const stopVideoProcessing = () => {
    setIsProcessingVideo(false);
    setVideoProcessingProgress(0);
  };

  const processVideoFrame = async (videoUri, timeMs) => {
    if (!modelLoaded) return [];

    try {
      // Extract frame at specific time
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: timeMs,
        quality: 0.8,
      });
      
      // Read frame as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      
      // Run detection on frame
      const detections = await BusDetectionService.detectBuses({ uri, base64 });
      return detections;
    } catch (error) {
      console.error('Error processing video frame:', error);
      return [];
    }
  };

  const processVideoFrames = async () => {
    if (!selectedVideo || !modelLoaded || isProcessingVideo) {
      Alert.alert('Info', 'Por favor selecciona un video y espera a que el modelo se cargue');
      return;
    }

    setIsProcessingVideo(true);
    setVideoDetections([]);
    setVideoProcessingProgress(0);

    try {
      // Get video status to determine duration
      let videoDuration = 10000; // Default 10 seconds
      if (videoRef.current) {
        try {
          const status = await videoRef.current.getStatusAsync();
          if (status.isLoaded && status.durationMillis) {
            videoDuration = status.durationMillis;
          }
        } catch (e) {
          console.log('Could not get video duration, using default');
        }
      }

      Alert.alert(
        'Procesamiento de Video',
        `El video se procesará frame por frame. Duración aproximada: ${Math.round(videoDuration / 1000)}s. Esto puede tomar varios minutos.`,
        [{ text: 'Continuar', onPress: async () => {
          try {
            // Process every 0.5 seconds for smoother playback
            const frameInterval = 500; // ms
            const detectionsMap = {};
            let currentTime = 0;
            
            while (currentTime < videoDuration) {
              const detections = await processVideoFrame(selectedVideo, currentTime);
              
              // Guardar detecciones por timestamp (redondeado al segundo más cercano)
              const timeKey = Math.round(currentTime / 1000) * 1000;
              if (detections.length > 0) {
                detectionsMap[timeKey] = detections;
              }
              
              currentTime += frameInterval;
              const progress = Math.min(100, (currentTime / videoDuration) * 100);
              setVideoProcessingProgress(progress);
              
              // Actualizar mapa de detecciones periódicamente
              if (currentTime % 2000 < frameInterval) {
                setDetectionsByTime({ ...detectionsMap });
              }
            }
            
            // Guardar todas las detecciones por timestamp
            setDetectionsByTime(detectionsMap);
            
            // Calcular total de detecciones únicas para resumen
            const allUniqueDetections = [];
            Object.values(detectionsMap).forEach(frameDetections => {
              frameDetections.forEach(det => {
                const existing = allUniqueDetections.find(d => 
                  d.class === det.class && 
                  Math.abs((d.bboxNorm?.x || 0) - (det.bboxNorm?.x || 0)) < 0.15
                );
                if (!existing || det.confidence > existing.confidence) {
                  if (existing) {
                    const index = allUniqueDetections.indexOf(existing);
                    allUniqueDetections[index] = det;
                  } else {
                    allUniqueDetections.push(det);
                  }
                }
              });
            });
            
            setVideoDetections(allUniqueDetections);
            setVideoProcessingProgress(100);
            
            // Guardar resultados en archivo JSON
            try {
              const resultsData = {
                videoUri: selectedVideo,
                processedAt: new Date().toISOString(),
                duration: videoDuration,
                totalUniqueDetections: allUniqueDetections.length,
                detectionsByTimestamp: Object.keys(detectionsMap).map(timestamp => ({
                  timestamp: parseInt(timestamp),
                  detections: detectionsMap[timestamp].map(det => ({
                    class: det.class,
                    confidence: det.confidence,
                    bboxNorm: det.bboxNorm,
                  })),
                })),
                summary: allUniqueDetections.map(det => ({
                  class: det.class,
                  confidence: det.confidence,
                  bboxNorm: det.bboxNorm,
                })),
              };
              
              const resultsJson = JSON.stringify(resultsData, null, 2);
              const fileName = `video_detections_${Date.now()}.json`;
              const fileUri = `${FileSystem.documentDirectory}${fileName}`;
              
              // Guardar archivo JSON con los resultados
              await FileSystem.writeAsStringAsync(fileUri, resultsJson);
              
              Alert.alert(
                'Procesamiento Completo',
                `Se encontraron ${allDetections.length} detecciones únicas en el video.\n\nResultados guardados en: ${fileName}`
              );
              
              console.log('✅ Results saved to:', fileUri);
            } catch (saveError) {
              console.error('Error saving results:', saveError);
              Alert.alert(
                'Procesamiento Completo',
                `Se encontraron ${allDetections.length} detecciones únicas en el video.\n\n⚠️ No se pudieron guardar los resultados.`
              );
            }
          } catch (error) {
            console.error('Error processing video:', error);
            Alert.alert('Error', `No se pudo procesar el video completo: ${error.message}`);
          } finally {
            setIsProcessingVideo(false);
          }
        }}, { text: 'Cancelar' }]
      );
    } catch (error) {
      console.error('Error starting video processing:', error);
      Alert.alert('Error', 'No se pudo iniciar el procesamiento del video');
      setIsProcessingVideo(false);
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
        {/* Botón de Atrás en la parte superior */}
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.backButton} onPress={() => setShowCamera(false)}>
            <Text style={styles.backButtonText}>← Atrás</Text>
          </TouchableOpacity>
        </View>

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
                      left: detection.bbox ? detection.bbox.x : (detection.bboxNorm?.x || 0) * displayWidth,
                      top: detection.bbox ? detection.bbox.y : (detection.bboxNorm?.y || 0) * displayHeight,
                      width: detection.bbox ? detection.bbox.width : (detection.bboxNorm?.width || 0) * displayWidth,
                      height: detection.bbox ? detection.bbox.height : (detection.bboxNorm?.height || 0) * displayHeight,
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
              <Text style={styles.buttonText}>🔄 Cambiar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <Text style={styles.captureButtonText}>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.cameraButton, realtimeDetection && styles.activeButton]} 
              onPress={toggleRealtimeDetection}
            >
              <Text style={styles.buttonText}>
                {realtimeDetection ? '⏹️ Parar' : '🔍 Vivo'}
              </Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚗 Detector de Carros</Text>
      
      {/* Model Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          YOLOv8: {modelLoaded ? '✅ Modelo Real Cargado' : '⏳ Cargando modelo...'}
        </Text>
        {isDetecting && (
          <View style={styles.detectingContainer}>
            <ActivityIndicator size="small" color="#3498db" />
            <Text style={styles.detectingText}>YOLOv8 detectando carros...</Text>
          </View>
        )}
      </View>
      
      {capturedImage && (
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
            
            {/* Visual Detection Overlay */}
            {detections.length > 0 && (
              <View style={styles.detectionOverlay}>
                {detections.map((detection, index) => (
                  <View
                    key={index}
                    style={[
                      styles.detectionBox,
                      {
                        left: detection.bbox ? detection.bbox.x : (detection.bboxNorm?.x || 0) * displayWidth,
                        top: detection.bbox ? detection.bbox.y : (detection.bboxNorm?.y || 0) * displayHeight,
                        width: detection.bbox ? detection.bbox.width : (detection.bboxNorm?.width || 0) * displayWidth,
                        height: detection.bbox ? detection.bbox.height : (detection.bboxNorm?.height || 0) * displayHeight,
                        borderColor: detection.color || '#45B7D1',
                        backgroundColor: `${detection.color || '#45B7D1'}20`,
                      }
                    ]}
                  >
                    <Text style={[styles.detectionLabel, { color: detection.color || '#45B7D1' }]}>
                      {detection.class} {Math.round(detection.confidence * 100)}%
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          
          {/* Detection Results Text */}
          {detections.length > 0 && (
            <View style={styles.detectionResults}>
              <Text style={styles.detectionTitle}>
                🚗 Detecciones: {detections.length}
              </Text>
              {detections.map((detection, index) => (
                <Text key={index} style={[styles.detectionItem, { color: detection.color || '#45B7D1' }]}>
                  {detection.class} {index + 1}: {Math.round(detection.confidence * 100)}% confianza
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

      {selectedVideo && (
        <View style={styles.videoContainer}>
          <View style={styles.videoWrapper}>
            <Video
              ref={videoRef}
              source={{ uri: selectedVideo }}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
              useNativeControls
              onPlaybackStatusUpdate={handleVideoPlaybackStatusUpdate}
            />
            
            {/* Overlay con detecciones sobre el video */}
            {Object.keys(detectionsByTime).length > 0 && (
              <View style={styles.videoOverlay}>
                {(() => {
                  // Obtener detecciones para el tiempo actual (redondeado al segundo)
                  const timeKey = Math.round(currentVideoTime / 1000) * 1000;
                  const currentDetections = detectionsByTime[timeKey] || [];
                  const videoWidth = width * 0.9;
                  const videoHeight = width * 0.5;
                  
                  return currentDetections.map((detection, index) => {
                    const bbox = detection.bboxNorm || {};
                    const left = (bbox.x || 0) * videoWidth;
                    const top = (bbox.y || 0) * videoHeight;
                    const boxWidth = (bbox.width || 0) * videoWidth;
                    const boxHeight = (bbox.height || 0) * videoHeight;
                    
                    return (
                      <View
                        key={index}
                        style={[
                          styles.videoDetectionBox,
                          {
                            left,
                            top,
                            width: boxWidth,
                            height: boxHeight,
                            borderColor: detection.color || '#45B7D1',
                            backgroundColor: `${detection.color || '#45B7D1'}20`,
                          }
                        ]}
                      >
                        <Text style={[styles.videoDetectionLabel, { color: detection.color || '#45B7D1' }]}>
                          {detection.class} {Math.round(detection.confidence * 100)}%
                        </Text>
                      </View>
                    );
                  });
                })()}
              </View>
            )}
          </View>
          
          {videoDetections.length > 0 && (
            <View style={styles.detectionResults}>
              <Text style={styles.detectionTitle}>
                🎬 Detecciones en Video: {videoDetections.length}
              </Text>
              {videoDetections.map((detection, index) => (
                <Text key={index} style={[styles.detectionItem, { color: detection.color || '#45B7D1' }]}>
                  {detection.class}: {Math.round(detection.confidence * 100)}% confianza
                </Text>
              ))}
            </View>
          )}

          {isProcessingVideo && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color="#3498db" />
              <Text style={styles.processingText}>
                Procesando video: {Math.round(videoProcessingProgress)}%
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.detectButton, (!modelLoaded || isProcessingVideo) && styles.disabledButton]} 
            onPress={processVideoFrames}
            disabled={!modelLoaded || isProcessingVideo}
          >
            <Text style={styles.buttonText}>
              {isProcessingVideo ? '🎬 Procesando video...' : '🔍 Procesar Video (YOLOv8)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={() => {
              setSelectedVideo(null);
              setVideoDetections([]);
              setVideoProcessingProgress(0);
              setDetectionsByTime({});
              setCurrentVideoTime(0);
              stopVideoProcessing();
            }}
          >
            <Text style={styles.buttonText}>🗑️ Eliminar Video</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => setShowCamera(true)}
        >
          <Text style={styles.buttonText}>📷 Tomar Foto (YOLOv8)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={pickImageFromGallery}
        >
          <Text style={styles.buttonText}>🖼️ Seleccionar de Galería (YOLOv8)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.videoButton}
          onPress={pickVideoFromGallery}
        >
          <Text style={styles.buttonText}>🎬 Seleccionar Video (YOLOv8)</Text>
        </TouchableOpacity>
        
        {capturedImage && (
          <TouchableOpacity 
            style={[styles.detectButton, (!modelLoaded || isDetecting) && styles.disabledButton]} 
            onPress={() => detectBuses(capturedImage)}
            disabled={!modelLoaded || isDetecting}
          >
            <Text style={styles.buttonText}>
              {isDetecting ? '🔍 YOLOv8 detectando...' : '🔄 Re-detectar Carros'}
            </Text>
          </TouchableOpacity>
        )}
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
  topControls: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
  captureButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
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
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
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
  imageWrapper: {
    position: 'relative',
    width: width * 0.8,
    height: width * 0.6,
    marginBottom: 15,
  },
  capturedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
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
    padding: 18,
    borderRadius: 12,
    marginVertical: 10,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    padding: 18,
    borderRadius: 12,
    marginVertical: 10,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
    borderWidth: 3,
    borderRadius: 5,
  },
  detectionLabel: {
    position: 'absolute',
    top: -30,
    left: 0,
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  activeButton: {
    backgroundColor: '#2ecc71',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
    opacity: 0.6,
  },
  videoContainer: {
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  video: {
    width: width * 0.9,
    height: width * 0.5,
    borderRadius: 10,
    marginBottom: 15,
  },
  videoButton: {
    backgroundColor: '#e67e22',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    padding: 10,
    borderRadius: 8,
    width: width * 0.8,
  },
  processingText: {
    color: '#3498db',
    fontSize: 14,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  videoWrapper: {
    position: 'relative',
    width: width * 0.9,
    height: width * 0.5,
    marginBottom: 15,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    pointerEvents: 'none', // Permite que los controles del video funcionen
  },
  videoDetectionBox: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 5,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  videoDetectionLabel: {
    position: 'absolute',
    top: -25,
    left: 0,
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
});