import json
from fastapi.responses import JSONResponse
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
from routers.functions.GeminiAI import Gemini_Router
from routers.functions.Dictionary import Dictionary_Router
from routers.functions.Grammar import Grammar_Router
from fastapi.middleware.cors import CORSMiddleware # Movido arriba por orden

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
app.include_router(Gemini_Router, tags=["AI Tools"])
app.include_router(Dictionary_Router, tags=["AI Dictionary"])
app.include_router(Grammar_Router, tags=["AI Grammar"])
@app.get("/")
def root():
    return {"message": "Welcome to the API"}

ALGORITHM = "HS256"
# --- LISTA DE RUTAS PÚBLICAS (Sin token) ---
PUBLIC_ROUTES = {
    "",                 # Raíz vacía
    "/",                # Raíz con barra
    "/users/dashboard",
    "/users/login",
    "/users/signin",
    "/Dicts_creator/it/index",
    "/openapi.json",    # Docs
    "/docs",            # Docs
    "/google_login",    # <--- IMPORTANTE: Ruta exacta sin barra final
    "/google_signin",   # <--- IMPORTANTE
    "/validate-token"   # <--- IMPORTANTE: Si la usas para validar
}

# --- MIDDLEWARE DE CORS (CORREGIDO) ---
# Debe ir ANTES del AuthMiddleware si quieres que las peticiones OPTIONS (preflight) pasen sin auth
app.add_middleware(
    CORSMiddleware,
    # ### CAMBIO IMPORTANTE: ###
    # allow_origins=["*"] NO funciona con allow_credentials=True.
    # Usamos regex para permitir cualquier origen HTTPS (necesario para extensiones en Wikipedia, Youtube, etc)
    allow_origin_regex="https://.*", 
    
    # También permitimos explícitamente tus dominios locales/dev
    allow_origins=[
        "http://localhost:5173",
        "https://dibylocal.com:5173",
        "https://dibylocal.com:8000"
    ],
    allow_credentials=True, # Esto permite pasar Cookies y Headers de Auth
    allow_methods=["*"],
    allow_headers=["*"],    
)

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Normalizamos la ruta (quitamos la barra final si existe)
        current_path = request.url.path.rstrip("/")
        
        # DEBUG: Descomenta esto si sigue fallando para ver qué ruta llega
        print(f"🔍 Middleware Check: {current_path}") 

        # 2. Comprobamos si es pública
        # Verificamos la ruta exacta O la ruta sin barra final
        if (request.method == "OPTIONS" or 
            current_path in PUBLIC_ROUTES or 
            request.url.path in PUBLIC_ROUTES):
            return await call_next(request)
        
        # 3. Extracción del Token
        token = request.headers.get("Authorization")
        
        if token and token.startswith("Bearer "):
            token = token.split(" ")[1]

        if not token:
            token = request.cookies.get("access_token")
            
        if not token:
            # Validación extra para docs (por si acaso)
            if current_path == "" or current_path.startswith("/docs") or current_path.startswith("/openapi.json"):
                return await call_next(request)
            
            # --- CAMBIO CLAVE: Usamos JSONResponse en lugar de raise HTTPException ---
            return JSONResponse(status_code=401, content={"detail": "Token missing"})
            
        try:
            # Decodificar el token JWT
            payload = jwt.decode(token, getenv('KEYSECRET'), algorithms=[ALGORITHM])
            request.state.user = payload
        except JWTError:
             # --- CAMBIO CLAVE: JSONResponse para evitar el error 500 ---
            return JSONResponse(status_code=401, content={"detail": "Invalid token"})

        return await call_next(request)
# Añadimos tu Auth Middleware
app.add_middleware(AuthMiddleware)


if __name__ == "__main__":
    # Cargar configuración desde config.json
    try:
        with open("./config.json") as f:
            config = json.load(f)
    except FileNotFoundError:
        config = {} # Fallback por si no existe

    # Ejecutar Uvicorn
    uvicorn.run(
        "main:app",
        # Asegúrate de que esto coincida con tu hosts (0.0.0.0 permite acceso externo, 127.0.0.1 solo local)
        host=config.get("host", "0.0.0.0"), 
        port=config.get("port", 8000),
        ssl_keyfile=config.get("ssl_keyfile"),
        ssl_certfile=config.get("ssl_certfile"),
        reload=True,
    )