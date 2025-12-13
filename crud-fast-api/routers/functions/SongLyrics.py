from fastapi import APIRouter
from lrcup import LRCLib

SongsLyric= APIRouter()
lrclib = LRCLib()


@SongsLyric.get("/SearchLyric/{track}/{artist}")
async def get_lyric(track: str, artist: str):
    """
    Get the synced lyrics of a song by track and artist.
    """
    try:
        res = lrclib.search(track=track, artist=artist)
        print(res[0].plainLyrics)
        if res:
            print(f"Found lyrics for {track} by {artist}")
            return {"syncedLyrics": res[0].plainLyrics}
        else:
            return {"error": "Lyrics not found"}
    except Exception as e:
        return {"error": str(e)}
