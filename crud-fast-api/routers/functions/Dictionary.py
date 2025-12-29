from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field
import httpx
import json
from routers.functions.GeminiService import generate_response
from routers.LimiterConfig import limiter # Importamos tu limitador
#falta que la IA me devuelva el texto al idioma que quiero
Dictionary_Router = APIRouter()

class DictRequest(BaseModel):
    # Restricción 1: Máximo 60 caracteres (suficiente para palabras largas o phrasal verbs)
    word: str = Field(..., min_length=1, max_length=60, description="Palabra o frase corta a definir")
    language: str = "en"
    use_ai: bool = False

@Dictionary_Router.post("/dictionary/search")
@limiter.limit("15/minute") # Restricción 2: Límite de velocidad
async def search_dictionary(request: Request, data: DictRequest):
    clean_word = data.word.strip()

    # Restricción 3: Validación lógica (No permitir oraciones)
    # Si tiene más de 4 espacios, probablemente es una oración, no una palabra/phrasal verb
    if len(clean_word.split()) > 4:
         return [{
            "name": clean_word, 
            "meaning": "⚠️ Dictionary searches are limited to single words or short phrasal verbs.",
            "example": [],
            "error": True
        }]

    # --- CASO 1: USO DE IA (Gemini) ---
    if data.use_ai:
        json_str = await generate_response(clean_word, context_type="dictionary", target_lang=data.language)
        try:
            return json.loads(json_str)
        except:
            return [{"name": clean_word, "meaning": "Error parsing AI response", "example": []}]

    # --- CASO 2: SIN IA (API TRADICIONAL) ---
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