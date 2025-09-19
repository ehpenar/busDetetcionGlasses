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
import * as tf from '@tensorflow/tfjs';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

const { width, height } = Dimensions.get('window');
const TensorCamera = cameraWithTensors(Camera);

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
  const [model, setModel] = useState(null);
  const [detections, setDetections] = useState([]);
  const [fps, setFps] = useState(0);

  const cameraRef = useRef(null);
  const frameCountRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      await tf.ready();
      const modelJson = require('./assets/model/yolov8n_web_model/model.json');
      const modelWeights = require('./assets/model/yolov8n_web_model/weights.bin');
      const loadedModel = await tf.loadGraphModel(
        bundleResourceIO(modelJson, modelWeights)
      );
      setModel(loadedModel);
    })();
  }, []);

  function handleCameraStream(images) {
    const loop = async () => {
      const nextImageTensor = images.next().value;
      if (model && nextImageTensor) {
        const imageTensor = nextImageTensor.expandDims(0);
        const predictions = await model.executeAsync(imageTensor);
        const [boxes, scores, classes] = predictions;
        const boxes_data = boxes.dataSync();
        const scores_data = scores.dataSync();
        const classes_data = classes.dataSync();

        const detections = [];
        for (let i = 0; i < scores_data.length; ++i) {
          if (scores_data[i] > 0.5) {
            const [x, y, w, h] = boxes_data.slice(i * 4, (i + 1) * 4);
            const klass = LABELS[classes_data[i]];
            detections.push({
              class: klass,
              confidence: scores_data[i],
              bbox: [x, y, w, h],
            });
          }
        }
        setDetections(detections);

        tf.dispose([nextImageTensor, imageTensor, predictions]);

        // Calculate FPS
        frameCountRef.current++;
        if (frameCountRef.current % 30 === 0) {
          const currentTime = Date.now();
          const elapsedTime = (currentTime - startTimeRef.current) / 1000;
          const currentFps = frameCountRef.current / elapsedTime;
          setFps(currentFps);
        }
      }
      requestAnimationFrame(loop);
    };
    loop();
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
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
      {model ? (
        <TensorCamera
          style={styles.camera}
          type={Camera.Constants.Type.back}
          onReady={handleCameraStream}
          resizeHeight={200}
          resizeWidth={152}
          resizeDepth={3}
          autorender={true}
          cameraTextureHeight={1920}
          cameraTextureWidth={1080}
        />
      ) : (
        <Text style={styles.message}>Loading Model...</Text>
      )}
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
                borderColor: '#ff0000',
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
});