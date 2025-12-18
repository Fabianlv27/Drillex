from fastapi import APIRouter, HTTPException, Request # <--- Importar Request
from fastapi.concurrency import run_in_threadpool # <--- Para no bloquear el servidor
from googletrans import Translator
from routers.LimiterConfig import limiter # <--- Importar limiter

Translator_Router = APIRouter()

@Translator_Router.get("/Translate/{text}")
@limiter.limit("15/minute") # <--- LÍMITE ESTRICTO: Google bloquea rápido el traductor
async def GetTranslate(request: Request, text: str): # <--- Añadir request
    try:
        translator = Translator()
        
        # Ejecutamos la traducción en un hilo aparte para no bloquear FastAPI
        # ya que 'translator.translate' es una operación de red bloqueante
        translation = await run_in_threadpool(translator.translate, text, dest='es')
        
        return translation.text
    except Exception as e:
        print(f"Translation error: {e}")
        # Devolver el texto original es una buena estrategia de fallback
        return text