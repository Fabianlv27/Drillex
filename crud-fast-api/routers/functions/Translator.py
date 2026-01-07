from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from deep_translator import GoogleTranslator
# Importamos funciones de servicio
from routers.functions.CacheService import get_translation_cache, save_translation_cache
from routers.LimiterConfig import limiter 
from routers.functions.IATextService import generate_response
import json

Translator_Router = APIRouter()

class TransRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2500) 
    source: str = "auto"
    target: str = "es"
    use_ai: bool = False

@Translator_Router.post("/Translate/Process")
@limiter.limit("15/minute")
async def process_translation(request: Request, data: TransRequest):
    
    # 1. VERIFICAR CACHÉ
    # La caché devuelve solo el TEXTO (string), así que debemos envolverlo en el formato JSON
    cached_text = get_translation_cache(data.text, data.source, data.target, data.use_ai)
    
    if cached_text:
        return {
            "status": True, 
            "translation": cached_text, 
            "source": "cache"
        }

    response_payload = {"status": False, "translation": ""}

    try:
        if data.use_ai:
            # La IA ya devuelve un diccionario: { "translation": "...", "status": true/false }
            # según tu IATextService.py
            ai_response = await generate_response(
                data.text, context_type="translator", target_lang=data.target
            )
            
            # Parseamos si viene como string JSON (doble seguridad) o usamos directo si es dict
            if isinstance(ai_response, str):
                try:
                    response_payload = json.loads(ai_response)
                except:
                    response_payload = {"status": False, "translation": "Error parsing AI response"}
            elif isinstance(ai_response, dict):
                response_payload = ai_response
            
        else:
            # LÓGICA GOOGLE TRANSLATOR (SIN IA)
            try:
                # Validamos que no sea texto vacío o basura evidente
                if not data.text.strip():
                     return {"status": False, "translation": "Empty text"}

                translated_text = GoogleTranslator(source=data.source, target=data.target).translate(data.text)
                
                # Google a veces devuelve el mismo texto si falla o no entiende, 
                # pero técnicamente es una traducción "exitosa" para la librería.
                if translated_text:
                    response_payload = {
                        "status": True, 
                        "translation": translated_text
                    }
                else:
                    response_payload = {
                        "status": False, 
                        "translation": "Translation failed"
                    }
            except Exception as gt_error:
                print(f"Google Trans Error: {gt_error}")
                response_payload = {
                    "status": False, 
                    "translation": "Service unavailable"
                }
        
        # 2. GUARDAR EN CACHÉ (Solo guardamos el texto plano para ahorrar espacio)
        # Solo guardamos si el status es TRUE
        if response_payload.get("status") and response_payload.get("translation"):
            save_translation_cache(
                data.text, 
                data.source, 
                data.target, 
                data.use_ai, 
                response_payload["translation"]
            )
            
        return response_payload

    except Exception as e:
        print(f"General Error: {e}")
        return {"status": False, "translation": "Server error processing translation"}