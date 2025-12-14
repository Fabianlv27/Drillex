from fastapi import APIRouter, HTTPException
from googletrans import Translator

Translator_Router = APIRouter()

@Translator_Router.get("/Translate/{text}")
async def GetTranslate(text: str):
    try:
        translator = Translator()
        # La llamada a translate a veces es asíncrona en versiones nuevas, 
        # pero la librería estándar es sincrona.
        translation = translator.translate(text, dest='es')
        return translation.text
    except Exception as e:
        print(f"Translation error: {e}")
        # En vez de fallar, devolvemos el texto original o error
        return text