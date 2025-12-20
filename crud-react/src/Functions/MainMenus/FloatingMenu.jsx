import { useState, useContext, useEffect } from 'react';
import { useDraggable } from '../../hooks/useDraggable'; // Importa el hook del paso 1
import { FaTools, FaSearch, FaTimes } from 'react-icons/fa';
import { BsTranslate } from "react-icons/bs";
import { CiPlay1 } from "react-icons/ci";
import { Context } from "../../../Contexts/Context";
import { DiccionaryContext } from "../../../Contexts/DiccionaryContext";
import { ListsContext } from "../../../Contexts/ListsContext";
import api from "../../../api/axiosClient";
import ElementCard from "../secondary menus/ElementCard"; // Ajusta ruta
import '../../translate.css'; // Reusa tus estilos o crea nuevos

const FloatingMenu = () => {
  const { bind, isDragging } = useDraggable(window.innerHeight - 150, window.innerWidth - 80);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [translation, setTranslation] = useState("");
  
  // Contextos
  const { SelectedObjects, setSelectedObjects, Language } = useContext(Context);
  const { searchWord } = useContext(DiccionaryContext);
  const { UserLists, GetList } = useContext(ListsContext);

  // Detectar selección de texto automáticamente (opcional, para pre-llenar)
  useEffect(() => {
    const handleSelection = () => {
      const text = window.getSelection().toString().trim();
      if (text.length > 0 && !isOpen) {
        setInputValue(text);
      }
    };
    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, [isOpen]);

  // --- ACCIONES ---

  const handleToggle = () => {
    if (!isDragging) { // Evita abrir el menú si solo estabas arrastrando el botón
        setIsOpen(!isOpen);
        setTranslation(""); // Limpiar traducciones previas
        if(!isOpen && window.getSelection().toString()){
             setInputValue(window.getSelection().toString().trim());
        }
    }
  };

  const handleTranslate = async () => {
    if (!inputValue) return;
    try {
      // Backend: POST /translate { text: "...", target: "es" }
      const response = await api.get(`/Translate/${inputValue}`); 
      setTranslation(response.data);
    } catch (error) {
      setTranslation("Error translating.");
    }
  };

  const handleDefinition = async () => {
    if (!inputValue) return;
    
    // 1. Llamada al contexto refactorizado (pasa el idioma al backend)
    const result = await searchWord(inputValue);

    // 2. Mostrar resultado en ElementCard
    if (result && !result.error) {
        if (UserLists.length === 0) await GetList(); // Asegurar listas
        setIsOpen(false); // Cerramos el menú pequeño
        
        // Asumimos que el backend devuelve un objeto estandarizado
        // Si devuelve array, tomamos el primero o adaptamos
        const wordData = Array.isArray(result) ? result[0] : result;
        
        // Aquí deberías normalizar si tu ElementCard espera un formato específico
        // pero idealmente el backend ya te lo da limpio.
        setSelectedObjects([...SelectedObjects, wordData]); 
    } else {
        alert("Definition not found");
    }
  };

  const handleVoice = async () => {
    if (!inputValue) return;
    try {
      const response = await api.get(`/texto_a_voz/${inputValue}/${Language}`, { responseType: 'blob' });
      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (e) { console.error(e); }
  };
return (
    <>
      {/* 1. CONTENEDOR DRAGGABLE */}
      <div {...bind} className="floating-fab-container">
        
        {/* BOTÓN PRINCIPAL */}
        <button 
            className="fab-button" 
            onClick={handleToggle}
        >
          {isOpen ? <FaTimes /> : <FaTools />}
        </button>

        {/* 2. EL MENÚ DESPLEGABLE */}
        {isOpen && (
            <div className="fab-menu"> {/* Usa la clase CSS, borra el style={} */}
                
                {/* Input Area */}
                <input 
                    type="text" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Select text or type..."
                    className="fab-input"
                />

                {/* Botones de Acción */}
                <div className="fab-actions-row">
                    <button onClick={handleTranslate} className="fab-action-btn" title="Translate">
                        <BsTranslate />
                    </button>
                    <button onClick={handleDefinition} className="fab-action-btn" title="Define">
                        <FaSearch />
                    </button>
                    <button onClick={handleVoice} className="fab-action-btn" title="Listen">
                        <CiPlay1 />
                    </button>
                </div>

                {/* Resultado */}
                {translation && (
                    <div className="fab-result">
                        {translation}
                    </div>
                )}
            </div>
        )}
      </div>

      {/* 3. ELEMENT CARD (Se mantiene igual) */}
      {SelectedObjects.length > 0 && (
        <div style={{ position: "fixed", top: 0, left: 0, zIndex: 99999, width: '100vw', height: '100vh', pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <ElementCard Lists={UserLists} CurrentListId={"none"} />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingMenu;