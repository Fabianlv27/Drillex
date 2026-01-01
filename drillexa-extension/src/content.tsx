import cssText from "data-text:~/styles/LyricsAndWords.css"
import translateCss from "data-text:~/styles/translate.css"
import type { PlasmoCSConfig } from "plasmo"
import { useState, useEffect, useCallback } from "react"
import FloatingMenu from "./components/FloatingMenu"
import ElementCard from "./components/ElementCard" // Importamos para usar sus tipos si fuera TS
import api from "./api/extensionClient"
import { FaUserLock } from "react-icons/fa"

const CACHE_DURATION = 120 * 1000;

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText + "\n" + translateCss
  return style
}

// URL DE TU WEB
const LOGIN_URL = "https://dibylocal.com:5173/login"; 

const DrillexaExtension = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [selectedObjects, setSelectedObjects] = useState([])
  const [userLists, setUserLists] = useState([])


const checkAuth = useCallback(async (force = false) => {
    // 1. Protección de pestaña oculta
    if (document.hidden) return; 

    const now = Date.now();

    // 2. Leemos la caché compartida
    chrome.storage.local.get(["auth_status", "last_check", "cached_lists"], async (result) => {
        
        const lastCheck = result.last_check || 0;
        const isFresh = (now - lastCheck) < CACHE_DURATION;

        // --- ESCENARIO A: Usar Caché (Si es reciente y no forzamos) ---
        if (isFresh && !force && result.auth_status !== undefined) {
            console.log("Usando caché (No se contactó al backend)");
            setIsAuthenticated(result.auth_status);
            if (result.cached_lists) {
                setUserLists(result.cached_lists);
            }
            return; 
        }

        // --- ESCENARIO B: Petición Real (Caché vieja o forzada) ---
        try {
            console.log("🔄 Verificando sesión con Backend...");
            await api.get("/users/me"); // Si falla lanza error 401
            
            // Si llegamos aquí, está autenticado. Pedimos listas.
            // (Podrías optimizar y pedir listas solo si no están en caché, pero mejor actualizar)
            const listsRes = await api.get("/lists/get_lists");
            
            // ACTUALIZAMOS EL ESTADO LOCAL
            setIsAuthenticated(true);
            setUserLists(listsRes.data);

            // ACTUALIZAMOS LA CACHÉ COMPARTIDA (Para las otras pestañas)
            chrome.storage.local.set({
                auth_status: true,
                cached_lists: listsRes.data,
                last_check: now
            });

        } catch (error) {
            // Error = No autenticado
            setIsAuthenticated(false);
            setUserLists([]);

            // Actualizamos caché como "No logueado"
            chrome.storage.local.set({
                auth_status: false,
                cached_lists: [],
                last_check: now
            });
        }
    });
  }, []);

useEffect(() => {
    // 1. Carga inicial
    checkAuth();

    // 2. Al enfocar la pestaña (ahora es seguro y barato gracias a la caché)
    const handleFocus = () => checkAuth();
    window.addEventListener("focus", handleFocus);

    // 3. Listener de mensajes (Si Login.jsx manda "DRILLEXA_LOGIN_SUCCESS")
    // Esto fuerza la actualización ignorando la caché
    const handleMessage = (event) => {
         if (event.data && event.data.type === "DRILLEXA_LOGIN_SUCCESS") {
             checkAuth(true); // true = forzar actualización
         }
    };
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("message", handleMessage);
    };
  }, [checkAuth]);

const handleAddWordExtension = async (listIds: any, wordData: any) => {
try {
        
        const payload = {
            ...wordData,        
            ListsId: listIds      
        };

        if (!payload.name) {
            alert("Error: La palabra no tiene nombre");
            return;
        }

        await api.post("/words", payload);
        
        console.log("Palabra guardada exitosamente");
        
        checkAuth(); 
        alert("Palabra guardada correctamente");

    } catch (error: any) {
        console.error("Error guardando palabra:", error);
        
        if (error.response && error.response.status === 401) {
    setIsAuthenticated(false);
    // IMPORTANTE: Invalidar la caché global para que todas las pestañas se enteren
    chrome.storage.local.set({ auth_status: false, last_check: Date.now() }); 
    alert("Sesión caducada.");
}
        if (error.response && error.response.status === 401) {
            setIsAuthenticated(false);
            alert("Tu sesión ha caducado.");
        } else if (error.response && error.response.status === 422) {
            // Esto nos ayudará a ver qué campo falta si vuelve a pasar
            console.log("Detalle del error 422:", error.response.data);
            alert("Error de validación de datos (422). Revisa la consola.");
        } else {
            alert("Error al guardar la palabra.");
        }
    }
  }
  if (isAuthenticated === null) return null 

  if (isAuthenticated === false) {
    return (
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 2147483647 }}>
        <button 
          onClick={() => window.open(LOGIN_URL, "_blank")}
          style={{
            width: '60px', height: '60px', borderRadius: '50%',
            backgroundColor: '#222', border: '2px solid #00c3ff',
            color: '#00c3ff', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '24px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
          }}
          title="Inicia sesión para usar Drillexa"
        >
          <FaUserLock />
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* PASAMOS LA FUNCIÓN Y LAS LISTAS AL MENÚ */}
      <FloatingMenu 
        selectedObjects={selectedObjects}
        setSelectedObjects={setSelectedObjects}
        userLists={userLists}
        setUserLists={setUserLists}
        addWordFunction={handleAddWordExtension} // <--- AQUÍ PASA LA PROPS
      />
      
      {/* No necesitamos renderizar ElementCard aquí por separado si FloatingMenu 
          ya lo renderiza internamente (como en tu código anterior). 
          Si FloatingMenu NO renderiza ElementCard, entonces pásale las props aquí también. */}
    </div>
  )
}

export default DrillexaExtension