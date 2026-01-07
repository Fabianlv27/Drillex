import os
import json
from google import genai
from fastapi import HTTPException
from groq import AsyncGroq

api_key = os.getenv("GROQ_API_KEY")
client = AsyncGroq(api_key=api_key)

def GetPrompt(context_type,language,target_lang):
    print("idioma objetivo:" + target_lang)
    source_lang_instruction = f"del idioma '{language}'" if language and language != "auto" else "del idioma detectado de la palabra"
    if context_type == "dictionary":
        return  f"""
        Actúa como un DICCIONARIO BILINGÜE Y CONTEXTUAL INTELIGENTE.
        
        INPUT: Una palabra y un contexto.
        IDIOMA DE LA PALABRA (ORIGEN): {source_lang_instruction}.
        IDIOMA DE LA DEFINICIÓN (DESTINO): {target_lang}.

        INSTRUCCIONES CRÍTICAS DE SEPARACIÓN DE IDIOMAS:
        1. Campo 'meaning': DEBE estar escrito EXCLUSIVAMENTE en el idioma DESTINO ({target_lang}).
        2. Campos 'example', 'synonyms', 'antonyms': DEBEN mantenerse OBLIGATORIAMENTE en el idioma ORIGEN ({source_lang_instruction}).
        3. Campo 'type': Debe estar en el idioma DESTINO ({target_lang}) (ej: 'Noun', 'Verb').

        REGLAS DE CONTEXTO:
        1. La primera definición (1.) y el primer ejemplo DEBEN coincidir con el uso de la palabra en el 'CONTEXTO' provisto.
        2. Genera 3 ejemplos en total.

        FORMATO DE SALIDA (JSON ARRAY con un solo objeto):
        
        EJEMPLO DE COMPORTAMIENTO (Cross-Language):
        [Input]: Word: "Gato" (Spanish), Target Lang: "en" (English)
        [Output]:
        {{
            "result": [
                {{
                    "name": "Gato",
                    "language": "es",
                    "meaning": "1. A small domesticated carnivorous mammal with soft fur (Contextual).\\n2. A mechanical device used for lifting heavy loads.",
                    "type": ["Noun"],
                    "example": [
                        "El gato duerme en el sofá.", 
                        "Mi vecino tiene un gato siamés.", 
                        "Necesito el gato para cambiar la rueda del coche."
                    ],
                    "synonyms": ["felino", "minino"],
                    "antonyms": [],
                    "image": ""
                }}
            ]
        }}
        
        NOTA: Si la palabra no existe, devuelve "result": [].
        """
    
    elif context_type == "grammar":
        return f"""
        Actúa como un profesor de gramática. Analiza la frase y explica su estructura.
        FORMATO JSON REQUERIDO:
        {{
            "result": {{
                "original": "frase",
                "general_explanation": "Explicación en {target_lang}",
                "breakdown": [
                    {{ "segment": "parte", "role": "rol", "explanation": "explicación en {target_lang}" }}
                ]
            }}
        }}
        """
        
    elif context_type == "translator":
        return f"Traduce al idioma {target_lang}. Devuelve JSON: {{ 'translation': 'texto traducido' ,'status':true}} si no se puede traducir devolver: {{ 'translation': '(vacio)' ,'status':false}}"
    
    return "Asistente útil."


async def generate_response(prompt: str, context_type: str = "general", target_lang: str = "en",language:str="default") -> str:
    
    try:
        system_instruction=GetPrompt(context_type,language,target_lang)
        chat_completion = await client.chat.completions.create(
    messages=[
        {
            "role": "system",
            "content":system_instruction
        },
        # Set a user message for the assistant to respond to.
        {
            "role": "user",
            "content": prompt,
        }
    ],

    # The language model which will generate the completion.
    model="llama-3.3-70b-versatile",
    temperature=0.1 if context_type in ["dictionary", "grammar"] else 0.6,
    # Truco Pro: Activar modo JSON nativo para asegurar que no falle el parseo
    response_format={"type": "json_object"} if context_type in ["dictionary", "grammar","translator"] else None,
    max_completion_tokens=1024,
)
        text_resp=chat_completion.choices[0].message.content
        # Limpieza básica por si Gemini devuelve Markdown
        if context_type in ["dictionary", "grammar","translator"]:
            try:
                parsed = json.loads(text_resp)
                if "result" in parsed:
                    # Devolvemos solo el contenido de 'result' como string JSON
                    return json.dumps(parsed["result"])
                return parsed
            except:
                pass 
        print(text_resp)
        return text_resp

    except Exception as e:
        print(f"❌ Error en GeminiService: {e}")
        raise HTTPException(status_code=503, detail=f"Error IA: {str(e)}")