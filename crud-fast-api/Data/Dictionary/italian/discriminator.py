import time
import italian_dictionary
import spacy
nlp_it = spacy.load("it_core_news_sm")

# Cargar modelo italiano
nlp = spacy.load("it_core_news_sm")

def es_infinitivo(palabra: str) -> bool:
    doc = nlp(palabra)
    token = doc[0]  # spaCy devuelve una lista de tokens; usamos el primero
    # Comprobamos si es un verbo y si su forma base coincide con la palabra
    return token.pos_ == "VERB" and token.text.lower() == token.lemma_.lower()

def get_index():
    with open("./crud-fast-api/Data/Dictionary/italian/dics/newIndex.txt", "r", encoding="utf-8") as file:
        index = file.read()
        return int( index.strip() )
    
def modify_index(new_index):
    with open("./crud-fast-api/Data/Dictionary/italian/dics/newIndex.txt", "w", encoding="utf-8") as file:
        file.write(str(new_index))
        
def get_word(index):
    with open("./crud-fast-api/Data/Dictionary/italian/italian.dic", "r", encoding="utf-8") as file:
        for i,line in enumerate(file):
            if i == index:
                return line.strip()
def add_word(word):
    with open("./crud-fast-api/Data/Dictionary/italian/dics/ActualDict.dic", "a", encoding="utf-8") as file:
        file.write(word + "\n")

def get_dict_1(word):
    try:
      datas = italian_dictionary.get_definition(word)
      results = {
            'name':word,
            'meaning':"\n".join(datas["definizione"]),
            'type': datas['grammatica'],
        'synonyms':"",
        'antonyms': "",
        'example': datas['locuzioni'],
        'pronunciation':datas['pronuncia']
        
    }
                  
      NewType=list(results["type"])
      for (i,ty) in enumerate(results["type"]):
            splited=ty.split(' e ')
            if len(splited)>1 :
                results["type"][i]=splited[0]
                NewType.append(splited[0].split(' ')[0] + splited[1])
      if len(NewType) > 0:
            results["type"]=NewType 
      if datas:
        return True
    except Exception as e:
        return False
def isName(word):
    doc = nlp_it(word)
    for ent in doc.ents:
        if ent.label_ == "PER":  # etiqueta de Persona en italiano
            return True
    return False    
def main():
    cant=40000  # Número de palabras a procesar
    index=get_index()
    print(f"Índice actual: {index}")
    for i in range(cant):
        word=get_word(index)
        if word:
            print(f"Procesando palabra {index}: {word}")
            Name=isName(word)
            print("isName:",Name)
            conjugation=es_infinitivo(word)
            print("es_infinitivo:",conjugation)
            if not Name and conjugation:
                exists=get_dict_1(word)
                print("exists:",exists)
                if not exists:
                    add_word(word)
            index+=1
            modify_index(index)
        else:
            print("No hay más palabras para procesar.")
            break

if __name__ == "__main__":
    main()