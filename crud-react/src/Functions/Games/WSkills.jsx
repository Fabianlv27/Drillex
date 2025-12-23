import { useState, useContext, useEffect } from "react";
import { WordsContext } from "../../../Contexts/WordsContext";
import { ListsContext } from "../../../Contexts/ListsContext";
import { MdNotStarted } from "react-icons/md";
import { FaLocationArrow, FaRobot } from "react-icons/fa";
import { Shuffler } from "../../Functions/Actions/Shuffler.js";
import api from "../../../api/axiosClient"; 
import { useGemini } from "../../hooks/useGemini"; 
import '../../styles/Wskills.css';

function WSkills() {
  const { GetWords } = useContext(WordsContext);
  const { CurrentListId, setCurrentList, GetList, UserLists } = useContext(ListsContext);
  const { loadingAi, aiResponse, aiError, analyzeText, clearAiState } = useGemini();
  const [ShuffledArray, setShuffledArray] = useState([]);
  const [Status, setStatus] = useState(-1);
  const [Index, setIndex] = useState(0);
  const [Text, setText] = useState("");

  useEffect(() => {
    const init = async () => setCurrentList(await GetList());
    init();
  }, []);

  const startGame = async () => {
    setStatus(0);
    if (CurrentListId?.id) { // Asumiendo que CurrentListId tiene la estructura {id: ...} o es el ID directo. Ajusta según tu contexto real.
        const idToUse = CurrentListId.id || CurrentListId;
        const Words = await GetWords(idToUse, "wskills");
        const shuffledWords = Shuffler(Words);
        
        if (shuffledWords.length > 21) {
          setShuffledArray(shuffledWords.slice(0, 21));
        } else {
            setShuffledArray(shuffledWords);
        }
        setStatus(1);
    }
  };

  const handleAICheck = () => {
    if (!Text.trim()) return alert("Write something first!");
    
    const currentWords = [
        ShuffledArray[Index]?.name,
        ShuffledArray[Index + 1]?.name,
        ShuffledArray[Index + 2]?.name
    ].filter(Boolean);

    analyzeText(Text, currentWords);
  };

  const saveProgress = async (wordsBatch) => {
    try {
      const rightIds = wordsBatch.map((w) => w.id_Word);
      if (rightIds.length === 0) return;

      const payload = {
        idList: CurrentListId.id || CurrentListId,
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
      // Verificador simple: que haya escrito algo
      if(Text.length > 5) {
        const currentWordsBatch = ShuffledArray.slice(Index, Index + 3);
        saveProgress(currentWordsBatch); 

        setText("");
        clearAiState();

        if (ShuffledArray[Index + 3]) {
            setIndex(Index + 3);
        } else {
            setStatus(2); 
        }
      } else {
          alert("Please write a longer sentence.");
      }
  };

  return (
    <div className="MainBackground WSkillsContainer">
      <h1>Writing Practice</h1>
      
      {/* MENÚ ESTÁNDAR */}
      <div className="WSkillsMenu">
        <div className="labelAndOption">
          {UserLists.length > 0 ? (
            <select
              onChange={(e) => {
                  // Si tu contexto requiere el objeto completo, búscalo. Si requiere solo ID, pasa e.target.value
                  const selectedId = e.target.value;
                  const selectedObj = UserLists.find(l => l.id == selectedId);
                  setCurrentList(selectedObj || selectedId);
              }}
              // Ajusta esto según si CurrentListId es objeto o string en tu contexto
              value={CurrentListId?.id || CurrentListId || ""}
            >
              {UserLists.map((list, index) => (
                <option key={index} value={list.id}>
                  {list.title}
                </option>
              ))}
            </select>
          ) : (
            <p>No lists</p>
          )}
          <button
            className="ActionButtoms"
            disabled={UserLists.length === 0}
            onClick={startGame}
          >
            <MdNotStarted />
          </button>
        </div>
      </div>

      {/* ÁREA DE JUEGO */}
      {Status === 1 && (
          <div className="GameArea">
            <h2 style={{color: 'white', marginBottom:'1rem', textAlign:'center'}}>Write using these words:</h2>
            
            <div className="word-chips">
                {[0,1,2].map(i => ShuffledArray[Index+i] && (
                    <span key={i} className="word-chip">
                        {ShuffledArray[Index+i].name}
                    </span>
                ))}
            </div>
            
            <textarea
              name="write"
              rows="6" 
              value={Text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write sentences using the words above..."
            ></textarea>

            <div className="ai-actions">
                <button 
                    className="btn-ai" 
                    onClick={handleAICheck} 
                    disabled={loadingAi || !Text}
                >
                    {loadingAi ? <div className="loader"></div> : <><FaRobot /> Check Grammar</>}
                </button>

                <button className="ActionButtoms" onClick={Continue} title="Next">
                  <FaLocationArrow />
                </button>
            </div>

            {aiError && <p style={{color: '#ff7675', marginTop: '15px'}}>{aiError}</p>}
            
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
      
      {Status === 0 && <h2 style={{color:'white'}}>Loading...</h2>}
      {Status === 2 && <h2 style={{color:'#00ffaa'}}>Session Finished!</h2>}
    </div>
  );
}

export default WSkills;