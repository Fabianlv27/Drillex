import { createContext, useState, useContext } from "react";
import { Context } from "./Context.jsx";
import { ListsContext } from "./ListsContext.jsx";
import { DeleteLocalStorage } from "../src/Functions/Actions/DeleteLocalStorage.js";
import { GetLocalHost } from "../api/api.js"; 


import PropTypes from "prop-types";
const WordsContext = createContext();
const WordsContextProvider = ({ children }) => {
   const {getTokenFromCookies}=GetLocalHost()
  const token=getTokenFromCookies()
  const [AllwordsData, setAllwordsData] = useState([]);
  const [dataForm, setDataForm] = useState({
    name: "",
    meaning: "",
    past: "",
    participle: "",
    gerund: "",
    synomyms: "",
    antonyms: "",
    image: "",
    example:[""],
    type:[]
  });
  const [ShowConfirmDelete, setShowConfirmDelete] = useState(false);

  const [ChoiseImage, setChoiseImage] = useState("Search");
  const [Auto, setAuto] = useState(false);
  const [BoolMeaning, setBoolMeaning] = useState(false);
  const [SearchBool, setSearchBool] = useState(true);
  const [discriminator, setdiscriminator] = useState(true);
  //Para cuando se haga un update
  const [SingleId, setSingleId] = useState("");

  const {Ahost } = useContext(Context); // Usa el token del contexto
  const { CurrentListId } = useContext(ListsContext);

  const GetWords = async (listId,game='default',ListName='default') => {
    let wordsJson;
    if (token != undefined) {
      const words = await fetch(`${Ahost}/words/${token}/${listId}/${ListName}/${game}`);
      wordsJson = await words.json();
      console.log(wordsJson);
      if (!wordsJson.status) {
       //window.location.href="/AllLists"
      }
      setAllwordsData(wordsJson.content);
    }
    return wordsJson.content;
  };

  const Move = async (mode, word, idList,id) => {
    console.log(word,idList)
    await AddWord(idList,word)
    if (mode) {
   await HandlerDelete(word.id,id)
    }
  };
  
  const HandlerDelete = async (Wordid,listId) => {
    const idToUse = listId || CurrentListId.id;

    await fetch(`${Ahost}/words/${token}/${idToUse}/${Wordid}`, {
      method: "DELETE",
    });
    DeleteLocalStorage(`Match_${CurrentListId.id}`);

    GetWords(idToUse);
    setShowConfirmDelete(false);
  };

  const AddWord = async (listId,data) => {
    const idToUse = listId || [CurrentListId.id];
    console.log(idToUse)
    console.log(data)
    if (!data.image) {
      data.image=""
      console.log(data)
    }
    if (!idToUse) {
      console.error("No CurrentListId provided to AddWord");
      return;
    }
    await fetch(`${Ahost}/words/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data||dataForm,
        ListsId: idToUse, // Usa el id de la lista actual
      }),
    });
  };

  const HandlerUpdate = async (listid,wordId) => {
    console.log(dataForm)
    await fetch(`${Ahost}/Edit/${token}/${listid}/${wordId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataForm),
    });
  };
  return (
    <WordsContext.Provider
      value={{
        AllwordsData,
        setAllwordsData,
        dataForm,
        setDataForm,
        Image,
        GetWords,
        ChoiseImage,
        setChoiseImage,
        Auto,
        setAuto,
        BoolMeaning,
        setBoolMeaning,
        SearchBool,
        setSearchBool,
        discriminator,
        setdiscriminator,
        Move,
        HandlerDelete,
        ShowConfirmDelete,
        setShowConfirmDelete,
        HandlerUpdate,
        SingleId,
        setSingleId,
        AddWord,
      }}
    >
      {children}
    </WordsContext.Provider>
  );
};

WordsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { WordsContext, WordsContextProvider };
