import { BsFillSendCheckFill } from "react-icons/bs";
import { useState, useContext, useEffect } from "react";
import { ListsContext } from "../../Contexts/ListsContext";
import { WordsContext } from "../../Contexts/WordsContext";
import PropTypes from 'prop-types';
// Asegúrate de que el CSS esté importado globalmente o aquí
import "../styles/LyricsAndWords.css";

function AddWordToList({ data, ExtraFunction, CurrentListId = "" }) {
  const [ListsToPost, setListsToPost] = useState([]);
  const { AddWord } = useContext(WordsContext);
  const { GetList, UserLists, setUserLists } = useContext(ListsContext);

  useEffect(() => {
    if (UserLists.length === 0) {
      GetList().then((fetchedLists) => {
        setUserLists(fetchedLists);
      });
    }
  }, []);

  const handleCheckboxChange = (listId) => {
    if (ListsToPost.includes(listId)) {
      setListsToPost(ListsToPost.filter((id) => id !== listId));
    } else {
      setListsToPost([...ListsToPost, listId]);
    }
  };

  const PostData = async () => {
    if (ListsToPost.length === 0) return;
    
    // Enviamos el array de IDs
    await AddWord(ListsToPost, data);
    
    if (ExtraFunction) {
      ExtraFunction();
    }
  };

  // Filtrar listas disponibles (excluyendo la actual)
  const availableLists = UserLists.filter(list => list.id !== CurrentListId);

  return (
    <div className="AddToListCard">
      <h4>Add to List</h4>
      
      {/* Esta clase ListScrollArea ahora tiene tu scrollbar personalizado */}
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

AddWordToList.propTypes = {
  data: PropTypes.object.isRequired,
  ExtraFunction: PropTypes.func,
  CurrentListId: PropTypes.string
};

export default AddWordToList;