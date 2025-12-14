import math
import random
import os
from fastapi import APIRouter, HTTPException, Depends, Query, Body
from pymongo import MongoClient
from typing import Dict, List

# Importamos la seguridad para proteger la escritura
from routers.UserData.BasicUserData import get_current_user_id

Phrasals = APIRouter()

# Conexión a MongoDB
# Es recomendable usar variables de entorno para la URL de conexión
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["DIBY"]
collection = db["phrasals"]

@Phrasals.get("/get_data")
async def get_data():
    # Obtener todos los datos (Idealmente debería tener paginación si son muchos)
    data = list(collection.find({}, {"_id": 0})) 
    return {"Phrasals": data}

# --- ENDPOINT PROTEGIDO ---
# Solo usuarios logueados pueden añadir contenido al diccionario global
@Phrasals.post("/add_phr")
async def add_phr(
    letter: str, 
    phr_data: Dict = Body(...), 
    user_id: str = Depends(get_current_user_id)
):
    # Buscar el documento correspondiente a la letra
    item = collection.find_one({"Letter": letter})
    if not item:
        raise HTTPException(status_code=404, detail="Letter not found")

    # Verificar si el objeto ya está en la lista "Phr"
    phr_list = item.get("Phr", [])
    if any(e.get("name") == phr_data.get("name") for e in phr_list):
        return {"message": "Object already exists in the list", "status": False}

    # Agregar el nuevo objeto y actualizar en la base de datos
    phr_list.append(phr_data)
    collection.update_one({"Letter": letter}, {"$set": {"Phr": phr_list}})
    
    return {"message": "Object added successfully", "updated_phr": phr_list, "status": True}

# --- ENDPOINTS DE JUEGO (PÚBLICOS) ---
# Si quieres restringir el juego a usuarios logueados, añade Depends(get_current_user_id) aquí también.

@Phrasals.get("/RandomPhrasals/{n}")
def RandomPhr(n: int):
    # Obtener letras aleatorias
    letters = list(collection.find({}, {"Letter": 1, "_id": 0}))
    
    # Lógica original mantenida (slice 0:len-1)
    if not letters:
        return []
        
    random_letters = random.sample(
        [l["Letter"] for l in letters[0:len(letters)-1]], 
        min(math.ceil(n / 2), len(letters)-1)
    )

    # Obtener frases aleatorias
    phr_random_list = []
    for letter in random_letters:
        item = collection.find_one({"Letter": letter})
        if item and "Phr" in item:
            phr_random_list.extend(random.sample(item["Phr"], min(2, len(item["Phr"]))))

    # Ajustar el tamaño de la lista
    if len(phr_random_list) > n:
        phr_random_list = random.sample(phr_random_list, n)

    random.shuffle(phr_random_list)
    return phr_random_list

@Phrasals.get("/PhrByLetter/{Letter}/{n}")
def ByLetter(Letter: str, n: int):
    # Obtener frases por letra
    item = collection.find_one({"Letter": Letter})
    if not item:
        raise HTTPException(status_code=404, detail="Letter not found")

    phr_list = item.get("Phr", [])
    random.shuffle(phr_list)
    # Devuelve hasta n elementos (si hay menos, devuelve todos los que haya)
    return phr_list[:n]

@Phrasals.get("/SearchPhr/{word}")
def getPhr(word: str):
    # Buscar frases que coincidan con la palabra
    capitalized_word = word.capitalize()
    
    pipeline = [
        {"$unwind": "$Phr"},
        {"$match": {"Phr.name": {"$regex": capitalized_word, "$options": "i"}}},
        {"$project": {"_id": 0, "Phr": 1}}
    ]
    
    results = list(collection.aggregate(pipeline))
    
    # Extraemos el objeto Phr de cada resultado
    options = [result["Phr"] for result in results if "Phr" in result]
    
    return {"bit": options[:5], "All": options}

@Phrasals.get("/NoRepeatPhr/")
def GetRepeat(words: str = Query(...)):
    listwrds = words.split(',')
    in_json, out_json = [], []

    for word in listwrds:
        if not word: continue
        
        first_letter = word[0].upper()
        capitalized_word = word.capitalize()

        item = collection.find_one({"Letter": first_letter})
        
        found = False
        if item and "Phr" in item:
            if any(phr.get("name") == capitalized_word for phr in item["Phr"]):
                in_json.append(capitalized_word)
                found = True
        
        if not found:
            out_json.append(word)

    return out_json