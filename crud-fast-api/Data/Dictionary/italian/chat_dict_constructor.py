import math
import time
import random
import requests
import pyautogui
import pyperclip
import numpy as np
from itertools import islice
import spacy
import subprocess

# Configuración de PyAutoGUI para movimientos más humanos
pyautogui.MINIMUM_DURATION = 0.1
pyautogui.MINIMUM_SLEEP = 0.05
pyautogui.PAUSE = 0.1

nlp_it = spacy.load("it_core_news_sm")

# Configuración inicial
index=0
def get_index():
    url = "https://dibylocal.com:8000/Dicts_creator/it/index"
    try:
        response = requests.get(url,verify=False)
        if response.status_code == 200:
            print("index:", response.json())
            print("Solicitud exitosa!")
            print("Respuesta:", response.json())
        else:
            print("Error:", response.status_code)
            print("Mensaje:", response.text)
        global index
        data= response.json()
        index = data["index"]
    except Exception as e:
        print(f"Error en la solicitud POST: {e}")
    
def modify_index():
    print("Modificando índice a:", index)
    url = f"https://dibylocal.com:8000/Dicts_creator/it/index/{index}"
    try:
        response = requests.put(url,verify=False)
        if response.status_code == 200:
            print("Índice actualizado correctamente.")
        else:
            print("Error al actualizar el índice:", response.status_code)
    except Exception as e:
        print(f"Error al actualizar el índice: {e}")

index_words = 0

def get_words():
    url = f"https://dibylocal.com:8000/Dicts_creator/it/words/{index}"
    try:
        response = requests.get(url,verify=False)
        if response.status_code == 200:
            palabras=response.json()
            return palabras
        else:
            print("Error:", response.status_code)
            print("Mensaje:", response.text)
            return False
    except Exception as e:
        print(f"Error en la solicitud GET: {e}")
        return False

def get_prompt(isFirst,palabras):
    global index_words
    words = ""
    for i in range(5):
        if (index_words + i)<= (len(palabras)-1):
            words += ", " + palabras[index_words + i]
        else:
            break
    if words=="":
        return False
    if isFirst:
        return """Dame una definicion de esta forma de la siguiente palabra en italiano,no me respondas nada mas solo dame el json,si no tiene una key no me des esa key tampoco pongas null o none ,simplemente que la key no exista,
    cada caracter especial debe ser representado en formato ASCII siguiendo el formato IPA para la pronunciation
 ,no pongas nada nunca en image ponle null,no generes doble respuesta (me refiero a que no me hagas elegir entre dos opciones de respuesta, pon la mejor segun tu criterio):""" + words + """"
[
    {
        "name":"",(Obligatorio)
        "past":"",(si no hay no pongas la key)
        "gerund":"",(si no hay no pongas la key)
        "participle":"",(si no hay no pongas la key)
        "pronunciation":"",(en formato IPA con codigo ASCII)(Obligatorio)
        "meaning":[
            {
                "definition":"", (Obligatorio)
                "examples":[""],(Obligatorio al menos dos ejemplos)
                "partOfSpeech":"",(Obligatorio)(Sostantivo, Aggettivo, Articolo, Pronome, Verbo, Numerale, Avverbio, Preposizione, Congiunzione, Interiezione)
                "synonyms":[],(si no hay no pongas la key)
                "antonyms":[],(si no hay no pongas la key)
                "intensity":"", (rude,informal,casual,formal)               
                 "frecuency":"",(high,casual,low)
                "image":""
            }
        ],
        "conjugation":(si no hay ninguno no pongas la key){
            "plural":{
                "1p":"",
                "2p":"",
                "3p":""
            },
            "singular":{
                 "1p":"",
                "2p":"",
                "3p":""
            }
        }
    }
]"""  
    return words

URL = "https://lmarena.ai/"
New_Chat = True
MIN_WAIT = 10  # Mínimo tiempo de espera
MAX_WAIT = 25  # Máximo tiempo de espera

def human_like_mouse_move(x, y):
    """Mueve el ratón de forma más humana con curva de Bezier"""
    current_x, current_y = pyautogui.position()
    control_x = current_x + (x - current_x) * random.uniform(0.3, 0.7)
    control_y = current_y + (y - current_y) * random.uniform(0.3, 0.7)
    
    steps = random.randint(10, 20)
    for t in np.linspace(0, 1, steps):
        # Curva de Bezier cuadrática
        q_x = (1-t)**2 * current_x + 2*(1-t)*t*control_x + t**2 * x
        q_y = (1-t)**2 * current_y + 2*(1-t)*t*control_y + t**2 * y
        pyautogui.moveTo(q_x, q_y, duration=0.001)
    
    # Pequeña pausa final
    time.sleep(random.uniform(0.05, 0.2))

def human_like_click(x, y, clicks=1):
    """Realiza un clic más humano con variaciones"""
    human_like_mouse_move(x, y)
    
    # Pequeña variación en la posición final
    offset_x = random.randint(-3, 3)
    offset_y = random.randint(-3, 3)
    pyautogui.moveRel(offset_x, offset_y, duration=random.uniform(0.05, 0.2))
    
    # Tiempo de presión variable
    press_duration = random.uniform(0.05, 0.15)
    
    for _ in range(clicks):
        pyautogui.mouseDown(duration=press_duration)
        time.sleep(random.uniform(0.03, 0.1))
        pyautogui.mouseUp()
        if clicks > 1:
            time.sleep(random.uniform(0.1, 0.3))

def random_wait(min_time=0.5, max_time=0.9):
    """Espera un tiempo aleatorio entre min y max"""
    time.sleep(random.uniform(min_time, max_time))

def focus_firefox():
    """Intenta enfocar la ventana de Firefox con comportamiento humano"""
    try:
        # Busca la ventana de Firefox
        windows = pyautogui.getWindowsWithTitle("Firefox")
        if windows:
            firefox_window = windows[0]
            
            # Mover el ratón a la barra de título y hacer clic
            title_bar_x = firefox_window.left + random.randint(50, 100)
            title_bar_y = firefox_window.top + random.randint(5, 15)
            
            human_like_mouse_move(title_bar_x, title_bar_y)
            human_like_click(title_bar_x, title_bar_y)
            
            random_wait(0.5, 0.8)
            return True
    except Exception as e:
        print(f"Error al enfocar Firefox: {e}")
    return False

def send_prompt(i,palabras):
    """Envía el prompt con comportamiento humano"""
    Prompt = get_prompt(True if i == 0 and New_Chat else False,palabras)
    if not Prompt:
        print("No hay más palabras para procesar.")
        return
    pyperclip.copy(Prompt)
    
    # Simular Ctrl+V para pegar con variaciones
    random_wait(0.2, 0.5)
    with pyautogui.hold('ctrl'):
        time.sleep(random.uniform(0.05, 0.15))
        pyautogui.press('v')
    
    random_wait(0.3, 0.8)
    
    # Enviar con Enter (con posible doble pulsación)
    if random.random() < 0.2:  # 20% de probabilidad de doble enter
        pyautogui.press('enter')
        random_wait(0.1, 0.3)
    pyautogui.press('enter')

def capture_response():
    """Captura la respuesta con movimientos humanos"""
    # Posición base con variación aleatoria
    base_x = 420 + random.randint(0, 20)
    base_y = 200 + random.randint(-5, 5)
    
    human_like_mouse_move(base_x, base_y)
    human_like_click(base_x, base_y)
    
    random_wait(0.3, 0.7) 
    return pyperclip.paste()

def get_pixel_color_hex(x, y):
    """Obtiene el color del pixel con pequeñas variaciones"""
    cap=pyautogui.screenshot()
    cap.save("t9.png")
    pixel_color = cap.getpixel((x, y))
    
    hex_color = '#{:02x}{:02x}{:02x}'.format(*pixel_color[:3])
    print(f"Posición: ({x}, {y}) | Color HEX: {hex_color}")
    return hex_color

def CreateNewChat():
    human_like_click(30, 140)
    human_like_click(50, 200)
    human_like_click(530, 140)
    
#30,140
#50,200
#530,140
#sent button 500,910
    
def Bajar():
    color = get_pixel_color_hex(270, 830)
    if  color == "#f9f9f9":
        print("aviso")
        human_like_mouse_move(510, 700)
        human_like_click(510, 700)  
    print("Bajando...")     
    human_like_mouse_move(280 + random.randint(-4, 4), 830 + random.randint(-4, 4))
    human_like_click(280, 830)    


def post(data):
    if data=="":
        print("No hay datos para enviar.")
        return
    print("Enviando datos al servidor...")
    print("Datos:", data[:500] + "...")  # Muestra solo un fragmento
    url = "https://dibylocal.com:8000/Dicts_creator/it"
    try:
        response = requests.post(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            verify=False,
            timeout=random.uniform(5, 15)  # Tiempo de espera aleatorio
        )
        if response.status_code == 200:
            print("Solicitud exitosa!")
            print("Respuesta:", response.json())
            return True
        else:
            print("Error:", response.status_code)
            print("Mensaje:", response.text)
            return False
    except Exception as e:
        print(f"Error en la solicitud POST: {e}")
        return False

        

def no_add():
    if get_pixel_color_hex(300, 980)=="#282841":
        human_like_click(520, 155)
        
def check_ready():
    isReady = False
    checks = 0
    while not isReady and checks < 10:  # Máximo 10 intentos
        random_wait(3, 7)  # Espera aleatoria entre checks
        color = get_pixel_color_hex(510, 920)
        isReady = True if not color == "#ffffff" else False
        checks += 1   
    if not isReady:
        print("No se detectó respuesta lista después de varios intentos")
        return False
    return True

def main_action(i,palabras):
    status=False
    no_add()
    print("Iniciando acción con comportamiento humano simulado...")
    random_wait(3, 7)  # Espera inicial más larga y aleatoria
    
    if not focus_firefox():
        return
    
    # Mover mouse a la zona de texto con variación
    target_x = 300 + random.randint(-5, 10)
    target_y = 950 + random.randint(0,5)
    human_like_mouse_move(target_x, target_y)
    human_like_click(target_x, target_y)
    
    # Enviar prompt
    send_prompt(i,palabras)
    print("Prompt enviado. Esperando respuesta...")
    
    # Esperar respuesta con tiempo aleatorio
    wait_time = random.uniform(MIN_WAIT, MAX_WAIT)
    print(f"Esperando {wait_time:.1f} segundos...")
    time.sleep(wait_time)
    
    ready=check_ready()
    if not ready:
        return False
    Bajar()
    pyperclip.copy("")
    # Capturar respuesta
    response = capture_response()
    print("\nRespuesta obtenida:")
    print(response[:500] + "...")  # Muestra solo un fragmento
    status=post(response)
    return status

def main2():
    global New_Chat
    for e in range(20):
        global index
        get_index()
        palabras=get_words()
        if len(palabras)==0:
            print("No hay  palabras para procesar.")
            index+=100
            modify_index()
            continue
        for i in range(math.ceil(len(palabras)/10)):
            status =main_action(i,palabras)
            if not status:
                break
            global index_words
            index_words += 10
            index += 10
            modify_index() 
        # Espera aleatoria entre iteraciones
            if i < math.ceil(len(palabras)/10) - 1:  # No esperar después de la última
                pause_time = random.uniform(5, 8)
                print(f"Pausa de {pause_time:.1f} segundos antes de la próxima acción...")
                time.sleep(pause_time)
        time.sleep(600)
        CreateNewChat()
        New_Chat=True
        
def main():
    time.sleep(3)
    get_pixel_color_hex(500, 1000)

if __name__ == "__main__":
    main()
    input("Presiona Enter para salir...")
    
    