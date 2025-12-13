import { useState, useContext, useEffect } from 'react';
import { Context } from '../../../Contexts/Context';
import WordsCreator from '../MainMenus/WordsCreator'
import '../SingleSp.css'
import { FaSave } from "react-icons/fa";
import { IoCloseCircleSharp } from "react-icons/io5";
import { CgCheckR } from "react-icons/cg";
import '../../styles/Create.css'

function MeaningCard() {
    const {CardAutoExamples,CardDef, Meaning,setVoiceURLString,setImage, setexamples,dataForm, setDataForm, setChoiseImage, setAuto, setBoolMeaning,setMeaning,setShowLyric} = useContext(Context)
    const [ShowCreate, setShowCreate] = useState(false)
  return (
    <div >
        {Meaning.length >0 && (
                <div className='mainConetinerMeaning'  >
                
 <div className={`${ShowCreate ? 'blocked':'containerME'}`}  >
  <div className='TitleSecctionMeaning'>
 <button className='close' onClick={()=>{
  
  setMeaning([])
  setShowLyric(true)
  }}><IoCloseCircleSharp /></button>
  
                 <p className='MeaningWordSearched'>{Meaning[0].word}</p>
                 
                 </div>
            
                 {CardDef &&(
                     <div className='definitions'> 
                     <h2>Definitions:</h2>
                       {  CardDef[0].map(defList=>(defList.map( (def,index)=>( def===undefined ? null : <p key={index}> <span><CgCheckR /></span> {def} </p>))
                      
                    ))}
                    
                    </div>
                 )}
               
                {CardAutoExamples && (
                    <div className='examples'>
                        <h2>Examples:</h2>
                       { 
                         
                         CardAutoExamples[0].map(exList=>(exList.filter(item => item !== undefined).map( (ex,index)=>( <p key={index}>🟠 {ex} </p>))
                        
                   
                  )) }
                    </div>
                
                )}
                
                </div>
          
           
          {ShowCreate ?(
         <div className='CreatorMenuLyric'>
          
          <button className='close' onClick={()=>{
         
           setShowCreate(false)
       
           
            }}><IoCloseCircleSharp /></button>
            <WordsCreator/>
         </div>        
        ):null}
       <button className='ActionButtoms' onClick={()=>{
            setDataForm(
                {...dataForm,
                 'name':Meaning[0].word
              }) 
              setexamples([''])
              setVoiceURLString("")
              setImage("")
              setAuto(false)
              setBoolMeaning(false)
              setChoiseImage('Import')
           
            
              console.log(dataForm)
            setShowCreate(true)

          }}><FaSave /></button>      
        </div>
            )}
            
    </div>
  )
}

export default MeaningCard