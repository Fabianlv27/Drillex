import cssText from "data-text:~/styles/LyricsAndWords.css"
import translateCss from "data-text:~/styles/translate.css"
import type { PlasmoCSConfig } from "plasmo"
import { useState, useEffect } from "react"
import FloatingMenu from "./components/FloatingMenu"
import ElementCard from "./components/ElementCard"
import api from "./api/extensionClient"
import { FaUserLock } from "react-icons/fa" // Icono de candado/usuario

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText + "\n" + translateCss
  return style
}

// URL DE REGISTRO DE TU WEB PRINCIPAL
const REGISTER_URL = "http://dibylocal.com:5173/register"; // Cambia esto por tu URL real

const DrillexaExtension = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [selectedObjects, setSelectedObjects] = useState([])
  const [userLists, setUserLists] = useState([])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/users/me") 
        setIsAuthenticated(true)
        const lists = await api.get("/progress/lists") 
        setUserLists(lists.data)
      } catch (error) {
        // NO AUTENTICADO
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  // 1. ESTADO DE CARGA (Opcional: no mostrar nada mientras verifica)
  if (isAuthenticated === null) return null

  // 2. ESTADO NO AUTENTICADO (Aquí mostramos el botón de registro)
  if (isAuthenticated === false) {
    return (
      <div className="drillexa-login-prompt" style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 2147483647
      }}>
        <button 
          onClick={() => window.open(REGISTER_URL, "_blank")}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#333', // Color gris/oscuro para indicar "inactivo"
            border: '2px solid #00c3ff',
            color: '#00c3ff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            transition: 'transform 0.2s',
            position: 'relative'
          }}
          title="Inicia sesión para activar Drillexa"
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <FaUserLock />
          
          {/* Pequeño punto rojo de notificación */}
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '15px',
            height: '15px',
            backgroundColor: '#ff4757',
            borderRadius: '50%',
            border: '2px solid #333'
          }}></span>
        </button>
      </div>
    )
  }

  // 3. ESTADO AUTENTICADO (Tu app normal)
  return (
    <div className="drillexa-root">
      <FloatingMenu 
        selectedObjects={selectedObjects}
        setSelectedObjects={setSelectedObjects}
        userLists={userLists}
        setUserLists={setUserLists}
      />

      {selectedObjects.length > 0 && (
         <div style={{ position: "fixed", top: 0, left: 0, zIndex: 2147483640, width: "100vw", height: "100vh", pointerEvents: "none" }}>
            <div style={{ pointerEvents: "auto", width: "100%", height: "100%" }}>
              <ElementCard 
                selectedObjects={selectedObjects}
                setSelectedObjects={setSelectedObjects}
                currentListId={"none"} 
              />
            </div>
         </div>
      )}
    </div>
  )
}

export default DrillexaExtension