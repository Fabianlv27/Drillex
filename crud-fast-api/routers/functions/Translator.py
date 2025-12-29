from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from deep_translator import GoogleTranslator
from routers.functions.GeminiService import generate_response
from routers.functions.CacheService import get_translation_cache, save_translation_cache
from routers.LimiterConfig import limiter # Importamos el limitador

Translator_Router = APIRouter()

class TransRequest(BaseModel):
    # Restricción 1: Límite de caracteres para evitar textos gigantes
    text: str = Field(..., min_length=1, max_length=2500) 
    source: str = "auto"
    target: str = "es"
    use_ai: bool = False

@Translator_Router.post("/Translate/Process")
@limiter.limit("15/minute")
async def process_translation(request: Request, data: TransRequest):
    # 1. VERIFICAR CACHÉ
    cached_trans = get_translation_cache(data.text, data.source, data.target, data.use_ai)
    if cached_trans:
        return cached_trans

    final_translation = ""

    try:
        if data.use_ai:
            final_translation = await generate_response(
                data.text, context_type="translator", target_lang=data.target
            )
        else:
            final_translation = GoogleTranslator(source=data.source, target=data.target).translate(data.text)
        
        # 2. GUARDAR EN CACHÉ (Solo si hay resultado)
        if final_translation:
            save_translation_cache(data.text, data.source, data.target, data.use_ai, final_translation)
            
        return final_translation

    except Exception as e:
        return f"Error: {str(e)}"