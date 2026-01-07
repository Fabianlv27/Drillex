import { useState, useContext, useEffect } from "react";
import { useDraggable } from "../hooks/useDraggable"; // Ruta corregida
import { FaTools, FaSearch, FaTimes, FaRobot } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { BsTranslate } from "react-icons/bs";
import { CiPlay1 } from "react-icons/ci";
import GrammarCard from "./GrammarCard";
import { FaPuzzlePiece } from "react-icons/fa";

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
              t_lang:options.targetLang,
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
  const [grammarData, setGrammarData] = useState(null);
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

const handleGrammar = async () => {
    if (!inputValue) return;
    
    // Si la selección es muy corta (menos de 2 palabras), avisamos
    if (inputValue.trim().split(/\s+/).length < 2) {
        setTranslation("Please select a full phrase/sentence for grammar analysis.");
        return;
    }

    setTranslation("Analyzing grammar..."); // Feedback visual en el menú
    
    try {
        const langToExplain = targetLang === "auto" ? "en" : targetLang;
        
        const response = await api.post("/grammar/analyze", {
            text: inputValue,
            language: langToExplain
        });

        if (response.data.status) {
            setIsOpen(false); // Cerramos menú flotante
            setGrammarData(response.data.data); // Abrimos GrammarCard
            setTranslation("");
        } else {
            setTranslation(response.data.message || "Analysis failed.");
        }
    } catch (error) {
        console.error(error);
        setTranslation("Error connecting to Grammar AI.");
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

      if (response.data && response.data.status) {
          setTranslation(response.data.translation);
      } else {
          const errorMsg = response.data?.translation || "Translation not found.";
          setTranslation(`⚠️ ${errorMsg}`);
      }

    } catch (error) {
      console.error("Translation error:", error);
      if (error.response?.status === 429) {
          setTranslation("⚠️ Too many requests. Please wait.");
      } else {
          setTranslation("⚠️ Error connecting to server.");
      }
    }
  };

  const handleDefinition = async () => {
    if (!inputValue) return;
    setTranslation("Searching...");
    const selection = window.getSelection();
    const contextParagraph = selection.anchorNode?.parentElement?.innerText || ""; 
    const contextNode = selection.anchorNode?.nodeType === 3 
        ? selection.anchorNode.textContent 
        : selection.anchorNode?.parentElement?.innerText || "";
    console.log(contextParagraph)
    const pageTitle = document.title;
    const pageUrl = window.location.href;
  
   
   // const SlangForDict = sourceLang === "auto" ? "en" : sourceLang;
    const TlangForDict=targetLang==="auto"?"en":targetLang
  
    const result = await searchWord(inputValue, {
      language: sourceLang,
      targetLang:TlangForDict,
      useAI: useAI,
      context: contextParagraph, 
      title: pageTitle,         
      url: pageUrl               
    });

    if (result && Array.isArray(result) && result.length > 0 && !result[0].error) {
      if (UserLists.length === 0 && !propUserLists) await GetList();
      
      setIsOpen(false);
      setTranslation("");
      const wordWithContext = {
          ...result[0],
          originalContext: contextNode // Guardamos el contexto AQUÍ
      };
      setSelectedObjects([...SelectedObjects, wordWithContext]);
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
              <button onClick={handleGrammar} className="fab-action-btn" title="Grammar Analysis"><FaPuzzlePiece /></button>
              <button onClick={handleVoice} className="fab-action-btn" title="Listen"><CiPlay1 /></button>
            </div>

            {translation && <div className="fab-result">{translation}</div>}
          </div>
        )}
      </div>

      {SelectedObjects.length > 0 && !grammarData&& (
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
      {grammarData && (
        <div style={{ position: "fixed", top: 0, left: 0, zIndex: 214748365, width: "100vw", height: "100vh", pointerEvents: "none" }}>
          <div style={{ pointerEvents: "auto", width: "100%", height: "100%" }}>
            <GrammarCard 
                grammarData={grammarData}
                onClose={() => setGrammarData(null)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingMenu;