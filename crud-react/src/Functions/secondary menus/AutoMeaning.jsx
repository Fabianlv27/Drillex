
import {useState,useContext,useEffect} from 'react'
import {WordsContext} from '../../../Contexts/WordsContext'

function AutoMeaning({nombre}) {
 
  const [MeaningAutoList, setMeaningAutoList] = useState([])
  const {dataForm,setDataForm} = useContext(WordsContext)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${nombre}`);
        const data = await response.json();
        const meanings = data[0]?.meanings || [];
        const Definitions = meanings.flatMap(meaning => meaning.definitions.map(definition => definition.definition)).filter(Boolean);
        const SpaceDef= Definitions.join('\n')
       setDataForm(
        {...dataForm,
         'meaning':SpaceDef
      })   
      console.log(dataForm)    
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  return (
    <></>
  )
}

export default AutoMeaning