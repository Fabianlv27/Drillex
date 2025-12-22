import React, { useState, useContext, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "../../styles/Random.css";
import { MdOutlineFlipCameraAndroid } from "react-icons/md";
import { FaGrinSquint, FaLaugh, FaMeh, FaDizzy } from "react-icons/fa";
import { Context } from "../../../Contexts/Context";
import Audio from "../../Componets/audio/Audio";
import Loader2 from "../Actions/Loader2";

function RandomItem({ ShuffledArray, ShowElement, Index, Next, Face, setFace, lap }) {
  const { Language, Ahost } = useContext(Context);
  const audioRef = useRef(null);
  const [AudioToSpeak, setAudioToSpeak] = useState("");
  const [AudioState, setAudioState] = useState(0);

  const HandleVoice = async () => {
    setAudioState(1);
    let text = ShuffledArray[Index].name;
    
    if (ShuffledArray[Index].example && ShuffledArray[Index].example.length > 0) {
      const examplesToRead = ShuffledArray[Index].example.slice(0, 3);
      examplesToRead.forEach((ex, i) => {
          const cleanEx = ex.replace(/[?¿!¡]/g, "").trim();
          text = `${text}. Example ${i + 1}: ${cleanEx}`;
      });
    }

    try {
      const safeText = encodeURIComponent(text);
      const response = await fetch(`${Ahost}/texto_a_voz/${safeText}/${Language}`);
      const AudioBytes = await response.blob();
      const audioUrl = URL.createObjectURL(AudioBytes);
      setAudioToSpeak(audioUrl);
      setAudioState(2);
    } catch (error) {
      console.error("Error al obtener el audio:", error);
      setAudioState(0);
    }
  };

  useEffect(() => {
    HandleVoice();
  }, [Index, ShuffledArray]);

  return (
    <>
      {ShowElement && (
        <div className="flip-card">
          <div className={`flip-card-inner ${Face === 2 ? "flipped" : ""}`}>
            
            {/* --- CARA DELANTERA (FACE 1) --- */}
            <div className="flip-card-front">
              <div className="RandomCard">
                <h2>{ShuffledArray[Index].name}</h2>
                <p>{ShuffledArray[Index].type.map((e) => e).join(", ")}</p>
                <div className="audio-control">
                  {AudioToSpeak && AudioState === 2 ? (
                    <Audio AudioToSpeak={AudioToSpeak} audio_ref={audioRef} />
                  ) : AudioState === 1 ? (
                    <Loader2 />
                  ) : null}
                </div>

                {ShuffledArray[Index].past && (
                  <p><span>Past-Tense:</span> {ShuffledArray[Index].past}</p>
                )}

                <div className="ex">
                  <p><span>Examples:</span></p>
                  <ul>
                    {ShuffledArray[Index].example.map((ex, index) => (
                      <li key={index}>{ex}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                className="ActionButtoms flipper"
                style={{
                  transform: "translate(0px, -15px)",
                  zIndex: "1",
                  marginTop: "10px"
                }}
                onClick={() => setFace(2)}
              >
                <MdOutlineFlipCameraAndroid />
              </button>
            </div>

            {/* --- CARA TRASERA (FACE 2) --- */}
            <div className="flip-card-back">
              
             
              {/* LA CARTA DE DATOS */}
              <div className="RandomCard" style={{marginTop: "0"}}> 
                <h2>{ShuffledArray[Index].name}</h2>
                {ShuffledArray[Index].type && (
                  <p className="type-random">
                    {ShuffledArray[Index].type.map((e) => e).join(", ")}
                  </p>
                )}

                <div>
                  {AudioToSpeak && AudioState === 2 && (
                    <Audio AudioToSpeak={AudioToSpeak} audio_ref={audioRef} />
                  )}
                </div>

                <div className="syanpa">
                  {ShuffledArray[Index].past && (
                    <p><span>Past-Tense:</span> {ShuffledArray[Index].past}</p>
                  )}
                  {ShuffledArray[Index].synonyms.length > 0 && (
                    <p className="SyA"><span>Synonyms:</span> {ShuffledArray[Index].synonyms}</p>
                  )}
                  {ShuffledArray[Index].antonyms.length > 0 && (
                    <p className="SyA"><span>Antonyms:</span> {ShuffledArray[Index].antonyms}</p>
                  )}
                </div>

                {ShuffledArray[Index].example.length > 0 && (
                  <div className="ex">
                    <p><span>Examples:</span></p>
                    <ul>
                      {ShuffledArray[Index].example.map((ex, index) => (
                        <li key={index}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="MeaningBox">
                  <p className="MeaningText">
                    <span>Meaning:</span> {ShuffledArray[Index].meaning}
                  </p>
                </div>
              </div>
               {/* --- BOTONES DE DIFICULTAD (AHORA ARRIBA) --- */}
              {/* Los muevo fuera de RandomCard, pero antes, para que estén arriba */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  marginBottom: "15px", // Espacio entre botones y carta
                  width: "100%",
                }}
              >
                {/* Nota: Quité position: absolute para que fluyan normal arriba de la carta, 
                    o puedes usar absolute con top: -50px si prefieres que floten fuera */}
                <button className="OptionsButtoms" style={{position: "relative", bottom: "auto", background: "rgb(255, 248, 47)"}} onClick={() => Next("easy", ShuffledArray[Index], Index, lap)}>
                  <FaGrinSquint />
                </button>
                <button className="OptionsButtoms" style={{position: "relative", bottom: "auto", background: "rgb(255, 161, 47)"}} onClick={() => Next("normal", ShuffledArray[Index], Index, lap)}>
                  <FaLaugh />
                </button>
                <button className="OptionsButtoms" style={{position: "relative", bottom: "auto", background: "rgb(255, 85, 47)"}} onClick={() => Next("hard", ShuffledArray[Index], Index, lap)}>
                  <FaMeh />
                </button>
                <button className="OptionsButtoms" style={{position: "relative", bottom: "auto", background: "rgb(255, 0, 0)"}} onClick={() => Next("ultrahard", ShuffledArray[Index], Index, lap)}>
                  <FaDizzy />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default RandomItem;
// ...PropTypes...

RandomItem.propTypes = {
  ShuffledArray: PropTypes.array.isRequired,
  ShowElement: PropTypes.bool.isRequired,
  Index: PropTypes.number.isRequired,
  Next: PropTypes.func.isRequired,
  Face: PropTypes.number.isRequired,
  setFace: PropTypes.func.isRequired,
  lap: PropTypes.number.isRequired,
};