import math
import time
import random
import requests
import pyperclip
from itertools import islice
import spacy
import asyncio
from playwright.async_api import async_playwright


# -----------------------------
# Configuración inicial
# -----------------------------

nlp_it = spacy.load("it_core_news_sm")

index = 0
index_words = 0

URL = "https://chatgpt.com"
New_Chat = True
MIN_WAIT = 10
MAX_WAIT = 25

# -----------------------------
# Funciones para tu servidor
# -----------------------------

def get_index():
    url = "https://dibylocal.com:8000/Dicts_creator/it/index"
    try:
        response = requests.get(url, verify=False)
        if response.status_code == 200:
            global index
            data = response.json()
            index = data["index"]
            print("Índice actual:", index)
        else:
            print("Error:", response.status_code, response.text)
    except Exception as e:
        print(f"Error en get_index: {e}")

def modify_index():
    url = f"https://dibylocal.com:8000/Dicts_creator/it/index/{index}"
    try:
        response = requests.put(url, verify=False)
        if response.status_code == 200:
            print("Índice actualizado correctamente:", index)
        else:
            print("Error al actualizar índice:", response.status_code)
    except Exception as e:
        print(f"Error en modify_index: {e}")

def get_words():
    palabras = []
    with open("./crud-fast-api/Data/Dictionary/italian/italian.dic", "r", encoding="utf-8") as f:
        lineas = list(islice(f, index, index + 1000))
        palabras = lineas
    palabras = [palabra.strip() for palabra in palabras if not isName(palabra.strip())]
    return palabras

def post(data):
    if not data:
        print("No hay datos para enviar.")
        return
    print("Enviando datos al servidor...")
    url = "https://dibylocal.com:8000/Dicts_creator/it"
    try:
        response = requests.post(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            verify=False,
            timeout=random.uniform(5, 15)
        )
        if response.status_code == 200:
            print("Solicitud POST exitosa!")
        else:
            print("Error en POST:", response.status_code, response.text)
    except Exception as e:
        print(f"Error en POST: {e}")

def isName(word):
    doc = nlp_it(word)
    for ent in doc.ents:
        if ent.label_ == "PER":
            return True
    return False

# -----------------------------
# Prompt Builder
# -----------------------------

def get_prompt(isFirst, palabras):
    global index_words
    words = ""
    for i in range(10):
        if (index_words + i) <= (len(palabras) - 1):
            words += ", " + palabras[index_words + i]
        else:
            break
    if words == "":
        return False
    print("Palabras a procesar:", words)
    if isFirst:
        return f"""Dame una definicion de esta forma de la siguiente palabra en italiano, no me respondas nada mas solo dame el json,si no tiene una key no me des esa key tampoco pongas null o none ,simplemente que la key no exista, cada caracter especial debe ser representado en formato ASCII siguiendo el formato IPA para la pronunciation ,no pongas nada nunca en image ponle null, si la palabra es un nombre propio solo de Persona no me des esa palabra,no generes doble respuesta (me refiero a que no me hagas elegir entre dos opciones de respuesta, pon la mejor segun tu criterio):"""+words+"""[ { "name":"",(Obligatorio) "past":"",(si no hay no pongas la key) "gerund":"",(si no hay no pongas la key) "participle":"",(si no hay no pongas la key) "pronunciation":"",(en formato IPA con codigo ASCII)(Obligatorio) "meaning":[ { "definition":"", (Obligatorio) "examples":[""],(Obligatorio al menos dos ejemplos) "partOfSpeech":"",(Obligatorio)(Sostantivo, Aggettivo, Articolo, Pronome, Verbo, Numerale, Avverbio, Preposizione, Congiunzione, Interiezione) "synonyms":[],(si no hay no pongas la key) "antonyms":[],(si no hay no pongas la key) "intensity":"", (rude,informal,casual,formal) "frecuency":"",(high,casual,low) "image":"" } ]} ]"""
    return words
# -----------------------------
# Playwright Functions
# -----------------------------


async def capture_response(page):
    """
    Captura la última respuesta generada, sin depender de selectores fijos.
    Busca el último div visible con texto largo (posible respuesta de la IA).
    """
    try:
        # Espera mínima para que la IA genere contenido
        await asyncio.sleep(5)  # espera inicial
        # Tomar todos los divs visibles que tengan texto
        divs = await page.query_selector_all('div')
        text = ""
        for d in divs[::-1]:  # recorrer de último a primero
            t = await d.inner_text()
            if t.strip() and len(t.strip()) > 10:  # posible respuesta de la IA
                text = t.strip()
                break
        return text
    except Exception as e:
        print("Error capturando respuesta:", e)
        return ""


# -----------------------------
# Main Action
# -----------------------------

async def send_prompt(page, i, palabras):
    """Envía el prompt al editor inyectándolo todo de golpe"""
    Prompt = get_prompt(True if i == 0 and New_Chat else False, palabras)
    if not Prompt:
        print("No hay más palabras para procesar.")
        return False

    # Selector del editor ProseMirror
    selector = 'div#prompt-textarea.ProseMirror[contenteditable="true"]'
    await page.wait_for_selector(selector, timeout=60000)
    input_box = await page.query_selector(selector)

    # Inyectar todo el texto directamente
    await input_box.evaluate("(el, value) => { el.innerText = value }", Prompt)

    # Asegurar foco
    await input_box.click()

    # Enviar con Enter
    await input_box.press("Enter")

    return True


async def main_action(page, i, palabras):
    """
    Envía el prompt completo de golpe al editor de ChatGPT
    y captura la respuesta para enviarla al servidor.
    """
    print(f"Iniciando acción para lote {i}...")

    # Enviar prompt
    sent = await send_prompt(page, i, palabras)
    if not sent:
        print("No se pudo enviar el prompt.")
        return

    # Espera mínima para que la IA genere la respuesta
    wait_time = random.uniform(MIN_WAIT, MAX_WAIT)
    print(f"Esperando {wait_time:.1f} segundos para la respuesta...")
    await asyncio.sleep(wait_time)

    # Capturar respuesta del último <pre><code>
    response = await capture_response(page)
    if response:
        print("Respuesta obtenida (primeros 300 caracteres):")
        print(response[:300], "...")
        # Enviar al servidor
        post(response)
    else:
        print("No se pudo capturar la respuesta.")

# -----------------------------
# Main Loop
# -----------------------------


async def main2():
    async with async_playwright() as p:
        browser = await p.firefox.launch(headless=False)  # o .chromium
        page = await browser.new_page()
        await page.goto(URL)

        for _ in range(20):
            global index, index_words
            get_index()
            palabras = get_words()
            if len(palabras) == 0:
                print("No hay palabras para procesar.")
                index += 1000
                modify_index()
                continue

            for i in range(math.ceil(len(palabras) / 10)):
                await main_action(page, i, palabras)
                index_words += 10
                index += 10
                modify_index()

                if i < math.ceil(len(palabras) / 10) - 1:
                    pause_time = random.uniform(5, 8)
                    print(f"Pausa de {pause_time:.1f} segundos...")
                    time.sleep(pause_time)

            print("Esperando 10 min antes de la siguiente tanda...")
            time.sleep(600)

        await browser.close()
async def main3():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()  # sin storage_state todavía
        page = await context.new_page()
        await page.goto("https://chat.openai.com/chat")
        print("Inicia sesión manualmente en esta ventana...")
        
        # Espera el tiempo que necesites para iniciar sesión
        await asyncio.sleep(120)  # 2 minutos
        # Guardar la sesión
        await context.storage_state(path="auth.json")
        print("Sesión guardada en auth.json")

if __name__ == "__main__":
    asyncio.run(main3())
