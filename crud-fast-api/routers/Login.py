import mysql.connector
from fastapi import BackgroundTasks, Form, HTTPException, Cookie, APIRouter, Depends, Body,responses,Response
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
from routers.GoogleLogin import verify_google_token, create_refresh_token,create_access_token,ACCESS_TOKEN_EXPIRE_MINUTES,REFRESH_TOKEN_EXPIRE_DAYS
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
        cursor.close()
        conexion.close()
        return {"status":False, "detail":"User does not exist, please sign in"}
    
    # 1. CREAR ACCESS TOKEN (15 min)
    access_token = create_access_token({"email": email, "id": sub, "username": result[1]})

    # 2. CREAR REFRESH TOKEN (30 días)
    refresh_token, jti, refresh_expire = create_refresh_token(sub)
    
    # 3. GUARDAR REFRESH TOKEN EN BD (Para seguridad extra)
    # Primero borramos tokens viejos de este usuario para no llenar la BD (opcional)
    # cursor.execute("DELETE FROM user_refresh_tokens WHERE user_id = %s", (sub,))
    
    sql_save_refresh = """
        INSERT INTO user_refresh_tokens (user_id, token_jti, expires_at) 
        VALUES (%s, %s, %s)
    """
    cursor.execute(sql_save_refresh, (sub, jti, refresh_expire))
    conexion.commit()
    cursor.close()
    conexion.close()
    
   # 4. RESPUESTA
    # Nota: Es mejor NO mandar el token en la URL (?e=token), pero lo dejo por compatibilidad con tu front actual.
    response = JSONResponse(content={"redirect_url": f"{host}?e={access_token}"})

    # Cookie Access Token (15 min)
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=True,
        samesite="None"
    )

    # Cookie Refresh Token (30 días) -> ESTA ES LA CLAVE PARA NO LOGUEARSE DE NUEVO
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        httponly=True, # Súper importante: JS no puede leer esto
        secure=True,
        samesite="None",
        path="/refresh" # Solo se envía a la ruta de refresco (Seguridad extra)
    )
    return response

@log_router.post("/logout")
async def logout(response: Response,background_tasks: BackgroundTasks ,access_token: str = Cookie(None)):
    background_tasks.add_task(cleanup_expired_tokens)
    # 1. (Opcional pero recomendado) Blacklist en Redis
    if access_token:
        try:
            payload = jwt.decode(access_token, KEYSECRET, algorithms=["HS256"])
            jti = payload.get("jti")
            exp = payload.get("exp")
            if jti and exp:
                remaining = int(exp - datetime.utcnow().timestamp())
                if remaining > 0:
                    redis_client.setex(jti, remaining, "blacklisted")
        except:
            pass # Si el token ya era inválido, procedemos al logout igual

    # 2. BORRAR COOKIES (La parte clave)
    # Debes usar los mismos parámetros (path, domain, secure) con los que las creaste
    response.delete_cookie(key="access_token", httponly=True, secure=True, samesite="None")
    response.delete_cookie(key="refresh_token", httponly=True, secure=True, samesite="None", path="/refresh")
    
    return {"detail": "Logged out successfully"}

@log_router.post("/refresh")
async def refresh_token_endpoint(refresh_token: str = Cookie(None)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    try:
        # 1. Decodificar el Refresh Token actual
        payload = jwt.decode(refresh_token, KEYSECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        old_jti = payload.get("jti") #

        conexion = get_db_connection()
        cursor = conexion.cursor()
        
        # 2. VERIFICACIÓN Y ELIMINACIÓN (Rotación)
        # Buscamos el token y lo borramos en un solo paso para asegurar que sea de un solo uso
        sql_delete = "DELETE FROM user_refresh_tokens WHERE token_jti = %s AND user_id = %s"
        cursor.execute(sql_delete, (old_jti, user_id))
        
        # Si no se borró ninguna fila, significa que el token ya no existía (posible ataque)
        if cursor.rowcount == 0:
            conexion.close()
            raise HTTPException(status_code=401, detail="Token already used or invalid")

        # 3. GENERAR NUEVOS TOKENS
        # Obtenemos datos del usuario para el nuevo Access Token
        cursor.execute("SELECT name_User, email FROM users WHERE id_User = %s", (user_id,))
        user_data = cursor.fetchone()
        
        # Generamos nuevo Access Token
        new_access_token = create_access_token({
            "email": user_data[1], 
            "id": user_id, 
            "username": user_data[0]
        }) #

        # GENERAMOS UN NUEVO REFRESH TOKEN (Rotación real)
        new_refresh_token, new_jti, new_expire = create_refresh_token(user_id) #

        # 4. GUARDAR EL NUEVO REFRESH TOKEN EN BD
        sql_save = """
            INSERT INTO user_refresh_tokens (user_id, token_jti, expires_at) 
            VALUES (%s, %s, %s)
        """
        cursor.execute(sql_save, (user_id, new_jti, new_expire))
        conexion.commit()
        cursor.close()
        conexion.close()

        # 5. RESPUESTA CON AMBAS COOKIES ACTUALIZADAS
        response = JSONResponse(content={"message": "Tokens rotated successfully"})
        
        # Nueva cookie Access
        response.set_cookie(
            key="access_token",
            value=new_access_token,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            httponly=True, secure=True, samesite="None"
        )
        
        # Nueva cookie Refresh (El cliente ahora tiene un JTI distinto)
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
            httponly=True, secure=True, samesite="None",
            path="/refresh"
        )
        return response

    except JOSEError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    
def cleanup_expired_tokens():
    """Borra tokens que ya pasaron su fecha de expiración en MySQL"""
    try:
        conexion = get_db_connection()
        cursor = conexion.cursor()
        sql = "DELETE FROM user_refresh_tokens WHERE expires_at < NOW()" #
        cursor.execute(sql)
        conexion.commit()
        count = cursor.rowcount
        cursor.close()
        conexion.close()
        if count > 0:
            print(f"🧹 Limpieza: {count} tokens expirados eliminados.")
    except Exception as e:
        print(f"⚠️ Error en limpieza de tokens: {e}")