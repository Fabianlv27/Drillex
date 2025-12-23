import { useState, useContext } from "react";
import "../../styles/ImageSearch.css";
import { Context } from "../../../Contexts/Context";
import { GrFormViewHide, GrFormView } from "react-icons/gr"; // Asegúrate de tener react-icons instalado
import { FaSearch } from "react-icons/fa"; // Usaré FaSearch que es más estándar, o mantén el SVG si prefieres

function ImageSearch({ word, dataWord, setDataWord, index }) {
  const [query, setQuery] = useState(word || "");
  const [results, setResults] = useState([]);
  const [HiddeImages, setHiddeImages] = useState(1); // 1: Visible, 2: Oculto
  const searchType = "image";
  const { Language } = useContext(Context);

  const handleLanguage = () => {
    switch (Language) {
      case "es": return "definicion";
      case "it": return "definizione";
      default: return "definition";
    }
  };

  const handleArray = (content) => {
    // Si estamos editando una lista de palabras (bulk) o una sola
    if (index !== undefined && index !== null) {
      const TempDW = [...dataWord];
      TempDW[index].image = content;
      setDataWord(TempDW);
    } else {
      setDataWord((prev) => ({ ...prev, image: content })); 
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query) {
      const apiKey = import.meta.env.VITE_Google_Image_Api_Key;
      const searchEngineId = import.meta.env.VITE_searchEngineId;
      
      try {
        const response = await fetch(
            `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&lr=lang_${Language}&q=${
              query + " " + handleLanguage()
            }&searchType=${searchType}&cr=country${Language.toUpperCase()}`
          );
          const data = await response.json();
    
          if (data.items) {
            setResults(data.items);
            setHiddeImages(1); // Mostrar resultados al buscar
          }
      } catch (error) {
          console.error("Error fetching images:", error);
      }
    }
  };

  // Manejar Enter en el input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  }

  return (
    <div className="Modal-container ImpSeaLink">
      <div className="searchbar">
        <div className="searchbar-wrapper">
          
          {/* Botón Buscar */}
          <div className="searchbar-left">
            <div className="search-icon-wrapper" onClick={handleSearch} title="Search Google Images">
              <span className="search-icon">
                 {/* SVG Original mantenido o usa <FaSearch /> */}
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                  </svg>
              </span>
            </div>
          </div>

          {/* Input */}
          <div className="searchbar-center">
            <input
              type="text"
              className="searchbar-input"
              name="q"
              autoComplete="off"
              placeholder="Search Google Images..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Toggle Visibilidad */}
          <div className="searchbar-right">
            {results.length > 0 && (
                <>
                    {HiddeImages === 1 ? (
                        <GrFormView onClick={() => setHiddeImages(2)} title="Hide results" />
                    ) : (
                        <GrFormViewHide onClick={() => setHiddeImages(1)} title="Show results" />
                    )}
                </>
            )}
          </div>
        </div>
      </div>

      {/* Resultados Grid */}
      {results.length > 0 && HiddeImages !== 2 && (
        <div className="ImagesGoogle">
          {results.map((result, i) => (
            <img
              key={i}
              onClick={() => handleArray(result.link)}
              src={result.link}
              alt={result.title}
              title="Click to select"
              // Nota: Ya no usamos estilos inline para width/height, el CSS Grid lo hace responsive
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageSearch; 