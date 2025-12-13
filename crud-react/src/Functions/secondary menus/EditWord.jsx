import {useContext, useEffect} from 'react'
import {Context} from '../../../Contexts/Context'

import AutoMeaning from './AutoMeaning'
import ImageSearch from '../secondary menus/ImageSeach'
import AutoExamplesList from '../secondary menus/AutoExamples'
import '../SingleSp.css'

 function EditWord ({setShowEdit,id}) {
    
    const {Allwords,dataForm, setDataForm,examples, setexamples,VoiceURLString,Image, setImage,setSearchBool,SingleId, setSingleId,ChoiseImage, setChoiseImage,AddImageBool, setAddImageBool,Auto, setAuto,BoolMeaning, setBoolMeaning,host} = useContext(Context)
   
    const foundItem = Allwords.find(item => item.id === id)
    setDataForm({name: foundItem.name,meaning: foundItem.meaning})
    setexamples(foundItem.example)
    setImage(foundItem.image)
    setSingleId(id)
    

    const HandleSumbit= async ()=>{
      const formDataUdpate = {
      ...dataForm,
      example:examples,
      voice: voice,
      VoiceURLString:VoiceURLString,
      image:Image
   
     
    };
    await fetch(`${host}/Edit/${SingleId}`,{
      method:"PUT",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify(formDataUdpate)
     })
     
    }
    const FormHandlerInput=(e)=>{
      setDataForm(
        {
          ...dataForm,
          [e.target.name]: e.target.value,
         
        }
      )
      
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
       {setSearchBool(true)} 
        
        <ImageSearch default={dataForm.name}/>  
     {
      Image && (
      
        <div>
          {setSearchBool(false)}
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
    <div>
       
         <h2>Edit word</h2>
        <div>
         <form onSubmit={HandleSumbit}> 
    
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
         <option value="Search" onClick={()=> {
          setSearchBool(true)
          console.log('press')
          }}>Search</option>
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

    </div>
  )
}

export default EditWord