from fastapi import APIRouter, Depends
import mysql.connector
from Data.Mysql_Connection import get_db_connection
from Models.Models import ListData
import uuid

from routers.UserData.BasicUserData import get_current_user_id

UserData_router = APIRouter()

@UserData_router.get("/users/writing/{id_list}") # Quitamos /{e}
async def GetWritingLists(id_list: str, user_id: str = Depends(get_current_user_id)):
    # Nota: Tu código original pedía id_list pero no lo usaba en el SQL. 
    # Mantengo el SQL original que trae todas las listas del usuario.
    sql = 'SELECT id,title FROM lists INNER JOIN users ON lists.id_User=users.id_User WHERE lists.id_User=%s order by Created_at desc'
    params = (user_id,)
    
    conexion = get_db_connection()
    cursor = conexion.cursor(dictionary=True)
    try:
        cursor.execute(sql, params)
        result = cursor.fetchall()
        return {"status": True, "content": result}
    finally:
        cursor.close()
        conexion.close()

# Nota: Los endpoints POST, DELETE y PUT en tu archivo Writing.py original 
# eran IDÉNTICOS a los de Lists.py (apuntaban a "diby.lists"). 
# Si la intención es gestionar las mismas listas, ya tienes Lists.py.
# Si la intención es gestionar "escritos" (writings), deberías cambiar la tabla SQL a 'writings'.
# Por ahora, los dejo refactorizados con seguridad, pero apuntan a 'lists'.

@UserData_router.post("/Writing") 
async def CreateWritingList(New: ListData, user_id: str = Depends(get_current_user_id)):
    conexion = get_db_connection()
    cursor = conexion.cursor()
    try:
        name = New.name
        id_gen = str(uuid.uuid4())
        sql = "INSERT INTO lists (id, id_User, title) VALUES (%s, %s, %s)"
        cursor.execute(sql, (id_gen, user_id, name))
        conexion.commit()
        return {"title": name, "id": id_gen}
    except mysql.connector.Error as err:
        print(err)
        return {"status": False, "detail": str(err)}
    finally:
        cursor.close()
        conexion.close()

# (Omito Delete y Update si son duplicados exactos de Lists.py, 
# a menos que quieras lógica distinta).