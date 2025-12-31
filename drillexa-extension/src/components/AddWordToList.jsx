import { BsFillSendCheckFill } from "react-icons/bs";
import { useState, useContext, useEffect } from "react";
// RUTAS CORREGIDAS
import { ListsContext } from "../Contexts/ListsContext";
import { WordsContext } from "../Contexts/WordsContext";

function AddWordToList({ 
    data, 
    ExtraFunction, 
    CurrentListId = "",
    // Props Opcionales para Extensión
    userLists: propUserLists,
    addWordFunction: propAddWordFunction,
    fetchListsFunction 
}) {
  const listContext = useContext(ListsContext);
  const wordsContext = useContext(WordsContext);

  // --- CORRECCIÓN DE SEGURIDAD ---
  // 1. Obtenemos el valor crudo (Props o Contexto)
  const rawLists = propUserLists || listContext?.UserLists;
  
  // 2. Forzamos que sea un Array. Si no es array, usamos []
  const UserLists = Array.isArray(rawLists) ? rawLists : [];

  const GetList = fetchListsFunction || listContext?.GetList || (async () => []);
  const AddWord = propAddWordFunction || wordsContext?.AddWord || (async () => console.log("No add function"));

  const [ListsToPost, setListsToPost] = useState([]);

  useEffect(() => {
    // Si no hay listas cargadas (y estamos seguros de que UserLists es un array vacío)
    if (UserLists.length === 0 && typeof GetList === 'function') {
        GetList().then((fetchedLists) => {
             // Lógica de actualización (manejada por el padre o contexto)
        });
    }else{
      console.log(UserLists)
    }
  }, []); // Se ejecuta una vez al montar

  const handleCheckboxChange = (listId) => {
    if (ListsToPost.includes(listId)) {
      setListsToPost(ListsToPost.filter((id) => id !== listId));
    } else {
      setListsToPost([...ListsToPost, listId]);
    }
  };

  const PostData = async () => {
    if (ListsToPost.length === 0) return;
    await AddWord(ListsToPost, data);
    if (ExtraFunction) {
      ExtraFunction();
    }
  };

  // Ahora esto es seguro porque UserLists siempre es un array
  const availableLists = UserLists.filter(list => list.id !== CurrentListId);

  return (
    <div className="AddToListCard">
      <h4>Add to List</h4>
      
      <div className="ListScrollArea">
        {availableLists.length > 0 ? (
          availableLists.map((list) => (
            <label key={list.id} className="ListOption">
              <input
                type="checkbox"
                checked={ListsToPost.includes(list.id)}
                onChange={() => handleCheckboxChange(list.id)}
              />
              <span>{list.title}</span>
            </label>
          ))
        ) : (
          <p style={{ color: '#aaa', textAlign: 'center', fontSize: '0.8rem', padding: '10px' }}>
            No other lists found.
          </p>
        )}
      </div>

      <button
        className="BtnSendList"
        onClick={PostData}
        disabled={ListsToPost.length === 0}
        title="Confirm selection"
      >
        <BsFillSendCheckFill /> 
        <span>Add Words</span>
      </button>
    </div>
  );
}

export default AddWordToList;