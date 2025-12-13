import json
import os
from fastapi import APIRouter
from Data.Dictionary.WordsModel import WordsModel

Dictionary_router = APIRouter()

@Dictionary_router.post("/Dictionary_words")
async def CreateWord(words: WordsModel): 
    print("Ruta de trabajo actual:", os.getcwd())
    with open("./Data/Dictionary/Words.json", "r") as file:
        try:
            data = json.load(file)
        except json.JSONDecodeError:
            data = {}  
    for w in words.words:
        letra = w.word[0].upper()
        data.setdefault(letra, {})[w.word] = w.dict()  # convertir a dict
        
    with open("./Data/Dictionary/Words.json", "w") as file:
        json.dump(data, file, indent=4)
        
    return {"status": True, "content": words}
