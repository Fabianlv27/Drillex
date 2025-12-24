import { useContext, useEffect, useState } from "react";
import { ListsContext } from "../../../Contexts/ListsContext";
import { WordsContext } from "../../../Contexts/WordsContext";
import { Context } from "../../../Contexts/Context";
import { Shuffler } from "../../Functions/Actions/Shuffler.js";
import "../SingleSp.css";
import "../../styles/AllVoice.css"; // Asegúrate de que la ruta sea correcta
import { MdNotStarted } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { GrNext } from "react-icons/gr";

function AllVoiceGame() {
  const { GetList, CurrentListId, setCurrentList, UserLists } = useContext(ListsContext);
  const { HandleVoice } = useContext(Context);
  const { GetWords } = useContext(WordsContext);
  
  const [ShowGame, setShowGame] = useState(false);
  const [Index, setIndex] = useState(0);
  const [Random, setRandom] = useState([]);
  const [Link, setLink] = useState("");
  const [CheckedList, setCheckedList] = useState([]);
  const [HiddenWords, setHiddenWords] = useState([]);
  const [WrongWords, setWrongWords] = useState([]);
  const [RightWords, setRightWords] = useState([]);
  const [UserResponseArray, setUserResponseArray] = useState([]);
  const [ShowCorrection, setShowCorrection] = useState(false);
  const [WordMainUser, setWordMainUser] = useState("");
  const [WordRightToShow, setWordRightToShow] = useState("");

  useEffect(() => {
    const init = async () => setCurrentList(await GetList());
    init();
  }, []);

  const DiscExamples = (lista) => {
    return lista.filter(element => element.example && element.example.length > 0);
  };

  const startGame = async () => {
    if(!CurrentListId) return;
    const words = await GetWords(CurrentListId); // O CurrentListId.id dependiendo de tu contexto
    const WithExamples = DiscExamples(words);
    
    if(WithExamples.length === 0) {
        alert("This list has no words with examples.");
        return;
    }

    const TempSh = Shuffler(WithExamples);
    setRandom(TempSh);
    
    // Preparar texto para TTS
    let text = TempSh[0].name;
    if (TempSh[0].example.length > 0) {
      text = text + ". Examples: ";
      TempSh[0].example.forEach((element) => {
        text = text + ". " + element;
      });
    }

    ExampleQuestionsGenerator(TempSh, 0);
    try {
      setLink(await HandleVoice(text));
      setIndex(0);
    } catch (error) {
      console.error("Audio error:", error);
    }
    setShowGame(true);
  };

  const Next = async () => {
    // Resetear estados
    setUserResponseArray([]); setCheckedList([]); setHiddenWords([]);
    setShowCorrection(false); setRightWords([]); setWrongWords([]);
    setWordMainUser("");
    setWordRightToShow("");

    if (Random[Index + 1]) {
      let text = Random[Index + 1].name;
      if (Random[Index + 1].example.length > 0) {
        text = text + ". Examples: ";
        Random[Index + 1].example.forEach((element) => {
          text = text + ". " + element;
        });
      }

      try {
        setLink(await HandleVoice(text));
      } catch (error) { console.error(error); }

      ExampleQuestionsGenerator(Random, Index + 1);
      setIndex(Index + 1);
    } else {
      setIndex(0);
      setShowGame(false);
    }
  };

  const CheckResponses = () => {
    let RightTemp = [];
    let WrongTemp = [];
    
    // Chequear palabra principal
    if (Random[Index].name.toLowerCase() !== WordMainUser.toLowerCase()) {
      setWordMainUser(`${WordMainUser} (Right: ${Random[Index].name})`);
    }

    // Chequear Inputs de ejemplos
    CheckedList.forEach((element) => {
      UserResponseArray.forEach((UserE) => {
        if (element.id === UserE.id && element.exId === UserE.indexExample) {
          if (UserE.word.toLowerCase().trim() === element.word.toLowerCase().trim()) {
            RightTemp.push(`${UserE.word}_${UserE.id}_${UserE.indexExample}`);
          } else {
            WrongTemp.push(`${element.word}_${element.id}_${element.exId}`);
          }
        }
      });
    });
    setRightWords(RightTemp);
    setWrongWords(WrongTemp);
    setShowCorrection(true);
  };

  const ResponseUserHandler = (e, i, indexExample) => {
    if (UserResponseArray.length > 0) {
      const TempResponseArray = [...UserResponseArray];
      const targetIndex = TempResponseArray.findIndex(el => el.id === i && el.indexExample === indexExample);
      if(targetIndex !== -1) {
          TempResponseArray[targetIndex].word = e;
          setUserResponseArray(TempResponseArray);
      }
    }
  };

  const ExampleQuestionsGenerator = (arrayExample, ind) => {
    let ListHiddenTemp = [];
    let TempChecked = [];
    
    arrayExample[ind].example.forEach((text, exampleIndex) => {
      let textSplited = text.split(" ");
      // Shuffle simple para elegir palabras a ocultar
      let shuffledIndices = textSplited.map((_, i) => i).sort(() => Math.random() - 0.5);
      
      // Tomamos hasta 3 palabras para ocultar
      const indicesToHide = shuffledIndices.slice(0, 3);
      
      let hiddenForThisExample = []; // Guardará strings tipo "word_index"

      textSplited.forEach((word, index) => {
         const cleanWord = word.toLowerCase().replace(/[.,;!?]/g, "");
         
         if (indicesToHide.includes(index) && cleanWord.length > 2) { // Solo ocultar si tiene > 2 letras
            const uniqueKey = `${word}_${index}`; // Key para identificar la posición
            hiddenForThisExample.push(uniqueKey);
            
            TempChecked.push({
                word: cleanWord,
                id: index,
                exId: exampleIndex
            });
         }
      });
      ListHiddenTemp.push(hiddenForThisExample);
    });

    // Inicializar respuestas de usuario vacías
    let UserTemp = TempChecked.map(el => ({
        word: "",
        id: el.id,
        indexExample: el.exId
    }));

    setUserResponseArray(UserTemp);
    setCheckedList(TempChecked);
    setHiddenWords(ListHiddenTemp);
  };

  return (
    <div className="MainBackground AllVoiceContainer">
      <h1>Listening Practice</h1>

      {/* MENÚ DE SELECCIÓN */}
      {!ShowGame && (
        <div className="StandardMenuVoice">
            <div className="labelAndOption">
                {UserLists.length > 0 ? (
                    <select onChange={(e) => setCurrentList(e.target.value)}>
                        {UserLists.map((list, index) => (
                            <option key={index} value={list.id}>{list.title}</option>
                        ))}
                    </select>
                ) : <p>No lists</p>}
                
                <button className="s ActionButtoms" onClick={startGame} disabled={UserLists.length === 0}>
                    <MdNotStarted />
                </button>
            </div>
        </div>
      )}

      {/* JUEGO */}
      {ShowGame && Random.length > 0 && (
        <div className="GameVoice">
            <h2>What did you hear?</h2>
            
            <audio controls src={Link} />

            {/* Palabra Principal */}
            <div className="WordToComplete">
                <span>Main Word:</span>
                <input 
                    type="text" 
                    disabled={ShowCorrection}
                    className={ShowCorrection ? (Random[Index].name.toLowerCase() === WordMainUser.split(" (")[0].toLowerCase() ? "Right" : "Wrong") : ""}
                    onChange={(e) => setWordMainUser(e.target.value)}
                    value={WordMainUser}
                />
            </div>

            {/* Oraciones */}
            <div className="AllVExamplesMenu">
                {Random[Index].example.map((e, indexEx) => (
                    <div key={indexEx} className="inputsAndTextA">
                        {e.split(" ").map((w, i) => {
                            // Verificamos si esta palabra en esta posición (i) del ejemplo (indexEx) debe estar oculta
                            // La lógica original usaba string matching complejo, aquí usamos indices más seguros si es posible,
                            // pero mantendré la lógica de matching por string + index que usaste en ExampleQuestionsGenerator
                            
                            // Reconstruimos la key potencial
                            const currentKey = `${w}_${i}`;
                            
                            // Buscamos si existe en HiddenWords para este ejemplo
                            // Nota: HiddenWords es array de arrays. HiddenWords[indexEx] es el array de keys para este ejemplo.
                            const isHidden = HiddenWords[indexEx] && HiddenWords[indexEx].some(k => k === currentKey);

                            if(isHidden) {
                                // Lógica de estilo Right/Wrong
                                const cleanW = w.toLowerCase().replace(/[.,;!?]/g, "");
                                const isRight = RightWords.some(rw => rw.includes(`_${i}_${indexEx}`)); // Simplificado
                                const isWrong = WrongWords.some(ww => ww.includes(`_${i}_${indexEx}`));
                                
                                let inputClass = "";
                                if(ShowCorrection) {
                                    if(isRight) inputClass = "Right";
                                    else if(isWrong) inputClass = "Wrong";
                                }

                                return (
                                    <input 
                                        key={i} 
                                        type="text"
                                        disabled={ShowCorrection}
                                        className={inputClass}
                                        onChange={(ev) => ResponseUserHandler(ev.target.value, i, indexEx)}
                                        onClick={() => {
                                            if(ShowCorrection && isWrong) setWordRightToShow(w);
                                        }}
                                        placeholder="?"
                                    />
                                );
                            } else {
                                return <span key={i}>{w}</span>;
                            }
                        })}
                    </div>
                ))}
            </div>

            {/* Botones de Acción */}
            <div style={{marginTop: '1rem', width:'100%', display:'flex', justifyContent:'center'}}>
                {!ShowCorrection ? (
                    <button className="ActionButtoms" onClick={CheckResponses}><FaCheck /></button>
                ) : (
                    <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                        {WordRightToShow && (
                            <p style={{color:'#00c3ff', marginBottom:'10px'}}>
                                Correct word: <b>{WordRightToShow}</b>
                            </p>
                        )}
                        <button className="ActionButtoms" onClick={Next}><GrNext /></button>
                    </div>
                )}
            </div>

        </div>
      )}
    </div>
  );
}

export default AllVoiceGame;