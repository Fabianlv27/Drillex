import { useState, useContext, useEffect } from "react";
import { WordsContext } from "../../../Contexts/WordsContext";
import { ListsContext } from "../../../Contexts/ListsContext";
import "../../styles/SyN.css";
import { MdNotStarted } from "react-icons/md";
import { GrNext } from "react-icons/gr";
function SymAntsGame() {
  const { GetWords } = useContext(WordsContext);
  const { CurrentListId, setCurrentList, GetList, UserLists } =
    useContext(ListsContext);
  const [SynOrAnt, setSynOrAnt] = useState("Ant");
  const [MainWord, setMainWord] = useState([]);
  const [ShuffletArrayToUse, setShuffletArrayToUse] = useState([]);
  const [Choices, setChoices] = useState([]);
  const [ActualChoiceName, setActualChoiceName] = useState("");
  const [isRight, setisRight] = useState(true);
  const [ShowContent, setShowContent] = useState(true);
  const [ShowGame, setShowGame] = useState(false);

  const [Index, setIndex] = useState(0);
  const HandlerLists = async () => {
    setCurrentList(await GetList());
  };
  useEffect(() => {
    HandlerLists();
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
    console.log(RandomArray[i]);
    console.log(RandomArray.filter((e, index) => index !== i));
    let ReShuf = RandomArray.filter((e, index) => index !== i)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    console.log(ReShuf);
    const Position = Math.floor(Math.random() * 3);
    ReShuf[Position] = RandomArray[i];
    console.log(ReShuf);
    //RandomArray[i]
    return ReShuf;
  };
  const SoA = (temp, i) => {
    console.log(temp[i]);
    const Choise = Math.round(Math.random());
    console.log(Choise);

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
    const words = await GetWords(CurrentListId.id);
    let ListWithAnySyn = words.filter((e) => e.antonyms);

    // console.log(Choise);
    console.log(ListWithAnySyn);

    const temp = Shuffler(ListWithAnySyn);
    console.log(temp);
    setShuffletArrayToUse(temp);

    SoA(temp, 0);
    console.log(temp[0].name);
    setActualChoiceName(temp[0].name);
    setChoices(ChoicesMaker(0, temp));
    setShowGame(true);
  };
  const Check = (nameToCheck, CorrectName) => {
    if (nameToCheck == CorrectName) {
      setisRight(true);
    } else {
      setisRight(false);
    }
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
      ShowContent(true);
      setShowGame(false);
    }
  };
  return (
    <div className="MainBackground SyAMenu">
      <h1>Synonyms and Antonyms Game</h1>
      {UserLists.length > 0 ? (
        <div className="littleMainBackground ">
          {!ShowGame ? (
            <>
              <div className="labelAndOption">
                {UserLists.length > 0 ? (
                  <select>
                    {UserLists.map((list, index) => (
                      <option
                        key={index}
                        onClick={() => setCurrentList(list.id)}
                      >
                        {list.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p>You dont have list yet</p>
                )}
              </div>

              <button
                disabled={UserLists.length == 0}
                className="ActionButtoms s"
                onClick={startGame}
              >
                <MdNotStarted />
              </button>
            </>
          ) : null}
        </div>
      ) : (
        <p>You dont have lists yet</p>
      )}
      <div></div>
      {ShowGame ? (
        ShowContent ? (
          <div className="SyAGameMenu">
            <h2>
              <span>{SynOrAnt == "Syn" ? "Synonyms" : "Antonyms"}:</span>{" "}
              {MainWord}
            </h2>
            <div className="options">
              {Choices.map((e, i) => {
                return (
                  <button
                    onClick={() => Check(e.name, ActualChoiceName)}
                    key={i}
                  >
                    {e.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="LoseMenu WoLMenu">
            <h2>{isRight ? "You Win" : "You Lose"}</h2>
            <p>The Correct Word is : {ActualChoiceName}</p>
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
