from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field
import json
from routers.functions.IATextService import generate_response
from routers.LimiterConfig import limiter 
from routers.UserData.BasicUserData import get_current_user_id

Grammar_Router = APIRouter()

class GrammarRequest(BaseModel):
    text: str = Field(..., min_length=2, max_length=500, description="Frase a analizar")
    language: str = "en" # Idioma de la explicación (target lang)

@Grammar_Router.post("/grammar/analyze")
@limiter.limit("15/minute") # Límite un poco más estricto, es una operación pesada
async def analyze_grammar(request: Request, data: GrammarRequest, user_id: str = Depends(get_current_user_id)):
    
    clean_text = data.text.strip()
    
    # Validación básica
    if len(clean_text.split()) < 2:
        return {"error": True, "message": "Selecciona una frase completa, no solo una palabra."}

    try:
        # Llamada a Gemini con el nuevo contexto
        json_str = await generate_response(clean_text, context_type="grammar", target_lang=data.language)
        
        # Parseo para asegurar que enviamos JSON real al frontend
        result_data = json.loads(json_str)
        return {"status": True, "data": result_data}
        
    except json.JSONDecodeError:
        return {"status": False, "message": "Error procesando la respuesta de la IA."}
    except Exception as e:
        print(f"Grammar Error: {e}")
        return {"status": False, "message": "Error interno del servidor."}