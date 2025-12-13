import { useState, useEffect, useContext } from "react";
import { WordsContext } from "../../../Contexts/WordsContext";
import { MdPlaylistAdd } from "react-icons/md";
import "../../styles/Create.css";

function AutoExamplesList({ nombre }) {
  const [intentList, setIntentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { dataForm, setDataForm } = useContext(WordsContext);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${nombre}`
        );
        const data = await response.json();
        const meanings = data[0]?.meanings || [];
        console.log(meanings)
        const examples = meanings
          .flatMap((meaning) =>
            meaning.definitions.map((definition) => definition.example)
          )
          .filter(Boolean);
        setIntentList(examples);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [nombre]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const AddAutoExample = (event, Element) => {
    event.preventDefault();

    if (dataForm.example.includes(Element)) {
      const ExmplesWithout = dataForm.example.filter(
        (item) => item !== Element
      );
      setDataForm({
        ...dataForm,
        example: ExmplesWithout,
      });
    } else {
      const values = [...dataForm.example, Element];
      setDataForm({
        ...dataForm,
        example: values,
      });
    }
  };

  return (
    <ul>
      {intentList.map((example, index) => (
        <>
          <li key={index} style={{ margin: "15px",listStyleType: "none" }}>
            {" "}
            <button
              className="buttomClearExamples"
              onClick={(event) => AddAutoExample(event, example)}
            >
              <MdPlaylistAdd />
            </button>{" "}
            {example}
          </li>
        </>
      ))}
    </ul>
  );
}

export default AutoExamplesList;
