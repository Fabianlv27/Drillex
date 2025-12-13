import { createContext, useState } from "react";
import PropTypes from "prop-types";
import { GetLanguage } from "../src/Functions/Actions/language.js";
const DiccionaryContext = createContext();

const DiccionaryContextProvider = ({ children }) => {
  const [Meaning, setMeaning] = useState([]);
  const [CardAutoExamples, setCardAutoExamples] = useState([]);
  const [CardDef, setCardDef] = useState([]);
  const [mean, setmean] = useState(false);
  const searchWord = async (word) => {
    word = word.replace(/[.,!()]+$/, "");
    
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/${GetLanguage()}/${word}`
      );
      if (!response.ok) {
        throw new Error(`The word "${word}" is not in the dictionary.`);
      } else {
        // setShowLyric(false)
      }
      const data = await response.json();
      console.log(data);

      const examples = data.map((e) =>
        e.meanings
          .map((mean) => mean.definitions.map((def) => def.example))
          .filter(Boolean)
      );
      const definitions = data.map((e) =>
        e.meanings
          .map((mean) => mean.definitions.map((def) => def.definition))
          .filter(Boolean)
      );

      setMeaning(data);
      setCardAutoExamples(examples);
      setCardDef(definitions);
      console.log(mean);
      setmean(true);
      return data;
    } catch (error) {
      console.error("Error searching word:", error.message);
      return{"error":error.message};
    }
  };
  return (
    <DiccionaryContext.Provider
      value={{ searchWord, Meaning, CardAutoExamples, CardDef, mean }}
    >
      {children}
    </DiccionaryContext.Provider>
  );
};
DiccionaryContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { DiccionaryContext, DiccionaryContextProvider };
