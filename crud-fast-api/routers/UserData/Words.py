import json
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import ValidationError
from routers.UserData.BasicUserData import get_current_user_id # Tu dependencia segura
from Data.Mysql_Connection import get_db_connection
from Models.Models import Word, WordUdpate
from routers.LimiterConfig import limiter
import mysql.connector

UserData_router = APIRouter()

# Funciones auxiliares (Sin cambios en lógica, solo limpieza)
def ConvertListToString(list_data):
    if not list_data: return ""
    return ";".join([e for e in list_data if e.strip()])[:200] # Simplificado

def VerifyLen(item, size):
    if item is None: return None
    if len(item) > size: return item[:size-4] + "..."
    return item
            
def AdjustData(wordData):
    wordData.name = VerifyLen(wordData.name, 50) 
    wordData.past = VerifyLen(wordData.past, 50)
    wordData.gerund = VerifyLen(wordData.gerund, 50)
    wordData.participle = VerifyLen(wordData.participle, 50)
    wordData.meaning = VerifyLen(wordData.meaning, 65000)
    wordData.image = VerifyLen(wordData.image, 150)
    wordData.synonyms = VerifyLen(wordData.synonyms, 100)
    wordData.antonyms = VerifyLen(wordData.antonyms, 100)
    return wordData

def GetTypes(cursor):
    cursor.execute("Select nameType from types")
    return [row[0] for row in cursor.fetchall()]

def PostType(type_name, cursor):
    cursor.execute("Insert Into types (nameType) Values (%s)", (type_name,))
    
def PostWord(wordData: Word, user_id: str):
    """
    Crea palabras verificando la propiedad de las listas.
    """
    try:
        conexion = get_db_connection()
        cursor = conexion.cursor()

        # 1. SEGURIDAD: Verificar que todas las listas pertenezcan al usuario
        # Si wordData.ListsId tiene 3 IDs, el count debe ser 3.
        format_strings = ','.join(['%s'] * len(wordData.ListsId))
        cursor.execute(f"SELECT COUNT(*) FROM lists WHERE id_User = %s AND id IN ({format_strings})", (user_id, *wordData.ListsId))
        count = cursor.fetchone()[0]
        
        if count != len(wordData.ListsId):
             raise HTTPException(status_code=403, detail="Una o más listas no te pertenecen o no existen.")

        # 2. PROCESAMIENTO
        if not wordData.image: wordData.image=""
        StrExample = ConvertListToString(wordData.example)
        AdjustedData = AdjustData(wordData)
        
        listsValues = [(str(uuid.uuid4()), idList, AdjustedData.name, AdjustedData.past, 
                        AdjustedData.gerund, AdjustedData.participle, AdjustedData.meaning,
                        StrExample, AdjustedData.image, AdjustedData.synonyms, 
                        AdjustedData.antonyms) for idList in wordData.ListsId]
    
        sql = """
        INSERT INTO words 
        (id_Word, id_List, name, past, gerund, participle, meaning, example, image, synonyms, antonyms) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """       
        cursor.executemany(sql, listsValues)
    
        # Lógica de Tipos (Types)
        if wordData.type and len(wordData.type) > 0:
            existing_types = GetTypes(cursor)
            wordData.type = list(set(wordData.type))
            
            Values = [] 
            placeholders = []
            
            for id_word_tuple in listsValues: 
                current_word_id = id_word_tuple[0]
                for ty in wordData.type:
                    if ty not in existing_types:
                        PostType(ty, cursor)
                        existing_types.append(ty)
                    placeholders.append("(%s, %s)")
                    Values.extend([ty, current_word_id])
            
            if Values:
                InsertTypes = "INSERT INTO types_words (nameType, id_Word) VALUES " + ",".join(placeholders)
                cursor.execute(InsertTypes, tuple(Values))
    
        conexion.commit()
    
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        if 'conexion' in locals(): conexion.rollback()
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conexion' in locals(): conexion.close()


# --- ENDPOINTS REFACTORIZADOS ---
#################################GET###########################################################

@UserData_router.get("/words/{ListId}/{ListName}/{game}")
@limiter.limit("100/minute")
def GetListWords(request: Request,ListId, ListName='default', game='default', user_id: str = Depends(get_current_user_id)):
    
    conexion = get_db_connection()
    cursor = conexion.cursor(dictionary=True)

    try:
        # --- PASO 1: Validación de Propiedad (Consulta Ligera) ---
        # Solo traemos el título, es mucho más rápido que hacer un UNION con toda la tabla words
        VerifyList = 'SELECT title FROM lists WHERE id = %s AND id_User = %s;'
        cursor.execute(VerifyList, (ListId, user_id))
        list_data = cursor.fetchone()

        if not list_data:
            return {"status": False, "detail": "Esta lista no existe o no te pertenece."}
        
        if ListName != "default" and list_data["title"] != ListName:
            return {"status": False, "detail": "El nombre de la lista no coincide."}

        # --- PASO 2: Construcción de la Query Principal ---
        # Base de la consulta: Trae palabras uniendo con la lista y tipos
        # Nota: Ya validamos que la lista es del usuario, pero mantenemos el JOIN con lists 
        # por integridad referencial y seguridad adicional.
        base_sql = """
            SELECT 
                w.id_Word, w.name, w.past, w.gerund, w.participle,
                w.meaning, w.example, w.image, w.synonyms, w.antonyms,
                GROUP_CONCAT(tw.nameType) AS type, w.Created_at
            FROM words w
            INNER JOIN lists l ON w.id_List = l.id
            LEFT JOIN types_words tw ON w.id_Word = tw.id_Word
        """

        # Lógica de filtros dinámica
        where_clause = " WHERE l.id = %s AND l.id_User = %s "
        group_order = " GROUP BY w.id_Word ORDER BY w.Created_at DESC "
        
        # Parámetros base
        params = [ListId, user_id]

        # --- Lógica de Juegos (Game Logic) ---
        join_clause = ""
        
        if game == 'random':
            # Lógica para "Random" (Modos de repaso inteligente)
            join_clause = """
                LEFT JOIN Progress_mode pm ON pm.id_Word = w.id_Word
            """
            # Añadimos filtro al WHERE existente
            where_clause += """
                AND (
                    (pm.mode = "easy"      AND DATEDIFF(NOW(), pm.date) > 7) OR
                    (pm.mode = "normal"    AND DATEDIFF(NOW(), pm.date) > 3) OR
                    (pm.mode = "hard"      AND DATEDIFF(NOW(), pm.date) > 2) OR
                    (pm.mode = "ultrahard" AND DATEDIFF(NOW(), pm.date) >= 1)
                )
            """
        elif game != 'default':
            # Lógica para otros juegos específicos
            join_clause = """
                LEFT JOIN progress_right rw 
                ON rw.id_Word = w.id_Word AND rw.id_List = %s AND rw.game = %s
            """
            # Inyectamos los parámetros del juego ANTES de los del WHERE
            # Nota: En python mysql connector, el orden de params debe coincidir con los %s en orden de aparición
            # Como el JOIN va antes del WHERE, necesitamos ajustar un poco la estrategia de params o usar una lista.
            
            # Re-estructuramos params para este caso específico:
            # 1. Params del JOIN (ListId, game)
            # 2. Params del WHERE (ListId, user_id)
            params = [ListId, game, ListId, user_id] 
            
            where_clause += """
                AND (rw.fecha IS NULL OR DATEDIFF(NOW(), rw.fecha) > 2)
            """

        # Ensamblaje final
        final_sql = base_sql + join_clause + where_clause + group_order

        # Ejecución
        cursor.execute(final_sql, tuple(params))
        result = cursor.fetchall()

        # Procesamiento (Split de strings a arrays)
        for wrd in result:
            wrd["type"] = wrd["type"].split(",") if wrd["type"] else []
            wrd["example"] = wrd["example"].split(";") if wrd["example"] else []

        return {"status": True, "content": result}

    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
        return {"status": False, "content": [], "detail": "Error de base de datos."}
    except Exception as ex:
        print(f"Internal Error: {ex}")
        return {"status": False, "content": [], "detail": "Error inesperado."}
    finally:
        cursor.close()
        conexion.close()

@UserData_router.get("/words_List")
@limiter.limit("30/minute")
def GetWords_Lists(request: Request,user_id: str = Depends(get_current_user_id)):
    try:
        conexion = get_db_connection()
        cursor = conexion.cursor(dictionary=True)
        sql = """
            SELECT l.id AS list_id, l.title AS list_title,
                JSON_ARRAYAGG(JSON_OBJECT('name', w.name, 'past', w.past, 'gerund', w.gerund, 'participle', w.participle)) AS words
            FROM lists l
            JOIN words w ON l.id = w.id_List
            WHERE l.id_User = %s
            GROUP BY l.id, l.title;
        """
        cursor.execute(sql, (user_id,))
        result = cursor.fetchall()
        
        formatted_results = []
        for row in result:
            words_list = json.loads(row['words']) if row['words'] else []
            formated_item = [{'id': row['list_id'], 'title': row['list_title']}] + words_list
            formatted_results.append(formated_item)

        return {"status": True, "content": formatted_results} 
    except mysql.connector.Error as err:
        print(err)
        return {"status": False, "detail": str(err)}
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conexion' in locals(): conexion.close()

#################################POST###########################################################

@UserData_router.post("/words") 
def CreateWord(request: Request,wordData: Word, user_id: str = Depends(get_current_user_id)):
    # Usamos user_id para asegurar que está logueado, 
    # aunque PostWord confía en los IDs de lista que envía el frontend.
    try:
        PostWord(wordData,user_id)
        return {"status": True, "detail": "Word created"}
    except ValidationError as err:
        return {"status": False, "detail": str(err)}

  
@UserData_router.post("/Words/Bulk") # Renombrado para diferenciarlo. Protegido.
@limiter.limit("5/minute")
def CreateWordBulk(request: Request,wordsData: list[Word], user_id: str = Depends(get_current_user_id)):
    if len(wordsData) >15:
        return{"status":False,"detail":"Too many words, limit is 15"}
    for word in wordsData:
        try:
            PostWord(word)
        except Exception as ex:
            print(f"Error: {ex}")
    return {"status": True, "detail": "Words processed."}

#################################################################################################

#################################PUT###########################################################

@UserData_router.put("/Edit/{ListId}/{WordId}")
@limiter.limit("40/minute")
def Upploader(request: Request,ListId: str, WordId: str, item: WordUdpate, user_id: str = Depends(get_current_user_id)):
    try:
        conexion = get_db_connection()
        cursor = conexion.cursor()

        # 1. SEGURIDAD: Verificar propiedad antes de editar
        cursor.execute("SELECT id FROM lists WHERE id = %s AND id_User = %s", (ListId, user_id))
        if not cursor.fetchone():
            return {"status": False, "detail": "No tienes permiso para editar esta lista."}

        StrExample = ConvertListToString(item.example)
        
        # SQL Seguro: Solo actualiza si la lista coincide
        sql_update = """
            UPDATE words SET name=%s, past=%s, gerund=%s, participle=%s, meaning=%s, 
            example=%s, image=%s, synonyms=%s, antonyms=%s 
            WHERE id_List=%s AND id_Word=%s;
        """
        
        cursor.execute(sql_update, (item.name, item.past, item.gerund, item.participle, item.meaning,
                                    StrExample, item.image, item.synonyms, item.antonyms, ListId, WordId))
        
        # Eliminar tipos viejos y agregar nuevos (Simplificado)
        cursor.execute("DELETE FROM types_words WHERE id_Word=%s;", (WordId,))
        
        if item.type:
            InsertTypes = "INSERT INTO types_words (nameType, id_Word) VALUES "
            Values = []
            placeholders = []
            for ty in item.type:
                placeholders.append("(%s, %s)")
                Values.extend([ty, WordId])
            if Values:
                cursor.execute(InsertTypes + ",".join(placeholders), tuple(Values))
            
        conexion.commit()
        return {"status": True, "detail": "Updated"}
    except mysql.connector.Error as err:
        print(err)
        return {"status": False, "detail": str(err)}
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conexion' in locals(): conexion.close()
############################################################################################

#################################DELETE###########################################################

@UserData_router.delete("/words/{ListId}/{id}") 
@limiter.limit("50/minute")
def Delete(request: Request,ListId, id: str, user_id: str = Depends(get_current_user_id)):
    try:
        conexion = get_db_connection()
        cursor = conexion.cursor()
        
        # 1. SEGURIDAD: DELETE con JOIN
        # Esta consulta asegura que solo se borre si la palabra está en una lista que pertenece al usuario
        sql = """
        DELETE w FROM words w 
        INNER JOIN lists l ON w.id_List = l.id 
        WHERE w.id_List = %s AND w.id_Word = %s AND l.id_User = %s
        """
        cursor.execute(sql, (ListId, id, user_id))
        
        if cursor.rowcount == 0:
             return {"status": False, "detail": "No se pudo borrar. Puede que la palabra no exista o no sea tuya."}

        conexion.commit()
        return {"status": True, "detail": "Deleted"}
    except mysql.connector.Error as err:
        print(err)
        return {"status": False, "detail": str(err)}
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conexion' in locals(): conexion.close()
        
############################################################################################
        