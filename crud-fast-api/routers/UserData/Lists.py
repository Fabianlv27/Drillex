from fastapi import APIRouter, Depends, HTTPException
import mysql.connector
from Data.Mysql_Connection import get_db_connection
from Models.Models import ListData
import uuid

# Importamos la dependencia de seguridad que creamos
from routers.UserData.BasicUserData import get_current_user_id 

UserData_router = APIRouter()

@UserData_router.get("/users/Lists") # Quitamos /{e}
async def GetLists(user_id: str = Depends(get_current_user_id)):
    # Ya tenemos user_id seguro desde la cookie
    sql = 'SELECT id,title FROM lists INNER JOIN users ON lists.id_User=users.id_User WHERE lists.id_User=%s order by Created_at desc'
    params = (user_id,)
    
    conexion = get_db_connection()
    cursor = conexion.cursor(dictionary=True)
    try:
        cursor.execute(sql, params)
        result = cursor.fetchall()
        return {"status": True, "content": result}
    except mysql.connector.Error as err:
        print(err)
        return {"status": False, "detail": str(err)}
    finally:
        cursor.close()
        conexion.close()

@UserData_router.post("/Lists") # Quitamos /{e}
async def CreateList(New: ListData, user_id: str = Depends(get_current_user_id)):
    conexion = get_db_connection()
    cursor = conexion.cursor()
    try:
        name = New.name
        id_list = str(uuid.uuid4())
        sql = "INSERT INTO lists (id, id_User, title) VALUES (%s, %s, %s)"
        cursor.execute(sql, (id_list, user_id, name))
        conexion.commit()
        return {"title": name, "id": id_list}
    except mysql.connector.Error as err:
        print(err)
        return {"status": False, "detail": str(err)}
    finally:
        cursor.close()
        conexion.close()

@UserData_router.delete("/Lists/{id}") # Quitamos /{e}
async def DeleteList(id: str, user_id: str = Depends(get_current_user_id)):
    conexion = get_db_connection()
    cursor = conexion.cursor()
    try:
        sql = "DELETE FROM lists WHERE id=%s AND id_User=%s"
        cursor.execute(sql, (id, user_id))
        conexion.commit()
        return {"status": True, "message": "List deleted successfully"}
    except mysql.connector.Error as err:
        print(err)
        return {"status": False, "message": str(err)}
    finally:
        cursor.close()
        conexion.close()
        
@UserData_router.put("/Lists/{id}") # Quitamos /{e}
async def UpdateList(id: str, New: ListData, user_id: str = Depends(get_current_user_id)):
    conexion = get_db_connection()
    cursor = conexion.cursor()
    try:
        name = New.name
        sql = "UPDATE lists SET title=%s WHERE id=%s AND id_User=%s"
        cursor.execute(sql, (name, id, user_id))
        conexion.commit()
        return {"status": True, "message": "List updated successfully"}
    except mysql.connector.Error as err:
        print(err)
        return {"status": False, "message": str(err)}
    finally:
        cursor.close()
        conexion.close()