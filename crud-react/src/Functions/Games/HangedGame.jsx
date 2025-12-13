import { useState, useContext, useEffect,useCallback } from "react";
import { ListsContext } from "../../../Contexts/ListsContext";
import { WordsContext } from "../../../Contexts/WordsContext";
import "../SingleSp.css";
import "../../styles/HangedGame.css";
import { MdNotStarted } from "react-icons/md";
import { GrLinkNext } from "react-icons/gr";
import { Shuffler } from "../../Functions/Actions/Shuffler.js";
import {
  GetData,
  UpdateProgress,
  PostProgress,
} from "../../../api/saveProgress.js";
  import { useLocation } from "react-router-dom";


function HangedGame() {
  const location = useLocation();
  const { GetList, CurrentListId, setCurrentList, UserLists } =
    useContext(ListsContext);
  const { GetWords } = useContext(WordsContext);
  const [ShuffletArrayToUse, setShuffletArrayToUse] = useState([]);
  const [ShowGame, setShowGame] = useState(false);
  const [index, setindex] = useState(0);
  const [ToyIndex, setToyIndex] = useState(0);
  const [MainWord, setMainWord] = useState("");
  const [SeparedWord, setSeparedWord] = useState([]);
  const [leghtMain, setleghtMain] = useState(0);
  const [Right, setRight] = useState([]);
  const [isProgress, setisProgress] = useState(false);
  const [Alphabet, setAlphabet] = useState([
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ]);
  const [FoundLetters, setFoundLetters] = useState([]);

  
  const HandlerLists = async () => {
    setCurrentList(await GetList());
  };

 

  const ProgressVerifier = async () => {
    const data = await GetData(CurrentListId.id, "hanged");
    if (data.cant == null) {
      console.log("no hay")
      setisProgress(false);
    } else {
      console.log("si hay")
      setisProgress(true);
    }
    return data;
  };

  const handlerProgress= async()=>{
  const pending = localStorage.getItem("pendingProgress");
  if (pending) {
    const data = JSON.parse(pending);
    await UpdateProgress(data);
    localStorage.removeItem("pendingProgress");
    setRight([])
  }
}

  useEffect(() => {
    HandlerLists();
    handlerProgress()
  }, []);

  


  useEffect(() => {
    // Cada vez que cambias de ruta, guarda progreso
    // También puedes loguear
    console.log("Ruta cambió:", location.pathname);

  }, [location]); // se ejecuta cada vez que cambie la ruta


  const startGame = async () => {
    const words = await GetWords(CurrentListId.id,'hanged');
    console.log(words);
    const temp = Shuffler(words);
    ProgressVerifier();
    setShuffletArrayToUse(temp);
    setMainWord(temp[0].name);
    setShowGame(true);
  };

  const establecedorIndex = () => {
    setMainWord(ShuffletArrayToUse[index].name);
  };
  useEffect(() => {
    if (ShuffletArrayToUse.length > 0) {
      establecedorIndex();
    }
     localStorage.setItem("pendingProgress", JSON.stringify({
  idList: CurrentListId.id,
  game: "hanged",
  cant: index + 1,
  right: Right,
}))
  }, [index]);

  const Spliter = (w) => {
    w=quitarTildes(w)
    console.log(w.replace(/ /g, "|"));
    const first = w.replace(/ /g, "|").toUpperCase().split("");
    console.log(first);
    setSeparedWord(first);

    let ActualLenght = first.length;
    for (let index = 0; index < first.length; index++) {
      if (first[index] == "|") {
        ActualLenght = ActualLenght - 1;
      }
    }
    setleghtMain(ActualLenght);
  };
  useEffect(() => {
    if (MainWord) {
      Spliter(MainWord);
    }
  }, [MainWord]);

  const Check = (letra) => {
    console.log(SeparedWord);
    var count = 0;
    // var letters=[]
    if (SeparedWord.includes(letra)) {
      SeparedWord.map((w) => {
        if (w == letra) {
          count++;
        }
      });

      setleghtMain(leghtMain - (count - 1));
      setFoundLetters([...FoundLetters, letra]);
      console.log(FoundLetters);
      count = 0;
    } else {
      setToyIndex(ToyIndex + 1);
      console.log(FoundLetters);
    }
    const newArray = Alphabet.filter((item) => item !== letra);
    setAlphabet(newArray);
  };
function quitarTildes(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
  const HideWord = ({ SingleExample, Part, past, gerund, idx }) => {
    console.log(SeparedWord);
    var CriptoExampleBeta = SingleExample;
    console.log(
      MainWord.charAt(0).toUpperCase() + MainWord.slice(1).toLowerCase()
    );
    if (Part) {
      CriptoExampleBeta = CriptoExampleBeta.replace(
        Part,
        "______ (Participle)"
      );
      CriptoExampleBeta = CriptoExampleBeta.replace(
        Part.toLowerCase(),
        "______ (Participle)"
      );
    }
    if (past) {
      CriptoExampleBeta = CriptoExampleBeta.replace(
        past.toLowerCase(),
        "______ (Past Tense)"
      );
      CriptoExampleBeta = CriptoExampleBeta.replace(
        past,
        "_______(Past Tense)"
      );
    }
    if (gerund) {
      CriptoExampleBeta = CriptoExampleBeta.replace(
        gerund.toLowerCase(),
        "______ (ing)"
      );
      CriptoExampleBeta = CriptoExampleBeta.replace(gerund, "______ ing");
    }
    if (MainWord) {
      CriptoExampleBeta = CriptoExampleBeta.replace(MainWord, "______");
      CriptoExampleBeta = CriptoExampleBeta.replace(
        MainWord.charAt(0).toUpperCase() + MainWord.slice(1).toLowerCase(),
        "______"
      );
    }

    return (
      <>
        {CriptoExampleBeta.includes("_____") ? (
          <li key={idx}>{CriptoExampleBeta} </li>
        ) : null}
      </>
    );
  };
  const Continue = () => {
    if (ToyIndex !== 6 && Alphabet.length < 26 && leghtMain === FoundLetters.length) {
      console.log(ShuffletArrayToUse[index].id_Word)
      setRight([...Right, ShuffletArrayToUse[index].id_Word]);
      if (index%5==0) {
        handlerProgress()
      }
    }
    if (ShuffletArrayToUse[index + 1]) {
      setFoundLetters([]);
      setAlphabet([
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
      ]);
      setindex(index + 1);
      setToyIndex(0);
    } else {
      setShowGame(false);
    }
  };
  return (
    <div className="HangedMainContainer MainBackground">
      <h1>Hanged Game</h1>
      <div>
        {!ShowGame ? (
          <div className="littleMainBackground hangedMenu">
            <div className="labelAndOption">
              {UserLists.length > 0 ? (
                <select onChange={(e) => setCurrentList(e.target.value)}>
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
              disabled={UserLists.length == 0}
              className="ActionButtoms s"
              onClick={() => startGame()}
            >
              <MdNotStarted />
            </button>
          </div>
        ) : null}
      </div>
      {ShowGame ? (
        <div className="GameHandMenu">
          {SeparedWord.length > 0 ? (
            <div className="ghm">
              <img
                src={`Toy/${ToyIndex}.png`}
                style={{ backgroundColor: "powderblue" }}
              />
              <div className={`${ToyIndex === 6 ? "blocked" : ""}`}>
                <h2>Meaning</h2>
                <p>{ShuffletArrayToUse[index].meaning}</p>
                <ul>
                  {ShuffletArrayToUse[index].example.map((e, i) => (
                    <>
                      <HideWord
                        SingleExample={e}
                        Part={ShuffletArrayToUse[index].participle}
                        past={ShuffletArrayToUse[index].past}
                        gerund={ShuffletArrayToUse[index].gerund}
                        idx={i}
                      />
                    </>
                  ))}
                </ul>
              </div>
              <div className="inputsAndText hand">
                {SeparedWord.map((e, i) =>
                  FoundLetters.includes(e) || e == "|" ? (
                    <div
                      className={`${e == "|" ? "Space" : "SingleLetterToFind"}`}
                    >
                      {e}
                    </div>
                  ) : (
                    <>
                      <div key={i} className="SingleLetterToFind"></div>
                    </>
                  )
                )}
              </div>
            </div>
          ) : null}
          <div className="Alphabet">
            {Alphabet.map((e, i) => (
              <button
                onClick={() => Check(e)}
                disabled={leghtMain === FoundLetters.length || ToyIndex === 6}
                key={i}
              >
                {e}
              </button>
            ))}
          </div>
          {ToyIndex === 6 ? (
            <div className="LoseMenu">
              <h2>You Lose </h2>
              <p>
                The word is <span>{MainWord}</span>
              </p>
              <button className="ActionButtoms" onClick={Continue}>
                <GrLinkNext />
              </button>
            </div>
          ) : null}
          {leghtMain === FoundLetters.length ? (
            <div className="LoseMenu">
              <p>
                {" "}
                <span>You Found The word</span>
              </p>
              <button
                className="ActionButtoms"
                onClick={() => {
                  Continue();
                }}
              >
                <GrLinkNext />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default HangedGame;
