import json
from youtube_transcript_api import YouTubeTranscriptApi
from fastapi import APIRouter, HTTPException, Request
from Data.Mysql_Connection import get_db_connection # Tu conexión existente
from routers.LimiterConfig import limiter
Sub_Router = APIRouter()

# --- FUNCIONES DE BASE DE DATOS (CACHÉ) ---

def get_from_cache(video_id, lang):
    """Busca si el subtítulo ya existe en nuestra base de datos"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        sql = "SELECT content FROM subtitles_cache WHERE video_id = %s AND lang = %s"
        cursor.execute(sql, (video_id, lang))
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if result:
            print(f"🚀 CACHE HIT: Recuperado desde BD para {video_id}")
            # MySQL devuelve JSON como string o dict dependiendo de la configuración driver
            # Aseguramos que sea un objeto Python (lista de dicts)
            if isinstance(result['content'], str):
                return json.loads(result['content'])
            return result['content']
            
    except Exception as e:
        print(f"⚠️ Error leyendo caché: {e}")
        return None
    return None

def save_to_cache(video_id, lang, content):
    """Guarda el subtítulo nuevo en la base de datos"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Convertimos la lista de objetos a String JSON para guardarlo
        json_content = json.dumps(content)
        
        sql = """
        INSERT INTO subtitles_cache (video_id, lang, content) 
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE created_at = NOW();
        """
        cursor.execute(sql, (video_id, lang, json_content))
        conn.commit()
        
        cursor.close()
        conn.close()
        print(f"💾 CACHE SAVED: Guardado en BD para {video_id}")
        
    except Exception as e:
        print(f"⚠️ Error guardando en caché: {e}")

# --- FUNCIONES DE YOUTUBE (EXTERNO) ---

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
    except Exception as e:
        print(f"Error listando idiomas: {e}")
        return []

def Transcript_Fetcher(id, lang):
    """
    Esta función SOLO se encarga de ir a buscar a YouTube si no hay caché.
    Usa el método Legacy (Plan B) que es el más robusto.
    """
    try:
        print(f"📡 API CALL: Pidiendo a YouTube {id}...")
        # Usamos el método directo
        transcript_data = YouTubeTranscriptApi.get_transcript(id, languages=[lang])
        return {"status": 0, "content": transcript_data} 

    except Exception as e:
        print(f"❌ YOUTUBE ERROR ID {id}: {e}") 
        
        # Si falla, miramos qué idiomas hay
        avaliable = listar_idiomas(id)
        
        if not avaliable:
             return {"status": 1, "error": str(e)}
        
        return {"status": 2, "content": avaliable}

def format_time(time_in_seconds):
    minutes = int(time_in_seconds // 60)
    seconds = round(time_in_seconds % 60, 2)
    return f"{minutes}.{str(int(seconds)).zfill(2)}"

# --- ENDPOINT PRINCIPAL ---
@Sub_Router.get("/Sub/{lang}/{id}")
@limiter.limit("20/minute") # <--- LÍMITE: 20 videos por minuto por IP
async def GetTrans(request: Request, lang: str, id: str): # <--- Añadir request: Request
    
    # 1. INTENTO DE CACHÉ
    cached_data = get_from_cache(id, lang)
    
    if cached_data:
        for tr in cached_data:
            tr['start'] = format_time(tr['start'])
        return {"status": 0, "content": cached_data, "source": "cache"}

    # 2. SI NO ESTÁ EN CACHÉ -> VAMOS A YOUTUBE (Aquí está el riesgo)
    result = Transcript_Fetcher(id, lang)
    
    if result["status"] == 0:
        save_to_cache(id, lang, result["content"])
        
        for tr in result["content"]:
            tr['start'] = format_time(tr['start'])
            
        result["source"] = "youtube"
        return result
    
    elif result["status"] == 2:
        return result
    
    else:
        raise HTTPException(status_code=400, detail=f"Error getting subtitles: {result.get('error')}")