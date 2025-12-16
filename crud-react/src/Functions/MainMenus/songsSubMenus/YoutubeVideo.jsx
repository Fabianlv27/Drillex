import { useState, useContext, useRef, useEffect } from "react";
import YouTube from "react-youtube";
import { Context } from "../../../../Contexts/Context";
import { GetLanguage } from '../../Actions/language.js';
import "../../SingleSp.css";
import "../../../styles/Youtube.css";
import Loading from '../../Actions/Loading.jsx';
import VideosMenu from '../../../Componets/VideosMenu/VideosMenu.jsx';
import api from "../../../../api/axiosClient"; // Cliente Axios seguro

function YoutubeVideo() {
  const [Link, setLink] = useState("");
  const [Trs, setTrs] = useState({ content: [], status: 0 });
  const [VideoId, setVideoId] = useState("");
  const [CurrentTime, setCurrentTime] = useState(0.0);
  const [opts, setopts] = useState(null);
  const [YTVideos, setYTVideos] = useState([]);
  const [Index, setIndex] = useState(1);
  const [ErrorMsg, setErrorMsg] = useState(null); // Nuevo estado para errores
  
  const player = useRef(null);
  const LyricScroll = useRef(null);
  const expectedTimeRef = useRef(0.01);

  // ... (Funciones handleJump y WidthHandler se mantienen igual) ...
  const handleJump = (jumpTo) => {
    if (player.current) {
      player.current.seekTo(jumpTo, true);
    }
  };

  const WidthHandler = () => {
    // ... (Tu lógica de resize original se mantiene) ...
    if (window.innerWidth < 768) {
      setopts((prevOpts) => ({ ...prevOpts, height: window.innerWidth * 0.4 + "px", width: window.innerWidth * 0.6 + "px" }));
    } else if (window.innerWidth < 1000) {
      setopts((prevOpts) => ({ ...prevOpts, height: window.innerWidth * 0.3 + "px", width: window.innerWidth * 0.4 + "px" }));
    } else {
      setopts((prevOpts) => ({ ...prevOpts, height: window.innerWidth * 0.24 + "px", width: window.innerWidth * 0.43 + "px" }));
    }
  };

  const SaveTime = () => {
    try {
        const videos = HandleLocalStorage();
        if (videos.length > 0) {
            videos[videos.length - 1].time = CurrentTime;
            localStorage.setItem("videosYT", JSON.stringify(videos));
        }
    } catch (e) {
        console.warn("Error saving time to localStorage", e);
    }
  };

  // ... (useEffects de resize y localStorage se mantienen) ...
  useEffect(() => {
    window.addEventListener("resize", WidthHandler);
    WidthHandler();
    HandleLocalStorage();
    return () => {
      window.removeEventListener("resize", WidthHandler);
      SaveTime();
    };
  }, []);

  useEffect(() => {
    if (Trs.content && Trs.content.length > 0) {
        SaveTime();
    }
  }, [Trs.content]);

  // Lógica del reproductor (setInterval) se mantiene, pero con verificaciones de seguridad
  const YT_PLAYER_STATES = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 };
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (player.current && player.current.getCurrentTime && player.current.getPlayerState() === YT_PLAYER_STATES.PLAYING) {
        const currentTime = formatTime(player.current.getCurrentTime());
        setCurrentTime(currentTime);

        if (Math.abs(expectedTimeRef.current - currentTime).toFixed(2) > 0.01) {
          let newIndex = 0;
          if(Trs.content && Trs.content.length > 0){
              Trs.content.some((tr, i) => {
                if (parseFloat((currentTime - tr.start).toFixed(2)) < 0.0) return true;
                else newIndex = i;
              });
              setIndex(newIndex);
          }
          expectedTimeRef.current = parseFloat(currentTime + 0.01).toFixed(2);
        } else {
          expectedTimeRef.current = parseFloat(expectedTimeRef.current + 0.01).toFixed(2);
        }
        checkActions(currentTime);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [Trs.content, Index]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString()}.${seconds.toString().padStart(2, "0")}`;
  };

  const checkActions = (time) => {
    if (Trs.content && Trs.content[Index + 1] && Trs.content[Index + 1].start == time) {
      setIndex(Index + 1);
    }
  };
const HandleLink = () => {
    setErrorMsg(null);
    if (!Link) return;

    try {
        // Regex robusto para detectar ID de YouTube (soporta youtu.be, watch?v=, embeds, etc.)
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = Link.match(regExp);

        const Spliter = (match && match[2].length === 11) ? match[2] : null;

        if (!Spliter) throw new Error("Invalid YouTube Link format");

        console.log("ID Extraído:", Spliter); // Para depurar en consola del navegador
        GetTrs(Spliter, true);
        setVideoId(Spliter);
    } catch (e) {
        setErrorMsg("Invalid YouTube Link. Please check and try again.");
    }
  };

  const HandleLocalStorage = () => {
    try {
        const videos = JSON.parse(localStorage.getItem('videosYT') || "[]");
        setYTVideos(videos);
        return videos;
    } catch (e) {
        console.error("Error accessing localStorage", e);
        return [];
    }
  };

  const FindVideoTime = (id) => {
    const videos = HandleLocalStorage();
    const SingleVideo = videos.find(v => v.link == id);
    return SingleVideo ? SingleVideo.time : 0;
  };

  const SaveVideo = (v, New) => {
    let time = 0;
    if (!New) {
      time = FindVideoTime(v);
      setCurrentTime(time);
    }
    const filter = YTVideos.filter((e) => e.link !== v);
    const NewList = [{ link: v, time: !New ? time : 0 }, ...filter];
    setYTVideos(NewList);
    localStorage.setItem('videosYT', JSON.stringify(NewList));
  };

  // --- REFACTORIZACIÓN PRINCIPAL: GetTrs con Axios y Manejo de Errores ---
  const GetTrs = async (Code, New, lang = GetLanguage()) => {
    setTrs({ content: [], status: -1 }); // Estado de carga
    setErrorMsg(null); // Limpiar errores

    try {
      // Usamos Axios (api.get) en lugar de fetch. Axios lanza error si status != 200
      const response = await api.get(`/Sub/${lang}/${Code}`);
      const TransStringJson = response.data;

      console.log("Subs Data:", TransStringJson);

      if (TransStringJson.status === 0) {
         // Ajuste según estructura de respuesta exitosa
         if(TransStringJson.content && !Array.isArray(TransStringJson.content)){
             // Si el contenido viene anidado en snippets (común en algunas APIs de YT)
             TransStringJson.content = TransStringJson.content.snippets || [];
         }
      } 
      
      SaveVideo(Code, New);
      setTrs(TransStringJson);

    } catch (error) {
      console.error("Error getting subtitles:", error);
      
      // Manejo específico si el error viene del backend con un mensaje claro
      const backendMsg = error.response?.data?.detail || "Could not fetch subtitles.";
      
      // Si el status es 404, puede que signifique que no hay subtítulos disponibles
      // en ese idioma, pero quizá la API devuelve opciones (status 2).
      // Si tu backend maneja eso retornando JSON incluso en 404, Axios lo pondrá en error.response
      
      // Asumiendo que tu backend devuelve JSON con status=2 en caso de fallo parcial:
      if(error.response && error.response.data && error.response.data.status === 2){
           setTrs(error.response.data); // Mostrar lista de idiomas disponibles
      } else {
           setTrs({ content: [], status: 500 }); // Estado de error fatal
           setErrorMsg(backendMsg);
      }
    }
  };

  return (
    <div className="MainBackground">
      <div className="PasteLinkYt">
        <h1>Interactive Lyrics Youtube</h1>

        <div className="input__container youtubeSearch">
          <div className="shadow__input"></div>
          <button className="input__button__shadow" onClick={HandleLink}>
            <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" height="20px" width="20px">
              <path d="M4 9a5 5 0 1110 0A5 5 0 014 9zm5-7a7 7 0 104.2 12.6.999.999 0 00.093.107l3 3a1 1 0 001.414-1.414l-3-3a.999.999 0 00-.107-.093A7 7 0 009 2z" fillRule="evenodd" fill="#17202A"></path>
            </svg>
          </button>
          <input
            type="text"
            className="input__search"
            onChange={(e) => setLink(e.target.value)}
            placeholder="Paste the YouTube Link"
          />
        </div>
        
        {/* Renderizado de Mensaje de Error Amigable */}
        {ErrorMsg && (
            <div className="error-message" style={{color: '#ff6b6b', marginTop: '1rem', fontWeight: 'bold'}}>
                ⚠️ {ErrorMsg}
            </div>
        )}
      </div>

      {YTVideos.length > 0 && Trs.status === 0 && (
        <VideosMenu GetTrs={GetTrs} setVideoId={setVideoId} handleJump={handleJump} />
      )}

      <div>
        {Trs.status === -1 && <Loading />}

        {Trs.status === 2 && (
          <div className="AvaliableLanguages">
            <h2>Available Languages</h2>
            <p>We were not able to get the subtitles in the language requested.</p>
            <p>Please choose one from the list below:</p>
            <ul className="LanguagesList">
              {Trs.content && Array.isArray(Trs.content) ? Trs.content.map((lang, index) => (
                <li key={index} onClick={() => GetTrs(VideoId, false, lang.código)}>
                  {lang.idioma} - {lang.código}
                </li>
              )) : <p>No alternatives found.</p>}
            </ul>
          </div>
        )}

        {Trs.content && Trs.content.length > 1 && Trs.status === 0 && (
          <div className="contVideoAndLyric">
            <div className="fixedYoutubeVideo">
              <div>
                <YouTube
                  videoId={VideoId}
                  opts={opts}
                  onReady={(event) => (player.current = event.target)}
                />
                <p>Time: {CurrentTime}s</p>
              </div>
            </div>
            
            <div className="lyricYoutube" ref={LyricScroll}>
              {/* Renderizado seguro de versos: verificamos que existan antes de acceder */}
              {Trs.content[Index - 1] && (
                <div className="VerseYt">
                  <p><span>{Trs.content[Index - 1].start}</span> {Trs.content[Index - 1].text}</p>
                </div>
              )}
              
              {Trs.content[Index] && (
                <div className="VerseYt" style={{ backgroundColor: "rgba(5, 60, 60, 0.76)" }}>
                  <p><span>{Trs.content[Index].start}</span> {Trs.content[Index].text}</p>
                </div>
              )}
              
              {Trs.content[Index + 1] && (
                <div className="VerseYt">
                  <p><span>{Trs.content[Index + 1].start}</span> {Trs.content[Index + 1].text}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default YoutubeVideo;