import {host} from "../../../api/api";

export const SearchLyric = async (Artist, Name) => {
  try {
    const response = await fetch(`${host}/SearchLyric/${Name}/${Artist}`);
    const data = await response.json();
    console.log(response)
    if (data.syncedLyrics) {
      const splitter = data.syncedLyrics.replace(/\[.*?\]/g, '').split('\n');
      return splitter;
    } else {
      throw new Error('Lyrics not found');
    }
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    alert(error.message);
    return [];
  }
}