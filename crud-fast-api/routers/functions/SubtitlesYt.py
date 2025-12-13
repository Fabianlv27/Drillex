from youtube_transcript_api import YouTubeTranscriptApi
from fastapi import APIRouter,HTTPException
Sub_Router= APIRouter()

def Transcript(id,lang):
# Obtiene los subtítulos en inglés
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(id)
        # Intenta obtener los subtítulos en el idioma deseado
        transcript = transcript_list.find_transcript([lang])
        transcript_data = transcript.fetch()
        print("11",transcript_data)
        
        return {"status":0,"content":transcript_data} 

    except Exception as e:
        print(e)
        avaliable=listar_idiomas(id)
        if len(avaliable) ==0:
            raise HTTPException(status_code=404, detail=f"No se encontraron subtítulos en '{lang}' o hubo un error: {e}")
        return {"status":2,"content":avaliable}
#get words by id path
def listar_idiomas(video_id):
    transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
    idiomas_disponibles = []

    for t in transcript_list:
        idiomas_disponibles.append({
            'idioma': t.language,
            'código': t.language_code,
            'generado_automáticamente': t.is_generated
        })
    print(idiomas_disponibles)
    return idiomas_disponibles
def format_time(time_in_seconds):
    minutes = int(time_in_seconds // 60)
    seconds = round(time_in_seconds % 60, 2)  # Redondeamos a dos decimales
    return f"{minutes}.{str(int(seconds)).zfill(2)}"  # Aseguramos que los segundos tengan dos dígitos

@Sub_Router.get("/Sub/{lang}/{id}")
async def GetTrans(lang,id):
    try:
        print(id,lang)
        Trs=Transcript(id,lang)
        if Trs["status"]==0:
            for Tr in Trs["content"]:
                print(Tr.start)
                Tr.start=format_time(Tr.start)
            print(Trs)
        return Trs
    except Exception as e:
        print(f"Error al obtener los subtítulos: {e}")
        raise HTTPException(status_code=404, detail=f"No se encontraron subtítulos en '{lang}' o hubo un error: {e}")
