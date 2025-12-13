from lrcup import LRCLib
  
lrclib = LRCLib()
res = lrclib.search(track="in the end", artist="linkin park")
print(res[0].syncedLyrics)

