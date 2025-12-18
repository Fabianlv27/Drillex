from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool # Importante para no bloquear
from lrcup import LRCLib

SongsLyric = APIRouter()
lrclib = LRCLib()

@SongsLyric.get("/SearchLyric/{track}/{artist}")
async def get_lyric(track: str, artist: str):
    try:
        # Ejecutamos la búsqueda bloqueante en un hilo aparte
        res = await run_in_threadpool(lrclib.search, track=track, artist=artist)
        
        if res and len(res) > 0:
            # Priorizamos syncedLyrics (con tiempos) si existe, si no plainLyrics
            lyrics = res[0].syncedLyrics if res[0].syncedLyrics else res[0].plainLyrics
            return {"syncedLyrics": lyrics}
        else:
            # Retornamos status False en lugar de error plano para consistencia
            return {"status": False, "detail": "Lyrics not found"}
            
    except Exception as e:
        print(f"Lyric Error: {e}")
        return {"status": False, "detail": "Lyrics service unavailable"}