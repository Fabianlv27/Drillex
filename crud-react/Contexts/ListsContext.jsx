import { createContext, useState } from "react";
import PropTypes from "prop-types";
import api from "../api/axiosClient.js"; // Importamos tu cliente Axios

const ListsContext = createContext();

const ListsContextProvider = ({ children }) => {
  const [SingleId, setSingleId] = useState("");
  const [UserLists, setUserLists] = useState([]);
  const [CurrentListId, setCurrentList] = useState({ id: "", title: "" });

  const GetList = async () => {
    try {
      // Axios envía la cookie automáticamente. No hace falta pasar token en URL.
      const response = await api.get("/users/Lists"); 
      const dj = response.data;
      
      console.log(dj);
      if (dj.content && dj.content.length > 0) {
        // Aseguramos que content exista
        setCurrentList({ id: dj.content[0].id, title: dj.content[0].title || dj.content[0].id });
      }

      setUserLists(dj.content);
      return { id: dj.content?.[0]?.id, title: dj.content?.[0]?.title };
    } catch (error) {
      console.error("Error getting lists", error);
      // No redirigimos manualmente, el interceptor maneja el 401 si expira la sesión
    }
  };

  const CreateList = async (Title) => {
    try {
      const formDataList = { name: Title };
      const response = await api.post("/Lists", formDataList);
      
      const newListJson = response.data;
      console.log(newListJson);
      
      // Actualizamos el estado local
      setUserLists((prevLists) => [...prevLists, newListJson]);
    } catch (error) {
      console.error("Error creating list", error);
    }
  };
  
  const editList = async (id, title) => {
    try {
      const formDataList = { name: title };
      await api.put(`/Lists/${id}`, formDataList);
      
      // Recargamos las listas para ver cambios
      GetList(); 
    } catch (error) {
       console.error("Error editing list", error);
    }
  };

  const deleteList = async (id) => {
    try {
      await api.delete(`/Lists/${id}`);
      
      // Filtramos localmente para que sea más rápido
      const updatedLists = UserLists.filter((list) => list.id !== id);
      setUserLists(updatedLists);
    } catch (error) {
      console.error("Error al eliminar la lista:", error);
    }
  };

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