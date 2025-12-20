import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";
import api from "../api/axiosClient"; // Tu cliente axios
import { Context } from "../Contexts/Context"; // Para obtener el idioma global

const DiccionaryContext = createContext();

const DiccionaryContextProvider = ({ children }) => {
  const { Language } = useContext(Context); // Obtenemos el idioma global aquí
  
  // Estados para uso interno (opcional si usas ElementCard directamente)
  const [Meaning, setMeaning] = useState([]);
  
  // Refactor: La función ahora delega todo al backend
  const searchWord = async (word, overrideLang = null) => {
    const cleanWord = word.replace(/[.,!()]+$/, "").trim();
    // Usamos el idioma que pasan o el global del contexto
    const langToUse = overrideLang || Language; 

    try {
      // LLAMADA UNIFICADA AL BACKEND
      // El backend decidirá si usa la API externa inglesa, el scraper italiano, o tu BD.
      const response = await api.post(`/dictionary/search`, {
          word: cleanWord,
          language: langToUse
      });

      const data = response.data;
      
      setMeaning(data);
      return data; // Retornamos la data estandarizada desde el backend
      
    } catch (error) {
      console.error("Dictionary Error:", error);
      // Retornar un objeto de error para que la UI lo maneje
      return { error: true, message: "Word not found or connection error" };
    }
  };

  return (
    <DiccionaryContext.Provider value={{ searchWord, Meaning }}>
      {children}
    </DiccionaryContext.Provider>
  );
};

DiccionaryContextProvider.propTypes = { children: PropTypes.node.isRequired };
export { DiccionaryContext, DiccionaryContextProvider };