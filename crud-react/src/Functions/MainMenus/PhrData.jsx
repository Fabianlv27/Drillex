import { useState, useEffect, useContext, useRef } from "react";
import { Context } from "../../../Contexts/Context";
import { ListsContext } from "../../../Contexts/ListsContext";
import { RandomPhrasal, LetterPhrasals } from '../../Functions/Actions/PhrasalsHandler';
import AddWordToList from "../../Componets/AddWordToList"; // <--- Importamos el componente reutilizable

// Iconos
import { GiRollingDices } from "react-icons/gi";
import { TbSquareRoundedLetterLFilled } from "react-icons/tb";
import { FaSearch } from "react-icons/fa";
import { MdOutlineRadioButtonChecked, MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import { IoMdAddCircle, IoMdClose } from "react-icons/io";

import "../../styles/FindPV.css";

function PhrData() {
  const { Ahost } = useContext(Context);
  const { GetList } = useContext(ListsContext);
  
  // Estados Principales
  const [activeTab, setActiveTab] = useState("Random"); 
  const [ShowPhrs, setShowPhrs] = useState(false);
  const [PhrToShow, setPhrToShow] = useState([]); 
  const [Index, setIndex] = useState(0);
  
  // Configuración de Búsqueda
  const [AmountOfPhrs, setAmountOfPhrs] = useState(5);
  const [UserLetter, setUserLetter] = useState("A");
  
  // Estado Búsqueda Manual
  const [SearchQuery, setSearchQuery] = useState("");
  const [Suggestions, setSuggestions] = useState([]);
  const [ShowSuggestions, setShowSuggestions] = useState(false);
  const [ManualPhrasal, setManualPhrasal] = useState(null); 

  // Estado para mostrar el menú de añadir (Toggle)
  const [ShowAddMenu, setShowAddMenu] = useState(false);

  const inputRef = useRef(null);
  const AmountChoices = [5, 10, 15, 20, 25];
  const Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    GetList(); 
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
// 1. Hook useEffect para el Debounce
  useEffect(() => {
    // Si el input está vacío, no hacemos nada o limpiamos sugerencias
    if (!SearchQuery.trim()) {
        setSuggestions([]);
        return;
    }

    // Creamos un temporizador que ejecutará la búsqueda en 500ms
    const delayDebounceFn = setTimeout(() => {
      handleManualSearch(SearchQuery);
    }, 500); // 500ms de espera

    // Limpiamos el temporizador si el usuario escribe otra letra antes de los 500ms
    return () => clearTimeout(delayDebounceFn);
    
  }, [SearchQuery]); // Se ejecuta cada vez que SearchQuery cambia
  // --- HANDLERS ---

  const handleSearchRandom = async () => {
    const data = await RandomPhrasal(AmountOfPhrs);
    setPhrToShow(data);
    setIndex(0);
    setShowPhrs(true);
    setManualPhrasal(null);
    setShowAddMenu(false);
  };

  const handleSearchByLetter = async () => {
    const data = await LetterPhrasals(UserLetter, AmountOfPhrs);
    setPhrToShow(data);
    setIndex(0);
    setShowPhrs(true);
    setManualPhrasal(null);
    setShowAddMenu(false);
  };

  const handleManualSearch = async (query) => {
      if(!query) return;
      const response = await fetch(`${Ahost}/SearchPhr/${query}`);
      const data = await response.json();
      setSuggestions(data.bit || []);
      setShowSuggestions(true);
  };

  const selectSuggestion = (phrasal) => {
      setManualPhrasal(phrasal);
      setSearchQuery(phrasal.name);
      setShowSuggestions(false);
      setShowPhrs(false);
      setShowAddMenu(false);
  };

  // Preparar datos para AddWordToList
  const getPhrasalData = (current) => {
      if (!current) return {};
      return {
        name: current.name,
        past: current.past,
        gerund: current.gerund,
        meaning: current.meaning,
        type: ["Phrasal Verb"],
        example: current.example || [],
        synonyms: current.synonyms || [],
        antonyms: current.antonyms || [],
        participle: current.participle || "",
        image: "",
      };
  };

  // --- TARJETA DE PHRASAL VERB ---
  const PhrasalCard = ({ data }) => {
      if(!data) return null;

      return (
          <div className="PVCard">
              <div className="PV-Header">
                  <h2>{data.name}</h2>
              </div>

              <div className="PV-Content">
                  {/* Tabla de Tiempos */}
                  <table className="PV-Table">
                      <thead>
                          <tr>
                              <th>Past</th>
                              <th>Participle</th>
                              <th>Gerund</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                              <td>{data.past || "-"}</td>
                              <td>{data.participle || "-"}</td>
                              <td>{data.gerund || "-"}</td>
                          </tr>
                      </tbody>
                  </table>

                  <div className="PV-Section">
                      <h4>Meaning</h4>
                      <p>{data.meaning}</p>
                  </div>

                  {data.example && data.example.length > 0 && (
                      <div className="PV-Section">
                          <h4>Examples</h4>
                          <ul className="PV-List">
                              {data.example.map((ex, i) => (
                                  <li key={i}><MdOutlineRadioButtonChecked style={{marginTop:'4px', color:'#00c3ff'}}/> {ex}</li>
                              ))}
                          </ul>
                      </div>
                  )}

                  <div className="PV-Tags">
                      {data.synonyms?.map((s,i) => <span key={i} className="Tag Syn">{s}</span>)}
                      {data.antonyms?.map((a,i) => <span key={i} className="Tag Ant">{a}</span>)}
                      {data.Way && <span className="Tag Info">Intensity: {data.Way}</span>}
                      {data.Frequency && <span className="Tag Info">Freq: {data.Frequency}</span>}
                  </div>
              </div>

              {/* INTEGRACIÓN DE AddWordToList */}
              {ShowAddMenu && (
                  <div style={{ padding: '1rem', borderTop: '1px solid #333', display: 'flex', justifyContent: 'center' }}>
                      <AddWordToList 
                          data={getPhrasalData(data)} 
                          ExtraFunction={() => setShowAddMenu(false)} // Cerrar al terminar
                      />
                  </div>
              )}

              <div className="PV-Footer">
                  {/* Botón Atrás */}
                  {!ManualPhrasal && Index > 0 ? (
                      <button className="NavBtn" onClick={() => { setIndex(Index - 1); setShowAddMenu(false); }}>
                          <MdArrowBackIosNew />
                      </button>
                  ) : <div style={{width:'40px'}}></div>}

                  {/* Botón Abrir/Cerrar Add Menu */}
                  <button className="AddBtn" onClick={() => setShowAddMenu(!ShowAddMenu)}>
                      {ShowAddMenu ? <IoMdClose /> : <IoMdAddCircle style={{fontSize:'1.2rem'}}/>} 
                      {ShowAddMenu ? " Close" : " Add to List"}
                  </button>

                  {/* Botón Siguiente */}
                  {!ManualPhrasal && (
                      <button className="NavBtn" onClick={() => { 
                          if(PhrToShow[Index + 1]) setIndex(Index + 1);
                          else setShowPhrs(false);
                          setShowAddMenu(false);
                      }}>
                          {PhrToShow[Index+1] ? <MdArrowForwardIos /> : <FaTimes />}
                      </button>
                  )}
              </div>
          </div>
      )
  };

  return (
    <div className="MainBackground FindPVMenuMain">
      <h1>Discover Phrasal Verbs</h1>

      {/* TABS */}
      <div className="ModeTabs">
          <div className={`TabOption ${activeTab === "Random" ? "active" : ""}`}
            onClick={() => { setActiveTab("Random"); setShowPhrs(false); setManualPhrasal(null); }}>
              <GiRollingDices />
          </div>
          <div className={`TabOption ${activeTab === "ByLetter" ? "active" : ""}`}
            onClick={() => { setActiveTab("ByLetter"); setShowPhrs(false); setManualPhrasal(null); }}>
              <TbSquareRoundedLetterLFilled />
          </div>
          <div className={`TabOption ${activeTab === "Search" ? "active" : ""}`}
            onClick={() => { setActiveTab("Search"); setShowPhrs(false); setManualPhrasal(null); }}>
              <FaSearch />
          </div>
      </div>

      {/* CONTENIDO */}
      <div className="ModeContainer">
          
          {/* Random */}
          {activeTab === "Random" && !ShowPhrs && !ManualPhrasal && (
              <div className="ControlPanel">
                  <h3>Select Amount</h3>
                  <div className="ControlRow">
                      <select onChange={(e) => setAmountOfPhrs(e.target.value)} value={AmountOfPhrs}>
                          {AmountChoices.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <button className="AddBtn" onClick={handleSearchRandom}>Start</button>
                  </div>
              </div>
          )}

          {/* Letra */}
          {activeTab === "ByLetter" && !ShowPhrs && !ManualPhrasal && (
              <div className="ControlPanel">
                  <h3>Filter Options</h3>
                  <div className="ControlRow">
                      <select onChange={(e) => setAmountOfPhrs(e.target.value)} value={AmountOfPhrs}>
                          {AmountChoices.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <select onChange={(e) => setUserLetter(e.target.value)} value={UserLetter}>
                          {Alphabet.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <button className="AddBtn" onClick={handleSearchByLetter}>Go</button>
                  </div>
              </div>
          )}

          {/* Búsqueda */}
          {activeTab === "Search" && !ManualPhrasal && (
              <div className="ControlPanel" style={{background:'transparent', border:'none', boxShadow:'none'}}>
                  <div className="SearchContainer" ref={inputRef}>
                      <input 
                          type="text" 
                          className="SearchInput" 
                          placeholder="Type a phrasal verb..."
                          value={SearchQuery}
                          onChange={(e) => {
                              setSearchQuery(e.target.value);                
                          }}
                          onFocus={() => setShowSuggestions(true)}
                      />
                      <button className="SearchBtn"><FaSearch /></button>
                      
                      {ShowSuggestions && Suggestions.length > 0 && (
                          <ul className="SuggestionsList">
                              {Suggestions.map((s, i) => (
                                  <li key={i} onClick={() => selectSuggestion(s)}>{s.name}</li>
                              ))}
                          </ul>
                      )}
                  </div>
              </div>
          )}

          {/* Tarjeta */}
          {(ShowPhrs && PhrToShow.length > 0) && <PhrasalCard data={PhrToShow[Index]} />}
          {ManualPhrasal && <PhrasalCard data={ManualPhrasal} />}

      </div>
    </div>
  );
}

export default PhrData;