import { useState, useEffect, useContext, useRef } from "react";
import { Context } from "../../../Contexts/Context";
import "../../styles/FindPV.css";
import { GiRollingDices } from "react-icons/gi";
import { TbSquareRoundedLetterLFilled } from "react-icons/tb";
import { FaSearch } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { MdOutlineRadioButtonChecked } from "react-icons/md";
import { GrNext } from "react-icons/gr";
import { MdArrowBackIosNew } from "react-icons/md";
import { IoMdAddCircle } from "react-icons/io";
import { WordsContext } from "../../../Contexts/WordsContext";
import { ListsContext } from "../../../Contexts/ListsContext";
import {RandomPhrasal,LetterPhrasals} from '../../Functions/Actions/PhrasalsHandler'
function PhrData() {
  const { Ahost } = useContext(Context);
  const { AddWord } = useContext(WordsContext);
  const { CurrentListId, setCurrentList, GetList, UserLists } =
    useContext(ListsContext);
  const [ShowPhrs, setShowPhrs] = useState(false);
  const [AmountOfPhrs, setAmountOfPhrs] = useState(5);
  const [PhrToShow, setPhrToShow] = useState([]);
  const [Index, setIndex] = useState(0);
  const [WayChoises, setWayChoises] = useState("Random");
  const [UserLetter, setUserLetter] = useState("A");
  const [ShowAdd, setShowAdd] = useState(0);
  const [PhrSearchList, setPhrSearchList] = useState([]);
  const [PhrSearchBit, setPhrSearchBit] = useState([]);
  const [MainPhrSearch, setMainPhrSearch] = useState({});
  const [PhrSearchListToShow, setPhrSearchListToShow] = useState([]);
  const [ShowMainPhr, setShowMainPhr] = useState(false);
  const [ShowResults, setShowResults] = useState(false);
  const [ShowRecom, setShowRecom] = useState(true);

  const inputRef = useRef(null);
  const AmountChoises = [5, 10, 15, 20, 25];
  const abecedario_mayuscula = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];
  //const ChoisesToFindPhrs=['Random','ByLetter','Search']

  const handleOutsideClick = (event) => {
    if (inputRef.current && !inputRef.current.contains(event.target)) {
      setShowRecom(false);
    }
  };

  useEffect(() => {
    // Agrega el event listener para detectar clics fuera del input
    document.addEventListener("mousedown", handleOutsideClick);

    // Limpia el event listener cuando el componente se desmonta
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);
  const HandleList = async () => {
    setCurrentList(await GetList());
  };
  useEffect(() => {
    HandleList();
  }, []);
  const PVCardMenu = () => {
    return (
      <div className="PVCard">
        <>
          <div className="TitleMenu">
            <h2>{PhrToShow[Index].name}</h2>
          </div>
          <div className="Tenses" style={{}}>
            <table>
              <thead>
                <tr>
                  {PhrToShow[Index].past && <th>Past</th>}
                  {PhrToShow[Index].participle && <th>Participle</th>}
                  {PhrToShow[Index].gerund && <th>Gerund</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {PhrToShow[Index].past && <td>{PhrToShow[Index].past}</td>}
                  {PhrToShow[Index].participle && (
                    <td>{PhrToShow[Index].participle}</td>
                  )}
                  {PhrToShow[Index].gerund && (
                    <td>{PhrToShow[Index].gerund}</td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="MeaningBox">
            <p>{PhrToShow[Index].meaning}</p>
          </div>
          <p> </p>
          <div className="examplesPVMenu">
            <span>Examples: </span>
            <div className="singleExPv">
              {PhrToShow[Index].example.map((e, i) => (
                <p key={i}>
                  <span>
                    <MdOutlineRadioButtonChecked />{" "}
                  </span>{" "}
                  {e}
                </p>
              ))}
            </div>
          </div>

          <div className="SynCardPhr">
            <p>{PhrToShow[Index].synonyms.map((e) => e).join(", ")}</p>
          </div>
          <div className="AntCardPhr">
            <p>{PhrToShow[Index].antonyms.map((e) => e).join(", ")}</p>
          </div>
          <div className="IntANdFr">
            <p>
              {" "}
              <span>Intensity:</span> {PhrToShow[Index].Way}
            </p>
            <p>
              {" "}
              <span>Frequency: </span> {PhrToShow[Index].Frequency}
            </p>
          </div>
          <div className="ButtomsMenuPV">
            {Index !== 0 ? (
              <button className="ActionButtoms" onClick={() => Back(Index)}>
                <MdArrowBackIosNew />
              </button>
            ) : null}
            <button
              className="ActionButtoms"
              onClick={() => {
                setShowAdd(0);
                Next(Index);
              }}
            >
              <GrNext />
            </button>
            {ShowPhrs ? (
              <button className="ActionButtoms" onClick={() => setShowAdd(1)}>
                <IoMdAddCircle />
              </button>
            ) : null}
          </div>
        </>
      </div>
    );
  };
  const SearchRandom = async () => {
    setPhrToShow(await RandomPhrasal(AmountOfPhrs));
    setShowPhrs(true);
  };
  const SearchByLetter = async () => {
    setPhrToShow(await LetterPhrasals(UserLetter, AmountOfPhrs));
    setShowPhrs(true);
  };
  const Next = (index) => {
    if (PhrToShow[index + 1]) {
      setIndex(Index + 1);
    } else {
      setIndex(0);
      setShowPhrs(false);
    }
    setShowAdd(0);
  };
  const Back = (index) => {
    setIndex(index - 1);
  };
  const searchModes = {
    Random: (
      <div className="MainModeMenu">
        <div>
          {!ShowPhrs ? (
            <>
              <h2>Random Phrasal Verbs</h2>
              <p>Select The Amount</p>
              <select onChange={(e) => setAmountOfPhrs(e.target.value)}>
                {AmountChoises.map((e, i) => (
                  <option key={i} value={e}>
                    {e}
                  </option>
                ))}
              </select>
              <button className="ActionButtoms s" onClick={SearchRandom}>
                <FaCheckCircle />
              </button>
            </>
          ) : null}
        </div>

        {ShowPhrs ? <PVCardMenu /> : null}
      </div>
    ),
    ByLetter: (
      <div className="MainModeMenu">
        <h2>Find Phrasal Verbs by letter</h2>
        {!ShowPhrs ? (
          <>
            <p>Select The Amount</p>
            <select onChange={(e) => setAmountOfPhrs(e.target.value)}>
              {AmountChoises.map((e, i) => (
                <option key={i} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <div className="Note">
              <p>
                Note: if there are no enought Phrasal Verbs with the letter,
                just it will show that it have{" "}
              </p>
            </div>

            <p>Select The Letter</p>
            <div>
              <select
                onChange={(e) => {
                  console.log(e.target.value);
                  setUserLetter(e.target.value);
                }}
              >
                {abecedario_mayuscula.map((e, i) => (
                  <option key={i} value={e}>
                    {e}
                  </option>
                ))}
              </select>
              <button className="ActionButtoms s" onClick={SearchByLetter}>
                OK
              </button>
            </div>
          </>
        ) : null}
        <div>{ShowPhrs ? <PVCardMenu /> : null}</div>
      </div>
    ),
    Search: (
      <div>
        <h2>Search</h2>
        <div className="inputAndSearch">
          <div style={{ position: "relative", width: "300px" }}>
            <input
              type="text"
              ref={inputRef}
              onClick={() => setShowRecom(true)}
              onChange={async (e) => {
                if (e.target.value.length > 0) {
                  if (!ShowRecom) {
                    setShowRecom(true);
                  }
                  const response = await fetch(
                    `${Ahost}/SearchPhr/${e.target.value}`
                  );
                  const data = await response.json();
                  setPhrSearchBit(data.bit);
                  setPhrSearchList(data.All);
                }
              }}
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
              }}
            />

            {PhrSearchBit.length > 0 && ShowRecom ? (
              <ul
                ref={inputRef}
                style={{
                  listStyleType: "none",
                  margin: 0,
                  padding: 0,
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,

                  zIndex: 1000,
                }}
              >
                {PhrSearchBit.map((e, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setMainPhrSearch(e);
                      setShowRecom(false);
                      setShowMainPhr(true);
                    }}
                    style={{
                      padding: "10px",
                      cursor: "pointer",
                      textShadow: "0 0px 10px rgba(0, 0, 0, 1)",
                      color: "whitesmoke",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    {e.name}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <button
            className="SearchButtom"
            onClick={() => {
              setPhrSearchListToShow(PhrSearchList);
              setShowRecom(false);
              setShowMainPhr(false);
              setShowResults(true);
            }}
          >
            <FaSearch />
          </button>
        </div>

        <div>
          {ShowResults ? (
            <>
              <ul>
                {PhrSearchListToShow.map((e, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setMainPhrSearch(e);
                      setShowMainPhr(true);
                      setShowResults(false);
                    }}
                  >
                    {e.name}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
        <div>
          {ShowMainPhr ? (
            <div className="MainSpvCard">
              <div className="PVCard">
                <>
                  <div className="TitleMenu">
                    <h2>{MainPhrSearch.name}</h2>
                  </div>

                  <p>
                    {" "}
                    <span>Past:</span> {MainPhrSearch.past}
                  </p>
                  <p>
                    {" "}
                    <span>Participle:</span> {MainPhrSearch.participle}
                  </p>
                  <div className="MeaningBox">
                    <p>{MainPhrSearch.meaning}</p>
                  </div>
                  <div className="examplesPVMenu">
                    <p>
                      {" "}
                      <span>Examples: </span>
                    </p>
                    <div className="singleExPv">
                      {MainPhrSearch.example.map((e, i) => (
                        <p key={i}>
                          <span>
                            <MdOutlineRadioButtonChecked />{" "}
                          </span>{" "}
                          {e}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="SynCardPhr">
                    <p>{MainPhrSearch.synonyms.map((e) => e).join(", ")}</p>
                  </div>
                  <div className="AntCardPhr">
                    <p>{MainPhrSearch.antonyms.map((e) => e).join(", ")}</p>
                  </div>
                  <div className="IntANdFr">
                    <p>
                      {" "}
                      <span>Intensity:</span> {MainPhrSearch.Way}
                    </p>
                    <p>
                      {" "}
                      <span>Frequency: </span> {MainPhrSearch.Frequency}
                    </p>
                  </div>
                </>
              </div>
              {ShowMainPhr ? (
                <button className="ActionButtoms" onClick={() => setShowAdd(1)}>
                  <IoMdAddCircle />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    ),
  };
  const handleSelectChange = (e) => {
    const selectedId = e.target.value;
    console.log(selectedId);
    setCurrentList({
      id: selectedId,
      title: e.target.options[e.target.selectedIndex].text,
    });
  };
  return (
    <div className="MainBackground FindPVMenuMain">
      <h1>Discover News Phrasal Verbs</h1>

      {!ShowPhrs ? (
        <div className="radio-inputs">
          <label className="radio">
            <input
              type="radio"
              name="radio"
              onClick={() => {
                setShowAdd(0);
                setWayChoises("Random");
              }}
              checked={WayChoises == "Random"}
            />
            <span className="name">
              <GiRollingDices />
            </span>
          </label>
          <label className="radio">
            <input
              type="radio"
              name="radio"
              onClick={() => {
                setShowAdd(0);
                setWayChoises("ByLetter");
              }}
            />
            <span className="name">
              <TbSquareRoundedLetterLFilled />
            </span>
          </label>

          <label className="radio">
            <input
              type="radio"
              name="radio"
              onClick={() => {
                setShowAdd(0);
                setWayChoises("Search");
              }}
            />
            <span className="name">
              <FaSearch />
            </span>
          </label>
        </div>
      ) : null}
      <div className="AllModes">
        {searchModes[WayChoises]}
        {}
      </div>
      {ShowAdd != 0 ? (
        <div className="AddMenuPV">
          {ShowAdd == 1 ? (
            <div>
              <select onChange={handleSelectChange}>
                {UserLists.map((e, i) => (
                  <option key={i} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
              <button
                className="ActionButtoms s"
                onClick={async () => {
                  let PhrMode = PhrToShow[Index];
                  console.log(CurrentListId);
                  if (WayChoises == "Search") {
                    PhrMode = MainPhrSearch;
                  } else {
                    PhrMode = PhrToShow[Index];
                  }
                  const data = {
                    name: PhrMode.name,
                    past: PhrMode.past,
                    gerund: PhrMode.gerund,
                    meaning: PhrMode.meaning,
                    type: ["Phrasal Verb"],
                    example: PhrMode,
                    synonyms: PhrMode,
                    antonyms: PhrMode,
                    participle: "",
                    image: "",
                  };
                  await AddWord(CurrentListId.id, data);
                  setShowAdd(2);
                }}
              >
                <FaCheckCircle />
              </button>
            </div>
          ) : null}
          {ShowAdd == 2 ? <p>Añadido</p> : null}
        </div>
      ) : null}
    </div>
  );
}

export default PhrData;
