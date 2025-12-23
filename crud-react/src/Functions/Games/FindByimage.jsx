import { useState, useContext, useEffect } from "react";
import { ListsContext } from "../../../Contexts/ListsContext";
import { WordsContext } from "../../../Contexts/WordsContext";
import "../SingleSp.css";
import "../../styles/ImageGame.css";
import { MdNotStarted } from "react-icons/md";
import { GrNext } from "react-icons/gr";
import { Shuffler } from "../../Functions/Actions/Shuffler.js";

function FindByimage() {
  const { GetList, CurrentListId, setCurrentList, UserLists } = useContext(ListsContext);
  const { GetWords } = useContext(WordsContext);
  const [ShowGame, setShowGame] = useState(false);
  const [Choises, setChoises] = useState([]);
  const [Index, setIndex] = useState(0);
  const [Random, setRandom] = useState([]);
  const [IsCorrect, setIsCorrect] = useState(0);
  const [NoWords, setNoWords] = useState(false);

  useEffect(() => {
    const init = async () => setCurrentList(await GetList());
    init();
  }, []);

  const HandlerChoises = (TempRandom, i) => {
    let NumbersChoise = [];
    while (NumbersChoise.length < 3) {
      let RandomNum = Math.floor(Math.random() * (TempRandom.length));
      if (!NumbersChoise.includes(RandomNum) && RandomNum !== i) {
        NumbersChoise.push(RandomNum);
      }
    }
    NumbersChoise[Math.floor(Math.random() * 3)] = i; // Insert correct answer randomly
    setChoises(NumbersChoise);
  };

  const DeleteNoImage = (lista) => {
    return lista.filter(element => element.image && element.image !== "");
  };

  const startGame = async () => {
    const words = await GetWords(CurrentListId); // O CurrentListId.id según tu contexto
    const ListWithImage = DeleteNoImage(words);
    
    if (ListWithImage.length >= 4) { // Necesitas al menos 4 para tener opciones incorrectas
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
      
      {/* MENÚ ESTÁNDAR */}
      {!ShowGame && (
        <div className="StandardMenuImg">
           <div className="labelAndOption" style={{display:'flex', gap:'15px', alignItems:'center'}}>
            {UserLists.length > 0 ? (
              <select onChange={(e) => setCurrentList(e.target.value)}>
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
              className="ActionButtoms s"
              disabled={UserLists.length == 0}
              onClick={startGame}
            >
              <MdNotStarted />
            </button>
          </div>
        </div>
      )}

      {NoWords && <p style={{ color: "white", marginTop: "2rem" }}>Not enough words with images (need 4+).</p>}

      {/* JUEGO */}
      {ShowGame && Random.length > 0 && (
        <div className="GameImage">
            <div className={`${IsCorrect !== 0 ? "blocked" : ""}`} style={{width:'100%'}}>
              <h2>What is it?</h2>
              {Random[Index] && <img src={Random[Index].image} alt="Guess this" />}
              <div className="OptionsContainer">
                {Choises.map((c, i) => (
                  <button onClick={() => Check(Random[c].name)} key={i}>
                    {Random[c].name}
                  </button>
                ))}
              </div>
            </div>

            {IsCorrect !== 0 && (
              <div className="LoseMenu" style={{marginTop:'20px'}}>
                <h2 style={{color: IsCorrect === 2 ? '#00ffaa' : '#ff4757'}}>
                    {IsCorrect === 2 ? "Correct!" : "Wrong!"}
                </h2>
                <p style={{color:'white'}}>Answer: {Random[Index].name}</p>
                <button className="ActionButtoms" onClick={Next}>
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