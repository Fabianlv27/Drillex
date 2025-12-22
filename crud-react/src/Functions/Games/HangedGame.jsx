import { useState, useContext, useEffect } from "react";
import { ListsContext } from "../../../Contexts/ListsContext";
import { WordsContext } from "../../../Contexts/WordsContext";
import { useParams, useNavigate } from "react-router-dom"; // <--- IMPORTANTE
import "../SingleSp.css";
import "../../styles/HangedGame.css";
import { MdNotStarted } from "react-icons/md";
import { GrLinkNext } from "react-icons/gr";
import { Shuffler } from "../../Functions/Actions/Shuffler.js";
import { FaArrowLeft } from "react-icons/fa";
import {
  GetData,
  UpdateProgress,
} from "../../../api/saveProgress.js";

function HangedGame() {
  // 1. Hooks de Router
  const { listId } = useParams(); // Leemos el ID de la URL
  const navigate = useNavigate(); // Para cambiar la URL

  // 2. Contextos
  const { GetList, UserLists } = useContext(ListsContext);
  const { GetWords } = useContext(WordsContext);

  // 3. Estados del Juego
  const [ShuffletArrayToUse, setShuffletArrayToUse] = useState([]);
  const [ShowGame, setShowGame] = useState(false);
  const [index, setindex] = useState(0);
  const [ToyIndex, setToyIndex] = useState(0);
  const [MainWord, setMainWord] = useState("");
  const [SeparedWord, setSeparedWord] = useState([]);
  const [leghtMain, setleghtMain] = useState(0);
  const [Right, setRight] = useState([]);
  const [isProgress, setisProgress] = useState(false);
  const [FoundLetters, setFoundLetters] = useState([]);
  const [list, setlist] = useState("")
  // Alfabeto inicial
  const initialAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const [Alphabet, setAlphabet] = useState(initialAlphabet);

  // --- EFECTO DE INICIALIZACIÓN ---
  // Este efecto maneja la carga inicial y la detección de la URL
  useEffect(() => {
    const initGame = async () => {
      // A. Aseguramos que las listas estén cargadas
      let availableLists = UserLists;
      if (availableLists.length === 0) {
        availableLists = await GetList();
      }

      // B. Si hay un ID en la URL, intentamos iniciar el juego
      if (listId) {
        // Validamos que el ID exista en las listas del usuario (Seguridad Frontend)
        const targetList = availableLists.find(l => l.id.toString() === listId);
        
        if (targetList) {
          // Si no hemos iniciado ya el juego para esta lista, lo hacemos
          if (!ShowGame || ShuffletArrayToUse.length === 0) {
            prepareGame(targetList.id);
          }
        } else {
          // Si el ID de la URL es inválido o ajeno, volvemos al menú
          console.warn("Lista no encontrada o sin permisos");
          navigate('/Hand'); 
        }
      } else {
        // Si no hay ID en URL, mostramos el menú de selección
        setShowGame(false);
        setShuffletArrayToUse([]);
      }
    };

    initGame();
  }, [listId, UserLists]); // Se ejecuta si cambia la URL o se cargan listas

  // --- LÓGICA DE PROGRESO ---
  const ProgressVerifier = async (id) => {
    try {
      const data = await GetData(id, "hanged");
      setisProgress(data.cant != null);
      return data;
    } catch (e) {
      console.error(e);
    }
  };

  const handlerProgress = async () => {
    const pending = localStorage.getItem("pendingProgress");
    if (pending) {
      const data = JSON.parse(pending);
      // Validamos que el progreso pendiente sea de la lista actual
      if(data.idList === listId){
          await UpdateProgress(data);
          localStorage.removeItem("pendingProgress");
          setRight([]);
      }
    }
  };

  // --- PREPARACIÓN DEL JUEGO ---
  const prepareGame = async (targetId) => {
    const words = await GetWords(targetId, 'hanged');
    
    if (!words || words.length === 0) {
        alert("This list has no words!");
        navigate('/Hand');
        return;
    }

    const temp = Shuffler(words);
    
    // Verificamos progreso en backend
    ProgressVerifier(targetId);
    
    // Configuración inicial
    setShuffletArrayToUse(temp);
    setMainWord(temp[0].name);
    setindex(0);
    setToyIndex(0);
    setFoundLetters([]);
    setAlphabet(initialAlphabet);
    setShowGame(true);
  };

  // Actualizar MainWord cuando cambia el índice
  useEffect(() => {
    if (ShuffletArrayToUse.length > 0 && ShuffletArrayToUse[index]) {
      setMainWord(ShuffletArrayToUse[index].name);
    }
    
    // Guardado local de emergencia
    if (listId) {
      localStorage.setItem("pendingProgress", JSON.stringify({
        idList: listId,
        game: "hanged",
        cant: index + 1,
        right: Right,
      }));
    }
  }, [index, ShuffletArrayToUse]);

  // Separar palabra en letras
  const Spliter = (w) => {
    if(!w) return;
    const cleanWord = quitarTildes(w);
    const splitWord = cleanWord.replace(/ /g, "|").toUpperCase().split("");
    setSeparedWord(splitWord);

    // Calculamos longitud real (sin espacios)
    let count = 0;
    splitWord.forEach(char => {
        if(char !== "|") count++;
    });
    setleghtMain(count);
  };

  useEffect(() => {
    if (MainWord) {
      Spliter(MainWord);
    }
  }, [MainWord]);

  // --- LÓGICA DEL JUEGO (Chequear letra) ---
  const Check = (letra) => {
    let count = 0;
    
    if (SeparedWord.includes(letra)) {
      // Contar cuántas veces aparece la letra para restar al total pendiente
      SeparedWord.forEach((w) => {
        if (w === letra) count++;
      });

      setleghtMain(leghtMain - count);
      setFoundLetters([...FoundLetters, letra]);
    } else {
      // Fallo
      setToyIndex(ToyIndex + 1);
    }
    
    // Quitar letra del teclado
    const newArray = Alphabet.filter((item) => item !== letra);
    setAlphabet(newArray);
  };

  function quitarTildes(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Componente interno para ocultar palabras en ejemplos
  const HideWord = ({ SingleExample, Part, past, gerund, idx }) => {
    let CriptoExampleBeta = SingleExample;
    
    // Reemplazos de variantes gramaticales
    const replacements = [
        { word: Part, label: "(Participle)" },
        { word: past, label: "(Past Tense)" },
        { word: gerund, label: "(ing)" },
        { word: MainWord, label: "" } // Palabra principal
    ];

    replacements.forEach(item => {
        if (item.word) {
            // Regex insensible a mayúsculas/minúsculas global
            const regex = new RegExp(item.word, "gi");
            CriptoExampleBeta = CriptoExampleBeta.replace(regex, `______ ${item.label}`);
        }
    });

    return (
      <>
        {CriptoExampleBeta.includes("_____") ? (
          <li key={idx}>{CriptoExampleBeta} </li>
        ) : null}
      </>
    );
  };

  // --- CONTINUAR AL SIGUIENTE NIVEL ---
  const Continue = () => {
    // Si ganó (no murió y completó letras)
    if (ToyIndex !== 6 && leghtMain === 0) {
      if(ShuffletArrayToUse[index]){
          setRight([...Right, ShuffletArrayToUse[index].id_Word]);
      }
      // Guardar progreso cada 5 palabras
      if (index > 0 && index % 5 === 0) {
        handlerProgress();
      }
    }

    if (ShuffletArrayToUse[index + 1]) {
      // Resetear para siguiente palabra
      setFoundLetters([]);
      setAlphabet(initialAlphabet);
      setToyIndex(0);
      setindex(index + 1);
    } else {
      // Fin del juego
      handlerProgress(); // Guardar lo último
      setShowGame(false);
      navigate('/Hand'); // Volver al menú
      alert("Game Finished!");
    }
  };

  // --- RENDER ---
  return (
    <div className="HangedMainContainer MainBackground">
     <div className="HangedMainContainer MainBackground">
  
  {/* ENCABEZADO RESPONSIVE */}
  <div style={{
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      width: "100%", 
      position: "relative",
      padding: "0 20px"
  }}>
     {ShowGame && (
        <button 
            className="ActionButtoms" 
            onClick={() => { setShowGame(false); navigate('/Hand'); }} // Asegura que vuelva al menú
        >
            <FaArrowLeft />
        </button>
      )}
      <h1 style={{ margin: 0 }}>Hanged Game</h1>
  </div>
     
      
      <div>
        {!ShowGame ? (
          <div className="littleMainBackground hangedMenu">
            <div className="labelAndOption">
              {UserLists.length > 0 ? (
                <select 
                    // CAMBIO CLAVE: Usamos navigate en lugar de state local
                    onChange={(e) => setlist(e.target.value)}
                    value={list || ""}
                >
                  <option value="" disabled>Select a list</option>
                  {UserLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.title}
                    </option>
                  ))}
                </select>
              ) : (
                <p>You dont have lists yet</p>
              )}
            </div>
            {/* Botón start */}
            <button
              className="ActionButtoms s"
              onClick={() => { navigate(`/Hand/${list}`)}}
            >
              <MdNotStarted />
            </button>
          </div>
        ) : null}
      </div>

      {ShowGame && ShuffletArrayToUse[index] ? (
        <div className="GameHandMenu">
          {SeparedWord.length > 0 ? (
            <div className="ghm">
              <div  className="img_hand">
                 <img
                src={`/Toy/${ToyIndex}.png`} // Ajusté la ruta a absoluta por si acaso
                alt="Hanged Man"
                style={{ backgroundColor: "powderblue" }}
              />
                  <div className="inputsAndText hand">
                {SeparedWord.map((e, i) =>
                  FoundLetters.includes(e) || e === "|" ? (
                    <div
                      key={i}
                      className={`${e === "|" ? "Space" : "SingleLetterToFind"}`}
                    >
                      {e}
                    </div>
                  ) : (
                    <div key={i} className="SingleLetterToFind"></div>
                  )
                )}
              </div>
              </div>
             
              <h2>Meaning</h2>
              <div className={`${ToyIndex === 6 ? "blocked" : ""} MeaningMenuToy`}>
                
                <p>{ShuffletArrayToUse[index].meaning}</p>
                <ul>
                  {ShuffletArrayToUse[index].example.map((e, i) => (
                    <HideWord
                        key={i}
                        SingleExample={e}
                        Part={ShuffletArrayToUse[index].participle}
                        past={ShuffletArrayToUse[index].past}
                        gerund={ShuffletArrayToUse[index].gerund}
                        idx={i}
                    />
                  ))}
                </ul>
              </div>

          
            </div>
          ) : null}

          <div className="Alphabet">
            {Alphabet.map((e, i) => (
              <button
                onClick={() => Check(e)}
                disabled={leghtMain === 0 || ToyIndex === 6}
                key={i}
              >
                {e}
              </button>
            ))}
          </div>

          {/* MENÚ DE DERROTA */}
          {ToyIndex === 6 && (
            <div className="LoseMenu">
              <h2>You Lose</h2>
              <p>
                The word is <span>{MainWord}</span>
              </p>
              <button className="ActionButtoms" onClick={Continue}>
                <GrLinkNext />
              </button>
            </div>
          )}

          {/* MENÚ DE VICTORIA */}
          {leghtMain === 0 && ToyIndex !== 6 && (
            <div className="LoseMenu">
              <p>
                <span>You Found The word!</span>
              </p>
              <button className="ActionButtoms" onClick={Continue}>
                <GrLinkNext />
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
    </div>

  );
}

export default HangedGame;