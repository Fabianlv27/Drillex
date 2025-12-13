from fastapi import APIRouter
import mysql
from routers.UserData.BasicUserData import decode_token, validate_user
from Data.Mysql_Connection import get_db_connection
from Models.Models import ListData
from routers.GoogleLogin import verify_google_token, create_token
from routers.functions.ValidateToken import validate_Token

import uuid
UserData_router = APIRouter()

@UserData_router.get("/users/writing/{e}/{id_list}")
async def GetLists(e, id_list):
    data_user = await validate_Token(e)
    if "error" in data_user:
        return {"status":False, "detail":data_user}
    
    sql = 'SELECT id,title FROM lists INNER JOIN users ON lists.id_User=users.id_User WHERE lists.id_User=%s order by Created_at desc'
    params = (data_user["Data"]["id"],)
    conexion = get_db_connection()
    cursor = conexion.cursor(dictionary=True)
    cursor.execute(sql, params)
    result = cursor.fetchall()
    return {"status": True, "content": result}

@UserData_router.post("/Lists/{e}")
async def CreateList(e, New: ListData):
    data_user = await validate_Token(e)
    if not data_user:
        return data_user
    conexion = get_db_connection()
    cursor = conexion.cursor()
    try:
        name = New.name
        id=str(uuid.uuid4())
        sql = "INSERT INTO diby.lists (id,id_User,title) VALUES (%s,%s,%s)"
        cursor.execute(sql,(id,data_user["Data"]["id"], name))
        conexion.commit()
        return {"title": name, "id": id}
    except mysql.connector.Error as err:
        print(err)
    finally:
        cursor.close()
        conexion.close()

@UserData_router.delete("/Lists/{e}/{id}")
async def DeleteList(e, id):
    data_user = await validate_Token(e)
    if not data_user:
        return data_user
    conexion = get_db_connection()
    cursor = conexion.cursor()
    try:
        sql = "DELETE FROM diby.lists WHERE id=%s AND id_User=%s"
        cursor.execute(sql, (id, data_user["Data"]["id"]))
        conexion.commit()
        return {"status": True, "message": "List deleted successfully"}
    except mysql.connector.Error as err:
        print(err)
        return {"status": False, "message": str(err)}
    finally:
        cursor.close()
        conexion.close()
        
@UserData_router.put("/Lists/{e}/{id}")
async def UpdateList(e, id, New: ListData):
    data_user = await validate_Token(e)
    if not data_user:
        return data_user
    conexion = get_db_connection()
    cursor = conexion.cursor()
    try:
        name = New.name
        sql = "UPDATE diby.lists SET title=%s WHERE id=%s AND id_User=%s"
        cursor.execute(sql, (name, id, data_user["Data"]["id"]))
        conexion.commit()
        return {"status": True, "message": "List updated successfully"}
    except mysql.connector.Error as err:
        print(err)
        return {"status": False, "message": str(err)}
    finally:
        cursor.close()
        conexion.close()