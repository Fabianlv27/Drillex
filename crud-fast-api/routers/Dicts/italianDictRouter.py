import json
from fastapi import APIRouter
from typing import List, Optional, Dict
from pydantic import BaseModel, Field, validator
from fastapi.encoders import jsonable_encoder
from pymongo import MongoClient
from bson import ObjectId
from itertools import islice


client = MongoClient("mongodb://localhost:27017/")
db = client["Dict_It"]
colection = db["Dict_It"]

italian_Dict_router = APIRouter()

class MeaningDefinition(BaseModel):
    definition: Optional[str] = None
    examples: Optional[List[str]] = None
    partOfSpeech: Optional[str] = None
    synonyms: Optional[List[str]]=None
    antonyms: Optional[List[str]]=None
    intensity: Optional[str] = None  # (rude, informal, casual, formal)
    frecuency: Optional[str] = None  # (high, casual, low)
    image: Optional[str]=None  # URL or path to the image
    
def remove_none(d):
        if isinstance(d, dict):
            return {k: remove_none(v) for k, v in d.items() if v is not None}
        elif isinstance(d, list):
            return [remove_none(x) for x in d]
        else:
            return d  
        
        
def AddMongo(Letra, word):
    print("Checking if word exists in MongoDB:", Letra, word)

    # Buscar si ya existe esa palabra en el campo correspondiente
    exists = colection.find_one({
        "_id": ObjectId("68ac447fa946c09a32749bf3"),
        Letra: word
    })

    if exists:
        print(f"La palabra '{word}' ya existe en la letra '{Letra}'.")
        return False  # No agregar porque ya está

    # Si no existe, agregar
    colection.update_one(
        {"_id": ObjectId("68ac447fa946c09a32749bf3")},
        {"$push": {Letra: word}}
    )
    print(f"Palabra '{word}' agregada bajo la letra '{Letra}'.")
    return True
class VerbModel(BaseModel):
    name: str
    past: Optional[str]=None
    gerund: Optional[str]=None
    participle: Optional[str]=None
    pronunciation: str
    meaning: List[MeaningDefinition] = Field(..., min_items=1)

    @validator('meaning')
    def validate_meaning(cls, v):
        if not v:
            raise ValueError("Meaning must contain at least one definition")
        return v
    
@italian_Dict_router.get("/Dicts_creator/it/index")
def get_index():
    with open("Data/Dictionary/italian/index.txt", 'r', encoding='utf-8') as f:
        index = int(f.read().strip())
        print("Current index:", index)
        return {"index": index}

@italian_Dict_router.put("/Dicts_creator/it/index/{i}")
def update_index(i: int):
    with open("Data/Dictionary/italian/index.txt", 'w', encoding='utf-8') as f:
        f.write(str(i))

@italian_Dict_router.post("/Dicts_creator/it")
def AddWords(words:List[VerbModel]):
    words=jsonable_encoder(words)
    print(words)
    print(type(words)) 
    for wd in words:
        letra=wd["name"][0].upper()
        AddMongo(letra,wd)

@italian_Dict_router.get("/Dicts_creator/it/words/{index}")
def getWords(index:int):
    palabras = []
    with open("Data/Dictionary/italian/italian.dic", "r", encoding="utf-8") as f:
        lineas = lineas = list(islice(f, index, index + 100))
        palabras=lineas
        print(palabras)
    return palabras