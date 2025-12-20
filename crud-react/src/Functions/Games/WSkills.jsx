import { useState, useContext, useEffect } from "react";
import { WordsContext } from "../../../Contexts/WordsContext";
import { ListsContext } from "../../../Contexts/ListsContext";
import { MdNotStarted } from "react-icons/md";
import { FaLocationArrow, FaRobot } from "react-icons/fa"; // Importamos FaRobot
import { Shuffler } from "../../Functions/Actions/Shuffler.js";
import api from "../../../api/axiosClient"; 
import { useGemini } from "../../hooks/useGemini"; // <--- IMPORTAMOS EL HOOK
import '../../styles/Wskills.css';


function WSkills() {
  const { GetWords } = useContext(WordsContext);
  const { CurrentListId, setCurrentList, GetList, UserLists } = useContext(ListsContext);
  
  // Hook de Gemini
  const { loadingAi, aiResponse, aiError, analyzeText, clearAiState } = useGemini();

  const [ShuffledArray, setShuffledArray] = useState([]);
  const [Status, setStatus] = useState(-1);
  const [Index, setIndex] = useState(0);
  const [Text, setText] = useState("");

  useEffect(() => {
    const HandlerList = async () => {
      setCurrentList(await GetList());
    };
    HandlerList();
  }, []);

  const startGame = async () => {
    setStatus(0);
    if (CurrentListId?.id) {
        const Words = await GetWords(CurrentListId.id, "wskills");
        const shuffledWords = Shuffler(Words);
        if (shuffledWords.length > 21) {
          setShuffledArray(shuffledWords.slice(0, 21));
        } else {
            setShuffledArray(shuffledWords);
        }
        setStatus(1);
    }
  };

  // --- FUNCIÓN PARA LLAMAR A GEMINI ---
  const handleAICheck = () => {
    if (!Text.trim()) return alert("Write something first!");
    
    // Obtenemos las palabras objetivo actuales
    const currentWords = [
        ShuffledArray[Index]?.name,
        ShuffledArray[Index + 1]?.name,
        ShuffledArray[Index + 2]?.name
    ].filter(Boolean); // Filtramos undefined por si es el final

    analyzeText(Text, currentWords);
  };
  // ------------------------------------

  

  const saveProgress = async (wordsBatch) => {
    try {
      const rightIds = wordsBatch.map((w) => w.id_Word);
      if (rightIds.length === 0) return;

      const payload = {
        idList: CurrentListId.id,
        game: "wskills",
        cant: rightIds.length, 
        right: rightIds, 
        difficulty: null 
      };

      await api.post("/user/progress/update", payload);
      console.log("Progreso guardado");
      
    } catch (error) {
      console.error("Error guardando progreso:", error);
    }
  };

  const Continue = () => {
    if (Verificador()) {
      const currentWordsBatch = ShuffledArray.slice(Index, Index + 3);
      saveProgress(currentWordsBatch); 

      setText("");
      clearAiState(); // <--- LIMPIAMOS EL FEEDBACK DE IA AL PASAR DE RONDA

      if (ShuffledArray[Index + 3]) {
        setIndex(Index + 3);
      } else {
        setStatus(2); 
      }
    } else {
      alert("You missed some words, try again!");
    }
  };

  return (
    <div className="littleMainBackground rand">
      <h1 className="m">Writing</h1>
      
      {/* SECCIÓN DE SELECCIÓN DE LISTA */}
      <div className="ListAndStartMenu ">
        <div className="labelAndOption">
          {UserLists.length > 0 ? (
            <select
              onChange={(e) => {
                const newId = e.target.value;
                const selected = UserLists.find((l) => l.id === newId);
                setCurrentList(selected);
              }}
              value={CurrentListId?.id || ""}
            >
              {UserLists.map((list, index) => (
                <option key={index} value={list.id}>
                  {list.title}
                </option>
              ))}
            </select>
          ) : (
            <p>You dont have lists yet</p>
          )}
        </div>
        <button
          className="ActionButtoms"
          disabled={UserLists.length === 0}
          onClick={() => {
            if (UserLists.length > 0) {
              startGame();
            }
          }}
        >
          <MdNotStarted />
        </button>
      </div>

      {/* ÁREA DE JUEGO */}
      <div>
        {Status === 0 ? <h2>Loading...</h2> : null}
        
        {Status === 1 && (
          <div style={{ marginTop: "2rem", backgroundColor: "#00ffff0d", borderRadius: "10px", padding: "1rem","display":"flex","flexDirection":"column" }}>
            
            <h2 style={{ margin: "1rem" }}>Write something about</h2>
            <p style={{ fontSize: "20px", fontWeight: "bold", color: "whitesmoke", marginBottom: "1rem" }}>
              {ShuffledArray[Index]?.name} 
              {ShuffledArray[Index + 1] ? `, ${ShuffledArray[Index + 1].name}` : ""} 
              {ShuffledArray[Index + 2] ? `, ${ShuffledArray[Index + 2].name}` : ""}
            </p>
            
            <textarea
              name="write"
              cols="30"
              rows="6" 
              value={Text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write sentences using the words above..."
            ></textarea>

            {/* BARRA DE ACCIONES (IA + CONTINUAR) */}
            <div className="ai-actions">
                {/* Botón de IA */}
                <button 
                    className="btn-ai" 
                    onClick={handleAICheck} 
                    disabled={loadingAi || !Text}
                    title="Check grammar with AI"
                >
                    {loadingAi ? <div className="loader"></div> : <><FaRobot /> Check Grammar</>}
                </button>

                {/* Botón de Continuar (Original) */}
                <button className="ActionButtoms" onClick={Continue} title="Next Words">
                  <FaLocationArrow />
                </button>
            </div>

            {/* SECCIÓN DE FEEDBACK DE LA IA */}
            {aiError && <p style={{color: '#ff7675', marginTop: '10px'}}>{aiError}</p>}
            
            {aiResponse && (
                <div className="ai-feedback-box">
                    <h3>Drillexa Teacher 🤖:</h3>
                    <div className="explanation-text">
                        {aiResponse}
                    </div>
                </div>
            )}

          </div>
        )}
        
        {Status === 2 ? <h2>Game Over</h2> : null}
      </div>
    </div>
  );
}

export default WSkills;