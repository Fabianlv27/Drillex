from youtube_transcript_api import YouTubeTranscriptApi
from fastapi import APIRouter, HTTPException

Sub_Router = APIRouter()

def listar_idiomas(video_id):
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        idiomas_disponibles = []
        for t in transcript_list:
            idiomas_disponibles.append({
                'idioma': t.language,
                'código': t.language_code,
                'generado_automáticamente': t.is_generated
            })
        return idiomas_disponibles
    except Exception:
        return []

def Transcript(id, lang):
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(id)
        
        # Intentamos encontrar el transcript exacto o uno generado
        try:
            transcript = transcript_list.find_transcript([lang])
        except:
            # Si falla, intenta buscar autogenerados en ese idioma
            transcript = transcript_list.find_generated_transcript([lang])
            
        transcript_data = transcript.fetch()
        return {"status": 0, "content": transcript_data} 

    except Exception as e:
        print(f"Transcript Error: {e}")
        avaliable = listar_idiomas(id)
        if not avaliable:
             # Retornamos error controlado
             return {"status": 1, "error": str(e)}
        return {"status": 2, "content": avaliable}

def format_time(time_in_seconds):
    minutes = int(time_in_seconds // 60)
    seconds = round(time_in_seconds % 60, 2)
    return f"{minutes}.{str(int(seconds)).zfill(2)}"

@Sub_Router.get("/Sub/{lang}/{id}")
async def GetTrans(lang: str, id: str):
    # Nota: YouTubeTranscriptApi es sincrónico, bloqueará el event loop un poco.
    # Para producción con mucha carga, idealmente usar run_in_executor.
    result = Transcript(id, lang)
    
    if result["status"] == 0:
        # Formatear tiempos
        for tr in result["content"]:
            tr['start'] = format_time(tr['start'])
        return result
    
    elif result["status"] == 2:
        # Devolvemos opciones disponibles
        return result
    
    else:
        raise HTTPException(status_code=404, detail="Subtitles not found and no alternatives available")