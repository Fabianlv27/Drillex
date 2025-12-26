import { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WordsContext } from "../../../Contexts/WordsContext";
import { ListsContext } from "../../../Contexts/ListsContext";
import { Context } from "../../../Contexts/Context";
import { FaCheck } from "react-icons/fa";
import { IoAddCircleSharp } from "react-icons/io5";
import { CiPlay1 } from "react-icons/ci";
import { MdOutlineModeEdit, MdDeleteOutline, MdOutlineDriveFileMove } from "react-icons/md";
import { BsXLg } from "react-icons/bs";
import { GrPrevious, GrNext } from "react-icons/gr";
import ConfirmDelete from "../Actions/ConfirmDelete";
import ElementCard from "../secondary menus/ElementCard"; // <--- IMPORTANTE: Importar el modal
import "../../styles/SeeWords.css";
import "../SingleSp.css";

// --- COMPONENTE TARJETA DE PALABRA ---
const WordCard = ({ word, onPlay, onEdit, onDelete, onMove, onWordClick }) => {
  return (
    <div className="SingleWordCard">
      <div className="WordContent">
        {/* Al hacer click aquí se abre el ElementCard */}
        <h3 onClick={() => onWordClick(word)} style={{cursor: 'pointer'}} title="View Details">
            {word.name}
        </h3>
        <p className="WordMeaning">{word.meaning}</p>
      </div>
      
      <div className="WordActions">
        <button onClick={() => onPlay(word.name)} title="Listen">
          <CiPlay1 />
        </button>
        <button onClick={() => onEdit(word)} title="Edit">
          <MdOutlineModeEdit />
        </button>
        <button onClick={() => onDelete(word.id_Word)} title="Delete">
          <MdDeleteOutline />
        </button>
        <button onClick={() => onMove(word)} title="Move/Copy">
          <MdOutlineDriveFileMove />
        </button>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
function AllWords() {
  const { listName, idCurrentList } = useParams();
  const history = useNavigate();
  const audioRef = useRef(null);

  // Contextos
  const { setAllwordsData, AllwordsData, GetWords, setDataForm, Move, HandlerDelete } = useContext(WordsContext);
  const { GetList, UserLists, editList, deleteList } = useContext(ListsContext);
  const { HandleVoice, SelectedObjects, setSelectedObjects } = useContext(Context); // <--- Usamos SelectedObjects

  // Estados Locales
  const [ShowConfirmDelete, setShowConfirmDelete] = useState(false);
  const [ShowConfirmDeleteList, setShowConfirmDeleteList] = useState(false);
  const [ShowEditListMenu, setShowEditListMenu] = useState(false);
  const [ShowMoveMenu, setShowMoveMenu] = useState(false);
  
  // Estado para Mover
  const [WordToMove, setWordToMove] = useState(null);
  const [DeleteMode, setDeleteMode] = useState(false);
  
  const [NewTitle, setNewTitle] = useState("");
  const [tempId, settempId] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    GetList();
    const fetchWords = async () => {
      try {
        const words = await GetWords(idCurrentList, 'default', listName);
        setAllwordsData(Array.isArray(words) ? words : []);
      } catch (error) {
        console.error(error);
        setAllwordsData([]);
      }
    };
    fetchWords();
  }, [idCurrentList]);

  // Audio Logic
  const playSound = async (text) => {
    const url = await HandleVoice(text);
    audioRef.current = new Audio(url);
    audioRef.current.play();
  };

  // Handlers
  const handleWordClick = (word) => {
      // Agregamos la palabra al contexto para que ElementCard la detecte
      // Usamos un array nuevo con la palabra seleccionada (o apilada si prefieres historial)
      setSelectedObjects([word]); 
  };

  const handleEditList = () => {
    if(NewTitle.trim()) {
        editList(idCurrentList, NewTitle);
        window.location.href = `/AllWords/${NewTitle}/${idCurrentList}`;
    }
  };

  const handleDeleteList = async () => {
    await deleteList(idCurrentList);
    window.location.href = `/AllLists`;
  };

  const handleEditWord = (word) => {
    setDataForm(word);
    history(`/createWords/update/${idCurrentList}/${listName}`);
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWords = AllwordsData ? AllwordsData.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = AllwordsData ? Math.ceil(AllwordsData.length / itemsPerPage) : 0;

  return (
    <div className="MainBackground MyWords">
      
      {/* 1. ELEMENT CARD (MODAL DE DETALLES) */}
      {/* Se muestra automáticamente si hay objetos seleccionados en el contexto */}
      {SelectedObjects.length > 0 && (
          <ElementCard CurrentListId={idCurrentList} />
      )}

      {/* HEADER & ACTIONS */}
      <div className="WordsHeader">
        <h1>{listName}</h1>
        <div className="HeaderButtons">
            <button className="ActionButtoms" onClick={() => {
                 setDataForm({ name: "", meaning: "", example: [""], type: [], image: "" });
                 history("/createWords/create");
            }}>
                <IoAddCircleSharp />
            </button>
            <button className="ActionButtoms" onClick={() => setShowEditListMenu(true)}>
                <MdOutlineModeEdit />
            </button>
            <button className="ActionButtoms" onClick={() => setShowConfirmDeleteList(true)}>
                <MdDeleteOutline />
            </button>
        </div>

        {/* Edit List Name Modal */}
        {ShowEditListMenu && (
            <div className="ListEditModal">
                <input 
                    type="text" 
                    placeholder="New List Name" 
                    onChange={(e) => setNewTitle(e.target.value)} 
                />
                <div className="EditActions">
                    <button onClick={() => setShowEditListMenu(false)} className="ActionButtoms2 cancel"><BsXLg /></button>
                    <button onClick={handleEditList} className="ActionButtoms2 confirm"><FaCheck /></button>
                </div>
            </div>
        )}
      </div>

      {/* WORDS GRID */}
      <div className="WordsContainer">
        {currentWords.length > 0 ? (
            currentWords.map((word, i) => (
                <WordCard 
                    key={word.id_Word || i}
                    word={word}
                    onWordClick={handleWordClick} 
                    onPlay={playSound}
                    onEdit={handleEditWord}
                    onDelete={(id) => { settempId(id); setShowConfirmDelete(true); }}
                    onMove={(w) => { setWordToMove(w); setShowMoveMenu(true); }}
                />
            ))
        ) : (
            <div className="EmptyState">
                <p>No words yet. Add some!</p>
            </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="PaginationControls">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="PageBtn">
                <GrPrevious />
            </button>
            <span className="PageInfo">{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="PageBtn">
                <GrNext />
            </button>
        </div>
      )}

      {/* MODALS EXTRA (Delete, Move) */}
      <ConfirmDelete 
         ShowConfirmDelete={ShowConfirmDelete} 
         setShowConfirmDelete={setShowConfirmDelete}
         HandlerDelete={async () => { await HandlerDelete(tempId, idCurrentList); setShowConfirmDelete(false); }}
      />

      <ConfirmDelete 
         ShowConfirmDelete={ShowConfirmDeleteList} 
         setShowConfirmDelete={setShowConfirmDeleteList}
         HandlerDelete={handleDeleteList}
      />

      {ShowMoveMenu && (
          <div className="ModalOverlay">
              <div className="MoveMenuModal">
                  <h3>Move "{WordToMove?.name}" to:</h3>
                  <button className="CloseModalBtn" onClick={() => setShowMoveMenu(false)}><BsXLg /></button>
                  
                  <div className="MoveOptions">
                      <label className="DeleteCheck">
                          <input type="checkbox" onChange={() => setDeleteMode(!DeleteMode)} />
                          Delete from current list after moving?
                      </label>
                      
                      <div className="TargetLists">
                          {UserLists.filter(l => l.id !== idCurrentList).map((list) => (
                              <button 
                                key={list.id} 
                                className="ListTargetBtn"
                                onClick={() => {
                                    Move(DeleteMode, WordToMove, [list.id], idCurrentList);
                                    setShowMoveMenu(false);
                                }}
                              >
                                  {list.title}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}

export default AllWords;