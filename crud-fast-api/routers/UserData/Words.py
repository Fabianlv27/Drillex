import json
import os
import uuid
from fastapi import APIRouter
from pydantic import ValidationError
from routers.UserData.BasicUserData import decode_token, validate_user
from Data.Mysql_Connection import get_db_connection
from Models.Models import Word, WordUdpate

import mysql.connector

UserData_router = APIRouter()
KEYSECRET = os.getenv("KEYSECRET")

@UserData_router.get("/words/{e}/{ListId}/{ListName}/{game}")
def GetListWords(e, ListId, ListName='default', game='default'):
    data_user = decode_token(e)
    if "error" in data_user:
        return {"status": False, "detail": data_user}

    validation = validate_user(data_user)
    if validation:
        return validation

    VerifyList = '''
    SELECT id_User, title
    FROM lists
    WHERE id = %s AND id_User = %s; 
    '''
    params = (ListId, data_user["id"])
    conexion = get_db_connection()
    cursor = conexion.cursor(dictionary=True)

    try:
        cursor.execute(VerifyList, params)
        result = cursor.fetchone()
        if not result:
            return {"status": False, "detail": "Esta lista ya no existe."}
        if ListName != "default" and result["title"] != ListName:
            return {"status": False, "detail": "El nombre de la lista no coincide con el nombre proporcionado."}
    except mysql.connector.Error as err:
        print(err)
        return {"status": False, "detail": "Error al verificar la lista."}
    except Exception as ex:
        print(f"Unexpected error: {ex}")
        return {"status": False, "detail": "Unexpected error occurred."}

    try:
        modes = '''
 LEFT JOIN Progress_mode pm
    ON pm.id_Word = w.id_Word
   AND (
        (pm.mode = "easy"      AND DATEDIFF(NOW(), pm.date) > 7) OR
        (pm.mode = "normal"    AND DATEDIFF(NOW(), pm.date) > 3) OR
        (pm.mode = "hard"      AND DATEDIFF(NOW(), pm.date) > 2) OR
        (pm.mode = "ultrahard" AND DATEDIFF(NOW(), pm.date) >= 1)
   )
'''

        base_sql = '''
SELECT 
    l.id_user,
    NULL AS id_Word, NULL as name, NULL as past, NULL as gerund, NULL as participle,
    NULL as meaning, NULL AS example, NULL as image, NULL as synonyms, NULL as antonyms,
    NULL AS type, NULL as Created_at
FROM lists l
WHERE l.id = %s
  AND l.id_User = %s
UNION ALL
(
    SELECT 
        NULL AS id_user,
        w.id_Word, w.name, w.past, w.gerund, w.participle,
        w.meaning, w.example, w.image, w.synonyms, w.antonyms,
        GROUP_CONCAT(tw.nameType) AS type, w.Created_at
    FROM lists l
    LEFT JOIN words w ON w.id_List = l.id
    LEFT JOIN types_words tw ON w.id_Word = tw.id_Word
'''

        # Construye la rama UNION según 'game'
        if game != 'default' and game != 'random':
            union_tail = '''
    LEFT JOIN progress_right rw
        ON rw.id_Word = w.id_Word
       AND rw.id_List = %s
       AND rw.game = %s
    WHERE l.id = %s
      AND l.id_User = %s
      AND (rw.fecha IS NULL OR DATEDIFF(NOW(), rw.fecha) > 2)
    GROUP BY w.id_Word
)
ORDER BY Created_at DESC;
'''
            params = (
                ListId, data_user["id"],   # para el primer SELECT
                ListId, game,              # para rw.id_List, rw.game
                ListId, data_user["id"]    # para la segunda WHERE
            )

        elif game == "random":
            union_tail = modes + '''
    WHERE l.id = %s
      AND l.id_User = %s
    GROUP BY w.id_Word
)
ORDER BY Created_at DESC;
'''
            params = (ListId, data_user["id"], ListId, data_user["id"])

        else:  # default
            union_tail = '''
    WHERE l.id = %s
      AND l.id_User = %s
    GROUP BY w.id_Word
)
ORDER BY Created_at DESC;
'''
            params = (ListId, data_user["id"], ListId, data_user["id"])

        sql = base_sql + union_tail

        # DEBUG: imprime la consulta y params antes de ejecutar
        print("--- SQL to execute ---")
        print(sql)
        print("Params:", params)

        cursor.execute(sql, params)
        result = cursor.fetchall()

        print(result[0],result[-1]  )
        # Si no hay palabras, pero la lista existe, igual retorna el id_user
        if not result[0]["id_user"] == data_user["id"] and not result[-1]["id_user"]== data_user["id"] :
            print("No tienes permiso para ver esta lista de palabras.")
            return {"status": False, "detail": "No tienes permiso para ver esta lista de palabras.", "content": []}
        
        if  result[0]["id_Word"]== None:
            print("No hay palabras en la lista")
            return {"status": True, "content": []}

        
        result = result[1:len(result)-1]  # Eliminar el primer elemento que es NULL

        # Procesar los resultados
        if len(result) == 0:
            return {"status": True, "content": []}

        for wrd in result:
            # Procesar type como array
            wrd["type"] = wrd["type"].split(",") if wrd["type"] else []
            print(wrd["type"])

            # Procesar example como array
            example2 = []
            if wrd["example"] is not None:
                for ex0 in wrd["example"].split(";"):
                    example2.append(ex0)
            print(example2)
            wrd["example"] = example2

        return {"status": True, "content": result}

    except mysql.connector.Error as err:
        print(err)
        return {"status": False, "content": [], "detail": "Error al obtener las palabras."}
    except Exception as ex:
        print(f"Unexpected error: {ex}")
        return {"status": False, "content": [], "detail": "Unexpected error occurred."}
    finally:
        cursor.close()
        conexion.close()  


@UserData_router.get("/words_List/{e}")
def GetWords_Lists(e):
    data_user = decode_token(e)
    if "error" in data_user:
        return {"status":False, "detail":data_user}
    validation = validate_user(data_user)
    if validation:
        return validation

    try:
        conexion = get_db_connection()
        cursor = conexion.cursor(dictionary=True)
        try:
            sql = """
                SELECT
                    l.id AS list_id,
                    l.title AS list_title,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'name', w.name,
                            'past', w.past,
                            'gerund', w.gerund,
                            'participle', w.participle
                        )
                    ) AS words
                FROM
                   lists l
                JOIN
                 words w ON l.id = w.id_List
                WHERE
                    l.id_User = %s
                GROUP BY
                    l.id, l.title;
            """
            params = (data_user["id"],)
            cursor.execute(sql, params)
            result = cursor.fetchall()
            formatted_results = []
            for row in result:
                row['words'] = json.loads(row['words'])  # Convert JSON string to list of dictionaries
                formated_words = [{
                    'id': row['list_id'],
                    'title': row['list_title']
                }]
                for wrd in row['words']:
                    formated_words.append(wrd)
                formatted_results.append(formated_words)

            return {"status":True,"content":formatted_results} 
        except mysql.connector.Error as err:
            print(err)
        finally:
            cursor.close()
            conexion.close()
    except mysql.connector.Error as err:
        print(err)

def ConvertListToString(list_data):
    if not list_data:
        return ""
    examples= ""
    for e in list_data:
        if not e.strip():
            continue
        tempExample=examples + ";" + e
        if len(tempExample) >= 200 or len(examples+e) >= 200:
            break
        if len(examples) > 0 :
            examples += ";"
        examples += e
        
    return examples
def VerifyLen(item,size):
    if item is None:
        return None
    if len(item) > size:
        return item[:size-4]+ "..."
    return item
            
def AdjustData(wordData):
    wordData.name =VerifyLen(wordData.name, 50) 
    wordData.past = VerifyLen(wordData.past, 50)
    wordData.gerund = VerifyLen(wordData.gerund, 50)
    wordData.participle = VerifyLen(wordData.participle, 50)
    wordData.meaning = VerifyLen(wordData.meaning, 65000)
    wordData.image = VerifyLen(wordData.image, 150)
    wordData.synonyms =VerifyLen(wordData.synonyms, 100)
    wordData.antonyms =VerifyLen(wordData.antonyms, 100)
    return wordData
def GetTypes(cursor):
    sql="Select nameType from types"
    cursor.execute(sql)
    data=cursor.fetchall()
    types=[row[0] for row in data]
    return types
def PostType(type,cursor):
    sql="Insert Into types (nameType) Values (%s) "
    cursor.execute(sql,(type,))
    
def PostWord(wordData: Word):
    try:
        if(not wordData.image):
            wordData.image=""
        StrExample=ConvertListToString(wordData.example)
        AdjustedData=AdjustData(wordData)
        try:
            conexion = get_db_connection()
            cursor = conexion.cursor()
            listsValues=[(str(uuid.uuid4()),idList, AdjustedData.name, AdjustedData.past, 
            AdjustedData.gerund,
            AdjustedData.participle, AdjustedData.meaning,StrExample,
            AdjustedData.image,AdjustedData.synonyms,AdjustedData.antonyms) for idList in wordData.ListsId]
        
            sql = """
            INSERT INTO words 
            (id_Word, id_List, name, past, gerund, participle, meaning,example, image, synonyms, antonyms) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """       
            cursor.executemany(sql, listsValues)
        
            if wordData.type and len(wordData.type) > 0:
                InsertTypes = "INSERT INTO types_words (nameType, id_Word) VALUES "
                Values = [] 
                placeholders = []
                types=GetTypes(cursor)
                print(types)
                for id_word in listsValues:
                    wordData.type=list(set(wordData.type))
                    for i, ty in enumerate(wordData.type):
                        if ty not in types:
                            print(ty + "not in types, adding")
                            PostType(ty,cursor)
                        placeholders.append("(%s, %s)")
                        Values.extend([ty, id_word[0]])
                InsertTypes += ",".join(placeholders)
                cursor.execute(InsertTypes, tuple(Values))
        
            conexion.commit()
        
        except mysql.connector.Error as err:
            print(f"Database error: {err}")
            conexion.rollback()
        except Exception as ex:
            print(f"Unexpected error: {ex}")
        finally:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'conexion' in locals() and conexion:
                conexion.close()
    except ValidationError as e:
        print(e)
            
@UserData_router.post("/words/{e}")
def CreateWord(e: str, wordData: Word):
    try:
        data_user = decode_token(e)
        if "error" in data_user:
            return data_user
        validation = validate_user(data_user)
        if validation:
            return validation
        PostWord(wordData)
    except ValidationError as err:
        print(err)
    
@UserData_router.post("/Words/")    
def CreateWordNoToken(wordsData: list[Word]):
    for word in wordsData:
        try:
            PostWord(word)
        except mysql.connector.Error as err:
            print(f"Database error: {err}")
            return {"status":False, "detail": f"Database error: {err}"}
        except Exception as ex:
            print(f"Unexpected error: {ex}")
            return {"status":False, "detail": f"Unexpected error: {ex}"}
    return {"status":True, "detail": "Words created successfully."}


@UserData_router.put("/Edit/{e}/{ListId}/{WordId}")
def Upploader(e: str, ListId: str, WordId: str, item: WordUdpate):
    data_user = decode_token(e)
    if "error" in data_user:
        return data_user
    validation = validate_user(data_user)
    if validation:
        return validation

    try:
        StrExample=ConvertListToString(item.example)
        sql_update = """
            UPDATE words 
            SET name=%s, past=%s, gerund=%s, participle=%s, meaning=%s, 
            example=%s, image=%s, synonyms=%s, antonyms=%s 
            WHERE id_List=%s AND id_Word=%s;
                """

        sql_delete = """
                DELETE FROM types_words 
                WHERE id_Word=%s;
            """
        conexion = get_db_connection()
        cursor = conexion.cursor()
        cursor.execute(sql_update, (item.name, item.past, item.gerund, item.participle, item.meaning,StrExample, item.image, item.synonyms, item.antonyms, ListId, WordId))
        cursor.execute(sql_delete, (WordId,))
        if len(item.type) > 0:
            InsertTypes = "INSERT INTO types_words (nameType, id_Word) VALUES "
            Values = []
            placeholders = []
            for i, ty in enumerate(item.type):
                placeholders.append("(%s, %s)")
                Values.extend([ty, WordId])
            InsertTypes += ",".join(placeholders)
            cursor.execute(InsertTypes, tuple(Values))
            
        conexion.commit()
    except mysql.connector.Error as err:
        print(f"Error al insertar en la base de datos: {err}")  # Mostrar el error en la consola
        conexion.rollback()  # Revertir la transacción en caso de error
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conexion' in locals() and conexion:
            conexion.close()


@UserData_router.delete("/words/{e}/{ListId}/{id}")
def Delete(e, ListId, id: str):
    data_user = decode_token(e)
    if "error" in data_user:
        return data_user
    validation = validate_user(data_user)
    if validation:
        return validation

    try:
        conexion = get_db_connection()
        cursor = conexion.cursor()
        try:
            sql = 'DELETE FROM words WHERE id_List = %s and id_Word=%s'
            params = (ListId, id)
            cursor.execute(sql, params)
            conexion.commit()
        except mysql.connector.Error as err:
            print(f"Error al insertar en la base de datos: {err}")
        finally:
            cursor.close()
            conexion.close()
    except mysql.connector.Error as err:
        print(err)
