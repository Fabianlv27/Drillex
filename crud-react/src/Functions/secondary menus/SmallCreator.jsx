
import {v4 as uuidv4} from 'uuid'
import {useState,useContext, useEffect} from 'react'
import {Context} from '../../Context'
import AutoExamplesList from '../Functions/AutoExamples'
import ImageSearch from './ImageSeach'
import AutoMeaning from './AutoMeaning'
import './SingleSp.css';

function SmallCreator() {
    
    const uniqueID=uuidv4()    
    const [ChoiseImage, setChoiseImage] = useState('Import')
    const [AddImageBool, setAddImageBool] = useState(false)
    const [Auto, setAuto] = useState(false) 
    const [BoolMeaning, setBoolMeaning] = useState(false)  
    const {GetWords,dataForm, setDataForm,examples, setexamples,VoiceURLString, setVoiceURLString,Image, setImage,SearchBool, setSearchBool} = useContext(Context)
    const FormHandlerInput=(e)=>{
        setDataForm(
          {
            ...dataForm,
            [e.target.name]: e.target.value,
           
          }
        )
        
      }
      
      const FormHandlerSumbit= async(e) =>{
        e.preventDefault()           
      console.log(examples)
        let Meanings=[{"partOfSpeech":"unknow"}]
        try{
          const diccionary= await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${dataForm.name}`)
          if(!diccionary.ok){
            throw new Error(`the word ${dataForm.name} doesnt is in the diccionary`)
            
          }
         else{
          const diccionaryJson= await diccionary.json()
          console.log(diccionaryJson)
          Meanings=diccionaryJson[0].meanings
          //console.log(Meanings)
         }
          
        } catch(error){
          console.error('se produjo un error')
          //const Meanings="unknow"
        }
        
        const formDataWithExamples = {
          ...dataForm,
          id: uniqueID,
          example:examples,
          voice: false,
          VoiceURLString:VoiceURLString,
          kind:Meanings,
          image:Image
       
         
        };
        await fetch('http://localhost:8000/words',{
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body: JSON.stringify(formDataWithExamples)
    
        })
      
        GetWords();
        //console.log(Meanings)
        setDataForm({ name: '',meaning:''})
        setexamples([''])
        setVoiceURLString("")
        setImage("")
        setAuto(false)
        setBoolMeaning(false)
        //setAutoExamples('')
        console.log("hecho");
        
      }  
      
      const Clear=(e)=>{
        e.preventDefault()
        console.log("Empty")
        
        const ExamplesWithoutEmpty= examples.filter(elemento=> elemento)
        console.log(ExamplesWithoutEmpty)
       setexamples(ExamplesWithoutEmpty)
       
      }

      
    const newExample=()=>{
        const values=[...examples,'']
        setexamples(values)
      }
      const handExampleChange=(index,event)=>{
        const values= [...examples]
        values[index]= event.target.value
        setexamples(values)
      }
      const handleChoiseImage=(e)=>{
        setChoiseImage(e.target.value)
        setImage('')
      }
      const AddQuitImage=(e)=>{
        e.preventDefault()
        setAddImageBool(!AddImageBool)
      }
      const HandleImgUpload= (e)=>{
           const file= e.target.files[0]
           const url= URL.createObjectURL(file)
           setImage(url)
      }
      const ContentChoices={
        Import:(
          <div>
            <input type="file" accept="image/*" onChange={HandleImgUpload} />
           {Image && (
            <div>
              <h3>Image:</h3>
              <img src={Image} alt="Image Upload" style={{ maxWidth: '100%' }} />
            </div>
           )}
          </div>
        ),
        Search:(
          <>
          <ImageSearch default={dataForm.name}/>  
       {
        Image && (
          <div>
            <h3>Image</h3>
            <img src={Image} style={{ maxWidth: '100%' }}/>
          </div>
        )
      }
          </>
                                    
        ),
        Link:(
          <div>
             <form>
             <input type="text" onChange={(e)=> setImage(e.target.value)}  />
          </form>
          {
            Image && (
              <div>
                <h3>Image</h3>
                <img src={Image} style={{ maxWidth: '100%' }}/>
              </div>
            )
          }
          </div>
         
         
        )
      }
      const HandleAutoExample=(e)=>{
          e.preventDefault()
           setAuto(!Auto)
      }

     const HandleAutoMeaning=(e)=>{
      e.preventDefault()
      setBoolMeaning(!BoolMeaning)
     }
     
  return (

    <div className='SmallCreator'>
         <form onSubmit={FormHandlerSumbit}> 
    
    <input type="text" name='name' required placeholder='name' onChange={FormHandlerInput} value={dataForm.name}/>
    <textarea name='meaning' onChange={FormHandlerInput} placeholder='Description' value={dataForm.meaning} cols="30" rows="10"></textarea>    
    <button onClick={HandleAutoMeaning}>AutoMeanings</button>
    {
      BoolMeaning ? (
        
           <AutoMeaning nombre={dataForm.name}/>
        
       
      ):null
    }
    <button onClick={HandleAutoExample}>Auto Example</button>
    {
      Auto ? (
        
        <div>
        <AutoExamplesList nombre={dataForm.name}/>
        
        </div>
      ) :null
    }
       { examples.map((input,index) => (
        <input
          key={index}
          type="text"
          value={input}                    
          placeholder={`example ${index + 1}`}
          onChange={(event)=> handExampleChange(index,event)}
          
        />
      ))}
    <button onClick={Clear}>Delete Empty Examples</button>
     
      <div>
        <h3>Import Image</h3>
        <button onClick={AddQuitImage}>Add</button>
        {
          AddImageBool ? (
            <div>
                <select value={ChoiseImage} onChange={handleChoiseImage}>
         <option value="Import">Import Image</option>
         <option value="Search" onClick={()=> setSearchBool(true)}>Search</option>
         <option value="Link">link</option>
        </select>
       
        <div>
        {ContentChoices[ChoiseImage]}
          
        </div>
            </div>
        
          ): null
        }
        
      </div>
    
    <input type="submit" name='CreateWord' />
    
  </form>
  <button onClick={newExample}>+</button>
 
    </div>

  )
}

export default SmallCreator