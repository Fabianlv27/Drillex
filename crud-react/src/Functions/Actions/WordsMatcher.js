import api from "../../../api/axiosClient";

export async function WordsMatcher(idList, LyricReal, GetWords) {
    try {
        // Obtenemos las palabras (GetWords ya debería manejar sus errores o retornas [])
        const Words = await GetWords(idList);

        const SentData = {
            Liryc: LyricReal.map((e) => e.replace(/\r/g, "")),
            Words: Words,
        };

        const response = await api.post("/getMatches", SentData);
        
        const Matches = response.data;
        console.log(Matches);
        
        const AdptedMatches = { Matches, mode: 1 };
        console.log(AdptedMatches);
        
        return AdptedMatches;
    } catch (error) {
        console.error("Error in WordsMatcher:", error);
        return { Matches: [], mode: 1 }; // Retorno seguro en caso de fallo
    }
}

export const PhrMatcher = async (LyricReal) => {
    try {
        const response = await api.post("/PhrMatches", LyricReal);
        
        const Matches = response.data;
        console.log(Matches);
        return Matches;
    } catch (error) {
        console.error("Error in PhrMatcher:", error);
        return [];
    }
};