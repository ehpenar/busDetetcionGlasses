#!/usr/bin/env python3
"""
Simple YOLO Image Detection Script
Usage: python detect_image.py <image_path> [model_path] [confidence]
"""

from ultralytics import YOLO
import cv2
import sys
import os
from pathlib import Path

ALLOWED_CLASSES = {
    'person', 'bicycle', 'car', 'motorcycle', 'bus', 'truck',
    'traffic light', 'stop sign'
}

def detect_image(image_path, model_path='yolov8n.pt', confidence=0.5):
    """
    Quick image detection with YOLO
    """
    print(f"🔍 Detecting objects in: {image_path}")
    print(f"🤖 Using model: {model_path}")
    print(f"🎯 Confidence threshold: {confidence}")
    print("-" * 50)
    
    # Load model
    model = YOLO(model_path)
    
    # Load image
    image = cv2.imread(image_path)
    if image is None:
        print(f"❌ Error: Could not load image {image_path}")
        return
    
    # Run detection
    results = model(image, conf=confidence, verbose=False)
    
    # Process results
    detections = []
    annotated_image = image.copy()
    
    for result in results:
        if result.boxes is not None:
            for box in result.boxes:
                # Get coordinates
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                conf = float(box.conf[0].cpu().numpy())
                class_id = int(box.cls[0].cpu().numpy())
                class_name = model.names[class_id]
                if class_name not in ALLOWED_CLASSES:
                    continue
                
                # Store detection
                detections.append({
                    'class': class_name,
                    'confidence': conf,
                    'bbox': (x1, y1, x2, y2)
                })
                
                # Choose color (align roughly with app)
                palette = {
                    'person': (231, 76, 60),
                    'bicycle': (41, 128, 185),
                    'car': (69, 183, 209),
                    'motorcycle': (142, 68, 173),
                    'bus': (46, 204, 113),
                    'truck': (230, 126, 34),
                    'traffic light': (241, 196, 15),
                    'stop sign': (192, 57, 43),
                }
                color = palette.get(class_name, (0, 255, 0))
                
                # Draw bounding box
                cv2.rectangle(annotated_image, (x1, y1), (x2, y2), color, 2)
                
                # Draw label
                label = f"{class_name} {conf:.2f}"
                (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                cv2.rectangle(annotated_image, (x1, y1-h-10), (x1+w, y1), color, -1)
                cv2.putText(annotated_image, label, (x1, y1-5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 2)
    
    # Print results
    print(f"✅ Found {len(detections)} objects (filtered):")
    for i, det in enumerate(detections, 1):
        print(f"  {i}. {det['class']}: {det['confidence']:.3f}")
    
    # Save result
    output_path = f"results/detect_{Path(image_path).stem}_detected.jpg"
    os.makedirs("results", exist_ok=True)
    cv2.imwrite(output_path, annotated_image)
    print(f"💾 Result saved to: {output_path}")
    
    # Show image unless running in headless mode
    if os.environ.get('HEADLESS') != '1':
        cv2.imshow('Detection Result', annotated_image)
        print("🖼️  Press any key to close the image window...")
        cv2.waitKey(0)
        cv2.destroyAllWindows()

def detect_folder(folder_path, model_path='yolov8n.pt', confidence=0.5):
    folder = Path(folder_path)
    images = list(folder.glob('*.jpg')) + list(folder.glob('*.jpeg')) + list(folder.glob('*.png'))
    if not images:
        print(f"❌ No images found in {folder}")
        return
    print(f"📁 Running detection on {len(images)} images in {folder}")
    for img in images:
        detect_image(str(img), model_path, confidence)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python detect_image.py <image_path> [model_path] [confidence]")
        print("  python detect_image.py --folder <folder_path> [model_path] [confidence]")
        sys.exit(1)

    if sys.argv[1] == '--folder':
        folder_path = sys.argv[2]
        model_path = sys.argv[3] if len(sys.argv) > 3 else 'yolov8n.pt'
        confidence = float(sys.argv[4]) if len(sys.argv) > 4 else 0.5
        detect_folder(folder_path, model_path, confidence)
    else:
        image_path = sys.argv[1]
        model_path = sys.argv[2] if len(sys.argv) > 2 else 'yolov8n.pt'
        confidence = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
        detect_image(image_path, model_path, confidence)

