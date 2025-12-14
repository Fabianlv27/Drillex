from jose import jwt, JOSEError
from fastapi.responses import RedirectResponse
from utils.constants import settings
from fastapi import APIRouter, Depends, HTTPException, Cookie
import os
from dotenv import load_dotenv
load_dotenv() # Añade esto por seguridad para cargar el .env
KEYSECRET = os.getenv("KEYSECRET")
def decode_token(token: str):
    try:
        return jwt.decode(token, key=settings.KEYSECRET, algorithms=["HS256"])
    except JOSEError as e:
        return {"error": str(e)}

def validate_user(data_user, get_user_func):
    if get_user_func(data_user["username"]) is None:
        return RedirectResponse("/register", status_code=302)
    return None

def get_current_user_id(access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Token missing")
    try:
        payload = jwt.decode(access_token, KEYSECRET, algorithms=["HS256"])
        user_id = payload.get("id") # Asegúrate de que tu payload tenga 'id' o 'sub'
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except JOSEError:
        raise HTTPException(status_code=401, detail="Token invalid or expired")