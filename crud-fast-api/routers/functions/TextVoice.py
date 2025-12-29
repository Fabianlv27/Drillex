import os
import hashlib
import random
from fastapi import APIRouter, BackgroundTasks, HTTPException
from routers.functions.CacheService import cleanup_old_audio_files
from fastapi.responses import FileResponse
from gtts import gTTS

TextVoice = APIRouter()
CACHE_DIR = "static/audio_cache"

@TextVoice.get("/texto_a_voz/{text}/{lang}")
async def text_to_speech(text: str, lang: str, background_tasks: BackgroundTasks):
    
    # 1. Validación básica de seguridad (evitar textos infinitos)
    if len(text) > 500:
        raise HTTPException(status_code=400, detail="Texto demasiado largo para audio")

    # 2. Generamos el Hash
    filename_hash = hashlib.md5(f"{text}_{lang}".encode()).hexdigest()
    
    # 3. ESTRATEGIA DE SUBCARPETAS
    subfolder = filename_hash[:2]
    target_dir = os.path.join(CACHE_DIR, subfolder)
    
    if not os.path.exists(target_dir):
        os.makedirs(target_dir, exist_ok=True)
        
    file_path = os.path.join(target_dir, f"{filename_hash}.mp3")

    # 4. OPTIMIZACIÓN: Limpieza Probabilística
    # Solo ejecutamos la limpieza el 2% de las veces (aprox 1 de cada 50 peticiones)
    # Esto evita saturar el disco escaneando archivos constantemente.
    if random.random() < 0.02:
        background_tasks.add_task(cleanup_old_audio_files, days=15)

    # 5. Verificar Caché (HIT)
    if os.path.exists(file_path):
        os.utime(file_path, None) # Actualizar fecha de acceso para que el limpiador no lo borre
        return FileResponse(file_path, media_type="audio/mpeg")

    # 6. Generar si no existe (MISS)
    try:
        tts = gTTS(text=text, lang=lang)
        tts.save(file_path)
        return FileResponse(file_path, media_type="audio/mpeg")
    except Exception as e:
        # Usamos HTTPException para que el frontend sepa que falló (status 500)
        # en lugar de devolver un JSON que rompería el reproductor de audio.
        print(f"Error TTS: {e}")
        raise HTTPException(status_code=500, detail="Error generando audio")