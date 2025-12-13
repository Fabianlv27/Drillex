import mysql.connector
import os
from dotenv import load_dotenv  # Importa la función para cargar el archivo .env

# Carga las variables de entorno desde el archivo .env
load_dotenv()

def get_db_connection():
    print(os.getenv("DB_HOST"))  # Verifica si se imprime correctamente
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        port=os.getenv("DB_PORT", "3306"),  # Default MySQL port is 3306
    )

