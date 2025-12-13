import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";
import { Context } from "./Context.jsx"; // Importa el contexto del token
import { GetLocalHost } from "../api/api.js";
const ListsContext = createContext();

const ListsContextProvider = ({ children }) => {
  const [SingleId, setSingleId] = useState("");
  const [UserLists, setUserLists] = useState([]);
  const [CurrentListId, setCurrentList] = useState({ id: "" ,title:""}); // Cambia a un objeto para manejar el ID de la lista actual
  const { Ahost } = useContext(Context); // Usa el token del contexto
  const { getTokenFromCookies } = GetLocalHost();
  const token = getTokenFromCookies();
  
  const GetList = async () => {
    try {
      const data = await fetch(`${Ahost}/users/Lists/${token}`); // Usa el token aquí
      const dj = await data.json();
      console.log(dj);
      if (dj.lenght > 0) {
        setCurrentList({ id: dj.content[0].id ,title:dj.content[0].id})
      }

      setUserLists(dj.content);
      return { id: dj.content[0].id ,title:dj.content[0].id}
    } catch (error) {
      window.location.href = `/signin`;
    }
  };

  const CreateList = async (Title) => {
    const formDataList = {
      name: Title,
    };
    console.log(formDataList);
   const newList= await fetch(`${Ahost}/Lists/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formDataList),
    });
    const newListJson = await newList.json();
    console.log(newListJson);
    setUserLists((prevLists) => [...prevLists, newListJson]);
  };
  
const editList = async (id, title) => {
  const formDataList = {
    name: title,
  };  
  console.log(formDataList);
  const updatedList = await fetch(`${Ahost}/Lists/${token}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formDataList),
  });
  const updatedListJson = await updatedList.json();
  console.log(updatedListJson);
  GetList(); // Actualiza la lista de listas después de editar
}
const deleteList = async (id) => {
  try {
    const response = await fetch(`${Ahost}/Lists/${token}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Error al eliminar la lista");
    }
    const updatedLists = UserLists.filter((list) => list.id !== id);
    setUserLists(updatedLists);
  } catch (error) {
    console.error("Error al eliminar la lista:", error);
  }
}
  return (
    <ListsContext.Provider
      value={{
        GetList,
        UserLists,
        CurrentListId,
        setCurrentList,
        SingleId,
        setSingleId,
        CreateList,
        editList,
        deleteList
      }}
    >
      {children}
    </ListsContext.Provider>
  );
};

ListsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { ListsContext, ListsContextProvider };
