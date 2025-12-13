import { useState, useContext } from "react";
import "../Search.css";
import "../../styles/ImageSearch.css";
import { Context } from "../../../Contexts/Context";
import { GrFormViewHide } from "react-icons/gr";
import { GrFormView } from "react-icons/gr";
function ImageSearch({ word, dataWord, setDataWord, index }) {
  console.log(dataWord);
  const [query, setQuery] = useState(word);
  const [results, setResults] = useState([]);
  const [HiddeImages, setHiddeImages] = useState(0)
  const searchType = "image";
  const { Language } = useContext(Context);
  console.log(Language);
  const handleLanguage = () => {
    switch (Language) {
      case "es":
        return "definicion";
      case "it":
        return "definizione";
      default:
        return "definition";
    }
  };
  const handleArray = (content) => {
    if (index) {
      const TempDW = [...dataWord];
      TempDW[index].image = content;
      setDataWord(TempDW);
    } else {
      setDataWord((prev) => ({ ...prev, image: content })); // Reset image in data
    }
  };
  const handleSearch = async (e) => {
    e.preventDefault();
    //handleArray("")
    if (query) {
      const apiKey = import.meta.env.VITE_Google_Image_Api_Key;
      const searchEngineId = import.meta.env.VITE_searchEngineId;
      console.log(apiKey, searchEngineId);
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&lr=lang_${Language}&q=${
          query + " " + handleLanguage()
        }&searchType=${searchType}&cr=country${Language.toUpperCase()}`
      );
      const data = await response.json();
      console.log(data);

      setResults(data.items)
      setHiddeImages(1);
    }
  };

  return (
    <>
      <div className="Modal-container ImpSeaLink">
        <div className="searchbar">
          <div className="searchbar-wrapper">
            <div className="searchbar-left">
              <div className="search-icon-wrapper" onClick={handleSearch}>
                <span className="search-icon searchbar-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                  </svg>
                </span>
              </div>
            </div>

            <div className="searchbar-center">
              <div className="searchbar-input-spacer"></div>

              <input
                type="text"
                className="searchbar-input"
                maxLength="2048"
                name="q"
                autoCapitalize="off"
                autoComplete="off"
                title="Search"
                role="combobox"
                placeholder="Search Google"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="searchbar-right">
  
              {
                HiddeImages==1&&(
                  <GrFormView  de onClick={()=>setHiddeImages(2)}/>
                )
                
              }
              {
                HiddeImages==2&&(
                  <GrFormViewHide   de onClick={()=>setHiddeImages(1)}/>
                )
              }
  
            </div>
          </div>
        </div>

        {!dataWord.image && results.length > 0&& HiddeImages !=2&&(
          <div className="ImagesGoogle">
            {results.map((result, i) => (
              <img
                key={i}
                onClick={() => handleArray(result.link)}
                src={result.link}
                alt={result.title}
                style={{ width:(result.image.width)*2/10, height:(result.image.height)*2/10, objectFit:"cover",cursor:"pointer" }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default ImageSearch;
