import "../../styles/LyricsAndWords.css";
import { useContext, useState, useEffect, useRef } from "react";
import { Context } from "../../../Contexts/Context.jsx";
import { ListsContext } from "../../../Contexts/ListsContext.jsx";
import { WordsContext } from "../../../Contexts/WordsContext.jsx";
import { WordsMatcher,PhrMatcher } from "../Actions/WordsMatcher.js";
import { SearchPhrasals } from "../../Functions/Actions/PhrasalsHandler.js";
import React from "react";
import ElementCard from "./ElementCard";
import Loading from "../Actions/Loading.jsx";
function LyricsAndWords({
  LyricReal,
  UserLists,
  SongID,
  bodyHidden,
}) {
  const {  SelectedObjects, setSelectedObjects } =useContext(Context);
  const { CurrentListId, setCurrentList } = useContext(ListsContext);
  const {AllwordsData,GetWords}= useContext(WordsContext);
  const [MatchModel, setMatchModel] = useState([]);
  const [ModeToRender, setModeToRender] = useState(0);
  const [ScrollLiricPosition, setScrollLiricPosition] = useState(0);
  const LyircContainer = useRef();
  //const [ElementToShow, setElementToShow] = useState(null)
  useEffect(() => {
    if (bodyHidden) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  useEffect(() => {
    if (SelectedObjects.length == 0) {
      if (LyircContainer.current) {
        // Usamos scrollTo para mover el div hacia la última posición guardada
        LyircContainer.current.scrollTo({
          top: ScrollLiricPosition, // La posición guardada
          behavior: "smooth", // Desplazamiento suave
        });
      }
      if (bodyHidden) {
        document.body.style.overflow = "hidden";
      }
    }
  }, [SelectedObjects]);

  const HandleScrollPosition = () => {
    setScrollLiricPosition(LyircContainer.current.scrollTop);
  };

  async function GetMatches(idList) {
    setModeToRender(3);
    const StoredMatch =
      JSON.parse(localStorage.getItem(`Match_${idList}_${SongID}`)) || 0;
    setCurrentList({ id: idList, title: "My List" });
    console.log(StoredMatch);
    if (StoredMatch == 0) {
      const Matches = await WordsMatcher(idList, LyricReal,GetWords);
      if (SongID != "PasteLyric" && SongID != "SearchSong") {
        localStorage.setItem(
          `Match_${idList}_${SongID}`,
          JSON.stringify(Matches)
        );
      }

      setMatchModel(Matches);
    } else {
      setMatchModel(StoredMatch);
      console.log(typeof StoredMatch);
      setCurrentList({ id: idList, title: "My List" });
    }
  }
  async function PhrHandler(Phr) {
    const StoredPhrInfo = JSON.parse(
      localStorage.getItem(`PhrInfo_${Phr}`) || 0
    );
    if (StoredPhrInfo == 0) {
     const PhrInfo= await SearchPhrasals(Phr)
      const AdpetedPhr = { ...PhrInfo.All[0], mode: 2 };
      console.log(PhrInfo.All[0]);
      localStorage.setItem(`PhrInfo_${Phr}`, JSON.stringify(AdpetedPhr));

      setSelectedObjects([AdpetedPhr]);
    } else {
      console.log(StoredPhrInfo);
      setSelectedObjects([StoredPhrInfo]);
    }
  }
  const HightlightsWords = ({ text, textsToHight }) => {
    // Validación previa
    if (!text || typeof text !== "string") {
      console.error("El texto proporcionado no es válido:", text);
      return null;
    }

    if (!Array.isArray(textsToHight)) {
      console.error("textsToHight no es un array válido:", textsToHight);
      return <p>{text}</p>;
    }

    // Construcción del regex
    if (textsToHight.length > 0) {
      console.log(textsToHight);
      let AllMatches = [];
      let AllRawWords = [];
      textsToHight.map((mth) => mth.matches.map((e) => AllMatches.push(e)));
      console.log(AllMatches);
      textsToHight.forEach((mth) => {
        mth.matches.forEach(() => {
          AllRawWords.push(mth.rawWord);
        });
      });
      //{'verso': 'Gonna End Up A Big Ole Pile A Them Bones ',=> 'match': [{'matches': ['End Up'], 'rawWord': 'End up'}]}
      const regex = new RegExp(`(${AllMatches.join("|")})`, "gi");
      const parts = text.split(regex);
      console.log(AllRawWords);
      console.log(AllMatches);
      return (
        <p>
          {parts.map((part, i) =>
            AllMatches.some(
              (word) => word.toLowerCase() === part.toLowerCase()
            ) ? (
              <span
                onClick={() => {
                  HandleScrollPosition();
                  if (ModeToRender == 1) {
                    const E = AllwordsData[AllRawWords[AllMatches.indexOf(part)]];
                    setSelectedObjects([E]);
                    console.log(E);
                  } else {
                    PhrHandler(AllRawWords[AllMatches.indexOf(part)]);
                  }
                }}
                key={i}
                style={{ color: "skyblue", fontWeight: "bold" }}
              >
                {part}
              </span>
            ) : (
              <React.Fragment key={i}>{part}</React.Fragment>
            )
          )}
        </p>
      );
    } else {
      return <p>{text}</p>;
    }
  };

  async function GetPhrMatches() {
    console.log(SongID)
    const StoredPhrMatches =
      JSON.parse(localStorage.getItem(`PhrMatch_${SongID}`)) || 0;

    if (StoredPhrMatches == 0) {
      setModeToRender(3);
      const Matches = await PhrMatcher(LyricReal);
      if (SongID != "PasteLyric") {
        localStorage.setItem(`PhrMatch_${SongID}`, JSON.stringify(Matches));
      }
      setMatchModel({ Matches: Matches });
    } else {
      console.log(StoredPhrMatches);
      setMatchModel({ Matches: StoredPhrMatches });
    }
  }

  function RenderSelfLists() {
    return (
      <>
        {MatchModel.Matches.map((match, i) =>
          match.verso ? (
            <HightlightsWords
              text={match.verso}
              textsToHight={match.match || []}
              key={i}
            />
          ) : null
        )}
      </>
    );
  }
  const Lyrics = () => {
    return (
      <>
        {LyricReal.map((verso, i) => (
          <p key={i}>{verso}</p>
        ))}
      </>
    );
  };
  function MyLists() {
    return (
      <>
        <div style={{ marginTop: "1rem","position":"relative","zIndex":SelectedObjects.length > 0 ?-1:0 }}>
          <p style={{ fontWeight: "bold" }}>Show Phrasal Verbs</p>
          <div>
            <form>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <label className="switch" style={{ marginBottom: "1rem" }}>
                  <input
                    type="checkbox"
                    className="chk"
                    checked={ModeToRender == 2}
                    onClick={async () => {
                      if (ModeToRender !== 2) {
                        //  setModeToRender(3)
                        await GetPhrMatches();
                        setModeToRender(2);
                      } else {
                        setModeToRender(0);
                      }
                    }}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div
                style={{
                  width: "10rem",
                  height: "15rem",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "scroll",
                  backgroundImage:
                    "linear-gradient(to right,rgba(16, 15, 16, 0.91),rgba(17, 15, 18, 0.84),rgba(17, 16, 21, 0.86),rgba(16, 17, 23, 0.86),rgba(13, 18, 25, 0.83),rgba(14, 22, 29, 0.84),rgba(14, 25, 34, 0.88),rgba(12, 29, 38, 0.84),rgba(12, 35, 47, 0.87),rgba(10, 34, 45, 0.7),rgba(8, 33, 45, 0.7),rgba(5, 34, 45, 0.6))",
                  scrollbarWidth: "none",
                }}
              >
                {UserLists.map((list, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      minHeight: "3rem",
                      width: "99%",
                      borderBottom: "solid 1px grey",
                      alignItems: "center",
                      justifyContent: "left",
                    }}
                  >
                    <input
                      checked={CurrentListId == list.id && ModeToRender == 1}
                      onChange={async () => {
                        await GetMatches(list.id);
                        console.log(CurrentListId == list.id);
                        setModeToRender(1);
                      }}
                      name="radio"
                      type="radio"
                      key={i}
                      style={{
                        margin: "0px 10px 0px 10px",
                        width: "1.5rem",
                        height: "1.5rem",
                      }}
                    />
                    <label htmlFor="radio-free" style={{}}>
                      {list.title}
                    </label>
                  </div>
                ))}
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }
  function RenderOptions() {
    switch (ModeToRender) {
      case 0:
        return <Lyrics />;
      case 1:
        return <RenderSelfLists />;
      case 2:
        return <RenderSelfLists />;
      case 3:
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "2rem",
            }}
          >
            <Loading />
            Looking for Coincidences...
          </div>
        );
      default:
        break;
    }
  }
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {SelectedObjects.length > 0 ? (
        <div style={{ position: "fixed", top: 0, left: 0,zIndex:1000 }}>
          <ElementCard
            Lists={UserLists}
            CurrentListId={CurrentListId}
          />
        </div>
      ) : null}
      <div className="LyricsContainer" ref={LyircContainer}>
        <RenderOptions />
      </div>

      <MyLists />
    </div>
  );
}

export default LyricsAndWords;
