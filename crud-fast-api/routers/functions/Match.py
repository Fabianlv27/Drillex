import json
import re
from pymongo import MongoClient
from fastapi import APIRouter
from fastapi import Body
from typing import List
from Data.WordsMatch import Lyric_Handler_SelfWords
Match= APIRouter()


# Conexión a MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["DIBY"]
collection = db["phrasals"]

def Letter_Disriminator(text):
    letters=[]
    letters.extend(l[0].upper() for l in text.split())
    print(letters)
    return letters

def Get_Matches(text,rawWord,word):
    word_parts=word.split()
    pattern= r'\b'
    for i,part in enumerate(word_parts):
        if i>0:
            pattern += r'\s+(?:\s*\w*\s*){0,2}\b'
        pattern+=re.escape(part)    
    pattern+=r'\b'    
    matches=re.findall(pattern,text,flags=re.IGNORECASE)
    if (len(matches)>0):
        Match={"matches":matches,"rawWord":rawWord}
        return Match
    else:
        return matches
    
def replace_first_ing(match):
    first_word=match.group(1)
    rest=match.group(2) or ""
    return first_word +"in'"+rest

def detect_phrasal_verbs(text):
    
    results = []
    modes=["name","participle","past","gerund","thirdPerson"]
    letters_no_ignore= Letter_Disriminator(text)

    # Obtener datos desde MongoDB
    for letter in letters_no_ignore:
        letter_data = collection.find_one({"Letter": letter})
        if letter_data:
            for phr in letter_data["Phr"]:
                for mode in modes:
                    Case=Get_Matches(text,phr["name"],phr[mode])
                    if(Case):results.append(Case)
                    if(mode=="gerund"):
                        pattern = r'\b(\w+?)ing\b(\s+\w*)*'
                        word_modificated = re.sub(pattern, replace_first_ing,phr[mode], flags=re.IGNORECASE)
                        Case=Get_Matches(text,phr["name"],word_modificated )
                        if(Case):results.append(Case)
    
    return {"verso":text ,"match":results}


def Lyric_Handler(Lyric):
    with open('Data/Prepositions.json', 'r', encoding='utf-8') as file:
        Prepos = json.load(file)
    final_result=[]
    for verse in Lyric:
        limpio = re.sub(r'[^a-zA-Z0-9 ]', '', verse)      
        isPhrsal = False
        print(f"Processing verse: {limpio.split(' ')}")
        for e in limpio.split(' '):
            if e.lower() in Prepos["Prepositions"]:
                isPhrsal = True
                break
        if isPhrsal:
            print(f"Verse with phrasal verb: {verse}")
            final_result.append(detect_phrasal_verbs(verse)) 
        else:
            print(f"Verse without phrasal verb: {verse}")
            final_result.append({"verso": verse, "match": []}) 
    return final_result

@Match.post("/PhrMatches")
def GetPhrMatches(lyric: List[str] = Body(...)):
    print(lyric)
    Matches=Lyric_Handler(lyric)
    print(Matches)
    return Matches

@Match.post("/getMatches")
def GetPhrMatches(data:object= Body(...)):
    Matches=Lyric_Handler_SelfWords(data["Words"],data["Liryc"])
    return Matches