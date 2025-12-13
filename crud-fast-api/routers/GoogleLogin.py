from fastapi import APIRouter, HTTPException, Depends, Request, Cookie
from fastapi.responses import JSONResponse
from jose import jwt
import httpx
import os
import uuid
from datetime import datetime, timedelta
from Data.Mysql_Connection import get_db_connection
from dotenv import load_dotenv
from routers.UserData.BasicUserData import  validate_user
import redis


load_dotenv()

CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
KEYSECRET = os.getenv("KEYSECRET")
TOKEN_SECONDS_EXP = 31540000  # 1 año

API_URL = "https://oauth2.googleapis.com/tokeninfo?id_token="

# Redis para tokens
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

def create_token(data: dict):
    jti = str(uuid.uuid4())
    expire = datetime.utcnow() + timedelta(seconds=TOKEN_SECONDS_EXP)
    payload = {
        **data,
        "exp": expire,
        "jti": jti
    }
    token = jwt.encode(payload, KEYSECRET, algorithm="HS256")
    return token, jti

async def verify_google_token(id_token: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(API_URL + id_token)
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google token")
        data = response.json()
        if data.get("aud") != CLIENT_ID:
            raise HTTPException(status_code=400, detail="Token audience mismatch")
        print(data)
        return data
