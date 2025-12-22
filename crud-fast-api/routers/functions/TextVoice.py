from fastapi import APIRouter, Response, Request
from gtts import gTTS
from io import BytesIO
from routers.LimiterConfig import limiter

TextVoice = APIRouter()

# Límite de seguridad (caracteres)
MAX_TEXT_LENGTH = 500 

@TextVoice.get("/texto_a_voz/{word}/{lan}")
@limiter.limit("30/minute") 
def texto_a_voz(request: Request, word: str, lan: str):
    try:
        # --- NUEVA VALIDACIÓN ---
        # Si el texto es demasiado largo, lo recortamos para no saturar
        text_to_speak = word
        if len(text_to_speak) > MAX_TEXT_LENGTH:
            print(f"⚠️ Texto recortado: {len(text_to_speak)} caracteres")
            text_to_speak = text_to_speak[:MAX_TEXT_LENGTH]
        
        # Validar que no llegue vacío después de recortes
        if not text_to_speak.strip():
             return Response(status_code=400, content="Text is empty")

        # Usamos la variable recortada 'text_to_speak'
        tts = gTTS(text=text_to_speak, lang=lan)

        audio_bytes_io = BytesIO()
        tts.write_to_fp(audio_bytes_io)
        audio_bytes_io.seek(0)
        
        return Response(content=audio_bytes_io.read(), media_type="audio/mpeg")
    except Exception as e:
        print(f"Error TTS: {e}")
        return Response(status_code=500, content="Error generating audio")