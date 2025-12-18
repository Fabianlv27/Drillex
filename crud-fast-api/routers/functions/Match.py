import json
import re
import os
from pymongo import MongoClient
from fastapi import APIRouter, Body, Depends, HTTPException, Request
from typing import List
from routers.UserData.BasicUserData import get_current_user_id
# Asumo que esta función existe en tu proyecto
from Data.WordsMatch import Lyric_Handler_SelfWords 
from routers.UserData.BasicUserData import get_current_user_id
from routers.LimiterConfig import limiter
Match = APIRouter()

# Conexión a MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["DIBY"]
collection = db["phrasals"]

# Cargar preposiciones una sola vez al inicio para no abrir el archivo en cada petición
try:
    with open('Data/Prepositions.json', 'r', encoding='utf-8') as file:
        PREPOSITIONS = set(json.load(file).get("Prepositions", []))
except Exception as e:
    print(f"Error loading prepositions: {e}")
    PREPOSITIONS = set()

def Letter_Disriminator(text):
    # Extrae la primera letra de cada palabra
    letters = set()
    if text:
        for word in text.split():
            if word:
                letters.add(word[0].upper())
    return list(letters)

def Get_Matches(text, rawWord, word):
    # Crea regex flexible para encontrar el phrasal verb
    word_parts = word.split()
    pattern = r'\b'
    for i, part in enumerate(word_parts):
        if i > 0:
            # Permite hasta 2 palabras intermedias (e.g. "turn it on")
            pattern += r'\s+(?:\S+\s+){0,2}' 
        pattern += re.escape(part)    
    pattern += r'\b'
    
    try:
        matches = re.findall(pattern, text, flags=re.IGNORECASE)
        if matches:
            return {"matches": matches, "rawWord": rawWord}
    except Exception:
        pass
    return None

def replace_first_ing(match):
    first_word = match.group(1)
    rest = match.group(2) or ""
    return first_word + "in'" + rest

def detect_phrasal_verbs(text):
    results = []
    modes = ["name", "participle", "past", "gerund", "thirdPerson"]
    letters_in_text = Letter_Disriminator(text)

    # Buscamos en MongoDB solo las letras presentes en el texto
    for letter in letters_in_text:
        letter_data = collection.find_one({"Letter": letter})
        if letter_data and "Phr" in letter_data:
            for phr in letter_data["Phr"]:
                for mode in modes:
                    if mode in phr and phr[mode]:
                        # Match normal
                        case = Get_Matches(text, phr["name"], phr[mode])
                        if case: results.append(case)
                        
                        # Match especial para gerundios "goin'" vs "going"
                        if mode == "gerund":
                            pattern = r'\b(\w+?)ing\b(\s+\w*)*'
                            word_modificated = re.sub(pattern, replace_first_ing, phr[mode], flags=re.IGNORECASE)
                            if word_modificated != phr[mode]:
                                case_mod = Get_Matches(text, phr["name"], word_modificated)
                                if case_mod: results.append(case_mod)
    
    # Eliminamos duplicados si un phrasal se detecta varias veces
    unique_results = []
    seen = set()
    for res in results:
        # Usamos rawWord como clave única simple
        if res["rawWord"] not in seen:
            unique_results.append(res)
            seen.add(res["rawWord"])
            
    return {"verso": text, "match": unique_results}


def Lyric_Handler(Lyric):
    final_result = []
    for verse in Lyric:
        if not verse.strip():
            final_result.append({"verso": verse, "match": []})
            continue
        # Limpieza básica para detectar si hay preposiciones
        limpio = re.sub(r'[^a-zA-Z0-9 ]', '', verse)      
        isPhrsal = False
        
        # Verificación rápida: ¿Tiene el verso alguna preposición clave?
        # Esto optimiza para no buscar en versos que seguro no tienen phrasals
        for e in limpio.split():
            if e.lower() in PREPOSITIONS:
                isPhrsal = True
                break
        
        if isPhrsal:
            final_result.append(detect_phrasal_verbs(verse)) 
        else:
            final_result.append({"verso": verse, "match": []}) 
    return final_result

@Match.post("/PhrMatches")
@limiter.limit("15/minute") # Límite razonable para usuarios logueados
def GetPhrMatches(
    request: Request,                   # Necesario para el Limiter
    lyric: List[str] = Body(...),       # Los datos del body
    user_id: str = Depends(get_current_user_id) # <--- SEGURIDAD AÑADIDA
):
    """
    Analiza la letra en busca de Phrasal Verbs.
    Solo accesible para usuarios autenticados.
    """
    try:
        # Si llega aquí, el user_id ya es válido y seguro.
        result = Lyric_Handler(lyric)
        return {"status": True, "content": result}
    except Exception as e:
        print(f"Error en PhrMatches: {e}")
        raise HTTPException(status_code=500, detail="Error processing matches")
    
@Match.post("/getMatches")
@limiter.limit("20/minute")
def GetSelfMatches(
    request: Request, 
    data: dict = Body(...), 
    user_id: str = Depends(get_current_user_id) # Ya estaba protegido, lo mantenemos
):
    try:
        from Data.WordsMatch import Lyric_Handler_SelfWords
        result = Lyric_Handler_SelfWords(data.get("Words", []), data.get("Liryc", []))
        return {"status": True, "content": result}
    except Exception as e:
        print(f"Error en GetMatches: {e}")
        return {"status": False, "detail": str(e)}