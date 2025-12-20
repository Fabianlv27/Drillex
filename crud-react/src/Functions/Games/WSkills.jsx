import { useState, useContext, useEffect } from "react";
import { WordsContext } from "../../../Contexts/WordsContext";
import { ListsContext } from "../../../Contexts/ListsContext";
import { MdNotStarted } from "react-icons/md";
import { FaLocationArrow } from "react-icons/fa";
import { Shuffler } from "../../Functions/Actions/Shuffler.js";

function WSkills() {
  const { GetWords } = useContext(WordsContext);
  const { CurrentListId, setCurrentList, GetList, UserLists } = useContext(ListsContext);
  const [ShuffledArray, setShuffledArray] = useState([]);
  const [Status, setStatus] = useState(-1);
  const [Index, setIndex] = useState(0);
  
  // CORRECCIÓN 1: Usar useState para el texto
  const [Text, setText] = useState(""); 

  useEffect(() => {
    const HandlerList = async () => {
      setCurrentList(await GetList());
    };
    HandlerList();
  }, []);

  const startGame = async () => {
    setStatus(0);
    const Words = await GetWords(CurrentListId.id, "wskills");
    const shuffledWords = Shuffler(Words);
    if (shuffledWords.length > 21) {
      setShuffledArray(shuffledWords.slice(0, 21));
    }
    setStatus(1);
  };

  const Verificador = () => {
    let correct = true;
    // CORRECCIÓN 2: No modificar el estado directamente, usar una variable temporal
    const textToCheck = Text.toLowerCase(); 

    for (let i = Index; i < Index + 3; i++) {
      if (ShuffledArray[i]) {
        if (
          !(
            textToCheck.includes(ShuffledArray[i].name.toLowerCase()) ||
            textToCheck.includes(ShuffledArray[i].past.toLowerCase()) ||
            textToCheck.includes(ShuffledArray[i].participle.toLowerCase()) ||
            textToCheck.includes(ShuffledArray[i].gerund.toLowerCase())
          )
        ) {
            correct = false;
            break;
        }
      }
    }
    return correct;
  };

  const Continue = () => {
    if (Verificador()) {
      // CORRECCIÓN 3: Usar setText para limpiar el campo
      setText(""); 
      if (ShuffledArray[Index + 3]) {
        setIndex(Index + 3);
      } else {
          // Opcional: Manejar fin del juego si no hay más palabras
          setStatus(2); 
      }
    } else {
      alert("You missed some words, try again!");
    }
  };

  return (
    <div className="littleMainBackground rand">
      <h1 className="m">WSkills</h1>
      <div className="ListAndStartMenu ">
        <div className="labelAndOption">
          {UserLists.length > 0 ? (
            <select
              onChange={(e) => {
                const newId = e.target.value;
                const selected = UserLists.find((l) => l.id === newId);
                setCurrentList(selected);
              }}
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
      <div>
        {Status === 0 ? <h2>Loading...</h2> : null}
        {Status === 1 && (
          <div style={{ marginTop: "2rem", backgroundColor: "#00ffff0d", borderRadius: "10px", padding: "1rem" }}>
            <h2 style={{ margin: "1rem" }}>Write something about</h2>
            <p style={{ fontSize: "20px", fontWeight: "bold", color: "whitesmoke", marginBottom: "1rem" }}>
              {ShuffledArray[Index].name} ,
              {ShuffledArray[Index + 1] ? ShuffledArray[Index + 1].name : ""} ,
              {ShuffledArray[Index + 2] ? ShuffledArray[Index + 2].name : ""}
            </p>
            <textarea
              name="write"
              id=""
              cols="30"
              rows="10"
              value={Text}
              // CORRECCIÓN 4: Actualizar el estado con setText
              onChange={(e) => setText(e.target.value)} 
            ></textarea>
            <button className="ActionButtoms" onClick={Continue}>
              <FaLocationArrow />
            </button>
          </div>
        )}
        {Status === 2 ? <h2>Game Over</h2> : null}
      </div>
    </div>
  );
}

export default WSkills;