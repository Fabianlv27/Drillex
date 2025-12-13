import {useContext, useEffect,useState,useRef} from 'react'
import { Context } from '../Context';

import './SingleSp.css';


    function HandleTest({text,ExampleIndex,RightWords,ResponseUserHandler,UserResponseArray}) {
  

    
      
       const [HiddenWords, setHiddenWords] = useState([])
    
    
    useEffect(() => {

      let textSplited= text.split(' ')
        let ListOfResponses=[]
        for (let i = textSplited.length - 1; i > 0; i--) {
          
          let RandomNum = Math.floor(Math.random() * (i + 1));
          ListOfResponses=[...ListOfResponses,{word:textSplited[RandomNum],id: RandomNum, exId:ExampleIndex}]
          let temp = textSplited[i];
          textSplited[i] = textSplited[RandomNum];
          textSplited[RandomNum] = temp;
        }
        //..................................................Solo para establecer los inputs...................................................//
        console.log(textSplited.slice(0,3));
       setHiddenWords(textSplited.slice(0,3)) 

       console.log(ListOfResponses.slice(-3));
        let SingleCheckedList=[]
        //................................................Para Hacer la comprobacion posteriormente..........................................//
        ListOfResponses.slice(-3).forEach(element => {
          console.log(element);
          setCheckedList([...CheckedList,element])
        
        });
        
      
        console.log(CheckedList);
        
     
       
     
    }, [])
    

        
        return (
    
            <div>
                <div className='inputsAndText'>
                   {
                  text.split(' ').map((e,i)=>{
                  return   HiddenWords.includes(e)?(
  
                    <input key={i} type="text" onChange={(element)=>ResponseUserHandler(element.target.value,i,ExampleIndex)} />
                ): <p key={i}>{e}</p>
                     
                  })
              } 
                </div>
              
              {
                RightWords.length >0?(
                    <p>
                        RightWords: {RightWords.map(e=>e).join(', ')}
                    </p>
                ):null
              }
             
            </div>
     
  )
    }
    
    export default HandleTest