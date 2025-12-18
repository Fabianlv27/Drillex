from fastapi import APIRouter, Response, Request # <--- Importar Request
from gtts import gTTS
from io import BytesIO
from routers.LimiterConfig import limiter # <--- Importar limiter

TextVoice = APIRouter()

@TextVoice.get("/texto_a_voz/{word}/{lan}")
@limiter.limit("30/minute") # <--- LÍMITE: 1 audio cada 2 segundos promedio
def texto_a_voz(request: Request, word: str, lan: str): # <--- Añadir request
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