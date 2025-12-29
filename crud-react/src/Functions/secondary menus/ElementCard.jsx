import { useState, useEffect, useContext } from "react";
import { Context } from "../../../Contexts/Context";
import { MdOutlineRadioButtonChecked } from "react-icons/md";
import { IoIosArrowForward, IoIosArrowBack, IoMdAdd, IoMdClose } from "react-icons/io";
import { FaBookOpen, FaListUl } from "react-icons/fa";
import AddWordToList from "../../Componets/AddWordToList.jsx"; 
import ImageSearch from './ImageSeach.jsx';
import "../../styles/LyricsAndWords.css";

function ElementCard({ CurrentListId }) {
  const { SelectedObjects, setSelectedObjects } = useContext(Context);
  const [AddWordB, setAddWordB] = useState(false);
  const [Index, setIndex] = useState(0);

  // Al cargar o cambiar objetos, ir al último (comportamiento original)
  // Opcional: puedes quitar esto si quieres que se mantenga el índice
  useEffect(() => {
    if(SelectedObjects.length > 0) {
        setIndex(SelectedObjects.length - 1);
    }
  }, [SelectedObjects.length]); // Solo si cambia la cantidad

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleClose = () => {
    setSelectedObjects([]);
  };

  // --- LÓGICA DE NAVEGACIÓN (Circular) ---
  const handleNext = () => {
    setIndex((prev) => (prev < SelectedObjects.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIndex((prev) => (prev > 0 ? prev - 1 : SelectedObjects.length - 1));
  };

  const currentWord = SelectedObjects[Index] || {};
  const isPhrasal = currentWord.mode == 2;

  // Preparar datos para guardar
  const PostData = () => {
    return {
      name: currentWord.name,
      past: currentWord.past,
      gerund: currentWord.gerund,
      participle: currentWord.participle,
      meaning: currentWord.meaning,
      example: currentWord.example,
      type: isPhrasal ? ["Phrasal Verb"] : currentWord.type,
      synonyms: Array.isArray(currentWord.synonyms) ? currentWord.synonyms.join(",") : currentWord.synonyms,
      antonyms: Array.isArray(currentWord.antonyms) ? currentWord.antonyms.join(",") : currentWord.antonyms,
      image: currentWord.image 
    };
  };

  if (!currentWord.name) return null;

  return (
    // Z-INDEX AJUSTADO: 2147483640 (Menor que el FloatingMenu que es ...47)
    <div className="ElementCardOverlay">
      <div className="ElementCardContainer">
        
        {/* HEADER */}
        <div className="EC-Header">
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                 <button className="EC-CloseBtn" onClick={handleClose}>
                    <IoMdClose />
                 </button>
              <h3 className="EC-Title">{currentWord.name}</h3>
            </div>
               {/* Contador de posición */}
                 <span style={{fontSize:'0.8rem', color:'#aaa'}}>
                    {Index + 1} / {SelectedObjects.length}
                 </span>
          
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="EC-Content">
            
            <div className="EC-Type">
                {isPhrasal 
                    ? "Phrasal Verb" 
                    : (Array.isArray(currentWord.type) ? currentWord.type.join(", ") : currentWord.type || "Word")}
            </div>

            {!currentWord.image && (
                <ImageSearch 
                    word={currentWord.name} 
                    dataWord={SelectedObjects} 
                    setDataWord={setSelectedObjects} 
                    index={Index} 
                />
            )}

            <div className="EC-MediaSection">
                {currentWord.image && (
                    <div className="EC-Images">
                        {currentWord.image.split(";").map((imgSrc, i) => (
                            <img key={i} src={imgSrc} alt={`${currentWord.name} ${i}`} />
                        ))}
                    </div>
                )}

                {currentWord.meaning && (
                    <div className="EC-Meaning">
                        <h4><FaBookOpen style={{marginRight:'5px'}}/> Meaning</h4>
                        {currentWord.meaning.split("\n").map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                )}
            </div>

            <div className="EC-SynAnt">
                {(currentWord.synonyms && currentWord.synonyms.length > 0) && (
                    <div className="EC-TagBox Syn">
                        <strong>Synonyms:</strong> 
                        {Array.isArray(currentWord.synonyms) ? currentWord.synonyms.join(", ") : currentWord.synonyms}
                    </div>
                )}
                {(currentWord.antonyms && currentWord.antonyms.length > 0) && (
                    <div className="EC-TagBox Ant">
                        <strong>Antonyms:</strong> 
                        {Array.isArray(currentWord.antonyms) ? currentWord.antonyms.join(", ") : currentWord.antonyms}
                    </div>
                )}
            </div>

            {(currentWord.past || currentWord.participle || currentWord.gerund) && (
                <div className="EC-TableContainer">
                    <table className="EC-Table">
                        <thead>
                            <tr>
                                {currentWord.past && <th>Past</th>}
                                {currentWord.participle && <th>Participle</th>}
                                {currentWord.gerund && <th>Gerund</th>}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {currentWord.past && <td>{currentWord.past}</td>}
                                {currentWord.participle && <td>{currentWord.participle}</td>}
                                {currentWord.gerund && <td>{currentWord.gerund}</td>}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {currentWord.example && currentWord.example.length > 0 && (
                <div className="EC-Examples">
                    <h4>Examples:</h4>
                    <ul>
                        {currentWord.example.map((ex, i) => (
                            <li key={i}>
                                <MdOutlineRadioButtonChecked /> {ex}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {AddWordB && (
                <div style={{marginTop: '1rem', borderTop:'1px solid #333', paddingTop:'1rem',display:"flex",justifyContent:"center"}}>
                    <AddWordToList 
                        ExtraFunction={() => setAddWordB(false)} 
                        data={PostData()} 
                        CurrentListId={CurrentListId} 
                    />
                </div>
            )}

        </div>

        {/* --- BARRA DE NAVEGACIÓN ESPECÍFICA (NUEVO) --- */}
        {SelectedObjects.length > 1 && (
            <div className="EC-WordNav">
                {SelectedObjects.map((obj, i) => (
                    <button 
                        key={i} 
                        className={`EC-WordNavItem ${Index === i ? 'active' : ''}`}
                        onClick={() => setIndex(i)}
                        title={obj.name}
                    >
                        {obj.name}
                    </button>
                ))}
            </div>
        )}

        {/* FOOTER (FLECHAS Y ACCIONES) */}
        <div className="EC-Footer">
            {/* Botón Anterior */}
            {SelectedObjects.length > 1 && (
                <button className="EC-NavBtn" style={{ left: '15px' }} onClick={handlePrev}>
                    <IoIosArrowBack />
                </button>
            )}

            {/* Botón Central Acción */}
            {!currentWord.error && (
                <button 
                    className="EC-AddBtn" 
                    onClick={() => setAddWordB(!AddWordB)}
                    title={AddWordB ? "Cancel Add" : "Add to List"}
                >
                    {AddWordB ? <IoMdClose /> : <IoMdAdd />}
                </button>
            )}

            {/* Botón Siguiente */}
            {SelectedObjects.length > 1 && (
                <button className="EC-NavBtn" style={{ right: '15px' }} onClick={handleNext}>
                    <IoIosArrowForward />
                </button>
            )}
        </div>

      </div>
    </div>
  );
}

export default ElementCard;