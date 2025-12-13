import React, { useState, useContext, useEffect, useRef } from "react";
import PropTypes from "prop-types"; // 👈 Importante
import "../../styles/Random.css";
import { MdOutlineFlipCameraAndroid } from "react-icons/md";
import { FaGrinSquint, FaLaugh, FaMeh, FaDizzy } from "react-icons/fa";
import { Context } from "../../../Contexts/Context";
import Audio from "../../Componets/audio/Audio";
import Loader2 from "../Actions/Loader2";

function RandomItem({
  ShuffledArray,
  ShowElement,
  Index,
  Next,
  Face,
  setFace,
  lap,
}) {
  const { Language, Ahost } = useContext(Context);
  const audioRef = useRef(null);
  const [AudioToSpeak, setAudioToSpeak] = useState("");
  const [AudioState, setAudioState] = useState(0);

  const HandleVoice = async () => {
    setAudioState(1);
    let text = ShuffledArray[Index].name;
    if (ShuffledArray[Index].example.length > 0) {
      ShuffledArray[Index].example.forEach((element, i) => {
        text =
          text + "." + `Example ${i + 1}:` + `${element.replace("?", "")}:`;
      });
    }

    try {
      const response = await fetch(`${Ahost}/texto_a_voz/${text}/${Language}`);
      const AudioBytes = await response.blob();
      const audioUrl = URL.createObjectURL(AudioBytes);
      setAudioToSpeak(audioUrl);
      setAudioState(2);
    } catch (error) {
      console.error("Error al obtener el audio:", error);
    }
  };

  useEffect(() => {
    HandleVoice();
  }, [Index, ShuffledArray]);

  return (
    <>
      {ShowElement && (
        <>
          {Face === 1 && (
            <>
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
                  <p>
                    <span>Past-Tense:</span> {ShuffledArray[Index].past}
                  </p>
                )}

                <div className="ex">
                  <p>
                    <span>Examples:</span>
                  </p>
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
                }}
                onClick={() => setFace(2)}
              >
                <MdOutlineFlipCameraAndroid />
              </button>
            </>
          )}

          {Face === 2 && (
            <>
              <div className="RandomCard">
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
                    <p>
                      <span>Past-Tense:</span> {ShuffledArray[Index].past}
                    </p>
                  )}

                  {ShuffledArray[Index].synonyms.length > 0 && (
                    <p className="SyA">
                      <span>Synonyms:</span> {ShuffledArray[Index].synonyms}
                    </p>
                  )}

                  {ShuffledArray[Index].antonyms.length > 0 && (
                    <p className="SyA">
                      <span>Antonyms:</span> {ShuffledArray[Index].antonyms}
                    </p>
                  )}
                </div>

                {ShuffledArray[Index].example.length > 0 && (
                  <div className="ex">
                    <p>
                      <span>Examples:</span>
                    </p>
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

                {ShuffledArray[Index].image && (
                  <img src={ShuffledArray[Index].image} alt="Word visual" />
                )}
              </div>

              <div
                style={{
                  height: "auto",
                  width: "auto",
                  transform: "translateY(1px)",
                  marginBottom: "3rem",
                }}
              >
                <button
                  className="OptionsButtoms option1"
                  onClick={() => Next("easy", ShuffledArray[Index], Index, lap)}
                >
                  <FaGrinSquint />
                </button>
                <button
                  className="OptionsButtoms option2"
                  onClick={() =>
                    Next("normal", ShuffledArray[Index], Index, lap)
                  }
                >
                  <FaLaugh />
                </button>
                <button
                  className="OptionsButtoms option3"
                  onClick={() => Next("hard", ShuffledArray[Index], Index, lap)}
                >
                  <FaMeh />
                </button>
                <button
                  className="OptionsButtoms option4"
                  onClick={() =>
                    Next("ultrahard", ShuffledArray[Index], Index, lap)
                  }
                >
                  <FaDizzy />
                </button>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

export default RandomItem;

RandomItem.propTypes = {
  ShuffledArray: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      type: PropTypes.arrayOf(PropTypes.string).isRequired,
      past: PropTypes.string,
      example: PropTypes.arrayOf(PropTypes.string).isRequired,
      synonyms: PropTypes.arrayOf(PropTypes.string),
      antonyms: PropTypes.arrayOf(PropTypes.string),
      meaning: PropTypes.string,
      image: PropTypes.string,
    })
  ).isRequired,
  ShowElement: PropTypes.bool.isRequired,
  Index: PropTypes.number.isRequired,
  Next: PropTypes.func.isRequired,
  Face: PropTypes.number.isRequired,
  setFace: PropTypes.func.isRequired,
  lap: PropTypes.number.isRequired,
};
