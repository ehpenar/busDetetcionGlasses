from ultralytics import YOLO
import cv2
import numpy as np
import time
import sys

def realtime_webcam_detection():
    """
    Real-time object detection using webcam with custom label replacement
    """
    
    print("🎥 Real-time Webcam Detection")
    print("=" * 40)
    print("Model: yolov8n.pt (Nano - Fastest)")
    print("Custom label: 'person' → 'gay'")
    print("Press 'q' to quit")
    print("=" * 40)
    
    try:
        # Load YOLO model
        print("🔍 Loading YOLO model...")
        model = YOLO('yolov8n.pt')
        
        # Try different webcam indices
        webcam_index = 0
        cap = None
        
        print("📹 Trying to initialize webcam...")
        
        # Try different webcam indices
        for i in range(3):  # Try indices 0, 1, 2
            print(f"Trying webcam index {i}...")
            cap = cv2.VideoCapture(i)
            
            if cap.isOpened():
                # Test if we can actually read a frame
                ret, test_frame = cap.read()
                if ret:
                    print(f"✅ Webcam {i} initialized successfully!")
                    webcam_index = i
                    break
                else:
                    cap.release()
            else:
                cap.release()
        
        # If no webcam found, try with different backend
        if cap is None or not cap.isOpened():
            print("🔄 Trying with different backend...")
            cap = cv2.VideoCapture(0, cv2.CAP_AVFOUNDATION)  # macOS specific
            
            if not cap.isOpened():
                print("❌ Error: Could not open webcam")
                print("💡 Please check:")
                print("   - Webcam permissions in System Preferences")
                print("   - Terminal permissions for camera access")
                print("   - If another app is using the webcam")
                return
        
        # Get webcam properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        print(f"📐 Resolution: {width}x{height}")
        print(f"🎬 FPS: {fps}")
        print("✅ Starting real-time detection...")
        print("💡 If you see a blank screen, check camera permissions!")
        
        # Performance tracking
        frame_count = 0
        start_time = time.time()
        
        while True:
            # Capture frame
            ret, frame = cap.read()
            if not ret:
                print("❌ Error: Could not read frame")
                break
            
            # Run YOLO inference
            results = model(frame, verbose=False)
            
            # Process results
            for result in results:
                # Get bounding boxes and labels
                if result.boxes is not None:
                    boxes = result.boxes
                    
                    for i, box in enumerate(boxes):
                        # Get coordinates
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                        
                        # Get confidence
                        conf = float(box.conf[0].cpu().numpy())
                        
                        # Get class name
                        class_id = int(box.cls[0].cpu().numpy())
                        class_name = model.names[class_id]
                        
                        # Replace 'person' with 'gay'
                        if class_name == 'person':
                            class_name = 'gay'
                        
                        # Draw bounding box
                        color = (0, 255, 0)  # Green for default
                        if class_name == 'gay':
                            color = (0, 0, 255)  # Red for 'gay'
                        
                        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                        
                        # Create label text
                        label = f"{class_name} {conf:.2f}"
                        
                        # Calculate text size
                        (text_width, text_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                        
                        # Draw label background
                        cv2.rectangle(frame, (x1, y1 - text_height - 10), (x1 + text_width, y1), color, -1)
                        
                        # Draw label text
                        cv2.putText(frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
            # Calculate and display FPS
            frame_count += 1
            if frame_count % 30 == 0:  # Update FPS every 30 frames
                current_time = time.time()
                elapsed_time = current_time - start_time
                current_fps = frame_count / elapsed_time
                
                # Display FPS on frame
                fps_text = f"FPS: {current_fps:.1f}"
                cv2.putText(frame, fps_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            # Display frame
            cv2.imshow('Real-time YOLO Detection', frame)
            
            # Check for quit command
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        # Calculate final statistics
        end_time = time.time()
        total_time = end_time - start_time
        avg_fps = frame_count / total_time
        
        print(f"\n📊 Final Statistics:")
        print(f"Total frames processed: {frame_count}")
        print(f"Total time: {total_time:.2f} seconds")
        print(f"Average FPS: {avg_fps:.2f}")
        
    except Exception as e:
        print(f"❌ Error during detection: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Clean up
        if 'cap' in locals() and cap is not None:
            cap.release()
        cv2.destroyAllWindows()
        print("✅ Webcam released and windows closed")

def test_with_video():
    """
    Test the detection with a video file instead of webcam
    """
    print("🎬 Testing with video file...")
    
    # Use the trimmed video we created earlier
    video_path = "videos/LOS SITP DE BOGOTÁ_correctly_trimmed.mp4"
    
    try:
        # Load YOLO model
        print("🔍 Loading YOLO model...")
        model = YOLO('yolov8n.pt')
        
        # Open video file
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            print(f"❌ Error: Could not open video file: {video_path}")
            return
        
        print("✅ Video opened successfully!")
        print("Press 'q' to quit, 's' to skip frames")
        
        frame_count = 0
        start_time = time.time()
        
        while True:
            ret, frame = cap.read()
            if not ret:
                print("✅ End of video reached")
                break
            
            # Run YOLO inference
            results = model(frame, verbose=False)
            
            # Process results (same as webcam version)
            for result in results:
                if result.boxes is not None:
                    boxes = result.boxes
                    
                    for i, box in enumerate(boxes):
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                        
                        conf = float(box.conf[0].cpu().numpy())
                        class_id = int(box.cls[0].cpu().numpy())
                        class_name = model.names[class_id]
                        
                        # Replace 'person' with 'gay'
                        if class_name == 'person':
                            class_name = 'gay'
                        
                        color = (0, 255, 0)
                        if class_name == 'gay':
                            color = (0, 0, 255)
                        
                        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                        
                        label = f"{class_name} {conf:.2f}"
                        (text_width, text_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                        cv2.rectangle(frame, (x1, y1 - text_height - 10), (x1 + text_width, y1), color, -1)
                        cv2.putText(frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
            # Display frame
            cv2.imshow('Video Detection Test', frame)
            
            # Handle key presses
            key = cv2.waitKey(30) & 0xFF  # 30ms delay for video playback
            if key == ord('q'):
                break
            elif key == ord('s'):
                # Skip 30 frames
                for _ in range(30):
                    cap.read()
            
            frame_count += 1
        
        cap.release()
        cv2.destroyAllWindows()
        
        end_time = time.time()
        total_time = end_time - start_time
        avg_fps = frame_count / total_time
        
        print(f"\n📊 Video Test Statistics:")
        print(f"Total frames processed: {frame_count}")
        print(f"Total time: {total_time:.2f} seconds")
        print(f"Average FPS: {avg_fps:.2f}")
        
    except Exception as e:
        print(f"❌ Error during video test: {str(e)}")

if __name__ == "__main__":
    print("Choose an option:")
    print("1. Try webcam (may need permissions)")
    print("2. Test with video file")
    
    choice = input("Enter choice (1 or 2): ").strip()
    
    if choice == "1":
        realtime_webcam_detection()
    elif choice == "2":
        test_with_video()
    else:
        print("Invalid choice. Running webcam detection...")
        realtime_webcam_detection()



