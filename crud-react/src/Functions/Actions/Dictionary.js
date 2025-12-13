import {host} from '../../../api/api.js';

async function getDictionaryWord(word){

    try {
      console.log(word)
          const diccionary = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
          );
          if (!diccionary.ok) {
            throw new Error(
              `the word ${word} doesnt is in the diccionary`
            );
          } else {
            const diccionaryJson = await diccionary.json()
            console.log(diccionaryJson)
            return diccionaryJson
            //console.log(Meanings)
          }
        } catch (error) {
          console.error("se produjo un error");
          //const Meanings="unknow"
        }
}
async function getItalianDictionaryWord(word){
    try {
          const diccionary = await fetch(
            `${host}/Dictionary_words/it/${word}`
          );
          if (!diccionary.ok) {
            throw new Error(
              `the word ${word} doesnt is in the diccionary`
            );
          } else {
            const diccionaryJson = await diccionary.json()
            console.log(diccionaryJson)
            return diccionaryJson
          }
        } catch (error) {
          console.error("se produjo un error");
        } 
}
export { getDictionaryWord, getItalianDictionaryWord };