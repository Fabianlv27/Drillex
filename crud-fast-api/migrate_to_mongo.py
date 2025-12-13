import json
from pymongo import MongoClient

# Conexión a MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["DIBY"]
collection = db["phrasals"]

# Leer datos del archivo JSON
with open("Data/Phrasals.json", "r") as file:
    data = json.load(file)

# Insertar datos en la colección
for item in data["Phrasals"]:
    collection.insert_one(item)

print("Datos migrados exitosamente a MongoDB.")

