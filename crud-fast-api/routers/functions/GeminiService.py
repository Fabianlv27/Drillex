import os
from google import genai
from fastapi import HTTPException

# 1. Configuración
API_KEY = os.getenv("GEMINI_API_KEY")

# Instanciamos el cliente
client = genai.Client(api_key=API_KEY)

async def generate_response(prompt: str, context_type: str = "general") -> str:
    try:
        system_instruction = ""
        
        if context_type == "grammar":
            system_instruction = "Eres un profesor de inglés experto. Corrige el texto, explica los errores y confirma si usó las palabras."
        elif context_type == "vocabulary":
            system_instruction = "Eres un diccionario inteligente."
        elif context_type == "lyrics":
            system_instruction = "Eres un experto en música y jerga (slang)."
        else:
            system_instruction = "Eres un asistente educativo útil."

        # --- CAMBIO AQUÍ ---
        # Usamos el nombre que SÍ aparecía en tu lista de modelos permitidos.
        response = await client.aio.models.generate_content(
            model='gemini-flash-latest', 
            contents=prompt,
            config={
                'system_instruction': system_instruction,
                'temperature': 0.7, 
            }
        )
        
        return response.text

    except Exception as e:
        print(f"❌ Error en GeminiService: {e}")
        # Capturamos el error para verlo claro en consola
        raise HTTPException(status_code=503, detail=f"Error IA: {str(e)}")