import json
import hashlib
import redis
import os
import time
from Data.Mysql_Connection import get_db_connection

# Configuración de directorio de audio
CACHE_DIR = "static/audio_cache"

# --- CONFIGURACIÓN SEGURA DE REDIS ---
redis_client = None

try:
    # Timeout corto para no bloquear la app si Redis no está
    client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True, socket_connect_timeout=1)
    client.ping() 
    redis_client = client
    print("✅ CacheService: Redis conectado y funcionando.")
except Exception as e:
    print("⚠️ CacheService: Redis no encontrado. Usando solo MySQL (Capa 2).")
    redis_client = None 

# ==========================================
# 1. CACHÉ DE DICCIONARIO (JSON)
# ==========================================

def get_dictionary_cache(word: str, language: str,t_lang:str):
    clean_word = word.lower().strip()
    cache_key = f"dict:{clean_word}:{language}:{t_lang}"

    # 1. Intentar Redis
    if redis_client:
        try:
            cached_redis = redis_client.get(cache_key)
            if cached_redis:
                return json.loads(cached_redis)
        except Exception: pass 

    # 2. Intentar MySQL
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT result_json FROM dictionary_cache WHERE word=%s AND language=%s AND target_lang=%s"
        cursor.execute(sql, (clean_word, language,t_lang))
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        if result:
            data = json.loads(result['result_json'])
            # Refrescar Redis
            if redis_client:
                try: redis_client.setex(cache_key, 604800, json.dumps(data)) 
                except: pass
            return data
    except Exception as e:
        print(f"Cache DB Error: {e}")

    return None

def save_dictionary_cache(word: str, language: str,t_lang:str ,use_ai: bool, data: list):
    clean_word = word.lower().strip()
    cache_key = f"dict:{clean_word}:{language}:{use_ai}"
    json_data = json.dumps(data)

    # 1. Guardar en Redis
    if redis_client:
        try: redis_client.setex(cache_key, 604800, json_data)
        except: pass

    # 2. Guardar en MySQL
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """
        INSERT IGNORE INTO dictionary_cache (word, language,target_lang, use_ai, result_json) 
        VALUES (%s, %s, %s, %s,%s)
        """
        cursor.execute(sql, (clean_word, language,t_lang,use_ai, json_data))
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Save DB Error: {e}")


# ==========================================
# 2. CACHÉ DE TRADUCTOR (TEXTO)
# ==========================================

def get_translation_cache(text: str, source: str, target: str, use_ai: bool):
    text_hash = hashlib.sha256(text.encode('utf-8')).hexdigest()
    cache_key = f"trans:{text_hash}:{target}:{use_ai}"

    # 1. Redis
    if redis_client:
        try:
            cached_redis = redis_client.get(cache_key)
            if cached_redis: return cached_redis
        except: pass

    # 2. MySQL
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = "SELECT translated_text FROM translation_cache WHERE text_hash=%s AND target_lang=%s AND use_ai=%s"
        cursor.execute(sql, (text_hash, target, use_ai))
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        if result:
            translated = result[0]
            if redis_client:
                try: redis_client.setex(cache_key, 86400, translated)
                except: pass
            return translated
    except: pass
    
    return None

def save_translation_cache(text: str, source: str, target: str, use_ai: bool, translated_text: str):
    text_hash = hashlib.sha256(text.encode('utf-8')).hexdigest()
    cache_key = f"trans:{text_hash}:{target}:{use_ai}"

    # Redis
    if redis_client:
        try: redis_client.setex(cache_key, 86400, translated_text)
        except: pass

    # MySQL
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """
        INSERT INTO translation_cache (text_hash, original_text, source_lang, target_lang, use_ai, translated_text) 
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (text_hash, text, source, target, use_ai, translated_text))
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Save Trans DB Error: {e}")


# ==========================================
# 3. LIMPIADOR DE AUDIO (FILE SYSTEM)
# ==========================================

def cleanup_old_audio_files(days=30):
    """
    Recorre la carpeta de caché de audio (incluyendo subcarpetas)
    y elimina archivos .mp3 que no han sido accedidos en X días.
    """
    if not os.path.exists(CACHE_DIR):
        return

    print("🧹 Iniciando limpieza de caché de audio...")
    
    now = time.time()
    cutoff = now - (days * 86400) # Segundos en un día
    deleted_count = 0
    
    # Usamos os.walk para entrar en todas las subcarpetas (a1, b2, etc.)
    for root, dirs, files in os.walk(CACHE_DIR):
        for filename in files:
            if filename.endswith(".mp3"):
                file_path = os.path.join(root, filename)
                try:
                    # st_atime = Último acceso (lectura)
                    file_stats = os.stat(file_path)
                    
                    if file_stats.st_atime < cutoff:
                        os.remove(file_path)
                        deleted_count += 1
                except Exception as e:
                    print(f"Error borrando archivo {filename}: {e}")

    if deleted_count > 0:
        print(f"✅ Limpieza completada: {deleted_count} archivos de audio eliminados.")