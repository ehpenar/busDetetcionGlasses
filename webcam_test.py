import cv2

def main():
    # Try to open the default camera with the AVFoundation backend (best for macOS)
    cap = cv2.VideoCapture(0, cv2.CAP_AVFOUNDATION)

    if not cap.isOpened():
        print("❌ Could not open webcam. Check if Cursor has Camera permission in macOS settings.")
        return

    print("✅ Webcam opened successfully. Press 'q' to quit the preview window.")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("⚠️ Failed to grab frame.")
            break

        # Show the frame in a window
        cv2.imshow("Webcam Test", frame)

        # Exit when 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()


