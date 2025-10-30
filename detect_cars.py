#!/usr/bin/env python3
"""
Car Detection Script - Similar to mobile app
Detects only cars using YOLO
"""

from ultralytics import YOLO
import cv2
import sys
import os
from pathlib import Path

def detect_cars(image_path, model_path='yolov8n.pt', confidence=0.5):
    """
    Detect only cars in an image (similar to mobile app)
    """
    print("🚗 Car Detection with YOLO")
    print("=" * 40)
    print(f"📸 Image: {image_path}")
    print(f"🤖 Model: {model_path}")
    print(f"🎯 Confidence: {confidence}")
    print("=" * 40)
    
    # Load model
    print("🔍 Loading YOLO model...")
    model = YOLO(model_path)
    print("✅ Model loaded!")
    
    # Load image
    image = cv2.imread(image_path)
    if image is None:
        print(f"❌ Error: Could not load image {image_path}")
        return []
    
    print(f"📸 Image loaded! Size: {image.shape[1]}x{image.shape[0]}")
    
    # Run detection
    print("🔍 Detecting cars...")
    results = model(image, conf=confidence, verbose=False)
    
    # Filter only cars
    car_detections = []
    annotated_image = image.copy()
    
    for result in results:
        if result.boxes is not None:
            for box in result.boxes:
                # Get detection info
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                conf = float(box.conf[0].cpu().numpy())
                class_id = int(box.cls[0].cpu().numpy())
                class_name = model.names[class_id]
                
                # Only process cars
                if class_name == 'car':
                    car_detections.append({
                        'class': 'car',
                        'confidence': conf,
                        'bbox': {
                            'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2,
                            'width': x2 - x1, 'height': y2 - y1
                        }
                    })
                    
                    # Draw blue bounding box (like mobile app)
                    color = (69, 183, 209)  # Blue color similar to mobile app
                    cv2.rectangle(annotated_image, (x1, y1), (x2, y2), color, 3)
                    
                    # Draw label
                    label = f"Car {conf:.2f}"
                    (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
                    cv2.rectangle(annotated_image, (x1, y1-h-15), (x1+w, y1), color, -1)
                    cv2.putText(annotated_image, label, (x1, y1-8), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)
    
    # Print results
    print(f"🚗 Found {len(car_detections)} cars:")
    for i, car in enumerate(car_detections, 1):
        bbox = car['bbox']
        print(f"  {i}. Car {i}: {car['confidence']:.1%} confidence at ({bbox['x1']},{bbox['y1']})-({bbox['x2']},{bbox['y2']})")
    
    # Save result
    output_dir = "results"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"cars_detected_{Path(image_path).stem}.jpg")
    cv2.imwrite(output_path, annotated_image)
    print(f"💾 Result saved to: {output_path}")
    
    # Show image
    cv2.imshow('Car Detection Result', annotated_image)
    print("🖼️  Press any key to close...")
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    
    return car_detections

def batch_detect_cars(folder_path, model_path='yolov8n.pt', confidence=0.5):
    """
    Detect cars in all images in a folder
    """
    print("📁 Batch Car Detection")
    print("=" * 40)
    print(f"📂 Folder: {folder_path}")
    print("=" * 40)
    
    # Find images
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
    image_files = []
    for ext in image_extensions:
        image_files.extend(Path(folder_path).glob(f"*{ext}"))
        image_files.extend(Path(folder_path).glob(f"*{ext.upper()}"))
    
    if not image_files:
        print(f"❌ No images found in {folder_path}")
        return
    
    print(f"📸 Found {len(image_files)} images")
    
    total_cars = 0
    for i, image_path in enumerate(image_files):
        print(f"\n🔄 Processing {i+1}/{len(image_files)}: {image_path.name}")
        cars = detect_cars(str(image_path), model_path, confidence)
        total_cars += len(cars)
        print(f"✅ Found {len(cars)} cars")
    
    print(f"\n📊 Batch Complete!")
    print(f"Total images: {len(image_files)}")
    print(f"Total cars detected: {total_cars}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("🚗 Car Detection Script")
        print("=" * 30)
        print("Usage:")
        print("  python detect_cars.py <image_path>")
        print("  python detect_cars.py <image_path> <model_path>")
        print("  python detect_cars.py <image_path> <model_path> <confidence>")
        print("  python detect_cars.py --batch <folder_path>")
        print("")
        print("Examples:")
        print("  python detect_cars.py images/buses.jpeg")
        print("  python detect_cars.py images/buses.jpeg yolov8s.pt")
        print("  python detect_cars.py images/buses.jpeg yolov8n.pt 0.7")
        print("  python detect_cars.py --batch images/")
        sys.exit(1)
    
    if sys.argv[1] == "--batch":
        if len(sys.argv) < 3:
            print("❌ Please provide folder path for batch processing")
            sys.exit(1)
        folder_path = sys.argv[2]
        model_path = sys.argv[3] if len(sys.argv) > 3 else 'yolov8n.pt'
        confidence = float(sys.argv[4]) if len(sys.argv) > 4 else 0.5
        batch_detect_cars(folder_path, model_path, confidence)
    else:
        image_path = sys.argv[1]
        model_path = sys.argv[2] if len(sys.argv) > 2 else 'yolov8n.pt'
        confidence = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
        detect_cars(image_path, model_path, confidence)

