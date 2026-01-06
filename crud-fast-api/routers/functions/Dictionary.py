from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field
import httpx
import json
from routers.functions.IATextService import generate_response
from routers.functions.CacheService import get_dictionary_cache, save_dictionary_cache
from routers.LimiterConfig import limiter 
#falta que la IA me devuelva el texto al idioma que quiero
Dictionary_Router = APIRouter()

class DictRequest(BaseModel):
    # Restricción 1: Máximo 60 caracteres (suficiente para palabras largas o phrasal verbs)
    word: str = Field(..., min_length=1, max_length=60, description="Palabra o frase corta a definir")
    language: str = "en"
    t_lang:str="en"
    use_ai: bool = False
    context:str=""
    title:str=""
    url:str=""

@Dictionary_Router.post("/dictionary/search")
@limiter.limit("30/minute")
async def search_dictionary(request: Request, data: DictRequest):
    clean_word = data.word.strip()
    
    # 1. VERIFICAR CACHÉ (Lo primero que hacemos)
    cached_result = get_dictionary_cache(clean_word, data.language,data.t_lang)
    if cached_result:
        return cached_result 

    # Validación lógica de longitud...
    if len(clean_word.split()) > 4:
         return [{ "error": True, "meaning": "⚠️ Too many words." }]

    result_data = []

    # --- LÓGICA DE BÚSQUEDA (Gemini o API) ---
    print(data.context)
    if data.use_ai:
        final_prompt = f"""
        PALABRA A DEFINIR: "{clean_word}"

        INFORMACIÓN DE CONTEXTO:
        1. Párrafo original: "{data.context}"
        2. Título de la web: "{data.title}"
        """
        print("t_lang antes de pasar"+ data.t_lang)
        json_str = await generate_response(final_prompt, context_type="dictionary", target_lang=data.t_lang)
        print(json_str)
        try:
            result_data = json.loads(json_str)
            parsed_json = json.loads(json_str)
            
            # --- CORRECCIÓN DE SEGURIDAD ---
            # 1. Si devuelve un dict suelto {}, lo metemos en una lista []
            if isinstance(parsed_json, dict):
                result_data = [parsed_json]
                
            # 2. Si devuelve una lista [], forzamos que solo tenga EL PRIMER elemento
            elif isinstance(parsed_json, list):
                if len(parsed_json) > 0:
                    result_data = [parsed_json[0]] # <--- AQUÍ CORTAMOS LOS DUPLICADOS
                else:
                    result_data = [] # Lista vacía si la IA no devolvió nada
            
            else:
                result_data = []
        except:
            result_data = [{"name": clean_word, "meaning": "Error parsing AI", "example": []}]
    else:
        if data.language == "en":
            async with httpx.AsyncClient() as client:
                try:
                    resp = await client.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{clean_word}")
                    if resp.status_code == 200:
                        raw_data = resp.json()
                        formatted_data = []

                        for entry in raw_data:
                            all_meanings = []
                            all_examples = []
                            all_synonyms = set()
                            all_antonyms = set()
                            all_types = set()

                            for m in entry.get("meanings", []):
                                part_of_speech = m.get("partOfSpeech", "").capitalize()
                                if part_of_speech:
                                    all_types.add(part_of_speech)

                                # Procesamos definiciones
                                for i, d in enumerate(m.get("definitions", [])):
                                    definition_text = d.get("definition")
                                    # Formato: "1. (Noun) Definición..." para dar contexto
                                    formatted_def = f"{len(all_meanings) + 1}. ({part_of_speech}) {definition_text}"
                                    all_meanings.append(formatted_def)

                                    # Recolectamos ejemplos si existen
                                    if "example" in d:
                                        all_examples.append(d["example"])

                                # Recolectamos sinónimos/antónimos del nivel 'meaning'
                                all_synonyms.update(m.get("synonyms", []))
                                all_antonyms.update(m.get("antonyms", []))

                            # Construimos el objeto IDENTICO al de la IA
                            formatted_data.append({
                                "name": entry.get("word"),
                                # Unimos con \n para que ElementCard lo corte línea por línea
                                "meaning": "\n".join(all_meanings), 
                                "type": list(all_types), # Convertimos set a list
                                "example": all_examples[:4], # Limitamos a 4 ejemplos para no saturar
                                "synonyms": list(all_synonyms)[:6],
                                "antonyms": list(all_antonyms)[:6],
                                "image": "",
                                # Agregamos campos vacíos para evitar errores de 'undefined'
                                "language": "en",
                                "originalContext": "" 
                            })
                        
                        # Si devuelve múltiples entradas (ej: "bank" verbo y "bank" sustantivo),
                        # devolvemos la primera o todas según prefieras. Aquí devolvemos todas.
                        return formatted_data
                    else:
                        return [{"error": True, "message": "Word not found in API"}]
                except Exception as e:
                    return [{"error": True, "message": f"API Error: {str(e)}"}]
        else:
            return [{
                "name": clean_word, 
                "meaning": "⚠️ Traditional dictionary is only available for English. Please enable 'AI Mode'.",
                "example": [],
                "error": True
            }]

    # 2. GUARDAR EN CACHÉ SI FUE EXITOSO
    if result_data and not isinstance(result_data, dict) and not result_data[0].get('error'):
         save_dictionary_cache(clean_word, result_data[0]["language"],data.t_lang, data.use_ai, result_data)

    return result_data