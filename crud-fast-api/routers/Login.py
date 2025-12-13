import mysql.connector
from fastapi import Form, HTTPException, Cookie, APIRouter, Depends, Body,responses,Response
from typing import Annotated
from datetime import datetime, timedelta
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from jose import jwt, JOSEError
import bcrypt
import os
import uuid
import redis
from Data.Mysql_Connection import get_db_connection
from routers.GoogleLogin import verify_google_token, create_token
from Models.Models import TokenRequest

host = os.getenv("Host")
KEYSECRET = os.getenv("KEYSECRET")
TOKEN_SCONDS_EXP = 31540000  # one year

log_router = APIRouter()
Jinja2Templates = Jinja2Templates(directory="templates")

# Conexión a Redis
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

def verify_token_not_blacklisted(token: str = Depends(Cookie("access_token"))):
    try:
        payload = jwt.decode(token, key=KEYSECRET, algorithms=["HS256"])
        jti = payload.get("jti")
        if jti and redis_client.get(jti):
            raise HTTPException(status_code=401, detail="Token has been invalidated")
    except JOSEError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_user(username: str):
    sql = 'select name_User,id_User from project_1.users where name_User=%s'
    params = (username,)
    conexion = get_db_connection()
    cursor = conexion.cursor()
    cursor.execute(sql, params)
    result = cursor.fetchall()
    return result

@log_router.post("/google_signin")
async def google_signin(data: TokenRequest):
    print(data.id_token)
    user_info = await verify_google_token(data.id_token)
    email = user_info.get("email")
    sub = user_info.get("sub")  # ID único de usuario en Google

    if not email or not sub:
       return {"status":False, "detail":"Missing email or sub in token"}

    conexion = get_db_connection()
    cursor = conexion.cursor()

    # Revisa si el usuario ya existe
    print('sub'+ sub)
    sql_check = "SELECT id_User FROM users WHERE id_User = %s"
    cursor.execute(sql_check, (sub,))
    result = cursor.fetchone()
        # Si existe,te dice que hagas login
    if result:
        print("User already exists: ", result)
        return {"status":False, "detail":"User already exists, please login"}
        
    sql_insert = "INSERT INTO users (id_User, email,name_User,age) VALUES (%s, %s, %s, %s)"
    cursor.execute(sql_insert, (sub, email,data.username, data.age))
    conexion.commit()
    cursor.close()
    conexion.close()
    return {"status":True}
    


@log_router.post("/google_login")
async def google_login(id_token: str = Body(...)):
    user_info = await verify_google_token(id_token)
    email = user_info.get("email")
    sub = user_info.get("sub")  # ID único de usuario en Google

    if not email or not sub:
        return {"status":False, "detail":"Missing email or sub in token"}

    conexion = get_db_connection()
    cursor = conexion.cursor()

    # Revisa si el usuario ya existe
    sql_check = "SELECT id_User,name_User FROM users WHERE id_User = %s"
    cursor.execute(sql_check, (sub,))
    result = cursor.fetchone()
    
    # Si no existe, lo inserta (solo para login por Google, usamos el 'sub' como ID)
    if not result:
        return {"status":False, "detail":"User does not exist, please sign in"}
    cursor.close()
    conexion.close()

    # Crea el token JWT
    token, jti = create_token({"email":email, "id": sub,"username":result[1]})

    response_data = {
        "redirect_url": f"{os.getenv('Host')}?e={token}"
    }
    response = JSONResponse(content=response_data)
    response.set_cookie(
        key="access_token",
        value=token,
        max_age=TOKEN_SCONDS_EXP,
        httponly=True,
        secure=True,
        samesite="None"
    )
    return response

@log_router.post("/logout")
async def logout(response: Response, token: str = Cookie(...)):
    try:
        payload = jwt.decode(token, key=KEYSECRET, algorithms=["HS256"])
        jti = payload.get("jti")
        exp = payload.get("exp")
        if jti and exp:
            # Calcula cuánto tiempo falta para que expire el token y bloquea su uso en Redis
            remaining_seconds = int(exp - datetime.utcnow().timestamp())
            redis_client.setex(jti, remaining_seconds, "blacklisted")

        # Borra la cookie del navegador
        response.delete_cookie(key="access_token", httponly=True, secure=True, samesite="None")
        return {"detail": "Logged out successfully"}
    except JOSEError:
        raise HTTPException(status_code=401, detail="Invalid token")