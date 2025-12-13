import "../../styles/LyricsAndWords.css";
import { MdOutlineRadioButtonChecked } from "react-icons/md";
import { useState, useEffect, useContext } from "react";
import AddWordToList from "../../Componets/AddWordToList.jsx";
import { Context } from "../../../Contexts/Context";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { WordsContext } from "../../../Contexts/WordsContext";
import ImageSearch from './ImageSeach.jsx'
//Hacer la funcion de agregar palabras a las listas que sea mediante arrays y no uno solo
function ElementCard({ Lists, CurrentListId }) {
  const { AddWord } = useContext(WordsContext);
  const { SelectedObjects, setSelectedObjects } = useContext(Context);
  const [AddWordB, setAddWordB] = useState(false);

  const [Index, setIndex] = useState(0);
  const [ActualHigh, setActualHigh] = useState(0);
  console.log(SelectedObjects);

  useEffect(() => {
    const updateHeight = () => {
      console.log(document.body.scrollHeight);
    };

    // Calcular la altura inicial
    updateHeight();
    console.log(SelectedObjects);
    // Recalcular si la ventana se redimensiona
    window.addEventListener("resize", updateHeight);
    console.log(window.innerHeight);
    document.body.style.overflow = "hidden";

    if (document.body.scrollHeight > 647) {
      setActualHigh(document.body.scrollHeight);
      window.scrollTo({ top: 0 });
    }

    window.getSelection().removeAllRanges();

    return () => {
      (document.body.style.overflow = "auto"),
        window.removeEventListener("resize", updateHeight);
    };
  }, []);
  useEffect(() => {
    setIndex(SelectedObjects.length - 1);
  }, [SelectedObjects]);

  const PostData =  () => {
    const data = {
      name: SelectedObjects[Index].name,
      past: SelectedObjects[Index].past,
      gerund: SelectedObjects[Index].gerund,
      participle: SelectedObjects[Index].participle,
      meaning: SelectedObjects[Index].meaning,
      example: SelectedObjects[Index].example,
      type:
        SelectedObjects[Index].mode == 2
          ? ["Phrasal Verb"]
          : SelectedObjects[Index].type,
      synonyms:
        SelectedObjects[Index].mode == 2
          ? SelectedObjects[Index].synonyms.map((e) => e).join(",")
          : SelectedObjects[Index].synonyms,
      antonyms:
        SelectedObjects[Index].mode == 2
          ? SelectedObjects[Index].antonyms.map((e) => e).join(",")
          : SelectedObjects[Index].antonyms,
    };
console.log(data)
    return data;
  };
  return (
    <div
      className="black"
      style={{
        height: document.body.scrollHeight + "px",
        width: "100vw",
        backgroundColor: "rgba(0, 0, 0, 0.33)",
        backdropFilter: "blur(20px)",
        display: "flex",
        justifyContent: "center",
        position: "absolute",
        left: "0",
        top: "0",
        color: "whitesmoke",
        zIndex:"10"
      }}
      
    >
      <div
        style={{
          height: "auto",
          maxHeight: "37rem",
          width: "30rem",
          backgroundColor: "#072138",
          display: "grid",
          gridTemplateRows: "auto auto 1fr",
          borderRadius: "10px",
          marginBottom: "2rem",
          marginTop: "2rem",
          position: "relative",
        zIndex: "100",

        }}
      >
        <div
          style={{
            height: "auto",
            maxHeight: "30rem",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflow: "scroll",
            scrollbarWidth: "none",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              width: "90%",
              height: "3rem",
              backgroundColor: "rgba(23, 23, 23, 0.91)",
              fontSize: "1.5rem",
              display: "flex",
              alignItems: "center",
              color: "#00c3ff",
              fontWeight: "bold",
              borderRadius: "10px",
              marginTop: "0.5rem",
              textAlign: "center",
              position: "relative",
              padding: "5px",
            }}
          >
            <button
              className="ActionButtoms"
              onClick={() => {
                console.log(ActualHigh);
                window.scrollTo({ top: ActualHigh });
                setSelectedObjects([]);
              }}
              style={{
                height: "2rem",
                width: "2rem",
                marginRight: "1rem",
                backgroundColor: "rgba(206, 206, 206, 0.93)",
                borderRadius: "50%",
                position: "absolute",
                left: "0",
              }}
            >
              X
            </button>
            <h3
              style={{
                textAlign: "center",
                color: "#00c3ff",
                marginLeft: "2rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {SelectedObjects[Index].name || "Word not found"}
            </h3>
          </div>
          {!SelectedObjects[Index].error ? (
            <>
              <div
                style={{
                  width: "90%",
                  height: "1.5rem",
                  backgroundColor: "rgba(6, 43, 86, 0.92)",
                  marginTop: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex:"2"
                }}
              >
                {SelectedObjects[Index].mode == 2
                  ? "Phrasal Verb"
                  : SelectedObjects[Index].type &&
                    SelectedObjects[Index].type.map((e) => e).join(",")}
              </div>
              {
                SelectedObjects[Index].image==""&&(
                  <ImageSearch word={SelectedObjects[Index].name} dataWord={SelectedObjects[Index]} setDataWord={setSelectedObjects} index={Index}/>
                )
              }
              {((SelectedObjects[Index].image &&
                SelectedObjects[Index].image.length > 0) ||
                SelectedObjects[Index].meaning) && (
                <div
                  style={{
                    height: "8rem",
                    width: "90%",
                    display: "flex",
                    marginTop: "0.5rem",
                  }}
                >
                  {SelectedObjects[Index].image &&
                    SelectedObjects[Index].image.length > 0 &&
                    SelectedObjects[Index].image.split(";").length > 1 && (
                      <div
                        style={{
                          width: "49%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(6, 43, 86, 0.92)",
                          borderRadius: "10px",
                          overflow: "scroll",
                        }}
                      >
                        {SelectedObjects[Index].image.split(";").map((e, i) => (
                          <img
                            key={i}
                            alt=""
                            src={e}
                            style={{
                              height: "100%",
                              width: "100%",
                              objectFit: "cover",
                              borderRadius: "10px",
                              marginRight: "0.5rem",
                            }}
                          />
                        ))}
                        )
                      </div>
                    )}
                  {SelectedObjects[Index].image &&
                    SelectedObjects[Index].image.split(";").length == 1 &&
                    SelectedObjects[Index].image.length > 0 &&
                    SelectedObjects[Index].image && (
                      <img
                        alt=""
                        src={SelectedObjects[Index].image}
                        style={{ height: "100%", width: "49%" }}
                      />
                    )}
                  {SelectedObjects[Index].meaning && (
                    <div
                      style={{
                        padding: "0.5rem",
                        maxHeight:
                          SelectedObjects[Index].mode == 2 ||
                          !SelectedObjects[Index].image
                            ? "8rem"
                            : "10rem",
                        overflow: "scroll",
                        scrollbarWidth: "none",
                        textAlign: "center",
                        backgroundColor: "rgba(6, 43, 86, 0.92)",
                        marginLeft: !SelectedObjects[Index].image
                          ? "0"
                          : "0rem",
                        width: !SelectedObjects[Index].image ? "100%" : "50%",
                      }}
                    >
                      <h3 style={{ fontSize: "1.2rem" }}>
                        {" "}
                        <span>Description</span>{" "}
                      </h3>
                      <div style={{ display: "flex" }}>
                        {SelectedObjects[Index].meaning.includes("\n") ? (
                          <div>
                            {SelectedObjects[Index].meaning
                              .split("\n")
                              .map((e, i) => (
                                <>
                                  <p
                                    key={i}
                                    style={{
                                      maxWidth: "90%",
                                      textAlign: "left",
                                      marginLeft: "1rem",
                                      fontSize: "1.2rem",
                                      marginTop: "0.5rem",
                                    }}
                                  >
                                    <span>
                                      <MdOutlineRadioButtonChecked />
                                    </span>{" "}
                                    {e}
                                  </p>
                                </>
                              ))}
                          </div>
                        ) : (
                          <>
                            <p
                              style={{
                                maxWidth: "90%",
                                textAlign: "left",
                                marginLeft: "1rem",
                                fontSize: "1.2rem",
                              }}
                            >
                              <span>
                                <MdOutlineRadioButtonChecked />
                              </span>{" "}
                              {SelectedObjects[Index].meaning}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(SelectedObjects[Index].synonyms.length > 0 ||
                SelectedObjects[Index].antonyms.length > 0) && (
                <div style={{ width: "90%", marginTop: "0.3rem" }}>
                  {SelectedObjects[Index].synonyms.length > 0 ? (
                    <div
                      style={{
                        marginTop: "1rem",
                        width: "100%",
                        maxHeight: "1.8rem",
                        backgroundColor: "rgba(18, 181, 226, 0.74)",
                        fontWeight: "bold",
                        textShadow: "0px 0px 10px black",
                        display: "flex",
                        marginBottom: "0.5rem",
                        height: "3rem",
                        overflow: "hidden",
                      }}
                    >
                      <p
                        style={{
                          marginLeft: "0.5rem",
                          width: "90%",
                          fontSize: "1.2rem",
                          overflow: "auto",
                          scrollbarWidth: "thin",
                          height: "auto",
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          overflowWrap: "break-word",
                        }}
                      >
                        {SelectedObjects[Index].mode == 2
                          ? SelectedObjects[Index].synonyms
                              .map((e) => e)
                              .join(",")
                          : SelectedObjects[Index].synonyms}
                      </p>
                    </div>
                  ) : null}

                  {SelectedObjects[Index].antonyms.length > 0 ? (
                    <div
                      style={{
                        marginTop: "1.5rem",
                        width: "100%",
                        maxHeight: "1.8rem",
                        backgroundColor: "rgba(198, 10, 10, 0.83)",
                        fontWeight: "bold",
                        overflow: "hidden",
                        display: "flex",
                      }}
                    >
                      <p
                        style={{
                          marginLeft: "0.5rem",
                          width: "90%",
                          fontSize: "1.2rem",
                          overflow: "auto",
                          scrollbarWidth: "thin",
                          height: "auto",
                        }}
                      >
                        {SelectedObjects[Index].mode == 2
                          ? SelectedObjects[Index].antonyms
                              .map((e) => e)
                              .join(",")
                          : SelectedObjects[Index].antonyms}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              {(SelectedObjects[Index].past ||
                SelectedObjects[Index].participle ||
                SelectedObjects[Index].gerund) && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    width: "90%",
                    fontFamily: "roboto",
                  }}
                >
                  <table>
                    <thead>
                      <tr>
                        {SelectedObjects[Index].past && <th>Past</th>}
                        {SelectedObjects[Index].participle && (
                          <th>Participle</th>
                        )}
                        {SelectedObjects[Index].gerund && <th>Gerund</th>}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {SelectedObjects[Index].past && (
                          <td>{SelectedObjects[Index].past}</td>
                        )}
                        {SelectedObjects[Index].participle && (
                          <td>{SelectedObjects[Index].participle}</td>
                        )}
                        {SelectedObjects[Index].gerund && (
                          <td>{SelectedObjects[Index].gerund}</td>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {SelectedObjects[Index].example.length > 0 ? (
                <div
                  style={{
                    backgroundColor: "rgba(25, 25, 25, 0.83)",
                    minHeight: "11rem",
                    maxHeight: "11rem",
                    width: "90%",
                    marginTop: "1rem",
                    overflow: "scroll",
                    scrollbarWidth: "none",
                    textAlign: "left",
                  }}
                >
                  <div style={{ width: "90%", margin: "1rem" }}>
                    <h3 style={{ fontSize: "1.2rem", color: "#00c3ff" }}>
                      Examples
                    </h3>
                    {SelectedObjects[Index].example.map((e, i) => (
                      <p
                        style={{ marginTop: "0.5rem", fontSize: "1.2rem" }}
                        key={i}
                      >
                        {" "}
                        <span>
                          <MdOutlineRadioButtonChecked />
                        </span>{" "}
                        {e}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div
              style={{
                width: "90%",
                height: "10rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(6, 43, 86, 0.92)",
                borderRadius: "10px",
              }}
            >
              <h3 style={{ fontSize: "1.2rem", color: "#00c3ff" }}>
               { SelectedObjects[Index].name || "An error has occurred"}
              </h3>
            </div>
          )}
        </div>

        <>
          <div
            style={{
              width: "100%",
              height: "auto",
              alignSelf: "end",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "absolute",
            }}
          >
            {AddWordB && !SelectedObjects[Index].error ? (
<AddWordToList ExtraFunction={()=>setAddWordB(false)}  data={PostData()} CurrentListId={CurrentListId}/>
            ) : null}
            <div
              style={{
                width: "100%",
                height: "3rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgb(23, 23, 23)",
                borderEndStartRadius: "10px",
                borderEndEndRadius: "10px",
              }}
            >
              {!SelectedObjects[Index].error && (
                <button
                  className="ActionButtoms"
                  style={{
                    borderRadius: "50%",
                    border: "none",
                    height: "2rem",
                    width: "2rem",
                  }}
                  onClick={() => setAddWordB(!AddWordB)}
                >
                  {AddWordB ? "X" : "+"}
                </button>
              )}

              {SelectedObjects.length > 1 ? (
                <div style={{ marginLeft: "0.5rem" }}>
                  <button
                    style={{ marginLeft: "1rem" }}
                    onClick={() => {
                      if (Index != 0) {
                        setIndex(Index - 1);
                      } else {
                        setIndex(SelectedObjects.length - 1);
                      }
                    }}
                    className="ActionButtoms"
                  >
                    <IoIosArrowBack />
                  </button>
                  <button
                    style={{ marginLeft: "1rem" }}
                    onClick={() => {
                      if (Index != SelectedObjects.length - 1) {
                        setIndex(Index + 1);
                      } else {
                        setIndex(0);
                      }
                    }}
                    className="ActionButtoms"
                  >
                    <IoIosArrowForward />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </>
      </div>
    </div>
  );
}

export default ElementCard;
