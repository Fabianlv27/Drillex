import json
import os
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel, Field, validator
from fastapi.encoders import jsonable_encoder
from pymongo import MongoClient
from bson import ObjectId
from itertools import islice

# Importamos la dependencia de seguridad
from routers.UserData.BasicUserData import get_current_user_id

# Configuración de Base de Datos
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["Dict_It"]
collection = db["Dict_It"]

# ID del documento principal (Extraído para fácil configuración)
# Nota: Asegúrate de que este ID exista en tu BD o maneja la creación inicial
MAIN_DOC_ID = ObjectId("68ac447fa946c09a32749bf3")

italian_Dict_router = APIRouter()

# --- MODELOS ---

class MeaningDefinition(BaseModel):
    definition: Optional[str] = None
    examples: Optional[List[str]] = None
    partOfSpeech: Optional[str] = None
    synonyms: Optional[List[str]] = None
    antonyms: Optional[List[str]] = None
    intensity: Optional[str] = None  # (rude, informal, casual, formal)
    frequency: Optional[str] = None  # Corregido typo: frecuency -> frequency
    image: Optional[str] = None      # URL or path to the image

class VerbModel(BaseModel):
    name: str
    past: Optional[str] = None
    gerund: Optional[str] = None
    participle: Optional[str] = None
    pronunciation: str
    meaning: List[MeaningDefinition] = Field(..., min_items=1)

    @validator('meaning')
    def validate_meaning(cls, v):
        if not v:
            raise ValueError("Meaning must contain at least one definition")
        return v

# --- FUNCIONES AUXILIARES ---

def remove_none(d):
    if isinstance(d, dict):
        return {k: remove_none(v) for k, v in d.items() if v is not None}
    elif isinstance(d, list):
        return [remove_none(x) for x in d]
    else:
        return d  

def AddMongo(Letra, word):
    try:
        # Verificar si la palabra ya existe en el array de esa letra
        # Usamos $elemMatch para buscar dentro del array específico de la letra
        query = {
            "_id": MAIN_DOC_ID, 
            Letra: {"$elemMatch": {"name": word["name"]}}
        }
        exists = collection.find_one(query)

        if exists:
            print(f"La palabra '{word['name']}' ya existe en la letra '{Letra}'.")
            return False

        # Si no existe, hacemos push
        result = collection.update_one(
            {"_id": MAIN_DOC_ID},
            {"$push": {Letra: word}}
        )
        
        if result.modified_count > 0:
            print(f"Palabra '{word['name']}' agregada bajo la letra '{Letra}'.")
            return True
        else:
            print(f"No se pudo actualizar el documento {MAIN_DOC_ID}")
            return False
            
    except Exception as e:
        print(f"Error en AddMongo: {e}")
        return False

# --- ENDPOINTS ---

@italian_Dict_router.get("/Dicts_creator/it/index")
def get_index(user_id: str = Depends(get_current_user_id)):
    try:
        path = "Data/Dictionary/italian/index.txt"
        if not os.path.exists(path):
            return {"index": 0} # Valor por defecto si no existe
            
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            index = int(content) if content else 0
            return {"index": index}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading index: {str(e)}")

@italian_Dict_router.put("/Dicts_creator/it/index/{i}")
def update_index(i: int, user_id: str = Depends(get_current_user_id)):
    try:
        os.makedirs("Data/Dictionary/italian", exist_ok=True) # Asegura que la carpeta exista
        with open("Data/Dictionary/italian/index.txt", 'w', encoding='utf-8') as f:
            f.write(str(i))
        return {"status": True, "new_index": i}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error writing index: {str(e)}")

@italian_Dict_router.post("/Dicts_creator/it")
def AddWords(words: List[VerbModel], user_id: str = Depends(get_current_user_id)):
    # Convertimos los modelos a dicts limpios
    words_data = jsonable_encoder(words)
    results = []
    
    for wd in words_data:
        # Validar que tenga nombre para sacar la letra
        if "name" in wd and wd["name"]:
            letra = wd["name"][0].upper()
            # Filtramos campos None para no ensuciar la BD
            wd_clean = remove_none(wd)
            success = AddMongo(letra, wd_clean)
            results.append({"word": wd["name"], "added": success})
            
    return {"status": True, "details": results}

@italian_Dict_router.get("/Dicts_creator/it/words/{index}")
def getWords(index: int, user_id: str = Depends(get_current_user_id)):
    path = "Data/Dictionary/italian/italian.dic"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Dictionary file not found")
        
    try:
        with open(path, "r", encoding="utf-8") as f:
            # islice es eficiente para no leer todo el archivo en memoria
            lineas = list(islice(f, index, index + 100))
            # Limpiamos saltos de línea
            palabras = [linea.strip() for linea in lineas]
            return palabras
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading dictionary: {str(e)}")