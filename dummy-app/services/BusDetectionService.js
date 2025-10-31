// Real YOLOv8 inference via TensorFlow.js (React Native)
import 'react-native-get-random-values';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system/legacy';

class BusDetectionService {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
    this.inputSize = 640; // Common YOLOv8 input
    // COCO classes we will report
    this.targetClasses = [
      'person', 'bicycle', 'car', 'motorcycle', 'bus', 'truck',
      'traffic light', 'stop sign'
    ];
    // COCO indices as used by YOLOv8
    this.classIdByName = {
      person: 0,
      bicycle: 1,
      car: 2,
      motorcycle: 3,
      bus: 5,
      truck: 7,
      'traffic light': 9,
      'stop sign': 11,
    };
    this.colors = {
      person: '#e74c3c',
      bicycle: '#2980b9',
      car: '#45B7D1',
      motorcycle: '#8e44ad',
      bus: '#2ecc71',
      truck: '#e67e22',
      'traffic light': '#f1c40f',
      'stop sign': '#c0392b',
    };
    this.scoreThreshold = 0.6; // raise to reduce FP
    this.iouThreshold = 0.50;  // stricter NMS
    this.maxDetections = 10;   // limit number of boxes
    this.minBoxNormArea = 0.01; // filter tiny boxes (normalized area)
  }

  async ensureBackendReady() {
    if (!tf.getBackend || !tf.engine().backendName) {
      await tf.ready();
    } else if (!tf.engine().backendName) {
      await tf.ready();
    }
    // Prefer RN WebGL when available
    try {
      if (tf.getBackend() !== 'rn-webgl') {
        await tf.setBackend('rn-webgl');
        await tf.ready();
      }
    } catch (_) {
      // Fallback to CPU if needed
      await tf.setBackend('cpu');
      await tf.ready();
    }
  }

  async loadModel() {
    try {
      console.log('🔍 Initializing TensorFlow backend...');
      await this.ensureBackendReady();

      if (this.model) {
        this.isModelLoaded = true;
        return true;
      }

      console.log('🔍 Loading YOLOv8 TFJS model from bundled assets...');
      const modelJson = require('../assets/yolov8n_web_model/model.json');
      const weights = [
        require('../assets/yolov8n_web_model/group1-shard1of4.bin'),
        require('../assets/yolov8n_web_model/group1-shard2of4.bin'),
        require('../assets/yolov8n_web_model/group1-shard3of4.bin'),
        require('../assets/yolov8n_web_model/group1-shard4of4.bin'),
      ];

      this.model = await tf.loadGraphModel(bundleResourceIO(modelJson, weights));
      this.isModelLoaded = true;
      console.log('✅ YOLOv8 model loaded!');
      return true;
    } catch (error) {
      console.error('❌ Error loading YOLOv8 model:', error);
      this.isModelLoaded = false;
      throw new Error('Failed to load YOLOv8 model');
    }
  }

  async imageToTensor({ uri, base64 }) {
    // Prefer base64 if provided (more reliable on Android gallery URIs)
    let imgB64 = base64;
    if (!imgB64) {
      // Fallback: read file as base64 when we have a file:// URI
      if (!uri) {
        throw new Error('No image data provided');
      }
      if (uri.startsWith('content://')) {
        throw new Error('Content URI not supported, please provide base64');
      }
      imgB64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
    }

    const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
    const raw = new Uint8Array(imgBuffer);
    // Decode JPEG -> Tensor3D [H,W,3]
    const decoded = tf.tidy(() => decodeJpeg(raw, 3));
    const [h, w] = decoded.shape;
    // Resize and normalize
    const resized = tf.image.resizeBilinear(decoded, [this.inputSize, this.inputSize]);
    const normalized = tf.div(resized, 255.0).expandDims(0); // [1,640,640,3]
    decoded.dispose();
    resized.dispose();
    return { input: normalized, originalSize: { width: w, height: h } };
  }

  // Postprocess YOLOv8 head output to boxes and scores
  postprocess(outputTensor) {
    // Handle common YOLOv8 TFJS layouts
    let data = outputTensor;
    const shape = data.shape; // e.g. [1,N,85] or [1,84,8400] or [1,8400,84]

    // Convert to [N,85] where 0:4 = cx,cy,w,h and 4:84 = class scores
    if (shape.length === 3) {
      if (shape[1] === 84) {
        // [1,84,8400] → transpose to [8400,84]
        data = data.squeeze(0).transpose([1, 0]);
      } else if (shape[2] === 84) {
        // [1,8400,84] → squeeze to [8400,84]
        data = data.squeeze(0);
      } else {
        // [1,N,85] → squeeze to [N,85]
        data = data.squeeze(0);
      }
    } else {
      data = data.squeeze();
    }

    // If we have [N,84], prepend object coords assumed at first 4, class scores next 80
    // Some exports might already be sigmoid-ed; apply sigmoid defensively then clamp
    let dataArray = data.arraySync();
    const rows = dataArray.length;
    const boxes = [];
    const scores = [];
    const classes = [];
    for (let i = 0; i < rows; i++) {
      const row = dataArray[i];
      const has85 = row.length >= 85; // 4 + 1 obj + 80 classes
      const len = row.length;
      const cx = row[0];
      const cy = row[1];
      const w = row[2];
      const h = row[3];
      const classSlice = has85 ? row.slice(5, len) : row.slice(4, len);
      const objectness = has85 ? (1 / (1 + Math.exp(-row[4]))) : 1.0;
      // Sigmoid
      const classScores = classSlice.map(v => 1 / (1 + Math.exp(-v)));
      let bestIdx = 0;
      let bestScore = classScores[0] || 0;
      for (let j = 1; j < classScores.length; j++) {
        if (classScores[j] > bestScore) {
          bestScore = classScores[j];
          bestIdx = j;
        }
      }
      const combinedScore = bestScore * objectness;
      const allowed = Object.values(this.classIdByName);
      if (combinedScore >= this.scoreThreshold && allowed.includes(bestIdx)) {
        // Convert from center xywh to xyxy. If values appear in pixels, normalize by input size.
        let x1 = cx - w / 2;
        let y1 = cy - h / 2;
        let x2 = cx + w / 2;
        let y2 = cy + h / 2;
        const pixelLike = Math.max(Math.abs(x1), Math.abs(y1), Math.abs(x2), Math.abs(y2)) > 1;
        if (pixelLike) {
          x1 /= this.inputSize; y1 /= this.inputSize; x2 /= this.inputSize; y2 /= this.inputSize;
        }
        // filter very small boxes
        const area = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
        if (area >= this.minBoxNormArea) {
          boxes.push([x1, y1, x2, y2]);
          scores.push(combinedScore);
          classes.push(bestIdx);
        }
      }
    }

    if (boxes.length === 0) {
      return [];
    }

    // NMS on normalized boxes (convert to pixel grid of input size)
    const boxesTensor = tf.tensor2d(
      boxes.map(([x1, y1, x2, y2]) => [
        x1 * this.inputSize,
        y1 * this.inputSize,
        (x2 - x1) * this.inputSize,
        (y2 - y1) * this.inputSize,
      ])
    ); // [N,4] as [x, y, w, h]
    const scoresTensor = tf.tensor1d(scores);

    const selectedIdx = tf.image.nonMaxSuppression(
      boxesTensor,
      scoresTensor,
      this.maxDetections,
      this.iouThreshold,
      this.scoreThreshold
    ).arraySync();

    const results = [];
    for (const idx of selectedIdx) {
      const [x, y, w, h] = boxesTensor.arraySync()[idx];
      const score = scoresTensor.arraySync()[idx];
      const clsId = classes[idx];
      const clsName = Object.keys(this.classIdByName).find(k => this.classIdByName[k] === clsId) || 'object';
      // Convert back to normalized xywh
      const bboxNorm = {
        x: x / this.inputSize,
        y: y / this.inputSize,
        width: w / this.inputSize,
        height: h / this.inputSize,
      };
      results.push({
        class: clsName,
        confidence: score,
        color: this.colors[clsName] || '#45B7D1',
        bboxNorm,
      });
    }

    boxesTensor.dispose();
    scoresTensor.dispose();
    return results;
  }

  async detectBuses(image) {
    if (!this.isModelLoaded) {
      await this.loadModel();
    }

    try {
      console.log('🚗 Running YOLOv8 inference...');
      const { input } = await this.imageToTensor(
        typeof image === 'string' ? { uri: image } : image
      );
      const outputs = await this.model.executeAsync(input);

      // Handle single or multi output graphs
      const outTensor = Array.isArray(outputs) ? outputs[0] : outputs;
      const detections = this.postprocess(outTensor);

      // Cleanup
      input.dispose();
      if (Array.isArray(outputs)) {
        outputs.forEach(t => t.dispose());
      } else {
        outTensor.dispose();
      }

      console.log(`✅ Inference done. Detections: ${detections.length}`);
      return detections;
    } catch (error) {
      console.error('❌ Error during YOLOv8 inference:', error);
      throw new Error(`YOLOv8 inference failed: ${error.message}`);
    }
  }
}

export default new BusDetectionService();