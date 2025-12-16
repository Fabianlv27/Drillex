import api from "../../../api/axiosClient";

export const SearchLyric = async (Artist, Name) => {
  try {
    const response = await api.get(`/SearchLyric/${Name}/${Artist}`);
    const data = response.data;
    
    console.log(data);
    
    if (data.syncedLyrics) {
      // Tu lógica de limpieza original se mantiene igual
      const splitter = data.syncedLyrics.replace(/\[.*?\]/g, '').split('\n');
      return splitter;
    } else {
      throw new Error('Lyrics not found');
    }
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return []; // Retorna array vacío para que la UI no rompa
  }
};