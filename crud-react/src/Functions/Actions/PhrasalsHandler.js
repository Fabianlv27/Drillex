import {host} from "../../../api/api";

export const  RandomPhrasal = async (AmountOfPhrs) => {
     try {
      const response = await fetch(`${host}/RandomPhrasals/${AmountOfPhrs}`);
      const data = await response.json();
      console.log(data);
        return data;
    } catch (error) {
      console.error(error);
      alert(error)
      return [];
    }
}
export const LetterPhrasals = async (letter,AmountOfPhrs) => {
       try {
      const response = await fetch(
        `${host}/PhrByLetter/${letter}/${AmountOfPhrs}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
        alert(error)
      return [];
    }
}

export const SearchPhrasals = async (Phr) => {
    try {
      const data = await fetch(`${host}/SearchPhr/${Phr}`);
      const PhrInfo = await data.json();
      return PhrInfo;
    } catch (error) {
      console.error(error);
      alert(error)
      return [];
    }
}