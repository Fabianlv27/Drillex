import { useState, useContext, useEffect } from "react";
import { WordsContext } from "../../../Contexts/WordsContext";
import { ListsContext } from "../../../Contexts/ListsContext";
import { useParams, useNavigate } from "react-router-dom"; // <--- Hooks de Router
import "../../styles/SyN.css";
import { MdNotStarted } from "react-icons/md";
import { GrNext } from "react-icons/gr";

function SymAntsGame() {
  // 1. Router Hooks
  const { listId } = useParams();
  const navigate = useNavigate();

  // 2. Contexts
  const { GetWords } = useContext(WordsContext);
  const { GetList, UserLists } = useContext(ListsContext);

  // 3. States
  const [SynOrAnt, setSynOrAnt] = useState("Ant");
  const [MainWord, setMainWord] = useState([]);
  const [ShuffletArrayToUse, setShuffletArrayToUse] = useState([]);
  const [Choices, setChoices] = useState([]);
  const [ActualChoiceName, setActualChoiceName] = useState("");
  const [isRight, setisRight] = useState(true);
  const [ShowContent, setShowContent] = useState(true);
  const [ShowGame, setShowGame] = useState(false);
  const [Index, setIndex] = useState(0);

  // Estado local para el Select
  const [selectedList, setSelectedList] = useState("");

  // --- EFECTO DE INICIALIZACIÓN (IGUAL QUE HANGEDGAME) ---
  useEffect(() => {
    const initGame = async () => {
      let availableLists = UserLists;
      if (availableLists.length === 0) {
        availableLists = await GetList();
      }

      if (listId) {
        const targetList = availableLists.find((l) => l.id.toString() === listId);

        if (targetList) {
          setSelectedList(targetList.id);
          // Iniciar solo si no está jugando ya
          if (!ShowGame || ShuffletArrayToUse.length === 0) {
            startGame(targetList.id);
          }
        } else {
          console.warn("Lista no encontrada");
          navigate("/SynAnts"); // Volver al menú
        }
      } else {
        setShowGame(false);
        setShuffletArrayToUse([]);
        setSelectedList("");
      }
    };

    initGame();
  }, [listId, UserLists]);


  // --- LÓGICA DEL JUEGO ---

  const Shuffler = (Array) => {
    const Shuffled = [...Array];
    for (let i = Shuffled.length - 1; i > 0; i--) {
      let RandomNum = Math.floor(Math.random() * (i + 1));
      let temp = Shuffled[i];
      Shuffled[i] = Shuffled[RandomNum];
      Shuffled[RandomNum] = temp;
    }
    return Shuffled;
  };

  const ChoicesMaker = (i, RandomArray) => {
    // Evita error si el array es muy pequeño
    if(RandomArray.length < 4) return [];
    
    let ReShuf = RandomArray.filter((e, index) => index !== i)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    // Asegurarnos de tener 3 distractores
    while(ReShuf.length < 3 && RandomArray.length >= 4) {
         // Fallback simple si el filtro falla
         ReShuf.push(RandomArray[(i+1) % RandomArray.length]);
    }

    const Position = Math.floor(Math.random() * 3);
    // Insertamos la correcta (cuidado si ReShuf tiene menos de 3)
    if(ReShuf.length >= Position) {
        ReShuf[Position] = RandomArray[i];
    } else {
        ReShuf.push(RandomArray[i]);
    }
    
    return ReShuf;
  };

  const SoA = (temp, i) => {
    if(!temp[i]) return;

    // Decidir si preguntamos Sinónimo o Antónimo
    // Solo preguntamos si la palabra tiene datos para ello
    const hasSyn = temp[i].synonyms && temp[i].synonyms.length > 0;
    const hasAnt = temp[i].antonyms && temp[i].antonyms.length > 0;

    let Choise = 0; // 0 = Antonym, 1 = Synonym
    
    if (hasSyn && hasAnt) {
        Choise = Math.round(Math.random());
    } else if (hasSyn) {
        Choise = 1;
    } else {
        Choise = 0;
    }

    if (Choise === 0) {
        // Antonym Logic
        setMainWord(temp[i].antonyms); // Mostramos el antónimo, buscamos la palabra original (o viceversa según tu lógica original)
        // Nota: Tu lógica original mostraba el array de antónimos en pantalla y pedía seleccionar la palabra "Name".
        setSynOrAnt("Ant");
    } else {
        // Synonym Logic
        setMainWord(temp[i].synonyms);
        setSynOrAnt("Syn");
    }
  };

  const startGame = async (idToUse) => {
    if (!idToUse) return;
    
    // 'synonyms' es el gameType para backend, asumiendo que trae todo
    const words = await GetWords(idToUse, 'synonyms'); 
    
    // Filtramos palabras que tengan AL MENOS uno de los dos
    let ListWithAnySyn = words.filter((e) => (e.antonyms && e.antonyms.length > 0) || (e.synonyms && e.synonyms.length > 0)); 
    
    if(ListWithAnySyn.length < 4) {
        alert("Not enough words with synonyms/antonyms in this list (Need 4+).");
        navigate("/SynAnts");
        return;
    }

    const temp = Shuffler(ListWithAnySyn);
    setShuffletArrayToUse(temp);
    
    // Config inicial
    setIndex(0);
    SoA(temp, 0);
    setActualChoiceName(temp[0].name);
    setChoices(ChoicesMaker(0, temp));
    setShowGame(true);
    setShowContent(true);
  };

  const Check = (nameToCheck, CorrectName) => {
    setisRight(nameToCheck == CorrectName);
    setShowContent(false);
  };

  const Next = () => {
    if (ShuffletArrayToUse[Index + 1]) {
      const nextIdx = Index + 1;
      setIndex(nextIdx);
      
      SoA(ShuffletArrayToUse, nextIdx);
      setChoices(ChoicesMaker(nextIdx, ShuffletArrayToUse));
      setActualChoiceName(ShuffletArrayToUse[nextIdx].name);
      setShowContent(true);
    } else {
      setIndex(0);
      setShowContent(true);
      setShowGame(false);
      navigate("/SynAnts");
      alert("Game Finished!");
    }
  };

  // --- RENDER ---
  return (
    <div className="MainBackground SyAMenu">
      <h1>Synonyms & Antonyms</h1>

      {/* MENÚ ESTÁNDAR */}
      {!ShowGame && (
        <div className="StandardMenuSyn">
            <div className="labelAndOption">
                {UserLists.length > 0 ? (
                <select 
                    onChange={(e) => setSelectedList(e.target.value)}
                    value={selectedList || ""}
                >
                    <option value="" disabled>Select a list</option>
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
                    disabled={!selectedList}
                    className="ActionButtoms s"
                    onClick={() => {
                        if(selectedList) navigate(`/SynAntGame/${selectedList}`);
                    }}
                >
                <MdNotStarted />
                </button>
            </div>
        </div>
      )}

      {/* JUEGO */}
      {ShowGame && ShuffletArrayToUse.length > 0 ? (
        ShowContent ? (
          <div className="SyAGameMenu">
            <h2>
              <span>Find the {SynOrAnt == "Syn" ? "Synonym" : "Antonym"} of:</span>{" "}
              <br/>
              {/* MainWord suele ser un string con comas o array, lo mostramos limpio */}
              <em style={{color:'white', fontStyle:'normal', fontSize:'1.2em', display:'block', marginTop:'10px'}}>
                "{MainWord}"
              </em>
              <br/>
              <span style={{fontSize:'0.8em', color:'#aaa'}}>(Select the matching word)</span>
            </h2>
            
            <div className="options">
              {Choices.map((e, i) => (
                <button onClick={() => Check(e.name, ActualChoiceName)} key={i}>
                  {e.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="WoLMenu">
            <h2 style={{color: isRight ? '#00ffaa' : '#ff4757'}}>
                {isRight ? "Correct!" : "Wrong!"}
            </h2>
            <p style={{color: 'white', marginBottom: '1rem', fontSize:'1.2rem'}}>
                The correct word was: <br/>
                <span style={{color:'#00c3ff', fontWeight:'bold', fontSize:'1.5rem'}}>
                    {ActualChoiceName}
                </span>
            </p>
            <button className="ActionButtoms" onClick={Next}>
              <GrNext />
            </button>
          </div>
        )
      ) : null}
    </div>
  );
}

export default SymAntsGame;