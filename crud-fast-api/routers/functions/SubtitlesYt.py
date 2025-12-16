from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from fastapi import APIRouter, HTTPException

Sub_Router = APIRouter()

def listar_idiomas(video_id):
    try:
        # Intenta obtener la lista de transcripciones disponibles
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        idiomas_disponibles = []
        for t in transcript_list:
            idiomas_disponibles.append({
                'idioma': t.language,
                'código': t.language_code,
                'generado_automáticamente': t.is_generated
            })
        return idiomas_disponibles
    except Exception as e:
        print(f"Error listando idiomas: {e}") # Debug
        return []

def Transcript(id, lang):
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(id)
        
        # 1. Intentamos buscar manual o generado en el idioma pedido
        try:
            # Primero buscamos manual
            transcript = transcript_list.find_manually_created_transcript([lang])
        except:
            try:
                 # Si falla, buscamos generado
                 transcript = transcript_list.find_generated_transcript([lang])
            except:
                 # Si falla, intentamos traducir cualquiera disponible al idioma pedido
                 # Esto es muy útil: toma el inglés y lo traduce al español si es necesario
                 transcript = transcript_list[0].translate(lang)

        transcript_data = transcript.fetch()
        return {"status": 0, "content": transcript_data} 

    except Exception as e:
        # AQUÍ ESTÁ LA CLAVE: Imprime el error real en tu consola de VSCode
        print(f"CRITICAL TRANSCRIPT ERROR for ID {id}: {e}") 
        
        avaliable = listar_idiomas(id)
        if not avaliable:
             # Devolvemos el error real para verlo en el Frontend en lugar de un 404 genérico
             return {"status": 1, "error": str(e)}
        
        return {"status": 2, "content": avaliable}

def format_time(time_in_seconds):
    minutes = int(time_in_seconds // 60)
    seconds = round(time_in_seconds % 60, 2)
    return f"{minutes}.{str(int(seconds)).zfill(2)}"

@Sub_Router.get("/Sub/{lang}/{id}")
async def GetTrans(lang: str, id: str):
    print(f"Solicitando subtítulos: ID={id}, Lang={lang}") # Log de entrada
    
    result = Transcript(id, lang)
    
    if result["status"] == 0:
        for tr in result["content"]:
            tr['start'] = format_time(tr['start'])
        return result
    
    elif result["status"] == 2:
        return result
    
    else:
        # En lugar de 404, devolvemos 400 con el mensaje de error real para entender qué pasa
        raise HTTPException(status_code=400, detail=f"Error getting subtitles: {result.get('error')}")