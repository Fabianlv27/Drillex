import { useState, useContext, useEffect } from "react";
import { ListsContext } from "../../../Contexts/ListsContext";
import { WordsContext } from "../../../Contexts/WordsContext";
import { useParams, useNavigate } from "react-router-dom"; // <--- 1. Importar Hooks de Router
import "../SingleSp.css"; 
import "../../styles/ImageGame.css"; 
import { MdNotStarted } from "react-icons/md";
import { GrNext } from "react-icons/gr";
import { Shuffler } from "../../Functions/Actions/Shuffler.js";

function FindByimage() {
  // --- HOOKS DE ROUTER ---
  const { listId } = useParams(); 
  const navigate = useNavigate();

  // --- CONTEXTOS ---
  const { GetList, UserLists } = useContext(ListsContext);
  const { GetWords } = useContext(WordsContext);
  
  // --- ESTADOS ---
  const [ShowGame, setShowGame] = useState(false);
  const [Choices, setChoices] = useState([]); 
  const [Index, setIndex] = useState(0);
  const [RandomWords, setRandomWords] = useState([]);
  const [GameStatus, setGameStatus] = useState("playing"); 
  const [ErrorMessage, setErrorMessage] = useState("");
  
  // Estado local para el Select (igual que en HangedGame)
  const [selectedList, setSelectedList] = useState(""); 

  // --- EFECTO PRINCIPAL (IGUAL QUE HANGEDGAME) ---
  useEffect(() => {
    const initGame = async () => {
      // 1. Cargar listas si no existen
      let availableLists = UserLists;
      if (availableLists.length === 0) {
        availableLists = await GetList();
      }

      // 2. Lógica de URL
      if (listId) {
        const targetList = availableLists.find((l) => l.id.toString() === listId);

        if (targetList) {
          // Sincronizamos el select visualmente
          setSelectedList(targetList.id);
          
          // Iniciamos el juego si no está activo o si cambió la lista
          if (!ShowGame || RandomWords.length === 0) {
              startGame(targetList.id);
          }
        } else {
          console.warn("Lista no encontrada");
          navigate("/ImageGame"); // Volver al raíz si el ID es malo
        }
      } else {
        // Si no hay ID en URL, reseteamos a la vista de menú
        setShowGame(false);
        setRandomWords([]);
        setSelectedList("");
      }
    };

    initGame();
  }, [listId, UserLists]); 

  // --- LÓGICA DEL JUEGO ---

  const generateChoices = (currentWord, allWords) => {
    const distractors = allWords.filter(w => w.id_Word !== currentWord.id_Word);
    const shuffledDistractors = Shuffler(distractors).slice(0, 3);
    const options = [...shuffledDistractors, currentWord];
    return Shuffler(options);
  };

  // Ahora startGame recibe el ID directamente (desde el useEffect)
  const startGame = async (idToUse) => {
    setErrorMessage("");
    
    if (!idToUse) return;

    const words = await GetWords(idToUse, 'image');
    const validWords = words.filter(w => w.image && w.image.trim() !== "");

    if (validWords.length >= 4) {
      const shuffled = Shuffler(validWords);
      setRandomWords(shuffled);
      setIndex(0);
      setChoices(generateChoices(shuffled[0], shuffled));
      setGameStatus("playing");
      setShowGame(true);
    } else {
      setErrorMessage("Not enough words with images in this list (Minimum 4 required).");
      setShowGame(false);
    }
  };

  const handleAnswer = (selectedWord) => {
    const correctWord = RandomWords[Index];
    if (selectedWord.id_Word === correctWord.id_Word) {
      setGameStatus("won");
    } else {
      setGameStatus("lost");
    }
  };

  const nextLevel = () => {
    if (Index + 1 < RandomWords.length) {
      const nextIdx = Index + 1;
      setIndex(nextIdx);
      setGameStatus("playing");
      setChoices(generateChoices(RandomWords[nextIdx], RandomWords));
    } else {
        setIndex(0);
        setShowGame(false);
        navigate("/ImageGame"); // Volver al menú al terminar
        alert("Game Finished!");
    }
  };

  // --- RENDER ---
  return (
    <div className="MainBackground ImageGameContainer">
      <h1>Visual Memory</h1>
      
      {/* MENÚ DE SELECCIÓN ESTÁNDAR (IGUAL QUE HANGEDGAME) */}
      {!ShowGame && (
        <div className="StandardMenuImg">
           <div className="labelAndOption">
            {UserLists.length > 0 ? (
              <select 
                // 1. Solo actualiza estado local
                onChange={(e) => setSelectedList(e.target.value)}
                value={selectedList || ""}
              >
                <option value="" disabled>Select a list</option>
                {UserLists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.title}
                  </option>
                ))}
              </select>
            ) : (
              <p>No lists found</p>
            )}
            
            {/* 2. El botón navega (trigger) */}
            <button
              className="ActionButtoms s"
              disabled={!selectedList}
              onClick={() => {
                  if(selectedList) {
                      navigate(`/ImageGame/${selectedList}`);
                  }
              }}
            >
              <MdNotStarted />
            </button>
          </div>
        </div>
      )}

      {ErrorMessage && (
          <div style={{
              background: 'rgba(255, 71, 87, 0.2)', 
              border: '1px solid #ff4757', 
              padding: '1rem', 
              borderRadius: '10px',
              marginTop: '1rem'
          }}>
              <p style={{ color: "white" }}>{ErrorMessage}</p>
          </div>
      )}

      {/* ÁREA DE JUEGO */}
      {ShowGame && RandomWords.length > 0 && (
        <div className="GameImage">
            
            <h2>What is this?</h2>
            
            <div className="ImageContainer">
                <img 
                    src={RandomWords[Index].image} 
                    alt="Guess the word" 
                />
            </div>

            <div className={`OptionsGrid ${GameStatus !== "playing" ? "blocked" : ""}`}>
                {Choices.map((option, i) => {
                    let btnClass = "OptionButton";
                    if (GameStatus !== "playing") {
                        if (option.id_Word === RandomWords[Index].id_Word) btnClass += " correct";
                        else btnClass += " wrong";
                    }

                    return (
                        <button 
                            key={i} 
                            className={btnClass}
                            onClick={() => handleAnswer(option)}
                        >
                            {option.name}
                        </button>
                    )
                })}
            </div>

            {GameStatus !== "playing" && (
                <div className="ResultOverlay">
                    <h3 style={{color: GameStatus === "won" ? "#00ffaa" : "#ff4757"}}>
                        {GameStatus === "won" ? "Correct!" : "Oops!"}
                    </h3>
                    <p style={{color:'white', marginBottom:'10px'}}>
                        It was: <b>{RandomWords[Index].name}</b>
                    </p>
                    <button className="ActionButtoms" onClick={nextLevel}>
                        <GrNext />
                    </button>
                </div>
            )}
        </div>
      )}
    </div>
  );
}

export default FindByimage;