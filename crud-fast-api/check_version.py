import youtube_transcript_api
import sys

print(f"Python Executable: {sys.executable}")
print(f"Library Location: {youtube_transcript_api.__file__}")
try:
    print(f"Version: {youtube_transcript_api.__version__}")
except:
    print("Version: Unknown (Too old)")

try:
    from youtube_transcript_api import YouTubeTranscriptApi
    # Intentamos acceder al método que falla
    print(f"Has list_transcripts?: {hasattr(YouTubeTranscriptApi, 'list_transcripts')}")
except Exception as e:
    print(f"Error checking attribute: {e}")