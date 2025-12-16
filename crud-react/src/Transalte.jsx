import { useState, useRef, useContext } from "react";
import "./translate.css";
import AddWordToList from "./Componets/AddWordToList.jsx";
import { BsTranslate } from "react-icons/bs";
import { MdOutlineErrorOutline } from "react-icons/md";
import { CgArrowLongLeftE } from "react-icons/cg";
import { CiPlay1 } from "react-icons/ci";
import { GiArchiveResearch } from "react-icons/gi";
import ElementCard from "./Functions/secondary menus/ElementCard.jsx";

// Contextos
import { Context } from "../Contexts/Context.jsx";
import { DiccionaryContext } from "../Contexts/DiccionaryContext.jsx";
import { ListsContext } from "../Contexts/ListsContext.jsx";

// Funciones
import { getItalianDictionaryWord } from "./Functions/Actions/Dictionary.js";
import api from "../api/axiosClient"; // Cliente Axios seguro

function Translate({ top, left, TTT, setCloseMenu, CloseMenu }) {
  // Contextos globales
  const { SelectedObjects, setSelectedObjects, Language } = useContext(Context);
  const { searchWord } = useContext(DiccionaryContext);
  const { GetList, UserLists } = useContext(ListsContext);

  // Estados locales
  const [translatedText, setTranslatedText] = useState("");
  const [IsTrans, setIsTrans] = useState(false);
  const [Error, setError] = useState(false);
  const [Add, setAdd] = useState(false);
  
  const audioRef = useRef(null);

  // --- FUNCIONES ---

  const HandleVoice = async (word) => {
    try {
      // Usamos Axios para que viajen las cookies si es necesario
      const response = await api.get(`/texto_a_voz/${word}/${Language}`, {
          responseType: 'blob'
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error("Error obteniendo audio:", error);
    }
  };

  const translateText = async () => {
    if (!TTT) return;
    try {
      const response = await api.get(`/Translate/${TTT}`);
      const data = response.data;
      
      setTranslatedText(data);
      setError(false);
      setIsTrans(true);
    } catch (error) {
      setError(true);
      setIsTrans(false);
      console.error("Error traduciendo:", error);
    }
  };

  const playSound = (url) => {
    if (url) {
        if (audioRef.current) audioRef.current.pause();
        audioRef.current = new Audio(url);
        audioRef.current.play();
    }
  };

  // Lógica para adaptar la respuesta del diccionario a tu modelo de datos
  const adaptWord = (MeaningWord) => {
    if (!MeaningWord || !MeaningWord[0]) return null;
    
    const wordData = MeaningWord[0];
    const AdaptedElement = {
      mode: 1,
      name: wordData.word,
      meaning: "",
      example: [],
      type: [],
      antonyms: "",
      synonyms: "",
      image: "",
      past: "",
      participle: "",
      gerund: "",
    };

    // Procesar meanings de forma más segura
    if (wordData.meanings) {
        wordData.meanings.forEach((meaning) => {
            // Part of Speech
            if (meaning.partOfSpeech) {
                AdaptedElement.type.push(meaning.partOfSpeech);
            }

            // Definitions & Examples
            if (meaning.definitions) {
                meaning.definitions.forEach((def) => {
                    if (def.definition) {
                        AdaptedElement.meaning += (AdaptedElement.meaning ? "\n" : "") + def.definition;
                    }
                    if (def.example) {
                        AdaptedElement.example.push(def.example);
                    }
                    // Antonyms/Synonyms inside definitions
                    if (def.antonyms && def.antonyms.length > 0) {
                        AdaptedElement.antonyms += (AdaptedElement.antonyms ? ", " : "") + def.antonyms.join(", ");
                    }
                    if (def.synonyms && def.synonyms.length > 0) {
                         AdaptedElement.synonyms += (AdaptedElement.synonyms ? ", " : "") + def.synonyms.join(", ");
                    }
                });
            }

            // Global Antonyms/Synonyms per meaning
            if (meaning.antonyms && meaning.antonyms.length > 0) {
                AdaptedElement.antonyms += (AdaptedElement.antonyms ? ", " : "") + meaning.antonyms.join(", ");
            }
            if (meaning.synonyms && meaning.synonyms.length > 0) {
                AdaptedElement.synonyms += (AdaptedElement.synonyms ? ", " : "") + meaning.synonyms.join(", ");
            }
        });
    }

    return AdaptedElement;
  };

  const HandleMeaningCard = async (word) => {
    try {
      let MeaningWord;
      let AdaptedElement;

      if (Language === "it") {
        MeaningWord = await getItalianDictionaryWord(word);
        if (MeaningWord) {
            MeaningWord.mode = 1;
            AdaptedElement = MeaningWord;
        }
      } else {
        MeaningWord = await searchWord(word);
        AdaptedElement = adaptWord(MeaningWord);
      }

      if (AdaptedElement) {
          // Aseguramos que las listas estén cargadas
          if (UserLists.length === 0) await GetList();
          
          setCloseMenu(true);
          setSelectedObjects([...SelectedObjects, AdaptedElement]);
      } else {
          console.warn("No definition found");
          // Aquí podrías mostrar un pequeño toast de error
      }
    } catch (error) {
      console.error("Error handling meaning:", error);
    }
  };

  // --- RENDER ---

  if (CloseMenu) return null;

  return (
    <>
      {SelectedObjects.length > 0 && (
        <div style={{ position: "fixed", top: 0, left: 0, zIndex: 99999 }}>
          <ElementCard
            Lists={UserLists}
            // CookieUserData={CookieUser} // YA NO ES NECESARIO, Axios maneja la sesión
            CurrentListId={"none"}
          />
        </div>
      )}

      <div
        className="MainTrans"
        style={{
          position: "absolute",
          top: `${top - 30}px`,
          left: `${left}px`,
          zIndex: "1000000000",
        }}
      >
        <button
          className="closeTrs"
          onClick={() => {
            if (IsTrans) {
              setIsTrans(false);
            } else {
              if (window.getSelection) {
                  window.getSelection().removeAllRanges();
              }
              setIsTrans(false);
              setCloseMenu(true);
            }
          }}
        >
          {IsTrans ? <CgArrowLongLeftE /> : "X"}
        </button>

        {!IsTrans ? (
          <div style={{ display: "flex" }}>
            <button onClick={translateText} className="SimpleB" title="Translate">
              <BsTranslate />
            </button>
            <button
              className="SimpleB"
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              onClick={async () => {
                const audioUrl = await HandleVoice(TTT);
                playSound(audioUrl);
              }}
              title="Listen"
            >
              <CiPlay1 />
            </button>
            <button
              className="SimpleB"
              onClick={() => HandleMeaningCard(TTT)}
              title="Definition"
            >
              <GiArchiveResearch />
            </button>
          </div>
        ) : (
          <div>
            {!Error ? (
              <div style={{ display: "flex", marginTop: "0.5rem", alignItems: 'center' }}>
                {Add ? (
                  <div>
                    <AddWordToList 
                        data={{ name: TTT, meaning: translatedText }}  
                        ExtraFunction={() => setAdd(false)}
                    />
                  </div>
                ) : (
                  <>
                    <button className="ActionButtoms2" onClick={() => setAdd(true)}>
                        +
                    </button>
                    <p style={{ color: "black", marginLeft: "10px", margin: 0 }}>
                        {translatedText}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <p style={{ color: "red", display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MdOutlineErrorOutline /> Error translating
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Translate;