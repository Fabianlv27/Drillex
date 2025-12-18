import json
from os import getenv
from fastapi import Depends, FastAPI, Request, HTTPException
from fastapi.middleware import Middleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from starlette.middleware.base import BaseHTTPMiddleware
from jose import JOSEError, jwt, JWTError
import uvicorn
from routers.UserData.Words import UserData_router as WordsRouter
from routers.UserData.Lists import UserData_router as ListsRouter
from routers.Phrasals.Phrasals import Phrasals as PhrasalsRouter
from routers.functions.SubtitlesYt import Sub_Router
from routers.UserData.BasicUserData import UserData_router as BasicUserRouter
from Data.Dictionary.WordsDictionary import Dictionary_router
from routers.functions.Translator import Translator_Router
from routers.Login import log_router 
from routers.functions.ValidateToken import validate_Token
from routers.functions.TextVoice import TextVoice
from routers.functions.Match import Match
from routers.functions.SongLyrics import SongsLyric
from Data.Dictionary.ItalianDictionary import ItalianDictRouter
from routers.Dicts.italianDictRouter import italian_Dict_router
app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class TokenValidationResponse(BaseModel):
    valid: bool

@app.post("/validate-token", response_model=TokenValidationResponse)
async def validateToken(tk: str = Depends(oauth2_scheme)):
    # Implement your token validation logic here
    await validate_Token(tk)
    return TokenValidationResponse(valid=True)


# Registrar routers
app.include_router(WordsRouter, tags=["Words"])
app.include_router(ListsRouter, tags=["Lists"])
app.include_router(PhrasalsRouter, tags=["Phrasals"])
app.include_router(BasicUserRouter, tags=["User"])
app.include_router(log_router, tags=["Login"])
app.include_router(TextVoice, tags=["TextVoice"])
app.include_router(Dictionary_router, tags=["Dictionary"])
app.include_router(Translator_Router, tags=["Translator"])
app.include_router(Sub_Router, tags=["Subtitles"])
app.include_router(Match, tags=["Match"])
app.include_router(SongsLyric, tags=["SongLyrics"])
app.include_router(ItalianDictRouter, tags=["ItalianDictionary"])
app.include_router(italian_Dict_router,tags=["Dicts_creator"])
@app.get("/")
def root():
    return {"message": "Welcome to the API"}

ALGORITHM = "HS256"
PUBLIC_ROUTES = {
    "/", 
    "/users/dashboard",
    "/users/login",
    "/users/signin",
    "/Dicts_creator/it/index"
}


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Excluir rutas públicas y solicitudes OPTIONS
        print(f"Request URL: {request.url}")
        print(f"Request Headers: {request.headers}")
        if request.method == "OPTIONS" or request.url.path in PUBLIC_ROUTES:
            return await call_next(request)
        token = request.headers.get("Authorization")
        if not token:
            token = request.cookies.get("access_token")
        if not token:
            raise HTTPException(status_code=401, detail="Token missing")
        try:
            # Decodificar el token JWT
            payload = jwt.decode(token, getenv('KEYSECRET'), algorithms=[ALGORITHM])
            request.state.user = payload  # Almacenar datos del usuario en el estado de la solicitud
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

        return await call_next(request)

# Agregar el middleware de CORS
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://192.168.0.14:5173",
                   "https://dibylocal.com:5173",
                   "https://dibylocal.com:5173/signin",
                   "https://dibylocal.com:5173/login",
                   "https://dibylocal.com",
                   
                   ],  # Cambia esto según tu dominio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    # Cargar configuración desde config.json
    with open("./config.json") as f:
        config = json.load(f)

    # Ejecutar Uvicorn con los parámetros del JSON
    uvicorn.run(
        "main:app",
        host=config.get("host", "127.0.0.1"),
        port=config.get("port", 8000),
        ssl_keyfile=config.get("ssl_keyfile"),
        ssl_certfile=config.get("ssl_certfile"),
        reload=True,  # <--- Agrega esta línea para activar el modo reload
    )