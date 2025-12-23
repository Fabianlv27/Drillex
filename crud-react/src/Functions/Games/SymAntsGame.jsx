import { useState, useContext, useEffect } from "react";
import { WordsContext } from "../../../Contexts/WordsContext";
import { ListsContext } from "../../../Contexts/ListsContext";
import "../../styles/SyN.css";
import { MdNotStarted } from "react-icons/md";
import { GrNext } from "react-icons/gr";

function SymAntsGame() {
  const { GetWords } = useContext(WordsContext);
  const { CurrentListId, setCurrentList, GetList, UserLists } = useContext(ListsContext);
  const [SynOrAnt, setSynOrAnt] = useState("Ant");
  const [MainWord, setMainWord] = useState([]);
  const [ShuffletArrayToUse, setShuffletArrayToUse] = useState([]);
  const [Choices, setChoices] = useState([]);
  const [ActualChoiceName, setActualChoiceName] = useState("");
  const [isRight, setisRight] = useState(true);
  const [ShowContent, setShowContent] = useState(true);
  const [ShowGame, setShowGame] = useState(false);
  const [Index, setIndex] = useState(0);

  useEffect(() => {
    const init = async () => setCurrentList(await GetList());
    init();
  }, []);

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
    let ReShuf = RandomArray.filter((e, index) => index !== i)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const Position = Math.floor(Math.random() * 3);
    ReShuf[Position] = RandomArray[i];
    return ReShuf;
  };

  const SoA = (temp, i) => {
    const Choise = Math.round(Math.random());
    if (Choise == 0) {
      if (temp[i].antonyms) {
        setMainWord(temp[i].antonyms);
        setSynOrAnt("Ant");
      } else {
        setMainWord(temp[i].synonyms);
        setSynOrAnt("Syn");
      }
    } else {
      if (temp[i].synonyms) {
        setMainWord(temp[i].synonyms);
        setSynOrAnt("Syn");
      } else {
        setMainWord(temp[i].antonyms);
        setSynOrAnt("Ant");
      }
    }
  };

  const startGame = async () => {
    if (!CurrentListId) return;
    const words = await GetWords(CurrentListId); // CurrentListId suele ser el ID directo o un objeto, revisa tu contexto. Si 'setCurrentList' recibe ID, aquí usas ID.
    // Asumiendo que CurrentListId es el ID string por como lo usas en el select
    
    let ListWithAnySyn = words.filter((e) => e.antonyms || e.synonyms); // Filtrar mejor
    
    if(ListWithAnySyn.length < 4) {
        alert("Not enough words with synonyms/antonyms in this list.");
        return;
    }

    const temp = Shuffler(ListWithAnySyn);
    setShuffletArrayToUse(temp);
    SoA(temp, 0);
    setActualChoiceName(temp[0].name);
    setChoices(ChoicesMaker(0, temp));
    setShowGame(true);
  };

  const Check = (nameToCheck, CorrectName) => {
    setisRight(nameToCheck == CorrectName);
    setShowContent(false);
  };

  const Next = () => {
    if (ShuffletArrayToUse[Index + 1]) {
      SoA(ShuffletArrayToUse, Index + 1);
      setChoices(ChoicesMaker(Index + 1, ShuffletArrayToUse));
      setIndex(Index + 1);
      setActualChoiceName(ShuffletArrayToUse[Index + 1].name);
      setShowContent(true);
    } else {
      setIndex(0);
      setShowContent(true);
      setShowGame(false);
    }
  };

  return (
    <div className="MainBackground SyAMenu">
      <h1>Synonyms & Antonyms</h1>

      {/* MENÚ ESTÁNDAR */}
      {!ShowGame && (
        <div className="StandardMenu">
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
                <p style={{color:'white'}}>No lists</p>
                )}
                <button
                disabled={UserLists.length === 0}
                className="ActionButtoms s"
                onClick={startGame}
                >
                <MdNotStarted />
                </button>
            </div>
        </div>
      )}

      {/* JUEGO */}
      {ShowGame ? (
        ShowContent ? (
          <div className="SyAGameMenu">
            <h2>
              <span>{SynOrAnt == "Syn" ? "Synonym" : "Antonym"} of:</span>{" "}
              <br/>"{MainWord}"
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
          <div className="LoseMenu WoLMenu">
            <h2 style={{color: isRight ? '#00ffaa' : '#ff4757'}}>
                {isRight ? "Correct!" : "Wrong!"}
            </h2>
            <p style={{color: 'white', marginBottom: '1rem'}}>
                The answer was: <span style={{color:'#00c3ff', fontWeight:'bold'}}>{ActualChoiceName}</span>
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