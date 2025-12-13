import { useState, useContext, useEffect } from "react";
import { ListsContext } from "../../../Contexts/ListsContext";
import { WordsContext } from "../../../Contexts/WordsContext";
import "../SingleSp.css";
import "../../styles/ImageGame.css";
import { MdNotStarted } from "react-icons/md";
import { GrNext } from "react-icons/gr";
import {Shuffler} from "../../Functions/Actions/Shuffler.js";
function FindByimage() {
  const { GetList, CurrentListId, setCurrentList, UserLists } =
    useContext(ListsContext);
  const { GetWords } = useContext(WordsContext);
  const [ShowGame, setShowGame] = useState(false);
  const [Choises, setChoises] = useState([]);
  const [Index, setIndex] = useState(0);
  const [Random, setRandom] = useState([]);
  const [IsCorrect, setIsCorrect] = useState(0);
  const [NoWords, setNoWords] = useState(false);
  //30005
  const HandlerLists = async () => {
    setCurrentList(await GetList());
  };

  useEffect(() => {
    HandlerLists();
  }, []);

  const HandlerChoises = (TempRandom, i) => {
    let NumbersChoise = [];
    console.log(TempRandom);

    while (NumbersChoise.length < 3) {
      let RandomNum = Math.floor(Math.random() * (TempRandom.length - 1 + 1));

      if (!NumbersChoise.includes(RandomNum) && RandomNum !== i) {
        NumbersChoise = [...NumbersChoise, RandomNum];
      }
    }

    NumbersChoise[Math.floor(Math.random() * (2 + 1))] = i;

    console.log(NumbersChoise);
    setChoises(NumbersChoise);
    NumbersChoise = [];
  };
  const DeleteNoImage = (lista) => {
    let TempList = [];
    lista.forEach((element) => {
      if (element.image !== "") {
        TempList = [...TempList, element];
      }
    });
    return TempList;
  };
  const startGame = async () => {
    const words = await GetWords(CurrentListId.id);
    const ListWithImage = DeleteNoImage(words);
    console.log(ListWithImage);
    if (ListWithImage.length > 0) {
      const TempSh = Shuffler(ListWithImage);
      setRandom(TempSh);
      HandlerChoises(TempSh, 0);
      setShowGame(true);
      setNoWords(false);
    } else {
      setNoWords(true);
    }
  };
  const Check = (nameToTest) => {
    if (nameToTest == Random[Index].name) {
      setIsCorrect(2);
    } else {
      setIsCorrect(1);
    }
  };
  const Next = () => {
    if (Random[Index + 1]) {
      setChoises([]);

      setIsCorrect(0);

      HandlerChoises(Random, Index + 1);
      setIndex(Index + 1);
    } else {
      setIndex(0);
      setShowGame(false);
    }
  };

  return (
    <div className="FindBImage MainBackground">
      <h1>Image Game</h1>
      <div className="LittleMainBackground">
        {!ShowGame ? (
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
            <button
              className="ActionButtoms s"
              disabled={UserLists.length == 0}
              onClick={startGame}
            >
              <MdNotStarted />
            </button>
          </div>
        ) : null}
      </div>
      {NoWords ? (
        <p style={{ color: "white", marginTop: "2rem" }}>
          You dont have enough words in this Lists
        </p>
      ) : null}
      <div className="GameImage">
        {ShowGame && Random ? (
          <>
            <div className={`${IsCorrect !== 0 ? "blocked" : ""}`}>
              <h2>What is it?</h2>
              <img src={Random[Index].image} alt="" />
              <div>
                {Choises.map((c, i) => (
                  <button onClick={() => Check(Random[c].name)} key={i}>
                    {Random[c].name}
                  </button>
                ))}
              </div>
            </div>

            {IsCorrect === 1 ? (
              <div className="LoseMenu WoLMenu">
                <h2>You Lose </h2>
                <p>The Correct Answer is.. {Random[Index].name} </p>
                <button className="ActionButtoms" onClick={Next}>
                  <GrNext />
                </button>
              </div>
            ) : null}

            {IsCorrect === 2 ? (
              <div className="LoseMenu WoLMenu">
                <h2>You Won ! </h2>
                <p>The Correct Answer is.. {Random[Index].name} </p>
                <button className="ActionButtoms" onClick={Next}>
                  <GrNext />
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

export default FindByimage;
