import { useContext, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { WordsContext } from "../../../Contexts/WordsContext"; // Contexto de palabras
import { ListsContext } from "../../../Contexts/ListsContext"; // Contexto de listas
import { Context } from "../../../Contexts/Context"; // Contexto de listas
import { useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
//Usar la url en lugar del usestate para evitar problemas de renderizado
import "../../styles/SeeWords.css";
import "../SingleSp.css";
import { IoAddCircleSharp } from "react-icons/io5";
import { CiPlay1 } from "react-icons/ci";
import { MdOutlineModeEdit } from "react-icons/md";
import { MdDeleteOutline } from "react-icons/md";
import { MdOutlineDriveFileMove } from "react-icons/md";
import ElementCard from "../secondary menus/ElementCard";
import ConfirmDelete from "../Actions/ConfirmDelete";
import { BsXLg } from "react-icons/bs";
//si la lista no existe redirigir a Hero
function AllWords() {
  const {
    setAllwordsData,
    AllwordsData,
    GetWords,
    setDataForm,
    Move,
    HandlerDelete,
  } = useContext(WordsContext); // Cambiado para usar WordsContext

  const [ShowConfirmDelete, setShowConfirmDelete] = useState(false);
  const [ShowConfirmDeleteList, setShowConfirmDeleteList] = useState(false);
  const [NewTitle, setNewTitle] = useState("");
  const { GetList, UserLists, editList, deleteList } = useContext(ListsContext); // Cambiado para usar ListsContext
  const { listName, idCurrentList } = useParams();
  const { HandleVoice, setSelectedObjects, SelectedObjects } =
    useContext(Context); // Cambiado para usar ListsContext
  const [SelectCard, setSelectCard] = useState(0);
  const history = useNavigate();
  const audioRef = useRef(null);
  const [Newjson, setNewjson] = useState({
    name: "",
    meaning: "",
    past: "",
    participle: "",
    gerund: "",
    image: "",
    example: [],
    type: [],
    synonyms: "",
    antonyms: "",
  });

  const [ShowEditListMenu, setShowEditListMenu] = useState(false);
  const [ShowMoveMenu, setShowMoveMenu] = useState(false);
  const [WordData, setWordData] = useState({});
  let DeleteMode = false;
  const [tempId, settempId] = useState("");

  const HandlerEditList = (title) => {
    editList(idCurrentList, title);
    window.location.href = `/AllWords/${title}/${idCurrentList}`;
    setShowEditListMenu(false);
  };

  const handlePageClick = () => {
    setShowMoveMenu(!ShowMoveMenu);
  };

  useEffect(() => {
    GetList();

    const words = async () => {

      try {
        console.log(UserLists)
        console.log(idCurrentList);
        const Words = await GetWords(idCurrentList,'default',listName);
        setAllwordsData(Words);
        console.log(Words);
      } catch (error) {
        console.log(error)
       // window.location.href = `/Hero`;
      }
    };
    words();
  }, []);

  const CreateRef = (a) => {
    audioRef.current = new Audio(`${a}`);
  };

  const playSound = (a) => {
    CreateRef(a);
    // Reproduce el sonido al hacer clic en el botón
    audioRef.current.play();
  };

  function WordsItems({
    id,
    name,
    example,
    image,
    meaning,
    type,
    synonyms,
    antonyms,
    past,
    participle,
    gerund,
    index,
  }) {
    return (
      <div className="WordsItems">
        {ShowMoveMenu && SelectCard == index ? (
          <div
            style={{
              zIndex: 1000,
              height: "auto",
              width: "auto",
              position: "absolute",
              fontFamily: "roboto",
            }}
            className="ListsMenuAdd"
          >
            <div
              style={{
                display: "flex",
                position: "absolute",
                left: "11rem",
                top: "3rem",
              }}
            >
              <div
                style={{
                  height: "6rem",
                  width: "5rem",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "#001e27",
                  color: "skyblue",
                  boxShadow: "0px 0px 5px black",
                  borderTopLeftRadius: "10px",
                  borderBottomLeftRadius: "10px",
                  padding: "10px",
                }}
              >
                <div>
                  <button
                    className="ActionButtoms"
                    style={{
                      height: "20px",
                      width: "20px",
                      display: "flex",
                      textAlign: "center",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={() => setShowMoveMenu(false)}
                  >
                    x
                  </button>
                  <p style={{ fontSize: "15px", marginTop: "0.5rem" }}>
                    Eliminar
                  </p>
                  <div className="container">
                    <input
                      type="checkbox"
                      name="checkbox"
                      id="checkbox"
                      onClick={() => {
                        DeleteMode = !DeleteMode;
                        console.log(DeleteMode);
                      }}
                    />
                    <label for="checkbox" className="label">
                      {" "}
                    </label>
                  </div>
                </div>
              </div>
              <div
                className="ListAddOrMoveMenu"
                style={{
                  zIndex: 1000,
                  maxHeight: "30vh",
                  overflow: "scroll",
                  width: "auto",
                  backgroundColor: "#001e27",
                  boxShadow: "0px 0px 5px black",
                  scrollbarWidth: "none",
                }}
              >
                {UserLists.map((e, i) => (
                  <div
                    style={{
                      marginLeft: "5px",
                      marginRight: "5px",
                      cursor: "pointer",
                      color: "skyblue",
                    }}
                    className="listMove"
                    onClick={() => {
                      Move(DeleteMode, WordData,[ e.id], idCurrentList);
                      setShowMoveMenu(false);
                    }}
                    key={i}
                  >
                    {e.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
        <div className="SingleWord">
          <h3
            onClick={() => {
              const Njt = {
                name: name,
                meaning: meaning,
                past: past,
                participle: participle,
                gerund: gerund,
                image: image,
                example: example,
                type: type,
                synonyms: synonyms,
                antonyms: antonyms,
              };
              setNewjson(Njt);
              setSelectedObjects([...SelectedObjects, Njt]);
            }}
          >
            {name}
          </h3>
          <div className="buttomsSingleWord">
            <button
              onClick={async () => {
                const audioUrl = await HandleVoice(name);
                playSound(audioUrl);
              }}
            >
              <CiPlay1 />
            </button>
            <button
              onClick={() => {
                setDataForm({
                  id: id,
                  name: name,
                  meaning: meaning,
                  past: past,
                  participle: participle,
                  gerund: gerund,
                  image: image,
                  example: example,
                  type: type,
                  synonyms: synonyms,
                  antonyms: antonyms,
                });
                history(`/createWords/update/${idCurrentList}/${listName}`);
              }}
            >
              <MdOutlineModeEdit />
            </button>
            <button
              onClick={() => {
                setShowConfirmDelete(true);
                settempId(id);
              }}
            >
              <MdDeleteOutline />
            </button>

            <button
              onClick={(e) => {
                setShowMoveMenu(true);
                setSelectCard(index);
                handlePageClick(e);
                setWordData({
                  id,
                  name: name,
                  meaning: meaning,
                  past,
                  participle,
                  gerund,
                  image,
                  example: example,
                  type: type,
                  synonyms,
                  antonyms,
                });
              }}
            >
              <MdOutlineDriveFileMove />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <ConfirmDelete
        setShowConfirmDelete={setShowConfirmDelete}
        ShowConfirmDelete={ShowConfirmDelete}
        HandlerDelete={async () => {
          await HandlerDelete(tempId, idCurrentList);
          setShowConfirmDelete(false);
        }}
      />

      <ConfirmDelete
        setShowConfirmDelete={setShowConfirmDeleteList}
        ShowConfirmDelete={ShowConfirmDeleteList}
        HandlerDelete={async () => {
          await deleteList(idCurrentList);
          setShowConfirmDeleteList(false);
          window.location.href = `/AllLists`;
        }}
      />

      {Newjson && SelectedObjects.includes(Newjson) ? (
        <ElementCard Lists={UserLists} CurrentListId={idCurrentList} />
      ) : null}

      <div className="MainBackground MyWords">
        <h1>{listName}</h1>
        <div className="ListsButtons">
          <button
            className="ActionButtoms"
            onClick={() => {
              setDataForm({
                name: "",
                meaning: "",
                past: "",
                participle: "",
                gerund: "",
                example: [""],
                type: [],
                synonyms: "",
                antonyms: "",
                image: "",
              });
              history("/createWords/create");
            }}
          >
            <IoAddCircleSharp />
          </button>
          <button
            className="ActionButtoms"
            onClick={() => setShowEditListMenu(true)}
          >
            <MdOutlineModeEdit />
          </button>
          <button
            className="ActionButtoms"
            onClick={() => setShowConfirmDeleteList(true)}
          >
            <MdDeleteOutline />
          </button>
        </div>

        {ShowEditListMenu && (
          <div className="ListEdit">
            <button onClick={() => setShowEditListMenu(false)} className="ActionButtoms2">
              
              <BsXLg />
            </button>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Edit List Name"
                  onChange={(e) => setNewTitle(e.target.value)}
                />
            <button onClick={() => HandlerEditList(NewTitle)} className="ActionButtoms2">
                <FaCheck />
                </button>

              </div>

          </div>
        )}
      </div>

      <div className="WordsContainer">
        {AllwordsData.length === 0
          ? "Empty Array"
          : AllwordsData.map((word, i) => (
              <WordsItems
                key={word.id_Word}
                id={word.id_Word}
                name={word.name}
                example={word.example}
                type={word.type}
                past={word.past}
                participle={word.participle}
                synonyms={word.synonyms}
                antonyms={word.antonyms}
                image={word.image}
                meaning={word.meaning}
                gerund={word.gerund}
                index={i}
              />
            ))}
      </div>
    </div>
  );
}

export default AllWords;
