from ultralytics import YOLO

# Load your trained YOLOv8 model
model = YOLO('yolov8n.pt')  # or 'path/to/your/best.pt'

# Export the model to TensorFlow.js format
model.export(format='tfjs')
