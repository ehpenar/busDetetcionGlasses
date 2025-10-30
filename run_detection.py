#!/usr/bin/env python3
"""
Quick detection script to test with existing images
"""

import os
from detect_cars import detect_cars
from detect_image import detect_image

def main():
    print("🚗 YOLO Detection Test")
    print("=" * 30)
    
    # Check for existing images
    image_paths = [
        "images/buses.jpeg",
        "results/predict/buses.jpg",
        "videos/LOS SITP DE BOGOTÁ_correctly_trimmed.mp4"  # We can extract frames from video
    ]
    
    available_images = []
    for path in image_paths:
        if os.path.exists(path):
            available_images.append(path)
    
    if not available_images:
        print("❌ No images found. Please add images to the 'images/' folder")
        return
    
    print("📸 Available images:")
    for i, path in enumerate(available_images, 1):
        print(f"  {i}. {path}")
    
    # Test car detection
    print("\n🚗 Testing car detection...")
    for image_path in available_images:
        if image_path.endswith('.mp4'):
            print(f"⏭️  Skipping video file: {image_path}")
            continue
            
        print(f"\n🔍 Processing: {image_path}")
        try:
            cars = detect_cars(image_path, confidence=0.5)
            print(f"✅ Found {len(cars)} cars")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    # Test general object detection
    print("\n🎯 Testing general object detection...")
    for image_path in available_images:
        if image_path.endswith('.mp4'):
            continue
            
        print(f"\n🔍 Processing: {image_path}")
        try:
            detect_image(image_path, confidence=0.5)
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()

