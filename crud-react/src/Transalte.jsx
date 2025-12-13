import { useState, useRef, useEffect, useContext } from "react";
import "./translate.css";
import AddWordToList from "./Componets/AddWordToList.jsx";
import { BsTranslate } from "react-icons/bs";
import { MdOutlineErrorOutline } from "react-icons/md";
import { CgArrowLongLeftE } from "react-icons/cg";
import { CiPlay1 } from "react-icons/ci";
import ElementCard from "./Functions/secondary menus/ElementCard.jsx";
import { Context } from "../Contexts/Context.jsx";
import { DiccionaryContext } from "../Contexts/DiccionaryContext.jsx";
import { getItalianDictionaryWord } from "./Functions/Actions/Dictionary.js";
import { ListsContext } from "../Contexts/ListsContext.jsx";
import { GiArchiveResearch } from "react-icons/gi";
function Transalte({ top, left, TTT, setCloseMenu, CloseMenu }) {
  const { Ahost, SelectedObjects, setSelectedObjects } = useContext(Context);
  const { searchWord } = useContext(DiccionaryContext);
  const { GetList, UserLists } = useContext(ListsContext);
  const [translatedText, setTranslatedText] = useState("");
  const [IsTrans, setIsTrans] = useState(false);
  const [Error, setError] = useState(false);
  const audioRef = useRef(null);
  const [Language, setlanguage] = useState("");
  const [CookieUser, setCookieUser] = useState("");
  const [Add, setAdd] = useState(false);

  useEffect(() => {
    const cookies = document.cookie;
    console.log(cookies);
    const cookiesArray = cookies.split(";");

    cookiesArray.forEach(async (cookie) => {
      const [name, value] = cookie.trim().split("=");
      if (name === "lang") {
        setlanguage(value);
      }
      if (name === "e") {
        setCookieUser(value);
      }
    });
    console.log(CookieUser);
  }, []);

  const HandleVoice = async (word) => {
    try {
      const response = await fetch(`${Ahost}/texto_a_voz/${word}/${Language}`);

      const AudioBytes = await response.blob();

      const audioUrl = URL.createObjectURL(AudioBytes);

      return audioUrl;
    } catch (error) {
      console.error("Error al obtener el audio:", error);
    }
  };

  const translateText = async () => {
    console.log(TTT);
    try {
      const response = await fetch(`${Ahost}/Translate/${TTT}`);
      const data = await response.json();
      console.log(data);
      setTranslatedText(data);
      setError(false);
      setIsTrans(true);
    } catch (error) {
      setError(true);
      setIsTrans(false);
      console.error("Error al traducir:", error);
    }
  };
  const adaptWord = (MeaningWord) => {
    const AdaptedElement = {
      mode: 1,
      name: MeaningWord[0].word,
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

    MeaningWord[0].meanings.map((meaning) =>
      meaning.definitions.map((def) =>
        def.definition === undefined
          ? null
          : AdaptedElement.meaning != ""
          ? (AdaptedElement.meaning += "\n" + def.definition)
          : (AdaptedElement.meaning = def.definition)
      )
    );

    MeaningWord[0].meanings.map((meaning) =>
      meaning.definitions.map((def) =>
        def.example
          ? (AdaptedElement.example = [...AdaptedElement.example, def.example])
          : null
      )
    );

    MeaningWord[0].meanings.map((meaning) =>
      meaning.partOfSpeech
        ? (AdaptedElement.type = [...AdaptedElement.type, meaning.partOfSpeech])
        : null
    );

    MeaningWord[0].meanings.map(
      (meaning) => (
        meaning.antonyms.length > 0
          ? meaning.antonyms.map((ant) =>
              AdaptedElement.synonyms != ""
                ? (AdaptedElement.antonyms += ", " + ant)
                : (AdaptedElement.antonyms = ant)
            )
          : null,
        meaning.definitions.map((def) =>
          def.antonyms.length > 0
            ? def.antonyms.map((ant) =>
                AdaptedElement.antonyms != ""
                  ? (AdaptedElement.antonyms += ", " + ant)
                  : (AdaptedElement.antonyms = ant)
              )
            : null
        )
      )
    );

    MeaningWord[0].meanings.map(
      (meaning) => (
        meaning.synonyms.length > 0
          ? meaning.synonyms.map((syn) =>
              AdaptedElement.synonyms != ""
                ? (AdaptedElement.synonyms += ", " + syn)
                : (AdaptedElement.synonyms = syn)
            )
          : null,
        meaning.definitions.map((def) =>
          def.synonyms.length > 0
            ? def.synonyms.map((syn) =>
                AdaptedElement.synonyms != ""
                  ? (AdaptedElement.synonyms += ", " + syn)
                  : (AdaptedElement.synonyms = syn)
              )
            : null
        )
      )
    );
    return AdaptedElement;
  };
  const HandleMeaningCard = async (word) => {
    try {
      let MeaningWord;
      let AdaptedElement;
      if (Language === "it") {
        MeaningWord = await getItalianDictionaryWord(word);
        MeaningWord.mode = 1;
        AdaptedElement = MeaningWord;
      } else {
        MeaningWord = await searchWord(word);
        AdaptedElement = adaptWord(MeaningWord);
      }
      console.log(MeaningWord);
      GetList();
      console.log(UserLists);
      console.log(SelectedObjects);
      setCloseMenu(true);
      setSelectedObjects([...SelectedObjects, AdaptedElement]);
      console.log(SelectedObjects);
    } catch (error) {
      console.log(error);
    }
  };
  const CreateRef = (a) => {
    audioRef.current = new Audio(`${a}`);
  };
  const playSound = (a) => {
    CreateRef(a);
    // Reproduce el sonido al hacer clic en el botón
    audioRef.current.play();
  };
  const PostData = async (ListsToPost) => {
    const formData = {
      word: TTT,
      meaning: translatedText,
      mode: 1,
      lists: ListsToPost,
    };
    console.log(formData);
  }
  return (
    <>
      {SelectedObjects.length > 0 ? (
        <div style={{ position: "fixed", top: 0, left: 0 }}>
          <ElementCard
            Lists={UserLists}
            CookieUserData={CookieUser}
            CurrentListId={"none"}
          />
        </div>
      ) : null}
      {!CloseMenu ? (
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
              {
                if (IsTrans) {
                  setIsTrans(false);
                } else {
                  window.getSelection().removeAllRanges();
                  setIsTrans(false);
                  setCloseMenu(true);
                }
              }
            }}
          >
            {
              IsTrans ? (
                <CgArrowLongLeftE />
              ):"X"
            }
          </button>

          {!IsTrans ? (
            <div style={{ display: "flex" }}>
              <button onClick={translateText} className="SimpleB">
                <BsTranslate />
              </button>
              <button
                className="SimpleB"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={async () => {
                  const audioUrl = await HandleVoice(TTT);
                  playSound(audioUrl);
                }}
              >
                <CiPlay1 />
              </button>
              <button
                className="SimpleB"
                onClick={() => HandleMeaningCard(TTT)}
              >
                <GiArchiveResearch />
              </button>
            </div>
          ) : (
            <div>
              {!Error ? (
                <div style={{ display: "flex",marginTop: "0.5rem" }}>
                  {Add ? (
                   <div>
                    
                      <AddWordToList data={{
                        name: TTT,
                        meaning: translatedText,
                      }}  
                      ExtraFunction={()=>setAdd(false)}

                      />
                   </div>
                  ) : (
                    <>
                      <button className="ActionButtoms2" onClick={()=>{
                        setAdd(true);
                      }}>+</button>
                      <p style={{ color: "black" }}>{translatedText}</p>
                    </>
                  )}
                </div>
              ) : (
                <p style={{ color: "red" }}>
                  <MdOutlineErrorOutline /> Error
                </p>
              )}
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}

export default Transalte;
