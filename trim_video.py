from moviepy.video.io.VideoFileClip import VideoFileClip
import os

def trim_video():
    """
    Trim video from 0:37 to 2:36 using MoviePy
    """
    
    # Input and output file paths
    input_file = "videos/LOS SITP DE BOGOTÁ_trimmed.mp4"
    output_file = "videos/LOS SITP DE BOGOTÁ_correctly_trimmed.mp4"
    
    # Time points (in seconds)
    start_time = 37  # 0:37 = 37 seconds
    end_time = 156   # 2:36 = 2*60 + 36 = 156 seconds
    
    try:
        print(f"🎬 Loading video: {input_file}")
        print(f"⏱️  Trimming from {start_time}s to {end_time}s (duration: {end_time - start_time}s)")
        
        # Load the video
        video = VideoFileClip(input_file)
        
        print(f"📹 Original duration: {video.duration:.2f} seconds")
        print(f"📐 Original resolution: {video.size[0]}x{video.size[1]}")
        
        # Trim the video correctly: extract segment from start_time to end_time
        trimmed_video = video.subclipped(start_time, end_time)
        
        print(f"✂️  Trimmed duration: {trimmed_video.duration:.2f} seconds")
        print(f"⬇️  Saving to: {output_file}")
        
        # Write the trimmed video with simplified parameters
        trimmed_video.write_videofile(
            output_file,
            codec='libx264',
            audio_codec='aac'
        )
        
        # Close the video files
        video.close()
        trimmed_video.close()
        
        print(f"✅ Video trimmed successfully!")
        print(f"📁 Output file: {output_file}")
        
        # Get file size
        if os.path.exists(output_file):
            file_size = os.path.getsize(output_file) / (1024 * 1024)  # Convert to MB
            print(f"📊 File size: {file_size:.2f} MB")
        
    except Exception as e:
        print(f"❌ Error trimming video: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🎬 Video Trimmer - MoviePy")
    print("=" * 40)
    print("Input: LOS SITP DE BOGOTÁ_trimmed.mp4")
    print("Trim: 0:37 to 2:36 (1 minute 59 seconds)")
    print("Output: LOS SITP DE BOGOTÁ_correctly_trimmed.mp4")
    print("=" * 40)
    
    trim_video()
