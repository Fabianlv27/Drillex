import {useContext, useEffect,useState,useRef} from 'react'
import { Context } from '../../../Contexts/Context';
import '../SingleSp.css';

function GameVoice() {
    const [Listas, setListas] = useState([])
    const { Allwords, GetWords,CurrentListId, setCurrentList,host } = useContext(Context);
    const [ShowGame, setShowGame] = useState(false)
    const [Choises, setChoises] = useState([])
    const [Index, setIndex] = useState(0)
    const [Random, setRandom] = useState([])
    const [IsCorrect, setIsCorrect] = useState(0)
    const [CookiUserData, setCookiUserData] = useState('')
    const [Link, setLink] = useState('')
//30005
    const HandlerLists= async()=>{
        try {
            const cookies= document.cookie
            const cookiesArray= cookies.split(';')
            
            cookiesArray.forEach(async (cookie) => {
              const [name, value] = cookie.trim().split('=');
              if (name === 'e') {
                console.log(value)
               
               const data=await fetch(`${host}/users/Lists/${value}`);
               const dj= await data.json()
               const defaultValue= dj[0].id
               setCurrentList(defaultValue)
               setLink(Link)
                console.log(dj)
                setListas(dj)
              }
            });
    
          } catch (error) {
            window.location.href=`${host}/register`
          }
           
        
     }
     const Shuffler = (Array) => {
        const Shuffled = [...Array];
        
        for (let i = Shuffled.length - 1; i > 0; i--) {
          
          let RandomNum = Math.floor(Math.random() * (i + 1));
          let temp = Shuffled[i];
          Shuffled[i] = Shuffled[RandomNum];
          Shuffled[RandomNum] = temp;
        }
        return Shuffled;
      };

     useEffect(() => {
       
     HandlerLists()
     }, [])
     
     useEffect(() => {
      if (CookiUserData) {
        GetWords(CookiUserData)
      }
      else{
          try {
        const cookies= document.cookie
        const cookiesArray= cookies.split(';')
        
        cookiesArray.forEach(async (cookie) => {
          const [name, value] = cookie.trim().split('=');
          if (name === 'e') {
            console.log(value)
            setCookiUserData(value)
          GetWords(value)
          }
        });

      } catch (error) {
        window.location.href=`${host}/register`
      }
      }
    
       
      
     }, [CurrentListId])

     const HandlerChoises=(TempRandom,i)=>{
   let NumbersChoise=[]
console.log(TempRandom)

while (NumbersChoise.length < 3) {
   
    let RandomNum = Math.floor(Math.random() * (TempRandom.length -1 + 1));

    if (!NumbersChoise.includes(RandomNum) && RandomNum !== i) {

        NumbersChoise=[...NumbersChoise,RandomNum]
    }
}

NumbersChoise[Math.floor(Math.random() * (2 + 1))]= i

      console.log(NumbersChoise)
      setChoises(NumbersChoise)
      NumbersChoise=[]
      
     }

     const startGame=async()=>{
    
        const TempSh= Shuffler(Allwords)
         setRandom(TempSh)
         console.log(TempSh[0].meaning)
         try {
          const response= await fetch(`${host}/texto_a_voz/${TempSh[0].meaning}`)
          
          const AudioBytes= await response.blob()
          console.log(AudioBytes)
         const audioUrl= URL.createObjectURL(AudioBytes)
        setLink(audioUrl)
          console.log(audioUrl)
        
        } catch (error) {
          console.error('Error al obtener el audio:', error)
        }
         HandlerChoises(TempSh,0)
         setShowGame(true)
     }
     const Check=(nameToTest)=>{
       if (nameToTest== Random[Index].title) {
        setIsCorrect(2)
       }
       else{
        setIsCorrect(1)
       }
     }
     const Next=async()=>{

        if (Random[Index + 1]) {
            setChoises([])
           
            setIsCorrect(0)
             
            HandlerChoises(Random,Index + 1)
          
            console.log(Random[Index + 1].meaning)
            let MeaningClean= Random[Index + 1].meaning.replace(/[\/\-]/g, ' ')
            console.log(MeaningClean)
            try {
              const response= await fetch(`${host}/texto_a_voz/${MeaningClean}`)
              
              const AudioBytes= await response.blob()
              console.log(AudioBytes)
             
            const audioUrl= URL.createObjectURL(AudioBytes)
            setLink(audioUrl)
              console.log(audioUrl)
              setIndex(Index + 1)
            } catch (error) {
              console.error('Error al obtener el audio:', error)
            }

        }
        else{
            setIndex(0)
            setShowGame(false)
        }

     }
  
     
  return (

    <div>
        {Listas.length > 0 ?(
        
        <select>
           {Listas.map((list,index)=>(
             <option key={index} onClick={()=>setCurrentList(list[0].id)}>{list[0].name}</option>
           ))}
            </select>   
             ):(<p>You dont have lists yet</p>)}
             
             {!ShowGame ? (<button onClick={startGame}>Start Game</button>):null}
             <div>
                {ShowGame && Random  ?(
                    <>
                    <div className={`${IsCorrect!==0 ? 'blocked': ''}`}>
                       <h1>What did you hear?</h1>
                       <div>
            
                      <audio controls  src={Link}></audio>
          
                   </div>
                    {Choises.map((c,i)=>(
                        <button onClick={()=>Check(Random[c].ttitle)} key={i}>{Random[c].name}</button>
                    ))} 
                    </div>
                    
                    {IsCorrect ===1 ?(
                        <div>
                            <h2>You Lose </h2>
                            <p>The Correct Answer is.. {Random[Index].title} </p>
                            <button onClick={Next}>Next</button>
                        </div>
                    ):null}

                         {IsCorrect ===2?(
                        <div>
                            <h2>You Won ! </h2>
                            <p>The Correct Answer is.. {Random[Index].title} </p>
                            <button onClick={Next}>Next</button>
                        </div>
                    ):null}
                    </>
                    

                ):null}
             </div>
             
    </div>
  )
 
}

export default GameVoice