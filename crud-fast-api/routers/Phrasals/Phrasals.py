
import math
import random
from fastapi import Body, FastAPI, Query,Request,Form,HTTPException,Cookie,APIRouter,Response
from pymongo import MongoClient
from typing import Dict, List


Phrasals= APIRouter()

# Conexión a MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["DIBY"]
collection = db["phrasals"]

@Phrasals.get("/get_data")
async def get_data():
    # Obtener todos los datos de la colección
    data = list(collection.find({}, {"_id": 0}))  # Excluir el campo _id
    return {"Phrasals": data}

#Post

@Phrasals.post("/add_phr")
async def add_phr(letter: str, phr_data: Dict):
    # Buscar el documento correspondiente a la letra
    item = collection.find_one({"Letter": letter})
    if not item:
        raise HTTPException(status_code=404, detail="Letter not found")

    # Verificar si el objeto ya está en la lista "Phr"
    phr_list = item["Phr"]
    if any(e["name"] == phr_data["name"] for e in phr_list):
        return {"message": "Object already exists in the list"}

    # Agregar el nuevo objeto y actualizar en la base de datos
    phr_list.append(phr_data)
    collection.update_one({"Letter": letter}, {"$set": {"Phr": phr_list}})
    return {"message": "Object added successfully", "updated_phr": phr_list}

@Phrasals.get("/RandomPhrasals/{n}")
def RandomPhr(n: int):
    # Obtener letras aleatorias
    letters = list(collection.find({}, {"Letter": 1, "_id": 0}))
    random_letters = random.sample([l["Letter"] for l in letters[0:len(letters)-1 ]], math.ceil(n / 2))

    # Obtener frases aleatorias
    phr_random_list = []
    for letter in random_letters:
        item = collection.find_one({"Letter": letter})
        if item:
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

    phr_list = item["Phr"]
    random.shuffle(phr_list)
    return phr_list[:n]

@Phrasals.get("/SearchPhr/{word}")
def getPhr(word: str):
    # Buscar frases que coincidan con la palabra
    capitalized_word = word.capitalize()
    results = collection.aggregate([
        {"$unwind": "$Phr"},
        {"$match": {"Phr.name": {"$regex": capitalized_word, "$options": "i"}}},
        {"$project": {"_id": 0, "Phr": 1}}
    ])
    print(results)
    options = [result["Phr"] for result in results]
    return {"bit": options[:5], "All": options}

@Phrasals.get("/NoRepeatPhr/")
def GetRepeat(words: str = Query(...)):
    listwrds = words.split(',')
    in_json, out_json = [], []

    for word in listwrds:
        first_letter = word[0].upper()
        capitalized_word = word.capitalize()

        item = collection.find_one({"Letter": first_letter})
        if item and any(phr["name"] == capitalized_word for phr in item["Phr"]):
            in_json.append(capitalized_word)
        else:
            out_json.append(word)

    return out_json

