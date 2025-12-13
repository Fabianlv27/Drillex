import { useState, useEffect, useContext } from 'react';
import {Context} from '../../Context'
import {v4 as uuidv4} from 'uuid'

function CreateList() {
    const uniqueID=uuidv4() 
    

    const {CurrentListId, setCurrentList,host} = useContext(Context)
    const [Title, setTitle] = useState('')
    const [CookieDataUser, setCookieDataUser] = useState('')

    useEffect(() => {
      try {
        const cookies= document.cookie
        const cookiesArray= cookies.split(';')
        
        cookiesArray.forEach(async (cookie) => {
          const [name, value] = cookie.trim().split('=');
          if (name === 'e') {
           setCookieDataUser(value)
          }
        });

      } catch (error) {
        window.location.href=`${host}/register`
      }
       
    
    
    }, [])
    
const handlerSumbit=async (e)=>{
    e.preventDefault() 
    console.log(CookieDataUser)
    const formDataList = {
       
        id: uniqueID,
        name:Title
       
      };
      
    await fetch(`${host}/Lists/${CookieDataUser}`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify(formDataList)
  
      })
}

  return (
    <div>
        <h1>LetsCreate a List!</h1>
        <Form onSubmit={handlerSumbit}>
            <input type="text" placeholder='Title'  onChange={(e)=>setTitle(e.target.value)}/>
            <input type="sumbit" />
        </Form>
    </div>
  )
}

export default CreateList