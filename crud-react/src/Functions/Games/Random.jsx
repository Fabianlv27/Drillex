import  { useState, useContext, useEffect, useRef } from "react";
import { WordsContext } from "../../../Contexts/WordsContext";
import { ListsContext } from "../../../Contexts/ListsContext";
import RandomItem from "../secondary menus/RandomItem";
import { MdNotStarted } from "react-icons/md";
import {Shuffler} from "../../Functions/Actions/Shuffler.js";
import {
  GetData,
  UpdateProgress,
} from "../../../api/saveProgress.js";

function Random() {
  //Cada ves que cambie  que coloque bien el objeto en CurrentListId
  const { GetWords } = useContext(WordsContext);
  const { CurrentListId, setCurrentList, GetList, UserLists } =
    useContext(ListsContext);
  const [ShuffledArray, setShuffledArray] = useState([]);
  const [Index, setIndex] = useState(0);
  const [ShowRandom, setShowRandom] = useState(false);
  const [Difficulty, setDifficulty] = useState({ easy: [], normal: [], hard: [], ultrahard: [] });
  const [Lap, setLap] = useState(1);
  const [Face, setFace] = useState(1);
  const [ShowElement, setShowElement] = useState(true);
  // const [ListToShow, setListToShow] = useState([])
  
  useEffect(() => {
    console.log('hello')
    const HandlerList = async () => {
      setCurrentList(await GetList());
    };

    HandlerList();
  }, []);


  
  // Función para iniciar el juego
  const startGame = async () => {
    console.log(CurrentListId);
    const Words = await GetWords(CurrentListId.id,'random');
    console.log(Words);
    const shuffledWords = Shuffler(Words);
    console.log(shuffledWords);
    setShuffledArray(shuffledWords.slice(0,10));
    setShowElement(true);
    setShowRandom(true);
  };

    const handlerProgress= async()=>{
    const pending = localStorage.getItem("pendingProgress");
    if (pending) {
      const data = JSON.parse(pending);
      console.log(data)
      await UpdateProgress(data);
    }
  }
  
    useEffect(() => {
      ProgressVerifier()
      handlerProgress()
    }, []);


      useEffect(() => {
     localStorage.setItem("pendingProgress", JSON.stringify({
  idList: CurrentListId.id,
  game: "random",
  cant: Index + 1,
  difficulty:Difficulty ,
}))
  }, [Index]);


   const ProgressVerifier = async () => {
     const isProgress = localStorage.getItem("Random_"+CurrentListId.id);
      if (!isProgress) {
           localStorage.setItem("Random_"+CurrentListId.id,"True")
      }
 
    };

  useEffect(() => {
    console.log("object");
    setIndex(0);
    setLap(1);
    setDifficulty({ easy: [], normal: [], hard: [], ultrahard: [] });
  }, [ShuffledArray]);

  const Discriminator = (item, lap) => {
    console.log(item);
    console.log(lap);
    switch (lap) {
      case 3:
        if (
          Difficulty.ultrahard.includes(item) ||
          Difficulty.hard.includes(item) ||
          Difficulty.normal.includes(item)
        ) {
          console.log("case3 included");
          setShowElement(true);
        } else {
          Next("easy", item, 0, 3);
        }

        break;
      case 4:
        if (Difficulty.ultrahard.includes(item) || Difficulty.hard.includes(item)) {
          setShowElement(true);
        } else {
          Next("easy", item, 0, 4);
        }
        break;
      case 5:
        if (Difficulty.ultrahard.includes(item)) {
          setShowElement(true);
        } else {
          Next("easy", item, 0, 5);
        }
        break;

      default:
        break;
    }
  };

  const Next = (TypeLevel, elemento, i, l) => {
    if (Index%5==0) {
      handlerProgress() 
    }
    console.log(i);
    console.log(l);
    setFace(1);
    switch (l) {
      case 1:
        if (ShuffledArray[i + 1]) {
          setIndex(i + 1);
        } else {
          setIndex(0);
          setLap(2);
          console.log("lap1 end");
        }
        break;
      case 2:
        if (ShuffledArray[i + 1]) {
          setIndex(i + 1);
        } else {
          console.log("lap2 end");

          setShowElement(false);
          setIndex(0);

          setLap(3);
          Discriminator(ShuffledArray[0], 3);
        }
        break;
      case 3:
        setShowElement(false);
        if (ShuffledArray[i + 1]) {
          console.log(ShuffledArray[i + 1]);
          if (
            Difficulty.ultrahard.includes(ShuffledArray[i + 1]) ||
            Difficulty.hard.includes(ShuffledArray[i + 1]) ||
            Difficulty.normal.includes(ShuffledArray[i + 1])
          ) {
            setIndex(i + 1);
            setShowElement(true);
          } else {
            //setIndex(i + 1)
            Next("", ShuffledArray[i + 1], i + 1, 3);
          }
        } else {
          console.log("lap3 end");
          setIndex(0);
          setLap(4);
          Discriminator(ShuffledArray[0], 4);
        }

        break;
      case 4:
        setShowElement(false);
        if (ShuffledArray[i + 1]) {
          if (
            Difficulty.ultrahard.includes(ShuffledArray[i + 1]) ||
            Difficulty.hard.includes(ShuffledArray[i + 1])
          ) {
            setIndex(i + 1);
            setShowElement(true);
          } else {
            // setIndex(i + 1)
            Next("", ShuffledArray[i + 1], i + 1, 4);
          }
        } else {
          console.log("lap4 end");
          setIndex(0);
          setLap(5);
          Discriminator(ShuffledArray[0], 5);
        }

        break;
      case 5:
        setShowElement(false);
        if (ShuffledArray[i + 1]) {
          if (Difficulty.ultrahard.includes(ShuffledArray[i + 1])) {
            setIndex(i + 1);
            setShowElement(true);
          } else {
            // setIndex(i + 1)
            Next("", ShuffledArray[i + 1], i + 1, 5);
          }
        } else {
          console.log("lap5 end");
          setIndex(0);
          //setLap(1)

          setShowRandom(false);
        }

        break;
      default:
        break;
    }
 RemoveAndAdd(TypeLevel, elemento)
  };
 function RemoveAndAdd(TypeLevel, elemento) {
  const updated={...Difficulty}

  for (const key in updated) {
    updated[key] = updated[key].filter((e) => e !== elemento);
  }
  updated[TypeLevel] = [...updated[TypeLevel], elemento];

  setDifficulty(updated);
 }
  return (
    <div className="littleMainBackground rand">
      <h1 className="m">Random Repeticion</h1>
      <div className="ListAndStartMenu">
        <div className="labelAndOption">
          {UserLists.length > 0 ? (
            <select
              onChange={(e) => {
                const newId = e.target.value; // string
                const selected = UserLists.find((l) => l.id === newId);
                setCurrentList(selected); // ahora sí es {id, title}
              }}
            >
              {UserLists.map((list, index) => (
                <option key={index} value={list.id}>
                  {list.title}
                </option>
              ))}
            </select>
          ) : (
            <p>You dont have lists yet</p>
          )}
        </div>
        <button
          className="ActionButtoms"
          disabled={UserLists.length == 0}
          onClick={() => {
            if (UserLists.length > 0) {
              startGame();
            }
          }}
        >
          <MdNotStarted />
        </button>
      </div>
      {ShowRandom ? (
        <RandomItem
          ShuffledArray={ShuffledArray}
          ShowElement={ShowElement}
          Index={Index}
          Next={Next}
          Face={Face}
          setFace={setFace}
          lap={Lap}
        />
      ) : null}
    </div>
  );
}

export default Random;
