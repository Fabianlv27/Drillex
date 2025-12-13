import re
import json


def Get_Matches(text,indexWord,word):
    if (len(word.strip().split())>1):
        word_parts=word.split()
        pattern= r'\b'
        for i,part in enumerate(word_parts):
            if i>0:
                pattern += r'\s+(?:\s*\w*\s*){0,2}\b'
            pattern+=re.escape(part)    
        pattern+=r'\b'
        #print(f"much words:"+pattern)    
    else:
        pattern=r'\b'+word+r'\b'
        #print(f"One word:"+pattern)    
    matches=re.findall(pattern,text,flags=re.IGNORECASE)
    if (len(matches)>0):
        print(matches)
        Match={"matches":matches,"rawWord":indexWord}
        print(Match)
        return Match
    else:
        return matches
    

def replace_first_ing(match):
    first_word=match.group(1)
    rest=match.group(2) or ""
    return first_word +"in'"+rest

def detect_Words(words,text):
    results = []
    modes=["name","participle","past","gerund"]
    
    for i,word in enumerate(words) :
            for mode in modes:
                if(re.search("[a-zA-Z]",word[mode])):
                    Case=Get_Matches(text,i,word[mode])
                    if(Case):results.append(Case)
                    if(mode=="gerund"):
                        pattern = r'\b(\w+?)ing\b(\s+\w*)*'
                        word_modificated = re.sub(pattern, replace_first_ing,word[mode], flags=re.IGNORECASE)
                        Case=Get_Matches(text,i,word_modificated )
                        if(Case):results.append(Case)
    
    return {"verso":text ,"match":results}


def Lyric_Handler_SelfWords(Words,Lyric):
    final_result=[]
    for verse in Lyric:
      final_result.append(detect_Words(Words,verse)) 
    print(final_result)  
    return final_result