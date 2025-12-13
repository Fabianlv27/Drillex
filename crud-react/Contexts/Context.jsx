import { createContext, useState, useEffect } from "react";
import { GetLocalHost } from "../api/api.js";
import PropTypes from "prop-types";
const Context = createContext();

const MyContextProvider = ({ children }) => {
  const [Language, setLanguage] = useState("en");
  const [IsLogged, setIsLogged] = useState(false);
  const [token, setToken] = useState("");
  const [ShowLyric,setShowLyric] = useState(false);
  const Ahost = "https://dibylocal.com:8000";
  const RHost = "https://dibylocal.com:5173";
  useEffect(() => {
    const { host, getTokenFromCookies, ValidateToken,GetLanguage } = GetLocalHost();
    setLanguage(GetLanguage());
    console.log(host);
    const cookies = getTokenFromCookies();
    console.log(cookies)
    if (cookies) {
      if (ValidateToken(cookies)) {
        setIsLogged(true);
        setToken(cookies);
        console.log(cookies)
      }
    }
  }, []);
  const [Block, setBlock] = useState(false);
  const [SelectedObjects, setSelectedObjects] = useState([]);

  const HandleVoice = async (word) => {
    try {
      const response = await fetch(`${Ahost}/texto_a_voz/${word}/${Language}`);

      const AudioBytes = await response.blob();

      const audioUrl = URL.createObjectURL(AudioBytes);

      return audioUrl;
    } catch (error) {
      console.error("Error al obtener el audio:", error);
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
        token,
        setToken,
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
