import { useContext, useEffect, useState } from "react";
import { ListsContext } from "../../../Contexts/ListsContext";
import { WordsContext } from "../../../Contexts/WordsContext";
import { Context } from "../../../Contexts/Context";
import { Shuffler } from "../../Functions/Actions/Shuffler.js";
import "../SingleSp.css";
import "../../styles/AllVoice.css";
import { MdNotStarted } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { GrNext } from "react-icons/gr";

function AllVoiceGame() {
  const { GetList, CurrentListId, setCurrentList, UserLists } =
    useContext(ListsContext);
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
  //30005
  const HandlerLists = async () => {
    setCurrentList(await GetList());
  };

  useEffect(() => {
    HandlerLists();
  }, []);

  const DiscExamples = (lista) => {
    console.log(lista);
    let TempWithExamples = [];
    lista.forEach((element) => {
      if (element.example.length > 0) {
        TempWithExamples = [...TempWithExamples, element];
      }
    });
    return TempWithExamples;
  };

  const startGame = async () => {
    const words = await GetWords(CurrentListId.id);
    const WithExamples = DiscExamples(words);
    const TempSh = Shuffler(WithExamples);
    console.log(TempSh[0].name);
    setRandom(TempSh);
    let text = TempSh[0].name;
    if (TempSh[0].example.length > 0) {
      text = text + " examples";
      TempSh[0].example.forEach((element) => {
        text = text + ". " + element;
      });
    }

    ExampleQuestionsGenerator(TempSh, 0);
    try {
      setLink(await HandleVoice(text));
      setIndex(0);
    } catch (error) {
      console.error("Error al obtener el audio:", error);
    }

    setShowGame(true);
  };

  const Next = async () => {
    setUserResponseArray([]);
    setCheckedList([]);
    setHiddenWords([]);
    setShowCorrection(false);
    setRightWords([]);
    setWrongWords([]);
    setWordMainUser("");
    if (Random[Index + 1]) {
      let text = Random[Index + 1].name;
      if (Random[Index + 1].example.length > 0) {
        console.log(Random[Index + 1].example);
        text = text + " examples";
        Random[Index + 1].example.forEach((element) => {
          text = text + ". " + element;
        });
      }

      try {
        setLink(await HandleVoice(text));
      } catch (error) {
        console.error("Error al obtener el audio:", error);
      }

      ExampleQuestionsGenerator(Random, Index + 1);
      setIndex(Index + 1);
    } else {
      setIndex(0);
      setShowGame(false);
    }
  };

  const CheckResponses = () => {
    console.log(1);
    console.log(UserResponseArray);
    console.log(CheckedList);
    let RightTemp = [];
    let WrongTemp = [];
    let Correction = [];
    if (Random[Index].name !== WordMainUser) {
      setWordMainUser(`${WordMainUser} (${Random[Index].name})`);
    }
    CheckedList.forEach((element) => {
      UserResponseArray.forEach((UserE) => {
        if (element.id === UserE.id && element.exId === UserE.indexExample) {
          if (UserE.word.toLowerCase() === element.word.toLowerCase()) {
            RightTemp = [
              ...RightTemp,
              `${UserE.word}_${UserE.id}_${UserE.indexExample}`,
            ];
            console.log(UserE.word);
          } else {
            const CorrectedWord = {
              user: UserE.word,
              right: element.word,
              id: UserE.id,
              Exid: UserE.indexExample,
            };
            WrongTemp = [
              ...WrongTemp,
              `${element.word}_${element.id}_${element.exId}`,
            ];
            Correction = [...Correction, CorrectedWord];
          }
        }
      });
    });
    let CopyUser = [...UserResponseArray];
    Correction.forEach((element) => {
      CopyUser[
        element.id + element.Exid * 3
      ] = `${element.user} (${element.right})`;
    });
    setRightWords(RightTemp);
    setWrongWords(WrongTemp);
    setShowCorrection(true);
  };

  const ResponseUserHandler = (e, i, indexExample) => {
    if (UserResponseArray.length > 0) {
      UserResponseArray.forEach((element, indexx) => {
        if (element.id == i && element.indexExample == indexExample) {
          const TempResponseArray = [...UserResponseArray];

          TempResponseArray[indexx].word = e;
          setUserResponseArray(TempResponseArray);
        }
      });
    }

    console.log(UserResponseArray);
  };
  const ExampleQuestionsGenerator = (arrayExample, ind) => {
    console.log(1);
    let ListHiddenTemp = [];
    let TempChecked = [];
    arrayExample[ind].example.forEach((text, exampleIndex) => {
      let textSplited = text.split(" ");

      for (let i = textSplited.length - 1; i > 0; i--) {
        let RandomNum = Math.floor(Math.random() * (i + 1));

        let temp = textSplited[i];
        textSplited[i] = textSplited[RandomNum];
        textSplited[RandomNum] = temp;
      }
      const TempHidden = textSplited.slice(0, 3);
      console.log(TempHidden);
      ListHiddenTemp = [...ListHiddenTemp, textSplited.slice(0, 3)];
      console.log(ListHiddenTemp);

      text.split(" ").forEach((word, index) => {
        if (ListHiddenTemp[exampleIndex].includes(word)) {
          if (word.includes("_")) {
            ListHiddenTemp[exampleIndex][
              ListHiddenTemp[exampleIndex].indexOf(word)
            ] = `${word.split("_")[0]}_${index}`;
          } else {
            console.log(word);
            ListHiddenTemp[exampleIndex][
              ListHiddenTemp[exampleIndex].indexOf(word)
            ] = `${word}_${index}`;
          }
        }
        if (TempHidden.includes(word)) {
          const objWord = {
            word: word.toLowerCase().replace(".", "").replace(";", ""),
            id: index,
            exId: exampleIndex,
          };
          TempChecked = [...TempChecked, objWord];
        }
      });
    });
    let UserTemp = [];
    TempChecked.forEach((element) => {
      const tmp = {
        word: "",
        id: element.id,
        indexExample: element.exId,
      };
      UserTemp = [...UserTemp, tmp];
    });
    console.log(Index);
    setUserResponseArray(UserTemp);
    console.log(TempChecked);
    console.log(ListHiddenTemp);
    setCheckedList(TempChecked);
    setHiddenWords(ListHiddenTemp);
  };
  return (
    <div className="MainBackground ">
      {UserLists.length > 0 ? (
        <div className="LittleMainBackground AllVoiceMenu ">
          <h1>Prectice your Listening</h1>
          <div>
            {!ShowGame ? (
              <>
                <select onChange={(e) => setCurrentList(e.target.value)}>
                  {UserLists.map((list, index) => (
                    <option key={index} value={list.id}>
                      {list.title}
                    </option>
                  ))}
                </select>
                <button className="s ActionButtoms" onClick={startGame}>
                  <MdNotStarted />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <p>You dont have lists yet</p>
      )}

      <div>
        {ShowGame && Random && HiddenWords.length > 0 ? (
          <>
            <div className="GameVoice">
              <h2>What did you hear?</h2>
              <div>
                <audio controls src={Link}></audio>
                <div className="WordToComplete">
                  <p>
                    {" "}
                    <span>Word:</span>
                  </p>
                  <input
                    type="text"
                    disabled={ShowCorrection}
                    className={`${
                      Random[Index].name === WordMainUser && ShowCorrection
                        ? "Right"
                        : ""
                    } ${
                      Random[Index].name !== WordMainUser && ShowCorrection
                        ? "Wrong"
                        : ""
                    }`}
                    onChange={(e) => setWordMainUser(e.target.value)}
                    value={WordMainUser}
                  />
                </div>

                <div>
                  <>
                    <div className="AllVExamplesMenu">
                      <div className="AllVE">
                        {Random[Index].example.map((e, indexEx) => (
                          <div key={indexEx} className="inputsAndText">
                            {e.split(" ").map((w, i) =>
                              HiddenWords.length > 0 ? (
                                <>
                                  {HiddenWords[indexEx].includes(
                                    `${w}_${i}`
                                  ) ? (
                                    <>
                                      <input
                                        className={`${
                                          (RightWords.includes(
                                            `(${w.replace(
                                              /[.,!?]/g,
                                              ""
                                            )}_${i}_${indexEx}`
                                          ) ||
                                            RightWords.includes(
                                              `${w
                                                .normalize("NFD")
                                                .replace(/[\u0300-\u036f]/g, "")
                                                .toLowerCase()
                                                .replace(
                                                  /[.,!?]/g,
                                                  ""
                                                )}_${i}_${indexEx}`
                                            )) &&
                                          ShowCorrection
                                            ? "Right"
                                            : ""
                                        } ${
                                          (WrongWords.includes(
                                            `${w.replace(
                                              /[.,!?]/g,
                                              ""
                                            )}_${i}_${indexEx}`
                                          ) ||
                                            WrongWords.includes(
                                              `${w
                                                .normalize("NFD")
                                                .replace(/[\u0300-\u036f]/g, "")
                                                .toLowerCase()
                                                .replace(
                                                  /[.,!?]/g,
                                                  ""
                                                )}_${i}_${indexEx}`
                                            )) &&
                                          ShowCorrection
                                            ? "Wrong"
                                            : ""
                                        } ${
                                          !ShowCorrection
                                            ? "defaultModeInp"
                                            : ""
                                        }`}
                                        key={i}
                                        type="text"
                                        onChange={(element) => {
                                          if (!ShowCorrection) {
                                            ResponseUserHandler(
                                              element.target.value,
                                              i,
                                              indexEx
                                            );
                                          }
                                        }}
                                        onClick={() => {
                                          console.log(WrongWords);
                                          if (
                                            WrongWords.includes(
                                              `${w}_${i}_${indexEx}`
                                            ) &&
                                            ShowCorrection
                                          ) {
                                            +setWordRightToShow(w);
                                          }
                                        }}
                                      />
                                    </>
                                  ) : (
                                    <p key={i}>{w}</p>
                                  )}
                                </>
                              ) : null
                            )}
                          </div>
                        ))}
                      </div>

                      {!ShowCorrection ? (
                        <button
                          className="ActionButtoms"
                          onClick={CheckResponses}
                        >
                          <FaCheck />
                        </button>
                      ) : null}

                      {ShowCorrection ? (
                        <div className="CorrectionMenu">
                          <div>
                            <p>
                              Correcction: <span>{WordRightToShow}</span>
                            </p>
                          </div>

                          <button className="ActionButtoms" onClick={Next}>
                            <GrNext />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </>
                </div>
              </div>
            </div>
          </>
        ) : Random.length > 0 ? (
          <div className="contentp">
            <div className="planet">
              <div className="ring"></div>
              <div className="cover-ring"></div>
              <div className="spots">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <p>loading</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AllVoiceGame;
