import { useState, useEffect, useContext } from 'react';
import {Context} from '../../../../Contexts/Context'
import {ListsContext} from '../../../../Contexts/ListsContext'
import {SearchLyric} from '../../Actions/SearchLyric'
import LyricsAndWords from "../../secondary menus/LyricsAndWords";

import "../../../styles/Songs.css";
import { FaSearch } from "react-icons/fa";

function SearchSong() {
  const [Name, setName] = useState('');
  const [Artist, setArtist] = useState('');
  const [LyricFound, setLyricFound] = useState('');
    
  const {ShowLyric,setShowLyric} = useContext(Context)
  const {GetList,UserLists} = useContext(ListsContext)
  const FindSong = async () => {
    if (!Name || !Artist) {
      alert('Please enter both song name and artist');
      return;
    }
    
   setLyricFound(await SearchLyric(Artist, Name)) 
      setShowLyric(true)
  };

  useEffect(() => {
    const HandlerLists= async()=>{
      await GetList();
    }
    
    HandlerLists()
    
  }, [])

  return (
    <div className='searchSong'>
      <h2>Write the Name of the Song</h2>
      <input type="text" placeholder="Name of the Song" onChange={(e) => setName(e.target.value)} />
      <input type="text" placeholder="Artist" onChange={(e) => setArtist(e.target.value)} />
      <button className='ActionButtoms' onClick={FindSong}><FaSearch /></button>

      <div>
        { LyricFound && (
            <>
              {
                ShowLyric?(
                   <div style={{marginBottom:'20px'}}>
            
            <LyricsAndWords
              LyricReal={LyricFound}
              UserLists={UserLists}
              SongID={Name.toLowerCase() + '_'+Artist.toLocaleLowerCase()+'_SearchSong'}
              bodyHidden={false}
            />
              
              </div>
                ):null
              }
            
          
         
            </>
         
        )}
      </div>
    </div>
  );
}

export default SearchSong;
