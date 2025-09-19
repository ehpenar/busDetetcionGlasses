from ultralytics import YOLO

def detect_buses_in_video():
    """
    Apply YOLO model to detect buses in the trimmed video
    """
    
    # Video path
    video_path = "videos/LOS SITP DE BOGOTÁ_correctly_trimmed.mp4"
    
    print("🚌 Bus Detection with YOLO")
    print("=" * 40)
    print(f"Video: {video_path}")
    print("Model: yolov8x.pt")
    print("Output: results/ folder")
    print("=" * 40)
    
    try:
        # Load pre-trained model
        print("🔍 Loading YOLO model...")
        model: YOLO = YOLO(model="yolov8x.pt")
        
        print("🎬 Starting video analysis...")
        # Run inference on video and save results
        result: list = model.predict(
            video_path, 
            save=True, 
            project="results",
            name="bus_detection_video"
        )
        
        print("✅ Video analysis completed!")
        print("📁 Results saved in: results/bus_detection_video/")
        
        # Print summary of detections
        if result:
            print(f"📊 Processed {len(result)} frames")
            for i, r in enumerate(result):
                if hasattr(r, 'boxes') and r.boxes is not None:
                    print(f"Frame {i+1}: {len(r.boxes)} objects detected")
        
    except Exception as e:
        print(f"❌ Error during detection: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    detect_buses_in_video()

