from ast import List
from typing import Optional, TypedDict
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from jose import jwt, JOSEError
import mysql
from Data.Mysql_Connection import get_db_connection
import os
from routers.functions.ValidateToken import validate_Token
from pydantic import BaseModel
from Models.Models import Word, WordUdpate
from services.auth import get_current_user_id

UserData_router = APIRouter()
KEYSECRET = os.getenv("KEYSECRET")
TOKEN_SCONDS_EXP = 31540000  # one year

def get_user(username: str):
    sql = 'select name_User,id_User from project_1.users where name_User=%s'
    params = (username,)
    conexion = get_db_connection()
    cursor = conexion.cursor()
    cursor.execute(sql, params)
    result = cursor.fetchall()
    return result

def decode_token(e):
    try:
        return jwt.decode(e, key=KEYSECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return {"error": "Token expired"}
    except jwt.JWTError:
        return {"error": "Invalid token"}

def validate_user(data_user):
    if get_user(data_user["username"]) is None:
        return RedirectResponse(os.getenv("Host")+'login', status_code=302)
    return None


    
class progressData(BaseModel):
    idList:str
    game:str

@UserData_router.get("/users/me") # Quitamos /{e}
def GetMe(user_id: str = Depends(get_current_user_id)) :
    # FastAPI ya validó el token. Aquí 'user_id' es    seguro.
    
    conexion = get_db_connection()
    cursor = conexion.cursor()
    
    try:
        sql = 'select name_User, id_User from users    where id_User=%s'
        cursor.execute(sql, (user_id,))
        result = cursor.fetchall()

        if not result:
            raise HTTPException(status_code=404,   detail="User not found")
        
        return result # Devuelve [[name, id]]
    finally:
        cursor.close()
        conexion.close()
    

@UserData_router.post("/user/progress") # Quitamos /{e}
async def postProgress(data: progressData, user_id: str = Depends(get_current_user_id)):
    conexion = get_db_connection()
    cursor = conexion.cursor()
    try:
        # Usamos user_id si necesitas validar que la lista pertenece al usuario, 
        # aunque aquí solo insertas en progress
        progress = "INSERT IGNORE INTO progress (id_List, game, cant_showed) VALUES (%s, %s, %s)"
        cursor.execute(progress, (data.idList, data.game, 0))       
        conexion.commit()
        return {"status": True, "message": "Progress posted successfully"}
    except mysql.connector.Error as err:
        print(err)
        return {"status": False, "message": str(err)}
    finally:
        cursor.close()
        conexion.close()

# 🔹 Modelo de las 4 categorías de dificultad
class DifficultyModel(BaseModel):
    easy:Optional[list[WordUdpate] ] = []
    normal:Optional[list[WordUdpate] ] = []
    hard: Optional[list[WordUdpate]] = []
    ultrahard:Optional[list[WordUdpate]]  = []


# 🔹 Modelo principal
class ProgressUpdated(BaseModel):
    idList: str
    game: str
    cant: int
    right: Optional[list[str]] = None
    difficulty: Optional[DifficultyModel] = None

def updateCant(cursor,data):
        sql="Update progress set cant_showed=%s where id_List=%s and game=%s"
        cursor.execute(sql,(data.cant,data.idList,data.game))
     
def InsertMode(cursor,data): 
    sql="INSERT INTO Progress_mode (id_Word,mode) VALUES "
    final="ON DUPLICATE KEY UPDATE mode=VALUES(mode),date=NOW()"
    placeholder=[]
    values=[]
    print(data.difficulty)
    for key,value in data.difficulty:
        for i,w in enumerate(value) :
            placeholder.append("(%s,%s)")
            values.extend([w.id_Word,key])
    
    if len(values)>0:
        sql+=",".join(placeholder)+final
        cursor.execute(sql,values)
         
def updateRight(cursor, data, idList):
    # Esta Query hace "INSERT" si no existe, y si existe, actualiza la fecha.
    # Requiere que (id_List, game, id_Word) sean una clave única o compuesta en tu tabla.
    
    sql = """
    INSERT INTO progress_right (id_List, game, id_Word, fecha) 
    VALUES (%s, %s, %s, NOW())
    ON DUPLICATE KEY UPDATE fecha = NOW()
    """
    
    values = []
    for word in data.right:
        values.append((idList, data.game, word))
        
    if values:
        cursor.executemany(sql, values) # executemany es muy rápido para lote
    
    
    
def getRight(cursor,idList,game):
        getProgress="select id_Word from progress_right where id_List=%s and game=%s"
        cursor.execute(getProgress,(idList,game))
        right=cursor.fetchall()
        return right

@UserData_router.get("/user/progress/{e}/{idList}/{game}")
async def getProgress(e:str,idList:str,game:str):
    data_user = await validate_Token(e)
    if not data_user:
        return {"status":False,"message":"invalid Token"}
    conexion = get_db_connection()
    cursor = conexion.cursor()
    try:
        right=getRight(cursor,idList,game)
        getCant="select cant_showed from progress where id_List=%s and game=%s"
        cursor.execute(getCant,(idList,game))
        print(cursor.statement)
        cant=cursor.fetchone()[0]
        return{"right":right,"cant":cant}
    
    except mysql.connector.Error as err:
        print(err)
        return{"message":"error getting progress","status":False}
    finally:
        cursor.close()
        conexion.close()
        
@UserData_router.post("/user/progress/update") # Quitamos /{e}
async def putProgress(data: ProgressUpdated, user_id: str = Depends(get_current_user_id)):
    conexion = get_db_connection()
    cursor = conexion.cursor()
    try:
        updateCant(cursor, data)
        
        if data.game != "random":
            # Usamos la versión optimizada
            updateRight(cursor, data, data.idList)
        else:
            InsertMode(cursor, data)
            
        conexion.commit()
        return {"status": True}
    except mysql.connector.Error as err:
        print(err)
        return {"status": False, "message": str(err)}
    finally:
        cursor.close()
        conexion.close()