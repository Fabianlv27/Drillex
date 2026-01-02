import { useState, useContext, useEffect } from "react";
import { useDraggable } from "../hooks/useDraggable"; // Ruta corregida
import { FaTools, FaSearch, FaTimes, FaRobot } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { BsTranslate } from "react-icons/bs";
import { CiPlay1 } from "react-icons/ci";

// RUTAS CORREGIDAS
import { Context } from "../Contexts/Context";
import { DiccionaryContext } from "../Contexts/DiccionaryContext";
import { ListsContext } from "../Contexts/ListsContext";
import defaultApi from "../api/extensionClient"; // Apuntamos al cliente de la extensión
import ElementCard from "./ElementCard"; // Misma carpeta

const FloatingMenu = ({
    // Props Opcionales para Extensión
    selectedObjects: propSelectedObjects,
    setSelectedObjects: propSetSelectedObjects,
    userLists: propUserLists,
    setUserLists: propSetUserLists,
    customApi,
    customSearchWord ,
    addWordFunction
}) => {
  
  // 1. OBTENER CONTEXTOS (Puede fallar o ser null en extensión, no importa)
  const contextData = useContext(Context);
  const dictContext = useContext(DiccionaryContext);
  const listContext = useContext(ListsContext);

  // 2. DETERMINAR DATOS (Props > Contexto)
  const SelectedObjects = propSelectedObjects || contextData?.SelectedObjects || [];
  const setSelectedObjects = propSetSelectedObjects || contextData?.setSelectedObjects || (() => {});
  
  const UserLists = propUserLists || listContext?.UserLists || [];
  const GetList = listContext?.GetList || (() => {});

  // 3. ELEGIR API 
  const api = customApi || defaultApi;

  // 4. Lógica de búsqueda (Diccionario)
  const searchWord = customSearchWord || dictContext?.searchWord || (async (word, options) => {
      try {
          const res = await api.post("/dictionary/search", { 
              word, 
              language: options.language, 
              use_ai: options.useAI ,
              context: options.context || "",
              title: options.title || "",
              url: options.url || ""
          });
          return res.data;
      } catch (e) { return [{ error: true, meaning: "Connection Error" }]; }
  });

  const { bind, isDragging } = useDraggable(
    window.innerHeight - 150,
    window.innerWidth - 80
  );

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [translation, setTranslation] = useState("");

  const [useAI, setUseAI] = useState(false);
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("es");

  const languages = [
    { code: "auto", name: "Detect" },
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
  ];

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

  const handleToggle = () => {
    if (!isDragging) {
      setIsOpen(!isOpen);
      setTranslation("");
      setShowSettings(false);
      const currentSelection = window.getSelection().toString().trim();
      if (!isOpen && currentSelection) setInputValue(currentSelection);
    }
  };

  const handleTranslate = async () => {
    if (!inputValue) return;
    setTranslation("Translating...");
    try {
      const response = await api.post(`/Translate/Process`, {
        text: inputValue,
        source: sourceLang,
        target: targetLang,
        use_ai: useAI,
      });
      setTranslation(response.data);
    } catch (error) {
      setTranslation("Error translating.");
    }
  };

  const handleDefinition = async () => {
    if (!inputValue) return;
    setTranslation("Searching...");
    // --- 1. CAPTURAR CONTEXTO ---
    const selection = window.getSelection();
    // Obtenemos el texto del elemento padre (párrafo, div, span) donde está la selección
    const contextParagraph = selection.anchorNode?.parentElement?.innerText || ""; 
    const pageTitle = document.title;
    const pageUrl = window.location.href;


    const langForDict = sourceLang === "auto" ? "en" : sourceLang;
    const result = await searchWord(inputValue, {
      language: langForDict,
      useAI: useAI,
      context: contextParagraph, 
      title: pageTitle,         
      url: pageUrl               
    });

    if (result && Array.isArray(result) && result.length > 0 && !result[0].error) {
      if (UserLists.length === 0 && !propUserLists) await GetList();
      
      setIsOpen(false);
      setTranslation("");
      setSelectedObjects([...SelectedObjects, result[0]]);
    } else {
      const msg = result?.message || result[0]?.meaning || "Definition not found.";
      setTranslation(msg);
    }
  };

  const handleVoice = async () => {
    if (!inputValue) return;
    try {
      const langToSpeak = sourceLang === "auto" ? "en" : sourceLang;
      const response = await api.get(`/texto_a_voz/${inputValue}/${langToSpeak}`, { responseType: "blob" });
      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div {...bind} className="floating-fab-container">
        <button className="fab-button" onClick={handleToggle}>
          {isOpen ? <FaTimes /> : <FaTools />}
        </button>

        {isOpen && (
          <div className="fab-menu">
            <div className="fab-header">
              <button className="fab-settings-btn" onClick={() => setShowSettings(!showSettings)} title="Settings">
                <IoSettingsSharp />
              </button>
            </div>

            {showSettings && (
              <div className="fab-settings-panel">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#555" }}>AI Mode:</span>
                  <button
                    onClick={() => setUseAI(!useAI)}
                    style={{
                      background: useAI ? "#00c3ff" : "#ccc",
                      color: useAI ? "#fff" : "#555",
                      border: "none", borderRadius: "20px", padding: "5px 15px",
                      cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem",
                      transition: "0.3s", display: "flex", alignItems: "center", gap: "5px",
                      boxShadow: useAI ? "0 0 10px rgba(0,195,255,0.4)" : "none",
                    }}
                  >
                    <FaRobot /> {useAI ? "ON" : "OFF"}
                  </button>
                </div>

                <div className="fab-language-row">
                  <div className="fab-lang-column">
                    <label className="fab-lang-label">From:</label>
                    <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="fab-lang-select">
                      {languages.map((l) => (<option key={l.code} value={l.code}>{l.name}</option>))}
                    </select>
                  </div>
                  <div className="fab-lang-arrow">➜</div>
                  <div className="fab-lang-column">
                    <label className="fab-lang-label">To:</label>
                    <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="fab-lang-select">
                      {languages.filter((l) => l.code !== "auto").map((l) => (<option key={l.code} value={l.code}>{l.name}</option>))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type or select text..."
              className="fab-input"
            />

            <div className="fab-actions-row">
              <button onClick={handleTranslate} className="fab-action-btn" title="Translate"><BsTranslate /></button>
              <button onClick={handleDefinition} className="fab-action-btn" title="Define"><FaSearch /></button>
              <button onClick={handleVoice} className="fab-action-btn" title="Listen"><CiPlay1 /></button>
            </div>

            {translation && <div className="fab-result">{translation}</div>}
          </div>
        )}
      </div>

      {SelectedObjects.length > 0 && (
        <div style={{ position: "fixed", top: 0, left: 0, zIndex: 214748364, width: "100vw", height: "100vh", pointerEvents: "none" }}>
          <div style={{ pointerEvents: "auto", width: "100%", height: "100%" }}>
            <ElementCard 
                CurrentListId={"none"} 
                selectedObjects={SelectedObjects}
                setSelectedObjects={setSelectedObjects}
                userLists={propUserLists}      // <--- IMPORTANTE
                addWordFunction={addWordFunction} // <--- IMPORTANTE
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingMenu;