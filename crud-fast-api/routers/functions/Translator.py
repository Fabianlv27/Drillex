from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from deep_translator import GoogleTranslator
from routers.functions.GeminiService import generate_response
from routers.LimiterConfig import limiter # Importamos el limitador

Translator_Router = APIRouter()

class TransRequest(BaseModel):
    # Restricción 1: Límite de caracteres para evitar textos gigantes
    text: str = Field(..., min_length=1, max_length=2500) 
    source: str = "auto"
    target: str = "es"
    use_ai: bool = False

@Translator_Router.post("/Translate/Process")
@limiter.limit("15/minute") # Restricción 2: Límite de velocidad más estricto
async def process_translation(request: Request, data: TransRequest):
    try:
        # Opción A: IA (Gemini)
        if data.use_ai:
            translation = await generate_response(
                data.text, 
                context_type="translator", 
                target_lang=data.target
            )
            return translation

        # Opción B: Deep Translator
        else:
            translated = GoogleTranslator(source=data.source, target=data.target).translate(data.text)
            return translated

    except Exception as e:
        print(f"Translation Error: {e}")
        return f"Error: {str(e)}"