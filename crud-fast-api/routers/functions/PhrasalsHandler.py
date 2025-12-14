from fastapi import APIRouter, Depends, HTTPException
from pymongo import MongoClient
import os
import re

# Importamos la seguridad centralizada
from routers.UserData.BasicUserData import get_current_user_id

Phrsals_Handler = APIRouter()

# Conexión a MongoDB (Usando variable de entorno si existe)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["phrases_db"] # Nota: En Phrasals.py usabas "DIBY", aquí "phrases_db". Asegúrate de que coincidan si deben.
collection = db["phrasals"]

@Phrsals_Handler.get('/function/obtain_phr/{text}') # Quitamos /{e}
def HandlePhr(text: str, user_id: str = Depends(get_current_user_id)):
    # Si llega aquí, el usuario está logueado.
    try:
        found_words = []
        wrdObj = []

        # Normalizamos el texto y buscamos por letras iniciales
        # Nota: text.split() ya separa por espacios.
        letters = set(word[0].upper() for word in text.split() if word)
        
        for letter in letters:
            letter_data = collection.find_one({"Letter": letter})
            if letter_data and "Phr" in letter_data:
                for phrase in letter_data["Phr"]:
                    # Verificar coincidencias en diferentes formas
                    for key in ["name", "gerund", "past"]:
                        if key in phrase and phrase[key]:
                            # Usamos \b para palabra completa
                            if re.search(r'\b{}\b'.format(re.escape(phrase[key])), text, re.IGNORECASE):
                                found_words.append(phrase[key])
                                # Evitamos duplicados en la lista de objetos
                                if phrase not in wrdObj:
                                    wrdObj.append(phrase)
                                break # Si encontramos una forma, no hace falta buscar las otras del mismo phrasal

        return {"found_words": found_words, "wrdObj": wrdObj}
    except Exception as e:
        print(f"Error en HandlePhr: {e}")
        raise HTTPException(status_code=500, detail="Error processing text")