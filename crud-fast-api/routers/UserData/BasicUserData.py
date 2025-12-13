from ast import List
from typing import Optional, TypedDict
from fastapi import APIRouter
from fastapi.responses import RedirectResponse
from jose import jwt, JOSEError
import mysql
from Data.Mysql_Connection import get_db_connection
import os
from routers.functions.ValidateToken import validate_Token
from pydantic import BaseModel
from Models.Models import Word, WordUdpate

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

@UserData_router.get("/users/me/{e}")
def GetMe(e):
    try:
        data_user = decode_token(e)
        print(data_user)
        if "error" in data_user:
            return RedirectResponse(os.getenv("Host")+'login', status_code=302)
        
        validation_response = validate_user(data_user)
        print(validation_response)
        if validation_response:
            return validation_response

        sql = 'select name_User,id_User from users where name_User=%s'
        params = (data_user["username"],)
        conexion = get_db_connection()
        cursor = conexion.cursor()
        cursor.execute(sql, params)
        result = cursor.fetchall()
        print('resultado')
        print(result)
        
        cursor.close()
        conexion.close()
        if result is None:
            return RedirectResponse(os.getenv("Host")+'login', status_code=302)
        
        return result
    except JOSEError:
        return RedirectResponse(os.getenv("Host")+'login', status_code=302)
    
class progressData(BaseModel):
    idList:str
    game:str


    

@UserData_router.post("/user/progress/{e}")
async def postProgress(e:str,data:progressData):
    data_user = await validate_Token(e)
    if not data_user:
        return data_user
    conexion = get_db_connection()
    cursor = conexion.cursor()
    try:
        progress = "Insert into progress (id_List,game,cant_showed) values (%s,%s,%s)"
        cursor.execute(progress, (data.idList, data.game,0))       
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
         
def updateRight(cursor,data):
    get_progress_right="""select id_Word from progress_right where 
    id_List=%s and game=%s"""""
    cursor.execute(get_progress_right,(data.idList,data.game))
    words_right = [row[0] for row in cursor.fetchall()]
    if data.game=="Random":
        InsertMode(cursor,data)
    
    InsertRight = "INSERT INTO progress_right (id_List, game,id_Word) VALUES "
    updateRightSQL="Update progress_right set fecha=Now() where game=%s and ("
    Values = []
    placeholders = []
    UpdtValues=[]
    for word in data.right:
        if word not in words_right:
            placeholders.append("(%s, %s,%s)")
            Values.extend([data.idList,data.game,word])
        else:
            if not "or" in updateRightSQL:
                updateRightSQL+='id=%s'
            else:
                updateRightSQL+='or id=%s'
            UpdtValues.append(word)
                
                                     
    if len(Values)>0 and len(placeholders)>0:
        InsertRight+= ",".join(placeholders)
        cursor.execute(InsertRight, tuple(Values))
        print(cursor.statement)
        
    if len(UpdtValues)>0:
        updateRightSQL+=")"
        cursor.execute(updateRightSQL,tuple(UpdtValues))
        print(cursor.statement)
    
    
    
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
        
@UserData_router.post("/user/progress/update/{e}")
async def putProgress(e:str,data:ProgressUpdated):
    data_user = await validate_Token(e)
    if not data_user:
        return data_user
    conexion = get_db_connection()
    cursor = conexion.cursor()
    try:
        updateCant(cursor,data)
        if data.game!="random":
            updateRight(cursor,data)
        else:
            InsertMode(cursor,data)
        conexion.commit()
    except mysql.connector.Error as err :
        print(err)
        return

