# Project Overview

This project is a bus detection system that uses the YOLO (You Only Look Once) object detection model. It consists of a Python-based backend for video processing and real-time detection, and a React Native mobile application for on-device detection.

## Key Technologies

*   **Python Backend:**
    *   **Object Detection:** `ultralytics` (YOLO)
    *   **Video Processing:** `moviepy`, `cv2` (OpenCV)
    *   **Dependencies:** `torch`, `numpy`
*   **Mobile App:**
    *   **Framework:** React Native with Expo
    *   **Camera:** `expo-camera`
    *   **UI:** React Native components

# Building and Running

## Python Backend

The Python backend contains scripts for downloading videos, trimming them, and performing bus detection.

**1. Installation:**

It is recommended to use the provided virtual environment.
```bash
source busDetection/bin/activate
```

**2. Running the Scripts:**

*   **Download a YouTube video:**
    ```bash
    python youtube_downloader.py
    ```
*   **Trim a video:**
    ```bash
    python trim_video.py
    ```
*   **Detect buses in a video:**
    ```bash
    python detect_buses_video.py
    ```
*   **Run real-time webcam detection:**
    ```bash
    python realtime_webcam_detection_fixed.py
    ```

## Mobile App

The mobile app is a React Native project that uses the device's camera for object detection.

**1. Installation (Docker - Recommended):**

```bash
cd mobile-app
./scripts/quick-start.sh
```

**2. Installation (Local):**

```bash
cd mobile-app
npm install
npx expo start
```

Follow the instructions in the terminal to run the app on your mobile device using the Expo Go app.

# Development Conventions

*   The Python code is organized into single-purpose scripts.
*   The mobile app follows a standard React Native project structure.
*   The `realtime_webcam_detection_fixed.py` script contains a custom label replacement where 'person' is replaced with 'gay'. This is also replicated in the mobile app.
