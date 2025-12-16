import { useState, useContext, useEffect } from "react";
import { WordsContext } from "../../../Contexts/WordsContext";
import { ListsContext } from "../../../Contexts/ListsContext";
import { MdNotStarted } from "react-icons/md";

import { Shuffler } from "../../Functions/Actions/Shuffler.js";
//import { GetData, UpdateProgress } from "../../../api/saveProgress.js";

function WSkills() {
  const { GetWords } = useContext(WordsContext);
  const { CurrentListId, setCurrentList, GetList, UserLists } =
    useContext(ListsContext);
  const [ShuffledArray, setShuffledArray] = useState([]);
  const [Status, setStatus] = useState(-1);
  const [Index, setIndex] = useState(0);
  let Text = "";

  useEffect(() => {
    console.log("hello");
    const HandlerList = async () => {
      setCurrentList(await GetList());
    };

    HandlerList();
  }, []);

  // Función para iniciar el juego
  const startGame = async () => {
    setStatus(0);
    console.log(CurrentListId);
    const Words = await GetWords(CurrentListId.id, "wskills");
    console.log(Words);
    const shuffledWords = Shuffler(Words);
    console.log(shuffledWords);
    if (shuffledWords.length > 21) {
      setShuffledArray(shuffledWords.slice(0, 21));
    }
    setStatus(1);
  };

  const Verificador = () => {
    let correct = true;
    for (let i = Index; i < Index + 3; i++) {
      Text = Text.toLowerCase();
      if (ShuffledArray[i]) {
        if (
          !(
            Text.includes(ShuffledArray[i].name.toLowerCase()) ||
            Text.includes(ShuffledArray[i].past.toLowerCase()) ||
            Text.includes(ShuffledArray[i].participle.toLowerCase()) ||
            Text.includes(ShuffledArray[i].gerund.toLowerCase())
          )
        ) {
          {
            correct = false;
            break;
          }
        }
      }
    }
    return correct;
  };
  const Continue = () => {
    if (Verificador()) {
      Text = "";
      if (ShuffledArray[Index + 3]) {
        {
          setIndex(Index + 3);
        }
      }
    }else{
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
                const newId = e.target.value; // string
                const selected = UserLists.find((l) => l.id === newId);
                setCurrentList(selected); // ahora sí es {id, title}
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
          disabled={UserLists.length == 0}
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
        {Status == 0 ? <h2>Loading...</h2> : null}
        {Status == 1 && (
          <>
            <h2>
              Write something about: {ShuffledArray[Index].name} ,
              {ShuffledArray[Index + 1] ? ShuffledArray[Index + 1].name : ""} ,
              {ShuffledArray[Index + 2] ? ShuffledArray[Index + 2].name : ""}
            </h2>
            <textarea
              name="write"
              id=""
              cols="30"
              rows="10"
              value={Text}
              onChange={(e) => (Text += e.target.value)}
            ></textarea>
            <button onClick={Continue}>Continue</button>
          </>
        )}
        {Status == 2 ? <h2>Game Over</h2> : null}
      </div>
    </div>
  );
}

export default WSkills;
