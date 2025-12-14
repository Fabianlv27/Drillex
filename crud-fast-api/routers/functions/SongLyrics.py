from fastapi import APIRouter
from lrcup import LRCLib

SongsLyric = APIRouter()
lrclib = LRCLib()

@SongsLyric.get("/SearchLyric/{track}/{artist}")
async def get_lyric(track: str, artist: str):
    try:
        # LrcLib puede tardar, async es correcto aquí si la lib lo soporta, 
        # si no, bloqueará un poco.
        res = lrclib.search(track=track, artist=artist)
        if res and len(res) > 0:
            return {"syncedLyrics": res[0].plainLyrics}
        else:
            return {"error": "Lyrics not found"}
    except Exception as e:
        print(f"Lyric Error: {e}")
        return {"error": "Lyrics service unavailable"}