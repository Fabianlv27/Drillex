import os

def extraer_rango_lineas(inicio, fin, archivo_origen='./crud-fast-api/Data/Dictionary/words_dictionary.json'):
    print("Ruta de trabajo actual:", os.getcwd())
    print("Buscando el archivo:", archivo_origen)

    try:
        with open(archivo_origen, 'r', encoding='utf-8') as f:
            lineas = f.readlines()

        if inicio < 1 or fin > len(lineas) or inicio > fin:
            print("Rango inválido. El archivo tiene", len(lineas), "líneas.")
            return

        lineas_extraidas = lineas[inicio - 1:fin]
        nombre_salida = f"{inicio}_{fin}.txt"

        with open('./crud-fast-api/Data/Dictionary/Temps/'+nombre_salida, 'w', encoding='utf-8') as f:
            f.writelines(lineas_extraidas)

        print(f"Se creó el archivo '{nombre_salida}' con las líneas {inicio} a {fin}.")

    except FileNotFoundError:
        print(f"❌ No se encontró el archivo '{archivo_origen}'.")
    except Exception as e:
        print(f"⚠ Ocurrió un error: {e}")

# Test
for i in range(0,150000):
    extraer_rango_lineas(((i-1)*20)+1, i*20)
