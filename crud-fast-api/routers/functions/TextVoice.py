
from fastapi import APIRouter, Response
from gtts import gTTS
from io import BytesIO
from fastapi import  Response

TextVoice= APIRouter()


@TextVoice.get("/texto_a_voz/{word}/{lan}")
def texto_a_voz(word: str, lan:str):
    print(lan)
    # Crear un objeto gTTS con el texto proporcionado
    tts = gTTS(text=word, lang=lan)  # 'es' para español, puedes cambiarlo según el idioma deseado

    # Crear un objeto de BytesIO para almacenar el audio generado
    audio_bytes_io = BytesIO()

    # Guardar el audio generado en el objeto de BytesIO
    tts.write_to_fp(audio_bytes_io)

    # Obtener los bytes del audio generado
    audio_bytes_io.seek(0)
    audio_bytes = audio_bytes_io.read()
   
    # Devolver el audio como respuesta HTTP con el tipo de contenido adecuado
    return Response(content=audio_bytes, media_type="audio/mpeg")
