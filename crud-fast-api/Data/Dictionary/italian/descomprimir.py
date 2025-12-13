import sys
import gzip
import os

# Si no se pasa archivo, mostrar error y salir
if len(sys.argv) < 2:
    sys.exit("No input file specified")

input_file = sys.argv[1]

# Nombre del archivo de salida (quita extensión .fc si existe)
output_file = os.path.splitext(os.path.basename(input_file))[0]

with gzip.open(input_file, "rt", encoding="utf-8") as gz, open(output_file, "w", encoding="utf-8") as out:
    last = ""
    while True:
        # Leer un byte (como carácter) para el counter
        counter_char = gz.read(1)
        if not counter_char:
            break  # Fin de archivo
        
        counter = ord(counter_char)  # Convertir a número

        # Leer el resto de la línea y quitar espacios
        delta = gz.readline().strip()

        # Reconstruir línea
        last = last[:counter] + delta

        # Escribir en el archivo
        out.write(last + "\n")
