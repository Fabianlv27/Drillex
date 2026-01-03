import os
import json
from google import genai
from fastapi import HTTPException

API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY)

async def generate_response(prompt: str, context_type: str = "general", target_lang: str = "en") -> str:
    try:
        system_instruction = ""
        
        # Configuración para Diccionario (Debe devolver JSON estricto para tu ElementCard)
        if context_type == "dictionary":
            system_instruction = f"""
            Actúa como un diccionario contextual inteligente.    
            OBJETIVO:
            Analiza la palabra proporcionada y devuelve sus definiciones.
            CRÍTICO: Debes leer el 'CONTEXTO' proporcionado en el prompt. 
            1. Devuelve un ARRAY JSON que contenga EXACTAMENTE UN (1) OBJETO.
        2. Ese objeto debe consolidar todos los significados posibles de la palabra:
           - "meaning": DEBE ser un SOLO STRING. Pon la definición que coincide con el contexto PRIMERO. Si hay otros significados, agrégalos debajo separados por un salto de línea (\\n).
           - "type": Un array combinando todos los tipos gramaticales encontrados (ej: ["Noun", "Verb"]).
           - "synonyms": Un array combinando los mejores sinónimos de todos los significados.
           - "antonyms": Un array combinando los mejores antónimos.
           - "example": Un array con 3 o 4 ejemplos (prioriza el del contexto).     
           Ejemplo de estructura esperada (JSON válido):
        [
            {{
                "name": "la palabra",
                "meaning": "1. (Contextual) Definición principal aquí.\\n2. Segunda definición común.\\n3. Tercera definición...",
                "type": ["Noun", "Verb"],
                "example": ["Ejemplo del contexto", "Ejemplo genérico"],
                "synonyms": ["sinonimo1", "sinonimo2"],
                "antonyms": ["antonimo1"],
                "image": ""
            }}
        ]
            Si la palabra no existe, devuelve [].
            Definiciones en idioma: {target_lang}.
            """
        
        # Configuración para Traducción
        elif context_type == "translator":
            system_instruction = f"Eres un traductor profesional. Traduce el texto al código de idioma: {target_lang}. Devuelve SOLO el texto traducido, sin explicaciones."
        
        else:
            system_instruction = "Eres un asistente educativo útil."

        response = await client.aio.models.generate_content(
            model='gemini-flash-latest', 
            contents=prompt,
            config={
                'system_instruction': system_instruction,
                'temperature': 0.3 if context_type == "dictionary" else 0.7, 
                # En versiones nuevas de flash podemos forzar response_mime_type='application/json'
                # pero usaremos prompt engineering arriba para compatibilidad general.
            }
        )
        
        # Limpieza básica por si Gemini devuelve Markdown
        text_resp = response.text.strip()
        if context_type == "dictionary":
            if text_resp.startswith("```json"):
                text_resp = text_resp.replace("```json", "").replace("```", "")
        
        return text_resp

    except Exception as e:
        print(f"❌ Error en GeminiService: {e}")
        raise HTTPException(status_code=503, detail=f"Error IA: {str(e)}")