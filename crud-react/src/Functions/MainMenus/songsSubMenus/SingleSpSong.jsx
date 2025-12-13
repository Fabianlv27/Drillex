import { useState, useEffect,useContext } from "react";
import PropTypes from "prop-types";
import{SearchLyric}from "../../Actions/SearchLyric"
import { ListsContext } from "../../../../Contexts/ListsContext";
import "../../SingleSp.css";
import "../../../styles/Spotify.css";
import { IoMdArrowRoundBack } from "react-icons/io";
import LyricsAndWords from "../../secondary menus/LyricsAndWords";

function SingleSpSong({SingleSongInfo,setSingleSongInfo, setBlock}) {
  const { GetList,UserLists } = useContext(ListsContext);
  const [LyricReal, setLyricReal] = useState([]);
  const [ManualLyric, setManualLyric] = useState("");
  const adjustHeight = () => {
  window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    adjustHeight(); // al montar
    window.addEventListener('scroll', adjustHeight); // al redimensionar

    return () => {
      window.removeEventListener('scroll', adjustHeight); // limpieza
    };
  }, []);
  useEffect(() => {
    const handleLyric = async () => {
      if (SingleSongInfo.name.includes("-")) {
        const remastered = SingleSongInfo.name.split("-")[0];
        setSingleSongInfo({...SingleSongInfo, name:remastered});
      }
      try {
        const data= await SearchLyric(SingleSongInfo.artist, SingleSongInfo.name);
        console.log(data)
        setLyricReal(data);
      } catch (error) {
        console.error("Error fetching lyrics:", error);
      }
    };
    const HandlerLists = async () => {
      await GetList();
    };

    HandlerLists();
    handleLyric();
  }, [SingleSongInfo.artist, SingleSongInfo.name]);
useEffect(() => {
  window.scrollTo({top:0})
 
}, [])
SingleSpSong.propTypes = {
  SingleSongInfo: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
  }).isRequired,
  setSingleSongInfo: PropTypes.func.isRequired,
  setBlock: PropTypes.func.isRequired,
};
  return (
    <>
      <div className="SongCard">
        <div style={{width:"80%",minHeight:"30rem",backgroundImage:"linear-gradient(to top, #0e7376, #0d686a, #0b5d5f, #095254, #084749, #074244, #073c3e, #063739, #063537, #053335, #053234, #053032)",borderRadius:"10px"}}>
        
        <div className="sptfVisualizer">
        <button
            onClick={() => {
              setBlock(false);
              setSingleSongInfo({ id: "", name: "", artist: "" });
            }}
            className="SpSongCardButtomExit"
          >
            <IoMdArrowRoundBack />
          </button>
           <iframe
            style={{ borderRadius: "12px" }}
            src={`https://open.spotify.com/embed/track/${SingleSongInfo.id}?utm_source=generator`}
            width="90%"
            height="80%"
            frameBorder="0"
            allowfullscreen=""
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        </div>
     
        <div className="lyricSP">
          {LyricReal.length > 0 && (
            <LyricsAndWords
              LyricReal={LyricReal}
              UserLists={UserLists}
              SongID={SingleSongInfo.id}
              bodyHidden={true}
            />
          )}

          {LyricReal.length == 0 && (
            <div className="ManualLyric">
              <h2>
                We couldn´t find the lyric of this song.... if you want find it
                yourself and paste here
              </h2>
              <textarea
                name="lyric"
                onChange={(e) => setManualLyric(e.target.value)}
              ></textarea>
              <button className="ActionButtoms" 
                onClick={() =>
                  setLyricReal(ManualLyric.replace(/\[.*?\]/g, "").split("\n"))
                }
              >
                Send
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
}

export default SingleSpSong;
