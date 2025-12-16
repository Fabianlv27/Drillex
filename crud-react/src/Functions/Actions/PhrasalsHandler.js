import api from "../../../api/axiosClient"; // Asegúrate de que la ruta sea correcta

export const RandomPhrasal = async (AmountOfPhrs) => {
    try {
        const response = await api.get(`/RandomPhrasals/${AmountOfPhrs}`);
        // Axios ya devuelve el JSON en response.data
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error RandomPhrasal:", error);
        return [];
    }
};

export const LetterPhrasals = async (letter, AmountOfPhrs) => {
    try {
        const response = await api.get(`/PhrByLetter/${letter}/${AmountOfPhrs}`);
        return response.data;
    } catch (error) {
        console.error("Error LetterPhrasals:", error);
        return [];
    }
};

export const SearchPhrasals = async (Phr) => {
    try {
        const response = await api.get(`/SearchPhr/${Phr}`);
        return response.data;
    } catch (error) {
        console.error("Error SearchPhrasals:", error);
        return [];
    }
};