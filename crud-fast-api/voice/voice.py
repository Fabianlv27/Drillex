from fastapi import FastAPI, Response
from pydub import AudioSegment
from io import BytesIO

app = FastAPI()

@app.get("/texto_a_voz")
def texto_a_voz(texto: str):
    # Generar audio desde el texto (este es un ejemplo básico)
    audio = AudioSegment.from_file(BytesIO(texto.encode()), format="raw")

    # Convertir audio a formato WAV
    wav_audio = audio.export(BytesIO(), format="wav")

    # Obtener los bytes del audio en formato WAV
    audio_bytes = wav_audio.read()

    # Devolver el audio como respuesta HTTP con el tipo de contenido adecuado
    return Response(content=audio_bytes, media_type="audio/wav")
