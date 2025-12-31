import cssText from "data-text:~/styles/LyricsAndWords.css"
import translateCss from "data-text:~/styles/translate.css"
import type { PlasmoCSConfig } from "plasmo"
import { useState, useEffect, useCallback } from "react"
import FloatingMenu from "./components/FloatingMenu"
import ElementCard from "./components/ElementCard" // Importamos para usar sus tipos si fuera TS
import api from "./api/extensionClient"
import { FaUserLock } from "react-icons/fa"

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


  const checkAuth = useCallback(async () => {
    if (document.hidden) return; // Protección básica
    try {
      await api.get("/users/me");
      setIsAuthenticated(true);
      
      if (userLists.length === 0) { 
          const listsRes = await api.get("/users/Lists");
          console.log("📦 RESPUESTA COMPLETA LISTAS:", listsRes);
          console.log("📦 DATA RECIBIDA:", listsRes.data);
          console.log("📦 ES ARRAY?:", Array.isArray(listsRes.data.content))
          setUserLists(listsRes.data.content);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUserLists([]);
    }
  }, [userLists.length]);


useEffect(() => {
    checkAuth();

    const handleFocus = () => checkAuth();
    
    window.addEventListener("focus", handleFocus);
    
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkAuth]);

const handleAddWordExtension = async (listIds, wordData) => {
    try {
        await api.post("/words", { 
            list_ids: listIds, 
            word: wordData 
        })
        console.log("Palabra guardada")
        // Opcional: Actualizar listas tras guardar
        const listsRes = await api.get("/users/Lists");
        setUserLists(listsRes.data);

    } catch (error: any) {
        console.error("Error guardando:", error)
        
        // DETECCIÓN INTELIGENTE DE ERROR
        if (error.response && error.response.status === 401) {
            // El token caducó o el usuario cerró sesión en otro lado.
            // Forzamos el estado a "No Autenticado" para mostrar el candado
            setIsAuthenticated(false);
            alert("Tu sesión ha caducado. Por favor, inicia sesión de nuevo.");
        } else {
            alert("Error de conexión al guardar la palabra.");
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