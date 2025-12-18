import os
from slowapi import Limiter
from slowapi.util import get_remote_address

# Intentamos leer la URL de Redis de las variables de entorno (para Producción)
# Si no existe, usamos "memory://" (para tu PC local sin instalar nada)
redis_url = os.getenv("REDIS_URL") 

if redis_url:
    storage_uri = redis_url
    print("🚀 Using Redis for Rate Limiting")
else:
    storage_uri = "memory://"
    print("⚠️ Redis not found. Using local MEMORY for Rate Limiting (Dev Mode)")

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=storage_uri
)