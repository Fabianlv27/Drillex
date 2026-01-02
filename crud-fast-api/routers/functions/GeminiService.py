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
            La PRIMERA definición en el array (índice 0) DEBE ser la que corresponde exactamente a cómo se usa la palabra en ese contexto específico.
            Las siguientes definiciones pueden ser los otros significados comunes.

            FORMATO DE RESPUESTA:
            Debes devolver la respuesta EXCLUSIVAMENTE en formato JSON válido (sin markdown).
            Estructura ARRAY de objetos:
            [
                {{
                    "name": "palabra",
                    "meaning": "Definición que encaja con el contexto (si existe)",
                    "example": ["Ejemplo basado en el contexto", "Otro ejemplo"],
                    "synonyms": ["sinonimo1"],
                    "antonyms": ["antonimo1"],
                    "type": ["Noun", "Verb"], 
                    "image": ""
                }},
                {{ "name": "palabra", "meaning": "Segundo significado común...", ... }}
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