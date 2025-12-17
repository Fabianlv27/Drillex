import { createContext, useState, useContext } from "react";
import { ListsContext } from "./ListsContext.jsx";
import { DeleteLocalStorage } from "../src/Functions/Actions/DeleteLocalStorage.js";
import api from "../api/axiosClient.js"; // Importamos Axios
import PropTypes from "prop-types";

const WordsContext = createContext();

const WordsContextProvider = ({ children }) => {
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
    example: [""],
    type: []
  });
  const [ShowConfirmDelete, setShowConfirmDelete] = useState(false);

  const [ChoiseImage, setChoiseImage] = useState("Search");
  const [Auto, setAuto] = useState(false);
  const [BoolMeaning, setBoolMeaning] = useState(false);
  const [SearchBool, setSearchBool] = useState(true);
  const [discriminator, setdiscriminator] = useState(true);
  const [SingleId, setSingleId] = useState("");

  const { CurrentListId } = useContext(ListsContext);

  const GetWords = async (listId, game = 'default', ListName = 'default') => {
    try {
      // Backend Route: /words/{ListId}/{ListName}/{game}
      // Axios usa baseURL, así que solo ponemos la ruta relativa
      const response = await api.get(`/words/${listId}/${ListName}/${game}`);
      const wordsJson = response.data;
     // wordsJson.content.
      console.log(wordsJson);
      if (wordsJson.status) {
        setAllwordsData(wordsJson.content);
      }
      return wordsJson.content;
    } catch (error) {
      console.error("Error getting words", error);
      return [];
    }
  };

  const Move = async (mode, word, idList, id) => {
    console.log(word, idList);
    await AddWord(idList, word);
    if (mode) {
      await HandlerDelete(word.id, id);
    }
  };
  
  const HandlerDelete = async (Wordid, listId) => {
    const idToUse = listId || CurrentListId.id;
    try {
      // Backend Route: /words/{ListId}/{id}
      await api.delete(`/words/${idToUse}/${Wordid}`);
      
      DeleteLocalStorage(`Match_${CurrentListId.id}`);
      GetWords(idToUse);
      setShowConfirmDelete(false);
    } catch (error) {
      console.error("Error deleting word", error);
    }
  };

  const AddWord = async (listId, data) => {
    const idToUse = listId || [CurrentListId.id];
    const dataToSend = data || dataForm;

    if (!dataToSend.image) {
      dataToSend.image = "";
    }
    if (!idToUse) {
      console.error("No CurrentListId provided to AddWord");
      return;
    }

    try {
      // Backend Route: /words
      await api.post("/words", {
        ...dataToSend,
        ListsId: Array.isArray(idToUse) ? idToUse : [idToUse], // Aseguramos que sea array
      });
    } catch (error) {
      console.error("Error adding word", error);
    }
  };

  const HandlerUpdate = async (listid, wordId) => {
    try {
      // Backend Route: /Edit/{ListId}/{WordId}
      await api.put(`/Edit/${listid}/${wordId}`, dataForm);
    } catch (error) {
      console.error("Error updating word", error);
    }
  };

  return (
    <WordsContext.Provider
      value={{
        AllwordsData,
        setAllwordsData,
        dataForm,
        setDataForm,
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