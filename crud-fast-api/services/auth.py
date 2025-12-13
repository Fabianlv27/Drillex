from jose import jwt, JOSEError
from fastapi.responses import RedirectResponse
from utils.constants import settings

def decode_token(token: str):
    try:
        return jwt.decode(token, key=settings.KEYSECRET, algorithms=["HS256"])
    except JOSEError as e:
        return {"error": str(e)}

def validate_user(data_user, get_user_func):
    if get_user_func(data_user["username"]) is None:
        return RedirectResponse("/register", status_code=302)
    return None
