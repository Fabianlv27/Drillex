import json

# Abre el archivo JSON y carga su contenido
with open('Phrasals.json') as json_file:
    data = json.load(json_file)

# Ahora, data contiene el contenido del archivo JSON
print(data)
