from fastapi import APIRouter
import os
import re
from jose import jwt, JOSEError
from routers.UserData.BasicUserData import get_user
from fastapi.responses import RedirectResponse
from pymongo import MongoClient

Phrsals_Handler = APIRouter()
KEYSECRET = os.getenv("KEYSECRETS")

# Conexión a MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["phrases_db"]
collection = db["phrasals"]

@Phrsals_Handler.get('/function/obtain_phr/{e}/{text}')
def HandlePhr(e, text):
    try:
        data_user = jwt.decode(e, key=KEYSECRET, algorithms=["HS256"])
        if get_user(data_user["username"]) is None:
            print('hola')
            return RedirectResponse("/register", status_code=302)

        found_words = []
        wrdObj = []

        # Obtener datos desde MongoDB
        letters = set(word[0].upper() for word in text.split())
        for letter in letters:
            letter_data = collection.find_one({"Letter": letter})
            if letter_data:
                for phrase in letter_data["Phr"]:
                    # Verificar coincidencias en diferentes formas
                    for key in ["name", "gerund", "past"]:
                        if re.search(r'\b{}\b'.format(re.escape(phrase[key])), text, re.IGNORECASE):
                            found_words.append(phrase[key])
                            if phrase not in wrdObj:
                                wrdObj.append(phrase)

        print(found_words)
        return {"found_words": found_words, "wrdObj": wrdObj}
    except JOSEError:
        print('error')