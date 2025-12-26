import { useState, useEffect, useContext } from "react";
import { Context } from "../../../Contexts/Context";
import { MdOutlineRadioButtonChecked } from "react-icons/md";
import { IoIosArrowForward, IoIosArrowBack, IoMdAdd, IoMdClose } from "react-icons/io";
import { FaBookOpen } from "react-icons/fa";
import AddWordToList from "../../Componets/AddWordToList.jsx"; // Verifica la ruta si Components está bien escrito
import ImageSearch from './ImageSeach.jsx';
import "../../styles/LyricsAndWords.css";

function ElementCard({ CurrentListId }) {
  const { SelectedObjects, setSelectedObjects } = useContext(Context);
  const [AddWordB, setAddWordB] = useState(false);
  const [Index, setIndex] = useState(0);

  // Cuando se carga el componente, inicia en el último elemento (o 0 si prefieres)
  useEffect(() => {
    if(SelectedObjects.length > 0) {
        setIndex(SelectedObjects.length - 1);
    }
  }, [SelectedObjects]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Función para cerrar el modal
  const handleClose = () => {
    setSelectedObjects([]);
  };

  // Datos actuales
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
      image: currentWord.image // Asegurar que pase la imagen
    };
  };

  if (!currentWord.name) return null; // No renderizar si no hay datos

  return (
    <div className="ElementCardOverlay">
      <div className="ElementCardContainer">
        
        {/* HEADER */}
        <div className="EC-Header">
          <button className="EC-CloseBtn" onClick={handleClose}>
            <IoMdClose />
          </button>
          <h3 className="EC-Title">{currentWord.name}</h3>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="EC-Content">
            
            {/* TIPO DE PALABRA */}
            <div className="EC-Type">
                {isPhrasal 
                    ? "Phrasal Verb" 
                    : (Array.isArray(currentWord.type) ? currentWord.type.join(", ") : currentWord.type || "Word")}
            </div>

            {/* BÚSQUEDA DE IMAGEN (Si no tiene) */}
            {!currentWord.image && (
                <ImageSearch 
                    word={currentWord.name} 
                    dataWord={SelectedObjects} // Pasamos el array completo o el objeto según requiera tu componente
                    setDataWord={setSelectedObjects} // Función para actualizar contexto
                    index={Index} // Indice actual para actualizar el array correcto
                />
            )}

            {/* IMAGEN Y SIGNIFICADO */}
            <div className="EC-MediaSection">
                {currentWord.image && (
                    <div className="EC-Images">
                        {/* Soporte para múltiples imágenes separadas por ; */}
                        {currentWord.image.split(";").map((imgSrc, i) => (
                            <img key={i} src={imgSrc} alt={`${currentWord.name} ${i}`} />
                        ))}
                    </div>
                )}

                {currentWord.meaning && (
                    <div className="EC-Meaning">
                        <h4><FaBookOpen style={{marginRight:'5px'}}/> Meaning</h4>
                        {/* Manejo de saltos de línea */}
                        {currentWord.meaning.split("\n").map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                )}
            </div>

            {/* SINÓNIMOS Y ANTÓNIMOS */}
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

            {/* TABLA DE TIEMPOS (Solo si existen) */}
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

            {/* EJEMPLOS */}
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

            {/* COMPONENTE PARA AÑADIR A LISTA (SI SE ACTIVÓ) */}
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

        {/* FOOTER (NAVEGACIÓN Y ACCIONES) */}
        <div className="EC-Footer">
            {/* Navegación Anterior */}
            {SelectedObjects.length > 1 && (
                <button 
                    className="EC-NavBtn"
                    onClick={() => setIndex(prev => (prev > 0 ? prev - 1 : SelectedObjects.length - 1))}
                >
                    <IoIosArrowBack />
                </button>
            )}

            {/* Botón Añadir/Cerrar Añadir */}
            {!currentWord.error && (
                <button 
                    className="EC-AddBtn" 
                    onClick={() => setAddWordB(!AddWordB)}
                    title={AddWordB ? "Cancel Add" : "Add to List"}
                >
                    {AddWordB ? <IoMdClose /> : <IoMdAdd />}
                </button>
            )}

            {/* Navegación Siguiente */}
            {SelectedObjects.length > 1 && (
                <button 
                    className="EC-NavBtn"
                    onClick={() => setIndex(prev => (prev < SelectedObjects.length - 1 ? prev + 1 : 0))}
                >
                    <IoIosArrowForward />
                </button>
            )}
        </div>

      </div>
    </div>
  );
}

export default ElementCard;