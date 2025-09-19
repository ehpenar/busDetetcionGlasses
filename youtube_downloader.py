import yt_dlp
import os
from pathlib import Path

def download_youtube_video(url, output_path="downloads", quality="best", format="mp4"):
    """
    Download YouTube video with specified quality and format
    
    Args:
        url (str): YouTube video URL
        output_path (str): Directory to save the video
        quality (str): Video quality ('best', 'worst', '720p', '1080p', etc.)
        format (str): Video format ('mp4', 'webm', 'mkv', etc.)
    """
    
    # Create output directory if it doesn't exist
    Path(output_path).mkdir(parents=True, exist_ok=True)
    
    # Configure yt-dlp options
    ydl_opts = {
        'outtmpl': os.path.join(output_path, '%(title)s.%(ext)s'),
        'format': f'best[ext={format}]' if quality == "best" else f'best[height<={quality[:-1]}][ext={format}]',
        'writeinfojson': True,  # Save video metadata
        'writesubtitles': True,  # Download subtitles if available
        'writeautomaticsub': True,  # Download auto-generated subtitles
        'subtitleslangs': ['en', 'es'],  # Preferred subtitle languages
        'ignoreerrors': True,  # Continue on download errors
        'no_warnings': False,
        'progress_hooks': [progress_hook],  # Show download progress
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"🔍 Fetching video information...")
            info = ydl.extract_info(url, download=False)
            
            print(f"📹 Title: {info.get('title', 'Unknown')}")
            print(f"⏱️  Duration: {info.get('duration', 0) // 60} minutes")
            print(f"👁️  Views: {info.get('view_count', 0):,}")
            print(f"📅 Upload Date: {info.get('upload_date', 'Unknown')}")
            
            print(f"\n⬇️  Starting download...")
            ydl.download([url])
            
            print(f"✅ Download completed! Saved to: {output_path}")
            
    except Exception as e:
        print(f"❌ Error downloading video: {str(e)}")

def progress_hook(d):
    """Show download progress"""
    if d['status'] == 'downloading':
        total = d.get('total_bytes') or d.get('total_bytes_estimate', 0)
        downloaded = d.get('downloaded_bytes', 0)
        
        if total > 0:
            percentage = (downloaded / total) * 100
            speed = d.get('speed', 0)
            eta = d.get('eta', 0)
            
            print(f"\r📥 Progress: {percentage:.1f}% | Speed: {speed/1024/1024:.1f} MB/s | ETA: {eta}s", end='', flush=True)
    
    elif d['status'] == 'finished':
        print(f"\n✅ Download finished: {d['filename']}")

def list_available_formats(url):
    """List all available formats for a YouTube video"""
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            formats = info.get('formats', [])
            
            print(f"📋 Available formats for: {info.get('title', 'Unknown')}")
            print("-" * 80)
            
            for f in formats:
                format_id = f.get('format_id', 'N/A')
                ext = f.get('ext', 'N/A')
                resolution = f.get('resolution', 'N/A')
                filesize = f.get('filesize', 0)
                filesize_mb = filesize / 1024 / 1024 if filesize else 0
                
                print(f"ID: {format_id:>5} | Format: {ext:>4} | Resolution: {resolution:>10} | Size: {filesize_mb:>6.1f} MB")
                
    except Exception as e:
        print(f"❌ Error fetching formats: {str(e)}")

def main():
    """Main function with interactive menu"""
    print("🎥 YouTube Video Downloader")
    print("=" * 40)
    
    while True:
        print("\nOptions:")
        print("1. Download video")
        print("2. List available formats")
        print("3. Exit")
        
        choice = input("\nSelect option (1-3): ").strip()
        
        if choice == "1":
            url = input("Enter YouTube URL: ").strip()
            if not url:
                print("❌ Please enter a valid URL")
                continue
                
            print("\nQuality options:")
            print("- best: Best quality available")
            print("- 1080p: 1080p or lower")
            print("- 720p: 720p or lower")
            print("- 480p: 480p or lower")
            print("- worst: Worst quality available")
            
            quality = input("Select quality (default: best): ").strip() or "best"
            
            print("\nFormat options:")
            print("- mp4: MP4 format")
            print("- webm: WebM format")
            print("- mkv: MKV format")
            
            format_choice = input("Select format (default: mp4): ").strip() or "mp4"
            
            download_youtube_video(url, quality=quality, format=format_choice)
            
        elif choice == "2":
            url = input("Enter YouTube URL: ").strip()
            if url:
                list_available_formats(url)
            else:
                print("❌ Please enter a valid URL")
                
        elif choice == "3":
            print("👋 Goodbye!")
            break
            
        else:
            print("❌ Invalid option. Please select 1, 2, or 3.")

if __name__ == "__main__":
    main()

