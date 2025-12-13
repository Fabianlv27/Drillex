from pprint import pprint
import requests
from fastapi import APIRouter 
import requests
from bs4 import BeautifulSoup
import italian_dictionary
import spacy
import re

nlp = spacy.load("it_core_news_sm")

ItalianDictRouter= APIRouter()

@ItalianDictRouter.get("/Dictionary_words/it/{word}")
def getItalianWord(word):
    try:
        is_verb=explicar_verbo_it(word)
        print("is_verb:",is_verb)
        if is_verb["verbo"] and is_verb["infinitivo"]!=word:
            return {
                "name": is_verb["palabra"],
                "meaning":is_verb["meaning"],
                "type": ["verbo"], 
                "image": "",
                "synonyms": "",
                "antonyms": "",
                "example": [],
                "pronunciation": ""
            }
            
        datas = italian_dictionary.get_definition(word)
        print("datas:",datas)
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
        if len(results['meaning'])==0:
            return scrape_wiktionary_italiano(word)
            
        NewType=list(results["type"])
        for (i,ty) in enumerate(results["type"]):
            splited=ty.split(' e ')
            if len(splited)>1 :
                results["type"][i]=splited[0]
                NewType.append(splited[0].split(' ')[0] + splited[1])
        if len(NewType) > 0:
            results["type"]=NewType   
        return results
    except Exception as e:
        print(f"⚠ Ocurrió un error: {e}")
        return {"error":"Word not found"}
    
def explicar_verbo(palabra: str) -> str:
    doc = nlp(palabra)
    token = doc[0]

    if token.pos_ != "VERB":
        return {"verbo": False, "palabra": palabra}

    base = token.lemma_
    morf = token.morph.to_dict()

    # Traducimos las etiquetas de spaCy
    tiempo = morf.get("Tense", "—")
    modo   = morf.get("Mood", "—")
    persona= morf.get("Person", "—")
    numero = morf.get("Number", "—")

    # Mapas de traducción (puedes ampliar)
    modos = {
        "Ind": "Indicativo",
        "Sub": "Subjuntivo",
        "Imp": "Imperativo",
        "Inf": "Infinitivo",
        "Ger": "Gerundio",
        "Part": "Participio"
    }
    tiempos = {
        "Pres": "Presente",
        "Past": "Pasado",
        "Fut": "Futuro",
        "Imp": "Imperfecto"
    }
    numeros = {
        "Sing": "Singular",
        "Plur": "Plural"
    }

    explicacion = (
        f"Palabra: {token.text}\n"
        f"Infinitivo: {base}\n"
        f"Modo: {modos.get(modo, modo)}\n"
        f"Tiempo: {tiempos.get(tiempo, tiempo)}\n"
        f"Persona: {persona if persona != '—' else '—'}\n"
        f"Número: {numeros.get(numero, numero)}"
    )
    return {"verbo": True, "palabra": token.text, "infinitivo": base, "morfologia": morf, "meaning": explicacion}  
 
def explicar_verbo_it(palabra: str) -> str:
    palabra = palabra.strip()
    doc = nlp(palabra)
    tok = doc[0]

    # Si spaCy lo reconoce como ADJ (ej. participio usado como adjetivo), reintentar con contexto
    if tok.pos_ != "VERB" and tok.pos_ == "ADJ":
        frase = f"Ho {palabra}."
        doc_ctx = nlp(frase)
        for t in doc_ctx:
            if t.text.lower() == palabra.lower():
                tok = t
                break

    if tok.pos_ != "VERB":
        return {"verbo": False, "palabra": palabra}

    m = tok.morph
    infinitivo = tok.lemma_

    # Obtenemos rasgos como listas (pueden ser [] vacías)
    verbform  = m.get("VerbForm")
    tiempo    = m.get("Tense")
    modo      = m.get("Mood")
    persona   = m.get("Person")
    numero    = m.get("Number")
    genero    = m.get("Gender")

    # Diccionarios de traducción
    modos = {"Ind":"Indicativo","Sub":"Subjuntivo","Imp":"Imperativo",
             "Inf":"Infinitivo","Ger":"Gerundio","Part":"Participio"}
    tiempos = {"Pres":"Presente","Past":"Pasado","Fut":"Futuro","Imp":"Imperfecto"}
    numeros = {"Sing":"Singular","Plur":"Plural"}
    generos = {"Fem":"Femenino","Masc":"Masculino"}

    # Convertimos con seguridad
    verbform_val = verbform[0] if verbform else None
    tiempo_val   = tiempo[0] if tiempo else None
    modo_val     = modo[0] if modo else None
    persona_val  = persona[0] if persona else None
    numero_val   = numero[0] if numero else None
    genero_val   = genero[0] if genero else None

    # Normalización
    if verbform_val == "Inf":
        modo_str, tiempo_str, persona_str, numero_str, genero_str = "Infinitivo", "—", "—", "—", "—"
    elif verbform_val == "Part":
        modo_str = "Participio"
        tiempo_str = tiempos.get(tiempo_val, tiempo_val or "—")
        persona_str, numero_str, genero_str = "—", numeros.get(numero_val, numero_val or "—"), generos.get(genero_val, genero_val or "—")
    else:
        modo_str   = modos.get(modo_val, modo_val or "—")
        tiempo_str = tiempos.get(tiempo_val, tiempo_val or "—")
        persona_str= persona_val or "—"
        numero_str = numeros.get(numero_val, numero_val or "—")
        genero_str = generos.get(genero_val, genero_val or "—")
    
    meaning=(
        f"Infinitivo: {infinitivo}\n"
        f"Modo: {modo_str}\n"
        f"Tiempo: {tiempo_str}\n"
        f"Persona: {persona_str}\n"
        f"Número: {numero_str}\n"
        f"Género: {genero_str}"
    )

    return {"verbo": True, "palabra": tok.text, "infinitivo": infinitivo, "morfologia": m.to_dict(), "meaning": meaning}

def scrape_wiktionary_italiano(word):
    try:
        url = f"https://it.wiktionary.org/wiki/{word}"
        response = requests.get(url)
        print(response)
        with open("./logi.html", "w", encoding="utf-8") as log_file:
            log_file.write(response.text)
        if response.status_code != 200:
            return {"error": "No results found or an error occurred."}
        else:
            return scrape_wiktionary(response,word)
    except Exception as e:
        return {"error": "An error occurred while scraping the word."}
    #with open("log.html", "a", encoding="utf-8") as log_file:
       # log_file.write(f"Response: {response.text}\n")

def scrape_wiktionary(response,word):
    print("fase 1")
    parti_del_discorso_list = ["sostantivo", "aggettivo", "verbo", "avverbio", "pronome", "preposizione", "congiunzione", "interiezione","voce verbale"]
    soup = BeautifulSoup(response.content, 'html.parser')
    results = {
        'name':word,
        'meaning':"",
        'type': [],
        'image': "",
        'synonyms':"",
        'antonyms': "",
        'example': [],
        'derivati': [],
        "altre": [],
        'varianti': []
        
    }
    def add_to_list(item,list,element=" ; "):
        if len(results[list])> 0:
            results[list]=results[list]+element+item
        else:
            results[list]=item
    for h3 in soup.find_all('h3'):
        SecondVerify=False
        h3_text = h3.get_text(strip=True).lower()
        print("h3_text:", h3_text)
        a= h3.findChildren('a')
        for ac in a:
            if ac.get_text(strip=True).lower() in parti_del_discorso_list:
                SecondVerify=True
                break
        if(( h3_text in parti_del_discorso_list or SecondVerify )and "traduzione" not in h3_text):
            print("pd:"+ h3_text)  
            sec= h3.find_parent('section')          
            # Encontrar definiciones asociadas
            definitions_list = sec.findChild('ol') or sec.findChild('ul')
            if definitions_list:
                print("ol")
                for li in definitions_list.find_all_next('li'):
                    li_text = li.get_text(separator=' ', strip=True)
                    add_to_list(li_text,'meaning','\n')
                               
                    ol= li.findChild('ol') or li.findChild('ul')
                    if ol:
                        for li2 in ol.find_all('li'):
                                li2_text = li2.get_text(separator=' ', strip=True)
                                if li2_text not in results['example']:
                                    results['example'].append(li2_text)
    if len(results['example'])>0:
        results['meaning']=results['meaning'].split(results['example'][0])[0]
                           
    print("fase 2")
                            
    for a in soup.find_all('a'):
        a_text = a.get_text(strip=True).lower()
        if len(a_text)>0 and a_text[0]=='(' and a_text[-1]==')':
            continue
        a_text=re.sub(r"[^a-záéíóúñüàèìòù\s']", '', a_text)  # Normalizar espacios        
        if a_text in parti_del_discorso_list and a_text not in results['type']:
            results['type'].append(a_text)           
        if ("sinonimi" in a_text )and a.get('title')=="sinonimi":
            parent_div = a.find_parent('section')
            if parent_div:
                ol = parent_div.find('ol')
                ul = parent_div.find('ul')
                if ol:
                    for li in ol.find_all('li'):
                        for a_in_li in li.find_all('a'):
                            i=a_in_li.find_parent('i')
                            if not i and a_in_li.get_text(strip=True) not in results['synonyms']:
                                add_to_list(a_in_li.get_text(strip=True),'synonyms')
                elif ul:
                    for li in ul.find_all('li'):
                        for a_in_li in li.find_all('a'):
                            i=a_in_li.find_parent('i')
                            if not i and a_in_li.get_text(strip=True) not in results['synonyms']:
                                add_to_list(a_in_li.get_text(strip=True),'synonyms')
        if (("antònimi" in a_text or "contrari" in a_text) and a.get('title') == "contrario"):
            parent_div = a.find_parent('section')
            if parent_div:
                ol = parent_div.find('ol')
                ul = parent_div.find('ul')
                if ol:
                    for li in ol.find_all('li'):
                        for a_in_li in li.find_all('a'):
                            i=a_in_li.find_parent('i')
                            if not i and a_in_li.get_text(strip=True) not in results['antonyms']:
                                add_to_list(a_in_li.get_text(strip=True),'antonyms')
                elif ul:
                    for li in ul.find_all('li'):
                        for a_in_li in li.find_all('a'):
                            i=a_in_li.find_parent('i')
                            if not i and a_in_li.get_text(strip=True) not in results['antonyms']:
                                add_to_list(a_in_li.get_text(strip=True),'antonyms')
        if "derivate"in a_text:
            parent_div = a.find_parent('section')
            if parent_div:
                ol = parent_div.find('ul')
                ul = parent_div.find('ol')
                if ol:
                    for li in ol.find_all('li'):
                        for a_in_li in li.find_all('a'):
                            results['derivati'].append(a_in_li.get_text(strip=True))
                elif ul:
                    for li in ul.find_all('li'):
                        for a_in_li in li.find_all('a'):
                            results['derivati'].append(a_in_li.get_text(strip=True))
        if "varianti" in a_text:
            parent_div = a.find_parent('section')
            if parent_div:
                ol = parent_div.find('ul')
                ul = parent_div.find('ol')
                if ol:
                    for li in ol.find_all('li'):
                        for a_in_li in li.find_all('a'):
                            results['varianti'].append(a_in_li.get_text(strip=True))
                elif ul:
                    for li in ul.find_all('li'):
                        for a_in_li in li.find_all('a'):
                            results['varianti'].append(a_in_li.get_text(strip=True))
        if "proverbi" in a_text  in a_text:
            parent_div = a.find_parent('section')
            if parent_div:
                ul = parent_div.find('ul')
                ol = parent_div.find('ol')
                if ol:
                    for li in ol.find_all('li'):
                        results['example'].append(li.get_text(separator=" ",strip=True))
                if ul:
                    for li in ul.find_all('li'):
                        results['example'].append(li.get_text(separator=" ",strip=True))
    print("fase 3")
               
                    
    # Extraer imágenes
    for figure in soup.find_all('figure'):
        img= figure.find('img')
        if img:
            src = img['src']
            if not src.startswith('http'):
                src = f"https:{src}" if src.startswith('//') else f"https://it.wiktionary.org{src}"
            add_to_list(src,'image')
        figcaption = figure.findChild('figcaption')
        if figcaption:
            figcaption_text = figcaption.get_text(separator=" ",strip=True)
            if figcaption_text and figcaption_text not in results['meaning']:
                add_to_list(figcaption_text,'meaning','\n')
    pprint(results)
    return results
