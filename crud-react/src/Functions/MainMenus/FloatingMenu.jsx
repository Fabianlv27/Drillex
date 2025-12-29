import { useState, useContext, useEffect } from "react";
import { useDraggable } from "../../hooks/useDraggable";
import { FaTools, FaSearch, FaTimes, FaRobot } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5"; // Icono de engranaje
import { BsTranslate } from "react-icons/bs";
import { CiPlay1 } from "react-icons/ci";

import { Context } from "../../../Contexts/Context";
import { DiccionaryContext } from "../../../Contexts/DiccionaryContext";
import { ListsContext } from "../../../Contexts/ListsContext";
import api from "../../../api/axiosClient";
import ElementCard from "../secondary menus/ElementCard";
import "../../translate.css";

const FloatingMenu = () => {
  const { bind, isDragging, x, y } = useDraggable(
    window.innerHeight - 150,
    window.innerWidth - 80
  );

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // Estado para mostrar/ocultar ajustes
  const [inputValue, setInputValue] = useState("");
  const [translation, setTranslation] = useState("");

  const [useAI, setUseAI] = useState(false);
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("es");

  const { SelectedObjects, setSelectedObjects } = useContext(Context);
  const { searchWord } = useContext(DiccionaryContext);
  const { UserLists, GetList } = useContext(ListsContext);

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
    return () =>
      document.removeEventListener("selectionchange", handleSelection);
  }, [isOpen]);

  const handleToggle = () => {
    if (!isDragging) {
      setIsOpen(!isOpen);
      setTranslation("");
      setShowSettings(false); // Resetear ajustes al cerrar
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
    const langForDict = sourceLang === "auto" ? "en" : sourceLang;
    const result = await searchWord(inputValue, {
      language: langForDict,
      useAI: useAI,
    });

    if (
      result &&
      Array.isArray(result) &&
      result.length > 0 &&
      !result[0].error
    ) {
      if (UserLists.length === 0) await GetList();
      setIsOpen(false);
      setTranslation("");
      setSelectedObjects([...SelectedObjects, result[0]]);
    } else {
      const msg =
        result?.message || result[0]?.meaning || "Definition not found.";
      setTranslation(msg);
    }
  };

  const handleVoice = async () => {
    if (!inputValue) return;
    try {
      const langToSpeak = sourceLang === "auto" ? "en" : sourceLang;
      const response = await api.get(
        `/texto_a_voz/${inputValue}/${langToSpeak}`,
        { responseType: "blob" }
      );
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
            {/* --- HEADER: BOTÓN DE SETTINGS --- */}
            <div className="fab-header">
              <button
                className="fab-settings-btn"
                onClick={() => setShowSettings(!showSettings)}
                title="Settings"
              >
                <IoSettingsSharp />
              </button>
            </div>

            {/* --- PANEL DE AJUSTES (CONDICIONAL) --- */}
            {showSettings && (
              <div className="fab-settings-panel">
                {/* 1. AI Toggle (Botón ON/OFF) */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                      color: "#555",
                    }}
                  >
                    AI Mode:
                  </span>
                  <button
                    onClick={() => setUseAI(!useAI)}
                    style={{
                      background: useAI ? "#00c3ff" : "#ccc",
                      color: useAI ? "#fff" : "#555",
                      border: "none",
                      borderRadius: "20px",
                      padding: "5px 15px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "0.8rem",
                      transition: "0.3s",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      boxShadow: useAI
                        ? "0 0 10px rgba(0,195,255,0.4)"
                        : "none",
                    }}
                  >
                    <FaRobot /> {useAI ? "ON" : "OFF"}
                  </button>
                </div>

                {/* 2. Selectores de Idioma */}
                <div className="fab-language-row">
                  {/* COLUMNA IZQUIERDA (FROM) */}
                  <div className="fab-lang-column">
                    <label className="fab-lang-label">From:</label>
                    <select
                      value={sourceLang}
                      onChange={(e) => setSourceLang(e.target.value)}
                      className="fab-lang-select"
                    >
                      {languages.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* FLECHA CENTRAL */}
                  <div className="fab-lang-arrow">➜</div>

                  {/* COLUMNA DERECHA (TO) */}
                  <div className="fab-lang-column">
                    <label className="fab-lang-label">To:</label>
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="fab-lang-select"
                    >
                      {languages
                        .filter((l) => l.code !== "auto")
                        .map((l) => (
                          <option key={l.code} value={l.code}>
                            {l.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* --- INPUT (Ahora es input normal, no textarea) --- */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type or select text..."
              className="fab-input"
            />

            {/* --- ACCIONES --- */}
            <div className="fab-actions-row">
              <button
                onClick={handleTranslate}
                className="fab-action-btn"
                title="Translate"
              >
                <BsTranslate />
              </button>
              <button
                onClick={handleDefinition}
                className="fab-action-btn"
                title="Define"
              >
                <FaSearch />
              </button>
              <button
                onClick={handleVoice}
                className="fab-action-btn"
                title="Listen"
              >
                <CiPlay1 />
              </button>
            </div>

            {/* --- RESULTADO --- */}
            {translation && <div className="fab-result">{translation}</div>}
          </div>
        )}
      </div>

      {SelectedObjects.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 2147483647,
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
          }}
        >
          <div style={{ pointerEvents: "auto", width: "100%", height: "100%" }}>
            <ElementCard Lists={UserLists} CurrentListId={"none"} />
          </div>
        </div>
      )}
    </>
  );
};

const selectStyle = {
  width: "100%",
  padding: "4px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  background: "white",
  fontSize: "0.85rem",
  color: "#333",
};

export default FloatingMenu;
