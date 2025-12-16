import { useState, useEffect, useContext, useRef } from "react";
import { Context } from "../../../Contexts/Context";
import "../../styles/FindPV.css";
import { GiRollingDices } from "react-icons/gi";
import { TbSquareRoundedLetterLFilled } from "react-icons/tb";
import { FaSearch } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { MdOutlineRadioButtonChecked } from "react-icons/md";
import { GrNext } from "react-icons/gr";
import { MdArrowBackIosNew } from "react-icons/md";
import { IoMdAddCircle } from "react-icons/io";
import { WordsContext } from "../../../Contexts/WordsContext";
import { ListsContext } from "../../../Contexts/ListsContext";
import { RandomPhrasal, LetterPhrasals } from '../../Functions/Actions/PhrasalsHandler';

function PhrData() {
  const { Ahost } = useContext(Context);
  const { AddWord } = useContext(WordsContext);
  const { CurrentListId, setCurrentList, GetList, UserLists } = useContext(ListsContext);
  
  const [ShowPhrs, setShowPhrs] = useState(false);
  const [AmountOfPhrs, setAmountOfPhrs] = useState(5);
  const [PhrToShow, setPhrToShow] = useState([]);
  const [Index, setIndex] = useState(0);
  const [WayChoises, setWayChoises] = useState("Random");
  const [UserLetter, setUserLetter] = useState("A");
  
  // Estado para manejar el menú de agregar (0: oculto, 1: seleccionar lista, 2: éxito)
  const [ShowAdd, setShowAdd] = useState(0);
  
  const [PhrSearchList, setPhrSearchList] = useState([]);
  const [PhrSearchBit, setPhrSearchBit] = useState([]);
  const [MainPhrSearch, setMainPhrSearch] = useState({});
  const [PhrSearchListToShow, setPhrSearchListToShow] = useState([]);
  const [ShowMainPhr, setShowMainPhr] = useState(false);
  const [ShowResults, setShowResults] = useState(false);
  const [ShowRecom, setShowRecom] = useState(true);

  const inputRef = useRef(null);
  const AmountChoises = [5, 10, 15, 20, 25];
  const abecedario_mayuscula = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  ];

  const handleOutsideClick = (event) => {
    if (inputRef.current && !inputRef.current.contains(event.target)) {
      setShowRecom(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const HandleList = async () => {
    const list = await GetList();
    if(list) setCurrentList(list);
  };

  useEffect(() => {
    HandleList();
  }, []);

  // --- LÓGICA DE AGREGAR ---
  const handleSelectChange = (e) => {
    const selectedId = e.target.value;
    const selectedList = UserLists.find(l => l.id === selectedId);
    if(selectedList){
        setCurrentList({
            id: selectedId,
            title: selectedList.title,
        });
    }
  };

  const handleAddPhrasal = async (PhrMode) => {
      if(!PhrMode) return;
      
      const data = {
        name: PhrMode.name,
        past: PhrMode.past,
        gerund: PhrMode.gerund,
        meaning: PhrMode.meaning,
        type: ["Phrasal Verb"],
        example: PhrMode.example || [],
        synonyms: PhrMode.synonyms || [],
        antonyms: PhrMode.antonyms || [],
        participle: PhrMode.participle || "",
        image: "",
      };
      
      await AddWord(CurrentListId.id, data);
      setShowAdd(2); // Cambiar estado a "Agregado"
  };

  // --- TARJETA REUTILIZABLE CON MENÚ INTERNO ---
  const PVCardMenu = ({ phrasalData }) => {
    // Si viene 'phrasalData' (Modo Búsqueda), usamos eso. Si no, usamos el array del Modo Random/Letra.
    const currentPhr = phrasalData || PhrToShow[Index];

    if (!currentPhr) return null;

    return (
      <div className="PVCard">
        <>
          <div className="TitleMenu">
            <h2>{currentPhr.name}</h2>
          </div>
          
          <div className="Tenses">
            <table>
              <thead>
                <tr>
                  {currentPhr.past && <th>Past</th>}
                  {currentPhr.participle && <th>Participle</th>}
                  {currentPhr.gerund && <th>Gerund</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {currentPhr.past && <td>{currentPhr.past}</td>}
                  {currentPhr.participle && <td>{currentPhr.participle}</td>}
                  {currentPhr.gerund && <td>{currentPhr.gerund}</td>}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="MeaningBox">
            <p>{currentPhr.meaning}</p>
          </div>
          
          <div className="examplesPVMenu">
            <span>Examples: </span>
            <div className="singleExPv">
              {currentPhr.example && currentPhr.example.map((e, i) => (
                <p key={i}>
                  <span>
                    <MdOutlineRadioButtonChecked />{" "}
                  </span>{" "}
                  {e}
                </p>
              ))}
            </div>
          </div>

          <div className="SynCardPhr">
            <p>{currentPhr.synonyms && currentPhr.synonyms.join(", ")}</p>
          </div>
          <div className="AntCardPhr">
            <p>{currentPhr.antonyms && currentPhr.antonyms.join(", ")}</p>
          </div>
          
          <div className="IntANdFr">
            <p><span>Intensity:</span> {currentPhr.Way}</p>
            <p><span>Frequency: </span> {currentPhr.Frequency}</p>
          </div>
          
          {/* BOTONES DE NAVEGACIÓN */}
          <div className="ButtomsMenuPV">
            {/* Si NO es búsqueda individual, mostramos navegación */}
            {!phrasalData && Index !== 0 && (
              <button className="ActionButtoms" onClick={() => Back(Index)}>
                <MdArrowBackIosNew />
              </button>
            )}
            
            {!phrasalData && (
                 <button
                    className="ActionButtoms"
                    onClick={() => {
                        setShowAdd(0);
                        Next(Index);
                    }}
                >
                    <GrNext />
                </button>
            )}
           
            {/* Botón para abrir el menú de agregar */}
            <button className="ActionButtoms" onClick={() => setShowAdd(1)}>
                <IoMdAddCircle />
            </button>
          </div>

          {/* --- MENÚ INTERNO DE AGREGAR --- */}
          {ShowAdd !== 0 && (
            <div className="AddMenuPV_Internal">
                {ShowAdd === 1 ? (
                    <div className="AddControls">
                        <select onChange={handleSelectChange} value={CurrentListId.id || ""}>
                            {UserLists.map((e, i) => (
                                <option key={i} value={e.id}>
                                    {e.title}
                                </option>
                            ))}
                        </select>
                        <button 
                            className="ActionButtoms s" 
                            onClick={() => handleAddPhrasal(currentPhr)}
                            title="Confirm Add"
                        >
                            <FaCheckCircle />
                        </button>
                    </div>
                ) : (
                    <div className="AddSuccess">
                        <p style={{color: '#00c3ff', fontWeight:'bold', marginTop:'10px'}}>
                            <FaCheckCircle /> Added to list!
                        </p>
                    </div>
                )}
            </div>
          )}
        </>
      </div>
    );
  };

  const SearchRandom = async () => {
    setPhrToShow(await RandomPhrasal(AmountOfPhrs));
    setShowPhrs(true);
    setShowAdd(0);
  };

  const SearchByLetter = async () => {
    setPhrToShow(await LetterPhrasals(UserLetter, AmountOfPhrs));
    setShowPhrs(true);
    setShowAdd(0);
  };

  const Next = (index) => {
    if (PhrToShow[index + 1]) {
      setIndex(Index + 1);
    } else {
      setIndex(0);
      setShowPhrs(false);
    }
    setShowAdd(0);
  };

  const Back = (index) => {
    setIndex(index - 1);
    setShowAdd(0);
  };

  const searchModes = {
    Random: (
      <div className="MainModeMenu">
        {!ShowPhrs ? (
            <>
              <h2>Random Phrasal Verbs</h2>
              <p>Select The Amount</p>
              <p>
                             <select onChange={(e) => setAmountOfPhrs(e.target.value)}>
                {AmountChoises.map((e, i) => (
                  <option key={i} value={e}>
                    {e}
                  </option>
                ))}
              </select>
              <button className="ActionButtoms s" onClick={SearchRandom}>
                <FaCheckCircle />
              </button>
              </p>
 
            </>
          ) : null}
        
        {ShowPhrs ? <PVCardMenu /> : null}
      </div>
    ),
    ByLetter: (
      <div className="MainModeMenu">
        <h2>Find Phrasal Verbs by letter</h2>
        {!ShowPhrs ? (
          <>
            <p>Select The Amount</p>
            <select onChange={(e) => setAmountOfPhrs(e.target.value)}>
              {AmountChoises.map((e, i) => (
                <option key={i} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <div className="Note">
              <p>
                Note: if there are no enought Phrasal Verbs with the letter,
                just it will show that it have{" "}
              </p>
            </div>

            <p>Select The Letter</p>
            <div>
              <select
                onChange={(e) => setUserLetter(e.target.value)}
              >
                {abecedario_mayuscula.map((e, i) => (
                  <option key={i} value={e}>
                    {e}
                  </option>
                ))}
              </select>
              <button className="ActionButtoms s" onClick={SearchByLetter}>
                OK
              </button>
            </div>
          </>
        ) : null}
        <div>{ShowPhrs ? <PVCardMenu /> : null}</div>
      </div>
    ),
    Search: (
      <div>
        <h2>Search</h2>
        <div className="inputAndSearch">
          <div style={{ position: "relative", width: "300px" }}>
            <input
              type="text"
              ref={inputRef}
              onClick={() => setShowRecom(true)}
              onChange={async (e) => {
                if (e.target.value.length > 0) {
                  if (!ShowRecom) setShowRecom(true);
                  
                  const response = await fetch(`${Ahost}/SearchPhr/${e.target.value}`);
                  const data = await response.json();
                  setPhrSearchBit(data.bit);
                  setPhrSearchList(data.All);
                }
              }}
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
              }}
            />

            {PhrSearchBit.length > 0 && ShowRecom ? (
              <ul
                ref={inputRef}
                style={{
                  listStyleType: "none",
                  margin: 0,
                  padding: 0,
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  backgroundColor: "rgba(19,92,92,0.9)",
                }}
              >
                {PhrSearchBit.map((e, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setMainPhrSearch(e);
                      setShowRecom(false);
                      setShowMainPhr(true);
                      setShowAdd(0); // Reset add menu on new selection
                    }}
                    style={{
                      padding: "10px",
                      cursor: "pointer",
                      color: "whitesmoke",
                      borderBottom: "1px solid rgba(255,255,255,0.1)"
                    }}
                  >
                    {e.name}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <button
            className="SearchButtom"
            onClick={() => {
              setPhrSearchListToShow(PhrSearchList);
              setShowRecom(false);
              setShowMainPhr(false);
              setShowResults(true);
            }}
          >
            <FaSearch />
          </button>
        </div>

        <div>
          {ShowResults ? (
            <>
              <ul>
                {PhrSearchListToShow.map((e, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setMainPhrSearch(e);
                      setShowMainPhr(true);
                      setShowResults(false);
                      setShowAdd(0);
                    }}
                    style={{cursor:'pointer', margin:'5px', color:'white'}}
                  >
                    {e.name}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
        
        <div>
          {ShowMainPhr ? (
            <div className="MainSpvCard">
               {/* Usamos la misma tarjeta reutilizable, pasándole los datos de búsqueda */}
               <PVCardMenu phrasalData={MainPhrSearch} />
            </div>
          ) : null}
        </div>
      </div>
    ),
  };

  return (
    <div className="MainBackground FindPVMenuMain">
      <h1>Discover News Phrasal Verbs</h1>

      {!ShowPhrs && !ShowMainPhr ? (
        <div className="radio-inputs">
          <label className="radio">
            <input
              type="radio"
              name="radio"
              onClick={() => {
                setShowAdd(0);
                setWayChoises("Random");
                setShowMainPhr(false);
              }}
              checked={WayChoises === "Random"}
            />
            <span className="name">
              <GiRollingDices />
            </span>
          </label>
          <label className="radio">
            <input
              type="radio"
              name="radio"
              onClick={() => {
                setShowAdd(0);
                setWayChoises("ByLetter");
                setShowMainPhr(false);
              }}
            />
            <span className="name">
              <TbSquareRoundedLetterLFilled />
            </span>
          </label>

          <label className="radio">
            <input
              type="radio"
              name="radio"
              onClick={() => {
                setShowAdd(0);
                setWayChoises("Search");
                setShowMainPhr(false);
              }}
            />
            <span className="name">
              <FaSearch />
            </span>
          </label>
        </div>
      ) : null}

      <div className="AllModes">
        {searchModes[WayChoises]}
      </div>
    </div>
  );
}

export default PhrData;