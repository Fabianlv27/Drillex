from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field
import httpx
import json
from routers.functions.IATextService import generate_response
from routers.functions.CacheService import get_dictionary_cache, save_dictionary_cache
from routers.LimiterConfig import limiter # Importamos tu limitador
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
    cached_result = get_dictionary_cache(clean_word, data.language)
    if cached_result:
        return cached_result # ¡Retorno inmediato! Ahorraste dinero y tiempo.

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
        json_str = await generate_response(final_prompt, context_type="dictionary", target_lang=data.language)
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
                # Caso raro: devolvió un string o número
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
                            meanings_text = ""
                            examples_list = []
                            synonyms_list = []
                            
                            for m in entry.get("meanings", []):
                                for d in m.get("definitions", []):
                                    meanings_text += f"- {d.get('definition')}\n"
                                    if "example" in d:
                                        examples_list.append(d["example"])
                                synonyms_list.extend(m.get("synonyms", []))

                            formatted_data.append({
                                "name": entry.get("word"),
                                "meaning": meanings_text,
                                "example": examples_list[:3],
                                "synonyms": synonyms_list[:5],
                                "type": [m.get("partOfSpeech") for m in entry.get("meanings", [])],
                                "image": ""
                            })
                            print(formatted_data)
                        return formatted_data
                    else:
                        return {"error": True, "message": "Word not found in API"}
                except Exception as e:
                    return {"error": True, "message": str(e)}
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