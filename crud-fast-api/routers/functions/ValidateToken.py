
from os import getenv
from jose import JOSEError, jwt, JWTError

async def validate_Token(token: str ):
    try:
        data= jwt.decode(token, key=getenv('KEYSECRET'), algorithms=["HS256"])
        print(data)
        return {"valid": True,"Data": data}
    except JOSEError:
        return {"valid": False}