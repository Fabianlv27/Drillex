import { useState, useContext, useRef, useEffect } from "react";
import YouTube from "react-youtube";
import { Context } from "../../../../Contexts/Context";
import {GetLanguage} from '../../Actions/language.js'
import "../../SingleSp.css";
import "../../../styles/Youtube.css";
import Loading from '../../Actions/Loading.jsx'
import VideosMenu from '../../../Componets/VideosMenu/VideosMenu.jsx'
//https://www.youtube.com/watch?v=vaIgyRoUkQI
function YoutubeVideo() {
  const [Link, setLink] = useState("");
  const [Trs, setTrs] = useState({content: [], status: 0});
  const { Ahost } = useContext(Context);
  const [VideoId, setVideoId] = useState("");
  const [CurrentTime, setCurrentTime] = useState(0.0);
  const [opts, setopts] = useState(null);
  const [YTVideos, setYTVideos] = useState([])
  //  const [ExpectedTime, setExpectedTime] = useState(0)
  //const [FramesToScroll, setFramesToScroll] = useState([])
  const [Index, setIndex] = useState(1);
  const player = useRef(null);
  const LyricScroll = useRef(null);
  const expectedTimeRef = useRef(0.01);

  
  const handleJump = (jumpTo) => {
    if (player.current) {
      player.current.seekTo(jumpTo, true); // true = permite saltar incluso si el video no está cargado aún
    }
  };
  // Opciones del reproductor
  const WidthHandler = () => {
    if (window.innerWidth < 768) {
      setopts((prevOpts) => ({
        ...prevOpts,
        height: window.innerWidth * 0.4 + "px",
        width: window.innerWidth * 0.6 + "px",
      }));
      console.log(opts);
    } else if (window.innerWidth < 1000) {
      setopts((prevOpts) => ({
        ...prevOpts,
        height: window.innerWidth * 0.3 + "px",
        width: window.innerWidth * 0.4 + "px",
      }));
      console.log(opts);
    } else {
      setopts((prevOpts) => ({
        ...prevOpts,
        height: window.innerWidth * 0.24 + "px",
        width: window.innerWidth * 0.43 + "px",
      }));
      console.log(opts);
    }
  };
const SaveTime=()=>{
  const videos=HandleLocalStorage()
  console.log(videos[videos.length-1])
  videos[videos.length -1].time=CurrentTime
  localStorage.setItem("videosYT",JSON.stringify(videos))
}
  useEffect(() => {
    window.addEventListener("resize", WidthHandler);
    WidthHandler();
    HandleLocalStorage()
    return () => {
      window.removeEventListener("resize", WidthHandler);
      SaveTime()
    };
  }, []);

  useEffect(() => {
    if (Trs.content.length>0) {
        SaveTime()
    }

  }, [Trs.content])
  
  
  const YT_PLAYER_STATES = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5,
  };
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        player.current &&
        player.current.getCurrentTime &&
        player.current.getPlayerState() == YT_PLAYER_STATES.PLAYING
      ) {
        const currentTime = formatTime(player.current.getCurrentTime());
        console.log(currentTime);
        console.log("expected: " + expectedTimeRef.current);
        setCurrentTime(currentTime);
        console.log(Math.abs(expectedTimeRef.current - currentTime).toFixed(2));
        if (Math.abs(expectedTimeRef.current - currentTime).toFixed(2) > 0.01) {
          console.log("El usuario ha adelantado o atrasado el video");
          // Actualizar el índice basado en el tiempo actual

          let newIndex = 0;
          Trs.content.some((tr, i) => {
            if (parseFloat((currentTime - tr.start).toFixed(2)) < 0.0) {
              return true;
            } else {
              newIndex = i;
            }
          });
          setIndex(newIndex);
          expectedTimeRef.current = parseFloat(currentTime + 0.01).toFixed(2);
          newIndex = 0;
        } else {
          expectedTimeRef.current = parseFloat(
            expectedTimeRef.current + 0.01
          ).toFixed(2);
        }
        checkActions(currentTime);
        //console.log(FramesToScroll)
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [Trs.content, Index]);

  const formatTime = (timeInSeconds) => {
    //console.log(timeInSeconds)
    const minutes = Math.floor(timeInSeconds / 60);
    //console.log(minutes)
    const seconds = Math.floor(timeInSeconds % 60);
    //console.log(seconds)
    //console.log(`${minutes.toString()}.${seconds.toString().padStart(2, '0')}`)
    return `${minutes.toString()}.${seconds.toString().padStart(2, "0")}`;
  };
  const checkActions = (time) => {
    console.log("checkando");
    console.log(Trs.content[Index + 1].start == time);
    console.log("Diferencias: " + Trs.content[Index + 1].start + " / " + time);
    if (Trs.content[Index + 1].start == time) {
      setIndex(Index + 1);
    }
  };

  const HandleLink = () => {
    
    let Spliter = "";
    if (Link.includes("https://youtu.be/")) {
      Spliter = Link.split("?")[0].split("/")[3];
    } else {
      Spliter = Link.split("/")[3].split("=")[1].split("&")[0];
    }

    GetTrs(Spliter,true);
    setVideoId(Spliter);
  };
  const HandleLocalStorage=()=>{
    const videos=JSON.parse(localStorage.getItem('videosYT')||
    "[]")
    console.log(videos)
    setYTVideos(videos)
    return videos
  }

  const FindVideoTime=(id)=>{
    const videos=HandleLocalStorage()
    const SingleVideo=videos.find(v=>v.link==id)
    console.log(SingleVideo)
    return SingleVideo.time
  }

  const SaveVideo=(v,New)=>{
    let time=0
    if (!New) {
      time=FindVideoTime(v)
      console.log(time)
      setCurrentTime(FindVideoTime(v))
    }
    const filter=YTVideos.filter((e)=>e.link!==v)

    const NewList=[{link:v,time:!New? time :0},...filter]
    console.log(NewList)
    setYTVideos(NewList)
    localStorage.setItem('videosYT',JSON.stringify(NewList))
    
  }

  const GetTrs = async (Code,New,lang=GetLanguage()) => {
    setTrs({content: [], status: -1});
    try {
      const Trans = await fetch(`${Ahost}/Sub/${lang}/${Code}`);
      if (!Trans.ok) {
        const errorData = await Trans.json();
        alert(errorData.detail || "Error fetching subtitles");
      }
      const TransStringJson = await Trans.json();
      console.log(TransStringJson);
      if (TransStringJson.status == 0) {
      TransStringJson.content=TransStringJson.content.snippets  

      }
      SaveVideo(Code,New)
      setTrs(TransStringJson);

    } catch (error) {
      setTrs(error)
    }
  };

  return (
    <div className="MainBackground">
      <div className="PasteLinkYt">
        <h1>Interactive Lyrics Youtube</h1>

        <div className="input__container youtubeSearch">
          <div className="shadow__input"></div>
          <button className="input__button__shadow" onClick={HandleLink}>
            <svg
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              height="20px"
              width="20px"
            >
              <path
                d="M4 9a5 5 0 1110 0A5 5 0 014 9zm5-7a7 7 0 104.2 12.6.999.999 0 00.093.107l3 3a1 1 0 001.414-1.414l-3-3a.999.999 0 00-.107-.093A7 7 0 009 2z"
                fillRule="evenodd"
                fill="#17202A"
              ></path>
            </svg>
          </button>
          <input
            type="text"
            name="text"
            className="input__search"
            onChange={(e) => setLink(e.target.value)}
            placeholder="Paste the Link"
          />
        </div>
      </div>
     {
          YTVideos.length>0&&Trs.status==0&&(
            <VideosMenu GetTrs={GetTrs} setVideoId={setVideoId} handleJump={handleJump}/>
          )
        }
      <div>
   
        {
          Trs.status == -1 && (
            <Loading />
          ) 
        }
        {Trs.status == 2 && (
          <div className="AvaliableLanguages">
            <h2>Avaliable Languages</h2>
            <p>We were not able to get the subtitles in the language requesed</p>
            <ul className="LanguagesList">
          {Trs.content.map((lang, index) => (
                  <li key={index} onClick={()=> GetTrs(VideoId,lang.código)}>
                    {lang.idioma} - {lang.código}
                  </li>
              ))}
            </ul>
    
          </div>

        )}

        {Trs.content&&(
          
        Trs.content.length > 1 &&
        Trs.status==0&&
        (
          <div className="contVideoAndLyric">
            <div className="fixedYoutubeVideo">
              <div>
                <YouTube
                  videoId={VideoId}
                  opts={opts}
                  onReady={(event) => (player.current = event.target)}
                />
                <p>Tiempo actual: {CurrentTime}s</p>
              </div>
            </div>
            <div className="lyricYoutube" ref={LyricScroll}>
              {Trs.content[Index - 1] && (
                <div className="VerseYt">
                  <p>
                    {" "}
                    <span>{Trs.content[Index - 1].start} </span> {Trs.content[Index - 1].text}{" "}
                  </p>{" "}
                </div>
              )}
              {Trs.content[Index] && (
                <div
                  className="VerseYt"
                  style={{ backgroundColor: "rgba(5, 60, 60, 0.76)" }}
                >
                  <p>
                    {" "}
                    <span>{Trs.content[Index].start} </span> {Trs.content[Index].text}{" "}
                  </p>{" "}
                </div>
              )}
              {Trs.content[Index + 1] && (
                <div className="VerseYt">
                  <p>
                    {" "}
                    <span>{Trs.content[Index + 1].start} </span> {Trs.content[Index + 1].text}{" "}
                  </p>{" "}
                </div>
              )}
            </div>
          </div>
        )
          
        )
      }

      </div>
    </div>
  );
}

export default YoutubeVideo;
