import italian_dictionary
from pprint import pprint
# Use this to get only the meaning 

#definition = italian_dictionary.get_definition('cane', limit=3, all_data=False) 

#Use this to get all datas of a word (all_data default is True)
def getData(word):
    datas = italian_dictionary.get_definition(word)
    pprint(type(datas["definizione"][1]))
    results = {
        'name':word,
        'meaning':"\n".join(datas["definizione"]),
        'type': datas['grammatica'],
        'image': "",
        'synonyms':"",
        'antonyms': "",
        'example': datas['locuzioni'],
        'pronunciation':datas['pronuncia']
        
    }
    return results
    
    

pprint(getData('dovevo'))