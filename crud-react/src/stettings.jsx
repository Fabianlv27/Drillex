import {useContext, useEffect,useState,useRef} from 'react'
import {Context} from './Context'
import {GetLocalHost} from '../api/api.jsx'
const [showMenu, setshowMenu] = useState(false)

function stettings() {
const host=GetLocalHost()
  return (
    <div>
    {
        showMenu?(
            <div>
       <button onClick={()=>setshowMenu(true)}>

       </button>
    </div> 
        ):(
            <div>
            <p>Language</p>
            <form action={`${host}/users/logout`} onClick={()=>{document.cookie = 'e=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'}} method="post">
  <input type="submit" value="logout" />
</form>
            </div>
        )
    }
     </div>
  )
}

export default stettings