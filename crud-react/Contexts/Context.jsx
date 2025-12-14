import { createContext, useState, useEffect } from "react";
import api from '../api/axiosClient.js';
import { GetLocalHost } from "../api/api.js";
import PropTypes from "prop-types";
const Context = createContext();

const MyContextProvider = ({ children }) => {
  const [Language, setLanguage] = useState("en");
  const [IsLogged, setIsLogged] = useState(false);
  //const [token, setToken] = useState("");
  const [ShowLyric,setShowLyric] = useState(false);
const [isLoading, setIsLoading] = useState(true);

  const Ahost = "https://dibylocal.com:8000";
  const RHost = "https://dibylocal.com:5173";

  useEffect(() => {
    const { GetLanguage } = GetLocalHost();
    setLanguage(GetLanguage());
  const initSession = async () => {
        try {
            await api.get("/users/me"); // Un endpoint ligero para verificar token
            setIsLogged(true);
        } catch (e) {
            setIsLogged(false);
        }finally{
          setIsLoading(false)
        }
    };
    initSession();
  }, []);

  const [Block, setBlock] = useState(false);
  const [SelectedObjects, setSelectedObjects] = useState([]);

const HandleVoice = async (word) => {
    try {
      // Axios para blobs requiere config extra
      const response = await api.get(`/texto_a_voz/${word}/${Language}`, {
          responseType: 'blob'
      });
      const audioUrl = URL.createObjectURL(response.data);
      return audioUrl;
    } catch (error) {
      console.error("Error audio:", error);
    }
  };

  return (
    <Context.Provider
      value={{
        Language ,
        setLanguage,
        Ahost,
        Block,
        setBlock,
        SelectedObjects,
        setSelectedObjects,
        IsLogged,
        setIsLogged,
        isLoading,
        HandleVoice,
        RHost,
        ShowLyric,setShowLyric
      }}
    >
      {children}
    </Context.Provider>
  );
};

MyContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { Context, MyContextProvider };
