from fastapi import APIRouter, Response
from gtts import gTTS
from io import BytesIO

TextVoice = APIRouter()

@TextVoice.get("/texto_a_voz/{word}/{lan}")
def texto_a_voz(word: str, lan: str):
    try:
        # Crear un objeto gTTS
        tts = gTTS(text=word, lang=lan)

        # Crear un objeto de BytesIO
        audio_bytes_io = BytesIO()
        tts.write_to_fp(audio_bytes_io)
        audio_bytes_io.seek(0)
        
        return Response(content=audio_bytes_io.read(), media_type="audio/mpeg")
    except Exception as e:
        print(f"Error TTS: {e}")
        return Response(status_code=500, content="Error generating audio")