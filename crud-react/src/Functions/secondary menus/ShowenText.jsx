import { useState, useContext, useEffect } from "react";
import { Context } from "../../Context";
import { IoCloseCircleSharp } from "react-icons/io5";
import "../../Functions/SingleSp.css";
function ShowenText({
  LyricReal,
  SelfLists,
  Listas,
  CookieUserData,
  ManualLyric,
  LyricNoSplit,
}) {
  const { Meaning, setMeaning, searchWord, host } = useContext(Context);
  //const [LyricReal, setLyricReal] = useState([]);
  // const [SelfLists, setSelfLists] = useState([])
  const [Find, setFind] = useState(false);

  //  const [Listas, setListas] = useState([])
  const [IndexListSelf, setIndexListSelf] = useState(0);
  // const [CookieUserData, setCookieUserData] = useState('')
  // const [ManualLyric, setManualLyric] = useState('')
  //  const [LyricNoSplit, setLyricNoSplit] = useState('')
  const [ShowPhr, setShowPhr] = useState(false);
  const [PhrCommon, setPhrCommon] = useState([]);
  const [wrdsObj, setwrdsObj] = useState([]);
  //retornar
  const [objToShow, setobjToShow] = useState({});

  const [ShowPhrObj, setShowPhrObj] = useState(false);
  const [ShowSelf, setShowSelf] = useState(false);

  //Gestiona las listas propias y muestra la lista seleccionada

  const HandlerSelf = (index, Showphr, obj, ShowSelf) => {
    if (Showphr) {
      setShowPhr(false);
    }
    if (obj) {
      setShowPhrObj(false);
    }
    if (ShowSelf) {
      setShowSelf(false);
    } else {
      console.log(SelfLists);
      console.log(index);
      setIndexListSelf(index);
      console.log(IndexListSelf);
      setShowSelf(true);
      setFind(true);
    }
  };
  //Primero convierte el array de las letras en un string sin saltos de linea para mandarlo al backend
  const HandlePhr = async (Show) => {
    if (Meaning.length > 0) {
      setMeaning([]);
    }
    console.log(SelfLists)
    if (!Show) {
      let Text = "";
      if (LyricNoSplit) {
        LyricNoSplit.forEach((element) => {
          Text = `${Text} ${element}`;
        });
      } else {
        Text = ManualLyric;
      }
      if (PhrCommon.length == 0) {
        try {
          //Intenta obtener del backend los phrasal verbs y retorna un objeto que contiene las coincidencias encontradas
          //objeto de su respectivo phrasal verb http://127.0.0.1:8000/docs
          const response = await fetch(
            `${host}/function/obtain_phr/${CookieUserData}/${Text}`
          );
          const data = await response.json();
          const phrs = data.found_words;

          console.log(phrs);
          //busca las coincidencias en el texto independientemente del espacio entre palabras compuestas
          //y las guarda en matchedPhrases

          const matchedPhrases = [];
          phrs.forEach((phrase) => {
            const regex = new RegExp(
              `\\b${phrase.replace(" ", "\\s+")}\\b`,
              "gi"
            );
            let match;
            while ((match = regex.exec(Text)) !== null) {
              matchedPhrases.push({ match: match[0], phrase: phrase });
            }
          });

          //elimina los elementos repetidos
          setPhrCommon(
            matchedPhrases.filter((e, i) => {
              return matchedPhrases.indexOf(e) === i;
            })
          );
          setwrdsObj(data.wrdObj);
        } catch (error) {
          console.log(error);
        }
      }
      setShowPhr(true);
    } else {
      setShowPhr(false);
    }
  };
  //Por cada objeto de los phrasal verbs se verifica si el seleccionado coincide en cualquiera de sus tiempos verbales y lo establece
  //para mostrarlo.

  function HandleCommonPhr(actualPhr, obj) {
    obj.forEach((element) => {
      if (
        element.Name.trim() == actualPhr.trim() ||
        element.Gerund.trim() == actualPhr.trim() ||
        element.Past.trim() == actualPhr.trim()
      ) {
        setobjToShow(element);
        setShowPhrObj(true);
      }
    });
  }

  //por cada coincidencia encontrada de los phrasal verbs si el "verso" pasado contiene la coincidencia este lo reemplaza por un codigo
  //el cual contiene el "match" y el phrasal verb original:
  const ResaltCommon = ({ PhrCommon, verso, index, obj, ShowPhrObj }) => {
    console.log(PhrCommon);
    let VersoMod = "";
    PhrCommon.map((phr) => {
      if (verso.includes(phr.match)) {
        VersoMod = verso.replace(
          phr.match,
          `/N4G8@ ___${phr.match}/-${phr.phrase} /N4G8@`
        );
      }
    });

    if (VersoMod == "") {
      VersoMod = verso;
    }
    console.log(VersoMod);
    //El codigo previamente colocado es leido por estas lineas la cual contiene una serie de condicionales, si el verso lo contiene
    // obtiene el match el cual es mostrado en negrita y la frase original la cual es enviada como parametro a la funcion para mostrar
    //el phrasal verb .

    if (VersoMod.includes("/N4G8@")) {
      return (
        <p key={index}>
          {VersoMod.split("/N4G8@").map((e, i) => {
            if (e.includes("___")) {
              return (
                <span
                  className="word"
                  onClick={() =>
                    HandleCommonPhr(e.substring(4).split("/-")[1], obj)
                  }
                >
                  {e.substring(4).split("/-")[0]}
                </span>
              );
            } else {
              return e;
            }
          })}
        </p>
      );
    } else {
      return <p key={index}>{VersoMod}</p>;
    }
  };

  //Renderiza el texto dependiendo de que lista quieres mostrar sus palabras , si se va a mostrar phrasal verbs o si solo se quiere mostar el texto
  // original

  const RenderChoices = ({ verso, index }) => {
    //Mostrar Phrasal Verbs:
    if (ShowPhr) {
      return (
        <div className="Verso SingleVerseText">
          {
            <ResaltCommon
              PhrCommon={PhrCommon}
              verso={verso}
              index={index}
              obj={wrdsObj}
              ShowPhrObj={ShowPhrObj}
            />
          }
        </div>
      );
    }

    //Mostrar palabras de cualquier lista Propia:
    else if (ShowSelf) {
      console.log(SelfLists[0][0]);
      let matchedWrds = [];
      //Por cada palabra de la lista cuyo index es previamente establecido mediante un evento, se buscan las coincidencias en todos sus tiempos
      //verbales y se guardan todas en un mismo array

      SelfLists[IndexListSelf][0].forEach((e) => {
        console.log(e);
        const regex = new RegExp(`\\b${e.name.replace(" ", "\\s+")}\\b`, "gi");
        console.log(regex);
        let match;
        while ((match = regex.exec(verso)) !== null) {
          console.log("hola");
          matchedWrds.push({ match: match[0], wrd: e });
        }
        console.log(match);
        if (e.past !== "") {
          const regex2 = new RegExp(
            `\\b${e.past.replace(" ", "\\s+")}\\b`,
            "gi"
          );
          let match2;
          while ((match2 = regex2.exec(verso)) !== null) {
            matchedWrds.push({ match: match2[0], wrd: e });
          }
        }
        if (e.participle !== "") {
          const regex3 = new RegExp(
            `\\b${e.participle.replace(" ", "\\s+")}\\b`,
            "gi"
          );
          let match3;
          while ((match = regex3.exec(verso)) !== null) {
            matchedWrds.push({ match: match3[0], wrd: e });
          }
        }
      });
      console.log(matchedWrds);
      let VersoMod = "";
      matchedWrds.map((Mw) => {
        if (verso.includes(Mw.match)) {
          VersoMod = verso.replace(
            Mw.match,
            `/N4G8@ ___${Mw.match}/-${Mw.wrd} /N4G8@`
          );
        }
      });
      if (VersoMod == "") {
        VersoMod = verso;
      }
      console.log(VersoMod);
      if (VersoMod.includes("/N4G8@")) {
        return (
          <p key={index}>
            {VersoMod.split("/N4G8@").map((e) => {
              if (e.includes("___")) {
                return <strong>{e.substring(4).split("/-")[0]}</strong>;
              } else {
                return e;
              }
            })}
          </p>
        );
      } else {
        return <p key={index}>{VersoMod}</p>;
      }
    } else {
      return (
        <div className="Verso SingleVerseText">
          {verso.split(" ").map((word, i) => (
            <a
              className="word"
              onClick={() => {
                try {
                  searchWord(word);
                } catch (error) {
                  console.error(error);
                }
              }}
              key={i}
            >
              {word}{" "}
            </a>
          ))}
        </div>
      );
    }
  };
  return (
    <div>
      <div className="LyricAndListCont">
        <div className="LyricsContainer">
          <button onClick={()=>console.log(typeof(SelfLists[0]))}>sde</button>
          {LyricReal.map((verso, index) => (
            <RenderChoices verso={verso} index={index} />
          ))}
        </div>
        <div className="MyListsButtomsShow">
          <button className="ShowPVButtom" onClick={() => HandlePhr(ShowPhr)}>
            Show Phrasal Verbs
          </button>

          {Listas.map((e, i) => (
            <button
              className="lyricButomsLists"
              onClick={() => HandlerSelf(i, ShowPhr, ShowPhrObj, ShowSelf)}
              key={i}
            >
              {" "}
              {e.title}
            </button>
          ))}
        </div>
      </div>
      <div>
        {objToShow && ShowPhrObj ? (
          <div className="mainConetinerMeaning">
            <div className="PhrMenu containerME">
              <div className="TitleSecctionMeaning">
                <button
                  onClick={() => setShowPhrObj(false)}
                  className="close phrB"
                >
                  <IoCloseCircleSharp />
                </button>
                <p className="MainWordCard"> {objToShow.Name}</p>
              </div>
              <div className="VerbTenses">
                <h3>
                  <span>Past:</span> {objToShow.Past}
                </h3>
              </div>

              <div className="MeaningBox">
                <p className="MeaningText">{objToShow.Meaning}</p>
              </div>
              <div className="examples">
                <ul>
                  {objToShow.Examples.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
              <div className="SynCardPhr">
                <p>{objToShow.Synonyms.map((e) => e).join(", ")}</p>
              </div>
              <div className="AntCardPhr">
                <p>{objToShow.Antonyms.map((e) => e).join(", ")}</p>
              </div>
              <div className="levelAndFreq">
                <p>
                  {" "}
                  <span>Level:</span> {objToShow.Way}
                </p>
                <p>
                  {" "}
                  <span>Frequency:</span> {objToShow.Frequency}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ShowenText;
