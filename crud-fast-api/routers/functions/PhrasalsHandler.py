from fastapi import APIRouter, Depends, HTTPException, Request
from pymongo import MongoClient
import os
import re

# Importamos la seguridad centralizada
from routers.UserData.BasicUserData import get_current_user_id
from routers.LimiterConfig import limiter

Phrsals_Handler = APIRouter()

# Conexión a MongoDB (Usando variable de entorno si existe)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["phrases_db"] # Nota: En Phrasals.py usabas "DIBY", aquí "phrases_db". Asegúrate de que coincidan si deben.
collection = db["phrasals"]

@Phrsals_Handler.get('/function/obtain_phr/{text}')
@limiter.limit("30/minute")
def HandlePhr(request: Request,text: str, user_id: str = Depends(get_current_user_id)):
    try:
        found_words = []
        wrdObj = []
        
        # Corrección: split() puede dejar caracteres de puntuación pegados.
        # Mejor extraemos solo letras para la búsqueda inicial
        clean_text = re.sub(r'[^a-zA-Z\s]', '', text)
        letters = set(word[0].upper() for word in clean_text.split() if word)
        
        for letter in letters:
            letter_data = collection.find_one({"Letter": letter})
            if letter_data and "Phr" in letter_data:
                for phrase in letter_data["Phr"]:
                    # Optimización: Set para búsqueda O(1)
                    matched = False
                    for key in ["name", "gerund", "past", "participle"]: 
                        if key in phrase and phrase[key]:
                            # Regex estricta para no confundir "run" con "runner"
                            if re.search(r'\b{}\b'.format(re.escape(phrase[key])), text, re.IGNORECASE):
                                matched = True
                                found_words.append(phrase[key])
                                break 
                    
                    if matched and phrase not in wrdObj:
                        wrdObj.append(phrase)

        return {"status": True, "found_words": found_words, "wrdObj": wrdObj}
    except Exception as e:
        print(f"Error en HandlePhr: {e}")
        raise HTTPException(status_code=500, detail="Error processing text")