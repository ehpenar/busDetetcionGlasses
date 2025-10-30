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
                
                # Store detection
                detections.append({
                    'class': class_name,
                    'confidence': conf,
                    'bbox': (x1, y1, x2, y2)
                })
                
                # Choose color
                if class_name in ['bus', 'car', 'truck']:
                    color = (0, 255, 0)  # Green
                elif class_name == 'person':
                    color = (0, 0, 255)  # Red
                else:
                    color = (255, 0, 0)  # Blue
                
                # Draw bounding box
                cv2.rectangle(annotated_image, (x1, y1), (x2, y2), color, 2)
                
                # Draw label
                label = f"{class_name} {conf:.2f}"
                (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                cv2.rectangle(annotated_image, (x1, y1-h-10), (x1+w, y1), color, -1)
                cv2.putText(annotated_image, label, (x1, y1-5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 2)
    
    # Print results
    print(f"✅ Found {len(detections)} objects:")
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

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python detect_image.py <image_path> [model_path] [confidence]")
        print("Example: python detect_image.py images/buses.jpeg")
        print("Example: python detect_image.py images/buses.jpeg yolov8s.pt 0.7")
        sys.exit(1)
    
    image_path = sys.argv[1]
    model_path = sys.argv[2] if len(sys.argv) > 2 else 'yolov8n.pt'
    confidence = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
    
    detect_image(image_path, model_path, confidence)

