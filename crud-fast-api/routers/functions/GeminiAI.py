from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
# Importamos la seguridad que ya tienes
from routers.UserData.BasicUserData import get_current_user_id
# Importamos el limitador que configuramos antes
from routers.LimiterConfig import limiter
# Importamos nuestro nuevo servicio
from routers.functions.IATextService import generate_response


Gemini_Router = APIRouter()

# Definimos qué datos esperamos del frontend
class AIRequest(BaseModel):
    prompt: str         # Lo que el usuario escribe o selecciona
    context: str        # 'grammar', 'vocabulary', 'lyrics', etc.

@Gemini_Router.post("/ai/assist")
@limiter.limit("10/minute") # Límite de seguridad para la capa gratuita
async def ask_gemini(
    request: Request,             # Necesario para el limiter
    data: AIRequest,              # Los datos del body
    user_id: str = Depends(get_current_user_id) # Solo usuarios logueados
):
    """
    Endpoint protegido para consultar a la IA.
    """
    # Llamamos a nuestro servicio limpio
    ai_response = await generate_response(data.prompt, data.context)
    
    return {
        "status": True,
        "response": ai_response,
        "context": data.context
    }