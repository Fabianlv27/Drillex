import { v4 as uuidv4 } from "uuid";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../../Contexts/Context";
import { ListsContext } from "../../../Contexts/ListsContext";
import { WordsContext } from "../../../Contexts/WordsContext";
import AutoExamplesList from "../secondary menus/AutoExamples";
import ImageSearch from "../secondary menus/ImageSeach";
import AutoMeaning from "../secondary menus/AutoMeaning";
import "../../styles/Create.css";
import { TbBrightnessAutoFilled } from "react-icons/tb";
import { IoAddCircleSharp } from "react-icons/io5";
import { IoCloudUploadOutline } from "react-icons/io5";
import { PiEmptyBold } from "react-icons/pi";
import EditWord from "../secondary menus/EditWord";
import { DeleteLocalStorage } from "../Actions/DeleteLocalStorage";

function WordsCreator() {
  const { GetList, UserLists, CurrentListId, setCurrentList, SingleId } =
    useContext(ListsContext);
  const { GetWords, dataForm, setDataForm, Udpate, setSearchBool, searchBool,    ChoiseImage,
    setChoiseImage,   Auto,
    setAuto,    BoolMeaning,
    setBoolMeaning,} =
    useContext(WordsContext);
  const [CookieDataUser, setCookieDataUser] = useState("");
  const [AddImageBool, setAddImageBool] = useState(false);

  const types = [
    "noun",
    "verb",
    "adjective",
    "adverb",
    "pronoun",
    "preposition",
    "conjunction",
    "interjection",
    "phrasal verb",
  ];

  const history = useNavigate();
  const uniqueID = uuidv4();

  const {
    host
  } = useContext(Context);

  const FormHandlerInput = (e) => {
    setDataForm({
      ...dataForm,
      [e.target.name]: e.target.value,
    });
  };

  const FormHandlerSumbit = async (e) => {
    e.preventDefault();

    console.log(UserLists);
    if (UserLists.length > 0) {
      if (!Udpate) {
        console.log("creating..");
        let Meanings = [{ partOfSpeech: "unknow" }];
        let partofSpeech = [];
        
        let AuSynonyms = [];
        let AuAntonyms = [];
        let AcAnt = "";
        let AcSyn = "";
        if (HandleAnt.length != []) {
          AcAnt = HandleAnt;
        }
        if (HandleSym.length != []) {
          AcSyn = HandleSym;
        }

        console.log(AcAnt);
        let AcEx = "";
        console.log(examples);
        examples.forEach((ex) => {
          console.log(ex);
          if (AcEx != "") {
            AcEx = `${AcEx} ; ${ex}`;
          } else {
            AcEx = `${ex}`;
          }
        });
        try {
          const diccionary = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${dataForm.name}`
          );
          if (!diccionary.ok) {
            throw new Error(
              `the word ${dataForm.name} doesnt is in the diccionary`
            );
          } else {
            const diccionaryJson = await diccionary.json();

            Meanings = diccionaryJson[0].meanings;

            Meanings.forEach((element) => {
              console.log(element.partOfSpeech);
              partofSpeech = [...partofSpeech, element.partOfSpeech];
              AuSynonyms = element.synonyms;
              AuAntonyms = element.antonyms;
            });
            console.log(partofSpeech);

            AuSynonyms = AuSynonyms.filter(
              (e, index, array) => array.indexOf(e) === index
            );
            AuAntonyms = AuAntonyms.filter(
              (e, index, array) => array.indexOf(e) === index
            );

            if (AutoSyn) {
              AuSynonyms.forEach((element) => {
                AcSyn = `${HandleSym} ; ${element} `;
              });
            }
            if (AutoAnt) {
              AuAntonyms.forEach((element) => {
                AcAnt = `${HandleAnt} ; ${element} `;
              });
            }

            //console.log(Meanings)
          }
        } catch (error) {
          console.error("se produjo un error");
          //const Meanings="unknow"
        }
        console.log(AcEx, AcSyn, AcAnt);
        const formDataWithExamples = {
          ...dataForm,
          id: uniqueID,
          example: AcEx,
          type: TypesToPost,
          kind: partofSpeech,
          image: Image,
          synonyms: AcSyn,
          antonyms: AcAnt,
        };
        console.log(formDataWithExamples);
        await fetch(`${host}/words/${CookieDataUser}/${CurrentListId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formDataWithExamples),
        });
      } else {
        console.log("updating");
        let ex = "";
        examples.forEach((element) => {
          if (ex != "") {
            ex = `${ex} ; ${element}`;
          } else {
            ex = `${element}`;
          }
        });

        const HandleSumbit2 = async () => {
          const formDataUdpate = {
            ...dataForm,
            example: ex,
            image: Image,
            synonyms: HandleSym,
            antonyms: HandleAnt,
            type: TypesToPost,
          };
          await fetch(
            `${host}/Edit/${CookieDataUser}/${CurrentListId}/${SingleId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formDataUdpate),
            }
          );
        };
        HandleSumbit2();
        GetWords(CookieDataUser, CurrentListId);
        history("/AllWords");
      }

      GetWords(CookieDataUser, CurrentListId);

      setDataForm({
        name: "",
        meaning: "",
        past: "",
        participle: "",
        gerund: "",
      });
      setexamples([""]);
      setVoiceURLString("");
      setImage("");
      setAuto(false);
      setBoolMeaning(false);
      setChoiseImage("Import");
      setTypesToPost([]);
      setHandleSym([]);
      setHandleAnt([]);
      setAutoAnt(false);
      setAutoSyn(false);
      DeleteLocalStorage(`Match_${CurrentListId}`);

      console.log("hecho");
    }
  };

  const Clear = (e) => {
    e.preventDefault();
    console.log("Empty");

    const ExamplesWithoutEmpty = examples.filter((elemento) => elemento);
    console.log(ExamplesWithoutEmpty);
    setexamples(ExamplesWithoutEmpty);
  };

  const newExample = () => {
    const values = [...examples, ""];
    setexamples(values);
  };

  const handExampleChange = (index, event) => {
    const values = [...examples];
    values[index] = event.target.value;
    setexamples(values);
  };
  const handleChoiseImage = (e) => {
    setChoiseImage(e.target.value);
    setImage("");
  };
  const AddQuitImage = (e) => {
    e.preventDefault();
    setAddImageBool(!AddImageBool);
  };
  const HandleImgUpload = (e) => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setImage(url);
  };
  const ContentChoices = {
    Import: (
      <div className="ImpSeaLink">
        <div class="file-upload">
          <input
            type="file"
            id="file"
            accept="image/*"
            class="file-input"
            onChange={HandleImgUpload}
          />
          <label for="file" class="file-label">
            <span id="file-name">Selecciona un archivo</span>
            <button type="button" class="file-button">
              <IoCloudUploadOutline />
            </button>
          </label>
        </div>

        {Image && (
          <div>
            <h3>Image:</h3>
            <img src={Image} alt="Image Upload" style={{ maxWidth: "100%" }} />
          </div>
        )}
      </div>
    ),
    Search: (
      <>
        {setSearchBool(true)}

        <ImageSearch default={dataForm.name} />
        {Image && (
          <div>
            {setSearchBool(false)}
            <h3>Image</h3>
            <img src={Image} style={{ maxWidth: "100%" }} />
          </div>
        )}
      </>
    ),
    Link: (
      <div>
        <form className="link">
          <input type="text" onChange={(e) => setImage(e.target.value)} />
        </form>
        {Image && (
          <div>
            <h3>Image</h3>
            <img src={Image} style={{ maxWidth: "100%" }} />
          </div>
        )}
      </div>
    ),
  };
  const HandleAutoExample = (e) => {
    e.preventDefault();
    setAuto(!Auto);
  };

  const HandleAutoMeaning = (e) => {
    e.preventDefault();
    setBoolMeaning(!BoolMeaning);
  };

  useEffect(() => {
    try {
      const cookies = document.cookie;
      console.log(cookies);
      const cookiesArray = cookies.split(";");

      cookiesArray.forEach(async (cookie) => {
        const [name, value] = cookie.trim().split("=");
        if (name === "e") {
          setCookieDataUser(value);

          const data = await fetch(`${host}/users/Lists/${value}`);
          const dj = await data.json();
          if (!CurrentListId) {
            setCurrentList(dj[0].id);
          }

          console.log(dj);
          setListas(dj);
        }
      });
    } catch (error) {
      window.location.href = `${host}/register`;
    }
    // HandlerLists()
  }, []);
  const handleCheckboxChange = (e) => {
    if (TypesToPost.includes(e)) {
      const temp = [...TypesToPost].filter((x) => x != e);
      setTypesToPost(temp);
    } else {
      console.log([...TypesToPost, e]);
      setTypesToPost([...TypesToPost, e]);
    }
  };

  return (
    <div className="MainBackground">
      <div className="CreateMenu">
        <div className="spikes">
          <h1>{Udpate ? "EDIT WORDS" : "CREATE WORDS"}</h1>
        </div>

        <div className="MiniCreator semicircle">
          <form onSubmit={FormHandlerSumbit}>
            <div className="a">
              <div className="labelAndOption">
                {Listas.length > 0 && !Udpate ? (
                  <select onChange={(e) => setCurrentList(e.target.value)}>
                    {Listas.map((list, index) =>
                      list.id == CurrentListId ? (
                        <option key={index} selected value={list.id}>
                          {list.title}
                        </option>
                      ) : (
                        <option key={index} value={list.id}>
                          {list.title}
                        </option>
                      )
                    )}
                  </select>
                ) : !Udpate ? (
                  <p>You dont have lists yet</p>
                ) : null}
                <div className="labels">
                  {types.map((e, index) => (
                    <label key={index}>
                      <input
                        type="checkbox"
                        checked={TypesToPost.includes(e)}
                        onChange={() => {
                          handleCheckboxChange(e);
                        }}
                      />
                      {e}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="form-control">
                  <input
                    className="input input-alt"
                    type="text"
                    name="name"
                    required
                    placeholder="Name"
                    onChange={FormHandlerInput}
                    value={dataForm.name}
                  />
                  <span class="input-border input-border-alt"></span>
                </div>

                <div className="form-control">
                  <input
                    className="input input-alt"
                    type="text"
                    name="past"
                    placeholder="Past Tense"
                    onChange={FormHandlerInput}
                    value={dataForm.past}
                  />
                  <span class="input-border input-border-alt"></span>
                </div>

                <div className="form-control">
                  <input
                    className="input input-alt"
                    type="participle"
                    name="participle"
                    placeholder="Past Participle"
                    onChange={FormHandlerInput}
                    value={dataForm.participle}
                  />
                  <span class="input-border input-border-alt"></span>
                </div>

                <div className="form-control">
                  <input
                    className="input input-alt"
                    type="text"
                    name="gerund"
                    placeholder="Gerund"
                    onChange={FormHandlerInput}
                    value={dataForm.gerund}
                  />
                  <span class="input-border input-border-alt"></span>
                </div>
              </div>
              <div className="imageMenuContainer">
                <div className="ImageAndButton">
                  <h3>Import Image</h3>
                  <button onClick={AddQuitImage}>
                    <IoAddCircleSharp />
                  </button>
                </div>

                {AddImageBool ? (
                  <div className="imageOptions">
                    <select value={ChoiseImage} onChange={handleChoiseImage}>
                      <option value="Import">Import Image</option>
                      <option
                        value="Search"
                        onClick={() => {
                          setSearchBool(true);
                          console.log("press");
                        }}
                      >
                        Search
                      </option>
                      <option value="Link">link</option>
                    </select>

                    <div>{ContentChoices[ChoiseImage]}</div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="b">
              <div className="meaning">
                <button
                  className={`ButtonAuto ${!BoolMeaning ? "off" : "on"}`}
                  onClick={HandleAutoMeaning}
                >
                  <TbBrightnessAutoFilled />
                </button>
                <textarea
                  name="meaning"
                  onChange={FormHandlerInput}
                  placeholder="Description"
                  value={dataForm.meaning}
                  cols="30"
                  rows="10"
                ></textarea>
              </div>

              {BoolMeaning ? <AutoMeaning nombre={dataForm.name} /> : null}
              <div className="examples">
                <div>
                  <button
                    className={`ButtonAuto ${!Auto ? "off" : "on"}`}
                    onClick={HandleAutoExample}
                  >
                    <TbBrightnessAutoFilled />
                  </button>
                  <button
                    className="buttomClearExamples"
                    onClick={(e) => {
                      e.preventDefault();
                      Clear(e);
                    }}
                  >
                    <PiEmptyBold />
                  </button>
                  <button
                    className="buttomClearExamples"
                    onClick={(e) => {
                      e.preventDefault();
                      newExample();
                    }}
                  >
                    <IoAddCircleSharp />
                  </button>
                </div>

                {examples.map((input, index) => (
                  <input
                    className="Input1"
                    key={index}
                    type="text"
                    value={input}
                    placeholder={`example ${index + 1}`}
                    onChange={(event) => handExampleChange(index, event)}
                  />
                ))}
              </div>
              {Auto ? (
                <div className="AutoExamples">
                  <AutoExamplesList nombre={dataForm.name} />
                </div>
              ) : null}

              <div className="autoSyn">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setAutoSyn(!AutoSyn);
                  }}
                  className={`ButtonAuto ${!AutoSyn ? "off" : "on"}`}
                >
                  <TbBrightnessAutoFilled />
                </button>
                <div className="form-control">
                  <input
                    className="input input-alt"
                    type="text"
                    name="synonyms"
                    placeholder='synonyms (Separe it using ",")'
                    onChange={(e) => setHandleSym(e.target.value)}
                    value={HandleSym}
                  />
                  <span class="input-border input-border-alt"></span>
                </div>

                <div className="autoSyn">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setAutoAnt(!AutoAnt);
                    }}
                    className={`ButtonAuto ${!AutoAnt ? "off" : "on"}`}
                  >
                    <TbBrightnessAutoFilled />
                  </button>
                </div>
                <div className="form-control">
                  <input
                    className="input input-alt"
                    type="text"
                    name="antonyms"
                    placeholder='Antonyms (Separe it using ",")'
                    onChange={(e) => setHandleAnt(e.target.value)}
                    value={HandleAnt}
                  />
                  <span class="input-border input-border-alt"></span>
                </div>
              </div>

              <input
                type="submit"
                name="CreateWord"
                disabled={Listas.length == 0}
                className="send"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default WordsCreator;
