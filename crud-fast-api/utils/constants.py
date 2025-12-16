from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Variables obligatorias (deben estar en tu .env)
    KEYSECRET: str
    
    # Base de datos (según tu error, estas variables existen en tu .env)
    DB_HOST: str
    DB_PORT: str
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    
    # Configuración del Host (frontend)
    HOST: str = "http://localhost:5173"  # Valor por defecto si falta
    
    # Google Login
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    
    # Diccionario Italiano
    ITALIAN_DICTIONARY_URL: Optional[str] = None
    ITALIAN_DICTIONARY_API_KEY: Optional[str] = None

    # Si tu código necesita DATABASE_URL pero tu .env tiene las partes separadas,
    # puedes construirla automáticamente o hacerla opcional:
    DATABASE_URL: Optional[str] = None 

    # Configuración de Pydantic
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore",  # IMPORTANTE: Esto evita que falle si hay variables extra en el .env
        case_sensitive=False # Para que no importe si usas mayúsculas o minúsculas
    )

settings = Settings()