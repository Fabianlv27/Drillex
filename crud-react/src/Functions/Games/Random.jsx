import { useState, useContext, useEffect } from "react";
import { WordsContext } from "../../../Contexts/WordsContext";
import { ListsContext } from "../../../Contexts/ListsContext";
import { useParams, useNavigate } from "react-router-dom"; 
import RandomItem from "../secondary menus/RandomItem";
import { MdNotStarted } from "react-icons/md";
import { Shuffler } from "../../Functions/Actions/Shuffler.js";
import { UpdateProgress } from "../../../api/saveProgress.js";
import "../../styles/Random.css"; // Asegúrate de importar el CSS actualizado

function Random() {
  const { listId } = useParams(); 
  const navigate = useNavigate();

  const { GetWords } = useContext(WordsContext);
  const { GetList, UserLists } = useContext(ListsContext);

  const [ShuffledArray, setShuffledArray] = useState([]);
  const [Index, setIndex] = useState(0);
  const [ShowRandom, setShowRandom] = useState(false);
  const [Difficulty, setDifficulty] = useState({ easy: [], normal: [], hard: [], ultrahard: [] });
  
  // Estado local para el SELECT
  const [selectedList, setSelectedList] = useState("");
  const [loadingLists, setLoadingLists] = useState(true);

  // Estados del Juego
  const [Lap, setLap] = useState(1);
  const [Face, setFace] = useState(1);
  const [ShowElement, setShowElement] = useState(true);

  // --- 1. CARGA INICIAL ---
  useEffect(() => {
    const initGame = async () => {
      let availableLists = UserLists;
      
      if (availableLists.length === 0) {
        setLoadingLists(true);
        availableLists = await GetList();
        setLoadingLists(false);
      } else {
        setLoadingLists(false);
      }

      if (listId) {
        const targetList = availableLists.find((l) => l.id.toString() === listId);
        if (targetList) {
          setSelectedList(targetList.id);
          prepareGame(targetList.id);
        } else {
          console.warn("Lista de URL no encontrada");
          navigate("/Random"); 
        }
      } else {
        setShowRandom(false);
        setShuffledArray([]);
        setSelectedList("");
      }
    };

    initGame();
  }, [listId, UserLists]); 

  // --- 2. PREPARAR JUEGO ---
  const prepareGame = async (targetId) => {
    const Words = await GetWords(targetId, 'random');
    
    if (!Words || Words.length === 0) {
        alert("No words available for Random mode in this list.");
        navigate("/Random");
        return;
    }

    const shuffledWords = Shuffler(Words);
    
    setShuffledArray(shuffledWords);
    setIndex(0);
    setLap(1);
    setFace(1);
    setDifficulty({ easy: [], normal: [], hard: [], ultrahard: [] });
    setShowElement(true);
    setShowRandom(true);
    
    ProgressVerifier(targetId);
  };

  // --- 3. PROGRESO ---
  const handlerProgress = async () => {
    const pending = localStorage.getItem("pendingProgress");
    if (pending) {
      const data = JSON.parse(pending);
      if (data.idList && data.idList !== "") {
          await UpdateProgress(data);
      }
    }
  };

  const ProgressVerifier = (id) => {
     const isProgress = localStorage.getItem("Random_" + id);
     if (!isProgress) localStorage.setItem("Random_" + id, "True");
  };

  useEffect(() => {
    if (listId && ShowRandom) {
      localStorage.setItem("pendingProgress", JSON.stringify({
        idList: listId,
        game: "random",
        cant: Index + 1,
        difficulty: Difficulty,
      }));
    }
  }, [Index, Difficulty]);

  // --- 4. LÓGICA DE JUEGO ---
  const Discriminator = (item, lap) => {
    switch (lap) {
      case 3:
        if (Difficulty.ultrahard.includes(item) || Difficulty.hard.includes(item) || Difficulty.normal.includes(item)) {
          setShowElement(true);
        } else {
          Next("easy", item, 0, 3);
        }
        break;
      case 4:
        if (Difficulty.ultrahard.includes(item) || Difficulty.hard.includes(item)) {
          setShowElement(true);
        } else {
          Next("easy", item, 0, 4);
        }
        break;
      case 5:
        if (Difficulty.ultrahard.includes(item)) {
          setShowElement(true);
        } else {
          Next("easy", item, 0, 5);
        }
        break;
      default: break;
    }
  };

  const Next = (TypeLevel, elemento, i, l) => {
    if (Index > 0 && Index % 5 === 0) handlerProgress();
    setFace(1);
    
    let nextIndex = i + 1;
    let nextLap = l;
    
    if (!ShuffledArray[nextIndex]) {
        nextIndex = 0;
        nextLap = l + 1;
        
        if (nextLap === 3) { setShowElement(false); Discriminator(ShuffledArray[0], 3); return; }
        if (nextLap === 4) { setShowElement(false); Discriminator(ShuffledArray[0], 4); return; }
        if (nextLap === 5) { setShowElement(false); Discriminator(ShuffledArray[0], 5); return; }
        if (nextLap > 5) {
            handlerProgress();
            setIndex(0);
            setShowRandom(false);
            navigate("/Random");
            alert("Great! Session Finished.");
            return;
        }
    }

    if (nextLap >= 3) {
        setShowElement(false);
        const nextItem = ShuffledArray[nextIndex];
        const isPending = 
            (nextLap === 3 && (Difficulty.ultrahard.includes(nextItem) || Difficulty.hard.includes(nextItem) || Difficulty.normal.includes(nextItem))) ||
            (nextLap === 4 && (Difficulty.ultrahard.includes(nextItem) || Difficulty.hard.includes(nextItem))) ||
            (nextLap === 5 && (Difficulty.ultrahard.includes(nextItem)));

        if (isPending) {
            setIndex(nextIndex);
            setLap(nextLap);
            setShowElement(true);
        } else {
            Next("", nextItem, nextIndex, nextLap);
            if(TypeLevel) RemoveAndAdd(TypeLevel, elemento); 
            return; 
        }
    } else {
        setIndex(nextIndex);
        setLap(nextLap);
    }
    
    if(TypeLevel) RemoveAndAdd(TypeLevel, elemento);
  };

  function RemoveAndAdd(TypeLevel, elemento) {
    const updated = { ...Difficulty };
    for (const key in updated) {
      updated[key] = updated[key].filter((e) => e !== elemento);
    }
    updated[TypeLevel] = [...updated[TypeLevel], elemento];
    setDifficulty(updated);
  }

  // --- RENDER ---
  return (
    <div className="MainBackground RandomContainer">
      <h1>Random Repetition</h1>
      
      {!ShowRandom && (
        <div className="StandardMenuRandom">
            <div className="labelAndOptionR">
            {loadingLists ? (
               <p style={{color:'white'}}>Loading lists...</p>
            ) : UserLists.length > 0 ? (
                <select
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
                <p>You don't have lists yet</p>
            )}
            
            <button
            className="ActionButtoms"
            disabled={!selectedList}
            onClick={() => {
                if(selectedList) {
                    navigate(`/Random/${selectedList}`);
                }
            }}
            >
            <MdNotStarted />
            </button>
            </div>
        </div>
      )}

      {ShowRandom ? (
        <RandomItem
          ShuffledArray={ShuffledArray}
          ShowElement={ShowElement}
          Index={Index}
          Next={Next}
          Face={Face}
          setFace={setFace}
          lap={Lap}
        />
      ) : null}
    </div>
  );
}

export default Random;