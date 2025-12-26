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
import { FiTrash } from "react-icons/fi";

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
  
  // LÍMITE DE EJEMPLOS (Para que no explote el backend)
  const MAX_EXAMPLES = 4;

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

        // Aplicamos slice(0, 100) y join para respetar límites si la auto-generación trae mucho texto
        if (ASyn && AuSynonyms.length > 0) {
          const synText = AuSynonyms.filter((e, i, a) => a.indexOf(e) === i).join(' ; ');
          setDataForm((prev) => ({
            ...prev,
            synonyms: synText.slice(0, 100), // Límite Backend
          }));
        }
        if (AAnt && AuAntonyms.length > 0) {
          const antText = AuAntonyms.filter((e, i, a) => a.indexOf(e) === i).join(' ; ');
          setDataForm((prev) => ({
            ...prev,
            antonyms: antText.slice(0, 100), // Límite Backend
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
        console.log(dataForm)
        HandlerUpdate(idCurrentList, dataForm.id_Word);
        GetWords(idCurrentList);
        history(`/AllWords/${titleCurrentList}/${idCurrentList}`);
      }
      // Reset logic...
      setDataForm({ name: "", meaning: "", past: "", participle: "", gerund: "", type: [], example: [""], image: "", synomyms: "", antonyms: "", id_Word: "" });
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
    // Validamos el límite antes de añadir
    if (dataForm.example.length < MAX_EXAMPLES) {
        setDataForm({
        ...dataForm,
        example: [...dataForm.example, ""],
        });
    }
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

  // Manejador de Tipos (Ahora sin checkbox explícito, solo toggle)
  const toggleType = (t) => {
    if (dataForm.type.includes(t)) {
      setDataForm({ ...dataForm, type: dataForm.type.filter((x) => x !== t) });
    } else {
      setDataForm({ ...dataForm, type: [...dataForm.type, t] });
    }
  };

  return (
    <div className="MainBackground MainBackgroundC">
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
              
              {/* NUEVA SECCIÓN DE TIPOS (TAGS) */}
              <div className="type-container">
                {AllTypes.map((t) => (
                  <div 
                    key={t}
                    className={`type-tag ${dataForm.type.includes(t) ? 'active' : ''}`}
                    onClick={() => toggleType(t)}
                  >
                    {t}
                  </div>
                ))}
              </div>

              {/* Text inputs basicos (LIMITADOS A 50 chars) */}
              <div>
                {["name", "past", "participle", "gerund"].map((field) => (
                  <div className="form-control" key={field}>
                    <input
                      className="input-alt"
                      type="text"
                      name={field}
                      maxLength={50} // Límite Backend
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
                          maxLength={150} // Límite Backend
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
                  // Textarea no suele tener maxLength corto, pero puedes poner 65000 si quieres ser estricto
                  maxLength={65000} 
                  placeholder="Type description..."
                  value={dataForm.meaning}
                />
              </div>
              {BoolMeaning && <AutoMeaning nombre={dataForm.name} />}
              
              {/* Examples (LIMITADO) */}
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
                  
                  {/* BOTÓN DESAPARECE SI ALCANZAS EL LÍMITE */}
                  {dataForm.example.length < MAX_EXAMPLES && (
                    <button className="buttomAdd" onClick={newExample} title="Add Example">
                        <IoAddCircleSharp />
                    </button>
                  )}
                  
                  <span className="section-label">Examples ({dataForm.example.length}/{MAX_EXAMPLES})</span>
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
                     <FiTrash />
                    </button>
                    <input
                      className="Input1"
                      type="text"
                      value={input}
                      maxLength={70} // Límite prudente para que quepan 3 o 4 en 200 chars
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
              
              {/* Synonyms & Antonyms (LIMITADO A 100) */}
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
                            className="input-alt"
                            type="text"
                            name="synonyms"
                            maxLength={100} // Límite Backend
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
                            className="input-alt"
                            type="text"
                            name="antonyms"
                            maxLength={100} // Límite Backend
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