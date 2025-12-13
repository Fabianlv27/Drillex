from fastapi import APIRouter, Response
from googletrans import Translator

Translator_Router= APIRouter()

@Translator_Router.get("/Translate/{text}")
def GetTranslate(text:str):
    print(text)
    translator = Translator()
    translation = translator.translate(text, dest='es')
    print(translation.text)
    return translation.text  