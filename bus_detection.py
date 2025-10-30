from ultralytics import YOLO
import cv2
import numpy as np
import os
import time
from pathlib import Path

def detect_objects_in_image(image_path, model_path='yolov8n.pt', confidence_threshold=0.5, save_results=True):
    """
    Detect objects in a single image using YOLO
    
    Args:
        image_path (str): Path to the input image
        model_path (str): Path to the YOLO model file
        confidence_threshold (float): Minimum confidence for detections
        save_results (bool): Whether to save the result image
    
    Returns:
        list: List of detected objects with their properties
    """
    
    print("🚗 Bus Detection with YOLO")
    print("=" * 40)
    print(f"📸 Image: {image_path}")
    print(f"🤖 Model: {model_path}")
    print(f"🎯 Confidence: {confidence_threshold}")
    print("=" * 40)
    
    try:
        # Load YOLO model
        print("🔍 Loading YOLO model...")
        model = YOLO(model_path)
        print("✅ Model loaded successfully!")
        
        # Check if image exists
        if not os.path.exists(image_path):
            print(f"❌ Error: Image not found at {image_path}")
            return []
        
        # Load image
        print("📸 Loading image...")
        image = cv2.imread(image_path)
        if image is None:
            print(f"❌ Error: Could not load image from {image_path}")
            return []
        
        print(f"✅ Image loaded! Size: {image.shape[1]}x{image.shape[0]}")
        
        # Run inference
        print("🔍 Running YOLO inference...")
        start_time = time.time()
        
        results = model(image, conf=confidence_threshold, verbose=False)
        
        inference_time = time.time() - start_time
        print(f"⚡ Inference completed in {inference_time:.3f} seconds")
        
        # Process results
        detections = []
        annotated_image = image.copy()
        
        for result in results:
            if result.boxes is not None:
                boxes = result.boxes
                
                print(f"🎯 Found {len(boxes)} objects:")
                
                for i, box in enumerate(boxes):
                    # Get coordinates
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                    
                    # Get confidence
                    conf = float(box.conf[0].cpu().numpy())
                    
                    # Get class name
                    class_id = int(box.cls[0].cpu().numpy())
                    class_name = model.names[class_id]
                    
                    # Store detection info
                    detection = {
                        'class': class_name,
                        'confidence': conf,
                        'bbox': {
                            'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2,
                            'width': x2 - x1, 'height': y2 - y1
                        }
                    }
                    detections.append(detection)
                    
                    # Print detection info
                    print(f"  {i+1}. {class_name}: {conf:.3f} at ({x1},{y1})-({x2},{y2})")
                    
                    # Choose color based on class
                    if class_name in ['bus', 'car', 'truck']:
                        color = (0, 255, 0)  # Green for vehicles
                    elif class_name == 'person':
                        color = (0, 0, 255)  # Red for person
                    else:
                        color = (255, 0, 0)  # Blue for others
                    
                    # Draw bounding box
                    cv2.rectangle(annotated_image, (x1, y1), (x2, y2), color, 2)
                    
                    # Create label
                    label = f"{class_name} {conf:.2f}"
                    
                    # Calculate text size
                    (text_width, text_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                    
                    # Draw label background
                    cv2.rectangle(annotated_image, (x1, y1 - text_height - 10), (x1 + text_width, y1), color, -1)
                    
                    # Draw label text
                    cv2.putText(annotated_image, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Save result if requested
        if save_results:
            # Create output directory
            output_dir = "results/detect"
            os.makedirs(output_dir, exist_ok=True)
            
            # Generate output filename
            input_name = Path(image_path).stem
            output_path = os.path.join(output_dir, f"{input_name}_detected.jpg")
            
            # Save annotated image
            cv2.imwrite(output_path, annotated_image)
            print(f"💾 Result saved to: {output_path}")
        
        # Show image (optional)
        print("🖼️  Displaying result... (Press any key to close)")
        cv2.imshow('YOLO Detection Result', annotated_image)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
        
        return detections
        
    except Exception as e:
        print(f"❌ Error during detection: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

def detect_multiple_images(image_folder, model_path='yolov8n.pt', confidence_threshold=0.5):
    """
    Detect objects in multiple images from a folder
    
    Args:
        image_folder (str): Path to folder containing images
        model_path (str): Path to the YOLO model file
        confidence_threshold (float): Minimum confidence for detections
    """
    
    print("📁 Batch Image Detection")
    print("=" * 40)
    print(f"📂 Folder: {image_folder}")
    print(f"🤖 Model: {model_path}")
    print("=" * 40)
    
    # Supported image extensions
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp']
    
    # Find all images in folder
    image_files = []
    for ext in image_extensions:
        image_files.extend(Path(image_folder).glob(f"*{ext}"))
        image_files.extend(Path(image_folder).glob(f"*{ext.upper()}"))
    
    if not image_files:
        print(f"❌ No images found in {image_folder}")
        return
    
    print(f"📸 Found {len(image_files)} images")
    
    # Process each image
    total_detections = 0
    for i, image_path in enumerate(image_files):
        print(f"\n🔄 Processing {i+1}/{len(image_files)}: {image_path.name}")
        
        detections = detect_objects_in_image(
            str(image_path), 
            model_path, 
            confidence_threshold, 
            save_results=True
        )
        
        total_detections += len(detections)
        print(f"✅ Found {len(detections)} objects")
    
    print(f"\n📊 Batch Processing Complete!")
    print(f"Total images processed: {len(image_files)}")
    print(f"Total objects detected: {total_detections}")

def main():
    """
    Main function with interactive menu
    """
    print("🚗 YOLO Object Detection Tool")
    print("=" * 50)
    print("Choose an option:")
    print("1. Detect objects in a single image")
    print("2. Detect objects in multiple images (batch)")
    print("3. Use custom model path")
    print("4. Exit")
    
    while True:
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == "1":
            # Single image detection
            image_path = input("Enter image path: ").strip()
            if not image_path:
                print("❌ No image path provided")
                continue
            
            confidence = input("Enter confidence threshold (0.1-0.9, default 0.5): ").strip()
            try:
                confidence = float(confidence) if confidence else 0.5
            except ValueError:
                confidence = 0.5
            
            detect_objects_in_image(image_path, confidence_threshold=confidence)
            break
            
        elif choice == "2":
            # Batch detection
            folder_path = input("Enter folder path: ").strip()
            if not folder_path:
                print("❌ No folder path provided")
                continue
            
            confidence = input("Enter confidence threshold (0.1-0.9, default 0.5): ").strip()
            try:
                confidence = float(confidence) if confidence else 0.5
            except ValueError:
                confidence = 0.5
            
            detect_multiple_images(folder_path, confidence_threshold=confidence)
            break
            
        elif choice == "3":
            # Custom model
            model_path = input("Enter model path (e.g., yolov8n.pt, yolov8s.pt, etc.): ").strip()
            if not model_path:
                print("❌ No model path provided")
                continue
            
            image_path = input("Enter image path: ").strip()
            if not image_path:
                print("❌ No image path provided")
                continue
            
            confidence = input("Enter confidence threshold (0.1-0.9, default 0.5): ").strip()
            try:
                confidence = float(confidence) if confidence else 0.5
            except ValueError:
                confidence = 0.5
            
            detect_objects_in_image(image_path, model_path, confidence_threshold=confidence)
            break
            
        elif choice == "4":
            print("👋 Goodbye!")
            break
            
        else:
            print("❌ Invalid choice. Please enter 1, 2, 3, or 4.")

if __name__ == "__main__":
    main()

