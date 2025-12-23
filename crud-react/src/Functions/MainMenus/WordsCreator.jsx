import { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ListsContext } from "../../../Contexts/ListsContext";
import { WordsContext } from "../../../Contexts/WordsContext";
import AutoExamplesList from "../secondary menus/AutoExamples";
import ImageSearch from "../secondary menus/ImageSeach";
import AutoMeaning from "../secondary menus/AutoMeaning";
import "../../styles/Create.css";
import { TbBrightnessAutoFilled } from "react-icons/tb";
import { IoAddCircleSharp } from "react-icons/io5";
import { PiEmptyBold } from "react-icons/pi";
import { DeleteLocalStorage } from "../Actions/DeleteLocalStorage";
import { getDictionaryWord } from "../Actions/Dictionary";

function WordsCreator() {
  const { GetList, UserLists, CurrentListId, setCurrentList } = useContext(ListsContext);
  const {
    GetWords,
    dataForm,
    setDataForm,
    ChoiseImage,
    setChoiseImage,
    Auto,
    setAuto,
    BoolMeaning,
    setBoolMeaning,
    HandlerUpdate,
    AddWord,
  } = useContext(WordsContext);

  const [AddImageBool, setAddImageBool] = useState(false);
  const [AutoSyn, setAutoSyn] = useState(false);
  const [AutoAnt, setAutoAnt] = useState(false);
  const { mode, idCurrentList, titleCurrentList } = useParams();

  const AllTypes = [
    "noun", "verb", "adjective", "adverb", "pronoun",
    "preposition", "conjunction", "interjection", "phrasal verb",
  ];

  const history = useNavigate();

  useEffect(() => {
    GetList();
  }, []);

  const FormHandlerInput = (e) => {
    setDataForm({
      ...dataForm,
      [e.target.name]: e.target.value,
    });
  };

  const AutoDataHandler = async (ASyn, AAnt) => {
    if (ASyn || AAnt) {
      let Meanings = [];
      let AuSynonyms = [];
      let AuAntonyms = [];
      const DictionaryWord = await getDictionaryWord(dataForm.name);

      if (DictionaryWord && DictionaryWord[0] && DictionaryWord[0].meanings) {
        Meanings = DictionaryWord[0].meanings;
        Meanings.forEach((element) => {
          if (element.synonyms) AuSynonyms = [...AuSynonyms, ...element.synonyms];
          if (element.antonyms) AuAntonyms = [...AuAntonyms, ...element.antonyms];
        });

        if (ASyn && AuSynonyms.length > 0) {
          setDataForm((prev) => ({
            ...prev,
            synonyms: AuSynonyms.filter((e, index, array) => array.indexOf(e) === index).join(' ; '),
          }));
        }
        if (AAnt && AuAntonyms.length > 0) {
          setDataForm((prev) => ({
            ...prev,
            antonyms: AuAntonyms.filter((e, index, array) => array.indexOf(e) === index).join(' ; '),
          }));
        }
      }
    }
  };

  const FormHandlerSumbit = async (e) => {
    e.preventDefault();
    if (UserLists.length > 0) {
      if (mode != "update") {
        await AddWord(CurrentListId.id ? [CurrentListId.id] : [UserLists[0].id], DeleteEmptyExample());
      } else {
        HandlerUpdate(idCurrentList, dataForm.id);
        GetWords(idCurrentList);
        history(`/AllWords/${titleCurrentList}/${idCurrentList}`);
      }
      // Reset logic...
      setDataForm({ name: "", meaning: "", past: "", participle: "", gerund: "", type: [], example: [""], image: "", synomyms: "", antonyms: "", id: "" });
      setAuto(false);
      setBoolMeaning(false);
      setAddImageBool(false);
      setChoiseImage("Search");
      setAutoAnt(false);
      setAutoSyn(false);
      DeleteLocalStorage(`Match_${CurrentListId.id}`);
    }
  };

  const DeleteEmptyExample = () => {
    return {
      ...dataForm,
      example: dataForm.example.filter((elemento) => elemento),
    }
  };

  const newExample = (e) => {
    e?.preventDefault();
    setDataForm({
      ...dataForm,
      example: [...dataForm.example, ""],
    });
  };

  const handExampleChange = (index, event) => {
    const values = [...dataForm.example];
    values[index] = event.target.value;
    setDataForm({ ...dataForm, example: values });
  };

  const handleChoiseImage = (e) => {
    setChoiseImage(e.target.value);
    setDataForm({ ...dataForm, image: "" });
  };

  const AddQuitImage = (e) => {
    e.preventDefault();
    setAddImageBool(!AddImageBool);
  };

  const handleCheckboxChange = (t) => {
    if (dataForm.type.includes(t)) {
      setDataForm({ ...dataForm, type: dataForm.type.filter((x) => x !== t) });
    } else {
      setDataForm({ ...dataForm, type: [...dataForm.type, t] });
    }
  };

  return (
    <div className="MainBackground">
      <div className="CreateMenu">
        <h1>{mode == "update" ? "EDIT WORD" : "CREATE WORD"}</h1>
        <div className="MiniCreator">
          <form onSubmit={FormHandlerSumbit}>
            
            {/* --- COLUMNA IZQUIERDA (A) --- */}
            <div className="a">
              <div className="labelAndOption">
                {UserLists.length > 0 && mode !== "update" ? (
                  <select
                    onChange={(e) => setCurrentList(e.target.value)}
                    value={CurrentListId.id}
                  >
                    {UserLists.map((list) => (
                        <option key={list.id} value={{ id: list.id, title: list.title }}>
                          {list.title}
                        </option>
                    ))}
                  </select>
                ) : mode !== "update" ? (
                  <p>You do not have lists yet</p>
                ) : null}
              </div>
              
              <div className="labels">
                {AllTypes.map((t) => (
                  <label key={t}>
                    <input
                      type="checkbox"
                      checked={dataForm.type.includes(t)}
                      onChange={() => handleCheckboxChange(t)}
                    />
                    {t}
                  </label>
                ))}
              </div>

              {/* Text inputs basicos */}
              <div>
                {["name", "past", "participle", "gerund"].map((field) => (
                  <div className="form-control" key={field}>
                    <input
                      className="input input-alt"
                      type="text"
                      name={field}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      onChange={FormHandlerInput}
                      value={dataForm[field]}
                    />
                  </div>
                ))}
              </div>

              <div className="imageMenuContainer">
                <div className="ImageAndButton">
                  <h3>Import Image</h3>
                  <button onClick={AddQuitImage}><IoAddCircleSharp /></button>
                </div>

                {AddImageBool && (
                  <div className="imageOptions">
                    <select value={ChoiseImage} onChange={handleChoiseImage}>
                      <option value="Search">Search</option>
                      <option value="Link">Link</option>
                    </select>

                    <div>
                      {ChoiseImage === "Search" && (
                        <ImageSearch word={dataForm.name} setDataWord={setDataForm} dataWord={dataForm} />
                      )}
                      {ChoiseImage === "Link" && (
                        <input
                          className="input"
                          name="image"
                          type="text"
                          placeholder="Paste image URL here"
                          onChange={FormHandlerInput}
                          value={dataForm.image}
                        />
                      )}
                    </div>

                    {dataForm.image && (
                      <div className="ImagePreview">
                        <img src={dataForm.image} alt="Preview" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* --- COLUMNA DERECHA (B) --- */}
            <div className="b">
              
              {/* Meaning */}
              <div className="meaning">
                <div className="section-header">
                    <button
                      className={`ButtonAuto ${!BoolMeaning ? "off" : "on"}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setBoolMeaning(!BoolMeaning);
                      }}
                      title="Auto Meaning"
                    >
                      <TbBrightnessAutoFilled />
                    </button>
                    <span className="section-label">Description / Meaning</span>
                </div>
                
                <textarea
                  name="meaning"
                  onChange={FormHandlerInput}
                  placeholder="Type description..."
                  value={dataForm.meaning}
                />
              </div>
              {BoolMeaning && <AutoMeaning nombre={dataForm.name} />}
              
              {/* Examples */}
              <div className="examples">
                <div className="section-header">
                  <button
                    className={`ButtonAuto ${!Auto ? "off" : "on"}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setAuto(!Auto);
                    }}
                    title="Auto Examples"
                  >
                    <TbBrightnessAutoFilled />
                  </button>

                  <button className="buttomAdd" onClick={newExample} title="Add Example">
                    <IoAddCircleSharp />
                  </button>
                  <span className="section-label">Examples</span>
                </div>

                {dataForm.example.map((input, index) => (
                  <div key={index} className="example-row">
                    <button className="buttomClearExamples"
                      onClick={(e) =>{
                        e.preventDefault();
                        setDataForm({
                          ...dataForm,
                          example: dataForm.example.filter((_, i) => i != index),
                        })
                      }}
                    >
                      <PiEmptyBold />
                    </button>
                    <input
                      className="Input1"
                      type="text"
                      value={input}
                      placeholder={`Example ${index + 1}`}
                      onChange={(event) => handExampleChange(index, event)}
                    />
                  </div>
                ))}
              </div>
              
              {Auto && (
                <div className="AutoExamples">
                  <AutoExamplesList nombre={dataForm.name} />
                </div>
              )}
              
              {/* Synonyms & Antonyms */}
              <div className="autoSyn">
                {/* Synonyms Row */}
                <div className="autoSyn-row">
                    <button
                      onClick={ async (e) => {
                        e.preventDefault();
                        setAutoSyn(!AutoSyn);
                        await AutoDataHandler(!AutoSyn, AutoAnt);
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
                            placeholder="Synonyms"
                            onChange={(e) => setDataForm({ ...dataForm, synonyms: e.target.value })}
                            value={dataForm.synonyms}
                        />
                    </div>
                </div>

                {/* Antonyms Row */}
                <div className="autoSyn-row">
                    <button
                      onClick={async(e) => {
                        e.preventDefault();
                        setAutoAnt(!AutoAnt);
                        await AutoDataHandler(AutoSyn, !AutoAnt);
                      }}
                      className={`ButtonAuto ${!AutoAnt ? "off" : "on"}`}
                    >
                      <TbBrightnessAutoFilled />
                    </button>
                    <div className="form-control">
                        <input
                            className="input input-alt"
                            type="text"
                            name="antonyms"
                            placeholder="Antonyms"
                            onChange={(e) => setDataForm({ ...dataForm, antonyms: e.target.value })}
                            value={dataForm.antonyms}
                        />
                    </div>
                </div>
              </div>

              <input
                type="submit"
                value={mode === "update" ? "UPDATE" : "CREATE"}
                disabled={UserLists.length === 0}
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