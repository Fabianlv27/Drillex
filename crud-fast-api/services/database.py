from os import getenv
import mysql.connector
from utils.constants import settings

def get_db_connection():
    return mysql.connector.connect(
        host=getenv("DB_HOST"),
        user=getenv("DB_USER"),
        password=getenv("DB_PASSWORD"),
        database=getenv("DB_NAME"),
        port=getenv("DB_PORT"),  # Default MySQL port is 3306
    )
