import os
import json
from google import genai
from fastapi import HTTPException
from groq import AsyncGroq

api_key = os.getenv("GROQ_API_KEY")
client = AsyncGroq(api_key=api_key)

def GetPrompt(context_type, target_lang):
    print(target_lang)
    if context_type == "dictionary":
        # CORRECCIÓN: Usamos dobles llaves {{ }} para el JSON literal
        # y llaves simples { } SOLO para la variable {target_lang}
        return f"""
        Actúa como un DICCIONARIO MULTILINGÜE experto.
        
        OBJETIVO:
        Tu tarea es generar definiciones para una palabra.
        
        INSTRUCCIÓN CRÍTICA DE IDIOMA:
        Todo el contenido de el campo 'meaning' DEBE estar escrito EXCLUSIVAMENTE en el idioma objetivo: "{target_lang}".
        (Si "{target_lang}" es 'en', escribe en Inglés. Si es 'it', en Italiano. Si es 'es', en Español).
        IGNORA el hecho de que estas instrucciones están en español. Tu output es para un usuario que habla "{target_lang}".

        REGLAS DE ORO:
        1. **CONTEXTO**: La definición 1. DEBE coincidir con cómo se usa la palabra en el 'CONTEXTO' provisto.
        2. **EJEMPLOS**: Provee 3 ejemplos en el idioma "{target_lang}".
        3. **FORMATO**: Devuelve un objeto JSON con una propiedad "result" que contenga un array.(Recuerda COLOCAR los \n literalmente cuando se solicita ,MUY IMPORTANTE)

        EJEMPLO DE COMPORTAMIENTO (Si el idioma objetivo fuera 'en'):
        [Input]: Word: "brave", Context: "The brave firefighter saved the cat from the tree."
        [Output JSON]:
        {{
        "result": [
    {{
      "name": "brave",
      "language": "en",
      "meaning": "1. Ready to face and endure danger or pain; showing courage (Contextual).\n2. Fine or splendid in appearance.",
      "type": ["Adjective", "Verb"],
      "example": [
        "The brave firefighter saved the cat from the burning building.",
        "She put on a brave face despite the bad news.",
        "Soldiers brave the elements to protect the border."
      ],
      "synonyms": [
        "courageous",
        "fearless",
        "heroic",
        "valiant"
      ],
      "antonyms": [
        "cowardly",
        "fearful",
        "afraid",
        "timid"
      ],
      "image": ""
    }}
  ]
}}
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
        return f"Traduce al idioma {target_lang}. Devuelve JSON: {{ 'translation': 'texto traducido' }}"
    
    return "Asistente útil."


async def generate_response(prompt: str, context_type: str = "general", target_lang: str = "en") -> str:
    
    try:
        system_instruction=GetPrompt(context_type,target_lang)
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
    response_format={"type": "json_object"} if context_type in ["dictionary", "grammar"] else None,
    max_completion_tokens=1024,
)
        text_resp=chat_completion.choices[0].message.content
        # Limpieza básica por si Gemini devuelve Markdown
        if context_type == "dictionary" or context_type == "grammar":
            try:
                parsed = json.loads(text_resp)
                if "result" in parsed:
                    # Devolvemos solo el contenido de 'result' como string JSON
                    return json.dumps(parsed["result"])
            except:
                pass # Si falla, devolvemos el texto original
        print(text_resp)
        return text_resp

    except Exception as e:
        print(f"❌ Error en GeminiService: {e}")
        raise HTTPException(status_code=503, detail=f"Error IA: {str(e)}")