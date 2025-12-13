from pydantic import BaseModel
from typing import Optional

class WordUdpateVoice(BaseModel):
    voice: bool
    VoiceURLString:object

class WordUdpate(BaseModel):
    name:str
    meaning:Optional[str]=None
    example:list
    image: Optional[str]=None

class ListData(BaseModel):
    name:str

class Word(BaseModel):
      name:str
      past:Optional[str]=None
      gerund:Optional[str]=None
      participle:Optional[str]=None
      meaning:Optional[str]=None
      type:Optional[list]=None
      example:Optional[list]=None
      image: Optional[str]=""
      synonyms:Optional[str]=""
      antonyms:Optional[str]=""
      ListsId: Optional[list[str]] =None

        
class WordUdpate(BaseModel):
    id_Word:str
    name:str
    gerund:Optional[str]=None
    past:Optional[str]=None
    meaning:Optional[str]=None
    participle:Optional[str]=None
    example:Optional[list]=None
    image: Optional[str]=None   
    synonyms:Optional[str]=None
    antonyms:Optional[str]=None
    type:Optional[list]=None
    ListsId: Optional[list[str]] =None
    
class TokenRequest(BaseModel):
    id_token: str
    username: str
    age: int