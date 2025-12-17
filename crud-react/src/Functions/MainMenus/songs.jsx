//import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import Paste from './songsSubMenus/Paste'
import SearchSong from './songsSubMenus/SearchSong'
import "../../styles/Songs.css";
import { FaYoutube } from "react-icons/fa";
import { FaSpotify } from "react-icons/fa";
import {useState} from 'react'
//import SpotifyWebApi from 'spotify-web-api-js'
function songs() {
 const history=useNavigate()
const [ChoiseSong, setChoiseSong] = useState('Paste')



const ContentSongs={
   
    Paste:(
      <Paste/>  
    ),
    Search:(
       <SearchSong/>
    ),
    Link:(
  <div className='YoutubeMenu'>
  <h2>Song by Link</h2>
 <p>Use the Link to Find your Song!</p>
 <h3> <span>Choise your Paltform</span> </h3>
 <button className='YoutubeButtom' onClick={()=> history('/YoutubeVideo')}><FaYoutube /></button>
 <button className='SpotifyButtom' onClick={()=>history('/Spotify')}><FaSpotify /></button>
  </div>
       
    )

}
const HandleSong=(e)=>{
  setChoiseSong(e.target.value)
}
  return (
    <div className='SongsMenu MainBackground'>
        <h1>Songs</h1>
        <p>How do you want to see de Lyrics?</p>
        <select value={ChoiseSong} onChange={HandleSong}>
            <option value="Paste">Paste Lyrics</option>
            <option value="Search">Search Lyrics</option>
            <option value="Link">Streaming</option>
        </select>
        <div>
            {ContentSongs[ChoiseSong]}
        </div>
    </div>
  )
}

export default songs